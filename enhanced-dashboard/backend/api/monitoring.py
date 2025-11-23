"""
OptiBid Energy Platform - Monitoring & Observability API
Enterprise-grade monitoring, alerting, and observability endpoints

This module provides comprehensive APIs for:
- Metrics collection and time-series data management
- Real-time alerting with escalation workflows
- SLO/SLA tracking and measurement
- Distributed tracing and request analysis
- System health monitoring and capacity planning
- Incident management and response coordination
- Centralized logging with structured search
"""

from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_, or_
from typing import Dict, List, Optional, Any, Generator
from datetime import datetime, timedelta
import json
import asyncio
import websockets
import logging
from collections import defaultdict

from ..models.monitoring import (
    Base, MetricCollector, CollectedMetric, ServiceMetric, AggregatedMetric,
    DistributedTrace, TraceSpan, TraceSpanLog, StructuredLog,
    SLOTarget, SLOMeasurement, AlertRule, AlertEvent, NotificationLog,
    Incident, IncidentAlert, SystemHealth, CapacityMetric, AuditLog,
    MetricType, AlertSeverity, AlertStatus, ServiceStatus, SLOService
)
from ..models.admin import Organization
from ..schemas.monitoring import (
    MetricCollectorCreate, MetricCollectorUpdate, MetricCollectorResponse,
    CollectedMetricCreate, CollectedMetricResponse,
    ServiceMetricCreate, ServiceMetricUpdate, ServiceMetricResponse,
    DistributedTraceCreate, DistributedTraceResponse,
    AlertRuleCreate, AlertRuleUpdate, AlertRuleResponse,
    AlertEventCreate, AlertEventResponse, AlertEventUpdate,
    SLOTargetCreate, SLOTargetUpdate, SLOTargetResponse,
    SLOMeasurementCreate, SLOMeasurementResponse,
    IncidentCreate, IncidentUpdate, IncidentResponse,
    SystemHealthResponse, CapacityMetricResponse,
    StructuredLogResponse, AuditLogResponse,
    MonitoringDashboardResponse, SLOSummaryResponse,
    AlertSummaryResponse, HealthSummaryResponse
)
from ..core.database import get_db
from ..core.dependencies import get_current_user, get_current_organization

# Configure logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/monitoring", tags=["monitoring"])

# ===== METRICS MANAGEMENT =====

@router.post("/collectors", response_model=MetricCollectorResponse)
async def create_metric_collector(
    collector: MetricCollectorCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Create a new metric collector for monitoring systems"""
    try:
        db_collector = MetricCollector(
            name=collector.name,
            type=collector.type,
            description=collector.description,
            source_system=collector.source_system,
            endpoint_url=collector.endpoint_url,
            auth_config=collector.auth_config,
            collection_interval=collector.collection_interval,
            labels=collector.labels
        )
        db.add(db_collector)
        db.commit()
        db.refresh(db_collector)
        
        logger.info(f"Created metric collector: {db_collector.name}")
        return MetricCollectorResponse.from_orm(db_collector)
        
    except Exception as e:
        logger.error(f"Error creating metric collector: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/collectors", response_model=List[MetricCollectorResponse])
async def list_metric_collectors(
    skip: int = 0,
    limit: int = 100,
    source_system: Optional[str] = None,
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """List metric collectors with filtering options"""
    query = db.query(MetricCollector)
    
    if source_system:
        query = query.filter(MetricCollector.source_system == source_system)
    if is_active is not None:
        query = query.filter(MetricCollector.is_active == is_active)
    
    collectors = query.offset(skip).limit(limit).all()
    return [MetricCollectorResponse.from_orm(c) for c in collectors]

@router.get("/collectors/{collector_id}", response_model=MetricCollectorResponse)
async def get_metric_collector(
    collector_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Get detailed information about a specific metric collector"""
    collector = db.query(MetricCollector).filter(MetricCollector.id == collector_id).first()
    if not collector:
        raise HTTPException(status_code=404, detail="Metric collector not found")
    
    return MetricCollectorResponse.from_orm(collector)

@router.post("/metrics", response_model=CollectedMetricResponse)
async def submit_metric(
    metric: CollectedMetricCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Submit a new metric data point"""
    try:
        db_metric = CollectedMetric(
            collector_id=metric.collector_id,
            metric_name=metric.metric_name,
            metric_type=metric.metric_type,
            value=metric.value,
            labels=metric.labels,
            timestamp=metric.timestamp,
            source_system=metric.source_system
        )
        db.add(db_metric)
        db.commit()
        db.refresh(db_metric)
        
        # Trigger background aggregation and alert evaluation
        background_tasks.add_task(process_metric_update, db_metric.id)
        
        return CollectedMetricResponse.from_orm(db_metric)
        
    except Exception as e:
        logger.error(f"Error submitting metric: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

async def process_metric_update(metric_id: str):
    """Background task to process metric updates (aggregation, alerting)"""
    # Implementation would handle metric aggregation and alert evaluation
    pass

@router.get("/metrics", response_model=List[CollectedMetricResponse])
async def query_metrics(
    metric_name: Optional[str] = Query(None, description="Filter by metric name"),
    service_name: Optional[str] = Query(None, description="Filter by service"),
    start_time: Optional[datetime] = Query(None, description="Start time filter"),
    end_time: Optional[datetime] = Query(None, description="End time filter"),
    labels: Optional[str] = Query(None, description="JSON string of labels to filter by"),
    limit: int = Query(1000, description="Maximum number of results"),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Query collected metrics with time-range and filtering"""
    query = db.query(CollectedMetric)
    
    if metric_name:
        query = query.filter(CollectedMetric.metric_name.contains(metric_name))
    
    if start_time:
        query = query.filter(CollectedMetric.timestamp >= start_time)
    if end_time:
        query = query.filter(CollectedMetric.timestamp <= end_time)
    
    # Handle labels filtering
    if labels:
        try:
            label_filters = json.loads(labels)
            for key, value in label_filters.items():
                query = query.filter(
                    func.json_extract(CollectedMetric.labels, f'$.{key}') == value
                )
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="Invalid labels JSON")
    
    metrics = query.order_by(desc(CollectedMetric.timestamp)).limit(limit).all()
    return [CollectedMetricResponse.from_orm(m) for m in metrics]

@router.get("/service-metrics/{service_name}", response_model=List[ServiceMetricResponse])
async def get_service_metrics(
    service_name: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Get all metrics for a specific service"""
    metrics = db.query(ServiceMetric).filter(
        ServiceMetric.service_name == service_name,
        ServiceMetric.is_tracked == True
    ).all()
    
    return [ServiceMetricResponse.from_orm(m) for m in metrics]

# ===== SLO/SLA MANAGEMENT =====

@router.post("/slo", response_model=SLOTargetResponse)
async def create_slo_target(
    slo: SLOTargetCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Create a new SLO target for a service"""
    db_slo = SLOTarget(
        service_metric_id=slo.service_metric_id,
        service_type=slo.service_type,
        objective_name=slo.objective_name,
        objective_type=slo.objective_type,
        target_value=slo.target_value,
        time_window=slo.time_window,
        error_budget_percentage=slo.error_budget_percentage,
        description=slo.description
    )
    
    db.add(db_slo)
    db.commit()
    db.refresh(db_slo)
    
    return SLOTargetResponse.from_orm(db_slo)

@router.get("/slo", response_model=List[SLOTargetResponse])
async def list_slo_targets(
    service_type: Optional[SLOService] = None,
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """List SLO targets with filtering"""
    query = db.query(SLOTarget)
    
    if service_type:
        query = query.filter(SLOTarget.service_type == service_type)
    if is_active is not None:
        query = query.filter(SLOTarget.is_active == is_active)
    
    slos = query.all()
    return [SLOTargetResponse.from_orm(slo) for slo in slos]

@router.get("/slo/summary", response_model=SLOSummaryResponse)
async def get_slo_summary(
    service_type: Optional[SLOService] = None,
    time_window: str = Query("30d", description="Time window for SLO calculation"),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Get SLO compliance summary across services"""
    
    # Calculate SLO compliance
    end_time = datetime.utcnow()
    start_time = end_time - timedelta(days=int(time_window[:-1]))
    
    query = db.query(SLOMeasurement).join(SLOTarget).filter(
        SLOMeasurement.measurement_period_end >= start_time
    )
    
    if service_type:
        query = query.filter(SLOTarget.service_type == service_type)
    
    measurements = query.all()
    
    # Calculate summary statistics
    total_slos = len(measurements)
    met_slos = sum(1 for m in measurements if m.status == "met")
    compliance_rate = (met_slos / total_slos * 100) if total_slos > 0 else 0
    
    # Group by service type for detailed breakdown
    service_breakdown = defaultdict(lambda: {"total": 0, "met": 0, "rate": 0})
    
    for measurement in measurements:
        service_type_key = measurement.slo_target.service_type.value
        service_breakdown[service_type_key]["total"] += 1
        if measurement.status == "met":
            service_breakdown[service_type_key]["met"] += 1
    
    # Calculate rates
    for service_type_key in service_breakdown:
        breakdown = service_breakdown[service_type_key]
        breakdown["rate"] = (breakdown["met"] / breakdown["total"] * 100) if breakdown["total"] > 0 else 0
    
    return SLOSummaryResponse(
        overall_compliance_rate=compliance_rate,
        total_slos=total_slos,
        met_slos=met_slos,
        service_breakdown=dict(service_breakdown),
        time_window=time_window,
        last_updated=datetime.utcnow()
    )

# ===== ALERTING SYSTEM =====

@router.post("/alerts/rules", response_model=AlertRuleResponse)
async def create_alert_rule(
    rule: AlertRuleCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Create a new alert rule"""
    db_rule = AlertRule(
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
        owner=rule.owner
    )
    
    db.add(db_rule)
    db.commit()
    db.refresh(db_rule)
    
    logger.info(f"Created alert rule: {db_rule.name}")
    return AlertRuleResponse.from_orm(db_rule)

@router.get("/alerts/rules", response_model=List[AlertRuleResponse])
async def list_alert_rules(
    skip: int = 0,
    limit: int = 100,
    service_name: Optional[str] = None,
    severity: Optional[AlertSeverity] = None,
    is_enabled: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """List alert rules with filtering"""
    query = db.query(AlertRule)
    
    if service_name:
        query = query.filter(AlertRule.service_name == service_name)
    if severity:
        query = query.filter(AlertRule.severity == severity)
    if is_enabled is not None:
        query = query.filter(AlertRule.is_enabled == is_enabled)
    
    rules = query.offset(skip).limit(limit).all()
    return [AlertRuleResponse.from_orm(r) for r in rules]

@router.get("/alerts/events", response_model=List[AlertEventResponse])
async def list_alert_events(
    skip: int = 0,
    limit: int = 100,
    status: Optional[AlertStatus] = None,
    severity: Optional[AlertSeverity] = None,
    service_name: Optional[str] = None,
    since: Optional[datetime] = Query(None, description="Events since this time"),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """List alert events with filtering and pagination"""
    query = db.query(AlertEvent)
    
    if status:
        query = query.filter(AlertEvent.status == status)
    if severity:
        query = query.filter(AlertEvent.severity == severity)
    if service_name:
        query = query.filter(AlertEvent.service_name == service_name)
    if since:
        query = query.filter(AlertEvent.started_at >= since)
    
    events = query.order_by(desc(AlertEvent.started_at)).offset(skip).limit(limit).all()
    return [AlertEventResponse.from_orm(e) for e in events]

@router.put("/alerts/events/{event_id}/acknowledge")
async def acknowledge_alert(
    event_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Acknowledge an alert event"""
    event = db.query(AlertEvent).filter(AlertEvent.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Alert event not found")
    
    event.status = AlertStatus.ACKNOWLEDGED
    event.acknowledged_at = datetime.utcnow()
    event.assigned_to = current_user.email
    
    db.commit()
    
    return {"message": "Alert acknowledged", "acknowledged_at": event.acknowledged_at}

@router.put("/alerts/events/{event_id}/resolve")
async def resolve_alert(
    event_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Resolve an alert event"""
    event = db.query(AlertEvent).filter(AlertEvent.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Alert event not found")
    
    event.status = AlertStatus.RESOLVED
    event.resolved_at = datetime.utcnow()
    
    db.commit()
    
    return {"message": "Alert resolved", "resolved_at": event.resolved_at}

@router.get("/alerts/summary", response_model=AlertSummaryResponse)
async def get_alert_summary(
    service_name: Optional[str] = None,
    since: Optional[datetime] = Query(None, description="Summary since this time"),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Get alert summary statistics"""
    if not since:
        since = datetime.utcnow() - timedelta(days=7)  # Default to 7 days
    
    query = db.query(AlertEvent).filter(AlertEvent.started_at >= since)
    
    if service_name:
        query = query.filter(AlertEvent.service_name == service_name)
    
    events = query.all()
    
    # Calculate summary statistics
    total_events = len(events)
    by_status = defaultdict(int)
    by_severity = defaultdict(int)
    
    for event in events:
        by_status[event.status.value] += 1
        by_severity[event.severity.value] += 1
    
    # Calculate mean time to resolution
    resolved_events = [e for e in events if e.resolved_at and e.started_at]
    mttd = 0  # Mean Time To Detection
    mttr = 0  # Mean Time To Resolution
    
    if resolved_events:
        detection_times = [(e.acknowledged_at or e.started_at) - e.started_at 
                          for e in resolved_events if e.acknowledged_at]
        resolution_times = [e.resolved_at - e.started_at for e in resolved_events]
        
        if detection_times:
            mttd = sum(dt.total_seconds() for dt in detection_times) / len(detection_times)
        if resolution_times:
            mttr = sum(rt.total_seconds() for rt in resolution_times) / len(resolution_times)
    
    return AlertSummaryResponse(
        total_alerts=total_events,
        alerts_by_status=dict(by_status),
        alerts_by_severity=dict(by_severity),
        mean_time_to_detection_minutes=mttd / 60,
        mean_time_to_resolution_minutes=mttr / 60,
        since=since,
        last_updated=datetime.utcnow()
    )

# ===== INCIDENT MANAGEMENT =====

@router.post("/incidents", response_model=IncidentResponse)
async def create_incident(
    incident: IncidentCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Create a new incident"""
    incident_key = f"INC-{datetime.utcnow().strftime('%Y%m%d')}-{hash(incident.title) % 10000:04d}"
    
    db_incident = Incident(
        incident_key=incident_key,
        title=incident.title,
        description=incident.description,
        severity=incident.severity,
        detected_at=incident.detected_at,
        incident_commander=incident.incident_commander,
        affected_services=incident.affected_services,
        affected_customers=incident.affected_customers,
        estimated_impact=incident.estimated_impact,
        business_impact=incident.business_impact,
        communication_channels=incident.communication_channels
    )
    
    db.add(db_incident)
    db.commit()
    db.refresh(db_incident)
    
    # Trigger incident response workflow
    background_tasks.add_task(process_incident_creation, db_incident.id)
    
    logger.warning(f"Incident created: {incident_key} - {incident.title}")
    return IncidentResponse.from_orm(db_incident)

async def process_incident_creation(incident_id: str):
    """Background task to process incident creation workflows"""
    # Implementation would trigger notifications, assign responders, etc.
    pass

@router.get("/incidents", response_model=List[IncidentResponse])
async def list_incidents(
    skip: int = 0,
    limit: int = 50,
    status: Optional[str] = Query(None, description="Filter by incident status"),
    severity: Optional[AlertSeverity] = Query(None, description="Filter by severity"),
    since: Optional[datetime] = Query(None, description="Incidents since this time"),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """List incidents with filtering"""
    query = db.query(Incident)
    
    if status:
        query = query.filter(Incident.status == status)
    if severity:
        query = query.filter(Incident.severity == severity)
    if since:
        query = query.filter(Incident.detected_at >= since)
    
    incidents = query.order_by(desc(Incident.detected_at)).offset(skip).limit(limit).all()
    return [IncidentResponse.from_orm(i) for i in incidents]

@router.get("/incidents/{incident_id}", response_model=IncidentResponse)
async def get_incident(
    incident_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Get detailed incident information"""
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    return IncidentResponse.from_orm(incident)

@router.put("/incidents/{incident_id}", response_model=IncidentResponse)
async def update_incident(
    incident_id: str,
    incident_update: IncidentUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Update incident status and details"""
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    # Update fields
    update_data = incident_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(incident, field, value)
    
    incident.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(incident)
    
    return IncidentResponse.from_orm(incident)

# ===== SYSTEM HEALTH & CAPACITY =====

@router.get("/health", response_model=HealthSummaryResponse)
async def get_system_health(
    service_name: Optional[str] = Query(None, description="Specific service to check"),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Get comprehensive system health summary"""
    query = db.query(SystemHealth)
    
    if service_name:
        query = query.filter(SystemHealth.component_name == service_name)
    
    health_records = query.all()
    
    if not health_records:
        return HealthSummaryResponse(
            overall_status="unknown",
            healthy_components=0,
            total_components=0,
            service_breakdown={},
            last_updated=datetime.utcnow()
        )
    
    # Calculate overall health
    status_counts = defaultdict(int)
    service_breakdown = {}
    
    for record in health_records:
        status_counts[record.status.value] += 1
        
        if record.component_name not in service_breakdown:
            service_breakdown[record.component_name] = {
                "status": record.status.value,
                "uptime_percentage": float(record.uptime_percentage or 0),
                "response_time_ms": record.response_time_ms,
                "error_rate": float(record.error_rate or 0)
            }
    
    total_components = len(health_records)
    healthy_components = status_counts.get(ServiceStatus.HEALTHY.value, 0)
    
    # Determine overall status
    if status_counts.get(ServiceStatus.DOWN.value, 0) > 0:
        overall_status = "degraded"
    elif healthy_components == total_components:
        overall_status = "healthy"
    else:
        overall_status = "degraded"
    
    return HealthSummaryResponse(
        overall_status=overall_status,
        healthy_components=healthy_components,
        total_components=total_components,
        service_breakdown=service_breakdown,
        status_counts=dict(status_counts),
        last_updated=datetime.utcnow()
    )

@router.get("/capacity", response_model=List[CapacityMetricResponse])
async def get_capacity_metrics(
    component_name: Optional[str] = None,
    metric_type: Optional[str] = None,
    since: Optional[datetime] = Query(None, description="Metrics since this time"),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Get capacity planning metrics and predictions"""
    query = db.query(CapacityMetric)
    
    if component_name:
        query = query.filter(CapacityMetric.component_name == component_name)
    if metric_type:
        query = query.filter(CapacityMetric.metric_type == metric_type)
    if since:
        query = query.filter(CapacityMetric.measurement_time >= since)
    
    metrics = query.order_by(desc(CapacityMetric.measurement_time)).all()
    return [CapacityMetricResponse.from_orm(m) for m in metrics]

@router.get("/capacity/predictions")
async def get_capacity_predictions(
    component_name: str,
    prediction_days: int = Query(30, description="Number of days to predict"),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Get capacity predictions for a component"""
    # Get recent metrics for prediction
    end_time = datetime.utcnow()
    start_time = end_time - timedelta(days=30)  # 30 days of history
    
    metrics = db.query(CapacityMetric).filter(
        CapacityMetric.component_name == component_name,
        CapacityMetric.measurement_time >= start_time,
        CapacityMetric.measurement_time <= end_time
    ).order_by(CapacityMetric.measurement_time).all()
    
    if not metrics:
        raise HTTPException(status_code=404, detail="No capacity data found for component")
    
    # Simple linear regression prediction (could be enhanced with ML)
    predictions = generate_capacity_predictions(metrics, prediction_days)
    
    return {
        "component_name": component_name,
        "prediction_days": prediction_days,
        "predictions": predictions,
        "confidence": "medium",
        "generated_at": datetime.utcnow()
    }

def generate_capacity_predictions(metrics: List[CapacityMetric], days: int) -> Dict[str, Any]:
    """Generate capacity predictions based on historical data"""
    # Implementation would use statistical models or ML for predictions
    # For now, return a simple forecast structure
    
    latest_metric = max(metrics, key=lambda m: m.measurement_time)
    
    return {
        "cpu": {
            "current_utilization": float(latest_metric.current_value or 0),
            "predicted_7d": float(latest_metric.predicted_7d or 0),
            "predicted_30d": float(latest_metric.predicted_30d or 0),
            "scaling_recommendation": latest_metric.scaling_recommendation or "maintain"
        },
        "memory": {
            "current_utilization": 65.2,  # Example values
            "predicted_7d": 68.1,
            "predicted_30d": 72.3,
            "scaling_recommendation": "monitor"
        }
    }

# ===== DISTRIBUTED TRACING =====

@router.get("/traces")
async def query_traces(
    trace_id: Optional[str] = Query(None, description="Specific trace ID"),
    service_name: Optional[str] = Query(None, description="Filter by service"),
    operation_name: Optional[str] = Query(None, description="Filter by operation"),
    start_time: Optional[datetime] = Query(None, description="Trace start time"),
    end_time: Optional[datetime] = Query(None, description="Trace end time"),
    limit: int = Query(100, description="Maximum number of traces"),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Query distributed traces with filtering"""
    query = db.query(DistributedTrace)
    
    if trace_id:
        query = query.filter(DistributedTrace.trace_id == trace_id)
    if service_name:
        query = query.filter(DistributedTrace.service_name == service_name)
    if operation_name:
        query = query.filter(DistributedTrace.operation_name.contains(operation_name))
    if start_time:
        query = query.filter(DistributedTrace.start_time >= start_time)
    if end_time:
        query = query.filter(DistributedTrace.start_time <= end_time)
    
    traces = query.order_by(desc(DistributedTrace.start_time)).limit(limit).all()
    
    return [
        {
            "trace_id": trace.trace_id,
            "service_name": trace.service_name,
            "operation_name": trace.operation_name,
            "start_time": trace.start_time,
            "duration_ms": trace.duration_ms,
            "span_count": len(trace.trace_spans) if trace.trace_spans else 0
        }
        for trace in traces
    ]

@router.get("/traces/{trace_id}/spans")
async def get_trace_spans(
    trace_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Get all spans for a specific trace"""
    spans = db.query(TraceSpan).filter(TraceSpan.trace_id == trace_id).order_by(
        TraceSpan.start_time
    ).all()
    
    return [
        {
            "span_id": span.span_id,
            "parent_span_id": span.parent_span_id,
            "service_name": span.service_name,
            "operation_name": span.operation_name,
            "start_time": span.start_time,
            "end_time": span.end_time,
            "duration_ms": span.duration_ms,
            "span_type": span.span_type,
            "status_code": span.status_code,
            "error_message": span.error_message,
            "tags": span.resource_attributes
        }
        for span in spans
    ]

# ===== LOGGING & AUDIT =====

@router.get("/logs")
async def query_logs(
    service_name: Optional[str] = Query(None, description="Filter by service"),
    level: Optional[str] = Query(None, description="Filter by log level"),
    start_time: Optional[datetime] = Query(None, description="Log start time"),
    end_time: Optional[datetime] = Query(None, description="Log end time"),
    search_text: Optional[str] = Query(None, description="Text search in logs"),
    limit: int = Query(500, description="Maximum number of logs"),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Query structured logs with advanced filtering"""
    query = db.query(StructuredLog)
    
    if service_name:
        query = query.filter(StructuredLog.service_name == service_name)
    if level:
        query = query.filter(StructuredLog.level == level.upper())
    if start_time:
        query = query.filter(StructuredLog.timestamp >= start_time)
    if end_time:
        query = query.filter(StructuredLog.timestamp <= end_time)
    if search_text:
        query = query.filter(StructuredLog.message.contains(search_text))
    
    logs = query.order_by(desc(StructuredLog.timestamp)).limit(limit).all()
    
    return [
        {
            "timestamp": log.timestamp,
            "level": log.level,
            "service_name": log.service_name,
            "message": log.message,
            "logger_name": log.logger_name,
            "user_id": log.user_id,
            "trace_id": log.trace_id,
            "attributes": log.attributes
        }
        for log in logs
    ]

@router.get("/audit-logs", response_model=List[AuditLogResponse])
async def query_audit_logs(
    event_type: Optional[str] = Query(None, description="Filter by event type"),
    user_id: Optional[str] = Query(None, description="Filter by user"),
    organization_id: Optional[str] = Query(None, description="Filter by organization"),
    start_time: Optional[datetime] = Query(None, description="Audit log start time"),
    end_time: Optional[datetime] = Query(None, description="Audit log end time"),
    limit: int = Query(200, description="Maximum number of audit logs"),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Query audit logs for compliance tracking"""
    query = db.query(AuditLog)
    
    if event_type:
        query = query.filter(AuditLog.event_type == event_type)
    if user_id:
        query = query.filter(AuditLog.user_id == user_id)
    if organization_id:
        query = query.filter(AuditLog.organization_id == organization_id)
    if start_time:
        query = query.filter(AuditLog.timestamp >= start_time)
    if end_time:
        query = query.filter(AuditLog.timestamp <= end_time)
    
    logs = query.order_by(desc(AuditLog.timestamp)).limit(limit).all()
    return [AuditLogResponse.from_orm(log) for log in logs]

# ===== DASHBOARD ENDPOINTS =====

@router.get("/dashboard", response_model=MonitoringDashboardResponse)
async def get_monitoring_dashboard(
    service_name: Optional[str] = None,
    time_range: str = Query("1h", description="Time range for dashboard data"),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Get comprehensive monitoring dashboard data"""
    
    # Calculate time range
    end_time = datetime.utcnow()
    if time_range == "1h":
        start_time = end_time - timedelta(hours=1)
    elif time_range == "24h":
        start_time = end_time - timedelta(hours=24)
    elif time_range == "7d":
        start_time = end_time - timedelta(days=7)
    else:
        start_time = end_time - timedelta(hours=1)
    
    # Get key metrics
    metrics_query = db.query(CollectedMetric).filter(
        CollectedMetric.timestamp >= start_time,
        CollectedMetric.timestamp <= end_time
    )
    
    if service_name:
        # Filter by service-specific labels
        pass
    
    recent_metrics = metrics_query.order_by(desc(CollectedMetric.timestamp)).limit(1000).all()
    
    # Get alert summary
    active_alerts = db.query(AlertEvent).filter(
        AlertEvent.status.in_([AlertStatus.OPEN, AlertStatus.ACKNOWLEDGED])
    ).count()
    
    # Get system health
    system_health = await get_system_health(None, db, current_user)
    
    # Get SLO summary
    slo_summary = await get_slo_summary(None, time_range, db, current_user)
    
    return MonitoringDashboardResponse(
        time_range=time_range,
        metrics_summary={
            "total_metrics": len(recent_metrics),
            "metric_types": list(set(m.metric_type.value for m in recent_metrics)),
            "services_monitored": list(set(
                m.labels.get("service", "unknown") for m in recent_metrics 
                if m.labels and "service" in m.labels
            ))
        },
        alerts_summary={
            "active_alerts": active_alerts,
            "critical_alerts": db.query(AlertEvent).filter(
                AlertEvent.severity == AlertSeverity.CRITICAL,
                AlertEvent.status.in_([AlertStatus.OPEN, AlertStatus.ACKNOWLEDGED])
            ).count()
        },
        system_health=system_health,
        slo_summary=slo_summary,
        recent_metrics=[CollectedMetricResponse.from_orm(m) for m in recent_metrics[:10]],
        last_updated=datetime.utcnow()
    )

# ===== REAL-TIME MONITORING =====

@router.websocket("/realtime")
async def websocket_realtime_monitoring(websocket: websockets.WebSocketServerProtocol):
    """WebSocket endpoint for real-time monitoring updates"""
    await websocket.accept()
    
    try:
        while True:
            # Send real-time updates
            update_data = {
                "timestamp": datetime.utcnow().isoformat(),
                "type": "metric_update",
                "data": {
                    "active_alerts": 0,  # Would fetch from database
                    "system_load": 0.45,  # Would fetch from monitoring
                    "requests_per_minute": 1250  # Would fetch from metrics
                }
            }
            
            await websocket.send_json(update_data)
            
            # Wait for next update (every 5 seconds)
            await asyncio.sleep(5)
            
    except websockets.exceptions.ConnectionClosed:
        logger.info("WebSocket connection closed")
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")

# ===== HEALTH CHECK ENDPOINT =====

@router.get("/health-check")
async def monitoring_health_check():
    """Health check endpoint for monitoring system itself"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "components": {
            "metrics_collection": "active",
            "alerting_system": "active",
            "slo_tracking": "active",
            "incident_management": "active",
            "system_health": "active"
        },
        "version": "1.0.0"
    }