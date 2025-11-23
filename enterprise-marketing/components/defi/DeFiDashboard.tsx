'use client';

import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  ShieldCheckIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DeFiDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedNetwork, setSelectedNetwork] = useState('ethereum');
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  // Market overview data
  const marketData = [
    { name: 'Jan', tvl: 45.2, volume: 2.1, apy: 8.5 },
    { name: 'Feb', tvl: 42.8, volume: 1.9, apy: 7.8 },
    { name: 'Mar', tvl: 48.9, volume: 2.4, apy: 9.2 },
    { name: 'Apr', tvl: 52.3, volume: 2.8, apy: 10.1 },
    { name: 'May', tvl: 49.7, volume: 2.5, apy: 9.6 },
    { name: 'Jun', tvl: 56.1, volume: 3.2, apy: 11.3 },
    { name: 'Jul', tvl: 54.8, volume: 3.0, apy: 10.9 },
    { name: 'Aug', tvl: 58.9, volume: 3.4, apy: 11.8 },
    { name: 'Sep', tvl: 61.2, volume: 3.6, apy: 12.1 },
    { name: 'Oct', tvl: 59.5, volume: 3.3, apy: 11.7 },
    { name: 'Nov', tvl: 63.4, volume: 3.8, apy: 12.5 }
  ];

  const protocolData = [
    { name: 'Aave', tvl: 5670, apy: 4.23, risk: 'Low', users: 156789 },
    { name: 'Compound', tvl: 2840, apy: 3.78, risk: 'Low', users: 89543 },
    { name: 'Uniswap', tvl: 4560, apy: 8.9, risk: 'Medium', users: 234567 },
    { name: 'Curve', tvl: 3890, apy: 6.7, risk: 'Medium', users: 67890 },
    { name: 'Yearn', tvl: 1890, apy: 12.45, risk: 'High', users: 34567 }
  ];

  const yieldData = [
    { protocol: 'ETH Lending', apy: 2.34, amount: 150100, value: '$150,100' },
    { protocol: 'USDC Lending', apy: 4.23, amount: 50000, value: '$50,000' },
    { protocol: 'SOLAR/ETH LP', apy: 12.67, amount: 25000, value: '$25,000' },
    { protocol: 'Curve 3Pool', apy: 8.45, amount: 19900, value: '$19,900' },
    { protocol: 'stETH', apy: 4.2, amount: 18518.55, value: '$46,296' }
  ];

  const riskAlerts = [
    {
      id: 1,
      severity: 'high',
      message: 'Compound ETH pool liquidity below 10% threshold',
      protocol: 'Compound',
      timestamp: '2025-11-19T01:30:00Z',
      status: 'active'
    },
    {
      id: 2,
      severity: 'medium',
      message: 'Energy token volatility increased 25% in 24h',
      protocol: 'Cross-protocol',
      timestamp: '2025-11-19T01:15:00Z',
      status: 'active'
    },
    {
      id: 3,
      severity: 'low',
      message: 'Portfolio concentration above 60% in single protocol',
      protocol: 'Portfolio',
      timestamp: '2025-11-19T00:45:00Z',
      status: 'active'
    }
  ];

  const governanceData = {
    proposals: {
      active: 8,
      passed: 189,
      failed: 37
    },
    treasury: {
      totalValue: 45670000,
      change24h: 2.34
    },
    voting: {
      participation: 78.5,
      totalVoters: 12456
    }
  };

  const portfolioMetrics = {
    totalValue: 245000,
    dailyPnL: 234.56,
    totalReturn: 145.67,
    apy: 12.45,
    sharpeRatio: 1.87,
    maxDrawdown: -5.2,
    var95: -12300
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'High': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'protocols', name: 'Protocols', icon: ShieldCheckIcon },
    { id: 'governance', name: 'Governance', icon: CurrencyDollarIcon },
    { id: 'portfolio', name: 'Portfolio', icon: ArrowTrendingUpIcon },
    { id: 'analytics', name: 'Analytics', icon: ArrowTrendingDownIcon }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Advanced DeFi & Governance</h1>
                <p className="mt-2 text-sm text-gray-600">
                  Comprehensive decentralized finance analytics, governance, and risk management
                </p>
              </div>
              <div className="flex space-x-4">
                <select
                  value={selectedNetwork}
                  onChange={(e) => setSelectedNetwork(e.target.value)}
                  className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="ethereum">Ethereum</option>
                  <option value="polygon">Polygon</option>
                  <option value="arbitrum">Arbitrum</option>
                  <option value="optimism">Optimism</option>
                  <option value="bsc">BSC</option>
                </select>
                <select
                  value={selectedTimeframe}
                  onChange={(e) => setSelectedTimeframe(e.target.value)}
                  className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="1d">1 Day</option>
                  <option value="7d">7 Days</option>
                  <option value="30d">30 Days</option>
                  <option value="1y">1 Year</option>
                  <option value="all">All Time</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <nav className="flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <CurrencyDollarIcon className="h-8 w-8 text-green-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Total Value Locked
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          ${marketData[marketData.length - 1].tvl.toFixed(1)}B
                        </dd>
                      </dl>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center text-sm">
                    <ArrowTrendingUpIcon className="h-4 w-4 text-green-400" />
                    <span className="text-green-600 font-medium">+8.2%</span>
                    <span className="text-gray-500 ml-2">vs last month</span>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ChartBarIcon className="h-8 w-8 text-blue-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          24h Volume
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          ${marketData[marketData.length - 1].volume.toFixed(1)}B
                        </dd>
                      </dl>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center text-sm">
                    <ArrowTrendingUpIcon className="h-4 w-4 text-green-400" />
                    <span className="text-green-600 font-medium">+15.6%</span>
                    <span className="text-gray-500 ml-2">vs yesterday</span>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ArrowTrendingUpIcon className="h-8 w-8 text-purple-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Average APY
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {marketData[marketData.length - 1].apy.toFixed(1)}%
                        </dd>
                      </dl>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center text-sm">
                    <ArrowTrendingUpIcon className="h-4 w-4 text-green-400" />
                    <span className="text-green-600 font-medium">+2.1%</span>
                    <span className="text-gray-500 ml-2">vs last week</span>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ShieldCheckIcon className="h-8 w-8 text-yellow-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Portfolio Value
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          ${portfolioMetrics.totalValue.toLocaleString()}
                        </dd>
                      </dl>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center text-sm">
                    <ArrowTrendingUpIcon className="h-4 w-4 text-green-400" />
                    <span className="text-green-600 font-medium">+{portfolioMetrics.dailyPnL}</span>
                    <span className="text-gray-500 ml-2">today</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">TVL & Volume Trends</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={marketData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="tvl" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                    <Area type="monotone" dataKey="volume" stackId="2" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Top Protocols by TVL</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={protocolData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="tvl" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Risk Alerts */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Risk Alerts</h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  {riskAlerts.filter(alert => alert.status === 'active').length} Active
                </span>
              </div>
              <div className="space-y-3">
                {riskAlerts.map((alert) => (
                  <div key={alert.id} className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}>
                    <div className="flex items-start">
                      <ExclamationTriangleIcon className="h-5 w-5 mt-0.5 mr-3" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{alert.message}</p>
                        <div className="mt-1 flex items-center text-xs text-gray-600">
                          <span>{alert.protocol}</span>
                          <span className="mx-2">•</span>
                          <ClockIcon className="h-3 w-3 mr-1" />
                          <span>{new Date(alert.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        alert.severity === 'high' ? 'bg-red-100 text-red-800' :
                        alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {alert.severity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'protocols' && (
          <div className="space-y-8">
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">DeFi Protocol Analytics</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Protocol
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          TVL
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          APY
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Risk
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Users
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {protocolData.map((protocol, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{protocol.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ${protocol.tvl}M
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {protocol.apy}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskColor(protocol.risk)}`}>
                              {protocol.risk}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {protocol.users.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-indigo-600 hover:text-indigo-900 mr-4">
                              Supply
                            </button>
                            <button className="text-indigo-600 hover:text-indigo-900">
                              Borrow
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Yield Opportunities */}
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Current Yield Opportunities</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {yieldData.map((opportunity, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-900">{opportunity.protocol}</h4>
                        <span className="text-lg font-bold text-green-600">{opportunity.apy}%</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <div>Amount: {opportunity.amount.toLocaleString()}</div>
                        <div>Value: {opportunity.value}</div>
                      </div>
                      <div className="mt-3 flex space-x-2">
                        <button className="flex-1 bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700">
                          Supply
                        </button>
                        <button className="flex-1 bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm hover:bg-gray-300">
                          Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'governance' && (
          <div className="space-y-8">
            {/* Governance Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <CheckCircleIcon className="h-8 w-8 text-green-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Active Proposals
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {governanceData.proposals.active}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <CurrencyDollarIcon className="h-8 w-8 text-blue-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Treasury Value
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          ${(governanceData.treasury.totalValue / 1000000).toFixed(1)}M
                        </dd>
                      </dl>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center text-sm">
                    <ArrowTrendingUpIcon className="h-4 w-4 text-green-400" />
                    <span className="text-green-600 font-medium">+{governanceData.treasury.change24h}%</span>
                    <span className="text-gray-500 ml-2">24h</span>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ChartBarIcon className="h-8 w-8 text-purple-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Voter Participation
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {governanceData.voting.participation}%
                        </dd>
                      </dl>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center text-sm">
                    <span className="text-gray-600">
                      {governanceData.voting.totalVoters.toLocaleString()} voters
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Proposals */}
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Proposals</h3>
                <div className="space-y-4">
                  {[
                    {
                      id: 'prop-089',
                      title: 'Implement Advanced Yield Farming Strategies',
                      status: 'active',
                      for: '83.3%',
                      against: '12.3%',
                      endTime: '2025-11-22T10:30:00Z'
                    },
                    {
                      id: 'prop-088',
                      title: 'Carbon Offset Program Expansion',
                      status: 'passed',
                      for: '85.8%',
                      against: '10.6%',
                      endTime: '2025-11-17T14:15:00Z'
                    },
                    {
                      id: 'prop-087',
                      title: 'Cross-Chain Bridge Integration',
                      status: 'failed',
                      for: '23.7%',
                      against: '64.1%',
                      endTime: '2025-11-12T09:45:00Z'
                    }
                  ].map((proposal) => (
                    <div key={proposal.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900">{proposal.title}</h4>
                          <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                            <span>{proposal.id}</span>
                            <span>For: {proposal.for}</span>
                            <span>Against: {proposal.against}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            proposal.status === 'active' ? 'bg-blue-100 text-blue-800' :
                            proposal.status === 'passed' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {proposal.status}
                          </span>
                          <button className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
                            Vote
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'portfolio' && (
          <div className="space-y-8">
            {/* Portfolio Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Return</dt>
                  <dd className="text-lg font-medium text-gray-900">{portfolioMetrics.totalReturn}%</dd>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <dt className="text-sm font-medium text-gray-500 truncate">Sharpe Ratio</dt>
                  <dd className="text-lg font-medium text-gray-900">{portfolioMetrics.sharpeRatio}</dd>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <dt className="text-sm font-medium text-gray-500 truncate">Max Drawdown</dt>
                  <dd className="text-lg font-medium text-gray-900">{portfolioMetrics.maxDrawdown}%</dd>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <dt className="text-sm font-medium text-gray-500 truncate">VaR (95%)</dt>
                  <dd className="text-lg font-medium text-gray-900">${Math.abs(portfolioMetrics.var95).toLocaleString()}</dd>
                </div>
              </div>
            </div>

            {/* Portfolio Allocation */}
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Portfolio Allocation</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'ETH Lending', value: 61.3 },
                            { name: 'USDC Lending', value: 20.4 },
                            { name: 'LP Tokens', value: 10.2 },
                            { name: 'Curve Vault', value: 8.1 }
                          ]}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}%`}
                        >
                          <Cell fill="#8b5cf6" />
                          <Cell fill="#10b981" />
                          <Cell fill="#3b82f6" />
                          <Cell fill="#f59e0b" />
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-4">
                    {[
                      { protocol: 'Compound V3', asset: 'ETH', amount: 75.5, value: '$150,100', apy: '3.45%' },
                      { protocol: 'Aave V3', asset: 'USDC', amount: 50000, value: '$50,000', apy: '4.23%' },
                      { protocol: 'Uniswap V3', asset: 'SOLAR/ETH', amount: 25000, value: '$25,000', apy: '12.67%' },
                      { protocol: 'Yearn Finance', asset: 'Curve-3Pool', amount: 19900, value: '$19,900', apy: '8.45%' }
                    ].map((position, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{position.protocol}</div>
                          <div className="text-sm text-gray-500">{position.asset} • {position.apy}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">{position.value}</div>
                          <div className="text-sm text-gray-500">{position.amount.toLocaleString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Analytics</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={marketData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="tvl" stroke="#8b5cf6" strokeWidth={2} />
                    <Line type="monotone" dataKey="volume" stroke="#3b82f6" strokeWidth={2} />
                    <Line type="monotone" dataKey="apy" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeFiDashboard;