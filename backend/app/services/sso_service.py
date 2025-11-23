"""
SSO Integration Service for OptiBid Energy Platform
Supports SAML 2.0 and OIDC authentication providers
"""

import base64
import hashlib
import hmac
import json
import secrets
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple, Any
from urllib.parse import urlencode, quote, unquote
from xml.etree import ElementTree as ET
from xml.sax.saxutils import escape

import aiohttp
import jwt
from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives.serialization import pkcs12
from cryptography.x509 import load_pem_x509_certificate
from fastapi import HTTPException, Request, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field, validator
import onelogin.saml2 as saml2
from onelogin.saml2.errors import OneLogin_Saml2_Error
import httpx

from app.core.config import settings
from app.core.database import get_db
from app.models import User, Organization

# Security schemas
class SSOProvider(BaseModel):
    """SSO Provider configuration"""
    id: str
    name: str
    type: str  # 'saml' or 'oidc'
    enabled: bool = True
    metadata: Dict[str, Any]
    attribute_mapping: Dict[str, str]
    
    @validator('type')
    def validate_type(cls, v):
        if v not in ['saml', 'oidc']:
            raise ValueError('SSO provider type must be "saml" or "oidc"')
        return v

class SAMLMetadata(BaseModel):
    """SAML 2.0 Metadata"""
    entity_id: str
    acs_url: str
    slo_url: str
    certificate: str
    private_key: str
    name_id_format: str = "urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress"
    
class OIDCProvider(BaseModel):
    """OIDC Provider configuration"""
    client_id: str
    client_secret: str
    auth_url: str
    token_url: str
    userinfo_url: str
    scopes: List[str] = ["openid", "email", "profile"]
    
class SSOResponse(BaseModel):
    """SSO authentication response"""
    success: bool
    user_id: Optional[str] = None
    email: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    organization_id: Optional[str] = None
    role: Optional[str] = "viewer"
    saml_response: Optional[str] = None
    redirect_url: Optional[str] = None
    error: Optional[str] = None

class TokenData(BaseModel):
    """JWT token data"""
    user_id: str
    email: str
    organization_id: Optional[str]
    role: str
    exp: int
    iat: int

class SessionManager:
    """Session management with security features"""
    
    def __init__(self):
        self.sessions = {}
        self.refresh_tokens = {}
        
    def create_session(self, user_data: Dict[str, Any]) -> str:
        """Create user session with security token"""
        session_id = secrets.token_urlsafe(32)
        expires_at = datetime.utcnow() + timedelta(hours=24)
        
        self.sessions[session_id] = {
            "user_data": user_data,
            "expires_at": expires_at,
            "created_at": datetime.utcnow(),
            "last_accessed": datetime.utcnow(),
            "ip_address": None,
            "user_agent": None
        }
        
        return session_id
    
    def validate_session(self, session_id: str, ip_address: str = None, 
                        user_agent: str = None) -> Optional[Dict[str, Any]]:
        """Validate session with security checks"""
        session = self.sessions.get(session_id)
        if not session:
            return None
            
        # Check expiration
        if datetime.utcnow() > session["expires_at"]:
            del self.sessions[session_id]
            return None
            
        # Update access tracking
        session["last_accessed"] = datetime.utcnow()
        session["ip_address"] = ip_address or session.get("ip_address")
        session["user_agent"] = user_agent or session.get("user_agent")
        
        return session["user_data"]
    
    def invalidate_session(self, session_id: str):
        """Invalidate session"""
        if session_id in self.sessions:
            del self.sessions[session_id]

class SSOService:
    """Enterprise SSO Service with SAML 2.0 and OIDC support"""
    
    def __init__(self):
        self.sessions = SessionManager()
        self.sso_providers = self._load_sso_providers()
        self.jwt_secret = settings.SECRET_KEY
        self.encryption_key = self._generate_encryption_key()
        
    def _generate_encryption_key(self) -> bytes:
        """Generate encryption key for sensitive data"""
        return secrets.token_bytes(32)
    
    def _load_sso_providers(self) -> Dict[str, SSOProvider]:
        """Load SSO provider configurations from database"""
        # In production, load from database
        return {
            "azure_ad": SSOProvider(
                id="azure_ad",
                name="Azure Active Directory",
                type="oidc",
                metadata={
                    "client_id": settings.AZURE_AD_CLIENT_ID,
                    "client_secret": settings.AZURE_AD_CLIENT_SECRET,
                    "authority": f"https://login.microsoftonline.com/{settings.AZURE_AD_TENANT_ID}",
                    "redirect_uri": f"{settings.BASE_URL}/auth/oidc/callback/azure_ad"
                },
                attribute_mapping={
                    "email": "email",
                    "first_name": "given_name",
                    "last_name": "family_name",
                    "organization": "organization"
                }
            ),
            "okta": SSOProvider(
                id="okta",
                name="Okta Identity Provider",
                type="oidc",
                metadata={
                    "client_id": settings.OKTA_CLIENT_ID,
                    "client_secret": settings.OKTA_CLIENT_SECRET,
                    "issuer": settings.OKTA_ISSUER,
                    "redirect_uri": f"{settings.BASE_URL}/auth/oidc/callback/okta"
                },
                attribute_mapping={
                    "email": "email",
                    "first_name": "given_name",
                    "last_name": "family_name",
                    "organization": "organization"
                }
            ),
            "google_workspace": SSOProvider(
                id="google_workspace",
                name="Google Workspace",
                type="oidc",
                metadata={
                    "client_id": settings.GOOGLE_CLIENT_ID,
                    "client_secret": settings.GOOGLE_CLIENT_SECRET,
                    "redirect_uri": f"{settings.BASE_URL}/auth/oidc/callback/google_workspace"
                },
                attribute_mapping={
                    "email": "email",
                    "first_name": "given_name",
                    "last_name": "family_name",
                    "organization": "organization"
                }
            ),
            "saml_enterprise": SSOProvider(
                id="saml_enterprise",
                name="Enterprise SAML",
                type="saml",
                metadata={
                    "entity_id": f"{settings.BASE_URL}/saml/metadata",
                    "acs_url": f"{settings.BASE_URL}/auth/saml/acs",
                    "slo_url": f"{settings.BASE_URL}/auth/saml/slo",
                    "certificate": settings.SAML_CERTIFICATE,
                    "private_key": settings.SAML_PRIVATE_KEY
                },
                attribute_mapping={
                    "email": "Email",
                    "first_name": "FirstName",
                    "last_name": "LastName",
                    "organization": "Organization",
                    "role": "Role"
                }
            )
        }
    
    def get_saml_metadata(self) -> str:
        """Generate SAML 2.0 metadata for IdP configuration"""
        metadata_template = f"""<?xml version="1.0" encoding="UTF-8"?>
<md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata"
                    xmlns:ds="http://www.w3.org/2000/09/xmldsig#"
                    entityID="{self.sso_providers["saml_enterprise"].metadata["entity_id"]}">
    <md:SPSSODescriptor protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
        <md:NameIDFormat>urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress</md:NameIDFormat>
        <md:AssertionConsumerService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
                                   Location="{self.sso_providers["saml_enterprise"].metadata["acs_url"]}"
                                   index="1"
                                   isDefault="true"/>
        <md:SingleLogoutService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect"
                               Location="{self.sso_providers["saml_enterprise"].metadata["slo_url"]}"/>
        <md:KeyDescriptor use="signing">
            <ds:KeyInfo>
                <ds:X509Data>
                    <ds:X509Certificate>{self.sso_providers["saml_enterprise"].metadata["certificate"]}</ds:X509Certificate>
                </ds:X509Data>
            </ds:KeyInfo>
        </md:KeyDescriptor>
    </md:SPSSODescriptor>
</md:EntityDescriptor>"""
        return metadata_template
    
    async def initiate_saml_auth(self, provider_id: str, relay_state: str = None) -> str:
        """Initiate SAML authentication flow"""
        provider = self.sso_providers.get(provider_id)
        if not provider or provider.type != "saml":
            raise HTTPException(status_code=400, detail="Invalid SAML provider")
        
        # Generate SAML request
        request_id = secrets.token_urlsafe(16)
        
        # Create SAML AuthnRequest
        auth_request = f"""<?xml version="1.0" encoding="UTF-8"?>
<samlp:AuthnRequest xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
                   xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion"
                   ID="__{request_id}"
                   Version="2.0"
                   IssueInstant="{datetime.utcnow().isoformat()}Z"
                   Destination="{provider.metadata.get('sso_url')}"
                   ProtocolBinding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
                   AssertionConsumerServiceURL="{provider.metadata["acs_url"]}">
    <saml:Issuer>{provider.metadata["entity_id"]}</saml:Issuer>
    <samlp:RequestedAuthnContext Comparison="exact">
        <saml:AuthnContextClassRef xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion">
            urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport
        </saml:AuthnContextClassRef>
    </samlp:RequestedAuthnContext>
</samlp:AuthnRequest>"""
        
        # Encode and sign request
        encoded_request = base64.b64encode(auth_request.encode()).decode()
        
        if relay_state:
            encoded_request += f"&RelayState={quote(relay_state)}"
        
        return f"{provider.metadata.get('sso_url')}?SAMLRequest={quote(encoded_request)}"
    
    async def process_saml_response(self, saml_response: str, relay_state: str = None) -> SSOResponse:
        """Process SAML authentication response"""
        try:
            # Decode SAML response
            decoded_response = base64.b64decode(saml_response).decode()
            
            # Parse XML
            root = ET.fromstring(decoded_response)
            
            # Extract assertions
            namespaces = {
                'saml': 'urn:oasis:names:tc:SAML:2.0:assertion',
                'samlp': 'urn:oasis:names:tc:SAML:2.0:protocol'
            }
            
            # Find status
            status_elem = root.find('.//samlp:Status/samlp:StatusCode', namespaces)
            if status_elem is None or status_elem.get('Value') != 'urn:oasis:names:tc:SAML:2.0:status:Success':
                return SSOResponse(success=False, error="SAML authentication failed")
            
            # Extract user attributes
            attributes = {}
            for attr in root.findall('.//saml:Attribute', namespaces):
                attr_name = attr.get('Name')
                attr_values = [elem.text for elem in attr.findall('.//saml:AttributeValue', namespaces)]
                if attr_values:
                    attributes[attr_name] = attr_values[0]
            
            # Map attributes
            mapped_data = self._map_sso_attributes(attributes, self.sso_providers["saml_enterprise"].attribute_mapping)
            
            # Create or update user
            user = await self._create_or_update_user(mapped_data)
            
            # Create session
            session_id = self.sessions.create_session({
                "user_id": str(user.id),
                "email": user.email,
                "organization_id": str(user.organization_id) if user.organization_id else None,
                "role": user.role
            })
            
            return SSOResponse(
                success=True,
                user_id=str(user.id),
                email=user.email,
                first_name=user.first_name,
                last_name=user.last_name,
                organization_id=str(user.organization_id) if user.organization_id else None,
                role=user.role,
                saml_response=saml_response,
                redirect_url=relay_state
            )
            
        except Exception as e:
            return SSOResponse(success=False, error=f"SAML processing error: {str(e)}")
    
    async def initiate_oidc_auth(self, provider_id: str, state: str = None, nonce: str = None) -> str:
        """Initiate OIDC authentication flow"""
        provider = self.sso_providers.get(provider_id)
        if not provider or provider.type != "oidc":
            raise HTTPException(status_code=400, detail="Invalid OIDC provider")
        
        # Generate state and nonce for security
        state = state or secrets.token_urlsafe(32)
        nonce = nonce or secrets.token_urlsafe(32)
        
        # Store state/nonce for validation
        self.sessions.sessions[f"oidc_state_{provider_id}"] = {
            "state": state,
            "nonce": nonce,
            "created_at": datetime.utcnow()
        }
        
        # Build authorization URL
        auth_params = {
            "client_id": provider.metadata["client_id"],
            "redirect_uri": provider.metadata["redirect_uri"],
            "response_type": "code",
            "scope": " ".join(provider.scopes),
            "state": state,
            "nonce": nonce
        }
        
        if provider_id == "azure_ad":
            auth_params["response_mode"] = "query"
        
        auth_url = f"{provider.metadata['auth_url']}?{urlencode(auth_params)}"
        return auth_url
    
    async def process_oidc_callback(self, provider_id: str, code: str, state: str) -> SSOResponse:
        """Process OIDC authentication callback"""
        provider = self.sso_providers.get(provider_id)
        if not provider or provider.type != "oidc":
            return SSOResponse(success=False, error="Invalid OIDC provider")
        
        try:
            # Validate state
            stored_state = self.sessions.sessions.get(f"oidc_state_{provider_id}")
            if not stored_state or stored_state["state"] != state:
                return SSOResponse(success=False, error="Invalid state parameter")
            
            # Exchange code for tokens
            token_data = {
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": provider.metadata["redirect_uri"],
                "client_id": provider.metadata["client_id"],
                "client_secret": provider.metadata["client_secret"]
            }
            
            async with httpx.AsyncClient() as client:
                token_response = await client.post(
                    provider.metadata["token_url"],
                    data=token_data,
                    headers={"Content-Type": "application/x-www-form-urlencoded"}
                )
                
                if token_response.status_code != 200:
                    return SSOResponse(success=False, error="Token exchange failed")
                
                tokens = token_response.json()
                
                # Get userinfo
                userinfo_response = await client.get(
                    provider.metadata["userinfo_url"],
                    headers={"Authorization": f"Bearer {tokens['access_token']}"}
                )
                
                if userinfo_response.status_code != 200:
                    return SSOResponse(success=False, error="Userinfo retrieval failed")
                
                userinfo = userinfo_response.json()
                
                # Map attributes
                mapped_data = self._map_sso_attributes(userinfo, provider.attribute_mapping)
                
                # Create or update user
                user = await self._create_or_update_user(mapped_data)
                
                return SSOResponse(
                    success=True,
                    user_id=str(user.id),
                    email=user.email,
                    first_name=user.first_name,
                    last_name=user.last_name,
                    organization_id=str(user.organization_id) if user.organization_id else None,
                    role=user.role
                )
                
        except Exception as e:
            return SSOResponse(success=False, error=f"OIDC processing error: {str(e)}")
    
    def _map_sso_attributes(self, attributes: Dict[str, Any], mapping: Dict[str, str]) -> Dict[str, Any]:
        """Map SSO provider attributes to user fields"""
        mapped = {}
        for field, provider_attr in mapping.items():
            if provider_attr in attributes:
                mapped[field] = attributes[provider_attr]
        return mapped
    
    async def _create_or_update_user(self, user_data: Dict[str, Any]) -> User:
        """Create or update user from SSO data"""
        db = get_database()
        
        # Check if user exists
        existing_user = await db.fetchrow(
            "SELECT * FROM users WHERE email = $1",
            user_data["email"]
        )
        
        if existing_user:
            # Update existing user
            updated_user = await db.fetchrow("""
                UPDATE users 
                SET first_name = $1, last_name = $2, updated_at = NOW()
                WHERE email = $3
                RETURNING *
            """, user_data.get("first_name"), user_data.get("last_name"), user_data["email"])
            return User(**dict(updated_user))
        else:
            # Create new user
            new_user = await db.fetchrow("""
                INSERT INTO users (email, first_name, last_name, role, created_at)
                VALUES ($1, $2, $3, $4, NOW())
                RETURNING *
            """, user_data["email"], user_data.get("first_name"), user_data.get("last_name"), 
                user_data.get("role", "viewer"))
            return User(**dict(new_user))
    
    def create_jwt_token(self, user_data: Dict[str, Any]) -> str:
        """Create JWT access token"""
        now = datetime.utcnow()
        exp = now + timedelta(minutes=15)  # 15-minute access token
        
        payload = {
            "user_id": user_data["user_id"],
            "email": user_data["email"],
            "organization_id": user_data.get("organization_id"),
            "role": user_data["role"],
            "iat": int(now.timestamp()),
            "exp": int(exp.timestamp()),
            "type": "access"
        }
        
        return jwt.encode(payload, self.jwt_secret, algorithm="HS256")
    
    def create_refresh_token(self, user_data: Dict[str, Any]) -> str:
        """Create JWT refresh token"""
        now = datetime.utcnow()
        exp = now + timedelta(days=7)  # 7-day refresh token
        
        payload = {
            "user_id": user_data["user_id"],
            "type": "refresh",
            "iat": int(now.timestamp()),
            "exp": int(exp.timestamp())
        }
        
        return jwt.encode(payload, self.jwt_secret, algorithm="HS256")
    
    def verify_token(self, token: str) -> TokenData:
        """Verify and decode JWT token"""
        try:
            payload = jwt.decode(token, self.jwt_secret, algorithms=["HS256"])
            return TokenData(**payload)
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token has expired")
        except jwt.JWTError:
            raise HTTPException(status_code=401, detail="Invalid token")

# Global SSO service instance
sso_service = SSOService()
