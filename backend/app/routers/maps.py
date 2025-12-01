"""
Google Maps Integration Router for geospatial analysis and visualization.
Provides location-based market analysis, geospatial clustering, and India-specific features.
"""

from fastapi import APIRouter, HTTPException, Query, Body
from fastapi.responses import JSONResponse
from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field
import asyncio

from ..services.google_maps_service import google_maps_service

router = APIRouter(prefix="/api/maps", tags=["google-maps"])


class LocationRequest(BaseModel):
    """Request model for location-based operations."""
    latitude: float = Field(..., ge=-90, le=90, description="Latitude coordinate")
    longitude: float = Field(..., ge=-180, le=180, description="Longitude coordinate")
    address: Optional[str] = Field(None, description="Address for geocoding")


class GeocodeRequest(BaseModel):
    """Request model for geocoding operations."""
    address: str = Field(..., description="Address to geocode")
    components: Optional[Dict[str, str]] = Field(None, description="Address components")


class RouteRequest(BaseModel):
    """Request model for route calculation."""
    waypoints: List[Dict[str, float]] = Field(..., description="List of waypoints with lat/lng")
    optimize_order: bool = Field(True, description="Whether to optimize waypoint order")


class MarketZoneRequest(BaseModel):
    """Request model for market zone visualization."""
    market_data: List[Dict[str, Any]] = Field(..., description="Market data with coordinates")


@router.get("/geocode")
async def geocode_address(
    address: str = Query(..., description="Address to geocode"),
    region: Optional[str] = Query("in", description="Region bias (default: India)")
):
    """
    Geocode an address to get latitude/longitude coordinates.
    
    - **address**: Address to geocode
    - **region**: Region bias (default: India for Indian addresses)
    """
    try:
        result = await google_maps_service.geocode_address(address)
        
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return JSONResponse(content={
            "success": True,
            "data": result["data"],
            "query": {
                "address": address,
                "region": region
            },
            "timestamp": datetime.now().isoformat()
        })
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Geocoding failed: {str(e)}")


@router.post("/reverse-geocode")
async def reverse_geocode(request: LocationRequest):
    """
    Reverse geocode coordinates to get address information.
    
    - **latitude**: Latitude coordinate (-90 to 90)
    - **longitude**: Longitude coordinate (-180 to 180)
    """
    try:
        result = await google_maps_service.reverse_geocode(request.latitude, request.longitude)
        
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return JSONResponse(content={
            "success": True,
            "data": result["data"],
            "coordinates": {
                "latitude": request.latitude,
                "longitude": request.longitude
            },
            "timestamp": datetime.now().isoformat()
        })
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Reverse geocoding failed: {str(e)}")


@router.post("/market-zones-geojson")
async def get_market_zones_geojson(request: MarketZoneRequest):
    """
    Convert market data to GeoJSON format for map visualization.
    
    - **market_data**: List of market data objects with market_zone, price, volume
    """
    try:
        if not request.market_data:
            raise HTTPException(status_code=400, detail="Market data cannot be empty")
        
        result = await google_maps_service.get_geojson_market_zones(request.market_data)
        
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return JSONResponse(content=result["data"])
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"GeoJSON conversion failed: {str(e)}")


@router.post("/calculate-distances")
async def calculate_distances(locations: List[Dict[str, float]] = Body(..., description="List of locations with lat/lng")):
    """
    Calculate distances between multiple locations using Haversine formula.
    
    - **locations**: List of location dictionaries with 'latitude' and 'longitude' keys
    """
    try:
        if len(locations) < 2:
            raise HTTPException(status_code=400, detail="At least 2 locations required")
        
        if len(locations) > 50:
            raise HTTPException(status_code=400, detail="Maximum 50 locations allowed")
        
        # Validate coordinates
        for i, location in enumerate(locations):
            if "latitude" not in location or "longitude" not in location:
                raise HTTPException(status_code=400, detail=f"Location {i} missing latitude or longitude")
            
            lat = location["latitude"]
            lng = location["longitude"]
            if not (-90 <= lat <= 90 and -180 <= lng <= 180):
                raise HTTPException(status_code=400, detail=f"Invalid coordinates for location {i}")
        
        result = await google_maps_service.calculate_geo_distances(locations)
        
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return JSONResponse(content=result["data"])
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Distance calculation failed: {str(e)}")


@router.get("/nearby-markets")
async def find_nearby_markets(
    latitude: float = Query(..., ge=-90, le=90, description="Center latitude"),
    longitude: float = Query(..., ge=-180, le=180, description="Center longitude"),
    radius_km: float = Query(50, ge=1, le=1000, description="Search radius in kilometers"),
    market_zones: Optional[str] = Query(None, description="Comma-separated specific market zones")
):
    """
    Find nearby markets within a specified radius.
    
    - **latitude**: Center point latitude
    - **longitude**: Center point longitude  
    - **radius_km**: Search radius in km (1-1000)
    - **market_zones**: Optional comma-separated list of specific zones to search
    """
    try:
        # Parse specific market zones if provided
        market_data = None
        if market_zones:
            zones_list = [zone.strip().upper() for zone in market_zones.split(",")]
            # Mock market data for specific zones
            market_data = [
                {
                    "market_zone": zone,
                    "lat": latitude + (hash(zone) % 20 - 10) * 0.01,  # Mock coordinates
                    "lng": longitude + (hash(zone) // 20 % 20 - 10) * 0.01,
                    "price": 4.0 + (hash(zone) % 100) * 0.01  # Mock price
                }
                for zone in zones_list
            ]
        
        result = await google_maps_service.find_nearby_markets(
            lat=latitude,
            lng=longitude,
            radius_km=radius_km,
            market_data=market_data
        )
        
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return JSONResponse(content=result["data"])
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Nearby markets search failed: {str(e)}")


@router.post("/optimal-routes")
async def get_optimal_routes(request: RouteRequest):
    """
    Calculate optimal routes between multiple waypoints.
    
    - **waypoints**: List of waypoints with latitude/longitude coordinates
    - **optimize_order**: Whether to optimize the order of waypoints
    """
    try:
        if len(request.waypoints) < 2:
            raise HTTPException(status_code=400, detail="At least 2 waypoints required")
        
        if len(request.waypoints) > 25:
            raise HTTPException(status_code=400, detail="Maximum 25 waypoints allowed")
        
        # Validate coordinates
        for i, waypoint in enumerate(request.waypoints):
            if "lat" not in waypoint or "lng" not in waypoint:
                raise HTTPException(status_code=400, detail=f"Waypoint {i} missing lat/lng")
            
            lat = waypoint["lat"]
            lng = waypoint["lng"]
            if not (-90 <= lat <= 90 and -180 <= lng <= 180):
                raise HTTPException(status_code=400, detail=f"Invalid coordinates for waypoint {i}")
        
        result = await google_maps_service.get_optimal_routes(
            waypoints=request.waypoints,
            optimize_order=request.optimize_order
        )
        
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return JSONResponse(content=result["data"])
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Route optimization failed: {str(e)}")


@router.post("/geo-analytics")
async def get_geo_analytics(request: MarketZoneRequest):
    """
    Get comprehensive geospatial analytics summary.
    
    - **market_data**: List of market data with coordinates
    """
    try:
        if not request.market_data:
            raise HTTPException(status_code=400, detail="Market data cannot be empty")
        
        # Add mock coordinates if missing
        for data in request.market_data:
            if "lat" not in data or "lng" not in data:
                # Generate mock coordinates based on market zone
                zone_name = data.get("market_zone", f"market_{hash(str(data)) % 100}")
                base_lat = 19.0760  # Mumbai
                base_lng = 72.8777  # Mumbai
                
                zone_hash = hash(zone_name) % 100
                lat_offset = (zone_hash % 20 - 10) * 0.1
                lng_offset = (zone_hash // 20 - 5) * 0.1
                
                data["lat"] = base_lat + lat_offset
                data["lng"] = base_lng + lng_offset
        
        result = await google_maps_service.get_geo_analytics_summary(request.market_data)
        
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return JSONResponse(content=result["data"])
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Geo-analytics failed: {str(e)}")


@router.get("/india-regions")
async def get_india_regions():
    """
    Get predefined regions for India market analysis.
    """
    regions = {
        "North India": {
            "bounds": {
                "north": 37.0,
                "south": 28.0,
                "east": 89.0,
                "west": 68.0
            },
            "major_cities": ["Delhi", "Lucknow", "Chandigarh", "Jaipur"],
            "power_markets": ["DELHI", "UP_NORTH", "PUNJAB"]
        },
        "South India": {
            "bounds": {
                "north": 18.0,
                "south": 8.0,
                "east": 80.0,
                "west": 74.0
            },
            "major_cities": ["Bangalore", "Chennai", "Hyderabad", "Kochi"],
            "power_markets": ["KARNATAKA", "TAMILNADU", "ANDHRA", "KERALA"]
        },
        "West India": {
            "bounds": {
                "north": 26.0,
                "south": 16.0,
                "east": 74.0,
                "west": 68.0
            },
            "major_cities": ["Mumbai", "Pune", "Ahmedabad", "Surat"],
            "power_markets": ["MAHARASHTRA", "GUJARAT", "GOA", "RAJASTHAN"]
        },
        "East India": {
            "bounds": {
                "north": 27.0,
                "south": 17.0,
                "east": 95.0,
                "west": 80.0
            },
            "major_cities": ["Kolkata", "Bhubaneswar", "Ranchi", "Guwahati"],
            "power_markets": ["WB", "ODISHA", "JHARKHAND", "NEA"]
        },
        "Central India": {
            "bounds": {
                "north": 25.0,
                "south": 18.0,
                "east": 86.0,
                "west": 74.0
            },
            "major_cities": ["Bhopal", "Indore", "Nagpur", "Jabalpur"],
            "power_markets": ["MP", "CHHATTISGARH", "MAHARASHTRA_WEST"]
        }
    }
    
    return JSONResponse(content={
        "regions": regions,
        "metadata": {
            "coordinate_system": "WGS84",
            "projection": "Geographic",
            "total_regions": len(regions),
            "coordinate_bounds": {
                "north": 37.0,
                "south": 8.0,
                "east": 95.0,
                "west": 68.0
            }
        },
        "timestamp": datetime.now().isoformat()
    })


@router.get("/health")
async def get_maps_health():
    """
    Check Google Maps service health.
    """
    try:
        # Test basic functionality
        test_result = await google_maps_service.geocode_address("Mumbai, India")
        
        return JSONResponse(content={
            "status": "healthy",
            "service": "Google Maps Integration",
            "test_result": test_result["success"],
            "features": [
                "geocoding",
                "reverse_geocoding",
                "geojson_conversion",
                "distance_calculation",
                "nearby_search",
                "route_optimization",
                "geo_analytics"
            ],
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "service": "Google Maps Integration",
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
        )


@router.get("/api-info")
async def get_maps_api_info():
    """
    Get information about available Google Maps features and usage.
    """
    return JSONResponse(content={
        "service": "Google Maps Integration",
        "version": "1.0.0",
        "description": "Geospatial analysis and visualization for energy market data",
        "features": {
            "geocoding": {
                "endpoint": "/api/maps/geocode",
                "description": "Convert addresses to coordinates",
                "parameters": ["address", "region"]
            },
            "reverse_geocoding": {
                "endpoint": "/api/maps/reverse-geocode",
                "description": "Convert coordinates to addresses",
                "parameters": ["latitude", "longitude"]
            },
            "market_zones": {
                "endpoint": "/api/maps/market-zones-geojson",
                "description": "Generate GeoJSON for market visualization",
                "parameters": ["market_data"]
            },
            "distance_calculation": {
                "endpoint": "/api/maps/calculate-distances",
                "description": "Calculate distances between locations",
                "parameters": ["locations"]
            },
            "nearby_search": {
                "endpoint": "/api/maps/nearby-markets",
                "description": "Find nearby markets within radius",
                "parameters": ["latitude", "longitude", "radius_km"]
            },
            "route_optimization": {
                "endpoint": "/api/maps/optimal-routes",
                "description": "Optimize routes between waypoints",
                "parameters": ["waypoints", "optimize_order"]
            },
            "geo_analytics": {
                "endpoint": "/api/maps/geo-analytics",
                "description": "Geospatial analytics summary",
                "parameters": ["market_data"]
            }
        },
        "limits": {
            "max_locations_per_request": 50,
            "max_waypoints_per_route": 25,
            "max_search_radius_km": 1000,
            "coordinate_bounds": "WGS84 standard"
        },
        "special_features": [
            "India-focused market zones",
            "Power market region mapping",
            "Energy grid visualization",
            "Distance-based market analysis"
        ],
        "timestamp": datetime.now().isoformat()
    })