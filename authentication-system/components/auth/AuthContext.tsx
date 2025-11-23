"""
Enterprise Authentication React Components
Complete frontend authentication system with SSO, MFA, and enterprise features
"""

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { 
  loginRequest, 
  registerRequest, 
  verifyEmailRequest, 
  setupMFASetup, 
  setupMFAVerify, 
  getProfile, 
  getSessions,
  revokeSession 
} from '../services/auth';

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  organization_id?: string;
  email_verified: boolean;
  mfa_enabled: boolean;
  last_login_at?: string;
  preferences?: Record<string, any>;
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

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string, totpToken?: string, rememberMe?: boolean) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  verifyEmail: (token: string) => Promise<void>;
  setupMFA: (method: string, phoneNumber?: string) => Promise<MFAData>;
  verifyMFA: (method: string, token: string, deviceName: string) => Promise<MFASetupResult>;
  inviteUser: (email: string, role: string, message?: string) => Promise<void>;
  updateConsent: (consentType: string, consentGiven: boolean, version: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  clearError: () => void;
}

export interface RegisterData {
  email: string;
  name: string;
  password: string;
  organization_name?: string;
  organization_type?: string;
  invite_token?: string;
}

export interface MFAData {
  method: string;
  secret?: string;
  qr_code?: string;
  manual_entry_key?: string;
  message?: string;
}

export interface MFASetupResult {
  message: string;
  backup_codes?: string[];
  warning?: string;
}

// Auth Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Token storage utilities
const TOKEN_KEY = 'optibid_access_token';
const REFRESH_TOKEN_KEY = 'optibid_refresh_token';
const SESSION_TOKEN_KEY = 'optibid_session_token';
const USER_KEY = 'optibid_user';

export class TokenManager {
  static setTokens(accessToken: string, refreshToken: string, sessionToken: string, expiresIn: number) {
    const expirationTime = new Date(Date.now() + expiresIn * 1000).toISOString();
    
    // Store tokens with expiration
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, JSON.stringify({
        token: accessToken,
        expires: expirationTime
      }));
      
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      localStorage.setItem(SESSION_TOKEN_KEY, sessionToken);
    }
  }

  static getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    const tokenData = localStorage.getItem(TOKEN_KEY);
    if (!tokenData) return null;
    
    try {
      const { token, expires } = JSON.parse(tokenData);
      if (new Date(expires) <= new Date()) {
        this.clearTokens();
        return null;
      }
      return token;
    } catch {
      this.clearTokens();
      return null;
    }
  }

  static getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  static getSessionToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(SESSION_TOKEN_KEY);
  }

  static clearTokens() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(SESSION_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  }
}

export class UserManager {
  static setUser(user: User) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  }

  static getUser(): User | null {
    if (typeof window === 'undefined') return null;
    
    const userData = localStorage.getItem(USER_KEY);
    if (!userData) return null;
    
    try {
      return JSON.parse(userData);
    } catch {
      return null;
    }
  }

  static clearUser() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(USER_KEY);
    }
  }
}

// Auth Provider Component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      const token = TokenManager.getAccessToken();
      const storedUser = UserManager.getUser();

      if (token && storedUser) {
        try {
          // Verify token is still valid by fetching profile
          const profile = await getProfile();
          setUser(profile);
        } catch (err) {
          // Token is invalid, clear everything
          TokenManager.clearTokens();
          UserManager.clearUser();
        }
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string, totpToken?: string, rememberMe: boolean = false) => {
    setLoading(true);
    setError(null);

    try {
      const response = await loginRequest({
        email,
        password,
        totp_token: totpToken,
        remember_me: rememberMe
      });

      if (response.requires_mfa) {
        // MFA required, return special response
        return { requiresMFA: true };
      }

      // Set tokens and user
      TokenManager.setTokens(
        response.access_token,
        response.refresh_token,
        response.session_token,
        response.expires_in
      );

      UserManager.setUser(response.user);
      setUser(response.user);

      return { requiresMFA: false };
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setLoading(true);
    setError(null);

    try {
      await registerRequest(data);
      // Registration successful, user needs to verify email
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyEmail = async (token: string) => {
    setLoading(true);
    setError(null);

    try {
      await verifyEmailRequest(token);
    } catch (err: any) {
      setError(err.message || 'Email verification failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const setupMFA = async (method: string, phoneNumber?: string): Promise<MFAData> => {
    setLoading(true);
    setError(null);

    try {
      return await setupMFASetup({ method, phone_number: phoneNumber });
    } catch (err: any) {
      setError(err.message || 'MFA setup failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyMFA = async (method: string, token: string, deviceName: string): Promise<MFASetupResult> => {
    setLoading(true);
    setError(null);

    try {
      return await setupMFAVerify({ method, token, device_name: deviceName });
    } catch (err: any) {
      setError(err.message || 'MFA verification failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const inviteUser = async (email: string, role: string, message?: string) => {
    setLoading(true);
    setError(null);

    try {
      // This would call the invite endpoint
      // await inviteUserRequest({ email, role, message });
    } catch (err: any) {
      setError(err.message || 'Invitation failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateConsent = async (consentType: string, consentGiven: boolean, version: string) => {
    setLoading(true);
    setError(null);

    try {
      // await updateConsentRequest({ consent_type: consentType, consent_given: consentGiven, version });
    } catch (err: any) {
      setError(err.message || 'Consent update failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    try {
      const profile = await getProfile();
      setUser(profile);
      UserManager.setUser(profile);
    } catch (err: any) {
      console.error('Failed to refresh profile:', err);
    }
  };

  const logout = () => {
    TokenManager.clearTokens();
    UserManager.clearUser();
    setUser(null);
    router.push('/auth/login');
  };

  const clearError = () => {
    setError(null);
  };

  const contextValue: AuthContextType = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    verifyEmail,
    setupMFA,
    verifyMFA,
    inviteUser,
    updateConsent,
    refreshProfile,
    clearError
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Higher-order component for protected routes
interface ProtectedRouteProps {
  children: ReactNode;
  roles?: string[];
  requireMFA?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  roles = [], 
  requireMFA = false 
}) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
      return;
    }

    if (!loading && user) {
      // Check role requirements
      if (roles.length > 0 && !roles.includes(user.role)) {
        router.push('/unauthorized');
        return;
      }

      // Check MFA requirement
      if (requireMFA && !user.mfa_enabled) {
        router.push('/auth/setup-mfa');
        return;
      }
    }
  }, [user, loading, router, roles, requireMFA]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Unauthorized</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  if (requireMFA && !user.mfa_enabled) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">MFA Required</h1>
          <p className="text-gray-600">Multi-factor authentication is required to access this page.</p>
          <button 
            onClick={() => router.push('/auth/setup-mfa')}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
          >
            Setup MFA
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthProvider;