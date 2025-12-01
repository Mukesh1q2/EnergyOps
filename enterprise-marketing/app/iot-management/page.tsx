'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CpuChipIcon,
  ChartBarIcon,
  ServerIcon,
  DevicePhoneMobileIcon,
  WifiIcon,
  CloudIcon,
  BeakerIcon,
  SignalIcon,
  AdjustmentsHorizontalIcon,
  MapPinIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  BoltIcon,
  EyeIcon,
  CogIcon,
  ArrowPathIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

import IoTDeviceManagement from '@/components/iot/IoTDeviceManagement';
import EdgeComputingManagement from '@/components/iot/EdgeComputingManagement';
import IoTAnalyticsMonitoring from '@/components/iot/IoTAnalyticsMonitoring';

type ViewType = 'dashboard' | 'devices' | 'edge' | 'analytics' | 'monitoring' | 'settings';

interface QuickStat {
  label: string;
  value: string | number;
  change: number;
  changeType: 'increase' | 'decrease' | 'stable';
  icon: React.ComponentType<any>;
  color: string;
}

const IoTManagementPage: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const quickStats: QuickStat[] = [
    {
      label: 'Total IoT Devices',
      value: 247,
      change: 12,
      changeType: 'increase',
      icon: DevicePhoneMobileIcon,
      color: 'bg-blue-500'
    },
    {
      label: 'Edge Nodes',
      value: 23,
      change: 3,
      changeType: 'increase',
      icon: CpuChipIcon,
      color: 'bg-purple-500'
    },
    {
      label: 'Active Connections',
      value: 1456,
      change: -2.3,
      changeType: 'decrease',
      icon: WifiIcon,
      color: 'bg-green-500'
    },
    {
      label: 'Data Processed',
      value: '2.4 TB',
      change: 8.7,
      changeType: 'increase',
      icon: ChartBarIcon,
      color: 'bg-yellow-500'
    },
    {
      label: 'AI Models Deployed',
      value: 47,
      change: 5,
      changeType: 'increase',
      icon: BeakerIcon,
      color: 'bg-red-500'
    },
    {
      label: 'System Uptime',
      value: '99.8%',
      change: 0.1,
      changeType: 'increase',
      icon: CheckCircleIcon,
      color: 'bg-indigo-500'
    }
  ];

  const recentActivity = [
    {
      id: '1',
      type: 'device_online',
      message: 'Solar Array Monitor - Site A came online',
      timestamp: new Date(Date.now() - 300000),
      icon: CheckCircleIcon,
      iconColor: 'text-green-500'
    },
    {
      id: '2',
      type: 'edge_deployed',
      message: 'New edge node deployed in US West Coast',
      timestamp: new Date(Date.now() - 600000),
      icon: ServerIcon,
      iconColor: 'text-blue-500'
    },
    {
      id: '3',
      type: 'alert',
      message: 'Battery storage system temperature warning',
      timestamp: new Date(Date.now() - 900000),
      icon: ExclamationTriangleIcon,
      iconColor: 'text-yellow-500'
    },
    {
      id: '4',
      type: 'ai_model',
      message: 'New predictive maintenance model deployed',
      timestamp: new Date(Date.now() - 1200000),
      icon: BeakerIcon,
      iconColor: 'text-purple-500'
    },
    {
      id: '5',
      type: 'firmware',
      message: 'Firmware update completed for 15 devices',
      timestamp: new Date(Date.now() - 1800000),
      icon: CogIcon,
      iconColor: 'text-indigo-500'
    }
  ];

  const deviceCategories = [
    {
      name: 'Solar Panels',
      count: 89,
      status: 'healthy',
      color: 'bg-yellow-500',
      icon: BoltIcon
    },
    {
      name: 'Wind Turbines',
      count: 34,
      status: 'healthy',
      color: 'bg-blue-500',
      icon: SignalIcon
    },
    {
      name: 'Battery Storage',
      count: 12,
      status: 'warning',
      color: 'bg-orange-500',
      icon: BoltIcon
    },
    {
      name: 'Grid Sensors',
      count: 67,
      status: 'healthy',
      color: 'bg-green-500',
      icon: SignalIcon
    },
    {
      name: 'Edge Nodes',
      count: 23,
      status: 'healthy',
      color: 'bg-purple-500',
      icon: CpuChipIcon
    },
    {
      name: 'Smart Meters',
      count: 22,
      status: 'healthy',
      color: 'bg-indigo-500',
      icon: ChartBarIcon
    }
  ];

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quickStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-6 rounded-xl shadow-lg border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <div className="flex items-center mt-2">
                  {stat.changeType === 'increase' && (
                    <ArrowPathIcon className="h-4 w-4 text-green-500 mr-1 rotate-45" />
                  )}
                  {stat.changeType === 'decrease' && (
                    <ArrowPathIcon className="h-4 w-4 text-red-500 mr-1 rotate-225" />
                  )}
                  <span className={`text-sm font-medium ${
                    stat.changeType === 'increase' ? 'text-green-600' : 
                    stat.changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {Math.abs(stat.change)}%
                  </span>
                  <span className="text-sm text-gray-500 ml-1">vs last period</span>
                </div>
              </div>
              <div className={`p-4 rounded-xl ${stat.color}`}>
                <stat.icon className="h-8 w-8 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Device Categories and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Device Categories */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Device Categories</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {deviceCategories.map((category, index) => (
                <motion.div
                  key={category.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setActiveView('devices')}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`p-3 rounded-lg ${category.color}`}>
                        <category.icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{category.name}</h3>
                        <p className="text-sm text-gray-500">{category.count} devices</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`w-3 h-3 rounded-full ${
                        category.status === 'healthy' ? 'bg-green-500' :
                        category.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></span>
                      <span className="text-sm text-gray-500 capitalize">{category.status}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <activity.icon className={`h-5 w-5 mt-0.5 ${activity.iconColor}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {activity.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">System Health Overview</h2>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">All systems operational</span>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">99.8%</div>
              <div className="text-sm text-gray-600">Network Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">23ms</div>
              <div className="text-sm text-gray-600">Avg Latency</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">1.4M</div>
              <div className="text-sm text-gray-600">Messages/Hour</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">99.2%</div>
              <div className="text-sm text-gray-600">Delivery Rate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNavigation = () => (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <nav className="flex space-x-8">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: ChartBarIcon },
            { id: 'devices', label: 'Device Management', icon: DevicePhoneMobileIcon },
            { id: 'edge', label: 'Edge Computing', icon: CpuChipIcon },
            { id: 'analytics', label: 'Analytics', icon: ChartBarIcon },
            { id: 'monitoring', label: 'Monitoring', icon: EyeIcon },
            { id: 'settings', label: 'Settings', icon: CogIcon }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as ViewType)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                activeView === item.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
        
        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
            <PlusIcon className="h-4 w-4" />
            <span>Add Device</span>
          </button>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              autoRefresh 
                ? 'bg-green-500 text-white hover:bg-green-600' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <ArrowPathIcon className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            <span>Auto Refresh</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return renderDashboard();
      case 'devices':
        return <IoTDeviceManagement />;
      case 'edge':
        return <EdgeComputingManagement />;
      case 'analytics':
        return <IoTAnalyticsMonitoring />;
      case 'monitoring':
        return <IoTAnalyticsMonitoring />;
      case 'settings':
        return (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">IoT Platform Settings</h2>
            <p className="text-gray-600">Configuration options for the IoT platform will be available here.</p>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Communication Protocols</h3>
                <p className="text-sm text-gray-600">Configure MQTT, CoAP, OPC UA, and other IoT protocols.</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Edge Computing</h3>
                <p className="text-sm text-gray-600">Manage edge computing resources and AI models.</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Data Retention</h3>
                <p className="text-sm text-gray-600">Configure data retention policies and storage settings.</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Security</h3>
                <p className="text-sm text-gray-600">Manage device certificates and security policies.</p>
              </div>
            </div>
          </div>
        );
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">IoT Platform Management</h1>
              <p className="text-gray-600 mt-1">
                Comprehensive IoT device management, edge computing, and analytics platform
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">All systems operational</span>
              </div>
              <div className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      {renderNavigation()}

      {/* Main Content */}
      <div className="p-6">
        {renderContent()}
      </div>
    </div>
  );
};

export default IoTManagementPage;