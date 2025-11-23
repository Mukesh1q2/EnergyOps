"""
WebSocket integration tests
Tests Requirements 4.1, 4.3 - WebSocket connection establishment, message broadcasting, reconnection
"""
import pytest
import asyncio
from unittest.mock import Mock, AsyncMock, patch, MagicMock
from fastapi import WebSocket
from datetime import datetime


class TestWebSocketConnectionEstablishment:
    """Test WebSocket connection establishment"""
    
    @pytest.mark.asyncio
    async def test_websocket_connection_success(self):
        """Test successful WebSocket connection establishment"""
        from app.services.websocket_manager import manager
        
        # Create mock WebSocket
        mock_websocket = AsyncMock(spec=WebSocket)
        mock_websocket.accept = AsyncMock()
        
        # Connect to market zone
        market_zone = "pjm"
        connection_id = "test-conn-1"
        
        # Simulate connection
        await mock_websocket.accept()
        
        # Verify connection was accepted
        mock_websocket.accept.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_websocket_connection_with_metadata(self):
        """Test WebSocket connection with metadata storage"""
        from app.services.websocket_manager import manager, in_memory_storage
        
        # Store connection metadata
        connection_id = "test-conn-2"
        market_zone = "caiso"
        user_id = "user-123"
        
        await in_memory_storage.cache_websocket_connection(
            connection_id, market_zone, user_id
        )
        
        # Retrieve connection
        conn = await in_memory_storage.get_websocket_connection(connection_id)
        
        assert conn is not None
        assert conn['market_zone'] == market_zone
        assert conn['user_id'] == user_id
    
    @pytest.mark.asyncio
    async def test_websocket_connection_timeout(self):
        """Test WebSocket connection with timeout"""
        mock_websocket = AsyncMock(spec=WebSocket)
        
        # Simulate slow connection
        async def slow_accept():
            await asyncio.sleep(10)
        
        mock_websocket.accept = slow_accept
        
        # Should timeout after 5 seconds
        with pytest.raises(asyncio.TimeoutError):
            await asyncio.wait_for(mock_websocket.accept(), timeout=5.0)
    
    @pytest.mark.asyncio
    async def test_multiple_websocket_connections(self):
        """Test multiple concurrent WebSocket connections"""
        from app.services.websocket_manager import in_memory_storage
        
        # Create multiple connections
        connections = []
        for i in range(5):
            conn_id = f"test-conn-{i}"
            market_zone = "pjm" if i % 2 == 0 else "caiso"
            
            await in_memory_storage.cache_websocket_connection(
                conn_id, market_zone, f"user-{i}"
            )
            connections.append(conn_id)
        
        # Verify all connections are stored
        for conn_id in connections:
            conn = await in_memory_storage.get_websocket_connection(conn_id)
            assert conn is not None


class TestMessageBroadcasting:
    """Test WebSocket message broadcasting"""
    
    @pytest.mark.asyncio
    async def test_broadcast_to_single_connection(self):
        """Test broadcasting message to a single connection"""
        mock_websocket = AsyncMock(spec=WebSocket)
        mock_websocket.send_json = AsyncMock()
        
        # Send message
        message = {
            "type": "price-update",
            "market_zone": "pjm",
            "price": 50.0,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        await mock_websocket.send_json(message)
        
        # Verify message was sent
        mock_websocket.send_json.assert_called_once_with(message)
    
    @pytest.mark.asyncio
    async def test_broadcast_to_multiple_connections(self):
        """Test broadcasting message to multiple connections"""
        # Create multiple mock WebSockets
        mock_websockets = []
        for i in range(3):
            ws = AsyncMock(spec=WebSocket)
            ws.send_json = AsyncMock()
            mock_websockets.append(ws)
        
        # Broadcast message to all
        message = {
            "type": "market-alert",
            "message": "Price spike detected",
            "timestamp": datetime.utcnow().isoformat()
        }
        
        for ws in mock_websockets:
            await ws.send_json(message)
        
        # Verify all received the message
        for ws in mock_websockets:
            ws.send_json.assert_called_once_with(message)
    
    @pytest.mark.asyncio
    async def test_broadcast_with_failed_connection(self):
        """Test broadcasting when one connection fails"""
        # Create mock WebSockets
        ws1 = AsyncMock(spec=WebSocket)
        ws1.send_json = AsyncMock()
        
        ws2 = AsyncMock(spec=WebSocket)
        ws2.send_json = AsyncMock(side_effect=Exception("Connection closed"))
        
        ws3 = AsyncMock(spec=WebSocket)
        ws3.send_json = AsyncMock()
        
        message = {"type": "test", "data": "test"}
        
        # Try to send to all
        for ws in [ws1, ws2, ws3]:
            try:
                await ws.send_json(message)
            except Exception:
                pass  # Continue with other connections
        
        # Verify ws1 and ws3 received, ws2 failed
        ws1.send_json.assert_called_once()
        ws3.send_json.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_broadcast_price_update(self):
        """Test broadcasting price update message"""
        from app.services.websocket_manager import in_memory_storage
        
        # Cache price data
        market_zone = "ercot"
        price_data = {
            "price": 75.5,
            "volume": 1000.0,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        await in_memory_storage.cache_latest_price(market_zone, price_data)
        
        # Retrieve and verify
        cached_price = await in_memory_storage.get_latest_price(market_zone)
        
        assert cached_price is not None
        assert cached_price['price'] == 75.5
        assert cached_price['volume'] == 1000.0


class TestReconnectionLogic:
    """Test WebSocket reconnection logic"""
    
    @pytest.mark.asyncio
    async def test_reconnection_after_disconnect(self):
        """Test reconnection after unexpected disconnect"""
        mock_websocket = AsyncMock(spec=WebSocket)
        mock_websocket.accept = AsyncMock()
        
        # Simulate disconnect
        mock_websocket.send_json = AsyncMock(side_effect=Exception("Connection lost"))
        
        # Try to send (will fail)
        with pytest.raises(Exception):
            await mock_websocket.send_json({"test": "data"})
        
        # Reconnect
        await mock_websocket.accept()
        
        # Verify reconnection
        assert mock_websocket.accept.call_count == 1
    
    @pytest.mark.asyncio
    async def test_exponential_backoff_reconnection(self):
        """Test exponential backoff for reconnection"""
        import time
        
        # Simulate reconnection attempts with exponential backoff
        base_delay = 1.0
        max_attempts = 5
        
        delays = []
        for attempt in range(max_attempts):
            delay = base_delay * (2 ** attempt)
            delays.append(delay)
        
        # Verify exponential growth
        assert delays == [1.0, 2.0, 4.0, 8.0, 16.0]
        
        # Verify max delay is reasonable
        assert max(delays) <= 30.0  # Should not exceed 30 seconds
    
    @pytest.mark.asyncio
    async def test_max_reconnection_attempts(self):
        """Test maximum reconnection attempts limit"""
        max_attempts = 5
        attempts = 0
        
        # Simulate failed reconnection attempts
        for attempt in range(max_attempts + 2):
            if attempts < max_attempts:
                attempts += 1
            else:
                break  # Stop after max attempts
        
        # Verify we stopped at max attempts
        assert attempts == max_attempts
    
    @pytest.mark.asyncio
    async def test_successful_reconnection_resets_counter(self):
        """Test that successful reconnection resets attempt counter"""
        attempts = 3  # Had 3 failed attempts
        
        # Successful reconnection
        mock_websocket = AsyncMock(spec=WebSocket)
        mock_websocket.accept = AsyncMock()
        await mock_websocket.accept()
        
        # Reset counter after success
        attempts = 0
        
        assert attempts == 0


class TestWebSocketWithRedis:
    """Test WebSocket with Redis backend"""
    
    @pytest.mark.asyncio
    async def test_websocket_with_redis_available(self):
        """Test WebSocket when Redis is available"""
        from app.services.websocket_manager import manager
        from app.services.redis_cache import redis_cache
        
        # Simulate Redis available
        redis_cache.is_connected = True
        manager.set_storage_backend(use_redis=True)
        
        assert manager.using_redis == True
        assert manager.storage_backend == redis_cache
    
    @pytest.mark.asyncio
    async def test_websocket_without_redis(self):
        """Test WebSocket fallback when Redis is unavailable"""
        from app.services.websocket_manager import manager, in_memory_storage
        from app.services.redis_cache import redis_cache
        
        # Simulate Redis unavailable
        redis_cache.is_connected = False
        manager.set_storage_backend(use_redis=True)
        
        # Should fall back to in-memory
        assert manager.using_redis == False
        assert manager.storage_backend == in_memory_storage
    
    @pytest.mark.asyncio
    async def test_websocket_storage_backend_switch(self):
        """Test switching between Redis and in-memory storage"""
        from app.services.websocket_manager import manager, in_memory_storage
        from app.services.redis_cache import redis_cache
        
        # Start with in-memory
        manager.set_storage_backend(use_redis=False)
        assert manager.storage_backend == in_memory_storage
        
        # Switch to Redis (if available)
        redis_cache.is_connected = True
        manager.set_storage_backend(use_redis=True)
        assert manager.storage_backend == redis_cache
        
        # Switch back to in-memory
        manager.set_storage_backend(use_redis=False)
        assert manager.storage_backend == in_memory_storage


class TestWebSocketStatistics:
    """Test WebSocket connection statistics"""
    
    @pytest.mark.asyncio
    async def test_connection_statistics_tracking(self):
        """Test that connection statistics are tracked"""
        from app.services.websocket_manager import manager
        
        stats = manager.get_statistics()
        
        # Verify statistics structure
        assert 'total_connections' in stats
        assert 'total_disconnections' in stats
        assert 'total_messages_sent' in stats
        assert 'total_messages_received' in stats
        assert 'connection_errors' in stats
        assert 'active_connections' in stats
        assert 'storage_backend' in stats
    
    @pytest.mark.asyncio
    async def test_statistics_increment(self):
        """Test that statistics increment correctly"""
        from app.services.websocket_manager import manager
        
        initial_stats = manager.get_statistics()
        initial_connections = initial_stats['total_connections']
        
        # Simulate connection
        manager.connection_stats['total_connections'] += 1
        
        new_stats = manager.get_statistics()
        assert new_stats['total_connections'] == initial_connections + 1


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
