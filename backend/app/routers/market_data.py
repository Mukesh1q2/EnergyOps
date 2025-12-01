"""
Market Data API Endpoints
Provides RESTful APIs for market data access, queries, and analytics
"""

import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Union
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from ..services.market_data_integration import market_data_service, MarketPrice, MarketZone
from ..services.kafka_consumer_service import market_data_stream_manager
from ..core.database import get_db
from ..crud.market_data import market_data_crud

router = APIRouter(prefix="/api/v1/market-data", tags=["Market Data"])


# Pydantic models for API requests/responses
class MarketPriceResponse(BaseModel):
    timestamp: datetime
    market_zone: str
    price_type: str
    location: str
    price: float
    volume: float
    congestion_cost: Optional[float] = None
    loss_cost: Optional[float] = None
    renewable_percentage: Optional[float] = None
    load_forecast: Optional[float] = None


class MarketMetricsResponse(BaseModel):
    market_zone: str
    current_price: float
    avg_price: float
    max_price: float
    min_price: float
    price_volatility: float
    total_volume: float
    avg_volume: float
    renewable_percentage: Optional[float] = None
    record_count: int
    timestamp: datetime
    change_24h: Optional[float] = None
    change_24h_percent: Optional[float] = None


class MarketSummaryResponse(BaseModel):
    market_zone: str
    zones_covered: int
    total_volume: float
    avg_price: float
    peak_price: float
    renewable_percentage: float
    last_updated: datetime
    data_freshness_minutes: int


class PriceQueryRequest(BaseModel):
    market_zone: Optional[MarketZone] = Field(None, description="Filter by market zone")
    price_type: Optional[str] = Field(None, description="Filter by price type (RT_LMP, DA_LMP)")
    location: Optional[str] = Field(None, description="Filter by location/node")
    start_time: Optional[datetime] = Field(None, description="Start time for historical data")
    end_time: Optional[datetime] = Field(None, description="End time for historical data")
    limit: int = Field(1000, ge=1, le=10000, description="Maximum number of records")
    sort_by: str = Field("timestamp", description="Sort field")
    sort_order: str = Field("desc", pattern="^(asc|desc)$", description="Sort order")


class AnalyticsRequest(BaseModel):
    market_zone: MarketZone
    start_date: datetime
    end_date: datetime
    aggregation: str = Field("hour", pattern="^(hour|day|week|month)$")
    metrics: List[str] = Field(["avg", "min", "max", "volatility"])


class BackfillRequest(BaseModel):
    start_date: datetime
    end_date: datetime
    market_zones: List[MarketZone] = Field(..., description="Market zones to backfill")
    skip_existing: bool = Field(True, description="Skip existing data")


# API Endpoints

@router.get("/health", response_model=Dict[str, str])
async def get_market_data_health():
    """Health check for market data services"""
    try:
        # Check Kafka connection
        consumer_stats = await market_data_stream_manager.consumers.get("market_data_processor-0", {}).get_processing_stats() if market_data_stream_manager.consumers else {}
        
        return {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "kafka_connection": "connected" if market_data_stream_manager.admin_client else "disconnected",
            "processing_stats": consumer_stats
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }


@router.get("/summary", response_model=Dict[str, MarketSummaryResponse])
async def get_market_summary():
    """Get summary of all market data"""
    try:
        summary = {}
        
        for zone in MarketZone:
            # Get latest data for each zone
            latest_prices = await market_data_service.get_latest_prices(zone)
            
            if latest_prices:
                # Calculate summary metrics
                total_volume = latest_prices.volume
                avg_price = latest_prices.price
                peak_price = latest_prices.price
                renewable_pct = latest_prices.renewable_percentage or 0.0
                
                summary[zone.value] = MarketSummaryResponse(
                    market_zone=zone.value,
                    zones_covered=1,  # Simplified for demo
                    total_volume=total_volume,
                    avg_price=avg_price,
                    peak_price=peak_price,
                    renewable_percentage=renewable_pct,
                    last_updated=latest_prices.timestamp,
                    data_freshness_minutes=int((datetime.now() - latest_prices.timestamp).total_seconds() / 60)
                )
            else:
                summary[zone.value] = MarketSummaryResponse(
                    market_zone=zone.value,
                    zones_covered=0,
                    total_volume=0.0,
                    avg_price=0.0,
                    peak_price=0.0,
                    renewable_percentage=0.0,
                    last_updated=datetime.now(),
                    data_freshness_minutes=0
                )
        
        return summary
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting market summary: {str(e)}")


@router.get("/prices/live", response_model=Dict[str, List[MarketPriceResponse]])
async def get_live_prices(
    market_zone: Optional[MarketZone] = Query(None, description="Filter by market zone"),
    price_type: Optional[str] = Query(None, description="Filter by price type"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records")
):
    """Get live/recent market prices"""
    try:
        results = {}
        
        zones_to_check = [market_zone] if market_zone else list(MarketZone)
        
        for zone in zones_to_check:
            prices = await market_data_service.get_latest_prices(zone, price_type)
            
            if prices:
                if isinstance(prices, list):
                    prices = prices[:limit] if len(prices) > limit else prices
                else:
                    prices = [prices]
                
                results[zone.value] = [
                    MarketPriceResponse(
                        timestamp=p.timestamp,
                        market_zone=p.market_zone.value,
                        price_type=p.price_type,
                        location=p.location,
                        price=p.price,
                        volume=p.volume,
                        congestion_cost=p.congestion_cost,
                        loss_cost=p.loss_cost,
                        renewable_percentage=p.renewable_percentage,
                        load_forecast=p.load_forecast
                    ) for p in prices
                ]
            else:
                results[zone.value] = []
        
        return results
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting live prices: {str(e)}")


@router.post("/prices/query", response_model=List[MarketPriceResponse])
async def query_price_data(
    request: PriceQueryRequest,
    db = Depends(get_db)
):
    """Query historical price data with filters"""
    try:
        # Default time range if not provided
        if not request.start_time:
            request.start_time = datetime.now() - timedelta(days=1)
        if not request.end_time:
            request.end_time = datetime.now()
        
        # Query database (implement based on your schema)
        # This is a simplified implementation
        prices = await market_data_crud.get_price_data(
            db=db,
            market_zone=request.market_zone,
            price_type=request.price_type,
            location=request.location,
            start_time=request.start_time,
            end_time=request.end_time,
            limit=request.limit,
            sort_by=request.sort_by,
            sort_order=request.sort_order
        )
        
        # Convert to response format
        response_prices = []
        for price in prices:
            response_prices.append(MarketPriceResponse(
                timestamp=price['timestamp'],
                market_zone=price['market_zone'],
                price_type=price['price_type'],
                location=price['location'],
                price=price['price'],
                volume=price['volume'],
                congestion_cost=price.get('congestion_cost'),
                loss_cost=price.get('loss_cost'),
                renewable_percentage=price.get('renewable_percentage'),
                load_forecast=price.get('load_forecast')
            ))
        
        return response_prices
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error querying price data: {str(e)}")


@router.get("/metrics/current", response_model=Dict[str, MarketMetricsResponse])
async def get_current_metrics(
    market_zone: Optional[MarketZone] = Query(None, description="Filter by market zone")
):
    """Get current market metrics"""
    try:
        results = {}
        
        zones_to_check = [market_zone] if market_zone else list(MarketZone)
        
        for zone in zones_to_check:
            prices = await market_data_service.get_latest_prices(zone)
            
            if prices and isinstance(prices, list) and len(prices) > 0:
                # Calculate metrics from recent data
                price_values = [p.price for p in prices]
                volume_values = [p.volume for p in prices]
                
                current_price = prices[0].price
                avg_price = sum(price_values) / len(price_values)
                max_price = max(price_values)
                min_price = min(price_values)
                total_volume = sum(volume_values)
                
                # Calculate volatility
                if len(price_values) > 1:
                    mean_price = sum(price_values) / len(price_values)
                    variance = sum((p - mean_price) ** 2 for p in price_values) / len(price_values)
                    volatility = variance ** 0.5
                else:
                    volatility = 0.0
                
                results[zone.value] = MarketMetricsResponse(
                    market_zone=zone.value,
                    current_price=current_price,
                    avg_price=avg_price,
                    max_price=max_price,
                    min_price=min_price,
                    price_volatility=volatility,
                    total_volume=total_volume,
                    avg_volume=total_volume / len(volume_values) if volume_values else 0,
                    renewable_percentage=prices[0].renewable_percentage or 0.0,
                    record_count=len(prices),
                    timestamp=prices[0].timestamp,
                    change_24h=None,  # Would calculate from 24h ago data
                    change_24h_percent=None
                )
            else:
                results[zone.value] = MarketMetricsResponse(
                    market_zone=zone.value,
                    current_price=0.0,
                    avg_price=0.0,
                    max_price=0.0,
                    min_price=0.0,
                    price_volatility=0.0,
                    total_volume=0.0,
                    avg_volume=0.0,
                    renewable_percentage=0.0,
                    record_count=0,
                    timestamp=datetime.now(),
                    change_24h=None,
                    change_24h_percent=None
                )
        
        return results
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting current metrics: {str(e)}")


@router.post("/analytics/price-trends")
async def analyze_price_trends(request: AnalyticsRequest):
    """Analyze price trends and patterns"""
    try:
        # Fetch historical data
        historical_data = await market_data_service.get_latest_prices(
            request.market_zone,
            "RT_LMP"  # Default price type
        )
        
        if not historical_data or not isinstance(historical_data, list):
            return {"error": "No data available for analysis"}
        
        # Filter data by date range
        filtered_data = [
            p for p in historical_data 
            if request.start_date <= p.timestamp <= request.end_date
        ]
        
        if not filtered_data:
            return {"error": "No data in the specified date range"}
        
        # Perform analytics
        prices = [p.price for p in filtered_data]
        volumes = [p.volume for p in filtered_data]
        
        analytics = {
            "market_zone": request.market_zone.value,
            "date_range": {
                "start": request.start_date.isoformat(),
                "end": request.end_date.isoformat()
            },
            "data_points": len(filtered_data),
            "price_analysis": {
                "avg": sum(prices) / len(prices),
                "min": min(prices),
                "max": max(prices),
                "volatility": (sum((p - sum(prices)/len(prices)) ** 2 for p in prices) / len(prices)) ** 0.5,
                "trend": "increasing" if prices[-1] > prices[0] else "decreasing" if prices[-1] < prices[0] else "stable"
            },
            "volume_analysis": {
                "avg": sum(volumes) / len(volumes),
                "min": min(volumes),
                "max": max(volumes),
                "total": sum(volumes)
            }
        }
        
        return analytics
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing price trends: {str(e)}")


@router.post("/backfill/historical")
async def backfill_historical_data(
    request: BackfillRequest,
    background_tasks: BackgroundTasks
):
    """Start historical data backfill"""
    try:
        # Start backfill in background
        background_tasks.add_task(
            _backfill_data_task,
            request.start_date,
            request.end_date,
            request.market_zones,
            request.skip_existing
        )
        
        return {
            "status": "started",
            "message": "Historical data backfill started in background",
            "start_date": request.start_date.isoformat(),
            "end_date": request.end_date.isoformat(),
            "market_zones": [zone.value for zone in request.market_zones]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error starting backfill: {str(e)}")


@router.get("/backfill/status/{job_id}")
async def get_backfill_status(job_id: str):
    """Get backfill job status"""
    try:
        # This would typically check a job status table
        # For now, return mock status
        return {
            "job_id": job_id,
            "status": "running",  # or "completed", "failed"
            "progress": 75,  # percentage
            "records_processed": 15000,
            "estimated_completion": (datetime.now() + timedelta(minutes=10)).isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting backfill status: {str(e)}")


@router.get("/stream/real-time")
async def stream_real_time_data(market_zone: Optional[MarketZone] = Query(None)):
    """Stream real-time market data via Server-Sent Events"""
    try:
        async def generate_stream():
            async for price_data in market_data_service.stream_real_time_data():
                # Filter by market zone if specified
                if market_zone and price_data.market_zone != market_zone:
                    continue
                
                # Format as SSE
                data_dict = {
                    'timestamp': price_data.timestamp.isoformat(),
                    'market_zone': price_data.market_zone.value,
                    'price_type': price_data.price_type,
                    'location': price_data.location,
                    'price': price_data.price,
                    'volume': price_data.volume
                }
                yield f"data: {json.dumps(data_dict)}\n\n"
        
        return StreamingResponse(
            generate_stream(),
            media_type="text/plain",
            headers={
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive"
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error streaming real-time data: {str(e)}")


@router.get("/locations")
async def get_market_locations(
    market_zone: Optional[MarketZone] = Query(None, description="Filter by market zone")
):
    """Get available market locations/nodes"""
    try:
        locations = {
            MarketZone.PJM: [
                "COMED", "ATLANTIC_FIRMS", "BGE", "DELMARVA",
                "DOMINION", "DUKE", "EAST_CAROLINAS", "JEA",
                "KENTUCKY", "PECO", "PPL", "PSE&G",
                "PUBLIC_SERVICE_NJ", "PUBLIC_SERVICE_PA"
            ],
            MarketZone.CAISO: [
                "CAISO_HUB", "PG_E_BAY", "PGA_E_BAY", "SIEBEL_NAPA",
                "SIERRA", "N_1604", "S_1802", "N_6804",
                "S_BAY", "STOCKTON", "VALLY", "FRESNO"
            ],
            MarketZone.ERCOT: [
                "AUSTIN", "COASTAL", "DALLAS", "FORT_WORTH",
                "HOUSTON", "NORTH", "PANHANDLE", "SOUTH",
                "SOUTH_CENTRAL", "WEST"
            ]
        }
        
        if market_zone:
            return {market_zone.value: locations.get(market_zone, [])}
        
        return locations
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting market locations: {str(e)}")


# Background tasks
async def _backfill_data_task(
    start_date: datetime,
    end_date: datetime,
    market_zones: List[MarketZone],
    skip_existing: bool
):
    """Background task for historical data backfill"""
    try:
        logger.info(f"Starting backfill for {len(market_zones)} markets from {start_date} to {end_date}")
        
        results = await market_data_service.backfill_historical_data(
            start_date=start_date,
            end_date=end_date
        )
        
        logger.info(f"Backfill completed: {results}")
        
        # Log completion status
        # In production, this would update a job status table
        
    except Exception as e:
        logger.error(f"Backfill task failed: {e}")
        # Log error to job status table