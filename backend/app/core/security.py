"""
OptiBid Energy Platform - Security Module
Authentication, authorization, and security utilities
"""

from datetime import datetime, timedelta
from typing import Optional, Union, Dict, Any
from jose import JWTError, jwt
from passlib.context import CryptContext
from passlib.hash import bcrypt
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
import secrets
import hashlib
import hmac

from app.core.config import get_settings
from app.models import User
from app.core.database import get_db

settings = get_settings()

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# HTTP Bearer token scheme
security = HTTPBearer(auto_error=False)

class SecurityManager:
    """Security and authentication manager"""
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash"""
        return pwd_context.verify(plain_password, hashed_password)
    
    @staticmethod
    def get_password_hash(password: str) -> str:
        """Generate password hash"""
        return pwd_context.hash(password)
    
    @staticmethod
    def generate_token(data: dict, token_type: str = "access") -> str:
        """Generate JWT token"""
        to_encode = data.copy()
        
        if token_type == "access":
            expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        else:  # refresh token
            expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        
        to_encode.update({"exp": expire, "type": token_type})
        encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
        return encoded_jwt
    
    @staticmethod
    def verify_token(token: str, token_type: str = "access") -> Optional[dict]:
        """Verify and decode JWT token"""
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            
            # Check token type
            if payload.get("type") != token_type:
                return None
            
            return payload
        except JWTError:
            return None
    
    @staticmethod
    def create_access_token(user_id: str, organization_id: str) -> str:
        """Create access token for user"""
        data = {
            "sub": user_id,
            "org_id": organization_id,
            "iat": datetime.utcnow()
        }
        return SecurityManager.generate_token(data, "access")
    
    @staticmethod
    def create_refresh_token(user_id: str, organization_id: str) -> str:
        """Create refresh token for user"""
        data = {
            "sub": user_id,
            "org_id": organization_id,
            "iat": datetime.utcnow()
        }
        return SecurityManager.generate_token(data, "refresh")
    
    @staticmethod
    def generate_api_key(organization_id: str, user_id: str) -> str:
        """Generate API key for external integrations"""
        timestamp = datetime.utcnow().isoformat()
        secret = f"{organization_id}:{user_id}:{timestamp}:{settings.SECRET_KEY}"
        key_hash = hashlib.sha256(secret.encode()).hexdigest()
        return f"ok_{key_hash[:32]}"
    
    @staticmethod
    def verify_api_key(api_key: str, organization_id: str) -> bool:
        """Verify API key"""
        try:
            if not api_key.startswith("ok_"):
                return False
            
            key_hash = api_key[3:]  # Remove "ok_" prefix
            expected_hash = hashlib.sha256(
                f"{organization_id}:*:{settings.SECRET_KEY}".encode()
            ).hexdigest()[:32]
            
            return hmac.compare_digest(key_hash, expected_hash)
        except Exception:
            return False

# Authentication dependencies
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    """Get current authenticated user"""
    # Import here to avoid circular dependency
    from app.crud.user import user_crud
    
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = credentials.credentials
    payload = SecurityManager.verify_token(token, "access")
    
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
    
    user = await user_crud.get(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if user.status != "active":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is not active",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user

async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """Get current active user"""
    if current_user.deleted_at is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    return current_user

# Role-based access control
class PermissionChecker:
    """Permission checker for role-based access"""
    
    ALLOWED_ROLES = {
        # Admin can access everything
        "admin": ["*"],
        # Analyst can access trading and analytics data
        "analyst": [
            "assets:read", "assets:write",
            "bids:read", "bids:write",
            "market_data:read",
            "datasets:read", "datasets:write",
            "dashboards:read", "dashboards:write",
            "ml_models:read"
        ],
        # Trader can access bidding and trading data
        "trader": [
            "assets:read",
            "bids:read", "bids:write",
            "market_data:read",
            "dashboards:read"
        ],
        # Viewer can only read data
        "viewer": [
            "assets:read",
            "bids:read",
            "market_data:read",
            "dashboards:read"
        ],
        # Customer success can access user management
        "customer_success": [
            "users:read", "users:write",
            "organizations:read", "organizations:write",
            "billing:read",
            "compliance:read"
        ]
    }
    
    @classmethod
    def check_permission(cls, user: User, resource: str, action: str) -> bool:
        """Check if user has permission for resource/action"""
        user_role = user.role
        required_permission = f"{resource}:{action}"
        
        if user_role not in cls.ALLOWED_ROLES:
            return False
        
        permissions = cls.ALLOWED_ROLES[user_role]
        
        # Admin has all permissions
        if "*" in permissions:
            return True
        
        # Check specific permission
        return required_permission in permissions

def require_permission(resource: str, action: str):
    """Decorator to require specific permission"""
    def permission_dependency(current_user: User = Depends(get_current_active_user)) -> User:
        if not PermissionChecker.check_permission(current_user, resource, action):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient permissions for {resource}:{action}"
            )
        return current_user
    return permission_dependency

# Organization isolation
async def require_same_organization(
    resource_organization_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Ensure user belongs to the same organization as the resource"""
    if current_user.organization_id != resource_organization_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Cross-organization access not allowed"
        )
    return current_user

# Rate limiting helpers
class RateLimiter:
    """Simple rate limiting implementation"""
    
    # Simple in-memory rate limiting (use Redis in production)
    _attempts = {}
    _reset_times = {}
    
    @classmethod
    def is_rate_limited(cls, identifier: str, limit: int, window_seconds: int) -> bool:
        """Check if identifier is rate limited"""
        now = datetime.utcnow().timestamp()
        
        # Clean up old entries
        cls._reset_times = {
            k: v for k, v in cls._reset_times.items() 
            if v > now - window_seconds
        }
        
        if identifier not in cls._reset_times:
            cls._reset_times[identifier] = now + window_seconds
            cls._attempts[identifier] = 0
        
        # Check if rate limited
        if cls._attempts[identifier] >= limit:
            return True
        
        # Increment attempts
        cls._attempts[identifier] += 1
        return False
    
    @classmethod
    def get_remaining_attempts(cls, identifier: str, limit: int) -> int:
        """Get remaining attempts for identifier"""
        return max(0, limit - cls._attempts.get(identifier, 0))

# Security headers
SECURITY_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "Content-Security-Policy": "default-src 'self'"
}

# Utility functions
def generate_secure_token(length: int = 32) -> str:
    """Generate cryptographically secure random token"""
    return secrets.token_urlsafe(length)

def hash_sensitive_data(data: str) -> str:
    """Hash sensitive data for storage"""
    return hashlib.sha256(data.encode()).hexdigest()

def mask_email(email: str) -> str:
    """Mask email for logging (show only first and last character)"""
    if "@" not in email:
        return "*" * len(email)
    
    local, domain = email.split("@", 1)
    if len(local) <= 2:
        masked_local = local[0] + "*"
    else:
        masked_local = local[0] + "*" * (len(local) - 2) + local[-1]
    
    domain_parts = domain.split(".")
    if len(domain_parts) >= 2:
        masked_domain = "*." + domain_parts[-1]
    else:
        masked_domain = "*"
    
    return f"{masked_local}@{masked_domain}"

# Convenience functions for backward compatibility
def create_access_token(user_id: str, organization_id: str = None) -> str:
    """Create access token (convenience wrapper)"""
    return SecurityManager.create_access_token(user_id, organization_id or "")

def verify_token(token: str, token_type: str = "access") -> Optional[dict]:
    """Verify token (convenience wrapper)"""
    return SecurityManager.verify_token(token, token_type)

def get_password_hash(password: str) -> str:
    """Get password hash (convenience wrapper)"""
    return SecurityManager.get_password_hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password (convenience wrapper)"""
    return SecurityManager.verify_password(plain_password, hashed_password)

# Export main classes and functions
__all__ = [
    "SecurityManager",
    "get_current_user",
    "get_current_active_user", 
    "PermissionChecker",
    "require_permission",
    "require_same_organization",
    "RateLimiter",
    "SECURITY_HEADERS",
    "generate_secure_token",
    "hash_sensitive_data",
    "mask_email",
    "create_access_token",
    "verify_token",
    "get_password_hash",
    "verify_password"
]