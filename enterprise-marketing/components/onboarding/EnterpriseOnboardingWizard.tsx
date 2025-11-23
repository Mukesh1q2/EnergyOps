'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CheckIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  EnvelopeIcon,
  RocketLaunchIcon,
  ChartBarIcon,
  DocumentTextIcon,
  CogIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'

interface OnboardingWizardProps {
  userId: string
  organizationId?: string
  onComplete: (data: any) => void
  onSkip?: () => void
}

interface OnboardingData {
  companyInfo: {
    name: string
    industry: string
    size: string
    website: string
  }
  teamInfo: {
    members: number
    roles: string[]
    requirements: string[]
  }
  integrations: {
    emailProvider: string
    calendarProvider: string
    notificationChannels: string[]
  }
  preferences: {
    timezone: string
    language: string
    currency: string
    dateFormat: string
  }
}

const industryOptions = [
  'Energy Trading',
  'Renewable Energy',
  'Oil & Gas',
  'Utilities',
  'Consulting',
  'Technology',
  'Finance',
  'Other'
]

const companySizeOptions = [
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-1000', label: '201-1000 employees' },
  { value: '1000+', label: '1000+ employees' }
]

const emailProviders = [
  'Microsoft 365',
  'Google Workspace',
  'Other'
]

const calendarProviders = [
  'Microsoft Outlook',
  'Google Calendar',
  'Other'
]

const notificationChannels = [
  'Email',
  'SMS',
  'Slack',
  'Microsoft Teams',
  'Mobile Push'
]

export function EnterpriseOnboardingWizard({ userId, organizationId, onComplete, onSkip }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<OnboardingData>({
    companyInfo: {
      name: '',
      industry: '',
      size: '',
      website: ''
    },
    teamInfo: {
      members: 1,
      roles: [],
      requirements: []
    },
    integrations: {
      emailProvider: '',
      calendarProvider: '',
      notificationChannels: ['Email']
    },
    preferences: {
      timezone: 'UTC',
      language: 'en',
      currency: 'USD',
      dateFormat: 'MM/dd/yyyy'
    }
  })

  const totalSteps = 6

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = async () => {
    setLoading(true)
    
    try {
      // Submit onboarding data
      const response = await fetch('/api/auth/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          organizationId,
          data
        })
      })

      const result = await response.json()
      
      if (result.success) {
        onComplete(result.data)
      } else {
        console.error('Onboarding completion failed:', result.error)
      }
    } catch (error) {
      console.error('Onboarding error:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateData = (section: keyof OnboardingData, field: string, value: any) => {
    setData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return data.companyInfo.name && data.companyInfo.industry && data.companyInfo.size
      case 2:
        return data.teamInfo.roles.length > 0 && data.teamInfo.members > 0
      case 3:
        return data.integrations.emailProvider && data.integrations.calendarProvider
      case 4:
        return true // Preferences are optional
      case 5:
        return true // Integration setup is optional
      case 6:
        return true // Final review
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-900">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round((currentStep / totalSteps) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-blue-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep === 1 && <CompanyInfoStep data={data.companyInfo} onUpdate={(field, value) => updateData('companyInfo', field, value)} />}
              {currentStep === 2 && <TeamInfoStep data={data.teamInfo} onUpdate={(field, value) => updateData('teamInfo', field, value)} />}
              {currentStep === 3 && <IntegrationStep data={data.integrations} onUpdate={(field, value) => updateData('integrations', field, value)} />}
              {currentStep === 4 && <PreferenceStep data={data.preferences} onUpdate={(field, value) => updateData('preferences', field, value)} />}
              {currentStep === 5 && <IntegrationSetupStep />}
              {currentStep === 6 && <ReviewStep data={data} />}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <div>
              {currentStep > 1 && (
                <button
                  onClick={handlePrevious}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Previous
                </button>
              )}
            </div>
            
            <div className="flex space-x-3">
              {onSkip && currentStep === 1 && (
                <button
                  onClick={onSkip}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Skip Setup
                </button>
              )}
              
              {currentStep < totalSteps ? (
                <button
                  onClick={handleNext}
                  disabled={!isStepValid(currentStep)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              ) : (
                <button
                  onClick={handleComplete}
                  disabled={loading || !isStepValid(currentStep)}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Setting up...
                    </>
                  ) : (
                    <>
                      <RocketLaunchIcon className="w-4 h-4 mr-2" />
                      Complete Setup
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Step Components
function CompanyInfoStep({ data, onUpdate }: { data: any, onUpdate: (field: string, value: any) => void }) {
  return (
    <div>
      <div className="text-center mb-8">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <BuildingOfficeIcon className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Tell us about your company</h2>
        <p className="text-gray-600">This helps us customize OptiBid Energy for your organization</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company Name *
          </label>
          <input
            type="text"
            value={data.name}
            onChange={(e) => onUpdate('name', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Acme Energy Corp"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Industry *
          </label>
          <select
            value={data.industry}
            onChange={(e) => onUpdate('industry', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select industry</option>
            {industryOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company Size *
          </label>
          <select
            value={data.size}
            onChange={(e) => onUpdate('size', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select size</option>
            {companySizeOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Website (Optional)
          </label>
          <input
            type="url"
            value={data.website}
            onChange={(e) => onUpdate('website', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="https://example.com"
          />
        </div>
      </div>
    </div>
  )
}

function TeamInfoStep({ data, onUpdate }: { data: any, onUpdate: (field: string, value: any) => void }) {
  const roleOptions = [
    'Energy Analyst',
    'Energy Trader',
    'Operations Manager',
    'Data Scientist',
    'Portfolio Manager',
    'Grid Operator',
    'Risk Manager',
    'Compliance Officer'
  ]

  const requirementOptions = [
    'Real-time market data',
    'Portfolio optimization',
    'Risk management',
    'Compliance reporting',
    'Custom analytics',
    'API integration'
  ]

  const handleRoleToggle = (role: string) => {
    const currentRoles = data.roles || []
    const newRoles = currentRoles.includes(role)
      ? currentRoles.filter((r: string) => r !== role)
      : [...currentRoles, role]
    onUpdate('roles', newRoles)
  }

  const handleRequirementToggle = (requirement: string) => {
    const currentRequirements = data.requirements || []
    const newRequirements = currentRequirements.includes(requirement)
      ? currentRequirements.filter((r: string) => r !== requirement)
      : [...currentRequirements, requirement]
    onUpdate('requirements', newRequirements)
  }

  return (
    <div>
      <div className="text-center mb-8">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <UserGroupIcon className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Team Information</h2>
        <p className="text-gray-600">Help us understand your team's structure and needs</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of Team Members *
          </label>
          <input
            type="number"
            min="1"
            max="1000"
            value={data.members}
            onChange={(e) => onUpdate('members', parseInt(e.target.value) || 1)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Team Roles *
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {roleOptions.map(role => (
              <button
                key={role}
                onClick={() => handleRoleToggle(role)}
                className={`p-3 border rounded-lg text-left transition-colors ${
                  data.roles?.includes(role)
                    ? 'border-green-500 bg-green-50 text-green-900'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Key Requirements
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {requirementOptions.map(requirement => (
              <button
                key={requirement}
                onClick={() => handleRequirementToggle(requirement)}
                className={`p-3 border rounded-lg text-left transition-colors ${
                  data.requirements?.includes(requirement)
                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {requirement}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function IntegrationStep({ data, onUpdate }: { data: any, onUpdate: (field: string, value: any) => void }) {
  const handleNotificationToggle = (channel: string) => {
    const currentChannels = data.notificationChannels || []
    const newChannels = currentChannels.includes(channel)
      ? currentChannels.filter((c: string) => c !== channel)
      : [...currentChannels, channel]
    onUpdate('notificationChannels', newChannels)
  }

  return (
    <div>
      <div className="text-center mb-8">
        <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
          <EnvelopeIcon className="w-8 h-8 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Integration Preferences</h2>
        <p className="text-gray-600">Connect OptiBid Energy with your existing tools</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Provider *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {emailProviders.map(provider => (
              <button
                key={provider}
                onClick={() => onUpdate('emailProvider', provider)}
                className={`p-4 border rounded-lg text-center transition-colors ${
                  data.emailProvider === provider
                    ? 'border-purple-500 bg-purple-50 text-purple-900'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {provider}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Calendar Provider *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {calendarProviders.map(provider => (
              <button
                key={provider}
                onClick={() => onUpdate('calendarProvider', provider)}
                className={`p-4 border rounded-lg text-center transition-colors ${
                  data.calendarProvider === provider
                    ? 'border-purple-500 bg-purple-50 text-purple-900'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {provider}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Notification Channels
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {notificationChannels.map(channel => (
              <button
                key={channel}
                onClick={() => handleNotificationToggle(channel)}
                className={`p-3 border rounded-lg text-center transition-colors ${
                  data.notificationChannels?.includes(channel)
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {channel}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function PreferenceStep({ data, onUpdate }: { data: any, onUpdate: (field: string, value: any) => void }) {
  return (
    <div>
      <div className="text-center mb-8">
        <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
          <CogIcon className="w-8 h-8 text-yellow-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Preferences</h2>
        <p className="text-gray-600">Customize your OptiBid Energy experience</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Timezone
          </label>
          <select
            value={data.timezone}
            onChange={(e) => onUpdate('timezone', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
          >
            <option value="UTC">UTC</option>
            <option value="America/New_York">Eastern Time</option>
            <option value="America/Chicago">Central Time</option>
            <option value="America/Denver">Mountain Time</option>
            <option value="America/Los_Angeles">Pacific Time</option>
            <option value="Europe/London">London</option>
            <option value="Europe/Paris">Paris</option>
            <option value="Asia/Tokyo">Tokyo</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Language
          </label>
          <select
            value={data.language}
            onChange={(e) => onUpdate('language', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
          >
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
            <option value="zh">中文</option>
            <option value="ja">日本語</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Currency
          </label>
          <select
            value={data.currency}
            onChange={(e) => onUpdate('currency', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="JPY">JPY (¥)</option>
            <option value="CAD">CAD (C$)</option>
            <option value="AUD">AUD (A$)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date Format
          </label>
          <select
            value={data.dateFormat}
            onChange={(e) => onUpdate('dateFormat', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
          >
            <option value="MM/dd/yyyy">MM/DD/YYYY</option>
            <option value="dd/MM/yyyy">DD/MM/YYYY</option>
            <option value="yyyy-MM-dd">YYYY-MM-DD</option>
            <option value="dd MMM yyyy">DD MMM YYYY</option>
          </select>
        </div>
      </div>
    </div>
  )
}

function IntegrationSetupStep() {
  return (
    <div>
      <div className="text-center mb-8">
        <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
          <DocumentTextIcon className="w-8 h-8 text-indigo-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Integration Setup</h2>
        <p className="text-gray-600">Connect your tools and data sources</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Email Integration</h3>
          <p className="text-sm text-gray-600 mb-4">
            Sync notifications and alerts with your email provider
          </p>
          <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
            Connect Now →
          </button>
        </div>

        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Calendar Integration</h3>
          <p className="text-sm text-gray-600 mb-4">
            Import trading schedules and important dates
          </p>
          <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
            Connect Now →
          </button>
        </div>

        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-3">API Access</h3>
          <p className="text-sm text-gray-600 mb-4">
            Enable programmatic access to OptiBid Energy
          </p>
          <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
            Setup API →
          </button>
        </div>

        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Data Import</h3>
          <p className="text-sm text-gray-600 mb-4">
            Upload historical trading data and portfolios
          </p>
          <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
            Import Data →
          </button>
        </div>
      </div>
    </div>
  )
}

function ReviewStep({ data }: { data: OnboardingData }) {
  return (
    <div>
      <div className="text-center mb-8">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <ShieldCheckIcon className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Your Setup</h2>
        <p className="text-gray-600">Everything looks good? Let's get started!</p>
      </div>

      <div className="space-y-6">
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
            <BuildingOfficeIcon className="w-5 h-5 mr-2" />
            Company Information
          </h3>
          <div className="text-sm text-gray-600 space-y-1">
            <div><strong>Name:</strong> {data.companyInfo.name}</div>
            <div><strong>Industry:</strong> {data.companyInfo.industry}</div>
            <div><strong>Size:</strong> {data.companyInfo.size}</div>
            {data.companyInfo.website && <div><strong>Website:</strong> {data.companyInfo.website}</div>}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
            <UserGroupIcon className="w-5 h-5 mr-2" />
            Team Information
          </h3>
          <div className="text-sm text-gray-600 space-y-1">
            <div><strong>Members:</strong> {data.teamInfo.members}</div>
            <div><strong>Roles:</strong> {data.teamInfo.roles.join(', ')}</div>
            {data.teamInfo.requirements.length > 0 && (
              <div><strong>Requirements:</strong> {data.teamInfo.requirements.join(', ')}</div>
            )}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
            <EnvelopeIcon className="w-5 h-5 mr-2" />
            Integrations & Preferences
          </h3>
          <div className="text-sm text-gray-600 space-y-1">
            <div><strong>Email:</strong> {data.integrations.emailProvider}</div>
            <div><strong>Calendar:</strong> {data.integrations.calendarProvider}</div>
            <div><strong>Notifications:</strong> {data.integrations.notificationChannels.join(', ')}</div>
            <div><strong>Timezone:</strong> {data.preferences.timezone}</div>
            <div><strong>Language:</strong> {data.preferences.language}</div>
            <div><strong>Currency:</strong> {data.preferences.currency}</div>
          </div>
        </div>
      </div>
    </div>
  )
}