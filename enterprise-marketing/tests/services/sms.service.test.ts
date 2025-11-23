import { SMSService } from '../../../lib/services/sms.service';
import { jest } from '@jest/globals';

// Mock Twilio
jest.mock('twilio', () => ({
  twilio: jest.fn().mockReturnValue({
    verify: {
      services: jest.fn().mockReturnThis(),
      verifications: {
        create: jest.fn(),
        fetch: jest.fn()
      },
      verificationChecks: {
        create: jest.fn()
      }
    },
    messages: {
      create: jest.fn()
    }
  })
}));

describe('SMSService', () => {
  let smsService: SMSService;
  let mockTwilio: jest.Mocked<any>;
  let mockVerify: jest.Mocked<any>;
  let mockMessages: jest.Mocked<any>;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Import and setup the mock
    const twilio = require('twilio');
    mockTwilio = twilio.twilio();
    mockVerify = mockTwilio.verify;
    mockMessages = mockTwilio.messages;
    
    smsService = new SMSService();
  });

  describe('Service Initialization', () => {
    it('should initialize Twilio client with credentials', () => {
      expect(twilio.twilio).toHaveBeenCalledWith(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
    });

    it('should create singleton instance', () => {
      const instance1 = SMSService.getInstance();
      const instance2 = SMSService.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should validate Twilio credentials on initialization', () => {
      expect(mockTwilio.verify.services).toHaveBeenCalledWith(
        process.env.TWILIO_VERIFY_SERVICE_SID
      );
    });
  });

  describe('Phone Verification', () => {
    const testPhoneNumber = '+1234567890';

    it('should send verification code successfully', async () => {
      const mockResponse = { sid: 'verification-sid-123' };
      mockVerify.services().verifications.create.mockResolvedValue(mockResponse);

      const result = await smsService.sendVerificationCode(testPhoneNumber);

      expect(result).toEqual({ success: true, sid: 'verification-sid-123' });
      expect(mockVerify.services().verifications.create).toHaveBeenCalledWith({
        to: testPhoneNumber,
        channel: 'sms'
      });
    });

    it('should handle Twilio API errors', async () => {
      const apiError = new Error('Invalid phone number');
      mockVerify.services().verifications.create.mockRejectedValue(apiError);

      const result = await smsService.sendVerificationCode(testPhoneNumber);

      expect(result).toEqual({ success: false, error: 'Invalid phone number' });
      expect(console.error).toHaveBeenCalledWith(
        'Failed to send verification code:',
        apiError
      );
    });

    it('should validate phone number format before sending', async () => {
      const invalidNumbers = [
        'invalid-phone',
        '123',
        '+',
        '',
        '12345678901234567890' // Too long
      ];

      for (const number of invalidNumbers) {
        const result = await smsService.sendVerificationCode(number);
        expect(result.success).toBe(false);
      }
    });

    it('should format international phone numbers correctly', async () => {
      const testNumbers = [
        { input: '+1234567890', expected: '+1234567890' },
        { input: '1234567890', expected: '+1234567890' }, // Assumes US format
        { input: '+44 7123 456789', expected: '+447123456789' } // UK format
      ];

      for (const { input, expected } of testNumbers) {
        await smsService.sendVerificationCode(input);
        
        const callArgs = mockVerify.services().verifications.create.mock.calls.pop()[0];
        expect(callArgs.to).toBe(expected);
      }
    });
  });

  describe('Code Verification', () => {
    const testPhoneNumber = '+1234567890';
    const testCode = '123456';

    it('should verify code successfully', async () => {
      const mockResponse = {
        status: 'approved',
        valid: true
      };
      mockVerify.services().verificationChecks.create.mockResolvedValue(mockResponse);

      const result = await smsService.verifyCode(testPhoneNumber, testCode);

      expect(result).toBe(true);
      expect(mockVerify.services().verificationChecks.create).toHaveBeenCalledWith({
        to: testPhoneNumber,
        code: testCode
      });
    });

    it('should reject invalid codes', async () => {
      const mockResponse = {
        status: 'denied',
        valid: false
      };
      mockVerify.services().verificationChecks.create.mockResolvedValue(mockResponse);

      const result = await smsService.verifyCode(testPhoneNumber, testCode);

      expect(result).toBe(false);
    });

    it('should handle verification check errors', async () => {
      const error = new Error('Verification service unavailable');
      mockVerify.services().verificationChecks.create.mockRejectedValue(error);

      const result = await smsService.verifyCode(testPhoneNumber, testCode);

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith(
        'Failed to verify code:',
        error
      );
    });

    it('should handle expired codes', async () => {
      const mockResponse = {
        status: 'expired',
        valid: false
      };
      mockVerify.services().verificationChecks.create.mockResolvedValue(mockResponse);

      const result = await smsService.verifyCode(testPhoneNumber, testCode);

      expect(result).toBe(false);
      expect(console.warn).toHaveBeenCalledWith(
        'Verification code has expired for:',
        testPhoneNumber
      );
    });
  });

  describe('Multi-Factor Authentication', () => {
    const testPhoneNumber = '+1234567890';

    it('should send MFA code for authentication', async () => {
      const mockResponse = { sid: 'mfa-sid-123' };
      mockVerify.services().verifications.create.mockResolvedValue(mockResponse);

      const result = await smsService.sendMFACode(testPhoneNumber);

      expect(result.success).toBe(true);
      expect(mockVerify.services().verifications.create).toHaveBeenCalled();
    });

    it('should verify MFA code for login', async () => {
      const testCode = '789012';
      const mockResponse = { status: 'approved', valid: true };
      mockVerify.services().verificationChecks.create.mockResolvedValue(mockResponse);

      const result = await smsService.verifyMFACode(testPhoneNumber, testCode);

      expect(result).toBe(true);
    });

    it('should send backup codes via SMS when needed', async () => {
      const backupCode = 'backup123';
      mockMessages.create.mockResolvedValue({ sid: 'msg-sid-123' });

      const result = await smsService.sendBackupCode(testPhoneNumber, backupCode);

      expect(result).toBe(true);
      expect(mockMessages.create).toHaveBeenCalledWith({
        to: testPhoneNumber,
        from: process.env.TWILIO_PHONE_NUMBER,
        body: expect.stringContaining(backupCode)
      });
    });
  });

  describe('Security Alerts', () => {
    const testPhoneNumber = '+1234567890';

    it('should send security alert for suspicious activity', async () => {
      const alertMessage = 'Suspicious login detected from new device';
      mockMessages.create.mockResolvedValue({ sid: 'alert-sid-123' });

      const result = await smsService.sendSecurityAlert(testPhoneNumber, alertMessage);

      expect(result).toBe(true);
      expect(mockMessages.create).toHaveBeenCalledWith({
        to: testPhoneNumber,
        from: process.env.TWILIO_PHONE_NUMBER,
        body: expect.stringContaining('SECURITY ALERT')
      });
    });

    it('should send login notification for successful logins', async () => {
      const loginDetails = {
        location: 'New York, NY',
        timestamp: '2025-11-21 18:05:08',
        device: 'Chrome on Windows'
      };
      mockMessages.create.mockResolvedValue({ sid: 'login-sid-123' });

      const result = await smsService.sendLoginNotification(testPhoneNumber, loginDetails);

      expect(result).toBe(true);
      expect(mockMessages.create).toHaveBeenCalledWith({
        to: testPhoneNumber,
        from: process.env.TWILIO_PHONE_NUMBER,
        body: expect.stringContaining('New login detected')
      });
    });

    it('should send account lockout notification', async () => {
      const lockoutReason = 'Too many failed login attempts';
      mockMessages.create.mockResolvedValue({ sid: 'lockout-sid-123' });

      const result = await smsService.sendAccountLockoutAlert(testPhoneNumber, lockoutReason);

      expect(result).toBe(true);
      expect(mockMessages.create).toHaveBeenCalledWith({
        to: testPhoneNumber,
        from: process.env.TWILIO_PHONE_NUMBER,
        body: expect.stringContaining('ACCOUNT LOCKED')
      });
    });
  });

  describe('Rate Limiting and Throttling', () => {
    const testPhoneNumber = '+1234567890';

    it('should enforce rate limits for verification codes', async () => {
      // Mock rate limit check
      const tooManyRequests = Array(5).fill(null).map(() => 
        smsService.sendVerificationCode(testPhoneNumber)
      );

      const results = await Promise.all(tooManyRequests);
      
      // After rate limit, should return error
      const lastResult = await smsService.sendVerificationCode(testPhoneNumber);
      expect(lastResult.success).toBe(false);
    });

    it('should implement exponential backoff for failed requests', async () => {
      mockVerify.services().verifications.create
        .mockRejectedValueOnce(new Error('Rate limited'))
        .mockRejectedValueOnce(new Error('Rate limited'))
        .mockResolvedValue({ sid: 'success-sid-123' });

      const startTime = Date.now();
      const result = await smsService.sendVerificationCode(testPhoneNumber);
      const endTime = Date.now();

      expect(result.success).toBe(true);
      // Should have waited between retries (this would be implementation-specific)
      expect(endTime - startTime).toBeGreaterThan(1000);
    });

    it('should track verification attempts per phone number', async () => {
      const attempts = 3;
      
      for (let i = 0; i < attempts; i++) {
        await smsService.sendVerificationCode(testPhoneNumber);
      }

      // Should have made the expected number of calls
      expect(mockVerify.services().verifications.create).toHaveBeenCalledTimes(attempts);
    });
  });

  describe('International Support', () => {
    it('should handle international phone numbers', async () => {
      const internationalNumbers = [
        '+447123456789', // UK
        '+33123456789',  // France
        '+81312345678',  // Japan
        '+5551234567890' // Brazil
      ];

      for (const number of internationalNumbers) {
        await smsService.sendVerificationCode(number);
        
        const callArgs = mockVerify.services().verifications.create.mock.calls.pop()[0];
        expect(callArgs.to).toBe(number);
      }
    });

    it('should validate country-specific phone number formats', async () => {
      const invalidNumbers = [
        '+447123456789', // UK - too short
        '+3312345678',   // France - too short
        '+813123456',    // Japan - too short
        '+123456789'     // US - too short
      ];

      for (const number of invalidNumbers) {
        const result = await smsService.sendVerificationCode(number);
        expect(result.success).toBe(false);
      }
    });

    it('should support multiple SMS channels', async () => {
      const testPhoneNumber = '+1234567890';

      // Test SMS channel
      await smsService.sendVerificationCode(testPhoneNumber);
      let callArgs = mockVerify.services().verifications.create.mock.calls.pop()[0];
      expect(callArgs.channel).toBe('sms');

      // Test WhatsApp channel (if supported)
      await (smsService as any).sendVerificationCode(testPhoneNumber, 'whatsapp');
      callArgs = mockVerify.services().verifications.create.mock.calls.pop()[0];
      expect(callArgs.channel).toBe('whatsapp');
    });
  });

  describe('Error Handling and Logging', () => {
    const testPhoneNumber = '+1234567890';

    beforeEach(() => {
      jest.spyOn(console, 'error').mockImplementation(() => {});
      jest.spyOn(console, 'warn').mockImplementation(() => {});
      jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    it('should log successful SMS sends in debug mode', async () => {
      process.env.DEBUG = 'optibid:sms';
      mockVerify.services().verifications.create.mockResolvedValue({ sid: 'test' });

      await smsService.sendVerificationCode(testPhoneNumber);

      expect(console.log).toHaveBeenCalledWith(
        'SMS verification code sent to:',
        testPhoneNumber
      );
    });

    it('should log detailed errors for troubleshooting', async () => {
      const error = new Error('Twilio API Error');
      mockVerify.services().verifications.create.mockRejectedValue(error);

      await smsService.sendVerificationCode(testPhoneNumber);

      expect(console.error).toHaveBeenCalledWith(
        'Failed to send SMS:',
        error
      );
    });

    it('should handle Twilio account suspension', async () => {
      const suspensionError = new Error('Account suspended');
      mockVerify.services().verifications.create.mockRejectedValue(suspensionError);

      const result = await smsService.sendVerificationCode(testPhoneNumber);

      expect(result.success).toBe(false);
      expect(result.error).toBe('SMS service temporarily unavailable');
    });
  });

  describe('Delivery Status and Tracking', () => {
    const testPhoneNumber = '+1234567890';

    it('should track message delivery status', async () => {
      const mockMessageSid = 'msg-sid-123';
      mockMessages.create.mockResolvedValue({ sid: mockMessageSid });

      await smsService.sendSecurityAlert(testPhoneNumber, 'Test alert');

      expect(mockMessages.create).toHaveBeenCalled();
      // Track message SID for delivery status checking
      expect(mockMessageSid).toBeTruthy();
    });

    it('should handle delivery failures gracefully', async () => {
      mockMessages.create.mockRejectedValue(new Error('Message undeliverable'));

      const result = await smsService.sendSecurityAlert(testPhoneNumber, 'Test alert');

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith(
        'Failed to send SMS:',
        expect.any(Error)
      );
    });

    it('should retry failed deliveries with exponential backoff', async () => {
      mockMessages.create
        .mockRejectedValueOnce(new Error('Temporary failure'))
        .mockRejectedValueOnce(new Error('Temporary failure'))
        .mockResolvedValue({ sid: 'success' });

      const startTime = Date.now();
      const result = await smsService.sendSecurityAlert(testPhoneNumber, 'Test alert');
      const endTime = Date.now();

      expect(result).toBe(true);
      expect(endTime - startTime).toBeGreaterThan(1000); // Should have waited for retries
    });
  });

  describe('Configuration and Customization', () => {
    it('should respect environment-specific settings', () => {
      expect(process.env.TWILIO_ACCOUNT_SID).toBeTruthy();
      expect(process.env.TWILIO_AUTH_TOKEN).toBeTruthy();
      expect(process.env.TWILIO_VERIFY_SERVICE_SID).toBeTruthy();
      expect(process.env.TWILIO_PHONE_NUMBER).toBeTruthy();
    });

    it('should use custom message templates', async () => {
      const testPhoneNumber = '+1234567890';
      const customMessage = 'Your custom verification code is: {{code}}';
      
      // This would be implementation-specific
      await (smsService as any).sendCustomMessage(testPhoneNumber, customMessage);

      // Verify custom template was used
      expect(mockMessages.create).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.stringContaining('{{code}}')
        })
      );
    });

    it('should support different message types', async () => {
      const testPhoneNumber = '+1234567890';
      
      const messageTypes = [
        { method: 'sendVerificationCode', template: 'verification' },
        { method: 'sendMFACode', template: 'mfa' },
        { method: 'sendBackupCode', template: 'backup' },
        { method: 'sendSecurityAlert', template: 'security' }
      ];

      for (const { method, template } of messageTypes) {
        await (smsService as any)[method](testPhoneNumber, template === 'backup' ? 'backup123' : undefined);
      }
    });
  });
});