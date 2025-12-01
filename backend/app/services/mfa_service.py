"""
Multi-Factor Authentication (MFA) Service
Supports TOTP, SMS, and backup codes for enterprise security
"""

import base64
import hashlib
import hmac
import pyotp
import qrcode
import secrets
import smtplib
from datetime import datetime, timedelta
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from io import BytesIO
from typing import Dict, List, Optional, Tuple
from urllib.parse import quote

import aiohttp
import jwt
from cryptography.fernet import Fernet
from fastapi import HTTPException, Depends, Request
from pydantic import BaseModel, Field, validator
import phonenumbers
from phonenumbers import NumberParseException

from app.core.config import settings
from app.core.database import get_db

# MFA schemas
class MFASetupRequest(BaseModel):
    """MFA setup request"""
    user_id: str
    method: str = Field(..., pattern="^(totp|sms|backup)$")
    phone_number: Optional[str] = None
    
    @validator('method')
    def validate_method(cls, v):
        if v not in ['totp', 'sms', 'backup']:
            raise ValueError('MFA method must be totp, sms, or backup')
        return v
    
    @validator('phone_number')
    def validate_phone_number(cls, v, values):
        if values.get('method') == 'sms' and not v:
            raise ValueError('Phone number required for SMS MFA')
        return v

class MFAVerificationRequest(BaseModel):
    """MFA verification request"""
    user_id: str
    code: str
    method: str = Field(..., pattern="^(totp|sms|backup)$")
    temp_token: Optional[str] = None  # Temporary token from login attempt

class MFASetupResponse(BaseModel):
    """MFA setup response"""
    success: bool
    totp_secret: Optional[str] = None
    qr_code_url: Optional[str] = None
    backup_codes: Optional[List[str]] = None
    sms_sent: Optional[bool] = None
    temp_token: Optional[str] = None
    error: Optional[str] = None

class MFAVerificationResponse(BaseModel):
    """MFA verification response"""
    success: bool
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    mfa_verified: bool = True
    error: Optional[str] = None

class BackupCode(BaseModel):
    """Backup code entry"""
    code: str
    used: bool = False
    created_at: datetime
    used_at: Optional[datetime] = None

class DeviceInfo(BaseModel):
    """Device information for MFA"""
    device_id: str
    device_name: str
    device_type: str  # 'mobile', 'desktop', 'tablet', 'other'
    browser: Optional[str] = None
    os: Optional[str] = None
    ip_address: str
    trusted: bool = False
    last_used: datetime

class SessionSecurity:
    """Session security and device management"""
    
    def __init__(self):
        self.active_sessions = {}
        self.trusted_devices = {}
        self.failed_attempts = {}
        
    def record_failed_attempt(self, user_id: str, ip_address: str):
        """Record failed MFA attempt"""
        key = f"{user_id}:{ip_address}"
        if key not in self.failed_attempts:
            self.failed_attempts[key] = []
        
        self.failed_attempts[key].append(datetime.utcnow())
        
        # Clean old attempts (keep last hour)
        cutoff = datetime.utcnow() - timedelta(hours=1)
        self.failed_attempts[key] = [
            attempt for attempt in self.failed_attempts[key] 
            if attempt > cutoff
        ]
    
    def check_rate_limit(self, user_id: str, ip_address: str, max_attempts: int = 5) -> bool:
        """Check if user exceeded rate limit"""
        key = f"{user_id}:{ip_address}"
        attempts = self.failed_attempts.get(key, [])
        return len(attempts) >= max_attempts
    
    def add_trusted_device(self, user_id: str, device: DeviceInfo):
        """Add device to trusted list"""
        if user_id not in self.trusted_devices:
            self.trusted_devices[user_id] = {}
        
        self.trusted_devices[user_id][device.device_id] = device
        
        # Limit trusted devices to 10 per user
        if len(self.trusted_devices[user_id]) > 10:
            oldest_device = min(
                self.trusted_devices[user_id].items(),
                key=lambda x: x[1].last_used
            )
            del self.trusted_devices[user_id][oldest_device[0]]
    
    def is_device_trusted(self, user_id: str, device_id: str) -> bool:
        """Check if device is trusted"""
        return (user_id in self.trusted_devices and 
                device_id in self.trusted_devices[user_id])

class MFAService:
    """Enterprise Multi-Factor Authentication Service"""
    
    def __init__(self):
        self.session_security = SessionSecurity()
        self.encryption_key = Fernet.generate_key()
        self.cipher_suite = Fernet(self.encryption_key)
        
    def _encrypt_sensitive_data(self, data: str) -> str:
        """Encrypt sensitive data like phone numbers"""
        return self.cipher_suite.encrypt(data.encode()).decode()
    
    def _decrypt_sensitive_data(self, encrypted_data: str) -> str:
        """Decrypt sensitive data"""
        return self.cipher_suite.decrypt(encrypted_data.encode()).decode()
    
    def generate_totp_secret(self) -> str:
        """Generate TOTP secret for authenticator apps"""
        return pyotp.random_base32()
    
    def generate_totp_qr_code(self, email: str, secret: str, issuer: str = "OptiBid Energy") -> str:
        """Generate QR code for TOTP setup"""
        totp_uri = pyotp.totp.TOTP(secret).provisioning_uri(
            name=email,
            issuer_name=issuer
        )
        
        qr = qrcode.QRCode(version=1, box_size=10, border=4)
        qr.add_data(totp_uri)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Convert to base64 for easy embedding
        buffer = BytesIO()
        img.save(buffer, format='PNG')
        buffer.seek(0)
        img_str = base64.b64encode(buffer.getvalue()).decode()
        
        return f"data:image/png;base64,{img_str}"
    
    def verify_totp_code(self, secret: str, code: str, tolerance: int = 1) -> bool:
        """Verify TOTP code with tolerance for clock skew"""
        totp = pyotp.TOTP(secret)
        return totp.verify(code, valid_window=tolerance)
    
    def generate_backup_codes(self, count: int = 10) -> List[str]:
        """Generate backup codes"""
        codes = []
        for _ in range(count):
            # Generate 8-digit codes in format XXXX-XXXX
            code = f"{secrets.randbelow(10000):04d}-{secrets.randbelow(10000):04d}"
            codes.append(code)
        return codes
    
    async def setup_mfa(self, request: MFASetupRequest) -> MFASetupResponse:
        """Setup MFA for user"""
        db = get_database()
        
        try:
            if request.method == "totp":
                return await self._setup_totp(request)
            elif request.method == "sms":
                return await self._setup_sms(request)
            elif request.method == "backup":
                return await self._setup_backup_codes(request)
            else:
                return MFASetupResponse(success=False, error="Invalid MFA method")
                
        except Exception as e:
            return MFASetupResponse(success=False, error=f"MFA setup failed: {str(e)}")
    
    async def _setup_totp(self, request: MFASetupRequest) -> MFASetupResponse:
        """Setup TOTP authentication"""
        db = get_database()
        
        # Generate TOTP secret
        secret = self.generate_totp_secret()
        
        # Get user email
        user = await db.fetchrow("SELECT email FROM users WHERE id = $1", request.user_id)
        if not user:
            return MFASetupResponse(success=False, error="User not found")
        
        # Generate QR code
        qr_code_url = self.generate_totp_qr_code(user['email'], secret)
        
        # Store secret temporarily (encrypted)
        encrypted_secret = self._encrypt_sensitive_data(secret)
        temp_token = secrets.token_urlsafe(32)
        
        # Store in session for verification step
        self.session_security.active_sessions[temp_token] = {
            "user_id": request.user_id,
            "method": "totp",
            "secret": encrypted_secret,
            "created_at": datetime.utcnow()
        }
        
        return MFASetupResponse(
            success=True,
            totp_secret=secret,
            qr_code_url=qr_code_url,
            temp_token=temp_token
        )
    
    async def _setup_sms(self, request: MFASetupRequest) -> MFASetupResponse:
        """Setup SMS authentication"""
        db = get_database()
        
        # Validate phone number
        try:
            phone_num = phonenumbers.parse(request.phone_number, None)
            if not phonenumbers.is_valid_number(phone_num):
                return MFASetupResponse(success=False, error="Invalid phone number")
        except NumberParseException:
            return MFASetupResponse(success=False, error="Invalid phone number format")
        
        # Store phone number temporarily
        encrypted_phone = self._encrypt_sensitive_data(request.phone_number)
        temp_token = secrets.token_urlsafe(32)
        
        self.session_security.active_sessions[temp_token] = {
            "user_id": request.user_id,
            "method": "sms",
            "phone_number": encrypted_phone,
            "created_at": datetime.utcnow()
        }
        
        return MFASetupResponse(success=True, temp_token=temp_token)
    
    async def _setup_backup_codes(self, request: MFASetupRequest) -> MFASetupResponse:
        """Setup backup codes"""
        db = get_database()
        
        # Generate backup codes
        backup_codes = self.generate_backup_codes()
        
        # Store codes temporarily
        temp_token = secrets.token_urlsafe(32)
        self.session_security.active_sessions[temp_token] = {
            "user_id": request.user_id,
            "method": "backup",
            "backup_codes": backup_codes,
            "created_at": datetime.utcnow()
        }
        
        return MFASetupResponse(success=True, backup_codes=backup_codes, temp_token=temp_token)
    
    async def verify_mfa_setup(self, user_id: str, code: str, temp_token: str) -> bool:
        """Verify MFA setup with user confirmation"""
        session_data = self.session_security.active_sessions.get(temp_token)
        if not session_data or session_data["user_id"] != user_id:
            return False
        
        db = get_database()
        
        try:
            if session_data["method"] == "totp":
                secret = self._decrypt_sensitive_data(session_data["secret"])
                if not self.verify_totp_code(secret, code):
                    return False
                
                # Store TOTP secret permanently
                await db.execute("""
                    UPDATE users 
                    SET mfa_secret = $1, mfa_method = 'totp', mfa_enabled = true
                    WHERE id = $2
                """, secret, user_id)
                
            elif session_data["method"] == "sms":
                # Send SMS verification code
                phone_number = self._decrypt_sensitive_data(session_data["phone_number"])
                verification_code = f"{secrets.randbelow(1000000):06d}"
                
                await self._send_sms_verification(phone_number, verification_code)
                
                # Store phone number and verification code
                encrypted_phone = self._encrypt_sensitive_data(phone_number)
                await db.execute("""
                    UPDATE users 
                    SET mfa_phone = $1, mfa_verification_code = $2, mfa_method = 'sms'
                    WHERE id = $3
                """, encrypted_phone, verification_code, user_id)
                
            elif session_data["method"] == "backup":
                # Store backup codes
                backup_codes = session_data["backup_codes"]
                encrypted_codes = self._encrypt_sensitive_data(json.dumps(backup_codes))
                
                await db.execute("""
                    UPDATE users 
                    SET mfa_backup_codes = $1, mfa_method = 'backup', mfa_enabled = true
                    WHERE id = $2
                """, encrypted_codes, user_id)
            
            # Clean up temporary session
            del self.session_security.active_sessions[temp_token]
            return True
            
        except Exception:
            return False
    
    async def verify_mfa_login(self, request: MFAVerificationRequest, ip_address: str) -> MFAVerificationResponse:
        """Verify MFA during login process"""
        db = get_database()
        
        # Check rate limiting
        if self.session_security.check_rate_limit(request.user_id, ip_address):
            return MFAVerificationResponse(
                success=False,
                error="Too many failed attempts. Please try again later."
            )
        
        try:
            # Get user MFA settings
            user = await db.fetchrow("""
                SELECT mfa_secret, mfa_phone, mfa_verification_code, mfa_backup_codes, mfa_enabled, mfa_method
                FROM users WHERE id = $1
            """, request.user_id)
            
            if not user or not user['mfa_enabled']:
                return MFAVerificationResponse(success=False, error="MFA not enabled for user")
            
            if request.method == "totp":
                return await self._verify_totp_login(request, user, ip_address)
            elif request.method == "sms":
                return await self._verify_sms_login(request, user, ip_address)
            elif request.method == "backup":
                return await self._verify_backup_code_login(request, user, ip_address)
            else:
                return MFAVerificationResponse(success=False, error="Invalid MFA method")
                
        except Exception as e:
            self.session_security.record_failed_attempt(request.user_id, ip_address)
            return MFAVerificationResponse(success=False, error=f"MFA verification failed: {str(e)}")
    
    async def _verify_totp_login(self, request: MFAVerificationRequest, user: dict, ip_address: str) -> MFAVerificationResponse:
        """Verify TOTP during login"""
        if not user['mfa_secret']:
            return MFAVerificationResponse(success=False, error="TOTP not configured")
        
        if self.verify_totp_code(user['mfa_secret'], request.code):
            # Successful verification
            access_token, refresh_token = await self._create_tokens(request.user_id)
            return MFAVerificationResponse(
                success=True,
                access_token=access_token,
                refresh_token=refresh_token
            )
        else:
            self.session_security.record_failed_attempt(request.user_id, ip_address)
            return MFAVerificationResponse(success=False, error="Invalid TOTP code")
    
    async def _verify_sms_login(self, request: MFAVerificationRequest, user: dict, ip_address: str) -> MFAVerificationResponse:
        """Verify SMS during login"""
        if not user['mfa_verification_code']:
            return MFAVerificationResponse(success=False, error="SMS verification not available")
        
        if request.code == user['mfa_verification_code']:
            # Clear verification code after successful use
            await get_database().execute("""
                UPDATE users SET mfa_verification_code = NULL WHERE id = $1
            """, request.user_id)
            
            # Successful verification
            access_token, refresh_token = await self._create_tokens(request.user_id)
            return MFAVerificationResponse(
                success=True,
                access_token=access_token,
                refresh_token=refresh_token
            )
        else:
            self.session_security.record_failed_attempt(request.user_id, ip_address)
            return MFAVerificationResponse(success=False, error="Invalid SMS code")
    
    async def _verify_backup_code_login(self, request: MFAVerificationRequest, user: dict, ip_address: str) -> MFAVerificationResponse:
        """Verify backup code during login"""
        if not user['mfa_backup_codes']:
            return MFAVerificationResponse(success=False, error="Backup codes not configured")
        
        # Decrypt and validate backup codes
        backup_codes = json.loads(self._decrypt_sensitive_data(user['mfa_backup_codes']))
        
        if request.code in backup_codes:
            # Remove used backup code
            backup_codes.remove(request.code)
            updated_codes = self._encrypt_sensitive_data(json.dumps(backup_codes))
            
            await get_database().execute("""
                UPDATE users SET mfa_backup_codes = $1 WHERE id = $2
            """, updated_codes, request.user_id)
            
            # Successful verification
            access_token, refresh_token = await self._create_tokens(request.user_id)
            return MFAVerificationResponse(
                success=True,
                access_token=access_token,
                refresh_token=refresh_token
            )
        else:
            self.session_security.record_failed_attempt(request.user_id, ip_address)
            return MFAVerificationResponse(success=False, error="Invalid backup code")
    
    async def _send_sms_verification(self, phone_number: str, code: str):
        """Send SMS verification code"""
        # Integration with SMS provider (Twilio, AWS SNS, etc.)
        # For now, just log the SMS (in production, integrate with actual SMS service)
        print(f"SMS to {phone_number}: Your OptiBid Energy verification code is {code}")
        
        # Example Twilio integration:
        # from twilio.rest import Client
        # client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        # client.messages.create(
        #     body=f"Your OptiBid Energy verification code is {code}",
        #     from_=settings.TWILIO_PHONE_NUMBER,
        #     to=phone_number
        # )
    
    async def _create_tokens(self, user_id: str) -> Tuple[str, str]:
        """Create access and refresh tokens after successful MFA"""
        from app.services.sso_service import sso_service
        
        # Get user data
        user = await get_database().fetchrow("""
            SELECT email, organization_id, role FROM users WHERE id = $1
        """, user_id)
        
        user_data = {
            "user_id": user_id,
            "email": user['email'],
            "organization_id": str(user['organization_id']) if user['organization_id'] else None,
            "role": user['role']
        }
        
        access_token = sso_service.create_jwt_token(user_data)
        refresh_token = sso_service.create_refresh_token(user_data)
        
        return access_token, refresh_token
    
    async def disable_mfa(self, user_id: str, method: str) -> bool:
        """Disable MFA for user"""
        db = get_database()
        
        if method == "totp":
            await db.execute("""
                UPDATE users SET mfa_secret = NULL, mfa_enabled = false WHERE id = $1
            """, user_id)
        elif method == "sms":
            await db.execute("""
                UPDATE users SET mfa_phone = NULL, mfa_verification_code = NULL, mfa_enabled = false WHERE id = $1
            """, user_id)
        elif method == "backup":
            await db.execute("""
                UPDATE users SET mfa_backup_codes = NULL, mfa_enabled = false WHERE id = $1
            """, user_id)
        
        return True

# Global MFA service instance
mfa_service = MFAService()