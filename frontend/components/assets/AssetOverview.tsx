'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  BoltIcon,
  SunIcon,
  CloudIcon,
  CpuChipIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  CogIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  PlayIcon,
  PauseIcon,
  ChartBarIcon,
  MapPinIcon,
  CalendarIcon,
  FireIcon,
  BeakerIcon
} from '@heroicons/react/24/outline'
import { 
  BarChart, 
  Bar, 
  LineChart,
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  Legend
} from 'recharts'

// Mock asset data
const generateAssetData = () => {
  return [
    {
      id: 1,
      name: 'Solar Farm A - Rajasthan',
      type: 'solar',
      status: 'online',
      capacity: 250,
      currentGeneration: 185,
      capacityFactor: 74,
      efficiency: 18.5,
      temperature: 42,
      location: { lat: 26.9124, lng: 75.7873, region: 'Rajasthan' },
      lastMaintenance: '2024-11-15',
      nextMaintenance: '2024-12-15',
      alerts: [],
      performance: [
        { time: '00:00', generation: 0, efficiency: 0 },
        { time: '06:00', generation: 45, efficiency: 18.0 },
        { time: '09:00', generation: 125, efficiency: 18.5 },
        { time: '12:00', generation: 185, efficiency: 18.8 },
        { time: '15:00', generation: 165, efficiency: 18.2 },
        { time: '18:00', generation: 95, efficiency: 17.5 },
        { time: '21:00', generation: 0, efficiency: 0 }
      ]
    },
    {
      id: 2,
      name: 'Wind Farm B - Tamil Nadu',
      type: 'wind',
      status: 'online',
      capacity: 150,
      currentGeneration: 98,
      capacityFactor: 65,
      efficiency: 42.3,
      temperature: 28,
      windSpeed: 12.5,
      location: { lat: 11.1271, lng: 78.6569, region: 'Tamil Nadu' },
      lastMaintenance: '2024-11-10',
      nextMaintenance: '2024-12-10',
      alerts: [],
      performance: [
        { time: '00:00', generation: 95, efficiency: 42.1 },
        { time: '06:00', generation: 102, efficiency: 42.8 },
        { time: '09:00', generation: 98, efficiency: 42.3 },
        { time: '12:00', generation: 108, efficiency: 43.1 },
        { time: '15:00', generation: 105, efficiency: 42.9 },
        { time: '18:00', generation: 92, efficiency: 41.8 },
        { time: '21:00', generation: 88, efficiency: 41.2 }
      ]
    },
    {
      id: 3,
      name: 'Solar Farm C - Gujarat',
      type: 'solar',
      status: 'maintenance',
      capacity: 200,
      currentGeneration: 0,
      capacityFactor: 0,
      efficiency: 0,
      temperature: 38,
      location: { lat: 22.2587, lng: 71.1924, region: 'Gujarat' },
      lastMaintenance: '2024-11-18',
      nextMaintenance: '2024-12-18',
      alerts: ['Scheduled maintenance in progress'],
      performance: [
        { time: '00:00', generation: 0, efficiency: 0 },
        { time: '06:00', generation: 0, efficiency: 0 },
        { time: '09:00', generation: 0, efficiency: 0 },
        { time: '12:00', generation: 0, efficiency: 0 },
        { time: '15:00', generation: 0, efficiency: 0 },
        { time: '18:00', generation: 0, efficiency: 0 },
        { time: '21:00', generation: 0, efficiency: 0 }
      ]
    },
    {
      id: 4,
      name: 'Wind Farm D - Maharashtra',
      type: 'wind',
      status: 'online',
      capacity: 100,
      currentGeneration: 72,
      capacityFactor: 72,
      efficiency: 38.5,
      temperature: 32,
      windSpeed: 9.8,
      location: { lat: 19.7515, lng: 75.7139, region: 'Maharashtra' },
      lastMaintenance: '2024-11-12',
      nextMaintenance: '2024-12-12',
      alerts: [],
      performance: [
        { time: '00:00', generation: 68, efficiency: 38.2 },
        { time: '06:00', generation: 75, efficiency: 38.8 },
        { time: '09:00', generation: 72, efficiency: 38.5 },
        { time: '12:00', generation: 78, efficiency: 39.1 },
        { time: '15:00', generation: 74, efficiency: 38.7 },
        { time: '18:00', generation: 69, efficiency: 38.1 },
        { time: '21:00', generation: 65, efficiency: 37.8 }
      ]
    },
    {
      id: 5,
      name: 'Hydro Plant E - Uttarakhand',
      type: 'hydro',
      status: 'online',
      capacity: 80,
      currentGeneration: 65,
      capacityFactor: 81,
      efficiency: 89.2,
      temperature: 18,
      waterLevel: 85,
      location: { lat: 30.0668, lng: 79.0193, region: 'Uttarakhand' },
      lastMaintenance: '2024-11-08',
      nextMaintenance: '2025-01-08',
      alerts: [],
      performance: [
        { time: '00:00', generation: 62, efficiency: 88.5 },
        { time: '06:00', generation: 68, efficiency: 89.8 },
        { time: '09:00', generation: 65, efficiency: 89.2 },
        { time: '12:00', generation: 70, efficiency: 90.1 },
        { time: '15:00', generation: 67, efficiency: 89.5 },
        { time: '18:00', generation: 64, efficiency: 88.9 },
        { time: '21:00', generation: 60, efficiency: 88.2 }
      ]
    },
    {
      id: 6,
      name: 'Battery Storage F - Karnataka',
      type: 'storage',
      status: 'online',
      capacity: 50,
      currentGeneration: 35,
      stateOfCharge: 78,
      efficiency: 92.5,
      temperature: 25,
      location: { lat: 15.3173, lng: 75.7139, region: 'Karnataka' },
      lastMaintenance: '2024-11-14',
      nextMaintenance: '2024-12-14',
      alerts: [],
      performance: [
        { time: '00:00', generation: -15, efficiency: 92.1 },
        { time: '06:00', generation: 20, efficiency: 92.8 },
        { time: '09:00', generation: 35, efficiency: 92.5 },
        { time: '12:00', generation: 45, efficiency: 93.2 },
        { time: '15:00', generation: 38, efficiency: 92.9 },
        { time: '18:00', generation: -25, efficiency: 91.8 },
        { time: '21:00', generation: -10, efficiency: 92.3 }
      ]
    }
  ]
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'online':
      return 'text-secondary-600 bg-secondary-100 dark:bg-secondary-900 dark:text-secondary-400'
    case 'maintenance':
      return 'text-warning-600 bg-warning-100 dark:bg-warning-900 dark:text-warning-400'
    case 'offline':
      return 'text-danger-600 bg-danger-100 dark:bg-danger-900 dark:text-danger-400'
    case 'fault':
      return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-400'
    default:
      return 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400'
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'online':
      return <CheckCircleIcon className="h-4 w-4" />
    case 'maintenance':
      return <CogIcon className="h-4 w-4" />
    case 'offline':
    case 'fault':
      return <XCircleIcon className="h-4 w-4" />
    default:
      return <ExclamationTriangleIcon className="h-4 w-4" />
  }
}

const getAssetIcon = (type: string) => {
  switch (type) {
    case 'solar':
      return <SunIcon className="h-5 w-5" />
    case 'wind':
      return <CloudIcon className="h-5 w-5" />
    case 'hydro':
      return <BeakerIcon className="h-5 w-5" />
    case 'storage':
      return <BoltIcon className="h-5 w-5" />
    default:
      return <CpuChipIcon className="h-5 w-5" />
  }
}

export function AssetOverview() {
  const [assets, setAssets] = useState(generateAssetData())
  const [selectedAsset, setSelectedAsset] = useState<number | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')

  const filteredAssets = assets.filter(asset => {
    if (filterStatus !== 'all' && asset.status !== filterStatus) return false
    if (filterType !== 'all' && asset.type !== filterType) return false
    return true
  })

  const summaryData = {
    total: assets.length,
    online: assets.filter(a => a.status === 'online').length,
    maintenance: assets.filter(a => a.status === 'maintenance').length,
    offline: assets.filter(a => a.status === 'offline' || a.status === 'fault').length,
    totalCapacity: assets.reduce((sum, asset) => sum + asset.capacity, 0),
    currentGeneration: assets.reduce((sum, asset) => sum + asset.currentGeneration, 0),
    avgEfficiency: assets.reduce((sum, asset) => sum + asset.efficiency, 0) / assets.length
  }

  const statusDistribution = [
    { name: 'Online', value: summaryData.online, color: '#22c55e' },
    { name: 'Maintenance', value: summaryData.maintenance, color: '#f59e0b' },
    { name: 'Offline', value: summaryData.offline, color: '#ef4444' }
  ]

  const typeDistribution = [
    { name: 'Solar', value: assets.filter(a => a.type === 'solar').length, color: '#f59e0b' },
    { name: 'Wind', value: assets.filter(a => a.type === 'wind').length, color: '#3b82f6' },
    { name: 'Hydro', value: assets.filter(a => a.type === 'hydro').length, color: '#06b6d4' },
    { name: 'Storage', value: assets.filter(a => a.type === 'storage').length, color: '#8b5cf6' }
  ]

  const selectedAssetData = selectedAsset ? assets.find(a => a.id === selectedAsset) : null

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Asset Overview
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Monitor and manage your energy generation assets
          </p>
        </div>
        <div className="flex items-center space-x-4 mt-4 sm:mt-0">
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input py-1 text-sm"
          >
            <option value="all">All Status</option>
            <option value="online">Online</option>
            <option value="maintenance">Maintenance</option>
            <option value="offline">Offline</option>
          </select>
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="input py-1 text-sm"
          >
            <option value="all">All Types</option>
            <option value="solar">Solar</option>
            <option value="wind">Wind</option>
            <option value="hydro">Hydro</option>
            <option value="storage">Storage</option>
          </select>
          <div className="flex rounded-md shadow-sm">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 text-sm rounded-l-md ${
                viewMode === 'grid' 
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' 
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 text-sm rounded-r-md ${
                viewMode === 'list' 
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' 
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Assets
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {summaryData.total}
                </p>
              </div>
              <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-lg">
                <CpuChipIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-secondary-600 dark:text-secondary-400">
                {summaryData.online} Online
              </span>
              <span className="text-gray-500 dark:text-gray-400">
                {summaryData.maintenance} Maintenance
              </span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Capacity
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {summaryData.totalCapacity} MW
                </p>
              </div>
              <div className="p-3 bg-secondary-100 dark:bg-secondary-900 rounded-lg">
                <BoltIcon className="h-6 w-6 text-secondary-600 dark:text-secondary-400" />
              </div>
            </div>
            <div className="mt-2 flex items-center">
              <ArrowTrendingUpIcon className="h-4 w-4 text-secondary-500 mr-1" />
              <span className="text-sm text-secondary-600 dark:text-secondary-400">
                {Math.round((summaryData.currentGeneration / summaryData.totalCapacity) * 100)}% utilized
              </span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Current Generation
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {summaryData.currentGeneration} MW
                </p>
              </div>
              <div className="p-3 bg-accent-100 dark:bg-accent-900 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-accent-600 dark:text-accent-400" />
              </div>
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-accent-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(summaryData.currentGeneration / summaryData.totalCapacity) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Average Efficiency
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {summaryData.avgEfficiency.toFixed(1)}%
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <FireIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="mt-2 flex items-center">
              <ArrowTrendingUpIcon className="h-4 w-4 text-secondary-500 mr-1" />
              <span className="text-sm text-secondary-600 dark:text-secondary-400">
                +1.2% from yesterday
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Asset Status Distribution
            </h3>
          </div>
          <div className="card-body">
            <div className="chart-container-sm">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Asset Type Distribution */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Asset Type Distribution
            </h3>
          </div>
          <div className="card-body">
            <div className="chart-container-sm">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={typeDistribution}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Bar dataKey="value" fill="#0ea5e9" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Asset List/Grid */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Assets ({filteredAssets.length})
          </h3>
        </div>
        <div className="card-body">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAssets.map((asset) => (
                <div 
                  key={asset.id} 
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer"
                  onClick={() => setSelectedAsset(asset.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${getStatusColor(asset.status)}`}>
                        {getAssetIcon(asset.type)}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                          {asset.name}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                          {asset.type}
                        </p>
                      </div>
                    </div>
                    <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${getStatusColor(asset.status)}`}>
                      {getStatusIcon(asset.status)}
                      <span className="capitalize">{asset.status}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300">Generation</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {asset.currentGeneration} / {asset.capacity} MW
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(asset.currentGeneration / asset.capacity) * 100}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300">Efficiency</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {asset.efficiency.toFixed(1)}%
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300">Location</span>
                      <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                        <MapPinIcon className="h-3 w-3" />
                        <span className="text-xs">{asset.location.region}</span>
                      </div>
                    </div>

                    {asset.alerts.length > 0 && (
                      <div className="mt-2 p-2 bg-warning-50 dark:bg-warning-900/20 rounded text-xs">
                        <div className="flex items-center space-x-1">
                          <ExclamationTriangleIcon className="h-3 w-3 text-warning-600" />
                          <span className="text-warning-700 dark:text-warning-400">
                            {asset.alerts[0]}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAssets.map((asset) => (
                <div 
                  key={asset.id} 
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-sm transition-shadow duration-200"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${getStatusColor(asset.status)}`}>
                      {getAssetIcon(asset.type)}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {asset.name}
                      </h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <span className="capitalize">{asset.type}</span>
                        <div className="flex items-center space-x-1">
                          <MapPinIcon className="h-3 w-3" />
                          <span>{asset.location.region}</span>
                        </div>
                        <span>Next maint: {asset.nextMaintenance}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {asset.currentGeneration} / {asset.capacity} MW
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Generation
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {asset.efficiency.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Efficiency
                      </div>
                    </div>
                    <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${getStatusColor(asset.status)}`}>
                      {getStatusIcon(asset.status)}
                      <span className="capitalize">{asset.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Asset Detail Modal/Panel */}
      {selectedAsset && selectedAssetData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${getStatusColor(selectedAssetData.status)}`}>
                    {getAssetIcon(selectedAssetData.type)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {selectedAssetData.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                      {selectedAssetData.type} Asset • {selectedAssetData.location.region}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAsset(null)}
                  className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Current Status */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedAssetData.currentGeneration} MW
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Current Generation
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedAssetData.efficiency.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Efficiency
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedAssetData.capacityFactor}%
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Capacity Factor
                  </div>
                </div>
              </div>

              {/* Performance Chart */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  24-Hour Performance
                </h4>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={selectedAssetData.performance}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="time" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="generation" 
                        stroke="#0ea5e9" 
                        strokeWidth={2}
                        name="Generation (MW)"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="efficiency" 
                        stroke="#22c55e" 
                        strokeWidth={2}
                        name="Efficiency (%)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Asset Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Technical Specifications
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Installed Capacity</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {selectedAssetData.capacity} MW
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Operating Temperature</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {selectedAssetData.temperature}°C
                      </span>
                    </div>
                    {selectedAssetData.windSpeed && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Wind Speed</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {selectedAssetData.windSpeed} m/s
                        </span>
                      </div>
                    )}
                    {selectedAssetData.waterLevel && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Water Level</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {selectedAssetData.waterLevel}%
                        </span>
                      </div>
                    )}
                    {selectedAssetData.stateOfCharge && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">State of Charge</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {selectedAssetData.stateOfCharge}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Maintenance Schedule
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Last Maintenance</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {selectedAssetData.lastMaintenance}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Next Maintenance</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {selectedAssetData.nextMaintenance}
                      </span>
                    </div>
                  </div>
                  
                  {selectedAssetData.alerts.length > 0 && (
                    <div className="mt-4">
                      <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Alerts
                      </h5>
                      <div className="space-y-2">
                        {selectedAssetData.alerts.map((alert, index) => (
                          <div key={index} className="p-2 bg-warning-50 dark:bg-warning-900/20 rounded text-sm">
                            <div className="flex items-center space-x-2">
                              <ExclamationTriangleIcon className="h-4 w-4 text-warning-600" />
                              <span className="text-warning-700 dark:text-warning-400">{alert}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Link
                  href={`/assets/${selectedAssetData.id}/details`}
                  className="btn-outline"
                >
                  View Details
                </Link>
                <Link
                  href={`/assets/${selectedAssetData.id}/control`}
                  className="btn-primary"
                >
                  Control Asset
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}