"""
Service Health Check Utility
Provides health check functions for all system services
"""

import asyncio
import logging
from typing import Dict, Any, Optional
from datetime import datetime
from enum import Enum

logger = logging.getLogger(__name__)


class ServiceStatus(str, Enum):
    """Service status enumeration"""
    AVAILABLE = "available"
    UNAVAILABLE = "unavailable"
    DEGRADED = "degraded"


class HealthCheckResult:
    """Structured health check result"""
    
    def __init__(
        self,
        status: ServiceStatus,
        message: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
        error: Optional[str] = None
    ):
        self.status = status
        self.message = message
        self.details = details or {}
        self.error = error
        self.timestamp = datetime.utcnow().isoformat() + "Z"
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        result = {
            "status": self.status.value,
            "timestamp": self.timestamp
        }
        if self.message:
            result["message"] = self.message
        if self.details:
            result["details"] = self.details
        if self.error:
            result["error"] = self.error
        return result


async def check_database_health(timeout: float = 5.0, include_migrations: bool = False) -> HealthCheckResult:
    """
    Check PostgreSQL database health
    
    Args:
        timeout: Maximum time to wait for health check
        include_migrations: Whether to include migration status
        
    Returns:
        HealthCheckResult with database status
    """
    try:
        from app.core.database import AsyncSessionLocal
        from sqlalchemy import text
        
        async def _check():
            async with AsyncSessionLocal() as session:
                result = await session.execute(text("SELECT 1"))
                connection_ok = result.scalar() == 1
                
                migration_status = None
                if include_migrations and connection_ok:
                    try:
                        from app.utils.migration_tracker import migration_tracker
                        migration_status = await migration_tracker.get_migration_status(session)
                    except Exception as e:
                        logger.warning(f"Failed to get migration status: {e}")
                        migration_status = {"error": str(e)}
                
                return connection_ok, migration_status
        
        connection_ok, migration_status = await asyncio.wait_for(_check(), timeout=timeout)
        
        if connection_ok:
            details = {"connection": "active"}
            if migration_status:
                details["migrations"] = migration_status
            
            return HealthCheckResult(
                status=ServiceStatus.AVAILABLE,
                message="Database connection successful",
                details=details
            )
        else:
            return HealthCheckResult(
                status=ServiceStatus.DEGRADED,
                message="Database query returned unexpected result",
                details={"connection": "degraded"}
            )
            
    except asyncio.TimeoutError:
        return HealthCheckResult(
            status=ServiceStatus.UNAVAILABLE,
            message="Database health check timed out",
            error=f"Timeout after {timeout} seconds"
        )
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return HealthCheckResult(
            status=ServiceStatus.UNAVAILABLE,
            message="Database connection failed",
            error=str(e)
        )


async def check_redis_health(timeout: float = 3.0) -> HealthCheckResult:
    """
    Check Redis cache health
    
    Args:
        timeout: Maximum time to wait for health check
        
    Returns:
        HealthCheckResult with Redis status
    """
    try:
        from app.core.config import settings
        
        if not settings.ENABLE_REDIS:
            return HealthCheckResult(
                status=ServiceStatus.UNAVAILABLE,
                message="Redis is disabled via configuration",
                details={"enabled": False}
            )
        
        from app.services.redis_cache import redis_cache
        
        async def _check():
            # Try to ping Redis
            if redis_cache.redis_client:
                await redis_cache.redis_client.ping()
                return True
            return False
        
        result = await asyncio.wait_for(_check(), timeout=timeout)
        
        if result:
            return HealthCheckResult(
                status=ServiceStatus.AVAILABLE,
                message="Redis connection successful",
                details={"connection": "active"}
            )
        else:
            return HealthCheckResult(
                status=ServiceStatus.UNAVAILABLE,
                message="Redis client not initialized",
                details={"connection": "not_initialized"}
            )
            
    except asyncio.TimeoutError:
        return HealthCheckResult(
            status=ServiceStatus.UNAVAILABLE,
            message="Redis health check timed out",
            error=f"Timeout after {timeout} seconds"
        )
    except Exception as e:
        logger.error(f"Redis health check failed: {e}")
        return HealthCheckResult(
            status=ServiceStatus.UNAVAILABLE,
            message="Redis connection failed",
            error=str(e)
        )


async def check_kafka_health(timeout: float = 3.0) -> HealthCheckResult:
    """
    Check Kafka streaming health
    
    Args:
        timeout: Maximum time to wait for health check
        
    Returns:
        HealthCheckResult with Kafka status
    """
    try:
        from app.core.config import settings
        
        if not settings.ENABLE_KAFKA:
            return HealthCheckResult(
                status=ServiceStatus.UNAVAILABLE,
                message="Kafka is disabled via configuration",
                details={"enabled": False}
            )
        
        from app.services.kafka_producer import kafka_producer
        
        async def _check():
            # Check if Kafka producer is initialized
            if kafka_producer.producer:
                return True
            return False
        
        result = await asyncio.wait_for(_check(), timeout=timeout)
        
        if result:
            return HealthCheckResult(
                status=ServiceStatus.AVAILABLE,
                message="Kafka connection successful",
                details={"connection": "active"}
            )
        else:
            return HealthCheckResult(
                status=ServiceStatus.UNAVAILABLE,
                message="Kafka producer not initialized",
                details={"connection": "not_initialized"}
            )
            
    except asyncio.TimeoutError:
        return HealthCheckResult(
            status=ServiceStatus.UNAVAILABLE,
            message="Kafka health check timed out",
            error=f"Timeout after {timeout} seconds"
        )
    except Exception as e:
        logger.error(f"Kafka health check failed: {e}")
        return HealthCheckResult(
            status=ServiceStatus.UNAVAILABLE,
            message="Kafka connection failed",
            error=str(e)
        )


async def check_clickhouse_health(timeout: float = 5.0) -> HealthCheckResult:
    """
    Check ClickHouse analytics database health
    
    Args:
        timeout: Maximum time to wait for health check
        
    Returns:
        HealthCheckResult with ClickHouse status
    """
    try:
        from app.core.config import settings
        
        if not settings.ENABLE_CLICKHOUSE:
            return HealthCheckResult(
                status=ServiceStatus.UNAVAILABLE,
                message="ClickHouse is disabled via configuration",
                details={"enabled": False}
            )
        
        from app.services.clickhouse_service import clickhouse_service
        
        async def _check():
            # Check if ClickHouse client is initialized
            if clickhouse_service.client:
                # Try a simple query
                result = await clickhouse_service.client.execute("SELECT 1")
                return result is not None
            return False
        
        result = await asyncio.wait_for(_check(), timeout=timeout)
        
        if result:
            return HealthCheckResult(
                status=ServiceStatus.AVAILABLE,
                message="ClickHouse connection successful",
                details={"connection": "active"}
            )
        else:
            return HealthCheckResult(
                status=ServiceStatus.UNAVAILABLE,
                message="ClickHouse client not initialized",
                details={"connection": "not_initialized"}
            )
            
    except asyncio.TimeoutError:
        return HealthCheckResult(
            status=ServiceStatus.UNAVAILABLE,
            message="ClickHouse health check timed out",
            error=f"Timeout after {timeout} seconds"
        )
    except Exception as e:
        logger.error(f"ClickHouse health check failed: {e}")
        return HealthCheckResult(
            status=ServiceStatus.UNAVAILABLE,
            message="ClickHouse connection failed",
            error=str(e)
        )


async def check_mlflow_health(timeout: float = 5.0) -> HealthCheckResult:
    """
    Check MLflow ML tracking service health
    
    Args:
        timeout: Maximum time to wait for health check
        
    Returns:
        HealthCheckResult with MLflow status
    """
    try:
        from app.core.config import settings
        
        if not settings.ENABLE_MLFLOW:
            return HealthCheckResult(
                status=ServiceStatus.UNAVAILABLE,
                message="MLflow is disabled via configuration",
                details={"enabled": False}
            )
        
        from app.services.advanced_ml_service import advanced_ml_service
        
        async def _check():
            # Check if MLflow client is initialized
            if advanced_ml_service.mlflow_client:
                return True
            return False
        
        result = await asyncio.wait_for(_check(), timeout=timeout)
        
        if result:
            return HealthCheckResult(
                status=ServiceStatus.AVAILABLE,
                message="MLflow connection successful",
                details={"connection": "active"}
            )
        else:
            return HealthCheckResult(
                status=ServiceStatus.UNAVAILABLE,
                message="MLflow client not initialized",
                details={"connection": "not_initialized"}
            )
            
    except asyncio.TimeoutError:
        return HealthCheckResult(
            status=ServiceStatus.UNAVAILABLE,
            message="MLflow health check timed out",
            error=f"Timeout after {timeout} seconds"
        )
    except Exception as e:
        logger.error(f"MLflow health check failed: {e}")
        return HealthCheckResult(
            status=ServiceStatus.UNAVAILABLE,
            message="MLflow connection failed",
            error=str(e)
        )


async def check_websocket_health(timeout: float = 3.0) -> HealthCheckResult:
    """
    Check WebSocket service health
    
    Args:
        timeout: Maximum time to wait for health check
        
    Returns:
        HealthCheckResult with WebSocket status
    """
    try:
        from app.core.config import settings
        
        if not settings.ENABLE_WEBSOCKET:
            return HealthCheckResult(
                status=ServiceStatus.UNAVAILABLE,
                message="WebSocket is disabled via configuration",
                details={"enabled": False}
            )
        
        from app.services.websocket_manager import manager
        
        async def _check():
            # Check if WebSocket manager is available
            if manager:
                # Get connection count
                connection_count = len(manager.active_connections)
                return True, connection_count
            return False, 0
        
        result, connection_count = await asyncio.wait_for(_check(), timeout=timeout)
        
        if result:
            return HealthCheckResult(
                status=ServiceStatus.AVAILABLE,
                message="WebSocket service operational",
                details={
                    "active_connections": connection_count,
                    "service": "running"
                }
            )
        else:
            return HealthCheckResult(
                status=ServiceStatus.UNAVAILABLE,
                message="WebSocket manager not initialized",
                details={"service": "not_initialized"}
            )
            
    except asyncio.TimeoutError:
        return HealthCheckResult(
            status=ServiceStatus.UNAVAILABLE,
            message="WebSocket health check timed out",
            error=f"Timeout after {timeout} seconds"
        )
    except Exception as e:
        logger.error(f"WebSocket health check failed: {e}")
        return HealthCheckResult(
            status=ServiceStatus.UNAVAILABLE,
            message="WebSocket service check failed",
            error=str(e)
        )


async def check_all_services(timeout: float = 10.0) -> Dict[str, HealthCheckResult]:
    """
    Check health of all services
    
    Args:
        timeout: Maximum time to wait for all health checks
        
    Returns:
        Dictionary mapping service names to HealthCheckResult objects
    """
    try:
        # Run all health checks concurrently
        results = await asyncio.gather(
            check_database_health(),
            check_redis_health(),
            check_kafka_health(),
            check_clickhouse_health(),
            check_mlflow_health(),
            check_websocket_health(),
            return_exceptions=True
        )
        
        service_names = [
            "database",
            "redis",
            "kafka",
            "clickhouse",
            "mlflow",
            "websocket"
        ]
        
        health_results = {}
        for name, result in zip(service_names, results):
            if isinstance(result, Exception):
                health_results[name] = HealthCheckResult(
                    status=ServiceStatus.UNAVAILABLE,
                    message=f"Health check failed with exception",
                    error=str(result)
                )
            else:
                health_results[name] = result
        
        return health_results
        
    except Exception as e:
        logger.error(f"Failed to check all services: {e}")
        return {
            "error": HealthCheckResult(
                status=ServiceStatus.UNAVAILABLE,
                message="Failed to perform health checks",
                error=str(e)
            )
        }


def determine_overall_status(service_results: Dict[str, HealthCheckResult]) -> ServiceStatus:
    """
    Determine overall system status based on individual service statuses
    
    Args:
        service_results: Dictionary of service health check results
        
    Returns:
        Overall system status
    """
    # Database is required - if it's down, system is unhealthy
    if "database" in service_results:
        db_status = service_results["database"].status
        if db_status == ServiceStatus.UNAVAILABLE:
            return ServiceStatus.UNAVAILABLE
    
    # Count service statuses
    available_count = 0
    unavailable_count = 0
    degraded_count = 0
    
    for result in service_results.values():
        if result.status == ServiceStatus.AVAILABLE:
            available_count += 1
        elif result.status == ServiceStatus.UNAVAILABLE:
            unavailable_count += 1
        elif result.status == ServiceStatus.DEGRADED:
            degraded_count += 1
    
    # If any service is degraded or some are unavailable (but not all), system is degraded
    if degraded_count > 0 or (unavailable_count > 0 and available_count > 0):
        return ServiceStatus.DEGRADED
    
    # If all services are available, system is healthy
    if unavailable_count == 0:
        return ServiceStatus.AVAILABLE
    
    # Otherwise, system is unavailable
    return ServiceStatus.UNAVAILABLE
