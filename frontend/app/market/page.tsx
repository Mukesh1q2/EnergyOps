'use client'

import React from 'react'
import { MarketOverview } from '@/components/market/MarketOverview'
import { useGlobalState } from '@/app/providers-simple'
import { 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  BoltIcon, 
  GlobeAmericasIcon 
} from '@heroicons/react/24/outline'

export default function MarketPage() {
  // Market summary stats
  const marketStats = {
    totalVolume: 2.4,
    avgPrice: 45.32,
    priceChange: 2.1,
    activeRegions: 12,
    lastUpdate: new Date().toLocaleTimeString()
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <ChartBarIcon className="h-8 w-8 mr-3 text-blue-600" />
              Market Data
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Real-time energy market data and pricing trends
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 dark:text-gray-400">Last Updated</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {marketStats.lastUpdate}
            </p>
          </div>
        </div>
      </div>

      {/* Market Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20">
              <CurrencyDollarIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Price</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                ${marketStats.avgPrice.toFixed(2)}
                <span className={`ml-2 text-sm ${marketStats.priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ({marketStats.priceChange >= 0 ? '+' : ''}{marketStats.priceChange}%)
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/20">
              <BoltIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Volume</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {marketStats.totalVolume.toFixed(1)} GWh
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/20">
              <GlobeAmericasIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Regions</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {marketStats.activeRegions}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/20">
              <ChartBarIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Market Status</p>
              <p className="text-2xl font-semibold text-green-600 dark:text-green-400">
                Active
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Market Overview Component */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Market Analysis
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Comprehensive view of energy market trends and pricing data
          </p>
        </div>
        <MarketOverview />
      </div>

      {/* Market News & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Market News */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Market News
          </h3>
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <p className="font-medium text-gray-900 dark:text-white">Renewable Energy Generation Peaks</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Solar and wind generation reached record levels across the grid</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">2 hours ago</p>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <p className="font-medium text-gray-900 dark:text-white">Grid Stability Maintained</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">System frequency within normal operating parameters</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">4 hours ago</p>
            </div>
            <div className="border-l-4 border-yellow-500 pl-4">
              <p className="font-medium text-gray-900 dark:text-white">Peak Demand Forecast Update</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Evening peak demand expected to exceed normal levels</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">6 hours ago</p>
            </div>
          </div>
        </div>

        {/* Market Alerts */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Active Alerts
          </h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Price Volatility Warning</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">High price volatility detected in RT market</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">Active</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Demand Surge Alert</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Forecasted demand increase of 15% in next 4 hours</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">Monitoring</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">System Normal</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">All systems operating within normal parameters</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">All clear</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
