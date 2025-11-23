"""
Enterprise Authentication Pages
Complete authentication pages for the Next.js application
"""

import React from 'react';
import { Metadata } from 'next';
import { AuthProvider } from '../components/auth/AuthContext';
import LoginForm from '../components/auth/LoginForm';
import RegistrationForm from '../components/auth/RegistrationForm';
import MFASetup from '../components/auth/MFASetup';
import OnboardingWizard from '../components/auth/OnboardingWizard';
import SecuritySettings from '../components/auth/SecuritySettings';
import UserInvitation from '../components/auth/UserInvitation';

export const metadata: Metadata = {
  title: 'Authentication | OptiBid Energy',
  description: 'Secure authentication for the OptiBid Energy Platform',
};

// Login Page
export default function LoginPage() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Logo and branding */}
          <div className="text-center mb-8">
            <div className="mx-auto h-16 w-16 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
              <svg
                className="h-10 w-10 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">OptiBid Energy</h1>
            <p className="text-gray-600 mt-1">Enterprise Energy Trading Platform</p>
          </div>

          <LoginForm />
        </div>
      </div>
    </AuthProvider>
  );
}

// Registration Page
export function RegisterPage({ searchParams }: { searchParams: { invite?: string } }) {
  const inviteToken = searchParams.invite;

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-2xl">
          {/* Logo and branding */}
          <div className="text-center mb-8">
            <div className="mx-auto h-16 w-16 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
              <svg
                className="h-10 w-10 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">OptiBid Energy</h1>
            <p className="text-gray-600 mt-1">Join thousands of energy professionals</p>
          </div>

          <RegistrationForm inviteToken={inviteToken} />
        </div>
      </div>
    </AuthProvider>
  );
}

// MFA Setup Page
export function MFASetupPage() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <MFASetup 
          onComplete={() => window.location.href = '/dashboard'}
          onSkip={() => window.location.href = '/dashboard'}
        />
      </div>
    </AuthProvider>
  );
}

// Onboarding Page
export function OnboardingPage() {
  return (
    <AuthProvider>
      <OnboardingWizard 
        onComplete={() => window.location.href = '/dashboard'}
        onSkip={() => window.location.href = '/dashboard'}
      />
    </AuthProvider>
  );
}

// Security Settings Page
export function SecuritySettingsPage() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50 py-8">
        <SecuritySettings 
          onBack={() => window.history.back()}
        />
      </div>
    </AuthProvider>
  );
}

// User Invitation Page
export function UserInvitationPage() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50 py-8">
        <UserInvitation 
          onBack={() => window.history.back()}
        />
      </div>
    </AuthProvider>
  );
}

// Email Verification Page
export function EmailVerificationPage({ searchParams }: { searchParams: { token?: string } }) {
  const { token } = searchParams;

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <CardTitle>Verify Your Email</CardTitle>
              <CardDescription>
                Click the verification link in your email to activate your account
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              {token ? (
                <Button className="w-full">
                  Verify Email Address
                </Button>
              ) : (
                <div className="space-y-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Please check your email for a verification link
                    </AlertDescription>
                  </Alert>
                  <Button variant="outline" className="w-full">
                    Resend Verification Email
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthProvider>
  );
}

// Password Reset Page
export function PasswordResetPage() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <CardTitle>Reset Password</CardTitle>
              <CardDescription>
                Enter your email address and we'll send you a reset link
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    required
                  />
                </div>
                <Button className="w-full">
                  Send Reset Link
                </Button>
              </form>
              <div className="mt-4 text-center">
                <Button variant="link" onClick={() => window.location.href = '/auth/login'}>
                  Back to Sign In
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthProvider>
  );
}

// SSO Callback Page
export function SSOCallbackPage({ searchParams }: { searchParams: { provider?: string; code?: string; state?: string } }) {
  const { provider, code, state } = searchParams;

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Completing Sign In...</h2>
          <p className="text-gray-600">Please wait while we sign you in with {provider}</p>
        </div>
      </div>
    </AuthProvider>
  );
}

// Logout Confirmation Page
export function LogoutPage() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <CardTitle>Sign Out</CardTitle>
              <CardDescription>
                Are you sure you want to sign out?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full">
                Sign Out
              </Button>
              <Button variant="outline" className="w-full" onClick={() => window.history.back()}>
                Cancel
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthProvider>
  );
}

// Unauthorized Page
export function UnauthorizedPage() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-8">
            You don't have permission to access this resource. Please contact your administrator if you believe this is an error.
          </p>
          
          <div className="space-y-4">
            <Button className="w-full" onClick={() => window.location.href = '/dashboard'}>
              Go to Dashboard
            </Button>
            <Button variant="outline" className="w-full" onClick={() => window.history.back()}>
              Go Back
            </Button>
          </div>
        </div>
      </div>
    </AuthProvider>
  );
}

// Export all page components
export {
  LoginPage as default,
  LoginPage,
  RegisterPage,
  MFASetupPage,
  OnboardingPage,
  SecuritySettingsPage,
  UserInvitationPage,
  EmailVerificationPage,
  PasswordResetPage,
  SSOCallbackPage,
  LogoutPage,
  UnauthorizedPage
};