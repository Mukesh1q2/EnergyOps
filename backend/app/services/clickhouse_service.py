"""
ClickHouse Analytics Service for high-performance analytical queries.
Provides materialized views, complex aggregations, and real-time analytics.
"""

import asyncio
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Union, Any
from clickhouse_connect import get_client
from clickhouse_connect.driver import Client
from clickhouse_connect.driver.query import QueryResult
import pandas as pd
import numpy as np
from ..core.config import get_settings

settings = get_settings()


class ClickHouseService:
    """ClickHouse service for high-performance analytics and complex queries."""
    
    def __init__(self):
        self.client: Optional[Client] = None
        self._initialized = False
    
    async def initialize(self):
        """Initialize ClickHouse client connection."""
        if not self._initialized:
            try:
                self.client = get_client(
                    host=settings.clickhouse_host,
                    port=settings.clickhouse_port,
                    username=settings.clickhouse_user,
                    password=settings.clickhouse_password,
                    database=settings.clickhouse_database,
                    settings={
                        'readonly': 1,
                        'max_execution_time': 300,
                        'max_memory_usage': 10000000000,  # 10GB
                    }
                )
                self._initialized = True
                print("ClickHouse connection established")
            except Exception as e:
                print(f"ClickHouse initialization error: {e}")
                raise
    
    async def create_materialized_views(self):
        """Create materialized views for common analytics queries."""
        if not self.client:
            await self.initialize()
        
        # Hourly market data aggregation
        hourly_agg_sql = """
        CREATE MATERIALIZED VIEW IF NOT EXISTS hourly_market_agg
        TO hourly_market_data
        AS
        SELECT
            toStartOfHour(timestamp) as hour,
            market_zone,
            avg(price) as avg_price,
            min(price) as min_price,
            max(price) as max_price,
            sum(volume) as total_volume,
            count() as record_count,
            stddev(price) as price_volatility
        FROM market_data_raw
        GROUP BY hour, market_zone
        """
        
        # Daily KPI aggregation
        daily_kpi_sql = """
        CREATE MATERIALIZED VIEW IF NOT EXISTS daily_kpi_agg
        TO daily_kpi_data
        AS
        SELECT
            toStartOfDay(timestamp) as day,
            market_zone,
            avg(price) as daily_avg_price,
            first_value(price) as day_open_price,
            last_value(price) as day_close_price,
            max(price) as daily_high,
            min(price) as daily_low,
            sum(volume) as daily_volume,
            count() as trading_count,
            avg(volume) as avg_volume_per_trade
        FROM market_data_raw
        GROUP BY day, market_zone
        """
        
        # Real-time anomaly detection view
        anomaly_detection_sql = """
        CREATE MATERIALIZED VIEW IF NOT EXISTS price_anomalies
        TO anomaly_data
        AS
        SELECT
            timestamp,
            market_zone,
            price,
            volume,
            price / avg(price) OVER (
                ORDER BY timestamp ROWS BETWEEN 23 PRECEDING AND CURRENT ROW
            ) as price_zscore,
            volume / avg(volume) OVER (
                ORDER BY timestamp ROWS BETWEEN 23 PRECEDING AND CURRENT ROW
            ) as volume_zscore
        FROM market_data_raw
        """
        
        try:
            self.client.command(hourly_agg_sql)
            self.client.command(daily_kpi_sql)
            self.client.command(anomaly_detection_sql)
            print("Materialized views created successfully")
        except Exception as e:
            print(f"Error creating materialized views: {e}")
    
    async def get_market_analytics(
        self,
        market_zone: str,
        start_date: datetime,
        end_date: datetime,
        granularity: str = "hour"
    ) -> Dict[str, Any]:
        """Get comprehensive market analytics for a time range."""
        if not self.client:
            await self.initialize()
        
        if granularity == "hour":
            table = "hourly_market_data"
            date_format = "hour"
        elif granularity == "day":
            table = "daily_kpi_data"
            date_format = "day"
        else:
            table = "market_data_raw"
            date_format = "timestamp"
        
        # Price analytics query
        price_query = f"""
        SELECT
            {date_format},
            avg_price,
            min_price,
            max_price,
            total_volume,
            record_count,
            price_volatility
        FROM {table}
        WHERE market_zone = %(market_zone)s
          AND {date_format} >= %(start_date)s
          AND {date_format} <= %(end_date)s
        ORDER BY {date_format} ASC
        """
        
        # Volume analytics query
        volume_query = f"""
        SELECT
            toStartOfInterval(timestamp, INTERVAL 1 HOUR) as hour,
            sum(volume) as hourly_volume,
            count() as trade_count,
            avg(volume) as avg_trade_size
        FROM market_data_raw
        WHERE market_zone = %(market_zone)s
          AND timestamp >= %(start_date)s
          AND timestamp <= %(end_date)s
        GROUP BY hour
        ORDER BY hour ASC
        """
        
        # Volatility analysis
        volatility_query = f"""
        SELECT
            toStartOfDay(timestamp) as day,
            stddev(price) as daily_volatility,
            avg(price) as daily_avg,
            max(price) - min(price) as price_range
        FROM market_data_raw
        WHERE market_zone = %(market_zone)s
          AND timestamp >= %(start_date)s
          AND timestamp <= %(end_date)s
        GROUP BY day
        ORDER BY day ASC
        """
        
        try:
            # Execute queries in parallel
            price_data = self.client.query_df(
                price_query,
                parameters={
                    "market_zone": market_zone,
                    "start_date": start_date,
                    "end_date": end_date
                }
            )
            
            volume_data = self.client.query_df(
                volume_query,
                parameters={
                    "market_zone": market_zone,
                    "start_date": start_date,
                    "end_date": end_date
                }
            )
            
            volatility_data = self.client.query_df(
                volatility_query,
                parameters={
                    "market_zone": market_zone,
                    "start_date": start_date,
                    "end_date": end_date
                }
            )
            
            return {
                "price_analytics": price_data.to_dict("records") if not price_data.empty else [],
                "volume_analytics": volume_data.to_dict("records") if not volume_data.empty else [],
                "volatility_analytics": volatility_data.to_dict("records") if not volatility_data.empty else [],
                "metadata": {
                    "market_zone": market_zone,
                    "start_date": start_date.isoformat(),
                    "end_date": end_date.isoformat(),
                    "granularity": granularity,
                    "total_records": len(price_data) if not price_data.empty else 0
                }
            }
            
        except Exception as e:
            print(f"Error executing market analytics query: {e}")
            return {"error": str(e)}
    
    async def get_anomaly_detection(
        self,
        market_zone: str,
        start_date: datetime,
        end_date: datetime,
        threshold: float = 2.5
    ) -> Dict[str, Any]:
        """Detect price and volume anomalies using statistical analysis."""
        if not self.client:
            await self.initialize()
        
        anomaly_query = """
        SELECT
            timestamp,
            market_zone,
            price,
            volume,
            price_zscore,
            volume_zscore,
            CASE
                WHEN abs(price_zscore) > %(threshold)s THEN 'price_anomaly'
                WHEN abs(volume_zscore) > %(threshold)s THEN 'volume_anomaly'
                ELSE 'normal'
            END as anomaly_type,
            abs(price_zscore) as anomaly_severity
        FROM anomaly_data
        WHERE market_zone = %(market_zone)s
          AND timestamp >= %(start_date)s
          AND timestamp <= %(end_date)s
          AND (abs(price_zscore) > %(threshold)s OR abs(volume_zscore) > %(threshold)s)
        ORDER BY anomaly_severity DESC, timestamp DESC
        """
        
        try:
            anomaly_data = self.client.query_df(
                anomaly_query,
                parameters={
                    "market_zone": market_zone,
                    "start_date": start_date,
                    "end_date": end_date,
                    "threshold": threshold
                }
            )
            
            return {
                "anomalies": anomaly_data.to_dict("records") if not anomaly_data.empty else [],
                "summary": {
                    "total_anomalies": len(anomaly_data) if not anomaly_data.empty else 0,
                    "price_anomalies": len(anomaly_data[anomaly_data['anomaly_type'] == 'price_anomaly']) if not anomaly_data.empty else 0,
                    "volume_anomalies": len(anomaly_data[anomaly_data['anomaly_type'] == 'volume_anomaly']) if not anomaly_data.empty else 0,
                    "max_severity": float(anomaly_data['anomaly_severity'].max()) if not anomaly_data.empty else 0.0
                },
                "metadata": {
                    "market_zone": market_zone,
                    "start_date": start_date.isoformat(),
                    "end_date": end_date.isoformat(),
                    "threshold": threshold
                }
            }
            
        except Exception as e:
            print(f"Error in anomaly detection: {e}")
            return {"error": str(e)}
    
    async def get_cross_market_analysis(
        self,
        start_date: datetime,
        end_date: datetime,
        correlation_window: int = 24
    ) -> Dict[str, Any]:
        """Analyze correlations and patterns across multiple market zones."""
        if not self.client:
            await self.initialize()
        
        # Price correlation analysis
        correlation_query = f"""
        SELECT
            m1.market_zone as zone1,
            m2.market_zone as zone2,
            corr(m1.price, m2.price) as price_correlation,
            corr(m1.volume, m2.volume) as volume_correlation,
            count() as sample_count
        FROM market_data_raw m1
        JOIN market_data_raw m2 ON m1.timestamp = m2.timestamp
        WHERE m1.timestamp >= %(start_date)s
          AND m1.timestamp <= %(end_date)s
          AND m1.market_zone != m2.market_zone
        GROUP BY m1.market_zone, m2.market_zone
        HAVING count() > 100  -- Minimum sample size
        ORDER BY abs(price_correlation) DESC
        """
        
        # Market volatility comparison
        volatility_query = """
        SELECT
            market_zone,
            stddev(price) as price_volatility,
            avg(price) as avg_price,
            (max(price) - min(price)) / avg(price) as relative_volatility,
            count() as data_points
        FROM market_data_raw
        WHERE timestamp >= %(start_date)s
          AND timestamp <= %(end_date)s
        GROUP BY market_zone
        ORDER BY price_volatility DESC
        """
        
        try:
            correlation_data = self.client.query_df(
                correlation_query,
                parameters={"start_date": start_date, "end_date": end_date}
            )
            
            volatility_data = self.client.query_df(
                volatility_query,
                parameters={"start_date": start_date, "end_date": end_date}
            )
            
            return {
                "correlations": correlation_data.to_dict("records") if not correlation_data.empty else [],
                "volatility_comparison": volatility_data.to_dict("records") if not volatility_data.empty else [],
                "metadata": {
                    "start_date": start_date.isoformat(),
                    "end_date": end_date.isoformat(),
                    "correlation_window_hours": correlation_window
                }
            }
            
        except Exception as e:
            print(f"Error in cross-market analysis: {e}")
            return {"error": str(e)}
    
    async def get_real_time_kpis(
        self,
        market_zones: List[str],
        time_window_minutes: int = 60
    ) -> Dict[str, Any]:
        """Get real-time KPIs for multiple market zones."""
        if not self.client:
            await self.initialize()
        
        end_time = datetime.now()
        start_time = end_time - timedelta(minutes=time_window_minutes)
        
        kpi_query = """
        SELECT
            market_zone,
            count() as trade_count,
            avg(price) as current_avg_price,
            max(timestamp) as last_update,
            sum(volume) as total_volume,
            stddev(price) as price_volatility,
            min(price) as min_price,
            max(price) as max_price,
            (max(price) - min(price)) / avg(price) * 100 as volatility_percent
        FROM market_data_raw
        WHERE market_zone IN %(market_zones)s
          AND timestamp >= %(start_time)s
          AND timestamp <= %(end_time)s
        GROUP BY market_zone
        ORDER BY current_avg_price DESC
        """
        
        try:
            kpi_data = self.client.query_df(
                kpi_query,
                parameters={
                    "market_zones": market_zones,
                    "start_time": start_time,
                    "end_time": end_time
                }
            )
            
            # Calculate additional metrics
            if not kpi_data.empty:
                kpi_data['volatility_percent'] = kpi_data['volatility_percent'].fillna(0)
                kpi_data['price_trend'] = kpi_data['current_avg_price'].pct_change()
                kpi_data['volume_trend'] = kpi_data['total_volume'].pct_change()
            
            return {
                "kpis": kpi_data.to_dict("records") if not kpi_data.empty else [],
                "summary": {
                    "total_zones": len(market_zones),
                    "active_zones": len(kpi_data) if not kpi_data.empty else 0,
                    "time_window_minutes": time_window_minutes,
                    "last_updated": end_time.isoformat()
                }
            }
            
        except Exception as e:
            print(f"Error in real-time KPI calculation: {e}")
            return {"error": str(e)}
    
    async def close(self):
        """Close ClickHouse connection."""
        if self.client:
            self.client.close()
            self._initialized = False
            print("ClickHouse connection closed")


# Global instance
clickhouse_service = ClickHouseService()