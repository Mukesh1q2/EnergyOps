'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ChartBarIcon,
  EllipsisVerticalIcon,
  ArrowPathIcon,
  EyeIcon,
  ShareIcon,
  Cog6ToothIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  AdjustmentsHorizontalIcon,
  BoltIcon,
  CurrencyDollarIcon,
  MapIcon,
  CubeIcon,
  PresentationChartLineIcon,
  ClockIcon,
  UsersIcon,
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  ComposedChart
} from 'recharts'
import { Menu, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { clsx } from 'clsx'

interface WidgetRendererProps {
  widget: any
  layoutItem: any
  onAction: (action: string, data?: any) => void
  isViewMode: boolean
  user: any
}

const CHART_COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#f97316', // orange
  '#ec4899', // pink
  '#6366f1'  // indigo
]

// Generate mock data based on widget type and config
const generateMockData = (widgetType: string, config: any) => {
  const now = new Date()
  const dataPoints = 24 // Last 24 hours
  
  switch (widgetType) {
    case 'energy-generation-chart':
      return Array.from({ length: dataPoints }, (_, i) => {
        const time = new Date(now.getTime() - (dataPoints - i - 1) * 60 * 60 * 1000)
        const baseGeneration = config.dataSource === 'solar' ? 200 : 
                              config.dataSource === 'wind' ? 150 : 400
        const variation = Math.sin(i / 3) * 50 + Math.random() * 20
        
        return {
          time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          generation: Math.max(0, baseGeneration + variation),
          capacity: config.dataSource === 'all' ? 600 : baseGeneration + 100
        }
      })
    
    case 'market-prices-widget':
      return Array.from({ length: dataPoints }, (_, i) => {
        const time = new Date(now.getTime() - (dataPoints - i - 1) * 60 * 60 * 1000)
        const basePrice = 45
        const variation = Math.sin(i / 4) * 15 + Math.random() * 10
        
        return {
          time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          price: Math.max(20, basePrice + variation),
          volume: Math.floor(Math.random() * 500) + 200
        }
      })
    
    case 'asset-status-grid':
      const assets = ['Solar Farm A', 'Wind Farm B', 'Solar Farm C', 'Wind Farm D', 'Battery Storage E']
      return assets.map(asset => ({
        name: asset,
        status: Math.random() > 0.8 ? 'maintenance' : 'online',
        generation: Math.floor(Math.random() * 100) + 50,
        capacity: 100,
        efficiency: Math.floor(Math.random() * 30) + 70
      }))
    
    case 'performance-kpis':
      return {
        generation: { current: 545, target: 600, trend: '+8.2%' },
        revenue: { current: 245000, target: 250000, trend: '+12.5%' },
        efficiency: { current: 87.5, target: 90, trend: '+2.1%' },
        availability: { current: 94.2, target: 95, trend: '-0.8%' }
      }
    
    case 'trading-dashboard':
      return {
        totalBids: 156,
        acceptedBids: 89,
        pendingBids: 23,
        rejectedBids: 44,
        successRate: 57.1,
        averagePrice: 48.75,
        volume: 1240
      }
    
    default:
      return []
  }
}

const EnergyGenerationChart = ({ widget }: { widget: any }) => {
  const data = generateMockData(widget.type, widget.config)
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis 
          dataKey="time" 
          className="text-xs"
          tick={{ fontSize: 12 }}
        />
        <YAxis 
          className="text-xs"
          tick={{ fontSize: 12 }}
        />
        <Tooltip 
          formatter={(value: number, name: string) => [`${value} MW`, name === 'generation' ? 'Generation' : 'Capacity']}
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '12px'
          }}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="generation" 
          stroke={CHART_COLORS[0]} 
          strokeWidth={2}
          name="Generation"
        />
        <Line 
          type="monotone" 
          dataKey="capacity" 
          stroke={CHART_COLORS[1]} 
          strokeWidth={2}
          strokeDasharray="5 5"
          name="Capacity"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

const MarketPricesWidget = ({ widget }: { widget: any }) => {
  const data = generateMockData(widget.type, widget.config)
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis 
          dataKey="time" 
          className="text-xs"
          tick={{ fontSize: 12 }}
        />
        <YAxis 
          className="text-xs"
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip 
          formatter={(value: number, name: string) => [
            name === 'price' ? `$${value}` : `${value} MW`,
            name === 'price' ? 'Price' : 'Volume'
          ]}
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '12px'
          }}
        />
        <Area 
          type="monotone" 
          dataKey="price" 
          stroke={CHART_COLORS[2]} 
          fill={CHART_COLORS[2]}
          fillOpacity={0.3}
          name="Price"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

const AssetStatusGrid = ({ widget }: { widget: any }) => {
  const data = generateMockData(widget.type, widget.config)
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
      {data.map((asset: any, index: number) => (
        <div
          key={asset.name}
          className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-900 dark:text-white text-sm">
              {asset.name}
            </h4>
            <span className={clsx(
              'px-2 py-1 text-xs rounded-full',
              asset.status === 'online' 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
            )}>
              {asset.status}
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Generation:</span>
              <span className="font-medium text-gray-900 dark:text-white">{asset.generation} MW</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Efficiency:</span>
              <span className="font-medium text-gray-900 dark:text-white">{asset.efficiency}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${asset.efficiency}%` }}
              ></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

const PerformanceKPIs = ({ widget }: { widget: any }) => {
  const data = generateMockData(widget.type, widget.config)
  
  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      {Object.entries(data).map(([key, kpi]: [string, any], index) => (
        <div key={key} className="text-center">
          <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {key === 'generation' ? `${kpi.current} MW` :
               key === 'revenue' ? `$${(kpi.current / 1000).toFixed(0)}K` :
               `${kpi.current}%`}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </div>
            <div className="mt-2 flex items-center justify-center">
              <span className={clsx(
                'text-sm font-medium',
                kpi.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
              )}>
                {kpi.trend}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

const TradingDashboard = ({ widget }: { widget: any }) => {
  const data = generateMockData(widget.type, widget.config)
  
  const pieData = [
    { name: 'Accepted', value: data.acceptedBids, color: CHART_COLORS[0] },
    { name: 'Pending', value: data.pendingBids, color: CHART_COLORS[2] },
    { name: 'Rejected', value: data.rejectedBids, color: CHART_COLORS[3] }
  ]
  
  return (
    <div className="p-4 space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {data.totalBids}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Bids</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {data.successRate}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            ${data.averagePrice}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Avg Price</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {data.volume}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Volume</div>
        </div>
      </div>
      
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              outerRadius={60}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

const TeamActivityFeed = ({ widget }: { widget: any }) => {
  const activities = [
    { user: 'John Doe', action: 'commented on', target: 'Wind Farm B widget', time: '2 minutes ago' },
    { user: 'Sarah Wilson', action: 'shared', target: 'Market Analysis dashboard', time: '15 minutes ago' },
    { user: 'Mike Chen', action: 'updated', target: 'Solar Generation KPI', time: '1 hour ago' },
    { user: 'Emily Davis', action: 'created', target: 'Energy Efficiency Report', time: '2 hours ago' }
  ]
  
  return (
    <div className="p-4 space-y-4 max-h-64 overflow-y-auto">
      {activities.map((activity, index) => (
        <div key={index} className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <span className="text-blue-600 dark:text-blue-300 text-sm font-medium">
                {activity.user.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-900 dark:text-white">
              <span className="font-medium">{activity.user}</span> {activity.action}{' '}
              <span className="font-medium">{activity.target}</span>
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {activity.time}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

const ComplianceReport = ({ widget }: { widget: any }) => {
  const metrics = [
    { name: 'RECs Generated', value: 1250, target: 1200, status: 'good' },
    { name: 'Carbon Offset', value: 850, target: 900, status: 'warning' },
    { name: 'Grid Stability Score', value: 94.5, target: 95, status: 'good' },
    { name: 'Regulatory Compliance', value: 98.2, target: 98, status: 'good' }
  ]
  
  return (
    <div className="p-4 space-y-4">
      {metrics.map((metric, index) => (
        <div key={index} className="border-b border-gray-200 dark:border-gray-600 pb-3 last:border-b-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {metric.name}
            </span>
            <span className={clsx(
              'text-sm font-medium',
              metric.status === 'good' ? 'text-green-600' : 'text-yellow-600'
            )}>
              {metric.value}
              {metric.name.includes('Score') || metric.name.includes('Compliance') ? '%' : ''}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
            <div
              className={clsx(
                'h-2 rounded-full',
                metric.status === 'good' ? 'bg-green-600' : 'bg-yellow-600'
              )}
              style={{ 
                width: `${Math.min(100, (metric.value / metric.target) * 100)}%` 
              }}
            ></div>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Target: {metric.target}
            {metric.name.includes('Score') || metric.name.includes('Compliance') ? '%' : ''}
          </div>
        </div>
      ))}
    </div>
  )
}

const GeographicMap = ({ widget }: { widget: any }) => {
  const assets = [
    { name: 'Solar Farm A', lat: 40.7128, lng: -74.0060, status: 'online', capacity: 250 },
    { name: 'Wind Farm B', lat: 34.0522, lng: -118.2437, status: 'online', capacity: 150 },
    { name: 'Solar Farm C', lat: 41.8781, lng: -87.6298, status: 'maintenance', capacity: 200 },
    { name: 'Wind Farm D', lat: 29.7604, lng: -95.3698, status: 'online', capacity: 100 }
  ]
  
  return (
    <div className="relative w-full h-full bg-gray-100 dark:bg-gray-700 rounded-lg">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-green-100 dark:from-gray-600 dark:to-gray-500">
        <div className="absolute inset-0 opacity-20">
          {/* Simulated map background */}
          <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <div className="absolute top-1/2 right-1/4 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <div className="absolute bottom-1/3 left-1/2 w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/3 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
        </div>
      </div>
      <div className="absolute top-4 left-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-lg">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Asset Locations
          </h4>
          <div className="space-y-2">
            {assets.map((asset, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className={clsx(
                  'w-2 h-2 rounded-full',
                  asset.status === 'online' ? 'bg-green-500' : 'bg-yellow-500'
                )}></div>
                <span className="text-xs text-gray-600 dark:text-gray-300">
                  {asset.name} ({asset.capacity} MW)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function WidgetRenderer({ widget, layoutItem, onAction, isViewMode, user }: WidgetRendererProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)
    
    return () => clearTimeout(timer)
  }, [widget.id])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate refresh
    setTimeout(() => {
      setIsRefreshing(false)
    }, 1000)
  }

  const handleAction = (action: string, data?: any) => {
    onAction(action, data)
  }

  const renderWidgetContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-full text-center">
          <div>
            <div className="text-red-500 mb-2">⚠</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{error}</p>
          </div>
        </div>
      )
    }

    switch (widget.type) {
      case 'energy-generation-chart':
        return <EnergyGenerationChart widget={widget} />
      case 'market-prices-widget':
        return <MarketPricesWidget widget={widget} />
      case 'asset-status-grid':
        return <AssetStatusGrid widget={widget} />
      case 'performance-kpis':
        return <PerformanceKPIs widget={widget} />
      case 'trading-dashboard':
        return <TradingDashboard widget={widget} />
      case 'team-activity-feed':
        return <TeamActivityFeed widget={widget} />
      case 'compliance-report':
        return <ComplianceReport widget={widget} />
      case 'geographic-map':
        return <GeographicMap widget={widget} />
      default:
        return (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <div className="text-gray-400 mb-2">📊</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Widget rendering not implemented
              </p>
            </div>
          </div>
        )
    }
  }

  const getWidgetIcon = () => {
    const iconMap: { [key: string]: any } = {
      'energy-generation-chart': BoltIcon,
      'market-prices-widget': CurrencyDollarIcon,
      'asset-status-grid': CubeIcon,
      'performance-kpis': PresentationChartLineIcon,
      'trading-dashboard': ChartBarIcon,
      'team-activity-feed': ChatBubbleLeftRightIcon,
      'compliance-report': ShieldCheckIcon,
      'geographic-map': MapIcon
    }
    
    const IconComponent = iconMap[widget.type] || CubeIcon
    return <IconComponent className="h-5 w-5" />
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm h-full flex flex-col">
      {/* Widget Header */}
      {!isViewMode && (
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center space-x-2">
            {getWidgetIcon()}
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              {widget.title}
            </h3>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-50"
              title="Refresh widget"
            >
              <ArrowPathIcon className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            
            <Menu as="div" className="relative">
              <Menu.Button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <EllipsisVerticalIcon className="h-4 w-4" />
              </Menu.Button>
              
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-gray-700 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => handleAction('configure')}
                          className={clsx(
                            'flex items-center px-4 py-2 text-sm w-full text-left',
                            active && 'bg-gray-100 dark:bg-gray-600',
                            'text-gray-700 dark:text-gray-200'
                          )}
                        >
                          <Cog6ToothIcon className="mr-3 h-4 w-4" />
                          Configure
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => handleAction('share')}
                          className={clsx(
                            'flex items-center px-4 py-2 text-sm w-full text-left',
                            active && 'bg-gray-100 dark:bg-gray-600',
                            'text-gray-700 dark:text-gray-200'
                          )}
                        >
                          <ShareIcon className="mr-3 h-4 w-4" />
                          Share
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => handleAction('duplicate')}
                          className={clsx(
                            'flex items-center px-4 py-2 text-sm w-full text-left',
                            active && 'bg-gray-100 dark:bg-gray-600',
                            'text-gray-700 dark:text-gray-200'
                          )}
                        >
                          <DocumentDuplicateIcon className="mr-3 h-4 w-4" />
                          Duplicate
                        </button>
                      )}
                    </Menu.Item>
                    <div className="border-t border-gray-200 dark:border-gray-600 my-1"></div>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => handleAction('delete')}
                          className={clsx(
                            'flex items-center px-4 py-2 text-sm w-full text-left',
                            active && 'bg-gray-100 dark:bg-gray-600',
                            'text-red-600 dark:text-red-400'
                          )}
                        >
                          <TrashIcon className="mr-3 h-4 w-4" />
                          Delete
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
      )}

      {/* Widget Content */}
      <div className="flex-1 overflow-hidden">
        <motion.div
          key={widget.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="h-full"
        >
          {renderWidgetContent()}
        </motion.div>
      </div>

      {/* Widget Footer (for some widgets) */}
      {widget.type === 'trading-dashboard' && (
        <div className="p-2 border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Live</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}