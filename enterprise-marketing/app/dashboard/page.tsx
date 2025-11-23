'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '../../components/auth/AuthProvider'
import { DashboardLayout } from '../../components/dashboard/DashboardLayout'
import { DashboardHeader } from '../../components/dashboard/DashboardHeader'
import { WidgetLibrary } from '../../components/dashboard/WidgetLibrary'
import { TeamCollaboration } from '../../components/dashboard/TeamCollaboration'
import { RoleBasedAccess } from '../../components/dashboard/RoleBasedAccess'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { ErrorBoundary } from '../../components/ui/ErrorBoundary'

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [isWidgetLibraryOpen, setIsWidgetLibraryOpen] = useState(false)
  const [isCollaborationOpen, setIsCollaborationOpen] = useState(false)

  useEffect(() => {
    if (isAuthenticated && user) {
      // Load dashboard data based on user permissions
      loadDashboardData()
    }
  }, [isAuthenticated, user])

  const loadDashboardData = async () => {
    try {
      // This would fetch user's dashboard configuration, widgets, etc.
      const response = await fetch('/api/dashboard/user-config', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setDashboardData(data)
      } else {
        // Set default dashboard if user has no saved configuration
        setDashboardData({
          widgets: [],
          layout: 'grid',
          theme: 'light',
          permissions: user?.permissions || []
        })
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
      // Set fallback dashboard data
      setDashboardData({
        widgets: [],
        layout: 'grid',
        theme: 'light',
        permissions: user?.permissions || []
      })
    }
  }

  const handleWidgetAdd = async (widgetConfig: any) => {
    try {
      const response = await fetch('/api/dashboard/widgets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(widgetConfig)
      })

      if (response.ok) {
        const newWidget = await response.json()
        setDashboardData((prev: any) => ({
          ...prev,
          widgets: [...prev.widgets, newWidget]
        }))
      }
    } catch (error) {
      console.error('Failed to add widget:', error)
    }
  }

  const handleWidgetUpdate = async (widgetId: string, updates: any) => {
    try {
      const response = await fetch(`/api/dashboard/widgets/${widgetId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
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
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
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
    try {
      const response = await fetch('/api/dashboard/layout', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ layout: newLayout })
      })

      if (response.ok) {
        setDashboardData((prev: any) => ({
          ...prev,
          layout: newLayout
        }))
      }
    } catch (error) {
      console.error('Failed to update layout:', error)
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
          <RoleBasedAccess user={user}>
            <DashboardLayout
              user={user}
              dashboardData={dashboardData}
              onWidgetAdd={handleWidgetAdd}
              onWidgetUpdate={handleWidgetUpdate}
              onWidgetDelete={handleWidgetDelete}
              onLayoutUpdate={handleLayoutUpdate}
            />
          </RoleBasedAccess>
        </main>

        {/* Widget Library Modal */}
        {isWidgetLibraryOpen && (
          <WidgetLibrary
            onClose={() => setIsWidgetLibraryOpen(false)}
            onWidgetAdd={handleWidgetAdd}
            userPermissions={user?.permissions || []}
          />
        )}

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