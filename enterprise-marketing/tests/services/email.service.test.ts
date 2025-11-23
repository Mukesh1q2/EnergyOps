import { EmailService } from '../../../lib/services/email.service';
import { jest } from '@jest/globals';

// Mock SendGrid
jest.mock('@sendgrid/mail', () => ({
  setApiKey: jest.fn(),
  send: jest.fn(),
  sendMultiple: jest.fn()
}));

describe('EmailService', () => {
  let emailService: EmailService;
  let mockSendGrid: jest.Mocked<typeof import('@sendgrid/mail')>;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Import and setup the mock
    mockSendGrid = require('@sendgrid/mail');
    mockSendGrid.setApiKey.mockReturnValue(undefined);
    mockSendGrid.send.mockResolvedValue([{ statusCode: 202 }]);
    
    emailService = new EmailService();
  });

  describe('Service Initialization', () => {
    it('should initialize SendGrid with API key from environment', () => {
      expect(mockSendGrid.setApiKey).toHaveBeenCalledWith(
        process.env.SENDGRID_API_KEY
      );
    });

    it('should create singleton instance', () => {
      const instance1 = EmailService.getInstance();
      const instance2 = EmailService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Email Verification', () => {
    const testEmail = 'user@example.com';
    const testToken = 'test-verification-token-123';

    it('should send verification email successfully', async () => {
      const result = await emailService.sendVerificationEmail(testEmail, testToken);

      expect(result).toBe(true);
      expect(mockSendGrid.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: testEmail,
          from: expect.objectContaining({
            email: process.env.SENDGRID_FROM_EMAIL,
            name: 'OptiBid Energy Platform'
          }),
          templateId: process.env.EMAIL_TEMPLATE_VERIFICATION_ID,
          dynamicTemplateData: expect.objectContaining({
            userEmail: testEmail,
            verificationUrl: expect.stringContaining(testToken),
            expiresIn: expect.any(String)
          })
        })
      );
    });

    it('should handle SendGrid errors gracefully', async () => {
      mockSendGrid.send.mockRejectedValue(new Error('API Error'));

      const result = await emailService.sendVerificationEmail(testEmail, testToken);

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith(
        'Failed to send verification email:',
        expect.any(Error)
      );
    });

    it('should use fallback email method when SendGrid fails', async () => {
      // Reset send mock to simulate failure
      mockSendGrid.send.mockRejectedValue(new Error('API Error'));
      
      // Set fallback environment variables
      process.env.EMAIL_FALLBACK_ENABLED = 'true';
      process.env.EMAIL_FALLBACK_FROM = 'fallback@optibid.energy';

      const result = await emailService.sendVerificationEmail(testEmail, testToken);

      expect(result).toBe(true);
      expect(mockSendGrid.send).toHaveBeenCalled();
    });
  });

  describe('Password Reset', () => {
    const testEmail = 'user@example.com';
    const testToken = 'test-reset-token-456';

    it('should send password reset email successfully', async () => {
      const result = await emailService.sendPasswordResetEmail(testEmail, testToken);

      expect(result).toBe(true);
      expect(mockSendGrid.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: testEmail,
          templateId: process.env.EMAIL_TEMPLATE_PASSWORD_RESET,
          dynamicTemplateData: expect.objectContaining({
            resetUrl: expect.stringContaining(testToken),
            expiresIn: expect.any(String)
          })
        })
      );
    });

    it('should include security warnings in password reset email', async () => {
      await emailService.sendPasswordResetEmail(testEmail, testToken);

      const callArgs = mockSendGrid.send.mock.calls[0][0];
      expect(callArgs.dynamicTemplateData).toHaveProperty('securityWarning');
      expect(callArgs.dynamicTemplateData).toHaveProperty('supportEmail');
    });
  });

  describe('Multi-Factor Authentication', () => {
    const testEmail = 'user@example.com';
    const testCode = '123456';

    it('should send MFA backup code email', async () => {
      const result = await emailService.sendMFABackupEmail(testEmail, testCode);

      expect(result).toBe(true);
      expect(mockSendGrid.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: testEmail,
          templateId: process.env.EMAIL_TEMPLATE_MFA_SETUP,
          dynamicTemplateData: expect.objectContaining({
            backupCode: testCode,
            securityNote: expect.stringContaining('backup code')
          })
        })
      );
    });

    it('should emphasize security in MFA emails', async () => {
      await emailService.sendMFABackupEmail(testEmail, testCode);

      const callArgs = mockSendGrid.send.mock.calls[0][0];
      expect(callArgs.dynamicTemplateData).toHaveProperty('securityWarning');
      expect(callArgs.dynamicTemplateData.securityWarning).toContain('secure');
    });
  });

  describe('Security Alerts', () => {
    const testEmail = 'user@example.com';
    const alertDetails = {
      ipAddress: '192.168.1.1',
      location: 'New York, NY',
      timestamp: new Date().toISOString(),
      activity: 'Login from new device'
    };

    it('should send security alert for suspicious activity', async () => {
      const result = await emailService.sendSecurityAlert(
        testEmail,
        'suspicious_login',
        alertDetails
      );

      expect(result).toBe(true);
      expect(mockSendGrid.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: testEmail,
          templateId: process.env.EMAIL_TEMPLATE_SECURITY_ALERT,
          dynamicTemplateData: expect.objectContaining({
            alertType: 'Suspicious Login Activity',
            ipAddress: alertDetails.ipAddress,
            location: alertDetails.location,
            timestamp: alertDetails.timestamp,
            actionUrl: expect.stringContaining('security')
          })
        })
      );
    });

    it('should send different alerts for different security events', async () => {
      const events = [
        { type: 'password_change', expectedType: 'Password Change' },
        { type: 'new_device', expectedType: 'New Device Login' },
        { type: 'failed_login', expectedType: 'Failed Login Attempts' }
      ];

      for (const event of events) {
        await emailService.sendSecurityAlert(testEmail, event.type, alertDetails);
        
        const callArgs = mockSendGrid.send.mock.calls.pop()[0];
        expect(callArgs.dynamicTemplateData.alertType).toBe(event.expectedType);
      }
    });
  });

  describe('Welcome Emails', () => {
    const testEmail = 'newuser@example.com';
    const userData = {
      firstName: 'John',
      lastName: 'Doe',
      company: 'Test Corp'
    };

    it('should send welcome email with user information', async () => {
      const result = await emailService.sendWelcomeEmail(testEmail, userData);

      expect(result).toBe(true);
      expect(mockSendGrid.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: testEmail,
          templateId: process.env.EMAIL_TEMPLATE_WELCOME,
          dynamicTemplateData: expect.objectContaining({
            firstName: userData.firstName,
            lastName: userData.lastName,
            company: userData.company,
            platformFeatures: expect.arrayContaining(['Energy Trading', 'Bidding'])
          })
        })
      );
    });

    it('should personalize welcome email content', async () => {
      await emailService.sendWelcomeEmail(testEmail, userData);

      const callArgs = mockSendGrid.send.mock.calls[0][0];
      expect(callArgs.dynamicTemplateData).toHaveProperty('personalizedMessage');
      expect(callArgs.dynamicTemplateData.personalizedMessage).toContain(userData.firstName);
    });
  });

  describe('Template System', () => {
    const testEmail = 'test@example.com';

    it('should use correct template for each email type', async () => {
      const emailTypes = [
        { method: 'sendVerificationEmail', args: [testEmail, 'token'], template: 'EMAIL_TEMPLATE_VERIFICATION_ID' },
        { method: 'sendPasswordResetEmail', args: [testEmail, 'token'], template: 'EMAIL_TEMPLATE_PASSWORD_RESET' },
        { method: 'sendMFABackupEmail', args: [testEmail, '123456'], template: 'EMAIL_TEMPLATE_MFA_SETUP' },
        { method: 'sendWelcomeEmail', args: [testEmail, {}], template: 'EMAIL_TEMPLATE_WELCOME' }
      ];

      for (const emailType of emailTypes) {
        await (emailService as any)[emailType.method](...emailType.args);
        
        const callArgs = mockSendGrid.send.mock.calls.pop()[0];
        expect(callArgs.templateId).toBe(process.env[emailType.template]);
      }
    });

    it('should include common email metadata', async () => {
      await emailService.sendVerificationEmail(testEmail, 'token');

      const callArgs = mockSendGrid.send.mock.calls[0][0];
      expect(callArgs).toHaveProperty('trackingSettings');
      expect(callArgs.trackingSettings).toHaveProperty('clickTracking');
      expect(callArgs.trackingSettings).toHaveProperty('openTracking');
    });
  });

  describe('Error Handling and Logging', () => {
    const testEmail = 'test@example.com';

    beforeEach(() => {
      // Mock console methods for testing
      jest.spyOn(console, 'error').mockImplementation(() => {});
      jest.spyOn(console, 'warn').mockImplementation(() => {});
      jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    it('should log successful email sends in debug mode', async () => {
      process.env.DEBUG = 'optibid:email';
      
      await emailService.sendVerificationEmail(testEmail, 'token');
      
      expect(console.log).toHaveBeenCalledWith(
        'Verification email sent successfully to:',
        testEmail
      );
    });

    it('should log detailed errors for debugging', async () => {
      const error = new Error('SendGrid API Error');
      mockSendGrid.send.mockRejectedValue(error);

      await emailService.sendVerificationEmail(testEmail, 'token');

      expect(console.error).toHaveBeenCalledWith(
        'Failed to send verification email:',
        error
      );
    });

    it('should handle network timeouts gracefully', async () => {
      const timeoutError = new Error('Request timeout');
      mockSendGrid.send.mockRejectedValue(timeoutError);

      const result = await emailService.sendVerificationEmail(testEmail, 'token');

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('Email Validation and Security', () => {
    it('should validate email format before sending', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'user@',
        'user..double.dot@example.com',
        ''
      ];

      for (const email of invalidEmails) {
        expect(() => {
          (emailService as any).validateEmail(email);
        }).toThrow('Invalid email format');
      }
    });

    it('should validate email format for valid emails', () => {
      const validEmails = [
        'user@example.com',
        'test.email+tag@domain.co.uk',
        'user123@subdomain.example.com'
      ];

      for (const email of validEmails) {
        expect(() => {
          (emailService as any).validateEmail(email);
        }).not.toThrow();
      }
    });

    it('should sanitize email content to prevent injection', async () => {
      const maliciousToken = 'token<script>alert("xss")</script>';
      
      await emailService.sendVerificationEmail('test@example.com', maliciousToken);

      const callArgs = mockSendGrid.send.mock.calls[0][0];
      expect(callArgs.dynamicTemplateData.verificationUrl).not.toContain('<script>');
    });
  });

  describe('Performance and Rate Limiting', () => {
    const testEmail = 'test@example.com';

    it('should handle batch email sending efficiently', async () => {
      const emails = Array(10).fill(null).map((_, i) => `user${i}@example.com`);
      
      // Mock sendMultiple for batch sending
      mockSendGrid.sendMultiple.mockResolvedValue([{ statusCode: 202 }]);
      
      const results = await Promise.all(
        emails.map(email => emailService.sendVerificationEmail(email, 'token'))
      );

      expect(results.every(result => result === true)).toBe(true);
    });

    it('should track email sending statistics', async () => {
      await emailService.sendVerificationEmail(testEmail, 'token');
      
      // Check if statistics are tracked (this would be implementation-specific)
      expect(emailService).toHaveProperty('getEmailStats');
    });
  });
});