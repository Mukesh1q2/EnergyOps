'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { DashboardLayout } from '../../components/dashboard/DashboardLayout'
import { DashboardHeader } from '../../components/dashboard/DashboardHeader'
import { WidgetLibrary } from '../../components/dashboard/WidgetLibrary'
import { TeamCollaboration } from '../../components/dashboard/TeamCollaboration'
import { RoleBasedAccess } from '../../components/dashboard/RoleBasedAccess'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { ErrorBoundary } from '../../components/ui/ErrorBoundary'
import { ErrorNotification, ServiceUnavailableBanner } from '../../components/ui/ErrorNotification'
import { 
  handleAPIResponse, 
  handleNetworkError, 
  APIError, 
  APIErrorType,
  safeStateUpdate 
} from '../../lib/api-error-handler'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [isWidgetLibraryOpen, setIsWidgetLibraryOpen] = useState(false)
  const [isCollaborationOpen, setIsCollaborationOpen] = useState(false)
  const [apiError, setApiError] = useState<APIError | null>(null)
  const [isServiceUnavailable, setIsServiceUnavailable] = useState(false)

  useEffect(() => {
    if (isAuthenticated && user) {
      // Load dashboard data based on user permissions
      loadDashboardData()
    }
  }, [isAuthenticated, user])

  // Reload fresh data when user returns to page
  // Validates: Requirements 8.4 - Reload dashboard data when user returns to page
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isAuthenticated && user) {
        console.log('Page became visible, reloading fresh data...')
        loadDashboardData()
      }
    }

    const handleFocus = () => {
      if (isAuthenticated && user) {
        console.log('Window focused, checking for stale data...')
        // Only reload if data is older than 1 minute
        const lastUpdate = dashboardData?.updated_at
        if (lastUpdate) {
          const timeSinceUpdate = Date.now() - new Date(lastUpdate).getTime()
          if (timeSinceUpdate > 60000) {
            console.log('Data is stale, reloading...')
            loadDashboardData()
          }
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [isAuthenticated, user, dashboardData?.updated_at])

  // Auto-refresh effect
  useEffect(() => {
    if (!dashboardData || !isAuthenticated) return
    
    const refreshInterval = dashboardData.autoRefresh || '5m'
    if (refreshInterval === 'off') return
    
    const intervalMs: { [key: string]: number } = {
      '30s': 30000,
      '1m': 60000,
      '5m': 300000,
      '15m': 900000,
      '30m': 1800000,
      '1h': 3600000
    }
    
    const ms = intervalMs[refreshInterval] || 300000
    
    console.log(`Auto-refresh enabled: ${refreshInterval} (${ms}ms)`)
    
    const interval = setInterval(() => {
      console.log('Auto-refreshing dashboard data...')
      loadDashboardData()
    }, ms)
    
    return () => {
      console.log('Auto-refresh disabled')
      clearInterval(interval)
    }
  }, [dashboardData?.autoRefresh, isAuthenticated])

  // WebSocket integration for real-time updates
  useEffect(() => {
    if (!isAuthenticated || !user) return

    // Connect to WebSocket for real-time updates
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsHost = process.env.NEXT_PUBLIC_WS_URL || 'localhost:8000'
    const wsUrl = `${wsProtocol}//${wsHost}/api/ws`

    let ws: WebSocket | null = null

    try {
      ws = new WebSocket(wsUrl)

      ws.onopen = () => {
        console.log('WebSocket connected for real-time updates')
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          
          // Handle different message types
          if (data.type === 'dashboard_update') {
            console.log('Received dashboard update:', data)
            loadDashboardData()
          } else if (data.type === 'widget_update') {
            console.log('Received widget update:', data)
            // Update specific widget data
            setDashboardData((prev: any) => ({
              ...prev,
              widgets: prev.widgets?.map((w: any) =>
                w.id === data.widgetId ? { ...w, data: data.data } : w
              )
            }))
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
      }

      ws.onclose = () => {
        console.log('WebSocket disconnected')
      }
    } catch (error) {
      console.error('Failed to connect WebSocket:', error)
    }

    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close()
        console.log('WebSocket connection closed')
      }
    }
  }, [isAuthenticated, user])

  const loadDashboardData = async () => {
    console.log('🔵 Loading dashboard data...')
    setApiError(null)
    setIsServiceUnavailable(false)
    
    try {
      // Fetch user's dashboard configuration
      const response = await fetch('/api/dashboard/user-config', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('optibid_access_token')}`,
          'Content-Type': 'application/json'
        }
      })
      
      console.log('🔵 Dashboard config response:', response.status)
      
      // Use centralized error handler for non-ok responses
      // Validates: Requirements 7.1, 7.2, 7.3
      if (!response.ok) {
        try {
          await handleAPIResponse(response, { 
            showToast: false, // We'll handle display ourselves
            redirectOnAuth: true,
            onError: (error) => {
              if (error.type === APIErrorType.SERVICE_UNAVAILABLE) {
                setIsServiceUnavailable(true)
              } else {
                setApiError(error)
              }
            }
          })
        } catch (error) {
          // Error already handled, load defaults
          console.log('⚠️ API error, loading defaults')
          await loadDefaultWidgets()
          return
        }
      }
      
      const result = await response.json()
      console.log('🔵 Dashboard config data:', result)
      
      if (result.success && result.data) {
        // Merge with defaults to ensure all fields exist
        const config = {
          name: result.data.name || 'My Dashboard',
          theme: result.data.theme || 'light',
          autoRefresh: result.data.autoRefresh || '5m',
          language: result.data.language || 'en',
          timezone: result.data.timezone || 'America/New_York',
          currency: result.data.currency || 'USD',
          widgets: result.data.widgets || [],
          layout: result.data.layout || 'grid',
          permissions: result.data.permissions || user?.permissions || [],
          ...result.data
        }
        
        console.log('✅ Setting dashboard data:', config)
        setDashboardData(config)
        return
      }
      
      // Load default widgets on error or no data
      console.log('⚠️ No saved config, loading defaults')
      await loadDefaultWidgets()
    } catch (error) {
      console.error('❌ Failed to load dashboard data:', error)
      
      // Handle network errors with centralized handler
      // Validates: Requirements 7.5
      if (error instanceof TypeError && error.message.includes('fetch')) {
        const networkError = handleNetworkError(error, { showToast: false })
        setApiError(networkError)
      }
      
      // Load default widgets as fallback
      await loadDefaultWidgets()
    }
  }

  const loadDefaultWidgets = async () => {
    try {
      const response = await fetch('/api/dashboard/widgets/default')
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          setDashboardData({
            ...result.data,
            theme: 'light',
            permissions: user?.permissions || ['view-energy-data', 'view-market-data', 'view-asset-data']
          })
          return
        }
      }
    } catch (error) {
      console.error('Failed to load default widgets:', error)
    }
    
    // Final fallback with mock data
    setDashboardData(getMockDashboardData())
  }

  const getMockDashboardData = () => ({
    widgets: [
      {
        id: 'demo-energy-chart',
        type: 'energy-generation-chart',
        title: 'Real-time Energy Generation',
        position: { x: 0, y: 0, w: 8, h: 4 },
        config: { 
          dataSource: 'all', 
          timeRange: '24h',
          aggregation: 'sum'
        },
        permissions: ['view-energy-data']
      },
      {
        id: 'demo-market-prices',
        type: 'market-prices-widget',
        title: 'Market Prices - PJM Zone',
        position: { x: 8, y: 0, w: 4, h: 4 },
        config: { 
          marketZone: 'PJM', 
          priceType: 'LMP',
          showTrend: true
        },
        permissions: ['view-market-data']
      },
      {
        id: 'demo-asset-grid',
        type: 'asset-status-grid',
        title: 'Asset Status Overview',
        position: { x: 0, y: 4, w: 12, h: 3 },
        config: { 
          assetTypes: ['solar', 'wind', 'battery'],
          showMetrics: true,
          refreshInterval: '1m'
        },
        permissions: ['view-asset-data']
      }
    ],
    layout: 'grid',
    theme: 'light',
    permissions: user?.permissions || ['view-energy-data', 'view-market-data', 'view-asset-data']
  })

  const handleWidgetAdd = useCallback(async (widgetConfig: any) => {
    console.log('🔵 Adding widget with config:', widgetConfig)
    
    // Validate required fields before making API call
    if (!widgetConfig.type) {
      toast.error('Widget type is required')
      return
    }
    if (!widgetConfig.title) {
      toast.error('Widget title is required')
      return
    }
    
    // Show loading toast
    const loadingToast = toast.loading('Adding widget...')
    
    try {
      // Ensure widget has all required fields per Requirements 3.5
      const completeWidget = {
        type: widgetConfig.type,
        title: widgetConfig.title,
        position: widgetConfig.position || { x: 0, y: 0, w: 4, h: 4 },
        config: widgetConfig.config || {},
        permissions: widgetConfig.permissions || []
      }
      
      // Validate position structure
      const { position } = completeWidget
      if (typeof position.x !== 'number' || typeof position.y !== 'number' ||
          typeof position.w !== 'number' || typeof position.h !== 'number') {
        toast.dismiss(loadingToast)
        toast.error('Invalid widget position configuration')
        return
      }
      
      console.log('🔵 Complete widget:', completeWidget)
      
      // Make POST request to /api/dashboard/widgets per Requirements 3.1
      const response = await fetch('/api/dashboard/widgets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('optibid_access_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(completeWidget)
      })

      console.log('🔵 API Response status:', response.status)
      
      // Dismiss loading toast
      toast.dismiss(loadingToast)

      // Use centralized error handler for API responses
      // Validates: Requirements 7.1, 7.3, 7.4
      if (!response.ok) {
        try {
          await handleAPIResponse(response, {
            showToast: true,
            redirectOnAuth: true,
            customMessages: {
              400: 'Invalid widget configuration. Please check your settings.',
              403: 'You do not have permission to add widgets.'
            }
          })
        } catch (apiError) {
          console.error('❌ API Error:', apiError)
          // Error already handled by handleAPIResponse
          return
        }
      }

      const result = await response.json()
      console.log('🔵 API Response data:', result)
      
      // Handle both response formats: {success: true, data: widget} or just widget
      const newWidget = result.data || result
      console.log('🔵 New widget to add:', newWidget)
      
      // Update state to add new widget per Requirements 3.2, 3.6
      setDashboardData((prev: any) => {
        console.log('🔵 Previous widgets count:', prev?.widgets?.length || 0)
        
        if (!prev) {
          console.log('🔵 No previous data, creating new')
          return { widgets: [newWidget] }
        }
        
        const updated = {
          ...prev,
          widgets: [...(prev.widgets || []), newWidget]
        }
        
        console.log('✅ Updated widgets count:', updated.widgets.length)
        return updated
      })
      
      // Show success toast per Requirements 3.4
      toast.success(`Widget "${newWidget.title || widgetConfig.title}" added successfully!`)
      console.log('✅ Widget added successfully!')
    } catch (error) {
      // Handle network/unexpected errors per Requirements 3.4
      // Validates: Requirements 7.5
      toast.dismiss(loadingToast)
      console.error('❌ Failed to add widget:', error)
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        handleNetworkError(error as Error, { showToast: true })
      } else if (!(error as any).type) {
        // Not an APIError, show generic message
        const errorMessage = error instanceof Error 
          ? error.message 
          : 'Failed to add widget. Please try again.'
        toast.error(errorMessage)
      }
      // If it's an APIError, it was already handled
    }
  }, [])

  const handleWidgetUpdate = async (widgetId: string, updates: any) => {
    try {
      const response = await fetch(`/api/dashboard/widgets/${widgetId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('optibid_access_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      })

      if (response.ok) {
        const updatedWidget = await response.json()
        setDashboardData((prev: any) => ({
          ...prev,
          widgets: prev.widgets.map((w: any) => 
            w.id === widgetId ? updatedWidget : w
          )
        }))
      }
    } catch (error) {
      console.error('Failed to update widget:', error)
    }
  }

  const handleWidgetDelete = async (widgetId: string) => {
    try {
      const response = await fetch(`/api/dashboard/widgets/${widgetId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('optibid_access_token')}`
        }
      })

      if (response.ok) {
        setDashboardData((prev: any) => ({
          ...prev,
          widgets: prev.widgets.filter((w: any) => w.id !== widgetId)
        }))
      }
    } catch (error) {
      console.error('Failed to delete widget:', error)
    }
  }

  const handleLayoutUpdate = async (newLayout: any) => {
    // Store previous state for rollback
    const previousData = dashboardData ? { ...dashboardData } : null
    
    try {
      // Optimistic update - apply changes immediately
      // Validates: Requirements 8.5
      setDashboardData((prev: any) => ({
        ...prev,
        ...newLayout
      }))
      
      // Save complete configuration using the correct endpoint
      const response = await fetch('/api/dashboard/user-config', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('optibid_access_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...dashboardData,
          ...newLayout,
          updated_at: new Date().toISOString()
        })
      })

      // Use centralized error handler
      // Validates: Requirements 7.1, 7.3
      if (!response.ok) {
        // Rollback on failure
        if (previousData) {
          setDashboardData(previousData)
        }
        
        await handleAPIResponse(response, {
          showToast: true,
          redirectOnAuth: true,
          customMessages: {
            400: 'Invalid configuration. Changes have been reverted.'
          }
        })
        return
      }

      const result = await response.json()
      if (!result.success) {
        // Rollback if API indicates failure
        if (previousData) {
          setDashboardData(previousData)
        }
        toast.error('Failed to save configuration')
      }
    } catch (error) {
      console.error('Failed to update configuration:', error)
      
      // Rollback on error - Validates: Requirements 8.5
      if (previousData) {
        setDashboardData(previousData)
      }
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        handleNetworkError(error as Error, { showToast: true })
      }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Authentication Required
          </h1>
          <p className="text-gray-600 mb-6">
            Please log in to access your dashboard.
          </p>
          <a
            href="/login"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Sign In
          </a>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardHeader
          onOpenWidgetLibrary={() => setIsWidgetLibraryOpen(true)}
          onOpenCollaboration={() => setIsCollaborationOpen(true)}
          user={user}
        />
        
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Service Unavailable Banner - Validates: Requirements 7.5 */}
          {isServiceUnavailable && (
            <ServiceUnavailableBanner
              onRetry={loadDashboardData}
              retryCountdown={30}
              className="mb-6"
            />
          )}
          
          {/* API Error Notification - Validates: Requirements 7.1 */}
          {apiError && !isServiceUnavailable && (
            <ErrorNotification
              error={apiError}
              onDismiss={() => setApiError(null)}
              onRetry={apiError.retryable ? loadDashboardData : undefined}
              className="mb-6"
              autoDismiss={10000}
            />
          )}
          <RoleBasedAccess user={user}>
            <DashboardLayout
              user={user}
              dashboardData={dashboardData}
              organizationId={user?.organizationId || user?.organization_id || 'default-org'}
              onWidgetAdd={handleWidgetAdd}
              onWidgetUpdate={handleWidgetUpdate}
              onWidgetDelete={handleWidgetDelete}
              onLayoutUpdate={handleLayoutUpdate}
              onFeaturesUpdated={() => loadDashboardData()}
            />
          </RoleBasedAccess>
        </main>

        {/* Widget Library Modal */}
        <WidgetLibrary
          isOpen={isWidgetLibraryOpen}
          onClose={() => setIsWidgetLibraryOpen(false)}
          onWidgetAdd={handleWidgetAdd}
          userPermissions={user?.permissions || []}
        />

        {/* Team Collaboration Panel */}
        {isCollaborationOpen && (
          <TeamCollaboration
            onClose={() => setIsCollaborationOpen(false)}
            user={user}
          />
        )}
      </div>
    </ErrorBoundary>
  )
}