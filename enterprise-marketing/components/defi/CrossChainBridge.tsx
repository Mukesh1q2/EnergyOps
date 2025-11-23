'use client';

import React, { useState, useEffect } from 'react';
import { 
  ArrowRightIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CrossChainBridge: React.FC = () => {
  const [fromNetwork, setFromNetwork] = useState('ethereum');
  const [toNetwork, setToNetwork] = useState('polygon');
  const [selectedAsset, setSelectedAsset] = useState('SOLAR');
  const [bridgeAmount, setBridgeAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [bridgeHistory, setBridgeHistory] = useState<any[]>([]);
  const [supportedNetworks, setSupportedNetworks] = useState<any[]>([]);

  // Network data
  const networks = [
    {
      id: 'ethereum',
      name: 'Ethereum',
      symbol: 'ETH',
      chainId: 1,
      avgBlockTime: 12,
      gasPrice: '25 gwei',
      tvl: 2340000000,
      color: '#627EEA'
    },
    {
      id: 'polygon',
      name: 'Polygon',
      symbol: 'MATIC',
      chainId: 137,
      avgBlockTime: 2,
      gasPrice: '30 gwei',
      tvl: 567000000,
      color: '#8247E5'
    },
    {
      id: 'arbitrum',
      name: 'Arbitrum',
      symbol: 'ETH',
      chainId: 42161,
      avgBlockTime: 1,
      gasPrice: '0.1 gwei',
      tvl: 1230000000,
      color: '#28A0F0'
    },
    {
      id: 'optimism',
      name: 'Optimism',
      symbol: 'ETH',
      chainId: 10,
      avgBlockTime: 2,
      gasPrice: '0.001 gwei',
      tvl: 890000000,
      color: '#FF0420'
    },
    {
      id: 'bsc',
      name: 'BSC',
      symbol: 'BNB',
      chainId: 56,
      avgBlockTime: 3,
      gasPrice: '5 gwei',
      tvl: 345000000,
      color: '#F3BA2F'
    },
    {
      id: 'avalanche',
      name: 'Avalanche',
      symbol: 'AVAX',
      chainId: 43114,
      avgBlockTime: 1,
      gasPrice: '25 nAVAX',
      tvl: 234000000,
      color: '#E84142'
    }
  ];

  // Assets data
  const assets = [
    {
      symbol: 'SOLAR',
      name: 'Solar Energy Token',
      decimals: 18,
      addresses: {
        ethereum: '0x1234567890123456789012345678901234567890',
        polygon: '0x2345678901234567890123456789012345678901',
        arbitrum: '0x3456789012345678901234567890123456789012'
      }
    },
    {
      symbol: 'WIND',
      name: 'Wind Energy Token',
      decimals: 18,
      addresses: {
        ethereum: '0x7890123456789012345678901234567890123456',
        polygon: '0x8901234567890123456789012345678901234567',
        arbitrum: '0x9012345678901234567890123456789012345678'
      }
    },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      addresses: {
        ethereum: '0xA0b86a33E6416E5B0f5d8b3B1a7A2B3C4D5E6F7A',
        polygon: '0xB1c26A33E6416E5B0f5d8b3B1a7A2B3C4D5E6F7B',
        arbitrum: '0xC2d37A33E6416E5B0f5d8b3B1a7A2B3C4D5E6F7C'
      }
    },
    {
      symbol: 'OPBID',
      name: 'OptiBid Governance Token',
      decimals: 18,
      addresses: {
        ethereum: '0x1111111111111111111111111111111111111111',
        polygon: '0x2222222222222222222222222222222222222222',
        arbitrum: '0x3333333333333333333333333333333333333333'
      }
    }
  ];

  // Bridge metrics
  const bridgeMetrics = {
    totalVolume: 456789000,
    totalTransactions: 123456,
    averageTime: '2-5 minutes',
    successRate: 99.2,
    activeBridges: 6,
    feeStructure: 0.15
  };

  // Volume data for charts
  const volumeData = [
    { date: '2025-11-13', volume: 12.5, transactions: 2840 },
    { date: '2025-11-14', volume: 15.2, transactions: 3120 },
    { date: '2025-11-15', volume: 18.7, transactions: 3450 },
    { date: '2025-11-16', volume: 14.3, transactions: 2890 },
    { date: '2025-11-17', volume: 19.8, transactions: 3780 },
    { date: '2025-11-18', volume: 16.4, transactions: 3230 },
    { date: '2025-11-19', volume: 21.1, transactions: 4120 }
  ];

  // Bridge history
  const mockBridgeHistory = [
    {
      id: 'bridge-2024-123456',
      from: 'ethereum',
      to: 'polygon',
      asset: 'SOLAR',
      amount: 50000,
      value: 125000,
      status: 'completed',
      timestamp: '2025-11-19T01:45:00Z',
      txHash: {
        origin: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        destination: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
      },
      fees: {
        origin: 0.023,
        destination: 0.015,
        total: 0.038
      }
    },
    {
      id: 'bridge-2024-123457',
      from: 'arbitrum',
      to: 'ethereum',
      asset: 'WIND',
      amount: 75000,
      value: 187500,
      status: 'pending',
      timestamp: '2025-11-19T01:30:00Z',
      txHash: {
        origin: '0x2345678901234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        destination: null
      },
      fees: {
        origin: 0.012,
        destination: 0.035,
        total: 0.047
      }
    }
  ];

  useEffect(() => {
    setBridgeHistory(mockBridgeHistory);
    setSupportedNetworks(networks);
  }, []);

  const handleBridge = async () => {
    if (!bridgeAmount || parseFloat(bridgeAmount) <= 0) return;
    
    setIsLoading(true);
    try {
      // Simulate bridge transaction
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const newBridge = {
        id: `bridge-${Date.now()}`,
        from: fromNetwork,
        to: toNetwork,
        asset: selectedAsset,
        amount: parseFloat(bridgeAmount),
        value: parseFloat(bridgeAmount) * 2.5, // Mock price
        status: 'pending',
        timestamp: new Date().toISOString(),
        txHash: {
          origin: `0x${Math.random().toString(16).substr(2, 64)}`,
          destination: null
        },
        fees: {
          origin: 0.023,
          destination: 0.015,
          total: 0.038
        }
      };
      
      setBridgeHistory([newBridge, ...bridgeHistory]);
      setBridgeAmount('');
    } catch (error) {
      console.error('Bridge failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'pending': return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'failed': return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default: return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 10)}...${address.slice(-8)}`;
  };

  const selectedAssetData = assets.find(a => a.symbol === selectedAsset);
  const fromNetworkData = networks.find(n => n.id === fromNetwork);
  const toNetworkData = networks.find(n => n.id === toNetwork);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Cross-Chain Bridge</h1>
                <p className="mt-2 text-sm text-gray-600">
                  Transfer assets seamlessly across multiple blockchain networks
                </p>
              </div>
              <div className="flex space-x-4">
                <div className="bg-gray-100 px-4 py-2 rounded-lg">
                  <div className="text-sm text-gray-600">Total Volume</div>
                  <div className="text-lg font-semibold text-gray-900">${(bridgeMetrics.totalVolume / 1000000).toFixed(1)}M</div>
                </div>
                <div className="bg-gray-100 px-4 py-2 rounded-lg">
                  <div className="text-sm text-gray-600">Success Rate</div>
                  <div className="text-lg font-semibold text-gray-900">{bridgeMetrics.successRate}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Bridge Interface */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Bridge Assets</h3>
                <p className="mt-1 text-sm text-gray-600">
                  Transfer your assets between supported networks
                </p>
              </div>
              
              <div className="p-6">
                {/* From Network */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From Network
                  </label>
                  <select
                    value={fromNetwork}
                    onChange={(e) => setFromNetwork(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {networks.map((network) => (
                      <option key={network.id} value={network.id}>
                        {network.name} ({network.symbol})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Asset Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Asset
                  </label>
                  <select
                    value={selectedAsset}
                    onChange={(e) => setSelectedAsset(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {assets.map((asset) => (
                      <option key={asset.symbol} value={asset.symbol}>
                        {asset.symbol} - {asset.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Amount Input */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={bridgeAmount}
                      onChange={(e) => setBridgeAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <span className="text-gray-500 text-sm">{selectedAsset}</span>
                    </div>
                  </div>
                  {selectedAssetData && (
                    <p className="mt-1 text-xs text-gray-500">
                      Contract: {formatAddress(selectedAssetData.addresses[fromNetwork as keyof typeof selectedAssetData.addresses])}
                    </p>
                  )}
                </div>

                {/* Swap Direction Button */}
                <div className="flex justify-center mb-6">
                  <button
                    onClick={() => {
                      const temp = fromNetwork;
                      setFromNetwork(toNetwork);
                      setToNetwork(temp);
                    }}
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    <ArrowPathIcon className="h-5 w-5 text-gray-600" />
                  </button>
                </div>

                {/* To Network */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    To Network
                  </label>
                  <select
                    value={toNetwork}
                    onChange={(e) => setToNetwork(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {networks.map((network) => (
                      <option key={network.id} value={network.id}>
                        {network.name} ({network.symbol})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Bridge Summary */}
                {bridgeAmount && selectedAssetData && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Bridge Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">From:</span>
                        <span className="font-medium">{fromNetworkData?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">To:</span>
                        <span className="font-medium">{toNetworkData?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Amount:</span>
                        <span className="font-medium">{bridgeAmount} {selectedAsset}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Estimated Time:</span>
                        <span className="font-medium">2-5 minutes</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Bridge Fee:</span>
                        <span className="font-medium">$12.50</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-gray-600">Total Cost:</span>
                        <span className="font-medium">${(parseFloat(bridgeAmount) * 2.5 + 12.50).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Bridge Button */}
                <button
                  onClick={handleBridge}
                  disabled={!bridgeAmount || parseFloat(bridgeAmount) <= 0 || isLoading}
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <ArrowPathIcon className="animate-spin h-5 w-5 mr-2" />
                      Bridging...
                    </>
                  ) : (
                    <>
                      <ArrowRightIcon className="h-5 w-5 mr-2" />
                      Bridge Assets
                    </>
                  )}
                </button>

                {/* Security Notice */}
                <div className="mt-4 p-3 bg-blue-50 rounded-md">
                  <div className="flex">
                    <ShieldCheckIcon className="h-5 w-5 text-blue-400" />
                    <div className="ml-3">
                      <p className="text-sm text-blue-800">
                        Your transaction is secured by our multi-signature bridge protocol with a 99.8% security score.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bridge History */}
            <div className="mt-8 bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Bridge History</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Transfer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Asset
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bridgeHistory.map((bridge) => (
                      <tr key={bridge.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center">
                            <span className="font-medium text-gray-900">
                              {networks.find(n => n.id === bridge.from)?.name}
                            </span>
                            <ArrowRightIcon className="h-4 w-4 mx-2 text-gray-400" />
                            <span className="font-medium text-gray-900">
                              {networks.find(n => n.id === bridge.to)?.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {bridge.asset}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {bridge.amount.toLocaleString()} {bridge.asset}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getStatusIcon(bridge.status)}
                            <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(bridge.status)}`}>
                              {bridge.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(bridge.timestamp).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Network Information */}
          <div className="space-y-6">
            {/* Bridge Statistics */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Bridge Statistics</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Volume</span>
                  <span className="text-sm font-medium text-gray-900">
                    ${(bridgeMetrics.totalVolume / 1000000).toFixed(1)}M
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Transactions</span>
                  <span className="text-sm font-medium text-gray-900">
                    {bridgeMetrics.totalTransactions.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Average Time</span>
                  <span className="text-sm font-medium text-gray-900">
                    {bridgeMetrics.averageTime}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Success Rate</span>
                  <span className="text-sm font-medium text-green-600">
                    {bridgeMetrics.successRate}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Networks</span>
                  <span className="text-sm font-medium text-gray-900">
                    {bridgeMetrics.activeBridges}
                  </span>
                </div>
              </div>
            </div>

            {/* Supported Networks */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Supported Networks</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {networks.map((network) => (
                    <div key={network.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-3"
                          style={{ backgroundColor: network.color }}
                        ></div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {network.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {network.symbol} • TVL: ${(network.tvl / 1000000).toFixed(1)}M
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">
                          {network.avgBlockTime}s blocks
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Volume Chart */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Daily Volume</h3>
              </div>
              <div className="p-6">
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={volumeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
                    <YAxis tickFormatter={(value) => `$${value}M`} />
                    <Tooltip 
                      formatter={(value: number) => [`$${value}M`, 'Volume']}
                      labelFormatter={(label) => new Date(label).toLocaleDateString()}
                    />
                    <Area type="monotone" dataKey="volume" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Security Features */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Security Features</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-start">
                  <ShieldCheckIcon className="h-5 w-5 text-green-500 mt-0.5" />
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">Multi-Signature Validation</div>
                    <div className="text-xs text-gray-500">12 validators, 8 required signatures</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <ShieldCheckIcon className="h-5 w-5 text-green-500 mt-0.5" />
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">Optimistic Verification</div>
                    <div className="text-xs text-gray-500">7-day challenge period</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <ShieldCheckIcon className="h-5 w-5 text-green-500 mt-0.5" />
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">Insurance Coverage</div>
                    <div className="text-xs text-gray-500">$50M protocol insurance</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <ShieldCheckIcon className="h-5 w-5 text-green-500 mt-0.5" />
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">Audited Contracts</div>
                    <div className="text-xs text-gray-500">Smart contracts audited by leading firms</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrossChainBridge;