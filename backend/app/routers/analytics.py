"""
ClickHouse Analytics Router for high-performance analytical queries.
Provides materialized views, complex aggregations, and real-time analytics APIs.
"""

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import JSONResponse
from typing import List, Optional
from datetime import datetime, timedelta
from ..services.clickhouse_service import clickhouse_service
from ..core.config import get_settings

router = APIRouter(prefix="/api/analytics", tags=["clickhouse"])
settings = get_settings()


@router.get("/market-analytics")
async def get_market_analytics(
    market_zone: str = Query(..., description="Market zone identifier"),
    start_date: str = Query(..., description="Start date in ISO format (YYYY-MM-DD)"),
    end_date: str = Query(..., description="End date in ISO format (YYYY-MM-DD)"),
    granularity: str = Query("hour", description="Data granularity: hour, day, minute")
):
    """
    Get comprehensive market analytics for a time range.
    
    - **market_zone**: Target market zone (e.g., "MUMBAI", "DELHI")
    - **start_date**: Start date in ISO format (YYYY-MM-DD)
    - **end_date**: End date in ISO format (YYYY-MM-DD)
    - **granularity**: Data granularity (hour, day, minute)
    """
    try:
        # Parse dates
        start_dt = datetime.fromisoformat(start_date)
        end_dt = datetime.fromisoformat(end_date)
        
        # Validate inputs
        if start_dt >= end_dt:
            raise HTTPException(status_code=400, detail="Start date must be before end date")
        
        if end_dt - start_dt > timedelta(days=365):
            raise HTTPException(status_code=400, detail="Date range cannot exceed 365 days")
        
        # Get analytics
        result = await clickhouse_service.get_market_analytics(
            market_zone=market_zone,
            start_date=start_dt,
            end_date=end_dt,
            granularity=granularity
        )
        
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        
        return JSONResponse(content=result)
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid date format: {str(e)}")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/anomaly-detection")
async def get_anomaly_detection(
    market_zone: str = Query(..., description="Market zone identifier"),
    start_date: str = Query(..., description="Start date in ISO format (YYYY-MM-DD)"),
    end_date: str = Query(..., description="End date in ISO format (YYYY-MM-DD)"),
    threshold: float = Query(2.5, description="Z-score threshold for anomaly detection")
):
    """
    Detect price and volume anomalies using statistical analysis.
    
    - **market_zone**: Target market zone
    - **start_date**: Start date in ISO format
    - **end_date**: End date in ISO format
    - **threshold**: Z-score threshold (default: 2.5 for 95% confidence)
    """
    try:
        start_dt = datetime.fromisoformat(start_date)
        end_dt = datetime.fromisoformat(end_date)
        
        if start_dt >= end_dt:
            raise HTTPException(status_code=400, detail="Start date must be before end date")
        
        if threshold <= 0 or threshold > 5:
            raise HTTPException(status_code=400, detail="Threshold must be between 0 and 5")
        
        result = await clickhouse_service.get_anomaly_detection(
            market_zone=market_zone,
            start_date=start_dt,
            end_date=end_dt,
            threshold=threshold
        )
        
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        
        return JSONResponse(content=result)
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid date format: {str(e)}")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/cross-market-analysis")
async def get_cross_market_analysis(
    start_date: str = Query(..., description="Start date in ISO format (YYYY-MM-DD)"),
    end_date: str = Query(..., description="End date in ISO format (YYYY-MM-DD)"),
    correlation_window: int = Query(24, description="Correlation window in hours")
):
    """
    Analyze correlations and patterns across multiple market zones.
    
    - **start_date**: Start date in ISO format
    - **end_date**: End date in ISO format
    - **correlation_window**: Window for correlation calculation (hours)
    """
    try:
        start_dt = datetime.fromisoformat(start_date)
        end_dt = datetime.fromisoformat(end_date)
        
        if start_dt >= end_dt:
            raise HTTPException(status_code=400, detail="Start date must be before end date")
        
        if correlation_window < 1 or correlation_window > 168:  # Max 1 week
            raise HTTPException(status_code=400, detail="Correlation window must be between 1 and 168 hours")
        
        result = await clickhouse_service.get_cross_market_analysis(
            start_date=start_dt,
            end_date=end_dt,
            correlation_window=correlation_window
        )
        
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        
        return JSONResponse(content=result)
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid date format: {str(e)}")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/real-time-kpis")
async def get_real_time_kpis(
    market_zones: str = Query(..., description="Comma-separated list of market zones"),
    time_window: int = Query(60, description="Time window in minutes (max: 1440)")
):
    """
    Get real-time KPIs for multiple market zones.
    
    - **market_zones**: Comma-separated list of market zones (e.g., "MUMBAI,DELHI,BANGALORE")
    - **time_window**: Time window in minutes (default: 60, max: 1440)
    """
    try:
        zones_list = [zone.strip().upper() for zone in market_zones.split(",")]
        
        if len(zones_list) == 0:
            raise HTTPException(status_code=400, detail="At least one market zone required")
        
        if len(zones_list) > 20:
            raise HTTPException(status_code=400, detail="Maximum 20 market zones allowed")
        
        if time_window < 1 or time_window > 1440:
            raise HTTPException(status_code=400, detail="Time window must be between 1 and 1440 minutes")
        
        result = await clickhouse_service.get_real_time_kpis(
            market_zones=zones_list,
            time_window_minutes=time_window
        )
        
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        
        return JSONResponse(content=result)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/materialized-views")
async def create_materialized_views():
    """
    Create materialized views for common analytics queries.
    
    This endpoint creates materialized views for:
    - Hourly market data aggregation
    - Daily KPI aggregation  
    - Price anomaly detection
    """
    try:
        await clickhouse_service.create_materialized_views()
        
        return JSONResponse(content={
            "success": True,
            "message": "Materialized views created successfully",
            "views_created": [
                "hourly_market_agg",
                "daily_kpi_agg", 
                "price_anomalies"
            ],
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create materialized views: {str(e)}")


@router.get("/health")
async def get_analytics_health():
    """
    Check ClickHouse analytics service health.
    """
    try:
        # Test connection
        await clickhouse_service.initialize()
        
        return JSONResponse(content={
            "status": "healthy",
            "service": "ClickHouse Analytics",
            "timestamp": datetime.now().isoformat(),
            "features": [
                "market_analytics",
                "anomaly_detection", 
                "cross_market_analysis",
                "real_time_kpis"
            ]
        })
        
    except Exception as e:
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "service": "ClickHouse Analytics", 
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
        )


@router.get("/schema")
async def get_analytics_schema():
    """
    Get the analytics database schema information.
    """
    return JSONResponse(content={
        "database": "ClickHouse Analytics",
        "tables": {
            "market_data_raw": {
                "description": "Raw market data from real-time streaming",
                "columns": [
                    "timestamp TIMESTAMP",
                    "market_zone VARCHAR",
                    "price DECIMAL",
                    "volume BIGINT",
                    "created_at TIMESTAMP DEFAULT NOW()"
                ]
            },
            "hourly_market_data": {
                "description": "Hourly aggregated market data",
                "columns": [
                    "hour TIMESTAMP",
                    "market_zone VARCHAR",
                    "avg_price DECIMAL",
                    "min_price DECIMAL", 
                    "max_price DECIMAL",
                    "total_volume BIGINT",
                    "record_count BIGINT",
                    "price_volatility DECIMAL"
                ]
            },
            "daily_kpi_data": {
                "description": "Daily KPI aggregations",
                "columns": [
                    "day DATE",
                    "market_zone VARCHAR",
                    "daily_avg_price DECIMAL",
                    "day_open_price DECIMAL",
                    "day_close_price DECIMAL",
                    "daily_high DECIMAL",
                    "daily_low DECIMAL", 
                    "daily_volume BIGINT",
                    "trading_count BIGINT",
                    "avg_volume_per_trade DECIMAL"
                ]
            },
            "anomaly_data": {
                "description": "Real-time anomaly detection results",
                "columns": [
                    "timestamp TIMESTAMP",
                    "market_zone VARCHAR",
                    "price DECIMAL",
                    "volume BIGINT",
                    "price_zscore DECIMAL",
                    "volume_zscore DECIMAL"
                ]
            }
        },
        "materialized_views": [
            "hourly_market_agg",
            "daily_kpi_agg",
            "price_anomalies"
        ],
        "features": {
            "real_time_analytics": "Sub-second query performance",
            "large_dataset_support": "Optimized for billions of rows",
            "complex_queries": "Aggregations, window functions, joins",
            "time_series_optimization": "Specialized for time-series data"
        }
    })
