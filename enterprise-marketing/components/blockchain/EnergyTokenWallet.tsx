'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  WalletIcon, 
  ArrowUpIcon,
  ArrowDownIcon,
  PlusIcon,
  MinusIcon,
  ChartBarIcon,
  DocumentDuplicateIcon,
  ShieldCheckIcon,
  ClockIcon,
  CurrencyDollarIcon,
  CubeIcon
} from '@heroicons/react/24/outline';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface TokenBalance {
  id: string;
  address: string;
  tokenId: string;
  balance: string;
  locked: string;
  available: string;
  lastUpdated: string;
  token: {
    symbol: string;
    name: string;
    price: string;
    value: string;
  };
}

interface TokenTransfer {
  id: string;
  hash: string;
  tokenId: string;
  from: string;
  to: string;
  amount: string;
  timestamp: string;
  status: 'pending' | 'confirmed' | 'failed';
  network: string;
  method: 'transfer' | 'transferFrom' | 'mint' | 'burn';
}

interface EnergyToken {
  id: string;
  symbol: string;
  name: string;
  totalSupply: string;
  type: 'renewable' | 'fossil' | 'nuclear' | 'storage' | 'grid';
  sourceType: 'solar' | 'wind' | 'hydro' | 'geothermal' | 'coal' | 'gas' | 'nuclear' | 'battery';
  carbonOffset: string;
  location: string;
  tradingData: {
    price: string;
    volume24h: string;
    marketCap: string;
    priceChange24h: number;
  };
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16'];

const EnergyTokenWallet: React.FC = () => {
  const [selectedAddress, setSelectedAddress] = useState('0x742d35Cc6C1e7A8B1c6C3C9B2F4C2A5D8E9F1B3A');
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [transferForm, setTransferForm] = useState({
    tokenId: '',
    to: '',
    amount: ''
  });

  const queryClient = useQueryClient();

  // Mock wallet addresses
  const walletAddresses = [
    {
      address: '0x742d35Cc6C1e7A8B1c6C3C9B2F4C2A5D8E9F1B3A',
      label: 'Main Wallet',
      balance: '$143,250.00'
    },
    {
      address: '0x823c3C5c2B1C2A3E4F5B6C7D8E9F1A2B3C4D5E6F7',
      label: 'Trading Account',
      balance: '$67,420.50'
    },
    {
      address: '0x445A7E9B4C3D2E1F6A7B8C9D0E1F2A3B4C5D6E7F8',
      label: 'Escrow Wallet',
      balance: '$25,180.75'
    }
  ];

  // Fetch token balances
  const { data: balancesData, isLoading: balancesLoading } = useQuery({
    queryKey: ['token-balances', selectedAddress],
    queryFn: async () => {
      const params = new URLSearchParams({
        action: 'balances',
        address: selectedAddress
      });
      const response = await fetch(`/api/blockchain/energy-tokens?${params}`);
      const result = await response.json();
      return result.success ? result.data : [];
    },
    refetchInterval: 10000, // 10 seconds
  });

  // Fetch transfer history
  const { data: transfersData, isLoading: transfersLoading } = useQuery({
    queryKey: ['token-transfers', selectedAddress],
    queryFn: async () => {
      const params = new URLSearchParams({
        action: 'transfers',
        address: selectedAddress
      });
      const response = await fetch(`/api/blockchain/energy-tokens?${params}`);
      const result = await response.json();
      return result.success ? result.data.slice(0, 10) : [];
    },
    refetchInterval: 15000, // 15 seconds
  });

  // Fetch available tokens for trading
  const { data: tokensData, isLoading: tokensLoading } = useQuery({
    queryKey: ['energy-tokens'],
    queryFn: async () => {
      const response = await fetch('/api/blockchain/energy-tokens');
      const result = await response.json();
      return result.success ? result.data : [];
    },
  });

  // Transfer mutation
  const transferMutation = useMutation({
    mutationFn: async (transferData: any) => {
      const response = await fetch('/api/blockchain/energy-tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'transfer',
          tokenData: {
            ...transferData,
            from: selectedAddress,
            network: 'polygon', // Mock network
            gasLimit: '100000',
            gasPrice: '25000000000'
          }
        })
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['token-balances'] });
      queryClient.invalidateQueries({ queryKey: ['token-transfers'] });
      setShowTransferModal(false);
      setTransferForm({ tokenId: '', to: '', amount: '' });
    }
  });

  // Calculate portfolio statistics
  const portfolioStats = {
    totalValue: balancesData?.reduce((sum: number, balance: TokenBalance) => 
      sum + parseFloat(balance.token?.value || '0'), 0) || 0,
    totalTokens: balancesData?.length || 0,
    totalCarbonOffset: balancesData?.reduce((sum: number, balance: TokenBalance) => {
      const token = tokensData?.find((t: EnergyToken) => t.id === balance.tokenId);
      return sum + (parseFloat(balance.available) * parseFloat(token?.carbonOffset || '0') / 1000000);
    }, 0) || 0,
    todayChange: 1250.75, // Mock data
    todayChangePercent: 2.3
  };

  // Portfolio distribution data for pie chart
  const portfolioDistribution = balancesData?.map((balance: TokenBalance, index: number) => ({
    name: balance.token?.symbol || 'Unknown',
    value: parseFloat(balance.token?.value || '0'),
    color: COLORS[index % COLORS.length]
  })) || [];

  // Mock transaction volume data
  const transactionVolume = [
    { month: 'Jan', volume: 45000 },
    { month: 'Feb', volume: 52000 },
    { month: 'Mar', volume: 48000 },
    { month: 'Apr', volume: 61000 },
    { month: 'May', volume: 55000 },
    { month: 'Jun', volume: 67000 },
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const TokenCard: React.FC<{ balance: TokenBalance }> = ({ balance }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">
              {balance.token?.symbol?.slice(0, 2) || '??'}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{balance.token?.name}</h3>
            <p className="text-sm text-gray-600">{balance.token?.symbol}</p>
          </div>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
          parseFloat(balance.available) > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {parseFloat(balance.available) > 0 ? 'Active' : 'Inactive'}
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-sm text-gray-600">Available Balance</p>
          <p className="text-2xl font-bold text-gray-900">
            {parseFloat(balance.available).toLocaleString()}
            <span className="text-lg font-normal text-gray-600 ml-1">
              {balance.token?.symbol}
            </span>
          </p>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">USD Value:</span>
          <span className="font-medium">${balance.token?.value || '0'}</span>
        </div>

        {parseFloat(balance.locked) > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Locked:</span>
            <span className="font-medium text-yellow-600">{balance.locked}</span>
          </div>
        )}

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Price:</span>
          <span className="font-medium">${balance.token?.price || '0'}</span>
        </div>
      </div>

      <div className="flex space-x-2 mt-4">
        <button
          onClick={() => {
            setTransferForm({ ...transferForm, tokenId: balance.tokenId });
            setShowTransferModal(true);
          }}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
        >
          <ArrowUpIcon className="w-4 h-4 inline mr-1" />
          Send
        </button>
        <button
          onClick={() => setShowReceiveModal(true)}
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium transition-colors"
        >
          <ArrowDownIcon className="w-4 h-4 inline mr-1" />
          Receive
        </button>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Last updated: {new Date(balance.lastUpdated).toLocaleString()}
        </p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Energy Token Wallet</h2>
          <p className="text-gray-600">Manage your energy tokens across blockchain networks</p>
        </div>
        <div className="flex space-x-3">
          <select 
            value={selectedAddress}
            onChange={(e) => setSelectedAddress(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {walletAddresses.map((wallet) => (
              <option key={wallet.address} value={wallet.address}>
                {wallet.label} - {wallet.balance}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Portfolio Overview */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Total Portfolio Value</p>
            <p className="text-3xl font-bold text-gray-900">
              ${portfolioStats.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <div className={`flex items-center space-x-1 mt-2 ${
              portfolioStats.todayChange >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              <span className="text-sm font-medium">
                {portfolioStats.todayChange >= 0 ? '+' : ''}${portfolioStats.todayChange.toFixed(2)}
              </span>
              <span className="text-sm">
                ({portfolioStats.todayChangePercent >= 0 ? '+' : ''}{portfolioStats.todayChangePercent.toFixed(1)}%)
              </span>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Token Types</p>
            <p className="text-2xl font-bold text-gray-900">{portfolioStats.totalTokens}</p>
            <p className="text-sm text-gray-600 mt-2">Energy tokens held</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Carbon Offset</p>
            <p className="text-2xl font-bold text-gray-900">
              {portfolioStats.totalCarbonOffset.toFixed(1)}k
            </p>
            <p className="text-sm text-gray-600 mt-2">kg CO₂ offset</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Network Status</p>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-900">All Connected</span>
            </div>
            <p className="text-sm text-gray-600 mt-2">3 networks active</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Portfolio Distribution */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Distribution</h3>
          {portfolioDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={portfolioDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {portfolioDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Value']}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <WalletIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No tokens in portfolio</p>
              </div>
            </div>
          )}
        </div>

        {/* Transaction Volume */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Volume</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={transactionVolume}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Volume']}
              />
              <Bar dataKey="volume" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Wallet Address Card */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Wallet Information</h3>
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm text-gray-600 mb-1">Wallet Address</p>
            <div className="flex items-center space-x-2">
              <code className="text-sm font-mono bg-white px-2 py-1 rounded border">
                {selectedAddress.slice(0, 6)}...{selectedAddress.slice(-4)}
              </code>
              <button
                onClick={() => copyToClipboard(selectedAddress)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <DocumentDuplicateIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Network</p>
              <p className="font-medium">Polygon</p>
            </div>
            <div className="flex items-center space-x-1">
              <ShieldCheckIcon className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium text-green-600">Secure</span>
            </div>
          </div>
        </div>
      </div>

      {/* Token Balances */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Token Holdings</h3>
        
        {balancesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({length: 6}).map((_, i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-8 bg-gray-200 rounded w-24"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        ) : balancesData && balancesData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {balancesData.map((balance: TokenBalance) => (
              <TokenCard key={balance.id} balance={balance} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <WalletIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tokens found</h3>
            <p className="text-gray-600 mb-4">This wallet doesn't contain any energy tokens</p>
            <button
              onClick={() => setShowReceiveModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Receive Tokens
            </button>
          </div>
        )}
      </div>

      {/* Transfer History */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transfers</h3>
        
        {transfersLoading ? (
          <div className="space-y-3">
            {Array.from({length: 5}).map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        ) : transfersData && transfersData.length > 0 ? (
          <div className="space-y-3">
            {transfersData.map((transfer: TokenTransfer) => (
              <div key={transfer.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    transfer.from === selectedAddress ? 'bg-red-100' : 'bg-green-100'
                  }`}>
                    {transfer.from === selectedAddress ? (
                      <ArrowUpIcon className="w-4 h-4 text-red-600" />
                    ) : (
                      <ArrowDownIcon className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {transfer.from === selectedAddress ? 'Sent' : 'Received'} {transfer.amount}
                    </p>
                    <p className="text-sm text-gray-600">
                      {transfer.method} • {new Date(transfer.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    transfer.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    transfer.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {transfer.status}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{transfer.network}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <ClockIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No transfer history found</p>
          </div>
        )}
      </div>

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Send Energy Tokens</h3>
            
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                transferMutation.mutate(transferForm);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Token</label>
                <select
                  value={transferForm.tokenId}
                  onChange={(e) => setTransferForm({...transferForm, tokenId: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Token</option>
                  {balancesData?.map((balance: TokenBalance) => (
                    <option key={balance.tokenId} value={balance.tokenId}>
                      {balance.token?.symbol} - Available: {balance.available}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Address</label>
                <input
                  type="text"
                  value={transferForm.to}
                  onChange={(e) => setTransferForm({...transferForm, to: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0x..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <input
                  type="number"
                  step="0.000001"
                  value={transferForm.amount}
                  onChange={(e) => setTransferForm({...transferForm, amount: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.0"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={transferMutation.isPending}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {transferMutation.isPending ? 'Sending...' : 'Send Tokens'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receive Modal */}
      {showReceiveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Receive Energy Tokens</h3>
            
            <div className="text-center space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Your Wallet Address</p>
                <div className="flex items-center justify-center space-x-2">
                  <code className="text-sm font-mono bg-white px-3 py-2 rounded border flex-1 text-center">
                    {selectedAddress}
                  </code>
                  <button
                    onClick={() => copyToClipboard(selectedAddress)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <DocumentDuplicateIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowReceiveModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => copyToClipboard(selectedAddress)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Copy Address
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnergyTokenWallet;