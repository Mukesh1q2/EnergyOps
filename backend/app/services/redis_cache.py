"""
Redis Cache Service for Market Data and Session Management
Provides fast caching for frequently accessed data
"""

import json
import logging
from datetime import datetime, timedelta
from typing import Any, Dict, Optional, Union
from uuid import UUID

import redis.asyncio as redis
from pydantic import BaseModel

logger = logging.getLogger(__name__)


class RedisCacheService:
    """Redis cache service for storing market data and session information"""
    
    def __init__(self, redis_url: str = "redis://localhost:6379/0"):
        self.redis_url = redis_url
        self.redis_client: Optional[redis.Redis] = None
        self.is_connected = False
        
    async def initialize(self):
        """Initialize Redis connection"""
        try:
            self.redis_client = redis.from_url(
                self.redis_url,
                decode_responses=True,
                encoding='utf-8',
                socket_connect_timeout=5,
                socket_timeout=5,
                retry_on_timeout=True
            )
            
            # Test connection
            await self.redis_client.ping()
            self.is_connected = True
            logger.info("Redis cache service initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize Redis client: {e}")
            raise
    
    async def set(self, key: str, value: Union[str, int, float, dict, list], expire_seconds: Optional[int] = None) -> bool:
        """Set a key-value pair in Redis with optional expiration"""
        if not self.is_connected or not self.redis_client:
            logger.warning("Redis not connected, caching disabled")
            return False
        
        try:
            if isinstance(value, (dict, list)):
                value = json.dumps(value, default=str)
            
            if expire_seconds:
                await self.redis_client.setex(key, expire_seconds, value)
            else:
                await self.redis_client.set(key, value)
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to set key {key} in Redis: {e}")
            return False
    
    async def get(self, key: str, decode_json: bool = True) -> Optional[Any]:
        """Get a value from Redis"""
        if not self.is_connected or not self.redis_client:
            logger.warning("Redis not connected, caching disabled")
            return None
        
        try:
            value = await self.redis_client.get(key)
            if value is None:
                return None
            
            if decode_json:
                try:
                    return json.loads(value)
                except json.JSONDecodeError:
                    return value
            else:
                return value
                
        except Exception as e:
            logger.error(f"Failed to get key {key} from Redis: {e}")
            return None
    
    async def delete(self, key: str) -> bool:
        """Delete a key from Redis"""
        if not self.is_connected or not self.redis_client:
            return False
        
        try:
            result = await self.redis_client.delete(key)
            return result > 0
            
        except Exception as e:
            logger.error(f"Failed to delete key {key} from Redis: {e}")
            return False
    
    async def exists(self, key: str) -> bool:
        """Check if a key exists in Redis"""
        if not self.is_connected or not self.redis_client:
            return False
        
        try:
            result = await self.redis_client.exists(key)
            return result > 0
            
        except Exception as e:
            logger.error(f"Failed to check existence of key {key}: {e}")
            return False
    
    async def expire(self, key: str, seconds: int) -> bool:
        """Set expiration for a key"""
        if not self.is_connected or not self.redis_client:
            return False
        
        try:
            result = await self.redis_client.expire(key, seconds)
            return result
            
        except Exception as e:
            logger.error(f"Failed to set expiration for key {key}: {e}")
            return False
    
    # Market Data Caching Methods
    
    async def cache_market_data(self, market_zone: str, timestamp: datetime, data: Dict[str, Any], expire_seconds: int = 300):
        """Cache market data for a specific zone and timestamp"""
        key = f"market_data:{market_zone}:{timestamp.isoformat()}"
        return await self.set(key, data, expire_seconds)
    
    async def get_market_data(self, market_zone: str, timestamp: datetime) -> Optional[Dict[str, Any]]:
        """Get cached market data"""
        key = f"market_data:{market_zone}:{timestamp.isoformat()}"
        return await self.get(key)
    
    async def cache_latest_price(self, market_zone: str, price_data: Dict[str, Any], expire_seconds: int = 60):
        """Cache the latest price for a market zone"""
        key = f"latest_price:{market_zone}"
        return await self.set(key, price_data, expire_seconds)
    
    async def get_latest_price(self, market_zone: str) -> Optional[Dict[str, Any]]:
        """Get the latest cached price for a market zone"""
        key = f"latest_price:{market_zone}"
        return await self.get(key)
    
    async def cache_price_history(self, market_zone: str, hours: int, price_data: list, expire_seconds: int = 600):
        """Cache price history for a market zone"""
        key = f"price_history:{market_zone}:{hours}h"
        return await self.set(key, price_data, expire_seconds)
    
    async def get_price_history(self, market_zone: str, hours: int) -> Optional[list]:
        """Get cached price history"""
        key = f"price_history:{market_zone}:{hours}h"
        return await self.get(key)
    
    # Session and User Management
    
    async def cache_user_session(self, user_id: UUID, session_data: Dict[str, Any], expire_seconds: int = 3600):
        """Cache user session data"""
        key = f"session:user:{user_id}"
        return await self.set(key, session_data, expire_seconds)
    
    async def get_user_session(self, user_id: UUID) -> Optional[Dict[str, Any]]:
        """Get cached user session"""
        key = f"session:user:{user_id}"
        return await self.get(key)
    
    async def invalidate_user_session(self, user_id: UUID):
        """Invalidate user session"""
        key = f"session:user:{user_id}"
        await self.delete(key)
    
    # WebSocket Connection Management
    
    async def cache_websocket_connection(self, connection_id: str, market_zone: str, user_id: Optional[UUID] = None, expire_seconds: int = 3600):
        """Cache WebSocket connection information"""
        connection_data = {
            'connection_id': connection_id,
            'market_zone': market_zone,
            'user_id': str(user_id) if user_id else None,
            'created_at': datetime.utcnow().isoformat()
        }
        key = f"websocket:{connection_id}"
        return await self.set(key, connection_data, expire_seconds)
    
    async def get_websocket_connection(self, connection_id: str) -> Optional[Dict[str, Any]]:
        """Get WebSocket connection information"""
        key = f"websocket:{connection_id}"
        return await self.get(key)
    
    async def invalidate_websocket_connection(self, connection_id: str):
        """Invalidate WebSocket connection"""
        key = f"websocket:{connection_id}"
        await self.delete(key)
    
    async def get_connections_by_market_zone(self, market_zone: str) -> list:
        """Get all active connections for a market zone"""
        if not self.is_connected or not self.redis_client:
            return []
        
        try:
            pattern = f"websocket:*"
            keys = await self.redis_client.keys(pattern)
            connections = []
            
            for key in keys:
                connection_data = await self.get(key.replace('websocket:', ''))
                if connection_data and connection_data.get('market_zone') == market_zone:
                    connections.append(connection_data)
            
            return connections
            
        except Exception as e:
            logger.error(f"Failed to get connections for market zone {market_zone}: {e}")
            return []
    
    async def close(self):
        """Close Redis connection"""
        if self.redis_client:
            await self.redis_client.close()
            self.is_connected = False
            logger.info("Redis connection closed")


# Global Redis cache instance
redis_cache = RedisCacheService()


async def start_redis_cache():
    """Start the Redis cache service"""
    await redis_cache.initialize()


async def stop_redis_cache():
    """Stop the Redis cache service"""
    await redis_cache.close()