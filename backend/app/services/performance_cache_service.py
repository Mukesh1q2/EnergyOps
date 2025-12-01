"""
Advanced Performance Cache Service

Provides multi-tier caching strategy with Redis clustering, database query optimization,
and intelligent cache warming for optimal dashboard performance.

Features:
- Multi-tier caching (L1: In-memory, L2: Redis)
- Intelligent cache invalidation
- Query result caching
- Cache warming strategies
- Performance monitoring
"""

import asyncio
import json
import time
from typing import Any, Dict, List, Optional, Union, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from enum import Enum
import redis.asyncio as redis
from redis.cluster import RedisCluster
import hashlib
import pickle
import gzip
import logging

logger = logging.getLogger(__name__)


class CacheTier(Enum):
    """Cache tier levels"""
    L1_MEMORY = "l1_memory"  # In-memory cache
    L2_REDIS = "l2_redis"    # Redis cluster cache
    L3_DATABASE = "l3_db"    # Database materialized views


class CacheStrategy(Enum):
    """Cache strategies"""
    CACHE_FIRST = "cache_first"
    CACHE_ASIDE = "cache_aside"
    WRITE_THROUGH = "write_through"
    WRITE_BEHIND = "write_behind"


@dataclass
class CacheEntry:
    """Cache entry with metadata"""
    key: str
    value: Any
    created_at: datetime
    expires_at: datetime
    access_count: int = 0
    last_accessed: Optional[datetime] = None
    size_bytes: int = 0
    compression_ratio: float = 1.0


@dataclass
class CacheMetrics:
    """Cache performance metrics"""
    hits: int = 0
    misses: int = 0
    evictions: int = 0
    hit_ratio: float = 0.0
    avg_response_time: float = 0.0
    memory_usage_mb: float = 0.0
    redis_memory_mb: float = 0.0


class PerformanceCacheService:
    """
    Advanced multi-tier caching service for dashboard optimization
    """
    
    def __init__(
        self,
        redis_cluster_nodes: List[Dict[str, str]] = None,
        memory_cache_size: int = 1000,
        default_ttl: int = 3600,
        compression_threshold: int = 1024
    ):
        self.redis_cluster_nodes = redis_cluster_nodes or [
            {"host": "redis-cluster", "port": "7000"}
        ]
        self.memory_cache_size = memory_cache_size
        self.default_ttl = default_ttl
        self.compression_threshold = compression_threshold
        
        # L1 Memory cache
        self._memory_cache: Dict[str, CacheEntry] = {}
        self._memory_cache_order: List[str] = []
        
        # L2 Redis cluster
        self._redis_cluster = None
        self._redis_client = None
        
        # Metrics tracking
        self._metrics = CacheMetrics()
        
        # Cache warming schedules
        self._warming_schedules: Dict[str, Dict] = {}
        
    async def initialize(self):
        """Initialize Redis cluster connection"""
        try:
            # Initialize Redis cluster
            startup_nodes = [
                {"host": node["host"], "port": int(node["port"])}
                for node in self.redis_cluster_nodes
            ]
            
            self._redis_cluster = RedisCluster(
                startup_nodes=startup_nodes,
                decode_responses=True,
                skip_full_coverage_check=True,
                max_connections=20
            )
            
            # Initialize individual Redis client for metadata
            self._redis_client = redis.Redis(
                host=self.redis_cluster_nodes[0]["host"],
                port=int(self.redis_cluster_nodes[0]["port"]),
                decode_responses=True,
                max_connections=10
            )
            
            await self._redis_cluster.ping()
            await self._redis_client.ping()
            
            logger.info("Performance cache service initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize cache service: {e}")
            # Continue with memory-only cache
            self._redis_cluster = None
            self._redis_client = None
    
    async def get(
        self,
        key: str,
        strategy: CacheStrategy = CacheStrategy.CACHE_FIRST,
        tiers: List[CacheTier] = None
    ) -> Optional[Any]:
        """
        Get value from cache with specified strategy
        
        Args:
            key: Cache key
            strategy: Cache strategy to use
            tiers: Cache tiers to check (default: all tiers)
        
        Returns:
            Cached value or None if not found
        """
        if tiers is None:
            tiers = [CacheTier.L1_MEMORY, CacheTier.L2_REDIS]
        
        start_time = time.time()
        
        try:
            for tier in tiers:
                value = await self._get_from_tier(key, tier)
                if value is not None:
                    # Update metrics
                    self._metrics.hits += 1
                    if self._metrics.hits + self._metrics.misses > 0:
                        self._metrics.hit_ratio = self._metrics.hits / (
                            self._metrics.hits + self._metrics.misses
                        )
                    
                    # Record access in metadata
                    await self._record_access(key, tier)
                    
                    return value
            
            # Cache miss
            self._metrics.misses += 1
            return None
            
        finally:
            response_time = time.time() - start_time
            self._metrics.avg_response_time = (
                (self._metrics.avg_response_time * 0.9) + (response_time * 0.1)
            )
    
    async def set(
        self,
        key: str,
        value: Any,
        ttl: Optional[int] = None,
        strategy: CacheStrategy = CacheStrategy.WRITE_THROUGH,
        tiers: List[CacheTier] = None
    ) -> bool:
        """
        Set value in cache with specified strategy
        
        Args:
            key: Cache key
            value: Value to cache
            ttl: Time to live in seconds
            strategy: Cache strategy to use
            tiers: Cache tiers to write to (default: all tiers)
        
        Returns:
            Success status
        """
        if tiers is None:
            tiers = [CacheTier.L1_MEMORY, CacheTier.L2_REDIS]
        
        ttl = ttl or self.default_ttl
        
        try:
            # Compress large values
            compressed_value = await self._compress_value(value)
            
            # Write to specified tiers
            for tier in tiers:
                await self._set_in_tier(key, compressed_value, ttl, tier)
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to set cache key {key}: {e}")
            return False
    
    async def delete(self, key: str, tiers: List[CacheTier] = None) -> bool:
        """Delete key from cache tiers"""
        if tiers is None:
            tiers = [CacheTier.L1_MEMORY, CacheTier.L2_REDIS]
        
        try:
            for tier in tiers:
                await self._delete_from_tier(key, tier)
            return True
        except Exception as e:
            logger.error(f"Failed to delete cache key {key}: {e}")
            return False
    
    async def invalidate_pattern(self, pattern: str) -> int:
        """
        Invalidate cache keys matching pattern
        
        Args:
            pattern: Redis-style pattern (e.g., "dashboard:*")
        
        Returns:
            Number of keys invalidated
        """
        invalidated_count = 0
        
        try:
            # Clear L1 memory cache
            keys_to_delete = [
                key for key in self._memory_cache.keys()
                if self._pattern_match(key, pattern)
            ]
            
            for key in keys_to_delete:
                await self._delete_from_tier(key, CacheTier.L1_MEMORY)
                invalidated_count += 1
            
            # Clear L2 Redis cache
            if self._redis_cluster:
                redis_keys = await self._redis_cluster.keys(pattern)
                if redis_keys:
                    await self._redis_cluster.delete(*redis_keys)
                    invalidated_count += len(redis_keys)
            
            logger.info(f"Invalidated {invalidated_count} keys matching pattern {pattern}")
            
        except Exception as e:
            logger.error(f"Failed to invalidate pattern {pattern}: {e}")
        
        return invalidated_count
    
    async def warm_cache(self, keys: List[str], load_func: callable):
        """
        Pre-warm cache with specified keys
        
        Args:
            keys: List of cache keys to warm
            load_func: Function to load data for each key
        """
        logger.info(f"Starting cache warming for {len(keys)} keys")
        
        tasks = []
        for key in keys:
            # Check if already cached
            cached_value = await self.get(key)
            if cached_value is None:
                # Schedule for warming
                task = asyncio.create_task(
                    self._warm_single_key(key, load_func)
                )
                tasks.append(task)
        
        if tasks:
            await asyncio.gather(*tasks, return_exceptions=True)
            logger.info(f"Cache warming completed for {len(tasks)} keys")
    
    async def get_metrics(self) -> Dict[str, Any]:
        """Get cache performance metrics"""
        metrics_dict = asdict(self._metrics)
        
        # Add Redis-specific metrics
        if self._redis_client:
            try:
                redis_info = await self._redis_client.info('memory')
                metrics_dict['redis_memory_mb'] = redis_info.get('used_memory', 0) / 1024 / 1024
                metrics_dict['redis_connected_clients'] = redis_info.get('connected_clients', 0)
            except Exception as e:
                logger.warning(f"Failed to get Redis metrics: {e}")
        
        # Add memory cache metrics
        metrics_dict['memory_usage_mb'] = sum(
            entry.size_bytes for entry in self._memory_cache.values()
        ) / 1024 / 1024
        metrics_dict['memory_cache_size'] = len(self._memory_cache)
        
        return metrics_dict
    
    async def health_check(self) -> Dict[str, Any]:
        """Check cache service health"""
        health = {
            "status": "healthy",
            "components": {},
            "metrics": await self.get_metrics()
        }
        
        # Check Redis cluster
        if self._redis_cluster:
            try:
                await self._redis_cluster.ping()
                health["components"]["redis_cluster"] = "healthy"
            except Exception as e:
                health["components"]["redis_cluster"] = f"unhealthy: {e}"
                health["status"] = "degraded"
        
        if self._redis_client:
            try:
                await self._redis_client.ping()
                health["components"]["redis_client"] = "healthy"
            except Exception as e:
                health["components"]["redis_client"] = f"unhealthy: {e}"
                health["status"] = "degraded"
        
        # Check memory cache
        health["components"]["memory_cache"] = "healthy"
        
        return health
    
    async def _get_from_tier(self, key: str, tier: CacheTier) -> Optional[Any]:
        """Get value from specific cache tier"""
        if tier == CacheTier.L1_MEMORY:
            entry = self._memory_cache.get(key)
            if entry and entry.expires_at > datetime.utcnow():
                return await self._decompress_value(entry.value)
            elif entry:
                # Expired entry
                await self._delete_from_tier(key, tier)
        
        elif tier == CacheTier.L2_REDIS and self._redis_cluster:
            try:
                value = await self._redis_cluster.get(key)
                if value:
                    return await self._decompress_value(json.loads(value))
            except Exception as e:
                logger.warning(f"Redis get failed for key {key}: {e}")
        
        return None
    
    async def _set_in_tier(self, key: str, value: Any, ttl: int, tier: CacheTier):
        """Set value in specific cache tier"""
        expires_at = datetime.utcnow() + timedelta(seconds=ttl)
        
        if tier == CacheTier.L1_MEMORY:
            # LRU eviction if cache is full
            if len(self._memory_cache) >= self.memory_cache_size:
                await self._evict_lru()
            
            # Compress and store
            compressed_value = await self._compress_value(value)
            size_bytes = len(pickle.dumps(compressed_value))
            
            entry = CacheEntry(
                key=key,
                value=compressed_value,
                created_at=datetime.utcnow(),
                expires_at=expires_at,
                size_bytes=size_bytes
            )
            
            self._memory_cache[key] = entry
            self._memory_cache_order.append(key)
            
        elif tier == CacheTier.L2_REDIS and self._redis_cluster:
            try:
                value_json = json.dumps(value)
                await self._redis_cluster.setex(key, ttl, value_json)
                
                # Set metadata
                metadata = {
                    "created_at": datetime.utcnow().isoformat(),
                    "size_bytes": len(value_json),
                    "access_count": 0
                }
                await self._redis_client.setex(
                    f"meta:{key}", ttl, json.dumps(metadata)
                )
                
            except Exception as e:
                logger.warning(f"Redis set failed for key {key}: {e}")
    
    async def _delete_from_tier(self, key: str, tier: CacheTier):
        """Delete key from specific cache tier"""
        if tier == CacheTier.L1_MEMORY:
            self._memory_cache.pop(key, None)
            self._memory_cache_order = [
                k for k in self._memory_cache_order if k != key
            ]
        
        elif tier == CacheTier.L2_REDIS and self._redis_cluster:
            await self._redis_cluster.delete(key)
            await self._redis_client.delete(f"meta:{key}")
    
    async def _evict_lru(self):
        """Evict least recently used item from memory cache"""
        if self._memory_cache_order:
            oldest_key = self._memory_cache_order.pop(0)
            self._memory_cache.pop(oldest_key, None)
            self._metrics.evictions += 1
    
    async def _record_access(self, key: str, tier: CacheTier):
        """Record cache access for metrics"""
        if tier == CacheTier.L1_MEMORY:
            entry = self._memory_cache.get(key)
            if entry:
                entry.access_count += 1
                entry.last_accessed = datetime.utcnow()
        
        elif tier == CacheTier.L2_REDIS and self._redis_client:
            try:
                metadata_key = f"meta:{key}"
                metadata = await self._redis_client.get(metadata_key)
                if metadata:
                    meta = json.loads(metadata)
                    meta["access_count"] = meta.get("access_count", 0) + 1
                    meta["last_accessed"] = datetime.utcnow().isoformat()
                    await self._redis_client.setex(
                        metadata_key, self.default_ttl, json.dumps(meta)
                    )
            except Exception as e:
                logger.warning(f"Failed to record access for key {key}: {e}")
    
    async def _warm_single_key(self, key: str, load_func: callable):
        """Warm a single cache key"""
        try:
            value = await load_func(key)
            if value is not None:
                await self.set(key, value)
        except Exception as e:
            logger.warning(f"Failed to warm cache key {key}: {e}")
    
    async def _compress_value(self, value: Any) -> Any:
        """Compress large values for storage"""
        serialized = pickle.dumps(value)
        
        if len(serialized) > self.compression_threshold:
            compressed = gzip.compress(serialized)
            return {
                "data": compressed,
                "compressed": True,
                "original_size": len(serialized)
            }
        
        return {
            "data": serialized,
            "compressed": False,
            "original_size": len(serialized)
        }
    
    async def _decompress_value(self, value: Dict[str, Any]) -> Any:
        """Decompress value from storage"""
        if isinstance(value, dict) and value.get("compressed"):
            decompressed = gzip.decompress(value["data"])
            return pickle.loads(decompressed)
        elif isinstance(value, dict) and "data" in value:
            return pickle.loads(value["data"])
        else:
            return value
    
    def _pattern_match(self, key: str, pattern: str) -> bool:
        """Simple pattern matching for key invalidation"""
        # Convert Redis pattern to regex
        regex_pattern = pattern.replace("*", ".*").replace("?", ".")
        import re
        return bool(re.match(regex_pattern, key))
    
    async def cleanup_expired(self):
        """Clean up expired cache entries"""
        current_time = datetime.utcnow()
        
        # Clean memory cache
        expired_keys = [
            key for key, entry in self._memory_cache.items()
            if entry.expires_at <= current_time
        ]
        
        for key in expired_keys:
            await self._delete_from_tier(key, CacheTier.L1_MEMORY)
        
        # Redis will handle expiration automatically
        if expired_keys:
            logger.info(f"Cleaned up {len(expired_keys)} expired cache entries")
    
    async def close(self):
        """Close cache service connections"""
        if self._redis_cluster:
            await self._redis_cluster.close()
        if self._redis_client:
            await self._redis_client.close()


# Cache key generators for dashboard components
class DashboardCacheKeys:
    """Generate consistent cache keys for dashboard components"""
    
    @staticmethod
    def market_data(market_zone: str, timeframe: str) -> str:
        return f"dashboard:market_data:{market_zone}:{timeframe}"
    
    @staticmethod
    def kpi_widget(widget_id: str, config_hash: str) -> str:
        return f"dashboard:kpi:{widget_id}:{config_hash}"
    
    @staticmethod
    def timeseries_chart(chart_id: str, params: Dict) -> str:
        params_str = json.dumps(params, sort_keys=True)
        params_hash = hashlib.md5(params_str.encode()).hexdigest()[:8]
        return f"dashboard:timeseries:{chart_id}:{params_hash}"
    
    @staticmethod
    def user_dashboard(user_id: str, dashboard_id: str) -> str:
        return f"dashboard:user:{user_id}:{dashboard_id}"
    
    @staticmethod
    def analytics_metrics(timeframe: str, granularity: str) -> str:
        return f"analytics:metrics:{timeframe}:{granularity}"
    
    @staticmethod
    def market_summary(timeframe: str) -> str:
        return f"market:summary:{timeframe}"


# Cache warming strategies
class CacheWarmingStrategies:
    """Predefined cache warming strategies"""
    
    @staticmethod
    async def warm_dashboard_data(
        cache_service: PerformanceCacheService,
        user_id: str,
        dashboard_id: str
    ):
        """Warm common dashboard data"""
        keys_to_warm = [
            DashboardCacheKeys.user_dashboard(user_id, dashboard_id),
            DashboardCacheKeys.market_summary("1h"),
            DashboardCacheKeys.market_summary("24h"),
            DashboardCacheKeys.analytics_metrics("1d", "1h"),
            DashboardCacheKeys.analytics_metrics("7d", "1d"),
        ]
        
        # Load function for each key type
        async def load_dashboard_data(key: str):
            if ":market_summary:" in key:
                # Load market summary data
                timeframe = key.split(":")[-1]
                # Return mock data - replace with actual data loader
                return {"market_summary": f"data_for_{timeframe}"}
            elif ":analytics_metrics:" in key:
                # Load analytics metrics
                parts = key.split(":")
                timeframe, granularity = parts[-2], parts[-1]
                return {"metrics": f"analytics_{timeframe}_{granularity}"}
            else:
                # Load dashboard configuration
                return {"dashboard_config": f"config_for_{dashboard_id}"}
        
        await cache_service.warm_cache(keys_to_warm, load_dashboard_data)
    
    @staticmethod
    async def warm_market_data(
        cache_service: PerformanceCacheService,
        markets: List[str],
        timeframes: List[str] = None
    ):
        """Warm market data for all zones and timeframes"""
        if timeframes is None:
            timeframes = ["1h", "4h", "24h", "7d"]
        
        keys_to_warm = []
        for market in markets:
            for timeframe in timeframes:
                keys_to_warm.append(
                    DashboardCacheKeys.market_data(market, timeframe)
                )
        
        async def load_market_data(key: str):
            parts = key.split(":")
            market_zone, timeframe = parts[-2], parts[-1]
            return {
                "prices": [100.5, 102.3, 98.7],
                "volume": [1200, 1300, 1100],
                "timestamp": datetime.utcnow().isoformat()
            }
        
        await cache_service.warm_cache(keys_to_warm, load_market_data)


# Singleton instance
_cache_service_instance: Optional[PerformanceCacheService] = None


async def get_cache_service() -> PerformanceCacheService:
    """Get or create cache service instance"""
    global _cache_service_instance
    
    if _cache_service_instance is None:
        _cache_service_instance = PerformanceCacheService()
        await _cache_service_instance.initialize()
    
    return _cache_service_instance


async def shutdown_cache_service():
    """Shutdown cache service instance"""
    global _cache_service_instance
    
    if _cache_service_instance:
        await _cache_service_instance.close()
        _cache_service_instance = None