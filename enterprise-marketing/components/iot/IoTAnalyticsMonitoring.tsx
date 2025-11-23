'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  SignalIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  CpuChipIcon,
  BatteryIcon,
  ThermometerIcon,
  BoltIcon,
  WifiIcon,
  ServerIcon,
  EyeIcon,
  BeakerIcon,
 AdjustmentsHorizontalIcon,
  FunnelIcon,
  ArrowPathIcon,
  BellIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar
} from 'recharts';

interface DeviceAlert {
  id: string;
  deviceId: string;
  deviceName: string;
  alertType: 'threshold-exceeded' | 'device-offline' | 'communication-error' | 'security-breach' | 'performance-degradation' | 'predictive-maintenance';
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  resolvedAt?: Date;
  value?: number;
  threshold?: number;
  category: string;
}

interface AnalyticsMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  change: number;
  changeType: 'increase' | 'decrease' | 'stable';
  trend: number[];
  target?: number;
  status: 'normal' | 'warning' | 'critical';
}

interface StreamMetric {
  timestamp: Date;
  deviceId: string;
  deviceName: string;
  metric: string;
  value: number;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
}

interface PredictiveInsight {
  id: string;
  deviceId: string;
  deviceName: string;
  insightType: 'failure-prediction' | 'optimization' | 'anomaly' | 'trend';
  confidence: number;
  predictedTime?: Date;
  description: string;
  recommendation: string;
  severity: 'low' | 'medium' | 'high';
  impact: string;
}

const IoTAnalyticsMonitoring: React.FC = () => {
  const [metrics, setMetrics] = useState<AnalyticsMetric[]>([]);
  const [alerts, setAlerts] = useState<DeviceAlert[]>([]);
  const [streamData, setStreamData] = useState<StreamMetric[]>([]);
  const [predictiveInsights, setPredictiveInsights] = useState<PredictiveInsight[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState('1h');
  const [selectedDevice, setSelectedDevice] = useState<string>('all');
  const [selectedMetric, setSelectedMetric] = useState<string>('temperature');
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
    if (autoRefresh) {
      const interval = setInterval(fetchAnalyticsData, 10000); // Refresh every 10 seconds
      return () => clearInterval(interval);
    }
  }, [selectedTimeRange, selectedDevice, autoRefresh]);

  const fetchAnalyticsData = async () => {
    try {
      // Simulate real-time data fetching
      const now = new Date();
      
      // Generate analytics metrics
      const newMetrics: AnalyticsMetric[] = [
        {
          id: 'temp-avg',
          name: 'Average Temperature',
          value: 24.3 + (Math.random() - 0.5) * 2,
          unit: '°C',
          change: Math.random() * 4 - 2,
          changeType: Math.random() > 0.5 ? 'increase' : 'decrease',
          trend: Array.from({ length: 24 }, () => 20 + Math.random() * 10),
          target: 25.0,
          status: 'normal'
        },
        {
          id: 'power-consumption',
          name: 'Power Consumption',
          value: 2847.6 + (Math.random() - 0.5) * 200,
          unit: 'W',
          change: Math.random() * 10 - 5,
          changeType: Math.random() > 0.5 ? 'increase' : 'decrease',
          trend: Array.from({ length: 24 }, () => 2500 + Math.random() * 800),
          target: 3000,
          status: 'normal'
        },
        {
          id: 'device-uptime',
          name: 'Device Uptime',
          value: 99.7 + Math.random() * 0.3,
          unit: '%',
          change: Math.random() * 0.2 - 0.1,
          changeType: Math.random() > 0.5 ? 'increase' : 'decrease',
          trend: Array.from({ length: 24 }, () => 99.0 + Math.random() * 1.0),
          target: 99.9,
          status: 'normal'
        },
        {
          id: 'data-throughput',
          name: 'Data Throughput',
          value: 15420 + (Math.random() - 0.5) * 2000,
          unit: 'msg/sec',
          change: Math.random() * 8 - 4,
          changeType: Math.random() > 0.5 ? 'increase' : 'decrease',
          trend: Array.from({ length: 24 }, () => 12000 + Math.random() * 8000),
          status: 'normal'
        },
        {
          id: 'battery-level',
          name: 'Average Battery Level',
          value: 76.8 + (Math.random() - 0.5) * 5,
          unit: '%',
          change: Math.random() * 2 - 1,
          changeType: Math.random() > 0.5 ? 'increase' : 'decrease',
          trend: Array.from({ length: 24 }, () => 70 + Math.random() * 20),
          target: 80,
          status: 'normal'
        },
        {
          id: 'network-latency',
          name: 'Network Latency',
          value: 23.4 + (Math.random() - 0.5) * 10,
          unit: 'ms',
          change: Math.random() * 6 - 3,
          changeType: Math.random() > 0.5 ? 'increase' : 'decrease',
          trend: Array.from({ length: 24 }, () => 15 + Math.random() * 20),
          target: 20,
          status: 'warning'
        }
      ];
      
      // Generate real-time stream data
      const newStreamData: StreamMetric[] = Array.from({ length: 50 }, (_, i) => ({
        timestamp: new Date(now.getTime() - i * 30000), // 30 second intervals
        deviceId: `device-${Math.floor(Math.random() * 5) + 1}`,
        deviceName: ['Solar Array A', 'Wind Turbine 7', 'Battery BESS-1', 'Grid Sensor 15', 'Edge Node 1'][Math.floor(Math.random() * 5)],
        metric: ['temperature', 'power', 'voltage', 'current', 'frequency'][Math.floor(Math.random() * 5)],
        value: Math.random() * 1000,
        unit: ['°C', 'W', 'V', 'A', 'Hz'][Math.floor(Math.random() * 5)],
        status: Math.random() > 0.8 ? 'warning' : Math.random() > 0.95 ? 'critical' : 'normal'
      }));
      
      // Generate alerts
      const newAlerts: DeviceAlert[] = [
        {
          id: 'alert-001',
          deviceId: 'iot-001-solar-panels',
          deviceName: 'Solar Array Monitor - Site A',
          alertType: 'threshold-exceeded',
          severity: 'warning',
          message: 'Temperature exceeded threshold',
          timestamp: new Date(now.getTime() - 300000), // 5 minutes ago
          acknowledged: false,
          value: 35.2,
          threshold: 30.0,
          category: 'environmental'
        },
        {
          id: 'alert-002',
          deviceId: 'iot-002-wind-turbine',
          deviceName: 'Wind Turbine Monitor - Unit 7',
          alertType: 'performance-degradation',
          severity: 'error',
          message: 'Power output below expected range',
          timestamp: new Date(now.getTime() - 600000), // 10 minutes ago
          acknowledged: false,
          category: 'performance'
        },
        {
          id: 'alert-003',
          deviceId: 'iot-003-battery-storage',
          deviceName: 'Battery Storage System BESS-01',
          alertType: 'predictive-maintenance',
          severity: 'info',
          message: 'Predictive model suggests maintenance check',
          timestamp: new Date(now.getTime() - 900000), // 15 minutes ago
          acknowledged: true,
          resolvedAt: new Date(now.getTime() - 600000),
          category: 'maintenance'
        }
      ];
      
      // Generate predictive insights
      const newInsights: PredictiveInsight[] = [
        {
          id: 'insight-001',
          deviceId: 'iot-001-solar-panels',
          deviceName: 'Solar Array Monitor - Site A',
          insightType: 'failure-prediction',
          confidence: 0.89,
          predictedTime: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days
          description: 'Thermal degradation pattern detected in Panel 3',
          recommendation: 'Schedule thermal inspection within 7 days',
          severity: 'high',
          impact: 'Potential 15% efficiency loss'
        },
        {
          id: 'insight-002',
          deviceId: 'iot-002-wind-turbine',
          deviceName: 'Wind Turbine Monitor - Unit 7',
          insightType: 'optimization',
          confidence: 0.94,
          description: 'Blade pitch optimization opportunity identified',
          recommendation: 'Adjust blade pitch for 5-8% efficiency improvement',
          severity: 'medium',
          impact: 'Increased energy output'
        },
        {
          id: 'insight-003',
          deviceId: 'iot-003-battery-storage',
          deviceName: 'Battery Storage System BESS-01',
          insightType: 'anomaly',
          confidence: 0.76,
          description: 'Unusual charging pattern detected',
          recommendation: 'Monitor for 24 hours, then investigate if pattern persists',
          severity: 'low',
          impact: 'Minor impact on battery health'
        }
      ];
      
      setMetrics(newMetrics);
      setStreamData(newStreamData.reverse());
      setAlerts(newAlerts);
      setPredictiveInsights(newInsights);
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'error': return 'text-red-500 bg-red-50 border-red-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'info': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'text-red-500';
      case 'warning': return 'text-yellow-500';
      case 'normal': return 'text-green-500';
      default: return 'text-gray-400';
    }
  };

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'increase': return <TrendingUpIcon className="h-4 w-4 text-green-500" />;
      case 'decrease': return <TrendingDownIcon className="h-4 w-4 text-red-500" />;
      default: return <div className="h-4 w-4" />;
    }
  };

  // Prepare chart data
  const chartData = streamData
    .filter(d => d.metric === selectedMetric || selectedMetric === 'all')
    .map(d => ({
      time: d.timestamp.toLocaleTimeString(),
      value: d.value,
      device: d.deviceName,
      status: d.status
    }));

  const statusDistribution = [
    { name: 'Normal', value: streamData.filter(d => d.status === 'normal').length, color: '#10B981' },
    { name: 'Warning', value: streamData.filter(d => d.status === 'warning').length, color: '#F59E0B' },
    { name: 'Critical', value: streamData.filter(d => d.status === 'critical').length, color: '#EF4444' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">IoT Analytics & Monitoring</h1>
          <p className="text-gray-600 mt-1">
            Real-time device analytics, monitoring, and predictive insights
          </p>
        </div>
        <div className="flex space-x-4">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="15m">Last 15 minutes</option>
            <option value="1h">Last 1 hour</option>
            <option value="6h">Last 6 hours</option>
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
          </select>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
              autoRefresh ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            <ArrowPathIcon className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            <span>Auto Refresh</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-6 rounded-xl shadow-lg border border-gray-200"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">{metric.name}</h3>
              <div className="flex items-center space-x-1">
                {getChangeIcon(metric.changeType)}
                <span className={`text-sm ${
                  metric.changeType === 'increase' ? 'text-green-600' : 
                  metric.changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {Math.abs(metric.change).toFixed(1)}%
                </span>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="text-3xl font-bold text-gray-900">
                {metric.value.toFixed(1)}
                <span className="text-lg text-gray-500 ml-1">{metric.unit}</span>
              </div>
              {metric.target && (
                <div className="text-sm text-gray-500 mt-1">
                  Target: {metric.target} {metric.unit}
                </div>
              )}
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  metric.status === 'critical' ? 'bg-red-500' :
                  metric.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ 
                  width: `${Math.min(100, (metric.value / (metric.target || metric.value * 2)) * 100)}%` 
                }}
              ></div>
            </div>
            
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className={`${getStatusColor(metric.status)}`}>
                {metric.status.toUpperCase()}
              </span>
              <span className="text-gray-500">
                {metric.trend.slice(-4).join(', ')}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Analytics Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-time Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Real-time Device Data</h2>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Metrics</option>
              <option value="temperature">Temperature</option>
              <option value="power">Power</option>
              <option value="voltage">Voltage</option>
              <option value="current">Current</option>
              <option value="frequency">Frequency</option>
            </select>
          </div>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Device Status Distribution</h2>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-4 space-y-2">
            {statusDistribution.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
                <span className="text-sm font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts and Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Alerts */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Active Alerts</h2>
              <BellIcon className="h-6 w-6 text-red-500" />
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            {alerts.filter(alert => !alert.acknowledged).map((alert) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`border rounded-lg p-4 ${getSeverityColor(alert.severity)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {alert.severity === 'critical' && <ExclamationTriangleIcon className="h-5 w-5" />}
                      {alert.severity === 'error' && <XCircleIcon className="h-5 w-5" />}
                      {alert.severity === 'warning' && <ExclamationTriangleIcon className="h-5 w-5" />}
                      {alert.severity === 'info' && <CheckCircleIcon className="h-5 w-5" />}
                      <span className="font-medium">{alert.deviceName}</span>
                    </div>
                    <p className="text-sm mb-2">{alert.message}</p>
                    {alert.value && alert.threshold && (
                      <p className="text-xs">
                        Value: {alert.value} | Threshold: {alert.threshold}
                      </p>
                    )}
                    <p className="text-xs opacity-75 mt-2">
                      {alert.timestamp.toLocaleString()}
                    </p>
                  </div>
                  <button className="ml-4 px-3 py-1 bg-white bg-opacity-50 rounded text-xs font-medium hover:bg-opacity-75 transition-colors">
                    Acknowledge
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Predictive Insights */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Predictive Insights</h2>
              <BeakerIcon className="h-6 w-6 text-purple-500" />
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            {predictiveInsights.map((insight) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-900">{insight.deviceName}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        insight.severity === 'high' ? 'bg-red-100 text-red-800' :
                        insight.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {insight.severity}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
                    <p className="text-xs text-gray-500">Confidence: {(insight.confidence * 100).toFixed(1)}%</p>
                    {insight.predictedTime && (
                      <p className="text-xs text-gray-500">
                        Predicted: {insight.predictedTime.toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <p className="text-sm font-medium text-blue-900 mb-1">Recommendation</p>
                  <p className="text-sm text-blue-800">{insight.recommendation}</p>
                </div>
                
                {insight.impact && (
                  <div className="mt-2 text-xs text-gray-500">
                    Impact: {insight.impact}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Real-time Stream Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Real-time Data Stream</h2>
            <div className="flex items-center space-x-2">
              <FunnelIcon className="h-5 w-5 text-gray-400" />
              <select
                value={selectedDevice}
                onChange={(e) => setSelectedDevice(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Devices</option>
                <option value="device-1">Solar Array A</option>
                <option value="device-2">Wind Turbine 7</option>
                <option value="device-3">Battery BESS-1</option>
                <option value="device-4">Grid Sensor 15</option>
                <option value="device-5">Edge Node 1</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Device
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Metric
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {streamData.slice(0, 20).map((stream, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {stream.timestamp.toLocaleTimeString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {stream.deviceName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                    {stream.metric}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {stream.value.toFixed(2)} {stream.unit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      stream.status === 'critical' ? 'bg-red-100 text-red-800' :
                      stream.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {stream.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default IoTAnalyticsMonitoring;