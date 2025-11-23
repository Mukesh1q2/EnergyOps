'use client';

import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  AdjustmentsHorizontalIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';

const DerivativesTrading: React.FC = () => {
  const [activeTab, setActiveTab] = useState('futures');
  const [selectedProduct, setSelectedProduct] = useState('SOLARQ125');
  const [orderType, setOrderType] = useState('market');
  const [orderSide, setOrderSide] = useState('buy');
  const [orderAmount, setOrderAmount] = useState('');
  const [orderPrice, setOrderPrice] = useState('');
  const [leverage, setLeverage] = useState(1);
  const [loading, setLoading] = useState(false);

  // Futures contracts data
  const futures = [
    {
      id: 'SOLAR-USD-FUTURE-Q1-2025',
      symbol: 'SOLARQ125',
      name: 'Solar Energy Futures Q1 2025',
      underlying: 'SOLAR',
      lastPrice: 2.74,
      change24h: 0.12,
      changePercent: 4.58,
      bid: 2.73,
      ask: 2.75,
      volume24h: 123456,
      openInterest: 456789,
      expiration: '2025-03-28T16:00:00Z',
      marginRequirement: 15,
      fundingRate: 0.0234,
      impliedVolatility: 45.7
    },
    {
      id: 'WIND-USD-FUTURE-Q1-2025',
      symbol: 'WINDQ125',
      name: 'Wind Energy Futures Q1 2025',
      underlying: 'WIND',
      lastPrice: 3.21,
      change24h: -0.08,
      changePercent: -2.43,
      bid: 3.20,
      ask: 3.22,
      volume24h: 234567,
      openInterest: 567890,
      expiration: '2025-03-28T16:00:00Z',
      marginRequirement: 12,
      fundingRate: 0.0198,
      impliedVolatility: 52.3
    }
  ];

  // Options data
  const options = [
    {
      id: 'SOLAR-USD-OPTION-2.5C-2025-01-15',
      symbol: 'SOLAR2.5C0115',
      underlying: 'SOLAR',
      type: 'call',
      strike: 2.50,
      lastPrice: 0.35,
      change24h: 0.02,
      changePercent: 6.06,
      bid: 0.34,
      ask: 0.36,
      volume24h: 2345,
      openInterest: 45678,
      impliedVolatility: 48.2,
      delta: 0.65,
      gamma: 0.12,
      theta: -0.008,
      vega: 0.045,
      expiration: '2025-01-15T16:00:00Z'
    },
    {
      id: 'SOLAR-USD-OPTION-2.0P-2025-01-15',
      symbol: 'SOLAR2.0P0115',
      underlying: 'SOLAR',
      type: 'put',
      strike: 2.00,
      lastPrice: 0.12,
      change24h: -0.01,
      changePercent: -7.69,
      bid: 0.11,
      ask: 0.13,
      volume24h: 1234,
      openInterest: 23456,
      impliedVolatility: 51.7,
      delta: -0.28,
      gamma: 0.08,
      theta: -0.006,
      vega: 0.042,
      expiration: '2025-01-15T16:00:00Z'
    }
  ];

  // Swaps data
  const swaps = [
    {
      id: 'ENERGY-VOLATILITY-SWAP-Q1-2025',
      symbol: 'ENERGYVOLQ125',
      name: 'Energy Sector Volatility Swap Q1 2025',
      underlying: 'Energy Basket Index',
      notional: 10000000,
      realizedVolatility: 42.3,
      impliedVolatility: 48.5,
      volatilitySpread: 6.2,
      settlementDate: '2025-03-31T16:00:00Z',
      markToMarket: 156789,
      pnl: 45678
    }
  ];

  // Structured products data
  const structuredProducts = [
    {
      id: 'ENERGY-BOOSTER-01-2026',
      symbol: 'ENERGYBOOST2026',
      name: 'Energy Market Booster Certificate 2026',
      underlying: 'Energy Basket (SOLAR 40%, WIND 40%, BATT 20%)',
      currentPrice: 108.45,
      totalReturn: 8.45,
      participationRate: 150,
      barrierLevel: 1.50,
      coupon: 5.0,
      maturityDate: '2026-01-15T00:00:00Z',
      creditRating: 'A+'
    }
  ];

  // Price data for charts
  const priceData = [
    { time: '09:00', solar: 2.65, wind: 3.25, volume: 1250 },
    { time: '10:00', solar: 2.68, wind: 3.22, volume: 1560 },
    { time: '11:00', solar: 2.72, wind: 3.28, volume: 1890 },
    { time: '12:00', solar: 2.74, wind: 3.21, volume: 2100 },
    { time: '13:00', solar: 2.76, wind: 3.24, volume: 1950 },
    { time: '14:00', solar: 2.73, wind: 3.19, volume: 2300 },
    { time: '15:00', solar: 2.74, wind: 3.21, volume: 2650 }
  ];

  // Greeks visualization data
  const greeksData = [
    { strike: 2.0, callDelta: 0.85, putDelta: -0.15, callIV: 52.3, putIV: 54.1 },
    { strike: 2.2, callDelta: 0.72, putDelta: -0.28, callIV: 50.8, putIV: 51.2 },
    { strike: 2.4, callDelta: 0.58, putDelta: -0.42, callIV: 49.2, putIV: 49.8 },
    { strike: 2.6, callDelta: 0.42, putDelta: -0.58, callIV: 48.1, putIV: 48.5 },
    { strike: 2.8, callDelta: 0.28, putDelta: -0.72, callIV: 47.3, putIV: 47.9 }
  ];

  // Portfolio data
  const portfolio = {
    totalValue: 125000,
    marginUsed: 18750,
    availableMargin: 106250,
    unrealizedPnL: 2340,
    realizedPnL: 5670,
    dailyPnL: 450,
    positions: [
      {
        symbol: 'SOLARQ125',
        type: 'long',
        size: 100,
        entryPrice: 2.68,
        currentPrice: 2.74,
        margin: 4020,
        pnl: 600,
        pnlPercent: 14.93
      },
      {
        symbol: 'SOLAR2.5C0115',
        type: 'long',
        size: 50,
        entryPrice: 0.32,
        currentPrice: 0.35,
        margin: 160,
        pnl: 150,
        pnlPercent: 9.38
      }
    ]
  };

  const tabs = [
    { id: 'futures', name: 'Futures', icon: ChartBarIcon },
    { id: 'options', name: 'Options', icon: CurrencyDollarIcon },
    { id: 'swaps', name: 'Swaps', icon: ArrowTrendingUpIcon },
    { id: 'structured', name: 'Structured', icon: AdjustmentsHorizontalIcon },
    { id: 'portfolio', name: 'Portfolio', icon: ArrowTrendingDownIcon }
  ];

  const selectedProductData = [...futures, ...options, ...swaps, ...structuredProducts].find(p => 
    p.symbol === selectedProduct || p.id === selectedProduct
  );

  const handlePlaceOrder = async () => {
    if (!orderAmount || parseFloat(orderAmount) <= 0) return;
    
    setLoading(true);
    try {
      // Simulate order placement
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Order placed:', {
        product: selectedProduct,
        side: orderSide,
        type: orderType,
        amount: orderAmount,
        price: orderPrice || 'market',
        leverage
      });
      // Reset form
      setOrderAmount('');
      setOrderPrice('');
    } catch (error) {
      console.error('Order failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMargin = (amount: number, price: number, marginReq: number) => {
    return (amount * price * marginReq) / 100;
  };

  const calculateLeverage = (positionValue: number, marginUsed: number) => {
    return positionValue / marginUsed;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Derivatives Trading</h1>
                <p className="mt-2 text-sm text-gray-600">
                  Trade futures, options, swaps, and structured products
                </p>
              </div>
              <div className="flex space-x-4">
                <div className="bg-gray-100 px-4 py-2 rounded-lg">
                  <div className="text-sm text-gray-600">Portfolio Value</div>
                  <div className="text-lg font-semibold text-gray-900">${portfolio.totalValue.toLocaleString()}</div>
                </div>
                <div className="bg-gray-100 px-4 py-2 rounded-lg">
                  <div className="text-sm text-gray-600">Daily P&L</div>
                  <div className={`text-lg font-semibold ${portfolio.dailyPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${portfolio.dailyPnL >= 0 ? '+' : ''}${portfolio.dailyPnL}
                  </div>
                </div>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Trading Interface */}
          <div className="lg:col-span-3">
            {activeTab === 'futures' && (
              <div className="space-y-6">
                {/* Futures Products */}
                <div className="bg-white shadow rounded-lg">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Futures Contracts</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Contract
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Last Price
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            24h Change
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Volume
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            OI
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {futures.map((future) => (
                          <tr key={future.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{future.symbol}</div>
                                <div className="text-sm text-gray-500">{future.name}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ${future.lastPrice.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                future.changePercent >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {future.changePercent >= 0 ? '+' : ''}{future.changePercent.toFixed(2)}%
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {future.volume24h.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {future.openInterest.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => setSelectedProduct(future.symbol)}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                Trade
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Price Chart */}
                <div className="bg-white shadow rounded-lg">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Real-time Prices</h3>
                  </div>
                  <div className="p-6">
                    <ResponsiveContainer width="100%" height={400}>
                      <ComposedChart data={priceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis yAxisId="price" orientation="left" />
                        <YAxis yAxisId="volume" orientation="right" />
                        <Tooltip />
                        <Legend />
                        <Line yAxisId="price" type="monotone" dataKey="solar" stroke="#8b5cf6" strokeWidth={2} name="SOLAR" />
                        <Line yAxisId="price" type="monotone" dataKey="wind" stroke="#10b981" strokeWidth={2} name="WIND" />
                        <Bar yAxisId="volume" dataKey="volume" fill="#f3f4f6" name="Volume" />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'options' && (
              <div className="space-y-6">
                {/* Options Chain */}
                <div className="bg-white shadow rounded-lg">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Options Chain</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Symbol
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Strike
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Price
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            IV
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Greeks
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {options.map((option) => (
                          <tr key={option.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {option.symbol}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ${option.strike.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                option.type === 'call' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {option.type.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ${option.lastPrice.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {option.impliedVolatility.toFixed(1)}%
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                              Δ:{option.delta.toFixed(2)} Γ:{option.gamma.toFixed(3)} Θ:{option.theta.toFixed(3)} V:{option.vega.toFixed(3)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => setSelectedProduct(option.symbol)}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                Trade
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Greeks Visualization */}
                <div className="bg-white shadow rounded-lg">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Greeks Visualization</h3>
                  </div>
                  <div className="p-6">
                    <ResponsiveContainer width="100%" height={400}>
                      <ScatterChart data={greeksData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="strike" name="Strike Price" />
                        <YAxis dataKey="callDelta" name="Delta" />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                        <Scatter name="Call Delta" data={greeksData.map(d => ({ x: d.strike, y: d.callDelta }))} fill="#8b5cf6" />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'swaps' && (
              <div className="space-y-6">
                <div className="bg-white shadow rounded-lg">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Available Swaps</h3>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {swaps.map((swap) => (
                        <div key={swap.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-lg font-medium text-gray-900">{swap.name}</h4>
                            <span className="text-sm text-gray-500">{swap.symbol}</span>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Notional:</span>
                              <span className="font-medium">${(swap.notional / 1000000).toFixed(1)}M</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Realized Vol:</span>
                              <span className="font-medium">{swap.realizedVolatility}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Implied Vol:</span>
                              <span className="font-medium">{swap.impliedVolatility}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Vol Spread:</span>
                              <span className="font-medium text-green-600">+{swap.volatilitySpread}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">PnL:</span>
                              <span className="font-medium text-green-600">+${swap.pnl.toLocaleString()}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => setSelectedProduct(swap.symbol)}
                            className="mt-4 w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700"
                          >
                            Trade Swap
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'structured' && (
              <div className="space-y-6">
                <div className="bg-white shadow rounded-lg">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Structured Products</h3>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {structuredProducts.map((product) => (
                        <div key={product.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-lg font-medium text-gray-900">{product.name}</h4>
                            <span className="text-sm text-gray-500">{product.symbol}</span>
                          </div>
                          <div className="space-y-2 text-sm mb-4">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Current Price:</span>
                              <span className="font-medium">${product.currentPrice.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Total Return:</span>
                              <span className="font-medium text-green-600">+{product.totalReturn.toFixed(2)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Participation:</span>
                              <span className="font-medium">{product.participationRate}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Barrier Level:</span>
                              <span className="font-medium">{product.barrierLevel}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Annual Coupon:</span>
                              <span className="font-medium">{product.coupon}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Credit Rating:</span>
                              <span className="font-medium">{product.creditRating}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => setSelectedProduct(product.symbol)}
                            className="w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700"
                          >
                            Invest
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'portfolio' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Value</dt>
                      <dd className="text-lg font-medium text-gray-900">${portfolio.totalValue.toLocaleString()}</dd>
                    </div>
                  </div>
                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                      <dt className="text-sm font-medium text-gray-500 truncate">Margin Used</dt>
                      <dd className="text-lg font-medium text-gray-900">${portfolio.marginUsed.toLocaleString()}</dd>
                    </div>
                  </div>
                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                      <dt className="text-sm font-medium text-gray-500 truncate">Unrealized P&L</dt>
                      <dd className="text-lg font-medium text-green-600">+${portfolio.unrealizedPnL.toLocaleString()}</dd>
                    </div>
                  </div>
                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                      <dt className="text-sm font-medium text-gray-500 truncate">Realized P&L</dt>
                      <dd className="text-lg font-medium text-green-600">+${portfolio.realizedPnL.toLocaleString()}</dd>
                    </div>
                  </div>
                </div>

                <div className="bg-white shadow rounded-lg">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Open Positions</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Symbol
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Size
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Entry Price
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Current Price
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            P&L
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Margin
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {portfolio.positions.map((position, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {position.symbol}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                position.type === 'long' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {position.type.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {position.size}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ${position.entryPrice.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ${position.currentPrice.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className={`font-medium ${
                                position.pnl >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {position.pnl >= 0 ? '+' : ''}${position.pnl} ({position.pnlPercent.toFixed(2)}%)
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ${position.margin.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Trading Panel */}
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Place Order</h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product
                  </label>
                  <select
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {[...futures, ...options, ...swaps, ...structuredProducts].map((product) => (
                      <option key={product.symbol} value={product.symbol}>
                        {product.symbol}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order Type
                  </label>
                  <select
                    value={orderType}
                    onChange={(e) => setOrderType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="market">Market</option>
                    <option value="limit">Limit</option>
                    <option value="stop">Stop</option>
                    <option value="stop_limit">Stop Limit</option>
                  </select>
                </div>

                <div className="flex space-x-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Side
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setOrderSide('buy')}
                        className={`py-2 px-4 rounded-md text-sm font-medium ${
                          orderSide === 'buy'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                        }`}
                      >
                        Buy
                      </button>
                      <button
                        onClick={() => setOrderSide('sell')}
                        className={`py-2 px-4 rounded-md text-sm font-medium ${
                          orderSide === 'sell'
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                        }`}
                      >
                        Sell
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount
                  </label>
                  <input
                    type="number"
                    value={orderAmount}
                    onChange={(e) => setOrderAmount(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                {orderType === 'limit' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price
                    </label>
                    <input
                      type="number"
                      value={orderPrice}
                      onChange={(e) => setOrderPrice(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                )}

                {selectedProductData && 'marginRequirement' in selectedProductData && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Leverage
                    </label>
                    <select
                      value={leverage}
                      onChange={(e) => setLeverage(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value={1}>1x</option>
                      <option value={2}>2x</option>
                      <option value={5}>5x</option>
                      <option value={10}>10x</option>
                      <option value={20}>20x</option>
                    </select>
                  </div>
                )}

                {orderAmount && selectedProductData && (
                  <div className="p-3 bg-gray-50 rounded-md">
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Margin Required:</span>
                        <span className="font-medium">
                          ${orderAmount && selectedProductData && 'marginRequirement' in selectedProductData
                            ? calculateMargin(parseFloat(orderAmount), selectedProductData.lastPrice || 0, selectedProductData.marginRequirement).toFixed(0)
                            : '0'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Position Value:</span>
                        <span className="font-medium">
                          ${orderAmount && selectedProductData && 'lastPrice' in selectedProductData
                            ? (parseFloat(orderAmount) * (selectedProductData.lastPrice || 0)).toFixed(0)
                            : '0'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={handlePlaceOrder}
                  disabled={!orderAmount || parseFloat(orderAmount) <= 0 || loading}
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Placing Order...' : `${orderSide.toUpperCase()} ${selectedProduct}`}
                </button>
              </div>
            </div>

            {/* Market Info */}
            {selectedProductData && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Market Info</h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Bid/Ask:</span>
                    <span className="text-sm font-medium text-gray-900">
                      ${selectedProductData.bid?.toFixed(2) || 'N/A'} / ${selectedProductData.ask?.toFixed(2) || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Volume 24h:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {selectedProductData.volume24h?.toLocaleString() || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Open Interest:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {selectedProductData.openInterest?.toLocaleString() || 'N/A'}
                    </span>
                  </div>
                  {'marginRequirement' in selectedProductData && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Margin Req:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {selectedProductData.marginRequirement}%
                      </span>
                    </div>
                  )}
                  {'impliedVolatility' in selectedProductData && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Implied Vol:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {selectedProductData.impliedVolatility?.toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Risk Management */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Risk Management</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-2" />
                  <span className="text-sm text-gray-700">Derivatives trading involves significant risk</span>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <p>• Past performance does not guarantee future results</p>
                  <p>• You can lose more than your initial investment</p>
                  <p>• Please ensure you understand the risks involved</p>
                  <p>• Consider your financial situation before trading</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DerivativesTrading;