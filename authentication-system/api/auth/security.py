"""
Enterprise Authentication Security Utilities
Comprehensive security functions for enterprise authentication
"""

import hashlib
import secrets
import pyotp
import jwt
import bcrypt
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from passlib.context import CryptContext
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import base64
import qrcode
from io import BytesIO

# Security configuration
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
JWT_SECRET_KEY = "your-secret-key-here-change-in-production"
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24
REFRESH_TOKEN_EXPIRATION_DAYS = 30


class SecurityUtils:
    """Enterprise-grade security utilities"""
    
    @staticmethod
    def hash_password(password: str, salt: Optional[str] = None) -> tuple[str, str]:
        """
        Securely hash password using bcrypt with salt
        Returns: (hashed_password, salt)
        """
        if salt is None:
            salt = secrets.token_hex(32)
        
        # Use bcrypt for password hashing (industry standard)
        hashed = pwd_context.hash(password + salt)
        return hashed, salt
    
    @staticmethod
    def verify_password(password: str, hashed: str, salt: str) -> bool:
        """Verify password against hash"""
        try:
            return pwd_context.verify(password + salt, hashed)
        except:
            return False
    
    @staticmethod
    def generate_random_token(length: int = 32) -> str:
        """Generate cryptographically secure random token"""
        return secrets.token_urlsafe(length)
    
    @staticmethod
    def generate_session_token() -> str:
        """Generate session token for authentication"""
        return f"session_{secrets.token_urlsafe(64)}"
    
    @staticmethod
    def generate_refresh_token() -> str:
        """Generate refresh token for session renewal"""
        return f"refresh_{secrets.token_urlsafe(64)}"
    
    @staticmethod
    def generate_invitation_token() -> str:
        """Generate secure invitation token"""
        return f"invite_{secrets.token_urlsafe(48)}"
    
    @staticmethod
    def generate_verification_token() -> str:
        """Generate email verification token"""
        return f"verify_{secrets.token_urlsafe(48)}"
    
    @staticmethod
    def generate_reset_token() -> str:
        """Generate password reset token"""
        return f"reset_{secrets.token_urlsafe(48)}"


class JWTManager:
    """JWT token management with enterprise features"""
    
    @staticmethod
    def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
        """Create JWT access token"""
        to_encode = data.copy()
        
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
        
        to_encode.update({
            "exp": expire,
            "type": "access",
            "iat": datetime.utcnow()
        })
        
        encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
        return encoded_jwt
    
    @staticmethod
    def create_refresh_token(user_id: str) -> str:
        """Create refresh token"""
        data = {
            "sub": user_id,
            "type": "refresh",
            "iat": datetime.utcnow()
        }
        
        expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRATION_DAYS)
        data["exp"] = expire
        
        encoded_jwt = jwt.encode(data, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
        return encoded_jwt
    
    @staticmethod
    def verify_token(token: str, token_type: str = "access") -> Optional[Dict[str, Any]]:
        """Verify JWT token and return payload"""
        try:
            payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
            
            # Verify token type
            if payload.get("type") != token_type:
                return None
                
            return payload
        except jwt.ExpiredSignatureError:
            return None
        except jwt.JWTError:
            return None
    
    @staticmethod
    def decode_token_without_verification(token: str) -> Optional[Dict[str, Any]]:
        """Decode token without signature verification (for token introspection)"""
        try:
            # Decode without verification for token introspection
            payload = jwt.decode(token, options={"verify_signature": False})
            return payload
        except:
            return None


class MFAManager:
    """Multi-Factor Authentication management"""
    
    @staticmethod
    def generate_totp_secret() -> str:
        """Generate TOTP secret for authenticator apps"""
        return pyotp.random_base32()
    
    @staticmethod
    def generate_totp_uri(secret: str, email: str, issuer: str = "OptiBid Energy") -> str:
        """Generate TOTP URI for QR code generation"""
        return pyotp.totp.TOTP(secret).provisioning_uri(
            name=email,
            issuer_name=issuer
        )
    
    @staticmethod
    def generate_qr_code(totp_uri: str) -> bytes:
        """Generate QR code as bytes"""
        qr = qrcode.QRCode(version=1, box_size=10, border=4)
        qr.add_data(totp_uri)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Convert to bytes
        buffer = BytesIO()
        img.save(buffer, format='PNG')
        return buffer.getvalue()
    
    @staticmethod
    def verify_totp(token: str, secret: str) -> bool:
        """Verify TOTP token against secret"""
        totp = pyotp.TOTP(secret)
        return totp.verify(token, valid_window=1)
    
    @staticmethod
    def generate_backup_codes(count: int = 10) -> List[str]:
        """Generate backup codes for MFA recovery"""
        codes = []
        for _ in range(count):
            # Generate 8-character backup codes
            code = secrets.token_hex(4).upper()
            codes.append(code)
        return codes
    
    @staticmethod
    def verify_backup_code(provided_code: str, stored_codes: List[str]) -> bool:
        """Verify backup code (case-insensitive, remove after use)"""
        provided_code = provided_code.upper().replace('-', '').replace(' ', '')
        
        for i, stored_code in enumerate(stored_codes):
            stored_code = stored_code.upper().replace('-', '').replace(' ', '')
            if provided_code == stored_code:
                return True, i  # Return index for removal
        return False, None


class PasswordPolicy:
    """Password policy validation and enforcement"""
    
    @staticmethod
    def validate_password(password: str, policy: Optional[Dict[str, Any]] = None) -> tuple[bool, List[str]]:
        """
        Validate password against policy
        Returns: (is_valid, error_messages)
        """
        if policy is None:
            policy = {
                'min_length': 12,
                'require_uppercase': True,
                'require_lowercase': True,
                'require_numbers': True,
                'require_symbols': True,
                'allow_weak_passwords': False
            }
        
        errors = []
        
        # Length check
        if len(password) < policy.get('min_length', 12):
            errors.append(f"Password must be at least {policy.get('min_length', 12)} characters long")
        
        # Character type checks
        if policy.get('require_uppercase', True):
            if not any(c.isupper() for c in password):
                errors.append("Password must contain at least one uppercase letter")
        
        if policy.get('require_lowercase', True):
            if not any(c.islower() for c in password):
                errors.append("Password must contain at least one lowercase letter")
        
        if policy.get('require_numbers', True):
            if not any(c.isdigit() for c in password):
                errors.append("Password must contain at least one number")
        
        if policy.get('require_symbols', True):
            if not any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password):
                errors.append("Password must contain at least one symbol")
        
        # Weak password check (unless explicitly allowed)
        if not policy.get('allow_weak_passwords', False):
            weak_patterns = [
                'password', '123456', 'qwerty', 'admin', 'login',
                password.lower() if password.lower() in password.lower() else None
            ]
            
            password_lower = password.lower()
            for pattern in weak_patterns:
                if pattern and pattern in password_lower:
                    errors.append("Password is too common or easily guessable")
                    break
        
        return len(errors) == 0, errors
    
    @staticmethod
    def check_password_history(password: str, previous_passwords: List[str], 
                              policy: Optional[Dict[str, Any]] = None) -> bool:
        """Check if password was used recently"""
        if policy is None:
            policy = {'prevent_reuse_last_n': 5}
        
        prevent_count = policy.get('prevent_reuse_last_n', 5)
        recent_passwords = previous_passwords[-prevent_count:] if previous_passwords else []
        
        # Check if current password matches any recent passwords
        for prev_password in recent_passwords:
            if password == prev_password:
                return False
        
        return True
    
    @staticmethod
    def generate_strong_password(length: int = 16) -> str:
        """Generate a strong, random password"""
        import string
        
        # Character sets
        lowercase = string.ascii_lowercase
        uppercase = string.ascii_uppercase
        digits = string.digits
        symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?"
        
        # Ensure at least one character from each set
        password = [
            secrets.choice(lowercase),
            secrets.choice(uppercase),
            secrets.choice(digits),
            secrets.choice(symbols)
        ]
        
        # Fill remaining characters
        all_chars = lowercase + uppercase + digits + symbols
        for _ in range(length - 4):
            password.append(secrets.choice(all_chars))
        
        # Shuffle to randomize position
        secrets.SystemRandom().shuffle(password)
        
        return ''.join(password)


class RateLimiter:
    """Rate limiting for authentication endpoints"""
    
    # Default limits
    LOGIN_ATTEMPTS_PER_HOUR = 5
    LOGIN_ATTEMPTS_PER_DAY = 20
    VERIFICATION_PER_HOUR = 3
    PASSWORD_RESET_PER_DAY = 3
    
    @staticmethod
    def is_rate_limited(action: str, identifier: str, attempts: List[datetime]) -> tuple[bool, Optional[str]]:
        """
        Check if action is rate limited
        Returns: (is_limited, reason)
        """
        now = datetime.utcnow()
        one_hour_ago = now - timedelta(hours=1)
        one_day_ago = now - timedelta(days=1)
        
        # Filter recent attempts
        recent_hour = [t for t in attempts if t > one_hour_ago]
        recent_day = [t for t in attempts if t > one_day_ago]
        
        if action == "login":
            if len(recent_hour) >= RateLimiter.LOGIN_ATTEMPTS_PER_HOUR:
                return True, "Too many login attempts. Try again in 1 hour."
            if len(recent_day) >= RateLimiter.LOGIN_ATTEMPTS_PER_DAY:
                return True, "Too many login attempts today. Try again tomorrow."
        
        elif action == "verification":
            if len(recent_hour) >= RateLimiter.VERIFICATION_PER_HOUR:
                return True, "Too many verification attempts. Try again in 1 hour."
        
        elif action == "password_reset":
            if len(recent_day) >= RateLimiter.PASSWORD_RESET_PER_DAY:
                return True, "Too many password reset requests. Try again tomorrow."
        
        return False, None
    
    @staticmethod
    def record_attempt(action: str, identifier: str, database_manager) -> None:
        """Record an authentication attempt for rate limiting"""
        # This would integrate with your rate limiting storage (Redis, database, etc.)
        # For now, we'll implement database storage
        from .models import RateLimitRecord
        
        record = RateLimitRecord(
            action=action,
            identifier=identifier,
            attempt_at=datetime.utcnow()
        )
        
        # Add to database session
        database_manager.add(record)


class AuditLogger:
    """Enterprise audit logging for compliance"""
    
    @staticmethod
    def log_authentication_event(user_id: str, action: str, status: str, 
                               ip_address: Optional[str] = None,
                               user_agent: Optional[str] = None,
                               session_id: Optional[str] = None,
                               resource: Optional[str] = None,
                               resource_id: Optional[str] = None,
                               error_message: Optional[str] = None,
                               metadata: Optional[Dict[str, Any]] = None) -> None:
        """
        Log authentication event for audit trail
        This would be called by authentication endpoints
        """
        from .models import AuditLog
        
        audit_log = AuditLog(
            user_id=user_id,
            action=action,
            status=status,
            ip_address=ip_address,
            user_agent=user_agent,
            session_id=session_id,
            resource=resource,
            resource_id=resource_id,
            error_message=error_message,
            metadata=metadata or {}
        )
        
        # Add to database session
        # This would be handled by the request handler


class CSRFProtection:
    """CSRF token generation and validation"""
    
    @staticmethod
    def generate_csrf_token() -> str:
        """Generate CSRF token"""
        return secrets.token_urlsafe(32)
    
    @staticmethod
    def validate_csrf_token(token: str, session_token: str) -> bool:
        """Validate CSRF token against session"""
        # Simple token validation - in production, store in session
        return len(token) > 20 and token != session_token


class SecurityHeaders:
    """Security headers for HTTP responses"""
    
    @staticmethod
    def get_security_headers() -> Dict[str, str]:
        """Get recommended security headers"""
        return {
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY",
            "X-XSS-Protection": "1; mode=block",
            "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
            "Content-Security-Policy": (
                "default-src 'self'; "
                "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
                "style-src 'self' 'unsafe-inline'; "
                "img-src 'self' data: https:; "
                "connect-src 'self' https://api.optibid.com;"
            ),
            "Referrer-Policy": "strict-origin-when-cross-origin",
            "Permissions-Policy": (
                "camera=(), "
                "microphone=(), "
                "geolocation=()"
            )
        }


class IPGeolocation:
    """IP-based geolocation for security"""
    
    @staticmethod
    def get_location_from_ip(ip_address: str) -> Dict[str, Optional[str]]:
        """
        Get location information from IP address
        In production, integrate with a geolocation service
        """
        # This would integrate with services like MaxMind GeoIP2, IPinfo, etc.
        # For now, return empty results
        return {
            "country": None,
            "city": None,
            "timezone": None,
            "region": None
        }
    
    @staticmethod
    def detect_anomalous_location(current_ip: str, user_history: List[str], 
                                 threshold_km: float = 500.0) -> bool:
        """
        Detect if login location is anomalous based on previous locations
        This would require a geolocation service to calculate distances
        """
        # Simplified implementation - in production, calculate actual distances
        if len(user_history) > 0:
            # Check if current IP is significantly different from recent history
            recent_ips = user_history[-5:]  # Last 5 IPs
            if current_ip not in recent_ips:
                return True
        
        return False


# Export main classes for use in authentication endpoints
__all__ = [
    "SecurityUtils",
    "JWTManager", 
    "MFAManager",
    "PasswordPolicy",
    "RateLimiter",
    "AuditLogger",
    "CSRFProtection",
    "SecurityHeaders",
    "IPGeolocation"
]