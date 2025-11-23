'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ShieldCheckIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  KeyIcon
} from '@heroicons/react/24/outline'

interface SSOProvider {
  id: string
  name: string
  description: string
  logo: React.ReactNode
  color: string
  setupRequired?: boolean
}

interface SSOIntegrationProps {
  onSuccess?: (data: any) => void
  onError?: (error: string) => void
  redirectUri?: string
}

const ssoProviders: SSOProvider[] = [
  {
    id: 'azure',
    name: 'Azure Active Directory',
    description: 'Enterprise SSO with Microsoft Azure AD',
    logo: (
      <svg className="w-6 h-6" viewBox="0 0 24 24">
        <path fill="currentColor" d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z"/>
      </svg>
    ),
    color: 'blue',
    setupRequired: true
  },
  {
    id: 'okta',
    name: 'Okta',
    description: 'Identity and access management platform',
    logo: (
      <svg className="w-6 h-6" viewBox="0 0 24 24">
        <path fill="currentColor" d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.2l7.5 3.75v7.5L12 19.8l-7.5-3.75v-7.5L12 4.2z"/>
      </svg>
    ),
    color: 'purple',
    setupRequired: true
  },
  {
    id: 'google',
    name: 'Google Workspace',
    description: 'Sign in with Google for Business',
    logo: (
      <svg className="w-6 h-6" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
    ),
    color: 'green'
  },
  {
    id: 'auth0',
    name: 'Auth0',
    description: 'Flexible identity platform',
    logo: (
      <svg className="w-6 h-6" viewBox="0 0 24 24">
        <path fill="currentColor" d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.2l7.5 3.75v7.5L12 19.8l-7.5-3.75v-7.5L12 4.2z"/>
      </svg>
    ),
    color: 'red',
    setupRequired: true
  }
]

const colorClasses = {
  blue: 'border-blue-200 hover:border-blue-300 hover:bg-blue-50 text-blue-600',
  purple: 'border-purple-200 hover:border-purple-300 hover:bg-purple-50 text-purple-600',
  green: 'border-green-200 hover:border-green-300 hover:bg-green-50 text-green-600',
  red: 'border-red-200 hover:border-red-300 hover:bg-red-50 text-red-600'
}

export function SSOIntegration({ onSuccess, onError, redirectUri }: SSOIntegrationProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [showSetupInfo, setShowSetupInfo] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null)

  const handleSSOInitiate = async (providerId: string) => {
    const provider = ssoProviders.find(p => p.id === providerId)
    if (!provider) return

    // Check if setup is required
    if (provider.setupRequired) {
      setSelectedProvider(providerId)
      setShowSetupInfo(true)
      return
    }

    setLoading(providerId)

    try {
      const response = await fetch('/api/auth/sso/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: providerId,
          redirectUri
        })
      })

      const data = await response.json()
      
      if (data.success) {
        // Redirect to SSO provider
        window.location.href = data.data.authUrl
      } else {
        onError?.(data.error || 'SSO initiation failed')
      }
    } catch (error) {
      console.error('SSO initiation error:', error)
      onError?.('Failed to initiate SSO authentication')
    } finally {
      setLoading(null)
    }
  }

  const handleSetupComplete = () => {
    setShowSetupInfo(false)
    setSelectedProvider(null)
    // Provider setup completed, user can now use SSO
  }

  if (showSetupInfo && selectedProvider) {
    return <SSOSetupInfo providerId={selectedProvider} onComplete={handleSetupComplete} />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <BuildingOfficeIcon className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Enterprise Single Sign-On
        </h2>
        <p className="text-gray-600">
          Sign in with your organization's identity provider
        </p>
      </div>

      {/* SSO Providers */}
      <div className="space-y-3">
        {ssoProviders.map((provider) => (
          <motion.button
            key={provider.id}
            onClick={() => handleSSOInitiate(provider.id)}
            disabled={loading === provider.id}
            className={`w-full p-4 border-2 rounded-xl text-left transition-all disabled:opacity-50 ${colorClasses[provider.color as keyof typeof colorClasses]}`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center">
              <div className="mr-4">
                {provider.logo}
              </div>
              <div className="flex-1">
                <div className="flex items-center">
                  <h3 className="font-semibold text-gray-900">{provider.name}</h3>
                  {provider.setupRequired && (
                    <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                      Setup Required
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{provider.description}</p>
              </div>
              {loading === provider.id ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current" />
              ) : (
                <KeyIcon className="w-5 h-5" />
              )}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Help Section */}
      <div className="bg-gray-50 rounded-xl p-6">
        <div className="flex items-start">
          <ShieldCheckIcon className="w-5 h-5 text-gray-600 mt-0.5 mr-3" />
          <div>
            <h3 className="font-medium text-gray-900 mb-2">SSO Benefits</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Single login for all applications</li>
              <li>• Enhanced security with enterprise identity providers</li>
              <li>• Automatic user provisioning and deprovisioning</li>
              <li>• Centralized access control and compliance</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Contact Support */}
      <div className="text-center">
        <p className="text-sm text-gray-500">
          Need help setting up SSO?{' '}
          <button className="text-blue-600 hover:text-blue-700 underline">
            Contact Support
          </button>
        </p>
      </div>
    </div>
  )
}

interface SSOSetupInfoProps {
  providerId: string
  onComplete: () => void
}

function SSOSetupInfo({ providerId, onComplete }: SSOSetupInfoProps) {
  const provider = ssoProviders.find(p => p.id === providerId)
  
  const getSetupInstructions = (providerId: string) => {
    switch (providerId) {
      case 'azure':
        return {
          steps: [
            'Go to Azure Portal > Azure Active Directory > App registrations',
            'Create a new application registration',
            'Configure redirect URI: https://your-domain.com/auth/sso/callback',
            'Copy Application (client) ID and Directory (tenant) ID',
            'Create a client secret and copy its value'
          ],
          requiredFields: ['Client ID', 'Tenant ID', 'Client Secret']
        }
      case 'okta':
        return {
          steps: [
            'Go to Okta Admin Console > Applications > Create App Integration',
            'Choose OIDC - OpenID Connect as Sign-on method',
            'Set Application type to Web Application',
            'Configure redirect URIs: https://your-domain.com/auth/sso/callback',
            'Copy Client ID and Client Secret from the settings'
          ],
          requiredFields: ['Okta Domain', 'Client ID', 'Client Secret']
        }
      case 'google':
        return {
          steps: [
            'Go to Google Cloud Console > APIs & Services > Credentials',
            'Create OAuth 2.0 Client IDs',
            'Set Application type to Web application',
            'Add authorized redirect URIs: https://your-domain.com/auth/sso/callback',
            'Copy Client ID and Client Secret'
          ],
          requiredFields: ['Client ID', 'Client Secret']
        }
      case 'auth0':
        return {
          steps: [
            'Go to Auth0 Dashboard > Applications > Create Application',
            'Choose Regular Web Application',
            'Configure Allowed Callback URLs: https://your-domain.com/auth/sso/callback',
            'Configure Allowed Logout URLs: https://your-domain.com',
            'Copy Domain, Client ID, and Client Secret'
          ],
          requiredFields: ['Domain', 'Client ID', 'Client Secret']
        }
      default:
        return { steps: [], requiredFields: [] }
    }
  }

  const instructions = getSetupInstructions(providerId)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 max-w-2xl mx-auto"
    >
      <div className="text-center mb-6">
        <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
          <ShieldCheckIcon className="w-8 h-8 text-yellow-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Setup Required for {provider?.name}
        </h2>
        <p className="text-gray-600">
          Your organization needs to configure SSO integration before users can sign in.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Setup Steps */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Configuration Steps:</h3>
          <ol className="space-y-2">
            {instructions.steps.map((step, index) => (
              <li key={index} className="flex items-start text-sm text-gray-600">
                <span className="inline-block w-5 h-5 bg-blue-100 text-blue-600 rounded-full text-xs text-center leading-5 mr-2 mt-0.5 flex-shrink-0">
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>

        {/* Required Fields */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Required Information:</h3>
          <div className="space-y-2">
            {instructions.requiredFields.map((field, index) => (
              <div key={index} className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm font-medium text-gray-900">{field}</div>
                <div className="text-xs text-gray-500 mt-1">
                  To be provided by your IT administrator
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-blue-50 rounded-lg p-4 mt-6">
        <h4 className="font-medium text-blue-900 mb-2">Next Steps:</h4>
        <p className="text-sm text-blue-800 mb-3">
          Share these instructions with your IT administrator to complete the SSO setup. 
          Once configured, you'll be able to sign in with your organization's credentials.
        </p>
        <div className="text-sm text-blue-700">
          <strong>Support:</strong> Contact our support team for assistance with SSO configuration.
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-3 mt-6">
        <button
          onClick={onComplete}
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Got it
        </button>
        <button
          onClick={onComplete}
          className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Continue
        </button>
      </div>
    </motion.div>
  )
}