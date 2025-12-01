'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Responsive, WidthProvider } from 'react-grid-layout'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  PlusIcon, 
  Cog6ToothIcon, 
  ArrowsPointingOutIcon,
  ChartBarIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import { WidgetRenderer } from './WidgetRenderer'
import { DashboardSettings } from './DashboardSettings'
import { ShareDashboard } from './ShareDashboard'
import { DashboardErrorBoundary } from './DashboardErrorBoundary'
import { useFeatureFlags } from '@/lib/feature-flags/FeatureFlagProvider'
import { FeatureGate, WidgetWrapper } from '@/components/feature-flags/FeatureFlagProvider'
import { FeatureSettings } from '@/components/feature-flags/FeatureSettings'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'

const ResponsiveGridLayout = WidthProvider(Responsive)

/**
 * Event-isolated container component that prevents scroll events from propagating
 * to parent components, avoiding unintended state mutations in modals.
 * Validates: Requirements 2.1, 2.3, 2.4
 */
interface EventIsolatedContainerProps {
  children: React.ReactNode
  className?: string
}

function EventIsolatedContainer({ children, className = '' }: EventIsolatedContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Prevent scroll events from propagating to parent components
    const handleScroll = (e: Event) => {
      e.stopPropagation()
    }

    // Prevent wheel events from triggering layout recalculations
    const handleWheel = (e: WheelEvent) => {
      e.stopPropagation()
    }

    // Prevent touch events from propagating during scroll
    const handleTouchMove = (e: TouchEvent) => {
      e.stopPropagation()
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    container.addEventListener('wheel', handleWheel, { passive: true })
    container.addEventListener('touchmove', handleTouchMove, { passive: true })

    return () => {
      container.removeEventListener('scroll', handleScroll)
      container.removeEventListener('wheel', handleWheel)
      container.removeEventListener('touchmove', handleTouchMove)
    }
  }, [])

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  )
}

interface Widget {
  id: string
  type: string
  title: string
  position: {
    x: number
    y: number
    w: number
    h: number
  }
  config: any
  permissions: string[]
  isShared?: boolean
  createdBy?: string
}

interface DashboardLayoutProps {
  user: any
  dashboardData: any
  organizationId: string
  onWidgetAdd: (widgetConfig: any) => void
  onWidgetUpdate: (widgetId: string, updates: any) => void
  onWidgetDelete: (widgetId: string) => void
  onLayoutUpdate: (layout: any) => void
  onFeaturesUpdated?: () => void
}

export function DashboardLayout({
  user,
  dashboardData,
  organizationId,
  onWidgetAdd,
  onWidgetUpdate,
  onWidgetDelete,
  onLayoutUpdate,
  onFeaturesUpdated
}: DashboardLayoutProps) {
  const { isFeatureEnabled } = useFeatureFlags()
  const [layouts, setLayouts] = useState<any>({})
  const [widgets, setWidgets] = useState<Widget[]>([])
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isShareOpen, setIsShareOpen] = useState(false)
  const [isFeatureSettingsOpen, setIsFeatureSettingsOpen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isViewMode, setIsViewMode] = useState(false)
  
  // Track if any modal is open to prevent unintended layout updates
  // Validates: Requirements 2.1, 2.3 - Prevent scroll events from triggering state mutations
  const isAnyModalOpen = isSettingsOpen || isShareOpen || isFeatureSettingsOpen
  
  // Store a snapshot of widgets when modal opens to enable rollback if needed
  // Validates: Requirements 6.3, 6.5 - Share modal doesn't affect chart data
  const widgetsSnapshotRef = useRef<Widget[]>([])
  const layoutsSnapshotRef = useRef<any>({})

  useEffect(() => {
    if (dashboardData) {
      setWidgets(dashboardData.widgets || [])
      
      // Convert widgets to grid layout format
      const layout = (dashboardData.widgets || []).map((widget: Widget, index: number) => ({
        i: widget.id,
        x: widget.position.x,
        y: widget.position.y,
        w: widget.position.w,
        h: widget.position.h,
        minW: 2,
        minH: 2
      }))
      
      setLayouts({
        lg: layout,
        md: layout,
        sm: layout,
        xs: layout,
        xxs: layout
      })
    }
  }, [dashboardData])

  // Capture widget and layout snapshot when modal opens, restore on close
  // Validates: Requirements 2.4 - Preserve widget configurations across all user interactions
  // Validates: Requirements 6.3, 6.5 - Share modal doesn't affect chart data
  useEffect(() => {
    if (isAnyModalOpen) {
      // Capture snapshot when modal opens
      widgetsSnapshotRef.current = JSON.parse(JSON.stringify(widgets))
      layoutsSnapshotRef.current = JSON.parse(JSON.stringify(layouts))
    } else if (widgetsSnapshotRef.current.length > 0) {
      // Verify data integrity when modal closes
      // If widgets were unexpectedly modified during modal interaction, restore from snapshot
      const currentWidgetIds = widgets.map(w => w.id).sort().join(',')
      const snapshotWidgetIds = widgetsSnapshotRef.current.map(w => w.id).sort().join(',')
      
      if (currentWidgetIds !== snapshotWidgetIds) {
        console.warn('Widget data was modified during modal interaction, restoring from snapshot')
        setWidgets(widgetsSnapshotRef.current)
        setLayouts(layoutsSnapshotRef.current)
      }
    }
  }, [isAnyModalOpen])

  /**
   * Handle layout changes from react-grid-layout.
   * Prevents state mutations when modals are open to avoid scroll-triggered updates.
   * Validates: Requirements 2.1, 2.3
   */
  const handleLayoutChange = useCallback((layout: any, layouts: any) => {
    // Prevent layout updates when any modal is open
    // This prevents scroll events in modals from triggering unintended state mutations
    if (isAnyModalOpen) {
      return
    }
    
    setLayouts(layouts)
    
    // Update widget positions
    const updatedWidgets = widgets.map(widget => {
      const layoutItem = layout.find((item: any) => item.i === widget.id)
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
    
    setWidgets(updatedWidgets)
    onLayoutUpdate(layouts)
  }, [isAnyModalOpen, widgets, onLayoutUpdate])

  const handleWidgetResize = (widgetId: string, newSize: any) => {
    const updatedWidgets = widgets.map(widget => {
      if (widget.id === widgetId) {
        return {
          ...widget,
          position: {
            ...widget.position,
            w: newSize.w,
            h: newSize.h
          }
        }
      }
      return widget
    })
    
    setWidgets(updatedWidgets)
    onWidgetUpdate(widgetId, { position: {
      x: newSize.x,
      y: newSize.y,
      w: newSize.w,
      h: newSize.h
    }})
  }

  const handleWidgetAction = (widgetId: string, action: string, data?: any) => {
    switch (action) {
      case 'resize':
        handleWidgetResize(widgetId, data)
        break
      case 'configure':
        // Open widget configuration modal
        break
      case 'share':
        // Share specific widget
        break
      case 'duplicate':
        // Duplicate widget
        const widgetToDuplicate = widgets.find(w => w.id === widgetId)
        if (widgetToDuplicate) {
          const newWidget = {
            ...widgetToDuplicate,
            id: `${widgetToDuplicate.id}-copy-${Date.now()}`,
            title: `${widgetToDuplicate.title} (Copy)`
          }
          onWidgetAdd(newWidget)
        }
        break
      case 'delete':
        onWidgetDelete(widgetId)
        break
      default:
        console.log('Unknown widget action:', action)
    }
  }

  const renderWidget = (widget: Widget, layoutItem: any) => {
    // Map widget types to feature IDs for feature gating
    const getWidgetFeature = (widgetType: string): string => {
      const featureMap: { [key: string]: string } = {
        'energy-generation-chart': 'energy-generation-chart',
        'market-prices-widget': 'market-prices-widget',
        'asset-status-grid': 'asset-status-grid',
        'performance-kpis': 'performance-kpis',
        'trading-dashboard': 'trading-dashboard',
        'team-activity-feed': 'team-activity-feed',
        'compliance-report': 'compliance-report',
        'geographic-map': 'geographic-map'
      }
      return featureMap[widgetType] || 'dashboard-core'
    }

    const widgetFeature = getWidgetFeature(widget.type)

    return (
      <motion.div
        key={widget.id}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className="h-full"
      >
        <WidgetWrapper
          widgetId={widget.id}
          feature={widgetFeature}
          className="h-full"
        >
          <WidgetRenderer
            widget={widget}
            layoutItem={layoutItem}
            onAction={(action, data) => handleWidgetAction(widget.id, action, data)}
            isViewMode={isViewMode}
            user={user}
          />
        </WidgetWrapper>
      </motion.div>
    )
  }

  const gridConfig = {
    className: 'layout',
    rowHeight: 60,
    cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
    breakpoints: { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 },
    compactType: 'vertical' as const,
    preventCollision: false,
    measureBeforeMount: false,
    useCSSTransforms: true,
    margin: [16, 16],
    containerPadding: [0, 0]
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            No Dashboard Data
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Configure your dashboard to get started.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${isFullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-gray-900 p-6' : ''}`}>
      {/* Dashboard Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {dashboardData.name || 'My Dashboard'}
          </h1>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></span>
              Live
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* View Mode Toggle */}
          <button
            onClick={() => setIsViewMode(!isViewMode)}
            className={`p-2 rounded-lg transition-colors ${
              isViewMode 
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' 
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
            title={isViewMode ? 'Exit view mode' : 'Enter view mode'}
          >
            <EyeIcon className="h-5 w-5" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            <ArrowsPointingOutIcon className="h-5 w-5" />
          </button>

          {/* Share Dashboard */}
          <button
            onClick={() => setIsShareOpen(true)}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
          >
            Share
          </button>

          {/* Feature Settings */}
          <button
            onClick={() => setIsFeatureSettingsOpen(true)}
            className="px-3 py-2 text-sm font-medium text-purple-700 bg-purple-100 border border-purple-300 rounded-lg hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-200 dark:border-purple-700 dark:hover:bg-purple-800 transition-colors"
            title="Feature Settings - Customize Dashboard"
          >
            Features
          </button>

          {/* Dashboard Settings */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            title="Dashboard Settings"
          >
            <Cog6ToothIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Widget Grid */}
      <div className="relative">
        <AnimatePresence>
          {widgets.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                No widgets configured
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Add widgets to your dashboard to get started.
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={() => {/* Trigger widget library */}}
                >
                  <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                  Add Widget
                </button>
              </div>
            </motion.div>
          ) : (
            <ResponsiveGridLayout
              className="layout"
              layouts={layouts}
              onLayoutChange={handleLayoutChange}
              {...gridConfig}
            >
              {widgets.map((widget) => {
                const layoutItem = layouts.lg?.find((item: any) => item.i === widget.id)
                return layoutItem ? (
                  <div key={widget.id} data-grid={layoutItem}>
                    {renderWidget(widget, layoutItem)}
                  </div>
                ) : null
              })}
            </ResponsiveGridLayout>
          )}
        </AnimatePresence>
      </div>

      {/* Settings Modal */}
      {/* Validates: Requirements 4.1, 4.2 - Settings are passed to parent and trigger API save */}
      <AnimatePresence>
        {isSettingsOpen && (
          <DashboardSettings
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            dashboardData={dashboardData}
            onUpdate={onLayoutUpdate}
            onSettingsSaved={() => {
              // Notify parent that settings were saved successfully
              // This allows the parent to reload dashboard data if needed
              onFeaturesUpdated?.()
            }}
          />
        )}
      </AnimatePresence>

      {/* Share Modal */}
      {/* Validates: Requirements 6.1, 6.2, 6.3, 6.5 - Error boundary wrapper for ShareDashboard */}
      <AnimatePresence>
        {isShareOpen && (
          <DashboardErrorBoundary
            componentType="modal"
            errorTitle="Share Feature Temporarily Unavailable"
            errorDescription="We're working on this feature. Please try again later."
            onClose={() => setIsShareOpen(false)}
            showCloseButton={true}
            onError={(error, errorInfo) => {
              console.error('ShareDashboard error:', error, errorInfo)
            }}
          >
            <ShareDashboard
              isOpen={isShareOpen}
              onClose={() => setIsShareOpen(false)}
              dashboard={dashboardData}
              user={user}
            />
          </DashboardErrorBoundary>
        )}
      </AnimatePresence>

      {/* Feature Settings Modal */}
      <AnimatePresence>
        {isFeatureSettingsOpen && (
          <FeatureSettings
            isOpen={isFeatureSettingsOpen}
            onClose={() => setIsFeatureSettingsOpen(false)}
            organizationId={organizationId}
            userId={user?.id}
            onFeaturesUpdated={() => {
              onFeaturesUpdated?.()
              // Refresh the page to apply feature changes
              window.location.reload()
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}