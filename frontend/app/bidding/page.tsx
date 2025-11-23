'use client'

import React, { useState } from 'react'
import { BiddingOverview } from '@/components/bidding/BiddingOverview'
import { useGlobalState } from '@/app/providers-simple'
import { 
  CurrencyDollarIcon, 
  PlusIcon, 
  ChartBarIcon, 
  TrophyIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

export default function BiddingPage() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h')
  const [selectedMarket, setSelectedMarket] = useState('all')

  // Bidding summary stats
  const biddingStats = {
    activeBids: 24,
    submittedToday: 156,
    acceptedRate: 87.3,
    totalRevenue: 125430.50,
    avgPrice: 45.67,
    pendingBids: 8,
    rejectedBids: 12
  }

  const marketTypes = [
    { id: 'all', name: 'All Markets', count: 24, revenue: 125430.50 },
    { id: 'day_ahead', name: 'Day Ahead', count: 12, revenue: 67890.25 },
    { id: 'real_time', name: 'Real Time', count: 8, revenue: 34567.75 },
    { id: 'ancillary', name: 'Ancillary', count: 4, revenue: 22972.50 }
  ]

  const recentActivities = [
    { type: 'accepted', bid: 'BID-2024-001', price: 45.50, volume: 50, time: '2 min ago' },
    { type: 'submitted', bid: 'BID-2024-002', price: 46.20, volume: 75, time: '5 min ago' },
    { type: 'rejected', bid: 'BID-2024-003', price: 44.80, volume: 25, time: '8 min ago' },
    { type: 'accepted', bid: 'BID-2024-004', price: 45.90, volume: 100, time: '12 min ago' }
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <CurrencyDollarIcon className="h-8 w-8 mr-3 text-blue-600" />
              Bidding Management
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Create, monitor, and optimize your energy bids across all markets
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={selectedMarket}
              onChange={(e) => setSelectedMarket(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="all">All Markets</option>
              <option value="day_ahead">Day Ahead</option>
              <option value="real_time">Real Time</option>
              <option value="ancillary">Ancillary Services</option>
            </select>
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
              <ClockIcon className="h-4 w-4 mr-2" />
              {selectedTimeframe}
            </button>
            <button className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
              <PlusIcon className="h-4 w-4 mr-2" />
              New Bid
            </button>
          </div>
        </div>
      </div>

      {/* Bidding Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20">
              <ChartBarIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Bids</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {biddingStats.activeBids}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {biddingStats.pendingBids} pending
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/20">
              <TrophyIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Acceptance Rate</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {biddingStats.acceptedRate.toFixed(1)}%
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                +3.2% vs last week
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/20">
              <CurrencyDollarIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Today's Revenue</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                ${biddingStats.totalRevenue.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Avg: ${biddingStats.avgPrice.toFixed(2)}/MWh
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/20">
              <CheckCircleIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Bids Today</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {biddingStats.submittedToday}
              </p>
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                {biddingStats.rejectedBids} rejected
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Market Breakdown */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Market Performance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {marketTypes.map((market, index) => (
            <div key={index} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white">{market.name}</h4>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                {market.count}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                ${market.revenue.toLocaleString()} revenue
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bidding Activity */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Bidding Activity
          </h3>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'accepted' ? 'bg-green-500' : 
                    activity.type === 'rejected' ? 'bg-red-500' : 'bg-blue-500'
                  }`}></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.bid}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      ${activity.price.toFixed(2)}/MWh • {activity.volume} MW
                    </p>
                  </div>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {activity.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Insights
          </h3>
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Best Performance</p>
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">Day Ahead</p>
              <p className="text-xs text-blue-600 dark:text-blue-400">92% acceptance rate</p>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-sm font-medium text-green-800 dark:text-green-200">Peak Revenue</p>
              <p className="text-lg font-bold text-green-600 dark:text-green-400">$67,890</p>
              <p className="text-xs text-green-600 dark:text-green-400">Day Ahead market</p>
            </div>
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Optimization</p>
              <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400">+15%</p>
              <p className="text-xs text-yellow-600 dark:text-yellow-400">vs. last month</p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Bidding Overview Component */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Bidding Performance Analytics
              </h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Track bid acceptance rates, pricing strategies, and market opportunities
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <ClockIcon className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-500 dark:text-gray-400">Live Updates</span>
            </div>
          </div>
        </div>
        <BiddingOverview />
      </div>
    </div>
  )
}
