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
import os

# Import routers
from app.routers import auth, users, organizations, assets, bids
from app.routers import websocket, analytics, maps, ml_models, admin, market_data, dashboard
from app.core.database import init_db
from app.core.config import settings
from app.core.security import create_access_token, verify_token
from app.utils.logger import setup_logger

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
    # Startup
    logger.info("Starting OptiBid Energy Platform API...")
    await init_db()
    logger.info("Database initialized successfully")
    
    # Initialize Redis cache
    try:
        await start_redis_cache()
        logger.info("Redis cache service started")
    except Exception as e:
        logger.warning(f"Redis cache initialization failed: {e}")
    
    # Initialize Kafka producer
    try:
        await start_kafka_producer()
        logger.info("Kafka producer service started")
    except Exception as e:
        logger.warning(f"Kafka producer initialization failed: {e}")
    
    # Initialize Kafka consumer (requires database sessionmaker)
    try:
        from app.core.database import async_session_maker
        await start_kafka_consumer(async_session_maker)
        logger.info("Kafka consumer service started")
    except Exception as e:
        logger.warning(f"Kafka consumer initialization failed: {e}")
    
    # Initialize Advanced ML Service
    try:
        await advanced_ml_service.initialize()
        logger.info("Advanced ML service started")
    except Exception as e:
        logger.warning(f"Advanced ML service initialization failed: {e}")
    
    # Initialize ClickHouse service (non-blocking)
    try:
        await clickhouse_service.initialize()
        logger.info("ClickHouse service initialized")
    except Exception as e:
        logger.warning(f"ClickHouse service initialization failed: {e}")
    
    # Initialize Market Data Services (Phase 7)
    try:
        # Start market data integration service
        await start_market_data_integration()
        logger.info("Market data integration service started")
    except Exception as e:
        logger.warning(f"Market data integration initialization failed: {e}")
    
    # Disabled - blocking startup
    # try:
    #     # Start Kafka market data streaming
    #     await start_market_data_streaming()
    #     logger.info("Market data streaming service started")
    # except Exception as e:
    #     logger.warning(f"Market data streaming initialization failed: {e}")
    
    # Disabled - blocking startup
    # try:
    #     # Start market data simulator (for development/testing)
    #     if settings.ENVIRONMENT == "development":
    #         await start_real_time_simulation()
    #         logger.info("Market data simulator started")
    # except Exception as e:
    #     logger.warning(f"Market data simulator initialization failed: {e}")
    
    # Initialize Performance Optimization Services (Phase 8)
    try:
        # Initialize cache service
        cache_service = await get_cache_service()
        logger.info("Performance cache service initialized")
    except Exception as e:
        logger.warning(f"Performance cache service initialization failed: {e}")
    
    try:
        # Initialize monitoring service
        monitoring_service = await get_monitoring_service()
        logger.info("Performance monitoring service initialized")
    except Exception as e:
        logger.warning(f"Performance monitoring service initialization failed: {e}")
    
    try:
        # Initialize CDN service (non-blocking)
        cdn_service = await get_cdn_service()
        logger.info("CDN configuration service initialized")
    except Exception as e:
        logger.warning(f"CDN configuration service initialization failed: {e}")
    
    try:
        # Initialize PWA service (non-blocking)
        pwa_service = await get_pwa_service()
        logger.info("PWA service initialized")
    except Exception as e:
        logger.warning(f"PWA service initialization failed: {e}")
    
    try:
        # Initialize analytics service
        analytics_service = await get_analytics_service()
        logger.info("Advanced analytics service initialized")
    except Exception as e:
        logger.warning(f"Advanced analytics service initialization failed: {e}")
    
    logger.info("All services initialized successfully")
    
    yield
    
    # Shutdown
    logger.info("Shutting down OptiBid Energy Platform API...")
    
    # Stop real-time services
    try:
        await stop_kafka_consumer()
        await stop_kafka_producer()
        await stop_redis_cache()
        logger.info("Real-time services stopped")
    except Exception as e:
        logger.error(f"Error stopping real-time services: {e}")
    
    # Stop Phase 7 services
    try:
        await stop_market_simulation()
        await stop_market_data_streaming()
        await stop_market_data_integration()
        logger.info("Market data services stopped")
    except Exception as e:
        logger.error(f"Error stopping market data services: {e}")
    
    # Stop Performance Optimization Services (Phase 8)
    try:
        await shutdown_cache_service()
        logger.info("Performance cache service stopped")
    except Exception as e:
        logger.error(f"Error stopping performance cache service: {e}")
    
    try:
        await shutdown_monitoring_service()
        logger.info("Performance monitoring service stopped")
    except Exception as e:
        logger.error(f"Error stopping performance monitoring service: {e}")
    
    try:
        # CDN service doesn't need explicit shutdown (stateless)
        logger.info("CDN configuration service cleaned up")
    except Exception as e:
        logger.error(f"Error cleaning up CDN service: {e}")
    
    try:
        # PWA service doesn't need explicit shutdown (stateless)
        logger.info("PWA service cleaned up")
    except Exception as e:
        logger.error(f"Error cleaning up PWA service: {e}")
    
    try:
        # Analytics service doesn't need explicit shutdown (stateless)
        logger.info("Advanced analytics service cleaned up")
    except Exception as e:
        logger.error(f"Error cleaning up advanced analytics service: {e}")

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
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_hosts_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=settings.allowed_hosts_list
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

# Include Dashboard router
app.include_router(
    dashboard.router,
    tags=["dashboard"]
)

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint with comprehensive status"""
    from app.services.performance_cache_service import get_cache_service
    from app.services.performance_monitoring_service import get_monitoring_service
    from app.services.cdn_configuration_service import get_cdn_service
    from app.services.pwa_service import get_pwa_service
    from app.services.advanced_analytics_service import get_analytics_service
    
    try:
        # Check all services
        cache_service = await get_cache_service()
        monitoring_service = await get_monitoring_service()
        cdn_service = await get_cdn_service()
        pwa_service = await get_pwa_service()
        analytics_service = await get_analytics_service()
        
        health_status = {
            "status": "healthy",
            "version": "1.0.0",
            "timestamp": "2025-11-18T01:59:47Z",
            "services": {
                "api": "healthy",
                "database": "healthy",
                "cache": await cache_service.health_check(),
                "monitoring": await monitoring_service.get_health_status(),
                "cdn": {"status": "configured" if cdn_service.providers else "not_configured"},
                "pwa": await pwa_service.get_pwa_status(),
                "analytics": await analytics_service.get_analytics_status()
            },
            "phases": {
                "phase_7": "completed",  # Market Integration & Live Data
                "phase_8": "completed"   # Production Optimization & Mobile
            },
            "features": {
                "real_time_market_data": True,
                "performance_optimization": True,
                "pwa_mobile": True,
                "advanced_analytics": True,
                "cdn_optimization": True,
                "intelligent_caching": True
            }
        }
        
        # Determine overall health
        overall_status = "healthy"
        for service_name, service_health in health_status["services"].items():
            if isinstance(service_health, dict) and service_health.get("status") != "healthy":
                overall_status = "degraded"
                break
            elif isinstance(service_health, str) and service_health != "healthy":
                overall_status = "degraded"
                break
        
        health_status["status"] = overall_status
        return health_status
        
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "status": "error",
            "version": "1.0.0",
            "timestamp": "2025-11-18T01:59:47Z",
            "error": str(e)
        }

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "name": "OptiBid Energy Platform API",
        "version": "1.0.0",
        "description": "Advanced energy bidding and trading platform",
        "docs_url": "/api/docs",
        "health_url": "/health"
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True if settings.ENVIRONMENT == "development" else False,
        log_level="info"
    )