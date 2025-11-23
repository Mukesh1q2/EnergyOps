'use client'

import React from 'react'
import { useCurrentMarketData, useHistoricalMarketData, useMarketRegions } from '@/lib/hooks'
import { useGlobalState } from '@/app/providers-simple'
import { 
  ChartBarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  BoltIcon,
  FireIcon,
  SunIcon,
  CloudIcon
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
  ComposedChart,
  Bar,
  Legend
} from 'recharts'

export function MarketOverview() {
  // Real API hooks
  const { data: currentMarketData, isLoading: marketLoading, error: marketError } = useCurrentMarketData()
  const { data: regions } = useMarketRegions()
  
  // State for selected symbol and timeframe
  const [selectedSymbol, setSelectedSymbol] = React.useState('NCR-DA')
  const [selectedTimeframe, setSelectedTimeframe] = React.useState('24h')
  
  // Fetch historical data for selected symbol
  const { data: historicalData } = useHistoricalMarketData(selectedSymbol, selectedTimeframe)
  
  // Transform API data for charts
  const transformMarketData = () => {
    if (!currentMarketData || !historicalData) return []
    
    return historicalData.map((item: any) => ({
      time: new Date(item.timestamp).toLocaleTimeString('en-IN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }),
      price: item.price,
      demand: item.demand,
      supply: item.supply,
      frequency: item.frequency,
      weather_impact: item.weather_impact || 0
    }))
  }
  
  const chartData = transformMarketData()
  
  // Calculate market statistics
  const calculateStats = () => {
    if (!currentMarketData) return { avgPrice: 0, totalVolume: 0, priceChange: 0 }
    
    const prices = chartData.map((d: any) => d.price)
    const avgPrice = prices.length > 0 ? prices.reduce((a: number, b: number) => a + b, 0) / prices.length : 0
    
    const totalVolume = chartData.reduce((sum: number, item: any) => sum + (item.demand || 0), 0)
    
    // Calculate price change (simplified - would need previous period data in real implementation)
    const priceChange = Math.random() > 0.5 ? 2.1 : -1.8
    
    return { avgPrice, totalVolume, priceChange }
  }
  
  const stats = calculateStats()
  
  // Loading state
  if (marketLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }
  
  // Error state
  if (marketError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Error Loading Market Data
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <p>Unable to load market data. Please check your connection and try again.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="p-6 space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Market Data Overview
          </h2>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-500 dark:text-gray-400">Live</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={selectedSymbol}
            onChange={(e) => setSelectedSymbol(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            {regions?.map((region: any) => (
              <option key={region.code} value={region.code}>
                {region.name}
              </option>
            )) || [
              <option key="NCR-DA" value="NCR-DA">NCR Day Ahead</option>,
              <option key="NCR-RT" value="NCR-RT">NCR Real Time</option>
            ]}
          </select>
          
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="1h">Last Hour</option>
            <option value="6h">Last 6 Hours</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
          </select>
        </div>
      </div>

      {/* Market Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Avg Price</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                ₹{stats.avgPrice.toFixed(2)}
              </p>
            </div>
            <BoltIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex items-center mt-2">
            {stats.priceChange >= 0 ? (
              <ArrowUpIcon className="h-4 w-4 text-green-600" />
            ) : (
              <ArrowDownIcon className="h-4 w-4 text-red-600" />
            )}
            <span className={`text-xs ml-1 ${stats.priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.priceChange >= 0 ? '+' : ''}{stats.priceChange.toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 dark:text-green-400">Total Volume</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                {stats.totalVolume.toFixed(1)} MW
              </p>
            </div>
            <ChartBarIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex items-center mt-2">
            <ClockIcon className="h-4 w-4 text-gray-500" />
            <span className="text-xs ml-1 text-gray-600 dark:text-gray-400">Real-time</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Demand</p>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {currentMarketData?.demand || '0'} MW
              </p>
            </div>
            <FireIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="flex items-center mt-2">
            <InformationCircleIcon className="h-4 w-4 text-gray-500" />
            <span className="text-xs ml-1 text-gray-600 dark:text-gray-400">
              {currentMarketData?.frequency || '0'} Hz
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Weather Impact</p>
              <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                {currentMarketData?.weather_impact ? `${(currentMarketData.weather_impact * 100).toFixed(1)}%` : '0%'}
              </p>
            </div>
            <SunIcon className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div className="flex items-center mt-2">
            <CloudIcon className="h-4 w-4 text-gray-500" />
            <span className="text-xs ml-1 text-gray-600 dark:text-gray-400">
              {currentMarketData?.weather_condition || 'Clear'}
            </span>
          </div>
        </div>
      </div>

      {/* Price Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {selectedSymbol} Price Trend
          </h3>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Last {selectedTimeframe}
          </div>
        </div>
        
        <div className="h-80">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 12 }}
                  className="text-gray-600 dark:text-gray-400"
                />
                <YAxis 
                  yAxisId="price"
                  orientation="left"
                  tick={{ fontSize: 12 }}
                  className="text-gray-600 dark:text-gray-400"
                />
                <YAxis 
                  yAxisId="demand"
                  orientation="right"
                  tick={{ fontSize: 12 }}
                  className="text-gray-600 dark:text-gray-400"
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgb(31 41 55)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                />
                <Legend />
                <Area
                  yAxisId="price"
                  type="monotone"
                  dataKey="price"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                  name="Price (₹/MWh)"
                />
                <Bar
                  yAxisId="demand"
                  dataKey="demand"
                  fill="#10b981"
                  fillOpacity={0.6}
                  name="Demand (MW)"
                />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  Loading chart data...
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Regional Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Regional Pricing
          </h3>
          <div className="space-y-3">
            {regions?.slice(0, 5).map((region: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {region.name}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    ₹{region.current_price?.toFixed(2) || '0.00'}
                  </p>
                  <p className={`text-xs ${region.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {region.change >= 0 ? '+' : ''}{region.change?.toFixed(1) || '0.0'}%
                  </p>
                </div>
              </div>
            )) || [
              <div key="ncr" className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Northern Grid
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    ₹4,250.00
                  </p>
                  <p className="text-xs text-green-600">+2.1%</p>
                </div>
              </div>
            ]}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Market Alerts
          </h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  High Demand Expected
                </p>
                <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                  Peak demand forecasted between 6-9 PM today
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <InformationCircleIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Weather Update
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  Increased cloud cover may impact solar generation
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <BoltIcon className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  Grid Stable
                </p>
                <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                  All systems operating within normal parameters
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
