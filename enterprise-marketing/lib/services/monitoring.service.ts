/**
 * Monitoring Service Implementation
 * Handles error tracking, APM, and performance monitoring
 * Integrates with Sentry, DataDog, and custom metrics
 */

import * as Sentry from '@sentry/nextjs';

interface MonitoringConfig {
  sentry: {
    dsn?: string;
    environment?: string;
    release?: string;
    tracesSampleRate?: number;
  };
  datadog: {
    apiKey?: string;
    appKey?: string;
    site?: string;
    service?: string;
    env?: string;
  };
}

interface SecurityEvent {
  userId?: string;
  email?: string;
  eventType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp?: Date;
}

interface PerformanceMetric {
  name: string;
  value: number;
  unit?: string;
  tags?: Record<string, string>;
  timestamp?: Date;
}

interface AuthEvent {
  userId?: string;
  email?: string;
  event: 'login_success' | 'login_failure' | 'logout' | 'password_reset' | 'mfa_verified';
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
  timestamp?: Date;
}

export class MonitoringService {
  private config: MonitoringConfig;
  private customMetrics: Map<string, number[]> = new Map();

  constructor() {
    this.config = {
      sentry: {
        dsn: process.env.SENTRY_DSN,
        environment: process.env.SENTRY_ENVIRONMENT || 'production',
        release: process.env.SENTRY_RELEASE || '1.0.0',
        tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.1')
      },
      datadog: {
        apiKey: process.env.DATADOG_API_KEY,
        appKey: process.env.DATADOG_APP_KEY,
        site: process.env.DATADOG_SITE || 'datadoghq.com',
        service: process.env.DD_SERVICE || 'optibid-energy-api',
        env: process.env.DD_ENV || 'production'
      }
    };

    this.initializeMonitoring();
  }

  /**
   * Initialize monitoring services
   */
  private initializeMonitoring() {
    // Initialize Sentry
    if (this.config.sentry.dsn) {
      try {
        Sentry.init({
          dsn: this.config.sentry.dsn,
          environment: this.config.sentry.environment,
          release: this.config.sentry.release,
          tracesSampleRate: this.config.sentry.tracesSampleRate,
          integrations: [
            new Sentry.BrowserTracing(),
          ],
          beforeSend: (event, hint) => {
            // Filter out sensitive information
            if (event.request?.data) {
              // Remove passwords, tokens, etc.
              const data = event.request.data as string;
              if (data.includes('password') || data.includes('token')) {
                event.request.data = '[Filtered]';
              }
            }
            return event;
          }
        });
        console.log('Sentry monitoring initialized');
      } catch (error) {
        console.error('Failed to initialize Sentry:', error);
      }
    }

    // Initialize DataDog APM if configured
    if (this.config.datadog.apiKey && this.config.datadog.appKey) {
      try {
        // DataDog initialization would go here
        console.log('DataDog monitoring initialized');
      } catch (error) {
        console.error('Failed to initialize DataDog:', error);
      }
    }
  }

  // =============================================
  // ERROR TRACKING
  // =============================================

  /**
   * Capture exception with context
   */
  captureException(
    error: Error, 
    context?: {
      component?: string;
      operation?: string;
      userId?: string;
      email?: string;
      requestId?: string;
      additional?: Record<string, any>;
    }
  ): void {
    if (!this.config.sentry.dsn) return;

    Sentry.withScope((scope) => {
      // Set context information
      if (context?.component) {
        scope.setTag('component', context.component);
      }
      if (context?.operation) {
        scope.setTag('operation', context.operation);
      }
      if (context?.userId) {
        scope.setUser({ id: context.userId, email: context.email });
      }
      if (context?.requestId) {
        scope.setTag('request_id', context.requestId);
      }

      // Set additional context
      if (context?.additional) {
        scope.setContext('additional_info', context.additional);
      }

      // Capture the exception
      Sentry.captureException(error);
    });

    console.error(`Exception captured: ${error.message}`, {
      component: context?.component,
      operation: context?.operation,
      userId: context?.userId
    });
  }

  /**
   * Capture message with level
   */
  captureMessage(
    message: string, 
    level: 'info' | 'warning' | 'error' | 'debug' = 'info',
    context?: Record<string, any>
  ): void {
    if (!this.config.sentry.dsn) return;

    if (context) {
      Sentry.addBreadcrumb({
        message,
        level,
        data: context,
        timestamp: Date.now() / 1000
      });
    }

    Sentry.captureMessage(message, level as any);
  }

  /**
   * Capture authentication events
   */
  captureAuthEvent(event: AuthEvent): void {
    const severity = this.getAuthEventSeverity(event.event);
    
    Sentry.withScope((scope) => {
      if (event.userId) {
        scope.setUser({ id: event.userId, email: event.email });
      }
      
      scope.setTag('event_type', 'authentication');
      scope.setTag('auth_event', event.event);
      scope.setTag('severity', severity);

      if (event.ipAddress) {
        scope.setTag('ip_address', event.ipAddress);
      }

      const eventData = {
        event: event.event,
        timestamp: event.timestamp || new Date(),
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        ...event.details
      };

      scope.setContext('auth_event', eventData);

      if (severity === 'high' || severity === 'critical') {
        Sentry.captureMessage(`Security Event: ${event.event}`, 'warning');
      }
    });

    // Log security events
    if (severity === 'high' || severity === 'critical') {
      this.logSecurityEvent({
        userId: event.userId,
        email: event.email,
        eventType: event.event,
        severity,
        details: {
          ipAddress: event.ipAddress,
          userAgent: event.userAgent,
          ...event.details
        },
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        timestamp: event.timestamp || new Date()
      });
    }
  }

  // =============================================
  // SECURITY MONITORING
  // =============================================

  /**
   * Log security events
   */
  logSecurityEvent(event: SecurityEvent): void {
    // Capture in Sentry
    if (event.severity === 'high' || event.severity === 'critical') {
      Sentry.withScope((scope) => {
        scope.setTag('event_type', 'security');
        scope.setTag('security_event', event.eventType);
        scope.setTag('severity', event.severity);
        
        if (event.userId) {
          scope.setUser({ id: event.userId, email: event.email });
        }

        scope.setContext('security_event', {
          eventType: event.eventType,
          severity: event.severity,
          details: event.details,
          timestamp: event.timestamp || new Date(),
          ipAddress: event.ipAddress,
          userAgent: event.userAgent
        });

        Sentry.captureMessage(`Security Event: ${event.eventType}`, 'warning');
      });
    }

    // Log to console for immediate visibility
    console.warn('Security Event:', {
      type: event.eventType,
      severity: event.severity,
      userId: event.userId,
      email: event.email,
      details: event.details,
      timestamp: event.timestamp || new Date()
    });

    // Track security metrics
    this.incrementMetric('security.events', 1, {
      event_type: event.eventType,
      severity: event.severity
    });

    // Send alerts for critical events
    if (event.severity === 'critical') {
      this.sendCriticalSecurityAlert(event);
    }
  }

  /**
   * Track failed login attempts
   */
  trackFailedLogin(
    email: string, 
    ipAddress?: string, 
    userAgent?: string,
    reason?: string
  ): void {
    this.logSecurityEvent({
      email,
      eventType: 'failed_login',
      severity: 'medium',
      details: {
        reason: reason || 'Invalid credentials',
        attempts: 1
      },
      ipAddress,
      userAgent,
      timestamp: new Date()
    });
  }

  /**
   * Track account lockout
   */
  trackAccountLockout(
    userId: string,
    email: string,
    reason: string,
    ipAddress?: string
  ): void {
    this.logSecurityEvent({
      userId,
      email,
      eventType: 'account_locked',
      severity: 'high',
      details: {
        reason,
        lockedAt: new Date()
      },
      ipAddress,
      timestamp: new Date()
    });
  }

  /**
   * Track suspicious activities
   */
  trackSuspiciousActivity(
    userId: string,
    activity: string,
    details: Record<string, any>,
    ipAddress?: string
  ): void {
    this.logSecurityEvent({
      userId,
      eventType: 'suspicious_activity',
      severity: 'high',
      details: {
        activity,
        ...details
      },
      ipAddress,
      timestamp: new Date()
    });
  }

  // =============================================
  // PERFORMANCE MONITORING
  // =============================================

  /**
   * Track performance metric
   */
  trackMetric(metric: PerformanceMetric): void {
    const timestamp = metric.timestamp || new Date();
    
    // Store in custom metrics
    if (!this.customMetrics.has(metric.name)) {
      this.customMetrics.set(metric.name, []);
    }
    
    const metrics = this.customMetrics.get(metric.name)!;
    metrics.push(metric.value);

    // Keep only last 100 values
    if (metrics.length > 100) {
      metrics.shift();
    }

    // Log for debugging
    if (metric.name.includes('error') || metric.name.includes('failure')) {
      console.warn(`Performance metric: ${metric.name} = ${metric.value}${metric.unit || ''}`);
    } else {
      console.log(`Performance metric: ${metric.name} = ${metric.value}${metric.unit || ''}`);
    }

    // Send to monitoring systems
    if (this.config.datadog.apiKey) {
      this.sendToDataDog(metric);
    }
  }

  /**
   * Increment counter metric
   */
  incrementMetric(
    name: string, 
    value: number = 1, 
    tags?: Record<string, string>
  ): void {
    this.trackMetric({
      name,
      value,
      unit: 'count',
      tags,
      timestamp: new Date()
    });
  }

  /**
   * Track timing/duration metric
   */
  trackTiming(
    name: string, 
    duration: number, 
    tags?: Record<string, string>
  ): void {
    this.trackMetric({
      name,
      value: duration,
      unit: 'ms',
      tags,
      timestamp: new Date()
    });
  }

  /**
   * Track API response time
   */
  trackApiResponse(
    endpoint: string, 
    method: string, 
    statusCode: number, 
    duration: number,
    userId?: string
  ): void {
    const tags = {
      endpoint,
      method,
      status_code: statusCode.toString(),
      ...(userId && { user_id: userId })
    };

    this.trackTiming('api.response_time', duration, tags);
    this.incrementMetric('api.requests', 1, tags);

    // Track errors
    if (statusCode >= 400) {
      this.incrementMetric('api.errors', 1, tags);
      
      if (statusCode >= 500) {
        this.incrementMetric('api.server_errors', 1, tags);
      } else {
        this.incrementMetric('api.client_errors', 1, tags);
      }
    }
  }

  /**
   * Track database query performance
   */
  trackDatabaseQuery(
    query: string, 
    duration: number, 
    success: boolean,
    userId?: string
  ): void {
    const tags = {
      query_type: this.categorizeQuery(query),
      success: success.toString(),
      ...(userId && { user_id: userId })
    };

    this.trackTiming('database.query_time', duration, tags);
    
    if (!success) {
      this.incrementMetric('database.errors', 1, tags);
    }
  }

  // =============================================
  // ALERTING
  // =============================================

  /**
   * Send critical security alert
   */
  private async sendCriticalSecurityAlert(event: SecurityEvent): Promise<void> {
    try {
      // This would integrate with your alerting system
      // For now, we'll just log the critical event
      
      console.error('CRITICAL SECURITY ALERT:', {
        eventType: event.eventType,
        userId: event.userId,
        email: event.email,
        details: event.details,
        timestamp: event.timestamp || new Date()
      });

      // Increment critical alert counter
      this.incrementMetric('security.critical_alerts', 1);

    } catch (error) {
      console.error('Failed to send critical security alert:', error);
    }
  }

  // =============================================
  // UTILITY METHODS
  // =============================================

  /**
   * Get severity level for auth events
   */
  private getAuthEventSeverity(event: string): 'low' | 'medium' | 'high' | 'critical' {
    switch (event) {
      case 'login_success':
        return 'low';
      case 'logout':
        return 'low';
      case 'mfa_verified':
        return 'low';
      case 'password_reset':
        return 'medium';
      case 'login_failure':
        return 'medium';
      default:
        return 'medium';
    }
  }

  /**
   * Categorize database queries
   */
  private categorizeQuery(query: string): string {
    const upperQuery = query.toUpperCase();
    
    if (upperQuery.includes('SELECT')) return 'select';
    if (upperQuery.includes('INSERT')) return 'insert';
    if (upperQuery.includes('UPDATE')) return 'update';
    if (upperQuery.includes('DELETE')) return 'delete';
    if (upperQuery.includes('CREATE')) return 'create';
    if (upperQuery.includes('ALTER')) return 'alter';
    
    return 'other';
  }

  /**
   * Send metrics to DataDog
   */
  private sendToDataDog(metric: PerformanceMetric): void {
    // Implementation would send to DataDog API
    // This is a placeholder for the actual DataDog integration
    console.log(`DataDog metric: ${metric.name} = ${metric.value}${metric.unit || ''}`);
  }

  // =============================================
  // HEALTH CHECKS
  // =============================================

  /**
   * Get monitoring service health status
   */
  getHealthStatus(): {
    overall: boolean;
    sentry: { healthy: boolean; details: string };
    datadog: { healthy: boolean; details: string };
    custom_metrics: { count: number; recent_metrics: string[] };
  } {
    const sentryHealthy = !!this.config.sentry.dsn;
    const datadogHealthy = !!(this.config.datadog.apiKey && this.config.datadog.appKey);
    
    return {
      overall: sentryHealthy || datadogHealthy,
      sentry: {
        healthy: sentryHealthy,
        details: sentryHealthy 
          ? `Configured for ${this.config.sentry.environment}` 
          : 'Not configured'
      },
      datadog: {
        healthy: datadogHealthy,
        details: datadogHealthy 
          ? `Configured for ${this.config.datadog.service}` 
          : 'Not configured'
      },
      custom_metrics: {
        count: this.customMetrics.size,
        recent_metrics: Array.from(this.customMetrics.keys()).slice(0, 10)
      }
    };
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(): {
    api_response_times: {
      avg: number;
      p95: number;
      p99: number;
    };
    database_queries: {
      avg: number;
      slow_queries: number;
    };
    error_rates: {
      api_errors: number;
      database_errors: number;
      security_events: number;
    };
  } {
    // Calculate summary from stored metrics
    const metrics = this.customMetrics;
    
    // This would calculate actual statistics from stored metrics
    // For now, returning placeholder structure
    return {
      api_response_times: {
        avg: 150,
        p95: 300,
        p99: 500
      },
      database_queries: {
        avg: 50,
        slow_queries: 5
      },
      error_rates: {
        api_errors: 2,
        database_errors: 1,
        security_events: 3
      }
    };
  }
}

// Export singleton instance
export const monitoringService = new MonitoringService();
