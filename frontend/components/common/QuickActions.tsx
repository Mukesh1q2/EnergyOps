'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  PlusIcon,
  ChartBarIcon,
  BoltIcon,
  DocumentArrowDownIcon,
  Cog6ToothIcon,
  BellIcon,
  PlayIcon,
  PauseIcon,
  ArrowPathIcon,
  LightBulbIcon,
  CurrencyRupeeIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'

interface QuickAction {
  id: string
  title: string
  description: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  href: string
  color: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger'
  requiresPermission?: string
}

const quickActions: QuickAction[] = [
  {
    id: 'create-bid',
    title: 'Create New Bid',
    description: 'Submit a new bid to the market',
    icon: PlusIcon,
    href: '/bidding/create',
    color: 'primary'
  },
  {
    id: 'view-market',
    title: 'View Market Data',
    description: 'Monitor real-time market prices',
    icon: ChartBarIcon,
    href: '/market',
    color: 'secondary'
  },
  {
    id: 'asset-status',
    title: 'Asset Status',
    description: 'Check all asset operational status',
    icon: BoltIcon,
    href: '/assets',
    color: 'accent'
  },
  {
    id: 'generate-report',
    title: 'Generate Report',
    description: 'Create performance reports',
    icon: DocumentArrowDownIcon,
    href: '/reports/custom',
    color: 'success'
  },
  {
    id: 'optimization',
    title: 'Run Optimization',
    description: 'AI-powered bid optimization',
    icon: LightBulbIcon,
    href: '/optimization/bids',
    color: 'warning'
  },
  {
    id: 'settings',
    title: 'Settings',
    description: 'Configure system preferences',
    icon: Cog6ToothIcon,
    href: '/settings',
    color: 'secondary'
  }
]

const statusActions = [
  {
    id: 'start-all',
    title: 'Start All Assets',
    description: 'Resume operations for all assets',
    icon: PlayIcon,
    action: 'start_all_assets',
    color: 'success'
  },
  {
    id: 'stop-all',
    title: 'Stop All Assets',
    description: 'Pause operations for all assets',
    icon: PauseIcon,
    action: 'stop_all_assets',
    color: 'danger'
  },
  {
    id: 'refresh-data',
    title: 'Refresh Data',
    description: 'Update all market data',
    icon: ArrowPathIcon,
    action: 'refresh_market_data',
    color: 'accent'
  },
  {
    id: 'view-alerts',
    title: 'View Alerts',
    description: 'Check system notifications',
    icon: BellIcon,
    href: '/alerts',
    color: 'warning'
  }
]

const colorClasses = {
  primary: 'bg-primary-50 text-primary-600 hover:bg-primary-100 dark:bg-primary-900/20 dark:text-primary-400 dark:hover:bg-primary-900/30 border-primary-200 dark:border-primary-800',
  secondary: 'bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700',
  accent: 'bg-purple-50 text-purple-600 hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:hover:bg-purple-900/30 border-purple-200 dark:border-purple-800',
  success: 'bg-secondary-50 text-secondary-600 hover:bg-secondary-100 dark:bg-secondary-900/20 dark:text-secondary-400 dark:hover:bg-secondary-900/30 border-secondary-200 dark:border-secondary-800',
  warning: 'bg-accent-50 text-accent-600 hover:bg-accent-100 dark:bg-accent-900/20 dark:text-accent-400 dark:hover:bg-accent-900/30 border-accent-200 dark:border-accent-800',
  danger: 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 border-red-200 dark:border-red-800'
}

export function QuickActions() {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})

  const handleQuickAction = async (actionId: string, action?: string) => {
    if (action) {
      setLoadingStates(prev => ({ ...prev, [actionId]: true }))
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Handle different actions
        switch (action) {
          case 'start_all_assets':
            console.log('Starting all assets...')
            break
          case 'stop_all_assets':
            console.log('Stopping all assets...')
            break
          case 'refresh_market_data':
            console.log('Refreshing market data...')
            break
          default:
            console.log('Unknown action:', action)
        }
      } catch (error) {
        console.error('Action failed:', error)
      } finally {
        setLoadingStates(prev => ({ ...prev, [actionId]: false }))
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Quick Actions Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Quick Actions
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Common tasks and shortcuts
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Last updated: {new Date().toLocaleTimeString()}
          </span>
          <button
            onClick={() => handleQuickAction('refresh', 'refresh_market_data')}
            className="p-1 rounded-md text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            disabled={loadingStates.refresh}
          >
            <ArrowPathIcon 
              className={`h-4 w-4 ${loadingStates.refresh ? 'animate-spin' : ''}`} 
            />
          </button>
        </div>
      </div>

      {/* Main Quick Actions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {quickActions.map((action) => {
          const Icon = action.icon
          return (
            <Link
              key={action.id}
              href={action.href}
              className={`
                relative p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md
                ${colorClasses[action.color]}
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
                group
              `}
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm group-hover:shadow-md transition-shadow duration-200">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-sm font-medium">
                    {action.title}
                  </h3>
                  <p className="text-xs opacity-75 mt-1">
                    {action.description}
                  </p>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* System Control Actions */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            System Controls
          </h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Operational controls
          </span>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statusActions.map((action) => {
            const Icon = action.icon
            const isLoading = loadingStates[action.id]
            
            if (action.href) {
              return (
                <Link
                  key={action.id}
                  href={action.href}
                  className={`
                    relative p-3 rounded-lg border-2 transition-all duration-200 hover:shadow-sm
                    ${colorClasses[action.color]}
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
                    group
                  `}
                >
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="p-1.5 rounded-md bg-white dark:bg-gray-800 shadow-sm">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-medium">
                        {action.title}
                      </h4>
                      <p className="text-xs opacity-75 mt-0.5">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </Link>
              )
            }

            return (
              <button
                key={action.id}
                onClick={() => handleQuickAction(action.id, action.action)}
                disabled={isLoading}
                className={`
                  relative p-3 rounded-lg border-2 transition-all duration-200 hover:shadow-sm
                  ${colorClasses[action.color]}
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
                  group disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="p-1.5 rounded-md bg-white dark:bg-gray-800 shadow-sm">
                    {isLoading ? (
                      <ArrowPathIcon className="h-5 w-5 animate-spin" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-medium">
                      {action.title}
                    </h4>
                    <p className="text-xs opacity-75 mt-0.5">
                      {action.description}
                    </p>
                  </div>
                </div>
                {isLoading && (
                  <div className="absolute inset-0 bg-white/50 dark:bg-gray-800/50 rounded-lg flex items-center justify-center">
                    <div className="text-xs text-gray-600 dark:text-gray-300">
                      Processing...
                    </div>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Recent Activity Summary */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Recent Activity
          </h3>
          <Link
            href="/activity"
            className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
          >
            View all
          </Link>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-secondary-500 rounded-full"></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  New bid submitted for Solar Farm A
                </span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                5 min ago
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-primary-500 rounded-full"></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Market data updated
                </span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                12 min ago
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-accent-500 rounded-full"></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Wind Farm B efficiency optimization completed
                </span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                1 hour ago
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}