'use client'

import React, { useState } from 'react'
import { AssetOverview } from '@/components/assets/AssetOverview'
import { useGlobalState } from '@/app/providers-simple'
import { 
  CogIcon, 
  PlusIcon, 
  BoltIcon, 
  MapPinIcon, 
  ChartBarIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline'

export default function AssetsPage() {
  const [selectedView, setSelectedView] = useState<'grid' | 'list' | 'map'>('grid')

  // Asset summary stats
  const assetStats = {
    total: 48,
    online: 42,
    maintenance: 4,
    offline: 2,
    totalCapacity: 850.5,
    currentGeneration: 680.2,
    efficiency: 87.3
  }

  const assetTypes = [
    { name: 'Solar', count: 18, capacity: 320.5, color: 'bg-yellow-500' },
    { name: 'Wind', count: 12, capacity: 280.0, color: 'bg-blue-500' },
    { name: 'Hydro', count: 8, capacity: 150.0, color: 'bg-cyan-500' },
    { name: 'Thermal', count: 6, capacity: 85.0, color: 'bg-orange-500' },
    { name: 'Battery', count: 4, capacity: 15.0, color: 'bg-purple-500' }
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <BoltIcon className="h-8 w-8 mr-3 text-blue-600" />
              Asset Management
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Monitor and manage your energy generation assets
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
              <AdjustmentsHorizontalIcon className="h-4 w-4 mr-2" />
              Filters
            </button>
            <button className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Asset
            </button>
          </div>
        </div>
      </div>

      {/* Asset Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20">
              <BoltIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Assets</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {assetStats.total}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                {assetStats.online} online
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/20">
              <ChartBarIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Generation</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {assetStats.currentGeneration.toFixed(1)} MW
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                of {assetStats.totalCapacity} MW capacity
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/20">
              <ChartBarIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Efficiency</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {assetStats.efficiency.toFixed(1)}%
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                +2.1% vs last month
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/20">
              <MapPinIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Asset Status</p>
              <div className="flex items-center space-x-2 mt-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600 dark:text-green-400">Healthy</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {assetStats.maintenance} in maintenance
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Asset Type Breakdown */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Asset Type Distribution
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {assetTypes.map((type, index) => (
            <div key={index} className="text-center">
              <div className={`w-12 h-12 ${type.color} rounded-full mx-auto mb-2 flex items-center justify-center`}>
                <BoltIcon className="h-6 w-6 text-white" />
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{type.name}</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{type.count}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">{type.capacity} MW</p>
            </div>
          ))}
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Asset Portfolio
        </h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">View:</span>
          <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
            <button
              onClick={() => setSelectedView('grid')}
              className={`px-3 py-1 text-sm font-medium transition-colors ${
                selectedView === 'grid'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setSelectedView('list')}
              className={`px-3 py-1 text-sm font-medium transition-colors ${
                selectedView === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setSelectedView('map')}
              className={`px-3 py-1 text-sm font-medium transition-colors ${
                selectedView === 'map'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
              }`}
            >
              Map
            </button>
          </div>
        </div>
      </div>

      {/* Detailed Asset Overview Component */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Asset Portfolio Details
              </h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Monitor real-time performance and manage asset operations
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <CogIcon className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-500 dark:text-gray-400">Auto-refresh: ON</span>
            </div>
          </div>
        </div>
        <AssetOverview />
      </div>
    </div>
  )
}
