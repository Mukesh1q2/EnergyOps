"""
Advanced Analytics & Reporting Models
Phase 10: Advanced Analytics & Reporting with AI Integration

This module implements comprehensive analytics capabilities including:
- Real-time AI Dashboard Widgets
- Automated AI-powered Business Reports  
- Predictive Alerting and Notifications
- Interactive Visualization Components
- Multi-source Data Aggregation
- Performance Metrics and KPIs
"""

from sqlalchemy import Column, Integer, String, DateTime, Float, Boolean, Text, JSON, Enum, ForeignKey, Index, Decimal
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from enum import Enum as PyEnum
from typing import Optional, Dict, Any, List
from datetime import datetime
import json

Base = declarative_base()

# Enums for Analytics
class DashboardType(PyEnum):
    EXECUTIVE = "executive"
    OPERATIONAL = "operational"
    FINANCIAL = "financial"
    AI_INSIGHTS = "ai_insights"
    CUSTOM = "custom"

class WidgetType(PyEnum):
    TIME_SERIES_CHART = "time_series_chart"
    CHURN_RISK_HEATMAP = "churn_risk_heatmap"
    PRICING_OPTIMIZATION_PANEL = "pricing_optimization_panel"
    CUSTOMER_SEGMENTATION_CHART = "customer_segmentation_chart"
    LLM_PERFORMANCE_METRIC = "llm_performance_metric"
    KPI_CARD = "kpi_card"
    PREDICTIVE_ALERT = "predictive_alert"
    REAL_TIME_FEED = "real_time_feed"
    DRILL_DOWN_TABLE = "drill_down_table"

class ReportType(PyEnum):
    EXECUTIVE_SUMMARY = "executive_summary"
    WEEKLY_AI_INSIGHTS = "weekly_ai_insights"
    MONTHLY_FINANCIAL_FORECAST = "monthly_financial_forecast"
    CHURN_RISK_ANALYSIS = "churn_risk_analysis"
    PRICING_OPTIMIZATION_REPORT = "pricing_optimization_report"
    CUSTOMER_SEGMENTATION_ANALYSIS = "customer_segmentation_analysis"
    LLM_PERFORMANCE_REPORT = "llm_performance_report"
    PREDICTIVE_ALERTS_SUMMARY = "predictive_alerts_summary"

class AlertPriority(PyEnum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class VisualizationType(PyEnum):
    BAR_CHART = "bar_chart"
    LINE_CHART = "line_chart"
    PIE_CHART = "pie_chart"
    HEATMAP = "heatmap"
    SCATTER_PLOT = "scatter_plot"
    TREEMAP = "treemap"
    GAUGE_CHART = "gauge_chart"
    CANDLESTICK_CHART = "candlestick_chart"
    AREA_CHART = "area_chart"

# Analytics Models
class Dashboard(Base):
    __tablename__ = "dashboards"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    dashboard_type = Column(Enum(DashboardType), nullable=False)
    organization_id = Column(Integer, ForeignKey("organizations.id"))
    
    # Configuration
    layout_config = Column(JSON)  # Widget positions, sizes, grid layout
    filters_config = Column(JSON)  # Available filters for the dashboard
    theme_config = Column(JSON)  # Visual theme and styling
    
    # Permissions
    is_public = Column(Boolean, default=False)
    created_by = Column(Integer, ForeignKey("users.id"))
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_accessed = Column(DateTime(timezone=True))
    access_count = Column(Integer, default=0)
    
    # Relationships
    widgets = relationship("DashboardWidget", back_populates="dashboard", cascade="all, delete-orphan")
    
    # Indexes
    __table_args__ = (
        Index('ix_dashboards_org_type', 'organization_id', 'dashboard_type'),
        Index('ix_dashboards_created_by', 'created_by'),
        Index('ix_dashboards_updated', 'updated_at'),
    )

class DashboardWidget(Base):
    __tablename__ = "dashboard_widgets"
    
    id = Column(Integer, primary_key=True, index=True)
    dashboard_id = Column(Integer, ForeignKey("dashboards.id"), nullable=False)
    
    # Widget Configuration
    widget_type = Column(Enum(WidgetType), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    
    # Layout Properties
    position_x = Column(Integer, default=0)
    position_y = Column(Integer, default=0)
    width = Column(Integer, default=4)
    height = Column(Integer, default=3)
    
    # Data Configuration
    data_source = Column(String(100))  # e.g., "ai_forecasting", "churn_prediction"
    query_config = Column(JSON)  # Data query parameters and filters
    refresh_interval = Column(Integer, default=300)  # seconds
    
    # Visualization Settings
    visualization_config = Column(JSON)  # Chart types, colors, axis settings
    display_config = Column(JSON)  # Headers, legends, tooltips
    
    # Interactive Features
    enable_interactions = Column(Boolean, default=True)
    enable_export = Column(Boolean, default=False)
    drill_down_enabled = Column(Boolean, default=False)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    dashboard = relationship("Dashboard", back_populates="widgets")
    data_cache = relationship("WidgetDataCache", back_populates="widget", cascade="all, delete-orphan")
    
    # Indexes
    __table_args__ = (
        Index('ix_widgets_dashboard', 'dashboard_id'),
        Index('ix_widgets_type', 'widget_type'),
    )

class WidgetDataCache(Base):
    __tablename__ = "widget_data_cache"
    
    id = Column(Integer, primary_key=True, index=True)
    widget_id = Column(Integer, ForeignKey("dashboard_widgets.id"), nullable=False)
    
    # Cached Data
    data_key = Column(String(255), nullable=False)  # Unique identifier for this cache entry
    cached_data = Column(JSON)  # The actual data payload
    
    # Cache Metadata
    cache_timestamp = Column(DateTime(timezone=True), server_default=func.now())
    expiry_timestamp = Column(DateTime(timezone=True))
    data_version = Column(String(50), default="1.0")
    
    # Performance Metrics
    query_duration_ms = Column(Float)
    data_size_bytes = Column(Integer)
    
    # Relationships
    widget = relationship("DashboardWidget", back_populates="data_cache")
    
    # Indexes
    __table_args__ = (
        Index('ix_cache_widget_key', 'widget_id', 'data_key'),
        Index('ix_cache_expiry', 'expiry_timestamp'),
    )

class AnalyticsReport(Base):
    __tablename__ = "analytics_reports"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    report_type = Column(Enum(ReportType), nullable=False)
    organization_id = Column(Integer, ForeignKey("organizations.id"))
    
    # Report Configuration
    report_config = Column(JSON)  # Parameters, filters, date ranges
    template_config = Column(JSON)  # Report layout and styling
    
    # Scheduling
    is_scheduled = Column(Boolean, default=False)
    schedule_config = Column(JSON)  # Cron expression, recipients, delivery settings
    
    # Generation Settings
    auto_generate = Column(Boolean, default=False)
    last_generated = Column(DateTime(timezone=True))
    generation_status = Column(String(50), default="pending")
    
    # Access Control
    created_by = Column(Integer, ForeignKey("users.id"))
    allowed_viewers = Column(JSON)  # User/role permissions
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Indexes
    __table_args__ = (
        Index('ix_reports_org_type', 'organization_id', 'report_type'),
        Index('ix_reports_scheduled', 'is_scheduled'),
    )

class ReportExecution(Base):
    __tablename__ = "report_executions"
    
    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("analytics_reports.id"), nullable=False)
    
    # Execution Details
    execution_status = Column(String(50), default="running")  # running, completed, failed, cancelled
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True))
    
    # Report Data
    report_data = Column(JSON)  # Generated report content
    file_path = Column(String(500))  # Path to generated file (PDF, HTML, etc.)
    
    # Performance Metrics
    execution_duration_seconds = Column(Integer)
    records_processed = Column(Integer)
    data_sources_used = Column(JSON)
    
    # Error Information
    error_message = Column(Text)
    error_details = Column(JSON)
    
    # Relationships
    report = relationship("AnalyticsReport")
    
    # Indexes
    __table_args__ = (
        Index('ix_executions_report', 'report_id'),
        Index('ix_executions_status', 'execution_status'),
        Index('ix_executions_started', 'started_at'),
    )

class KPIMetric(Base):
    __tablename__ = "kpi_metrics"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    organization_id = Column(Integer, ForeignKey("organizations.id"))
    
    # Metric Configuration
    metric_type = Column(String(100))  # revenue, churn, conversion, etc.
    calculation_method = Column(String(100))  # sum, average, percentage, etc.
    data_source = Column(String(100))  # AI model or data source
    
    # Metric Parameters
    metric_parameters = Column(JSON)  # Thresholds, targets, calculation params
    target_value = Column(Float)
    warning_threshold = Column(Float)
    critical_threshold = Column(Float)
    
    # Time Settings
    time_window_days = Column(Integer, default=30)  # Rolling window
    refresh_interval_minutes = Column(Integer, default=60)
    
    # Alerting
    enable_alerts = Column(Boolean, default=True)
    alert_config = Column(JSON)
    
    # Metadata
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Indexes
    __table_args__ = (
        Index('ix_kpis_org', 'organization_id'),
        Index('ix_kpis_type', 'metric_type'),
    )

class MetricValue(Base):
    __tablename__ = "metric_values"
    
    id = Column(Integer, primary_key=True, index=True)
    kpi_id = Column(Integer, ForeignKey("kpi_metrics.id"), nullable=False)
    
    # Value Data
    metric_value = Column(Float)
    metric_timestamp = Column(DateTime(timezone=True), server_default=func.now())
    
    # Context Data
    dimension_values = Column(JSON)  # Breaking down by customer segments, regions, etc.
    calculation_details = Column(JSON)  # How the value was calculated
    
    # Relationships
    kpi = relationship("KPIMetric")
    
    # Indexes
    __table_args__ = (
        Index('ix_metric_values_kpi', 'kpi_id'),
        Index('ix_metric_values_timestamp', 'metric_timestamp'),
    )

class PredictiveAlert(Base):
    __tablename__ = "predictive_alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"))
    
    # Alert Details
    alert_type = Column(String(100))  # churn_risk, pricing_opportunity, forecast_deviation, etc.
    title = Column(String(255), nullable=False)
    description = Column(Text)
    priority = Column(Enum(AlertPriority), nullable=False)
    
    # Alert Data
    alert_data = Column(JSON)  # Specific alert details and predictions
    confidence_score = Column(Float)  # AI confidence in the prediction
    impact_score = Column(Float)  # Estimated business impact
    
    # Resolution Tracking
    status = Column(String(50), default="active")  # active, acknowledged, resolved, dismissed
    assigned_to = Column(Integer, ForeignKey("users.id"))
    
    # Timeline
    predicted_occurrence = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    acknowledged_at = Column(DateTime(timezone=True))
    resolved_at = Column(DateTime(timezone=True))
    
    # Relationships
    acknowledged_by = relationship("User", foreign_keys=[assigned_to])
    
    # Indexes
    __table_args__ = (
        Index('ix_alerts_org_status', 'organization_id', 'status'),
        Index('ix_alerts_priority', 'priority'),
        Index('ix_alerts_created', 'created_at'),
        Index('ix_alerts_predicted', 'predicted_occurrence'),
    )

class DataSource(Base):
    __tablename__ = "data_sources"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    source_type = Column(String(100))  # ai_forecasting, churn_prediction, etc.
    
    # Connection Details
    connection_config = Column(JSON)  # API endpoints, credentials, parameters
    is_active = Column(Boolean, default=True)
    
    # Performance Settings
    cache_ttl_seconds = Column(Integer, default=300)
    rate_limit_per_minute = Column(Integer, default=100)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_accessed = Column(DateTime(timezone=True))
    access_count = Column(Integer, default=0)
    
    # Indexes
    __table_args__ = (
        Index('ix_data_sources_type', 'source_type'),
        Index('ix_data_sources_active', 'is_active'),
    )

class VisualizationConfig(Base):
    __tablename__ = "visualization_configs"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    visualization_type = Column(Enum(VisualizationType), nullable=False)
    
    # Configuration
    chart_config = Column(JSON)  # Chart.js or similar library config
    color_scheme = Column(String(100), default="default")
    theme_config = Column(JSON)  # Dark/light mode, fonts, etc.
    
    # Interactive Features
    enable_tooltips = Column(Boolean, default=True)
    enable_zoom = Column(Boolean, default=False)
    enable_pan = Column(Boolean, default=False)
    enable_selection = Column(Boolean, default=True)
    
    # Accessibility
    accessible = Column(Boolean, default=True)
    alt_text = Column(String(255))
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Indexes
    __table_args__ = (
        Index('ix_viz_configs_type', 'visualization_type'),
    )

class UserDashboardPreference(Base):
    __tablename__ = "user_dashboard_preferences"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Preference Settings
    default_dashboard_id = Column(Integer, ForeignKey("dashboards.id"))
    preferred_theme = Column(String(50), default="light")
    preferred_timezone = Column(String(50), default="UTC")
    
    # Notification Preferences
    email_alerts = Column(Boolean, default=True)
    push_alerts = Column(Boolean, default=True)
    alert_frequency = Column(String(50), default="immediate")
    
    # Dashboard Layout
    grid_size = Column(String(20), default="medium")  # small, medium, large
    widget_density = Column(String(20), default="comfortable")  # compact, comfortable, spacious
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Indexes
    __table_args__ = (
        Index('ix_user_prefs_user', 'user_id'),
    )