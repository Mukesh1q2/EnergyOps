"""
Advanced Analytics Service

Sophisticated analytics engine for energy trading KPIs, industry benchmarking,
and predictive insights with real-time calculations and historical analysis.

Features:
- Custom KPI calculations with industry benchmarks
- Real-time analytics processing
- Historical trend analysis
- Performance benchmarking against industry standards
- Predictive analytics and forecasting
- Risk assessment metrics
- Portfolio optimization analytics
- Market efficiency indicators
"""

import asyncio
import numpy as np
import pandas as pd
from typing import Dict, List, Optional, Any, Union, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from enum import Enum
import statistics
import logging
from collections import defaultdict, deque
import json

logger = logging.getLogger(__name__)


class MetricCategory(Enum):
    """Categories of analytics metrics"""
    TRADING_PERFORMANCE = "trading_performance"
    MARKET_EFFICIENCY = "market_efficiency"
    RISK_METRICS = "risk_metrics"
    PORTFOLIO_ANALYTICS = "portfolio_analytics"
    COMPLIANCE = "compliance"
    OPERATIONAL = "operational"
    BENCHMARKING = "benchmarking"


class TimeGranularity(Enum):
    """Time granularity for analytics"""
    REAL_TIME = "realtime"
    HOURLY = "hourly"
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    YEARLY = "yearly"


class BenchmarkType(Enum):
    """Types of benchmarks"""
    INDUSTRY_AVERAGE = "industry_average"
    TOP_QUARTILE = "top_quartile"
    BEST_IN_CLASS = "best_in_class"
    REGULATORY_STANDARD = "regulatory_standard"
    CUSTOM_TARGET = "custom_target"


@dataclass
class KPIDefinition:
    """KPI definition with calculation logic"""
    kpi_id: str
    name: str
    description: str
    category: MetricCategory
    unit: str
    calculation_formula: str
    required_data_sources: List[str]
    refresh_frequency: TimeGranularity
    is_real_time: bool = False
    benchmark_type: Optional[BenchmarkType] = None
    target_value: Optional[float] = None
    acceptable_range: Optional[Tuple[float, float]] = None
    alert_thresholds: Optional[Dict[str, float]] = None


@dataclass
class KPIValue:
    """KPI calculation result"""
    kpi_id: str
    value: float
    timestamp: datetime
    granularity: TimeGranularity
    benchmark_value: Optional[float] = None
    percentile_rank: Optional[float] = None
    trend_direction: Optional[str] = None  # "up", "down", "stable"
    trend_change_pct: Optional[float] = None
    confidence_level: Optional[float] = None


@dataclass
class BenchmarkData:
    """Industry benchmark data"""
    metric_id: str
    industry: str
    benchmark_type: BenchmarkType
    value: float
    percentile: float
    sample_size: int
    time_period: str
    data_source: str
    last_updated: datetime


@dataclass
class AnalyticsInsight:
    """Analytics insight with recommendations"""
    insight_id: str
    title: str
    description: str
    category: MetricCategory
    priority: int  # 1=high, 2=medium, 3=low
    impact_score: float
    effort_score: float
    recommendations: List[str]
    supporting_data: Dict[str, Any]
    created_at: datetime
    expires_at: Optional[datetime] = None


class AdvancedAnalyticsService:
    """
    Advanced analytics engine for energy trading insights
    """
    
    def __init__(self):
        # KPI definitions
        self.kpi_definitions: Dict[str, KPIDefinition] = {}
        self._initialize_kpi_definitions()
        
        # Calculation cache
        self._kpi_cache: Dict[str, deque] = defaultdict(lambda: deque(maxlen=1000))
        
        # Benchmark data storage
        self._benchmark_data: Dict[str, List[BenchmarkData]] = defaultdict(list)
        self._load_benchmark_data()
        
        # Analytics insights
        self._insights: List[AnalyticsInsight] = []
        
        # Real-time metrics buffer
        self._realtime_metrics: Dict[str, deque] = defaultdict(
            lambda: deque(maxlen=5000)
        )
        
        # Performance baselines
        self._performance_baselines: Dict[str, Dict[str, float]] = {}
        
        # Analytics processing queue
        self._processing_queue: deque = deque()
        self._is_processing = False
        
    def _initialize_kpi_definitions(self):
        """Initialize KPI definitions for energy trading"""
        self.kpi_definitions = {
            # Trading Performance KPIs
            "total_revenue": KPIDefinition(
                kpi_id="total_revenue",
                name="Total Revenue",
                description="Total revenue from energy trading activities",
                category=MetricCategory.TRADING_PERFORMANCE,
                unit="USD",
                calculation_formula="SUM(trades.revenue) OVER time_period",
                required_data_sources=["trades", "market_prices"],
                refresh_frequency=TimeGranularity.DAILY,
                benchmark_type=BenchmarkType.INDUSTRY_AVERAGE,
                target_value=1000000.0
            ),
            
            "revenue_per_mwh": KPIDefinition(
                kpi_id="revenue_per_mwh",
                name="Revenue per MWh",
                description="Average revenue generated per MWh traded",
                category=MetricCategory.TRADING_PERFORMANCE,
                unit="USD/MWh",
                calculation_formula="SUM(trades.revenue) / SUM(trades.volume_mwh)",
                required_data_sources=["trades"],
                refresh_frequency=TimeGranularity.HOURLY,
                is_real_time=True,
                benchmark_type=BenchmarkType.TOP_QUARTILE,
                target_value=45.0
            ),
            
            "win_rate": KPIDefinition(
                kpi_id="win_rate",
                name="Win Rate",
                description="Percentage of profitable trades",
                category=MetricCategory.TRADING_PERFORMANCE,
                unit="%",
                calculation_formula="COUNT(profitable_trades) / COUNT(total_trades) * 100",
                required_data_sources=["trades"],
                refresh_frequency=TimeGranularity.DAILY,
                benchmark_type=BenchmarkType.TOP_QUARTILE,
                target_value=75.0
            ),
            
            "sharpe_ratio": KPIDefinition(
                kpi_id="sharpe_ratio",
                name="Sharpe Ratio",
                description="Risk-adjusted return measurement",
                category=MetricCategory.RISK_METRICS,
                unit="ratio",
                calculation_formula="(portfolio_return - risk_free_rate) / portfolio_volatility",
                required_data_sources=["portfolio_returns", "risk_free_rate"],
                refresh_frequency=TimeGranularity.WEEKLY,
                benchmark_type=BenchmarkType.BEST_IN_CLASS,
                target_value=2.0
            ),
            
            "value_at_risk": KPIDefinition(
                kpi_id="value_at_risk",
                name="Value at Risk (VaR)",
                description="Maximum expected loss at 95% confidence level",
                category=MetricCategory.RISK_METRICS,
                unit="USD",
                calculation_formula="PERCENTILE(portfolio_losses, 5%)",
                required_data_sources=["portfolio_positions", "price_volatility"],
                refresh_frequency=TimeGranularity.DAILY,
                benchmark_type=BenchmarkType.INDUSTRY_AVERAGE,
                alert_thresholds={"warning": 100000.0, "critical": 500000.0}
            ),
            
            "liquidity_ratio": KPIDefinition(
                kpi_id="liquidity_ratio",
                name="Liquidity Ratio",
                description="Ability to meet short-term obligations",
                category=MetricCategory.OPERATIONAL,
                unit="ratio",
                calculation_formula="current_assets / current_liabilities",
                required_data_sources=["financial_statements"],
                refresh_frequency=TimeGranularity.MONTHLY,
                benchmark_type=BenchmarkType.REGULATORY_STANDARD,
                target_value=1.5
            ),
            
            "market_impact": KPIDefinition(
                kpi_id="market_impact",
                name="Market Impact",
                description="Price impact of trading activities",
                category=MetricCategory.MARKET_EFFICIENCY,
                unit="%",
                calculation_formula="ABS(price_change_before_vs_after_trade) / average_daily_volume",
                required_data_sources=["trades", "market_data"],
                refresh_frequency=TimeGranularity.REAL_TIME,
                is_real_time=True,
                benchmark_type=BenchmarkType.TOP_QUARTILE,
                target_value=0.1
            ),
            
            "energy_arbitrage_profit": KPIDefinition(
                kpi_id="energy_arbitrage_profit",
                name="Energy Arbitrage Profit",
                description="Profit from price arbitrage between time periods",
                category=MetricCategory.TRADING_PERFORMANCE,
                unit="USD",
                calculation_formula="SUM((high_price_buy - low_price_sell) * volume) * direction",
                required_data_sources=["market_prices", "arbitrage_opportunities"],
                refresh_frequency=TimeGranularity.HOURLY,
                is_real_time=True,
                benchmark_type=BenchmarkType.INDUSTRY_AVERAGE
            ),
            
            "carbon_emissions_intensity": KPIDefinition(
                kpi_id="carbon_emissions_intensity",
                name="Carbon Emissions Intensity",
                description="Carbon emissions per unit of energy traded",
                category=MetricCategory.COMPLIANCE,
                unit="kg CO2/MWh",
                calculation_formula="total_emissions / total_energy_traded",
                required_data_sources=["emissions_data", "energy_trades"],
                refresh_frequency=TimeGranularity.MONTHLY,
                benchmark_type=BenchmarkType.REGULATORY_STANDARD,
                target_value=400.0
            ),
            
            "portfolio_diversification": KPIDefinition(
                kpi_id="portfolio_diversification",
                name="Portfolio Diversification Index",
                description="Herfindahl-Hirschman Index for portfolio concentration",
                category=MetricCategory.PORTFOLIO_ANALYTICS,
                unit="index",
                calculation_formula="1 - SUM(position_share^2)",
                required_data_sources=["portfolio_positions"],
                refresh_frequency=TimeGranularity.DAILY,
                benchmark_type=BenchmarkType.INDUSTRY_AVERAGE,
                target_value=0.8
            )
        }
    
    def _load_benchmark_data(self):
        """Load industry benchmark data"""
        # Mock benchmark data - in production, this would come from industry sources
        self._benchmark_data = {
            "total_revenue": [
                BenchmarkData(
                    metric_id="total_revenue",
                    industry="Energy Trading",
                    benchmark_type=BenchmarkType.INDUSTRY_AVERAGE,
                    value=850000.0,
                    percentile=50.0,
                    sample_size=150,
                    time_period="2024-Q3",
                    data_source="Energy Industry Association",
                    last_updated=datetime.utcnow()
                ),
                BenchmarkData(
                    metric_id="total_revenue",
                    industry="Energy Trading",
                    benchmark_type=BenchmarkType.TOP_QUARTILE,
                    value=1200000.0,
                    percentile=75.0,
                    sample_size=150,
                    time_period="2024-Q3",
                    data_source="Energy Industry Association",
                    last_updated=datetime.utcnow()
                )
            ],
            
            "win_rate": [
                BenchmarkData(
                    metric_id="win_rate",
                    industry="Energy Trading",
                    benchmark_type=BenchmarkType.INDUSTRY_AVERAGE,
                    value=62.5,
                    percentile=50.0,
                    sample_size=200,
                    time_period="2024-Q3",
                    data_source="Trading Analytics Institute",
                    last_updated=datetime.utcnow()
                ),
                BenchmarkData(
                    metric_id="win_rate",
                    industry="Energy Trading",
                    benchmark_type=BenchmarkType.TOP_QUARTILE,
                    value=78.0,
                    percentile=75.0,
                    sample_size=200,
                    time_period="2024-Q3",
                    data_source="Trading Analytics Institute",
                    last_updated=datetime.utcnow()
                )
            ],
            
            "sharpe_ratio": [
                BenchmarkData(
                    metric_id="sharpe_ratio",
                    industry="Energy Trading",
                    benchmark_type=BenchmarkType.INDUSTRY_AVERAGE,
                    value=1.2,
                    percentile=50.0,
                    sample_size=180,
                    time_period="2024-Q3",
                    data_source="Risk Management Association",
                    last_updated=datetime.utcnow()
                ),
                BenchmarkData(
                    metric_id="sharpe_ratio",
                    industry="Energy Trading",
                    benchmark_type=BenchmarkType.BEST_IN_CLASS,
                    value=2.5,
                    percentile=90.0,
                    sample_size=180,
                    time_period="2024-Q3",
                    data_source="Risk Management Association",
                    last_updated=datetime.utcnow()
                )
            ],
            
            "liquidity_ratio": [
                BenchmarkData(
                    metric_id="liquidity_ratio",
                    industry="Energy Trading",
                    benchmark_type=BenchmarkType.REGULATORY_STANDARD,
                    value=1.2,
                    percentile=50.0,
                    sample_size=100,
                    time_period="2024-Q3",
                    data_source="Financial Regulators",
                    last_updated=datetime.utcnow()
                )
            ]
        }
    
    async def calculate_kpi(
        self,
        kpi_id: str,
        data_sources: Dict[str, Any],
        time_period: Optional[Dict[str, datetime]] = None,
        granularity: TimeGranularity = TimeGranularity.DAILY
    ) -> Optional[KPIValue]:
        """
        Calculate specific KPI value
        
        Args:
            kpi_id: KPI identifier
            data_sources: Data sources for calculation
            time_period: Start and end time for calculation
            granularity: Time granularity for aggregation
        
        Returns:
            Calculated KPI value
        """
        if kpi_id not in self.kpi_definitions:
            logger.error(f"Unknown KPI: {kpi_id}")
            return None
        
        kpi_def = self.kpi_definitions[kpi_id]
        
        try:
            # Execute calculation based on KPI type
            if kpi_id == "total_revenue":
                value = await self._calculate_total_revenue(data_sources, time_period)
            elif kpi_id == "revenue_per_mwh":
                value = await self._calculate_revenue_per_mwh(data_sources, time_period)
            elif kpi_id == "win_rate":
                value = await self._calculate_win_rate(data_sources, time_period)
            elif kpi_id == "sharpe_ratio":
                value = await self._calculate_sharpe_ratio(data_sources, time_period)
            elif kpi_id == "value_at_risk":
                value = await self._calculate_var(data_sources, time_period)
            elif kpi_id == "liquidity_ratio":
                value = await self._calculate_liquidity_ratio(data_sources, time_period)
            elif kpi_id == "market_impact":
                value = await self._calculate_market_impact(data_sources, time_period)
            elif kpi_id == "energy_arbitrage_profit":
                value = await self._calculate_arbitrage_profit(data_sources, time_period)
            elif kpi_id == "carbon_emissions_intensity":
                value = await self._calculate_emissions_intensity(data_sources, time_period)
            elif kpi_id == "portfolio_diversification":
                value = await self._calculate_portfolio_diversification(data_sources, time_period)
            else:
                logger.error(f"Calculation not implemented for KPI: {kpi_id}")
                return None
            
            # Get benchmark comparison
            benchmark_value = await self._get_benchmark_value(kpi_id, kpi_def.benchmark_type)
            
            # Calculate trend
            trend_direction, trend_change = await self._calculate_trend(
                kpi_id, value, time_period
            )
            
            # Create KPI value
            kpi_value = KPIValue(
                kpi_id=kpi_id,
                value=value,
                timestamp=datetime.utcnow(),
                granularity=granularity,
                benchmark_value=benchmark_value,
                percentile_rank=await self._calculate_percentile_rank(kpi_id, value),
                trend_direction=trend_direction,
                trend_change_pct=trend_change,
                confidence_level=0.95  # Default confidence level
            )
            
            # Cache result
            self._kpi_cache[kpi_id].append(kpi_value)
            
            return kpi_value
            
        except Exception as e:
            logger.error(f"Failed to calculate KPI {kpi_id}: {e}")
            return None
    
    async def calculate_multiple_kpis(
        self,
        kpi_ids: List[str],
        data_sources: Dict[str, Any],
        time_period: Optional[Dict[str, datetime]] = None
    ) -> Dict[str, KPIValue]:
        """Calculate multiple KPIs in parallel"""
        tasks = []
        for kpi_id in kpi_ids:
            task = asyncio.create_task(
                self.calculate_kpi(kpi_id, data_sources, time_period)
            )
            tasks.append((kpi_id, task))
        
        results = {}
        for kpi_id, task in tasks:
            try:
                result = await task
                if result:
                    results[kpi_id] = result
            except Exception as e:
                logger.error(f"Failed to calculate KPI {kpi_id}: {e}")
        
        return results
    
    async def get_dashboard_analytics(
        self,
        time_period: str = "7d"
    ) -> Dict[str, Any]:
        """Get analytics data for dashboard display"""
        end_time = datetime.utcnow()
        start_time = self._get_start_time(end_time, time_period)
        
        # Define KPIs for dashboard
        dashboard_kpis = [
            "total_revenue", "revenue_per_mwh", "win_rate",
            "sharpe_ratio", "value_at_risk", "market_impact"
        ]
        
        # Mock data sources for calculation
        data_sources = {
            "trades": self._generate_mock_trades_data(start_time, end_time),
            "market_prices": self._generate_mock_market_data(start_time, end_time),
            "portfolio_returns": self._generate_mock_returns_data(start_time, end_time),
            "market_data": self._generate_mock_market_data(start_time, end_time)
        }
        
        # Calculate KPIs
        kpi_results = await self.calculate_multiple_kpis(
            dashboard_kpis, data_sources,
            {"start": start_time, "end": end_time}
        )
        
        # Generate insights
        insights = await self.generate_insights(kpi_results)
        
        # Prepare dashboard data
        dashboard_data = {
            "kpis": {
                kpi_id: {
                    "current_value": result.value,
                    "benchmark": result.benchmark_value,
                    "trend": result.trend_direction,
                    "change_pct": result.trend_change_pct,
                    "unit": self.kpi_definitions[kpi_id].unit
                }
                for kpi_id, result in kpi_results.items()
            },
            "insights": [
                {
                    "title": insight.title,
                    "description": insight.description,
                    "priority": insight.priority,
                    "category": insight.category.value
                }
                for insight in insights[:5]  # Top 5 insights
            ],
            "trends": await self._generate_trend_analysis(dashboard_kpis, time_period),
            "benchmarks": await self._get_benchmark_summary(dashboard_kpis),
            "time_period": time_period,
            "generated_at": datetime.utcnow().isoformat()
        }
        
        return dashboard_data
    
    async def generate_insights(
        self,
        kpi_results: Dict[str, KPIValue]
    ) -> List[AnalyticsInsight]:
        """Generate actionable insights from KPI results"""
        insights = []
        
        # Analyze each KPI for insights
        for kpi_id, result in kpi_results.items():
            kpi_def = self.kpi_definitions[kpi_id]
            
            # Performance insights
            if result.benchmark_value and result.value < result.benchmark_value * 0.8:
                insights.append(AnalyticsInsight(
                    insight_id=f"low_performance_{kpi_id}",
                    title=f"{kpi_def.name} Below Benchmark",
                    description=f"{kpi_def.name} is {((result.benchmark_value - result.value) / result.benchmark_value * 100):.1f}% below industry benchmark",
                    category=kpi_def.category,
                    priority=2,
                    impact_score=0.8,
                    effort_score=0.6,
                    recommendations=[
                        f"Investigate factors affecting {kpi_def.name.lower()}",
                        "Review operational processes",
                        "Consider benchmarking with top performers"
                    ],
                    supporting_data={
                        "current_value": result.value,
                        "benchmark_value": result.benchmark_value,
                        "shortfall_pct": (result.benchmark_value - result.value) / result.benchmark_value * 100
                    },
                    created_at=datetime.utcnow(),
                    expires_at=datetime.utcnow() + timedelta(days=7)
                ))
            
            # Trend insights
            if result.trend_direction == "down" and result.trend_change_pct < -10:
                insights.append(AnalyticsInsight(
                    insight_id=f"declining_trend_{kpi_id}",
                    title=f"Declining {kpi_def.name}",
                    description=f"{kpi_def.name} has decreased by {abs(result.trend_change_pct):.1f}% recently",
                    category=kpi_def.category,
                    priority=1,
                    impact_score=0.9,
                    effort_score=0.4,
                    recommendations=[
                        "Investigate root cause of decline",
                        "Review recent changes in strategy",
                        "Implement corrective measures"
                    ],
                    supporting_data={
                        "trend_change_pct": result.trend_change_pct,
                        "previous_value": result.value / (1 + result.trend_change_pct / 100)
                    },
                    created_at=datetime.utcnow(),
                    expires_at=datetime.utcnow() + timedelta(days=3)
                ))
            
            # Risk insights
            if kpi_id == "value_at_risk" and result.value > 300000:
                insights.append(AnalyticsInsight(
                    insight_id="high_var_risk",
                    title="High Risk Exposure",
                    description="Value at Risk exceeds acceptable threshold",
                    category=MetricCategory.RISK_METRICS,
                    priority=1,
                    impact_score=0.95,
                    effort_score=0.7,
                    recommendations=[
                        "Implement additional risk hedging",
                        "Reduce position sizes",
                        "Review risk management procedures"
                    ],
                    supporting_data={
                        "var_value": result.value,
                        "threshold": 300000,
                        "risk_level": "high"
                    },
                    created_at=datetime.utcnow(),
                    expires_at=datetime.utcnow() + timedelta(days=1)
                ))
        
        # Sort by priority and impact
        insights.sort(key=lambda x: (x.priority, -x.impact_score))
        
        return insights
    
    async def get_benchmark_comparison(
        self,
        kpi_ids: List[str],
        benchmark_type: BenchmarkType = BenchmarkType.INDUSTRY_AVERAGE
    ) -> Dict[str, Dict[str, Any]]:
        """Get benchmark comparison for KPIs"""
        comparison = {}
        
        for kpi_id in kpi_ids:
            if kpi_id not in self.kpi_definitions:
                continue
            
            kpi_def = self.kpi_definitions[kpi_id]
            benchmark_data = await self._get_benchmark_value(kpi_id, benchmark_type)
            
            # Get latest calculated value
            latest_value = None
            if self._kpi_cache[kpi_id]:
                latest_value = self._kpi_cache[kpi_id][-1].value
            
            comparison[kpi_id] = {
                "kpi_name": kpi_def.name,
                "current_value": latest_value,
                "benchmark_value": benchmark_data,
                "unit": kpi_def.unit,
                "category": kpi_def.category.value,
                "gap_analysis": self._calculate_gap_analysis(latest_value, benchmark_data),
                "percentile_rank": await self._calculate_percentile_rank(kpi_id, latest_value),
                "performance_rating": self._get_performance_rating(latest_value, benchmark_data)
            }
        
        return comparison
    
    # KPI Calculation Methods
    
    async def _calculate_total_revenue(
        self,
        data_sources: Dict[str, Any],
        time_period: Optional[Dict[str, datetime]]
    ) -> float:
        """Calculate total revenue from trades"""
        trades = data_sources.get("trades", [])
        
        if not trades:
            # Return mock data
            return 875432.50
        
        # Calculate total revenue
        total_revenue = sum(trade.get("revenue", 0) for trade in trades)
        return total_revenue
    
    async def _calculate_revenue_per_mwh(
        self,
        data_sources: Dict[str, Any],
        time_period: Optional[Dict[str, datetime]]
    ) -> float:
        """Calculate revenue per MWh"""
        trades = data_sources.get("trades", [])
        
        if not trades:
            # Return mock data
            return 42.85
        
        total_revenue = sum(trade.get("revenue", 0) for trade in trades)
        total_volume = sum(trade.get("volume_mwh", 0) for trade in trades)
        
        if total_volume == 0:
            return 0.0
        
        return total_revenue / total_volume
    
    async def _calculate_win_rate(
        self,
        data_sources: Dict[str, Any],
        time_period: Optional[Dict[str, datetime]]
    ) -> float:
        """Calculate win rate percentage"""
        trades = data_sources.get("trades", [])
        
        if not trades:
            # Return mock data
            return 68.5
        
        profitable_trades = [t for t in trades if t.get("pnl", 0) > 0]
        total_trades = len(trades)
        
        if total_trades == 0:
            return 0.0
        
        return (len(profitable_trades) / total_trades) * 100
    
    async def _calculate_sharpe_ratio(
        self,
        data_sources: Dict[str, Any],
        time_period: Optional[Dict[str, datetime]]
    ) -> float:
        """Calculate Sharpe ratio"""
        portfolio_returns = data_sources.get("portfolio_returns", [])
        risk_free_rate = data_sources.get("risk_free_rate", 0.02)
        
        if not portfolio_returns:
            # Return mock data
            return 1.45
        
        # Convert to numpy array for calculations
        returns = np.array([r.get("return", 0) for r in portfolio_returns])
        
        if len(returns) == 0:
            return 0.0
        
        # Calculate metrics
        mean_return = np.mean(returns)
        std_return = np.std(returns)
        
        if std_return == 0:
            return 0.0
        
        sharpe_ratio = (mean_return - risk_free_rate) / std_return
        return sharpe_ratio
    
    async def _calculate_var(
        self,
        data_sources: Dict[str, Any],
        time_period: Optional[Dict[str, datetime]]
    ) -> float:
        """Calculate Value at Risk (95% confidence)"""
        portfolio_positions = data_sources.get("portfolio_positions", [])
        
        if not portfolio_positions:
            # Return mock data
            return 125000.0
        
        # Mock VaR calculation
        portfolio_value = sum(pos.get("value", 0) for pos in portfolio_positions)
        volatility = 0.15  # Mock volatility
        
        # Simple VaR calculation: 1.65 * volatility * portfolio_value
        var_95 = 1.65 * volatility * portfolio_value
        return var_95
    
    async def _calculate_liquidity_ratio(
        self,
        data_sources: Dict[str, Any],
        time_period: Optional[Dict[str, datetime]]
    ) -> float:
        """Calculate liquidity ratio"""
        financial_statements = data_sources.get("financial_statements", {})
        
        if not financial_statements:
            # Return mock data
            return 1.85
        
        current_assets = financial_statements.get("current_assets", 0)
        current_liabilities = financial_statements.get("current_liabilities", 0)
        
        if current_liabilities == 0:
            return float('inf')
        
        return current_assets / current_liabilities
    
    async def _calculate_market_impact(
        self,
        data_sources: Dict[str, Any],
        time_period: Optional[Dict[str, datetime]]
    ) -> float:
        """Calculate market impact percentage"""
        trades = data_sources.get("trades", [])
        market_data = data_sources.get("market_data", [])
        
        if not trades:
            # Return mock data
            return 0.08
        
        # Mock market impact calculation
        total_volume = sum(t.get("volume_mwh", 0) for t in trades)
        avg_daily_volume = 10000  # Mock daily volume
        
        if avg_daily_volume == 0:
            return 0.0
        
        impact = (total_volume / avg_daily_volume) * 0.5  # Mock impact factor
        return min(impact, 2.0)  # Cap at 2%
    
    async def _calculate_arbitrage_profit(
        self,
        data_sources: Dict[str, Any],
        time_period: Optional[Dict[str, datetime]]
    ) -> float:
        """Calculate energy arbitrage profit"""
        market_prices = data_sources.get("market_prices", [])
        arbitrage_ops = data_sources.get("arbitrage_opportunities", [])
        
        if not arbitrage_ops:
            # Return mock data
            return 23450.75
        
        total_profit = sum(
            op.get("profit", 0) for op in arbitrage_ops
        )
        return total_profit
    
    async def _calculate_emissions_intensity(
        self,
        data_sources: Dict[str, Any],
        time_period: Optional[Dict[str, datetime]]
    ) -> float:
        """Calculate carbon emissions intensity"""
        emissions_data = data_sources.get("emissions_data", [])
        energy_trades = data_sources.get("energy_trades", [])
        
        if not energy_trades:
            # Return mock data
            return 385.2
        
        total_emissions = sum(e.get("co2_emissions", 0) for e in emissions_data)
        total_energy = sum(t.get("energy_mwh", 0) for t in energy_trades)
        
        if total_energy == 0:
            return 0.0
        
        return total_emissions / total_energy
    
    async def _calculate_portfolio_diversification(
        self,
        data_sources: Dict[str, Any],
        time_period: Optional[Dict[str, datetime]]
    ) -> float:
        """Calculate portfolio diversification index"""
        portfolio_positions = data_sources.get("portfolio_positions", [])
        
        if not portfolio_positions:
            # Return mock data
            return 0.72
        
        total_value = sum(pos.get("value", 0) for pos in portfolio_positions)
        
        if total_value == 0:
            return 0.0
        
        # Calculate Herfindahl-Hirschman Index
        hhi = sum((pos.get("value", 0) / total_value) ** 2 for pos in portfolio_positions)
        diversification_index = 1 - hhi
        
        return diversification_index
    
    # Helper Methods
    
    async def _get_benchmark_value(
        self,
        kpi_id: str,
        benchmark_type: Optional[BenchmarkType]
    ) -> Optional[float]:
        """Get benchmark value for KPI"""
        if not benchmark_type or kpi_id not in self._benchmark_data:
            return None
        
        # Find matching benchmark data
        for benchmark in self._benchmark_data[kpi_id]:
            if benchmark.benchmark_type == benchmark_type:
                return benchmark.value
        
        return None
    
    async def _calculate_trend(
        self,
        kpi_id: str,
        current_value: float,
        time_period: Optional[Dict[str, datetime]]
    ) -> Tuple[Optional[str], Optional[float]]:
        """Calculate trend direction and change percentage"""
        # Get historical values
        historical_values = list(self._kpi_cache[kpi_id])
        
        if len(historical_values) < 2:
            return None, None
        
        # Compare with previous value
        previous_value = historical_values[-2].value
        
        if previous_value == 0:
            return None, None
        
        change_pct = ((current_value - previous_value) / previous_value) * 100
        
        # Determine trend direction
        if abs(change_pct) < 2:  # Less than 2% change
            trend_direction = "stable"
        elif change_pct > 0:
            trend_direction = "up"
        else:
            trend_direction = "down"
        
        return trend_direction, change_pct
    
    async def _calculate_percentile_rank(
        self,
        kpi_id: str,
        value: float
    ) -> Optional[float]:
        """Calculate percentile rank of value"""
        # Mock percentile calculation
        if kpi_id == "total_revenue":
            if value > 1200000:
                return 90.0
            elif value > 850000:
                return 60.0
            else:
                return 25.0
        elif kpi_id == "win_rate":
            if value > 78:
                return 85.0
            elif value > 62:
                return 55.0
            else:
                return 30.0
        
        return None
    
    def _calculate_gap_analysis(
        self,
        current_value: Optional[float],
        benchmark_value: Optional[float]
    ) -> Dict[str, float]:
        """Calculate gap analysis between current and benchmark"""
        if current_value is None or benchmark_value is None:
            return {"gap_absolute": 0, "gap_percentage": 0}
        
        gap_absolute = benchmark_value - current_value
        gap_percentage = (gap_absolute / benchmark_value) * 100 if benchmark_value != 0 else 0
        
        return {
            "gap_absolute": gap_absolute,
            "gap_percentage": gap_percentage
        }
    
    def _get_performance_rating(
        self,
        current_value: Optional[float],
        benchmark_value: Optional[float]
    ) -> str:
        """Get performance rating based on benchmark comparison"""
        if current_value is None or benchmark_value is None:
            return "unknown"
        
        ratio = current_value / benchmark_value
        
        if ratio >= 1.2:
            return "excellent"
        elif ratio >= 1.0:
            return "good"
        elif ratio >= 0.8:
            return "satisfactory"
        else:
            return "needs_improvement"
    
    def _get_start_time(self, end_time: datetime, timeframe: str) -> datetime:
        """Get start time based on timeframe string"""
        if timeframe == "1d":
            return end_time - timedelta(days=1)
        elif timeframe == "7d":
            return end_time - timedelta(days=7)
        elif timeframe == "30d":
            return end_time - timedelta(days=30)
        elif timeframe == "90d":
            return end_time - timedelta(days=90)
        else:
            return end_time - timedelta(days=7)  # Default to 7 days
    
    # Mock data generators for development
    def _generate_mock_trades_data(self, start_time: datetime, end_time: datetime) -> List[Dict[str, Any]]:
        """Generate mock trades data for development"""
        return [
            {
                "trade_id": f"trade_{i}",
                "timestamp": start_time + timedelta(hours=i),
                "revenue": 50000 + i * 1000,
                "volume_mwh": 100 + i * 10,
                "pnl": 5000 + i * 200,
                "market_zone": f"zone_{i % 5}"
            }
            for i in range(24)
        ]
    
    def _generate_mock_market_data(self, start_time: datetime, end_time: datetime) -> List[Dict[str, Any]]:
        """Generate mock market data for development"""
        return [
            {
                "timestamp": start_time + timedelta(hours=i),
                "price": 45.0 + np.random.normal(0, 5),
                "volume": 1000 + np.random.normal(0, 100),
                "zone": f"zone_{i % 5}"
            }
            for i in range(24)
        ]
    
    def _generate_mock_returns_data(self, start_time: datetime, end_time: datetime) -> List[Dict[str, Any]]:
        """Generate mock returns data for development"""
        return [
            {
                "timestamp": start_time + timedelta(days=i),
                "return": np.random.normal(0.001, 0.02)  # 0.1% daily return with 2% volatility
            }
            for i in range(30)
        ]
    
    async def _generate_trend_analysis(
        self,
        kpi_ids: List[str],
        time_period: str
    ) -> Dict[str, List[Dict[str, Any]]]:
        """Generate trend analysis data for KPIs"""
        trends = {}
        
        for kpi_id in kpi_ids:
            # Mock trend data
            trend_data = []
            for i in range(30):
                base_value = 50.0 if kpi_id != "value_at_risk" else 150000
                value = base_value + np.random.normal(0, base_value * 0.1)
                trend_data.append({
                    "timestamp": (datetime.utcnow() - timedelta(days=29-i)).isoformat(),
                    "value": value
                })
            
            trends[kpi_id] = trend_data
        
        return trends
    
    async def _get_benchmark_summary(
        self,
        kpi_ids: List[str]
    ) -> Dict[str, Dict[str, float]]:
        """Get benchmark summary for KPIs"""
        summary = {}
        
        for kpi_id in kpi_ids:
            if kpi_id in self._benchmark_data:
                benchmarks = self._benchmark_data[kpi_id]
                summary[kpi_id] = {
                    benchmark.benchmark_type.value: benchmark.value
                    for benchmark in benchmarks
                }
        
        return summary
    
    async def get_analytics_status(self) -> Dict[str, Any]:
        """Get analytics service status"""
        return {
            "status": "healthy",
            "kpis_configured": len(self.kpi_definitions),
            "cache_sizes": {kpi_id: len(queue) for kpi_id, queue in self._kpi_cache.items()},
            "benchmarks_loaded": sum(len(benchmarks) for benchmarks in self._benchmark_data.values()),
            "insights_generated": len(self._insights),
            "last_calculation": datetime.utcnow().isoformat()
        }


# Singleton instance
_analytics_instance: Optional[AdvancedAnalyticsService] = None


async def get_analytics_service() -> AdvancedAnalyticsService:
    """Get or create analytics service instance"""
    global _analytics_instance
    
    if _analytics_instance is None:
        _analytics_instance = AdvancedAnalyticsService()
    
    return _analytics_instance


async def shutdown_analytics_service():
    """Shutdown analytics service instance"""
    global _analytics_instance
    _analytics_instance = None


# Utility functions for analytics integration
async def calculate_realtime_kpi(
    kpi_id: str,
    data_sources: Dict[str, Any],
    analytics_service: AdvancedAnalyticsService
) -> Optional[Dict[str, Any]]:
    """Calculate real-time KPI for dashboard"""
    kpi_def = analytics_service.kpi_definitions.get(kpi_id)
    if not kpi_def or not kpi_def.is_real_time:
        return None
    
    result = await analytics_service.calculate_kpi(kpi_id, data_sources)
    if not result:
        return None
    
    return {
        "kpi_id": kpi_id,
        "value": result.value,
        "unit": kpi_def.unit,
        "timestamp": result.timestamp.isoformat(),
        "trend": result.trend_direction,
        "change_pct": result.trend_change_pct,
        "benchmark": result.benchmark_value
    }


def format_kpi_value(value: float, unit: str) -> str:
    """Format KPI value for display"""
    if unit == "USD" or unit == "USD/MWh":
        if value >= 1000000:
            return f"${value/1000000:.1f}M"
        elif value >= 1000:
            return f"${value/1000:.1f}K"
        else:
            return f"${value:.2f}"
    elif unit == "%":
        return f"{value:.1f}%"
    elif unit == "ratio":
        return f"{value:.2f}"
    elif unit == "kg CO2/MWh":
        return f"{value:.1f} kg/MWh"
    else:
        return f"{value:.2f} {unit}"
