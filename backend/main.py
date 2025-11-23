# OptiBid Energy Platform - Backend API
# FastAPI-based REST API for energy bidding and trading

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import logging
from contextlib import asynccontextmanager
from datetime import datetime
import os

# Import routers
from app.routers import auth, users, organizations, assets, bids
from app.routers import websocket, analytics, maps, ml_models, admin, market_data
from app.core.database import init_db
from app.core.config import settings
from app.core.security import SecurityManager
from app.utils.logger import setup_logger
from app.core.logging_config import setup_logging as setup_centralized_logging

# Import real-time services
from app.services.kafka_producer import start_kafka_producer, stop_kafka_producer
from app.services.kafka_consumer import start_kafka_consumer, stop_kafka_consumer
from app.services.redis_cache import start_redis_cache, stop_redis_cache

# Import Phase 7 services
from app.services.market_data_integration import start_market_data_integration, stop_market_data_integration
from app.services.kafka_consumer_service import start_market_data_streaming, stop_market_data_streaming
from app.services.market_data_simulator import start_real_time_simulation, stop_market_simulation

# Import Phase 8 services (Performance Optimization & Mobile)
from app.services.performance_cache_service import get_cache_service, shutdown_cache_service
from app.services.performance_monitoring_service import get_monitoring_service, shutdown_monitoring_service
from app.services.cdn_configuration_service import get_cdn_service
from app.services.pwa_service import get_pwa_service
from app.services.advanced_analytics_service import get_analytics_service

# Import performance optimization router
from app.routers.performance_optimization import router as performance_optimization_router

# Import advanced services
from app.services.advanced_ml_service import advanced_ml_service
from app.services.clickhouse_service import clickhouse_service

# Setup logging
logger = setup_logger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    import asyncio
    import time
    
    # Initialize centralized logging first
    setup_centralized_logging()
    
    # Startup
    startup_start_time = time.time()
    logger.info("=" * 60)
    logger.info("Starting OptiBid Energy Platform API...")
    logger.info(f"Startup Time: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    logger.info("=" * 60)
    
    # Track service availability
    service_status = {
        "database": False,
        "redis": False,
        "kafka": False,
        "clickhouse": False,
        "mlflow": False,
        "market_data": False,
        "performance_cache": False,
        "monitoring": False
    }
    
    # Initialize database (REQUIRED)
    try:
        await init_db()
        service_status["database"] = True
        logger.info("✓ Database initialized successfully")
    except Exception as e:
        logger.error(f"✗ Database initialization failed: {e}")
        raise  # Database is required, fail fast
    
    # Initialize Redis cache (OPTIONAL)
    if settings.ENABLE_REDIS:
        try:
            await asyncio.wait_for(start_redis_cache(), timeout=5.0)
            service_status["redis"] = True
            logger.info("✓ Redis cache service started")
        except asyncio.TimeoutError:
            logger.warning("✗ Redis cache initialization timed out after 5 seconds - continuing without Redis")
            logger.info("  → Caching and session features will be limited")
        except Exception as e:
            logger.warning(f"✗ Redis cache initialization failed: {e}")
            logger.info("  → Continuing without Redis - caching and session features will be limited")
    else:
        logger.info("⊘ Redis disabled via ENABLE_REDIS flag")
    
    # Initialize Kafka producer (OPTIONAL)
    if settings.ENABLE_KAFKA:
        try:
            await asyncio.wait_for(start_kafka_producer(), timeout=5.0)
            service_status["kafka"] = True
            logger.info("✓ Kafka producer service started")
        except asyncio.TimeoutError:
            logger.warning("✗ Kafka producer initialization timed out after 5 seconds - continuing without Kafka")
            logger.info("  → Real-time streaming features will be limited")
        except Exception as e:
            logger.warning(f"✗ Kafka producer initialization failed: {e}")
            logger.info("  → Continuing without Kafka - real-time streaming features will be limited")
    else:
        logger.info("⊘ Kafka disabled via ENABLE_KAFKA flag")
    
    # Initialize Kafka consumer (OPTIONAL, requires database sessionmaker)
    if settings.ENABLE_KAFKA:
        try:
            from app.core.database import async_session_maker
            await asyncio.wait_for(start_kafka_consumer(async_session_maker), timeout=5.0)
            logger.info("✓ Kafka consumer service started")
        except asyncio.TimeoutError:
            logger.warning("✗ Kafka consumer initialization timed out after 5 seconds - continuing without Kafka consumer")
            logger.info("  → Market data ingestion will be limited")
        except Exception as e:
            logger.warning(f"✗ Kafka consumer initialization failed: {e}")
            logger.info("  → Continuing without Kafka consumer - market data ingestion will be limited")
    
    # Initialize ClickHouse service (OPTIONAL)
    if settings.ENABLE_CLICKHOUSE:
        try:
            await asyncio.wait_for(clickhouse_service.initialize(), timeout=10.0)
            service_status["clickhouse"] = True
            logger.info("✓ ClickHouse service initialized")
        except asyncio.TimeoutError:
            logger.warning("✗ ClickHouse initialization timed out after 10 seconds - continuing without ClickHouse")
            logger.info("  → Advanced analytics features will be unavailable")
        except Exception as e:
            logger.warning(f"✗ ClickHouse service initialization failed: {e}")
            logger.info("  → Continuing without ClickHouse - advanced analytics features will be unavailable")
    else:
        logger.info("⊘ ClickHouse disabled via ENABLE_CLICKHOUSE flag")
    
    # Initialize Advanced ML Service (OPTIONAL)
    if settings.ENABLE_MLFLOW:
        try:
            await asyncio.wait_for(advanced_ml_service.initialize(), timeout=10.0)
            service_status["mlflow"] = True
            logger.info("✓ Advanced ML service started")
        except asyncio.TimeoutError:
            logger.warning("✗ MLflow initialization timed out after 10 seconds - continuing without MLflow")
            logger.info("  → ML model tracking and management will be unavailable")
        except Exception as e:
            logger.warning(f"✗ Advanced ML service initialization failed: {e}")
            logger.info("  → Continuing without MLflow - ML model tracking and management will be unavailable")
    else:
        logger.info("⊘ MLflow disabled via ENABLE_MLFLOW flag")
    
    # Initialize Market Data Services (OPTIONAL - Phase 7)
    try:
        # Start market data integration service
        await asyncio.wait_for(start_market_data_integration(), timeout=5.0)
        service_status["market_data"] = True
        logger.info("✓ Market data integration service started")
    except asyncio.TimeoutError:
        logger.warning("✗ Market data integration timed out after 5 seconds - continuing without market data integration")
        logger.info("  → External market data feeds will be unavailable")
    except Exception as e:
        logger.warning(f"✗ Market data integration initialization failed: {e}")
        logger.info("  → Continuing without market data integration - external feeds will be unavailable")
    
    # Start Kafka market data streaming (OPTIONAL, depends on Kafka)
    if settings.ENABLE_KAFKA and service_status["kafka"]:
        try:
            await asyncio.wait_for(start_market_data_streaming(), timeout=5.0)
            logger.info("✓ Market data streaming service started")
        except asyncio.TimeoutError:
            logger.warning("✗ Market data streaming timed out after 5 seconds - continuing without streaming")
            logger.info("  → Real-time market data streaming will be unavailable")
        except Exception as e:
            logger.warning(f"✗ Market data streaming initialization failed: {e}")
            logger.info("  → Continuing without market data streaming")
    
    # Start market data simulator (OPTIONAL - development only)
    if settings.ENVIRONMENT == "development" and settings.SIMULATION_MODE:
        try:
            await asyncio.wait_for(start_real_time_simulation(), timeout=5.0)
            logger.info("✓ Market data simulator started (development mode)")
        except asyncio.TimeoutError:
            logger.warning("✗ Market data simulator timed out after 5 seconds - continuing without simulator")
        except Exception as e:
            logger.warning(f"✗ Market data simulator initialization failed: {e}")
            logger.info("  → Continuing without simulator - using static test data")
    
    # Initialize Performance Optimization Services (OPTIONAL - Phase 8)
    try:
        # Initialize cache service (non-blocking)
        cache_service = await asyncio.wait_for(get_cache_service(), timeout=5.0)
        service_status["performance_cache"] = True
        logger.info("✓ Performance cache service initialized")
    except asyncio.TimeoutError:
        logger.warning("✗ Performance cache service timed out after 5 seconds - continuing without performance cache")
        logger.info("  → Performance optimization features will be limited")
    except Exception as e:
        logger.warning(f"✗ Performance cache service initialization failed: {e}")
        logger.info("  → Continuing without performance cache - optimization features will be limited")
    
    try:
        # Initialize monitoring service (non-blocking)
        monitoring_service = await asyncio.wait_for(get_monitoring_service(), timeout=5.0)
        service_status["monitoring"] = True
        logger.info("✓ Performance monitoring service initialized")
    except asyncio.TimeoutError:
        logger.warning("✗ Performance monitoring service timed out after 5 seconds - continuing without monitoring")
        logger.info("  → Performance metrics will be limited")
    except Exception as e:
        logger.warning(f"✗ Performance monitoring service initialization failed: {e}")
        logger.info("  → Continuing without performance monitoring - metrics will be limited")
    
    try:
        # Initialize CDN service (non-blocking, stateless)
        cdn_service = await asyncio.wait_for(get_cdn_service(), timeout=3.0)
        logger.info("✓ CDN configuration service initialized")
    except asyncio.TimeoutError:
        logger.warning("✗ CDN configuration service timed out after 3 seconds - continuing without CDN")
        logger.info("  → CDN optimization will be unavailable")
    except Exception as e:
        logger.warning(f"✗ CDN configuration service initialization failed: {e}")
        logger.info("  → Continuing without CDN configuration")
    
    try:
        # Initialize PWA service (non-blocking, stateless)
        pwa_service = await asyncio.wait_for(get_pwa_service(), timeout=3.0)
        logger.info("✓ PWA service initialized")
    except asyncio.TimeoutError:
        logger.warning("✗ PWA service timed out after 3 seconds - continuing without PWA")
        logger.info("  → Progressive Web App features will be limited")
    except Exception as e:
        logger.warning(f"✗ PWA service initialization failed: {e}")
        logger.info("  → Continuing without PWA service")
    
    try:
        # Initialize analytics service (non-blocking)
        analytics_service = await asyncio.wait_for(get_analytics_service(), timeout=5.0)
        logger.info("✓ Advanced analytics service initialized")
    except asyncio.TimeoutError:
        logger.warning("✗ Advanced analytics service timed out after 5 seconds - continuing without analytics")
        logger.info("  → Advanced analytics features will be limited")
    except Exception as e:
        logger.warning(f"✗ Advanced analytics service initialization failed: {e}")
        logger.info("  → Continuing without advanced analytics")
    
    # Calculate startup duration
    startup_duration = time.time() - startup_start_time
    
    # Startup summary
    logger.info("")
    logger.info("=" * 60)
    logger.info("SERVICE INITIALIZATION SUMMARY")
    logger.info("=" * 60)
    logger.info("")
    logger.info("Core Services:")
    logger.info(f"  Database (REQUIRED):        {'✓ Available' if service_status['database'] else '✗ Unavailable'}")
    logger.info("")
    logger.info("Optional Services:")
    logger.info(f"  Redis Cache:                {'✓ Available' if service_status['redis'] else '✗ Unavailable'}")
    logger.info(f"  Kafka Streaming:            {'✓ Available' if service_status['kafka'] else '✗ Unavailable'}")
    logger.info(f"  ClickHouse Analytics:       {'✓ Available' if service_status['clickhouse'] else '✗ Unavailable'}")
    logger.info(f"  MLflow ML Tracking:         {'✓ Available' if service_status['mlflow'] else '✗ Unavailable'}")
    logger.info(f"  Market Data Integration:    {'✓ Available' if service_status['market_data'] else '✗ Unavailable'}")
    logger.info(f"  Performance Cache:          {'✓ Available' if service_status['performance_cache'] else '✗ Unavailable'}")
    logger.info(f"  Performance Monitoring:     {'✓ Available' if service_status['monitoring'] else '✗ Unavailable'}")
    logger.info("")
    logger.info("Feature Availability:")
    logger.info(f"  Authentication & Core CRUD: {'✓ Available' if service_status['database'] else '✗ Unavailable'}")
    logger.info(f"  Caching & Sessions:         {'✓ Available' if service_status['redis'] else '✗ Limited (in-memory fallback)'}")
    logger.info(f"  Real-time Streaming:        {'✓ Available' if service_status['kafka'] else '✗ Unavailable'}")
    logger.info(f"  Advanced Analytics:         {'✓ Available' if service_status['clickhouse'] else '✗ Unavailable'}")
    logger.info(f"  ML Model Tracking:          {'✓ Available' if service_status['mlflow'] else '✗ Unavailable'}")
    logger.info(f"  Market Data Feeds:          {'✓ Available' if service_status['market_data'] else '✗ Limited (static data)'}")
    logger.info(f"  Performance Optimization:   {'✓ Available' if service_status['performance_cache'] else '✗ Limited'}")
    logger.info(f"  Performance Metrics:        {'✓ Available' if service_status['monitoring'] else '✗ Limited'}")
    logger.info("")
    logger.info("=" * 60)
    logger.info("✓ OptiBid Energy Platform API started successfully")
    logger.info(f"  Services Running: {sum(service_status.values())}/{len(service_status)}")
    logger.info(f"  Startup Duration: {startup_duration:.2f} seconds")
    logger.info(f"  Ready to accept requests at http://0.0.0.0:8000")
    logger.info("=" * 60)
    
    yield
    
    # Shutdown
    shutdown_start_time = time.time()
    logger.info("")
    logger.info("=" * 60)
    logger.info("Shutting down OptiBid Energy Platform API...")
    logger.info(f"Shutdown Time: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}")
    logger.info("=" * 60)
    
    # Stop real-time services (with timeout)
    if settings.ENABLE_KAFKA:
        try:
            await asyncio.wait_for(stop_kafka_consumer(), timeout=5.0)
            logger.info("✓ Kafka consumer stopped")
        except asyncio.TimeoutError:
            logger.warning("✗ Kafka consumer shutdown timed out")
        except Exception as e:
            logger.error(f"✗ Error stopping Kafka consumer: {e}")
        
        try:
            await asyncio.wait_for(stop_kafka_producer(), timeout=5.0)
            logger.info("✓ Kafka producer stopped")
        except asyncio.TimeoutError:
            logger.warning("✗ Kafka producer shutdown timed out")
        except Exception as e:
            logger.error(f"✗ Error stopping Kafka producer: {e}")
    
    if settings.ENABLE_REDIS:
        try:
            await asyncio.wait_for(stop_redis_cache(), timeout=5.0)
            logger.info("✓ Redis cache stopped")
        except asyncio.TimeoutError:
            logger.warning("✗ Redis cache shutdown timed out")
        except Exception as e:
            logger.error(f"✗ Error stopping Redis cache: {e}")
    
    # Stop Phase 7 services (with timeout)
    try:
        await asyncio.wait_for(stop_market_simulation(), timeout=5.0)
        logger.info("✓ Market data simulator stopped")
    except asyncio.TimeoutError:
        logger.warning("✗ Market simulator shutdown timed out")
    except Exception as e:
        logger.error(f"✗ Error stopping market simulator: {e}")
    
    try:
        await asyncio.wait_for(stop_market_data_streaming(), timeout=5.0)
        logger.info("✓ Market data streaming stopped")
    except asyncio.TimeoutError:
        logger.warning("✗ Market data streaming shutdown timed out")
    except Exception as e:
        logger.error(f"✗ Error stopping market data streaming: {e}")
    
    try:
        await asyncio.wait_for(stop_market_data_integration(), timeout=5.0)
        logger.info("✓ Market data integration stopped")
    except asyncio.TimeoutError:
        logger.warning("✗ Market data integration shutdown timed out")
    except Exception as e:
        logger.error(f"✗ Error stopping market data integration: {e}")
    
    # Stop Performance Optimization Services (Phase 8) (with timeout)
    try:
        await asyncio.wait_for(shutdown_cache_service(), timeout=5.0)
        logger.info("✓ Performance cache service stopped")
    except asyncio.TimeoutError:
        logger.warning("✗ Performance cache shutdown timed out")
    except Exception as e:
        logger.error(f"✗ Error stopping performance cache service: {e}")
    
    try:
        await asyncio.wait_for(shutdown_monitoring_service(), timeout=5.0)
        logger.info("✓ Performance monitoring service stopped")
    except asyncio.TimeoutError:
        logger.warning("✗ Performance monitoring shutdown timed out")
    except Exception as e:
        logger.error(f"✗ Error stopping performance monitoring service: {e}")
    
    # Stateless services (no explicit shutdown needed)
    logger.info("✓ CDN configuration service cleaned up")
    logger.info("✓ PWA service cleaned up")
    logger.info("✓ Advanced analytics service cleaned up")
    
    # Calculate shutdown duration
    shutdown_duration = time.time() - shutdown_start_time
    
    logger.info("")
    logger.info("=" * 60)
    logger.info("✓ OptiBid Energy Platform API shutdown complete")
    logger.info(f"  Shutdown Duration: {shutdown_duration:.2f} seconds")
    logger.info("=" * 60)

# Create FastAPI application
app = FastAPI(
    title="OptiBid Energy Platform API",
    description="Advanced energy bidding and trading platform with AI-powered optimization",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan
)

# Add middleware
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Parse ALLOWED_HOSTS from comma-separated string to list
allowed_hosts_list = [host.strip() for host in settings.ALLOWED_HOSTS.split(",")]
# Add wildcard for development
if settings.DEBUG:
    allowed_hosts_list.append("*")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_hosts_list if not settings.DEBUG else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security middleware - only in production
if not settings.DEBUG:
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=allowed_hosts_list
    )

# Exception handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Custom HTTP exception handler"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": exc.status_code,
                "message": exc.detail,
                "type": "http_exception"
            }
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """General exception handler"""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": {
                "code": 500,
                "message": "Internal server error",
                "type": "internal_error"
            }
        }
    )

# Include routers
app.include_router(
    auth.router,
    prefix="/api",
    tags=["authentication"]
)

app.include_router(
    users.router,
    prefix="/api/users",
    tags=["users"]
)

app.include_router(
    organizations.router,
    prefix="/api/organizations",
    tags=["organizations"]
)

app.include_router(
    assets.router,
    prefix="/api/assets",
    tags=["assets"]
)

app.include_router(
    bids.router,
    prefix="/api/bids",
    tags=["bids"]
)

# Include WebSocket router
app.include_router(
    websocket.router,
    prefix="/api/ws",
    tags=["websocket"]
)

# Include Analytics router (ClickHouse)
app.include_router(
    analytics.router,
    tags=["analytics"]
)

# Include Google Maps router
app.include_router(
    maps.router,
    tags=["maps"]
)

# Include ML Models router
app.include_router(
    ml_models.router,
    tags=["ml-models"]
)

# Include Admin router
app.include_router(
    admin.admin_router,
    tags=["admin"]
)

# Include Market Data router (Phase 7)
app.include_router(
    market_data.router,
    tags=["market-data"]
)

# Include Performance Optimization router (Phase 8)
app.include_router(
    performance_optimization_router,
    tags=["performance-optimization"]
)

# Health check endpoint
@app.get("/health")
async def health_check(include_migrations: bool = False):
    """
    Comprehensive health check endpoint
    
    Query Parameters:
        include_migrations: Include database migration status (default: False)
    
    Returns detailed status of all services including:
    - Individual service health (available/unavailable/degraded)
    - Error messages for unavailable services
    - Overall system status
    - Timestamp and version information
    - Feature availability flags
    - Performance metrics when available
    - Migration status (if requested)
    """
    from app.utils.health_check import (
        check_all_services,
        check_database_health,
        determine_overall_status,
        ServiceStatus
    )
    from datetime import datetime
    
    try:
        # Check all services
        service_results = await check_all_services()
        
        # If migrations requested, update database health with migration info
        if include_migrations:
            service_results["database"] = await check_database_health(include_migrations=True)
        
        # Convert results to response format
        services_status = {}
        for service_name, result in service_results.items():
            services_status[service_name] = result.to_dict()
        
        # Determine overall status
        overall_status = determine_overall_status(service_results)
        
        # Build feature availability flags based on service status
        features = {
            "authentication": service_results.get("database", None) and 
                            service_results["database"].status == ServiceStatus.AVAILABLE,
            "real_time_updates": service_results.get("websocket", None) and 
                               service_results["websocket"].status == ServiceStatus.AVAILABLE,
            "caching": service_results.get("redis", None) and 
                      service_results["redis"].status == ServiceStatus.AVAILABLE,
            "streaming": service_results.get("kafka", None) and 
                        service_results["kafka"].status == ServiceStatus.AVAILABLE,
            "advanced_analytics": service_results.get("clickhouse", None) and 
                                service_results["clickhouse"].status == ServiceStatus.AVAILABLE,
            "ml_tracking": service_results.get("mlflow", None) and 
                          service_results["mlflow"].status == ServiceStatus.AVAILABLE,
        }
        
        # Count available services
        available_services = sum(
            1 for result in service_results.values() 
            if result.status == ServiceStatus.AVAILABLE
        )
        total_services = len(service_results)
        
        # Build response
        health_response = {
            "status": overall_status.value,
            "version": settings.VERSION,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "environment": settings.ENVIRONMENT,
            "services": services_status,
            "features": features,
            "summary": {
                "available_services": available_services,
                "total_services": total_services,
                "availability_percentage": round((available_services / total_services) * 100, 2) if total_services > 0 else 0
            }
        }
        
        # Add performance metrics if monitoring service is available
        try:
            from app.services.performance_monitoring_service import get_monitoring_service
            monitoring_service = await get_monitoring_service()
            metrics = await monitoring_service.get_health_status()
            if metrics:
                health_response["performance"] = metrics
        except Exception as e:
            logger.debug(f"Could not fetch performance metrics: {e}")
        
        return health_response
        
    except Exception as e:
        logger.error(f"Health check failed: {e}", exc_info=True)
        return {
            "status": ServiceStatus.UNAVAILABLE.value,
            "version": settings.VERSION,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "error": {
                "message": "Health check system failure",
                "details": str(e)
            }
        }

# Migration status endpoints
@app.get("/migrations/status")
async def get_migration_status():
    """
    Get database migration status
    
    Returns:
        - Current migration version
        - Total available and applied migrations
        - Pending migrations
        - Failed migrations
        - Migration history
    """
    from app.core.database import AsyncSessionLocal
    from app.utils.migration_tracker import migration_tracker
    
    try:
        async with AsyncSessionLocal() as session:
            status = await migration_tracker.get_migration_status(session)
            return status
    except Exception as e:
        logger.error(f"Failed to get migration status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get migration status: {str(e)}"
        )


@app.get("/migrations/history")
async def get_migration_history(limit: int = 10):
    """
    Get migration history
    
    Query Parameters:
        limit: Maximum number of migrations to return (default: 10)
    
    Returns:
        List of recently applied migrations with execution details
    """
    from app.core.database import AsyncSessionLocal
    from app.utils.migration_tracker import migration_tracker
    
    try:
        async with AsyncSessionLocal() as session:
            history = await migration_tracker.get_migration_history(session, limit=limit)
            return {
                "history": history,
                "count": len(history),
                "limit": limit
            }
    except Exception as e:
        logger.error(f"Failed to get migration history: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get migration history: {str(e)}"
        )


@app.post("/migrations/run")
async def run_migrations(dry_run: bool = False):
    """
    Run pending database migrations
    
    Query Parameters:
        dry_run: If true, show what would be executed without actually running (default: False)
    
    Returns:
        Migration execution results
    
    Note:
        - Only available in development environment
        - In production, migrations should be run manually via scripts
    """
    from app.core.database import AsyncSessionLocal
    from app.utils.migration_runner import migration_runner
    
    # Safety check - only allow in development
    if settings.ENVIRONMENT != "development":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Automatic migrations are only allowed in development environment. "
                   "In production, run migrations manually using migration scripts."
        )
    
    try:
        async with AsyncSessionLocal() as session:
            result = await migration_runner.run_pending_migrations(session, dry_run=dry_run)
            return result
    except Exception as e:
        logger.error(f"Failed to run migrations: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to run migrations: {str(e)}"
        )


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "name": "OptiBid Energy Platform API",
        "version": "1.0.0",
        "description": "Advanced energy bidding and trading platform",
        "docs_url": "/api/docs",
        "health_url": "/health",
        "migration_status_url": "/migrations/status",
        "migration_history_url": "/migrations/history"
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True if settings.ENVIRONMENT == "development" else False,
        log_level="info"
    )
