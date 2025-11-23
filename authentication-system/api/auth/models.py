"""
Enterprise Authentication Models
Complete database models for enterprise authentication system
"""

from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey, Enum, JSON, Index
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from enum import Enum as PyEnum
from datetime import datetime, timedelta
import uuid

Base = declarative_base()


class UserRole(PyEnum):
    """Enterprise user roles with hierarchy"""
    SUPER_ADMIN = "super_admin"
    ORG_ADMIN = "org_admin"
    ANALYST = "analyst"
    TRADER = "trader"
    VIEWER = "viewer"
    AUDITOR = "auditor"


class OrganizationType(PyEnum):
    """Organization types for enterprise customers"""
    ENERGY_COMPANY = "energy_company"
    UTILITY = "utility"
    TRADING_FIRM = "trading_firm"
    REGULATORY = "regulatory"
    CONSULTING = "consulting"
    ACADEMIC = "academic"


class AuthProvider(PyEnum):
    """Supported authentication providers"""
    EMAIL = "email"
    GOOGLE = "google"
    MICROSOFT = "microsoft"
    SAML = "saml"
    OIDC = "oidc"


class MFAMethod(PyEnum):
    """Multi-factor authentication methods"""
    TOTP = "totp"
    SMS = "sms"
    EMAIL = "email"


class SessionStatus(PyEnum):
    """Session status types"""
    ACTIVE = "active"
    REVOKED = "revoked"
    EXPIRED = "expired"


class User(Base):
    """Enterprise user model with comprehensive authentication support"""
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.VIEWER, nullable=False)
    
    # Organization relationship
    organization_id = Column(String, ForeignKey("organizations.id"), nullable=True)
    organization = relationship("Organization", back_populates="users")
    
    # Authentication
    auth_provider = Column(Enum(AuthProvider), default=AuthProvider.EMAIL, nullable=False)
    email_verified = Column(Boolean, default=False, nullable=False)
    email_verification_token = Column(String(255), nullable=True)
    email_verification_expires = Column(DateTime, nullable=True)
    
    # Password authentication
    password_hash = Column(String(255), nullable=True)  # Nullable for SSO-only users
    password_salt = Column(String(255), nullable=True)
    password_changed_at = Column(DateTime, nullable=True)
    
    # MFA settings
    mfa_enabled = Column(Boolean, default=False, nullable=False)
    mfa_secret = Column(String(255), nullable=True)  # TOTP secret
    mfa_backup_codes = Column(JSON, nullable=True)  # Backup codes for recovery
    
    # SSO integration
    sso_provider_id = Column(String(255), nullable=True)  # External ID from SSO provider
    sso_attributes = Column(JSON, nullable=True)  # SSO provider attributes
    
    # Account status
    is_active = Column(Boolean, default=True, nullable=False)
    is_locked = Column(Boolean, default=False, nullable=False)
    locked_until = Column(DateTime, nullable=True)
    failed_login_attempts = Column(Integer, default=0, nullable=False)
    last_login_at = Column(DateTime, nullable=True)
    last_login_ip = Column(String(45), nullable=True)
    
    # Preferences
    preferences = Column(JSON, nullable=True)  # User preferences JSON
    theme_preference = Column(String(20), default="auto", nullable=False)
    language_preference = Column(String(10), default="en", nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    sessions = relationship("UserSession", back_populates="user", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="user", cascade="all, delete-orphan")
    invitations_sent = relationship("UserInvitation", foreign_keys="UserInvitation.invited_by_id", back_populates="invited_by")
    invitations_received = relationship("UserInvitation", foreign_keys="UserInvitation.user_id")
    
    __table_args__ = (
        Index('idx_user_email_active', 'email', 'is_active'),
        Index('idx_user_org_role', 'organization_id', 'role'),
        Index('idx_user_sso_provider', 'sso_provider_id', 'auth_provider'),
    )


class Organization(Base):
    """Enterprise organization model with multi-tenant support"""
    __tablename__ = "organizations"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False, index=True)
    domain = Column(String(255), nullable=True, unique=True)
    organization_type = Column(Enum(OrganizationType), nullable=False)
    
    # Contact information
    contact_email = Column(String(255), nullable=False)
    contact_phone = Column(String(50), nullable=True)
    address = Column(Text, nullable=True)
    
    # Region and industry
    region = Column(String(100), nullable=False)  # Country/State
    industry = Column(String(100), nullable=False)
    
    # Organization settings
    settings = Column(JSON, nullable=True)  # Organization-wide settings
    feature_flags = Column(JSON, nullable=True)  # Feature toggles per org
    
    # Subscription and billing
    subscription_plan = Column(String(50), default="trial", nullable=False)
    subscription_status = Column(String(50), default="active", nullable=False)
    billing_email = Column(String(255), nullable=True)
    
    # SSO configuration
    sso_enabled = Column(Boolean, default=False, nullable=False)
    sso_provider = Column(String(50), nullable=True)
    sso_configuration = Column(JSON, nullable=True)  # SSO provider settings
    
    # Usage tracking
    max_users = Column(Integer, default=10, nullable=False)
    max_dashboards = Column(Integer, default=5, nullable=False)
    api_rate_limit = Column(Integer, default=1000, nullable=False)
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    users = relationship("User", back_populates="organization", cascade="all, delete-orphan")
    invitations = relationship("UserInvitation", back_populates="organization")
    sessions = relationship("UserSession", back_populates="organization")
    
    __table_args__ = (
        Index('idx_org_domain_active', 'domain', 'is_active'),
        Index('idx_org_type_status', 'organization_type', 'subscription_status'),
    )


class UserSession(Base):
    """User session management with security tracking"""
    __tablename__ = "user_sessions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    organization_id = Column(String, ForeignKey("organizations.id"), nullable=True, index=True)
    
    # Session details
    session_token = Column(String(255), unique=True, nullable=False, index=True)
    refresh_token = Column(String(255), nullable=True, index=True)
    
    # Client information
    user_agent = Column(Text, nullable=True)
    ip_address = Column(String(45), nullable=True)  # Supports IPv6
    device_type = Column(String(50), nullable=True)  # mobile, desktop, tablet
    browser = Column(String(100), nullable=True)
    os = Column(String(100), nullable=True)
    
    # Location (for security)
    country = Column(String(2), nullable=True)  # ISO country code
    city = Column(String(100), nullable=True)
    timezone = Column(String(50), nullable=True)
    
    # Session lifecycle
    status = Column(Enum(SessionStatus), default=SessionStatus.ACTIVE, nullable=False)
    created_at = Column(DateTime, default=func.now(), nullable=False)
    expires_at = Column(DateTime, nullable=False)
    last_activity_at = Column(DateTime, default=func.now(), nullable=False)
    revoked_at = Column(DateTime, nullable=True)
    revoked_reason = Column(String(255), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="sessions")
    organization = relationship("Organization", back_populates="sessions")
    
    __table_args__ = (
        Index('idx_session_user_active', 'user_id', 'status'),
        Index('idx_session_expires', 'expires_at'),
        Index('idx_session_token', 'session_token'),
    )


class UserInvitation(Base):
    """User invitation system for enterprise onboarding"""
    __tablename__ = "user_invitations"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), nullable=False, index=True)
    
    # Organization and inviter
    organization_id = Column(String, ForeignKey("organizations.id"), nullable=False, index=True)
    invited_by_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    
    # Invitation details
    role = Column(Enum(UserRole), nullable=False)
    permissions = Column(JSON, nullable=True)  # Custom permissions
    message = Column(Text, nullable=True)  # Personal message from inviter
    
    # Invitation lifecycle
    invitation_token = Column(String(255), unique=True, nullable=False, index=True)
    status = Column(String(20), default="pending", nullable=False)  # pending, accepted, expired, revoked
    expires_at = Column(DateTime, nullable=False)
    
    # Acceptance tracking
    accepted_at = Column(DateTime, nullable=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)  # User created from invitation
    accepted_ip = Column(String(45), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    organization = relationship("Organization", back_populates="invitations")
    invited_by = relationship("User", foreign_keys=[invited_by_id], back_populates="invitations_sent")
    accepted_user = relationship("User", foreign_keys=[user_id])
    
    __table_args__ = (
        Index('idx_invitation_token', 'invitation_token'),
        Index('idx_invitation_status_expires', 'status', 'expires_at'),
        Index('idx_invitation_email_org', 'email', 'organization_id'),
    )


class AuditLog(Base):
    """Immutable audit trail for all authentication actions"""
    __tablename__ = "audit_logs"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Actor information
    user_id = Column(String, ForeignKey("users.id"), nullable=True, index=True)
    organization_id = Column(String, ForeignKey("organizations.id"), nullable=True, index=True)
    
    # Action details
    action = Column(String(100), nullable=False, index=True)  # login, logout, mfa_enable, etc.
    resource = Column(String(100), nullable=True)  # what was accessed
    resource_id = Column(String(255), nullable=True)  # ID of affected resource
    
    # Request context
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    session_id = Column(String(255), nullable=True)
    
    # Result
    status = Column(String(20), nullable=False)  # success, failure, blocked
    error_message = Column(Text, nullable=True)
    
    # Additional data
    metadata = Column(JSON, nullable=True)  # Additional context
    
    # Timestamp (immutable)
    created_at = Column(DateTime, default=func.now(), nullable=False, index=True)
    
    # Relationships
    user = relationship("User", back_populates="audit_logs")
    organization = relationship("Organization")
    
    __table_args__ = (
        Index('idx_audit_user_action', 'user_id', 'action', 'created_at'),
        Index('idx_audit_org_action', 'organization_id', 'action', 'created_at'),
        Index('idx_audit_status_date', 'status', 'created_at'),
    )


class MFADevice(Base):
    """Multi-factor authentication devices and backup codes"""
    __tablename__ = "mfa_devices"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    
    # Device details
    device_name = Column(String(100), nullable=False)  # "iPhone 15", "Android Phone"
    device_type = Column(String(50), nullable=False)  # authenticator, sms, email
    method = Column(Enum(MFAMethod), nullable=False)
    
    # Device configuration
    secret = Column(String(255), nullable=True)  # TOTP secret
    phone_number = Column(String(20), nullable=True)  # For SMS
    is_primary = Column(Boolean, default=False, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    
    # Usage tracking
    last_used_at = Column(DateTime, nullable=True)
    usage_count = Column(Integer, default=0, nullable=False)
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
    
    __table_args__ = (
        Index('idx_mfa_user_device', 'user_id', 'device_type', 'is_active'),
        Index('idx_mfa_primary', 'user_id', 'is_primary'),
    )


class PasswordPolicy(Base):
    """Password policies and security requirements"""
    __tablename__ = "password_policies"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    organization_id = Column(String, ForeignKey("organizations.id"), nullable=True, index=True)  # NULL = global policy
    
    # Policy settings
    min_length = Column(Integer, default=12, nullable=False)
    require_uppercase = Column(Boolean, default=True, nullable=False)
    require_lowercase = Column(Boolean, default=True, nullable=False)
    require_numbers = Column(Boolean, default=True, nullable=False)
    require_symbols = Column(Boolean, default=True, nullable=False)
    
    # Advanced requirements
    max_age_days = Column(Integer, nullable=True)  # Password expiration
    prevent_reuse_last_n = Column(Integer, default=5, nullable=False)  # Password history
    lockout_threshold = Column(Integer, default=5, nullable=False)  # Failed attempts
    lockout_duration_minutes = Column(Integer, default=30, nullable=False)
    
    # Additional security
    require_mfa = Column(Boolean, default=False, nullable=False)
    allow_weak_passwords = Column(Boolean, default=False, nullable=False)
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
    
    __table_args__ = (
        Index('idx_password_policy_org_active', 'organization_id', 'is_active'),
    )


class ConsentRecord(Base):
    """User consent and privacy preferences"""
    __tablename__ = "consent_records"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    
    # Consent types
    consent_type = Column(String(50), nullable=False, index=True)  # analytics, marketing, cookies, data_processing
    consent_given = Column(Boolean, nullable=False)
    
    # Consent details
    version = Column(String(20), nullable=False)  # Terms/policy version
    scope = Column(Text, nullable=True)  # Detailed scope of consent
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    
    # Timestamps
    consented_at = Column(DateTime, default=func.now(), nullable=False)
    withdrawn_at = Column(DateTime, nullable=True)
    
    __table_args__ = (
        Index('idx_consent_user_type', 'user_id', 'consent_type'),
        Index('idx_consent_active', 'consent_type', 'consent_given', 'withdrawn_at'),
    )


class RateLimitRecord(Base):
    """Rate limiting tracking for authentication endpoints"""
    __tablename__ = "rate_limit_records"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Rate limiting context
    action = Column(String(50), nullable=False, index=True)  # login, verification, password_reset
    identifier = Column(String(255), nullable=False, index=True)  # IP address, user ID, email
    
    # Attempt tracking
    attempt_at = Column(DateTime, default=func.now(), nullable=False)
    success = Column(Boolean, default=False, nullable=False)
    
    # Request context
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    
    __table_args__ = (
        Index('idx_rate_limit_action_identifier', 'action', 'identifier', 'attempt_at'),
        Index('idx_rate_limit_ip_time', 'ip_address', 'attempt_at'),
    )