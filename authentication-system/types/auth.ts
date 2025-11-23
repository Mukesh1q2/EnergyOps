"""
Enterprise Authentication Types
TypeScript definitions for authentication system
"""

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ORG_ADMIN = 'org_admin',
  ANALYST = 'analyst',
  TRADER = 'trader',
  VIEWER = 'viewer',
  AUDITOR = 'auditor'
}

export enum OrganizationType {
  ENERGY_COMPANY = 'energy_company',
  UTILITY = 'utility',
  TRADING_FIRM = 'trading_firm',
  REGULATORY = 'regulatory',
  CONSULTING = 'consulting',
  ACADEMIC = 'academic'
}

export enum AuthProvider {
  EMAIL = 'email',
  GOOGLE = 'google',
  MICROSOFT = 'microsoft',
  SAML = 'saml',
  OIDC = 'oidc'
}

export enum MFAMethod {
  TOTP = 'totp',
  SMS = 'sms',
  EMAIL = 'email'
}

export enum SessionStatus {
  ACTIVE = 'active',
  REVOKED = 'revoked',
  EXPIRED = 'expired'
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organization_id?: string;
  email_verified: boolean;
  mfa_enabled: boolean;
  last_login_at?: string;
  preferences?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface Organization {
  id: string;
  name: string;
  domain?: string;
  organization_type: OrganizationType;
  contact_email: string;
  contact_phone?: string;
  address?: string;
  region: string;
  industry: string;
  settings?: Record<string, any>;
  feature_flags?: Record<string, boolean>;
  subscription_plan: string;
  subscription_status: string;
  billing_email?: string;
  sso_enabled: boolean;
  sso_provider?: string;
  sso_configuration?: Record<string, any>;
  max_users: number;
  max_dashboards: number;
  api_rate_limit: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserSession {
  id: string;
  user_id: string;
  organization_id?: string;
  session_token: string;
  refresh_token?: string;
  user_agent?: string;
  ip_address?: string;
  device_type?: string;
  browser?: string;
  country?: string;
  city?: string;
  timezone?: string;
  status: SessionStatus;
  created_at: string;
  expires_at: string;
  last_activity_at: string;
  revoked_at?: string;
  revoked_reason?: string;
}

export interface UserInvitation {
  id: string;
  email: string;
  organization_id: string;
  invited_by_id: string;
  role: UserRole;
  permissions?: Record<string, any>;
  message?: string;
  invitation_token: string;
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
  expires_at: string;
  accepted_at?: string;
  user_id?: string;
  accepted_ip?: string;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  organization_id?: string;
  action: string;
  resource?: string;
  resource_id?: string;
  ip_address?: string;
  user_agent?: string;
  session_id?: string;
  status: 'success' | 'failure' | 'blocked';
  error_message?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface MFADevice {
  id: string;
  user_id: string;
  device_name: string;
  device_type: string;
  method: MFAMethod;
  secret?: string;
  phone_number?: string;
  is_primary: boolean;
  is_verified: boolean;
  last_used_at?: string;
  usage_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PasswordPolicy {
  id: string;
  organization_id?: string;
  min_length: number;
  require_uppercase: boolean;
  require_lowercase: boolean;
  require_numbers: boolean;
  require_symbols: boolean;
  max_age_days?: number;
  prevent_reuse_last_n: number;
  lockout_threshold: number;
  lockout_duration_minutes: number;
  require_mfa: boolean;
  allow_weak_passwords: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ConsentRecord {
  id: string;
  user_id: string;
  consent_type: string;
  consent_given: boolean;
  version: string;
  scope?: string;
  ip_address?: string;
  user_agent?: string;
  consented_at: string;
  withdrawn_at?: string;
}

export interface SessionInfo {
  id: string;
  user_agent?: string;
  ip_address?: string;
  device_type?: string;
  browser?: string;
  created_at: string;
  last_activity_at: string;
  status: string;
}

// API Request/Response Types
export interface LoginRequest {
  email: string;
  password: string;
  totp_token?: string;
  remember_me?: boolean;
  device_info?: Record<string, string>;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  session_token: string;
  expires_in: number;
  user: User;
  requires_mfa?: boolean;
}

export interface RegisterRequest {
  email: string;
  name: string;
  password: string;
  organization_name?: string;
  organization_type?: OrganizationType;
  invite_token?: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface MFASetupRequest {
  method: string;
  phone_number?: string;
}

export interface MFASetupData {
  method: string;
  secret?: string;
  qr_code?: string;
  manual_entry_key?: string;
  message?: string;
}

export interface VerifyMFASetupRequest {
  method: string;
  token: string;
  device_name: string;
}

export interface MFASetupResult {
  message: string;
  backup_codes?: string[];
  warning?: string;
}

export interface InviteUserRequest {
  email: string;
  role: UserRole;
  message?: string;
}

export interface ConsentRequest {
  consent_type: string;
  consent_given: boolean;
  version: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

// Auth Context Types
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string, totpToken?: string, rememberMe?: boolean) => Promise<{ requiresMFA?: boolean }>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  verifyEmail: (token: string) => Promise<void>;
  setupMFA: (method: string, phoneNumber?: string) => Promise<MFASetupData>;
  verifyMFA: (method: string, token: string, deviceName: string) => Promise<MFASetupResult>;
  inviteUser: (email: string, role: string, message?: string) => Promise<void>;
  updateConsent: (consentType: string, consentGiven: boolean, version: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  clearError: () => void;
}

export interface AuthProviderProps {
  children: React.ReactNode;
}

export interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[];
  requireMFA?: boolean;
}

// Password Strength Types
export interface PasswordStrength {
  score: number;
  feedback: string[];
  isValid: boolean;
}

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

// SSO Types
export interface SSOProvider {
  id: string;
  name: string;
  type: 'oauth2' | 'saml';
  enabled: boolean;
  configuration?: Record<string, any>;
}

export interface SSOAuthRequest {
  provider: string;
  redirect_uri: string;
  state?: string;
}

export interface SSOCallbackRequest {
  provider: string;
  code: string;
  state: string;
}

export interface SSOUserInfo {
  id: string;
  email: string;
  name: string;
  provider: string;
  provider_data?: Record<string, any>;
}

// Organization Management Types
export interface OrganizationInviteRequest {
  organization_name: string;
  organization_type: OrganizationType;
  contact_email: string;
  contact_phone?: string;
  address?: string;
  region: string;
  industry: string;
}

export interface OrganizationUpdateRequest {
  name?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  settings?: Record<string, any>;
}

// Security Audit Types
export interface SecuritySettings {
  mfa_enabled: boolean;
  session_timeout: number;
  password_policy: PasswordPolicy;
  ip_whitelist?: string[];
  trusted_devices?: string[];
}

export interface SecurityUpdateRequest {
  mfa_enabled?: boolean;
  session_timeout?: number;
  password_policy?: Partial<PasswordPolicy>;
  ip_whitelist?: string[];
}

// Rate Limiting Types
export interface RateLimitInfo {
  action: string;
  identifier: string;
  attempts: number;
  window_start: string;
  window_end: string;
  limit: number;
  remaining: number;
  reset_time: string;
}

export interface RateLimitHeaders {
  'X-RateLimit-Limit': string;
  'X-RateLimit-Remaining': string;
  'X-RateLimit-Reset': string;
}

// Consent and Privacy Types
export interface PrivacySettings {
  analytics_consent: boolean;
  marketing_consent: boolean;
  cookie_consent: boolean;
  data_processing_consent: boolean;
  version: string;
}

export interface ConsentStatus {
  consent_type: string;
  consent_given: boolean;
  version: string;
  consented_at: string;
  withdrawn_at?: string;
}

// Utility Types
export type Theme = 'light' | 'dark' | 'auto' | 'blue';

export type Language = 'en' | 'hi' | 'es' | 'fr';

export interface UserPreferences {
  theme: Theme;
  language: Language;
  currency: string;
  date_format: string;
  timezone: string;
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}

// Error Types
export interface AuthError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export type AuthErrorCode = 
  | 'INVALID_CREDENTIALS'
  | 'ACCOUNT_LOCKED'
  | 'EMAIL_NOT_VERIFIED'
  | 'MFA_REQUIRED'
  | 'INVALID_MFA_TOKEN'
  | 'SESSION_EXPIRED'
  | 'INSUFFICIENT_PERMISSIONS'
  | 'RATE_LIMITED'
  | 'INVALID_TOKEN'
  | 'PASSWORD_TOO_WEAK'
  | 'INVITATION_EXPIRED'
  | 'SSO_ERROR';

// Component Props Types
export interface LoginFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
  inviteToken?: string;
}

export interface RegistrationFormProps {
  inviteToken?: string;
  onSuccess?: () => void;
}

export interface MFASetupProps {
  onComplete?: () => void;
  onSkip?: () => void;
}

export interface OnboardingWizardProps {
  onComplete: () => void;
  onSkip?: () => void;
}

export interface SecuritySettingsProps {
  onBack?: () => void;
}

export interface UserInvitationProps {
  onBack?: () => void;
}

export interface SessionManagementProps {
  sessions: SessionInfo[];
  onRevokeSession: (sessionId: string) => void;
  onRevokeAllSessions: () => void;
}

export interface AuditLogViewerProps {
  logs: AuditLog[];
  filters?: {
    action?: string;
    status?: string;
    start_date?: string;
    end_date?: string;
  };
  onExport?: () => void;
}

// Export all types
export * from './auth';