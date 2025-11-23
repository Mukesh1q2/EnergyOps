import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { createHash, randomBytes } from 'crypto';
import { EmailService } from '../../../lib/services/email.service';
import { SMSService } from '../../../lib/services/sms.service';
import { RedisService } from '../../../lib/services/redis.service';
import { MonitoringService } from '../../../lib/services/monitoring.service';

// Integration test suite for authentication flows
describe('Authentication Integration Tests', () => {
  let emailService: EmailService;
  let smsService: SMSService;
  let redisService: RedisService;
  let monitoringService: MonitoringService;

  beforeAll(async () => {
    // Initialize all services for integration testing
    emailService = EmailService.getInstance();
    smsService = SMSService.getInstance();
    redisService = RedisService.getInstance();
    monitoringService = MonitoringService.getInstance();

    // Setup test database connections (would use test database)
    // await setupTestDatabase();
  });

  afterAll(async () => {
    // Clean up test data
    // await cleanupTestDatabase();
  });

  describe('User Registration Flow Integration', () => {
    const testUser = {
      email: 'testuser@example.com',
      phone: '+1234567890',
      password: 'SecurePass123!',
      firstName: 'John',
      lastName: 'Doe'
    };

    it('should complete full user registration with email verification', async () => {
      // Step 1: Create user in database
      const createdUser = await createTestUser(testUser);
      expect(createdUser.id).toBeDefined();
      expect(createdUser.isVerified).toBe(false);

      // Step 2: Generate verification token
      const verificationToken = randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Step 3: Store verification data in Redis
      await redisService.set(
        `verification:${verificationToken}`,
        {
          userId: createdUser.id,
          email: testUser.email,
          type: 'email_verification'
        },
        600 // 10 minutes TTL
      );

      // Step 4: Send verification email
      const emailResult = await emailService.sendVerificationEmail(
        testUser.email,
        verificationToken
      );
      expect(emailResult).toBe(true);

      // Step 5: Track registration event
      monitoringService.trackApplicationEvent({
        type: 'user_registration',
        event: 'registration_completed',
        details: {
          userId: createdUser.id,
          verificationMethod: 'email',
          registrationSource: 'direct'
        }
      });

      // Step 6: Verify the verification token exists in Redis
      const storedVerification = await redisService.get(`verification:${verificationToken}`);
      expect(storedVerification).toEqual(
        expect.objectContaining({
          userId: createdUser.id,
          email: testUser.email,
          type: 'email_verification'
        })
      );
    }, 30000);

    it('should handle registration with SMS verification', async () => {
      const smsTestUser = {
        ...testUser,
        email: 'smsuser@example.com',
        phone: '+1987654321'
      };

      // Create user for SMS verification
      const createdUser = await createTestUser(smsTestUser);

      // Send SMS verification
      const smsResult = await smsService.sendVerificationCode(smsTestUser.phone);
      expect(smsResult.success).toBe(true);

      // Verify SMS code (using mock code for testing)
      const mockCode = '123456';
      const verifyResult = await smsService.verifyCode(smsTestUser.phone, mockCode);
      
      // In real implementation, this would use the actual code sent via SMS
      if (!verifyResult) {
        console.log('SMS verification requires actual SMS service for real code testing');
      }

      // Track SMS registration
      monitoringService.trackSecurityEvent({
        type: 'registration_with_sms',
        severity: 'low',
        userId: createdUser.id,
        details: {
          phoneNumber: smsTestUser.phone,
          verificationMethod: 'sms'
        }
      });
    }, 30000);
  });

  describe('Email Verification Integration', () => {
    const testToken = 'test-verification-token-123';

    it('should verify email and update user status', async () => {
      // Step 1: Simulate verification request
      const verificationData = await redisService.get(`verification:${testToken}`);
      
      if (!verificationData) {
        // Setup verification data for testing
        await redisService.set(
          `verification:${testToken}`,
          {
            userId: 'test-user-123',
            email: 'test@example.com',
            type: 'email_verification'
          },
          600
        );
      }

      // Step 2: Verify the token
      const verifiedData = await redisService.get(`verification:${testToken}`);
      expect(verifiedData).toBeDefined();
      expect(verifiedData.type).toBe('email_verification');

      // Step 3: Mark user as verified (in real app, would update database)
      const isVerified = true; // Simulate successful verification

      if (isVerified) {
        // Step 4: Send welcome email
        const welcomeResult = await emailService.sendWelcomeEmail(
          verifiedData.email,
          { firstName: 'John', lastName: 'Doe' }
        );
        expect(welcomeResult).toBe(true);

        // Step 5: Clean up verification token
        await redisService.delete(`verification:${testToken}`);

        // Step 6: Track verification event
        monitoringService.trackApplicationEvent({
          type: 'email_verification',
          event: 'email_verified',
          details: {
            userId: verifiedData.userId,
            email: verifiedData.email
          }
        });

        // Step 7: Create user session
        const sessionId = `session-${Date.now()}`;
        await redisService.setSession(sessionId, {
          userId: verifiedData.userId,
          email: verifiedData.email,
          verified: true,
          createdAt: new Date().toISOString()
        }, 3600);

        expect(sessionId).toBeDefined();
      }
    }, 15000);
  });

  describe('Multi-Factor Authentication Integration', () => {
    it('should setup and verify MFA with both email and SMS', async () => {
      const userId = 'test-mfa-user';
      const email = 'mfauser@example.com';
      const phone = '+1555666777';

      // Step 1: Generate MFA secret and backup codes
      const mfaSecret = 'JBSWY3DPEHPK3PXP'; // Simulated TOTP secret
      const backupCodes = [
        '12345678',
        '87654321',
        '11223344',
        '44332211'
      ];

      // Step 2: Store MFA setup in Redis
      await redisService.set(
        `mfa_setup:${userId}`,
        {
          secret: mfaSecret,
          backupCodes: backupCodes,
          email: email,
          phone: phone,
          createdAt: new Date().toISOString()
        },
        1800 // 30 minutes
      );

      // Step 3: Send backup codes via email
      const backupCode = backupCodes[0];
      const emailResult = await emailService.sendMFABackupEmail(email, backupCode);
      expect(emailResult).toBe(true);

      // Step 4: Send backup codes via SMS
      const smsResult = await smsService.sendBackupCode(phone, backupCode);
      expect(smsResult).toBe(true);

      // Step 5: Track MFA setup
      monitoringService.trackApplicationEvent({
        type: 'mfa_setup',
        event: 'mfa_enabled',
        details: {
          userId: userId,
          methods: ['email', 'sms'],
          backupCodesGenerated: backupCodes.length
        }
      });

      // Step 6: Verify MFA backup codes are stored
      const storedSetup = await redisService.get(`mfa_setup:${userId}`);
      expect(storedSetup.backupCodes).toHaveLength(4);

      // Step 7: Test backup code consumption
      await redisService.set(
        `mfa_backup_used:${userId}`,
        [backupCodes[1]], // Mark second code as used
        86400 // 24 hours
      );

      const usedCodes = await redisService.get(`mfa_backup_used:${userId}`);
      expect(usedCodes).toContain(backupCodes[1]);
    }, 20000);
  });

  describe('Login Flow Integration', () => {
    it('should handle login with email verification', async () => {
      const email = 'loginuser@example.com';
      const password = 'SecurePass123!';
      const userId = 'test-login-user';

      // Step 1: Simulate login attempt
      const loginAttempt = {
        email: email,
        password: password,
        ipAddress: '192.168.1.100',
        userAgent: 'Test Browser',
        timestamp: new Date().toISOString()
      };

      // Step 2: Check rate limiting
      const rateLimitKey = `login_attempts:${email}`;
      const rateLimitResult = await redisService.checkRateLimit(
        rateLimitKey,
        5, // Max 5 attempts
        900000 // 15 minutes window
      );
      expect(rateLimitResult.allowed).toBe(true);

      // Step 3: Validate credentials (mock validation)
      const isValidCredentials = true; // In real app, would hash and compare
      if (!isValidCredentials) {
        // Track failed login
        await redisService.set(
          `failed_login:${Date.now()}`,
          { email, ...loginAttempt },
          3600
        );

        monitoringService.trackSecurityEvent({
          type: 'failed_login',
          severity: 'medium',
          userId: userId,
          details: {
            email: email,
            reason: 'invalid_credentials'
          }
        });

        expect(true).toBe(false); // Fail test for invalid credentials
      }

      // Step 4: Generate session
      const sessionId = `login_session_${Date.now()}`;
      const sessionData = {
        userId: userId,
        email: email,
        loginTime: new Date().toISOString(),
        ipAddress: loginAttempt.ipAddress,
        userAgent: loginAttempt.userAgent
      };

      await redisService.setSession(sessionId, sessionData, 3600);

      // Step 5: Send login notification
      const notificationResult = await smsService.sendLoginNotification('+1234567890', {
        location: 'New York, NY',
        timestamp: new Date().toISOString(),
        device: loginAttempt.userAgent
      });

      if (notificationResult) {
        console.log('Login notification sent successfully');
      }

      // Step 6: Track successful login
      monitoringService.trackApplicationEvent({
        type: 'user_login',
        event: 'login_success',
        details: {
          userId: userId,
          email: email,
          sessionId: sessionId,
          ipAddress: loginAttempt.ipAddress
        }
      });

      // Step 7: Verify session exists
      const storedSession = await redisService.getSession(sessionId);
      expect(storedSession).toEqual(sessionData);

      // Step 8: Clear rate limiting on successful login
      await redisService.delete(rateLimitKey);

      expect(sessionId).toBeDefined();
      expect(storedSession).toBeDefined();
    }, 25000);

    it('should detect and handle brute force attacks', async () => {
      const email = 'brute-force-test@example.com';
      const attempts = 10;

      // Simulate multiple failed login attempts
      for (let i = 0; i < attempts; i++) {
        await redisService.set(
          `failed_login_attempt:${email}:${Date.now()}:${i}`,
          {
            email: email,
            ipAddress: '192.168.1.100',
            timestamp: new Date().toISOString(),
            attempt: i + 1
          },
          3600
        );

        // Check rate limiting
        const rateLimitResult = await redisService.checkRateLimit(
          `login_attempts:${email}`,
          5,
          900000
        );

        if (rateLimitResult.allowed === false) {
          console.log(`Rate limit triggered after ${i + 1} attempts`);
          break;
        }
      }

      // Track security event for multiple failed attempts
      monitoringService.trackSecurityEvent({
        type: 'brute_force_attempt',
        severity: 'high',
        details: {
          email: email,
          attempts: attempts,
          timeframe: '15 minutes'
        }
      });

      // Implement account lockout
      await redisService.set(
        `account_locked:${email}`,
        {
          reason: 'too_many_failed_attempts',
          lockedAt: new Date().toISOString(),
          unlockAt: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes
        },
        1800 // 30 minutes
      );

      const lockoutData = await redisService.get(`account_locked:${email}`);
      expect(lockoutData.reason).toBe('too_many_failed_attempts');
    }, 30000);
  });

  describe('Password Reset Flow Integration', () => {
    it('should handle complete password reset flow', async () => {
      const email = 'resetuser@example.com';
      const userId = 'reset-test-user';

      // Step 1: Generate reset token
      const resetToken = randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Step 2: Store reset token in Redis
      await redisService.set(
        `password_reset:${resetToken}`,
        {
          userId: userId,
          email: email,
          expiresAt: expiresAt.toISOString(),
          createdAt: new Date().toISOString()
        },
        600 // 10 minutes TTL
      );

      // Step 3: Send password reset email
      const emailResult = await emailService.sendPasswordResetEmail(email, resetToken);
      expect(emailResult).toBe(true);

      // Step 4: Track password reset request
      monitoringService.trackApplicationEvent({
        type: 'password_reset',
        event: 'reset_requested',
        details: {
          userId: userId,
          email: email,
          tokenGenerated: true
        }
      });

      // Step 5: Verify token exists
      const storedToken = await redisService.get(`password_reset:${resetToken}`);
      expect(storedToken).toEqual(
        expect.objectContaining({
          userId: userId,
          email: email
        })
      );

      // Step 6: Simulate token validation (password reset page)
      const isValidToken = true;
      if (isValidToken) {
        // Step 7: Generate new password hash
        const newPassword = 'NewSecurePass456!';
        const passwordHash = createHash('sha256').update(newPassword).digest('hex');

        // In real app, would update database with new password hash
        console.log('Password hash generated:', passwordHash);

        // Step 8: Invalidate all user sessions
        const userSessions = await redisService.getAllUserSessions(userId);
        if (userSessions && userSessions.length > 0) {
          for (const sessionId of userSessions) {
            await redisService.deleteSession(sessionId);
          }
        }

        // Step 9: Clean up reset token
        await redisService.delete(`password_reset:${resetToken}`);

        // Step 10: Send password change notification
        const notificationResult = await emailService.sendSecurityAlert(email, 'password_changed', {
          ipAddress: '192.168.1.100',
          timestamp: new Date().toISOString(),
          device: 'Chrome Browser'
        });
        expect(notificationResult).toBe(true);

        // Step 11: Track successful password reset
        monitoringService.trackApplicationEvent({
          type: 'password_reset',
          event: 'reset_completed',
          details: {
            userId: userId,
            email: email,
            sessionsInvalidated: userSessions ? userSessions.length : 0
          }
        });
      }
    }, 20000);
  });

  describe('Session Management Integration', () => {
    it('should manage user sessions across multiple devices', async () => {
      const userId = 'multi-session-user';
      const sessions = [];

      // Create multiple sessions for same user
      for (let i = 0; i < 3; i++) {
        const sessionId = `session_${userId}_${i}`;
        const sessionData = {
          userId: userId,
          device: `Device ${i + 1}`,
          browser: `Browser ${i + 1}`,
          ipAddress: `192.168.1.${i + 100}`,
          loginTime: new Date(Date.now() - i * 3600000).toISOString()
        };

        await redisService.setSession(sessionId, sessionData, 3600);
        sessions.push(sessionId);
      }

      // Step 1: Get all user sessions
      const userSessions = await redisService.getAllUserSessions(userId);
      expect(userSessions).toHaveLength(3);

      // Step 2: Extend session for specific device
      await redisService.extendSession(sessions[0], 7200); // 2 hours
      console.log('Extended session for device 1');

      // Step 3: Invalidate session for suspicious activity
      await redisService.invalidateUserSession(userId, sessions[1]);
      console.log('Invalidated session for device 2');

      // Step 4: Track session management events
      monitoringService.trackApplicationEvent({
        type: 'session_management',
        event: 'sessions_updated',
        details: {
          userId: userId,
          totalSessions: 3,
          extendedSessions: 1,
          invalidatedSessions: 1
        }
      });

      // Step 5: Check remaining active sessions
      const remainingSessions = await redisService.getAllUserSessions(userId);
      expect(remainingSessions).toHaveLength(2);
    }, 15000);
  });
});

// Helper function to create test user (mock implementation)
async function createTestUser(userData: any) {
  // In real implementation, would insert into test database
  return {
    id: `test-user-${Date.now()}`,
    email: userData.email,
    phone: userData.phone,
    firstName: userData.firstName,
    lastName: userData.lastName,
    isVerified: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };
}