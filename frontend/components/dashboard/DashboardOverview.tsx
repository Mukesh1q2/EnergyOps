'use client'

import { useState, useEffect } from 'react'
import { 
  ChartBarIcon, 
  BoltIcon, 
  CurrencyRupeeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts'

// Mock data - in real app, this would come from API
const mockData = {
  marketPrices: [
    { time: '00:00', price: 4200, volume: 850 },
    { time: '04:00', price: 3800, volume: 720 },
    { time: '08:00', price: 4500, volume: 1200 },
    { time: '12:00', price: 4800, volume: 1350 },
    { time: '16:00', price: 5200, volume: 980 },
    { time: '20:00', price: 4900, volume: 1100 }
  ],
  assetGeneration: [
    { name: 'Solar Farm A', capacity: 250, generation: 180, status: 'online' },
    { name: 'Wind Farm B', capacity: 150, generation: 120, status: 'online' },
    { name: 'Solar Farm C', capacity: 200, generation: 160, status: 'maintenance' },
    { name: 'Wind Farm D', capacity: 100, generation: 85, status: 'online' }
  ],
  bidStats: {
    total: 156,
    accepted: 89,
    pending: 23,
    rejected: 44,
    successRate: 57.1
  },
  revenue: {
    today: 245000,
    month: 7250000,
    change: 12.5
  },
  alerts: [
    { id: 1, type: 'warning', message: 'Wind Farm B efficiency below 70%', time: '10 mins ago' },
    { id: 2, type: 'success', message: 'Solar Farm A exceeded daily target', time: '2 hours ago' },
    { id: 3, type: 'info', message: 'New market price update available', time: '3 hours ago' }
  ]
}

const COLORS = {
  primary: '#0ea5e9',
  secondary: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  gray: '#6b7280'
}

export function DashboardOverview() {
  const [timeRange, setTimeRange] = useState('24h')
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-IN', {
      hour12: true,
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-warning-500" />
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-secondary-500" />
      case 'error':
        return <ExclamationTriangleIcon className="h-5 w-5 text-danger-500" />
      default:
        return <ClockIcon className="h-5 w-5 text-primary-500" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Real-time Status Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 bg-secondary-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Live Data
              </span>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Last updated: {formatTime(currentTime)}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="input py-1 text-sm"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Generation */}
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BoltIcon className="h-8 w-8 text-primary-500" />
              </div>
              <div className="ml-4 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Current Generation
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    545 MW
                  </dd>
                </dl>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <ArrowTrendingUpIcon className="h-4 w-4 text-secondary-500 mr-1" />
              <span className="text-secondary-500 font-medium">+8.2%</span>
              <span className="text-gray-500 ml-1">from yesterday</span>
            </div>
          </div>
        </div>

        {/* Daily Revenue */}
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyRupeeIcon className="h-8 w-8 text-secondary-500" />
              </div>
              <div className="ml-4 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Daily Revenue
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {formatCurrency(mockData.revenue.today)}
                  </dd>
                </dl>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <ArrowTrendingUpIcon className="h-4 w-4 text-secondary-500 mr-1" />
              <span className="text-secondary-500 font-medium">+{mockData.revenue.change}%</span>
              <span className="text-gray-500 ml-1">from last week</span>
            </div>
          </div>
        </div>

        {/* Bid Success Rate */}
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-8 w-8 text-primary-500" />
              </div>
              <div className="ml-4 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Bid Success Rate
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {mockData.bidStats.successRate}%
                  </dd>
                </dl>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <ArrowTrendingDownIcon className="h-4 w-4 text-danger-500 mr-1" />
              <span className="text-danger-500 font-medium">-2.1%</span>
              <span className="text-gray-500 ml-1">from last week</span>
            </div>
          </div>
        </div>

        {/* Active Assets */}
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-secondary-100 dark:bg-secondary-900 rounded-lg flex items-center justify-center">
                  <BoltIcon className="h-5 w-5 text-secondary-500" />
                </div>
              </div>
              <div className="ml-4 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Active Assets
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {mockData.assetGeneration.filter(a => a.status === 'online').length} / {mockData.assetGeneration.length}
                  </dd>
                </dl>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <CheckCircleIcon className="h-4 w-4 text-secondary-500 mr-1" />
              <span className="text-secondary-500 font-medium">75%</span>
              <span className="text-gray-500 ml-1">operational</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Market Price Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Market Prices (INR/MWh)
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Real-time pricing across different time periods
            </p>
          </div>
          <div className="card-body">
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockData.marketPrices}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="time" 
                    className="text-xs"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    className="text-xs"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Price']}
                    labelStyle={{ color: '#374151' }}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke={COLORS.primary} 
                    strokeWidth={2}
                    dot={{ fill: COLORS.primary, strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: COLORS.primary, strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Asset Generation Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Asset Generation Status
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Current vs Capacity by Asset
            </p>
          </div>
          <div className="card-body">
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockData.assetGeneration} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis type="number" className="text-xs" tick={{ fontSize: 12 }} />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    className="text-xs"
                    tick={{ fontSize: 10 }}
                    width={80}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`${value} MW`, '']}
                    labelStyle={{ color: '#374151' }}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px'
                    }}
                  />
                  <Bar dataKey="capacity" fill="#e5e7eb" name="Capacity" />
                  <Bar dataKey="generation" fill={COLORS.primary} name="Generation" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Alerts */}
        <div className="lg:col-span-1">
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Recent Alerts
              </h3>
            </div>
            <div className="card-body">
              <div className="space-y-4">
                {mockData.alerts.map((alert) => (
                  <div key={alert.id} className="flex items-start space-x-3">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 dark:text-white">
                        {alert.message}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {alert.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bid Statistics */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Bidding Performance
              </h3>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {mockData.bidStats.total}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Total Bids
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary-500">
                    {mockData.bidStats.accepted}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Accepted
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-warning-500">
                    {mockData.bidStats.pending}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Pending
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-danger-500">
                    {mockData.bidStats.rejected}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Rejected
                  </div>
                </div>
              </div>
              <div className="chart-container-sm">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Accepted', value: mockData.bidStats.accepted, color: COLORS.secondary },
                        { name: 'Pending', value: mockData.bidStats.pending, color: COLORS.warning },
                        { name: 'Rejected', value: mockData.bidStats.rejected, color: COLORS.danger }
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {[
                        { name: 'Accepted', value: mockData.bidStats.accepted, color: COLORS.secondary },
                        { name: 'Pending', value: mockData.bidStats.pending, color: COLORS.warning },
                        { name: 'Rejected', value: mockData.bidStats.rejected, color: COLORS.danger }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [value, 'Bids']}
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}