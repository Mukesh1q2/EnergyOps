"""
Security & Enterprise Compliance API Endpoints
Phase 6: Security & Enterprise Compliance

RESTful API endpoints for:
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
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc
import logging

from ...core.database import get_db
from ...schemas.security import (
    PermissionCreate, PermissionUpdate, PermissionResponse,
    RolePermissionCreate, RolePermissionResponse, RolePermissionUpdate,
    ComplianceControlCreate, ComplianceControlUpdate, ComplianceControlResponse,
    EncryptionKeyCreate, EncryptionKeyUpdate, EncryptionKeyResponse,
    VulnerabilityCreate, VulnerabilityUpdate, VulnerabilityResponse,
    PenetrationTestCreate, PenetrationTestUpdate, PenetrationTestResponse,
    SecurityIncidentCreate, SecurityIncidentUpdate, SecurityIncidentResponse,
    DataResidencyPolicyCreate, DataResidencyPolicyUpdate, DataResidencyPolicyResponse,
    SecurityEventResponse, SecurityEventQuery,
    ComplianceAssessmentCreate, ComplianceAssessmentUpdate, ComplianceAssessmentResponse,
    SecurityDashboardResponse, SecurityMetricsResponse
)
from ...core.auth import get_current_user, require_permissions
from ...models.security import (
    Permission, RolePermission, ComplianceControl, EncryptionKey,
    Vulnerability, PenetrationTest, SecurityIncident, DataResidencyPolicy,
    SecurityEvent, ComplianceAssessment, SecurityRole, ComplianceFramework,
    VulnerabilitySeverity, IncidentSeverity
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/security", tags=["security"])

# ============================================================================
# RBAC & Permission Management
# ============================================================================

@router.get("/permissions", response_model=List[PermissionResponse])
async def list_permissions(
    skip: int = 0,
    limit: int = 100,
    resource: Optional[str] = Query(None, description="Filter by resource"),
    action: Optional[str] = Query(None, description="Filter by action"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(require_permissions(["security:read"]))
):
    """List all permissions with filtering"""
    query = db.query(Permission)
    
    if resource:
        query = query.filter(Permission.resource == resource)
    if action:
        query = query.filter(Permission.action == action)
    if is_active is not None:
        query = query.filter(Permission.is_active == is_active)
    
    permissions = query.offset(skip).limit(limit).all()
    return [Permission.to_dict(p) for p in permissions]

@router.post("/permissions", response_model=PermissionResponse)
async def create_permission(
    permission: PermissionCreate,
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(require_permissions(["security:write"]))
):
    """Create a new permission"""
    db_permission = Permission(**permission.dict())
    db.add(db_permission)
    db.commit()
    db.refresh(db_permission)
    return Permission.to_dict(db_permission)

@router.put("/permissions/{permission_id}", response_model=PermissionResponse)
async def update_permission(
    permission_id: int,
    permission: PermissionUpdate,
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(require_permissions(["security:write"]))
):
    """Update an existing permission"""
    db_permission = db.query(Permission).filter(Permission.id == permission_id).first()
    if not db_permission:
        raise HTTPException(status_code=404, detail="Permission not found")
    
    update_data = permission.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_permission, field, value)
    
    db.commit()
    db.refresh(db_permission)
    return Permission.to_dict(db_permission)

@router.delete("/permissions/{permission_id}")
async def delete_permission(
    permission_id: int,
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(require_permissions(["security:delete"]))
):
    """Delete a permission"""
    db_permission = db.query(Permission).filter(Permission.id == permission_id).first()
    if not db_permission:
        raise HTTPException(status_code=404, detail="Permission not found")
    
    db.delete(db_permission)
    db.commit()
    return {"message": "Permission deleted successfully"}

@router.get("/role-permissions", response_model=List[RolePermissionResponse])
async def list_role_permissions(
    role: Optional[SecurityRole] = Query(None, description="Filter by role"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(require_permissions(["security:read"]))
):
    """List role permissions"""
    query = db.query(RolePermission)
    
    if role:
        query = query.filter(RolePermission.role == role)
    
    role_permissions = query.offset(skip).limit(limit).all()
    return [RolePermission.to_dict(rp) for rp in role_permissions]

@router.post("/role-permissions", response_model=RolePermissionResponse)
async def assign_permission_to_role(
    role_permission: RolePermissionCreate,
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(require_permissions(["security:write"]))
):
    """Assign a permission to a role"""
    # Check if assignment already exists
    existing = db.query(RolePermission).filter(
        and_(
            RolePermission.role == role_permission.role,
            RolePermission.permission_id == role_permission.permission_id
        )
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Permission already assigned to role")
    
    db_role_permission = RolePermission(**role_permission.dict())
    db_role_permission.granted_by = current_user["id"]
    db.add(db_role_permission)
    db.commit()
    db.refresh(db_role_permission)
    return RolePermission.to_dict(db_role_permission)

@router.delete("/role-permissions/{role_permission_id}")
async def remove_permission_from_role(
    role_permission_id: int,
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(require_permissions(["security:delete"]))
):
    """Remove permission from role"""
    db_role_permission = db.query(RolePermission).filter(RolePermission.id == role_permission_id).first()
    if not db_role_permission:
        raise HTTPException(status_code=404, detail="Role permission not found")
    
    db.delete(db_role_permission)
    db.commit()
    return {"message": "Permission removed from role successfully"}

# ============================================================================
# Compliance Controls
# ============================================================================

@router.get("/compliance-controls", response_model=List[ComplianceControlResponse])
async def list_compliance_controls(
    framework: Optional[ComplianceFramework] = Query(None, description="Filter by framework"),
    category: Optional[str] = Query(None, description="Filter by category"),
    implementation_status: Optional[str] = Query(None, description="Filter by status"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(require_permissions(["compliance:read"]))
):
    """List compliance controls"""
    query = db.query(ComplianceControl)
    
    if framework:
        query = query.filter(ComplianceControl.framework == framework)
    if category:
        query = query.filter(ComplianceControl.category == category)
    if implementation_status:
        query = query.filter(ComplianceControl.implementation_status == implementation_status)
    
    controls = query.offset(skip).limit(limit).all()
    return [ComplianceControl.to_dict(control) for control in controls]

@router.post("/compliance-controls", response_model=ComplianceControlResponse)
async def create_compliance_control(
    control: ComplianceControlCreate,
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(require_permissions(["compliance:write"]))
):
    """Create a new compliance control"""
    db_control = ComplianceControl(**control.dict())
    db.add(db_control)
    db.commit()
    db.refresh(db_control)
    return ComplianceControl.to_dict(db_control)

@router.put("/compliance-controls/{control_id}", response_model=ComplianceControlResponse)
async def update_compliance_control(
    control_id: int,
    control: ComplianceControlUpdate,
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(require_permissions(["compliance:write"]))
):
    """Update a compliance control"""
    db_control = db.query(ComplianceControl).filter(ComplianceControl.id == control_id).first()
    if not db_control:
        raise HTTPException(status_code=404, detail="Compliance control not found")
    
    update_data = control.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_control, field, value)
    
    db.commit()
    db.refresh(db_control)
    return ComplianceControl.to_dict(db_control)

@router.get("/compliance/frameworks/{framework}/dashboard")
async def get_compliance_dashboard(
    framework: ComplianceFramework,
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(require_permissions(["compliance:read"]))
):
    """Get compliance dashboard for a specific framework"""
    controls = db.query(ComplianceControl).filter(ComplianceControl.framework == framework).all()
    
    total_controls = len(controls)
    implemented = len([c for c in controls if c.implementation_status == "implemented"])
    in_progress = len([c for c in controls if c.implementation_status == "in_progress"])
    not_implemented = len([c for c in controls if c.implementation_status == "not_implemented"])
    
    effectiveness_scores = [c.effectiveness_score for c in controls if c.effectiveness_score > 0]
    avg_effectiveness = sum(effectiveness_scores) / len(effectiveness_scores) if effectiveness_scores else 0
    
    # Control categories
    categories = {}
    for control in controls:
        category = control.category
        if category not in categories:
            categories[category] = {
                "total": 0,
                "implemented": 0,
                "effectiveness": 0
            }
        categories[category]["total"] += 1
        if control.implementation_status == "implemented":
            categories[category]["implemented"] += 1
        if control.effectiveness_score > 0:
            categories[category]["effectiveness"] += control.effectiveness_score
    
    # Calculate average effectiveness per category
    for category_data in categories.values():
        if category_data["total"] > 0:
            category_data["effectiveness"] = category_data["effectiveness"] / category_data["total"]
    
    return {
        "framework": framework,
        "total_controls": total_controls,
        "implementation_summary": {
            "implemented": implemented,
            "in_progress": in_progress,
            "not_implemented": not_implemented
        },
        "overall_effectiveness": round(avg_effectiveness, 2),
        "compliance_percentage": round((implemented / total_controls) * 100, 2) if total_controls > 0 else 0,
        "categories": categories
    }

# ============================================================================
# Encryption Key Management
# ============================================================================

@router.get("/encryption-keys", response_model=List[EncryptionKeyResponse])
async def list_encryption_keys(
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    key_purpose: Optional[str] = Query(None, description="Filter by key purpose"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(require_permissions(["encryption:read"]))
):
    """List encryption keys"""
    query = db.query(EncryptionKey)
    
    if is_active is not None:
        query = query.filter(EncryptionKey.is_active == is_active)
    if key_purpose:
        query = query.filter(EncryptionKey.key_purpose == key_purpose)
    
    keys = query.offset(skip).limit(limit).all()
    # Don't expose key material in the response
    return [{**EncryptionKey.to_dict(key), "key_material": None} for key in keys]

@router.post("/encryption-keys", response_model=EncryptionKeyResponse)
async def create_encryption_key(
    key_data: EncryptionKeyCreate,
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(require_permissions(["encryption:write"]))
):
    """Create a new encryption key"""
    # Generate key material (simplified for this example)
    import secrets
    key_material = secrets.token_bytes(32)  # 256-bit key
    
    db_key = EncryptionKey(**key_data.dict())
    db_key.key_material = key_material
    db_key.created_by = current_user["id"]
    
    # Calculate next rotation date
    if db_key.auto_rotate:
        db_key.next_rotation_date = datetime.utcnow() + timedelta(days=db_key.rotation_period_days)
    
    db.add(db_key)
    db.commit()
    db.refresh(db_key)
    
    # Don't return key material
    response = EncryptionKey.to_dict(db_key)
    response["key_material"] = None
    return response

@router.post("/encryption-keys/{key_id}/rotate")
async def rotate_encryption_key(
    key_id: int,
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(require_permissions(["encryption:write"]))
):
    """Rotate an encryption key"""
    db_key = db.query(EncryptionKey).filter(EncryptionKey.id == key_id).first()
    if not db_key:
        raise HTTPException(status_code=404, detail="Encryption key not found")
    
    # Generate new key material
    import secrets
    db_key.key_material = secrets.token_bytes(32)
    db_key.last_rotation_date = datetime.utcnow()
    
    # Calculate next rotation
    if db_key.auto_rotate:
        db_key.next_rotation_date = datetime.utcnow() + timedelta(days=db_key.rotation_period_days)
    
    db.commit()
    return {"message": "Encryption key rotated successfully"}

# ============================================================================
# Vulnerability Management
# ============================================================================

@router.get("/vulnerabilities", response_model=List[VulnerabilityResponse])
async def list_vulnerabilities(
    severity: Optional[VulnerabilitySeverity] = Query(None, description="Filter by severity"),
    status: Optional[str] = Query(None, description="Filter by status"),
    affected_system: Optional[str] = Query(None, description="Filter by affected system"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(require_permissions(["vulnerability:read"]))
):
    """List vulnerabilities with filtering"""
    query = db.query(Vulnerability)
    
    if severity:
        query = query.filter(Vulnerability.severity == severity)
    if status:
        query = query.filter(Vulnerability.status == status)
    if affected_system:
        query = query.filter(Vulnerability.affected_system == affected_system)
    
    vulnerabilities = query.order_by(desc(Vulnerability.created_at)).offset(skip).limit(limit).all()
    return [Vulnerability.to_dict(v) for v in vulnerabilities]

@router.post("/vulnerabilities", response_model=VulnerabilityResponse)
async def create_vulnerability(
    vulnerability: VulnerabilityCreate,
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(require_permissions(["vulnerability:write"]))
):
    """Create a new vulnerability"""
    db_vulnerability = Vulnerability(**vulnerability.dict())
    db.add(db_vulnerability)
    db.commit()
    db.refresh(db_vulnerability)
    return Vulnerability.to_dict(db_vulnerability)

@router.put("/vulnerabilities/{vulnerability_id}", response_model=VulnerabilityResponse)
async def update_vulnerability(
    vulnerability_id: int,
    vulnerability: VulnerabilityUpdate,
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(require_permissions(["vulnerability:write"]))
):
    """Update a vulnerability"""
    db_vulnerability = db.query(Vulnerability).filter(Vulnerability.id == vulnerability_id).first()
    if not db_vulnerability:
        raise HTTPException(status_code=404, detail="Vulnerability not found")
    
    update_data = vulnerability.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_vulnerability, field, value)
    
    # Set resolved date if status changed to resolved
    if update_data.get("status") == "resolved" and not db_vulnerability.resolved_date:
        db_vulnerability.resolved_date = datetime.utcnow()
    
    db.commit()
    db.refresh(db_vulnerability)
    return Vulnerability.to_dict(db_vulnerability)

@router.get("/vulnerabilities/dashboard")
async def get_vulnerability_dashboard(
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(require_permissions(["vulnerability:read"]))
):
    """Get vulnerability dashboard"""
    vulnerabilities = db.query(Vulnerability).all()
    
    # Calculate metrics
    total = len(vulnerabilities)
    open_vulns = len([v for v in vulnerabilities if v.status == "open"])
    in_progress = len([v for v in vulnerabilities if v.status == "in_progress"])
    resolved = len([v for v in vulnerabilities if v.status == "resolved"])
    
    # Severity breakdown
    severity_counts = {
        "critical": len([v for v in vulnerabilities if v.severity == VulnerabilitySeverity.CRITICAL]),
        "high": len([v for v in vulnerabilities if v.severity == VulnerabilitySeverity.HIGH]),
        "medium": len([v for v in vulnerabilities if v.severity == VulnerabilitySeverity.MEDIUM]),
        "low": len([v for v in vulnerabilities if v.severity == VulnerabilitySeverity.LOW])
    }
    
    # Average CVSS score
    cvss_scores = [v.cvss_score for v in vulnerabilities if v.cvss_score]
    avg_cvss = sum(cvss_scores) / len(cvss_scores) if cvss_scores else 0
    
    return {
        "total_vulnerabilities": total,
        "status_breakdown": {
            "open": open_vulns,
            "in_progress": in_progress,
            "resolved": resolved
        },
        "severity_breakdown": severity_counts,
        "average_cvss_score": round(avg_cvss, 2),
        "critical_vulnerabilities": severity_counts["critical"],
        "high_vulnerabilities": severity_counts["high"]
    }

# ============================================================================
# Penetration Testing
# ============================================================================

@router.get("/penetration-tests", response_model=List[PenetrationTestResponse])
async def list_penetration_tests(
    status: Optional[str] = Query(None, description="Filter by status"),
    test_type: Optional[str] = Query(None, description="Filter by test type"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(require_permissions(["pentest:read"]))
):
    """List penetration tests"""
    query = db.query(PenetrationTest)
    
    if status:
        query = query.filter(PenetrationTest.status == status)
    if test_type:
        query = query.filter(PenetrationTest.test_type == test_type)
    
    tests = query.order_by(desc(PenetrationTest.created_at)).offset(skip).limit(limit).all()
    return [PenetrationTest.to_dict(t) for t in tests]

@router.post("/penetration-tests", response_model=PenetrationTestResponse)
async def create_penetration_test(
    test: PenetrationTestCreate,
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(require_permissions(["pentest:write"]))
):
    """Create a new penetration test"""
    db_test = PenetrationTest(**test.dict())
    
    # Set next test date
    if db_test.is_scheduled:
        if db_test.schedule_type == "monthly":
            db_test.next_test_date = datetime.utcnow() + timedelta(days=30)
        elif db_test.schedule_type == "quarterly":
            db_test.next_test_date = datetime.utcnow() + timedelta(days=90)
        elif db_test.schedule_type == "annual":
            db_test.next_test_date = datetime.utcnow() + timedelta(days=365)
    
    db.add(db_test)
    db.commit()
    db.refresh(db_test)
    return PenetrationTest.to_dict(db_test)

@router.put("/penetration-tests/{test_id}", response_model=PenetrationTestResponse)
async def update_penetration_test(
    test_id: int,
    test: PenetrationTestUpdate,
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(require_permissions(["pentest:write"]))
):
    """Update a penetration test"""
    db_test = db.query(PenetrationTest).filter(PenetrationTest.id == test_id).first()
    if not db_test:
        raise HTTPException(status_code=404, detail="Penetration test not found")
    
    update_data = test.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_test, field, value)
    
    db.commit()
    db.refresh(db_test)
    return PenetrationTest.to_dict(db_test)

# ============================================================================
# Incident Management
# ============================================================================

@router.get("/incidents", response_model=List[SecurityIncidentResponse])
async def list_incidents(
    status: Optional[str] = Query(None, description="Filter by status"),
    severity: Optional[IncidentSeverity] = Query(None, description="Filter by severity"),
    assigned_to: Optional[int] = Query(None, description="Filter by assigned user"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(require_permissions(["incident:read"]))
):
    """List security incidents"""
    query = db.query(SecurityIncident)
    
    if status:
        query = query.filter(SecurityIncident.status == status)
    if severity:
        query = query.filter(SecurityIncident.severity == severity)
    if assigned_to:
        query = query.filter(SecurityIncident.assigned_to == assigned_to)
    
    incidents = query.order_by(desc(SecurityIncident.detected_at)).offset(skip).limit(limit).all()
    return [SecurityIncident.to_dict(incident) for incident in incidents]

@router.post("/incidents", response_model=SecurityIncidentResponse)
async def create_incident(
    incident: SecurityIncidentCreate,
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(require_permissions(["incident:write"]))
):
    """Create a new security incident"""
    # Generate incident number
    year = datetime.utcnow().year
    count = db.query(SecurityIncident).filter(
        SecurityIncident.incident_number.like(f"INC-{year}%")
    ).count()
    
    incident_number = f"INC-{year}-{count+1:03d}"
    
    db_incident = SecurityIncident(**incident.dict())
    db_incident.incident_number = incident_number
    db_incident.created_by = current_user["id"]
    db_incident.detected_at = datetime.utcnow()
    
    db.add(db_incident)
    db.commit()
    db.refresh(db_incident)
    return SecurityIncident.to_dict(db_incident)

@router.put("/incidents/{incident_id}", response_model=SecurityIncidentResponse)
async def update_incident(
    incident_id: int,
    incident: SecurityIncidentUpdate,
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(require_permissions(["incident:write"]))
):
    """Update a security incident"""
    db_incident = db.query(SecurityIncident).filter(SecurityIncident.id == incident_id).first()
    if not db_incident:
        raise HTTPException(status_code=404, detail="Security incident not found")
    
    update_data = incident.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_incident, field, value)
    
    # Set timestamps based on status changes
    if update_data.get("status") == "investigating" and not db_incident.acknowledged_at:
        db_incident.acknowledged_at = datetime.utcnow()
    elif update_data.get("status") == "contained" and not db_incident.contained_at:
        db_incident.contained_at = datetime.utcnow()
    elif update_data.get("status") == "resolved" and not db_incident.resolved_at:
        db_incident.resolved_at = datetime.utcnow()
    elif update_data.get("status") == "closed" and not db_incident.closed_at:
        db_incident.closed_at = datetime.utcnow()
    
    db.commit()
    db.refresh(db_incident)
    return SecurityIncident.to_dict(db_incident)

@router.get("/incidents/{incident_id}/timeline")
async def get_incident_timeline(
    incident_id: int,
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(require_permissions(["incident:read"]))
):
    """Get incident timeline with events and updates"""
    db_incident = db.query(SecurityIncident).filter(SecurityIncident.id == incident_id).first()
    if not db_incident:
        raise HTTPException(status_code=404, detail="Security incident not found")
    
    # Get related security events
    events = db.query(SecurityEvent).filter(
        SecurityEvent.incident_id == incident_id
    ).order_by(SecurityEvent.created_at).all()
    
    timeline = []
    
    # Add incident creation
    timeline.append({
        "timestamp": db_incident.created_at,
        "type": "incident_created",
        "description": f"Incident {db_incident.incident_number} created",
        "user": db_incident.created_by_user.to_dict() if db_incident.created_by_user else None
    })
    
    # Add status change events
    if db_incident.acknowledged_at:
        timeline.append({
            "timestamp": db_incident.acknowledged_at,
            "type": "status_change",
            "description": "Incident acknowledged",
            "user": db_incident.assigned_user.to_dict() if db_incident.assigned_user else None
        })
    
    if db_incident.contained_at:
        timeline.append({
            "timestamp": db_incident.contained_at,
            "type": "status_change",
            "description": "Incident contained",
            "user": db_incident.assigned_user.to_dict() if db_incident.assigned_user else None
        })
    
    if db_incident.resolved_at:
        timeline.append({
            "timestamp": db_incident.resolved_at,
            "type": "status_change",
            "description": "Incident resolved",
            "user": db_incident.assigned_user.to_dict() if db_incident.assigned_user else None
        })
    
    # Add security events
    for event in events:
        timeline.append({
            "timestamp": event.created_at,
            "type": "security_event",
            "description": event.description,
            "event_data": event.to_dict()
        })
    
    # Sort by timestamp
    timeline.sort(key=lambda x: x["timestamp"])
    
    return {
        "incident": SecurityIncident.to_dict(db_incident),
        "timeline": timeline
    }

# ============================================================================
# Security Events & Monitoring
# ============================================================================

@router.get("/events", response_model=List[SecurityEventResponse])
async def list_security_events(
    event_type: Optional[str] = Query(None, description="Filter by event type"),
    severity: Optional[str] = Query(None, description="Filter by severity"),
    start_date: Optional[datetime] = Query(None, description="Start date filter"),
    end_date: Optional[datetime] = Query(None, description="End date filter"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(require_permissions(["security:read"]))
):
    """List security events"""
    query = db.query(SecurityEvent)
    
    if event_type:
        query = query.filter(SecurityEvent.event_type == event_type)
    if severity:
        query = query.filter(SecurityEvent.severity == severity)
    if start_date:
        query = query.filter(SecurityEvent.created_at >= start_date)
    if end_date:
        query = query.filter(SecurityEvent.created_at <= end_date)
    
    events = query.order_by(desc(SecurityEvent.created_at)).offset(skip).limit(limit).all()
    return [SecurityEvent.to_dict(event) for event in events]

@router.post("/events", response_model=SecurityEventResponse)
async def create_security_event(
    event_data: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(require_permissions(["security:write"]))
):
    """Create a new security event"""
    # Generate unique event ID
    event_id = f"EVT-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}-{secrets.token_hex(4).upper()}"
    
    db_event = SecurityEvent(
        event_id=event_id,
        **event_data
    )
    
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return SecurityEvent.to_dict(db_event)

@router.get("/events/dashboard")
async def get_security_events_dashboard(
    hours: int = Query(24, description="Hours to look back"),
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(require_permissions(["security:read"]))
):
    """Get security events dashboard"""
    start_time = datetime.utcnow() - timedelta(hours=hours)
    
    events = db.query(SecurityEvent).filter(
        SecurityEvent.created_at >= start_time
    ).all()
    
    # Calculate metrics
    total_events = len(events)
    critical_events = len([e for e in events if e.severity == "critical"])
    high_events = len([e for e in events if e.severity == "high"])
    
    # Event type breakdown
    event_types = {}
    for event in events:
        event_type = event.event_type
        if event_type not in event_types:
            event_types[event_type] = 0
        event_types[event_type] += 1
    
    # Hourly distribution
    hourly_distribution = {}
    for event in events:
        hour_key = event.created_at.strftime("%Y-%m-%d %H:00")
        if hour_key not in hourly_distribution:
            hourly_distribution[hour_key] = 0
        hourly_distribution[hour_key] += 1
    
    return {
        "time_range_hours": hours,
        "total_events": total_events,
        "critical_events": critical_events,
        "high_events": high_events,
        "event_type_breakdown": event_types,
        "hourly_distribution": hourly_distribution,
        "top_threats": sorted(event_types.items(), key=lambda x: x[1], reverse=True)[:5]
    }

# ============================================================================
# Data Residency & Privacy
# ============================================================================

@router.get("/data-residency-policies", response_model=List[DataResidencyPolicyResponse])
async def list_data_residency_policies(
    policy_type: Optional[str] = Query(None, description="Filter by policy type"),
    data_classification: Optional[str] = Query(None, description="Filter by data classification"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(require_permissions(["privacy:read"]))
):
    """List data residency policies"""
    query = db.query(DataResidencyPolicy)
    
    if policy_type:
        query = query.filter(DataResidencyPolicy.policy_type == policy_type)
    if data_classification:
        query = query.filter(DataResidencyPolicy.data_classification == data_classification)
    if is_active is not None:
        query = query.filter(DataResidencyPolicy.is_active == is_active)
    
    policies = query.offset(skip).limit(limit).all()
    return [DataResidencyPolicy.to_dict(policy) for policy in policies]

@router.post("/data-residency-policies", response_model=DataResidencyPolicyResponse)
async def create_data_residency_policy(
    policy: DataResidencyPolicyCreate,
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(require_permissions(["privacy:write"]))
):
    """Create a new data residency policy"""
    db_policy = DataResidencyPolicy(**policy.dict())
    db_policy.created_by = current_user["id"]
    db.add(db_policy)
    db.commit()
    db.refresh(db_policy)
    return DataResidencyPolicy.to_dict(db_policy)

# ============================================================================
# Compliance Assessments
# ============================================================================

@router.get("/compliance-assessments", response_model=List[ComplianceAssessmentResponse])
async def list_compliance_assessments(
    framework: Optional[ComplianceFramework] = Query(None, description="Filter by framework"),
    status: Optional[str] = Query(None, description="Filter by status"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(require_permissions(["compliance:read"]))
):
    """List compliance assessments"""
    query = db.query(ComplianceAssessment)
    
    if framework:
        query = query.filter(ComplianceAssessment.framework == framework)
    if status:
        query = query.filter(ComplianceAssessment.status == status)
    
    assessments = query.order_by(desc(ComplianceAssessment.created_at)).offset(skip).limit(limit).all()
    return [ComplianceAssessment.to_dict(assessment) for assessment in assessments]

@router.post("/compliance-assessments", response_model=ComplianceAssessmentResponse)
async def create_compliance_assessment(
    assessment: ComplianceAssessmentCreate,
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(require_permissions(["compliance:write"]))
):
    """Create a new compliance assessment"""
    db_assessment = ComplianceAssessment(**assessment.dict())
    db_assessment.created_by = current_user["id"]
    db.add(db_assessment)
    db.commit()
    db.refresh(db_assessment)
    return ComplianceAssessment.to_dict(db_assessment)

# ============================================================================
# Security Dashboard & Metrics
# ============================================================================

@router.get("/dashboard", response_model=SecurityDashboardResponse)
async def get_security_dashboard(
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(require_permissions(["security:read"]))
):
    """Get comprehensive security dashboard"""
    
    # Get recent incidents
    recent_incidents = db.query(SecurityIncident).filter(
        SecurityIncident.created_at >= datetime.utcnow() - timedelta(days=30)
    ).count()
    
    critical_incidents = db.query(SecurityIncident).filter(
        and_(
            SecurityIncident.severity == IncidentSeverity.P1_CRITICAL,
            SecurityIncident.created_at >= datetime.utcnow() - timedelta(days=30)
        )
    ).count()
    
    # Get open vulnerabilities
    open_vulnerabilities = db.query(Vulnerability).filter(
        Vulnerability.status == "open"
    ).count()
    
    critical_vulnerabilities = db.query(Vulnerability).filter(
        and_(
            Vulnerability.severity == VulnerabilitySeverity.CRITICAL,
            Vulnerability.status == "open"
        )
    ).count()
    
    # Get recent security events
    recent_events = db.query(SecurityEvent).filter(
        SecurityEvent.created_at >= datetime.utcnow() - timedelta(hours=24)
    ).count()
    
    critical_events = db.query(SecurityEvent).filter(
        and_(
            SecurityEvent.severity == "critical",
            SecurityEvent.created_at >= datetime.utcnow() - timedelta(hours=24)
        )
    ).count()
    
    # Get compliance status
    soc2_controls = db.query(ComplianceControl).filter(
        ComplianceControl.framework == ComplianceFramework.SOC2_TYPE_II
    ).count()
    
    iso27001_controls = db.query(ComplianceControl).filter(
        ComplianceControl.framework == ComplianceFramework.ISO27001
    ).count()
    
    implemented_controls = db.query(ComplianceControl).filter(
        ComplianceControl.implementation_status == "implemented"
    ).count()
    
    total_controls = soc2_controls + iso27001_controls
    compliance_percentage = (implemented_controls / total_controls * 100) if total_controls > 0 else 0
    
    return {
        "security_overview": {
            "recent_incidents": recent_incidents,
            "critical_incidents": critical_incidents,
            "open_vulnerabilities": open_vulnerabilities,
            "critical_vulnerabilities": critical_vulnerabilities,
            "recent_security_events": recent_events,
            "critical_events": critical_events,
            "compliance_percentage": round(compliance_percentage, 2)
        },
        "compliance_status": {
            "soc2_controls": soc2_controls,
            "iso27001_controls": iso27001_controls,
            "implemented_controls": implemented_controls,
            "total_controls": total_controls
        },
        "risk_metrics": {
            "high_risk_vulnerabilities": critical_vulnerabilities,
            "critical_incidents": critical_incidents,
            "security_events_trend": "stable",  # Simplified for this example
            "overall_risk_level": "medium" if (critical_vulnerabilities + critical_incidents) < 5 else "high"
        },
        "last_updated": datetime.utcnow().isoformat()
    }

@router.get("/metrics", response_model=SecurityMetricsResponse)
async def get_security_metrics(
    time_range: str = Query("30d", description="Time range: 7d, 30d, 90d, 1y"),
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(require_permissions(["security:read"]))
):
    """Get security metrics for specified time range"""
    
    # Calculate date range
    if time_range == "7d":
        days = 7
    elif time_range == "30d":
        days = 30
    elif time_range == "90d":
        days = 90
    elif time_range == "1y":
        days = 365
    else:
        days = 30
    
    start_date = datetime.utcnow() - timedelta(days=days)
    
    # Get metrics
    incidents = db.query(SecurityIncident).filter(
        SecurityIncident.created_at >= start_date
    ).all()
    
    vulnerabilities = db.query(Vulnerability).filter(
        Vulnerability.created_at >= start_date
    ).all()
    
    events = db.query(SecurityEvent).filter(
        SecurityEvent.created_at >= start_date
    ).all()
    
    return {
        "time_range": time_range,
        "incident_metrics": {
            "total": len(incidents),
            "by_severity": {
                "critical": len([i for i in incidents if i.severity == IncidentSeverity.P1_CRITICAL]),
                "high": len([i for i in incidents if i.severity == IncidentSeverity.P2_HIGH]),
                "medium": len([i for i in incidents if i.severity == IncidentSeverity.P3_MEDIUM]),
                "low": len([i for i in incidents if i.severity == IncidentSeverity.P4_LOW])
            },
            "by_status": {
                "open": len([i for i in incidents if i.status == "open"]),
                "investigating": len([i for i in incidents if i.status == "investigating"]),
                "resolved": len([i for i in incidents if i.status == "resolved"]),
                "closed": len([i for i in incidents if i.status == "closed"])
            },
            "average_resolution_time_hours": sum([
                (i.resolved_at - i.detected_at).total_seconds() / 3600 
                for i in incidents 
                if i.resolved_at and i.detected_at
            ]) / max(len([i for i in incidents if i.resolved_at]), 1)
        },
        "vulnerability_metrics": {
            "total": len(vulnerabilities),
            "by_severity": {
                "critical": len([v for v in vulnerabilities if v.severity == VulnerabilitySeverity.CRITICAL]),
                "high": len([v for v in vulnerabilities if v.severity == VulnerabilitySeverity.HIGH]),
                "medium": len([v for v in vulnerabilities if v.severity == VulnerabilitySeverity.MEDIUM]),
                "low": len([v for v in vulnerabilities if v.severity == VulnerabilitySeverity.LOW])
            },
            "average_cvss_score": sum([v.cvss_score or 0 for v in vulnerabilities]) / max(len(vulnerabilities), 1),
            "open_count": len([v for v in vulnerabilities if v.status == "open"]),
            "resolved_count": len([v for v in vulnerabilities if v.status == "resolved"])
        },
        "event_metrics": {
            "total": len(events),
            "by_type": {event.event_type: len([e for e in events if e.event_type == event.event_type]) for event in events},
            "by_severity": {
                "critical": len([e for e in events if e.severity == "critical"]),
                "high": len([e for e in events if e.severity == "high"]),
                "medium": len([e for e in events if e.severity == "medium"]),
                "low": len([e for e in events if e.severity == "low"])
            }
        },
        "generated_at": datetime.utcnow().isoformat()
    }