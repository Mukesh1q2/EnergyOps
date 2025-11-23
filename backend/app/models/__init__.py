"""
OptiBid Energy Platform - SQLAlchemy Models
Database ORM models for all entities
"""

from datetime import datetime
from typing import Optional, List
from uuid import UUID, uuid4
from sqlalchemy import (
    Column, String, Boolean, DateTime, Integer, Float, 
    DECIMAL, Text, JSON, ForeignKey, Index, UniqueConstraint,
    CHAR, VARCHAR
)
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, Session
from sqlalchemy.sql import func
from geoalchemy2 import Geography

from app.core.database import Base

# ===============================================
# ENUMS AND CONSTANTS
# ===============================================

# User enums
USER_STATUS_ENUM = ['active', 'inactive', 'suspended', 'pending_verification']
ROLE_TYPE_ENUM = ['admin', 'analyst', 'trader', 'viewer', 'customer_success']

# Organization enums  
ORGANIZATION_STATUS_ENUM = ['active', 'inactive', 'suspended', 'trial']

# Asset enums
ASSET_STATUS_ENUM = ['online', 'offline', 'maintenance', 'fault']
ASSET_TYPE_ENUM = ['solar', 'wind', 'thermal', 'hydro', 'nuclear', 'load', 'storage', 'battery']

# Bid enums
BID_STATUS_ENUM = ['draft', 'pending', 'submitted', 'accepted', 'rejected', 'expired', 'cancelled']
OFFER_TYPE_ENUM = ['buy', 'sell']
MARKET_TYPE_ENUM = ['day_ahead', 'real_time', 'ancillary_services', 'capacity', 'renewable_energy']

# Dashboard enums
DASHBOARD_TYPE_ENUM = ['trading', 'analytics', 'portfolio', 'compliance', 'custom']
WIDGET_TYPE_ENUM = ['chart', 'table', 'gauge', 'map', 'kpi', 'alert']

# ML model enums
ML_MODEL_STATUS_ENUM = ['training', 'ready', 'deployed', 'failed', 'deprecated']
ML_MODEL_TYPE_ENUM = ['forecasting', 'optimization', 'anomaly_detection', 'classification']

# Audit enums
AUDIT_ACTION_ENUM = ['create', 'read', 'update', 'delete', 'login', 'logout', 'export', 'import']

# ===============================================
# BASE MODEL
# ===============================================

class BaseModel(Base):
    """Base model with common fields"""
    __abstract__ = True
    
    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

# ===============================================
# ORGANIZATION MODELS
# ===============================================

class Organization(BaseModel):
    """Organization model"""
    __tablename__ = "organizations"
    
    name = Column(String(255), nullable=False, index=True)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    status = Column(CHAR(20), nullable=False, default='trial', index=True)
    subscription_tier = Column(String(50), default='trial', index=True)
    subscription_expires_at = Column(DateTime(timezone=True))
    meta_data = Column(JSONB, default={})
    
    # Relationships
    users = relationship("User", back_populates="organization", cascade="all, delete-orphan")
    sites = relationship("Site", back_populates="organization", cascade="all, delete-orphan")
    assets = relationship("Asset", back_populates="organization", cascade="all, delete-orphan")
    bids = relationship("Bid", back_populates="organization", cascade="all, delete-orphan")
    datasets = relationship("Dataset", back_populates="organization", cascade="all, delete-orphan")
    dashboards = relationship("Dashboard", back_populates="organization", cascade="all, delete-orphan")
    ml_models = relationship("MLModel", back_populates="organization", cascade="all, delete-orphan")
    compliance_rules = relationship("ComplianceRule", back_populates="organization", cascade="all, delete-orphan")
    legal_audit_trails = relationship("LegalAuditTrail", back_populates="organization", cascade="all, delete-orphan")
    usage_metrics = relationship("UsageMetric", back_populates="organization", cascade="all, delete-orphan")

# ===============================================
# USER MODELS
# ===============================================

class User(BaseModel):
    """User model"""
    __tablename__ = "users"
    
    organization_id = Column(PGUUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    role = Column(CHAR(20), nullable=False, default='viewer', index=True)
    status = Column(CHAR(20), nullable=False, default='pending_verification', index=True)
    email_verified = Column(Boolean, default=False, index=True)
    last_login_at = Column(DateTime(timezone=True))
    login_count = Column(Integer, default=0)
    deleted_at = Column(DateTime(timezone=True))
    
    # Relationships
    organization = relationship("Organization", back_populates="users")
    sessions = relationship("UserSession", back_populates="user", cascade="all, delete-orphan")
    created_dashboards = relationship("Dashboard", foreign_keys="Dashboard.created_by", back_populates="creator")
    created_ml_models = relationship("MLModel", foreign_keys="MLModel.created_by", back_populates="creator")
    created_compliance_rules = relationship("ComplianceRule", foreign_keys="ComplianceRule.created_by", back_populates="creator")

class UserSession(BaseModel):
    """User session model for JWT refresh tokens"""
    __tablename__ = "user_sessions"
    
    user_id = Column(PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    session_token = Column(String(255), nullable=False, index=True)
    refresh_token = Column(String(255), nullable=False, index=True)
    expires_at = Column(DateTime(timezone=True), nullable=False, index=True)
    last_used_at = Column(DateTime(timezone=True), server_default=func.now())
    ip_address = Column(CHAR(39))  # IPv6 support
    user_agent = Column(Text)
    
    # Relationships
    user = relationship("User", back_populates="sessions")

# ===============================================
# MARKET OPERATOR MODELS
# ===============================================

class MarketOperator(BaseModel):
    """Market operator model (PX, ISO, etc.)"""
    __tablename__ = "market_operators"
    
    name = Column(String(255), nullable=False)
    code = Column(String(20), unique=True, nullable=False, index=True)
    region = Column(String(100), nullable=False, index=True)
    country = Column(String(100), nullable=False, index=True)
    timezone = Column(String(50), nullable=False)
    contact_email = Column(String(255))
    api_endpoint = Column(Text)
    sla_status = Column(String(50), default='active', index=True)
    
    # Relationships
    bid_zones = relationship("BidZone", back_populates="market_operator", cascade="all, delete-orphan")
    bids = relationship("Bid", back_populates="market_operator")
    market_prices = relationship("MarketPrice", back_populates="market_operator")
    market_clearing = relationship("MarketClearing", back_populates="market_operator")

class BidZone(BaseModel):
    """Bid zone model"""
    __tablename__ = "bid_zones"
    
    market_operator_id = Column(PGUUID(as_uuid=True), ForeignKey("market_operators.id"), nullable=False, index=True)
    zone_code = Column(String(20), nullable=False)
    zone_name = Column(String(255), nullable=False)
    
    # Relationships
    market_operator = relationship("MarketOperator", back_populates="bid_zones")
    asset_bid_zones = relationship("AssetBidZone", back_populates="bid_zone", cascade="all, delete-orphan")
    bids = relationship("Bid", back_populates="bid_zone")
    market_prices = relationship("MarketPrice", back_populates="bid_zone")
    market_clearing = relationship("MarketClearing", back_populates="bid_zone")

# ===============================================
# SITE AND ASSET MODELS
# ===============================================

class Site(BaseModel):
    """Site/location model"""
    __tablename__ = "sites"
    
    organization_id = Column(PGUUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    location = Column(Geography('POINT', srid=4326))  # PostGIS point geometry
    address = Column(Text)
    city = Column(String(100))
    state = Column(String(100))
    country = Column(String(100), nullable=False, index=True)
    timezone = Column(String(50), nullable=False, index=True)
    
    # Relationships
    organization = relationship("Organization", back_populates="sites")
    assets = relationship("Asset", back_populates="site", cascade="all, delete-orphan")

class Asset(BaseModel):
    """Energy asset model (generators, loads, storage)"""
    __tablename__ = "assets"
    
    organization_id = Column(PGUUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False, index=True)
    site_id = Column(PGUUID(as_uuid=True), ForeignKey("sites.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False, index=True)
    asset_type = Column(String(50), nullable=False, index=True)
    capacity_mw = Column(DECIMAL(10, 3), nullable=False)
    status = Column(CHAR(20), nullable=False, default='offline', index=True)
    commissioning_date = Column(DateTime(timezone=True))
    decommissioning_date = Column(DateTime(timezone=True))
    meta_data = Column(JSONB, default={})
    
    # Relationships
    organization = relationship("Organization", back_populates="assets")
    site = relationship("Site", back_populates="assets")
    asset_bid_zones = relationship("AssetBidZone", back_populates="asset", cascade="all, delete-orphan")
    bids = relationship("Bid", back_populates="asset")
    meter_data = relationship("AssetMeter", back_populates="asset")

class AssetBidZone(BaseModel):
    """Asset to bid zone mapping"""
    __tablename__ = "asset_bid_zones"
    
    asset_id = Column(PGUUID(as_uuid=True), ForeignKey("assets.id"), nullable=False, index=True)
    bid_zone_id = Column(PGUUID(as_uuid=True), ForeignKey("bid_zones.id"), nullable=False, index=True)
    capacity_share = Column(DECIMAL(5, 4), default=1.0000)
    
    # Relationships
    asset = relationship("Asset", back_populates="asset_bid_zones")
    bid_zone = relationship("BidZone", back_populates="asset_bid_zones")
    
    # Constraints
    __table_args__ = (
        UniqueConstraint('asset_id', 'bid_zone_id', name='uq_asset_bid_zone'),
    )

# ===============================================
# BIDDING MODELS
# ===============================================

class Bid(BaseModel):
    """Energy bid model"""
    __tablename__ = "bids"
    
    organization_id = Column(PGUUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False, index=True)
    market_operator_id = Column(PGUUID(as_uuid=True), ForeignKey("market_operators.id"), nullable=False, index=True)
    bid_zone_id = Column(PGUUID(as_uuid=True), ForeignKey("bid_zones.id"), nullable=False, index=True)
    asset_id = Column(PGUUID(as_uuid=True), ForeignKey("assets.id"))
    bid_number = Column(String(100), index=True)
    status = Column(CHAR(20), nullable=False, default='draft', index=True)
    offer_type = Column(CHAR(4), nullable=False)  # 'buy' or 'sell'
    market_type = Column(CHAR(20), nullable=False, index=True)
    delivery_start = Column(DateTime(timezone=True), nullable=False, index=True)
    delivery_end = Column(DateTime(timezone=True), nullable=False, index=True)
    quantity_mw = Column(DECIMAL(10, 3), nullable=False)
    price_rupees = Column(DECIMAL(10, 4))
    currency = Column(CHAR(3), default='INR')
    submitted_at = Column(DateTime(timezone=True))
    response_at = Column(DateTime(timezone=True))
    notes = Column(Text)
    meta_data = Column(JSONB, default={})
    
    # Relationships
    organization = relationship("Organization", back_populates="bids")
    market_operator = relationship("MarketOperator", back_populates="bids")
    bid_zone = relationship("BidZone", back_populates="bids")
    asset = relationship("Asset", back_populates="bids")

# ===============================================
# MARKET DATA MODELS
# ===============================================

class MarketPrice(BaseModel):
    """Market price time-series data"""
    __tablename__ = "market_prices"
    
    time = Column(DateTime(timezone=True), nullable=False, index=True)
    market_operator_id = Column(PGUUID(as_uuid=True), ForeignKey("market_operators.id"), nullable=False, index=True)
    bid_zone_id = Column(PGUUID(as_uuid=True), ForeignKey("bid_zones.id"), nullable=False, index=True)
    market_type = Column(CHAR(20), nullable=False, index=True)
    price_rupees = Column(DECIMAL(10, 4))
    volume_mwh = Column(DECIMAL(10, 3))
    currency = Column(CHAR(3), default='INR')
    
    # Relationships
    market_operator = relationship("MarketOperator", back_populates="market_prices")
    bid_zone = relationship("BidZone", back_populates="market_prices")
    
    # Constraints
    __table_args__ = (
        UniqueConstraint('time', 'market_operator_id', 'bid_zone_id', 'market_type', name='uq_market_price'),
    )

class MarketClearing(BaseModel):
    """Market clearing results"""
    __tablename__ = "market_clearing"
    
    time = Column(DateTime(timezone=True), nullable=False, index=True)
    market_operator_id = Column(PGUUID(as_uuid=True), ForeignKey("market_operators.id"), nullable=False, index=True)
    bid_zone_id = Column(PGUUID(as_uuid=True), ForeignKey("bid_zones.id"), nullable=False, index=True)
    market_type = Column(CHAR(20), nullable=False, index=True)
    clearing_price_rupees = Column(DECIMAL(10, 4))
    clearing_volume_mwh = Column(DECIMAL(10, 3))
    currency = Column(CHAR(3), default='INR')
    
    # Relationships
    market_operator = relationship("MarketOperator", back_populates="market_clearing")
    bid_zone = relationship("BidZone", back_populates="market_clearing")
    
    # Constraints
    __table_args__ = (
        UniqueConstraint('time', 'market_operator_id', 'bid_zone_id', 'market_type', name='uq_market_clearing'),
    )

class AssetMeter(BaseModel):
    """Asset meter data (real-time)"""
    __tablename__ = "asset_meters"
    
    time = Column(DateTime(timezone=True), nullable=False, index=True)
    asset_id = Column(PGUUID(as_uuid=True), ForeignKey("assets.id"), nullable=False, index=True)
    active_power_mw = Column(DECIMAL(10, 3))
    reactive_power_mvar = Column(DECIMAL(10, 3))
    voltage_kv = Column(DECIMAL(8, 3))
    frequency_hz = Column(DECIMAL(6, 3))
    status = Column(String(20), default='valid', index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    asset = relationship("Asset", back_populates="meter_data")
    
    # Constraints
    __table_args__ = (
        UniqueConstraint('time', 'asset_id', name='uq_asset_meter'),
    )

# ===============================================
# DATASET MODELS
# ===============================================

class Dataset(BaseModel):
    """Dataset model"""
    __tablename__ = "datasets"
    
    organization_id = Column(PGUUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text)
    dataset_type = Column(String(50), nullable=False, index=True)
    source = Column(String(100), index=True)
    frequency = Column(String(20), index=True)
    schema = Column(JSONB, nullable=False)
    created_by = Column(PGUUID(as_uuid=True), ForeignKey("users.id"))
    is_public = Column(Boolean, default=False, index=True)
    meta_data = Column(JSONB, default={})
    
    # Relationships
    organization = relationship("Organization", back_populates="datasets")
    creator = relationship("User", foreign_keys=[created_by])
    ingestions = relationship("DataIngestion", back_populates="dataset", cascade="all, delete-orphan")
    widget_data_cache = relationship("WidgetDataCache", back_populates="widget")

class DataIngestion(BaseModel):
    """Data ingestion job model"""
    __tablename__ = "data_ingestions"
    
    dataset_id = Column(PGUUID(as_uuid=True), ForeignKey("datasets.id"), nullable=False, index=True)
    ingestion_type = Column(String(50), nullable=False, index=True)  # scheduled, on_demand, webhook
    status = Column(String(20), default='pending', index=True)  # pending, running, completed, failed
    started_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    records_processed = Column(Integer, default=0)
    error_message = Column(Text)
    configuration = Column(JSONB, default={})
    
    # Relationships
    dataset = relationship("Dataset", back_populates="ingestions")

# ===============================================
# ML/AI MODELS
# ===============================================

class MLModel(BaseModel):
    """ML model registry"""
    __tablename__ = "ml_models"
    
    organization_id = Column(PGUUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False, index=True)
    model_type = Column(String(50), nullable=False, index=True)
    algorithm = Column(String(100), nullable=False, index=True)
    version = Column(String(50), nullable=False, index=True)
    status = Column(CHAR(20), nullable=False, default='training', index=True)
    accuracy_metrics = Column(JSONB)
    hyper_parameters = Column(JSONB)
    training_data_period_start = Column(DateTime(timezone=True))
    training_data_period_end = Column(DateTime(timezone=True))
    model_file_path = Column(Text)
    model_size_mb = Column(DECIMAL(8, 2))
    created_by = Column(PGUUID(as_uuid=True), ForeignKey("users.id"))
    meta_data = Column(JSONB, default={})
    
    # Relationships
    organization = relationship("Organization", back_populates="ml_models")
    creator = relationship("User", foreign_keys=[created_by])
    predictions = relationship("ModelPrediction", back_populates="model", cascade="all, delete-orphan")

class ModelPrediction(BaseModel):
    """Model prediction results"""
    __tablename__ = "model_predictions"
    
    model_id = Column(PGUUID(as_uuid=True), ForeignKey("ml_models.id"), nullable=False, index=True)
    prediction_type = Column(String(50), nullable=False, index=True)
    target_time = Column(DateTime(timezone=True), nullable=False, index=True)
    predicted_value = Column(DECIMAL(15, 4))
    confidence_interval = Column(JSONB)  # {"lower": 100, "upper": 200, "confidence": 0.95}
    actual_value = Column(DECIMAL(15, 4))
    
    # Relationships
    model = relationship("MLModel", back_populates="predictions")
    
    # Constraints
    __table_args__ = (
        UniqueConstraint('model_id', 'prediction_type', 'target_time', name='uq_model_prediction'),
    )

# ===============================================
# FEATURE STORE
# ===============================================

class FeatureStore(BaseModel):
    """Feature store for ML features"""
    __tablename__ = "feature_store"
    
    feature_name = Column(String(255), nullable=False, index=True)
    feature_type = Column(String(50), nullable=False, index=True)
    entity_id = Column(PGUUID(as_uuid=True))
    entity_type = Column(String(50), index=True)
    feature_value = Column(JSONB, nullable=False)
    valid_from = Column(DateTime(timezone=True), nullable=False, index=True)
    valid_to = Column(DateTime(timezone=True), index=True)

# ===============================================
# DASHBOARD MODELS
# ===============================================

class Dashboard(BaseModel):
    """Dashboard model"""
    __tablename__ = "dashboards"
    
    organization_id = Column(PGUUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text)
    dashboard_type = Column(CHAR(20), nullable=False, default='custom', index=True)
    layout_config = Column(JSONB, nullable=False, default={})
    is_public = Column(Boolean, default=False, index=True)
    is_template = Column(Boolean, default=False, index=True)
    created_by = Column(PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    meta_data = Column(JSONB, default={})
    
    # Relationships
    organization = relationship("Organization", back_populates="dashboards")
    creator = relationship("User", foreign_keys=[created_by])
    widgets = relationship("DashboardWidget", back_populates="dashboard", cascade="all, delete-orphan")

class DashboardWidget(BaseModel):
    """Dashboard widget model"""
    __tablename__ = "dashboard_widgets"
    
    dashboard_id = Column(PGUUID(as_uuid=True), ForeignKey("dashboards.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False, index=True)
    widget_type = Column(CHAR(20), nullable=False, index=True)
    position_x = Column(Integer, nullable=False)
    position_y = Column(Integer, nullable=False)
    width = Column(Integer, nullable=False, default=6)
    height = Column(Integer, nullable=False, default=4)
    configuration = Column(JSONB, nullable=False, default={})
    data_source_id = Column(PGUUID(as_uuid=True), ForeignKey("datasets.id"))
    refresh_interval = Column(Integer, default=300, index=True)  # seconds
    is_visible = Column(Boolean, default=True, index=True)
    meta_data = Column(JSONB, default={})
    
    # Relationships
    dashboard = relationship("Dashboard", back_populates="widgets")
    data_source = relationship("Dataset")
    widget_cache = relationship("WidgetDataCache", back_populates="widget", cascade="all, delete-orphan")

class WidgetDataCache(BaseModel):
    """Widget data cache"""
    __tablename__ = "widget_data_cache"
    
    widget_id = Column(PGUUID(as_uuid=True), ForeignKey("dashboard_widgets.id"), nullable=False, index=True)
    cache_key = Column(String(500), nullable=False)
    data = Column(JSONB, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False, index=True)
    
    # Relationships
    widget = relationship("DashboardWidget", back_populates="widget_cache")
    
    # Constraints
    __table_args__ = (
        UniqueConstraint('widget_id', 'cache_key', name='uq_widget_cache'),
    )

# ===============================================
# AUDIT AND COMPLIANCE MODELS
# ===============================================

class AuditLog(BaseModel):
    """Audit log model"""
    __tablename__ = "audit_logs"
    
    organization_id = Column(PGUUID(as_uuid=True), ForeignKey("organizations.id"))
    user_id = Column(PGUUID(as_uuid=True), ForeignKey("users.id"))
    action = Column(CHAR(20), nullable=False, index=True)
    resource_type = Column(String(100), nullable=False, index=True)
    resource_id = Column(PGUUID(as_uuid=True))
    old_values = Column(JSONB)
    new_values = Column(JSONB)
    ip_address = Column(CHAR(39))  # IPv6 support
    user_agent = Column(Text)

class LegalAuditTrail(BaseModel):
    """Legal audit trail for compliance"""
    __tablename__ = "legal_audit_trail"
    
    organization_id = Column(PGUUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False, index=True)
    entity_type = Column(String(100), nullable=False, index=True)
    entity_id = Column(PGUUID(as_uuid=True), nullable=False, index=True)
    action_type = Column(String(50), nullable=False, index=True)
    legal_status = Column(String(50), nullable=False, index=True)
    legal_officer_id = Column(PGUUID(as_uuid=True), ForeignKey("users.id"))
    legal_comments = Column(Text)
    supporting_documents = Column(JSONB, default=[])
    effective_from = Column(DateTime(timezone=True))
    effective_to = Column(DateTime(timezone=True))
    meta_data = Column(JSONB, default={})
    
    # Relationships
    organization = relationship("Organization", back_populates="legal_audit_trails")
    legal_officer = relationship("User", foreign_keys=[legal_officer_id])

class ComplianceRule(BaseModel):
    """Compliance rule model"""
    __tablename__ = "compliance_rules"
    
    organization_id = Column(PGUUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False, index=True)
    rule_name = Column(String(255), nullable=False, index=True)
    rule_description = Column(Text)
    rule_type = Column(String(50), nullable=False, index=True)
    rule_config = Column(JSONB, nullable=False)
    severity = Column(String(20), nullable=False, default='medium', index=True)
    is_active = Column(Boolean, default=True, index=True)
    created_by = Column(PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Relationships
    organization = relationship("Organization", back_populates="compliance_rules")
    creator = relationship("User", foreign_keys=[created_by])
    violations = relationship("ComplianceViolation", back_populates="rule", cascade="all, delete-orphan")

class ComplianceViolation(BaseModel):
    """Compliance violation model"""
    __tablename__ = "compliance_violations"
    
    rule_id = Column(PGUUID(as_uuid=True), ForeignKey("compliance_rules.id"), nullable=False, index=True)
    entity_type = Column(String(100), nullable=False, index=True)
    entity_id = Column(PGUUID(as_uuid=True), nullable=False, index=True)
    violation_message = Column(Text, nullable=False)
    severity = Column(String(20), nullable=False, index=True)
    is_resolved = Column(Boolean, default=False, index=True)
    resolved_by = Column(PGUUID(as_uuid=True), ForeignKey("users.id"))
    resolved_at = Column(DateTime(timezone=True))
    
    # Relationships
    rule = relationship("ComplianceRule", back_populates="violations")
    resolved_by_user = relationship("User", foreign_keys=[resolved_by])

# ===============================================
# BILLING AND USAGE MODELS
# ===============================================

class SubscriptionPlan(BaseModel):
    """Subscription plan model"""
    __tablename__ = "subscription_plans"
    
    name = Column(String(100), nullable=False)
    tier = Column(String(50), unique=True, nullable=False, index=True)
    price_monthly = Column(DECIMAL(10, 2))
    price_yearly = Column(DECIMAL(10, 2))
    features = Column(JSONB, nullable=False, default={})
    limits = Column(JSONB, nullable=False, default={})
    is_active = Column(Boolean, default=True, index=True)

class UsageMetric(BaseModel):
    """Usage metrics tracking"""
    __tablename__ = "usage_metrics"
    
    time = Column(DateTime(timezone=True), nullable=False, index=True)
    organization_id = Column(PGUUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False, index=True)
    metric_name = Column(String(100), nullable=False, index=True)
    metric_value = Column(DECIMAL(15, 4), nullable=False)
    metric_unit = Column(String(20))
    
    # Relationships
    organization = relationship("Organization", back_populates="usage_metrics")
    
    # Constraints
    __table_args__ = (
        UniqueConstraint('time', 'organization_id', 'metric_name', name='uq_usage_metric'),
    )

# ===============================================
# INDEXES
# ===============================================

# Additional performance indexes
Index('idx_users_organization', User.organization_id)
Index('idx_users_email', User.email)
Index('idx_users_status', User.status)
Index('idx_users_role', User.role)

Index('idx_bids_organization', Bid.organization_id)
Index('idx_bids_market_operator', Bid.market_operator_id)
Index('idx_bids_asset', Bid.asset_id)
Index('idx_bids_status', Bid.status)
Index('idx_bids_delivery_time', Bid.delivery_start, Bid.delivery_end)
Index('idx_bids_created_at', Bid.created_at)

Index('idx_dashboards_organization', Dashboard.organization_id)
Index('idx_dashboards_type', Dashboard.dashboard_type)
Index('idx_dashboard_widgets_dashboard', DashboardWidget.dashboard_id)

Index('idx_audit_logs_organization', AuditLog.organization_id)
Index('idx_audit_logs_user', AuditLog.user_id)
Index('idx_audit_logs_resource', AuditLog.resource_type, AuditLog.resource_id)
Index('idx_audit_logs_created_at', AuditLog.created_at)


# Market Data Model (for real-time data)
class MarketData(BaseModel):
    """Market data model for real-time updates"""
    __tablename__ = "market_data_realtime"
    
    timestamp = Column(DateTime(timezone=True), nullable=False, index=True)
    market_zone = Column(String(50), nullable=False, index=True)
    price = Column(DECIMAL(10, 4), nullable=False)
    volume = Column(DECIMAL(10, 3))
    price_type = Column(String(50))
    location = Column(String(255))
    meta_data = Column(JSONB, default={})
