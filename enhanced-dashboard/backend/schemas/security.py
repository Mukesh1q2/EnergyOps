"""
Security & Enterprise Compliance Schemas
Phase 6: Security & Enterprise Compliance

Pydantic schemas for security and compliance API validation including:
- Advanced RBAC with ABAC
- SOC2 Type II compliance framework
- ISO 27001 compliance framework
- Encryption key management
- Vulnerability management
- Penetration testing automation
- Incident management system
- Data residency and privacy controls
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
from pydantic import BaseModel, Field, validator
from enum import Enum

# Enums for validation
class SecurityRole(str, Enum):
    SUPER_ADMIN = "super_admin"
    SECURITY_ADMIN = "security_admin"
    ORG_ADMIN = "org_admin"
    COMPLIANCE_OFFICER = "compliance_officer"
    AUDITOR = "auditor"
    USER = "user"
    VIEWER = "viewer"
    TRADER = "trader"
    ANALYST = "analyst"
    GUEST = "guest"

class ComplianceFramework(str, Enum):
    SOC2_TYPE_II = "soc2_type_ii"
    ISO27001 = "iso27001"
    GDPR = "gdpr"
    CCPA = "ccpa"
    HIPAA = "hipaa"
    PCI_DSS = "pci_dss"

class DataClassification(str, Enum):
    PUBLIC = "public"
    INTERNAL = "internal"
    CONFIDENTIAL = "confidential"
    RESTRICTED = "restricted"
    TOP_SECRET = "top_secret"

class EncryptionAlgorithm(str, Enum):
    AES256 = "aes_256"
    RSA2048 = "rsa_2048"
    RSA4096 = "rsa_4096"
    ECDSA_P256 = "ecdsa_p256"
    ECDSA_P384 = "ecdsa_p384"

class VulnerabilitySeverity(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"

class VulnerabilityStatus(str, Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    WONT_FIX = "wont_fix"
    FALSE_POSITIVE = "false_positive"

class IncidentSeverity(str, Enum):
    P1_CRITICAL = "p1_critical"
    P2_HIGH = "p2_high"
    P3_MEDIUM = "p3_medium"
    P4_LOW = "p4_low"
    P5_INFO = "p5_info"

class IncidentStatus(str, Enum):
    OPEN = "open"
    INVESTIGATING = "investigating"
    CONTAINED = "contained"
    RESOLVED = "resolved"
    CLOSED = "closed"

class DataResidency(str, Enum):
    US_EAST = "us_east"
    US_WEST = "us_west"
    EU_WEST = "eu_west"
    EU_CENTRAL = "eu_central"
    ASIA_PACIFIC = "asia_pacific"
    INDIA = "india"
    GLOBAL = "global"

class SecurityEventType(str, Enum):
    LOGIN_SUCCESS = "login_success"
    LOGIN_FAILURE = "login_failure"
    UNAUTHORIZED_ACCESS = "unauthorized_access"
    DATA_EXPORT = "data_export"
    CONFIGURATION_CHANGE = "configuration_change"
    SUSPICIOUS_ACTIVITY = "suspicious_activity"
    MALWARE_DETECTED = "malware_detected"
    POLICY_VIOLATION = "policy_violation"

# ============================================================================
# RBAC & Permission Schemas
# ============================================================================

class PermissionBase(BaseModel):
    name: str = Field(..., max_length=100, description="Permission name")
    description: Optional[str] = Field(None, description="Permission description")
    resource: str = Field(..., max_length=50, description="Resource this permission applies to")
    action: str = Field(..., max_length=50, description="Action allowed by this permission")
    scope: str = Field(..., max_length=50, description="Scope of the permission")
    conditions: Optional[Dict[str, Any]] = Field(default={}, description="ABAC conditions")
    is_active: bool = Field(default=True, description="Whether this permission is active")

class PermissionCreate(PermissionBase):
    """Schema for creating a new permission"""
    pass

class PermissionUpdate(BaseModel):
    """Schema for updating an existing permission"""
    name: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    resource: Optional[str] = Field(None, max_length=50)
    action: Optional[str] = Field(None, max_length=50)
    scope: Optional[str] = Field(None, max_length=50)
    conditions: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None

class PermissionResponse(PermissionBase):
    """Schema for permission response"""
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class RolePermissionBase(BaseModel):
    role: SecurityRole
    permission_id: int
    conditions: Optional[Dict[str, Any]] = Field(default={}, description="Conditional access conditions")

class RolePermissionCreate(RolePermissionBase):
    """Schema for creating a role permission assignment"""
    pass

class RolePermissionUpdate(BaseModel):
    """Schema for updating a role permission assignment"""
    conditions: Optional[Dict[str, Any]] = None

class RolePermissionResponse(RolePermissionBase):
    """Schema for role permission response"""
    id: int
    granted_at: Optional[datetime] = None
    granted_by: Optional[int] = None
    permission: Optional[Dict[str, Any]] = None
    
    class Config:
        from_attributes = True

# ============================================================================
# Compliance Controls Schemas
# ============================================================================

class ComplianceControlBase(BaseModel):
    control_id: str = Field(..., max_length=20, description="Control identifier (e.g., CC1.1)")
    title: str = Field(..., max_length=200, description="Control title")
    description: str = Field(..., description="Control description")
    framework: ComplianceFramework
    category: str = Field(..., max_length=100, description="Control category")
    control_type: str = Field(..., max_length=50, description="Control type (preventive/detective/corrective)")
    implementation_status: str = Field(default="not_implemented", description="Implementation status")
    evidence_required: bool = Field(default=True, description="Whether evidence is required")
    monitoring_enabled: bool = Field(default=True, description="Whether monitoring is enabled")
    effectiveness_score: float = Field(default=0.0, ge=0.0, le=5.0, description="Effectiveness score 0.0-5.0")
    risk_rating: str = Field(default="medium", description="Risk rating")

class ComplianceControlCreate(ComplianceControlBase):
    """Schema for creating a compliance control"""
    pass

class ComplianceControlUpdate(BaseModel):
    """Schema for updating a compliance control"""
    control_id: Optional[str] = Field(None, max_length=20)
    title: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = None
    framework: Optional[ComplianceFramework] = None
    category: Optional[str] = Field(None, max_length=100)
    control_type: Optional[str] = Field(None, max_length=50)
    implementation_status: Optional[str] = None
    evidence_required: Optional[bool] = None
    monitoring_enabled: Optional[bool] = None
    last_assessment_date: Optional[datetime] = None
    effectiveness_score: Optional[float] = Field(None, ge=0.0, le=5.0)
    risk_rating: Optional[str] = None
    is_active: Optional[bool] = None

class ComplianceControlResponse(ComplianceControlBase):
    """Schema for compliance control response"""
    id: int
    last_assessment_date: Optional[datetime] = None
    is_active: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# ============================================================================
# Encryption Key Management Schemas
# ============================================================================

class EncryptionKeyBase(BaseModel):
    key_id: str = Field(..., max_length=100, description="Unique key identifier")
    key_name: str = Field(..., max_length=200, description="Key name")
    algorithm: EncryptionAlgorithm
    key_size: int = Field(..., description="Key size in bits")
    is_active: bool = Field(default=True, description="Whether key is active")
    key_purpose: str = Field(..., max_length=100, description="Purpose of the key")
    auto_rotate: bool = Field(default=True, description="Whether to auto-rotate")
    rotation_period_days: int = Field(default=90, ge=1, le=3650, description="Rotation period in days")

class EncryptionKeyCreate(EncryptionKeyBase):
    """Schema for creating an encryption key"""
    pass

class EncryptionKeyUpdate(BaseModel):
    """Schema for updating an encryption key"""
    key_name: Optional[str] = Field(None, max_length=200)
    is_active: Optional[bool] = None
    auto_rotate: Optional[bool] = None
    rotation_period_days: Optional[int] = Field(None, ge=1, le=3650)

class EncryptionKeyResponse(EncryptionKeyBase):
    """Schema for encryption key response"""
    id: int
    key_material: Optional[bytes] = None  # Only included when creating
    last_rotation_date: Optional[datetime] = None
    next_rotation_date: Optional[datetime] = None
    created_at: Optional[datetime] = None
    created_by: Optional[int] = None
    
    class Config:
        from_attributes = True

# ============================================================================
# Vulnerability Management Schemas
# ============================================================================

class VulnerabilityBase(BaseModel):
    cve_id: Optional[str] = Field(None, max_length=20, description="CVE identifier")
    title: str = Field(..., max_length=200, description="Vulnerability title")
    description: str = Field(..., description="Vulnerability description")
    severity: VulnerabilitySeverity
    cvss_score: Optional[float] = Field(None, ge=0.0, le=10.0, description="CVSS score")
    status: VulnerabilityStatus = Field(default=VulnerabilityStatus.OPEN)
    affected_system: str = Field(..., max_length=100, description="Affected system")
    affected_component: Optional[str] = Field(None, max_length=100, description="Affected component")
    version_affected: Optional[str] = Field(None, max_length=50, description="Affected version")
    version_fixed: Optional[str] = Field(None, max_length=50, description="Fixed version")
    remediation_steps: Optional[str] = Field(None, description="Remediation steps")
    remediation_deadline: Optional[datetime] = Field(None, description="Remediation deadline")
    detected_by: Optional[str] = Field(None, max_length=100, description="Detection method")
    scanner_results: Optional[Dict[str, Any]] = Field(default={}, description="Scanner results")
    assigned_to: Optional[int] = Field(None, description="Assigned user ID")

class VulnerabilityCreate(VulnerabilityBase):
    """Schema for creating a vulnerability"""
    pass

class VulnerabilityUpdate(BaseModel):
    """Schema for updating a vulnerability"""
    title: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = None
    severity: Optional[VulnerabilitySeverity] = None
    cvss_score: Optional[float] = Field(None, ge=0.0, le=10.0)
    status: Optional[VulnerabilityStatus] = None
    affected_component: Optional[str] = Field(None, max_length=100)
    version_affected: Optional[str] = Field(None, max_length=50)
    version_fixed: Optional[str] = Field(None, max_length=50)
    remediation_steps: Optional[str] = None
    remediation_deadline: Optional[datetime] = None
    scanner_results: Optional[Dict[str, Any]] = None
    assigned_to: Optional[int] = None
    resolved_date: Optional[datetime] = None

class VulnerabilityResponse(VulnerabilityBase):
    """Schema for vulnerability response"""
    id: int
    resolved_date: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    assigned_user: Optional[Dict[str, Any]] = None
    
    class Config:
        from_attributes = True

class VulnerabilityDashboard(BaseModel):
    """Schema for vulnerability dashboard"""
    total_vulnerabilities: int
    status_breakdown: Dict[str, int]
    severity_breakdown: Dict[str, int]
    average_cvss_score: float
    critical_vulnerabilities: int
    high_vulnerabilities: int

# ============================================================================
# Penetration Testing Schemas
# ============================================================================

class PenetrationTestBase(BaseModel):
    test_name: str = Field(..., max_length=200, description="Test name")
    test_type: str = Field(..., max_length=50, description="Test type")
    is_scheduled: bool = Field(default=True, description="Whether test is scheduled")
    schedule_type: str = Field(default="monthly", description="Schedule frequency")
    next_test_date: Optional[datetime] = Field(None, description="Next test date")
    target_systems: Optional[List[str]] = Field(default=[], description="Target systems")
    test_scope: Optional[str] = Field(None, description="Test scope")
    exclusions: Optional[str] = Field(None, description="Test exclusions")
    executor: Optional[str] = Field(None, max_length=100, description="Test executor")
    compliance_frameworks: Optional[List[str]] = Field(default=[], description="Applicable frameworks")

class PenetrationTestCreate(PenetrationTestBase):
    """Schema for creating a penetration test"""
    pass

class PenetrationTestUpdate(BaseModel):
    """Schema for updating a penetration test"""
    test_name: Optional[str] = Field(None, max_length=200)
    test_type: Optional[str] = Field(None, max_length=50)
    is_scheduled: Optional[bool] = None
    schedule_type: Optional[str] = None
    next_test_date: Optional[datetime] = None
    last_test_date: Optional[datetime] = None
    target_systems: Optional[List[str]] = None
    test_scope: Optional[str] = None
    exclusions: Optional[str] = None
    status: Optional[str] = None
    execution_date: Optional[datetime] = None
    executor: Optional[str] = Field(None, max_length=100)
    findings_count: Optional[int] = None
    critical_findings: Optional[int] = None
    high_findings: Optional[int] = None
    medium_findings: Optional[int] = None
    low_findings: Optional[int] = None
    report_url: Optional[str] = Field(None, max_length=500)
    executive_summary: Optional[str] = None
    compliance_frameworks: Optional[List[str]] = None

class PenetrationTestResponse(PenetrationTestBase):
    """Schema for penetration test response"""
    id: int
    status: str
    execution_date: Optional[datetime] = None
    last_test_date: Optional[datetime] = None
    findings_count: int
    critical_findings: int
    high_findings: int
    medium_findings: int
    low_findings: int
    report_url: Optional[str] = None
    executive_summary: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# ============================================================================
# Incident Management Schemas
# ============================================================================

class SecurityIncidentBase(BaseModel):
    title: str = Field(..., max_length=200, description="Incident title")
    description: str = Field(..., description="Incident description")
    severity: IncidentSeverity
    incident_type: str = Field(..., max_length=100, description="Type of incident")
    classification: str = Field(..., max_length=50, description="Incident classification")
    status: IncidentStatus = Field(default=IncidentStatus.OPEN)
    priority: int = Field(..., ge=1, le=5, description="Priority 1-5")
    assigned_to: Optional[int] = Field(None, description="Assigned user ID")
    assigned_team: Optional[str] = Field(None, max_length=100, description="Assigned team")
    escalation_level: int = Field(default=0, ge=0, le=3, description="Escalation level")
    systems_affected: Optional[List[str]] = Field(default=[], description="Affected systems")
    users_affected: int = Field(default=0, ge=0, description="Number of users affected")
    data_classification: Optional[DataClassification] = None
    estimated_impact: Optional[str] = Field(None, description="Estimated impact")
    containment_actions: Optional[str] = Field(None, description="Containment actions")
    remediation_actions: Optional[str] = Field(None, description="Remediation actions")
    lessons_learned: Optional[str] = Field(None, description="Lessons learned")
    stakeholders_notified: bool = Field(default=False, description="Whether stakeholders were notified")
    regulatory_notified: bool = Field(default=False, description="Whether regulators were notified")
    customer_notification_required: bool = Field(default=False, description="Customer notification required")
    investigation_findings: Optional[str] = Field(None, description="Investigation findings")
    root_cause: Optional[str] = Field(None, description="Root cause analysis")
    prevention_recommendations: Optional[str] = Field(None, description="Prevention recommendations")

class SecurityIncidentCreate(SecurityIncidentBase):
    """Schema for creating a security incident"""
    detected_at: Optional[datetime] = Field(None, description="Detection time")

class SecurityIncidentUpdate(BaseModel):
    """Schema for updating a security incident"""
    title: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = None
    severity: Optional[IncidentSeverity] = None
    incident_type: Optional[str] = Field(None, max_length=100)
    classification: Optional[str] = Field(None, max_length=50)
    status: Optional[IncidentStatus] = None
    priority: Optional[int] = Field(None, ge=1, le=5)
    assigned_to: Optional[int] = None
    assigned_team: Optional[str] = Field(None, max_length=100)
    escalation_level: Optional[int] = Field(None, ge=0, le=3)
    systems_affected: Optional[List[str]] = None
    users_affected: Optional[int] = Field(None, ge=0)
    data_classification: Optional[DataClassification] = None
    estimated_impact: Optional[str] = None
    containment_actions: Optional[str] = None
    remediation_actions: Optional[str] = None
    lessons_learned: Optional[str] = None
    stakeholders_notified: Optional[bool] = None
    regulatory_notified: Optional[bool] = None
    customer_notification_required: Optional[bool] = None
    investigation_findings: Optional[str] = None
    root_cause: Optional[str] = None
    prevention_recommendations: Optional[str] = None
    acknowledged_at: Optional[datetime] = None
    contained_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    closed_at: Optional[datetime] = None

class SecurityIncidentResponse(SecurityIncidentBase):
    """Schema for security incident response"""
    id: int
    incident_number: str
    detected_at: datetime
    acknowledged_at: Optional[datetime] = None
    contained_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    closed_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    created_by: Optional[int] = None
    assigned_user: Optional[Dict[str, Any]] = None
    created_by_user: Optional[Dict[str, Any]] = None
    
    class Config:
        from_attributes = True

# ============================================================================
# Security Events Schemas
# ============================================================================

class SecurityEventBase(BaseModel):
    event_id: str = Field(..., max_length=100, description="Unique event identifier")
    event_type: SecurityEventType
    severity: str = Field(default="medium", description="Event severity")
    title: str = Field(..., max_length=200, description="Event title")
    description: str = Field(..., description="Event description")
    user_id: Optional[int] = Field(None, description="Associated user ID")
    organization_id: int = Field(..., description="Organization ID")
    ip_address: Optional[str] = Field(None, description="IP address")
    user_agent: Optional[str] = Field(None, description="User agent")
    session_id: Optional[str] = Field(None, max_length=100, description="Session ID")
    source_system: Optional[str] = Field(None, max_length=100, description="Source system")
    target_resource: Optional[str] = Field(None, max_length=200, description="Target resource")
    event_data: Optional[Dict[str, Any]] = Field(default={}, description="Event data")
    detected_by: Optional[str] = Field(None, max_length=100, description="Detection method")
    automated_response: bool = Field(default=False, description="Whether automated response was taken")
    response_actions: Optional[List[str]] = Field(default=[], description="Response actions taken")
    related_events: Optional[List[str]] = Field(default=[], description="Related event IDs")
    incident_id: Optional[int] = Field(None, description="Associated incident ID")

class SecurityEventCreate(SecurityEventBase):
    """Schema for creating a security event"""
    created_at: Optional[datetime] = Field(None, description="Event timestamp")

class SecurityEventResponse(SecurityEventBase):
    """Schema for security event response"""
    id: int
    created_at: datetime
    user: Optional[Dict[str, Any]] = None
    organization: Optional[Dict[str, Any]] = None
    incident: Optional[Dict[str, Any]] = None
    
    class Config:
        from_attributes = True

class SecurityEventQuery(BaseModel):
    """Schema for querying security events"""
    event_type: Optional[SecurityEventType] = None
    severity: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    user_id: Optional[int] = None
    organization_id: Optional[int] = None

# ============================================================================
# Data Residency & Privacy Schemas
# ============================================================================

class DataResidencyPolicyBase(BaseModel):
    policy_name: str = Field(..., max_length=100, description="Policy name")
    policy_type: str = Field(..., max_length=50, description="Policy type")
    description: Optional[str] = Field(None, description="Policy description")
    data_types: Optional[List[str]] = Field(default=[], description="Affected data types")
    data_classification: DataClassification
    primary_region: DataResidency
    allowed_regions: Optional[List[DataResidency]] = Field(default=[], description="Allowed regions")
    restricted_regions: Optional[List[DataResidency]] = Field(default=[], description="Restricted regions")
    retention_period_days: Optional[int] = Field(None, ge=1, description="Retention period in days")
    deletion_policy: Optional[str] = Field(None, description="Deletion policy")
    archival_policy: Optional[str] = Field(None, description="Archival policy")
    applicable_regulations: Optional[List[str]] = Field(default=[], description="Applicable regulations")
    consent_required: bool = Field(default=False, description="Consent required")
    anonymization_required: bool = Field(default=False, description="Anonymization required")
    encryption_required: bool = Field(default=True, description="Encryption required")
    access_controls: Optional[str] = Field(None, description="Access controls")
    audit_trail_required: bool = Field(default=True, description="Audit trail required")
    is_active: bool = Field(default=True, description="Policy is active")
    enforcement_status: str = Field(default="not_enforced", description="Enforcement status")

class DataResidencyPolicyCreate(DataResidencyPolicyBase):
    """Schema for creating a data residency policy"""
    pass

class DataResidencyPolicyUpdate(BaseModel):
    """Schema for updating a data residency policy"""
    policy_name: Optional[str] = Field(None, max_length=100)
    policy_type: Optional[str] = Field(None, max_length=50)
    description: Optional[str] = None
    data_types: Optional[List[str]] = None
    data_classification: Optional[DataClassification] = None
    primary_region: Optional[DataResidency] = None
    allowed_regions: Optional[List[DataResidency]] = None
    restricted_regions: Optional[List[DataResidency]] = None
    retention_period_days: Optional[int] = Field(None, ge=1)
    deletion_policy: Optional[str] = None
    archival_policy: Optional[str] = None
    applicable_regulations: Optional[List[str]] = None
    consent_required: Optional[bool] = None
    anonymization_required: Optional[bool] = None
    encryption_required: Optional[bool] = None
    access_controls: Optional[str] = None
    audit_trail_required: Optional[bool] = None
    is_active: Optional[bool] = None
    enforcement_status: Optional[str] = None

class DataResidencyPolicyResponse(DataResidencyPolicyBase):
    """Schema for data residency policy response"""
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    created_by: Optional[int] = None
    created_by_user: Optional[Dict[str, Any]] = None
    
    class Config:
        from_attributes = True

# ============================================================================
# Compliance Assessment Schemas
# ============================================================================

class ComplianceAssessmentBase(BaseModel):
    assessment_name: str = Field(..., max_length=200, description="Assessment name")
    framework: ComplianceFramework
    assessment_type: str = Field(..., max_length=50, description="Assessment type")
    status: str = Field(default="planning", description="Assessment status")
    overall_score: Optional[float] = Field(None, ge=0.0, le=100.0, description="Overall score 0-100")
    compliance_percentage: Optional[float] = Field(None, ge=0.0, le=100.0, description="Compliance percentage")
    assessment_period_start: datetime
    assessment_period_end: datetime
    start_date: Optional[datetime] = Field(None, description="Assessment start date")
    completion_date: Optional[datetime] = Field(None, description="Assessment completion date")
    next_assessment_date: Optional[datetime] = Field(None, description="Next assessment date")
    lead_assessor: Optional[str] = Field(None, max_length=100, description="Lead assessor")
    assessment_team: Optional[List[str]] = Field(default=[], description="Assessment team")
    external_auditor: Optional[str] = Field(None, max_length=100, description="External auditor")
    scope_description: Optional[str] = Field(None, description="Assessment scope")
    controls_tested: int = Field(default=0, ge=0, description="Controls tested")
    controls_passed: int = Field(default=0, ge=0, description="Controls passed")
    controls_failed: int = Field(default=0, ge=0, description="Controls failed")
    controls_not_applicable: int = Field(default=0, ge=0, description="Controls not applicable")
    critical_findings: int = Field(default=0, ge=0, description="Critical findings")
    high_findings: int = Field(default=0, ge=0, description="High findings")
    medium_findings: int = Field(default=0, ge=0, description="Medium findings")
    low_findings: int = Field(default=0, ge=0, description="Low findings")
    evidence_package_url: Optional[str] = Field(None, max_length=500, description="Evidence package URL")
    assessment_report_url: Optional[str] = Field(None, max_length=500, description="Assessment report URL")
    executive_summary: Optional[str] = Field(None, description="Executive summary")
    recommendations: Optional[str] = Field(None, description="Recommendations")
    certificate_issued: bool = Field(default=False, description="Certificate issued")
    certificate_number: Optional[str] = Field(None, max_length=100, description="Certificate number")
    certificate_valid_until: Optional[datetime] = Field(None, description="Certificate validity")

class ComplianceAssessmentCreate(ComplianceAssessmentBase):
    """Schema for creating a compliance assessment"""
    pass

class ComplianceAssessmentUpdate(BaseModel):
    """Schema for updating a compliance assessment"""
    assessment_name: Optional[str] = Field(None, max_length=200)
    framework: Optional[ComplianceFramework] = None
    assessment_type: Optional[str] = Field(None, max_length=50)
    status: Optional[str] = None
    overall_score: Optional[float] = Field(None, ge=0.0, le=100.0)
    compliance_percentage: Optional[float] = Field(None, ge=0.0, le=100.0)
    start_date: Optional[datetime] = None
    completion_date: Optional[datetime] = None
    next_assessment_date: Optional[datetime] = None
    lead_assessor: Optional[str] = Field(None, max_length=100)
    assessment_team: Optional[List[str]] = None
    external_auditor: Optional[str] = Field(None, max_length=100)
    scope_description: Optional[str] = None
    controls_tested: Optional[int] = Field(None, ge=0)
    controls_passed: Optional[int] = Field(None, ge=0)
    controls_failed: Optional[int] = Field(None, ge=0)
    controls_not_applicable: Optional[int] = Field(None, ge=0)
    critical_findings: Optional[int] = Field(None, ge=0)
    high_findings: Optional[int] = Field(None, ge=0)
    medium_findings: Optional[int] = Field(None, ge=0)
    low_findings: Optional[int] = Field(None, ge=0)
    evidence_package_url: Optional[str] = Field(None, max_length=500)
    assessment_report_url: Optional[str] = Field(None, max_length=500)
    executive_summary: Optional[str] = None
    recommendations: Optional[str] = None
    certificate_issued: Optional[bool] = None
    certificate_number: Optional[str] = Field(None, max_length=100)
    certificate_valid_until: Optional[datetime] = None

class ComplianceAssessmentResponse(ComplianceAssessmentBase):
    """Schema for compliance assessment response"""
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    created_by: Optional[int] = None
    created_by_user: Optional[Dict[str, Any]] = None
    
    class Config:
        from_attributes = True

# ============================================================================
# Dashboard & Metrics Schemas
# ============================================================================

class SecurityDashboardResponse(BaseModel):
    """Schema for security dashboard response"""
    security_overview: Dict[str, Any]
    compliance_status: Dict[str, Any]
    risk_metrics: Dict[str, Any]
    last_updated: str

class SecurityMetricsResponse(BaseModel):
    """Schema for security metrics response"""
    time_range: str
    incident_metrics: Dict[str, Any]
    vulnerability_metrics: Dict[str, Any]
    event_metrics: Dict[str, Any]
    generated_at: str

class ComplianceDashboard(BaseModel):
    """Schema for compliance dashboard"""
    framework: ComplianceFramework
    total_controls: int
    implementation_summary: Dict[str, int]
    overall_effectiveness: float
    compliance_percentage: float
    categories: Dict[str, Any]

# ============================================================================
# Utility Schemas
# ============================================================================

class SecurityEventFilter(BaseModel):
    """Schema for filtering security events"""
    event_type: Optional[SecurityEventType] = None
    severity: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    user_id: Optional[int] = None
    organization_id: Optional[int] = None

class IncidentTimelineEvent(BaseModel):
    """Schema for incident timeline events"""
    timestamp: datetime
    type: str
    description: str
    user: Optional[Dict[str, Any]] = None
    event_data: Optional[Dict[str, Any]] = None

class IncidentTimelineResponse(BaseModel):
    """Schema for incident timeline response"""
    incident: Dict[str, Any]
    timeline: List[IncidentTimelineEvent]

class PenetrationTestSchedule(BaseModel):
    """Schema for penetration test scheduling"""
    test_type: str
    schedule_frequency: str
    next_execution: datetime
    target_systems: List[str]
    compliance_frameworks: List[str]