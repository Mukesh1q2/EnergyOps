"""
Dashboard Models
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

class DashboardStatus(PyEnum):
    ACTIVE = "active"
    DRAFT = "draft"
    ARCHIVED = "archived"
    SHARED = "shared"

class DashboardPermission(PyEnum):
    VIEWER = "viewer"
    EDITOR = "editor"
    ADMIN = "admin"
    OWNER = "owner"

class WidgetType(PyEnum):
    # Charts
    LINE_CHART = "line_chart"
    BAR_CHART = "bar_chart"
    PIE_CHART = "pie_chart"
    AREA_CHART = "area_chart"
    SCATTER_CHART = "scatter_chart"
    
    # Time Series
    TIME_SERIES = "time_series"
    MULTI_AXIS_CHART = "multi_axis_chart"
    
    # Knowledge Graphs
    KNOWLEDGE_GRAPH = "knowledge_graph"
    NETWORK_GRAPH = "network_graph"
    SANKEY_DIAGRAM = "sankey_diagram"
    
    # Maps & Geospatial
    GEOSPATIAL_MAP = "geospatial_map"
    HEATMAP = "heatmap"
    CHOROPLETH_MAP = "choropleth_map"
    
    # Data Display
    KPI_CARD = "kpi_card"
    DATA_TABLE = "data_table"
    METRIC_CARD = "metric_card"
    
    # Planning & Scheduling
    GANTT_CHART = "gantt_chart"
    CALENDAR = "calendar"
    
    # Collaboration
    COLLABORATION_PANEL = "collaboration_panel"
    COMMENT_THREAD = "comment_thread"
    ACTIVITY_FEED = "activity_feed"

class Dashboard(Base):
    __tablename__ = "dashboards"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    description = Column(Text)
    status = Column(Enum(DashboardStatus), default=DashboardStatus.ACTIVE)
    
    # Ownership
    owner_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    organization_id = Column(String(36), ForeignKey("organizations.id"), nullable=True)
    
    # Configuration
    settings = Column(JSON, default={})
    theme = Column(String(50), default="default")
    refresh_interval = Column(Integer, default=300)  # seconds
    
    # Permissions
    is_public = Column(Boolean, default=False)
    is_template = Column(Boolean, default=False)
    allow_comments = Column(Boolean, default=True)
    allow_collaboration = Column(Boolean, default=True)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_accessed = Column(DateTime(timezone=True))
    access_count = Column(Integer, default=0)
    
    # Relationships
    owner = relationship("User", foreign_keys=[owner_id], back_populates="owned_dashboards")
    organization = relationship("Organization", back_populates="dashboards")
    widgets = relationship("DashboardWidget", back_populates="dashboard", cascade="all, delete-orphan")
    permissions = relationship("DashboardPermission", back_populates="dashboard", cascade="all, delete-orphan")
    shares = relationship("DashboardShare", back_populates="dashboard", cascade="all, delete-orphan")
    changes = relationship("DashboardChange", back_populates="dashboard", cascade="all, delete-orphan")
    
    __table_args__ = (
        Index('idx_dashboard_owner', 'owner_id'),
        Index('idx_dashboard_org', 'organization_id'),
        Index('idx_dashboard_status', 'status'),
        Index('idx_dashboard_access', 'last_accessed'),
    )

class DashboardTemplate(Base):
    __tablename__ = "dashboard_templates"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    description = Column(Text)
    category = Column(String(100))  # analytics, monitoring, trading, etc.
    preview_image = Column(String(500))  # URL to preview image
    
    # Template data (layout, widgets, settings)
    template_data = Column(JSON, nullable=False)
    
    # Metadata
    created_by = Column(String(36), ForeignKey("users.id"))
    is_public = Column(Boolean, default=False)
    usage_count = Column(Integer, default=0)
    rating = Column(Float, default=0.0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    creator = relationship("User", back_populates="dashboard_templates")

class DashboardWidget(Base):
    __tablename__ = "dashboard_widgets"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    dashboard_id = Column(String(36), ForeignKey("dashboards.id"), nullable=False)
    
    # Widget identification
    title = Column(String(255), nullable=False)
    widget_type = Column(Enum(WidgetType), nullable=False)
    
    # Layout and positioning
    x = Column(Integer, nullable=False, default=0)
    y = Column(Integer, nullable=False, default=0)
    width = Column(Integer, nullable=False, default=6)
    height = Column(Integer, nullable=False, default=4)
    z_index = Column(Integer, default=0)
    
    # Configuration
    configuration = Column(JSON, default={})  # widget-specific settings
    data_source = Column(JSON, default={})   # data source configuration
    
    # State
    is_visible = Column(Boolean, default=True)
    is_locked = Column(Boolean, default=False)
    is_minimized = Column(Boolean, default=False)
    
    # Performance
    refresh_interval = Column(Integer, default=300)  # seconds
    last_refreshed = Column(DateTime(timezone=True))
    cache_ttl = Column(Integer, default=60)  # seconds
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    dashboard = relationship("Dashboard", back_populates="widgets")
    data_sources = relationship("WidgetDataSource", back_populates="widget", cascade="all, delete-orphan")
    visualizations = relationship("WidgetVisualization", back_populates="widget", cascade="all, delete-orphan")
    collaboration = relationship("WidgetCollaboration", back_populates="widget", cascade="all, delete-orphan")
    
    __table_args__ = (
        Index('idx_widget_dashboard', 'dashboard_id'),
        Index('idx_widget_type', 'widget_type'),
        Index('idx_widget_position', 'dashboard_id', 'x', 'y'),
    )

class DashboardPermission(Base):
    __tablename__ = "dashboard_permissions"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    dashboard_id = Column(String(36), ForeignKey("dashboards.id"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    permission = Column(Enum(DashboardPermission), nullable=False)
    
    # Granular permissions
    can_view = Column(Boolean, default=True)
    can_edit = Column(Boolean, default=False)
    can_delete = Column(Boolean, default=False)
    can_share = Column(Boolean, default=False)
    can_manage_users = Column(Boolean, default=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    dashboard = relationship("Dashboard", back_populates="permissions")
    user = relationship("User", back_populates="dashboard_permissions")
    
    __table_args__ = (
        UniqueConstraint('dashboard_id', 'user_id', name='unique_user_dashboard_permission'),
        Index('idx_permission_user', 'user_id'),
    )

class DashboardShare(Base):
    __tablename__ = "dashboard_shares"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    dashboard_id = Column(String(36), ForeignKey("dashboards.id"), nullable=False)
    
    # Share configuration
    share_type = Column(String(20), nullable=False)  # 'public', 'link', 'email'
    token = Column(String(100), unique=True, nullable=True)
    
    # Access control
    requires_authentication = Column(Boolean, default=True)
    allowed_domains = Column(JSON, default=[])  # list of allowed email domains
    expires_at = Column(DateTime(timezone=True))
    
    # Settings
    allow_comments = Column(Boolean, default=False)
    allow_editing = Column(Boolean, default=False)
    
    # Metadata
    created_by = Column(String(36), ForeignKey("users.id"))
    access_count = Column(Integer, default=0)
    last_accessed = Column(DateTime(timezone=True))
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    dashboard = relationship("Dashboard", back_populates="shares")
    creator = relationship("User", back_populates="dashboard_shares")

class WidgetLayout(Base):
    __tablename__ = "widget_layouts"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    dashboard_id = Column(String(36), ForeignKey("dashboards.id"), nullable=False)
    
    # Layout data (grid positions, sizes, etc.)
    layout_data = Column(JSON, nullable=False)  # { widget_id: { x, y, w, h } }
    layout_version = Column(Integer, default=1)
    
    # Metadata
    created_by = Column(String(36), ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class WidgetConfiguration(Base):
    __tablename__ = "widget_configurations"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    widget_id = Column(String(36), ForeignKey("dashboard_widgets.id"), nullable=False)
    
    # Configuration sections
    display_config = Column(JSON, default={})    # title, colors, etc.
    data_config = Column(JSON, default={})       # data source, filters, etc.
    interaction_config = Column(JSON, default={}) # click handlers, etc.
    alert_config = Column(JSON, default={})      # alerts, thresholds
    
    # Versioning
    version = Column(Integer, default=1)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

# Association tables for many-to-many relationships
dashboard_tags = Table(
    'dashboard_tags',
    Base.metadata,
    Column('dashboard_id', String(36), ForeignKey('dashboards.id')),
    Column('tag_id', String(36), ForeignKey('tags.id')),
    Index('idx_dashboard_tag', 'dashboard_id', 'tag_id')
)

widget_dependencies = Table(
    'widget_dependencies',
    Base.metadata,
    Column('widget_id', String(36), ForeignKey('dashboard_widgets.id')),
    Column('depends_on_widget_id', String(36), ForeignKey('dashboard_widgets.id')),
    Index('idx_widget_dep', 'widget_id', 'depends_on_widget_id')
)