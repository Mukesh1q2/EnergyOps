"""
Manual test script for WebSocket fallback functionality
Tests WebSocket connections with and without Redis
"""

import asyncio
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

from app.services.websocket_manager import manager, in_memory_storage
from app.services.redis_cache import redis_cache


async def test_in_memory_storage():
    """Test in-memory storage backend"""
    print("\n=== Testing In-Memory Storage ===")
    
    # Test connection caching
    await in_memory_storage.cache_websocket_connection(
        "test-conn-1", "pjm", None
    )
    
    conn = await in_memory_storage.get_websocket_connection("test-conn-1")
    assert conn is not None, "Connection should be cached"
    assert conn['market_zone'] == 'pjm', "Market zone should match"
    print("✓ Connection caching works")
    
    # Test price caching
    await in_memory_storage.cache_latest_price("pjm", {
        'price': 50.0,
        'volume': 100.0,
        'timestamp': '2025-11-22T00:00:00Z'
    })
    
    price = await in_memory_storage.get_latest_price("pjm")
    assert price is not None, "Price should be cached"
    assert price['price'] == 50.0, "Price should match"
    print("✓ Price caching works")
    
    # Test connection invalidation
    await in_memory_storage.invalidate_websocket_connection("test-conn-1")
    conn = await in_memory_storage.get_websocket_connection("test-conn-1")
    assert conn is None, "Connection should be invalidated"
    print("✓ Connection invalidation works")
    
    print("✓ All in-memory storage tests passed!")


async def test_storage_backend_selection():
    """Test storage backend selection logic"""
    print("\n=== Testing Storage Backend Selection ===")
    
    # Test with Redis unavailable
    redis_cache.is_connected = False
    manager.set_storage_backend(use_redis=True)
    
    assert manager.storage_backend == in_memory_storage, "Should use in-memory when Redis unavailable"
    assert not manager.using_redis, "Should not be using Redis"
    print("✓ Falls back to in-memory when Redis unavailable")
    
    # Test with Redis available (simulated)
    redis_cache.is_connected = True
    manager.set_storage_backend(use_redis=True)
    
    assert manager.storage_backend == redis_cache, "Should use Redis when available"
    assert manager.using_redis, "Should be using Redis"
    print("✓ Uses Redis when available")
    
    # Reset for other tests
    redis_cache.is_connected = False
    manager.set_storage_backend(use_redis=False)
    
    print("✓ All storage backend selection tests passed!")


async def test_connection_statistics():
    """Test connection statistics tracking"""
    print("\n=== Testing Connection Statistics ===")
    
    stats = manager.get_statistics()
    
    assert 'total_connections' in stats, "Should have total_connections"
    assert 'total_disconnections' in stats, "Should have total_disconnections"
    assert 'total_messages_sent' in stats, "Should have total_messages_sent"
    assert 'total_messages_received' in stats, "Should have total_messages_received"
    assert 'connection_errors' in stats, "Should have connection_errors"
    assert 'active_connections' in stats, "Should have active_connections"
    assert 'storage_backend' in stats, "Should have storage_backend"
    
    print(f"✓ Statistics structure is correct")
    print(f"  Storage backend: {stats['storage_backend']}")
    print(f"  Active connections: {stats['active_connections']}")
    
    print("✓ All connection statistics tests passed!")


async def main():
    """Run all tests"""
    print("Starting WebSocket Fallback Tests...")
    
    try:
        await test_in_memory_storage()
        await test_storage_backend_selection()
        await test_connection_statistics()
        
        print("\n" + "="*50)
        print("✓ ALL TESTS PASSED!")
        print("="*50)
        
    except AssertionError as e:
        print(f"\n✗ TEST FAILED: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"\n✗ ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
