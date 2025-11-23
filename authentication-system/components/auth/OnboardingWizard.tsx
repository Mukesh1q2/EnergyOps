"""
Enterprise Onboarding Wizard
Complete onboarding flow for enterprise customers
"""

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Checkbox } from '../ui/checkbox';
import { 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Upload, 
  BarChart3, 
  Users, 
  Settings,
  Globe,
  Zap,
  Building,
  Mail,
  Phone,
  MapPin,
  Upload as UploadIcon
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  completed: boolean;
}

interface OnboardingData {
  // Organization info
  organizationInfo: {
    name: string;
    type: string;
    size: string;
    region: string;
    industry: string;
  };
  
  // Contact details
  contactInfo: {
    email: string;
    phone: string;
    address: string;
    timezone: string;
  };
  
  // Preferences
  preferences: {
    currency: string;
    dateFormat: string;
    language: string;
    theme: string;
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
  };
  
  // Sample data
  sampleData: {
    uploadCompleted: boolean;
    dataType: string;
    recordCount: number;
  };
  
  // Quick actions
  quickActions: {
    createDashboard: boolean;
    inviteTeam: boolean;
    setupAlerts: boolean;
    connectAPI: boolean;
  };
}

interface OnboardingWizardProps {
  onComplete: () => void;
  onSkip?: () => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ 
  onComplete, 
  onSkip 
}) => {
  const { user, refreshProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    organizationInfo: {
      name: '',
      type: '',
      size: '',
      region: 'India',
      industry: 'Energy'
    },
    contactInfo: {
      email: user?.email || '',
      phone: '',
      address: '',
      timezone: 'Asia/Kolkata'
    },
    preferences: {
      currency: 'INR',
      dateFormat: 'DD/MM/YYYY',
      language: 'en',
      theme: 'auto',
      notifications: {
        email: true,
        sms: false,
        push: true
      }
    },
    sampleData: {
      uploadCompleted: false,
      dataType: '',
      recordCount: 0
    },
    quickActions: {
      createDashboard: true,
      inviteTeam: false,
      setupAlerts: false,
      connectAPI: false
    }
  });

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome',
      description: 'Get started with OptiBid',
      icon: Check,
      completed: currentStep > 0
    },
    {
      id: 'organization',
      title: 'Organization',
      description: 'Tell us about your organization',
      icon: Building,
      completed: currentStep > 1
    },
    {
      id: 'contact',
      title: 'Contact Details',
      description: 'Update your contact information',
      icon: Mail,
      completed: currentStep > 2
    },
    {
      id: 'preferences',
      title: 'Preferences',
      description: 'Customize your experience',
      icon: Settings,
      completed: currentStep > 3
    },
    {
      id: 'data',
      title: 'Sample Data',
      description: 'Upload sample data or use demo data',
      icon: Upload,
      completed: currentStep > 4
    },
    {
      id: 'quick-start',
      title: 'Quick Start',
      description: 'Set up your first features',
      icon: Zap,
      completed: currentStep > 5
    },
    {
      id: 'complete',
      title: 'Complete',
      description: 'You\'re all set!',
      icon: Check,
      completed: currentStep >= 6
    }
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

  const updateOnboardingData = (section: keyof OnboardingData, data: any) => {
    setOnboardingData(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    try {
      // Save onboarding data
      await refreshProfile();
      onComplete();
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
    }
  };

  const renderWelcomeStep = () => (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
        <Check className="h-10 w-10 text-blue-600" />
      </div>
      
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome to OptiBid Energy Platform!
        </h2>
        <p className="text-gray-600">
          Let's get you set up in just a few minutes. We'll guide you through 
          configuring your organization and preferences.
        </p>
      </div>

      <div className="bg-blue-50 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">What you'll accomplish:</h3>
        <ul className="text-sm text-blue-800 space-y-2">
          <li className="flex items-center">
            <Check className="h-4 w-4 mr-2 text-blue-600" />
            Set up your organization profile
          </li>
          <li className="flex items-center">
            <Check className="h-4 w-4 mr-2 text-blue-600" />
            Configure your preferences and settings
          </li>
          <li className="flex items-center">
            <Check className="h-4 w-4 mr-2 text-blue-600" />
            Upload sample data or use demo data
          </li>
          <li className="flex items-center">
            <Check className="h-4 w-4 mr-2 text-blue-600" />
            Set up your first dashboard and alerts
          </li>
        </ul>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onSkip} className="flex-1">
          Skip for now
        </Button>
        <Button onClick={nextStep} className="flex-1">
          Get Started
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  const renderOrganizationStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Building className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Organization Details</h2>
        <p className="text-gray-600">
          Help us understand your organization better
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="orgName">Organization Name</Label>
            <Input
              id="orgName"
              value={onboardingData.organizationInfo.name}
              onChange={(e) => updateOnboardingData('organizationInfo', { name: e.target.value })}
              placeholder="Your company name"
            />
          </div>

          <div>
            <Label htmlFor="orgType">Organization Type</Label>
            <select
              id="orgType"
              value={onboardingData.organizationInfo.type}
              onChange={(e) => updateOnboardingData('organizationInfo', { type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Select type</option>
              <option value="energy_company">Energy Company</option>
              <option value="utility">Utility Company</option>
              <option value="trading_firm">Trading Firm</option>
              <option value="consulting">Consulting Firm</option>
              <option value="regulatory">Regulatory Body</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="orgSize">Organization Size</Label>
            <select
              id="orgSize"
              value={onboardingData.organizationInfo.size}
              onChange={(e) => updateOnboardingData('organizationInfo', { size: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Select size</option>
              <option value="1-10">1-10 employees</option>
              <option value="11-50">11-50 employees</option>
              <option value="51-200">51-200 employees</option>
              <option value="201-1000">201-1000 employees</option>
              <option value="1000+">1000+ employees</option>
            </select>
          </div>

          <div>
            <Label htmlFor="region">Region</Label>
            <select
              id="region"
              value={onboardingData.organizationInfo.region}
              onChange={(e) => updateOnboardingData('organizationInfo', { region: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="India">India</option>
              <option value="USA">United States</option>
              <option value="Europe">Europe</option>
              <option value="Asia">Asia Pacific</option>
            </select>
          </div>
        </div>

        <div>
          <Label htmlFor="industry">Industry Focus</Label>
          <Input
            id="industry"
            value={onboardingData.organizationInfo.industry}
            onChange={(e) => updateOnboardingData('organizationInfo', { industry: e.target.value })}
            placeholder="e.g., Renewable Energy, Power Trading"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={prevStep} className="flex-1">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button 
          onClick={nextStep} 
          className="flex-1"
          disabled={!onboardingData.organizationInfo.name || !onboardingData.organizationInfo.type}
        >
          Next
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  const renderContactStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Mail className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Contact Information</h2>
        <p className="text-gray-600">
          Update your contact details for notifications and support
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={onboardingData.contactInfo.email}
              onChange={(e) => updateOnboardingData('contactInfo', { email: e.target.value })}
              placeholder="your@email.com"
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={onboardingData.contactInfo.phone}
              onChange={(e) => updateOnboardingData('contactInfo', { phone: e.target.value })}
              placeholder="+91 98765 43210"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            value={onboardingData.contactInfo.address}
            onChange={(e) => updateOnboardingData('contactInfo', { address: e.target.value })}
            placeholder="Company address"
          />
        </div>

        <div>
          <Label htmlFor="timezone">Timezone</Label>
          <select
            id="timezone"
            value={onboardingData.contactInfo.timezone}
            onChange={(e) => updateOnboardingData('contactInfo', { timezone: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="Asia/Kolkata">India Standard Time (IST)</option>
            <option value="America/New_York">Eastern Time (ET)</option>
            <option value="Europe/London">Greenwich Mean Time (GMT)</option>
            <option value="Asia/Tokyo">Japan Standard Time (JST)</option>
          </select>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={prevStep} className="flex-1">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={nextStep} className="flex-1">
          Next
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  const renderPreferencesStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Settings className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Platform Preferences</h2>
        <p className="text-gray-600">
          Customize your OptiBid experience
        </p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="currency">Default Currency</Label>
            <select
              id="currency"
              value={onboardingData.preferences.currency}
              onChange={(e) => updateOnboardingData('preferences', { currency: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="INR">Indian Rupee (₹)</option>
              <option value="USD">US Dollar ($)</option>
              <option value="EUR">Euro (€)</option>
              <option value="GBP">British Pound (£)</option>
            </select>
          </div>

          <div>
            <Label htmlFor="dateFormat">Date Format</Label>
            <select
              id="dateFormat"
              value={onboardingData.preferences.dateFormat}
              onChange={(e) => updateOnboardingData('preferences', { dateFormat: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="language">Language</Label>
            <select
              id="language"
              value={onboardingData.preferences.language}
              onChange={(e) => updateOnboardingData('preferences', { language: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी (Hindi)</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
            </select>
          </div>

          <div>
            <Label htmlFor="theme">Theme</Label>
            <select
              id="theme"
              value={onboardingData.preferences.theme}
              onChange={(e) => updateOnboardingData('preferences', { theme: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="auto">Auto (System)</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="blue">Blue Theme</option>
            </select>
          </div>
        </div>

        <div>
          <Label>Notification Preferences</Label>
          <div className="space-y-3 mt-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="emailNotifications"
                checked={onboardingData.preferences.notifications.email}
                onCheckedChange={(checked) => 
                  updateOnboardingData('preferences', {
                    notifications: { ...onboardingData.preferences.notifications, email: checked as boolean }
                  })
                }
              />
              <Label htmlFor="emailNotifications" className="text-sm">
                Email notifications for important updates
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="smsNotifications"
                checked={onboardingData.preferences.notifications.sms}
                onCheckedChange={(checked) => 
                  updateOnboardingData('preferences', {
                    notifications: { ...onboardingData.preferences.notifications, sms: checked as boolean }
                  })
                }
              />
              <Label htmlFor="smsNotifications" className="text-sm">
                SMS notifications for critical alerts
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="pushNotifications"
                checked={onboardingData.preferences.notifications.push}
                onCheckedChange={(checked) => 
                  updateOnboardingData('preferences', {
                    notifications: { ...onboardingData.preferences.notifications, push: checked as boolean }
                  })
                }
              />
              <Label htmlFor="pushNotifications" className="text-sm">
                Push notifications in the app
              </Label>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={prevStep} className="flex-1">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={nextStep} className="flex-1">
          Next
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  const renderDataStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Upload className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Sample Data</h2>
        <p className="text-gray-600">
          Get started with sample data or upload your own
        </p>
      </div>

      <div className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <UploadIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="font-medium text-gray-900 mb-2">Upload Your Data</h3>
          <p className="text-sm text-gray-600 mb-4">
            Upload CSV, Excel, or JSON files to get started
          </p>
          <Button variant="outline">
            Choose Files
          </Button>
          <p className="text-xs text-gray-500 mt-2">
            Supported formats: .csv, .xlsx, .json (max 10MB)
          </p>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">Or</span>
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Use Demo Data</h4>
              <p className="text-sm text-gray-600">
                Get started with realistic sample data from the Indian energy market
              </p>
            </div>
            <Button 
              variant="outline"
              onClick={() => updateOnboardingData('sampleData', { 
                uploadCompleted: true, 
                dataType: 'demo',
                recordCount: 1000
              })}
            >
              Load Demo Data
            </Button>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={prevStep} className="flex-1">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button 
          onClick={nextStep} 
          className="flex-1"
          disabled={!onboardingData.sampleData.uploadCompleted}
        >
          Next
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  const renderQuickStartStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Zap className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Quick Start</h2>
        <p className="text-gray-600">
          Set up essential features to get the most out of OptiBid
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center space-x-3">
            <BarChart3 className="h-6 w-6 text-blue-600" />
            <div>
              <h4 className="font-medium text-gray-900">Create Your First Dashboard</h4>
              <p className="text-sm text-gray-600">Set up a basic energy trading dashboard</p>
            </div>
          </div>
          <Checkbox
            checked={onboardingData.quickActions.createDashboard}
            onCheckedChange={(checked) => 
              updateOnboardingData('quickActions', { createDashboard: checked as boolean })
            }
          />
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center space-x-3">
            <Users className="h-6 w-6 text-blue-600" />
            <div>
              <h4 className="font-medium text-gray-900">Invite Team Members</h4>
              <p className="text-sm text-gray-600">Add colleagues to collaborate</p>
            </div>
          </div>
          <Checkbox
            checked={onboardingData.quickActions.inviteTeam}
            onCheckedChange={(checked) => 
              updateOnboardingData('quickActions', { inviteTeam: checked as boolean })
            }
          />
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center space-x-3">
            <Globe className="h-6 w-6 text-blue-600" />
            <div>
              <h4 className="font-medium text-gray-900">Connect APIs</h4>
              <p className="text-sm text-gray-600">Integrate with external data sources</p>
            </div>
          </div>
          <Checkbox
            checked={onboardingData.quickActions.connectAPI}
            onCheckedChange={(checked) => 
              updateOnboardingData('quickActions', { connectAPI: checked as boolean })
            }
          />
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">You can always set these up later</h4>
        <p className="text-sm text-blue-800">
          These are optional quick-start actions. You can configure them anytime from the settings menu.
        </p>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={prevStep} className="flex-1">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={nextStep} className="flex-1">
          Complete Setup
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  const renderCompleteStep = () => (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <Check className="h-10 w-10 text-green-600" />
      </div>
      
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          🎉 You're all set!
        </h2>
        <p className="text-gray-600">
          Welcome to OptiBid Energy Platform. Your account is ready to use.
        </p>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-left">
        <h3 className="font-medium text-green-900 mb-2">What's next?</h3>
        <ul className="text-sm text-green-800 space-y-1">
          <li>• Explore your dashboard and analytics</li>
          <li>• Upload your energy trading data</li>
          <li>• Set up alerts and notifications</li>
          <li>• Invite team members to collaborate</li>
        </ul>
      </div>

      <Button onClick={handleComplete} className="w-full">
        Go to Dashboard
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0: return renderWelcomeStep();
      case 1: return renderOrganizationStep();
      case 2: return renderContactStep();
      case 3: return renderPreferencesStep();
      case 4: return renderDataStep();
      case 5: return renderQuickStartStep();
      case 6: return renderCompleteStep();
      default: return renderWelcomeStep();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Setup Wizard</h1>
            <span className="text-sm text-gray-500">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          
          {/* Step indicators */}
          <div className="flex justify-between mt-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              
              return (
                <div key={step.id} className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isCompleted ? 'bg-green-500 text-white' :
                    isActive ? 'bg-blue-500 text-white' :
                    'bg-gray-200 text-gray-400'
                  }`}>
                    {isCompleted ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </div>
                  <span className={`text-xs mt-1 ${
                    isActive ? 'text-blue-600 font-medium' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step content */}
        <Card>
          <CardContent className="pt-6">
            {renderCurrentStep()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OnboardingWizard;