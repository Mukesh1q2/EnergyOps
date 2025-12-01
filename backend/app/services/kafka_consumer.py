"""
Kafka Consumer Service for Real-time Market Data
Handles consuming market data events and processing them
"""

import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import Any, Dict, Optional
from uuid import UUID

from kafka import KafkaConsumer
from kafka.errors import KafkaError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import sessionmaker

from ..schemas import MarketDataCreate
from ..crud import market_data as crud_market_data

logger = logging.getLogger(__name__)


class KafkaConsumerService:
    """Kafka consumer for processing real-time market data"""
    
    def __init__(self, bootstrap_servers: str = "localhost:9092", db_sessionmaker: Optional[sessionmaker] = None):
        self.bootstrap_servers = bootstrap_servers
        self.db_sessionmaker = db_sessionmaker
        self.consumer: Optional[KafkaConsumer] = None
        self.is_running = False
        self.topics = [
            "market_data.pjm", "market_data.caiso", "market_data.ercot", 
            "market_data.nyiso", "market_data.miso", "market_data.spp"
        ]
        
    async def initialize(self):
        """Initialize Kafka consumer connection"""
        try:
            self.consumer = KafkaConsumer(
                *self.topics,
                bootstrap_servers=self.bootstrap_servers,
                value_deserializer=lambda m: json.loads(m.decode('utf-8')) if m else None,
                key_deserializer=lambda k: k.decode('utf-8') if k else None,
                group_id='optibid_consumer_group',
                auto_offset_reset='latest',
                enable_auto_commit=True,
                auto_commit_interval_ms=1000,
                consumer_timeout_ms=1000
            )
            logger.info("Kafka consumer initialized successfully")
            logger.info(f"Subscribed to topics: {', '.join(self.topics)}")
        except Exception as e:
            logger.error(f"Failed to initialize Kafka consumer: {e}")
            raise
    
    async def process_message(self, message):
        """Process a single Kafka message"""
        try:
            topic = message.topic
            key = message.key
            value = message.value
            
            if not value:
                logger.warning("Received empty message")
                return
            
            logger.info(f"Processing message from {topic}: {value}")
            
            # Extract market zone from topic
            market_zone = topic.split('.')[1] if '.' in topic else 'unknown'
            
            # Process different event types
            if value.get('event_type') == 'price_update':
                await self._handle_price_update(value, market_zone)
            elif value.get('event_type') == 'bid_update':
                await self._handle_bid_update(value, market_zone)
            elif value.get('event_type') == 'market_close':
                await self._handle_market_close(value, market_zone)
            else:
                logger.warning(f"Unknown event type: {value.get('event_type')}")
                
        except Exception as e:
            logger.error(f"Error processing message: {e}")
    
    async def _handle_price_update(self, data: Dict[str, Any], market_zone: str):
        """Handle price update events"""
        try:
            if not self.db_sessionmaker:
                logger.warning("No database sessionmaker available, skipping price update")
                return
            
            async with self.db_sessionmaker() as session:
                # Create market data record
                market_data_in = MarketDataCreate(
                    timestamp=datetime.fromisoformat(data['timestamp'].replace('Z', '+00:00')) if isinstance(data['timestamp'], str) else data['timestamp'],
                    price=data['price'],
                    volume=data['volume'],
                    market_zone=market_zone,
                    asset_id=data.get('asset_id'),
                    event_type=data['event_type']
                )
                
                # Save to database
                await crud_market_data.create(session, obj_in=market_data_in)
                await session.commit()
                
                logger.info(f"Price update saved for {market_zone}: {data['price']}")
                
        except Exception as e:
            logger.error(f"Error handling price update: {e}")
    
    async def _handle_bid_update(self, data: Dict[str, Any], market_zone: str):
        """Handle bid update events"""
        try:
            logger.info(f"Bid update received for bid {data.get('bid_id')}: {data.get('price', 'N/A')}")
            # Additional bid processing logic can be added here
        except Exception as e:
            logger.error(f"Error handling bid update: {e}")
    
    async def _handle_market_close(self, data: Dict[str, Any], market_zone: str):
        """Handle market close events"""
        try:
            logger.info(f"Market close notification for {market_zone}")
            # Handle end-of-day processing, reporting, etc.
        except Exception as e:
            logger.error(f"Error handling market close: {e}")
    
    async def start_consuming(self):
        """Start consuming messages from Kafka topics"""
        if not self.consumer:
            logger.error("Kafka consumer not initialized")
            return
        
        self.is_running = True
        logger.info("Starting Kafka consumer...")
        
        try:
            while self.is_running:
                # Poll for messages with timeout
                message_batch = self.consumer.poll(timeout_ms=1000)
                
                for topic_partition, messages in message_batch.items():
                    for message in messages:
                        await self.process_message(message)
                        
                # Small delay to prevent busy waiting
                await asyncio.sleep(0.1)
                
        except KafkaError as e:
            logger.error(f"Kafka consumer error: {e}")
        except Exception as e:
            logger.error(f"Unexpected error in consumer: {e}")
        finally:
            await self.stop_consuming()
    
    async def stop_consuming(self):
        """Stop consuming messages"""
        self.is_running = False
        logger.info("Stopping Kafka consumer...")
    
    async def close(self):
        """Close Kafka consumer connection"""
        if self.consumer:
            self.consumer.close()
            logger.info("Kafka consumer closed")


# Global Kafka consumer instance
kafka_consumer: Optional[KafkaConsumerService] = None


async def start_kafka_consumer(db_sessionmaker: sessionmaker):
    """Start the Kafka consumer service"""
    global kafka_consumer
    kafka_consumer = KafkaConsumerService(db_sessionmaker=db_sessionmaker)
    await kafka_consumer.initialize()
    
    # Start consuming in the background
    asyncio.create_task(kafka_consumer.start_consuming())
    logger.info("Kafka consumer service started")


async def stop_kafka_consumer():
    """Stop the Kafka consumer service"""
    global kafka_consumer
    if kafka_consumer:
        await kafka_consumer.stop_consuming()
        await kafka_consumer.close()
        kafka_consumer = None