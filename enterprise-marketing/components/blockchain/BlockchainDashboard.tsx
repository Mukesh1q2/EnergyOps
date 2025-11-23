'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  CubeIcon, 
  BanknotesIcon, 
  ChartBarIcon, 
  CogIcon,
  ShieldCheckIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

interface BlockchainStats {
  totalContracts: number;
  activeContracts: number;
  verifiedContracts: number;
  avgTPS: number;
  totalDeployments: number;
  totalEvents: number;
}

interface NetworkStat {
  network: string;
  latestBlock: number;
  avgGasPrice: string;
  pendingTxs: number;
  tps: number;
  finalityTime: string;
  totalValue: string;
}

interface TransactionStats {
  total: number;
  confirmed: number;
  pending: number;
  failed: number;
  totalValue: number;
  avgGasPrice: number;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const BlockchainDashboard: React.FC = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');
  const [selectedNetwork, setSelectedNetwork] = useState('all');

  // Fetch blockchain statistics
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['blockchain-stats'],
    queryFn: async () => {
      const response = await fetch('/api/blockchain/smart-contracts');
      const result = await response.json();
      return result.success ? result.stats : null;
    },
    refetchInterval: 30000, // 30 seconds
  });

  // Fetch network statistics
  const { data: networkData, isLoading: networkLoading } = useQuery({
    queryKey: ['network-stats', selectedNetwork],
    queryFn: async () => {
      const params = new URLSearchParams({
        action: 'network-stats',
        ...(selectedNetwork !== 'all' && { network: selectedNetwork })
      });
      const response = await fetch(`/api/blockchain/transactions?${params}`);
      const result = await response.json();
      return result.success ? result.data : [];
    },
    refetchInterval: 15000, // 15 seconds
  });

  // Fetch transaction statistics
  const { data: txData, isLoading: txLoading } = useQuery({
    queryKey: ['transaction-stats', selectedNetwork, selectedTimeframe],
    queryFn: async () => {
      const params = new URLSearchParams({
        ...(selectedNetwork !== 'all' && { network: selectedNetwork }),
        limit: '100',
        offset: '0'
      });
      const response = await fetch(`/api/blockchain/transactions?${params}`);
      const result = await response.json();
      return result.success ? result.stats : null;
    },
    refetchInterval: 10000, // 10 seconds
  });

  // Mock chart data for visualization
  const chartData = [
    { time: '00:00', txs: 120, gas: 25, blocks: 15 },
    { time: '04:00', txs: 89, gas: 22, blocks: 12 },
    { time: '08:00', txs: 245, gas: 35, blocks: 28 },
    { time: '12:00', txs: 180, gas: 30, blocks: 22 },
    { time: '16:00', txs: 220, gas: 32, blocks: 26 },
    { time: '20:00', txs: 195, gas: 28, blocks: 24 },
  ];

  const networkDistribution = [
    { name: 'Polygon', value: 45.5, color: '#8247E5' },
    { name: 'Ethereum', value: 33.9, color: '#627EEA' },
    { name: 'Arbitrum', value: 20.6, color: '#28A0F0' },
  ];

  const contractTypes = [
    { name: 'Energy Trading', contracts: 8, status: 'active' },
    { name: 'Token Contracts', contracts: 4, status: 'active' },
    { name: 'Settlement', contracts: 3, status: 'upgrading' },
    { name: 'Marketplace', contracts: 2, status: 'active' },
  ];

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    change?: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    loading?: boolean;
  }> = ({ title, value, change, icon: Icon, color, loading }) => (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          {loading ? (
            <div className="h-8 bg-gray-200 rounded animate-pulse mt-2"></div>
          ) : (
            <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          )}
          {change && (
            <p className="text-sm text-green-600 mt-1">
              <ArrowTrendingUpIcon className="w-4 h-4 inline mr-1" />
              {change}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  if (statsLoading || networkLoading || txLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({length: 4}).map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Blockchain Dashboard</h2>
          <p className="text-gray-600">Real-time blockchain and smart contract monitoring</p>
        </div>
        <div className="flex space-x-3">
          <select 
            value={selectedNetwork}
            onChange={(e) => setSelectedNetwork(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Networks</option>
            <option value="ethereum">Ethereum</option>
            <option value="polygon">Polygon</option>
            <option value="arbitrum">Arbitrum</option>
          </select>
          <select 
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24h</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Smart Contracts"
          value={statsData?.totalContracts || 0}
          change="+2 new"
          icon={CubeIcon}
          color="bg-blue-500"
        />
        <StatCard
          title="Network TPS"
          value={statsData?.avgTPS || 0}
          change="+12.5%"
          icon={ChartBarIcon}
          color="bg-green-500"
        />
        <StatCard
          title="Daily Transactions"
          value={txData?.total || 0}
          change="+8.3%"
          icon={BanknotesIcon}
          color="bg-purple-500"
        />
        <StatCard
          title="Verified Contracts"
          value={`${statsData?.verifiedContracts || 0}/${statsData?.totalContracts || 0}`}
          change="98.5% success"
          icon={ShieldCheckIcon}
          color="bg-orange-500"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transaction Volume Chart */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Volume</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="time" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Line type="monotone" dataKey="txs" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Network Distribution */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Network Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={networkDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name} ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {networkDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Network Status and Contract Types */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Network Status */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Network Status</h3>
          <div className="space-y-4">
            {networkData?.map((network: NetworkStat) => (
              <div key={network.network} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-gray-900 capitalize">{network.network}</p>
                    <p className="text-sm text-gray-600">Latest Block: {network.latestBlock.toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{network.tps} TPS</p>
                  <p className="text-sm text-gray-600">{network.pendingTxs} pending</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Smart Contract Types */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Smart Contract Types</h3>
          <div className="space-y-4">
            {contractTypes.map((type, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{type.name}</p>
                  <p className="text-sm text-gray-600">{type.contracts} contracts deployed</p>
                </div>
                <div className="flex items-center space-x-2">
                  {type.status === 'active' ? (
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  ) : (
                    <ClockIcon className="w-5 h-5 text-yellow-500" />
                  )}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    type.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {type.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Blockchain Activity</h3>
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            View All Transactions
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Network</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Gas Used</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Time</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-900">Energy Trade</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">Polygon</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                    Confirmed
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">125,430</td>
                <td className="py-3 px-4 text-sm text-gray-600">2 mins ago</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-gray-900">Token Transfer</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">Ethereum</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    Pending
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">65,432</td>
                <td className="py-3 px-4 text-sm text-gray-600">5 mins ago</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-900">Settlement</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">Arbitrum</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                    Completed
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">234,567</td>
                <td className="py-3 px-4 text-sm text-gray-600">8 mins ago</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BlockchainDashboard;