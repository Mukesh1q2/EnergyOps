"""
Enterprise Authentication API Endpoints
Complete authentication system with SSO, MFA, and enterprise features
"""

from fastapi import FastAPI, HTTPException, Depends, Request, status, BackgroundTasks
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, validator
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
import secrets
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from .models import (
    User, Organization, UserSession, UserInvitation, AuditLog, 
    MFADevice, PasswordPolicy, ConsentRecord, RateLimitRecord,
    UserRole, OrganizationType, AuthProvider, SessionStatus
)
from .security import (
    SecurityUtils, JWTManager, MFAManager, PasswordPolicy as PasswordPolicyValidator,
    RateLimiter, AuditLogger, IPGeolocation, CSRFProtection
)

# API Setup
app = FastAPI(
    title="OptiBid Energy Authentication API",
    description="Enterprise authentication with SSO, MFA, and security features",
    version="2.0.0"
)

# CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://your-domain.com"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

security = HTTPBearer(auto_error=False)


# Pydantic Models
class LoginRequest(BaseModel):
    email: EmailStr
    password: Optional[str] = None
    totp_token: Optional[str] = None
    remember_me: bool = False
    device_info: Optional[Dict[str, str]] = {}


class RegisterRequest(BaseModel):
    email: EmailStr
    name: str
    password: str
    organization_name: Optional[str] = None
    organization_type: Optional[OrganizationType] = None
    invite_token: Optional[str] = None


class VerifyEmailRequest(BaseModel):
    token: str


class MFASetupRequest(BaseModel):
    method: str  # 'totp', 'sms', 'email'
    phone_number: Optional[str] = None


class VerifyMFASetupRequest(BaseModel):
    method: str
    token: str
    device_name: str


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


class InviteUserRequest(BaseModel):
    email: EmailStr
    role: UserRole
    message: Optional[str] = None


class ConsentRequest(BaseModel):
    consent_type: str
    consent_given: bool
    version: str


class SessionInfo(BaseModel):
    id: str
    user_agent: Optional[str]
    ip_address: Optional[str]
    device_type: Optional[str]
    browser: Optional[str]
    created_at: datetime
    last_activity_at: datetime
    status: str


class UserProfile(BaseModel):
    id: str
    email: str
    name: str
    role: UserRole
    organization_id: Optional[str]
    email_verified: bool
    mfa_enabled: bool
    last_login_at: Optional[datetime]
    preferences: Optional[Dict[str, Any]]


# Database dependency
def get_db():
    # This would be your database session dependency
    # For now, return None (implement your actual database setup)
    return None


# Authentication dependency
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Get current authenticated user"""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verify JWT token
    payload = JWTManager.verify_token(credentials.credentials)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Get user from database
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user


# Rate limiting dependency
async def check_rate_limit(action: str, identifier: str, db: Session) -> None:
    """Check rate limiting before allowing action"""
    # Get recent attempts
    recent_attempts = db.query(RateLimitRecord)\
        .filter(
            and_(
                RateLimitRecord.action == action,
                RateLimitRecord.identifier == identifier
            )
        )\
        .all()
    
    attempt_times = [record.attempt_at for record in recent_attempts]
    is_limited, reason = RateLimiter.is_rate_limited(action, identifier, attempt_times)
    
    if is_limited:
        RateLimiter.record_attempt(action, identifier, db)
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=reason
        )


# Request context dependency
async def get_request_context(request: Request) -> Dict[str, str]:
    """Extract request context for security logging"""
    return {
        "ip_address": request.client.host,
        "user_agent": request.headers.get("user-agent", ""),
        "device_type": extract_device_type(request.headers.get("user-agent", "")),
        "browser": extract_browser(request.headers.get("user-agent", ""))
    }


def extract_device_type(user_agent: str) -> str:
    """Extract device type from user agent"""
    user_agent = user_agent.lower()
    if "mobile" in user_agent or "android" in user_agent or "iphone" in user_agent:
        return "mobile"
    elif "tablet" in user_agent or "ipad" in user_agent:
        return "tablet"
    else:
        return "desktop"


def extract_browser(user_agent: str) -> str:
    """Extract browser name from user agent"""
    user_agent = user_agent.lower()
    if "chrome" in user_agent:
        return "Chrome"
    elif "firefox" in user_agent:
        return "Firefox"
    elif "safari" in user_agent:
        return "Safari"
    elif "edge" in user_agent:
        return "Edge"
    else:
        return "Unknown"


# Authentication Endpoints

@app.post("/api/auth/login")
async def login(
    request: LoginRequest,
    req_context: Dict[str, str] = Depends(get_request_context),
    db: Session = Depends(get_db)
):
    """Handle user login with password and MFA"""
    
    # Rate limiting check
    await check_rate_limit("login", req_context["ip_address"], db)
    
    # Find user by email
    user = db.query(User).filter(User.email == request.email).first()
    
    if not user:
        await AuditLogger.log_authentication_event(
            user_id=None,
            action="login",
            status="failure",
            ip_address=req_context["ip_address"],
            user_agent=req_context["user_agent"],
            error_message="User not found"
        )
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    # Check if user is locked
    if user.is_locked and user.locked_until and user.locked_until > datetime.utcnow():
        raise HTTPException(status_code=423, detail="Account is locked")
    
    # If user has SSO-only account (no password)
    if user.auth_provider != AuthProvider.EMAIL and not user.password_hash:
        raise HTTPException(
            status_code=400,
            detail="Please sign in using your SSO provider"
        )
    
    # Verify password
    if not user.password_hash or not SecurityUtils.verify_password(
        request.password, user.password_hash, user.password_salt
    ):
        # Increment failed attempts
        user.failed_login_attempts += 1
        
        # Lock account if too many attempts
        if user.failed_login_attempts >= 5:
            user.is_locked = True
            user.locked_until = datetime.utcnow() + timedelta(minutes=30)
        
        db.commit()
        
        await AuditLogger.log_authentication_event(
            user_id=user.id,
            action="login",
            status="failure",
            ip_address=req_context["ip_address"],
            user_agent=req_context["user_agent"],
            error_message="Invalid password"
        )
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    # Check MFA if enabled
    if user.mfa_enabled:
        if not request.totp_token:
            # Return MFA challenge
            return {
                "requires_mfa": True,
                "message": "MFA token required"
            }
        
        # Verify TOTP token
        if user.mfa_secret and not MFAManager.verify_totp(request.totp_token, user.mfa_secret):
            # Check backup codes
            if user.mfa_backup_codes:
                is_valid, code_index = MFAManager.verify_backup_code(
                    request.totp_token, user.mfa_backup_codes
                )
                if is_valid and code_index is not None:
                    # Remove used backup code
                    user.mfa_backup_codes.pop(code_index)
                    db.commit()
                else:
                    await AuditLogger.log_authentication_event(
                        user_id=user.id,
                        action="mfa_verification",
                        status="failure",
                        ip_address=req_context["ip_address"],
                        user_agent=req_context["user_agent"],
                        error_message="Invalid MFA token"
                    )
                    raise HTTPException(status_code=400, detail="Invalid MFA token")
            else:
                await AuditLogger.log_authentication_event(
                    user_id=user.id,
                    action="mfa_verification",
                    status="failure",
                    ip_address=req_context["ip_address"],
                    user_agent=req_context["user_agent"],
                    error_message="Invalid MFA token"
                )
                raise HTTPException(status_code=400, detail="Invalid MFA token")
    
    # Reset failed attempts on successful login
    user.failed_login_attempts = 0
    user.is_locked = False
    user.locked_until = None
    user.last_login_at = datetime.utcnow()
    user.last_login_ip = req_context["ip_address"]
    db.commit()
    
    # Create session
    session_token = SecurityUtils.generate_session_token()
    refresh_token = SecurityUtils.generate_refresh_token()
    
    # Get location information
    location = IPGeolocation.get_location_from_ip(req_context["ip_address"])
    
    session = UserSession(
        user_id=user.id,
        organization_id=user.organization_id,
        session_token=session_token,
        refresh_token=refresh_token,
        user_agent=req_context["user_agent"],
        ip_address=req_context["ip_address"],
        device_type=req_context["device_type"],
        browser=req_context["browser"],
        country=location.get("country"),
        city=location.get("city"),
        timezone=location.get("timezone"),
        expires_at=datetime.utcnow() + timedelta(hours=24 if not request.remember_me else 720)  # 24h or 30 days
    )
    
    db.add(session)
    db.commit()
    
    # Create JWT tokens
    access_token = JWTManager.create_access_token({"sub": user.id})
    jwt_refresh_token = JWTManager.create_refresh_token(user.id)
    
    # Log successful login
    await AuditLogger.log_authentication_event(
        user_id=user.id,
        action="login",
        status="success",
        ip_address=req_context["ip_address"],
        user_agent=req_context["user_agent"],
        session_id=session.id
    )
    
    return {
        "access_token": access_token,
        "refresh_token": jwt_refresh_token,
        "session_token": session_token,
        "expires_in": 86400 if not request.remember_me else 2592000,  # 24h or 30 days
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "role": user.role.value,
            "email_verified": user.email_verified,
            "mfa_enabled": user.mfa_enabled,
            "organization_id": user.organization_id
        }
    }


@app.post("/api/auth/register")
async def register(
    request: RegisterRequest,
    req_context: Dict[str, str] = Depends(get_request_context),
    db: Session = Depends(get_db)
):
    """Register new user with organization creation"""
    
    # Rate limiting check
    await check_rate_limit("register", req_context["ip_address"], db)
    
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == request.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")
    
    # Validate password
    is_valid, errors = PasswordPolicyValidator.validate_password(request.password)
    if not is_valid:
        raise HTTPException(status_code=400, detail=errors)
    
    # If invitation token provided, use it
    invitation = None
    if request.invite_token:
        invitation = db.query(UserInvitation)\
            .filter(UserInvitation.invitation_token == request.invite_token)\
            .first()
        
        if not invitation or invitation.status != "pending" or invitation.expires_at < datetime.utcnow():
            raise HTTPException(status_code=400, detail="Invalid or expired invitation")
        
        # Check if invitation email matches
        if invitation.email != request.email:
            raise HTTPException(status_code=400, detail="Invitation email does not match")
    
    # Create organization if provided
    organization_id = None
    if request.organization_name:
        organization = Organization(
            name=request.organization_name,
            organization_type=request.organization_type or OrganizationType.ENERGY_COMPANY,
            contact_email=request.email,
            region="India",  # Default region
            industry="Energy"  # Default industry
        )
        db.add(organization)
        db.flush()  # Get organization ID
        
        organization_id = organization.id
    
    # Create user
    password_hash, password_salt = SecurityUtils.hash_password(request.password)
    
    user = User(
        email=request.email,
        name=request.name,
        organization_id=organization_id,
        role=UserRole.ANALYST,  # Default role
        auth_provider=AuthProvider.EMAIL,
        email_verified=False,
        email_verification_token=SecurityUtils.generate_verification_token(),
        email_verification_expires=datetime.utcnow() + timedelta(hours=24),
        password_hash=password_hash,
        password_salt=password_salt
    )
    
    db.add(user)
    db.flush()
    
    # If invitation was used, mark as accepted
    if invitation:
        invitation.status = "accepted"
        invitation.accepted_at = datetime.utcnow()
        invitation.user_id = user.id
        invitation.accepted_ip = req_context["ip_address"]
        user.role = invitation.role
    
    db.commit()
    
    # Send verification email (implement email sending)
    await send_verification_email(request.email, user.email_verification_token)
    
    # Log registration
    await AuditLogger.log_authentication_event(
        user_id=user.id,
        action="register",
        status="success",
        ip_address=req_context["ip_address"],
        user_agent=req_context["user_agent"],
        resource="user_registration"
    )
    
    return {
        "message": "Registration successful. Please check your email for verification.",
        "user_id": user.id,
        "email_verification_required": True
    }


@app.post("/api/auth/verify-email")
async def verify_email(
    request: VerifyEmailRequest,
    req_context: Dict[str, str] = Depends(get_request_context),
    db: Session = Depends(get_db)
):
    """Verify email address"""
    
    user = db.query(User)\
        .filter(User.email_verification_token == request.token)\
        .first()
    
    if not user or not user.email_verification_expires or user.email_verification_expires < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Invalid or expired verification token")
    
    user.email_verified = True
    user.email_verification_token = None
    user.email_verification_expires = None
    db.commit()
    
    await AuditLogger.log_authentication_event(
        user_id=user.id,
        action="email_verification",
        status="success",
        ip_address=req_context["ip_address"],
        user_agent=req_context["user_agent"]
    )
    
    return {"message": "Email verified successfully"}


@app.post("/api/auth/mfa/setup")
async def setup_mfa(
    request: MFASetupRequest,
    current_user: User = Depends(get_current_user),
    req_context: Dict[str, str] = Depends(get_request_context),
    db: Session = Depends(get_db)
):
    """Setup multi-factor authentication"""
    
    if request.method == "totp":
        # Generate TOTP secret
        secret = MFAManager.generate_totp_secret()
        
        # Create QR code URI
        totp_uri = MFAManager.generate_totp_uri(secret, current_user.email)
        
        # Generate QR code as base64
        qr_code_bytes = MFAManager.generate_qr_code(totp_uri)
        import base64
        qr_code_base64 = base64.b64encode(qr_code_bytes).decode()
        
        return {
            "method": "totp",
            "secret": secret,
            "qr_code": f"data:image/png;base64,{qr_code_base64}",
            "manual_entry_key": secret
        }
    
    elif request.method == "sms":
        if not request.phone_number:
            raise HTTPException(status_code=400, detail="Phone number required for SMS MFA")
        
        # TODO: Implement SMS sending
        return {
            "method": "sms",
            "message": "Verification code sent to your phone"
        }
    
    elif request.method == "email":
        # TODO: Implement email verification code
        return {
            "method": "email", 
            "message": "Verification code sent to your email"
        }
    
    else:
        raise HTTPException(status_code=400, detail="Invalid MFA method")


@app.post("/api/auth/mfa/verify-setup")
async def verify_mfa_setup(
    request: VerifyMFASetupRequest,
    current_user: User = Depends(get_current_user),
    req_context: Dict[str, str] = Depends(get_request_context),
    db: Session = Depends(get_db)
):
    """Verify MFA setup and enable MFA"""
    
    if request.method == "totp":
        # Get the secret (in production, store temporarily in session or Redis)
        # For now, assume the secret is provided in the request
        secret = getattr(current_user, '_temp_totp_secret', None)
        
        if not secret:
            raise HTTPException(status_code=400, detail="MFA setup not initiated")
        
        # Verify the TOTP token
        if not MFAManager.verify_totp(request.token, secret):
            raise HTTPException(status_code=400, detail="Invalid verification code")
        
        # Enable MFA for user
        current_user.mfa_enabled = True
        current_user.mfa_secret = secret
        current_user.mfa_backup_codes = MFAManager.generate_backup_codes()
        
        # Create MFA device record
        mfa_device = MFADevice(
            user_id=current_user.id,
            device_name=request.device_name,
            device_type="authenticator",
            method="totp",
            secret=secret,
            is_primary=True,
            is_verified=True
        )
        
        db.add(mfa_device)
        db.commit()
        
        await AuditLogger.log_authentication_event(
            user_id=current_user.id,
            action="mfa_setup",
            status="success",
            ip_address=req_context["ip_address"],
            user_agent=req_context["user_agent"],
            metadata={"method": "totp"}
        )
        
        return {
            "message": "MFA enabled successfully",
            "backup_codes": current_user.mfa_backup_codes,
            "warning": "Store backup codes in a safe place. They won't be shown again."
        }
    
    else:
        raise HTTPException(status_code=400, detail="Unsupported MFA method")


@app.post("/api/auth/invite")
async def invite_user(
    request: InviteUserRequest,
    current_user: User = Depends(get_current_user),
    req_context: Dict[str, str] = Depends(get_request_context),
    db: Session = Depends(get_db)
):
    """Invite user to organization"""
    
    # Check permissions (only org admins can invite)
    if current_user.role not in [UserRole.ORG_ADMIN, UserRole.SUPER_ADMIN]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == request.email).first()
    if existing_user:
        # Check if user is already in the organization
        if existing_user.organization_id == current_user.organization_id:
            raise HTTPException(status_code=400, detail="User already in organization")
    
    # Create invitation
    invitation = UserInvitation(
        email=request.email,
        organization_id=current_user.organization_id,
        invited_by_id=current_user.id,
        role=request.role,
        invitation_token=SecurityUtils.generate_invitation_token(),
        expires_at=datetime.utcnow() + timedelta(days=7),  # 7 days to accept
        message=request.message
    )
    
    db.add(invitation)
    db.commit()
    
    # Send invitation email
    await send_invitation_email(request.email, invitation.invitation_token, request.message)
    
    await AuditLogger.log_authentication_event(
        user_id=current_user.id,
        action="user_invite",
        status="success",
        ip_address=req_context["ip_address"],
        user_agent=req_context["user_agent"],
        metadata={"invited_email": request.email, "role": request.role.value}
    )
    
    return {"message": "Invitation sent successfully"}


@app.post("/api/auth/consent")
async def update_consent(
    request: ConsentRequest,
    current_user: User = Depends(get_current_user),
    req_context: Dict[str, str] = Depends(get_request_context),
    db: Session = Depends(get_db)
):
    """Update user consent preferences"""
    
    consent = ConsentRecord(
        user_id=current_user.id,
        consent_type=request.consent_type,
        consent_given=request.consent_given,
        version=request.version,
        ip_address=req_context["ip_address"],
        user_agent=req_context["user_agent"]
    )
    
    db.add(consent)
    db.commit()
    
    await AuditLogger.log_authentication_event(
        user_id=current_user.id,
        action="consent_update",
        status="success",
        ip_address=req_context["ip_address"],
        user_agent=req_context["user_agent"],
        metadata={"consent_type": request.consent_type, "consent_given": request.consent_given}
    )
    
    return {"message": "Consent updated successfully"}


@app.get("/api/auth/profile")
async def get_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> UserProfile:
    """Get current user profile"""
    
    return UserProfile(
        id=current_user.id,
        email=current_user.email,
        name=current_user.name,
        role=current_user.role,
        organization_id=current_user.organization_id,
        email_verified=current_user.email_verified,
        mfa_enabled=current_user.mfa_enabled,
        last_login_at=current_user.last_login_at,
        preferences=current_user.preferences
    )


@app.get("/api/auth/sessions")
async def get_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> List[SessionInfo]:
    """Get user sessions"""
    
    sessions = db.query(UserSession)\
        .filter(UserSession.user_id == current_user.id)\
        .order_by(UserSession.last_activity_at.desc())\
        .all()
    
    return [
        SessionInfo(
            id=session.id,
            user_agent=session.user_agent,
            ip_address=session.ip_address,
            device_type=session.device_type,
            browser=session.browser,
            created_at=session.created_at,
            last_activity_at=session.last_activity_at,
            status=session.status.value
        )
        for session in sessions
    ]


@app.delete("/api/auth/sessions/{session_id}")
async def revoke_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Revoke a user session"""
    
    session = db.query(UserSession)\
        .filter(
            and_(
                UserSession.id == session_id,
                UserSession.user_id == current_user.id
            )
        )\
        .first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session.status = SessionStatus.REVOKED
    session.revoked_at = datetime.utcnow()
    session.revoked_reason = "User requested revocation"
    db.commit()
    
    await AuditLogger.log_authentication_event(
        user_id=current_user.id,
        action="session_revoke",
        status="success",
        resource="session",
        resource_id=session_id
    )
    
    return {"message": "Session revoked successfully"}


# Email sending functions (implement according to your email service)
async def send_verification_email(email: str, token: str):
    """Send email verification"""
    # Implement with your email service (SendGrid, AWS SES, etc.)
    pass


async def send_invitation_email(email: str, token: str, message: Optional[str]):
    """Send user invitation"""
    # Implement with your email service
    pass


# SSO Integration Endpoints (implement as needed)
@app.get("/api/auth/sso/providers")
async def get_sso_providers():
    """Get available SSO providers"""
    return {
        "providers": [
            {"id": "google", "name": "Google", "type": "oauth2"},
            {"id": "microsoft", "name": "Microsoft", "type": "oauth2"},
            {"id": "saml", "name": "SAML", "type": "saml"}
        ]
    }


@app.get("/api/auth/sso/{provider}/authorize")
async def sso_authorize(provider: str):
    """Initiate SSO authorization"""
    # Redirect to SSO provider
    pass


@app.get("/api/auth/sso/{provider}/callback")
async def sso_callback(provider: str, code: str, state: str):
    """Handle SSO callback"""
    # Process SSO callback and create/login user
    pass


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)