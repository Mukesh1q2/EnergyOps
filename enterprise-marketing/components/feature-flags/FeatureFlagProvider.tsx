'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { featureFlagService, FeatureDefinition } from '@/lib/feature-flags/FeatureFlagService'

// Context for feature flags
interface FeatureFlagContextType {
  features: Map<string, boolean>
  featureConfigs: Map<string, Record<string, any>>
  isFeatureEnabled: (featureId: string) => boolean
  getFeatureConfig: (featureId: string) => Record<string, any>
  isLoading: boolean
  error: string | null
  refreshFeatures: () => Promise<void>
}

const FeatureFlagContext = createContext<FeatureFlagContextType | undefined>(undefined)

// Hook to use feature flags
export function useFeatureFlags() {
  const context = useContext(FeatureFlagContext)
  if (!context) {
    throw new Error('useFeatureFlags must be used within a FeatureFlagProvider')
  }
  return context
}

// Feature Flag Provider Component
interface FeatureFlagProviderProps {
  children: ReactNode
  organizationId: string
  userId?: string
}

export function FeatureFlagProvider({ 
  children, 
  organizationId, 
  userId 
}: FeatureFlagProviderProps) {
  const [features, setFeatures] = useState<Map<string, boolean>>(new Map())
  const [featureConfigs, setFeatureConfigs] = useState<Map<string, Record<string, any>>>(new Map())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadFeatures = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Load all active features
      const allFeatures = await featureFlagService.getAllFeatures()
      
      // Check enabled status for each feature
      const featureMap = new Map<string, boolean>()
      const configMap = new Map<string, Record<string, any>>()

      for (const feature of allFeatures) {
        if (feature.is_active) {
          const isEnabled = await featureFlagService.isFeatureEnabled(organizationId, feature.id)
          const config = await featureFlagService.getFeatureConfiguration(organizationId, feature.id)
          
          featureMap.set(feature.id, isEnabled)
          configMap.set(feature.id, config)
        }
      }

      setFeatures(featureMap)
      setFeatureConfigs(configMap)
    } catch (err) {
      console.error('Error loading features:', err)
      setError(err instanceof Error ? err.message : 'Failed to load features')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (organizationId) {
      loadFeatures()
    }
  }, [organizationId])

  const isFeatureEnabled = (featureId: string): boolean => {
    return features.get(featureId) || false
  }

  const getFeatureConfig = (featureId: string): Record<string, any> => {
    return featureConfigs.get(featureId) || {}
  }

  const refreshFeatures = async () => {
    await loadFeatures()
  }

  const contextValue: FeatureFlagContextType = {
    features,
    featureConfigs,
    isFeatureEnabled,
    getFeatureConfig,
    isLoading,
    error,
    refreshFeatures
  }

  return (
    <FeatureFlagContext.Provider value={contextValue}>
      {children}
    </FeatureFlagContext.Provider>
  )
}

// Feature Gate Component
interface FeatureGateProps {
  feature: string
  children: ReactNode
  fallback?: ReactNode
  organizationId: string
  userId?: string
}

export function FeatureGate({ 
  feature, 
  children, 
  fallback, 
  organizationId, 
  userId 
}: FeatureGateProps) {
  const { isFeatureEnabled, isLoading } = useFeatureFlags()

  if (isLoading) {
    return (
      <div className="animate-pulse bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
      </div>
    )
  }

  if (!isFeatureEnabled(feature)) {
    return fallback || <DefaultFeatureGate feature={feature} />
  }

  return <>{children}</>
}

// Component wrapper that gates individual widgets
interface WidgetWrapperProps {
  widgetId: string
  feature: string
  children: ReactNode
  className?: string
}

export function WidgetWrapper({ 
  widgetId, 
  feature, 
  children, 
  className = '' 
}: WidgetWrapperProps) {
  const context = useContext(FeatureFlagContext)
  
  // If no context available, render children without gating
  if (!context) {
    return (
      <div className={`${className}`} data-widget={widgetId} data-feature={feature}>
        {children}
      </div>
    )
  }

  const { isFeatureEnabled } = context

  if (!isFeatureEnabled(feature)) {
    return (
      <div className={`${className}`}>
        <WidgetPlaceholder widgetId={widgetId} feature={feature} />
      </div>
    )
  }

  return (
    <div className={`${className}`} data-widget={widgetId} data-feature={feature}>
      {children}
    </div>
  )
}

// Default feature gate fallback component
function DefaultFeatureGate({ feature }: { feature: string }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center">
      <div className="text-gray-400 mb-2">
        <svg className="mx-auto h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
        </svg>
      </div>
      <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
        Feature Unavailable
      </h3>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        This feature is not enabled for your organization.
      </p>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
        Feature: {feature}
      </p>
    </div>
  )
}

// Widget placeholder for disabled features
function WidgetPlaceholder({ widgetId, feature }: { widgetId: string; feature: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 bg-gray-200 dark:bg-gray-600 rounded"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-32"></div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-300 dark:text-gray-600 mb-2">
            <svg className="mx-auto h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
            </svg>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Widget Unavailable
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Requires: {feature}
          </p>
        </div>
      </div>
    </div>
  )
}

// Enhanced Feature Gate with additional functionality
interface EnhancedFeatureGateProps {
  feature: string
  children: ReactNode
  fallback?: ReactNode
  organizationId: string
  userId?: string
  showUpgradePrompt?: boolean
  upgradeTier?: string
  upgradeMessage?: string
}

export function EnhancedFeatureGate({ 
  feature, 
  children, 
  fallback, 
  organizationId, 
  userId,
  showUpgradePrompt = false,
  upgradeTier = 'professional',
  upgradeMessage
}: EnhancedFeatureGateProps) {
  const { isFeatureEnabled, isLoading } = useFeatureFlags()

  if (isLoading) {
    return (
      <div className="animate-pulse bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
      </div>
    )
  }

  if (!isFeatureEnabled(feature)) {
    if (showUpgradePrompt) {
      return (
        <UpgradePromptGate 
          feature={feature} 
          upgradeTier={upgradeTier}
          upgradeMessage={upgradeMessage}
        />
      )
    }
    return fallback || <DefaultFeatureGate feature={feature} />
  }

  return <>{children}</>
}

// Upgrade prompt component
function UpgradePromptGate({ 
  feature, 
  upgradeTier,
  upgradeMessage 
}: { 
  feature: string
  upgradeTier: string
  upgradeMessage?: string 
}) {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6 text-center">
      <div className="text-blue-500 mb-3">
        <svg className="mx-auto h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
      <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
        Upgrade to {upgradeTier.charAt(0).toUpperCase() + upgradeTier.slice(1)}
      </h3>
      <p className="text-xs text-gray-600 dark:text-gray-300 mb-4">
        {upgradeMessage || `Unlock ${feature.replace(/-/g, ' ')} and more advanced features`}
      </p>
      <button className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800">
        Upgrade Now
      </button>
    </div>
  )
}

// Export context provider for advanced usage
export { FeatureFlagContext }
