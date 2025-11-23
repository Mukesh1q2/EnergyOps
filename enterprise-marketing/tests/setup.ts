// Test setup file
import { config } from 'dotenv';

// Load test environment variables
config({ path: '.env.test' });

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/optibid_test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-unit-testing-256-bits-long';
process.env.JWT_REFRESH_SECRET = 'test-refresh-jwt-secret-key-for-unit-testing';
process.env.ENCRYPTION_KEY = 'test-encryption-key-32-bytes-long';

// Mock external service credentials
process.env.SENDGRID_API_KEY = 'test-sendgrid-api-key';
process.env.SENDGRID_FROM_EMAIL = 'noreply@optibid.energy';
process.env.TWILIO_ACCOUNT_SID = 'test-twilio-account-sid';
process.env.TWILIO_AUTH_TOKEN = 'test-twilio-auth-token';
process.env.TWILIO_VERIFY_SERVICE_SID = 'test-verify-service-sid';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.SESSION_REDIS_URL = 'redis://localhost:6379/1';
process.env.RATE_LIMIT_REDIS_URL = 'redis://localhost:6379/2';
process.env.SENTRY_DSN = 'https://test-sentry-dsn@test.sentry.io/test';
process.env.SENTRY_ENVIRONMENT = 'test';

// Suppress console logs during tests unless explicitly testing logging
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

// Global test utilities
global.testHelpers = {
  // Generate test tokens
  generateTestJWT: (payload: any) => {
    const jwt = require('jsonwebtoken');
    return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '1h' });
  },
  
  // Generate test session ID
  generateSessionId: () => {
    return `test-session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },
  
  // Create test user data
  createTestUser: (overrides: any = {}) => {
    return {
      id: 'test-user-id',
      email: 'test@example.com',
      phone: '+1234567890',
      role: 'user',
      isVerified: false,
      mfaEnabled: false,
      lastLoginAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides
    };
  },
  
  // Create test verification data
  createTestVerification: (overrides: any = {}) => {
    return {
      id: 'test-verification-id',
      userId: 'test-user-id',
      type: 'email',
      code: '123456',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      attempts: 0,
      isUsed: false,
      createdAt: new Date(),
      ...overrides
    };
  }
};

// Extend Jest matchers
expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true
      };
    } else {
      return {
        message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false
      };
    }
  },
  
  toHaveValidEmailStructure(email: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pass = emailRegex.test(email);
    return {
      message: () => `expected ${email} to have valid email structure`,
      pass
    };
  },
  
  toHaveValidPhoneStructure(phone: string) {
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    const pass = phoneRegex.test(phone);
    return {
      message: () => `expected ${phone} to have valid phone structure`,
      pass
    };
  }
});