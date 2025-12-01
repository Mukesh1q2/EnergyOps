"""
Kafka Producer Service for Real-time Market Data
Handles publishing market price updates and trading signals to Kafka topics
"""

import asyncio
import json
import logging
from datetime import datetime
from typing import Any, Dict, Optional
from uuid import UUID

from kafka import KafkaProducer
from kafka.errors import KafkaError
from pydantic import BaseModel

logger = logging.getLogger(__name__)


class MarketDataEvent(BaseModel):
    """Market data event model"""
    event_id: UUID
    timestamp: datetime
    market_zone: str
    asset_id: Optional[UUID] = None
    price: float
    volume: float
    bid_id: Optional[UUID] = None
    event_type: str  # 'price_update', 'bid_update', 'market_close'


class KafkaProducerService:
    """Kafka producer for publishing real-time market data"""
    
    def __init__(self, bootstrap_servers: str = "localhost:9092"):
        self.bootstrap_servers = bootstrap_servers
        self.producer: Optional[KafkaProducer] = None
        self.is_connected = False
        
    async def initialize(self):
        """Initialize Kafka producer connection"""
        try:
            self.producer = KafkaProducer(
                bootstrap_servers=self.bootstrap_servers,
                value_serializer=lambda v: json.dumps(v, default=str).encode('utf-8'),
                key_serializer=lambda k: str(k).encode('utf-8') if k else None,
                acks='all',  # Ensure all replicas acknowledge
                retries=3,
                batch_size=16384,
                linger_ms=10,
                compression_type='gzip'
            )
            self.is_connected = True
            logger.info("Kafka producer initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Kafka producer: {e}")
            raise
    
    async def publish_market_data(self, event: MarketDataEvent) -> bool:
        """Publish market data event to Kafka topic"""
        if not self.is_connected or not self.producer:
            logger.error("Kafka producer not initialized")
            return False
        
        try:
            topic = f"market_data.{event.market_zone}"
            key = f"{event.market_zone}.{event.timestamp.isoformat()}"
            
            # Send to Kafka
            future = self.producer.send(
                topic, 
                key=key,
                value=event.dict()
            )
            
            # Wait for confirmation
            record_metadata = future.get(timeout=10)
            
            logger.info(f"Market data published to {record_metadata.topic}:{record_metadata.partition}")
            return True
            
        except KafkaError as e:
            logger.error(f"Failed to publish market data: {e}")
            return False
    
    async def publish_price_update(self, market_zone: str, price: float, volume: float, asset_id: Optional[UUID] = None):
        """Convenience method for price updates"""
        event = MarketDataEvent(
            event_id=UUID('00000000-0000-0000-0000-000000000000'),  # Will be generated properly
            timestamp=datetime.utcnow(),
            market_zone=market_zone,
            asset_id=asset_id,
            price=price,
            volume=volume,
            event_type='price_update'
        )
        return await self.publish_market_data(event)
    
    async def publish_bid_update(self, bid_id: UUID, market_zone: str, status: str, price: float):
        """Publish bid status updates"""
        event = MarketDataEvent(
            event_id=bid_id,
            timestamp=datetime.utcnow(),
            market_zone=market_zone,
            bid_id=bid_id,
            price=price,
            volume=0.0,
            event_type='bid_update'
        )
        return await self.publish_market_data(event)
    
    async def close(self):
        """Close Kafka producer connection"""
        if self.producer:
            self.producer.close()
            self.is_connected = False
            logger.info("Kafka producer closed")


# Global Kafka producer instance
kafka_producer = KafkaProducerService()


async def start_kafka_producer():
    """Start the Kafka producer service"""
    await kafka_producer.initialize()


async def stop_kafka_producer():
    """Stop the Kafka producer service"""
    await kafka_producer.close()