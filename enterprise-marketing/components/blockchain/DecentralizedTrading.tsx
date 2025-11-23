'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ChartBarIcon, 
  CurrencyDollarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PlusIcon,
  MinusIcon,
  ShoppingCartIcon
} from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface TradeOrder {
  id: string;
  orderId: number;
  trader: string;
  type: 'buy' | 'sell';
  tokenId: string;
  tokenSymbol: string;
  amount: string;
  price: string;
  totalValue: string;
  status: 'open' | 'partial' | 'filled' | 'cancelled' | 'expired';
  filledAmount: string;
  remainingAmount: string;
  timestamp: string;
  network: string;
}

interface OrderBookData {
  tokenId: string;
  tokenSymbol: string;
  bids: Array<{
    price: string;
    amount: string;
    orders: number;
    totalValue: string;
  }>;
  asks: Array<{
    price: string;
    amount: string;
    orders: number;
    totalValue: string;
  }>;
  spread: {
    price: string;
    percentage: number;
  };
  lastPrice: string;
  priceChange24h: number;
  volume24h: string;
}

interface DEXPool {
  id: string;
  name: string;
  tokenASymbol: string;
  tokenBSymbol: string;
  totalValueLocked: string;
  volume24h: string;
  apy: number;
  participants: number;
  network: string;
}

const DecentralizedTrading: React.FC = () => {
  const [selectedToken, setSelectedToken] = useState('energy-solar-001');
  const [selectedNetwork, setSelectedNetwork] = useState('all');
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [orderForm, setOrderForm] = useState({
    amount: '',
    price: '',
    type: 'limit' as 'limit' | 'market',
    slippage: 1.0
  });

  const queryClient = useQueryClient();

  // Fetch order book
  const { data: orderBookData, isLoading: orderBookLoading } = useQuery({
    queryKey: ['orderbook', selectedToken],
    queryFn: async () => {
      const params = new URLSearchParams({
        action: 'orderbook',
        tokenId: selectedToken
      });
      const response = await fetch(`/api/blockchain/decentralized-trading?${params}`);
      const result = await response.json();
      return result.success ? result.data[0] : null;
    },
    refetchInterval: 2000, // 2 seconds for real-time updates
  });

  // Fetch recent orders
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['orders', selectedNetwork, selectedToken],
    queryFn: async () => {
      const params = new URLSearchParams({
        ...(selectedNetwork !== 'all' && { network: selectedNetwork }),
        tokenId: selectedToken,
        limit: '20'
      });
      const response = await fetch(`/api/blockchain/decentralized-trading?${params}`);
      const result = await response.json();
      return result.success ? result.data : [];
    },
  });

  // Fetch DEX pools
  const { data: poolsData, isLoading: poolsLoading } = useQuery({
    queryKey: ['pools', selectedNetwork],
    queryFn: async () => {
      const params = new URLSearchParams({
        action: 'pools',
        ...(selectedNetwork !== 'all' && { network: selectedNetwork })
      });
      const response = await fetch(`/api/blockchain/decentralized-trading?${params}`);
      const result = await response.json();
      return result.success ? result.data : [];
    },
  });

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await fetch('/api/blockchain/decentralized-trading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-order',
          orderData
        })
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orderbook'] });
      setShowOrderModal(false);
      setOrderForm({ amount: '', price: '', type: 'limit', slippage: 1.0 });
    }
  });

  // Cancel order mutation
  const cancelOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const response = await fetch('/api/blockchain/decentralized-trading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'cancel-order',
          orderData: {
            orderId,
            trader: '0x742d35Cc6C1e7A8B1c6C3C9B2F4C2A5D8E9F1B3A' // Mock current user
          }
        })
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    }
  });

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    createOrderMutation.mutate({
      trader: '0x742d35Cc6C1e7A8B1c6C3C9B2F4C2A5D8E9F1B3A', // Mock current user
      type: orderType,
      tokenId: selectedToken,
      tokenSymbol: orderBookData?.tokenSymbol || 'ESOLAR',
      amount: orderForm.amount,
      price: orderForm.price,
      network: selectedNetwork === 'all' ? 'polygon' : selectedNetwork,
      slippage: orderForm.slippage
    });
  };

  const calculateTotal = () => {
    const amount = parseFloat(orderForm.amount) || 0;
    const price = parseFloat(orderForm.price) || 0;
    return (amount * price).toFixed(3);
  };

  // Mock price history data for chart
  const priceHistory = [
    { time: '09:00', price: 0.083, volume: 1200 },
    { time: '10:00', price: 0.084, volume: 1400 },
    { time: '11:00', price: 0.085, volume: 1600 },
    { time: '12:00', price: 0.086, volume: 1800 },
    { time: '13:00', price: 0.085, volume: 1500 },
    { time: '14:00', price: 0.087, volume: 2000 },
    { time: '15:00', price: 0.085, volume: 1700 },
    { time: '16:00', price: 0.088, volume: 2200 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Decentralized Trading</h2>
          <p className="text-gray-600">Trade energy tokens on blockchain networks</p>
        </div>
        <div className="flex space-x-3">
          <select 
            value={selectedToken}
            onChange={(e) => setSelectedToken(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="energy-solar-001">ESOLAR (Solar Energy)</option>
            <option value="energy-wind-002">EWIND (Wind Energy)</option>
            <option value="energy-storage-003">ESTORAGE (Energy Storage)</option>
            <option value="energy-hydro-004">EHYDRO (Hydro Power)</option>
          </select>
          <select 
            value={selectedNetwork}
            onChange={(e) => setSelectedNetwork(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Networks</option>
            <option value="polygon">Polygon</option>
            <option value="ethereum">Ethereum</option>
            <option value="arbitrum">Arbitrum</option>
          </select>
        </div>
      </div>

      {/* Trading Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Price Chart */}
        <div className="lg:col-span-2 bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {orderBookData?.tokenSymbol} Price Chart
            </h3>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Current:</span>
                <span className="text-lg font-bold text-gray-900">
                  ${orderBookData?.lastPrice || '0.085'}
                </span>
                <div className={`flex items-center space-x-1 ${
                  (orderBookData?.priceChange24h || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {(orderBookData?.priceChange24h || 0) >= 0 ? (
                    <ArrowUpIcon className="w-4 h-4" />
                  ) : (
                    <ArrowDownIcon className="w-4 h-4" />
                  )}
                  <span className="text-sm font-medium">
                    {orderBookData?.priceChange24h?.toFixed(2) || '2.1'}%
                  </span>
                </div>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={priceHistory}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="time" stroke="#6b7280" />
              <YAxis stroke="#6b7280" domain={['dataMin - 0.001', 'dataMax + 0.001']} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="price" 
                stroke="#3B82F6" 
                strokeWidth={2}
                fill="url(#priceGradient)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Order Form */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Place Order</h3>
          
          <div className="flex rounded-lg border border-gray-300 mb-4">
            <button
              type="button"
              onClick={() => setOrderType('buy')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-l-lg transition-colors ${
                orderType === 'buy'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <ArrowUpIcon className="w-4 h-4 inline mr-1" />
              Buy
            </button>
            <button
              type="button"
              onClick={() => setOrderType('sell')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-r-lg transition-colors ${
                orderType === 'sell'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <ArrowDownIcon className="w-4 h-4 inline mr-1" />
              Sell
            </button>
          </div>

          <form onSubmit={handleCreateOrder} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order Type
              </label>
              <select
                value={orderForm.type}
                onChange={(e) => setOrderForm({...orderForm, type: e.target.value as 'limit' | 'market'})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="limit">Limit Order</option>
                <option value="market">Market Order</option>
              </select>
            </div>

            {orderForm.type === 'limit' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (USD)
                </label>
                <input
                  type="number"
                  step="0.000001"
                  value={orderForm.price}
                  onChange={(e) => setOrderForm({...orderForm, price: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.085"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount
              </label>
              <input
                type="number"
                step="0.001"
                value={orderForm.amount}
                onChange={(e) => setOrderForm({...orderForm, amount: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="1000"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slippage Tolerance (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={orderForm.slippage}
                onChange={(e) => setOrderForm({...orderForm, slippage: parseFloat(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="1.0"
                min="0.1"
                max="50"
              />
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Value:</span>
                <span className="font-medium">${calculateTotal()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Fee (0.1%):</span>
                <span className="font-medium">${(parseFloat(calculateTotal()) * 0.001).toFixed(6)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={createOrderMutation.isPending}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                orderType === 'buy'
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              {createOrderMutation.isPending ? 'Placing Order...' : 
                `${orderType === 'buy' ? 'Buy' : 'Sell'} ${orderBookData?.tokenSymbol || 'Token'}`
              }
            </button>
          </form>
        </div>
      </div>

      {/* Order Book and Recent Trades */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Book */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Book</h3>
          
          {orderBookLoading ? (
            <div className="animate-pulse space-y-2">
              {Array.from({length: 10}).map((_, i) => (
                <div key={i} className="h-6 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : orderBookData ? (
            <div className="space-y-2">
              {/* Asks (Sell Orders) */}
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-red-600 mb-2">Asks</h4>
                {orderBookData.asks.slice(0, 5).map((ask: any, index: number) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-red-600 font-mono">{ask.price}</span>
                    <span className="text-gray-600">{ask.amount}</span>
                    <span className="text-gray-500">{ask.totalValue}</span>
                  </div>
                ))}
              </div>

              {/* Spread */}
              <div className="bg-gray-50 rounded-lg p-2 my-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Spread:</span>
                  <span className="text-sm font-medium">
                    ${orderBookData.spread.price} ({orderBookData.spread.percentage}%)
                  </span>
                </div>
              </div>

              {/* Bids (Buy Orders) */}
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-green-600 mb-2">Bids</h4>
                {orderBookData.bids.slice(0, 5).map((bid: any, index: number) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-green-600 font-mono">{bid.price}</span>
                    <span className="text-gray-600">{bid.amount}</span>
                    <span className="text-gray-500">{bid.totalValue}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No order book data available</p>
          )}
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
          
          {ordersLoading ? (
            <div className="animate-pulse space-y-2">
              {Array.from({length: 8}).map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {ordersData?.slice(0, 8).map((order: TradeOrder) => (
                <div key={order.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      order.type === 'buy' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {order.type.toUpperCase()} {order.tokenSymbol}
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.amount} @ ${order.price}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === 'open' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'filled' ? 'bg-green-100 text-green-800' :
                      order.status === 'cancelled' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {order.status}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(order.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* DEX Pools */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Liquidity Pools</h3>
        
        {poolsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({length: 6}).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {poolsData?.map((pool: DEXPool) => (
              <div key={pool.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{pool.name}</h4>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                    {pool.network}
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">TVL:</span>
                    <span className="font-medium">${parseFloat(pool.totalValueLocked).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">24h Volume:</span>
                    <span className="font-medium">${parseFloat(pool.volume24h).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">APY:</span>
                    <span className="font-medium text-green-600">{pool.apy}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">LPs:</span>
                    <span className="font-medium">{pool.participants}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DecentralizedTrading;