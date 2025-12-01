'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  WifiIcon,
  SignalIcon,
  CpuChipIcon,
  Battery100Icon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  MapPinIcon,
  ServerIcon,
  CloudIcon,
  DevicePhoneMobileIcon
} from '@heroicons/react/24/outline';

interface IoTDevice {
  id: string;
  name: string;
  type: 'sensor' | 'actuator' | 'gateway' | 'edge-node' | 'smart-meter' | 'battery-storage';
  protocol: 'mqtt' | 'coap' | 'opcua' | 'modbus' | 'zigbee' | 'z-wave' | 'matter' | 'thread';
  location: {
    latitude: number;
    longitude: number;
    address: string;
    region: string;
    facilityId?: string;
  };
  status: 'online' | 'offline' | 'maintenance' | 'error';
  capabilities: string[];
  firmware: {
    version: string;
    updateAvailable: boolean;
    lastUpdate: Date;
  };
  performance: {
    cpuUsage: number;
    memoryUsage: number;
    batteryLevel?: number;
    uptime: number;
    dataRate: number;
  };
  sensors: Record<string, number | boolean>;
  lastSeen: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface FleetMetrics {
  totalDevices: number;
  onlineDevices: number;
  offlineDevices: number;
  maintenanceDevices: number;
  errorDevices: number;
  totalDataPoints: number;
  avgUptime: number;
  totalEnergyConsumed: number;
  totalDataTransmitted: number;
  alertCount: {
    info: number;
    warning: number;
    error: number;
    critical: number;
  };
}

const IoTDeviceManagement: React.FC = () => {
  const [devices, setDevices] = useState<IoTDevice[]>([]);
  const [fleetMetrics, setFleetMetrics] = useState<FleetMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDevice, setSelectedDevice] = useState<IoTDevice | null>(null);
  const [view, setView] = useState<'grid' | 'list' | 'map'>('grid');
  const [filter, setFilter] = useState({
    type: '',
    status: '',
    protocol: '',
    region: ''
  });

  useEffect(() => {
    fetchDeviceData();
    const interval = setInterval(fetchDeviceData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [filter]);

  const fetchDeviceData = async () => {
    try {
      const params = new URLSearchParams();
      if (filter.type) params.append('type', filter.type);
      if (filter.status) params.append('status', filter.status);
      if (filter.protocol) params.append('protocol', filter.protocol);
      if (filter.region) params.append('location', filter.region);

      const response = await fetch(`/api/iot/devices?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setDevices(data.devices);
        setFleetMetrics(data.fleetMetrics);
      }
    } catch (error) {
      console.error('Failed to fetch IoT devices:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'sensor': return <SignalIcon className="h-6 w-6" />;
      case 'gateway': return <ServerIcon className="h-6 w-6" />;
      case 'edge-node': return <CpuChipIcon className="h-6 w-6" />;
      case 'smart-meter': return <ChartBarIcon className="h-6 w-6" />;
      case 'battery-storage': return <Battery100Icon className="h-6 w-6" />;
      default: return <DevicePhoneMobileIcon className="h-6 w-6" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-500';
      case 'offline': return 'text-gray-400';
      case 'maintenance': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'offline': return <XCircleIcon className="h-5 w-5 text-gray-400" />;
      case 'maintenance': return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'error': return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      default: return null;
    }
  };

  const getProtocolColor = (protocol: string) => {
    const colors = {
      mqtt: 'bg-blue-100 text-blue-800',
      coap: 'bg-green-100 text-green-800',
      opcua: 'bg-purple-100 text-purple-800',
      modbus: 'bg-orange-100 text-orange-800',
      zigbee: 'bg-pink-100 text-pink-800',
      'z-wave': 'bg-indigo-100 text-indigo-800',
      matter: 'bg-cyan-100 text-cyan-800',
      thread: 'bg-lime-100 text-lime-800'
    };
    return colors[protocol as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

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
          <h1 className="text-3xl font-bold text-gray-900">IoT Device Management</h1>
          <p className="text-gray-600 mt-1">
            Monitor and manage your connected IoT device fleet
          </p>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => setView('grid')}
            className={`px-4 py-2 rounded-lg ${
              view === 'grid' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Grid View
          </button>
          <button
            onClick={() => setView('list')}
            className={`px-4 py-2 rounded-lg ${
              view === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            List View
          </button>
          <button
            onClick={() => setView('map')}
            className={`px-4 py-2 rounded-lg ${
              view === 'map' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Map View
          </button>
        </div>
      </div>

      {/* Fleet Overview Metrics */}
      {fleetMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-xl shadow-lg border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Devices</p>
                <p className="text-3xl font-bold text-gray-900">
                  {fleetMetrics.totalDevices}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <DevicePhoneMobileIcon className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm">
                <span className="text-green-600 font-medium">
                  {fleetMetrics.onlineDevices} online
                </span>
                <span className="mx-2 text-gray-400">•</span>
                <span className="text-gray-600">
                  {fleetMetrics.offlineDevices} offline
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-xl shadow-lg border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Data Points</p>
                <p className="text-3xl font-bold text-gray-900">
                  {fleetMetrics.totalDataPoints.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <ChartBarIcon className="h-8 w-8 text-green-500" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm">
                <span className="text-blue-600 font-medium">
                  {fleetMetrics.totalDataTransmitted.toFixed(1)} MB transmitted
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-xl shadow-lg border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Uptime</p>
                <p className="text-3xl font-bold text-gray-900">
                  {Math.round(fleetMetrics.avgUptime / 24)} days
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <ClockIcon className="h-8 w-8 text-yellow-500" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm">
                <span className="text-green-600 font-medium">99.2% reliability</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-6 rounded-xl shadow-lg border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Alerts</p>
                <p className="text-3xl font-bold text-gray-900">
                  {fleetMetrics.alertCount.warning + fleetMetrics.alertCount.error + fleetMetrics.alertCount.critical}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm">
                <span className="text-red-600 font-medium">
                  {fleetMetrics.alertCount.critical} critical
                </span>
                <span className="mx-2 text-gray-400">•</span>
                <span className="text-yellow-600">
                  {fleetMetrics.alertCount.warning} warnings
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Device Type
            </label>
            <select
              value={filter.type}
              onChange={(e) => setFilter({ ...filter, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="sensor">Sensor</option>
              <option value="gateway">Gateway</option>
              <option value="edge-node">Edge Node</option>
              <option value="smart-meter">Smart Meter</option>
              <option value="battery-storage">Battery Storage</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="maintenance">Maintenance</option>
              <option value="error">Error</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Protocol
            </label>
            <select
              value={filter.protocol}
              onChange={(e) => setFilter({ ...filter, protocol: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Protocols</option>
              <option value="mqtt">MQTT</option>
              <option value="coap">CoAP</option>
              <option value="opcua">OPC UA</option>
              <option value="modbus">Modbus</option>
              <option value="zigbee">Zigbee</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Region
            </label>
            <select
              value={filter.region}
              onChange={(e) => setFilter({ ...filter, region: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Regions</option>
              <option value="North America West">North America West</option>
              <option value="North America East">North America East</option>
              <option value="North America Central">North America Central</option>
              <option value="North America South">North America South</option>
            </select>
          </div>
        </div>
      </div>

      {/* Device Grid/List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {view === 'grid' && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {devices.map((device) => (
                <motion.div
                  key={device.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedDevice(device)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        {getDeviceIcon(device.type)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{device.name}</h3>
                        <p className="text-sm text-gray-500 capitalize">{device.type}</p>
                      </div>
                    </div>
                    {getStatusIcon(device.status)}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Protocol</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getProtocolColor(device.protocol)}`}>
                        {device.protocol.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">CPU Usage</span>
                      <span className="text-sm font-medium">{device.performance.cpuUsage}%</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Memory</span>
                      <span className="text-sm font-medium">{device.performance.memoryUsage}%</span>
                    </div>
                    
                    {device.performance.batteryLevel && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Battery</span>
                        <span className="text-sm font-medium">{device.performance.batteryLevel}%</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center text-xs text-gray-500">
                      <MapPinIcon className="h-4 w-4 mr-1" />
                      {device.location.region}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {view === 'list' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Device
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Protocol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Seen
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {devices.map((device) => (
                  <tr key={device.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedDevice(device)}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg mr-3">
                          {getDeviceIcon(device.type)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{device.name}</div>
                          <div className="text-sm text-gray-500 capitalize">{device.type}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(device.status)}
                        <span className={`ml-2 capitalize ${getStatusColor(device.status)}`}>
                          {device.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getProtocolColor(device.protocol)}`}>
                        {device.protocol.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        CPU: {device.performance.cpuUsage}% | 
                        RAM: {device.performance.memoryUsage}%
                        {device.performance.batteryLevel && ` | Battery: ${device.performance.batteryLevel}%`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{device.location.region}</div>
                      <div className="text-sm text-gray-500">{device.location.address}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {device.lastSeen.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Device Detail Modal */}
      {selectedDevice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">{selectedDevice.name}</h2>
              <button
                onClick={() => setSelectedDevice(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Device Information</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>ID:</strong> {selectedDevice.id}</div>
                    <div><strong>Type:</strong> {selectedDevice.type}</div>
                    <div><strong>Protocol:</strong> {selectedDevice.protocol}</div>
                    <div><strong>Firmware:</strong> {selectedDevice.firmware.version}</div>
                    <div><strong>Status:</strong> 
                      <span className={`ml-2 capitalize ${getStatusColor(selectedDevice.status)}`}>
                        {selectedDevice.status}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Performance Metrics</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>CPU Usage:</strong> {selectedDevice.performance.cpuUsage}%</div>
                    <div><strong>Memory Usage:</strong> {selectedDevice.performance.memoryUsage}%</div>
                    {selectedDevice.performance.batteryLevel && (
                      <div><strong>Battery Level:</strong> {selectedDevice.performance.batteryLevel}%</div>
                    )}
                    <div><strong>Uptime:</strong> {Math.floor(selectedDevice.performance.uptime / 24)} days</div>
                    <div><strong>Data Rate:</strong> {selectedDevice.performance.dataRate} bps</div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Sensor Data</h3>
                <div className="grid grid-cols-3 gap-4">
                  {Object.entries(selectedDevice.sensors).map(([key, value]) => (
                    <div key={key} className="bg-gray-50 p-3 rounded">
                      <div className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
                      <div className="text-lg font-semibold">
                        {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : `${value} ${key.includes('temperature') ? '°C' : key.includes('power') ? 'W' : key.includes('voltage') ? 'V' : key.includes('current') ? 'A' : ''}`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Location</h3>
                <div className="text-sm">
                  <div><strong>Address:</strong> {selectedDevice.location.address}</div>
                  <div><strong>Region:</strong> {selectedDevice.location.region}</div>
                  <div><strong>Coordinates:</strong> {selectedDevice.location.latitude}, {selectedDevice.location.longitude}</div>
                  {selectedDevice.location.facilityId && (
                    <div><strong>Facility:</strong> {selectedDevice.location.facilityId}</div>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Capabilities</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedDevice.capabilities.map((capability) => (
                    <span
                      key={capability}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {capability}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IoTDeviceManagement;