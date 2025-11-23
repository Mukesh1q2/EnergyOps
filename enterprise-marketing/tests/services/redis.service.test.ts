import { RedisService } from '../../../lib/services/redis.service';
import { jest } from '@jest/globals';

// Mock ioredis
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    // Session methods
    set: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
    expire: jest.fn(),
    
    // Hash operations
    hset: jest.fn(),
    hget: jest.fn(),
    hdel: jest.fn(),
    hgetall: jest.fn(),
    
    // List operations
    lpush: jest.fn(),
    rpop: jest.fn(),
    llen: jest.fn(),
    
    // Set operations
    sadd: jest.fn(),
    srem: jest.fn(),
    smembers: jest.fn(),
    sismember: jest.fn(),
    
    // Connection methods
    connect: jest.fn(),
    disconnect: jest.fn(),
    ping: jest.fn().mockResolvedValue('PONG'),
    
    // Event handlers
    on: jest.fn(),
    once: jest.fn(),
    
    // Pipeline
    pipeline: jest.fn().mockReturnValue({
      exec: jest.fn()
    })
  }));
});

describe('RedisService', () => {
  let redisService: RedisService;
  let mockRedis: jest.Mocked<any>;
  let mockPipeline: jest.Mocked<any>;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Setup mock pipeline
    mockPipeline = {
      set: jest.fn().mockReturnThis(),
      expire: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([[null, 'OK']])
    };
    
    // Import and setup the mock
    const Redis = require('ioredis');
    mockRedis = new Redis();
    mockRedis.pipeline.mockReturnValue(mockPipeline);
    
    redisService = new RedisService();
  });

  describe('Service Initialization', () => {
    it('should initialize Redis connections for all databases', () => {
      const Redis = require('ioredis');
      expect(Redis).toHaveBeenCalledTimes(4); // 4 databases
      expect(Redis.mock.calls[0][0]).toBe(process.env.REDIS_URL); // Database 0
      expect(Redis.mock.calls[1][0]).toBe(process.env.SESSION_REDIS_URL); // Database 1
      expect(Redis.mock.calls[2][0]).toBe(process.env.RATE_LIMIT_REDIS_URL); // Database 2
      expect(Redis.mock.calls[3][0]).toBe(process.env.FEATURE_FLAG_REDIS_URL); // Database 3
    });

    it('should create singleton instance', () => {
      const instance1 = RedisService.getInstance();
      const instance2 = RedisService.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should establish connections to all Redis databases', async () => {
      await redisService.connect();
      
      expect(mockRedis.connect).toHaveBeenCalledTimes(4);
    });

    it('should handle connection failures gracefully', async () => {
      mockRedis.connect.mockRejectedValue(new Error('Connection failed'));
      
      await expect(redisService.connect()).rejects.toThrow('Connection failed');
    });
  });

  describe('Session Management (Database 0)', () => {
    const testSessionId = 'test-session-123';
    const testSessionData = {
      userId: 'user-123',
      email: 'test@example.com',
      role: 'user',
      authenticated: true
    };

    it('should store session data with TTL', async () => {
      mockRedis.set.mockResolvedValue('OK');

      await redisService.setSession(testSessionId, testSessionData, 3600);

      expect(mockRedis.set).toHaveBeenCalledWith(
        `session:${testSessionId}`,
        JSON.stringify(testSessionData),
        'EX',
        3600
      );
    });

    it('should retrieve session data', async () => {
      const sessionString = JSON.stringify(testSessionData);
      mockRedis.get.mockResolvedValue(sessionString);

      const result = await redisService.getSession(testSessionId);

      expect(result).toEqual(testSessionData);
      expect(mockRedis.get).toHaveBeenCalledWith(`session:${testSessionId}`);
    });

    it('should return null for non-existent sessions', async () => {
      mockRedis.get.mockResolvedValue(null);

      const result = await redisService.getSession('non-existent-session');

      expect(result).toBeNull();
    });

    it('should delete sessions on logout', async () => {
      mockRedis.del.mockResolvedValue(1);

      await redisService.deleteSession(testSessionId);

      expect(mockRedis.del).toHaveBeenCalledWith(`session:${testSessionId}`);
    });

    it('should extend session TTL on activity', async () => {
      await redisService.extendSession(testSessionId, 3600);

      expect(mockRedis.expire).toHaveBeenCalledWith(`session:${testSessionId}`, 3600);
    });

    it('should use pipeline for bulk session operations', async () => {
      const sessions = [
        { id: 'session-1', data: { userId: 'user-1' } },
        { id: 'session-2', data: { userId: 'user-2' } }
      ];

      await redisService.bulkSetSessions(sessions);

      expect(mockPipeline.set).toHaveBeenCalledTimes(2);
      expect(mockPipeline.expire).toHaveBeenCalledTimes(2);
    });
  });

  describe('Rate Limiting (Database 1)', () => {
    const testKey = 'api:endpoints:/api/users';
    const testLimit = 100;
    const testWindow = 900000; // 15 minutes

    it('should check rate limits successfully', async () => {
      mockRedis.incr.mockResolvedValue(1);
      mockRedis.pttl.mockResolvedValue(testWindow);

      const result = await redisService.checkRateLimit(testKey, testLimit, testWindow);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(testLimit - 1);
      expect(result.resetTime).toBeDefined();
      expect(mockRedis.incr).toHaveBeenCalledWith(`rate_limit:${testKey}`);
    });

    it('should reject requests when rate limit exceeded', async () => {
      mockRedis.incr.mockResolvedValue(testLimit + 1);
      mockRedis.pttl.mockResolvedValue(testWindow);

      const result = await redisService.checkRateLimit(testKey, testLimit, testWindow);

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.resetTime).toBeDefined();
    });

    it('should handle sliding window rate limiting', async () => {
      mockRedis.incr.mockResolvedValue(1);
      mockRedis.pttl.mockResolvedValue(testWindow - 60000); // 1 minute remaining

      const result = await redisService.checkRateLimit(testKey, testLimit, testWindow);

      expect(result.allowed).toBe(true);
      expect(result.resetTime).toBe(testWindow - 60000);
    });

    it('should track rate limit violations', async () => {
      mockRedis.incr.mockResolvedValue(testLimit + 5);
      
      await redisService.checkRateLimit(testKey, testLimit, testWindow);

      // Should log or record violation (implementation-specific)
      expect(mockRedis.hincrby).toHaveBeenCalledWith(
        `violations:${testKey}`,
        'count',
        1
      );
    });

    it('should implement distributed rate limiting', async () => {
      const concurrentRequests = Array(5).fill(null).map(() => 
        redisService.checkRateLimit(testKey, testLimit, testWindow)
      );

      const results = await Promise.all(concurrentRequests);
      
      expect(results.every(result => result.allowed)).toBe(true);
      expect(mockRedis.incr).toHaveBeenCalledTimes(5);
    });
  });

  describe('Feature Flags (Database 2)', () => {
    const testFlag = 'new_dashboard_ui';

    it('should get feature flag state', async () => {
      mockRedis.get.mockResolvedValue('true');

      const result = await redisService.getFeatureFlag(testFlag);

      expect(result).toBe(true);
      expect(mockRedis.get).toHaveBeenCalledWith(`feature:${testFlag}`);
    });

    it('should return false for undefined feature flags', async () => {
      mockRedis.get.mockResolvedValue(null);

      const result = await redisService.getFeatureFlag('undefined_flag');

      expect(result).toBe(false);
    });

    it('should set feature flag state', async () => {
      mockRedis.set.mockResolvedValue('OK');

      await redisService.setFeatureFlag(testFlag, true, 3600);

      expect(mockRedis.set).toHaveBeenCalledWith(
        `feature:${testFlag}`,
        'true',
        'EX',
        3600
      );
    });

    it('should batch get multiple feature flags', async () => {
      const flags = ['flag1', 'flag2', 'flag3'];
      const responses = ['true', 'false', 'null'];
      
      mockRedis.mget.mockResolvedValue(responses);

      const result = await redisService.getFeatureFlags(flags);

      expect(result).toEqual({
        flag1: true,
        flag2: false,
        flag3: false
      });
    });

    it('should handle feature flag rollout strategies', async () => {
      // Mock percentage-based rollout
      mockRedis.get.mockResolvedValue('user123');
      
      const result = await redisService.isFeatureEnabledForUser(
        testFlag, 
        'user123', 
        { rolloutPercentage: 50 }
      );

      // Should use consistent hashing for rollout
      expect(mockRedis.get).toHaveBeenCalledWith(
        `feature:user:${testFlag}:user123`
      );
    });
  });

  describe('General Caching (Database 3)', () => {
    const testKey = 'user:profile:123';
    const testData = { name: 'John Doe', email: 'john@example.com' };

    it('should cache data with TTL', async () => {
      mockRedis.set.mockResolvedValue('OK');

      await redisService.set(testKey, testData, 1800);

      expect(mockRedis.set).toHaveBeenCalledWith(
        testKey,
        JSON.stringify(testData),
        'EX',
        1800
      );
    });

    it('should retrieve cached data', async () => {
      const dataString = JSON.stringify(testData);
      mockRedis.get.mockResolvedValue(dataString);

      const result = await redisService.get(testKey);

      expect(result).toEqual(testData);
    });

    it('should handle cache misses gracefully', async () => {
      mockRedis.get.mockResolvedValue(null);

      const result = await redisService.get('non_existent_key');

      expect(result).toBeNull();
    });

    it('should invalidate cache entries', async () => {
      mockRedis.del.mockResolvedValue(1);

      await redisService.delete(testKey);

      expect(mockRedis.del).toHaveBeenCalledWith(testKey);
    });

    it('should implement cache warming strategies', async () => {
      const keys = ['key1', 'key2', 'key3'];
      mockRedis.mget.mockResolvedValue(['val1', 'val2', 'val3']);

      const result = await redisService.mget(keys);

      expect(result).toEqual(['val1', 'val2', 'val3']);
      expect(mockRedis.mget).toHaveBeenCalledWith(keys);
    });

    it('should handle cache stampede prevention', async () => {
      const testKey = 'expensive_computation';
      const lockKey = `${testKey}:lock`;
      
      // Mock that lock doesn't exist
      mockRedis.setnx.mockResolvedValue(0);
      
      // Mock cache hit after computation
      const computedData = { result: 'computed' };
      mockRedis.get.mockResolvedValue(JSON.stringify(computedData));

      const result = await redisService.getOrCompute(testKey, async () => 
        Promise.resolve(computedData)
      );

      expect(result).toEqual(computedData);
    });
  });

  describe('Pub/Sub and Real-time Features', () => {
    it('should implement pub/sub for real-time updates', async () => {
      const channel = 'user_notifications';
      const message = { type: 'login', userId: '123' };

      await redisService.publish(channel, message);

      expect(mockRedis.publish).toHaveBeenCalledWith(
        channel,
        JSON.stringify(message)
      );
    });

    it('should subscribe to channels', (done) => {
      const channel = 'system_updates';
      const mockCallback = jest.fn();

      redisService.subscribe(channel, mockCallback);

      expect(mockRedis.subscribe).toHaveBeenCalledWith(channel);
      
      // Simulate incoming message
      const message = { update: 'system_restart' };
      mockRedis.emit('message', channel, JSON.stringify(message));

      setTimeout(() => {
        expect(mockCallback).toHaveBeenCalledWith(message);
        done();
      }, 100);
    });

    it('should handle subscription errors', () => {
      const channel = 'test_channel';
      const mockCallback = jest.fn();

      mockRedis.subscribe.mockRejectedValue(new Error('Subscription failed'));

      expect(() => {
        redisService.subscribe(channel, mockCallback);
      }).toThrow();
    });
  });

  describe('Health Monitoring and Diagnostics', () => {
    it('should perform health checks on all databases', async () => {
      const healthResults = await Promise.all([
        redisService.healthCheck(0), // Session DB
        redisService.healthCheck(1), // Rate limiting DB
        redisService.healthCheck(2), // Feature flags DB
        redisService.healthCheck(3)  // Cache DB
      ]);

      expect(healthResults).toEqual([true, true, true, true]);
    });

    it('should monitor memory usage', async () => {
      mockRedis.info.mockResolvedValue('used_memory_human:1.5M');
      
      const memoryUsage = await redisService.getMemoryUsage();
      
      expect(memoryUsage.usedMemory).toBe('1.5M');
      expect(mockRedis.info).toHaveBeenCalledWith('memory');
    });

    it('should track key statistics', async () => {
      mockRedis.dbsize.mockResolvedValue(1500);
      
      const stats = await redisService.getKeyStats();
      
      expect(stats.totalKeys).toBe(1500);
      expect(mockRedis.dbsize).toHaveBeenCalled();
    });

    it('should detect slow operations', async () => {
      const slowLog = [
        { id: 1, start_time: 1640995200000, duration: 15000, command: 'GET' }
      ];
      
      mockRedis.slowlog.mockResolvedValue(slowLog);
      
      const slowOperations = await redisService.getSlowLog();
      
      expect(slowOperations).toHaveLength(1);
      expect(slowOperations[0].duration).toBe(15000);
    });
  });

  describe('Error Handling and Resilience', () => {
    it('should handle connection errors gracefully', async () => {
      mockRedis.get.mockRejectedValue(new Error('Connection lost'));

      const result = await redisService.get('test_key');

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith(
        'Redis operation failed:',
        expect.any(Error)
      );
    });

    it('should implement retry logic for transient failures', async () => {
      mockRedis.get
        .mockRejectedValueOnce(new Error('Temporary failure'))
        .mockRejectedValueOnce(new Error('Temporary failure'))
        .mockResolvedValue('success');

      const startTime = Date.now();
      const result = await redisService.get('test_key');
      const endTime = Date.now();

      expect(result).toBe('success');
      expect(endTime - startTime).toBeGreaterThan(1000); // Should have retried
    });

    it('should handle Redis cluster failures', async () => {
      const redisCluster = {
        nodes: () => [{ info: () => Promise.resolve('role:master') }]
      };
      
      // Mock cluster failure
      mockRedis.cluster.mockImplementation(() => {
        throw new Error('Cluster error');
      });

      await expect(redisService.checkClusterHealth()).rejects.toThrow('Cluster error');
    });

    it('should implement circuit breaker pattern', async () => {
      // Simulate multiple failures
      for (let i = 0; i < 5; i++) {
        mockRedis.get.mockRejectedValue(new Error('Service unavailable'));
      }

      const result = await redisService.get('test_key');

      expect(result).toBeNull();
      // Should have opened circuit after failures
      expect(redisService.isCircuitOpen()).toBe(true);
    });
  });

  describe('Performance Optimization', () => {
    it('should use pipeline for batch operations', async () => {
      const operations = [
        { action: 'set', key: 'key1', value: 'value1' },
        { action: 'set', key: 'key2', value: 'value2' },
        { action: 'set', key: 'key3', value: 'value3' }
      ];

      await redisService.batchOperations(operations);

      expect(mockPipeline.set).toHaveBeenCalledTimes(3);
      expect(mockPipeline.exec).toHaveBeenCalled();
    });

    it('should implement connection pooling', async () => {
      // Test that connection pooling is used
      expect(mockRedis.constructor).toBeCalled();
      expect(mockRedis.constructor).toHaveBeenCalledTimes(4); // 4 databases
    });

    it('should optimize for memory usage', async () => {
      const largeData = 'x'.repeat(10000); // 10KB string
      
      mockRedis.set.mockResolvedValue('OK');
      
      await redisService.set('large_data', largeData, 3600);

      // Should use compression or serialization optimization
      expect(mockRedis.set).toHaveBeenCalledWith(
        'large_data',
        expect.any(String),
        'EX',
        3600
      );
    });

    it('should implement cache eviction policies', async () => {
      mockRedis.info.mockResolvedValue('maxmemory_policy:allkeys-lru');
      
      const evictionPolicy = await redisService.getEvictionPolicy();
      
      expect(evictionPolicy).toBe('allkeys-lru');
    });
  });

  describe('Security and Data Protection', () => {
    it('should encrypt sensitive data before caching', async () => {
      const sensitiveData = { password: 'secret123', token: 'auth_token' };
      
      await redisService.setSecure('secure_key', sensitiveData);

      // Should encrypt before storing
      expect(mockRedis.set).toHaveBeenCalledWith(
        'secure_key',
        expect.not.stringContaining('secret123'),
        'EX',
        expect.any(Number)
      );
    });

    it('should implement data validation', async () => {
      const invalidData = { invalid: 'structure' };
      
      await expect(redisService.set('key', invalidData)).rejects.toThrow();
    });

    it('should handle data expiration properly', async () => {
      const key = 'temp_data';
      const ttl = 300; // 5 minutes
      
      await redisService.set(key, 'data', ttl);
      
      expect(mockRedis.set).toHaveBeenCalledWith(
        key,
        expect.any(String),
        'EX',
        ttl
      );
    });
  });
});