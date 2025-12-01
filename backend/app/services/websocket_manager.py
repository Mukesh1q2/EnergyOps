"""
WebSocket Manager for Real-time Communication
Handles WebSocket connections for live price updates and market data streaming
"""

import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Set
from uuid import UUID, uuid4

from fastapi import WebSocket, WebSocketDisconnect, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import jwt, JWTError

from ..core.config import settings
from ..core.database import AsyncSession
from ..crud import user as crud_user
from .redis_cache import redis_cache

logger = logging.getLogger(__name__)

# Connection manager for WebSocket connections
class ConnectionManager:
    """Manages WebSocket connections and broadcasts"""
    
    def __init__(self):
        # Track active connections by market zone
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        # Track connection metadata
        self.connection_metadata: Dict[WebSocket, Dict] = {}
        # Security scheme for token validation
        self.security = HTTPBearer()
    
    async def connect(self, websocket: WebSocket, market_zone: str, user_id: Optional[UUID] = None):
        """Accept a new WebSocket connection"""
        await websocket.accept()
        
        # Add to active connections
        if market_zone not in self.active_connections:
            self.active_connections[market_zone] = set()
        
        self.active_connections[market_zone].add(websocket)
        
        # Store metadata
        connection_data = {
            'user_id': user_id,
            'connected_at': datetime.utcnow(),
            'market_zone': market_zone,
            'connection_id': str(uuid4())
        }
        self.connection_metadata[websocket] = connection_data
        
        # Cache connection in Redis
        await redis_cache.cache_websocket_connection(
            connection_data['connection_id'],
            market_zone,
            user_id
        )
        
        logger.info(f"WebSocket connected: {connection_data['connection_id']} for zone {market_zone}")
        
        # Send welcome message
        await self.send_personal_message(websocket, {
            'type': 'connection_established',
            'connection_id': connection_data['connection_id'],
            'market_zone': market_zone,
            'timestamp': datetime.utcnow().isoformat(),
            'message': f'Connected to {market_zone} market updates'
        })
    
    def disconnect(self, websocket: WebSocket):
        """Remove a WebSocket connection"""
        if websocket in self.connection_metadata:
            metadata = self.connection_metadata[websocket]
            market_zone = metadata['market_zone']
            
            # Remove from active connections
            if market_zone in self.active_connections:
                self.active_connections[market_zone].discard(websocket)
                # Clean up empty sets
                if not self.active_connections[market_zone]:
                    del self.active_connections[market_zone]
            
            # Invalidate connection in Redis
            connection_id = metadata.get('connection_id')
            if connection_id:
                asyncio.create_task(redis_cache.invalidate_websocket_connection(connection_id))
            
            # Remove metadata
            del self.connection_metadata[websocket]
            
            logger.info(f"WebSocket disconnected: {connection_id} from zone {market_zone}")
    
    async def send_personal_message(self, websocket: WebSocket, message: dict):
        """Send a message to a specific WebSocket connection"""
        try:
            await websocket.send_text(json.dumps(message))
        except Exception as e:
            logger.error(f"Failed to send personal message: {e}")
            self.disconnect(websocket)
    
    async def broadcast_to_market_zone(self, market_zone: str, message: dict):
        """Broadcast a message to all connections for a specific market zone"""
        if market_zone not in self.active_connections:
            return
        
        disconnected_connections = []
        
        for connection in self.active_connections[market_zone].copy():
            try:
                await connection.send_text(json.dumps(message))
            except Exception as e:
                logger.error(f"Failed to broadcast to connection: {e}")
                disconnected_connections.append(connection)
        
        # Clean up disconnected connections
        for connection in disconnected_connections:
            self.disconnect(connection)
    
    async def broadcast_to_all_zones(self, message: dict):
        """Broadcast a message to all connected clients"""
        all_connections = []
        for zone_connections in self.active_connections.values():
            all_connections.extend(zone_connections)
        
        disconnected_connections = []
        
        for connection in all_connections:
            try:
                await connection.send_text(json.dumps(message))
            except Exception as e:
                logger.error(f"Failed to broadcast to connection: {e}")
                disconnected_connections.append(connection)
        
        # Clean up disconnected connections
        for connection in disconnected_connections:
            self.disconnect(connection)
    
    def get_connection_count(self, market_zone: Optional[str] = None) -> int:
        """Get the number of active connections"""
        if market_zone:
            return len(self.active_connections.get(market_zone, set()))
        else:
            return sum(len(connections) for connections in self.active_connections.values())
    
    def get_market_zones(self) -> List[str]:
        """Get list of market zones with active connections"""
        return list(self.active_connections.keys())


# Global connection manager instance
manager = ConnectionManager()


class WebSocketHandler:
    """Handles WebSocket connections and authentication"""
    
    @staticmethod
    async def authenticate_user(websocket: WebSocket, credentials: Optional[HTTPAuthorizationCredentials] = None) -> Optional[UUID]:
        """Authenticate user via WebSocket token"""
        try:
            if not credentials:
                return None  # Allow anonymous connections for demo
            
            token = credentials.credentials
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            user_id: str = payload.get("sub")
            if user_id is None:
                return None
            
            return UUID(user_id)
            
        except JWTError:
            logger.error("Invalid WebSocket token")
            return None
        except Exception as e:
            logger.error(f"WebSocket authentication error: {e}")
            return None
    
    @staticmethod
    async def handle_market_data_connection(websocket: WebSocket, market_zone: str, user_id: Optional[UUID] = None):
        """Handle market data WebSocket connection"""
        try:
            # Add connection to manager
            await manager.connect(websocket, market_zone, user_id)
            
            # Send initial market data
            latest_price = await redis_cache.get_latest_price(market_zone)
            if latest_price:
                await manager.send_personal_message(websocket, {
                    'type': 'initial_data',
                    'market_zone': market_zone,
                    'latest_price': latest_price,
                    'timestamp': datetime.utcnow().isoformat()
                })
            
            # Keep connection alive and handle incoming messages
            while True:
                try:
                    # Wait for messages from client
                    data = await websocket.receive_text()
                    message = json.loads(data)
                    
                    # Handle different message types
                    if message.get('type') == 'ping':
                        await manager.send_personal_message(websocket, {
                            'type': 'pong',
                            'timestamp': datetime.utcnow().isoformat()
                        })
                    elif message.get('type') == 'subscribe_alerts':
                        # Handle alert subscriptions
                        alert_types = message.get('alert_types', [])
                        await manager.send_personal_message(websocket, {
                            'type': 'alert_subscription_confirmed',
                            'alert_types': alert_types,
                            'timestamp': datetime.utcnow().isoformat()
                        })
                    elif message.get('type') == 'request_price_history':
                        # Handle price history requests
                        hours = message.get('hours', 24)
                        price_history = await redis_cache.get_price_history(market_zone, hours)
                        if price_history:
                            await manager.send_personal_message(websocket, {
                                'type': 'price_history',
                                'market_zone': market_zone,
                                'hours': hours,
                                'data': price_history,
                                'timestamp': datetime.utcnow().isoformat()
                            })
                    
                except WebSocketDisconnect:
                    break
                except json.JSONDecodeError:
                    logger.warning("Invalid JSON received from WebSocket")
                except Exception as e:
                    logger.error(f"Error handling WebSocket message: {e}")
                    break
                    
        except WebSocketDisconnect:
            logger.info("WebSocket client disconnected")
        except Exception as e:
            logger.error(f"WebSocket error: {e}")
        finally:
            manager.disconnect(websocket)
    
    @staticmethod
    async def broadcast_price_update(market_zone: str, price: float, volume: float, timestamp: datetime):
        """Broadcast price update to all connected clients"""
        message = {
            'type': 'price_update',
            'market_zone': market_zone,
            'price': price,
            'volume': volume,
            'timestamp': timestamp.isoformat()
        }
        
        await manager.broadcast_to_market_zone(market_zone, message)
        
        # Also cache the latest price
        await redis_cache.cache_latest_price(market_zone, {
            'price': price,
            'volume': volume,
            'timestamp': timestamp.isoformat()
        })
        
        logger.info(f"Price update broadcasted for {market_zone}: ${price:.2f}")
    
    @staticmethod
    async def broadcast_market_alert(market_zone: str, alert_type: str, message_text: str, severity: str = 'info'):
        """Broadcast market alert to all connected clients"""
        message = {
            'type': 'market_alert',
            'market_zone': market_zone,
            'alert_type': alert_type,
            'message': message_text,
            'severity': severity,
            'timestamp': datetime.utcnow().isoformat()
        }
        
        await manager.broadcast_to_market_zone(market_zone, message)
        
        logger.info(f"Market alert broadcasted for {market_zone}: {alert_type} - {message_text}")
    
    @staticmethod
    async def get_connection_stats() -> Dict[str, any]:
        """Get WebSocket connection statistics"""
        return {
            'total_connections': manager.get_connection_count(),
            'connections_by_zone': {
                zone: manager.get_connection_count(zone) 
                for zone in manager.get_market_zones()
            },
            'active_zones': manager.get_market_zones(),
            'timestamp': datetime.utcnow().isoformat()
        }


# WebSocket utilities for broadcasting updates
class WebSocketBroadcaster:
    """Utilities for broadcasting updates to WebSocket clients"""
    
    @staticmethod
    async def notify_price_change(market_zone: str, old_price: float, new_price: float, volume: float):
        """Notify all clients of price changes"""
        change_percent = ((new_price - old_price) / old_price) * 100 if old_price > 0 else 0
        
        await manager.broadcast_to_market_zone(market_zone, {
            'type': 'price_change',
            'market_zone': market_zone,
            'old_price': old_price,
            'new_price': new_price,
            'change_percent': change_percent,
            'volume': volume,
            'timestamp': datetime.utcnow().isoformat()
        })
    
    @staticmethod
    async def notify_bid_status(market_zone: str, bid_id: str, status: str, price: float):
        """Notify clients of bid status changes"""
        await manager.broadcast_to_market_zone(market_zone, {
            'type': 'bid_update',
            'market_zone': market_zone,
            'bid_id': bid_id,
            'status': status,
            'price': price,
            'timestamp': datetime.utcnow().isoformat()
        })
    
    @staticmethod
    async def notify_market_open_close(market_zone: str, status: str):
        """Notify clients of market open/close status"""
        await manager.broadcast_to_market_zone(market_zone, {
            'type': 'market_status',
            'market_zone': market_zone,
            'status': status,  # 'open' or 'closed'
            'timestamp': datetime.utcnow().isoformat()
        })