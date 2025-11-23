'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  XMarkIcon,
  ChartBarIcon,
  MapIcon,
  TableCellsIcon,
  PresentationChartLineIcon,
  FunnelIcon,
  BoltIcon,
  CurrencyDollarIcon,
  UsersIcon,
  ClockIcon,
  GlobeAltIcon,
  ArrowTrendingUpIcon,
  CubeIcon,
  ShieldCheckIcon,
  DocumentChartBarIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline'
import { Dialog, Transition, Tab } from '@headlessui/react'
import { Fragment } from 'react'
import { clsx } from 'clsx'

interface Widget {
  id: string
  name: string
  description: string
  category: string
  icon: any
  preview: string
  configSchema: any
  permissions: string[]
  isCustom?: boolean
  tags: string[]
  popularity: number
  lastUpdated: string
}

interface WidgetLibraryProps {
  isOpen: boolean
  onClose: () => void
  onWidgetAdd: (widgetConfig: any) => void
  userPermissions: string[]
}

const WIDGET_CATEGORIES = [
  { id: 'analytics', name: 'Analytics & Charts', icon: ChartBarIcon, color: 'blue' },
  { id: 'metrics', name: 'KPI Metrics', icon: CubeIcon, color: 'green' },
  { id: 'real-time', name: 'Real-time Data', icon: ClockIcon, color: 'red' },
  { id: 'geographic', name: 'Geographic', icon: MapIcon, color: 'purple' },
  { id: 'financial', name: 'Financial', icon: CurrencyDollarIcon, color: 'yellow' },
  { id: 'team', name: 'Team & Collaboration', icon: UsersIcon, color: 'indigo' },
  { id: 'reports', name: 'Reports', icon: DocumentChartBarIcon, color: 'gray' },
  { id: 'energy', name: 'Energy Specific', icon: BoltIcon, color: 'emerald' }
]

const AVAILABLE_WIDGETS: Widget[] = [
  {
    id: 'energy-generation-chart',
    name: 'Energy Generation Chart',
    description: 'Track energy generation across different assets with time-series visualization',
    category: 'energy',
    icon: BoltIcon,
    preview: 'chart-line',
    configSchema: {
      dataSource: { type: 'select', options: ['solar', 'wind', 'hydro', 'all'] },
      timeRange: { type: 'select', options: ['1h', '24h', '7d', '30d'] },
      aggregation: { type: 'select', options: ['sum', 'average', 'max', 'min'] }
    },
    permissions: ['view-energy-data'],
    tags: ['energy', 'generation', 'renewable'],
    popularity: 95,
    lastUpdated: '2024-01-15'
  },
  {
    id: 'market-prices-widget',
    name: 'Market Prices Tracker',
    description: 'Real-time electricity market prices with trend analysis',
    category: 'financial',
    icon: CurrencyDollarIcon,
    preview: 'chart-area',
    configSchema: {
      marketZone: { type: 'select', options: ['PJM', 'CAISO', 'ERCOT', 'NYISO'] },
      priceType: { type: 'select', options: ['LMP', 'Energy', 'Capacity'] },
      showTrend: { type: 'boolean' }
    },
    permissions: ['view-market-data'],
    tags: ['market', 'prices', 'trading'],
    popularity: 88,
    lastUpdated: '2024-01-20'
  },
  {
    id: 'asset-status-grid',
    name: 'Asset Status Grid',
    description: 'Visual grid showing status of all energy assets with real-time updates',
    category: 'energy',
    icon: CubeIcon,
    preview: 'grid',
    configSchema: {
      assetTypes: { type: 'multiselect', options: ['solar', 'wind', 'battery', 'thermal'] },
      showMetrics: { type: 'boolean' },
      refreshInterval: { type: 'select', options: ['30s', '1m', '5m'] }
    },
    permissions: ['view-asset-data'],
    tags: ['assets', 'status', 'grid'],
    popularity: 92,
    lastUpdated: '2024-01-18'
  },
  {
    id: 'performance-kpis',
    name: 'Performance KPIs',
    description: 'Key performance indicators with targets and current values',
    category: 'metrics',
    icon: PresentationChartLineIcon,
    preview: 'kpi-cards',
    configSchema: {
      kpiType: { type: 'select', options: ['generation', 'revenue', 'efficiency', 'all'] },
      comparisonPeriod: { type: 'select', options: ['previous-period', 'target', 'industry'] }
    },
    permissions: ['view-kpis'],
    tags: ['kpi', 'performance', 'targets'],
    popularity: 85,
    lastUpdated: '2024-01-12'
  },
  {
    id: 'geographic-map',
    name: 'Geographic Asset Map',
    description: 'Interactive map showing asset locations with real-time status',
    category: 'geographic',
    icon: MapIcon,
    preview: 'map',
    configSchema: {
      mapType: { type: 'select', options: ['satellite', 'terrain', 'street'] },
      showClusters: { type: 'boolean' },
      highlightBy: { type: 'select', options: ['status', 'capacity', 'generation'] }
    },
    permissions: ['view-geographic-data'],
    tags: ['map', 'geographic', 'assets'],
    popularity: 76,
    lastUpdated: '2024-01-10'
  },
  {
    id: 'trading-dashboard',
    name: 'Trading Dashboard',
    description: 'Comprehensive trading interface with bid tracking and market analysis',
    category: 'financial',
    icon: ArrowTrendingUpIcon,
    preview: 'trading',
    configSchema: {
      marketZone: { type: 'select', options: ['PJM', 'CAISO', 'ERCOT', 'NYISO', 'MISO'] },
      showOrders: { type: 'boolean' },
      timeHorizon: { type: 'select', options: ['day-ahead', 'real-time', 'ancillary'] }
    },
    permissions: ['view-trading-data'],
    tags: ['trading', 'bids', 'market'],
    popularity: 82,
    lastUpdated: '2024-01-22'
  },
  {
    id: 'team-activity-feed',
    name: 'Team Activity Feed',
    description: 'Real-time feed of team member activities and collaborations',
    category: 'team',
    icon: ChatBubbleLeftRightIcon,
    preview: 'activity',
    configSchema: {
      teamMembers: { type: 'multiselect', options: [] },
      activityTypes: { type: 'multiselect', options: ['comments', 'edits', 'shares', 'all'] }
    },
    permissions: ['view-team-data'],
    tags: ['team', 'activity', 'collaboration'],
    popularity: 68,
    lastUpdated: '2024-01-08'
  },
  {
    id: 'compliance-report',
    name: 'Compliance Report',
    description: 'Generate compliance reports for regulatory requirements',
    category: 'reports',
    icon: ShieldCheckIcon,
    preview: 'report',
    configSchema: {
      reportType: { type: 'select', options: ['monthly', 'quarterly', 'annual'] },
      includeCharts: { type: 'boolean' },
      format: { type: 'select', options: ['pdf', 'excel', 'both'] }
    },
    permissions: ['view-reports'],
    tags: ['compliance', 'reports', 'regulatory'],
    popularity: 74,
    lastUpdated: '2024-01-14'
  }
]

export function WidgetLibrary({ isOpen, onClose, onWidgetAdd, userPermissions }: WidgetLibraryProps) {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [widgets, setWidgets] = useState<Widget[]>(AVAILABLE_WIDGETS)
  const [filteredWidgets, setFilteredWidgets] = useState<Widget[]>(AVAILABLE_WIDGETS)
  const [showConfigPanel, setShowConfigPanel] = useState(false)
  const [selectedWidget, setSelectedWidget] = useState<Widget | null>(null)
  const [widgetConfig, setWidgetConfig] = useState<any>({})
  const [sortBy, setSortBy] = useState<'popularity' | 'name' | 'recent'>('popularity')

  useEffect(() => {
    filterAndSortWidgets()
  }, [selectedCategory, searchQuery, sortBy])

  const filterAndSortWidgets = () => {
    let filtered = widgets

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(widget => widget.category === selectedCategory)
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(widget =>
        widget.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        widget.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        widget.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Filter by user permissions
    filtered = filtered.filter(widget =>
      widget.permissions.some(permission => userPermissions.includes(permission))
    )

    // Sort widgets
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popularity':
          return b.popularity - a.popularity
        case 'name':
          return a.name.localeCompare(b.name)
        case 'recent':
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
        default:
          return 0
      }
    })

    setFilteredWidgets(filtered)
  }

  const handleWidgetSelect = (widget: Widget) => {
    setSelectedWidget(widget)
    // Initialize config with default values
    const defaultConfig: any = {}
    Object.entries(widget.configSchema).forEach(([key, schema]: [string, any]) => {
      switch (schema.type) {
        case 'boolean':
          defaultConfig[key] = false
          break
        case 'select':
          defaultConfig[key] = schema.options[0]
          break
        case 'multiselect':
          defaultConfig[key] = []
          break
        default:
          defaultConfig[key] = ''
      }
    })
    setWidgetConfig(defaultConfig)
    setShowConfigPanel(true)
  }

  const handleConfigChange = (key: string, value: any) => {
    setWidgetConfig(prev => ({ ...prev, [key]: value }))
  }

  const handleAddWidget = () => {
    if (selectedWidget) {
      const newWidget = {
        id: `${selectedWidget.id}-${Date.now()}`,
        type: selectedWidget.id,
        title: selectedWidget.name,
        position: { x: 0, y: 0, w: 4, h: 4 },
        config: widgetConfig,
        permissions: selectedWidget.permissions
      }
      
      onWidgetAdd(newWidget)
      setShowConfigPanel(false)
      setSelectedWidget(null)
      onClose()
    }
  }

  const renderConfigField = (key: string, schema: any) => {
    switch (schema.type) {
      case 'boolean':
        return (
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={widgetConfig[key] || false}
              onChange={(e) => handleConfigChange(key, e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">{key}</span>
          </label>
        )
      
      case 'select':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 capitalize">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </label>
            <select
              value={widgetConfig[key] || ''}
              onChange={(e) => handleConfigChange(key, e.target.value)}
              className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
            >
              {schema.options.map((option: string) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        )
      
      case 'multiselect':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 capitalize">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {schema.options.map((option: string) => (
                <label key={option} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={widgetConfig[key]?.includes(option) || false}
                    onChange={(e) => {
                      const current = widgetConfig[key] || []
                      if (e.target.checked) {
                        handleConfigChange(key, [...current, option])
                      } else {
                        handleConfigChange(key, current.filter((item: string) => item !== option))
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{option}</span>
                </label>
              ))}
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-6xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 text-left align-middle shadow-xl transition-all">
                <div className="flex h-[80vh]">
                  {/* Main Widget Library */}
                  <div className={`flex-1 flex flex-col ${showConfigPanel ? 'w-2/3' : 'w-full'}`}>
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                      <div>
                        <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-white">
                          Widget Library
                        </Dialog.Title>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Add powerful widgets to enhance your dashboard
                        </p>
                      </div>
                      <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                      >
                        <XMarkIcon className="h-6 w-6" />
                      </button>
                    </div>

                    {/* Search and Filters */}
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="flex-1 relative">
                          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search widgets..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value as any)}
                          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="popularity">Most Popular</option>
                          <option value="name">Name</option>
                          <option value="recent">Recently Updated</option>
                        </select>
                      </div>

                      {/* Category Tabs */}
                      <div className="flex space-x-1 overflow-x-auto">
                        <button
                          onClick={() => setSelectedCategory('all')}
                          className={clsx(
                            'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                            selectedCategory === 'all'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                              : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                          )}
                        >
                          All Widgets
                        </button>
                        {WIDGET_CATEGORIES.map((category) => (
                          <button
                            key={category.id}
                            onClick={() => setSelectedCategory(category.id)}
                            className={clsx(
                              'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                              selectedCategory === category.id
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                            )}
                          >
                            {category.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Widget Grid */}
                    <div className="flex-1 overflow-y-auto p-6">
                      {filteredWidgets.length === 0 ? (
                        <div className="text-center py-12">
                          <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
                          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                            No widgets found
                          </h3>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Try adjusting your search or filter criteria.
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {filteredWidgets.map((widget) => (
                            <motion.div
                              key={widget.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
                              onClick={() => handleWidgetSelect(widget)}
                            >
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center">
                                  <widget.icon className="h-8 w-8 text-blue-500 mr-3" />
                                  <div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                      {widget.name}
                                    </h3>
                                    <div className="flex items-center mt-1">
                                      <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">
                                        {WIDGET_CATEGORIES.find(c => c.id === widget.category)?.name}
                                      </span>
                                      <div className="flex items-center">
                                        <span className="text-xs text-yellow-500 mr-1">★</span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                          {widget.popularity}%
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                                {widget.description}
                              </p>
                              
                              <div className="flex flex-wrap gap-2 mb-4">
                                {widget.tags.slice(0, 3).map((tag) => (
                                  <span
                                    key={tag}
                                    className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  Updated {new Date(widget.lastUpdated).toLocaleDateString()}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleWidgetSelect(widget)
                                  }}
                                  className="flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                >
                                  <PlusIcon className="h-4 w-4 mr-1" />
                                  Add
                                </button>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Configuration Panel */}
                  <AnimatePresence>
                    {showConfigPanel && selectedWidget && (
                      <motion.div
                        initial={{ x: 300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 300, opacity: 0 }}
                        className="w-1/3 border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-6"
                      >
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            Configure Widget
                          </h3>
                          <button
                            onClick={() => setShowConfigPanel(false)}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                          >
                            <XMarkIcon className="h-5 w-5" />
                          </button>
                        </div>

                        <div className="space-y-6">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                              {selectedWidget.name}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {selectedWidget.description}
                            </p>
                          </div>

                          <div className="space-y-4">
                            {Object.entries(selectedWidget.configSchema).map(([key, schema]) => (
                              <div key={key}>
                                {renderConfigField(key, schema)}
                              </div>
                            ))}
                          </div>

                          <div className="pt-6 border-t border-gray-200 dark:border-gray-600">
                            <button
                              onClick={handleAddWidget}
                              className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              <PlusIcon className="h-4 w-4 mr-2" />
                              Add Widget
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}