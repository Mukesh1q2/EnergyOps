"""
Performance Monitoring Service

Comprehensive performance monitoring for dashboard and API operations,
including real-time metrics collection, alert generation, and performance optimization recommendations.

Features:
- Real-time performance metrics collection
- Dashboard component performance tracking
- API response time monitoring
- Database query performance analysis
- Performance alert generation
- Optimization recommendations
"""

import asyncio
import time
import json
from typing import Dict, List, Optional, Any, Tuple, Union
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from enum import Enum
from collections import defaultdict, deque
import statistics
import logging

logger = logging.getLogger(__name__)


class MetricType(Enum):
    """Types of performance metrics"""
    RESPONSE_TIME = "response_time"
    THROUGHPUT = "throughput"
    ERROR_RATE = "error_rate"
    MEMORY_USAGE = "memory_usage"
    CPU_USAGE = "cpu_usage"
    CACHE_HIT_RATIO = "cache_hit_ratio"
    DATABASE_QUERY_TIME = "db_query_time"
    CONCURRENT_USERS = "concurrent_users"


class AlertSeverity(Enum):
    """Alert severity levels"""
    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"


@dataclass
class PerformanceMetric:
    """Individual performance metric"""
    metric_type: MetricType
    value: float
    timestamp: datetime
    labels: Dict[str, str]
    metadata: Optional[Dict[str, Any]] = None


@dataclass
class PerformanceAlert:
    """Performance alert definition"""
    alert_id: str
    severity: AlertSeverity
    metric_type: MetricType
    threshold: float
    current_value: float
    message: str
    labels: Dict[str, str]
    created_at: datetime
    resolved_at: Optional[datetime] = None


@dataclass
class ComponentPerformance:
    """Performance metrics for dashboard components"""
    component_id: str
    component_type: str
    avg_response_time: float
    p95_response_time: float
    error_rate: float
    render_time: float
    data_load_time: float
    cache_hit_ratio: float
    access_count: int
    last_updated: datetime


@dataclass
class OptimizationRecommendation:
    """Performance optimization recommendation"""
    recommendation_id: str
    category: str
    priority: int
    title: str
    description: str
    impact_score: float
    effort_score: float
    implementation_guide: str
    created_at: datetime


class PerformanceMonitoringService:
    """
    Comprehensive performance monitoring service
    """
    
    def __init__(
        self,
        retention_hours: int = 24,
        alert_thresholds: Dict[str, Dict[str, float]] = None,
        sample_rate: float = 1.0
    ):
        self.retention_hours = retention_hours
        self.sample_rate = sample_rate
        self.alert_thresholds = alert_thresholds or self._default_thresholds()
        
        # Metric storage
        self._metrics: Dict[str, deque] = defaultdict(
            lambda: deque(maxlen=10000)
        )
        
        # Component performance tracking
        self._component_metrics: Dict[str, ComponentPerformance] = {}
        
        # Active alerts
        self._active_alerts: Dict[str, PerformanceAlert] = {}
        
        # Performance recommendations
        self._recommendations: List[OptimizationRecommendation] = []
        
        # Monitoring state
        self._is_monitoring = False
        self._monitoring_task: Optional[asyncio.Task] = None
        
        # Real-time metrics buffer
        self._realtime_buffer: deque = deque(maxlen=1000)
        
        # Dashboard performance baselines
        self._performance_baselines: Dict[str, Dict[str, float]] = {}
    
    def _default_thresholds(self) -> Dict[str, Dict[str, float]]:
        """Default alert thresholds"""
        return {
            MetricType.RESPONSE_TIME.value: {"warning": 2.0, "critical": 5.0},
            MetricType.ERROR_RATE.value: {"warning": 0.05, "critical": 0.10},
            MetricType.CACHE_HIT_RATIO.value: {"warning": 0.70, "critical": 0.50},
            MetricType.DATABASE_QUERY_TIME.value: {"warning": 1.0, "critical": 3.0},
            MetricType.MEMORY_USAGE.value: {"warning": 80.0, "critical": 95.0},
            MetricType.CONCURRENT_USERS.value: {"warning": 100, "critical": 500},
        }
    
    async def start_monitoring(self):
        """Start performance monitoring"""
        if self._is_monitoring:
            return
        
        self._is_monitoring = True
        self._monitoring_task = asyncio.create_task(self._monitoring_loop())
        logger.info("Performance monitoring started")
    
    async def stop_monitoring(self):
        """Stop performance monitoring"""
        self._is_monitoring = False
        if self._monitoring_task:
            self._monitoring_task.cancel()
            try:
                await self._monitoring_task
            except asyncio.CancelledError:
                pass
        logger.info("Performance monitoring stopped")
    
    async def record_metric(
        self,
        metric_type: MetricType,
        value: float,
        labels: Optional[Dict[str, str]] = None,
        metadata: Optional[Dict[str, Any]] = None
    ):
        """Record a performance metric"""
        if labels is None:
            labels = {}
        
        metric = PerformanceMetric(
            metric_type=metric_type,
            value=value,
            timestamp=datetime.utcnow(),
            labels=labels,
            metadata=metadata
        )
        
        # Store metric
        metric_key = f"{metric_type.value}:{self._labels_to_string(labels)}"
        self._metrics[metric_key].append(metric)
        
        # Add to real-time buffer
        self._realtime_buffer.append(metric)
        
        # Check for alerts
        await self._check_alert_conditions(metric)
        
        # Sample rate handling
        if self.sample_rate < 1.0 and len(self._realtime_buffer) % int(1/self.sample_rate) != 0:
            return  # Skip this metric based on sample rate
    
    async def record_dashboard_render(
        self,
        component_id: str,
        component_type: str,
        render_time: float,
        data_load_time: float,
        cache_hit: bool,
        user_id: Optional[str] = None
    ):
        """Record dashboard component performance"""
        labels = {
            "component_id": component_id,
            "component_type": component_type,
            "user_id": user_id or "anonymous"
        }
        
        # Record individual metrics
        await self.record_metric(MetricType.RESPONSE_TIME, render_time, labels)
        
        # Update component performance
        await self._update_component_performance(
            component_id, component_type, render_time, data_load_time, cache_hit
        )
        
        # Check component-specific alerts
        await self._check_component_alerts(component_id, component_type, render_time)
    
    async def record_api_request(
        self,
        endpoint: str,
        method: str,
        response_time: float,
        status_code: int,
        user_id: Optional[str] = None,
        error_message: Optional[str] = None
    ):
        """Record API request performance"""
        labels = {
            "endpoint": endpoint,
            "method": method,
            "status_code": str(status_code),
            "user_id": user_id or "anonymous"
        }
        
        # Record metrics
        await self.record_metric(MetricType.RESPONSE_TIME, response_time, labels)
        
        # Record error if applicable
        if status_code >= 400 or error_message:
            labels["error"] = "true"
            await self.record_metric(MetricType.ERROR_RATE, 1.0, labels)
        
        # Record throughput (handled in aggregation)
    
    async def record_database_query(
        self,
        query_type: str,
        table_name: str,
        query_time: float,
        rows_affected: int,
        query_hash: str
    ):
        """Record database query performance"""
        labels = {
            "query_type": query_type,
            "table_name": table_name,
            "query_hash": query_hash
        }
        
        await self.record_metric(MetricType.DATABASE_QUERY_TIME, query_time, labels)
        
        # Check for slow queries
        if query_time > self.alert_thresholds[
            MetricType.DATABASE_QUERY_TIME.value
        ]["warning"]:
            await self._create_slow_query_alert(query_type, table_name, query_time)
    
    async def get_performance_summary(
        self,
        timeframe: str = "1h"
    ) -> Dict[str, Any]:
        """Get performance summary for specified timeframe"""
        end_time = datetime.utcnow()
        start_time = self._get_start_time(end_time, timeframe)
        
        summary = {
            "timeframe": timeframe,
            "start_time": start_time.isoformat(),
            "end_time": end_time.isoformat(),
            "metrics": {},
            "components": {},
            "alerts": [],
            "recommendations": []
        }
        
        # Aggregate metrics for timeframe
        for metric_key, metric_queue in self._metrics.items():
            recent_metrics = [
                m for m in metric_queue
                if m.timestamp >= start_time
            ]
            
            if recent_metrics:
                metric_type = recent_metrics[0].metric_type
                values = [m.value for m in recent_metrics]
                
                summary["metrics"][metric_type.value] = {
                    "avg": statistics.mean(values),
                    "p50": statistics.median(values),
                    "p95": self._percentile(values, 95),
                    "p99": self._percentile(values, 99),
                    "min": min(values),
                    "max": max(values),
                    "count": len(values)
                }
        
        # Component performance
        for component_id, performance in self._component_metrics.items():
            if performance.last_updated >= start_time:
                summary["components"][component_id] = asdict(performance)
        
        # Active alerts
        summary["alerts"] = [
            asdict(alert) for alert in self._active_alerts.values()
            if alert.created_at >= start_time
        ]
        
        # Generate recommendations
        summary["recommendations"] = [
            asdict(rec) for rec in self._generate_recommendations()
        ]
        
        return summary
    
    async def get_real_time_metrics(
        self,
        metric_types: Optional[List[MetricType]] = None
    ) -> Dict[str, Any]:
        """Get real-time performance metrics"""
        current_time = datetime.utcnow()
        five_minutes_ago = current_time - timedelta(minutes=5)
        
        realtime_metrics = {}
        
        # Filter metrics from real-time buffer
        recent_metrics = [
            m for m in self._realtime_buffer
            if m.timestamp >= five_minutes_ago
        ]
        
        if metric_types:
            recent_metrics = [
                m for m in recent_metrics
                if m.metric_type in metric_types
            ]
        
        # Group by metric type
        for metric in recent_metrics:
            metric_type = metric.metric_type.value
            if metric_type not in realtime_metrics:
                realtime_metrics[metric_type] = []
            realtime_metrics[metric_type].append(metric.value)
        
        # Calculate aggregates
        result = {}
        for metric_type, values in realtime_metrics.items():
            if values:
                result[metric_type] = {
                    "current": values[-1] if values else 0,
                    "avg_5m": statistics.mean(values),
                    "p95_5m": self._percentile(values, 95),
                    "trend": "increasing" if len(values) > 1 and values[-1] > values[0] else "decreasing"
                }
        
        return {
            "timestamp": current_time.isoformat(),
            "metrics": result,
            "active_alerts": len(self._active_alerts)
        }
    
    async def get_component_performance(
        self,
        component_id: Optional[str] = None,
        component_type: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Get component performance metrics"""
        components = []
        
        for comp_id, performance in self._component_metrics.items():
            # Filter by component ID and type
            if component_id and comp_id != component_id:
                continue
            if component_type and performance.component_type != component_type:
                continue
            
            components.append(asdict(performance))
        
        # Sort by access count (most popular first)
        components.sort(key=lambda x: x["access_count"], reverse=True)
        
        return components
    
    async def get_performance_baselines(self) -> Dict[str, Dict[str, float]]:
        """Get performance baselines for comparison"""
        return self._performance_baselines.copy()
    
    async def update_performance_baseline(
        self,
        component_id: str,
        baseline_metrics: Dict[str, float]
    ):
        """Update performance baseline for a component"""
        self._performance_baselines[component_id] = baseline_metrics
    
    async def _monitoring_loop(self):
        """Main monitoring loop"""
        while self._is_monitoring:
            try:
                # Clean up old metrics
                await self._cleanup_old_metrics()
                
                # Check for performance issues
                await self._analyze_performance_trends()
                
                # Update recommendations
                await self._update_recommendations()
                
                # Wait before next cycle
                await asyncio.sleep(60)  # Monitor every minute
                
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error in monitoring loop: {e}")
                await asyncio.sleep(5)  # Wait before retry
    
    async def _update_component_performance(
        self,
        component_id: str,
        component_type: str,
        render_time: float,
        data_load_time: float,
        cache_hit: bool
    ):
        """Update component performance metrics"""
        current_time = datetime.utcnow()
        
        if component_id in self._component_metrics:
            # Update existing performance
            perf = self._component_metrics[component_id]
            
            # Update with exponential moving average
            alpha = 0.1  # Smoothing factor
            perf.avg_response_time = (
                (1 - alpha) * perf.avg_response_time + alpha * render_time
            )
            
            # Update P95 with simple moving average of last 100 renders
            if not hasattr(perf, '_render_times'):
                perf._render_times = deque(maxlen=100)
            perf._render_times.append(render_time)
            perf.p95_response_time = self._percentile(list(perf._render_times), 95)
            
            # Update other metrics
            perf.data_load_time = (
                (1 - alpha) * perf.data_load_time + alpha * data_load_time
            )
            
            # Update cache hit ratio
            if cache_hit:
                perf.cache_hit_ratio = (
                    (1 - alpha) * perf.cache_hit_ratio + alpha * 1.0
                )
            else:
                perf.cache_hit_ratio = (
                    (1 - alpha) * perf.cache_hit_ratio + alpha * 0.0
                )
            
            perf.access_count += 1
            perf.last_updated = current_time
            
        else:
            # Create new performance record
            self._component_metrics[component_id] = ComponentPerformance(
                component_id=component_id,
                component_type=component_type,
                avg_response_time=render_time,
                p95_response_time=render_time,
                error_rate=0.0,
                render_time=render_time,
                data_load_time=data_load_time,
                cache_hit_ratio=1.0 if cache_hit else 0.0,
                access_count=1,
                last_updated=current_time
            )
            
            if not hasattr(self._component_metrics[component_id], '_render_times'):
                self._component_metrics[component_id]._render_times = deque(maxlen=100)
                self._component_metrics[component_id]._render_times.append(render_time)
    
    async def _check_alert_conditions(self, metric: PerformanceMetric):
        """Check if metric triggers alert conditions"""
        metric_type_key = metric.metric_type.value
        if metric_type_key not in self.alert_thresholds:
            return
        
        thresholds = self.alert_thresholds[metric_type_key]
        
        # Check warning threshold
        if "warning" in thresholds and metric.value > thresholds["warning"]:
            await self._create_alert(
                metric, "warning", thresholds["warning"], metric.value
            )
        
        # Check critical threshold
        if "critical" in thresholds and metric.value > thresholds["critical"]:
            await self._create_alert(
                metric, "critical", thresholds["critical"], metric.value
            )
    
    async def _create_alert(
        self,
        metric: PerformanceMetric,
        severity: str,
        threshold: float,
        current_value: float
    ):
        """Create performance alert"""
        alert_id = f"{metric.metric_type.value}:{self._labels_to_string(metric.labels)}"
        
        if alert_id in self._active_alerts:
            # Update existing alert
            alert = self._active_alerts[alert_id]
            alert.current_value = current_value
            alert.threshold = threshold
        else:
            # Create new alert
            alert = PerformanceAlert(
                alert_id=alert_id,
                severity=AlertSeverity(severity),
                metric_type=metric.metric_type,
                threshold=threshold,
                current_value=current_value,
                message=self._generate_alert_message(metric, severity, threshold),
                labels=metric.labels.copy(),
                created_at=datetime.utcnow()
            )
            
            self._active_alerts[alert_id] = alert
            logger.warning(f"Performance alert created: {alert.message}")
    
    async def _create_slow_query_alert(
        self,
        query_type: str,
        table_name: str,
        query_time: float
    ):
        """Create slow query alert"""
        alert_id = f"slow_query:{table_name}:{query_type}"
        
        alert = PerformanceAlert(
            alert_id=alert_id,
            severity=AlertSeverity.WARNING,
            metric_type=MetricType.DATABASE_QUERY_TIME,
            threshold=1.0,
            current_value=query_time,
            message=f"Slow query detected on {table_name}.{query_type}: {query_time:.2f}s",
            labels={
                "query_type": query_type,
                "table_name": table_name
            },
            created_at=datetime.utcnow()
        )
        
        self._active_alerts[alert_id] = alert
        logger.warning(alert.message)
    
    async def _check_component_alerts(
        self,
        component_id: str,
        component_type: str,
        render_time: float
    ):
        """Check component-specific alert conditions"""
        # Check for slow rendering
        if render_time > 5.0:  # 5 second threshold
            alert_id = f"slow_render:{component_id}"
            await self._create_component_alert(
                component_id, "slow_render", render_time,
                f"Component {component_id} rendering slowly: {render_time:.2f}s"
            )
    
    async def _create_component_alert(
        self,
        component_id: str,
        alert_type: str,
        value: float,
        message: str
    ):
        """Create component-specific alert"""
        alert_id = f"{alert_type}:{component_id}"
        
        alert = PerformanceAlert(
            alert_id=alert_id,
            severity=AlertSeverity.WARNING,
            metric_type=MetricType.RESPONSE_TIME,
            threshold=0.0,
            current_value=value,
            message=message,
            labels={"component_id": component_id, "alert_type": alert_type},
            created_at=datetime.utcnow()
        )
        
        self._active_alerts[alert_id] = alert
        logger.warning(message)
    
    def _generate_recommendations(self) -> List[OptimizationRecommendation]:
        """Generate performance optimization recommendations"""
        recommendations = []
        
        # Analyze cache performance
        cache_metrics = self._get_recent_metrics(MetricType.CACHE_HIT_RATIO)
        if cache_metrics:
            avg_hit_ratio = statistics.mean(cache_metrics)
            if avg_hit_ratio < 0.7:
                recommendations.append(
                    OptimizationRecommendation(
                        recommendation_id="improve_cache_strategy",
                        category="caching",
                        priority=1,
                        title="Improve Cache Strategy",
                        description=f"Cache hit ratio is {avg_hit_ratio:.2%}, below target of 70%",
                        impact_score=0.8,
                        effort_score=0.3,
                        implementation_guide="Review cache keys and TTL settings",
                        created_at=datetime.utcnow()
                    )
                )
        
        # Analyze slow queries
        db_metrics = self._get_recent_metrics(MetricType.DATABASE_QUERY_TIME)
        if db_metrics:
            avg_query_time = statistics.mean(db_metrics)
            if avg_query_time > 1.0:
                recommendations.append(
                    OptimizationRecommendation(
                        recommendation_id="optimize_database_queries",
                        category="database",
                        priority=2,
                        title="Optimize Database Queries",
                        description=f"Average query time is {avg_query_time:.2f}s, above threshold",
                        impact_score=0.9,
                        effort_score=0.6,
                        implementation_guide="Add database indexes and optimize queries",
                        created_at=datetime.utcnow()
                    )
                )
        
        # Analyze component performance
        slow_components = [
            comp for comp in self._component_metrics.values()
            if comp.p95_response_time > 3.0
        ]
        
        if slow_components:
            recommendations.append(
                OptimizationRecommendation(
                    recommendation_id="optimize_slow_components",
                    category="frontend",
                    priority=3,
                    title="Optimize Slow Components",
                    description=f"{len(slow_components)} components have slow render times",
                    impact_score=0.7,
                    effort_score=0.5,
                    implementation_guide="Optimize component rendering and add caching",
                    created_at=datetime.utcnow()
                )
            )
        
        return recommendations
    
    async def _analyze_performance_trends(self):
        """Analyze performance trends for proactive alerts"""
        # Check for increasing response times
        response_metrics = self._get_recent_metrics(MetricType.RESPONSE_TIME)
        if len(response_metrics) >= 10:
            # Check for trend
            recent_avg = statistics.mean(response_metrics[-10:])
            older_avg = statistics.mean(response_metrics[-20:-10]) if len(response_metrics) >= 20 else recent_avg
            
            if recent_avg > older_avg * 1.2:  # 20% increase
                # Create trend alert
                alert_id = "performance_trend_increase"
                await self._create_trend_alert(recent_avg, older_avg)
    
    async def _create_trend_alert(self, current_avg: float, previous_avg: float):
        """Create performance trend alert"""
        alert = PerformanceAlert(
            alert_id="performance_trend_increase",
            severity=AlertSeverity.WARNING,
            metric_type=MetricType.RESPONSE_TIME,
            threshold=previous_avg,
            current_value=current_avg,
            message=f"Response time increasing: {previous_avg:.2f}s → {current_avg:.2f}s",
            labels={"trend": "increasing"},
            created_at=datetime.utcnow()
        )
        
        self._active_alerts[alert_id] = alert
        logger.warning(alert.message)
    
    def _get_recent_metrics(self, metric_type: MetricType) -> List[float]:
        """Get recent metric values of specified type"""
        recent_metrics = []
        cutoff_time = datetime.utcnow() - timedelta(hours=1)
        
        for metric_queue in self._metrics.values():
            for metric in metric_queue:
                if (metric.metric_type == metric_type and 
                    metric.timestamp >= cutoff_time):
                    recent_metrics.append(metric.value)
        
        return recent_metrics
    
    def _labels_to_string(self, labels: Dict[str, str]) -> str:
        """Convert labels dict to string for metric key"""
        sorted_labels = sorted(labels.items())
        return ";".join([f"{k}={v}" for k, v in sorted_labels])
    
    def _generate_alert_message(
        self,
        metric: PerformanceMetric,
        severity: str,
        threshold: float
    ) -> str:
        """Generate alert message"""
        return (
            f"{severity.upper()}: {metric.metric_type.value} "
            f"value {metric.value:.2f} exceeds threshold {threshold:.2f}"
        )
    
    def _percentile(self, data: List[float], percentile: int) -> float:
        """Calculate percentile"""
        if not data:
            return 0.0
        
        sorted_data = sorted(data)
        index = (percentile / 100) * (len(sorted_data) - 1)
        
        if index.is_integer():
            return sorted_data[int(index)]
        else:
            lower = sorted_data[int(index)]
            upper = sorted_data[int(index) + 1]
            return lower + (upper - lower) * (index - int(index))
    
    def _get_start_time(self, end_time: datetime, timeframe: str) -> datetime:
        """Get start time based on timeframe string"""
        if timeframe == "5m":
            return end_time - timedelta(minutes=5)
        elif timeframe == "15m":
            return end_time - timedelta(minutes=15)
        elif timeframe == "1h":
            return end_time - timedelta(hours=1)
        elif timeframe == "6h":
            return end_time - timedelta(hours=6)
        elif timeframe == "24h":
            return end_time - timedelta(days=1)
        elif timeframe == "7d":
            return end_time - timedelta(days=7)
        else:
            return end_time - timedelta(hours=1)  # Default to 1 hour
    
    async def _cleanup_old_metrics(self):
        """Clean up old metrics to manage memory"""
        cutoff_time = datetime.utcnow() - timedelta(hours=self.retention_hours)
        
        for metric_key in list(self._metrics.keys()):
            metric_queue = self._metrics[metric_key]
            
            # Remove old metrics
            while metric_queue and metric_queue[0].timestamp < cutoff_time:
                metric_queue.popleft()
            
            # Remove empty queues
            if not metric_queue:
                del self._metrics[metric_key]
    
    async def _update_recommendations(self):
        """Update performance recommendations"""
        self._recommendations = self._generate_recommendations()
    
    async def get_health_status(self) -> Dict[str, Any]:
        """Get monitoring service health status"""
        return {
            "status": "healthy" if self._is_monitoring else "stopped",
            "is_monitoring": self._is_monitoring,
            "metrics_count": sum(len(queue) for queue in self._metrics.values()),
            "components_count": len(self._component_metrics),
            "active_alerts": len(self._active_alerts),
            "recommendations_count": len(self._recommendations),
            "buffer_size": len(self._realtime_buffer),
            "uptime": datetime.utcnow().isoformat()
        }


# Singleton instance
_monitoring_instance: Optional[PerformanceMonitoringService] = None


async def get_monitoring_service() -> PerformanceMonitoringService:
    """Get or create monitoring service instance"""
    global _monitoring_instance
    
    if _monitoring_instance is None:
        _monitoring_instance = PerformanceMonitoringService()
        await _monitoring_instance.start_monitoring()
    
    return _monitoring_instance


async def shutdown_monitoring_service():
    """Shutdown monitoring service instance"""
    global _monitoring_instance
    
    if _monitoring_instance:
        await _monitoring_instance.stop_monitoring()
        _monitoring_instance = None


# Performance monitoring context manager
class PerformanceMonitor:
    """Context manager for automatic performance tracking"""
    
    def __init__(
        self,
        component_id: str,
        component_type: str,
        user_id: Optional[str] = None
    ):
        self.component_id = component_id
        self.component_type = component_type
        self.user_id = user_id
        self.start_time = None
        self.monitoring_service = None
    
    async def __aenter__(self):
        self.start_time = time.time()
        self.monitoring_service = await get_monitoring_service()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.start_time and self.monitoring_service:
            render_time = time.time() - self.start_time
            
            # Check for errors
            error_occurred = exc_type is not None
            
            # Record performance
            await self.monitoring_service.record_dashboard_render(
                self.component_id,
                self.component_type,
                render_time,
                0.0,  # Data load time (set externally if needed)
                False,  # Cache hit (set externally if needed)
                self.user_id
            )
            
            if error_occurred:
                # Record error
                await self.monitoring_service.record_metric(
                    MetricType.ERROR_RATE,
                    1.0,
                    {
                        "component_id": self.component_id,
                        "component_type": self.component_type,
                        "error_type": str(exc_type.__name__) if exc_type else "unknown"
                    }
                )
