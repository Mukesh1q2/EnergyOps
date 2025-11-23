"""
CRUD operations for Market Data
Handles database operations for real-time market price data
"""

from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Union
from uuid import UUID

from sqlalchemy import and_, desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from .base import CRUDBase
from ..models import MarketData
from ..schemas import MarketDataCreate, MarketDataUpdate, MarketDataResponse


class CRUDMarketData(CRUDBase[MarketData, MarketDataCreate, MarketDataUpdate]):
    """CRUD operations for Market Data"""
    
    async def create_market_data(self, db: AsyncSession, *, obj_in: MarketDataCreate, organization_id: Optional[UUID] = None) -> MarketData:
        """Create new market data record"""
        return await self.create(db, obj_in=obj_in)
    
    async def get_by_market_zone_and_timestamp(
        self, 
        db: AsyncSession, 
        market_zone: str, 
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None,
        limit: int = 100
    ) -> List[MarketData]:
        """Get market data by market zone and time range"""
        
        query = select(MarketData).where(
            MarketData.market_zone == market_zone.lower()
        )
        
        if start_time:
            query = query.where(MarketData.timestamp >= start_time)
        
        if end_time:
            query = query.where(MarketData.timestamp <= end_time)
        
        query = query.order_by(desc(MarketData.timestamp)).limit(limit)
        
        result = await db.execute(query)
        return result.scalars().all()
    
    async def get_latest_by_market_zone(self, db: AsyncSession, market_zone: str) -> Optional[MarketData]:
        """Get the most recent market data for a market zone"""
        
        query = select(MarketData).where(
            MarketData.market_zone == market_zone.lower()
        ).order_by(desc(MarketData.timestamp)).limit(1)
        
        result = await db.execute(query)
        return result.scalar_one_or_none()
    
    async def get_price_history(
        self,
        db: AsyncSession,
        market_zone: str,
        hours: int = 24,
        limit: int = 1000
    ) -> List[MarketData]:
        """Get price history for a market zone over specified hours"""
        
        end_time = datetime.utcnow()
        start_time = end_time - timedelta(hours=hours)
        
        return await self.get_by_market_zone_and_timestamp(
            db, market_zone, start_time, end_time, limit
        )
    
    async def get_average_price(
        self,
        db: AsyncSession,
        market_zone: str,
        start_time: datetime,
        end_time: datetime
    ) -> Optional[float]:
        """Get average price for a market zone over time period"""
        
        query = select(func.avg(MarketData.price)).where(
            and_(
                MarketData.market_zone == market_zone.lower(),
                MarketData.timestamp >= start_time,
                MarketData.timestamp <= end_time
            )
        )
        
        result = await db.execute(query)
        avg_price = result.scalar()
        
        return float(avg_price) if avg_price else None
    
    async def get_price_statistics(
        self,
        db: AsyncSession,
        market_zone: str,
        hours: int = 24
    ) -> Dict[str, float]:
        """Get price statistics for a market zone"""
        
        end_time = datetime.utcnow()
        start_time = end_time - timedelta(hours=hours)
        
        query = select(
            func.avg(MarketData.price),
            func.min(MarketData.price),
            func.max(MarketData.price),
            func.stddev(MarketData.price),
            func.count(MarketData.id)
        ).where(
            and_(
                MarketData.market_zone == market_zone.lower(),
                MarketData.timestamp >= start_time,
                MarketData.timestamp <= end_time
            )
        )
        
        result = await db.execute(query)
        row = result.first()
        
        if row and row[0] is not None:
            return {
                'average': float(row[0]),
                'minimum': float(row[1]),
                'maximum': float(row[2]),
                'stddev': float(row[3]) if row[3] else 0.0,
                'count': int(row[4]),
                'time_period_hours': hours,
                'market_zone': market_zone.lower()
            }
        
        return {
            'average': 0.0,
            'minimum': 0.0,
            'maximum': 0.0,
            'stddev': 0.0,
            'count': 0,
            'time_period_hours': hours,
            'market_zone': market_zone.lower()
        }
    
    async def get_volume_statistics(
        self,
        db: AsyncSession,
        market_zone: str,
        hours: int = 24
    ) -> Dict[str, float]:
        """Get volume statistics for a market zone"""
        
        end_time = datetime.utcnow()
        start_time = end_time - timedelta(hours=hours)
        
        query = select(
            func.sum(MarketData.volume),
            func.avg(MarketData.volume),
            func.min(MarketData.volume),
            func.max(MarketData.volume)
        ).where(
            and_(
                MarketData.market_zone == market_zone.lower(),
                MarketData.timestamp >= start_time,
                MarketData.timestamp <= end_time
            )
        )
        
        result = await db.execute(query)
        row = result.first()
        
        if row and row[0] is not None:
            return {
                'total_volume': float(row[0]),
                'average_volume': float(row[1]),
                'min_volume': float(row[2]),
                'max_volume': float(row[3]),
                'time_period_hours': hours,
                'market_zone': market_zone.lower()
            }
        
        return {
            'total_volume': 0.0,
            'average_volume': 0.0,
            'min_volume': 0.0,
            'max_volume': 0.0,
            'time_period_hours': hours,
            'market_zone': market_zone.lower()
        }
    
    async def get_recent_price_changes(
        self,
        db: AsyncSession,
        market_zone: str,
        hours: int = 1,
        change_threshold: float = 5.0
    ) -> List[Dict[str, Any]]:
        """Get recent significant price changes"""
        
        # Get data for the specified time period
        market_data = await self.get_price_history(db, market_zone, hours)
        
        if len(market_data) < 2:
            return []
        
        significant_changes = []
        
        for i in range(1, len(market_data)):
            current = market_data[i]
            previous = market_data[i - 1]
            
            if previous.price > 0:
                change_percent = ((current.price - previous.price) / previous.price) * 100
                
                if abs(change_percent) >= change_threshold:
                    significant_changes.append({
                        'timestamp': current.timestamp.isoformat(),
                        'previous_price': previous.price,
                        'current_price': current.price,
                        'change_percent': round(change_percent, 2),
                        'change_absolute': current.price - previous.price,
                        'volume': current.volume,
                        'change_type': 'increase' if change_percent > 0 else 'decrease'
                    })
        
        return significant_changes
    
    async def delete_old_records(self, db: AsyncSession, days_to_keep: int = 30) -> int:
        """Delete market data records older than specified days"""
        
        cutoff_date = datetime.utcnow() - timedelta(days=days_to_keep)
        
        query = MarketData.timestamp < cutoff_date
        deleted_count = await self.delete_where(db, query)
        
        return deleted_count
    
    async def bulk_create_market_data(self, db: AsyncSession, data_list: List[MarketDataCreate]) -> List[MarketData]:
        """Create multiple market data records in bulk"""
        
        created_records = []
        
        for data in data_list:
            record = await self.create(db, obj_in=data)
            created_records.append(record)
        
        await db.commit()
        return created_records

    async def get_market_zones_summary(self, db: AsyncSession) -> List[Dict[str, Any]]:
        """Get summary for all market zones"""
        
        query = select(MarketData.market_zone, func.max(MarketData.timestamp), func.count(MarketData.id))
        query = query.group_by(MarketData.market_zone)
        
        result = await db.execute(query)
        rows = result.all()
        
        summary = []
        for market_zone, latest_timestamp, record_count in rows:
            summary.append({
                "market_zone": market_zone,
                "latest_timestamp": latest_timestamp,
                "record_count": record_count,
                "freshness_minutes": int((datetime.utcnow() - latest_timestamp).total_seconds() / 60) if latest_timestamp else None
            })
        
        return summary

    async def get_market_data_with_filters(
        self,
        db: AsyncSession,
        market_zone: Optional[str] = None,
        price_type: Optional[str] = None,
        location: Optional[str] = None,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None,
        limit: int = 1000,
        sort_by: str = "timestamp",
        sort_order: str = "desc"
    ) -> List[MarketData]:
        """Get market data with comprehensive filters"""
        
        query = select(MarketData)
        
        if market_zone:
            query = query.where(MarketData.market_zone == market_zone.lower())
        
        if price_type:
            query = query.where(MarketData.price_type == price_type)
        
        if location:
            query = query.where(MarketData.location.ilike(f"%{location}%"))
        
        if start_time:
            query = query.where(MarketData.timestamp >= start_time)
        
        if end_time:
            query = query.where(MarketData.timestamp <= end_time)
        
        # Apply sorting
        if sort_order.lower() == "asc":
            query = query.order_by(getattr(MarketData, sort_by).asc())
        else:
            query = query.order_by(getattr(MarketData, sort_by).desc())
        
        query = query.limit(limit)
        
        result = await db.execute(query)
        return result.scalars().all()

    async def get_data_quality_metrics(self, db: AsyncSession, market_zone: str, hours: int = 24) -> Dict[str, Any]:
        """Get data quality metrics for a market zone"""
        
        end_time = datetime.utcnow()
        start_time = end_time - timedelta(hours=hours)
        
        # Get total expected records (assuming 5-minute intervals = 288 records per day)
        expected_records = int(hours * 12)  # 12 records per hour (every 5 minutes)
        
        # Get actual records
        actual_query = select(func.count(MarketData.id)).where(
            and_(
                MarketData.market_zone == market_zone.lower(),
                MarketData.timestamp >= start_time,
                MarketData.timestamp <= end_time
            )
        )
        
        result = await db.execute(actual_query)
        actual_records = result.scalar() or 0
        
        # Calculate completeness
        completeness = (actual_records / expected_records * 100) if expected_records > 0 else 0
        
        # Get price range and validation
        price_query = select(
            func.min(MarketData.price),
            func.max(MarketData.price),
            func.avg(MarketData.price),
            func.stddev(MarketData.price)
        ).where(
            and_(
                MarketData.market_zone == market_zone.lower(),
                MarketData.timestamp >= start_time,
                MarketData.timestamp <= end_time,
                MarketData.price.isnot(None)
            )
        )
        
        price_result = await db.execute(price_query)
        price_stats = price_result.first()
        
        # Check for negative prices (anomaly)
        negative_query = select(func.count(MarketData.id)).where(
            and_(
                MarketData.market_zone == market_zone.lower(),
                MarketData.timestamp >= start_time,
                MarketData.timestamp <= end_time,
                MarketData.price < 0
            )
        )
        
        negative_result = await db.execute(negative_query)
        negative_count = negative_result.scalar() or 0
        
        return {
            "market_zone": market_zone.lower(),
            "time_period_hours": hours,
            "data_quality": {
                "expected_records": expected_records,
                "actual_records": actual_records,
                "completeness_percent": round(completeness, 2),
                "negative_price_count": negative_count,
                "anomaly_rate_percent": round((negative_count / actual_records * 100) if actual_records > 0 else 0, 2)
            },
            "price_statistics": {
                "min_price": float(price_stats[0]) if price_stats[0] is not None else 0.0,
                "max_price": float(price_stats[1]) if price_stats[1] is not None else 0.0,
                "avg_price": float(price_stats[2]) if price_stats[2] is not None else 0.0,
                "price_volatility": float(price_stats[3]) if price_stats[3] is not None else 0.0
            }
        }


# Create CRUD instance
market_data = CRUDMarketData(MarketData)


# Create singleton instance
from ..models import MarketData
market_data_crud = CRUDMarketData(MarketData)
