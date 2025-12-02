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

// IEX India Live Prices Widget
const IEXIndiaLivePrices = ({ widget }: { widget: any }) => {
  const [data, setData] = useState<any[]>([])
  
  useEffect(() => {
    // Generate realistic IEX India price data
    const generateIEXData = () => {
      const now = new Date()
      return Array.from({ length: 24 }, (_, i) => {
        const time = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000)
        const basePrice = 4.5 + Math.random() * 2 // ₹4.5-6.5 per kWh
        return {
          time: time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          price: parseFloat(basePrice.toFixed(2)),
          volume: Math.floor(5000 + Math.random() * 3000),
          mcp: parseFloat((basePrice - 0.2 + Math.random() * 0.4).toFixed(2))
        }
      })
    }
    setData(generateIEXData())
    const interval = setInterval(() => setData(generateIEXData()), 30000)
    return () => clearInterval(interval)
  }, [])

  const currentPrice = data[data.length - 1]?.price || 5.2
  const priceChange = ((currentPrice - (data[0]?.price || 5.0)) / (data[0]?.price || 5.0) * 100).toFixed(2)

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-2 px-2">
        <div>
          <span className="text-2xl font-bold text-gray-900 dark:text-white">₹{currentPrice}</span>
          <span className="text-sm text-gray-500 ml-1">/kWh</span>
        </div>
        <span className={`text-sm font-medium ${parseFloat(priceChange) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {parseFloat(priceChange) >= 0 ? '↑' : '↓'} {Math.abs(parseFloat(priceChange))}%
        </span>
      </div>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="time" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
            <Tooltip formatter={(value: number) => [`₹${value}`, 'Price']} />
            <Area type="monotone" dataKey="price" stroke="#10b981" fill="#10b98133" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// IEX India Market Volume Widget
const IEXIndiaMarketVolume = ({ widget }: { widget: any }) => {
  const data = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    return {
      day: date.toLocaleDateString('en-IN', { weekday: 'short' }),
      dam: Math.floor(8000 + Math.random() * 4000),
      rtm: Math.floor(2000 + Math.random() * 1500),
      tam: Math.floor(1000 + Math.random() * 800)
    }
  })

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis dataKey="day" tick={{ fontSize: 10 }} />
        <YAxis tick={{ fontSize: 10 }} />
        <Tooltip formatter={(value: number) => [`${value} MWh`, '']} />
        <Legend />
        <Bar dataKey="dam" name="DAM" fill="#3b82f6" />
        <Bar dataKey="rtm" name="RTM" fill="#10b981" />
        <Bar dataKey="tam" name="TAM" fill="#f59e0b" />
      </BarChart>
    </ResponsiveContainer>
  )
}

// IEX India Price Forecast Widget
const IEXIndiaPriceForecast = ({ widget }: { widget: any }) => {
  const data = Array.from({ length: 24 }, (_, i) => {
    const basePrice = 5.0 + Math.sin(i / 4) * 1.5
    return {
      hour: `${i}:00`,
      actual: i < 12 ? parseFloat((basePrice + Math.random() * 0.5).toFixed(2)) : null,
      forecast: parseFloat((basePrice + Math.random() * 0.3).toFixed(2)),
      upper: parseFloat((basePrice + 0.8).toFixed(2)),
      lower: parseFloat((basePrice - 0.5).toFixed(2))
    }
  })

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-4 mb-2 px-2 text-xs">
        <span className="flex items-center"><span className="w-3 h-3 bg-blue-500 rounded mr-1"></span>Actual</span>
        <span className="flex items-center"><span className="w-3 h-3 bg-green-500 rounded mr-1"></span>Forecast</span>
        <span className="text-gray-500">94.2% Accuracy</span>
      </div>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip formatter={(value: number) => value ? [`₹${value}`, ''] : ['N/A', '']} />
            <Area type="monotone" dataKey="upper" stroke="none" fill="#10b98122" />
            <Area type="monotone" dataKey="lower" stroke="none" fill="#ffffff" />
            <Line type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="forecast" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// IEX India Renewable Mix Widget
const IEXIndiaRenewableMix = ({ widget }: { widget: any }) => {
  const data = [
    { name: 'Solar', value: 35, color: '#f59e0b' },
    { name: 'Wind', value: 28, color: '#3b82f6' },
    { name: 'Hydro', value: 22, color: '#06b6d4' },
    { name: 'Biomass', value: 10, color: '#10b981' },
    { name: 'Nuclear', value: 5, color: '#8b5cf6' }
  ]

  return (
    <div className="h-full flex">
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={70}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => [`${value}%`, '']} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="w-24 flex flex-col justify-center text-xs">
        {data.map((item, i) => (
          <div key={i} className="flex items-center mb-1">
            <span className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: item.color }}></span>
            <span className="text-gray-600 dark:text-gray-400">{item.name}: {item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// IEX India Demand-Supply Widget
const IEXIndiaDemandSupply = ({ widget }: { widget: any }) => {
  const data = Array.from({ length: 24 }, (_, i) => {
    const baseDemand = 150000 + Math.sin(i / 4) * 30000
    return {
      hour: `${i}:00`,
      demand: Math.floor(baseDemand + Math.random() * 5000),
      supply: Math.floor(baseDemand + 2000 + Math.random() * 8000),
      surplus: Math.floor(2000 + Math.random() * 5000)
    }
  })

  const currentSurplus = data[data.length - 1]?.surplus || 0
  const surplusPercent = ((currentSurplus / data[data.length - 1]?.demand) * 100).toFixed(1)

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-2 px-2">
        <span className="text-sm text-gray-600 dark:text-gray-400">Grid Status</span>
        <span className={`text-sm font-medium px-2 py-0.5 rounded ${parseFloat(surplusPercent) > 5 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
          {parseFloat(surplusPercent) > 5 ? '✓ Surplus' : '⚠ Tight'} ({surplusPercent}%)
        </span>
      </div>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
            <Tooltip formatter={(value: number) => [`${(value/1000).toFixed(1)}k MW`, '']} />
            <Legend />
            <Area type="monotone" dataKey="demand" name="Demand" stroke="#ef4444" fill="#ef444433" />
            <Area type="monotone" dataKey="supply" name="Supply" stroke="#10b981" fill="#10b98133" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// AI Price Prediction Widget
const AIPricePrediction = ({ widget }: { widget: any }) => {
  const predictions = [
    { period: '1h', price: 5.23, confidence: 96, change: 2.1 },
    { period: '4h', price: 5.45, confidence: 92, change: 6.3 },
    { period: '24h', price: 5.12, confidence: 88, change: -0.2 },
    { period: '7d', price: 5.38, confidence: 78, change: 4.9 }
  ]

  return (
    <div className="h-full p-2">
      <div className="grid grid-cols-2 gap-2 h-full">
        {predictions.map((pred, i) => (
          <div key={i} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 flex flex-col justify-between">
            <div className="text-xs text-gray-500 dark:text-gray-400">{pred.period} Forecast</div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">₹{pred.price}</div>
            <div className="flex justify-between items-center">
              <span className={`text-xs ${pred.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {pred.change >= 0 ? '↑' : '↓'}{Math.abs(pred.change)}%
              </span>
              <span className="text-xs text-blue-500">{pred.confidence}% conf</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Quantum Optimization Widget
const QuantumOptimization = ({ widget }: { widget: any }) => {
  const metrics = [
    { label: 'Portfolio Return', value: '+12.4%', status: 'good' },
    { label: 'Risk Score', value: '0.23', status: 'good' },
    { label: 'Sharpe Ratio', value: '1.85', status: 'good' },
    { label: 'Quantum Speedup', value: '4.7x', status: 'info' }
  ]

  return (
    <div className="h-full p-2">
      <div className="text-xs text-purple-600 dark:text-purple-400 mb-2 flex items-center">
        <span className="w-2 h-2 bg-purple-500 rounded-full mr-1 animate-pulse"></span>
        Quantum Optimizer Active
      </div>
      <div className="space-y-2">
        {metrics.map((m, i) => (
          <div key={i} className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-gray-700">
            <span className="text-sm text-gray-600 dark:text-gray-400">{m.label}</span>
            <span className={`text-sm font-medium ${m.status === 'good' ? 'text-green-600' : 'text-blue-600'}`}>{m.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Real-time Alerts Widget
const RealTimeAlerts = ({ widget }: { widget: any }) => {
  const alerts = [
    { type: 'price', message: 'Price spike detected in Northern region', time: '2m ago', severity: 'warning' },
    { type: 'grid', message: 'Grid frequency stable at 50.02 Hz', time: '5m ago', severity: 'info' },
    { type: 'forecast', message: 'Demand forecast updated for tomorrow', time: '12m ago', severity: 'info' }
  ]

  return (
    <div className="h-full p-2 overflow-y-auto">
      <div className="space-y-2">
        {alerts.map((alert, i) => (
          <div key={i} className={`p-2 rounded-lg text-sm ${
            alert.severity === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-l-2 border-yellow-500' :
            'bg-blue-50 dark:bg-blue-900/20 border-l-2 border-blue-500'
          }`}>
            <div className="font-medium text-gray-900 dark:text-white">{alert.message}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{alert.time}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function WidgetRenderer({ widget, layoutItem, onAction, isViewMode, user }: WidgetRendererProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0) // Key to force re-render on refresh

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)
    
    return () => clearTimeout(timer)
  }, [widget.id])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Increment refresh key to force chart data regeneration
    setRefreshKey(prev => prev + 1)
    // Show spinner for visual feedback
    setTimeout(() => {
      setIsRefreshing(false)
    }, 800)
  }

  const handleAction = (action: string, data?: any) => {
    if (action === 'export') {
      handleExport(data?.format || 'csv')
    } else {
      onAction(action, data)
    }
  }

  const handleExport = (format: 'csv' | 'excel' | 'json') => {
    try {
      const data = generateMockData(widget.type, widget.config)
      
      if (format === 'csv') {
        const csv = convertToCSV(data)
        downloadFile(csv, `${widget.title}.csv`, 'text/csv')
      } else if (format === 'json') {
        const json = JSON.stringify(data, null, 2)
        downloadFile(json, `${widget.title}.json`, 'application/json')
      } else if (format === 'excel') {
        // For Excel, we'll export as CSV for now (can be enhanced with a library like xlsx)
        const csv = convertToCSV(data)
        downloadFile(csv, `${widget.title}.xlsx`, 'text/csv')
      }
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  const convertToCSV = (data: any): string => {
    if (!data || (Array.isArray(data) && data.length === 0)) {
      return 'No data available'
    }

    // Handle array of objects
    if (Array.isArray(data)) {
      const headers = Object.keys(data[0])
      const csvRows = [
        headers.join(','),
        ...data.map((row: any) =>
          headers.map(header => {
            const value = row[header]
            return typeof value === 'string' ? `"${value}"` : value
          }).join(',')
        )
      ]
      return csvRows.join('\n')
    }

    // Handle object (like KPIs)
    if (typeof data === 'object') {
      const rows = Object.entries(data).map(([key, value]: [string, any]) => {
        if (typeof value === 'object') {
          return `${key},${value.current || ''},${value.target || ''},${value.trend || ''}`
        }
        return `${key},${value}`
      })
      return ['Metric,Current,Target,Trend', ...rows].join('\n')
    }

    return String(data)
  }

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
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
      // IEX India Widgets
      case 'iex-india-live-prices':
        return <IEXIndiaLivePrices widget={widget} />
      case 'iex-india-market-volume':
        return <IEXIndiaMarketVolume widget={widget} />
      case 'iex-india-price-forecast':
        return <IEXIndiaPriceForecast widget={widget} />
      case 'iex-india-renewable-mix':
        return <IEXIndiaRenewableMix widget={widget} />
      case 'iex-india-demand-supply':
        return <IEXIndiaDemandSupply widget={widget} />
      // AI & Quantum Widgets
      case 'ai-price-prediction':
        return <AIPricePrediction widget={widget} />
      case 'quantum-optimization':
        return <QuantumOptimization widget={widget} />
      case 'real-time-alerts':
        return <RealTimeAlerts widget={widget} />
      default:
        return (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <div className="text-gray-400 mb-2">📊</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Widget: {widget.type}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Configure in Widget Library
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
                          onClick={() => handleAction('export', { format: 'csv' })}
                          className={clsx(
                            'flex items-center px-4 py-2 text-sm w-full text-left',
                            active && 'bg-gray-100 dark:bg-gray-600',
                            'text-gray-700 dark:text-gray-200'
                          )}
                        >
                          <svg className="mr-3 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Export as CSV
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => handleAction('export', { format: 'json' })}
                          className={clsx(
                            'flex items-center px-4 py-2 text-sm w-full text-left',
                            active && 'bg-gray-100 dark:bg-gray-600',
                            'text-gray-700 dark:text-gray-200'
                          )}
                        >
                          <svg className="mr-3 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Export as JSON
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
          key={`${widget.id}-${refreshKey}`}
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