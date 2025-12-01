"""
WebSocket Routes for Real-time Communication
Provides WebSocket endpoints for live market data and price updates
"""

import asyncio
import logging
from datetime import datetime
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect, Query, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.database import get_db
from ..services.websocket_manager import WebSocketHandler, manager, WebSocketBroadcaster
from ..services.redis_cache import redis_cache

logger = logging.getLogger(__name__)
router = APIRouter()
security = HTTPBearer()


@router.websocket("/ws/market/{market_zone}")
async def market_data_websocket(
    websocket: WebSocket, 
    market_zone: str,
    token: Optional[str] = Query(default=None, description="JWT token for authentication"),
    db: AsyncSession = Depends(get_db)
):
    """
    WebSocket endpoint for real-time market data updates
    
    Args:
        market_zone: Target market zone (e.g., 'pjm', 'caiso', 'ercot')
        token: Optional JWT token for user authentication
    """
    
    # Validate market zone
    valid_zones = ['pjm', 'caiso', 'ercot', 'nyiso', 'miso', 'spp']
    if market_zone.lower() not in valid_zones:
        await websocket.close(code=1008, reason=f"Invalid market zone. Valid zones: {', '.join(valid_zones)}")
        return
    
    # Authenticate user if token provided
    user_id = None
    if token:
        try:
            credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)
            user_id = await WebSocketHandler.authenticate_user(websocket, credentials)
        except Exception as e:
            logger.warning(f"WebSocket authentication failed: {e}")
    
    # Handle WebSocket connection
    try:
        await WebSocketHandler.handle_market_data_connection(websocket, market_zone.lower(), user_id)
        
    except WebSocketDisconnect:
        logger.info(f"WebSocket client disconnected from {market_zone}")
    except Exception as e:
        logger.error(f"WebSocket error for {market_zone}: {e}")
        await websocket.close(code=1011, reason="Internal server error")


@router.websocket("/ws/prices")
async def prices_websocket(
    websocket: WebSocket,
    zones: Optional[str] = Query(default=None, description="Comma-separated list of market zones"),
    token: Optional[str] = Query(default=None, description="JWT token for authentication")
):
    """
    WebSocket endpoint for multiple market zone price updates
    
    Args:
        zones: Comma-separated list of market zones to subscribe to
        token: Optional JWT token for user authentication
    """
    
    # Parse market zones
    if zones:
        requested_zones = [zone.strip().lower() for zone in zones.split(',')]
        valid_zones = ['pjm', 'caiso', 'ercot', 'nyiso', 'miso', 'spp']
        requested_zones = [zone for zone in requested_zones if zone in valid_zones]
    else:
        requested_zones = ['pjm', 'caiso', 'ercot']  # Default zones
    
    # Authenticate user if token provided
    user_id = None
    if token:
        try:
            credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)
            user_id = await WebSocketHandler.authenticate_user(websocket, credentials)
        except Exception as e:
            logger.warning(f"WebSocket authentication failed: {e}")
    
    # Connect to multiple market zones
    try:
        await websocket.accept()
        
        connection_data = {
            'user_id': user_id,
            'connected_at': asyncio.get_event_loop().time(),
            'market_zones': requested_zones,
            'connection_id': f"multi_{len(manager.active_connections)}"
        }
        
        # Add to active connections for each zone
        for zone in requested_zones:
            await manager.connect(websocket, zone, user_id)
        
        # Send initial data for all zones
        initial_data = {}
        for zone in requested_zones:
            latest_price = await redis_cache.get_latest_price(zone)
            if latest_price:
                initial_data[zone] = latest_price
        
        await websocket.send_text(f"""
        {{
            "type": "multi_zone_connection_established",
            "connection_id": "{connection_data['connection_id']}",
            "subscribed_zones": {requested_zones},
            "initial_data": {initial_data},
            "timestamp": "2025-11-17T23:53:20Z"
        }}
        """)
        
        # Handle incoming messages
        while True:
            try:
                data = await websocket.receive_text()
                message = f'{{"type": "received", "data": "{data}", "timestamp": "2025-11-17T23:53:20Z"}}'
                await websocket.send_text(message)
                
            except WebSocketDisconnect:
                break
                
    except Exception as e:
        logger.error(f"Multi-zone WebSocket error: {e}")
    finally:
        # Disconnect from all zones
        for zone in requested_zones:
            manager.disconnect(websocket)


@router.get("/ws/stats")
async def get_websocket_stats():
    """Get WebSocket connection statistics"""
    try:
        stats = await WebSocketHandler.get_connection_stats()
        return stats
    except Exception as e:
        logger.error(f"Failed to get WebSocket stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to get connection statistics")


@router.post("/ws/broadcast/price")
async def broadcast_price_update(
    market_zone: str,
    price: float,
    volume: float,
    timestamp: Optional[str] = None
):
    """
    Broadcast price update to all WebSocket clients (admin endpoint)
    
    This endpoint allows broadcasting price updates to all connected clients
    for testing or manual updates.
    """
    
    from datetime import datetime
    
    try:
        if not timestamp:
            timestamp = datetime.utcnow()
        elif isinstance(timestamp, str):
            timestamp = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
        
        await WebSocketHandler.broadcast_price_update(market_zone.lower(), price, volume, timestamp)
        
        return {
            "success": True,
            "message": f"Price update broadcasted for {market_zone}",
            "market_zone": market_zone,
            "price": price,
            "volume": volume,
            "timestamp": timestamp.isoformat()
        }
        
    except Exception as e:
        logger.error(f"Failed to broadcast price update: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to broadcast update: {str(e)}")


@router.post("/ws/broadcast/alert")
async def broadcast_market_alert(
    market_zone: str,
    alert_type: str,
    message: str,
    severity: str = "info"
):
    """
    Broadcast market alert to all WebSocket clients (admin endpoint)
    
    This endpoint allows broadcasting market alerts to connected clients.
    """
    
    try:
        await WebSocketHandler.broadcast_market_alert(
            market_zone.lower(), alert_type, message, severity
        )
        
        return {
            "success": True,
            "message": f"Alert broadcasted for {market_zone}",
            "market_zone": market_zone,
            "alert_type": alert_type,
            "severity": severity,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Failed to broadcast alert: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to broadcast alert: {str(e)}")


# Simulation endpoints for testing real-time features
@router.post("/simulate/price-update")
async def simulate_price_update(
    market_zone: str,
    base_price: float = 50.0,
    volatility: float = 5.0
):
    """
    Simulate real-time price updates for testing WebSocket connections
    
    This endpoint generates random price movements and broadcasts them
    via WebSocket for testing purposes.
    """
    
    import random
    from datetime import datetime
    
    try:
        # Generate realistic price movement
        price_change = random.uniform(-volatility, volatility)
        new_price = max(base_price + price_change, 0.01)  # Ensure positive price
        volume = random.uniform(100, 1000)
        
        timestamp = datetime.utcnow()
        
        # Broadcast to WebSocket clients
        await WebSocketHandler.broadcast_price_update(market_zone.lower(), new_price, volume, timestamp)
        
        # Cache the latest price
        await redis_cache.cache_latest_price(market_zone.lower(), {
            'price': new_price,
            'volume': volume,
            'timestamp': timestamp.isoformat(),
            'base_price': base_price,
            'volatility': volatility
        })
        
        return {
            "success": True,
            "simulated": True,
            "market_zone": market_zone,
            "old_price": base_price,
            "new_price": round(new_price, 2),
            "volume": round(volume, 2),
            "price_change": round(price_change, 2),
            "timestamp": timestamp.isoformat(),
            "message": f"Price updated for {market_zone}: ${new_price:.2f}"
        }
        
    except Exception as e:
        logger.error(f"Failed to simulate price update: {e}")
        raise HTTPException(status_code=500, detail=f"Simulation failed: {str(e)}")


@router.post("/simulate/market-events")
async def simulate_market_events():
    """
    Simulate various market events for testing the real-time system
    
    This endpoint triggers multiple events across different market zones
    to test the real-time broadcasting system.
    """
    
    from datetime import datetime
    
    try:
        market_zones = ['pjm', 'caiso', 'ercot', 'nyiso']
        events = []
        
        for zone in market_zones:
            # Simulate price update
            price = random.uniform(30, 100)
            volume = random.uniform(500, 2000)
            await WebSocketHandler.broadcast_price_update(zone, price, volume, datetime.utcnow())
            
            # Simulate market alert occasionally
            if random.random() < 0.3:
                alert_types = ['price_spike', 'volume_surge', 'system_maintenance']
                alert_type = random.choice(alert_types)
                severity = random.choice(['info', 'warning', 'critical'])
                message = f"Simulated {alert_type} event in {zone}"
                await WebSocketHandler.broadcast_market_alert(zone, alert_type, message, severity)
                events.append(f"Alert: {alert_type} in {zone}")
            
            events.append(f"Price: ${price:.2f} in {zone}")
        
        return {
            "success": True,
            "simulated": True,
            "events_generated": len(events),
            "events": events,
            "timestamp": datetime.utcnow().isoformat(),
            "market_zones_affected": market_zones
        }
        
    except Exception as e:
        logger.error(f"Failed to simulate market events: {e}")
        raise HTTPException(status_code=500, detail=f"Event simulation failed: {str(e)}")


# Note: Add datetime import at the top of the file if not already imported
# from datetime import datetime