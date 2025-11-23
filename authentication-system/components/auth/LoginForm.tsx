"""
Login Component
Enterprise login with SSO, MFA, and security features
"""

'use client';

import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Eye, EyeOff, Shield, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface LoginFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({ 
  onSuccess, 
  redirectTo = '/dashboard' 
}) => {
  const { login, loading, error, clearError } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    totpToken: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [loginStep, setLoginStep] = useState<'credentials' | 'mfa'>('credentials');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (error) clearError();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const result = await login(
        formData.email,
        formData.password,
        formData.totpToken || undefined,
        formData.rememberMe
      );

      if (result.requiresMFA) {
        setMfaRequired(true);
        setLoginStep('mfa');
      } else {
        // Login successful
        if (onSuccess) onSuccess();
        router.push(redirectTo);
      }
    } catch (err) {
      // Error is handled by AuthContext
      console.error('Login failed:', err);
    }
  };

  const handleMFASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.totpToken) {
      return;
    }

    try {
      await login(
        formData.email,
        formData.password,
        formData.totpToken,
        formData.rememberMe
      );

      // MFA login successful
      if (onSuccess) onSuccess();
      router.push(redirectTo);
    } catch (err) {
      console.error('MFA login failed:', err);
    }
  };

  const handleSSOLogin = async (provider: string) => {
    try {
      // Initiate SSO flow
      window.location.href = `/api/auth/sso/${provider}/authorize`;
    } catch (err) {
      console.error('SSO login failed:', err);
    }
  };

  const resetToCredentials = () => {
    setLoginStep('credentials');
    setMfaRequired(false);
    setFormData(prev => ({ ...prev, totpToken: '' }));
  };

  if (mfaRequired && loginStep === 'mfa') {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Multi-Factor Authentication
          </CardTitle>
          <CardDescription className="text-center">
            Enter your authentication code to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleMFASubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="totpToken">Authentication Code</Label>
              <Input
                id="totpToken"
                name="totpToken"
                type="text"
                placeholder="Enter 6-digit code"
                value={formData.totpToken}
                onChange={handleInputChange}
                className="text-center text-lg tracking-widest"
                maxLength={6}
                pattern="[0-9]{6}"
                required
              />
              <p className="text-sm text-gray-500 text-center">
                Enter the 6-digit code from your authenticator app
              </p>
            </div>

            <div className="space-y-4">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || !formData.totpToken}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Verifying...
                  </div>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Verify & Continue
                  </>
                )}
              </Button>

              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                onClick={resetToCredentials}
              >
                Back to Login
              </Button>
            </div>

            <div className="text-center">
              <button
                type="button"
                className="text-sm text-blue-600 hover:text-blue-800 underline"
                onClick={() => {/* Show backup code input */}}
              >
                Use backup code
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Sign In</CardTitle>
        <CardDescription className="text-center">
          Welcome back to OptiBid Energy Platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="email" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="sso">SSO</TabsTrigger>
            <TabsTrigger value="demo">Demo</TabsTrigger>
          </TabsList>

          <TabsContent value="email" className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@company.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    id="rememberMe"
                    name="rememberMe"
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="rememberMe" className="text-sm">
                    Remember me
                  </Label>
                </div>
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                  onClick={() => {/* Navigate to forgot password */}}
                >
                  Forgot password?
                </button>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="sso" className="space-y-4">
            <div className="space-y-3">
              <p className="text-sm text-gray-600 text-center">
                Sign in with your organization's SSO provider
              </p>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => handleSSOLogin('google')}
              >
                <svg className="mr-3 h-4 w-4" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </Button>

              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => handleSSOLogin('microsoft')}
              >
                <svg className="mr-3 h-4 w-4" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z"/>
                </svg>
                Continue with Microsoft
              </Button>

              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => handleSSOLogin('saml')}
              >
                <Shield className="mr-3 h-4 w-4" />
                Continue with SAML SSO
              </Button>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                Don't see your organization?{' '}
                <button className="text-blue-600 hover:text-blue-800 underline">
                  Contact your admin
                </button>
              </p>
            </div>
          </TabsContent>

          <TabsContent value="demo" className="space-y-4">
            <div className="space-y-3">
              <p className="text-sm text-gray-600 text-center">
                Try the platform with sample data
              </p>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  // Set demo credentials and redirect
                  setFormData({
                    email: 'demo@optibid.com',
                    password: 'demo123456',
                    totpToken: '',
                    rememberMe: false
                  });
                  setTimeout(() => {
                    const form = document.querySelector('form') as HTMLFormElement;
                    form?.dispatchEvent(new Event('submit', { bubbles: true }));
                  }, 100);
                }}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Start Demo Session
              </Button>

              <div className="text-center">
                <p className="text-xs text-gray-500">
                  Demo includes sample energy trading data and full functionality for 24 hours
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <button 
              className="text-blue-600 hover:text-blue-800 font-medium underline"
              onClick={() => router.push('/auth/register')}
            >
              Sign up
            </button>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoginForm;