'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  CurrencyRupeeIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  PlayIcon,
  PauseIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  BoltIcon,
  CalendarIcon,
  DocumentTextIcon,
  LightBulbIcon,
  TrophyIcon
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
  ComposedChart,
  Legend,
  Area,
  AreaChart
} from 'recharts'

// Mock bidding data
const generateBiddingData = () => {
  const assets = [
    { id: 1, name: 'Solar Farm A', type: 'solar', capacity: 250 },
    { id: 2, name: 'Wind Farm B', type: 'wind', capacity: 150 },
    { id: 3, name: 'Solar Farm C', type: 'solar', capacity: 200 },
    { id: 4, name: 'Wind Farm D', type: 'wind', capacity: 100 }
  ]

  const bids = []
  for (let i = 0; i < 20; i++) {
    const asset = assets[Math.floor(Math.random() * assets.length)]
    const basePrice = 4000 + Math.random() * 2000
    const status = Math.random() < 0.6 ? 'accepted' : Math.random() < 0.8 ? 'pending' : 'rejected'
    const createdAt = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
    
    bids.push({
      id: i + 1,
      assetId: asset.id,
      assetName: asset.name,
      assetType: asset.type,
      quantity: Math.floor(Math.random() * asset.capacity * 0.8) + 10,
      price: Math.round(basePrice),
      totalValue: Math.round((Math.random() * asset.capacity * 0.8 + 10) * basePrice),
      status,
      createdAt: createdAt.toISOString(),
      deliveryDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      marketType: Math.random() < 0.5 ? 'Day-Ahead' : 'Real-Time',
      riskLevel: Math.random() < 0.3 ? 'Low' : Math.random() < 0.7 ? 'Medium' : 'High'
    })
  }

  return bids
}

const biddingPerformance = [
  { date: '2024-11-11', submitted: 15, accepted: 12, rejected: 3, avgPrice: 4200, successRate: 80 },
  { date: '2024-11-12', submitted: 18, accepted: 14, rejected: 4, avgPrice: 4350, successRate: 78 },
  { date: '2024-11-13', submitted: 16, accepted: 11, rejected: 5, avgPrice: 4100, successRate: 69 },
  { date: '2024-11-14', submitted: 20, accepted: 16, rejected: 4, avgPrice: 4450, successRate: 80 },
  { date: '2024-11-15', submitted: 17, accepted: 13, rejected: 4, avgPrice: 4300, successRate: 76 },
  { date: '2024-11-16', submitted: 19, accepted: 15, rejected: 4, avgPrice: 4400, successRate: 79 },
  { date: '2024-11-17', submitted: 22, accepted: 18, rejected: 4, avgPrice: 4550, successRate: 82 }
]

const marketOpportunities = [
  {
    id: 1,
    time: '14:00 - 16:00',
    asset: 'Solar Farm A',
    quantity: 150,
    estimatedPrice: 5200,
    confidence: 85,
    reason: 'High demand, low supply expected'
  },
  {
    id: 2,
    time: '18:00 - 20:00',
    asset: 'Wind Farm B',
    quantity: 80,
    estimatedPrice: 4900,
    confidence: 78,
    reason: 'Peak evening demand'
  },
  {
    id: 3,
    time: '22:00 - 06:00',
    asset: 'Solar Farm A',
    quantity: 0,
    estimatedPrice: 0,
    confidence: 0,
    reason: 'No solar generation during night'
  }
]

const bidStats = {
  total: 127,
  accepted: 89,
  pending: 23,
  rejected: 15,
  successRate: 70.1,
  avgAcceptedPrice: 4340,
  totalRevenue: 2847500,
  pendingValue: 982500
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'accepted':
      return 'text-secondary-600 bg-secondary-100 dark:bg-secondary-900 dark:text-secondary-400'
    case 'pending':
      return 'text-warning-600 bg-warning-100 dark:bg-warning-900 dark:text-warning-400'
    case 'rejected':
      return 'text-danger-600 bg-danger-100 dark:bg-danger-900 dark:text-danger-400'
    default:
      return 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400'
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'accepted':
      return <CheckCircleIcon className="h-4 w-4" />
    case 'pending':
      return <ClockIcon className="h-4 w-4" />
    case 'rejected':
      return <XCircleIcon className="h-4 w-4" />
    default:
      return <ExclamationTriangleIcon className="h-4 w-4" />
  }
}

export function BiddingOverview() {
  const [bids, setBids] = useState(generateBiddingData())
  const [selectedBid, setSelectedBid] = useState<number | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterAsset, setFilterAsset] = useState<string>('all')
  const [timeRange, setTimeRange] = useState('7d')

  const filteredBids = bids.filter(bid => {
    if (filterStatus !== 'all' && bid.status !== filterStatus) return false
    if (filterAsset !== 'all' && bid.assetName !== filterAsset) return false
    return true
  })

  const uniqueAssets = Array.from(new Set(bids.map(bid => bid.assetName)))

  const statusDistribution = [
    { name: 'Accepted', value: bidStats.accepted, color: '#22c55e' },
    { name: 'Pending', value: bidStats.pending, color: '#f59e0b' },
    { name: 'Rejected', value: bidStats.rejected, color: '#ef4444' }
  ]

  const assetPerformance = uniqueAssets.map(asset => {
    const assetBids = bids.filter(b => b.assetName === asset)
    const accepted = assetBids.filter(b => b.status === 'accepted').length
    const total = assetBids.length
    return {
      asset,
      successRate: total > 0 ? (accepted / total) * 100 : 0,
      avgPrice: assetBids.filter(b => b.status === 'accepted')
        .reduce((sum, b) => sum + b.price, 0) / accepted || 0,
      totalBids: total
    }
  })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const selectedBidData = selectedBid ? bids.find(b => b.id === selectedBid) : null

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Bidding Overview
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Monitor and manage your electricity market bids
          </p>
        </div>
        <div className="flex items-center space-x-4 mt-4 sm:mt-0">
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input py-1 text-sm"
          >
            <option value="all">All Status</option>
            <option value="accepted">Accepted</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
          <select 
            value={filterAsset}
            onChange={(e) => setFilterAsset(e.target.value)}
            className="input py-1 text-sm"
          >
            <option value="all">All Assets</option>
            {uniqueAssets.map(asset => (
              <option key={asset} value={asset}>{asset}</option>
            ))}
          </select>
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="input py-1 text-sm"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          <Link href="/bidding/create" className="btn-primary">
            Create New Bid
          </Link>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Bids
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {bidStats.total}
                </p>
              </div>
              <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-lg">
                <DocumentTextIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
            </div>
            <div className="mt-2 flex items-center">
              <TrophyIcon className="h-4 w-4 text-secondary-500 mr-1" />
              <span className="text-sm text-secondary-600 dark:text-secondary-400">
                {bidStats.successRate}% success rate
              </span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Accepted Bids
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {bidStats.accepted}
                </p>
              </div>
              <div className="p-3 bg-secondary-100 dark:bg-secondary-900 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-secondary-600 dark:text-secondary-400" />
              </div>
            </div>
            <div className="mt-2 flex items-center">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Avg Price: {formatCurrency(bidStats.avgAcceptedPrice)}
              </span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Pending Bids
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {bidStats.pending}
                </p>
              </div>
              <div className="p-3 bg-warning-100 dark:bg-warning-900 rounded-lg">
                <ClockIcon className="h-6 w-6 text-warning-600 dark:text-warning-400" />
              </div>
            </div>
            <div className="mt-2 flex items-center">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Value: {formatCurrency(bidStats.pendingValue)}
              </span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ₹{(bidStats.totalRevenue / 100000).toFixed(1)}L
                </p>
              </div>
              <div className="p-3 bg-accent-100 dark:bg-accent-900 rounded-lg">
                <CurrencyRupeeIcon className="h-6 w-6 text-accent-600 dark:text-accent-400" />
              </div>
            </div>
            <div className="mt-2 flex items-center">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                From accepted bids
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bidding Performance Trend */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Bidding Performance Trend
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Daily bid submission and acceptance rates
            </p>
          </div>
          <div className="card-body">
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={biddingPerformance}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="date" 
                    className="text-xs"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis 
                    yAxisId="left"
                    className="text-xs"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    className="text-xs"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => {
                      if (name === 'successRate') return [`${value}%`, 'Success Rate']
                      return [value, name]
                    }}
                    labelFormatter={(label) => new Date(label).toLocaleDateString('en-IN')}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px'
                    }}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="submitted" fill="#e5e7eb" name="Submitted" />
                  <Bar yAxisId="left" dataKey="accepted" fill="#22c55e" name="Accepted" />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="successRate" 
                    stroke="#f59e0b" 
                    strokeWidth={3}
                    name="Success Rate (%)"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Bid Status Distribution
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Current breakdown of all bids
            </p>
          </div>
          <div className="card-body">
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [value, 'Bids']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Asset Performance and Opportunities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Asset Performance */}
        <div className="lg:col-span-2 card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Asset Performance
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Success rates by asset
            </p>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {assetPerformance.map((asset) => (
                <div key={asset.asset} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {asset.asset}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {asset.totalBids} bids • Avg: {formatCurrency(asset.avgPrice)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {asset.successRate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Success Rate
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Market Opportunities */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Market Opportunities
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              AI-powered bid recommendations
            </p>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {marketOpportunities.map((opportunity) => (
                <div key={opportunity.id} className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                      {opportunity.asset}
                    </h4>
                    <div className="flex items-center space-x-1">
                      <LightBulbIcon className="h-4 w-4 text-primary-500" />
                      <span className="text-xs text-primary-600 dark:text-primary-400">
                        {opportunity.confidence}%
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    {opportunity.time}
                  </div>
                  {opportunity.quantity > 0 ? (
                    <>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {opportunity.quantity} MW
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatCurrency(opportunity.estimatedPrice)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {opportunity.reason}
                      </p>
                      <button className="mt-2 w-full btn-outline btn-sm">
                        Create Bid
                      </button>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {opportunity.reason}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Bids */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Recent Bids ({filteredBids.length})
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Latest bid submissions and their status
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setBids(generateBiddingData())}
                className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <ArrowPathIcon className="h-4 w-4" />
              </button>
              <Link href="/bidding/history" className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400">
                View All
              </Link>
            </div>
          </div>
        </div>
        <div className="card-body">
          <div className="space-y-4">
            {filteredBids.slice(0, 10).map((bid) => (
              <div 
                key={bid.id} 
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-sm transition-shadow duration-200"
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-lg ${getStatusColor(bid.status)}`}>
                    {getStatusIcon(bid.status)}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {bid.assetName}
                    </h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <span>{bid.quantity} MW</span>
                      <span>{formatCurrency(bid.price)}</span>
                      <span>{formatCurrency(bid.totalValue)}</span>
                      <span>{bid.marketType}</span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDateTime(bid.createdAt)} • Delivery: {new Date(bid.deliveryDate).toLocaleDateString('en-IN')}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${getStatusColor(bid.status)}`}>
                    {getStatusIcon(bid.status)}
                    <span className="capitalize">{bid.status}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedBid(bid.id)}
                      className="p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    {bid.status === 'pending' && (
                      <>
                        <button className="p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bid Detail Modal */}
      {selectedBid && selectedBidData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${getStatusColor(selectedBidData.status)}`}>
                    {getStatusIcon(selectedBidData.status)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Bid #{selectedBidData.id}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedBidData.assetName}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedBid(null)}
                  className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Bid Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Quantity</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {selectedBidData.quantity} MW
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Price</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(selectedBidData.price)}/MWh
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Total Value</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(selectedBidData.totalValue)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Market Type</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {selectedBidData.marketType}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Timeline</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Created</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatDateTime(selectedBidData.createdAt)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Delivery Date</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {new Date(selectedBidData.deliveryDate).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Risk Level</span>
                      <span className={`font-medium ${
                        selectedBidData.riskLevel === 'Low' ? 'text-secondary-600' :
                        selectedBidData.riskLevel === 'Medium' ? 'text-warning-600' : 'text-danger-600'
                      }`}>
                        {selectedBidData.riskLevel}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setSelectedBid(null)}
                  className="btn-outline"
                >
                  Close
                </button>
                {selectedBidData.status === 'pending' && (
                  <>
                    <button className="btn-outline">
                      Edit Bid
                    </button>
                    <button className="btn-danger">
                      Cancel Bid
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}