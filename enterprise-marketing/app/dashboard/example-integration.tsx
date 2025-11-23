/**
 * Example Dashboard Page Integration
 * 
 * Shows how to integrate the Feature Settings System with
 * the existing dashboard page.
 */

'use client'

import { useState, useEffect } from 'react'
import { FeatureFlagProvider } from '@/components/feature-flags/FeatureFlagProvider'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { WidgetLibrary } from '@/components/dashboard/WidgetLibrary'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import type { User } from '@/types'

// Mock user and organization data
const mockUser: User = {
  id: 'user-123',
  name: 'John Doe',
  email: 'john.doe@example.com',
  role: 'energy_analyst',
  organization_id: 'org-456'
}

const mockOrganization = {
  id: 'org-456',
  name: 'Solar Energy Corp',
  tier: 'professional',
  settings: {}
}

const mockDashboardData = {
  name: 'Main Dashboard',
  widgets: [
    {
      id: 'widget-1',
      type: 'energy-generation-chart',
      title: 'Energy Generation',
      position: { x: 0, y: 0, w: 6, h: 4 },
      config: { dataSource: 'solar', timeRange: '24h' },
      permissions: ['view-energy-data']
    },
    {
      id: 'widget-2',
      type: 'trading-dashboard',
      title: 'Trading Overview',
      position: { x: 6, y: 0, w: 6, h: 4 },
      config: { marketZone: 'PJM', showOrders: true },
      permissions: ['view-trading-data']
    },
    {
      id: 'widget-3',
      type: 'india-energy-market',
      title: 'India Energy Market',
      position: { x: 0, y: 4, w: 12, h: 6 },
      config: { viewType: 'overview' },
      permissions: ['view-india-energy']
    }
  ]
}

export default function DashboardPage() {
  const [isWidgetLibraryOpen, setIsWidgetLibraryOpen] = useState(false)
  const [dashboardData, setDashboardData] = useState(mockDashboardData)
  const [user] = useState<User>(mockUser)
  const [organizationId] = useState<string>(mockOrganization.id)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading user and organization data
    const loadData = async () => {
      try {
        // In a real app, this would fetch from your API
        await new Promise(resolve => setTimeout(resolve, 1000))
        setIsLoading(false)
      } catch (error) {
        console.error('Error loading dashboard data:', error)
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const handleWidgetAdd = (widgetConfig: any) => {
    const newWidget = {
      ...widgetConfig,
      id: `widget-${Date.now()}`,
      createdBy: user.id
    }

    setDashboardData(prev => ({
      ...prev,
      widgets: [...prev.widgets, newWidget]
    }))
  }

  const handleWidgetUpdate = (widgetId: string, updates: any) => {
    setDashboardData(prev => ({
      ...prev,
      widgets: prev.widgets.map(widget =>
        widget.id === widgetId ? { ...widget, ...updates } : widget
      )
    }))
  }

  const handleWidgetDelete = (widgetId: string) => {
    setDashboardData(prev => ({
      ...prev,
      widgets: prev.widgets.filter(widget => widget.id !== widgetId)
    }))
  }

  const handleLayoutUpdate = (layouts: any) => {
    // Update widget positions based on new layouts
    const updatedWidgets = dashboardData.widgets.map(widget => {
      const layoutItem = layouts.lg?.find((item: any) => item.i === widget.id)
      if (layoutItem) {
        return {
          ...widget,
          position: {
            x: layoutItem.x,
            y: layoutItem.y,
            w: layoutItem.w,
            h: layoutItem.h
          }
        }
      }
      return widget
    })

    setDashboardData(prev => ({
      ...prev,
      widgets: updatedWidgets
    }))
  }

  const handleFeaturesUpdated = () => {
    // Refresh dashboard when features change
    window.location.reload()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <FeatureFlagProvider 
      organizationId={organizationId}
      userId={user.id}
    >
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Dashboard Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {mockOrganization.name} Dashboard
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Welcome back, {user.name}
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setIsWidgetLibraryOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Add Widget
                </button>
                
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {mockOrganization.tier.charAt(0).toUpperCase() + mockOrganization.tier.slice(1)} Plan
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Organization ID: {organizationId}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <DashboardLayout
            user={user}
            dashboardData={dashboardData}
            organizationId={organizationId}
            onWidgetAdd={handleWidgetAdd}
            onWidgetUpdate={handleWidgetUpdate}
            onWidgetDelete={handleWidgetDelete}
            onLayoutUpdate={handleLayoutUpdate}
            onFeaturesUpdated={handleFeaturesUpdated}
          />
        </div>

        {/* Widget Library Modal */}
        <WidgetLibrary
          isOpen={isWidgetLibraryOpen}
          onClose={() => setIsWidgetLibraryOpen(false)}
          onWidgetAdd={handleWidgetAdd}
          userPermissions={['view-dashboard', 'view-energy-data', 'view-trading-data']}
        />
      </div>
    </FeatureFlagProvider>
  )
}

// =============================================================================
// ADVANCED INTEGRATION EXAMPLES
// =============================================================================

// Example 1: Feature-aware widget rendering in a custom component
export function CustomWidgetContainer({ children }: { children: React.ReactNode }) {
  const { isFeatureEnabled } = useFeatureFlags()

  return (
    <div className="space-y-6">
      {/* Show AI insights only if enabled */}
      {isFeatureEnabled('ai-insights') && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            AI-Powered Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-100">
                Efficiency Trend
              </h4>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-300">
                +12.5%
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <h4 className="font-medium text-green-900 dark:text-green-100">
                Cost Reduction
              </h4>
              <p className="text-2xl font-bold text-green-600 dark:text-green-300">
                -8.3%
              </p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <h4 className="font-medium text-purple-900 dark:text-purple-100">
                Optimization Score
              </h4>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-300">
                94.2
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Show LLM assistant only if enabled */}
      <EnhancedFeatureGate
        feature="llm-assistant"
        organizationId={organizationId}
        userId={user.id}
        showUpgradePrompt={true}
        upgradeTier="enterprise"
        upgradeMessage="Unlock AI-powered natural language queries"
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            AI Assistant
          </h3>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Ask me anything about your energy data..."
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
            />
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Ask
            </button>
          </div>
        </div>
      </EnhancedFeatureGate>

      {/* India Energy Market - conditionally rendered */}
      <WidgetWrapper
        widgetId="india-energy-overview"
        feature="india-energy"
        className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm"
      >
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            India Energy Market Overview
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">8,100+</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Market Participants</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">28</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">States Covered</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">4</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Market Segments</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">₹45.2</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Avg Price (₹/unit)</p>
            </div>
          </div>
        </div>
      </WidgetWrapper>

      {/* Render children (main dashboard content) */}
      {children}
    </div>
  )
}

// Example 2: Feature-aware navigation component
export function FeatureAwareNavigation() {
  const { isFeatureEnabled } = useFeatureFlags()

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: 'home',
      feature: 'dashboard-core'
    },
    {
      name: 'Trading',
      href: '/trading',
      icon: 'chart',
      feature: 'trading-dashboard'
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: 'analytics',
      feature: 'ai-insights'
    },
    {
      name: 'India Market',
      href: '/india-energy',
      icon: 'map',
      feature: 'india-energy'
    },
    {
      name: 'Reports',
      href: '/reports',
      icon: 'document',
      feature: 'compliance-report'
    }
  ]

  return (
    <nav className="space-y-2">
      {navigationItems.map((item) => (
        <FeatureGate
          key={item.name}
          feature={item.feature}
          organizationId={organizationId}
          fallback={
            <div className="flex items-center space-x-3 px-3 py-2 text-gray-400 dark:text-gray-600">
              <span className="text-gray-300">🔒</span>
              <span>{item.name}</span>
              <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                Locked
              </span>
            </div>
          }
        >
          <a
            href={item.href}
            className="flex items-center space-x-3 px-3 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <span>{item.name}</span>
          </a>
        </FeatureGate>
      ))}
    </nav>
  )
}

// Example 3: Template application function
export async function applyEnergyTraderTemplate(organizationId: string, userId: string) {
  try {
    const response = await fetch(`/api/features/${organizationId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        templateId: 'energy_trader',
        userId: userId
      })
    })

    if (!response.ok) {
      throw new Error('Failed to apply template')
    }

    const result = await response.json()
    console.log('Template applied successfully:', result)
    return result
  } catch (error) {
    console.error('Error applying template:', error)
    throw error
  }
}

// Example 4: Feature usage analytics
export function useFeatureAnalytics() {
  const [analytics, setAnalytics] = useState<any>(null)

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const response = await fetch('/api/features/analytics')
        const data = await response.json()
        setAnalytics(data)
      } catch (error) {
        console.error('Error loading analytics:', error)
      }
    }

    loadAnalytics()
  }, [])

  return analytics
}
