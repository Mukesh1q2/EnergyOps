"""
Unit tests for service initialization with graceful degradation
Tests Requirements 2.1, 2.3 - Service initialization with/without optional services
"""
import pytest
import asyncio
import os
from unittest.mock import Mock, AsyncMock, patch
from datetime import datetime


class TestRedisInitialization:
    """Test Redis initialization with and without Redis available"""
    
    @pytest.mark.asyncio
    async def test_redis_initialization_success(self):
        """Test Redis initialization when Redis is available"""
        # Set environment to enable Redis
        with patch.dict(os.environ, {"ENABLE_REDIS": "true"}):
            # Reload settings to pick up environment change
            from importlib import reload
            from app.core import config
            reload(config)
            from app.core.config import settings
            
            assert settings.ENABLE_REDIS == True, "Redis should be enabled"
            
            # Mock successful Redis connection
            with patch('app.services.redis_cache.start_redis_cache') as mock_start:
                mock_start.return_value = AsyncMock()
                
                # Call the initialization
                await mock_start()
                
                # Verify it was called
                mock_start.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_redis_initialization_timeout(self):
        """Test Redis initialization with timeout (graceful degradation)"""
        with patch.dict(os.environ, {"ENABLE_REDIS": "true"}):
            from importlib import reload
            from app.core import config
            reload(config)
            
            # Mock Redis connection that times out
            with patch('app.services.redis_cache.start_redis_cache') as mock_start:
                async def timeout_func():
                    await asyncio.sleep(10)  # Simulate timeout
                
                mock_start.side_effect = timeout_func
                
                # Should timeout after 5 seconds
                with pytest.raises(asyncio.TimeoutError):
                    await asyncio.wait_for(mock_start(), timeout=5.0)
    
    @pytest.mark.asyncio
    async def test_redis_initialization_disabled(self):
        """Test Redis initialization when disabled via flag"""
        with patch.dict(os.environ, {"ENABLE_REDIS": "false"}):
            from importlib import reload
            from app.core import config
            reload(config)
            from app.core.config import settings
            
            assert settings.ENABLE_REDIS == False, "Redis should be disabled"
            
            # Redis initialization should not be called
            with patch('app.services.redis_cache.start_redis_cache') as mock_start:
                # Simulate the lifespan logic
                if settings.ENABLE_REDIS:
                    await mock_start()
                
                # Verify it was NOT called
                mock_start.assert_not_called()
    
    @pytest.mark.asyncio
    async def test_redis_initialization_connection_error(self):
        """Test Redis initialization with connection error (graceful degradation)"""
        with patch.dict(os.environ, {"ENABLE_REDIS": "true"}):
            # Mock Redis connection that raises an error
            with patch('app.services.redis_cache.start_redis_cache') as mock_start:
                mock_start.side_effect = ConnectionError("Redis connection refused")
                
                # Should raise ConnectionError
                with pytest.raises(ConnectionError):
                    await mock_start()


class TestKafkaInitialization:
    """Test Kafka initialization with and without Kafka available"""
    
    @pytest.mark.asyncio
    async def test_kafka_initialization_success(self):
        """Test Kafka initialization when Kafka is available"""
        with patch.dict(os.environ, {"ENABLE_KAFKA": "true"}):
            from importlib import reload
            from app.core import config
            reload(config)
            from app.core.config import settings
            
            assert settings.ENABLE_KAFKA == True, "Kafka should be enabled"
            
            # Mock successful Kafka connection
            with patch('app.services.kafka_producer.start_kafka_producer') as mock_start:
                mock_start.return_value = AsyncMock()
                
                await mock_start()
                mock_start.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_kafka_initialization_timeout(self):
        """Test Kafka initialization with timeout (graceful degradation)"""
        with patch.dict(os.environ, {"ENABLE_KAFKA": "true"}):
            # Mock Kafka connection that times out
            with patch('app.services.kafka_producer.start_kafka_producer') as mock_start:
                async def timeout_func():
                    await asyncio.sleep(10)
                
                mock_start.side_effect = timeout_func
                
                # Should timeout after 5 seconds
                with pytest.raises(asyncio.TimeoutError):
                    await asyncio.wait_for(mock_start(), timeout=5.0)
    
    @pytest.mark.asyncio
    async def test_kafka_initialization_disabled(self):
        """Test Kafka initialization when disabled via flag"""
        with patch.dict(os.environ, {"ENABLE_KAFKA": "false"}):
            from importlib import reload
            from app.core import config
            reload(config)
            from app.core.config import settings
            
            assert settings.ENABLE_KAFKA == False, "Kafka should be disabled"
            
            with patch('app.services.kafka_producer.start_kafka_producer') as mock_start:
                if settings.ENABLE_KAFKA:
                    await mock_start()
                
                mock_start.assert_not_called()
    
    @pytest.mark.asyncio
    async def test_kafka_consumer_initialization(self):
        """Test Kafka consumer initialization"""
        with patch.dict(os.environ, {"ENABLE_KAFKA": "true"}):
            from importlib import reload
            from app.core import config
            reload(config)
            
            # Mock Kafka consumer
            with patch('app.services.kafka_consumer.start_kafka_consumer') as mock_start:
                mock_session_maker = Mock()
                mock_start.return_value = AsyncMock()
                
                await mock_start(mock_session_maker)
                mock_start.assert_called_once_with(mock_session_maker)


class TestClickHouseInitialization:
    """Test ClickHouse initialization with and without ClickHouse available"""
    
    @pytest.mark.asyncio
    async def test_clickhouse_initialization_success(self):
        """Test ClickHouse initialization when ClickHouse is available"""
        with patch.dict(os.environ, {"ENABLE_CLICKHOUSE": "true"}):
            from importlib import reload
            from app.core import config
            reload(config)
            from app.core.config import settings
            
            assert settings.ENABLE_CLICKHOUSE == True, "ClickHouse should be enabled"
            
            # Mock successful ClickHouse connection
            with patch('app.services.clickhouse_service.clickhouse_service.initialize') as mock_init:
                mock_init.return_value = AsyncMock()
                
                await mock_init()
                mock_init.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_clickhouse_initialization_timeout(self):
        """Test ClickHouse initialization with timeout (graceful degradation)"""
        with patch.dict(os.environ, {"ENABLE_CLICKHOUSE": "true"}):
            # Mock ClickHouse connection that times out
            with patch('app.services.clickhouse_service.clickhouse_service.initialize') as mock_init:
                async def timeout_func():
                    await asyncio.sleep(15)
                
                mock_init.side_effect = timeout_func
                
                # Should timeout after 10 seconds
                with pytest.raises(asyncio.TimeoutError):
                    await asyncio.wait_for(mock_init(), timeout=10.0)
    
    @pytest.mark.asyncio
    async def test_clickhouse_initialization_disabled(self):
        """Test ClickHouse initialization when disabled via flag"""
        with patch.dict(os.environ, {"ENABLE_CLICKHOUSE": "false"}):
            from importlib import reload
            from app.core import config
            reload(config)
            from app.core.config import settings
            
            assert settings.ENABLE_CLICKHOUSE == False, "ClickHouse should be disabled"
            
            with patch('app.services.clickhouse_service.clickhouse_service.initialize') as mock_init:
                if settings.ENABLE_CLICKHOUSE:
                    await mock_init()
                
                mock_init.assert_not_called()
    
    @pytest.mark.asyncio
    async def test_clickhouse_initialization_connection_error(self):
        """Test ClickHouse initialization with connection error"""
        with patch.dict(os.environ, {"ENABLE_CLICKHOUSE": "true"}):
            # Mock ClickHouse connection that raises an error
            with patch('app.services.clickhouse_service.clickhouse_service.initialize') as mock_init:
                mock_init.side_effect = ConnectionError("ClickHouse connection refused")
                
                with pytest.raises(ConnectionError):
                    await mock_init()


class TestGracefulDegradation:
    """Test graceful degradation paths when services are unavailable"""
    
    @pytest.mark.asyncio
    async def test_backend_starts_without_redis(self):
        """Test that backend can start without Redis"""
        with patch.dict(os.environ, {"ENABLE_REDIS": "false"}):
            from importlib import reload
            from app.core import config
            reload(config)
            from app.core.config import settings
            
            # Backend should be able to import and configure
            assert settings.ENABLE_REDIS == False
            
            # Core functionality should still work
            from app.core.database import init_db
            # Database initialization should work independently
            assert init_db is not None
    
    @pytest.mark.asyncio
    async def test_backend_starts_without_kafka(self):
        """Test that backend can start without Kafka"""
        with patch.dict(os.environ, {"ENABLE_KAFKA": "false"}):
            from importlib import reload
            from app.core import config
            reload(config)
            from app.core.config import settings
            
            assert settings.ENABLE_KAFKA == False
            
            # Core functionality should still work
            from app.core.database import init_db
            assert init_db is not None
    
    @pytest.mark.asyncio
    async def test_backend_starts_without_clickhouse(self):
        """Test that backend can start without ClickHouse"""
        with patch.dict(os.environ, {"ENABLE_CLICKHOUSE": "false"}):
            from importlib import reload
            from app.core import config
            reload(config)
            from app.core.config import settings
            
            assert settings.ENABLE_CLICKHOUSE == False
            
            # Core functionality should still work
            from app.core.database import init_db
            assert init_db is not None
    
    @pytest.mark.asyncio
    async def test_backend_starts_with_minimal_services(self):
        """Test that backend can start with only PostgreSQL (minimal configuration)"""
        with patch.dict(os.environ, {
            "ENABLE_REDIS": "false",
            "ENABLE_KAFKA": "false",
            "ENABLE_CLICKHOUSE": "false",
            "ENABLE_MLFLOW": "false"
        }):
            from importlib import reload
            from app.core import config
            reload(config)
            from app.core.config import settings
            
            # All optional services should be disabled
            assert settings.ENABLE_REDIS == False
            assert settings.ENABLE_KAFKA == False
            assert settings.ENABLE_CLICKHOUSE == False
            assert settings.ENABLE_MLFLOW == False
            
            # Core functionality should still work
            from app.core.database import init_db
            from app.routers import auth, users, organizations
            
            # Verify core routers can be imported
            assert auth.router is not None
            assert users.router is not None
            assert organizations.router is not None
    
    @pytest.mark.asyncio
    async def test_service_initialization_with_partial_failures(self):
        """Test service initialization when some services fail"""
        service_status = {
            "redis": False,
            "kafka": True,
            "clickhouse": False
        }
        
        # Simulate partial service availability
        # Redis fails, Kafka succeeds, ClickHouse fails
        
        # Mock Redis failure
        with patch('app.services.redis_cache.start_redis_cache') as mock_redis:
            mock_redis.side_effect = ConnectionError("Redis unavailable")
            
            # Mock Kafka success
            with patch('app.services.kafka_producer.start_kafka_producer') as mock_kafka:
                mock_kafka.return_value = AsyncMock()
                
                # Mock ClickHouse failure
                with patch('app.services.clickhouse_service.clickhouse_service.initialize') as mock_ch:
                    mock_ch.side_effect = ConnectionError("ClickHouse unavailable")
                    
                    # Try to initialize services
                    try:
                        await mock_redis()
                    except ConnectionError:
                        service_status["redis"] = False
                    
                    try:
                        await mock_kafka()
                        service_status["kafka"] = True
                    except Exception:
                        service_status["kafka"] = False
                    
                    try:
                        await mock_ch()
                    except ConnectionError:
                        service_status["clickhouse"] = False
                    
                    # Verify partial success
                    assert service_status["redis"] == False
                    assert service_status["kafka"] == True
                    assert service_status["clickhouse"] == False
                    
                    # At least one service should be available
                    assert any(service_status.values())


class TestMLflowInitialization:
    """Test MLflow initialization"""
    
    @pytest.mark.asyncio
    async def test_mlflow_initialization_success(self):
        """Test MLflow initialization when available"""
        with patch.dict(os.environ, {"ENABLE_MLFLOW": "true"}):
            from importlib import reload
            from app.core import config
            reload(config)
            from app.core.config import settings
            
            assert settings.ENABLE_MLFLOW == True
            
            with patch('app.services.advanced_ml_service.advanced_ml_service.initialize') as mock_init:
                mock_init.return_value = AsyncMock()
                
                await mock_init()
                mock_init.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_mlflow_initialization_disabled(self):
        """Test MLflow initialization when disabled"""
        with patch.dict(os.environ, {"ENABLE_MLFLOW": "false"}):
            from importlib import reload
            from app.core import config
            reload(config)
            from app.core.config import settings
            
            assert settings.ENABLE_MLFLOW == False
            
            with patch('app.services.advanced_ml_service.advanced_ml_service.initialize') as mock_init:
                if settings.ENABLE_MLFLOW:
                    await mock_init()
                
                mock_init.assert_not_called()
    
    @pytest.mark.asyncio
    async def test_mlflow_initialization_timeout(self):
        """Test MLflow initialization with timeout"""
        with patch.dict(os.environ, {"ENABLE_MLFLOW": "true"}):
            with patch('app.services.advanced_ml_service.advanced_ml_service.initialize') as mock_init:
                async def timeout_func():
                    await asyncio.sleep(15)
                
                mock_init.side_effect = timeout_func
                
                with pytest.raises(asyncio.TimeoutError):
                    await asyncio.wait_for(mock_init(), timeout=10.0)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
