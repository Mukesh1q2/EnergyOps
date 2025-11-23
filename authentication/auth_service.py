# OptiBid Energy: Enhanced Authentication & Authorization Service
# OAuth2/OIDC with JWT, RBAC, and Enterprise SSO

from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import FastAPI, HTTPException, Depends, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field, validator
from sqlalchemy.orm import Session
import secrets
import hashlib
import redis
import json
from pathlib import Path
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Security Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here-make-it-long-and-random")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15
REFRESH_TOKEN_EXPIRE_DAYS = 7
MAX_LOGIN_ATTEMPTS = 5
LOCKOUT_DURATION_MINUTES = 30

# Password Policy
PASSWORD_MIN_LENGTH = 12
PASSWORD_REQUIRE_UPPERCASE = True
PASSWORD_REQUIRE_LOWERCASE = True
PASSWORD_REQUIRE_NUMBERS = True
PASSWORD_REQUIRE_SPECIAL = True

# Rate Limiting
RATE_LIMIT_ATTEMPTS = 5
RATE_LIMIT_WINDOW_SECONDS = 900  # 15 minutes

# Redis Configuration
redis_client = redis.from_url(
    os.getenv("REDIS_URL", "redis://localhost:6379/0"),
    decode_responses=True
)

# Password Hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 Configuration
oauth2_scheme = HTTPBearer()

# Database Models (assuming existing models)
class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID, primary_key=True, default=uuid4)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(50), unique=True, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100))
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    is_superuser = Column(Boolean, default=False)
    
    # Account Security
    failed_login_attempts = Column(Integer, default=0)
    locked_until = Column(DateTime)
    last_login = Column(DateTime)
    password_changed_at = Column(DateTime, default=datetime.utcnow)
    
    # MFA Settings
    mfa_enabled = Column(Boolean, default=False)
    mfa_secret = Column(String(32))
    backup_codes = Column(JSON)  # Store encrypted backup codes
    
    # Organization
    organization_id = Column(UUID, ForeignKey("organizations.id"))
    organization = relationship("Organization", back_populates="users")
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    roles = relationship("UserRole", back_populates="user")
    sessions = relationship("UserSession", back_populates="user")
    audit_logs = relationship("AuditLog", back_populates="user")

class UserRole(Base):
    __tablename__ = "user_roles"
    
    id = Column(UUID, primary_key=True, default=uuid4)
    user_id = Column(UUID, ForeignKey("users.id"), nullable=False)
    role_id = Column(UUID, ForeignKey("roles.id"), nullable=False)
    organization_id = Column(UUID, ForeignKey("organizations.id"))
    assigned_by = Column(UUID, ForeignKey("users.id"))
    assigned_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime)
    
    user = relationship("User", back_populates="roles")
    role = relationship("Role", back_populates="user_roles")

class UserSession(Base):
    __tablename__ = "user_sessions"
    
    id = Column(UUID, primary_key=True, default=uuid4)
    user_id = Column(UUID, ForeignKey("users.id"), nullable=False)
    session_token = Column(String(255), unique=True, index=True)
    refresh_token = Column(String(255), unique=True, index=True)
    ip_address = Column(String(45))
    user_agent = Column(String(500))
    device_fingerprint = Column(String(255))
    
    is_active = Column(Boolean, default=True)
    expires_at = Column(DateTime)
    last_activity = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="sessions")

class Organization(Base):
    __tablename__ = "organizations"
    
    id = Column(UUID, primary_key=True, default=uuid4)
    name = Column(String(255), nullable=False)
    domain = Column(String(255), unique=True)
    subscription_tier = Column(String(50), default="free")
    max_users = Column(Integer, default=5)
    
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    users = relationship("User", back_populates="organization")
    roles = relationship("Role", back_populates="organization")
    audit_logs = relationship("AuditLog", back_populates="organization")

class Role(Base):
    __tablename__ = "roles"
    
    id = Column(UUID, primary_key=True, default=uuid4)
    name = Column(String(50), unique=True, nullable=False)
    display_name = Column(String(100), nullable=False)
    description = Column(Text)
    is_system_role = Column(Boolean, default=False)
    organization_id = Column(UUID, ForeignKey("organizations.id"))
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    organization = relationship("Organization", back_populates="roles")
    user_roles = relationship("UserRole", back_populates="role")

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(UUID, primary_key=True, default=uuid4)
    user_id = Column(UUID, ForeignKey("users.id"))
    organization_id = Column(UUID, ForeignKey("organizations.id"))
    action = Column(String(100), nullable=False)
    resource_type = Column(String(50))
    resource_id = Column(String(100))
    ip_address = Column(String(45))
    user_agent = Column(String(500))
    details = Column(JSON)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="audit_logs")
    organization = relationship("Organization", back_populates="audit_logs")

# Pydantic Models
class UserCreate(BaseModel):
    email: EmailStr
    username: Optional[str] = None
    password: str = Field(..., min_length=PASSWORD_MIN_LENGTH)
    full_name: Optional[str] = None
    organization_id: Optional[UUID] = None
    
    @validator('password')
    def validate_password(cls, v):
        if PASSWORD_REQUIRE_UPPERCASE and not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if PASSWORD_REQUIRE_LOWERCASE and not any(c.islower() for c in v):
            raise ValueError('Password must contain at least one lowercase letter')
        if PASSWORD_REQUIRE_NUMBERS and not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one number')
        if PASSWORD_REQUIRE_SPECIAL and not any(c in '!@#$%^&*()_+-=[]{}|;:,.<>?' for c in v):
            raise ValueError('Password must contain at least one special character')
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    remember_me: bool = False

class UserResponse(BaseModel):
    id: UUID
    email: EmailStr
    username: Optional[str]
    full_name: Optional[str]
    is_active: bool
    is_verified: bool
    mfa_enabled: bool
    organization_id: Optional[UUID]
    roles: List[str] = []
    last_login: Optional[datetime]
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse

class TokenRefresh(BaseModel):
    refresh_token: str

class PasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=PASSWORD_MIN_LENGTH)

class PasswordReset(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str = Field(..., min_length=PASSWORD_MIN_LENGTH)

class MFASetup(BaseModel):
    secret: Optional[str] = None
    backup_codes: List[str] = []

class MFAVerify(BaseModel):
    code: str
    backup_code: Optional[str] = None

class SessionRevoke(BaseModel):
    session_id: UUID

class DeviceInfo(BaseModel):
    device_fingerprint: str
    device_name: Optional[str] = None
    browser: Optional[str] = None
    os: Optional[str] = None
    ip_address: str

# Authentication Service
class AuthenticationService:
    def __init__(self, db: Session):
        self.db = db
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash"""
        return pwd_context.verify(plain_password, hashed_password)
    
    def get_password_hash(self, password: str) -> str:
        """Generate password hash"""
        return pwd_context.hash(password)
    
    def create_access_token(self, data: dict, expires_delta: Optional[timedelta] = None) -> str:
        """Create JWT access token"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        
        to_encode.update({"exp": expire, "type": "access"})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt
    
    def create_refresh_token(self, data: dict) -> str:
        """Create JWT refresh token"""
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
        to_encode.update({"exp": expire, "type": "refresh"})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt
    
    def verify_token(self, token: str) -> Optional[dict]:
        """Verify JWT token"""
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            return payload
        except JWTError:
            return None
    
    def check_rate_limit(self, identifier: str) -> bool:
        """Check if rate limit exceeded"""
        key = f"rate_limit:{identifier}"
        attempts = redis_client.get(key)
        
        if attempts is None:
            redis_client.setex(key, RATE_LIMIT_WINDOW_SECONDS, 1)
            return True
        
        attempts = int(attempts)
        if attempts >= RATE_LIMIT_ATTEMPTS:
            return False
        
        redis_client.incr(key)
        return True
    
    def check_account_lockout(self, user: User) -> bool:
        """Check if account is locked out"""
        if user.locked_until and user.locked_until > datetime.utcnow():
            return False
        return True
    
    def increment_failed_attempts(self, user: User):
        """Increment failed login attempts"""
        user.failed_login_attempts += 1
        
        if user.failed_login_attempts >= MAX_LOGIN_ATTEMPTS:
            user.locked_until = datetime.utcnow() + timedelta(minutes=LOCKOUT_DURATION_MINUTES)
            logger.warning(f"Account locked for user {user.email}")
        
        self.db.commit()
    
    def reset_failed_attempts(self, user: User):
        """Reset failed login attempts on successful login"""
        user.failed_login_attempts = 0
        user.locked_until = None
        user.last_login = datetime.utcnow()
        user.password_changed_at = datetime.utcnow()
        self.db.commit()
    
    def generate_device_fingerprint(self, request: Request) -> str:
        """Generate device fingerprint"""
        user_agent = request.headers.get("user-agent", "")
        accept_language = request.headers.get("accept-language", "")
        accept_encoding = request.headers.get("accept-encoding", "")
        
        fingerprint_data = f"{user_agent}:{accept_language}:{accept_encoding}"
        return hashlib.sha256(fingerprint_data.encode()).hexdigest()

# Authorization Service
class AuthorizationService:
    def __init__(self, db: Session):
        self.db = db
    
    def get_user_roles(self, user_id: UUID, organization_id: Optional[UUID] = None) -> List[str]:
        """Get user roles"""
        query = self.db.query(UserRole).filter(UserRole.user_id == user_id)
        
        if organization_id:
            query = query.filter(
                (UserRole.organization_id == organization_id) | 
                (UserRole.organization_id.is_(None))
            )
        
        roles = query.all()
        return [role.role.name for role in roles]
    
    def has_permission(self, user_id: UUID, permission: str, organization_id: Optional[UUID] = None) -> bool:
        """Check if user has specific permission"""
        # This would typically check against a permission table
        # For now, using role-based permissions
        user_roles = self.get_user_roles(user_id, organization_id)
        
        # System admin has all permissions
        if "super_admin" in user_roles:
            return True
        
        # Check role-specific permissions
        role_permissions = {
            "org_admin": ["*"],  # All permissions within organization
            "billing_admin": ["billing.*", "usage.*", "user.read"],
            "analyst": ["dashboard.*", "analytics.read", "reports.read"],
            "viewer": ["dashboard.read", "analytics.read"]
        }
        
        for role in user_roles:
            if role in role_permissions:
                perms = role_permissions[role]
                if "*" in perms or permission in perms:
                    return True
        
        return False
    
    def require_permission(self, permission: str):
        """Dependency to require specific permission"""
        async def check_permission(
            current_user: User = Depends(get_current_user)
        ) -> User:
            if not self.has_permission(current_user.id, permission):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Insufficient permissions"
                )
            return current_user
        return check_permission

# Session Management
class SessionService:
    def __init__(self, db: Session):
        self.db = db
    
    def create_session(self, user: User, request: Request, device_info: DeviceInfo) -> UserSession:
        """Create user session"""
        session_token = secrets.token_urlsafe(32)
        refresh_token = secrets.token_urlsafe(32)
        
        session = UserSession(
            user_id=user.id,
            session_token=session_token,
            refresh_token=refresh_token,
            ip_address=device_info.ip_address,
            user_agent=device_info.browser or request.headers.get("user-agent", ""),
            device_fingerprint=device_info.device_fingerprint,
            expires_at=datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
        )
        
        self.db.add(session)
        self.db.commit()
        self.db.refresh(session)
        
        return session
    
    def get_session(self, token: str) -> Optional[UserSession]:
        """Get session by token"""
        return self.db.query(UserSession).filter(
            UserSession.session_token == token,
            UserSession.is_active == True,
            UserSession.expires_at > datetime.utcnow()
        ).first()
    
    def revoke_session(self, session_id: UUID, user_id: UUID) -> bool:
        """Revoke user session"""
        session = self.db.query(UserSession).filter(
            UserSession.id == session_id,
            UserSession.user_id == user_id
        ).first()
        
        if session:
            session.is_active = False
            self.db.commit()
            return True
        return False
    
    def revoke_all_sessions(self, user_id: UUID) -> int:
        """Revoke all user sessions"""
        count = self.db.query(UserSession).filter(
            UserSession.user_id == user_id,
            UserSession.is_active == True
        ).update({"is_active": False})
        
        self.db.commit()
        return count
    
    def cleanup_expired_sessions(self) -> int:
        """Clean up expired sessions"""
        expired_sessions = self.db.query(UserSession).filter(
            UserSession.expires_at < datetime.utcnow()
        ).count()
        
        self.db.query(UserSession).filter(
            UserSession.expires_at < datetime.utcnow()
        ).delete()
        
        self.db.commit()
        return expired_sessions

# Audit Logging
class AuditService:
    def __init__(self, db: Session):
        self.db = db
    
    def log_action(
        self,
        user_id: Optional[UUID],
        action: str,
        resource_type: Optional[str] = None,
        resource_id: Optional[str] = None,
        organization_id: Optional[UUID] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None
    ):
        """Log user action for audit trail"""
        log_entry = AuditLog(
            user_id=user_id,
            organization_id=organization_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            ip_address=ip_address,
            user_agent=user_agent,
            details=details or {}
        )
        
        self.db.add(log_entry)
        self.db.commit()

# Dependency Functions
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
    auth_service: AuthenticationService = Depends(get_auth_service)
) -> User:
    """Get current authenticated user"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = auth_service.verify_token(credentials.credentials)
    if payload is None:
        raise credentials_exception
    
    user_id = payload.get("sub")
    if user_id is None:
        raise credentials_exception
    
    user = db.query(User).filter(User.id == UUID(user_id)).first()
    if user is None or not user.is_active:
        raise credentials_exception
    
    return user

async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """Get current active user"""
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

async def get_current_verified_user(current_user: User = Depends(get_current_active_user)) -> User:
    """Get current verified user"""
    if not current_user.is_verified:
        raise HTTPException(status_code=400, detail="Email not verified")
    return current_user

# Service Factories
def get_auth_service(db: Session = Depends(get_db)) -> AuthenticationService:
    return AuthenticationService(db)

def get_authz_service(db: Session = Depends(get_db)) -> AuthorizationService:
    return AuthorizationService(db)

def get_session_service(db: Session = Depends(get_db)) -> SessionService:
    return SessionService(db)

def get_audit_service(db: Session = Depends(get_db)) -> AuditService:
    return AuditService(db)

def get_db():
    """Database dependency"""
    # This would be your actual database session dependency
    pass

# Main Authentication Router
auth_router = FastAPI()

@auth_router.post("/register", response_model=UserResponse)
async def register(
    user_data: UserCreate,
    request: Request,
    db: Session = Depends(get_db),
    auth_service: AuthenticationService = Depends(get_auth_service),
    audit_service: AuditService = Depends(get_audit_service)
):
    """User registration with validation"""
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    hashed_password = auth_service.get_password_hash(user_data.password)
    user = User(
        email=user_data.email,
        username=user_data.email.split('@')[0],  # Use email prefix as username
        hashed_password=hashed_password,
        full_name=user_data.full_name,
        organization_id=user_data.organization_id
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Log registration
    audit_service.log_action(
        user_id=user.id,
        action="user.registered",
        ip_address=request.client.host,
        user_agent=request.headers.get("user-agent"),
        details={"email": user.email}
    )
    
    return UserResponse.from_orm(user)

@auth_router.post("/login", response_model=Token)
async def login(
    login_data: UserLogin,
    request: Request,
    device_info: DeviceInfo,
    db: Session = Depends(get_db),
    auth_service: AuthenticationService = Depends(get_auth_service),
    authz_service: AuthorizationService = Depends(get_authz_service),
    session_service: SessionService = Depends(get_session_service),
    audit_service: AuditService = Depends(get_audit_service)
):
    """User login with rate limiting and security checks"""
    # Rate limiting
    client_ip = request.client.host
    if not auth_service.check_rate_limit(f"login:{client_ip}"):
        raise HTTPException(status_code=429, detail="Too many login attempts")
    
    # Find user
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user:
        # Don't reveal if user exists
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    # Check account lockout
    if not auth_service.check_account_lockout(user):
        lockout_remaining = (user.locked_until - datetime.utcnow()).total_seconds() / 60
        raise HTTPException(
            status_code=423, 
            detail=f"Account locked. Try again in {lockout_remaining:.0f} minutes"
        )
    
    # Verify password
    if not auth_service.verify_password(login_data.password, user.hashed_password):
        auth_service.increment_failed_attempts(user)
        audit_service.log_action(
            user_id=user.id,
            action="login.failed",
            ip_address=client_ip,
            user_agent=request.headers.get("user-agent"),
            details={"reason": "invalid_password"}
        )
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    # Check if account is active
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Account is disabled")
    
    # Successful login
    auth_service.reset_failed_attempts(user)
    
    # Create tokens
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth_service.create_access_token(
        data={"sub": str(user.id)}, 
        expires_delta=access_token_expires
    )
    refresh_token = auth_service.create_refresh_token(data={"sub": str(user.id)})
    
    # Create session
    session = session_service.create_session(user, request, device_info)
    
    # Get user roles
    user_roles = authz_service.get_user_roles(user.id, user.organization_id)
    
    # Log successful login
    audit_service.log_action(
        user_id=user.id,
        action="login.success",
        ip_address=client_ip,
        user_agent=request.headers.get("user-agent"),
        details={"device_fingerprint": device_info.device_fingerprint}
    )
    
    user_response = UserResponse(
        id=user.id,
        email=user.email,
        username=user.username,
        full_name=user.full_name,
        is_active=user.is_active,
        is_verified=user.is_verified,
        mfa_enabled=user.mfa_enabled,
        organization_id=user.organization_id,
        roles=user_roles,
        last_login=user.last_login,
        created_at=user.created_at
    )
    
    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=user_response
    )

@auth_router.post("/refresh", response_model=Token)
async def refresh_token(
    refresh_data: TokenRefresh,
    db: Session = Depends(get_db),
    auth_service: AuthenticationService = Depends(get_auth_service),
    authz_service: AuthorizationService = Depends(get_authz_service),
    audit_service: AuditService = Depends(get_audit_service)
):
    """Refresh access token"""
    payload = auth_service.verify_token(refresh_data.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = db.query(User).filter(User.id == UUID(user_id)).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="Invalid user")
    
    # Create new tokens
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    new_access_token = auth_service.create_access_token(
        data={"sub": str(user.id)}, 
        expires_delta=access_token_expires
    )
    new_refresh_token = auth_service.create_refresh_token(data={"sub": str(user.id)})
    
    # Log token refresh
    audit_service.log_action(
        user_id=user.id,
        action="token.refreshed",
        details={"token_type": "access"}
    )
    
    user_roles = authz_service.get_user_roles(user.id, user.organization_id)
    
    user_response = UserResponse(
        id=user.id,
        email=user.email,
        username=user.username,
        full_name=user.full_name,
        is_active=user.is_active,
        is_verified=user.is_verified,
        mfa_enabled=user.mfa_enabled,
        organization_id=user.organization_id,
        roles=user_roles,
        last_login=user.last_login,
        created_at=user.created_at
    )
    
    return Token(
        access_token=new_access_token,
        refresh_token=new_refresh_token,
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=user_response
    )

@auth_router.post("/logout")
async def logout(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
    session_service: SessionService = Depends(get_session_service),
    audit_service: AuditService = Depends(get_audit_service)
):
    """Logout user and revoke session"""
    # This would typically get the session ID from the token
    # For now, revoke all sessions
    session_count = session_service.revoke_all_sessions(current_user.id)
    
    audit_service.log_action(
        user_id=current_user.id,
        action="logout",
        details={"revoked_sessions": session_count}
    )
    
    return {"message": "Successfully logged out"}

@auth_router.get("/me", response_model=UserResponse)
async def get_me(
    current_user: User = Depends(get_current_active_user),
    authz_service: AuthorizationService = Depends(get_authz_service)
):
    """Get current user profile"""
    user_roles = authz_service.get_user_roles(current_user.id, current_user.organization_id)
    
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        username=current_user.username,
        full_name=current_user.full_name,
        is_active=current_user.is_active,
        is_verified=current_user.is_verified,
        mfa_enabled=current_user.mfa_enabled,
        organization_id=current_user.organization_id,
        roles=user_roles,
        last_login=current_user.last_login,
        created_at=current_user.created_at
    )

@auth_router.post("/change-password")
async def change_password(
    password_data: PasswordChange,
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db),
    auth_service: AuthenticationService = Depends(get_auth_service),
    audit_service: AuditService = Depends(get_audit_service)
):
    """Change user password"""
    # Verify current password
    if not auth_service.verify_password(password_data.current_password, current_user.hashed_password):
        audit_service.log_action(
            user_id=current_user.id,
            action="password.change.failed",
            details={"reason": "invalid_current_password"}
        )
        raise HTTPException(status_code=400, detail="Invalid current password")
    
    # Hash new password
    new_hashed_password = auth_service.get_password_hash(password_data.new_password)
    
    # Update password
    current_user.hashed_password = new_hashed_password
    current_user.password_changed_at = datetime.utcnow()
    
    # Revoke all sessions except current
    session_service = SessionService(db)
    session_service.revoke_all_sessions(current_user.id)
    
    db.commit()
    
    audit_service.log_action(
        user_id=current_user.id,
        action="password.changed",
        details={"forced_logout": True}
    )
    
    return {"message": "Password changed successfully"}

@auth_router.get("/sessions")
async def get_sessions(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
    session_service: SessionService = Depends(get_session_service)
):
    """Get user sessions"""
    sessions = db.query(UserSession).filter(
        UserSession.user_id == current_user.id,
        UserSession.is_active == True
    ).all()
    
    return [
        {
            "id": session.id,
            "ip_address": session.ip_address,
            "user_agent": session.user_agent,
            "device_fingerprint": session.device_fingerprint,
            "created_at": session.created_at,
            "last_activity": session.last_activity,
            "expires_at": session.expires_at
        }
        for session in sessions
    ]

@auth_router.post("/sessions/{session_id}/revoke")
async def revoke_session(
    session_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
    session_service: SessionService = Depends(get_session_service),
    audit_service: AuditService = Depends(get_audit_service)
):
    """Revoke specific session"""
    success = session_service.revoke_session(session_id, current_user.id)
    
    if success:
        audit_service.log_action(
            user_id=current_user.id,
            action="session.revoked",
            resource_type="session",
            resource_id=str(session_id)
        )
        return {"message": "Session revoked successfully"}
    else:
        raise HTTPException(status_code=404, detail="Session not found")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(auth_router, host="0.0.0.0", port=8000)