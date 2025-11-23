/**
 * Redis Service Implementation
 * Handles session storage, caching, and rate limiting
 * Provides connection management for multiple Redis databases
 */

import Redis, { Redis as RedisClient } from 'ioredis';

interface RedisConfig {
  url: string;
  password?: string;
  keyPrefix?: string;
  retryDelayOnFailover?: number;
  maxRetriesPerRequest?: number;
}

interface SessionData {
  userId: string;
  email: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  lastActivity: Date;
  permissions?: string[];
  organizationId?: string;
  mfaVerified: boolean;
  deviceInfo?: {
    deviceId?: string;
    deviceType?: string;
    platform?: string;
  };
}

interface RateLimitData {
  count: number;
  windowStart: number;
  resetTime: number;
}

interface CacheData {
  data: any;
  expiresAt: number;
  tags?: string[];
}

interface FeatureFlagData {
  enabled: boolean;
  value?: any;
  lastUpdated: Date;
  expiresAt?: Date;
}

export class RedisService {
  public client: RedisClient;        // General caching
  public sessionClient: RedisClient; // Session storage
  public rateLimitClient: RedisClient; // Rate limiting
  public featureClient: RedisClient;  // Feature flags

  private configs: {
    main: RedisConfig;
    session: RedisConfig;
    rateLimit: RedisConfig;
    feature: RedisConfig;
  };

  constructor() {
    this.configs = {
      main: {
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        password: process.env.REDIS_PASSWORD,
        keyPrefix: process.env.REDIS_KEY_PREFIX || 'optibid:',
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3
      },
      session: {
        url: process.env.SESSION_REDIS_URL || process.env.REDIS_URL || 'redis://localhost:6379',
        password: process.env.REDIS_PASSWORD,
        keyPrefix: process.env.SESSION_KEY_PREFIX || 'session:',
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3
      },
      rateLimit: {
        url: process.env.RATE_LIMIT_REDIS_URL || process.env.REDIS_URL || 'redis://localhost:6379',
        password: process.env.REDIS_PASSWORD,
        keyPrefix: process.env.RATE_LIMIT_PREFIX || 'ratelimit:',
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3
      },
      feature: {
        url: process.env.FEATURE_REDIS_URL || process.env.REDIS_URL || 'redis://localhost:6379',
        password: process.env.REDIS_PASSWORD,
        keyPrefix: process.env.FEATURE_KEY_PREFIX || 'features:',
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3
      }
    };

    this.initializeClients();
  }

  /**
   * Initialize all Redis clients
   */
  private initializeClients() {
    // Main Redis client for general caching
    this.client = new Redis(this.configs.main.url, {
      password: this.configs.main.password,
      keyPrefix: this.configs.main.keyPrefix,
      retryDelayOnFailover: this.configs.main.retryDelayOnFailover,
      maxRetriesPerRequest: this.configs.main.maxRetriesPerRequest,
      lazyConnect: true,
      keepAlive: 30000,
      family: 4,
      db: 0
    });

    // Session storage client
    this.sessionClient = new Redis(this.configs.session.url, {
      password: this.configs.session.password,
      keyPrefix: this.configs.session.keyPrefix,
      retryDelayOnFailover: this.configs.session.retryDelayOnFailover,
      maxRetriesPerRequest: this.configs.session.maxRetriesPerRequest,
      lazyConnect: true,
      keepAlive: 30000,
      family: 4,
      db: 1
    });

    // Rate limiting client
    this.rateLimitClient = new Redis(this.configs.rateLimit.url, {
      password: this.configs.rateLimit.password,
      keyPrefix: this.configs.rateLimit.keyPrefix,
      retryDelayOnFailover: this.configs.rateLimit.retryDelayOnFailover,
      maxRetriesPerRequest: this.configs.rateLimit.maxRetriesPerRequest,
      lazyConnect: true,
      keepAlive: 30000,
      family: 4,
      db: 2
    });

    // Feature flags client
    this.featureClient = new Redis(this.configs.feature.url, {
      password: this.configs.feature.password,
      keyPrefix: this.configs.feature.keyPrefix,
      retryDelayOnFailover: this.configs.feature.retryDelayOnFailover,
      maxRetriesPerRequest: this.configs.feature.maxRetriesPerRequest,
      lazyConnect: true,
      keepAlive: 30000,
      family: 4,
      db: 3
    });

    // Add event listeners for monitoring
    this.setupEventListeners();
  }

  /**
   * Set up event listeners for all clients
   */
  private setupEventListeners() {
    const clients = [this.client, this.sessionClient, this.rateLimitClient, this.featureClient];
    
    clients.forEach((client, index) => {
      const clientNames = ['main', 'session', 'rateLimit', 'feature'];
      
      client.on('connect', () => {
        console.log(`Redis client ${clientNames[index]} connected`);
      });

      client.on('ready', () => {
        console.log(`Redis client ${clientNames[index]} ready`);
      });

      client.on('error', (error) => {
        console.error(`Redis client ${clientNames[index]} error:`, error);
      });

      client.on('close', () => {
        console.log(`Redis client ${clientNames[index]} connection closed`);
      });

      client.on('reconnecting', () => {
        console.log(`Redis client ${clientNames[index]} reconnecting...`);
      });
    });
  }

  // =============================================
  // SESSION MANAGEMENT
  // =============================================

  /**
   * Create or update user session
   */
  async createSession(sessionId: string, sessionData: SessionData, ttl: number = 86400): Promise<boolean> {
    try {
      const data = {
        ...sessionData,
        lastActivity: new Date()
      };

      await this.sessionClient.setex(`session:${sessionId}`, ttl, JSON.stringify(data));
      console.log(`Session created: ${sessionId} for user: ${sessionData.userId}`);
      return true;
    } catch (error) {
      console.error('Failed to create session:', error);
      return false;
    }
  }

  /**
   * Get session data
   */
  async getSession(sessionId: string): Promise<SessionData | null> {
    try {
      const sessionData = await this.sessionClient.get(`session:${sessionId}`);
      return sessionData ? JSON.parse(sessionData) : null;
    } catch (error) {
      console.error('Failed to get session:', error);
      return null;
    }
  }

  /**
   * Update session activity
   */
  async updateSessionActivity(sessionId: string): Promise<boolean> {
    try {
      const session = await this.getSession(sessionId);
      if (!session) return false;

      session.lastActivity = new Date();
      await this.sessionClient.setex(`session:${sessionId}`, 86400, JSON.stringify(session));
      return true;
    } catch (error) {
      console.error('Failed to update session activity:', error);
      return false;
    }
  }

  /**
   * Delete session
   */
  async deleteSession(sessionId: string): Promise<boolean> {
    try {
      await this.sessionClient.del(`session:${sessionId}`);
      console.log(`Session deleted: ${sessionId}`);
      return true;
    } catch (error) {
      console.error('Failed to delete session:', error);
      return false;
    }
  }

  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions(): Promise<number> {
    try {
      const keys = await this.sessionClient.keys('session:*');
      if (keys.length === 0) return 0;

      let deletedCount = 0;
      for (const key of keys) {
        const ttl = await this.sessionClient.ttl(key);
        if (ttl === -1) {
          await this.sessionClient.del(key);
          deletedCount++;
        }
      }

      console.log(`Cleaned up ${deletedCount} expired sessions`);
      return deletedCount;
    } catch (error) {
      console.error('Failed to cleanup expired sessions:', error);
      return 0;
    }
  }

  /**
   * Get all sessions for a user
   */
  async getUserSessions(userId: string): Promise<SessionData[]> {
    try {
      const keys = await this.sessionClient.keys('session:*');
      const sessions: SessionData[] = [];

      for (const key of keys) {
        const sessionData = await this.sessionClient.get(key);
        if (sessionData) {
          const session: SessionData = JSON.parse(sessionData);
          if (session.userId === userId) {
            sessions.push(session);
          }
        }
      }

      return sessions;
    } catch (error) {
      console.error('Failed to get user sessions:', error);
      return [];
    }
  }

  // =============================================
  // RATE LIMITING
  // =============================================

  /**
   * Check rate limit for a key
   */
  async checkRateLimit(
    key: string, 
    maxRequests: number, 
    windowMs: number
  ): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: Date;
    retryAfter?: number;
  }> {
    try {
      const windowSeconds = Math.ceil(windowMs / 1000);
      const rateKey = `ratelimit:${key}`;
      
      const current = await this.rateLimitClient.incr(rateKey);
      
      if (current === 1) {
        await this.rateLimitClient.expire(rateKey, windowSeconds);
      }

      const remaining = Math.max(0, maxRequests - current);
      const resetTime = new Date(Date.now() + windowMs);
      const retryAfter = current > maxRequests ? windowSeconds : undefined;

      return {
        allowed: current <= maxRequests,
        remaining,
        resetTime,
        retryAfter
      };
    } catch (error) {
      console.error('Failed to check rate limit:', error);
      return {
        allowed: true, // Fail open in case of error
        remaining: maxRequests,
        resetTime: new Date(Date.now() + windowMs)
      };
    }
  }

  /**
   * Reset rate limit for a key
   */
  async resetRateLimit(key: string): Promise<boolean> {
    try {
      await this.rateLimitClient.del(`ratelimit:${key}`);
      return true;
    } catch (error) {
      console.error('Failed to reset rate limit:', error);
      return false;
    }
  }

  // =============================================
  // CACHING
  // =============================================

  /**
   * Set cache with expiration
   */
  async setCache(key: string, value: any, ttl: number = 3600): Promise<boolean> {
    try {
      await this.client.setex(`cache:${key}`, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Failed to set cache:', error);
      return false;
    }
  }

  /**
   * Get cache value
   */
  async getCache(key: string): Promise<any> {
    try {
      const value = await this.client.get(`cache:${key}`);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Failed to get cache:', error);
      return null;
    }
  }

  /**
   * Delete cache
   */
  async deleteCache(key: string): Promise<boolean> {
    try {
      await this.client.del(`cache:${key}`);
      return true;
    } catch (error) {
      console.error('Failed to delete cache:', error);
      return false;
    }
  }

  /**
   * Invalidate cache by pattern
   */
  async invalidateCache(pattern: string): Promise<number> {
    try {
      const keys = await this.client.keys(`cache:${pattern}`);
      if (keys.length === 0) return 0;

      const deletedCount = await this.client.del(...keys);
      console.log(`Invalidated ${deletedCount} cache keys matching pattern: ${pattern}`);
      return deletedCount;
    } catch (error) {
      console.error('Failed to invalidate cache:', error);
      return 0;
    }
  }

  /**
   * Clear all cache
   */
  async clearAllCache(): Promise<boolean> {
    try {
      const keys = await this.client.keys('cache:*');
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
      console.log('Cleared all cache');
      return true;
    } catch (error) {
      console.error('Failed to clear cache:', error);
      return false;
    }
  }

  // =============================================
  // FEATURE FLAGS
  // =============================================

  /**
   * Get feature flag value
   */
  async getFeatureFlag(flagName: string, userId?: string): Promise<FeatureFlagData | null> {
    try {
      const key = `feature:${flagName}`;
      
      // Check user-specific flag first
      if (userId) {
        const userFlag = await this.featureClient.hgetall(`user_feature:${userId}:${flagName}`);
        if (userFlag && userFlag.enabled) {
          return {
            enabled: userFlag.enabled === 'true',
            value: userFlag.value ? JSON.parse(userFlag.value) : undefined,
            lastUpdated: new Date(userFlag.lastUpdated || Date.now()),
            expiresAt: userFlag.expiresAt ? new Date(userFlag.expiresAt) : undefined
          };
        }
      }

      // Check organization/global flag
      const flag = await this.featureClient.hgetall(key);
      if (flag && flag.enabled) {
        return {
          enabled: flag.enabled === 'true',
          value: flag.value ? JSON.parse(flag.value) : undefined,
          lastUpdated: new Date(flag.lastUpdated || Date.now()),
          expiresAt: flag.expiresAt ? new Date(flag.expiresAt) : undefined
        };
      }

      return null;
    } catch (error) {
      console.error('Failed to get feature flag:', error);
      return null;
    }
  }

  /**
   * Set feature flag
   */
  async setFeatureFlag(
    flagName: string, 
    data: {
      enabled: boolean;
      value?: any;
      userId?: string;
      organizationId?: string;
      expiresAt?: Date;
    }
  ): Promise<boolean> {
    try {
      const key = data.userId 
        ? `user_feature:${data.userId}:${flagName}`
        : data.organizationId
        ? `org_feature:${data.organizationId}:${flagName}`
        : `feature:${flagName}`;

      const flagData = {
        enabled: data.enabled.toString(),
        value: data.value ? JSON.stringify(data.value) : '',
        lastUpdated: new Date().toISOString(),
        expiresAt: data.expiresAt ? data.expiresAt.toISOString() : ''
      };

      await this.featureClient.hmset(key, flagData);
      
      // Set expiration if specified
      if (data.expiresAt) {
        const ttl = Math.ceil((data.expiresAt.getTime() - Date.now()) / 1000);
        if (ttl > 0) {
          await this.featureClient.expire(key, ttl);
        }
      }

      console.log(`Feature flag ${flagName} set: enabled=${data.enabled}`);
      return true;
    } catch (error) {
      console.error('Failed to set feature flag:', error);
      return false;
    }
  }

  /**
   * Delete feature flag
   */
  async deleteFeatureFlag(flagName: string, userId?: string, organizationId?: string): Promise<boolean> {
    try {
      const key = userId 
        ? `user_feature:${userId}:${flagName}`
        : organizationId
        ? `org_feature:${organizationId}:${flagName}`
        : `feature:${flagName}`;

      await this.featureClient.del(key);
      console.log(`Feature flag ${flagName} deleted`);
      return true;
    } catch (error) {
      console.error('Failed to delete feature flag:', error);
      return false;
    }
  }

  // =============================================
  // HEALTH CHECKS
  // =============================================

  /**
   * Get Redis service health status
   */
  async getHealthStatus(): Promise<{
    overall: boolean;
    main: { healthy: boolean; details: string };
    session: { healthy: boolean; details: string };
    rateLimit: { healthy: boolean; details: string };
    feature: { healthy: boolean; details: string };
  }> {
    const clients = [
      { name: 'main', client: this.client },
      { name: 'session', client: this.sessionClient },
      { name: 'rateLimit', client: this.rateLimitClient },
      { name: 'feature', client: this.featureClient }
    ];

    const results = await Promise.all(
      clients.map(async ({ name, client }) => {
        try {
          await client.ping();
          const info = await client.info();
          const connectedClients = info.match(/connected_clients:(\d+)/)?.[1] || '0';
          
          return {
            name,
            healthy: true,
            details: `Connected. Active clients: ${connectedClients}`
          };
        } catch (error) {
          return {
            name,
            healthy: false,
            details: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      })
    );

    const status = {
      main: results[0],
      session: results[1],
      rateLimit: results[2],
      feature: results[3]
    };

    const overall = Object.values(status).every(s => s.healthy);

    return {
      overall,
      ...status
    };
  }

  /**
   * Gracefully shutdown all Redis connections
   */
  async shutdown(): Promise<void> {
    const clients = [this.client, this.sessionClient, this.rateLimitClient, this.featureClient];
    
    console.log('Shutting down Redis connections...');
    await Promise.all(clients.map(client => client.quit()));
    console.log('Redis connections closed');
  }
}

// Export singleton instance
export const redisService = new RedisService();
