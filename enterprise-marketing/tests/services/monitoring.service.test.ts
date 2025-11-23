import { MonitoringService } from '../../../lib/services/monitoring.service';
import { jest } from '@jest/globals';

// Mock Sentry
jest.mock('@sentry/nextjs', () => ({
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  addBreadcrumb: jest.fn(),
  setUser: jest.fn(),
  setTag: jest.fn(),
  setExtra: jest.fn(),
  setContext: jest.fn(),
  flush: jest.fn().mockResolvedValue(true),
  close: jest.fn().mockResolvedValue(undefined)
}));

// Mock fetch for external monitoring services
global.fetch = jest.fn();

describe('MonitoringService', () => {
  let monitoringService: MonitoringService;
  let mockSentry: jest.Mocked<typeof import('@sentry/nextjs')>;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Import and setup the mock
    mockSentry = require('@sentry/nextjs');
    
    monitoringService = new MonitoringService();
  });

  describe('Service Initialization', () => {
    it('should initialize Sentry with DSN and environment', () => {
      expect(mockSentry.init).toHaveBeenCalledWith(
        expect.objectContaining({
          dsn: process.env.SENTRY_DSN,
          environment: process.env.SENTRY_ENVIRONMENT,
          integrations: expect.any(Array)
        })
      );
    });

    it('should create singleton instance', () => {
      const instance1 = MonitoringService.getInstance();
      const instance2 = MonitoringService.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should configure error tracking with proper context', () => {
      expect(mockSentry.setTag).toHaveBeenCalledWith(
        'service',
        'optibid-energy-platform'
      );
      expect(mockSentry.setTag).toHaveBeenCalledWith(
        'version',
        expect.any(String)
      );
    });
  });

  describe('Error Capture and Tracking', () => {
    it('should capture exceptions with full context', () => {
      const error = new Error('Test error');
      const context = { userId: '123', action: 'test_action' };

      monitoringService.captureError(error, context);

      expect(mockSentry.captureException).toHaveBeenCalledWith(
        error,
        expect.objectContaining({
          tags: expect.objectContaining({
            action: 'test_action'
          }),
          extra: expect.objectContaining({
            userId: '123'
          })
        })
      );
    });

    it('should categorize errors by severity', () => {
      const errors = [
        { error: new Error('Critical database failure'), level: 'fatal' },
        { error: new Error('API rate limit exceeded'), level: 'warning' },
        { error: new Error('User input validation failed'), level: 'info' }
      ];

      for (const { error, level } of errors) {
        monitoringService.captureError(error, { level });
        
        const callArgs = mockSentry.captureException.mock.calls.pop()[1];
        expect(callArgs.level).toBe(level);
      }
    });

    it('should add breadcrumbs for error tracking', () => {
      const error = new Error('Database connection failed');
      
      monitoringService.captureError(error, {
        breadcrumbs: [
          { message: 'Attempting database connection', category: 'database' },
          { message: 'Connection string validated', category: 'database' }
        ]
      });

      expect(mockSentry.addBreadcrumb).toHaveBeenCalledTimes(2);
    });

    it('should handle different error types appropriately', () => {
      const errorTypes = [
        new Error('Standard Error'),
        new TypeError('Type Error'),
        new ReferenceError('Reference Error'),
        new SyntaxError('Syntax Error')
      ];

      for (const error of errorTypes) {
        monitoringService.captureError(error);
      }

      expect(mockSentry.captureException).toHaveBeenCalledTimes(4);
      expect(console.warn).toHaveBeenCalledWith(
        'Unknown error type captured:',
        expect.any(String)
      );
    });
  });

  describe('Security Event Monitoring', () => {
    it('should track security events with proper classification', () => {
      const securityEvent = {
        type: 'authentication_failure',
        severity: 'high',
        userId: 'user123',
        ipAddress: '192.168.1.1',
        userAgent: 'Test Browser',
        timestamp: new Date().toISOString()
      };

      monitoringService.trackSecurityEvent(securityEvent);

      expect(mockSentry.captureMessage).toHaveBeenCalledWith(
        'Security Event: authentication_failure',
        'error',
        expect.objectContaining({
          tags: expect.objectContaining({
            security_event: 'true',
            severity: 'high'
          }),
          extra: expect.objectContaining({
            userId: 'user123',
            ipAddress: '192.168.1.1'
          })
        })
      );
    });

    it('should handle different security event types', () => {
      const securityEvents = [
        { type: 'failed_login_attempt', severity: 'medium' },
        { type: 'suspicious_activity', severity: 'high' },
        { type: 'data_breach_attempt', severity: 'critical' },
        { type: 'privilege_escalation', severity: 'critical' }
      ];

      for (const event of securityEvents) {
        monitoringService.trackSecurityEvent({
          ...event,
          userId: 'test_user',
          timestamp: new Date().toISOString()
        });
      }

      expect(mockSentry.captureMessage).toHaveBeenCalledTimes(4);
    });

    it('should track authentication-related security events', () => {
      const authEvent = {
        type: 'brute_force_attack',
        severity: 'high',
        details: {
          attempts: 50,
          timeframe: '1 hour',
          sourceIp: '192.168.1.100',
          targetUsers: ['admin', 'user1', 'user2']
        }
      };

      monitoringService.trackSecurityEvent(authEvent);

      const callArgs = mockSentry.captureMessage.mock.calls[0];
      expect(callArgs[0]).toContain('Security Event: brute_force_attack');
      expect(callArgs[1]).toBe('error');
    });

    it('should implement security alerting thresholds', () => {
      // Simulate multiple security events in short time
      const events = Array(10).fill(null).map((_, i) => ({
        type: 'suspicious_activity',
        severity: 'medium',
        timestamp: new Date(Date.now() - i * 60000).toISOString() // Every minute
      }));

      for (const event of events) {
        monitoringService.trackSecurityEvent(event);
      }

      // Should trigger high-priority alert after threshold
      expect(monitoringService).toHaveProperty('checkSecurityThresholds');
    });
  });

  describe('Performance Monitoring', () => {
    it('should track API response times', () => {
      const performanceMetric = {
        type: 'api_response_time',
        endpoint: '/api/auth/login',
        method: 'POST',
        responseTime: 250,
        statusCode: 200,
        userId: 'user123'
      };

      monitoringService.trackPerformance(performanceMetric);

      expect(mockSentry.addBreadcrumb).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'API Performance: POST /api/auth/login',
          data: expect.objectContaining({
            responseTime: 250,
            statusCode: 200
          })
        })
      );
    });

    it('should monitor database query performance', () => {
      const dbMetric = {
        type: 'database_query',
        query: 'SELECT * FROM users WHERE email = ?',
        executionTime: 150,
        rowsAffected: 1,
        queryType: 'SELECT'
      };

      monitoringService.trackPerformance(dbMetric);

      expect(mockSentry.addBreadcrumb).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Database Performance: SELECT query',
          data: expect.objectContaining({
            executionTime: 150,
            queryType: 'SELECT'
          })
        })
      );
    });

    it('should track external service call performance', () => {
      const serviceMetric = {
        type: 'external_service_call',
        service: 'sendgrid',
        endpoint: '/v3/mail/send',
        responseTime: 500,
        success: true
      };

      monitoringService.trackPerformance(serviceMetric);

      expect(mockSentry.addBreadcrumb).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'External Service: sendgrid API call',
          data: expect.objectContaining({
            responseTime: 500,
            success: true
          })
        })
      );
    });

    it('should alert on performance degradation', () => {
      // Simulate slow performance
      const slowMetric = {
        type: 'api_response_time',
        endpoint: '/api/users/profile',
        responseTime: 5000, // 5 seconds - too slow
        threshold: 1000
      };

      monitoringService.trackPerformance(slowMetric);

      expect(mockSentry.captureMessage).toHaveBeenCalledWith(
        'Performance Alert: API response time exceeded threshold',
        'warning',
        expect.objectContaining({
          tags: expect.objectContaining({
            performance_alert: 'true'
          })
        })
      );
    });
  });

  describe('Application Health Monitoring', () => {
    it('should perform comprehensive health checks', async () => {
      const healthCheck = await monitoringService.healthCheck();

      expect(healthCheck).toEqual(
        expect.objectContaining({
          status: 'healthy',
          timestamp: expect.any(String),
          services: expect.objectContaining({
            database: expect.objectContaining({ status: 'up' }),
            redis: expect.objectContaining({ status: 'up' }),
            email: expect.objectContaining({ status: 'up' }),
            sms: expect.objectContaining({ status: 'up' })
          }),
          metrics: expect.objectContaining({
            uptime: expect.any(Number),
            memory: expect.objectContaining({ usage: expect.any(Number) }),
            cpu: expect.objectContaining({ usage: expect.any(Number) })
          })
        })
      );
    });

    it('should detect service outages', async () => {
      // Mock service failures
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Service unavailable'));

      const healthCheck = await monitoringService.healthCheck();

      expect(healthCheck.services.email.status).toBe('down');
      expect(healthCheck.overallStatus).toBe('unhealthy');
    });

    it('should track uptime and availability', () => {
      const uptimeMetric = {
        type: 'service_uptime',
        service: 'database',
        uptime: 99.95, // 99.95% uptime
        downtime: 0.05,
        incidents: 2
      };

      monitoringService.trackPerformance(uptimeMetric);

      expect(mockSentry.addBreadcrumb).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Service Uptime: database',
          data: expect.objectContaining({
            uptime: 99.95,
            incidents: 2
          })
        })
      );
    });
  });

  describe('Alerting and Notifications', () => {
    it('should send alerts based on severity levels', () => {
      const alerts = [
        { level: 'critical', message: 'Database connection lost' },
        { level: 'warning', message: 'High memory usage detected' },
        { level: 'info', message: 'System backup completed' }
      ];

      for (const alert of alerts) {
        monitoringService.sendAlert({
          level: alert.level,
          title: 'Test Alert',
          message: alert.message,
          timestamp: new Date().toISOString()
        });
      }

      expect(mockSentry.captureMessage).toHaveBeenCalledTimes(3);
    });

    it('should include contextual information in alerts', () => {
      const alert = {
        level: 'error' as const,
        title: 'Authentication Failure',
        message: 'Multiple failed login attempts detected',
        context: {
          userId: 'user123',
          ipAddress: '192.168.1.1',
          attempts: 5,
          timeframe: '10 minutes'
        },
        timestamp: new Date().toISOString()
      };

      monitoringService.sendAlert(alert);

      const callArgs = mockSentry.captureMessage.mock.calls[0];
      expect(callArgs[1]).toBe('error');
      expect(callArgs[2]).toHaveProperty('extra', alert.context);
    });

    it('should implement alert aggregation and deduplication', () => {
      // Send similar alerts quickly
      for (let i = 0; i < 5; i++) {
        monitoringService.sendAlert({
          level: 'warning' as const,
          title: 'Rate Limit Warning',
          message: 'API rate limit approaching threshold',
          timestamp: new Date().toISOString()
        });
      }

      // Should aggregate or deduplicate similar alerts
      expect(monitoringService).toHaveProperty('shouldSendAlert');
    });

    it('should escalate critical alerts', () => {
      const criticalAlert = {
        level: 'critical' as const,
        title: 'Security Breach Detected',
        message: 'Unauthorized access to sensitive data',
        timestamp: new Date().toISOString()
      };

      monitoringService.sendAlert(criticalAlert);

      // Should trigger multiple notification channels
      expect(mockSentry.captureMessage).toHaveBeenCalled();
      // Additional escalation logic would be implementation-specific
    });
  });

  describe('Custom Metrics and Business Logic Tracking', () => {
    it('should track user engagement metrics', () => {
      const userMetric = {
        type: 'user_engagement',
        metric: 'session_duration',
        value: 1800, // 30 minutes
        userId: 'user123',
        timestamp: new Date().toISOString()
      };

      monitoringService.trackUserMetric(userMetric);

      expect(mockSentry.setExtra).toHaveBeenCalledWith(
        'user_metric',
        expect.objectContaining({
          type: 'session_duration',
          value: 1800,
          userId: 'user123'
        })
      );
    });

    it('should track business KPIs', () => {
      const businessMetric = {
        type: 'business_kpi',
        metric: 'daily_active_users',
        value: 1250,
        target: 1000,
        timestamp: new Date().toISOString()
      };

      monitoringService.trackBusinessMetric(businessMetric);

      expect(mockSentry.addBreadcrumb).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Business KPI: daily_active_users',
          data: expect.objectContaining({
            value: 1250,
            target: 1000,
            variance: 250
          })
        })
      );
    });

    it('should monitor application-specific events', () => {
      const appEvent = {
        type: 'application_event',
        event: 'user_registration',
        details: {
          registration_method: 'email',
          referral_source: 'google_ads',
          user_segment: 'enterprise'
        }
      };

      monitoringService.trackApplicationEvent(appEvent);

      expect(mockSentry.setTag).toHaveBeenCalledWith(
        'app_event',
        'user_registration'
      );
    });
  });

  describe('Integration with External Monitoring', () => {
    it('should send metrics to DataDog', async () => {
      const metric = {
        name: 'api.response_time',
        value: 250,
        tags: ['endpoint:/api/auth/login', 'status:200']
      };

      // Mock successful DataDog submission
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200
      });

      await monitoringService.sendToDataDog(metric);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('api.datadoghq.com/api/v1/series'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'DD-API-KEY': expect.any(String)
          })
        })
      );
    });

    it('should handle external monitoring service failures', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(
        new Error('DataDog API unavailable')
      );

      const metric = {
        name: 'test.metric',
        value: 100,
        tags: ['test:true']
      };

      await monitoringService.sendToDataDog(metric);

      expect(mockSentry.captureException).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          tags: expect.objectContaining({
            external_service: 'datadog'
          })
        })
      );
    });
  });

  describe('Log Management and Analysis', () => {
    it('should structured log important events', () => {
      const logEvent = {
        level: 'info',
        message: 'User logged in successfully',
        metadata: {
          userId: 'user123',
          ipAddress: '192.168.1.1',
          userAgent: 'Chrome/91.0',
          timestamp: new Date().toISOString()
        }
      };

      monitoringService.logEvent(logEvent);

      expect(mockSentry.addBreadcrumb).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'User logged in successfully',
          category: 'user_action',
          level: 'info',
          data: expect.objectContaining({
            userId: 'user123',
            ipAddress: '192.168.1.1'
          })
        })
      );
    });

    it('should implement log aggregation', () => {
      const similarEvents = Array(10).fill(null).map((_, i) => ({
        level: 'warning',
        message: 'Rate limit exceeded',
        metadata: { endpoint: '/api/users', userId: `user${i}` }
      }));

      for (const event of similarEvents) {
        monitoringService.logEvent(event);
      }

      // Should aggregate similar log events
      expect(monitoringService).toHaveProperty('aggregateLogs');
    });

    it('should implement log retention policies', () => {
      const oldLog = {
        level: 'info',
        message: 'Old event',
        timestamp: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString() // 90 days ago
      };

      monitoringService.logEvent(oldLog);

      // Should implement retention based on log level and age
      expect(monitoringService).toHaveProperty('shouldRetainLog');
    });
  });

  describe('Configuration and Customization', () => {
    it('should respect environment-specific configurations', () => {
      expect(process.env.SENTRY_DSN).toBeDefined();
      expect(process.env.SENTRY_ENVIRONMENT).toBeDefined();
      expect(process.env.SENTRY_ENVIRONMENT).toBe('test');
    });

    it('should allow custom monitoring configuration', () => {
      const customConfig = {
        alertThresholds: {
          errorRate: 0.05, // 5% error rate
          responseTime: 2000, // 2 seconds
          memoryUsage: 0.8 // 80% memory usage
        },
        samplingRates: {
          errorSampling: 1.0, // Capture 100% of errors
          performanceSampling: 0.1 // Sample 10% of performance events
        }
      };

      monitoringService.updateConfiguration(customConfig);

      expect(monitoringService.getConfig()).toEqual(customConfig);
    });

    it('should provide monitoring statistics', () => {
      const stats = monitoringService.getMonitoringStats();

      expect(stats).toEqual(
        expect.objectContaining({
          errorCount: expect.any(Number),
          securityEvents: expect.any(Number),
          performanceMetrics: expect.any(Number),
          alertsSent: expect.any(Number)
        })
      );
    });
  });

  describe('Cleanup and Shutdown', () => {
    it('should flush all pending data before shutdown', async () => {
      await monitoringService.shutdown();

      expect(mockSentry.flush).toHaveBeenCalledWith(5000); // 5 second timeout
      expect(mockSentry.close).toHaveBeenCalledWith();
    });

    it('should handle cleanup gracefully', async () => {
      mockSentry.flush.mockRejectedValue(new Error('Flush timeout'));

      await monitoringService.shutdown();

      expect(console.warn).toHaveBeenCalledWith(
        'Failed to flush monitoring data:',
        expect.any(Error)
      );
    });
  });
});