"""
OptiBid Energy Platform - Monitoring & Observability Schemas
Data validation schemas for monitoring and observability APIs

This module provides comprehensive Pydantic schemas for:
- Metrics collection and time-series data
- SLO/SLA tracking and compliance reporting
- Alerting rules and event management
- Incident response and tracking
- System health monitoring
- Distributed tracing and logging
"""

from pydantic import BaseModel, Field, validator, root_validator
from typing import Dict, List, Optional, Any, Union
from datetime import datetime
from enum import Enum
from decimal import Decimal
import json

# ===== ENUMS =====

class MetricType(str, Enum):
    COUNTER = "counter"
    GAUGE = "gauge"
    HISTOGRAM = "histogram"
    SUMMARY = "summary"

class AlertSeverity(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"

class AlertStatus(str, Enum):
    OPEN = "open"
    ACKNOWLEDGED = "acknowledged"
    RESOLVED = "resolved"
    SUPPRESSED = "suppressed"
    ESCALATED = "escalated"

class ServiceStatus(str, Enum):
    HEALTHY = "healthy"
    DEGRADED = "degraded"
    DOWN = "down"
    MAINTENANCE = "maintenance"

class SLOService(str, Enum):
    API = "api"
    DASHBOARD = "dashboard"
    SECURITY = "security"
    COMPLIANCE = "compliance"
    MONITORING = "monitoring"
    DATABASE = "database"

class LogLevel(str, Enum):
    DEBUG = "DEBUG"
    INFO = "INFO"
    WARN = "WARN"
    ERROR = "ERROR"
    FATAL = "FATAL"

# ===== BASE SCHEMAS =====

class TimestampedModel(BaseModel):
    """Base model with timestamp fields"""
    id: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# ===== METRIC COLLECTOR SCHEMAS =====

class MetricCollectorBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Unique name for the metric collector")
    type: MetricType = Field(..., description="Type of metrics this collector handles")
    description: Optional[str] = Field(None, description="Human-readable description")
    source_system: str = Field(..., min_length=1, max_length=50, description="Source system (prometheus, datadog, etc.)")
    endpoint_url: Optional[str] = Field(None, description="API endpoint URL for metrics")
    auth_config: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Authentication configuration")
    collection_interval: int = Field(default=60, ge=5, le=3600, description="Collection interval in seconds")
    labels: Optional[Dict[str, str]] = Field(default_factory=dict, description="Fixed labels for all metrics")
    is_active: bool = Field(default=True, description="Whether this collector is active")

class MetricCollectorCreate(MetricCollectorBase):
    pass

class MetricCollectorUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    endpoint_url: Optional[str] = None
    auth_config: Optional[Dict[str, Any]] = None
    collection_interval: Optional[int] = Field(None, ge=5, le=3600)
    labels: Optional[Dict[str, str]] = None
    is_active: Optional[bool] = None

class MetricCollectorResponse(MetricCollectorBase):
    id: str
    created_at: datetime
    updated_at: Optional[datetime]
    
    @classmethod
    def from_orm(cls, collector):
        return cls(
            id=collector.id,
            name=collector.name,
            type=collector.type,
            description=collector.description,
            source_system=collector.source_system,
            endpoint_url=collector.endpoint_url,
            auth_config=collector.auth_config,
            collection_interval=collector.collection_interval,
            labels=collector.labels,
            is_active=collector.is_active,
            created_at=collector.created_at,
            updated_at=collector.updated_at
        )

# ===== COLLECTED METRIC SCHEMAS =====

class CollectedMetricBase(BaseModel):
    collector_id: str = Field(..., description="ID of the metric collector")
    metric_name: str = Field(..., min_length=1, max_length=200, description="Name of the metric")
    metric_type: MetricType = Field(..., description="Type of metric")
    value: Union[int, float, Decimal] = Field(..., description="Metric value")
    labels: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Metric labels")
    timestamp: datetime = Field(..., description="When the metric was collected")
    source_system: Optional[str] = Field(None, max_length=50, description="Source system name")

class CollectedMetricCreate(CollectedMetricBase):
    pass

class CollectedMetricResponse(CollectedMetricBase):
    id: str
    created_at: datetime
    
    @classmethod
    def from_orm(cls, metric):
        return cls(
            id=metric.id,
            collector_id=metric.collector_id,
            metric_name=metric.metric_name,
            metric_type=metric.metric_type,
            value=float(metric.value) if metric.value is not None else None,
            labels=metric.labels,
            timestamp=metric.timestamp,
            source_system=metric.source_system,
            created_at=metric.created_at
        )

# ===== SERVICE METRIC SCHEMAS =====

class ServiceMetricBase(BaseModel):
    collector_id: str = Field(..., description="ID of the collector")
    service_name: str = Field(..., min_length=1, max_length=100, description="Name of the service")
    metric_category: Optional[str] = Field(None, max_length=50, description="Category of metric")
    metric_name: str = Field(..., min_length=1, max_length=200, description="Name of the metric")
    current_value: Optional[Union[int, float, Decimal]] = Field(None, description="Current metric value")
    target_value: Optional[Union[int, float, Decimal]] = Field(None, description="SLO target value")
    threshold_warning: Optional[Union[int, float, Decimal]] = Field(None, description="Warning threshold")
    threshold_critical: Optional[Union[int, float, Decimal]] = Field(None, description="Critical threshold")
    labels: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Service-specific labels")
    is_tracked: bool = Field(default=True, description="Whether this metric is actively tracked")

class ServiceMetricCreate(ServiceMetricBase):
    pass

class ServiceMetricUpdate(BaseModel):
    service_name: Optional[str] = Field(None, min_length=1, max_length=100)
    metric_category: Optional[str] = Field(None, max_length=50)
    current_value: Optional[Union[int, float, Decimal]] = None
    target_value: Optional[Union[int, float, Decimal]] = None
    threshold_warning: Optional[Union[int, float, Decimal]] = None
    threshold_critical: Optional[Union[int, float, Decimal]] = None
    labels: Optional[Dict[str, Any]] = None
    is_tracked: Optional[bool] = None

class ServiceMetricResponse(ServiceMetricBase):
    id: str
    last_updated: datetime
    
    @classmethod
    def from_orm(cls, metric):
        return cls(
            id=metric.id,
            collector_id=metric.collector_id,
            service_name=metric.service_name,
            metric_category=metric.metric_category,
            metric_name=metric.metric_name,
            current_value=float(metric.current_value) if metric.current_value is not None else None,
            target_value=float(metric.target_value) if metric.target_value is not None else None,
            threshold_warning=float(metric.threshold_warning) if metric.threshold_warning is not None else None,
            threshold_critical=float(metric.threshold_critical) if metric.threshold_critical is not None else None,
            labels=metric.labels,
            is_tracked=metric.is_tracked,
            last_updated=metric.last_updated
        )

# ===== SLO TARGET SCHEMAS =====

class SLOTargetBase(BaseModel):
    service_metric_id: str = Field(..., description="ID of the service metric")
    service_type: SLOService = Field(..., description="Type of service this SLO applies to")
    objective_name: str = Field(..., min_length=1, max_length=200, description="Name of the objective")
    objective_type: str = Field(..., min_length=1, max_length=50, description="Type of objective (percentage, ms, ratio)")
    target_value: Union[int, float, Decimal] = Field(..., description="Target value (99.9 for availability)")
    time_window: str = Field(default="30d", description="Time window for SLO calculation")
    error_budget_percentage: Union[int, float, Decimal] = Field(default=0.1, description="Allowed error budget percentage")
    description: Optional[str] = Field(None, description="Description of the SLO")

class SLOTargetCreate(SLOTargetBase):
    pass

class SLOTargetUpdate(BaseModel):
    target_value: Optional[Union[int, float, Decimal]] = None
    time_window: Optional[str] = None
    error_budget_percentage: Optional[Union[int, float, Decimal]] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None

class SLOTargetResponse(SLOTargetBase):
    id: str
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime]
    
    @classmethod
    def from_orm(cls, slo):
        return cls(
            id=slo.id,
            service_metric_id=slo.service_metric_id,
            service_type=slo.service_type,
            objective_name=slo.objective_name,
            objective_type=slo.objective_type,
            target_value=float(slo.target_value),
            time_window=slo.time_window,
            error_budget_percentage=float(slo.error_budget_percentage),
            description=slo.description,
            is_active=slo.is_active,
            created_at=slo.created_at,
            updated_at=slo.updated_at
        )

# ===== SLO MEASUREMENT SCHEMAS =====

class SLOMeasurementBase(BaseModel):
    slo_target_id: str = Field(..., description="ID of the SLO target")
    measurement_period_start: datetime = Field(..., description="Start of measurement period")
    measurement_period_end: datetime = Field(..., description="End of measurement period")
    actual_value: Union[int, float, Decimal] = Field(..., description="Actual measured value")
    target_value: Union[int, float, Decimal] = Field(..., description="Target value for comparison")
    error_budget_used: Union[int, float, Decimal] = Field(default=0, description="Error budget used")
    status: str = Field(..., regex="^(met|at_risk|breached)$", description="Measurement status")
    service_level_indicator: Optional[str] = Field(None, description="Evidence for measurement")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Additional context")

class SLOMeasurementCreate(SLOMeasurementBase):
    pass

class SLOMeasurementResponse(SLOMeasurementBase):
    id: str
    created_at: datetime
    
    @classmethod
    def from_orm(cls, measurement):
        return cls(
            id=measurement.id,
            slo_target_id=measurement.slo_target_id,
            measurement_period_start=measurement.measurement_period_start,
            measurement_period_end=measurement.measurement_period_end,
            actual_value=float(measurement.actual_value),
            target_value=float(measurement.target_value),
            error_budget_used=float(measurement.error_budget_used),
            status=measurement.status,
            service_level_indicator=measurement.service_level_indicator,
            metadata=measurement.metadata,
            created_at=measurement.created_at
        )

class SLOSummaryResponse(BaseModel):
    """SLO compliance summary across services"""
    overall_compliance_rate: float = Field(..., description="Overall compliance percentage")
    total_slos: int = Field(..., description="Total number of SLOs")
    met_slos: int = Field(..., description="Number of SLOs that met target")
    service_breakdown: Dict[str, Dict[str, float]] = Field(..., description="Breakdown by service type")
    time_window: str = Field(..., description="Time window for calculation")
    last_updated: datetime = Field(..., description="When this summary was generated")

# ===== ALERT RULE SCHEMAS =====

class AlertRuleBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200, description="Unique name for the alert rule")
    description: Optional[str] = Field(None, description="Human-readable description")
    severity: AlertSeverity = Field(..., description="Severity level of alerts")
    service_name: Optional[str] = Field(None, max_length=100, description="Service this rule applies to")
    condition_type: str = Field(..., min_length=1, max_length=50, description="Type of alert condition")
    condition_config: Dict[str, Any] = Field(..., description="Configuration for the condition")
    query: Optional[str] = Field(None, description="Query language query (PromQL, etc.)")
    notification_channels: Dict[str, Any] = Field(default_factory=dict, description="Notification channel config")
    escalation_policy: Optional[Dict[str, Any]] = Field(None, description="Escalation rules")
    labels: Optional[Dict[str, str]] = Field(default_factory=dict, description="Alert labels")
    annotations: Optional[Dict[str, str]] = Field(default_factory=dict, description="Alert annotations")
    owner: Optional[str] = Field(None, max_length=100, description="Team or person responsible")

class AlertRuleCreate(AlertRuleBase):
    pass

class AlertRuleUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    severity: Optional[AlertSeverity] = None
    service_name: Optional[str] = Field(None, max_length=100)
    condition_config: Optional[Dict[str, Any]] = None
    query: Optional[str] = None
    notification_channels: Optional[Dict[str, Any]] = None
    escalation_policy: Optional[Dict[str, Any]] = None
    labels: Optional[Dict[str, str]] = None
    annotations: Optional[Dict[str, str]] = None
    owner: Optional[str] = Field(None, max_length=100)
    is_enabled: Optional[bool] = None
    check_interval: Optional[int] = Field(None, ge=10, le=3600)
    throttle_duration: Optional[int] = Field(None, ge=0, le=3600)
    cooldown_period: Optional[int] = Field(None, ge=0, le=86400)

class AlertRuleResponse(AlertRuleBase):
    id: str
    is_enabled: bool
    check_interval: int
    evaluation_window: str
    throttle_duration: int
    cooldown_period: int
    suppress_until: Optional[datetime]
    created_at: datetime
    updated_at: Optional[datetime]
    
    @classmethod
    def from_orm(cls, rule):
        return cls(
            id=rule.id,
            name=rule.name,
            description=rule.description,
            severity=rule.severity,
            service_name=rule.service_name,
            condition_type=rule.condition_type,
            condition_config=rule.condition_config,
            query=rule.query,
            notification_channels=rule.notification_channels,
            escalation_policy=rule.escalation_policy,
            labels=rule.labels,
            annotations=rule.annotations,
            owner=rule.owner,
            is_enabled=rule.is_enabled,
            check_interval=rule.check_interval,
            evaluation_window=rule.evaluation_window,
            throttle_duration=rule.throttle_duration,
            cooldown_period=rule.cooldown_period,
            suppress_until=rule.suppress_until,
            created_at=rule.created_at,
            updated_at=rule.updated_at
        )

# ===== ALERT EVENT SCHEMAS =====

class AlertEventBase(BaseModel):
    rule_id: str = Field(..., description="ID of the alert rule that triggered this")
    alert_key: str = Field(..., min_length=1, max_length=500, description="Unique key for this alert")
    severity: AlertSeverity = Field(..., description="Alert severity")
    status: AlertStatus = Field(default=AlertStatus.OPEN, description="Current alert status")
    title: str = Field(..., min_length=1, max_length=500, description="Alert title")
    description: Optional[str] = Field(None, description="Detailed alert description")
    labels: Optional[Dict[str, str]] = Field(default_factory=dict, description="Alert labels")
    annotations: Optional[Dict[str, str]] = Field(default_factory=dict, description="Alert annotations")
    fingerprint: Optional[str] = Field(None, max_length=100, description="Grouping key")
    assigned_to: Optional[str] = Field(None, max_length=100, description="Person assigned to handle this")
    escalation_level: int = Field(default=0, ge=0, description="Current escalation level")
    current_value: Optional[Union[int, float, Decimal]] = Field(None, description="Current metric value")
    threshold_value: Optional[Union[int, float, Decimal]] = Field(None, description="Threshold that was crossed")
    service_name: Optional[str] = Field(None, max_length=100, description="Affected service")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Additional context")

class AlertEventCreate(AlertEventBase):
    started_at: datetime = Field(..., description="When the alert condition was first detected")

class AlertEventUpdate(BaseModel):
    status: Optional[AlertStatus] = None
    assigned_to: Optional[str] = Field(None, max_length=100)
    escalation_level: Optional[int] = Field(None, ge=0)
    title: Optional[str] = Field(None, min_length=1, max_length=500)
    description: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class AlertEventResponse(AlertEventBase):
    id: str
    started_at: datetime
    acknowledged_at: Optional[datetime]
    resolved_at: Optional[datetime]
    escalated_at: Optional[datetime]
    last_notified_at: Optional[datetime]
    notification_count: int
    notification_history: Optional[List[Dict[str, Any]]]
    created_at: datetime
    updated_at: Optional[datetime]
    
    @classmethod
    def from_orm(cls, event):
        return cls(
            id=event.id,
            rule_id=event.rule_id,
            alert_key=event.alert_key,
            severity=event.severity,
            status=event.status,
            title=event.title,
            description=event.description,
            labels=event.labels,
            annotations=event.annotations,
            fingerprint=event.fingerprint,
            started_at=event.started_at,
            acknowledged_at=event.acknowledged_at,
            resolved_at=event.resolved_at,
            escalated_at=event.escalated_at,
            last_notified_at=event.last_notified_at,
            assigned_to=event.assigned_to,
            escalation_level=event.escalation_level,
            notification_count=event.notification_count,
            notification_history=event.notification_history,
            current_value=float(event.current_value) if event.current_value is not None else None,
            threshold_value=float(event.threshold_value) if event.threshold_value is not None else None,
            service_name=event.service_name,
            metadata=event.metadata,
            created_at=event.created_at,
            updated_at=event.updated_at
        )

class AlertSummaryResponse(BaseModel):
    """Alert summary statistics"""
    total_alerts: int = Field(..., description="Total number of alerts")
    alerts_by_status: Dict[str, int] = Field(..., description="Breakdown by status")
    alerts_by_severity: Dict[str, int] = Field(..., description="Breakdown by severity")
    mean_time_to_detection_minutes: float = Field(..., description="Average time to detect alerts")
    mean_time_to_resolution_minutes: float = Field(..., description="Average time to resolve alerts")
    since: datetime = Field(..., description="Time range start")
    last_updated: datetime = Field(..., description="When summary was generated")

# ===== INCIDENT SCHEMAS =====

class IncidentBase(BaseModel):
    incident_key: str = Field(..., min_length=1, max_length=100, description="Unique incident identifier")
    title: str = Field(..., min_length=1, max_length=500, description="Incident title")
    description: Optional[str] = Field(None, description="Detailed incident description")
    severity: AlertSeverity = Field(..., description="Incident severity")
    status: str = Field(default="open", regex="^(open|investigating|identified|resolved)$", description="Current status")
    detected_at: datetime = Field(..., description="When the incident was detected")
    started_at: Optional[datetime] = Field(None, description="When the incident actually started")
    resolved_at: Optional[datetime] = Field(None, description="When the incident was resolved")
    incident_commander: Optional[str] = Field(None, max_length=100, description="Person in charge")
    responders: Optional[List[str]] = Field(default_factory=list, description="List of responders")
    affected_services: Optional[List[str]] = Field(default_factory=list, description="Services affected")
    affected_customers: Optional[List[str]] = Field(default_factory=list, description="Customers affected")
    estimated_impact: Optional[str] = Field(None, description="Description of impact")
    business_impact: Optional[str] = Field(None, regex="^(low|medium|high|critical)$", description="Business impact level")
    communication_channels: Optional[List[str]] = Field(default_factory=list, description="Communication channels used")
    runbook_executed: Optional[str] = Field(None, max_length=200, description="Runbook used")
    postmortem_required: bool = Field(default=False, description="Whether postmortem is required")
    labels: Optional[Dict[str, str]] = Field(default_factory=dict, description="Incident labels")
    annotations: Optional[Dict[str, str]] = Field(default_factory=dict, description="Additional context")

class IncidentCreate(IncidentBase):
    pass

class IncidentUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=500)
    description: Optional[str] = None
    status: Optional[str] = Field(None, regex="^(open|investigating|identified|resolved)$")
    started_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    incident_commander: Optional[str] = Field(None, max_length=100)
    responders: Optional[List[str]] = None
    affected_services: Optional[List[str]] = None
    affected_customers: Optional[List[str]] = None
    estimated_impact: Optional[str] = None
    business_impact: Optional[str] = Field(None, regex="^(low|medium|high|critical)$")
    communication_channels: Optional[List[str]] = None
    runbook_executed: Optional[str] = Field(None, max_length=200)
    postmortem_required: Optional[bool] = None
    postmortem_completed_at: Optional[datetime] = None
    labels: Optional[Dict[str, str]] = None
    annotations: Optional[Dict[str, str]] = None

class IncidentResponse(IncidentBase):
    id: str
    last_notified_at: Optional[datetime]
    postmortem_completed_at: Optional[datetime]
    created_at: datetime
    updated_at: Optional[datetime]
    
    @classmethod
    def from_orm(cls, incident):
        return cls(
            id=incident.id,
            incident_key=incident.incident_key,
            title=incident.title,
            description=incident.description,
            severity=incident.severity,
            status=incident.status,
            detected_at=incident.detected_at,
            started_at=incident.started_at,
            resolved_at=incident.resolved_at,
            incident_commander=incident.incident_commander,
            responders=incident.responders,
            affected_services=incident.affected_services,
            affected_customers=incident.affected_customers,
            estimated_impact=incident.estimated_impact,
            business_impact=incident.business_impact,
            communication_channels=incident.communication_channels,
            runbook_executed=incident.runbook_executed,
            postmortem_required=incident.postmortem_required,
            postmortem_completed_at=incident.postmortem_completed_at,
            labels=incident.labels,
            annotations=incident.annotations,
            created_at=incident.created_at,
            updated_at=incident.updated_at
        )

# ===== SYSTEM HEALTH SCHEMAS =====

class SystemHealthResponse(BaseModel):
    """System health status response"""
    component_name: str = Field(..., description="Name of the component")
    component_type: str = Field(..., description="Type of component")
    status: ServiceStatus = Field(..., description="Current health status")
    
    # Health metrics
    uptime_percentage: Optional[float] = Field(None, description="Uptime percentage")
    response_time_ms: Optional[int] = Field(None, description="Average response time")
    error_rate: Optional[float] = Field(None, description="Error rate percentage")
    throughput_rps: Optional[int] = Field(None, description="Requests per second")
    
    # Resource usage
    cpu_usage_percentage: Optional[float] = Field(None, description="CPU usage")
    memory_usage_percentage: Optional[float] = Field(None, description="Memory usage")
    disk_usage_percentage: Optional[float] = Field(None, description="Disk usage")
    network_usage_mbps: Optional[float] = Field(None, description="Network usage")
    
    # Dependencies
    dependencies_status: Optional[Dict[str, str]] = Field(None, description="Status of dependencies")
    
    # Metadata
    health_check_url: Optional[str] = Field(None, description="Health check endpoint")
    last_check_at: Optional[datetime] = Field(None, description="Last health check time")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional metadata")
    created_at: datetime
    updated_at: Optional[datetime]
    
    @classmethod
    def from_orm(cls, health):
        return cls(
            component_name=health.component_name,
            component_type=health.component_type,
            status=health.status,
            uptime_percentage=float(health.uptime_percentage) if health.uptime_percentage is not None else None,
            response_time_ms=health.response_time_ms,
            error_rate=float(health.error_rate) if health.error_rate is not None else None,
            throughput_rps=health.throughput_rps,
            cpu_usage_percentage=float(health.cpu_usage_percentage) if health.cpu_usage_percentage is not None else None,
            memory_usage_percentage=float(health.memory_usage_percentage) if health.memory_usage_percentage is not None else None,
            disk_usage_percentage=float(health.disk_usage_percentage) if health.disk_usage_percentage is not None else None,
            network_usage_mbps=health.network_usage_mbps,
            dependencies_status=health.dependencies_status,
            health_check_url=health.health_check_url,
            last_check_at=health.last_check_at,
            metadata=health.metadata,
            created_at=health.created_at,
            updated_at=health.updated_at
        )

# ===== CAPACITY METRIC SCHEMAS =====

class CapacityMetricBase(BaseModel):
    component_name: str = Field(..., min_length=1, max_length=100, description="Component being measured")
    metric_type: str = Field(..., min_length=1, max_length=50, description="Type of metric (cpu, memory, etc.)")
    current_value: Union[int, float, Decimal] = Field(..., description="Current metric value")
    capacity_limit: Union[int, float, Decimal] = Field(..., description="Capacity limit")
    utilization_percentage: Union[int, float, Decimal] = Field(..., description="Current utilization %")
    measurement_time: datetime = Field(..., description="When measurement was taken")
    predicted_7d: Optional[Union[int, float, Decimal]] = Field(None, description="7-day prediction")
    predicted_30d: Optional[Union[int, float, Decimal]] = Field(None, description="30-day prediction")
    scaling_recommendation: Optional[str] = Field(None, max_length=100, description="Scaling recommendation")
    source: Optional[str] = Field(None, max_length=50, description="Data source")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Additional context")

class CapacityMetricResponse(CapacityMetricBase):
    id: str
    created_at: datetime
    
    @classmethod
    def from_orm(cls, metric):
        return cls(
            id=metric.id,
            component_name=metric.component_name,
            metric_type=metric.metric_type,
            current_value=float(metric.current_value),
            capacity_limit=float(metric.capacity_limit),
            utilization_percentage=float(metric.utilization_percentage),
            measurement_time=metric.measurement_time,
            predicted_7d=float(metric.predicted_7d) if metric.predicted_7d is not None else None,
            predicted_30d=float(metric.predicted_30d) if metric.predicted_30d is not None else None,
            scaling_recommendation=metric.scaling_recommendation,
            source=metric.source,
            metadata=metric.metadata,
            created_at=metric.created_at
        )

# ===== LOGGING SCHEMAS =====

class StructuredLogResponse(BaseModel):
    """Structured log entry response"""
    id: str
    timestamp: datetime
    level: LogLevel
    service_name: str
    message: str
    logger_name: Optional[str]
    exception_class: Optional[str]
    exception_message: Optional[str]
    user_id: Optional[str]
    session_id: Optional[str]
    request_id: Optional[str]
    trace_id: Optional[str]
    span_id: Optional[str]
    organization_id: Optional[str]
    attributes: Optional[Dict[str, Any]]
    created_at: datetime

# ===== AUDIT LOG SCHEMAS =====

class AuditLogResponse(BaseModel):
    """Audit log entry response"""
    id: str
    timestamp: datetime
    event_type: str
    user_id: Optional[str]
    user_email: Optional[str]
    organization_id: Optional[str]
    event_description: str
    source_ip: Optional[str]
    user_agent: Optional[str]
    session_id: Optional[str]
    resource_type: Optional[str]
    resource_id: Optional[str]
    resource_name: Optional[str]
    compliance_framework: Optional[List[str]]
    retention_period: Optional[str]
    legal_hold: bool
    event_category: Optional[str]
    severity: str
    additional_data: Optional[Dict[str, Any]]
    created_at: datetime

# ===== DASHBOARD SCHEMAS =====

class HealthSummaryResponse(BaseModel):
    """System health summary"""
    overall_status: str = Field(..., description="Overall system status")
    healthy_components: int = Field(..., description="Number of healthy components")
    total_components: int = Field(..., description="Total number of components")
    service_breakdown: Dict[str, Dict[str, Any]] = Field(..., description="Status by service")
    status_counts: Dict[str, int] = Field(..., description="Count by status")
    last_updated: datetime = Field(..., description="When summary was generated")

class MonitoringDashboardResponse(BaseModel):
    """Comprehensive monitoring dashboard data"""
    time_range: str = Field(..., description="Time range for the dashboard")
    
    metrics_summary: Dict[str, Any] = Field(..., description="Metrics overview")
    alerts_summary: Dict[str, Any] = Field(..., description="Alerts overview")
    system_health: HealthSummaryResponse = Field(..., description="System health status")
    slo_summary: SLOSummaryResponse = Field(..., description="SLO compliance")
    recent_metrics: List[CollectedMetricResponse] = Field(..., description="Recent metric data")
    last_updated: datetime = Field(..., description="When dashboard was generated")

# ===== WEBSOCKET SCHEMAS =====

class RealtimeUpdate(BaseModel):
    """Real-time monitoring update"""
    timestamp: datetime
    type: str = Field(..., description="Type of update (metric, alert, health)")
    data: Dict[str, Any] = Field(..., description="Update payload")

# ===== VALIDATION HELPERS =====

def validate_metric_value(value: Union[int, float, Decimal]) -> bool:
    """Validate that a metric value is numeric and finite"""
    try:
        float_value = float(value)
        return float_value != float('inf') and float_value != float('-inf') and not float('nan')
    except (ValueError, TypeError):
        return False

def validate_timestamp_range(start_time: datetime, end_time: datetime) -> bool:
    """Validate that timestamp range is reasonable"""
    if start_time >= end_time:
        return False
    
    # Max range of 1 year
    if (end_time - start_time).days > 365:
        return False
    
    return True

def validate_labels(labels: Optional[Dict[str, Any]]) -> bool:
    """Validate metric labels format"""
    if not labels:
        return True
    
    if not isinstance(labels, dict):
        return False
    
    # Check label names and values
    for key, value in labels.items():
        if not isinstance(key, str) or not isinstance(value, (str, int, float, bool)):
            return False
    
    return True

# Add validators
@validator('value')
def validate_metric_value_field(cls, v):
    if not validate_metric_value(v):
        raise ValueError('Invalid metric value')
    return v

@validator('start_time', 'end_time')
def validate_time_range_pair(cls, v, values):
    if 'start_time' in values and 'end_time' in values:
        if not validate_timestamp_range(values['start_time'], values['end_time']):
            raise ValueError('Invalid timestamp range')
    return v

@validator('labels')
def validate_labels_field(cls, v):
    if not validate_labels(v):
        raise ValueError('Invalid labels format')
    return v