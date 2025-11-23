"""
Security & Enterprise Compliance Models
Phase 6: Security & Enterprise Compliance

Enterprise security models including:
- Advanced RBAC with ABAC (Attribute-Based Access Control)
- SOC2 Type II compliance framework
- ISO 27001 compliance framework
- Encryption key management
- Vulnerability management
- Penetration testing automation
- Incident management system
- Data residency and privacy controls
"""

from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
from enum import Enum
from sqlalchemy import (
    Column, Integer, String, DateTime, Boolean, JSON, Text, Float, 
    ForeignKey, Enum as SQLEnum, LargeBinary, UniqueConstraint, Index
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import hashlib
import secrets
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

Base = declarative_base()

# Enhanced Role System
class SecurityRole(str, Enum):
    """Extended role system for enterprise security"""
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
    """Supported compliance frameworks"""
    SOC2_TYPE_II = "soc2_type_ii"
    ISO27001 = "iso27001"
    GDPR = "gdpr"
    CCPA = "ccpa"
    HIPAA = "hipaa"
    PCI_DSS = "pci_dss"

class DataClassification(str, Enum):
    """Data classification levels"""
    PUBLIC = "public"
    INTERNAL = "internal"
    CONFIDENTIAL = "confidential"
    RESTRICTED = "restricted"
    TOP_SECRET = "top_secret"

class EncryptionAlgorithm(str, Enum):
    """Supported encryption algorithms"""
    AES256 = "aes_256"
    RSA2048 = "rsa_2048"
    RSA4096 = "rsa_4096"
    ECDSA_P256 = "ecdsa_p256"
    ECDSA_P384 = "ecdsa_p384"

class VulnerabilitySeverity(str, Enum):
    """Vulnerability severity levels"""
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"

class VulnerabilityStatus(str, Enum):
    """Vulnerability status tracking"""
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    WONT_FIX = "wont_fix"
    FALSE_POSITIVE = "false_positive"

class IncidentSeverity(str, Enum):
    """Incident severity levels"""
    P1_CRITICAL = "p1_critical"
    P2_HIGH = "p2_high"
    P3_MEDIUM = "p3_medium"
    P4_LOW = "p4_low"
    P5_INFO = "p5_info"

class IncidentStatus(str, Enum):
    """Incident status tracking"""
    OPEN = "open"
    INVESTIGATING = "investigating"
    CONTAINED = "contained"
    RESOLVED = "resolved"
    CLOSED = "closed"

class DataResidency(str, Enum):
    """Data residency regions"""
    US_EAST = "us_east"
    US_WEST = "us_west"
    EU_WEST = "eu_west"
    EU_CENTRAL = "eu_central"
    ASIA_PACIFIC = "asia_pacific"
    INDIA = "india"
    GLOBAL = "global"

class SecurityEventType(str, Enum):
    """Security event types for monitoring"""
    LOGIN_SUCCESS = "login_success"
    LOGIN_FAILURE = "login_failure"
    UNAUTHORIZED_ACCESS = "unauthorized_access"
    DATA_EXPORT = "data_export"
    CONFIGURATION_CHANGE = "configuration_change"
    SUSPICIOUS_ACTIVITY = "suspicious_activity"
    MALWARE_DETECTED = "malware_detected"
    POLICY_VIOLATION = "policy_violation"

class Permission(Base):
    """
    Fine-grained permission system with ABAC support
    """
    __tablename__ = "permissions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    
    # Permission scope
    resource = Column(String(50), nullable=False)  # dashboard, user, data, etc.
    action = Column(String(50), nullable=False)    # read, write, delete, etc.
    scope = Column(String(50), nullable=False)     # global, organization, user, resource
    
    # Attribute-based conditions
    conditions = Column(JSON, nullable=True, default={})  # ABAC conditions
    
    # Metadata
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert permission to dictionary"""
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "resource": self.resource,
            "action": self.action,
            "scope": self.scope,
            "conditions": self.conditions or {},
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

class RolePermission(Base):
    """
    Many-to-many relationship between roles and permissions
    """
    __tablename__ = "role_permissions"
    __table_args__ = (UniqueConstraint('role', 'permission_id', name='uq_role_permission'),)

    id = Column(Integer, primary_key=True, index=True)
    role = Column(SQLEnum(SecurityRole), nullable=False)
    permission_id = Column(Integer, ForeignKey("permissions.id"), nullable=False)
    
    # Conditional access based on context
    conditions = Column(JSON, nullable=True, default={})
    
    # Metadata
    granted_at = Column(DateTime(timezone=True), server_default=func.now())
    granted_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Relationships
    permission = relationship("Permission")
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert role permission to dictionary"""
        return {
            "id": self.id,
            "role": self.role,
            "permission_id": self.permission_id,
            "conditions": self.conditions or {},
            "granted_at": self.granted_at.isoformat() if self.granted_at else None,
            "permission": self.permission.to_dict() if self.permission else None
        }

class ComplianceControl(Base):
    """
    SOC2 Type II and ISO 27001 compliance control framework
    """
    __tablename__ = "compliance_controls"

    id = Column(Integer, primary_key=True, index=True)
    
    # Control identification
    control_id = Column(String(20), unique=True, nullable=False)  # CC1.1, A.5.1.1, etc.
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    
    # Compliance framework
    framework = Column(SQLEnum(ComplianceFramework), nullable=False)
    category = Column(String(100), nullable=False)
    
    # Control details
    control_type = Column(String(50), nullable=False)  # preventive, detective, corrective
    implementation_status = Column(String(20), default="not_implemented")  # not_implemented, in_progress, implemented
    
    # Evidence and monitoring
    evidence_required = Column(Boolean, default=True)
    monitoring_enabled = Column(Boolean, default=True)
    last_assessment_date = Column(DateTime(timezone=True), nullable=True)
    
    # Metrics
    effectiveness_score = Column(Float, default=0.0)  # 0.0 to 5.0
    risk_rating = Column(String(20), default="medium")  # low, medium, high, critical
    
    # Metadata
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert compliance control to dictionary"""
        return {
            "id": self.id,
            "control_id": self.control_id,
            "title": self.title,
            "description": self.description,
            "framework": self.framework,
            "category": self.category,
            "control_type": self.control_type,
            "implementation_status": self.implementation_status,
            "evidence_required": self.evidence_required,
            "monitoring_enabled": self.monitoring_enabled,
            "last_assessment_date": self.last_assessment_date.isoformat() if self.last_assessment_date else None,
            "effectiveness_score": self.effectiveness_score,
            "risk_rating": self.risk_rating,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

class EncryptionKey(Base):
    """
    Enterprise encryption key management
    """
    __tablename__ = "encryption_keys"

    id = Column(Integer, primary_key=True, index=True)
    
    # Key identification
    key_id = Column(String(100), unique=True, nullable=False)
    key_name = Column(String(200), nullable=False)
    
    # Key details
    algorithm = Column(SQLEnum(EncryptionAlgorithm), nullable=False)
    key_size = Column(Integer, nullable=False)
    key_material = Column(LargeBinary, nullable=False)  # Encrypted key material
    
    # Key lifecycle
    is_active = Column(Boolean, default=True)
    key_purpose = Column(String(100), nullable=False)  # database, communication, file_encryption
    
    # Rotation settings
    auto_rotate = Column(Boolean, default=True)
    rotation_period_days = Column(Integer, default=90)
    last_rotation_date = Column(DateTime(timezone=True), nullable=True)
    next_rotation_date = Column(DateTime(timezone=True), nullable=True)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Relationships
    created_by_user = relationship("User")
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert encryption key to dictionary"""
        return {
            "id": self.id,
            "key_id": self.key_id,
            "key_name": self.key_name,
            "algorithm": self.algorithm,
            "key_size": self.key_size,
            "is_active": self.is_active,
            "key_purpose": self.key_purpose,
            "auto_rotate": self.auto_rotate,
            "rotation_period_days": self.rotation_period_days,
            "last_rotation_date": self.last_rotation_date.isoformat() if self.last_rotation_date else None,
            "next_rotation_date": self.next_rotation_date.isoformat() if self.next_rotation_date else None,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

class Vulnerability(Base):
    """
    Vulnerability management system
    """
    __tablename__ = "vulnerabilities"

    id = Column(Integer, primary_key=True, index=True)
    
    # Vulnerability identification
    cve_id = Column(String(20), nullable=True)  # CVE-2023-1234
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    
    # Severity and classification
    severity = Column(SQLEnum(VulnerabilitySeverity), nullable=False)
    cvss_score = Column(Float, nullable=True)  # 0.0 to 10.0
    status = Column(SQLEnum(VulnerabilityStatus), default=Status.OPEN if False else VulnerabilityStatus.OPEN)
    
    # Asset information
    affected_system = Column(String(100), nullable=False)
    affected_component = Column(String(100), nullable=True)
    version_affected = Column(String(50), nullable=True)
    version_fixed = Column(String(50), nullable=True)
    
    # Remediation
    remediation_steps = Column(Text, nullable=True)
    remediation_deadline = Column(DateTime(timezone=True), nullable=True)
    
    # Detection information
    detection_date = Column(DateTime(timezone=True), server_default=func.now())
    detected_by = Column(String(100), nullable=True)  # tool, manual, report
    scanner_results = Column(JSON, nullable=True, default={})
    
    # Tracking
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=True)
    resolved_date = Column(DateTime(timezone=True), nullable=True)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    assigned_user = relationship("User", foreign_keys=[assigned_to])
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert vulnerability to dictionary"""
        return {
            "id": self.id,
            "cve_id": self.cve_id,
            "title": self.title,
            "description": self.description,
            "severity": self.severity,
            "cvss_score": self.cvss_score,
            "status": self.status,
            "affected_system": self.affected_system,
            "affected_component": self.affected_component,
            "version_affected": self.version_affected,
            "version_fixed": self.version_fixed,
            "remediation_steps": self.remediation_steps,
            "remediation_deadline": self.remediation_deadline.isoformat() if self.remediation_deadline else None,
            "detection_date": self.detection_date.isoformat() if self.detection_date else None,
            "detected_by": self.detected_by,
            "scanner_results": self.scanner_results or {},
            "assigned_to": self.assigned_to,
            "resolved_date": self.resolved_date.isoformat() if self.resolved_date else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "assigned_user": self.assigned_user.to_dict() if self.assigned_user else None
        }

class PenetrationTest(Base):
    """
    Penetration testing automation and tracking
    """
    __tablename__ = "penetration_tests"

    id = Column(Integer, primary_key=True, index=True)
    
    # Test identification
    test_name = Column(String(200), nullable=False)
    test_type = Column(String(50), nullable=False)  # automated, manual, red_team, social_engineering
    
    # Scheduling
    is_scheduled = Column(Boolean, default=True)
    schedule_type = Column(String(20), default="monthly")  # monthly, quarterly, annual
    next_test_date = Column(DateTime(timezone=True), nullable=True)
    last_test_date = Column(DateTime(timezone=True), nullable=True)
    
    # Test scope
    target_systems = Column(JSON, nullable=True, default=[])  # List of target systems
    test_scope = Column(Text, nullable=True)
    exclusions = Column(Text, nullable=True)
    
    # Test execution
    status = Column(String(20), default="pending")  # pending, in_progress, completed, failed
    execution_date = Column(DateTime(timezone=True), nullable=True)
    executor = Column(String(100), nullable=True)  # internal, external_vendor
    
    # Results
    findings_count = Column(Integer, default=0)
    critical_findings = Column(Integer, default=0)
    high_findings = Column(Integer, default=0)
    medium_findings = Column(Integer, default=0)
    low_findings = Column(Integer, default=0)
    
    # Report
    report_url = Column(String(500), nullable=True)
    executive_summary = Column(Text, nullable=True)
    
    # Compliance
    compliance_frameworks = Column(JSON, nullable=True, default=[])  # SOC2, ISO27001, etc.
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert penetration test to dictionary"""
        return {
            "id": self.id,
            "test_name": self.test_name,
            "test_type": self.test_type,
            "is_scheduled": self.is_scheduled,
            "schedule_type": self.schedule_type,
            "next_test_date": self.next_test_date.isoformat() if self.next_test_date else None,
            "last_test_date": self.last_test_date.isoformat() if self.last_test_date else None,
            "target_systems": self.target_systems or [],
            "test_scope": self.test_scope,
            "exclusions": self.exclusions,
            "status": self.status,
            "execution_date": self.execution_date.isoformat() if self.execution_date else None,
            "executor": self.executor,
            "findings_count": self.findings_count,
            "critical_findings": self.critical_findings,
            "high_findings": self.high_findings,
            "medium_findings": self.medium_findings,
            "low_findings": self.low_findings,
            "report_url": self.report_url,
            "executive_summary": self.executive_summary,
            "compliance_frameworks": self.compliance_frameworks or [],
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

class SecurityIncident(Base):
    """
    Comprehensive incident management system
    """
    __tablename__ = "security_incidents"
    __table_args__ = (Index('idx_incident_number', 'incident_number', unique=True),)

    id = Column(Integer, primary_key=True, index=True)
    
    # Incident identification
    incident_number = Column(String(20), unique=True, nullable=False)  # INC-2023-001
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    
    # Severity and classification
    severity = Column(SQLEnum(IncidentSeverity), nullable=False)
    incident_type = Column(String(100), nullable=False)  # security_breach, malware, ddos, unauthorized_access
    classification = Column(String(50), nullable=False)  # internal, external, third_party
    
    # Status tracking
    status = Column(SQLEnum(IncidentStatus), default=IncidentStatus.OPEN)
    priority = Column(Integer, nullable=False)  # 1-5, where 1 is highest
    
    # Timeline
    detected_at = Column(DateTime(timezone=True), nullable=False)
    acknowledged_at = Column(DateTime(timezone=True), nullable=True)
    contained_at = Column(DateTime(timezone=True), nullable=True)
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    closed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Assignment
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=True)
    assigned_team = Column(String(100), nullable=True)
    escalation_level = Column(Integer, default=0)  # 0-3 escalation levels
    
    # Impact assessment
    systems_affected = Column(JSON, nullable=True, default=[])  # List of affected systems
    users_affected = Column(Integer, default=0)
    data_classification = Column(SQLEnum(DataClassification), nullable=True)
    estimated_impact = Column(Text, nullable=True)
    
    # Response actions
    containment_actions = Column(Text, nullable=True)
    remediation_actions = Column(Text, nullable=True)
    lessons_learned = Column(Text, nullable=True)
    
    # Communication
    stakeholders_notified = Column(Boolean, default=False)
    regulatory_notified = Column(Boolean, default=False)
    customer_notification_required = Column(Boolean, default=False)
    
    # Investigation
    investigation_findings = Column(Text, nullable=True)
    root_cause = Column(Text, nullable=True)
    prevention_recommendations = Column(Text, nullable=True)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Relationships
    assigned_user = relationship("User", foreign_keys=[assigned_to])
    created_by_user = relationship("User", foreign_keys=[created_by])
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert security incident to dictionary"""
        return {
            "id": self.id,
            "incident_number": self.incident_number,
            "title": self.title,
            "description": self.description,
            "severity": self.severity,
            "incident_type": self.incident_type,
            "classification": self.classification,
            "status": self.status,
            "priority": self.priority,
            "detected_at": self.detected_at.isoformat() if self.detected_at else None,
            "acknowledged_at": self.acknowledged_at.isoformat() if self.acknowledged_at else None,
            "contained_at": self.contained_at.isoformat() if self.contained_at else None,
            "resolved_at": self.resolved_at.isoformat() if self.resolved_at else None,
            "closed_at": self.closed_at.isoformat() if self.closed_at else None,
            "assigned_to": self.assigned_to,
            "assigned_team": self.assigned_team,
            "escalation_level": self.escalation_level,
            "systems_affected": self.systems_affected or [],
            "users_affected": self.users_affected,
            "data_classification": self.data_classification,
            "estimated_impact": self.estimated_impact,
            "containment_actions": self.containment_actions,
            "remediation_actions": self.remediation_actions,
            "lessons_learned": self.lessons_learned,
            "stakeholders_notified": self.stakeholders_notified,
            "regulatory_notified": self.regulatory_notified,
            "customer_notification_required": self.customer_notification_required,
            "investigation_findings": self.investigation_findings,
            "root_cause": self.root_cause,
            "prevention_recommendations": self.prevention_recommendations,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "assigned_user": self.assigned_user.to_dict() if self.assigned_user else None,
            "created_by_user": self.created_by_user.to_dict() if self.created_by_user else None
        }

class DataResidencyPolicy(Base):
    """
    Data residency and privacy compliance management
    """
    __tablename__ = "data_residency_policies"

    id = Column(Integer, primary_key=True, index=True)
    
    # Policy identification
    policy_name = Column(String(100), unique=True, nullable=False)
    policy_type = Column(String(50), nullable=False)  # data_residency, privacy, retention
    description = Column(Text, nullable=True)
    
    # Data classification
    data_types = Column(JSON, nullable=True, default=[])  # user_data, transaction_data, logs
    data_classification = Column(SQLEnum(DataClassification), nullable=False)
    
    # Residency requirements
    primary_region = Column(SQLEnum(DataResidency), nullable=False)
    allowed_regions = Column(JSON, nullable=True, default=[])
    restricted_regions = Column(JSON, nullable=True, default=[])
    
    # Retention and deletion
    retention_period_days = Column(Integer, nullable=True)
    deletion_policy = Column(Text, nullable=True)
    archival_policy = Column(Text, nullable=True)
    
    # Compliance requirements
    applicable_regulations = Column(JSON, nullable=True, default=[])  # GDPR, CCPA, etc.
    consent_required = Column(Boolean, default=False)
    anonymization_required = Column(Boolean, default=False)
    
    # Privacy controls
    encryption_required = Column(Boolean, default=True)
    access_controls = Column(Text, nullable=True)
    audit_trail_required = Column(Boolean, default=True)
    
    # Implementation
    is_active = Column(Boolean, default=True)
    enforcement_status = Column(String(20), default="not_enforced")  # not_enforced, partial, fully_enforced
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Relationships
    created_by_user = relationship("User", foreign_keys=[created_by])
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert data residency policy to dictionary"""
        return {
            "id": self.id,
            "policy_name": self.policy_name,
            "policy_type": self.policy_type,
            "description": self.description,
            "data_types": self.data_types or [],
            "data_classification": self.data_classification,
            "primary_region": self.primary_region,
            "allowed_regions": self.allowed_regions or [],
            "restricted_regions": self.restricted_regions or [],
            "retention_period_days": self.retention_period_days,
            "deletion_policy": self.deletion_policy,
            "archival_policy": self.archival_policy,
            "applicable_regulations": self.applicable_regulations or [],
            "consent_required": self.consent_required,
            "anonymization_required": self.anonymization_required,
            "encryption_required": self.encryption_required,
            "access_controls": self.access_controls,
            "audit_trail_required": self.audit_trail_required,
            "is_active": self.is_active,
            "enforcement_status": self.enforcement_status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "created_by_user": self.created_by_user.to_dict() if self.created_by_user else None
        }

class SecurityEvent(Base):
    """
    Real-time security event monitoring
    """
    __tablename__ = "security_events"
    __table_args__ = (Index('idx_event_timestamp', 'created_at'), 
                     Index('idx_event_type_severity', 'event_type', 'severity'))

    id = Column(Integer, primary_key=True, index=True)
    
    # Event identification
    event_id = Column(String(100), unique=True, nullable=False)
    event_type = Column(SQLEnum(SecurityEventType), nullable=False)
    severity = Column(String(20), default="medium")  # low, medium, high, critical
    
    # Event details
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    
    # Context information
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    session_id = Column(String(100), nullable=True)
    
    # Additional context
    source_system = Column(String(100), nullable=True)
    target_resource = Column(String(200), nullable=True)
    event_data = Column(JSON, nullable=True, default={})
    
    # Detection and response
    detected_by = Column(String(100), nullable=True)  # system, rule, ai, manual
    automated_response = Column(Boolean, default=False)
    response_actions = Column(JSON, nullable=True, default=[])
    
    # Correlation
    related_events = Column(JSON, nullable=True, default=[])  # List of related event IDs
    incident_id = Column(Integer, ForeignKey("security_incidents.id"), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User")
    organization = relationship("Organization")
    incident = relationship("SecurityIncident")
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert security event to dictionary"""
        return {
            "id": self.id,
            "event_id": self.event_id,
            "event_type": self.event_type,
            "severity": self.severity,
            "title": self.title,
            "description": self.description,
            "user_id": self.user_id,
            "organization_id": self.organization_id,
            "ip_address": self.ip_address,
            "user_agent": self.user_agent,
            "session_id": self.session_id,
            "source_system": self.source_system,
            "target_resource": self.target_resource,
            "event_data": self.event_data or {},
            "detected_by": self.detected_by,
            "automated_response": self.automated_response,
            "response_actions": self.response_actions or [],
            "related_events": self.related_events or [],
            "incident_id": self.incident_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "user": self.user.to_dict() if self.user else None,
            "organization": self.organization.to_dict() if self.organization else None,
            "incident": self.incident.to_dict() if self.incident else None
        }

class ComplianceAssessment(Base):
    """
    Regular compliance assessments and certifications
    """
    __tablename__ = "compliance_assessments"

    id = Column(Integer, primary_key=True, index=True)
    
    # Assessment identification
    assessment_name = Column(String(200), nullable=False)
    framework = Column(SQLEnum(ComplianceFramework), nullable=False)
    assessment_type = Column(String(50), nullable=False)  # internal, external, certification
    
    # Status and results
    status = Column(String(20), default="planning")  # planning, in_progress, completed, failed
    overall_score = Column(Float, nullable=True)  # 0.0 to 100.0
    compliance_percentage = Column(Float, nullable=True)
    
    # Dates
    assessment_period_start = Column(DateTime(timezone=True), nullable=False)
    assessment_period_end = Column(DateTime(timezone=True), nullable=False)
    start_date = Column(DateTime(timezone=True), nullable=True)
    completion_date = Column(DateTime(timezone=True), nullable=True)
    next_assessment_date = Column(DateTime(timezone=True), nullable=True)
    
    # Assessor information
    lead_assessor = Column(String(100), nullable=True)
    assessment_team = Column(JSON, nullable=True, default=[])
    external_auditor = Column(String(100), nullable=True)
    
    # Scope and controls
    scope_description = Column(Text, nullable=True)
    controls_tested = Column(Integer, default=0)
    controls_passed = Column(Integer, default=0)
    controls_failed = Column(Integer, default=0)
    controls_not_applicable = Column(Integer, default=0)
    
    # Findings
    critical_findings = Column(Integer, default=0)
    high_findings = Column(Integer, default=0)
    medium_findings = Column(Integer, default=0)
    low_findings = Column(Integer, default=0)
    
    # Reports and evidence
    evidence_package_url = Column(String(500), nullable=True)
    assessment_report_url = Column(String(500), nullable=True)
    executive_summary = Column(Text, nullable=True)
    recommendations = Column(Text, nullable=True)
    
    # Certification
    certificate_issued = Column(Boolean, default=False)
    certificate_number = Column(String(100), nullable=True)
    certificate_valid_until = Column(DateTime(timezone=True), nullable=True)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Relationships
    created_by_user = relationship("User", foreign_keys=[created_by])
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert compliance assessment to dictionary"""
        return {
            "id": self.id,
            "assessment_name": self.assessment_name,
            "framework": self.framework,
            "assessment_type": self.assessment_type,
            "status": self.status,
            "overall_score": self.overall_score,
            "compliance_percentage": self.compliance_percentage,
            "assessment_period_start": self.assessment_period_start.isoformat() if self.assessment_period_start else None,
            "assessment_period_end": self.assessment_period_end.isoformat() if self.assessment_period_end else None,
            "start_date": self.start_date.isoformat() if self.start_date else None,
            "completion_date": self.completion_date.isoformat() if self.completion_date else None,
            "next_assessment_date": self.next_assessment_date.isoformat() if self.next_assessment_date else None,
            "lead_assessor": self.lead_assessor,
            "assessment_team": self.assessment_team or [],
            "external_auditor": self.external_auditor,
            "scope_description": self.scope_description,
            "controls_tested": self.controls_tested,
            "controls_passed": self.controls_passed,
            "controls_failed": self.controls_failed,
            "controls_not_applicable": self.controls_not_applicable,
            "critical_findings": self.critical_findings,
            "high_findings": self.high_findings,
            "medium_findings": self.medium_findings,
            "low_findings": self.low_findings,
            "evidence_package_url": self.evidence_package_url,
            "assessment_report_url": self.assessment_report_url,
            "executive_summary": self.executive_summary,
            "recommendations": self.recommendations,
            "certificate_issued": self.certificate_issued,
            "certificate_number": self.certificate_number,
            "certificate_valid_until": self.certificate_valid_until.isoformat() if self.certificate_valid_until else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "created_by_user": self.created_by_user.to_dict() if self.created_by_user else None
        }
# ============================================================================
# Utility Functions
# ============================================================================

def create_default_permissions(db: Session) -> List[Permission]:
    """Create default permissions for the system"""
    default_permissions = [
        # Dashboard permissions
        Permission(name="dashboard:create", description="Create new dashboards", resource="dashboard", action="create", scope="user"),
        Permission(name="dashboard:read", description="View dashboards", resource="dashboard", action="read", scope="user"),
        Permission(name="dashboard:update", description="Edit dashboards", resource="dashboard", action="update", scope="user"),
        Permission(name="dashboard:delete", description="Delete dashboards", resource="dashboard", action="delete", scope="user"),
        Permission(name="dashboard:share", description="Share dashboards", resource="dashboard", action="share", scope="user"),
        
        # Widget permissions
        Permission(name="widget:create", description="Create new widgets", resource="widget", action="create", scope="user"),
        Permission(name="widget:read", description="View widgets", resource="widget", action="read", scope="user"),
        Permission(name="widget:update", description="Edit widgets", resource="widget", action="update", scope="user"),
        Permission(name="widget:delete", description="Delete widgets", resource="widget", action="delete", scope="user"),
        
        # Security permissions
        Permission(name="security:read", description="View security information", resource="security", action="read", scope="global"),
        Permission(name="security:write", description="Modify security settings", resource="security", action="write", scope="global"),
        Permission(name="security:delete", description="Delete security data", resource="security", action="delete", scope="global"),
        
        # Compliance permissions
        Permission(name="compliance:read", description="View compliance information", resource="compliance", action="read", scope="global"),
        Permission(name="compliance:write", description="Modify compliance settings", resource="compliance", action="write", scope="global"),
        
        # Vulnerability permissions
        Permission(name="vulnerability:read", description="View vulnerabilities", resource="vulnerability", action="read", scope="global"),
        Permission(name="vulnerability:write", description="Modify vulnerabilities", resource="vulnerability", action="write", scope="global"),
        
        # Incident permissions
        Permission(name="incident:read", description="View incidents", resource="incident", action="read", scope="global"),
        Permission(name="incident:write", description="Modify incidents", resource="incident", action="write", scope="global"),
        
        # Encryption permissions
        Permission(name="encryption:read", description="View encryption keys", resource="encryption", action="read", scope="global"),
        Permission(name="encryption:write", description="Modify encryption keys", resource="encryption", action="write", scope="global"),
        
        # Privacy permissions
        Permission(name="privacy:read", description="View privacy settings", resource="privacy", action="read", scope="global"),
        Permission(name="privacy:write", description="Modify privacy settings", resource="privacy", action="write", scope="global"),
        
        # Penetration testing permissions
        Permission(name="pentest:read", description="View penetration tests", resource="pentest", action="read", scope="global"),
        Permission(name="pentest:write", description="Modify penetration tests", resource="pentest", action="write", scope="global"),
    ]
    
    db_permissions = []
    for perm_data in default_permissions:
        # Check if permission already exists
        existing = db.query(Permission).filter(
            and_(
                Permission.name == perm_data.name,
                Permission.resource == perm_data.resource,
                Permission.action == perm_data.action
            )
        ).first()
        
        if not existing:
            db.add(perm_data)
            db_permissions.append(perm_data)
    
    db.commit()
    return db_permissions

def create_default_compliance_controls(db: Session) -> List[ComplianceControl]:
    """Create default compliance controls for SOC2 and ISO 27001"""
    default_controls = [
        # SOC2 Type II Controls
        ComplianceControl(
            control_id="CC1.1",
            title="The entity demonstrates a commitment to integrity and ethical values",
            description="The entity's governing body and management demonstrate and promote integrity and ethical values",
            framework=ComplianceFramework.SOC2_TYPE_II,
            category="Control Environment",
            control_type="preventive",
            implementation_status="implemented"
        ),
        ComplianceControl(
            control_id="CC2.1",
            title="The board of directors exercises oversight responsibility",
            description="The board of directors oversees the entity's internal control system",
            framework=ComplianceFramework.SOC2_TYPE_II,
            category="Control Environment",
            control_type="preventive",
            implementation_status="implemented"
        ),
        ComplianceControl(
            control_id="CC3.1",
            title="Management establishes appropriate structure",
            description="Management establishes appropriate structure, reporting lines, and appropriate authorities",
            framework=ComplianceFramework.SOC2_TYPE_II,
            category="Control Environment",
            control_type="preventive",
            implementation_status="implemented"
        ),
        ComplianceControl(
            control_id="CC6.1",
            title="Logical and physical access controls",
            description="The entity implements logical access security software, infrastructure, and architectures",
            framework=ComplianceFramework.SOC2_TYPE_II,
            category="Logical Access",
            control_type="preventive",
            implementation_status="implemented"
        ),
        ComplianceControl(
            control_id="CC7.1",
            title="System monitoring activities",
            description="The entity monitors system components and the operation of those components",
            framework=ComplianceFramework.SOC2_TYPE_II,
            category="System Monitoring",
            control_type="detective",
            implementation_status="implemented"
        ),
        
        # ISO 27001 Controls
        ComplianceControl(
            control_id="A.5.1.1",
            title="Information security policies",
            description="A set of policies for information security has been defined, approved, and communicated",
            framework=ComplianceFramework.ISO27001,
            category="Information Security Policies",
            control_type="preventive",
            implementation_status="implemented"
        ),
        ComplianceControl(
            control_id="A.6.1.1",
            title="Information security roles and responsibilities",
            description="All information security responsibilities have been defined and allocated",
            framework=ComplianceFramework.ISO27001,
            category="Organization of Information Security",
            control_type="preventive",
            implementation_status="implemented"
        ),
        ComplianceControl(
            control_id="A.9.1.1",
            title="Access control policy",
            description="An access control policy has been established and communicated",
            framework=ComplianceFramework.ISO27001,
            category="Access Control",
            control_type="preventive",
            implementation_status="implemented"
        ),
        ComplianceControl(
            control_id="A.12.1.1",
            title="Documented operating procedures",
            description="Operating procedures have been documented and made available to all users who need them",
            framework=ComplianceFramework.ISO27001,
            category="Operations Security",
            control_type="preventive",
            implementation_status="implemented"
        ),
        ComplianceControl(
            control_id="A.13.1.1",
            title="Network security management",
            description="Network security management should be implemented and controlled",
            framework=ComplianceFramework.ISO27001,
            category="Communications Security",
            control_type="preventive",
            implementation_status="implemented"
        )
    ]
    
    db_controls = []
    for control_data in default_controls:
        # Check if control already exists
        existing = db.query(ComplianceControl).filter(
            ComplianceControl.control_id == control_data.control_id
        ).first()
        
        if not existing:
            db.add(control_data)
            db_controls.append(control_data)
    
    db.commit()
    return db_controls

def get_security_metrics(db: Session, time_range_days: int = 30) -> Dict[str, Any]:
    """Get comprehensive security metrics"""
    from datetime import datetime, timedelta
    
    start_date = datetime.utcnow() - timedelta(days=time_range_days)
    
    # Incident metrics
    incidents = db.query(SecurityIncident).filter(
        SecurityIncident.created_at >= start_date
    ).all()
    
    # Vulnerability metrics
    vulnerabilities = db.query(Vulnerability).filter(
        Vulnerability.created_at >= start_date
    ).all()
    
    # Security event metrics
    events = db.query(SecurityEvent).filter(
        SecurityEvent.created_at >= start_date
    ).all()
    
    # Compliance metrics
    soc2_controls = db.query(ComplianceControl).filter(
        ComplianceControl.framework == ComplianceFramework.SOC2_TYPE_II
    ).all()
    
    iso27001_controls = db.query(ComplianceControl).filter(
        ComplianceControl.framework == ComplianceFramework.ISO27001
    ).all()
    
    return {
        "incidents": {
            "total": len(incidents),
            "critical": len([i for i in incidents if i.severity == IncidentSeverity.P1_CRITICAL]),
            "resolved": len([i for i in incidents if i.status == IncidentStatus.RESOLVED]),
            "avg_resolution_time_hours": sum([
                (i.resolved_at - i.detected_at).total_seconds() / 3600 
                for i in incidents 
                if i.resolved_at and i.detected_at
            ]) / max(len([i for i in incidents if i.resolved_at]), 1) if any(i.resolved_at for i in incidents) else 0
        },
        "vulnerabilities": {
            "total": len(vulnerabilities),
            "open": len([v for v in vulnerabilities if v.status == VulnerabilityStatus.OPEN]),
            "critical": len([v for v in vulnerabilities if v.severity == VulnerabilitySeverity.CRITICAL]),
            "avg_cvss_score": sum([v.cvss_score or 0 for v in vulnerabilities]) / max(len(vulnerabilities), 1)
        },
        "security_events": {
            "total": len(events),
            "critical": len([e for e in events if e.severity == "critical"]),
            "by_type": {event_type: len([e for e in events if e.event_type == event_type]) for event_type in set([e.event_type for e in events])}
        },
        "compliance": {
            "soc2_controls": {
                "total": len(soc2_controls),
                "implemented": len([c for c in soc2_controls if c.implementation_status == "implemented"]),
                "effectiveness_score": sum([c.effectiveness_score for c in soc2_controls]) / max(len(soc2_controls), 1)
            },
            "iso27001_controls": {
                "total": len(iso27001_controls),
                "implemented": len([c for c in iso27001_controls if c.implementation_status == "implemented"]),
                "effectiveness_score": sum([c.effectiveness_score for c in iso27001_controls]) / max(len(iso27001_controls), 1)
            }
        }
    }

def evaluate_compliance_status(db: Session, framework: ComplianceFramework) -> Dict[str, Any]:
    """Evaluate compliance status for a specific framework"""
    controls = db.query(ComplianceControl).filter(
        ComplianceControl.framework == framework
    ).all()
    
    if not controls:
        return {"status": "no_controls", "message": "No controls defined for this framework"}
    
    total_controls = len(controls)
    implemented_controls = len([c for c in controls if c.implementation_status == "implemented"])
    in_progress_controls = len([c for c in controls if c.implementation_status == "in_progress"])
    not_implemented_controls = len([c for c in controls if c.implementation_status == "not_implemented"])
    
    implementation_percentage = (implemented_controls / total_controls) * 100
    
    # Calculate overall effectiveness
    effectiveness_scores = [c.effectiveness_score for c in controls if c.effectiveness_score > 0]
    avg_effectiveness = sum(effectiveness_scores) / len(effectiveness_scores) if effectiveness_scores else 0
    
    # Risk assessment
    high_risk_controls = len([c for c in controls if c.risk_rating == "high"])
    critical_risk_controls = len([c for c in controls if c.risk_rating == "critical"])
    
    # Determine compliance level
    if implementation_percentage >= 90 and avg_effectiveness >= 4.0:
        compliance_level = "excellent"
    elif implementation_percentage >= 75 and avg_effectiveness >= 3.0:
        compliance_level = "good"
    elif implementation_percentage >= 50 and avg_effectiveness >= 2.0:
        compliance_level = "needs_improvement"
    else:
        compliance_level = "poor"
    
    return {
        "framework": framework,
        "status": compliance_level,
        "implementation_percentage": round(implementation_percentage, 2),
        "total_controls": total_controls,
        "breakdown": {
            "implemented": implemented_controls,
            "in_progress": in_progress_controls,
            "not_implemented": not_implemented_controls
        },
        "effectiveness_score": round(avg_effectiveness, 2),
        "risk_assessment": {
            "high_risk_controls": high_risk_controls,
            "critical_risk_controls": critical_risk_controls
        },
        "last_updated": datetime.utcnow().isoformat()
    }