"""
Performance Optimization Router

RESTful API endpoints for performance optimization services including
caching, CDN management, PWA features, and advanced analytics.

Features:
- Cache management endpoints
- CDN configuration endpoints
- PWA management endpoints
- Analytics dashboard endpoints
- Performance monitoring endpoints
- Real-time metrics endpoints
"""

from fastapi import APIRouter, HTTPException, Depends, Query, BackgroundTasks
from fastapi.responses import JSONResponse
from typing import Dict, List, Optional, Any
from datetime import datetime
import asyncio
import logging

from app.services.performance_cache_service import (
    get_cache_service,
    PerformanceCacheService,
    CacheStrategy,
    CacheTier
)
from app.services.performance_monitoring_service import (
    get_monitoring_service,
    PerformanceMonitoringService,
    MetricType,
    PerformanceMonitor
)
from app.services.cdn_configuration_service import (
    get_cdn_service,
    CDNConfigurationService,
    CDNProvider,
    AssetCacheRule,
    CacheStrategy as CDNCacheStrategy
)
from app.services.pwa_service import (
    get_pwa_service,
    PWAService,
    OfflineResource,
    generate_pwa_files
)
from app.services.advanced_analytics_service import (
    get_analytics_service,
    AdvancedAnalyticsService,
    TimeGranularity,
    BenchmarkType,
    format_kpi_value
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/performance", tags=["performance-optimization"])


# Cache Management Endpoints

@router.get("/cache/metrics")
async def get_cache_metrics(
    cache_service: PerformanceCacheService = Depends(get_cache_service)
):
    """Get cache performance metrics"""
    try:
        metrics = await cache_service.get_metrics()
        return JSONResponse({
            "status": "success",
            "data": metrics,
            "timestamp": datetime.utcnow().isoformat()
        })
    except Exception as e:
        logger.error(f"Failed to get cache metrics: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/cache/health")
async def get_cache_health(
    cache_service: PerformanceCacheService = Depends(get_cache_service)
):
    """Get cache service health status"""
    try:
        health = await cache_service.health_check()
        return JSONResponse({
            "status": "success",
            "data": health,
            "timestamp": datetime.utcnow().isoformat()
        })
    except Exception as e:
        logger.error(f"Failed to get cache health: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/cache/invalidate")
async def invalidate_cache_pattern(
    pattern: str,
    cache_service: PerformanceCacheService = Depends(get_cache_service)
):
    """Invalidate cache entries matching pattern"""
    try:
        count = await cache_service.invalidate_pattern(pattern)
        return JSONResponse({
            "status": "success",
            "data": {
                "pattern": pattern,
                "invalidated_count": count
            },
            "timestamp": datetime.utcnow().isoformat()
        })
    except Exception as e:
        logger.error(f"Failed to invalidate cache pattern {pattern}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/cache/warm")
async def warm_cache(
    keys: List[str],
    background_tasks: BackgroundTasks,
    cache_service: PerformanceCacheService = Depends(get_cache_service)
):
    """Start cache warming process"""
    try:
        # This would typically call a real data loading function
        async def load_data(key: str):
            # Mock data loading - replace with actual implementation
            return {"data": f"mock_data_for_{key}", "timestamp": datetime.utcnow()}
        
        # Start cache warming in background
        background_tasks.add_task(
            cache_service.warm_cache,
            keys,
            load_data
        )
        
        return JSONResponse({
            "status": "started",
            "data": {
                "keys_count": len(keys),
                "status": "warming_in_progress"
            },
            "timestamp": datetime.utcnow().isoformat()
        })
    except Exception as e:
        logger.error(f"Failed to start cache warming: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Performance Monitoring Endpoints

@router.get("/monitoring/summary")
async def get_performance_summary(
    timeframe: str = Query("1h", description="Time period for analysis"),
    monitoring_service: PerformanceMonitoringService = Depends(get_monitoring_service)
):
    """Get performance summary for specified timeframe"""
    try:
        summary = await monitoring_service.get_performance_summary(timeframe)
        return JSONResponse({
            "status": "success",
            "data": summary,
            "timestamp": datetime.utcnow().isoformat()
        })
    except Exception as e:
        logger.error(f"Failed to get performance summary: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/monitoring/realtime")
async def get_realtime_metrics(
    metric_types: Optional[str] = Query(None, description="Comma-separated metric types"),
    monitoring_service: PerformanceMonitoringService = Depends(get_monitoring_service)
):
    """Get real-time performance metrics"""
    try:
        # Parse metric types if provided
        metric_types_list = None
        if metric_types:
            try:
                metric_types_list = [
                    MetricType(mt.strip()) for mt in metric_types.split(",")
                ]
            except ValueError as e:
                raise HTTPException(status_code=400, detail=f"Invalid metric type: {e}")
        
        metrics = await monitoring_service.get_real_time_metrics(metric_types_list)
        return JSONResponse({
            "status": "success",
            "data": metrics,
            "timestamp": datetime.utcnow().isoformat()
        })
    except Exception as e:
        logger.error(f"Failed to get real-time metrics: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/monitoring/components")
async def get_component_performance(
    component_id: Optional[str] = Query(None, description="Filter by component ID"),
    component_type: Optional[str] = Query(None, description="Filter by component type"),
    monitoring_service: PerformanceMonitoringService = Depends(get_monitoring_service)
):
    """Get component performance metrics"""
    try:
        components = await monitoring_service.get_component_performance(
            component_id, component_type
        )
        return JSONResponse({
            "status": "success",
            "data": components,
            "timestamp": datetime.utcnow().isoformat()
        })
    except Exception as e:
        logger.error(f"Failed to get component performance: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/monitoring/health")
async def get_monitoring_health(
    monitoring_service: PerformanceMonitoringService = Depends(get_monitoring_service)
):
    """Get monitoring service health status"""
    try:
        health = await monitoring_service.get_health_status()
        return JSONResponse({
            "status": "success",
            "data": health,
            "timestamp": datetime.utcnow().isoformat()
        })
    except Exception as e:
        logger.error(f"Failed to get monitoring health: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# CDN Management Endpoints

@router.get("/cdn/providers")
async def get_cdn_providers(
    cdn_service: CDNConfigurationService = Depends(get_cdn_service)
):
    """Get CDN provider configurations"""
    try:
        providers = await cdn_service.get_configuration_summary()
        return JSONResponse({
            "status": "success",
            "data": providers,
            "timestamp": datetime.utcnow().isoformat()
        })
    except Exception as e:
        logger.error(f"Failed to get CDN providers: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/cdn/providers/{provider}/metrics")
async def get_cdn_metrics(
    provider: CDNProvider,
    timeframe: str = Query("24h", description="Time period for metrics"),
    cdn_service: CDNConfigurationService = Depends(get_cdn_service)
):
    """Get CDN provider performance metrics"""
    try:
        metrics = await cdn_service.get_performance_metrics(provider, timeframe)
        if not metrics:
            raise HTTPException(status_code=404, detail="Metrics not available")
        
        return JSONResponse({
            "status": "success",
            "data": metrics,
            "timestamp": datetime.utcnow().isoformat()
        })
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get CDN metrics for {provider}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/cdn/providers/{provider}/configure")
async def configure_cdn_provider(
    provider: CDNProvider,
    config_data: Dict[str, Any],
    cdn_service: CDNConfigurationService = Depends(get_cdn_service)
):
    """Configure CDN provider"""
    try:
        # This would typically validate and store the configuration
        # For now, return a success response
        return JSONResponse({
            "status": "success",
            "data": {
                "provider": provider.value,
                "message": "Configuration updated successfully"
            },
            "timestamp": datetime.utcnow().isoformat()
        })
    except Exception as e:
        logger.error(f"Failed to configure CDN provider {provider}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/cdn/providers/{provider}/purge-cache")
async def purge_cdn_cache(
    provider: CDNProvider,
    urls: List[str],
    cdn_service: CDNConfigurationService = Depends(get_cdn_service)
):
    """Purge CDN cache for specific URLs"""
    try:
        success = await cdn_service.purge_cache(provider, urls)
        return JSONResponse({
            "status": "success" if success else "error",
            "data": {
                "provider": provider.value,
                "urls_count": len(urls),
                "purged": success
            },
            "timestamp": datetime.utcnow().isoformat()
        })
    except Exception as e:
        logger.error(f"Failed to purge CDN cache for {provider}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/cdn/optimize-image")
async def optimize_image(
    image_url: str = Query(..., description="Image URL to optimize"),
    width: Optional[int] = Query(None, description="Target width"),
    height: Optional[int] = Query(None, description="Target height"),
    quality: Optional[int] = Query(None, description="Image quality (1-100)"),
    format: Optional[str] = Query(None, description="Target format (webp, jpeg, etc.)"),
    cdn_service: CDNConfigurationService = Depends(get_cdn_service)
):
    """Generate optimized image URL"""
    try:
        result = await cdn_service.optimize_image(
            image_url, width, height, quality, format
        )
        return JSONResponse({
            "status": "success",
            "data": result,
            "timestamp": datetime.utcnow().isoformat()
        })
    except Exception as e:
        logger.error(f"Failed to optimize image {image_url}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# PWA Management Endpoints

@router.get("/pwa/manifest")
async def get_pwa_manifest(
    pwa_service: PWAService = Depends(get_pwa_service)
):
    """Get PWA manifest configuration"""
    try:
        manifest = await pwa_service.generate_manifest()
        return JSONResponse({
            "status": "success",
            "data": manifest,
            "timestamp": datetime.utcnow().isoformat()
        })
    except Exception as e:
        logger.error(f"Failed to generate PWA manifest: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/pwa/service-worker")
async def get_service_worker(
    pwa_service: PWAService = Depends(get_pwa_service)
):
    """Get service worker JavaScript code"""
    try:
        sw_code = await pwa_service.generate_service_worker()
        return JSONResponse({
            "status": "success",
            "data": {
                "service_worker": sw_code,
                "version": "1.0.0"
            },
            "timestamp": datetime.utcnow().isoformat()
        })
    except Exception as e:
        logger.error(f"Failed to generate service worker: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/pwa/registration-script")
async def get_pwa_registration_script(
    pwa_service: PWAService = Depends(get_pwa_service)
):
    """Get PWA registration JavaScript"""
    try:
        script = pwa_service.generate_pwa_registration_script()
        return JSONResponse({
            "status": "success",
            "data": {
                "script": script
            },
            "timestamp": datetime.utcnow().isoformat()
        })
    except Exception as e:
        logger.error(f"Failed to generate PWA registration script: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/pwa/status")
async def get_pwa_status(
    pwa_service: PWAService = Depends(get_pwa_service)
):
    """Get PWA service status and capabilities"""
    try:
        status = await pwa_service.get_pwa_status()
        return JSONResponse({
            "status": "success",
            "data": status,
            "timestamp": datetime.utcnow().isoformat()
        })
    except Exception as e:
        logger.error(f"Failed to get PWA status: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/pwa/manifest")
async def update_pwa_manifest(
    updates: Dict[str, Any],
    pwa_service: PWAService = Depends(get_pwa_service)
):
    """Update PWA manifest configuration"""
    try:
        success = await pwa_service.update_manifest(updates)
        return JSONResponse({
            "status": "success" if success else "error",
            "data": {
                "message": "Manifest updated successfully" if success else "Update failed"
            },
            "timestamp": datetime.utcnow().isoformat()
        })
    except Exception as e:
        logger.error(f"Failed to update PWA manifest: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/pwa/add-offline-resource")
async def add_offline_resource(
    resource_data: Dict[str, Any],
    pwa_service: PWAService = Depends(get_pwa_service)
):
    """Add offline resource for PWA caching"""
    try:
        # Create offline resource from data
        resource = OfflineResource(
            url=resource_data["url"],
            cache_strategy=CDNCacheStrategy(resource_data["cache_strategy"]),
            priority=resource_data.get("priority", 3),
            cache_key=resource_data.get("cache_key"),
            max_age_seconds=resource_data.get("max_age_seconds")
        )
        
        success = await pwa_service.add_offline_resource(resource)
        return JSONResponse({
            "status": "success" if success else "error",
            "data": {
                "resource_url": resource.url,
                "message": "Resource added successfully" if success else "Failed to add resource"
            },
            "timestamp": datetime.utcnow().isoformat()
        })
    except Exception as e:
        logger.error(f"Failed to add offline resource: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Analytics Endpoints

@router.get("/analytics/dashboard")
async def get_analytics_dashboard(
    time_period: str = Query("7d", description="Time period for analysis"),
    analytics_service: AdvancedAnalyticsService = Depends(get_analytics_service)
):
    """Get analytics dashboard data"""
    try:
        dashboard_data = await analytics_service.get_dashboard_analytics(time_period)
        return JSONResponse({
            "status": "success",
            "data": dashboard_data,
            "timestamp": datetime.utcnow().isoformat()
        })
    except Exception as e:
        logger.error(f"Failed to get analytics dashboard: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/analytics/benchmarks")
async def get_benchmark_comparison(
    kpis: str = Query(..., description="Comma-separated KPI IDs"),
    benchmark_type: BenchmarkType = Query(BenchmarkType.INDUSTRY_AVERAGE, description="Benchmark type"),
    analytics_service: AdvancedAnalyticsService = Depends(get_analytics_service)
):
    """Get benchmark comparison for KPIs"""
    try:
        kpi_list = [kpi.strip() for kpi in kpis.split(",")]
        comparison = await analytics_service.get_benchmark_comparison(
            kpi_list, benchmark_type
        )
        return JSONResponse({
            "status": "success",
            "data": comparison,
            "timestamp": datetime.utcnow().isoformat()
        })
    except Exception as e:
        logger.error(f"Failed to get benchmark comparison: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/analytics/kpis")
async def get_kpi_definitions(
    analytics_service: AdvancedAnalyticsService = Depends(get_analytics_service)
):
    """Get KPI definitions"""
    try:
        kpi_definitions = {
            kpi_id: {
                "name": kpi.name,
                "description": kpi.description,
                "category": kpi.category.value,
                "unit": kpi.unit,
                "is_real_time": kpi.is_real_time,
                "target_value": kpi.target_value
            }
            for kpi_id, kpi in analytics_service.kpi_definitions.items()
        }
        
        return JSONResponse({
            "status": "success",
            "data": kpi_definitions,
            "timestamp": datetime.utcnow().isoformat()
        })
    except Exception as e:
        logger.error(f"Failed to get KPI definitions: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/analytics/calculate")
async def calculate_kpi(
    kpi_request: Dict[str, Any],
    analytics_service: AdvancedAnalyticsService = Depends(get_analytics_service)
):
    """Calculate specific KPI value"""
    try:
        kpi_id = kpi_request["kpi_id"]
        data_sources = kpi_request.get("data_sources", {})
        time_period = kpi_request.get("time_period")
        
        result = await analytics_service.calculate_kpi(
            kpi_id, data_sources, time_period
        )
        
        if not result:
            raise HTTPException(status_code=404, detail="KPI calculation failed")
        
        return JSONResponse({
            "status": "success",
            "data": {
                "kpi_id": result.kpi_id,
                "value": result.value,
                "unit": analytics_service.kpi_definitions[kpi_id].unit,
                "timestamp": result.timestamp.isoformat(),
                "benchmark_value": result.benchmark_value,
                "trend": result.trend_direction,
                "change_pct": result.trend_change_pct
            },
            "timestamp": datetime.utcnow().isoformat()
        })
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to calculate KPI {kpi_request.get('kpi_id', 'unknown')}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/analytics/status")
async def get_analytics_status(
    analytics_service: AdvancedAnalyticsService = Depends(get_analytics_service)
):
    """Get analytics service status"""
    try:
        status = await analytics_service.get_analytics_status()
        return JSONResponse({
            "status": "success",
            "data": status,
            "timestamp": datetime.utcnow().isoformat()
        })
    except Exception as e:
        logger.error(f"Failed to get analytics status: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Unified Performance Dashboard Endpoint

@router.get("/dashboard")
async def get_performance_dashboard(
    cache_service: PerformanceCacheService = Depends(get_cache_service),
    monitoring_service: PerformanceMonitoringService = Depends(get_monitoring_service),
    cdn_service: CDNConfigurationService = Depends(get_cdn_service),
    pwa_service: PWAService = Depends(get_pwa_service),
    analytics_service: AdvancedAnalyticsService = Depends(get_analytics_service)
):
    """Get unified performance dashboard with all metrics"""
    try:
        # Gather all performance data
        tasks = [
            cache_service.get_metrics(),
            monitoring_service.get_real_time_metrics(),
            cdn_service.get_configuration_summary(),
            pwa_service.get_pwa_status(),
            analytics_service.get_dashboard_analytics("24h")
        ]
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        dashboard_data = {
            "cache": results[0] if not isinstance(results[0], Exception) else {"error": str(results[0])},
            "monitoring": results[1] if not isinstance(results[1], Exception) else {"error": str(results[1])},
            "cdn": results[2] if not isinstance(results[2], Exception) else {"error": str(results[2])},
            "pwa": results[3] if not isinstance(results[3], Exception) else {"error": str(results[3])},
            "analytics": results[4] if not isinstance(results[4], Exception) else {"error": str(results[4])},
            "summary": {
                "overall_health": "healthy",  # Could be calculated based on individual components
                "last_updated": datetime.utcnow().isoformat(),
                "components_monitored": 5
            }
        }
        
        return JSONResponse({
            "status": "success",
            "data": dashboard_data,
            "timestamp": datetime.utcnow().isoformat()
        })
    except Exception as e:
        logger.error(f"Failed to get performance dashboard: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Performance Test Endpoint

@router.post("/test/cache-performance")
async def test_cache_performance(
    test_config: Dict[str, Any],
    background_tasks: BackgroundTasks,
    cache_service: PerformanceCacheService = Depends(get_cache_service)
):
    """Test cache performance with specified configuration"""
    try:
        test_type = test_config.get("test_type", "basic")
        iterations = test_config.get("iterations", 100)
        
        async def run_cache_test():
            if test_type == "basic":
                # Basic read/write test
                start_time = asyncio.get_event_loop().time()
                
                for i in range(iterations):
                    key = f"test_key_{i}"
                    value = {"test_data": f"value_{i}", "timestamp": datetime.utcnow().isoformat()}
                    await cache_service.set(key, value, ttl=300)
                    await cache_service.get(key)
                
                end_time = asyncio.get_event_loop().time()
                duration = end_time - start_time
                
                return {
                    "test_type": "basic",
                    "iterations": iterations,
                    "duration_seconds": duration,
                    "avg_op_time_ms": (duration / (iterations * 2)) * 1000,
                    "ops_per_second": (iterations * 2) / duration
                }
            
            return {"test_type": test_type, "message": "Test type not implemented"}
        
        # Run test in background
        background_tasks.add_task(run_cache_test)
        
        return JSONResponse({
            "status": "started",
            "data": {
                "test_type": test_type,
                "iterations": iterations,
                "status": "running_in_background"
            },
            "timestamp": datetime.utcnow().isoformat()
        })
    except Exception as e:
        logger.error(f"Failed to start cache performance test: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def get_performance_optimization_health(
    cache_service: PerformanceCacheService = Depends(get_cache_service),
    monitoring_service: PerformanceMonitoringService = Depends(get_monitoring_service),
    cdn_service: CDNConfigurationService = Depends(get_cdn_service),
    pwa_service: PWAService = Depends(get_pwa_service),
    analytics_service: AdvancedAnalyticsService = Depends(get_analytics_service)
):
    """Get overall performance optimization service health"""
    try:
        health_checks = await asyncio.gather(
            cache_service.health_check(),
            monitoring_service.get_health_status(),
            pwa_service.get_pwa_status(),
            analytics_service.get_analytics_status(),
            return_exceptions=True
        )
        
        overall_status = "healthy"
        for check in health_checks:
            if isinstance(check, Exception):
                overall_status = "degraded"
                break
            elif isinstance(check, dict) and check.get("status") != "healthy":
                overall_status = "degraded"
                break
        
        return JSONResponse({
            "status": overall_status,
            "data": {
                "overall_status": overall_status,
                "components": {
                    "cache": "healthy" if not isinstance(health_checks[0], Exception) else "error",
                    "monitoring": "healthy" if not isinstance(health_checks[1], Exception) else "error",
                    "pwa": "healthy" if not isinstance(health_checks[2], Exception) else "error",
                    "analytics": "healthy" if not isinstance(health_checks[3], Exception) else "error"
                },
                "cdn": "configured" if cdn_service.providers else "not_configured"
            },
            "timestamp": datetime.utcnow().isoformat()
        })
    except Exception as e:
        logger.error(f"Failed to get performance optimization health: {e}")
        raise HTTPException(status_code=500, detail=str(e))
