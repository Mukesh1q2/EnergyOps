"""
Registration Component
Enterprise registration with organization setup and invitation support
"""

'use client';

import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Eye, EyeOff, UserPlus, Building, AlertCircle, CheckCircle2, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { OrganizationType } from '../../types/auth';

interface RegistrationFormProps {
  inviteToken?: string;
  onSuccess?: () => void;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({ 
  inviteToken, 
  onSuccess 
}) => {
  const { register, loading, error, clearError } = useAuth();
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState<'details' | 'organization' | 'verification' | 'success'>('details');
  const [formData, setFormData] = useState({
    // Personal details
    email: '',
    name: '',
    password: '',
    confirmPassword: '',
    
    // Organization details
    organizationName: '',
    organizationType: '' as OrganizationType,
    
    // Invitation details
    invitedEmail: inviteToken ? 'invited@example.com' : '',
    
    // Agreement
    agreedToTerms: false,
    agreedToPrivacy: false,
    agreedToMarketing: false,
  });
  
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: [],
    isValid: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Validate password in real-time
    if (name === 'password') {
      validatePassword(value);
    }
    
    // Clear error when user starts typing
    if (error) clearError();
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (error) clearError();
  };

  const validatePassword = (password: string) => {
    const feedback = [];
    let score = 0;

    // Length check
    if (password.length >= 12) {
      score += 25;
    } else {
      feedback.push('At least 12 characters');
    }

    // Character variety checks
    if (/[a-z]/.test(password)) score += 15;
    else feedback.push('One lowercase letter');

    if (/[A-Z]/.test(password)) score += 15;
    else feedback.push('One uppercase letter');

    if (/[0-9]/.test(password)) score += 15;
    else feedback.push('One number');

    if (/[^a-zA-Z0-9]/.test(password)) score += 15;
    else feedback.push('One symbol');

    // Bonus for very strong passwords
    if (password.length >= 16 && score >= 85) score = 100;

    setPasswordStrength({
      score,
      feedback,
      isValid: feedback.length === 0 && score >= 75
    });
  };

  const validateStep = (step: string): boolean => {
    switch (step) {
      case 'details':
        return !!(formData.email && formData.name && formData.password && formData.confirmPassword &&
                 formData.password === formData.confirmPassword && passwordStrength.isValid);
      
      case 'organization':
        return !!(formData.organizationName && formData.organizationType);
      
      case 'verification':
        return formData.agreedToTerms && formData.agreedToPrivacy;
      
      default:
        return true;
    }
  };

  const handleNextStep = () => {
    switch (currentStep) {
      case 'details':
        if (validateStep('details')) {
          setCurrentStep('organization');
        }
        break;
      
      case 'organization':
        if (validateStep('organization')) {
          setCurrentStep('verification');
        }
        break;
      
      case 'verification':
        if (validateStep('verification')) {
          handleSubmit();
        }
        break;
    }
  };

  const handlePrevStep = () => {
    switch (currentStep) {
      case 'organization':
        setCurrentStep('details');
        break;
      case 'verification':
        setCurrentStep('organization');
        break;
    }
  };

  const handleSubmit = async () => {
    try {
      await register({
        email: formData.email,
        name: formData.name,
        password: formData.password,
        organization_name: formData.organizationName,
        organization_type: formData.organizationType,
        invite_token: inviteToken,
      });

      setCurrentStep('success');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      // Error is handled by AuthContext
      console.error('Registration failed:', err);
    }
  };

  const getStepIndicator = () => {
    const steps = [
      { key: 'details', label: 'Your Details', icon: UserPlus },
      { key: 'organization', label: 'Organization', icon: Building },
      { key: 'verification', label: 'Verify & Agree', icon: Shield },
    ];

    return (
      <div className="flex justify-between items-center mb-8">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === step.key;
          const isCompleted = ['details', 'organization', 'verification'].indexOf(currentStep) > index;
          
          return (
            <div key={step.key} className="flex flex-col items-center flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                isCompleted ? 'bg-green-500 text-white' :
                isActive ? 'bg-blue-500 text-white' :
                'bg-gray-200 text-gray-400'
              }`}>
                {isCompleted ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
              </div>
              <span className={`text-xs font-medium ${
                isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
              }`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  const renderDetailsStep = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@company.com"
          value={formData.email}
          onChange={handleInputChange}
          required
        />
        <p className="text-xs text-gray-500">
          Use your work email for organization access
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="Enter your full name"
          value={formData.name}
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
            placeholder="Create a strong password"
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
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
        
        {/* Password strength indicator */}
        {formData.password && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>Password strength:</span>
              <span className={
                passwordStrength.score >= 75 ? 'text-green-600' :
                passwordStrength.score >= 50 ? 'text-yellow-600' : 'text-red-600'
              }>
                {passwordStrength.score >= 75 ? 'Strong' :
                 passwordStrength.score >= 50 ? 'Medium' : 'Weak'}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  passwordStrength.score >= 75 ? 'bg-green-500' :
                  passwordStrength.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${passwordStrength.score}%` }}
              ></div>
            </div>
            {passwordStrength.feedback.length > 0 && (
              <ul className="text-xs text-red-600 space-y-1">
                {passwordStrength.feedback.map((feedback, index) => (
                  <li key={index}>• {feedback}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
        {formData.confirmPassword && formData.password !== formData.confirmPassword && (
          <p className="text-xs text-red-600">Passwords do not match</p>
        )}
      </div>
    </div>
  );

  const renderOrganizationStep = () => (
    <div className="space-y-4">
      {inviteToken && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            You've been invited to join an organization. Organization details will be provided by your admin.
          </AlertDescription>
        </Alert>
      )}

      {!inviteToken && (
        <>
          <div className="space-y-2">
            <Label htmlFor="organizationName">Organization Name</Label>
            <Input
              id="organizationName"
              name="organizationName"
              type="text"
              placeholder="Enter your organization name"
              value={formData.organizationName}
              onChange={handleInputChange}
              required={!inviteToken}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="organizationType">Organization Type</Label>
            <Select value={formData.organizationType} onValueChange={(value) => handleSelectChange('organizationType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select organization type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="energy_company">Energy Company</SelectItem>
                <SelectItem value="utility">Utility Company</SelectItem>
                <SelectItem value="trading_firm">Trading Firm</SelectItem>
                <SelectItem value="regulatory">Regulatory Body</SelectItem>
                <SelectItem value="consulting">Consulting Firm</SelectItem>
                <SelectItem value="academic">Academic Institution</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )}

      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• You'll receive a verification email</li>
          <li>• Your account will be reviewed by our team</li>
          <li>• Once approved, you'll have full access to the platform</li>
          <li>• You can invite team members after account activation</li>
        </ul>
      </div>
    </div>
  );

  const renderVerificationStep = () => (
    <div className="space-y-4">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Terms and Privacy</h3>
        
        <div className="space-y-4">
          <div className="flex items-start space-x-2">
            <Checkbox
              id="terms"
              checked={formData.agreedToTerms}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, agreedToTerms: checked as boolean }))
              }
            />
            <Label htmlFor="terms" className="text-sm leading-relaxed">
              I agree to the{' '}
              <a href="/terms" className="text-blue-600 hover:text-blue-800 underline" target="_blank">
                Terms of Service
              </a>
              {' '}and understand that this is a legally binding agreement.
            </Label>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="privacy"
              checked={formData.agreedToPrivacy}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, agreedToPrivacy: checked as boolean }))
              }
            />
            <Label htmlFor="privacy" className="text-sm leading-relaxed">
              I agree to the{' '}
              <a href="/privacy" className="text-blue-600 hover:text-blue-800 underline" target="_blank">
                Privacy Policy
              </a>
              {' '}and consent to the processing of my personal data as described.
            </Label>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="marketing"
              checked={formData.agreedToMarketing}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, agreedToMarketing: checked as boolean }))
              }
            />
            <Label htmlFor="marketing" className="text-sm leading-relaxed">
              I would like to receive marketing communications about product updates, 
              industry insights, and promotional offers. You can unsubscribe at any time.
            </Label>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Security Features</h4>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• Multi-factor authentication (MFA) required for account security</li>
          <li>• All data is encrypted in transit and at rest</li>
          <li>• SOC 2 Type II compliant infrastructure</li>
          <li>• Regular security audits and monitoring</li>
        </ul>
      </div>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="text-center space-y-4">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle2 className="h-8 w-8 text-green-600" />
      </div>
      
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Registration Successful!</h3>
        <p className="text-gray-600">
          Please check your email ({formData.email}) for a verification link to activate your account.
        </p>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg text-left">
        <h4 className="font-medium text-blue-900 mb-2">Next Steps:</h4>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>Click the verification link in your email</li>
          <li>Set up multi-factor authentication for security</li>
          <li>Complete your organization profile</li>
          <li>Start exploring the platform features</li>
        </ol>
      </div>

      <Button 
        onClick={() => router.push('/auth/login')}
        className="w-full"
      >
        Continue to Sign In
      </Button>
    </div>
  );

  if (currentStep === 'success') {
    return (
      <Card className="w-full max-w-lg">
        <CardContent className="pt-6">
          {renderSuccessStep()}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
        <CardDescription>
          Join thousands of energy professionals on OptiBid
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {getStepIndicator()}

        {currentStep === 'details' && renderDetailsStep()}
        {currentStep === 'organization' && renderOrganizationStep()}
        {currentStep === 'verification' && renderVerificationStep()}

        <div className="flex gap-2 mt-6">
          {currentStep !== 'details' && currentStep !== 'success' && (
            <Button variant="outline" onClick={handlePrevStep} className="flex-1">
              Back
            </Button>
          )}
          
          <Button 
            onClick={handleNextStep} 
            className="flex-1"
            disabled={
              loading || 
              !validateStep(currentStep) ||
              (currentStep === 'details' && !passwordStrength.isValid)
            }
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {currentStep === 'verification' ? 'Creating Account...' : 'Next'}
              </div>
            ) : (
              currentStep === 'verification' ? 'Create Account' : 'Next'
            )}
          </Button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <button 
              className="text-blue-600 hover:text-blue-800 font-medium underline"
              onClick={() => router.push('/auth/login')}
            >
              Sign in
            </button>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default RegistrationForm;