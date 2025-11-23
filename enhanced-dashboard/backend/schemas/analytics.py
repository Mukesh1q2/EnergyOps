"""
Advanced Analytics & Reporting Schemas
Phase 10: Advanced Analytics & Reporting with AI Integration

This module implements comprehensive analytics schemas including:
- Dashboard and Widget Configuration Schemas
- Report Generation and Scheduling Schemas
- KPI Metrics and Data Schemas
- Predictive Alerting Schemas
- Data Source and Visualization Schemas
"""

from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any, Union
from datetime import datetime
from decimal import Decimal
from enum import Enum

# Enums (matching the models)
class DashboardType(str, Enum):
    EXECUTIVE = "executive"
    OPERATIONAL = "operational"
    FINANCIAL = "financial"
    AI_INSIGHTS = "ai_insights"
    CUSTOM = "custom"

class WidgetType(str, Enum):
    TIME_SERIES_CHART = "time_series_chart"
    CHURN_RISK_HEATMAP = "churn_risk_heatmap"
    PRICING_OPTIMIZATION_PANEL = "pricing_optimization_panel"
    CUSTOMER_SEGMENTATION_CHART = "customer_segmentation_chart"
    LLM_PERFORMANCE_METRIC = "llm_performance_metric"
    KPI_CARD = "kpi_card"
    PREDICTIVE_ALERT = "predictive_alert"
    REAL_TIME_FEED = "real_time_feed"
    DRILL_DOWN_TABLE = "drill_down_table"

class ReportType(str, Enum):
    EXECUTIVE_SUMMARY = "executive_summary"
    WEEKLY_AI_INSIGHTS = "weekly_ai_insights"
    MONTHLY_FINANCIAL_FORECAST = "monthly_financial_forecast"
    CHURN_RISK_ANALYSIS = "churn_risk_analysis"
    PRICING_OPTIMIZATION_REPORT = "pricing_optimization_report"
    CUSTOMER_SEGMENTATION_ANALYSIS = "customer_segmentation_analysis"
    LLM_PERFORMANCE_REPORT = "llm_performance_report"
    PREDICTIVE_ALERTS_SUMMARY = "predictive_alerts_summary"

class AlertPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class VisualizationType(str, Enum):
    BAR_CHART = "bar_chart"
    LINE_CHART = "line_chart"
    PIE_CHART = "pie_chart"
    HEATMAP = "heatmap"
    SCATTER_PLOT = "scatter_plot"
    TREEMAP = "treemap"
    GAUGE_CHART = "gauge_chart"
    CANDLESTICK_CHART = "candlestick_chart"
    AREA_CHART = "area_chart"

# Base Schemas
class AnalyticsBase(BaseModel):
    """Base schema with common fields"""
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

# Dashboard Schemas
class DashboardBase(AnalyticsBase):
    name: str = Field(..., max_length=255, description="Dashboard name")
    description: Optional[str] = Field(None, description="Dashboard description")
    dashboard_type: DashboardType = Field(..., description="Type of dashboard")
    layout_config: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Layout configuration")
    filters_config: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Filter configuration")
    theme_config: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Theme configuration")

class DashboardCreate(DashboardBase):
    """Schema for creating a dashboard"""
    pass

class DashboardUpdate(BaseModel):
    """Schema for updating a dashboard"""
    name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    layout_config: Optional[Dict[str, Any]] = None
    filters_config: Optional[Dict[str, Any]] = None
    theme_config: Optional[Dict[str, Any]] = None
    is_public: Optional[bool] = None

class DashboardResponse(DashboardBase):
    """Schema for dashboard response"""
    id: int
    organization_id: int
    is_public: bool
    created_by: int
    last_accessed: Optional[datetime] = None
    access_count: int = 0
    
    class Config:
        from_attributes = True

# Dashboard Widget Schemas
class DashboardWidgetBase(AnalyticsBase):
    widget_type: WidgetType = Field(..., description="Type of widget")
    name: str = Field(..., max_length=255, description="Widget name")
    description: Optional[str] = Field(None, description="Widget description")
    position_x: int = Field(default=0, ge=0, description="X position in grid")
    position_y: int = Field(default=0, ge=0, description="Y position in grid")
    width: int = Field(default=4, ge=1, le=12, description="Widget width")
    height: int = Field(default=3, ge=1, le=12, description="Widget height")
    data_source: str = Field(..., max_length=100, description="Data source identifier")
    query_config: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Query configuration")
    visualization_config: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Visualization settings")
    display_config: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Display settings")
    enable_interactions: bool = Field(default=True, description="Enable user interactions")
    enable_export: bool = Field(default=False, description="Enable data export")
    drill_down_enabled: bool = Field(default=False, description="Enable drill-down features")
    refresh_interval: int = Field(default=300, ge=30, le=3600, description="Refresh interval in seconds")

class DashboardWidgetCreate(DashboardWidgetBase):
    dashboard_id: int = Field(..., description="Parent dashboard ID")

class DashboardWidgetUpdate(BaseModel):
    """Schema for updating a dashboard widget"""
    name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    position_x: Optional[int] = Field(None, ge=0)
    position_y: Optional[int] = Field(None, ge=0)
    width: Optional[int] = Field(None, ge=1, le=12)
    height: Optional[int] = Field(None, ge=1, le=12)
    data_source: Optional[str] = Field(None, max_length=100)
    query_config: Optional[Dict[str, Any]] = None
    visualization_config: Optional[Dict[str, Any]] = None
    display_config: Optional[Dict[str, Any]] = None
    enable_interactions: Optional[bool] = None
    enable_export: Optional[bool] = None
    drill_down_enabled: Optional[bool] = None
    refresh_interval: Optional[int] = Field(None, ge=30, le=3600)

class DashboardWidgetResponse(DashboardWidgetBase):
    """Schema for dashboard widget response"""
    id: int
    dashboard_id: int
    
    class Config:
        from_attributes = True

# Widget Data Cache Schemas
class WidgetDataCacheResponse(BaseModel):
    """Schema for widget data cache response"""
    id: int
    widget_id: int
    data_key: str
    cached_data: Dict[str, Any]
    cache_timestamp: datetime
    expiry_timestamp: Optional[datetime] = None
    data_version: str
    query_duration_ms: Optional[float] = None
    data_size_bytes: Optional[int] = None
    
    class Config:
        from_attributes = True

# Analytics Report Schemas
class AnalyticsReportBase(AnalyticsBase):
    name: str = Field(..., max_length=255, description="Report name")
    description: Optional[str] = Field(None, description="Report description")
    report_type: ReportType = Field(..., description="Type of report")
    report_config: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Report configuration")
    template_config: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Template configuration")
    is_scheduled: bool = Field(default=False, description="Is report scheduled")
    schedule_config: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Schedule configuration")
    auto_generate: bool = Field(default=False, description="Auto-generate report")
    allowed_viewers: Optional[List[str]] = Field(default_factory=list, description="Allowed viewer IDs")

class AnalyticsReportCreate(AnalyticsReportBase):
    """Schema for creating an analytics report"""
    pass

class AnalyticsReportUpdate(BaseModel):
    """Schema for updating an analytics report"""
    name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    report_config: Optional[Dict[str, Any]] = None
    template_config: Optional[Dict[str, Any]] = None
    is_scheduled: Optional[bool] = None
    schedule_config: Optional[Dict[str, Any]] = None
    auto_generate: Optional[bool] = None
    allowed_viewers: Optional[List[str]] = None

class AnalyticsReportResponse(AnalyticsReportBase):
    """Schema for analytics report response"""
    id: int
    organization_id: int
    last_generated: Optional[datetime] = None
    generation_status: str
    created_by: int
    
    class Config:
        from_attributes = True

# Report Execution Schemas
class ReportExecutionResponse(BaseModel):
    """Schema for report execution response"""
    id: int
    report_id: int
    execution_status: str
    started_at: datetime
    completed_at: Optional[datetime] = None
    report_data: Optional[Dict[str, Any]] = None
    file_path: Optional[str] = None
    execution_duration_seconds: Optional[int] = None
    records_processed: Optional[int] = None
    data_sources_used: Optional[List[str]] = None
    error_message: Optional[str] = None
    error_details: Optional[Dict[str, Any]] = None
    
    class Config:
        from_attributes = True

# KPI Metric Schemas
class KPIMetricBase(AnalyticsBase):
    name: str = Field(..., max_length=255, description="KPI name")
    description: Optional[str] = Field(None, description="KPI description")
    metric_type: str = Field(..., max_length=100, description="Type of metric")
    calculation_method: str = Field(..., max_length=100, description="Calculation method")
    data_source: str = Field(..., max_length=100, description="Data source")
    metric_parameters: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Metric parameters")
    target_value: Optional[float] = Field(None, description="Target value")
    warning_threshold: Optional[float] = Field(None, description="Warning threshold")
    critical_threshold: Optional[float] = Field(None, description="Critical threshold")
    time_window_days: int = Field(default=30, ge=1, le=365, description="Time window in days")
    refresh_interval_minutes: int = Field(default=60, ge=1, le=1440, description="Refresh interval in minutes")
    enable_alerts: bool = Field(default=True, description="Enable alerts")
    alert_config: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Alert configuration")

class KPIMetricCreate(KPIMetricBase):
    """Schema for creating a KPI metric"""
    pass

class KPIMetricUpdate(BaseModel):
    """Schema for updating a KPI metric"""
    name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    metric_parameters: Optional[Dict[str, Any]] = None
    target_value: Optional[float] = None
    warning_threshold: Optional[float] = None
    critical_threshold: Optional[float] = None
    time_window_days: Optional[int] = Field(None, ge=1, le=365)
    refresh_interval_minutes: Optional[int] = Field(None, ge=1, le=1440)
    enable_alerts: Optional[bool] = None
    alert_config: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None

class KPIMetricResponse(KPIMetricBase):
    """Schema for KPI metric response"""
    id: int
    organization_id: int
    is_active: bool
    
    class Config:
        from_attributes = True

# Metric Value Schemas
class MetricValueResponse(BaseModel):
    """Schema for metric value response"""
    id: int
    kpi_id: int
    metric_value: float
    metric_timestamp: datetime
    dimension_values: Optional[Dict[str, Any]] = None
    calculation_details: Optional[Dict[str, Any]] = None
    
    class Config:
        from_attributes = True

# Predictive Alert Schemas
class PredictiveAlertBase(AnalyticsBase):
    alert_type: str = Field(..., max_length=100, description="Type of alert")
    title: str = Field(..., max_length=255, description="Alert title")
    description: Optional[str] = Field(None, description="Alert description")
    priority: AlertPriority = Field(..., description="Alert priority")
    alert_data: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Alert data")
    confidence_score: Optional[float] = Field(None, ge=0, le=1, description="AI confidence score")
    impact_score: Optional[float] = Field(None, description="Estimated business impact")
    predicted_occurrence: Optional[datetime] = Field(None, description="Predicted occurrence time")

class PredictiveAlertCreate(PredictiveAlertBase):
    """Schema for creating a predictive alert"""
    organization_id: int = Field(..., description="Organization ID")

class PredictiveAlertUpdate(BaseModel):
    """Schema for updating a predictive alert"""
    title: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    priority: Optional[AlertPriority] = None
    alert_data: Optional[Dict[str, Any]] = None
    confidence_score: Optional[float] = Field(None, ge=0, le=1)
    impact_score: Optional[float] = None
    predicted_occurrence: Optional[datetime] = None
    status: Optional[str] = Field(None, description="Alert status")
    assigned_to: Optional[int] = Field(None, description="Assigned user ID")

class PredictiveAlertResponse(PredictiveAlertBase):
    """Schema for predictive alert response"""
    id: int
    organization_id: int
    status: str
    assigned_to: Optional[int] = None
    acknowledged_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Data Source Schemas
class DataSourceBase(AnalyticsBase):
    name: str = Field(..., max_length=255, description="Data source name")
    description: Optional[str] = Field(None, description="Data source description")
    source_type: str = Field(..., max_length=100, description="Source type")
    connection_config: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Connection configuration")
    is_active: bool = Field(default=True, description="Is active")
    cache_ttl_seconds: int = Field(default=300, ge=60, le=3600, description="Cache TTL")
    rate_limit_per_minute: int = Field(default=100, ge=1, le=1000, description="Rate limit")
    last_accessed: Optional[datetime] = None
    access_count: int = 0

class DataSourceCreate(DataSourceBase):
    """Schema for creating a data source"""
    pass

class DataSourceUpdate(BaseModel):
    """Schema for updating a data source"""
    name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    connection_config: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None
    cache_ttl_seconds: Optional[int] = Field(None, ge=60, le=3600)
    rate_limit_per_minute: Optional[int] = Field(None, ge=1, le=1000)

class DataSourceResponse(DataSourceBase):
    """Schema for data source response"""
    id: int
    
    class Config:
        from_attributes = True

# Visualization Config Schemas
class VisualizationConfigBase(AnalyticsBase):
    name: str = Field(..., max_length=255, description="Visualization name")
    visualization_type: VisualizationType = Field(..., description="Visualization type")
    chart_config: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Chart configuration")
    color_scheme: str = Field(default="default", max_length=100, description="Color scheme")
    theme_config: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Theme configuration")
    enable_tooltips: bool = Field(default=True, description="Enable tooltips")
    enable_zoom: bool = Field(default=False, description="Enable zoom")
    enable_pan: bool = Field(default=False, description="Enable pan")
    enable_selection: bool = Field(default=True, description="Enable selection")
    accessible: bool = Field(default=True, description="Accessibility enabled")
    alt_text: Optional[str] = Field(None, max_length=255, description="Alt text for accessibility")

class VisualizationConfigCreate(VisualizationConfigBase):
    """Schema for creating visualization config"""
    pass

class VisualizationConfigUpdate(BaseModel):
    """Schema for updating visualization config"""
    name: Optional[str] = Field(None, max_length=255)
    chart_config: Optional[Dict[str, Any]] = None
    color_scheme: Optional[str] = Field(None, max_length=100)
    theme_config: Optional[Dict[str, Any]] = None
    enable_tooltips: Optional[bool] = None
    enable_zoom: Optional[bool] = None
    enable_pan: Optional[bool] = None
    enable_selection: Optional[bool] = None
    accessible: Optional[bool] = None
    alt_text: Optional[str] = Field(None, max_length=255)

class VisualizationConfigResponse(VisualizationConfigBase):
    """Schema for visualization config response"""
    id: int
    
    class Config:
        from_attributes = True

# User Dashboard Preference Schemas
class UserDashboardPreferenceBase(AnalyticsBase):
    default_dashboard_id: Optional[int] = Field(None, description="Default dashboard ID")
    preferred_theme: str = Field(default="light", max_length=50, description="Preferred theme")
    preferred_timezone: str = Field(default="UTC", max_length=50, description="Preferred timezone")
    email_alerts: bool = Field(default=True, description="Email alerts enabled")
    push_alerts: bool = Field(default=True, description="Push alerts enabled")
    alert_frequency: str = Field(default="immediate", max_length=50, description="Alert frequency")
    grid_size: str = Field(default="medium", max_length=20, description="Grid size")
    widget_density: str = Field(default="comfortable", max_length=20, description="Widget density")

class UserDashboardPreferenceCreate(UserDashboardPreferenceBase):
    """Schema for creating user dashboard preferences"""
    pass

class UserDashboardPreferenceUpdate(BaseModel):
    """Schema for updating user dashboard preferences"""
    default_dashboard_id: Optional[int] = None
    preferred_theme: Optional[str] = Field(None, max_length=50)
    preferred_timezone: Optional[str] = Field(None, max_length=50)
    email_alerts: Optional[bool] = None
    push_alerts: Optional[bool] = None
    alert_frequency: Optional[str] = Field(None, max_length=50)
    grid_size: Optional[str] = Field(None, max_length=20)
    widget_density: Optional[str] = Field(None, max_length=20)

class UserDashboardPreferenceResponse(UserDashboardPreferenceBase):
    """Schema for user dashboard preference response"""
    id: int
    user_id: int
    
    class Config:
        from_attributes = True

# Additional Response Schemas for Complex Operations
class WidgetDataResponse(BaseModel):
    """Schema for widget data response"""
    widget_id: int
    widget_type: WidgetType
    data: Dict[str, Any]
    timestamp: datetime
    cached: bool

class KPIValuesResponse(BaseModel):
    """Schema for KPI values response"""
    kpi_id: int
    kpi_name: str
    values: List[MetricValueResponse]
    summary: Dict[str, Any]

class DashboardWithWidgets(DashboardResponse):
    """Schema for dashboard with widgets"""
    widgets: List[DashboardWidgetResponse]

class AnalyticsSummaryResponse(BaseModel):
    """Schema for analytics summary"""
    total_dashboards: int
    total_widgets: int
    total_kpis: int
    active_alerts: int
    reports_generated: int
    data_sources_active: int
    last_updated: datetime

# Widget-specific data schemas for better typing
class TimeSeriesData(BaseModel):
    """Schema for time series data"""
    type: str = "time_series"
    forecasts: List[Dict[str, Any]]

class ChurnRiskData(BaseModel):
    """Schema for churn risk heatmap data"""
    type: str = "heatmap"
    risk_scores: List[Dict[str, Any]]

class PricingOptimizationData(BaseModel):
    """Schema for pricing optimization data"""
    type: str = "pricing_panel"
    recommendations: List[Dict[str, Any]]

class CustomerSegmentationData(BaseModel):
    """Schema for customer segmentation data"""
    type: str = "segmentation"
    segments: List[Dict[str, Any]]

class KPICardData(BaseModel):
    """Schema for KPI card data"""
    type: str = "kpi_card"
    metrics: Dict[str, Any]