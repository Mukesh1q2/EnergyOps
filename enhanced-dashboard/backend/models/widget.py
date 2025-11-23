"""
Widget Models
Phase 3: Enhanced Dashboard & Enterprise Features
"""

from sqlalchemy import (
    Column, Integer, String, Text, DateTime, Boolean, JSON, 
    ForeignKey, Enum, Float, Table, UniqueConstraint, Index
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from enum import Enum as PyEnum
import uuid

Base = declarative_base()

class DataSourceType(PyEnum):
    API = "api"
    DATABASE = "database"
    FILE = "file"
    WEBSOCKET = "websocket"
    CACHE = "cache"
    CALCULATED = "calculated"
    REAL_TIME = "real_time"

class AlertCondition(PyEnum):
    GREATER_THAN = "gt"
    LESS_THAN = "lt"
    EQUALS = "eq"
    NOT_EQUALS = "ne"
    CHANGES = "changes"
    NO_DATA = "no_data"

class AlertSeverity(PyEnum):
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"

class WidgetDataSource(Base):
    __tablename__ = "widget_data_sources"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    widget_id = Column(String(36), ForeignKey("dashboard_widgets.id"), nullable=False)
    
    # Source identification
    name = Column(String(255), nullable=False)
    source_type = Column(Enum(DataSourceType), nullable=False)
    
    # Connection details
    connection_config = Column(JSON, default={})  # API endpoints, DB connection, etc.
    query_config = Column(JSON, default={})       # SQL, API params, filters
    
    # Data transformation
    data_transform = Column(JSON, default={})     # filters, aggregations, calculations
    schema_mapping = Column(JSON, default={})     # column mappings, data types
    
    # Performance settings
    refresh_interval = Column(Integer, default=300)  # seconds
    cache_enabled = Column(Boolean, default=True)
    cache_ttl = Column(Integer, default=300)         # seconds
    batch_size = Column(Integer, default=1000)
    
    # State
    is_active = Column(Boolean, default=True)
    last_fetched = Column(DateTime(timezone=True))
    error_count = Column(Integer, default=0)
    last_error = Column(Text)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    widget = relationship("DashboardWidget", back_populates="data_sources")
    cache_data = relationship("WidgetDataCache", back_populates="data_source", cascade="all, delete-orphan")
    
    __table_args__ = (
        Index('idx_data_source_widget', 'widget_id'),
        Index('idx_data_source_type', 'source_type'),
        Index('idx_data_source_active', 'is_active'),
    )

class WidgetDataCache(Base):
    __tablename__ = "widget_data_cache"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    data_source_id = Column(String(36), ForeignKey("widget_data_sources.id"), nullable=False)
    
    # Cache data
    cache_key = Column(String(255), nullable=False)
    cached_data = Column(JSON, nullable=False)
    data_schema = Column(JSON, default={})
    
    # Performance metrics
    fetch_time_ms = Column(Integer)
    data_size_bytes = Column(Integer)
    record_count = Column(Integer)
    
    # Cache metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=False)
    
    # Relationships
    data_source = relationship("WidgetDataSource", back_populates="cache_data")
    
    __table_args__ = (
        UniqueConstraint('data_source_id', 'cache_key', name='unique_data_source_cache'),
        Index('idx_cache_key', 'cache_key'),
        Index('idx_cache_expires', 'expires_at'),
    )

class WidgetVisualization(Base):
    __tablename__ = "widget_visualizations"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    widget_id = Column(String(36), ForeignKey("dashboard_widgets.id"), nullable=False)
    
    # Visualization configuration
    chart_type = Column(String(50), nullable=False)
    color_scheme = Column(String(50), default="default")
    theme_override = Column(JSON, default={})  # custom theme settings
    
    # Chart-specific settings
    chart_config = Column(JSON, default={})   # axis, legend, tooltip settings
    animation_config = Column(JSON, default={})  # transitions, easing
    interaction_config = Column(JSON, default={}) # zoom, pan, click handlers
    
    # Data mapping
    x_axis_config = Column(JSON, default={})
    y_axis_config = Column(JSON, default={})
    series_config = Column(JSON, default={})  # multiple series for charts
    
    # Advanced features
    annotations = Column(JSON, default=[])  # chart annotations, markers
    filters = Column(JSON, default={})      # dynamic filtering options
    drilldown_config = Column(JSON, default={})  # drill-down capabilities
    
    # Performance
    enable_caching = Column(Boolean, default=True)
    max_data_points = Column(Integer, default=10000)
    sampling_enabled = Column(Boolean, default=False)
    sampling_interval = Column(Integer, default=1)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    widget = relationship("DashboardWidget", back_populates="visualizations")
    
    __table_args__ = (
        Index('idx_visualization_widget', 'widget_id'),
        Index('idx_visualization_chart_type', 'chart_type'),
    )

class WidgetAlert(Base):
    __tablename__ = "widget_alerts"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    widget_id = Column(String(36), ForeignKey("dashboard_widgets.id"), nullable=False)
    
    # Alert identification
    name = Column(String(255), nullable=False)
    description = Column(Text)
    
    # Alert conditions
    condition_type = Column(Enum(AlertCondition), nullable=False)
    threshold_value = Column(Float)
    threshold_field = Column(String(100))  # which field to monitor
    
    # Data configuration
    data_source_id = Column(String(36), ForeignKey("widget_data_sources.id"), nullable=True)
    aggregation_config = Column(JSON, default={})  # time window, aggregation function
    
    # Alert configuration
    severity = Column(Enum(AlertSeverity), default=AlertSeverity.WARNING)
    enabled = Column(Boolean, default=True)
    
    # Notification settings
    notification_channels = Column(JSON, default=[])  # email, webhook, sms, etc.
    notification_config = Column(JSON, default={})
    
    # Alert state
    last_triggered = Column(DateTime(timezone=True))
    trigger_count = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    
    # Alert history
    alert_history = Column(JSON, default=[])  # recent alert instances
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    data_source = relationship("WidgetDataSource")
    
    __table_args__ = (
        Index('idx_alert_widget', 'widget_id'),
        Index('idx_alert_severity', 'severity'),
        Index('idx_alert_active', 'is_active'),
        Index('idx_alert_data_source', 'data_source_id'),
    )

class WidgetCollaboration(Base):
    __tablename__ = "widget_collaboration"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    widget_id = Column(String(36), ForeignKey("dashboard_widgets.id"), nullable=False)
    
    # Collaboration features
    enable_comments = Column(Boolean, default=True)
    enable_annotations = Column(Boolean, default=True)
    enable_sharing = Column(Boolean, default=False)
    
    # Real-time collaboration
    enable_live_editing = Column(Boolean, default=False)
    conflict_resolution = Column(String(20), default="last_writer_wins")
    
    # Permission settings
    comment_permissions = Column(JSON, default={})  # who can comment
    annotation_permissions = Column(JSON, default={})  # who can annotate
    
    # Collaboration history
    comment_count = Column(Integer, default=0)
    annotation_count = Column(Integer, default=0)
    last_comment_at = Column(DateTime(timezone=True))
    last_annotation_at = Column(DateTime(timezone=True))
    
    # Active sessions
    active_comment_sessions = Column(Integer, default=0)
    active_annotation_sessions = Column(Integer, default=0)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    widget = relationship("DashboardWidget", back_populates="collaboration")
    comments = relationship("Comment", back_populates="widget", cascade="all, delete-orphan")
    
    __table_args__ = (
        Index('idx_collaboration_widget', 'widget_id'),
        Index('idx_collaboration_active', 'enable_comments'),
    )

# Widget-specific configuration tables
widget_time_series_config = Table(
    'widget_time_series_config',
    Base.metadata,
    Column('widget_id', String(36), ForeignKey('dashboard_widgets.id'), primary_key=True),
    Column('time_field', String(100), nullable=False),
    Column('value_fields', JSON, default=[]),
    Column('time_range', String(20), default="1h"),
    Column('aggregation', String(20), default="avg"),
    Column('timezone', String(50), default="UTC"),
    Column('interpolation', String(20), default="linear"),
    Index('idx_timeseries_widget', 'widget_id')
)

widget_knowledge_graph_config = Table(
    'widget_knowledge_graph_config',
    Base.metadata,
    Column('widget_id', String(36), ForeignKey('dashboard_widgets.id'), primary_key=True),
    Column('node_field', String(100), nullable=False),
    Column('edge_field', String(100), nullable=False),
    Column('weight_field', String(100)),
    Column('color_field', String(100)),
    Column('size_field', String(100)),
    Column('layout_algorithm', String(20), default="force-directed"),
    Column('min_node_size', Integer, default=5),
    Column('max_node_size', Integer, default=50),
    Column('link_distance', Integer, default=100),
    Column('link_strength', Float, default=0.1),
    Index('idx_knowledge_graph_widget', 'widget_id')
)

widget_geospatial_config = Table(
    'widget_geospatial_config',
    Base.metadata,
    Column('widget_id', String(36), ForeignKey('dashboard_widgets.id'), primary_key=True),
    Column('latitude_field', String(100), nullable=False),
    Column('longitude_field', String(100), nullable=False),
    Column('marker_field', String(100)),
    Column('clustering_enabled', Boolean, default=False),
    Column('map_type', String(20), default="roadmap"),
    Column('zoom_level', Integer, default=8),
    Column('center_lat', Float, default=20.5937),  # India center
    Column('center_lng', Float, default=78.9629),
    Column('heat_enabled', Boolean, default=False),
    Column('choropleth_field', String(100)),
    Column('state_field', String(100)),
    Index('idx_geospatial_widget', 'widget_id')
)

# Performance optimization tables
widget_performance_metrics = Table(
    'widget_performance_metrics',
    Base.metadata,
    Column('id', String(36), primary_key=True, default=lambda: str(uuid.uuid4())),
    Column('widget_id', String(36), ForeignKey('dashboard_widgets.id'), nullable=False),
    Column('metric_name', String(100), nullable=False),
    Column('metric_value', Float, nullable=False),
    Column('timestamp', DateTime(timezone=True), server_default=func.now()),
    Column('additional_data', JSON, default={}),
    Index('idx_perf_widget', 'widget_id'),
    Index('idx_perf_metric', 'metric_name'),
    Index('idx_perf_timestamp', 'timestamp')
)