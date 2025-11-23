/**
 * Real-time Dashboard Component
 * Live market data with WebSocket updates
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar
} from 'recharts';
import { 
  ChartBarIcon, 
  CpuChipIcon, 
  BoltIcon, 
  FireIcon,
  EyeIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { useWebSocket } from '../../lib/websocket';

interface PriceData {
  timestamp: string;
  price: number;
  volume: number;
  market_zone: string;
  change?: number;
  change_percent?: number;
}

interface MarketData {
  marketZone: string;
  latestPrice: number;
  previousPrice: number;
  change: number;
  changePercent: number;
  volume: number;
  lastUpdate: string;
  status: 'open' | 'closed' | 'unknown';
}

interface MarketZone {
  id: string;
  name: string;
  status: 'connected' | 'disconnected' | 'connecting';
  price: number;
  change: number;
  changePercent: number;
  lastUpdate: string;
}

const marketZones = [
  { id: 'pjm', name: 'PJM', color: '#FDB813' },
  { id: 'caiso', name: 'CAISO', color: '#0072BC' },
  { id: 'ercot', name: 'ERCOT', color: '#00A9E0' },
  { id: 'nyiso', name: 'NYISO', color: '#FF6B35' },
  { id: 'miso', name: 'MISO', color: '#C1272D' },
  { id: 'spp', name: 'SPP', color: '#8E44AD' }
];

export default function RealTimeDashboard() {
  const [selectedZone, setSelectedZone] = useState('pjm');
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [marketData, setMarketData] = useState<Record<string, MarketData>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [connectionStats, setConnectionStats] = useState<any>(null);

  // WebSocket connection for selected market zone
  const { 
    isConnected, 
    connectionId, 
    connect, 
    disconnect, 
    ping,
    requestPriceHistory
  } = useWebSocket(selectedZone, {
    autoConnect: true,
    onPriceUpdate: (data) => handlePriceUpdate(data),
    onMarketAlert: (data) => handleMarketAlert(data),
    onPriceChange: (data) => handlePriceChange(data),
    onMarketStatus: (data) => handleMarketStatus(data)
  });

  // Handle price updates
  const handlePriceUpdate = useCallback((data: any) => {
    const newData: PriceData = {
      timestamp: data.timestamp,
      price: data.price,
      volume: data.volume,
      market_zone: data.market_zone
    };

    setPriceData(prev => {
      const updated = [...prev, newData];
      // Keep only last 100 data points
      return updated.slice(-100);
    });

    // Update market data
    setMarketData(prev => {
      const current = prev[data.market_zone];
      const previousPrice = current?.latestPrice || data.price;
      const change = data.price - previousPrice;
      const changePercent = previousPrice > 0 ? (change / previousPrice) * 100 : 0;

      return {
        ...prev,
        [data.market_zone]: {
          marketZone: data.market_zone,
          latestPrice: data.price,
          previousPrice,
          change,
          changePercent,
          volume: data.volume,
          lastUpdate: data.timestamp,
          status: 'open' // Assume open for demo
        }
      };
    });

    setLastUpdate(new Date());
    setIsLoading(false);
  }, []);

  // Handle market alerts
  const handleMarketAlert = useCallback((data: any) => {
    console.log('Market alert:', data);
    // You can add toast notifications or other alert handling here
  }, []);

  // Handle price changes
  const handlePriceChange = useCallback((data: any) => {
    console.log('Price change:', data);
    // Update existing data point with change info
    setPriceData(prev => prev.map(item => 
      item.market_zone === data.market_zone 
        ? { ...item, change: data.change_percent, change_percent: data.change_percent }
        : item
    ));
  }, []);

  // Handle market status changes
  const handleMarketStatus = useCallback((data: any) => {
    setMarketData(prev => ({
      ...prev,
      [data.market_zone]: {
        ...prev[data.market_zone],
        status: data.status
      }
    }));
  }, []);

  // Generate sample data for demonstration
  useEffect(() => {
    const generateSampleData = () => {
      const now = new Date();
      const sampleData: PriceData[] = [];
      
      for (let i = 99; i >= 0; i--) {
        const timestamp = new Date(now.getTime() - i * 60000); // Every minute for last 100 minutes
        const basePrice = 50 + Math.sin(i / 10) * 10 + (Math.random() - 0.5) * 5;
        
        sampleData.push({
          timestamp: timestamp.toISOString(),
          price: Math.max(basePrice, 10), // Ensure positive price
          volume: Math.random() * 1000 + 500,
          market_zone: selectedZone,
          change: i === 99 ? 0 : (Math.random() - 0.5) * 5,
          change_percent: i === 99 ? 0 : (Math.random() - 0.5) * 10
        });
      }
      
      setPriceData(sampleData);
      
      // Generate market data for all zones
      const marketData: Record<string, MarketData> = {};
      marketZones.forEach(zone => {
        const basePrice = 50 + (Math.random() - 0.5) * 20;
        const previousPrice = basePrice + (Math.random() - 0.5) * 5;
        const change = basePrice - previousPrice;
        const changePercent = previousPrice > 0 ? (change / previousPrice) * 100 : 0;
        
        marketData[zone.id] = {
          marketZone: zone.id,
          latestPrice: basePrice,
          previousPrice,
          change,
          changePercent,
          volume: Math.random() * 1000 + 500,
          lastUpdate: now.toISOString(),
          status: 'open'
        };
      });
      
      setMarketData(marketData);
      setLastUpdate(now);
      setIsLoading(false);
    };

    generateSampleData();
  }, [selectedZone]);

  // Format price for display
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  // Format percentage
  const formatPercent = (percent: number) => {
    const sign = percent >= 0 ? '+' : '';
    return `${sign}${percent.toFixed(2)}%`;
  };

  // Get current zone data
  const currentZoneData = marketData[selectedZone];
  const currentZoneInfo = marketZones.find(z => z.id === selectedZone);

  // Prepare chart data
  const chartData = priceData.map(item => ({
    time: new Date(item.timestamp).toLocaleTimeString(),
    price: item.price,
    volume: item.volume,
    change: item.change_percent || 0
  }));

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <CpuChipIcon className="w-8 h-8 text-wind-blue" />
              Real-time Market Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Live market data and price updates via WebSocket connections
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
              isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              {isConnected ? 'Connected' : 'Disconnected'}
            </div>
            <button
              onClick={() => requestPriceHistory(24)}
              className="flex items-center gap-2 px-4 py-2 bg-wind-blue text-white rounded-lg hover:bg-wind-blue/90 transition-colors"
            >
              <ArrowPathIcon className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Market Zone Selector */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Market Zones</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {marketZones.map(zone => {
            const data = marketData[zone.id];
            const isSelected = selectedZone === zone.id;
            
            return (
              <button
                key={zone.id}
                onClick={() => setSelectedZone(zone.id)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  isSelected 
                    ? 'border-wind-blue bg-wind-blue/5' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{zone.name}</h3>
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: zone.color }}
                  ></div>
                </div>
                {data && (
                  <div className="text-left">
                    <div className="text-lg font-bold">{formatPrice(data.latestPrice)}</div>
                    <div className={`text-sm ${data.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatPercent(data.changePercent)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(data.lastUpdate).toLocaleTimeString()}
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Current Zone Details */}
      {currentZoneData && currentZoneInfo && (
        <div className="mb-8 p-6 bg-white rounded-xl shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-3">
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: currentZoneInfo.color }}
              ></div>
              {currentZoneInfo.name} Market Details
            </h2>
            <div className="text-sm text-gray-500">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">
                {formatPrice(currentZoneData.latestPrice)}
              </div>
              <div className="text-sm text-gray-600">Current Price</div>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold ${
                currentZoneData.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatPercent(currentZoneData.changePercent)}
              </div>
              <div className="text-sm text-gray-600">Change</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">
                {currentZoneData.volume.toFixed(0)}
              </div>
              <div className="text-sm text-gray-600">Volume (MW)</div>
            </div>
            <div className="text-center">
              <div className={`text-lg font-semibold ${
                currentZoneData.status === 'open' ? 'text-green-600' : 'text-red-600'
              }`}>
                {currentZoneData.status.toUpperCase()}
              </div>
              <div className="text-sm text-gray-600">Market Status</div>
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Price Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ChartBarIcon className="w-5 h-5" />
            Price History
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                domain={['dataMin - 5', 'dataMax + 5']}
              />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'price' ? formatPrice(value as number) : value,
                  name === 'price' ? 'Price ($/MW)' : 'Volume (MW)'
                ]}
                labelFormatter={(label) => `Time: ${label}`}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke={currentZoneInfo?.color || '#0072BC'} 
                strokeWidth={2}
                dot={false}
                name="Price"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Volume Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BoltIcon className="w-5 h-5" />
            Volume History
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                domain={['dataMin - 100', 'dataMax + 100']}
              />
              <Tooltip 
                formatter={(value) => [`${(value as number).toFixed(0)} MW`, 'Volume']}
                labelFormatter={(label) => `Time: ${label}`}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="volume" 
                stroke="#00A9E0" 
                fill="#00A9E0" 
                fillOpacity={0.3}
                name="Volume"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Connection Stats */}
      {connectionStats && (
        <div className="mt-8 bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <EyeIcon className="w-5 h-5" />
            WebSocket Connection Statistics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {connectionStats.total_connections}
              </div>
              <div className="text-sm text-gray-600">Total Connections</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {Object.keys(connectionStats.connections_by_zone || {}).length}
              </div>
              <div className="text-sm text-gray-600">Active Zones</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-mono text-gray-700">
                {connectionId || 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Connection ID</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}