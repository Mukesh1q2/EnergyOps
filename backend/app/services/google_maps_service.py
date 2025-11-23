"""
Google Maps Integration Service for geospatial analysis and visualization.
Provides location-based market analysis, geospatial clustering, and India-specific features.
"""

import asyncio
import json
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime, timedelta
import numpy as np
import pandas as pd
from ..core.config import get_settings

# Note: In production, you'd use the actual Google Maps API
# from google.cloud import maps_v2
# from google.protobuf import struct_pb2

settings = get_settings()


class GoogleMapsService:
    """Google Maps service for geospatial market analysis and visualization."""
    
    def __init__(self):
        self.api_key = settings.GOOGLE_MAPS_API_KEY
        self.base_url = "https://maps.googleapis.com/maps/api"
        # In production, initialize Google Maps client
        # self.client = maps_v2.MapsClient()
    
    async def geocode_address(self, address: str) -> Dict[str, Any]:
        """Geocode an address to get latitude/longitude coordinates."""
        try:
            # Simulate geocoding response for demonstration
            # In production, use actual Google Geocoding API
            geocode_result = {
                "results": [
                    {
                        "formatted_address": address,
                        "geometry": {
                            "location": {
                                "lat": 19.0760 + (np.random.random() - 0.5) * 2,  # Mumbai coordinates with variance
                                "lng": 72.8777 + (np.random.random() - 0.5) * 2
                            },
                            "viewport": {
                                "northeast": {"lat": 20.0760, "lng": 73.8777},
                                "southwest": {"lat": 18.0760, "lng": 71.8777}
                            }
                        },
                        "place_id": f"place_id_{hash(address) % 10000}",
                        "types": ["political"]
                    }
                ],
                "status": "OK"
            }
            
            return {
                "success": True,
                "data": geocode_result
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    async def reverse_geocode(self, lat: float, lng: float) -> Dict[str, Any]:
        """Reverse geocode coordinates to get address information."""
        try:
            # Simulate reverse geocoding response
            # In production, use actual Google Reverse Geocoding API
            reverse_result = {
                "results": [
                    {
                        "formatted_address": f"Location near {lat:.4f}, {lng:.4f}",
                        "address_components": [
                            {
                                "long_name": f"Area {hash((lat, lng)) % 100}",
                                "short_name": f"A{hash((lat, lng)) % 100}",
                                "types": ["sublocality_level_1"]
                            },
                            {
                                "long_name": f"City {hash((lat, lng)) % 10}",
                                "short_name": f"C{hash((lat, lng)) % 10}",
                                "types": ["locality"]
                            },
                            {
                                "long_name": "Maharashtra",
                                "short_name": "MH",
                                "types": ["administrative_area_level_1"]
                            },
                            {
                                "long_name": "India",
                                "short_name": "IN",
                                "types": ["country"]
                            }
                        ],
                        "place_id": f"reverse_place_{hash((lat, lng)) % 10000}"
                    }
                ],
                "status": "OK"
            }
            
            return {
                "success": True,
                "data": reverse_result
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    async def get_geojson_market_zones(
        self,
        market_data: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Convert market data to GeoJSON format for map visualization."""
        try:
            features = []
            
            for data in market_data:
                # Generate mock coordinates for market zones in India
                if data.get("market_zone"):
                    # Create mock boundary coordinates for each market zone
                    base_lat = 19.0760  # Mumbai
                    base_lng = 72.8777  # Mumbai
                    
                    # Offset based on zone name hash for consistent positioning
                    zone_hash = hash(data["market_zone"]) % 100
                    lat_offset = (zone_hash % 20 - 10) * 0.1
                    lng_offset = (zone_hash // 20 - 5) * 0.1
                    
                    center_lat = base_lat + lat_offset
                    center_lng = base_lng + lng_offset
                    
                    # Create a simple rectangular boundary
                    boundary_points = [
                        [center_lng - 0.05, center_lat - 0.05],
                        [center_lng + 0.05, center_lat - 0.05],
                        [center_lng + 0.05, center_lat + 0.05],
                        [center_lng - 0.05, center_lat + 0.05],
                        [center_lng - 0.05, center_lat - 0.05]
                    ]
                    
                    feature = {
                        "type": "Feature",
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [boundary_points]
                        },
                        "properties": {
                            "market_zone": data["market_zone"],
                            "price": data.get("price", 0),
                            "volume": data.get("volume", 0),
                            "price_color": self._get_price_color(data.get("price", 0)),
                            "volume_size": min(max(data.get("volume", 0) / 1000, 5), 50),
                            "last_updated": data.get("timestamp", datetime.now().isoformat())
                        }
                    }
                    features.append(feature)
            
            geojson = {
                "type": "FeatureCollection",
                "features": features,
                "metadata": {
                    "total_zones": len(features),
                    "generated_at": datetime.now().isoformat(),
                    "coordinate_system": "WGS84"
                }
            }
            
            return {
                "success": True,
                "data": geojson
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def _get_price_color(self, price: float) -> str:
        """Get color based on price value for map visualization."""
        if price < 3.0:
            return "#22c55e"  # Green - low price
        elif price < 4.5:
            return "#eab308"  # Yellow - medium price
        elif price < 6.0:
            return "#f97316"  # Orange - high price
        else:
            return "#ef4444"  # Red - very high price
    
    async def calculate_geo_distances(
        self,
        locations: List[Dict[str, float]]
    ) -> Dict[str, Any]:
        """Calculate distances between multiple locations using Haversine formula."""
        try:
            def haversine_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
                """Calculate distance between two points using Haversine formula."""
                R = 6371  # Earth's radius in kilometers
                
                dlat = np.radians(lat2 - lat1)
                dlng = np.radians(lng2 - lng1)
                a = np.sin(dlat/2)**2 + np.cos(np.radians(lat1)) * np.cos(np.radians(lat2)) * np.sin(dlng/2)**2
                c = 2 * np.arctan2(np.sqrt(a), np.sqrt(1-a))
                return R * c
            
            distances = []
            
            for i, loc1 in enumerate(locations):
                for j, loc2 in enumerate(locations[i+1:], i+1):
                    distance = haversine_distance(
                        loc1["lat"], loc1["lng"],
                        loc2["lat"], loc2["lng"]
                    )
                    
                    distances.append({
                        "from": i,
                        "to": j,
                        "from_coords": {"lat": loc1["lat"], "lng": loc1["lng"]},
                        "to_coords": {"lat": loc2["lat"], "lng": loc2["lng"]},
                        "distance_km": round(distance, 2),
                        "distance_miles": round(distance * 0.621371, 2)
                    })
            
            return {
                "success": True,
                "data": {
                    "distances": distances,
                    "summary": {
                        "total_pairs": len(distances),
                        "min_distance": min(d["distance_km"] for d in distances) if distances else 0,
                        "max_distance": max(d["distance_km"] for d in distances) if distances else 0,
                        "avg_distance": np.mean([d["distance_km"] for d in distances]) if distances else 0
                    }
                }
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    async def find_nearby_markets(
        self,
        lat: float,
        lng: float,
        radius_km: float = 50,
        market_data: List[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Find nearby markets within a specified radius."""
        try:
            if market_data is None:
                # Mock market data
                market_data = [
                    {"market_zone": "Mumbai_Power", "lat": 19.0760, "lng": 72.8777, "price": 4.2},
                    {"market_zone": "Delhi_Power", "lat": 28.6139, "lng": 77.2090, "price": 5.1},
                    {"market_zone": "Bangalore_Power", "lat": 12.9716, "lng": 77.5946, "price": 3.8},
                    {"market_zone": "Chennai_Power", "lat": 13.0827, "lng": 80.2707, "price": 4.5},
                ]
            
            def haversine_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
                """Calculate distance between two points."""
                R = 6371
                dlat = np.radians(lat2 - lat1)
                dlng = np.radians(lng2 - lng1)
                a = np.sin(dlat/2)**2 + np.cos(np.radians(lat1)) * np.cos(np.radians(lat2)) * np.sin(dlng/2)**2
                c = 2 * np.arctan2(np.sqrt(a), np.sqrt(1-a))
                return R * c
            
            nearby_markets = []
            
            for market in market_data:
                distance = haversine_distance(lat, lng, market["lat"], market["lng"])
                
                if distance <= radius_km:
                    nearby_markets.append({
                        "market_zone": market["market_zone"],
                        "lat": market["lat"],
                        "lng": market["lng"],
                        "distance_km": round(distance, 2),
                        "distance_miles": round(distance * 0.621371, 2),
                        "price": market.get("price", 0),
                        "within_radius": True
                    })
            
            # Sort by distance
            nearby_markets.sort(key=lambda x: x["distance_km"])
            
            return {
                "success": True,
                "data": {
                    "search_center": {"lat": lat, "lng": lng, "radius_km": radius_km},
                    "nearby_markets": nearby_markets,
                    "total_found": len(nearby_markets),
                    "search_timestamp": datetime.now().isoformat()
                }
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    async def get_optimal_routes(
        self,
        waypoints: List[Dict[str, float]],
        optimize_order: bool = True
    ) -> Dict[str, Any]:
        """Calculate optimal routes between multiple waypoints."""
        try:
            if len(waypoints) < 2:
                return {
                    "success": False,
                    "error": "At least 2 waypoints required"
                }
            
            # Simple route optimization using nearest neighbor heuristic
            if optimize_order and len(waypoints) > 2:
                optimized_waypoints = await self._optimize_waypoint_order(waypoints)
            else:
                optimized_waypoints = waypoints
            
            # Calculate route segments
            route_segments = []
            total_distance = 0
            
            for i in range(len(optimized_waypoints) - 1):
                segment = {
                    "from_index": i,
                    "to_index": i + 1,
                    "from_coords": optimized_waypoints[i],
                    "to_coords": optimized_waypoints[i + 1]
                }
                
                # Calculate segment distance
                distance = self._haversine_distance(
                    optimized_waypoints[i]["lat"], optimized_waypoints[i]["lng"],
                    optimized_waypoints[i + 1]["lat"], optimized_waypoints[i + 1]["lng"]
                )
                
                segment["distance_km"] = round(distance, 2)
                segment["distance_miles"] = round(distance * 0.621371, 2)
                total_distance += distance
                
                route_segments.append(segment)
            
            return {
                "success": True,
                "data": {
                    "optimized_order": optimize_order,
                    "route_segments": route_segments,
                    "total_distance_km": round(total_distance, 2),
                    "total_distance_miles": round(total_distance * 0.621371, 2),
                    "waypoints_count": len(waypoints),
                    "estimated_duration_minutes": round(total_distance * 2, 0),  # Rough estimate
                    "route_timestamp": datetime.now().isoformat()
                }
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def _haversine_distance(self, lat1: float, lng1: float, lat2: float, lng2: float) -> float:
        """Calculate distance between two points using Haversine formula."""
        R = 6371  # Earth's radius in kilometers
        
        dlat = np.radians(lat2 - lat1)
        dlng = np.radians(lng2 - lng1)
        a = np.sin(dlat/2)**2 + np.cos(np.radians(lat1)) * np.cos(np.radians(lat2)) * np.sin(dlng/2)**2
        c = 2 * np.arctan2(np.sqrt(a), np.sqrt(1-a))
        return R * c
    
    async def _optimize_waypoint_order(self, waypoints: List[Dict[str, float]]) -> List[Dict[str, float]]:
        """Optimize waypoint order using nearest neighbor heuristic."""
        if len(waypoints) <= 2:
            return waypoints
        
        # Start with first waypoint
        optimized = [waypoints[0]]
        remaining = waypoints[1:]
        
        while remaining:
            current = optimized[-1]
            # Find nearest unvisited waypoint
            nearest_idx = min(
                range(len(remaining)),
                key=lambda i: self._haversine_distance(
                    current["lat"], current["lng"],
                    remaining[i]["lat"], remaining[i]["lng"]
                )
            )
            
            optimized.append(remaining[nearest_idx])
            remaining.pop(nearest_idx)
        
        return optimized
    
    async def get_geo_analytics_summary(
        self,
        market_data: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Get comprehensive geospatial analytics summary."""
        try:
            if not market_data:
                return {"success": True, "data": {"summary": {}, "message": "No market data provided"}}
            
            # Extract coordinates
            lats = [d.get("lat", 0) for d in market_data if d.get("lat")]
            lngs = [d.get("lng", 0) for d in market_data if d.get("lng")]
            
            if not lats or not lngs:
                return {"success": True, "data": {"summary": {}, "message": "No coordinates found"}}
            
            # Calculate geographic statistics
            bounds = {
                "north": max(lats),
                "south": min(lats),
                "east": max(lngs),
                "west": min(lngs)
            }
            
            center = {
                "lat": (bounds["north"] + bounds["south"]) / 2,
                "lng": (bounds["east"] + bounds["west"]) / 2
            }
            
            area_km2 = self._calculate_geographic_area(bounds)
            
            # Price analysis by region
            price_by_region = {}
            for data in market_data:
                region = self._get_region_name(data.get("lat", 0), data.get("lng", 0))
                if region not in price_by_region:
                    price_by_region[region] = []
                if data.get("price"):
                    price_by_region[region].append(data["price"])
            
            # Calculate regional statistics
            regional_stats = {}
            for region, prices in price_by_region.items():
                if prices:
                    regional_stats[region] = {
                        "avg_price": round(np.mean(prices), 2),
                        "min_price": min(prices),
                        "max_price": max(prices),
                        "std_dev": round(np.std(prices), 2),
                        "market_count": len(prices)
                    }
            
            return {
                "success": True,
                "data": {
                    "geographic_bounds": bounds,
                    "geographic_center": center,
                    "area_km2": area_km2,
                    "total_markets": len(market_data),
                    "regional_statistics": regional_stats,
                    "coordinate_range": {
                        "lat_range": max(lats) - min(lats),
                        "lng_range": max(lngs) - min(lngs)
                    },
                    "analysis_timestamp": datetime.now().isoformat()
                }
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def _calculate_geographic_area(self, bounds: Dict[str, float]) -> float:
        """Calculate approximate geographic area in km²."""
        lat_diff = bounds["north"] - bounds["south"]
        lng_diff = bounds["east"] - bounds["west"]
        
        # Approximate calculation (this is simplified)
        # In reality, you'd use more accurate methods like spherical excess
        avg_lat = (bounds["north"] + bounds["south"]) / 2
        area_km2 = 111.32 * 111.32 * lat_diff * lng_diff * np.cos(np.radians(avg_lat))
        
        return round(area_km2, 2)
    
    def _get_region_name(self, lat: float, lng: float) -> str:
        """Get region name based on coordinates (India-focused)."""
        # Simple region classification based on coordinates
        if lat > 28 and lng > 75:
            return "North India"
        elif lat < 15 and lng > 75:
            return "South India"
        elif 15 <= lat <= 28 and 70 <= lng <= 90:
            return "Central India"
        elif lng < 75:
            return "West India"
        elif lng > 90:
            return "East India"
        else:
            return "Unknown Region"


# Global instance
google_maps_service = GoogleMapsService()
