"""
Authentication Service Layer
API client for authentication endpoints
"""

import { TokenManager } from '../components/auth/AuthContext';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// API client class
class AuthAPI {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request(
    endpoint: string, 
    options: RequestInit = {}, 
    requireAuth: boolean = false
  ): Promise<any> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add authentication token if required
    if (requireAuth) {
      const token = TokenManager.getAccessToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        throw new Error('No authentication token available');
      }
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (error: any) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication endpoints
  async loginRequest(data: {
    email: string;
    password: string;
    totp_token?: string;
    remember_me?: boolean;
    device_info?: Record<string, string>;
  }) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async registerRequest(data: {
    email: string;
    name: string;
    password: string;
    organization_name?: string;
    organization_type?: string;
    invite_token?: string;
  }) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async verifyEmailRequest(data: { token: string }) {
    return this.request('/api/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async resetPasswordRequest(data: { token: string; new_password: string }) {
    return this.request('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async changePasswordRequest(data: { current_password: string; new_password: string }) {
    return this.request('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true);
  }

  async logoutRequest() {
    return this.request('/api/auth/logout', {
      method: 'POST',
    }, true);
  }

  // MFA endpoints
  async setupMFASetup(data: { method: string; phone_number?: string }) {
    return this.request('/api/auth/mfa/setup', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true);
  }

  async setupMFAVerify(data: { method: string; token: string; device_name: string }) {
    return this.request('/api/auth/mfa/verify-setup', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true);
  }

  async disableMFA(data: { password: string }) {
    return this.request('/api/auth/mfa/disable', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true);
  }

  // User management endpoints
  async getProfile() {
    return this.request('/api/auth/profile', {}, true);
  }

  async updateProfile(data: {
    name?: string;
    preferences?: Record<string, any>;
    theme_preference?: string;
    language_preference?: string;
  }) {
    return this.request('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }, true);
  }

  async getSessions() {
    return this.request('/api/auth/sessions', {}, true);
  }

  async revokeSession(sessionId: string) {
    return this.request(`/api/auth/sessions/${sessionId}`, {
      method: 'DELETE',
    }, true);
  }

  async revokeAllSessions() {
    return this.request('/api/auth/sessions', {
      method: 'DELETE',
    }, true);
  }

  // User invitation endpoints
  async inviteUser(data: {
    email: string;
    role: string;
    message?: string;
  }) {
    return this.request('/api/auth/invite', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true);
  }

  async getInvitations() {
    return this.request('/api/auth/invitations', {}, true);
  }

  async acceptInvitation(token: string) {
    return this.request('/api/auth/invitations/accept', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  // Organization management endpoints
  async getOrganization() {
    return this.request('/api/auth/organization', {}, true);
  }

  async updateOrganization(data: {
    name?: string;
    contact_email?: string;
    contact_phone?: string;
    address?: string;
    settings?: Record<string, any>;
  }) {
    return this.request('/api/auth/organization', {
      method: 'PUT',
      body: JSON.stringify(data),
    }, true);
  }

  // Consent management endpoints
  async updateConsent(data: {
    consent_type: string;
    consent_given: boolean;
    version: string;
  }) {
    return this.request('/api/auth/consent', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true);
  }

  async getConsentStatus() {
    return this.request('/api/auth/consent/status', {}, true);
  }

  // SSO endpoints
  async getSSOProviders() {
    return this.request('/api/auth/sso/providers', {}, true);
  }

  async initiateSSO(provider: string) {
    return this.request(`/api/auth/sso/${provider}/authorize`, {}, true);
  }

  async handleSSOCallback(provider: string, code: string, state: string) {
    return this.request(`/api/auth/sso/${provider}/callback`, {
      method: 'GET',
      body: JSON.stringify({ code, state }),
    });
  }

  // Password endpoints
  async requestPasswordReset(email: string) {
    return this.request('/api/auth/password/reset-request', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(data: { token: string; new_password: string }) {
    return this.request('/api/auth/password/reset', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Audit log endpoints
  async getAuditLogs(filters?: {
    action?: string;
    status?: string;
    start_date?: string;
    end_date?: string;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/api/auth/audit?${queryString}` : '/api/auth/audit';
    
    return this.request(endpoint, {}, true);
  }

  // Security endpoints
  async getSecuritySettings() {
    return this.request('/api/auth/security/settings', {}, true);
  }

  async updateSecuritySettings(data: {
    mfa_enabled?: boolean;
    session_timeout?: number;
    password_policy?: Record<string, any>;
  }) {
    return this.request('/api/auth/security/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    }, true);
  }

  // Token refresh
  async refreshToken() {
    const refreshToken = TokenManager.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    return this.request('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  }

  // Health check
  async healthCheck() {
    return this.request('/api/auth/health');
  }
}

// Export singleton instance
export const authAPI = new AuthAPI();

// Export individual functions for convenience
export const {
  loginRequest,
  registerRequest,
  verifyEmailRequest,
  resetPasswordRequest,
  changePasswordRequest,
  logoutRequest,
  setupMFASetup,
  setupMFAVerify,
  disableMFA,
  getProfile,
  updateProfile,
  getSessions,
  revokeSession,
  revokeAllSessions,
  inviteUser,
  getInvitations,
  acceptInvitation,
  getOrganization,
  updateOrganization,
  updateConsent,
  getConsentStatus,
  getSSOProviders,
  initiateSSO,
  handleSSOCallback,
  requestPasswordReset,
  resetPassword,
  getAuditLogs,
  getSecuritySettings,
  updateSecuritySettings,
  refreshToken,
  healthCheck
} = authAPI;

// Utility functions
export class AuthUtils {
  static isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiration = payload.exp * 1000; // Convert to milliseconds
      return Date.now() >= expiration;
    } catch {
      return true;
    }
  }

  static async refreshTokenIfNeeded(): Promise<string | null> {
    const currentToken = TokenManager.getAccessToken();
    
    if (!currentToken) {
      return null;
    }

    // Check if token is expired or will expire in the next 5 minutes
    try {
      const payload = JSON.parse(atob(currentToken.split('.')[1]));
      const expiration = payload.exp * 1000;
      const fiveMinutesFromNow = Date.now() + 5 * 60 * 1000;

      if (expiration <= fiveMinutesFromNow) {
        const refreshed = await authAPI.refreshToken();
        TokenManager.setTokens(
          refreshed.access_token,
          refreshed.refresh_token,
          refreshed.session_token,
          refreshed.expires_in
        );
        return refreshed.access_token;
      }

      return currentToken;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      // Clear invalid tokens
      TokenManager.clearTokens();
      return null;
    }
  }

  static async authenticatedRequest(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<any> {
    // Ensure we have a valid token
    const token = await AuthUtils.refreshTokenIfNeeded();
    
    if (!token) {
      throw new Error('Authentication required');
    }

    return authAPI.request(endpoint, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
      },
    });
  }
}

export default authAPI;