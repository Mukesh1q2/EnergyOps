"""
Admin Control Models
Phase 5: Theme System & Admin Controls

Enterprise admin panel models including organization management,
user controls, feature flags, and system monitoring.
"""

from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
from enum import Enum
from sqlalchemy import (
    Column, Integer, String, DateTime, Boolean, JSON, Text, Float, 
    ForeignKey, Enum as SQLEnum, LargeBinary
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

Base = declarative_base()

class UserRole(str, Enum):
    """User role enumeration"""
    SUPER_ADMIN = "super_admin"
    ORG_ADMIN = "org_admin"
    USER = "user"
    VIEWER = "viewer"
    AUDITOR = "auditor"

class SubscriptionTier(str, Enum):
    """Subscription tier enumeration"""
    FREE = "free"
    BASIC = "basic"
    PROFESSIONAL = "professional"
    ENTERPRISE = "enterprise"

class FeatureFlagType(str, Enum):
    """Feature flag type enumeration"""
    BOOLEAN = "boolean"
    PERCENTAGE = "percentage"
    RULES = "rules"

class SystemHealth(str, Enum):
    """System health status"""
    HEALTHY = "healthy"
    WARNING = "warning"
    CRITICAL = "critical"
    MAINTENANCE = "maintenance"

class Organization(Base):
    """
    Organization model for enterprise admin management
    """
    __tablename__ = "organizations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    slug = Column(String(100), nullable=False, unique=True, index=True)
    domain = Column(String(200), nullable=True)
    
    # Organization details
    description = Column(Text, nullable=True)
    logo_url = Column(String(500), nullable=True)
    website_url = Column(String(500), nullable=True)
    
    # Subscription and billing
    subscription_tier = Column(String(50), nullable=False, default=SubscriptionTier.FREE.value)
    subscription_status = Column(String(50), nullable=False, default="active")
    billing_email = Column(String(200), nullable=True)
    billing_address = Column(JSON, nullable=True)
    
    # Usage and limits
    max_users = Column(Integer, default=10)
    max_dashboards = Column(Integer, default=20)
    max_storage_gb = Column(Integer, default=10)
    api_calls_limit = Column(Integer, default=10000)
    
    # Current usage
    current_users = Column(Integer, default=0)
    current_dashboards = Column(Integer, default=0)
    current_storage_mb = Column(Integer, default=0)
    current_api_calls = Column(Integer, default=0)
    
    # Feature flags
    enabled_features = Column(JSON, nullable=False, default={})
    
    # Admin settings
    is_active = Column(Boolean, default=True)
    is_trial = Column(Boolean, default=False)
    trial_ends_at = Column(DateTime(timezone=True), nullable=True)
    
    # Compliance and security
    gdpr_enabled = Column(Boolean, default=True)
    data_retention_days = Column(Integer, default=2555)  # 7 years
    two_factor_required = Column(Boolean, default=False)
    sso_enabled = Column(Boolean, default=False)
    sso_provider = Column(String(100), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    users = relationship("User", back_populates="organization")
    themes = relationship("Theme", back_populates="organization")
    feature_flags = relationship("FeatureFlag", back_populates="organization")
    audit_logs = relationship("AuditLog", back_populates="organization")
    rate_limits = relationship("RateLimit", back_populates="organization")
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert organization to dictionary"""
        return {
            "id": self.id,
            "name": self.name,
            "slug": self.slug,
            "domain": self.domain,
            "description": self.description,
            "logo_url": self.logo_url,
            "website_url": self.website_url,
            "subscription_tier": self.subscription_tier,
            "subscription_status": self.subscription_status,
            "billing_email": self.billing_email,
            "billing_address": self.billing_address,
            "max_users": self.max_users,
            "max_dashboards": self.max_dashboards,
            "max_storage_gb": self.max_storage_gb,
            "api_calls_limit": self.api_calls_limit,
            "current_users": self.current_users,
            "current_dashboards": self.current_dashboards,
            "current_storage_mb": self.current_storage_mb,
            "current_api_calls": self.current_api_calls,
            "enabled_features": self.enabled_features,
            "is_active": self.is_active,
            "is_trial": self.is_trial,
            "trial_ends_at": self.trial_ends_at.isoformat() if self.trial_ends_at else None,
            "gdpr_enabled": self.gdpr_enabled,
            "data_retention_days": self.data_retention_days,
            "two_factor_required": self.two_factor_required,
            "sso_enabled": self.sso_enabled,
            "sso_provider": self.sso_provider,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

class User(Base):
    """
    Enhanced user model with admin capabilities
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(320), nullable=False, unique=True, index=True)
    username = Column(String(50), nullable=True, unique=True, index=True)
    
    # Authentication
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    email_verified_at = Column(DateTime(timezone=True), nullable=True)
    
    # Profile
    first_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    phone = Column(String(20), nullable=True)
    
    # Organization and role
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    role = Column(String(50), nullable=False, default=UserRole.USER.value)
    
    # Security
    last_login_at = Column(DateTime(timezone=True), nullable=True)
    login_count = Column(Integer, default=0)
    failed_login_attempts = Column(Integer, default=0)
    locked_until = Column(DateTime(timezone=True), nullable=True)
    
    # 2FA
    two_factor_enabled = Column(Boolean, default=False)
    two_factor_secret = Column(String(32), nullable=True)
    backup_codes = Column(JSON, nullable=True)
    
    # Preferences
    language = Column(String(10), default="en")
    timezone = Column(String(50), default="UTC")
    theme_preference = Column(String(20), default="auto")
    notification_preferences = Column(JSON, nullable=False, default={})
    
    # Session management
    session_timeout_minutes = Column(Integer, default=480)  # 8 hours
    max_concurrent_sessions = Column(Integer, default=3)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    organization = relationship("Organization", back_populates="users")
    audit_logs = relationship("AuditLog", back_populates="user")
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert user to dictionary"""
        return {
            "id": self.id,
            "email": self.email,
            "username": self.username,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "avatar_url": self.avatar_url,
            "phone": self.phone,
            "organization_id": self.organization_id,
            "role": self.role,
            "is_active": self.is_active,
            "is_verified": self.is_verified,
            "email_verified_at": self.email_verified_at.isoformat() if self.email_verified_at else None,
            "last_login_at": self.last_login_at.isoformat() if self.last_login_at else None,
            "login_count": self.login_count,
            "failed_login_attempts": self.failed_login_attempts,
            "locked_until": self.locked_until.isoformat() if self.locked_until else None,
            "two_factor_enabled": self.two_factor_enabled,
            "language": self.language,
            "timezone": self.timezone,
            "theme_preference": self.theme_preference,
            "notification_preferences": self.notification_preferences,
            "session_timeout_minutes": self.session_timeout_minutes,
            "max_concurrent_sessions": self.max_concurrent_sessions,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

class FeatureFlag(Base):
    """
    Feature flag model for controlling feature availability
    """
    __tablename__ = "feature_flags"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    key = Column(String(100), nullable=False, unique=True, index=True)
    description = Column(Text, nullable=True)
    
    # Flag configuration
    type = Column(String(20), nullable=False)  # FeatureFlagType
    is_enabled = Column(Boolean, default=False)
    default_value = Column(Boolean, default=False)
    
    # Targeting rules
    rules = Column(JSON, nullable=True, default={})
    user_conditions = Column(JSON, nullable=True, default={})
    organization_conditions = Column(JSON, nullable=True, default={})
    
    # Percentage rollout
    rollout_percentage = Column(Integer, default=0)
    
    # Environment and scope
    environment = Column(String(50), default="production")
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=True)
    
    # Ownership
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Schedule
    starts_at = Column(DateTime(timezone=True), nullable=True)
    ends_at = Column(DateTime(timezone=True), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    organization = relationship("Organization", back_populates="feature_flags")
    creator = relationship("User", foreign_keys=[created_by])
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert feature flag to dictionary"""
        return {
            "id": self.id,
            "name": self.name,
            "key": self.key,
            "description": self.description,
            "type": self.type,
            "is_enabled": self.is_enabled,
            "default_value": self.default_value,
            "rules": self.rules,
            "user_conditions": self.user_conditions,
            "organization_conditions": self.organization_conditions,
            "rollout_percentage": self.rollout_percentage,
            "environment": self.environment,
            "organization_id": self.organization_id,
            "created_by": self.created_by,
            "starts_at": self.starts_at.isoformat() if self.starts_at else None,
            "ends_at": self.ends_at.isoformat() if self.ends_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

class AuditLog(Base):
    """
    Comprehensive audit logging for compliance and monitoring
    """
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    
    # Entity information
    entity_type = Column(String(50), nullable=False)  # user, organization, dashboard, etc.
    entity_id = Column(Integer, nullable=False)
    entity_name = Column(String(200), nullable=True)
    
    # Action details
    action = Column(String(100), nullable=False)  # create, update, delete, login, etc.
    resource = Column(String(100), nullable=False)  # dashboard, user, theme, etc.
    details = Column(JSON, nullable=True, default={})
    
    # Change tracking
    old_values = Column(JSON, nullable=True, default={})
    new_values = Column(JSON, nullable=True, default={})
    
    # Actor information
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    
    # Request context
    ip_address = Column(String(45), nullable=True)  # IPv6 compatible
    user_agent = Column(Text, nullable=True)
    request_id = Column(String(100), nullable=True, index=True)
    
    # Compliance
    retention_period_days = Column(Integer, default=2555)  # 7 years
    is_pii = Column(Boolean, default=False)
    is_sensitive = Column(Boolean, default=False)
    
    # Timestamp
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    # Relationships
    user = relationship("User", back_populates="audit_logs")
    organization = relationship("Organization", back_populates="audit_logs")
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert audit log to dictionary"""
        return {
            "id": self.id,
            "entity_type": self.entity_type,
            "entity_id": self.entity_id,
            "entity_name": self.entity_name,
            "action": self.action,
            "resource": self.resource,
            "details": self.details,
            "old_values": self.old_values,
            "new_values": self.new_values,
            "user_id": self.user_id,
            "organization_id": self.organization_id,
            "ip_address": self.ip_address,
            "user_agent": self.user_agent,
            "request_id": self.request_id,
            "retention_period_days": self.retention_period_days,
            "is_pii": self.is_pii,
            "is_sensitive": self.is_sensitive,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

class RateLimit(Base):
    """
    Rate limiting configuration per organization
    """
    __tablename__ = "rate_limits"

    id = Column(Integer, primary_key=True, index=True)
    
    # Organization and user scope
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Rate limit configuration
    resource_type = Column(String(100), nullable=False)  # api_calls, uploads, dashboards, etc.
    limit_value = Column(Integer, nullable=False)
    time_window_minutes = Column(Integer, nullable=False)
    
    # Current usage tracking
    current_usage = Column(Integer, default=0)
    reset_at = Column(DateTime(timezone=True), nullable=False)
    
    # Status
    is_active = Column(Boolean, default=True)
    last_reset_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    organization = relationship("Organization", back_populates="rate_limits")
    user = relationship("User")
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert rate limit to dictionary"""
        return {
            "id": self.id,
            "organization_id": self.organization_id,
            "user_id": self.user_id,
            "resource_type": self.resource_type,
            "limit_value": self.limit_value,
            "time_window_minutes": self.time_window_minutes,
            "current_usage": self.current_usage,
            "reset_at": self.reset_at.isoformat() if self.reset_at else None,
            "is_active": self.is_active,
            "last_reset_at": self.last_reset_at.isoformat() if self.last_reset_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

class SystemHealthMetric(Base):
    """
    System health monitoring metrics
    """
    __tablename__ = "system_health_metrics"

    id = Column(Integer, primary_key=True, index=True)
    
    # Metric details
    name = Column(String(100), nullable=False)
    category = Column(String(50), nullable=False)  # performance, security, availability, etc.
    metric_type = Column(String(50), nullable=False)  # cpu, memory, response_time, error_rate, etc.
    
    # Metric values
    value = Column(Float, nullable=False)
    unit = Column(String(20), nullable=True)  # percentage, milliseconds, count, etc.
    threshold_warning = Column(Float, nullable=True)
    threshold_critical = Column(Float, nullable=True)
    
    # Status
    status = Column(String(20), nullable=False)  # healthy, warning, critical
    message = Column(Text, nullable=True)
    
    # Metadata
    tags = Column(JSON, nullable=True, default={})
    metadata = Column(JSON, nullable=True, default={})
    
    # Timestamp
    recorded_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert system health metric to dictionary"""
        return {
            "id": self.id,
            "name": self.name,
            "category": self.category,
            "metric_type": self.metric_type,
            "value": self.value,
            "unit": self.unit,
            "threshold_warning": self.threshold_warning,
            "threshold_critical": self.threshold_critical,
            "status": self.status,
            "message": self.message,
            "tags": self.tags,
            "metadata": self.metadata,
            "recorded_at": self.recorded_at.isoformat() if self.recorded_at else None
        }

class NotificationTemplate(Base):
    """
    Notification templates for system communications
    """
    __tablename__ = "notification_templates"

    id = Column(Integer, primary_key=True, index=True)
    
    # Template details
    name = Column(String(100), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    type = Column(String(50), nullable=False)  # email, sms, webhook, push
    
    # Template content
    subject = Column(Text, nullable=True)
    body = Column(Text, nullable=False)
    variables = Column(JSON, nullable=True, default={})
    
    # Configuration
    is_active = Column(Boolean, default=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    organization = relationship("Organization")
    creator = relationship("User", foreign_keys=[created_by])
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert notification template to dictionary"""
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "type": self.type,
            "subject": self.subject,
            "body": self.body,
            "variables": self.variables,
            "is_active": self.is_active,
            "organization_id": self.organization_id,
            "created_by": self.created_by,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

# Utility functions for admin operations
def create_default_feature_flags() -> List[Dict[str, Any]]:
    """Create default feature flags for the system"""
    return [
        {
            "name": "Knowledge Graphs",
            "key": "knowledge_graphs",
            "description": "Visual knowledge graph capabilities",
            "type": FeatureFlagType.BOOLEAN.value,
            "is_enabled": True,
            "default_value": True
        },
        {
            "name": "AI Assistant",
            "key": "ai_assistant",
            "description": "AI-powered assistant for natural language queries",
            "type": FeatureFlagType.BOOLEAN.value,
            "is_enabled": True,
            "default_value": True
        },
        {
            "name": "Advanced Analytics",
            "key": "advanced_analytics",
            "description": "Advanced analytics and reporting features",
            "type": FeatureFlagType.PERCENTAGE.value,
            "is_enabled": True,
            "rollout_percentage": 80
        },
        {
            "name": "Real-time Collaboration",
            "key": "real_time_collaboration",
            "description": "Real-time collaborative editing and sharing",
            "type": FeatureFlagType.BOOLEAN.value,
            "is_enabled": True,
            "default_value": True
        }
    ]

def calculate_organization_usage(org: Organization) -> Dict[str, Any]:
    """Calculate current organization usage"""
    return {
        "users": org.current_users,
        "dashboards": org.current_dashboards,
        "storage_mb": org.current_storage_mb,
        "api_calls": org.current_api_calls,
        "usage_percentage": {
            "users": (org.current_users / org.max_users) * 100,
            "dashboards": (org.current_dashboards / org.max_dashboards) * 100,
            "storage": (org.current_storage_mb / (org.max_storage_gb * 1024)) * 100,
            "api_calls": (org.current_api_calls / org.api_calls_limit) * 100
        },
        "available_features": org.enabled_features
    }

def is_feature_enabled(feature_key: str, organization_id: int, user_id: Optional[int] = None) -> bool:
    """
    Check if a feature is enabled for a user/organization
    This would be implemented with database queries in production
    """
    # Placeholder logic - would query FeatureFlag table
    default_flags = create_default_feature_flags()
    for flag in default_flags:
        if flag["key"] == feature_key:
            return flag["is_enabled"]
    return False