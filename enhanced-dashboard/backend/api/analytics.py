"""
Advanced Analytics & Reporting API
Phase 10: Advanced Analytics & Reporting with AI Integration

This module implements comprehensive analytics endpoints including:
- Real-time AI Dashboard Widgets Management
- Automated AI-powered Business Report Generation
- Predictive Alerting and Notifications
- Interactive Visualization Components
- Multi-source Data Aggregation
"""

from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
import json
import asyncio
from .. import models, schemas
from ...database import get_db

# Import AI models from Phase 9
from .ai_models import (
    UsageForecast, ChurnPrediction, PricingRecommendation, 
    CustomerSegment, LLMProvider, LLMChatSession
)

# Import analytics models
from ..models.analytics import (
    Dashboard, DashboardWidget, WidgetDataCache, AnalyticsReport,
    ReportExecution, KPIMetric, MetricValue, PredictiveAlert,
    DataSource, VisualizationConfig, UserDashboardPreference,
    DashboardType, WidgetType, ReportType, AlertPriority, VisualizationType
)

# Import analytics schemas
from ..schemas.analytics import (
    DashboardCreate, DashboardUpdate, DashboardResponse,
    DashboardWidgetCreate, DashboardWidgetUpdate, DashboardWidgetResponse,
    WidgetDataCacheResponse, AnalyticsReportCreate, AnalyticsReportUpdate,
    AnalyticsReportResponse, ReportExecutionResponse, KPIMetricCreate,
    KPIMetricUpdate, KPIMetricResponse, MetricValueResponse,
    PredictiveAlertCreate, PredictiveAlertUpdate, PredictiveAlertResponse,
    DataSourceCreate, DataSourceUpdate, DataSourceResponse,
    VisualizationConfigCreate, VisualizationConfigUpdate, VisualizationConfigResponse,
    UserDashboardPreferenceCreate, UserDashboardPreferenceUpdate, UserDashboardPreferenceResponse
)

router = APIRouter()

# Dependency to get current user (placeholder - implement actual auth)
async def get_current_user(db: Session = Depends(get_db)):
    # This would implement actual authentication
    # For now, return a mock user
    return {"id": 1, "email": "user@example.com", "organization_id": 1}

# Dashboard Management Endpoints
@router.post("/dashboards/", response_model=DashboardResponse)
async def create_dashboard(
    dashboard: DashboardCreate,
    db: Session = Depends(get_db),
    current_user: Dict = Depends(get_current_user)
):
    """Create a new dashboard with AI integration"""
    
    db_dashboard = Dashboard(
        name=dashboard.name,
        description=dashboard.description,
        dashboard_type=dashboard.dashboard_type,
        organization_id=current_user["organization_id"],
        layout_config=dashboard.layout_config or {},
        filters_config=dashboard.filters_config or {},
        theme_config=dashboard.theme_config or {},
        created_by=current_user["id"]
    )
    
    db.add(db_dashboard)
    db.commit()
    db.refresh(db_dashboard)
    
    return db_dashboard

@router.get("/dashboards/", response_model=List[DashboardResponse])
async def get_dashboards(
    organization_id: Optional[int] = Query(None),
    dashboard_type: Optional[DashboardType] = None,
    limit: int = Query(50, le=100),
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: Dict = Depends(get_current_user)
):
    """Get dashboards for organization"""
    
    query = db.query(Dashboard)
    
    if organization_id:
        query = query.filter(Dashboard.organization_id == organization_id)
    else:
        query = query.filter(Dashboard.organization_id == current_user["organization_id"])
    
    if dashboard_type:
        query = query.filter(Dashboard.dashboard_type == dashboard_type)
    
    dashboards = query.offset(offset).limit(limit).all()
    return dashboards

@router.get("/dashboards/{dashboard_id}", response_model=DashboardResponse)
async def get_dashboard(
    dashboard_id: int,
    db: Session = Depends(get_db),
    current_user: Dict = Depends(get_current_user)
):
    """Get specific dashboard with widgets"""
    
    dashboard = db.query(Dashboard).filter(
        Dashboard.id == dashboard_id,
        Dashboard.organization_id == current_user["organization_id"]
    ).first()
    
    if not dashboard:
        raise HTTPException(status_code=404, detail="Dashboard not found")
    
    # Update access tracking
    dashboard.last_accessed = datetime.utcnow()
    dashboard.access_count = (dashboard.access_count or 0) + 1
    db.commit()
    
    return dashboard

@router.put("/dashboards/{dashboard_id}", response_model=DashboardResponse)
async def update_dashboard(
    dashboard_id: int,
    dashboard: DashboardUpdate,
    db: Session = Depends(get_db),
    current_user: Dict = Depends(get_current_user)
):
    """Update dashboard configuration"""
    
    db_dashboard = db.query(Dashboard).filter(
        Dashboard.id == dashboard_id,
        Dashboard.organization_id == current_user["organization_id"]
    ).first()
    
    if not db_dashboard:
        raise HTTPException(status_code=404, detail="Dashboard not found")
    
    for field, value in dashboard.dict(exclude_unset=True).items():
        setattr(db_dashboard, field, value)
    
    db_dashboard.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_dashboard)
    
    return db_dashboard

@router.delete("/dashboards/{dashboard_id}")
async def delete_dashboard(
    dashboard_id: int,
    db: Session = Depends(get_db),
    current_user: Dict = Depends(get_current_user)
):
    """Delete dashboard"""
    
    dashboard = db.query(Dashboard).filter(
        Dashboard.id == dashboard_id,
        Dashboard.organization_id == current_user["organization_id"]
    ).first()
    
    if not dashboard:
        raise HTTPException(status_code=404, detail="Dashboard not found")
    
    db.delete(dashboard)
    db.commit()
    
    return {"message": "Dashboard deleted successfully"}

# Widget Management Endpoints
@router.post("/widgets/", response_model=DashboardWidgetResponse)
async def create_widget(
    widget: DashboardWidgetCreate,
    db: Session = Depends(get_db),
    current_user: Dict = Depends(get_current_user)
):
    """Create a new dashboard widget"""
    
    # Verify dashboard ownership
    dashboard = db.query(Dashboard).filter(
        Dashboard.id == widget.dashboard_id,
        Dashboard.organization_id == current_user["organization_id"]
    ).first()
    
    if not dashboard:
        raise HTTPException(status_code=404, detail="Dashboard not found")
    
    db_widget = DashboardWidget(
        dashboard_id=widget.dashboard_id,
        widget_type=widget.widget_type,
        name=widget.name,
        description=widget.description,
        position_x=widget.position_x,
        position_y=widget.position_y,
        width=widget.width,
        height=widget.height,
        data_source=widget.data_source,
        query_config=widget.query_config or {},
        visualization_config=widget.visualization_config or {},
        display_config=widget.display_config or {},
        enable_interactions=widget.enable_interactions,
        enable_export=widget.enable_export,
        drill_down_enabled=widget.drill_down_enabled
    )
    
    db.add(db_widget)
    db.commit()
    db.refresh(db_widget)
    
    return db_widget

@router.get("/widgets/{widget_id}", response_model=DashboardWidgetResponse)
async def get_widget(
    widget_id: int,
    include_data: bool = Query(True),
    db: Session = Depends(get_db),
    current_user: Dict = Depends(get_current_user)
):
    """Get widget with cached data"""
    
    widget = db.query(DashboardWidget).join(Dashboard).filter(
        DashboardWidget.id == widget_id,
        Dashboard.organization_id == current_user["organization_id"]
    ).first()
    
    if not widget:
        raise HTTPException(status_code=404, detail="Widget not found")
    
    if include_data:
        # Try to get cached data first
        cache_entry = db.query(WidgetDataCache).filter(
            WidgetDataCache.widget_id == widget_id,
            WidgetDataCache.expiry_timestamp > datetime.utcnow()
        ).order_by(WidgetDataCache.cache_timestamp.desc()).first()
        
        if cache_entry:
            widget.data_cache = [cache_entry]
    
    return widget

@router.put("/widgets/{widget_id}", response_model=DashboardWidgetResponse)
async def update_widget(
    widget_id: int,
    widget: DashboardWidgetUpdate,
    db: Session = Depends(get_db),
    current_user: Dict = Depends(get_current_user)
):
    """Update widget configuration"""
    
    db_widget = db.query(DashboardWidget).join(Dashboard).filter(
        DashboardWidget.id == widget_id,
        Dashboard.organization_id == current_user["organization_id"]
    ).first()
    
    if not db_widget:
        raise HTTPException(status_code=404, detail="Widget not found")
    
    for field, value in widget.dict(exclude_unset=True).items():
        setattr(db_widget, field, value)
    
    db_widget.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_widget)
    
    return db_widget

@router.delete("/widgets/{widget_id}")
async def delete_widget(
    widget_id: int,
    db: Session = Depends(get_db),
    current_user: Dict = Depends(get_current_user)
):
    """Delete widget"""
    
    widget = db.query(DashboardWidget).join(Dashboard).filter(
        DashboardWidget.id == widget_id,
        Dashboard.organization_id == current_user["organization_id"]
    ).first()
    
    if not widget:
        raise HTTPException(status_code=404, detail="Widget not found")
    
    db.delete(widget)
    db.commit()
    
    return {"message": "Widget deleted successfully"}

# AI Data Integration Endpoints
@router.get("/widgets/{widget_id}/data")
async def get_widget_data(
    widget_id: int,
    refresh: bool = Query(False),
    db: Session = Depends(get_db),
    current_user: Dict = Depends(get_current_user)
):
    """Get data for specific widget from AI models"""
    
    widget = db.query(DashboardWidget).join(Dashboard).filter(
        DashboardWidget.id == widget_id,
        Dashboard.organization_id == current_user["organization_id"]
    ).first()
    
    if not widget:
        raise HTTPException(status_code=404, detail="Widget not found")
    
    data = await get_ai_data_for_widget(widget, db, refresh)
    
    return {
        "widget_id": widget_id,
        "widget_type": widget.widget_type,
        "data": data,
        "timestamp": datetime.utcnow().isoformat(),
        "cached": not refresh
    }

@router.post("/widgets/{widget_id}/refresh")
async def refresh_widget_data(
    widget_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: Dict = Depends(get_current_user)
):
    """Trigger background refresh of widget data"""
    
    widget = db.query(DashboardWidget).join(Dashboard).filter(
        DashboardWidget.id == widget_id,
        Dashboard.organization_id == current_user["organization_id"]
    ).first()
    
    if not widget:
        raise HTTPException(status_code=404, detail="Widget not found")
    
    # Add background task to refresh data
    background_tasks.add_task(refresh_widget_data_background, widget_id, current_user["organization_id"])
    
    return {"message": "Data refresh initiated"}

# Report Management Endpoints
@router.post("/reports/", response_model=AnalyticsReportResponse)
async def create_report(
    report: AnalyticsReportCreate,
    db: Session = Depends(get_db),
    current_user: Dict = Depends(get_current_user)
):
    """Create a new analytics report"""
    
    db_report = AnalyticsReport(
        name=report.name,
        description=report.description,
        report_type=report.report_type,
        organization_id=current_user["organization_id"],
        report_config=report.report_config or {},
        template_config=report.template_config or {},
        is_scheduled=report.is_scheduled,
        schedule_config=report.schedule_config or {},
        auto_generate=report.auto_generate,
        created_by=current_user["id"]
    )
    
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    
    return db_report

@router.get("/reports/", response_model=List[AnalyticsReportResponse])
async def get_reports(
    organization_id: Optional[int] = Query(None),
    report_type: Optional[ReportType] = None,
    limit: int = Query(50, le=100),
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: Dict = Depends(get_current_user)
):
    """Get reports for organization"""
    
    query = db.query(AnalyticsReport)
    
    if organization_id:
        query = query.filter(AnalyticsReport.organization_id == organization_id)
    else:
        query = query.filter(AnalyticsReport.organization_id == current_user["organization_id"])
    
    if report_type:
        query = query.filter(AnalyticsReport.report_type == report_type)
    
    reports = query.offset(offset).limit(limit).all()
    return reports

@router.post("/reports/{report_id}/generate")
async def generate_report(
    report_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: Dict = Depends(get_current_user)
):
    """Trigger report generation"""
    
    report = db.query(AnalyticsReport).filter(
        AnalyticsReport.id == report_id,
        AnalyticsReport.organization_id == current_user["organization_id"]
    ).first()
    
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    # Add background task to generate report
    background_tasks.add_task(generate_report_background, report_id, current_user["organization_id"])
    
    return {"message": "Report generation initiated"}

# KPI Metrics Endpoints
@router.post("/kpis/", response_model=KPIMetricResponse)
async def create_kpi(
    kpi: KPIMetricCreate,
    db: Session = Depends(get_db),
    current_user: Dict = Depends(get_current_user)
):
    """Create a new KPI metric"""
    
    db_kpi = KPIMetric(
        name=kpi.name,
        description=kpi.description,
        organization_id=current_user["organization_id"],
        metric_type=kpi.metric_type,
        calculation_method=kpi.calculation_method,
        data_source=kpi.data_source,
        metric_parameters=kpi.metric_parameters or {},
        target_value=kpi.target_value,
        warning_threshold=kpi.warning_threshold,
        critical_threshold=kpi.critical_threshold,
        time_window_days=kpi.time_window_days,
        refresh_interval_minutes=kpi.refresh_interval_minutes,
        enable_alerts=kpi.enable_alerts,
        alert_config=kpi.alert_config or {}
    )
    
    db.add(db_kpi)
    db.commit()
    db.refresh(db_kpi)
    
    return db_kpi

@router.get("/kpis/", response_model=List[KPIMetricResponse])
async def get_kpis(
    organization_id: Optional[int] = Query(None),
    metric_type: Optional[str] = Query(None),
    limit: int = Query(50, le=100),
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: Dict = Depends(get_current_user)
):
    """Get KPI metrics"""
    
    query = db.query(KPIMetric).filter(KPIMetric.is_active == True)
    
    if organization_id:
        query = query.filter(KPIMetric.organization_id == organization_id)
    else:
        query = query.filter(KPIMetric.organization_id == current_user["organization_id"])
    
    if metric_type:
        query = query.filter(KPIMetric.metric_type == metric_type)
    
    kpis = query.offset(offset).limit(limit).all()
    return kpis

@router.get("/kpis/{kpi_id}/values")
async def get_kpi_values(
    kpi_id: int,
    days: int = Query(30),
    db: Session = Depends(get_db),
    current_user: Dict = Depends(get_current_user)
):
    """Get KPI historical values"""
    
    kpi = db.query(KPIMetric).filter(
        KPIMetric.id == kpi_id,
        KPIMetric.organization_id == current_user["organization_id"]
    ).first()
    
    if not kpi:
        raise HTTPException(status_code=404, detail="KPI not found")
    
    start_date = datetime.utcnow() - timedelta(days=days)
    
    values = db.query(MetricValue).filter(
        MetricValue.kpi_id == kpi_id,
        MetricValue.metric_timestamp >= start_date
    ).order_by(MetricValue.metric_timestamp.desc()).all()
    
    return {
        "kpi_id": kpi_id,
        "kpi_name": kpi.name,
        "values": values,
        "summary": {
            "current_value": values[0].metric_value if values else None,
            "target_value": kpi.target_value,
            "trend": "up" if values and len(values) > 1 and values[0].metric_value > values[-1].metric_value else "down"
        }
    }

# Predictive Alerts Endpoints
@router.get("/alerts/", response_model=List[PredictiveAlertResponse])
async def get_alerts(
    organization_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    priority: Optional[AlertPriority] = Query(None),
    limit: int = Query(50, le=100),
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: Dict = Depends(get_current_user)
):
    """Get predictive alerts"""
    
    query = db.query(PredictiveAlert)
    
    if organization_id:
        query = query.filter(PredictiveAlert.organization_id == organization_id)
    else:
        query = query.filter(PredictiveAlert.organization_id == current_user["organization_id"])
    
    if status:
        query = query.filter(PredictiveAlert.status == status)
    
    if priority:
        query = query.filter(PredictiveAlert.priority == priority)
    
    alerts = query.order_by(PredictiveAlert.created_at.desc()).offset(offset).limit(limit).all()
    return alerts

@router.put("/alerts/{alert_id}/acknowledge", response_model=PredictiveAlertResponse)
async def acknowledge_alert(
    alert_id: int,
    db: Session = Depends(get_db),
    current_user: Dict = Depends(get_current_user)
):
    """Acknowledge a predictive alert"""
    
    alert = db.query(PredictiveAlert).filter(
        PredictiveAlert.id == alert_id,
        PredictiveAlert.organization_id == current_user["organization_id"]
    ).first()
    
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    alert.status = "acknowledged"
    alert.acknowledged_at = datetime.utcnow()
    alert.assigned_to = current_user["id"]
    
    db.commit()
    db.refresh(alert)
    
    return alert

@router.put("/alerts/{alert_id}/resolve", response_model=PredictiveAlertResponse)
async def resolve_alert(
    alert_id: int,
    db: Session = Depends(get_db),
    current_user: Dict = Depends(get_current_user)
):
    """Resolve a predictive alert"""
    
    alert = db.query(PredictiveAlert).filter(
        PredictiveAlert.id == alert_id,
        PredictiveAlert.organization_id == current_user["organization_id"]
    ).first()
    
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    alert.status = "resolved"
    alert.resolved_at = datetime.utcnow()
    
    db.commit()
    db.refresh(alert)
    
    return alert

# Data Source Management
@router.get("/data-sources/", response_model=List[DataSourceResponse])
async def get_data_sources(
    source_type: Optional[str] = Query(None),
    active_only: bool = Query(True),
    db: Session = Depends(get_db),
    current_user: Dict = Depends(get_current_user)
):
    """Get available data sources"""
    
    query = db.query(DataSource)
    
    if active_only:
        query = query.filter(DataSource.is_active == True)
    
    if source_type:
        query = query.filter(DataSource.source_type == source_type)
    
    sources = query.all()
    return sources

# Helper Functions for AI Data Integration
async def get_ai_data_for_widget(widget: DashboardWidget, db: Session, refresh: bool = False) -> Dict[str, Any]:
    """Get AI data based on widget type and data source"""
    
    data = {}
    
    if widget.widget_type == WidgetType.TIME_SERIES_CHART:
        # Get usage forecasting data
        forecasts = db.query(UsageForecast).filter(
            UsageForecast.organization_id == widget.dashboard.organization_id
        ).order_by(UsageForecast.created_at.desc()).limit(100).all()
        
        data = {
            "type": "time_series",
            "forecasts": [
                {
                    "date": f.forecast_date.isoformat(),
                    "value": f.predicted_value,
                    "confidence_interval": [f.confidence_lower, f.confidence_upper],
                    "accuracy": f.accuracy_score
                } for f in forecasts
            ]
        }
    
    elif widget.widget_type == WidgetType.CHURN_RISK_HEATMAP:
        # Get churn prediction data
        churn_predictions = db.query(ChurnPrediction).filter(
            ChurnPrediction.organization_id == widget.dashboard.organization_id
        ).order_by(ChurnPrediction.created_at.desc()).limit(1000).all()
        
        data = {
            "type": "heatmap",
            "risk_scores": [
                {
                    "customer_id": cp.customer_id,
                    "risk_score": cp.churn_probability,
                    "risk_level": cp.risk_level,
                    "factors": cp.contributing_factors
                } for cp in churn_predictions
            ]
        }
    
    elif widget.widget_type == WidgetType.PRICING_OPTIMIZATION_PANEL:
        # Get pricing recommendations
        pricing_recs = db.query(PricingRecommendation).filter(
            PricingRecommendation.organization_id == widget.dashboard.organization_id
        ).order_by(PricingRecommendation.created_at.desc()).limit(50).all()
        
        data = {
            "type": "pricing_panel",
            "recommendations": [
                {
                    "product_id": pr.product_id,
                    "current_price": float(pr.current_price),
                    "recommended_price": float(pr.recommended_price),
                    "expected_impact": pr.expected_impact,
                    "confidence": pr.confidence_score
                } for pr in pricing_recs
            ]
        }
    
    elif widget.widget_type == WidgetType.CUSTOMER_SEGMENTATION_CHART:
        # Get customer segmentation data
        segments = db.query(CustomerSegment).filter(
            CustomerSegment.organization_id == widget.dashboard.organization_id
        ).order_by(CustomerSegment.created_at.desc()).limit(10).all()
        
        data = {
            "type": "segmentation",
            "segments": [
                {
                    "segment_name": cs.segment_name,
                    "customer_count": cs.customer_count,
                    "avg_revenue": float(cs.avg_revenue),
                    "characteristics": cs.segment_characteristics
                } for cs in segments
            ]
        }
    
    elif widget.widget_type == WidgetType.KPI_CARD:
        # Calculate KPI values from various sources
        data = {
            "type": "kpi_card",
            "metrics": await calculate_dashboard_kpis(widget.dashboard.organization_id, db)
        }
    
    # Cache the data
    if data and refresh:
        cache_entry = WidgetDataCache(
            widget_id=widget.id,
            data_key=f"main_data_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}",
            cached_data=data,
            expiry_timestamp=datetime.utcnow() + timedelta(seconds=widget.refresh_interval),
            data_size_bytes=len(json.dumps(data).encode('utf-8'))
        )
        
        db.add(cache_entry)
        db.commit()
    
    return data

async def calculate_dashboard_kpis(org_id: int, db: Session) -> Dict[str, Any]:
    """Calculate key performance indicators for dashboard"""
    
    # Get latest forecasts for usage prediction
    latest_forecasts = db.query(UsageForecast).filter(
        UsageForecast.organization_id == org_id
    ).order_by(UsageForecast.created_at.desc()).limit(10).all()
    
    # Get churn risk statistics
    churn_stats = db.query(ChurnPrediction).filter(
        ChurnPrediction.organization_id == org_id
    ).all()
    
    avg_churn_risk = sum([cp.churn_probability for cp in churn_stats]) / len(churn_stats) if churn_stats else 0
    
    # Get pricing recommendations impact
    pricing_recs = db.query(PricingRecommendation).filter(
        PricingRecommendation.organization_id == org_id
    ).all()
    
    total_potential_impact = sum([pr.expected_impact for pr in pricing_recs]) if pricing_recs else 0
    
    return {
        "predicted_usage_growth": sum([f.predicted_value for f in latest_forecasts]) / len(latest_forecasts) if latest_forecasts else 0,
        "average_churn_risk": avg_churn_risk,
        "pricing_optimization_potential": total_potential_impact,
        "active_customer_segments": len(db.query(CustomerSegment).filter(CustomerSegment.organization_id == org_id).all()),
        "last_updated": datetime.utcnow().isoformat()
    }

async def refresh_widget_data_background(widget_id: int, organization_id: int):
    """Background task to refresh widget data"""
    # This would implement actual data refresh logic
    pass

async def generate_report_background(report_id: int, organization_id: int):
    """Background task to generate report"""
    # This would implement actual report generation logic
    pass