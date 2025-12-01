"""
Usage Tracking Service
Handles real-time usage tracking, rate limiting, and quota management
"""
import asyncio
import json
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from uuid import UUID, uuid4
from collections import defaultdict, deque

import asyncpg
import redis.asyncio as redis
from fastapi import HTTPException, status
from pydantic import BaseModel, Field


class UsageEvent(BaseModel):
    """Usage event for tracking"""
    id: UUID = Field(default_factory=uuid4)
    organization_id: UUID
    user_id: Optional[UUID] = None
    event_type: str  # api_call, dashboard_view, export, etc.
    resource_id: Optional[UUID] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    billing_period_start: datetime
    billing_period_end: datetime


class RateLimitConfig(BaseModel):
    """Rate limiting configuration"""
    organization_id: UUID
    endpoint_pattern: str  # e.g., "/api/*", "/dashboards/*"
    limit_per_hour: int = 1000
    limit_per_day: int = 10000
    burst_limit: int = 100
    window_size_minutes: int = 60
    enabled: bool = True


class QuotaStatus(BaseModel):
    """Quota status for an organization"""
    organization_id: UUID
    resource_type: str
    quota_limit: Optional[int] = None
    current_usage: int
    period_start: datetime
    period_end: datetime
    percentage_used: float
    status: str  # ok, warning, exceeded
    reset_time: datetime


class UsageTrackingService:
    """Comprehensive usage tracking and rate limiting service"""
    
    def __init__(self, db_pool: asyncpg.Pool, redis_pool: redis.Redis, billing_service):
        self.db_pool = db_pool
        self.redis_pool = redis_pool
        self.billing_service = billing_service
        self._rate_limit_configs: Dict[str, RateLimitConfig] = {}
        self._quota_cache = {}
    
    async def initialize(self):
        """Initialize usage tracking service and create required database tables"""
        async with self.db_pool.acquire() as conn:
            # Create usage_events table for detailed tracking
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS usage_events (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    organization_id UUID NOT NULL REFERENCES organizations(id),
                    user_id UUID REFERENCES users(id),
                    event_type VARCHAR(100) NOT NULL,
                    resource_id UUID,
                    metadata JSONB NOT NULL DEFAULT '{}',
                    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    billing_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
                    billing_period_end TIMESTAMP WITH TIME ZONE NOT NULL
                )
            """)
            
            # Create rate_limit_configs table
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS rate_limit_configs (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    organization_id UUID NOT NULL REFERENCES organizations(id),
                    endpoint_pattern VARCHAR(255) NOT NULL,
                    limit_per_hour INTEGER NOT NULL DEFAULT 1000,
                    limit_per_day INTEGER NOT NULL DEFAULT 10000,
                    burst_limit INTEGER NOT NULL DEFAULT 100,
                    window_size_minutes INTEGER NOT NULL DEFAULT 60,
                    enabled BOOLEAN NOT NULL DEFAULT true,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    UNIQUE(organization_id, endpoint_pattern)
                )
            """)
            
            # Create quota_status table for tracking current usage
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS quota_status (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    organization_id UUID NOT NULL REFERENCES organizations(id),
                    resource_type VARCHAR(100) NOT NULL,
                    quota_limit INTEGER,
                    current_usage INTEGER NOT NULL DEFAULT 0,
                    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
                    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
                    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    UNIQUE(organization_id, resource_type, period_start, period_end)
                )
            """)
            
            # Create indexes
            await conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_usage_events_org_time 
                ON usage_events(organization_id, timestamp)
            """)
            await conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_usage_events_type_time 
                ON usage_events(event_type, timestamp)
            """)
            await conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_quota_status_org_resource 
                ON quota_status(organization_id, resource_type)
            """)
            
            # Initialize default rate limit configurations
            await self._initialize_default_rate_limits(conn)
    
    async def _initialize_default_rate_limits(self, conn: asyncpg.Connection):
        """Initialize default rate limit configurations"""
        default_configs = [
            {
                "endpoint_pattern": "/api/*",
                "limit_per_hour": 1000,
                "limit_per_day": 10000,
                "burst_limit": 100
            },
            {
                "endpoint_pattern": "/dashboards/*",
                "limit_per_hour": 500,
                "limit_per_day": 5000,
                "burst_limit": 50
            },
            {
                "endpoint_pattern": "/exports/*",
                "limit_per_hour": 100,
                "limit_per_day": 1000,
                "burst_limit": 20
            }
        ]
        
        # These would be applied per organization based on their plan
        for config in default_configs:
            # Store for future organization-specific application
            pass
    
    # Usage Event Tracking
    
    async def track_usage(
        self,
        organization_id: UUID,
        event_type: str,
        user_id: Optional[UUID] = None,
        resource_id: Optional[UUID] = None,
        metadata: Dict[str, Any] = None
    ) -> UsageEvent:
        """Track a usage event"""
        
        # Get current billing period from subscription
        subscription = await self.billing_service.get_subscription(organization_id)
        if not subscription:
            # Default to current month if no subscription
            now = datetime.utcnow()
            period_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            period_end = (period_start + timedelta(days=32)).replace(day=1) - timedelta(seconds=1)
        else:
            period_start = subscription.current_period_start
            period_end = subscription.current_period_end
        
        usage_event = UsageEvent(
            organization_id=organization_id,
            user_id=user_id,
            event_type=event_type,
            resource_id=resource_id,
            metadata=metadata or {},
            billing_period_start=period_start,
            billing_period_end=period_end
        )
        
        # Store in database
        async with self.db_pool.acquire() as conn:
            await conn.execute("""
                INSERT INTO usage_events 
                (organization_id, user_id, event_type, resource_id, metadata,
                 billing_period_start, billing_period_end)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
            """,
                usage_event.organization_id,
                usage_event.user_id,
                usage_event.event_type,
                usage_event.resource_id,
                json.dumps(usage_event.metadata),
                usage_event.billing_period_start,
                usage_event.billing_period_end
            )
        
        # Update quota status in Redis for real-time tracking
        await self._update_quota_in_redis(
            organization_id, event_type, period_start, period_end
        )
        
        # Update quota status in database
        await self._update_quota_in_db(
            organization_id, event_type, period_start, period_end
        )
        
        return usage_event
    
    async def _update_quota_in_redis(
        self,
        organization_id: UUID,
        event_type: str,
        period_start: datetime,
        period_end: datetime
    ):
        """Update quota status in Redis for real-time tracking"""
        period_key = f"usage:{organization_id}:{event_type}:{period_start.date()}"
        
        async with self.redis_pool as redis_client:
            # Increment usage count for today
            await redis_client.incr(period_key)
            
            # Set expiration to end of billing period
            ttl = int((period_end - datetime.utcnow()).total_seconds())
            if ttl > 0:
                await redis_client.expire(period_key, ttl)
    
    async def _update_quota_in_db(
        self,
        organization_id: UUID,
        event_type: str,
        period_start: datetime,
        period_end: datetime
    ):
        """Update quota status in database"""
        async with self.db_pool.acquire() as conn:
            # Get current usage count for this period
            usage_count = await conn.fetchval("""
                SELECT COUNT(*) FROM usage_events
                WHERE organization_id = $1 
                AND event_type = $2 
                AND billing_period_start = $3 
                AND billing_period_end = $4
            """, organization_id, event_type, period_start, period_end)
            
            # Update or insert quota status
            await conn.execute("""
                INSERT INTO quota_status 
                (organization_id, resource_type, current_usage, period_start, period_end)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (organization_id, resource_type, period_start, period_end) 
                DO UPDATE SET
                    current_usage = EXCLUDED.current_usage,
                    last_updated = NOW()
            """, organization_id, event_type, usage_count, period_start, period_end)
    
    async def get_current_usage(
        self,
        organization_id: UUID,
        event_type: str,
        period_start: Optional[datetime] = None,
        period_end: Optional[datetime] = None
    ) -> int:
        """Get current usage count for a specific event type"""
        
        # Get billing period if not provided
        if not period_start or not period_end:
            subscription = await self.billing_service.get_subscription(organization_id)
            if subscription:
                period_start = subscription.current_period_start
                period_end = subscription.current_period_end
            else:
                now = datetime.utcnow()
                period_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
                period_end = (period_start + timedelta(days=32)).replace(day=1) - timedelta(seconds=1)
        
        # Check Redis first for real-time data
        period_key = f"usage:{organization_id}:{event_type}:{period_start.date()}"
        async with self.redis_pool as redis_client:
            redis_value = await redis_client.get(period_key)
            if redis_value:
                return int(redis_value)
        
        # Fallback to database
        async with self.db_pool.acquire() as conn:
            count = await conn.fetchval("""
                SELECT current_usage FROM quota_status
                WHERE organization_id = $1 
                AND resource_type = $2 
                AND period_start = $3 
                AND period_end = $4
            """, organization_id, event_type, period_start, period_end)
        
        return count or 0
    
    # Rate Limiting
    
    async def check_rate_limit(
        self,
        organization_id: UUID,
        endpoint: str,
        user_id: Optional[UUID] = None
    ) -> Tuple[bool, Dict[str, Any]]:
        """Check if request is within rate limits"""
        
        # Get organization rate limit configuration
        config = await self._get_rate_limit_config(organization_id, endpoint)
        
        if not config or not config.enabled:
            return True, {"allowed": True, "reason": "Rate limiting disabled"}
        
        # Check burst limit
        burst_key = f"rate_limit:{organization_id}:{endpoint}:burst"
        async with self.redis_pool as redis_client:
            current_burst = await redis_client.get(burst_key)
            if current_burst and int(current_burst) >= config.burst_limit:
                return False, {
                    "allowed": False,
                    "reason": "Burst limit exceeded",
                    "current": int(current_burst),
                    "limit": config.burst_limit
                }
            
            # Increment burst counter
            await redis_client.incr(burst_key)
            await redis_client.expire(burst_key, 60)  # 1 minute burst window
        
        # Check hourly limit
        hourly_key = f"rate_limit:{organization_id}:{endpoint}:hourly"
        current_hour = datetime.utcnow().hour
        hourly_key += f":{current_hour}"
        
        async with self.redis_pool as redis_client:
            current_hourly = await redis_client.get(hourly_key)
            if current_hourly and int(current_hourly) >= config.limit_per_hour:
                return False, {
                    "allowed": False,
                    "reason": "Hourly limit exceeded",
                    "current": int(current_hourly),
                    "limit": config.limit_per_hour
                }
            
            # Increment hourly counter
            await redis_client.incr(hourly_key)
            await redis_client.expire(hourly_key, 3600)  # 1 hour window
        
        # Check daily limit
        daily_key = f"rate_limit:{organization_id}:{endpoint}:daily"
        current_date = datetime.utcnow().date().isoformat()
        daily_key += f":{current_date}"
        
        async with self.redis_pool as redis_client:
            current_daily = await redis_client.get(daily_key)
            if current_daily and int(current_daily) >= config.limit_per_day:
                return False, {
                    "allowed": False,
                    "reason": "Daily limit exceeded",
                    "current": int(current_daily),
                    "limit": config.limit_per_day
                }
            
            # Increment daily counter
            await redis_client.incr(daily_key)
            await redis_client.expire(daily_key, 86400)  # 24 hour window
        
        return True, {"allowed": True, "reason": "Within limits"}
    
    async def _get_rate_limit_config(
        self,
        organization_id: UUID,
        endpoint: str
    ) -> Optional[RateLimitConfig]:
        """Get rate limit configuration for organization and endpoint"""
        
        # Check cache first
        cache_key = f"{organization_id}:{endpoint}"
        if cache_key in self._rate_limit_configs:
            return self._rate_limit_configs[cache_key]
        
        # Get from database
        async with self.db_pool.acquire() as conn:
            row = await conn.fetchrow("""
                SELECT * FROM rate_limit_configs
                WHERE organization_id = $1 
                AND $2 LIKE endpoint_pattern
                ORDER BY created_at DESC
                LIMIT 1
            """, organization_id, endpoint)
        
        if not row:
            # Use default configuration based on billing plan
            subscription = await self.billing_service.get_subscription(organization_id)
            if subscription:
                plan_def = self.billing_service._plan_definitions[subscription.plan_id]
                default_limit = plan_def.limits.get("api_calls_per_day", 1000)
                
                config = RateLimitConfig(
                    organization_id=organization_id,
                    endpoint_pattern="/api/*",
                    limit_per_hour=default_limit // 24,
                    limit_per_day=default_limit,
                    burst_limit=min(100, default_limit // 100)
                )
            else:
                # Default free tier limits
                config = RateLimitConfig(
                    organization_id=organization_id,
                    endpoint_pattern="/api/*",
                    limit_per_hour=50,
                    limit_per_day=100,
                    burst_limit=10
                )
        else:
            config = RateLimitConfig(
                organization_id=row['organization_id'],
                endpoint_pattern=row['endpoint_pattern'],
                limit_per_hour=row['limit_per_hour'],
                limit_per_day=row['limit_per_day'],
                burst_limit=row['burst_limit'],
                window_size_minutes=row['window_size_minutes'],
                enabled=row['enabled']
            )
        
        # Cache the configuration
        self._rate_limit_configs[cache_key] = config
        return config
    
    # Quota Management
    
    async def get_quota_status(
        self,
        organization_id: UUID,
        user_id: Optional[UUID] = None
    ) -> List[QuotaStatus]:
        """Get current quota status for organization"""
        
        subscription = await self.billing_service.get_subscription(organization_id)
        if not subscription:
            return []
        
        plan_def = self.billing_service._plan_definitions[subscription.plan_id]
        quota_statuses = []
        
        for resource_type, quota_limit in plan_def.limits.items():
            if quota_limit == "unlimited":
                continue
            
            current_usage = await self.get_current_usage(
                organization_id, 
                self._map_resource_type(resource_type)
            )
            
            percentage_used = (current_usage / quota_limit * 100) if quota_limit > 0 else 0
            
            if percentage_used >= 100:
                status = "exceeded"
            elif percentage_used >= 80:
                status = "warning"
            else:
                status = "ok"
            
            quota_statuses.append(QuotaStatus(
                organization_id=organization_id,
                resource_type=resource_type,
                quota_limit=quota_limit,
                current_usage=current_usage,
                period_start=subscription.current_period_start,
                period_end=subscription.current_period_end,
                percentage_used=percentage_used,
                status=status,
                reset_time=subscription.current_period_end
            ))
        
        return quota_statuses
    
    def _map_resource_type(self, resource_type: str) -> str:
        """Map plan resource type to usage event type"""
        mapping = {
            "users": "user_created",
            "storage_gb": "storage_used",
            "api_calls_per_day": "api_call",
            "dashboards": "dashboard_created",
            "exports_per_month": "export"
        }
        return mapping.get(resource_type, resource_type)
    
    async def enforce_quota_limits(
        self,
        organization_id: UUID,
        requested_usage: str,
        user_id: Optional[UUID] = None
    ) -> bool:
        """Enforce quota limits and return True if within limits"""
        
        quota_statuses = await self.get_quota_status(organization_id, user_id)
        
        for quota in quota_statuses:
            if quota.resource_type == requested_usage and quota.status == "exceeded":
                return False
        
        return True
    
    # Analytics and Reporting
    
    async def get_usage_analytics(
        self,
        organization_id: UUID,
        start_date: datetime,
        end_date: datetime,
        user_id: Optional[UUID] = None
    ) -> Dict[str, Any]:
        """Get comprehensive usage analytics"""
        
        async with self.db_pool.acquire() as conn:
            # Get usage by event type
            usage_by_type = await conn.fetch("""
                SELECT event_type, COUNT(*) as count, 
                       DATE_TRUNC('day', timestamp) as date
                FROM usage_events
                WHERE organization_id = $1 
                AND timestamp >= $2 
                AND timestamp <= $3
                GROUP BY event_type, DATE_TRUNC('day', timestamp)
                ORDER BY date, event_type
            """, organization_id, start_date, end_date)
            
            # Get usage by user
            usage_by_user = await conn.fetch("""
                SELECT user_id, event_type, COUNT(*) as count
                FROM usage_events
                WHERE organization_id = $1 
                AND timestamp >= $2 
                AND timestamp <= $3
                AND user_id IS NOT NULL
                GROUP BY user_id, event_type
                ORDER BY count DESC
            """, organization_id, start_date, end_date)
            
            # Get peak usage times
            peak_usage = await conn.fetch("""
                SELECT DATE_TRUNC('hour', timestamp) as hour, COUNT(*) as count
                FROM usage_events
                WHERE organization_id = $1 
                AND timestamp >= $2 
                AND timestamp <= $3
                GROUP BY DATE_TRUNC('hour', timestamp)
                ORDER BY count DESC
                LIMIT 10
            """, organization_id, start_date, end_date)
        
        return {
            "organization_id": organization_id,
            "period": {
                "start_date": start_date,
                "end_date": end_date
            },
            "usage_by_type": [
                {
                    "event_type": row['event_type'],
                    "date": row['date'],
                    "count": row['count']
                }
                for row in usage_by_type
            ],
            "usage_by_user": [
                {
                    "user_id": row['user_id'],
                    "event_type": row['event_type'],
                    "count": row['count']
                }
                for row in usage_by_user
            ],
            "peak_usage_times": [
                {
                    "hour": row['hour'],
                    "count": row['count']
                }
                for row in peak_usage
            ]
        }
    
    async def cleanup_old_usage_data(self, days_to_keep: int = 90) -> int:
        """Clean up old usage data to maintain performance"""
        
        cutoff_date = datetime.utcnow() - timedelta(days=days_to_keep)
        
        async with self.db_pool.acquire() as conn:
            result = await conn.execute("""
                DELETE FROM usage_events 
                WHERE timestamp < $1
            """, cutoff_date)
        
        # Also cleanup Redis data
        pattern = "usage:*"
        async with self.redis_pool as redis_client:
            keys = await redis_client.keys(pattern)
            if keys:
                # Only delete old keys
                current_time = time.time()
                for key in keys:
                    ttl = await redis_client.ttl(key)
                    if ttl == -1:  # No expiration set
                        await redis_client.delete(key)
                    elif ttl > 0 and (current_time + ttl) < (cutoff_date.timestamp()):
                        await redis_client.delete(key)
        
        return int(result.split()[-1])  # Return number of deleted rows


# Dependency injection function
def get_usage_tracking_service(
    db_pool: asyncpg.Pool, 
    redis_pool: redis.Redis, 
    billing_service
) -> UsageTrackingService:
    """Get usage tracking service instance"""
    return UsageTrackingService(db_pool, redis_pool, billing_service)