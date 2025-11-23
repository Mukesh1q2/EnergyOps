"""
Admin Control Schemas
Phase 5: Theme System & Admin Controls

Pydantic schemas for admin panel API validation and serialization.
"""

from typing import Dict, Any, Optional, List, Union
from pydantic import BaseModel, Field, EmailStr, validator
from datetime import datetime, timedelta
from enum import Enum
import re

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

# Organization Schemas

class OrganizationBase(BaseModel):
    """Base organization schema"""
    name: str = Field(..., max_length=200, description="Organization name")
    slug: str = Field(..., max_length=100, description="Organization slug")
    domain: Optional[str] = Field(None, max_length=200, description="Organization domain")
    
    @validator('slug')
    def validate_slug(cls, v):
        """Validate slug format"""
        if not re.match(r'^[a-z0-9-]+$', v):
            raise ValueError('Slug must contain only lowercase letters, numbers, and hyphens')
        return v.lower()

class OrganizationCreate(OrganizationBase):
    """Schema for creating organization"""
    description: Optional[str] = Field(None, description="Organization description")
    subscription_tier: SubscriptionTier = Field(
        SubscriptionTier.FREE, 
        description="Subscription tier"
    )
    max_users: int = Field(10, ge=1, le=1000, description="Maximum users")
    max_dashboards: int = Field(20, ge=1, le=1000, description="Maximum dashboards")
    max_storage_gb: int = Field(10, ge=1, le=10000, description="Maximum storage in GB")
    api_calls_limit: int = Field(10000, ge=100, le=10000000, description="API calls limit")
    billing_email: Optional[EmailStr] = Field(None, description="Billing email address")

class OrganizationUpdate(BaseModel):
    """Schema for updating organization"""
    name: Optional[str] = Field(None, max_length=200)
    domain: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = None
    subscription_tier: Optional[SubscriptionTier] = None
    max_users: Optional[int] = Field(None, ge=1, le=1000)
    max_dashboards: Optional[int] = Field(None, ge=1, le=1000)
    max_storage_gb: Optional[int] = Field(None, ge=1, le=10000)
    api_calls_limit: Optional[int] = Field(None, ge=100, le=10000000)
    billing_email: Optional[EmailStr] = None
    is_active: Optional[bool] = None
    two_factor_required: Optional[bool] = None
    sso_enabled: Optional[bool] = None

class OrganizationResponse(BaseModel):
    """Schema for organization API responses"""
    id: int
    name: str
    slug: str
    domain: Optional[str]
    description: Optional[str]
    logo_url: Optional[str]
    website_url: Optional[str]
    subscription_tier: str
    subscription_status: str
    billing_email: Optional[str]
    billing_address: Optional[Dict[str, Any]]
    max_users: int
    max_dashboards: int
    max_storage_gb: int
    api_calls_limit: int
    current_users: int
    current_dashboards: int
    current_storage_mb: int
    current_api_calls: int
    enabled_features: Dict[str, Any]
    is_active: bool
    is_trial: bool
    trial_ends_at: Optional[datetime]
    gdpr_enabled: bool
    data_retention_days: int
    two_factor_required: bool
    sso_enabled: bool
    sso_provider: Optional[str]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    usage_stats: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

    @classmethod
    def from_orm(cls, org):
        """Create response from ORM model"""
        return cls(
            id=org.id,
            name=org.name,
            slug=org.slug,
            domain=org.domain,
            description=org.description,
            logo_url=org.logo_url,
            website_url=org.website_url,
            subscription_tier=org.subscription_tier,
            subscription_status=org.subscription_status,
            billing_email=org.billing_email,
            billing_address=org.billing_address,
            max_users=org.max_users,
            max_dashboards=org.max_dashboards,
            max_storage_gb=org.max_storage_gb,
            api_calls_limit=org.api_calls_limit,
            current_users=org.current_users,
            current_dashboards=org.current_dashboards,
            current_storage_mb=org.current_storage_mb,
            current_api_calls=org.current_api_calls,
            enabled_features=org.enabled_features,
            is_active=org.is_active,
            is_trial=org.is_trial,
            trial_ends_at=org.trial_ends_at,
            gdpr_enabled=org.gdpr_enabled,
            data_retention_days=org.data_retention_days,
            two_factor_required=org.two_factor_required,
            sso_enabled=org.sso_enabled,
            sso_provider=org.sso_provider,
            created_at=org.created_at,
            updated_at=org.updated_at
        )

# User Schemas

class UserBase(BaseModel):
    """Base user schema"""
    email: EmailStr = Field(..., description="User email address")
    username: Optional[str] = Field(None, max_length=50, description="Username")
    first_name: Optional[str] = Field(None, max_length=100, description="First name")
    last_name: Optional[str] = Field(None, max_length=100, description="Last name")
    
    @validator('username')
    def validate_username(cls, v):
        """Validate username format"""
        if v and not re.match(r'^[a-zA-Z0-9_.-]+$', v):
            raise ValueError('Username contains invalid characters')
        return v

class UserCreate(UserBase):
    """Schema for creating user"""
    hashed_password: str = Field(..., min_length=8, description="Hashed password")
    role: UserRole = Field(UserRole.USER, description="User role")
    language: str = Field("en", max_length=10, description="User language")
    timezone: str = Field("UTC", max_length=50, description="User timezone")
    organization_id: int = Field(..., description="Organization ID")
    phone: Optional[str] = Field(None, max_length=20, description="Phone number")
    
    @validator('phone')
    def validate_phone(cls, v):
        """Validate phone number format"""
        if v and not re.match(r'^\+?[1-9]\d{1,14}$', v):
            raise ValueError('Invalid phone number format')
        return v

class UserUpdate(BaseModel):
    """Schema for updating user"""
    username: Optional[str] = Field(None, max_length=50)
    first_name: Optional[str] = Field(None, max_length=100)
    last_name: Optional[str] = Field(None, max_length=100)
    role: Optional[UserRole] = None
    language: Optional[str] = Field(None, max_length=10)
    timezone: Optional[str] = Field(None, max_length=50)
    phone: Optional[str] = Field(None, max_length=20)
    is_active: Optional[bool] = None
    two_factor_enabled: Optional[bool] = None
    notification_preferences: Optional[Dict[str, Any]] = None
    session_timeout_minutes: Optional[int] = Field(None, ge=15, le=1440)
    max_concurrent_sessions: Optional[int] = Field(None, ge=1, le=10)
    
    @validator('phone')
    def validate_phone(cls, v):
        """Validate phone number format"""
        if v and not re.match(r'^\+?[1-9]\d{1,14}$', v):
            raise ValueError('Invalid phone number format')
        return v

class UserResponse(BaseModel):
    """Schema for user API responses"""
    id: int
    email: str
    username: Optional[str]
    first_name: Optional[str]
    last_name: Optional[str]
    avatar_url: Optional[str]
    phone: Optional[str]
    organization_id: int
    role: str
    is_active: bool
    is_verified: bool
    email_verified_at: Optional[datetime]
    last_login_at: Optional[datetime]
    login_count: int
    failed_login_attempts: int
    locked_until: Optional[datetime]
    two_factor_enabled: bool
    language: str
    timezone: str
    theme_preference: str
    notification_preferences: Dict[str, Any]
    session_timeout_minutes: int
    max_concurrent_sessions: int
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

    @classmethod
    def from_orm(cls, user):
        """Create response from ORM model"""
        return cls(
            id=user.id,
            email=user.email,
            username=user.username,
            first_name=user.first_name,
            last_name=user.last_name,
            avatar_url=user.avatar_url,
            phone=user.phone,
            organization_id=user.organization_id,
            role=user.role,
            is_active=user.is_active,
            is_verified=user.is_verified,
            email_verified_at=user.email_verified_at,
            last_login_at=user.last_login_at,
            login_count=user.login_count,
            failed_login_attempts=user.failed_login_attempts,
            locked_until=user.locked_until,
            two_factor_enabled=user.two_factor_enabled,
            language=user.language,
            timezone=user.timezone,
            theme_preference=user.theme_preference,
            notification_preferences=user.notification_preferences,
            session_timeout_minutes=user.session_timeout_minutes,
            max_concurrent_sessions=user.max_concurrent_sessions,
            created_at=user.created_at,
            updated_at=user.updated_at
        )

class UserListResponse(BaseModel):
    """Schema for user list responses"""
    users: List[UserResponse]
    total: int
    limit: int
    offset: int
    filters: Dict[str, Any]

# Feature Flag Schemas

class FeatureFlagBase(BaseModel):
    """Base feature flag schema"""
    name: str = Field(..., max_length=100, description="Feature flag name")
    key: str = Field(..., max_length=100, description="Feature flag key")
    description: Optional[str] = Field(None, description="Feature flag description")
    
    @validator('key')
    def validate_key(cls, v):
        """Validate feature flag key format"""
        if not re.match(r'^[a-z0-9_]+$', v):
            raise ValueError('Key must contain only lowercase letters, numbers, and underscores')
        return v.lower()

class FeatureFlagCreate(FeatureFlagBase):
    """Schema for creating feature flag"""
    type: FeatureFlagType = Field(FeatureFlagType.BOOLEAN, description="Flag type")
    is_enabled: bool = Field(False, description="Whether flag is enabled")
    default_value: bool = Field(False, description="Default value")
    rules: Optional[Dict[str, Any]] = Field(None, description="Targeting rules")
    user_conditions: Optional[Dict[str, Any]] = Field(None, description="User conditions")
    organization_conditions: Optional[Dict[str, Any]] = Field(None, description="Organization conditions")
    rollout_percentage: int = Field(0, ge=0, le=100, description="Rollout percentage")
    environment: str = Field("production", max_length=50, description="Environment")
    organization_id: Optional[int] = Field(None, description="Organization ID")
    starts_at: Optional[datetime] = Field(None, description="Start date")
    ends_at: Optional[datetime] = Field(None, description="End date")

class FeatureFlagUpdate(BaseModel):
    """Schema for updating feature flag"""
    name: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    is_enabled: Optional[bool] = None
    default_value: Optional[bool] = None
    rules: Optional[Dict[str, Any]] = None
    user_conditions: Optional[Dict[str, Any]] = None
    organization_conditions: Optional[Dict[str, Any]] = None
    rollout_percentage: Optional[int] = Field(None, ge=0, le=100)
    starts_at: Optional[datetime] = None
    ends_at: Optional[datetime] = None

class FeatureFlagResponse(BaseModel):
    """Schema for feature flag API responses"""
    id: int
    name: str
    key: str
    description: Optional[str]
    type: str
    is_enabled: bool
    default_value: bool
    rules: Dict[str, Any]
    user_conditions: Dict[str, Any]
    organization_conditions: Dict[str, Any]
    rollout_percentage: int
    environment: str
    organization_id: Optional[int]
    created_by: int
    starts_at: Optional[datetime]
    ends_at: Optional[datetime]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

    @classmethod
    def from_orm(cls, flag):
        """Create response from ORM model"""
        return cls(
            id=flag.id,
            name=flag.name,
            key=flag.key,
            description=flag.description,
            type=flag.type,
            is_enabled=flag.is_enabled,
            default_value=flag.default_value,
            rules=flag.rules,
            user_conditions=flag.user_conditions,
            organization_conditions=flag.organization_conditions,
            rollout_percentage=flag.rollout_percentage,
            environment=flag.environment,
            organization_id=flag.organization_id,
            created_by=flag.created_by,
            starts_at=flag.starts_at,
            ends_at=flag.ends_at,
            created_at=flag.created_at,
            updated_at=flag.updated_at
        )

class FeatureFlagListResponse(BaseModel):
    """Schema for feature flag list responses"""
    flags: List[FeatureFlagResponse]
    total: int
    limit: int
    offset: int
    filters: Dict[str, Any]

# Audit Log Schemas

class AuditLogResponse(BaseModel):
    """Schema for audit log API responses"""
    id: int
    entity_type: str
    entity_id: int
    entity_name: Optional[str]
    action: str
    resource: str
    details: Dict[str, Any]
    old_values: Dict[str, Any]
    new_values: Dict[str, Any]
    user_id: Optional[int]
    organization_id: int
    ip_address: Optional[str]
    user_agent: Optional[str]
    request_id: Optional[str]
    retention_period_days: int
    is_pii: bool
    is_sensitive: bool
    created_at: Optional[datetime]

    class Config:
        from_attributes = True

    @classmethod
    def from_orm(cls, log):
        """Create response from ORM model"""
        return cls(
            id=log.id,
            entity_type=log.entity_type,
            entity_id=log.entity_id,
            entity_name=log.entity_name,
            action=log.action,
            resource=log.resource,
            details=log.details,
            old_values=log.old_values,
            new_values=log.new_values,
            user_id=log.user_id,
            organization_id=log.organization_id,
            ip_address=log.ip_address,
            user_agent=log.user_agent,
            request_id=log.request_id,
            retention_period_days=log.retention_period_days,
            is_pii=log.is_pii,
            is_sensitive=log.is_sensitive,
            created_at=log.created_at
        )

class AuditLogListResponse(BaseModel):
    """Schema for audit log list responses"""
    logs: List[AuditLogResponse]
    total: int
    limit: int
    offset: int
    filters: Dict[str, Any]

# System Health Schemas

class SystemHealthMetric(BaseModel):
    """Schema for system health metrics"""
    name: str
    category: str
    metric_type: str
    value: float
    unit: Optional[str]
    threshold_warning: Optional[float]
    threshold_critical: Optional[float]
    status: SystemHealth
    message: Optional[str]
    tags: Dict[str, Any]
    metadata: Dict[str, Any]
    recorded_at: datetime

class SystemHealthListResponse(BaseModel):
    """Schema for system health list responses"""
    metrics: List[Dict[str, Any]]
    total: int
    limit: int
    offset: int
    filters: Dict[str, Any]

# Rate Limit Schemas

class RateLimitBase(BaseModel):
    """Base rate limit schema"""
    resource_type: str = Field(..., max_length=100, description="Resource type")
    limit_value: int = Field(..., ge=1, description="Rate limit value")
    time_window_minutes: int = Field(..., ge=1, description="Time window in minutes")

class RateLimitCreate(RateLimitBase):
    """Schema for creating rate limit"""
    organization_id: int = Field(..., description="Organization ID")
    user_id: Optional[int] = Field(None, description="User ID (optional)")

class RateLimitUpdate(BaseModel):
    """Schema for updating rate limit"""
    limit_value: Optional[int] = Field(None, ge=1)
    time_window_minutes: Optional[int] = Field(None, ge=1)
    is_active: Optional[bool] = None

class RateLimitResponse(BaseModel):
    """Schema for rate limit API responses"""
    id: int
    organization_id: int
    user_id: Optional[int]
    resource_type: str
    limit_value: int
    time_window_minutes: int
    current_usage: int
    reset_at: Optional[datetime]
    is_active: bool
    last_reset_at: Optional[datetime]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

    @classmethod
    def from_orm(cls, limit):
        """Create response from ORM model"""
        return cls(
            id=limit.id,
            organization_id=limit.organization_id,
            user_id=limit.user_id,
            resource_type=limit.resource_type,
            limit_value=limit.limit_value,
            time_window_minutes=limit.time_window_minutes,
            current_usage=limit.current_usage,
            reset_at=limit.reset_at,
            is_active=limit.is_active,
            last_reset_at=limit.last_reset_at,
            created_at=limit.created_at,
            updated_at=limit.updated_at
        )

# Notification Template Schemas

class NotificationTemplateBase(BaseModel):
    """Base notification template schema"""
    name: str = Field(..., max_length=100, description="Template name")
    description: Optional[str] = Field(None, description="Template description")
    type: str = Field(..., max_length=50, description="Template type")

class NotificationTemplateCreate(NotificationTemplateBase):
    """Schema for creating notification template"""
    subject: Optional[str] = Field(None, description="Email subject")
    body: str = Field(..., description="Template body")
    variables: Optional[Dict[str, Any]] = Field(None, description="Template variables")
    organization_id: Optional[int] = Field(None, description="Organization ID")

class NotificationTemplateUpdate(BaseModel):
    """Schema for updating notification template"""
    name: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    subject: Optional[str] = None
    body: Optional[str] = None
    variables: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None

class NotificationTemplateResponse(BaseModel):
    """Schema for notification template API responses"""
    id: int
    name: str
    description: Optional[str]
    type: str
    subject: Optional[str]
    body: str
    variables: Dict[str, Any]
    is_active: bool
    organization_id: Optional[int]
    created_by: int
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

    @classmethod
    def from_orm(cls, template):
        """Create response from ORM model"""
        return cls(
            id=template.id,
            name=template.name,
            description=template.description,
            type=template.type,
            subject=template.subject,
            body=template.body,
            variables=template.variables,
            is_active=template.is_active,
            organization_id=template.organization_id,
            created_by=template.created_by,
            created_at=template.created_at,
            updated_at=template.updated_at
        )

# Admin Dashboard Schemas

class AdminSummary(BaseModel):
    """Schema for admin dashboard summary"""
    organization: Dict[str, Any]
    users: Dict[str, Any]
    system: Dict[str, Any]
    features: Dict[str, Any]

class BulkOperationRequest(BaseModel):
    """Schema for bulk operations"""
    entity_type: str = Field(..., regex="^(user|organization|feature_flag)$", description="Entity type")
    entity_ids: List[int] = Field(..., min_items=1, max_items=100, description="Entity IDs")
    operation: str = Field(..., regex="^(activate|deactivate|delete|update)$", description="Operation")
    parameters: Optional[Dict[str, Any]] = Field(None, description="Operation parameters")

class BulkOperationResponse(BaseModel):
    """Schema for bulk operation responses"""
    success_count: int
    failed_count: int
    errors: List[str]
    processed_entities: List[int]

# User Invitation Schemas

class UserInvitation(BaseModel):
    """Schema for user invitations"""
    email: EmailStr = Field(..., description="Invitee email")
    role: UserRole = Field(UserRole.USER, description="Role to assign")
    message: Optional[str] = Field(None, description="Invitation message")
    expires_in_hours: int = Field(72, ge=1, le=168, description="Expiration in hours")

class UserInvitationResponse(BaseModel):
    """Schema for user invitation responses"""
    invitation_id: str
    email: str
    role: str
    expires_at: datetime
    invitation_url: str
    message: str

# API Key Management Schemas

class APIKeyCreate(BaseModel):
    """Schema for creating API keys"""
    name: str = Field(..., max_length=100, description="API key name")
    description: Optional[str] = Field(None, description="API key description")
    permissions: List[str] = Field(..., description="API permissions")
    expires_at: Optional[datetime] = Field(None, description="Expiration date")
    organization_id: Optional[int] = Field(None, description="Target organization")

class APIKeyResponse(BaseModel):
    """Schema for API key responses"""
    id: int
    name: str
    description: Optional[str]
    key_prefix: str
    permissions: List[str]
    is_active: bool
    last_used_at: Optional[datetime]
    expires_at: Optional[datetime]
    created_by: int
    created_at: Optional[datetime]
    
    # Note: Full key is only returned once during creation

# Usage Analytics Schemas

class UsageAnalyticsRequest(BaseModel):
    """Schema for usage analytics requests"""
    start_date: datetime = Field(..., description="Start date")
    end_date: datetime = Field(..., description="End date")
    granularity: str = Field("day", regex="^(hour|day|week|month)$", description="Data granularity")
    organization_id: Optional[int] = Field(None, description="Organization filter")
    user_id: Optional[int] = Field(None, description="User filter")

class UsageAnalyticsResponse(BaseModel):
    """Schema for usage analytics responses"""
    period: Dict[str, str]
    metrics: Dict[str, Any]
    trends: Dict[str, Any]
    top_entities: List[Dict[str, Any]]

# Compliance and Security Schemas

class ComplianceReport(BaseModel):
    """Schema for compliance reports"""
    report_type: str = Field(..., regex="^(gdpr|soc2|iso27001)$", description="Compliance type")
    organization_id: Optional[int] = Field(None, description="Organization filter")
    start_date: datetime = Field(..., description="Report start date")
    end_date: datetime = Field(..., description="Report end date")

class SecurityAudit(BaseModel):
    """Schema for security audits"""
    audit_type: str = Field(..., regex="^(password|2fa|session|permissions)$", description="Audit type")
    organization_id: Optional[int] = Field(None, description="Organization filter")
    include_inactive: bool = Field(False, description="Include inactive users")
    severity_filter: Optional[str] = Field(None, regex="^(low|medium|high|critical)$", description="Severity filter")

class ComplianceReportResponse(BaseModel):
    """Schema for compliance report responses"""
    report_id: str
    report_type: str
    organization_id: Optional[int]
    generated_at: datetime
    period: Dict[str, str]
    findings: List[Dict[str, Any]]
    recommendations: List[str]
    compliance_score: float
    export_url: Optional[str] = None

# Settings and Configuration Schemas

class SystemSettings(BaseModel):
    """Schema for system settings"""
    maintenance_mode: bool = Field(False, description="Maintenance mode")
    registration_enabled: bool = Field(True, description="User registration enabled")
    email_verification_required: bool = Field(True, description="Email verification required")
    default_user_role: UserRole = Field(UserRole.USER, description="Default user role")
    session_timeout_minutes: int = Field(480, ge=15, le=1440, description="Default session timeout")
    max_file_upload_size_mb: int = Field(100, ge=1, le=1000, description="Max file upload size")
    rate_limiting_enabled: bool = Field(True, description="Rate limiting enabled")

class SystemSettingsUpdate(BaseModel):
    """Schema for updating system settings"""
    maintenance_mode: Optional[bool] = None
    registration_enabled: Optional[bool] = None
    email_verification_required: Optional[bool] = None
    default_user_role: Optional[UserRole] = None
    session_timeout_minutes: Optional[int] = Field(None, ge=15, le=1440)
    max_file_upload_size_mb: Optional[int] = Field(None, ge=1, le=1000)
    rate_limiting_enabled: Optional[bool] = None

class OrganizationSettings(BaseModel):
    """Schema for organization settings"""
    allowed_domains: List[str] = Field(default_factory=list, description="Allowed email domains")
    sso_settings: Optional[Dict[str, Any]] = Field(None, description="SSO configuration")
    backup_settings: Dict[str, Any] = Field(default_factory=dict, description="Backup configuration")
    notification_settings: Dict[str, Any] = Field(default_factory=dict, description="Notification settings")
    security_settings: Dict[str, Any] = Field(default_factory=dict, description="Security settings")

# Validation helpers

class EmailList(BaseModel):
    """Helper for validating email lists"""
    emails: List[EmailStr] = Field(..., min_items=1, max_items=100, description="List of email addresses")

class PermissionList(BaseModel):
    """Helper for validating permission lists"""
    permissions: List[str] = Field(
        ...,
        description="List of permissions",
        regex="^(read|write|delete|admin)$"
    )

class PhoneNumber(BaseModel):
    """Helper for validating phone numbers"""
    phone: str = Field(..., description="Phone number")
    
    @validator('phone')
    def validate_phone(cls, v):
        """Validate phone number format"""
        if not re.match(r'^\+?[1-9]\d{1,14}$', v):
            raise ValueError('Invalid phone number format')
        return v