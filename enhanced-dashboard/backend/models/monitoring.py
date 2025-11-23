"""
OptiBid Energy Platform - Monitoring & Observability Models
Enterprise-grade monitoring, observability, and alerting infrastructure

This module implements comprehensive monitoring capabilities including:
- Metrics collection and storage for SLO/SLA tracking
- Distributed tracing for request tracking across services  
- Centralized logging with structured event management
- Real-time alerting with escalation workflows
- System health monitoring and capacity planning
- Automated incident response and runbook integration
"""

from sqlalchemy import Column, String, DateTime, Integer, Float, Text, Boolean, JSON, Index, ForeignKey, Enum, Numeric
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from enum import Enum as PyEnum
from decimal import Decimal
import json
import uuid

Base = declarative_base()

class MetricType(PyEnum):
    """Types of metrics that can be collected"""
    COUNTER = "counter"
    GAUGE = "gauge"
    HISTOGRAM = "histogram"
    SUMMARY = "summary"

class AlertSeverity(PyEnum):
    """Alert severity levels for prioritization"""
    CRITICAL = "critical"     # Immediate response required
    HIGH = "high"             # Response within 1 hour
    MEDIUM = "medium"         # Response within 4 hours
    LOW = "low"               # Response within 24 hours
    INFO = "info"             # Informational only

class AlertStatus(PyEnum):
    """Alert lifecycle states"""
    OPEN = "open"
    ACKNOWLEDGED = "acknowledged"
    RESOLVED = "resolved"
    SUPPRESSED = "suppressed"
    ESCALATED = "escalated"

class ServiceStatus(PyEnum):
    """Service health states"""
    HEALTHY = "healthy"
    DEGRADED = "degraded"
    DOWN = "down"
    MAINTENANCE = "maintenance"

class SLOService(PyEnum):
    """Service Level Objective service types"""
    API = "api"
    DASHBOARD = "dashboard"
    SECURITY = "security"
    COMPLIANCE = "compliance"
    MONITORING = "monitoring"
    DATABASE = "database"

class MetricCollector(Base):
    """
    Central registry for metric collectors
    Manages metadata for different metric collection systems
    """
    __tablename__ = "metric_collectors"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), unique=True, nullable=False, index=True)
    type = Column(Enum(MetricType), nullable=False)
    description = Column(Text)
    source_system = Column(String(50))  # prometheus, grafana, datadog, etc.
    endpoint_url = Column(Text)  # API endpoint for metrics
    auth_config = Column(JSON)  # Authentication configuration
    collection_interval = Column(Integer, default=60)  # seconds
    labels = Column(JSON)  # Fixed labels for all metrics
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    collected_metrics = relationship("CollectedMetric", back_populates="collector")
    service_metrics = relationship("ServiceMetric", back_populates="collector")

class CollectedMetric(Base):
    """
    Store raw collected metrics from monitoring systems
    Supports high-cardinality metrics with time-series data
    """
    __tablename__ = "collected_metrics"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    collector_id = Column(String, ForeignKey("metric_collectors.id"), nullable=False)
    metric_name = Column(String(200), nullable=False, index=True)
    metric_type = Column(Enum(MetricType), nullable=False)
    value = Column(Numeric(20, 6), nullable=False)
    labels = Column(JSON)  # Dynamic labels for this metric
    timestamp = Column(DateTime(timezone=True), nullable=False, index=True)
    source_system = Column(String(50))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Indexes for time-series queries
    __table_args__ = (
        Index('idx_metric_time_series', 'metric_name', 'timestamp'),
        Index('idx_metric_labels', 'metric_name'),
    )
    
    # Relationships
    collector = relationship("MetricCollector", back_populates="collected_metrics")
    aggregated_metrics = relationship("AggregatedMetric", back_populates="source_metric")

class ServiceMetric(Base):
    """
    Service-specific metrics aligned with SLOs
    Tracks critical business and technical metrics
    """
    __tablename__ = "service_metrics"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    collector_id = Column(String, ForeignKey("metric_collectors.id"), nullable=False)
    service_name = Column(String(100), nullable=False, index=True)
    metric_category = Column(String(50))  # performance, availability, security, etc.
    metric_name = Column(String(200), nullable=False, index=True)
    current_value = Column(Numeric(20, 6))
    target_value = Column(Numeric(20, 6))  # SLO target
    threshold_warning = Column(Numeric(20, 6))  # Warning threshold
    threshold_critical = Column(Numeric(20, 6))  # Critical threshold
    labels = Column(JSON)
    last_updated = Column(DateTime(timezone=True), server_default=func.now())
    is_tracked = Column(Boolean, default=True)
    
    # Relationships
    collector = relationship("MetricCollector", back_populates="service_metrics")
    slo_targets = relationship("SLOTarget", back_populates="service_metric")

class AggregatedMetric(Base):
    """
    Pre-aggregated metrics for efficient querying
    Stores computed aggregates for different time windows
    """
    __tablename__ = "aggregated_metrics"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    source_metric_id = Column(String, ForeignKey("collected_metrics.id"), nullable=False)
    aggregation_type = Column(String(50))  # sum, avg, min, max, count, p95, p99
    time_window = Column(String(20))  # 1m, 5m, 15m, 1h, 24h
    value = Column(Numeric(20, 6), nullable=False)
    labels = Column(JSON)
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    source_metric = relationship("CollectedMetric", back_populates="aggregated_metrics")

class DistributedTrace(Base):
    """
    Distributed tracing for request tracking across services
    Implements OpenTelemetry-compatible trace structure
    """
    __tablename__ = "distributed_traces"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    trace_id = Column(String(32), nullable=False, index=True)
    span_id = Column(String(16), nullable=False, index=True)
    parent_span_id = Column(String(16), index=True)
    service_name = Column(String(100), nullable=False, index=True)
    operation_name = Column(String(200), nullable=False, index=True)
    start_time = Column(DateTime(timezone=True), nullable=False, index=True)
    end_time = Column(DateTime(timezone=True))
    duration_ms = Column(Float)
    status_code = Column(String(20))
    error_message = Column(Text)
    tags = Column(JSON)  # Custom tags and attributes
    baggage = Column(JSON)  # Distributed context baggage
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    trace_spans = relationship("TraceSpan", back_populates="trace")

class TraceSpan(Base):
    """
    Individual spans within a trace for detailed analysis
    Stores span-level metrics and relationships
    """
    __tablename__ = "trace_spans"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    trace_id = Column(String(32), ForeignKey("distributed_traces.trace_id"), nullable=False)
    span_id = Column(String(16), nullable=False, unique=True)
    parent_span_id = Column(String(16), index=True)
    service_name = Column(String(100), nullable=False)
    operation_name = Column(String(200), nullable=False)
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True))
    duration_ms = Column(Float)
    span_type = Column(String(50))  # http, database, cache, external_call
    status_code = Column(String(20))
    error_message = Column(Text)
    resource_attributes = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    trace = relationship("DistributedTrace", back_populates="trace_spans")
    span_logs = relationship("TraceSpanLog", back_populates="span")

class TraceSpanLog(Base):
    """
    Structured logs for spans with key-value attributes
    Supports structured logging for debugging and analysis
    """
    __tablename__ = "trace_span_logs"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    span_id = Column(String(16), ForeignKey("trace_spans.span_id"), nullable=False)
    timestamp = Column(DateTime(timezone=True), nullable=False, index=True)
    level = Column(String(20))  # DEBUG, INFO, WARN, ERROR
    message = Column(Text, nullable=False)
    attributes = Column(JSON)  # Structured key-value pairs
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    span = relationship("TraceSpan", back_populates="span_logs")

class StructuredLog(Base):
    """
    Centralized structured logging with metadata
    Supports correlation with traces and business events
    """
    __tablename__ = "structured_logs"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    timestamp = Column(DateTime(timezone=True), nullable=False, index=True)
    level = Column(String(20), nullable=False, index=True)  # DEBUG, INFO, WARN, ERROR, FATAL
    service_name = Column(String(100), nullable=False, index=True)
    message = Column(Text, nullable=False)
    logger_name = Column(String(200))
    exception_class = Column(String(200))
    exception_message = Column(Text)
    stack_trace = Column(Text)
    user_id = Column(String)
    session_id = Column(String)
    request_id = Column(String)
    trace_id = Column(String(32))  # Link to distributed trace
    span_id = Column(String(16))   # Link to span
    organization_id = Column(String)  # Link to organization
    attributes = Column(JSON)  # Custom structured attributes
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Indexes for log queries
    __table_args__ = (
        Index('idx_log_time_service', 'timestamp', 'service_name'),
        Index('idx_log_level_service', 'level', 'service_name'),
        Index('idx_log_trace', 'trace_id'),
    )

class SLOTarget(Base):
    """
    Service Level Objective targets for different services
    Defines and tracks SLOs with error budgets
    """
    __tablename__ = "slo_targets"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    service_metric_id = Column(String, ForeignKey("service_metrics.id"), nullable=False)
    service_type = Column(Enum(SLOService), nullable=False)
    objective_name = Column(String(200), nullable=False)  # Availability, Latency, etc.
    objective_type = Column(String(50))  # percentage, milliseconds, ratio
    target_value = Column(Numeric(10, 4), nullable=False)  # 99.9 for availability, 300 for latency
    time_window = Column(String(20), default="30d")  # 7d, 30d, 90d
    error_budget_percentage = Column(Numeric(5, 2), default=0.1)  # 0.1% for 99.9% availability
    is_active = Column(Boolean, default=True)
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    service_metric = relationship("ServiceMetric", back_populates="slo_targets")
    slo_measurements = relationship("SLOMeasurement", back_populates="slo_target")

class SLOMeasurement(Base):
    """
    SLO measurements over time windows
    Tracks actual performance vs SLO targets
    """
    __tablename__ = "slo_measurements"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    slo_target_id = Column(String, ForeignKey("slo_targets.id"), nullable=False)
    measurement_period_start = Column(DateTime(timezone=True), nullable=False)
    measurement_period_end = Column(DateTime(timezone=True), nullable=False)
    actual_value = Column(Numeric(10, 4), nullable=False)
    target_value = Column(Numeric(10, 4), nullable=False)
    error_budget_used = Column(Numeric(10, 4), default=0)
    status = Column(String(20), nullable=False)  # met, at_risk, breached
    service_level_indicator = Column(Text)  # Evidence for the measurement
    metadata = Column(JSON)  # Additional context
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    slo_target = relationship("SLOTarget", back_populates="slo_measurements")

class AlertRule(Base):
    """
    Configurable alerting rules with complex conditions
    Supports multiple alerting backends and notification channels
    """
    __tablename__ = "alert_rules"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(200), nullable=False, unique=True)
    description = Column(Text)
    severity = Column(Enum(AlertSeverity), nullable=False, default=AlertSeverity.MEDIUM)
    service_name = Column(String(100), index=True)
    
    # Alert condition configuration
    condition_type = Column(String(50))  # threshold, anomaly, complex
    condition_config = Column(JSON)  # JSON configuration for the condition
    query = Column(Text)  # PromQL or similar query language
    
    # Alert management
    is_enabled = Column(Boolean, default=True)
    check_interval = Column(Integer, default=60)  # seconds
    evaluation_window = Column(String(20), default="5m")
    
    # Notification configuration
    notification_channels = Column(JSON)  # Email, Slack, PagerDuty, etc.
    escalation_policy = Column(JSON)  # Escalation rules and timing
    
    # Throttling and suppression
    throttle_duration = Column(Integer, default=300)  # seconds
    cooldown_period = Column(Integer, default=1800)  # seconds
    suppress_until = Column(DateTime(timezone=True))
    
    # Metadata
    labels = Column(JSON)
    annotations = Column(JSON)
    owner = Column(String(100))  # Team or person responsible
    tags = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    alert_events = relationship("AlertEvent", back_populates="rule")

class AlertEvent(Base):
    """
    Individual alert events with full lifecycle tracking
    Supports acknowledgment, escalation, and resolution
    """
    __tablename__ = "alert_events"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    rule_id = Column(String, ForeignKey("alert_rules.id"), nullable=False)
    alert_key = Column(String(500), index=True)  # Unique identifier for this alert
    severity = Column(Enum(AlertSeverity), nullable=False)
    status = Column(Enum(AlertStatus), default=AlertStatus.OPEN, index=True)
    
    # Alert details
    title = Column(String(500), nullable=False)
    description = Column(Text)
    labels = Column(JSON)
    annotations = Column(JSON)
    fingerprint = Column(String(100))  # Grouping key for deduplication
    
    # Alert lifecycle
    started_at = Column(DateTime(timezone=True), nullable=False, index=True)
    acknowledged_at = Column(DateTime(timezone=True))
    resolved_at = Column(DateTime(timezone=True))
    assigned_to = Column(String(100))
    
    # Escalation tracking
    escalation_level = Column(Integer, default=0)
    escalated_at = Column(DateTime(timezone=True))
    last_notified_at = Column(DateTime(timezone=True))
    
    # Notification tracking
    notification_count = Column(Integer, default=0)
    notification_history = Column(JSON)  # History of notifications sent
    
    # Context
    current_value = Column(Numeric(20, 6))
    threshold_value = Column(Numeric(20, 6))
    service_name = Column(String(100), index=True)
    metadata = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    rule = relationship("AlertRule", back_populates="alert_events")
    notification_logs = relationship("NotificationLog", back_populates="alert_event")

class NotificationLog(Base):
    """
    Complete notification delivery tracking
    Records all notification attempts and delivery status
    """
    __tablename__ = "notification_logs"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    alert_event_id = Column(String, ForeignKey("alert_events.id"), nullable=False)
    notification_type = Column(String(50))  # email, slack, pagerduty, sms
    channel_name = Column(String(200))  # Specific channel or endpoint
    recipient = Column(String(500))  # Who was notified
    
    # Notification content
    subject = Column(String(500))
    body = Column(Text)
    attachments = Column(JSON)
    
    # Delivery tracking
    sent_at = Column(DateTime(timezone=True))
    delivery_status = Column(String(50))  # sent, delivered, failed, bounced
    error_message = Column(Text)
    response_code = Column(Integer)
    
    # Metadata
    metadata = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    alert_event = relationship("AlertEvent", back_populates="notification_logs")

class Incident(Base):
    """
    High-level incidents that can contain multiple alerts
    Provides incident management and response tracking
    """
    __tablename__ = "incidents"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    incident_key = Column(String(100), unique=True, nullable=False, index=True)
    title = Column(String(500), nullable=False)
    description = Column(Text)
    severity = Column(Enum(AlertSeverity), nullable=False)
    status = Column(String(50), default="open")  # open, investigating, identified, resolved
    
    # Timeline
    detected_at = Column(DateTime(timezone=True), nullable=False, index=True)
    started_at = Column(DateTime(timezone=True))
    resolved_at = Column(DateTime(timezone=True))
    
    # Assignment
    incident_commander = Column(String(100))
    responders = Column(JSON)
    
    # Impact assessment
    affected_services = Column(JSON)
    affected_customers = Column(JSON)
    estimated_impact = Column(Text)
    business_impact = Column(String(50))  # low, medium, high, critical
    
    # Response tracking
    communication_channels = Column(JSON)  # Status page, internal comms
    runbook_executed = Column(String(200))
    postmortem_required = Column(Boolean, default=False)
    postmortem_completed_at = Column(DateTime(timezone=True))
    
    # Metadata
    labels = Column(JSON)
    annotations = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    incident_alerts = relationship("IncidentAlert", back_populates="incident")

class IncidentAlert(Base):
    """
    Links alerts to incidents for consolidated incident management
    """
    __tablename__ = "incident_alerts"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    incident_id = Column(String, ForeignKey("incidents.id"), nullable=False)
    alert_event_id = Column(String, ForeignKey("alert_events.id"), nullable=False)
    role_in_incident = Column(String(50))  # primary_cause, contributing, symptom
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    incident = relationship("Incident", back_populates="incident_alerts")

class SystemHealth(Base):
    """
    Real-time system health status and metrics
    Aggregates health from multiple sources
    """
    __tablename__ = "system_health"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    component_name = Column(String(100), nullable=False, index=True)
    component_type = Column(String(50))  # service, database, cache, external_api
    status = Column(Enum(ServiceStatus), nullable=False)
    
    # Health metrics
    uptime_percentage = Column(Numeric(5, 2))
    response_time_ms = Column(Integer)
    error_rate = Column(Numeric(5, 2))
    throughput_rps = Column(Integer)  # requests per second
    
    # Resource usage
    cpu_usage_percentage = Column(Numeric(5, 2))
    memory_usage_percentage = Column(Numeric(5, 2))
    disk_usage_percentage = Column(Numeric(5, 2))
    network_usage_mbps = Column(Float)
    
    # Dependencies
    dependencies_status = Column(JSON)  # Status of upstream/downstream services
    
    # Metadata
    health_check_url = Column(Text)
    last_check_at = Column(DateTime(timezone=True))
    metadata = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class CapacityMetric(Base):
    """
    Capacity planning metrics and predictions
    Tracks resource usage over time for forecasting
    """
    __tablename__ = "capacity_metrics"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    component_name = Column(String(100), nullable=False, index=True)
    metric_type = Column(String(50), nullable=False)  # cpu, memory, storage, network
    current_value = Column(Numeric(15, 2))
    capacity_limit = Column(Numeric(15, 2))
    utilization_percentage = Column(Numeric(5, 2))
    
    # Time series data
    measurement_time = Column(DateTime(timezone=True), nullable=False, index=True)
    
    # Forecasting
    predicted_7d = Column(Numeric(15, 2))
    predicted_30d = Column(Numeric(15, 2))
    scaling_recommendation = Column(String(100))  # scale_up, scale_down, maintain
    
    # Metadata
    source = Column(String(50))  # kubernetes, aws_cloudwatch, etc.
    metadata = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class AuditLog(Base):
    """
    Compliance-focused audit logging
    Tracks all security-relevant events for compliance
    """
    __tablename__ = "audit_logs"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    timestamp = Column(DateTime(timezone=True), nullable=False, index=True)
    event_type = Column(String(100), nullable=False)  # auth, permission, data_access, config_change
    user_id = Column(String, index=True)
    user_email = Column(String(255))
    organization_id = Column(String, index=True)
    
    # Event details
    event_description = Column(Text, nullable=False)
    source_ip = Column(String(45))  # IPv6 compatible
    user_agent = Column(Text)
    session_id = Column(String(100))
    
    # Resource context
    resource_type = Column(String(100))  # user, org, permission, data, config
    resource_id = Column(String(100))
    resource_name = Column(String(255))
    
    # Compliance fields
    compliance_framework = Column(JSON)  # SOC2, ISO27001, GDPR, etc.
    retention_period = Column(String(20))  # 1y, 7y, permanent
    legal_hold = Column(Boolean, default=False)
    
    # Event metadata
    event_category = Column(String(50))  # security, operational, data_access
    severity = Column(String(20), default="info")  # info, warning, error, critical
    additional_data = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

# Utility functions for monitoring operations
def create_default_monitoring_setup():
    """
    Initialize default monitoring collectors and SLOs
    Called during application startup
    """
    return [
        # Default metric collectors
        {
            "name": "prometheus_default",
            "type": MetricType.GAUGE,
            "description": "Prometheus metrics collector for system metrics",
            "source_system": "prometheus",
            "collection_interval": 30,
            "labels": {"environment": "production"}
        },
        {
            "name": "application_metrics",
            "type": MetricType.COUNTER,
            "description": "Application-level custom metrics",
            "source_system": "custom",
            "collection_interval": 60,
            "labels": {"component": "optibid_platform"}
        }
    ]

def calculate_slo_compliance(slo_measurements: List[Dict]) -> Dict[str, float]:
    """
    Calculate SLO compliance from measurements
    
    Args:
        slo_measurements: List of SLO measurements with actual and target values
    
    Returns:
        Dictionary with compliance metrics
    """
    if not slo_measurements:
        return {"compliance_rate": 0.0, "error_budget_remaining": 100.0}
    
    total_measurements = len(slo_measurements)
    met_measurements = sum(1 for m in slo_measurements if m["status"] == "met")
    
    compliance_rate = (met_measurements / total_measurements) * 100
    
    # Calculate remaining error budget
    error_budget_used = sum(m.get("error_budget_used", 0) for m in slo_measurements)
    error_budget_remaining = max(0, 100 - error_budget_used)
    
    return {
        "compliance_rate": round(compliance_rate, 2),
        "error_budget_remaining": round(error_budget_remaining, 2),
        "total_measurements": total_measurements,
        "met_measurements": met_measurements
    }

def generate_alert_severity_score(severity: AlertSeverity, duration_minutes: int) -> int:
    """
    Generate numeric severity score for prioritization
    
    Args:
        severity: Alert severity level
        duration_minutes: How long the alert has been active
    
    Returns:
        Numeric score (higher = more urgent)
    """
    base_scores = {
        AlertSeverity.CRITICAL: 100,
        AlertSeverity.HIGH: 75,
        AlertSeverity.MEDIUM: 50,
        AlertSeverity.LOW: 25,
        AlertSeverity.INFO: 10
    }
    
    base_score = base_scores.get(severity, 0)
    
    # Increase score based on duration
    duration_multiplier = min(2.0, 1 + (duration_minutes / 60))  # Max 2x for 60+ minutes
    
    return int(base_score * duration_multiplier)

def get_service_health_summary(component_name: str = None) -> Dict[str, Any]:
    """
    Get service health summary with key metrics
    
    Args:
        component_name: Optional specific component to check
    
    Returns:
        Dictionary with health summary
    """
    # This would integrate with actual service health checks
    return {
        "overall_status": ServiceStatus.HEALTHY.value,
        "component_count": 12 if not component_name else 1,
        "healthy_components": 12 if not component_name else 1,
        "critical_alerts": 0,
        "slo_compliance": {
            "availability": 99.95,
            "latency": 98.2,
            "error_rate": 0.01
        },
        "last_updated": datetime.utcnow().isoformat()
    }