'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CpuChipIcon,
  CloudIcon,
  ServerIcon,
  DevicePhoneMobileIcon,
  ChartBarIcon,
  ClockIcon,
  ServerStackIcon,
  BeakerIcon,
  BoltIcon,
  SignalIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  PlayIcon,
  StopIcon,
  CogIcon,
  MapPinIcon,
  EyeIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

interface EdgeNode {
  id: string;
  name: string;
  type: 'gateway' | 'micro-edge' | 'mobile-edge' | 'cloud-edge' | 'fog-node';
  location: {
    latitude: number;
    longitude: number;
    region: string;
    facilityId?: string;
    edgeType: 'local' | 'regional' | 'global';
  };
  hardware: {
    cpu: {
      cores: number;
      architecture: string;
      frequency: string;
      usage: number;
    };
    memory: {
      total: number; // GB
      available: number;
      usage: number;
    };
    storage: {
      total: number; // GB
      available: number;
      usage: number;
    };
    gpu?: {
      model: string;
      memory: number; // GB
      computeCapability: string;
      usage: number;
    };
    network: {
      bandwidth: number; // Mbps
      latency: number; // ms
      quality: 'excellent' | 'good' | 'fair' | 'poor';
    };
  };
  capabilities: string[];
  status: 'online' | 'offline' | 'degraded' | 'maintenance' | 'deploying';
  services: EdgeService[];
  performance: {
    uptime: number; // hours
    availability: number; // percentage
    throughput: number; // operations/second
    latency: number; // milliseconds
    errorRate: number; // percentage
    cpuUtilization: number; // percentage
    memoryUtilization: number; // percentage
    networkThroughput: number; // Mbps
  };
  aiInferencing: {
    modelsLoaded: number;
    totalInferenceTime: number; // ms
    inferenceRate: number; // per second
    accuracy: number; // percentage
    fallbackToCloud: boolean;
    modelOptimizationLevel: 'basic' | 'optimized' | 'advanced';
  };
  connectivity: {
    primaryChannel: '5g' | '4g' | 'wifi' | 'ethernet' | 'satellite';
    backupChannels: string[];
    connectionQuality: number; // percentage
    lastHeartbeat: Date;
    dataSyncStatus: 'synced' | 'syncing' | 'pending' | 'error';
  };
}

interface EdgeService {
  id: string;
  name: string;
  type: 'ai-inference' | 'data-processing' | 'analytics' | 'storage' | 'security' | 'gateway' | 'orchestrator';
  status: 'running' | 'stopped' | 'restarting' | 'error';
  version: string;
  resourceUsage: {
    cpu: number; // percentage
    memory: number; // percentage
    storage: number; // GB
    network: number; // Mbps
  };
  configuration: Record<string, any>;
  uptime: number; // hours
  errorCount: number;
  lastError?: string;
  lastRestart: Date;
}

interface EdgeMetrics {
  totalNodes: number;
  onlineNodes: number;
  offlineNodes: number;
  degradedNodes: number;
  totalServices: number;
  runningServices: number;
  totalInferenceRequests: number;
  avgInferenceLatency: number;
  totalDataProcessed: number; // GB
  edgeCacheHitRate: number; // percentage
  costOptimization: {
    bandwidthSaved: number; // GB
    latencyReduced: number; // ms
    computeOptimized: number; // percentage
    costSavings: number; // USD
  };
  aiPerformance: {
    modelsDeployed: number;
    avgAccuracy: number;
    totalInferenceTime: number;
    cloudFallbackCount: number;
  };
}

const EdgeComputingManagement: React.FC = () => {
  const [edgeNodes, setEdgeNodes] = useState<EdgeNode[]>([]);
  const [edgeMetrics, setEdgeMetrics] = useState<EdgeMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<EdgeNode | null>(null);
  const [selectedService, setSelectedService] = useState<EdgeService | null>(null);
  const [view, setView] = useState<'overview' | 'nodes' | 'services' | 'performance'>('overview');
  const [filter, setFilter] = useState({
    type: '',
    status: '',
    region: ''
  });

  useEffect(() => {
    fetchEdgeData();
    const interval = setInterval(fetchEdgeData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [filter]);

  const fetchEdgeData = async () => {
    try {
      const params = new URLSearchParams();
      if (filter.type) params.append('type', filter.type);
      if (filter.status) params.append('status', filter.status);
      if (filter.region) params.append('region', filter.region);

      const response = await fetch(`/api/iot/edge-computing?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setEdgeNodes(data.edgeNodes);
        setEdgeMetrics(data.edgeMetrics);
      }
    } catch (error) {
      console.error('Failed to fetch edge computing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'gateway': return <ServerIcon className="h-6 w-6" />;
      case 'micro-edge': return <CpuChipIcon className="h-6 w-6" />;
      case 'mobile-edge': return <DevicePhoneMobileIcon className="h-6 w-6" />;
      case 'cloud-edge': return <CloudIcon className="h-6 w-6" />;
      case 'fog-node': return <ServerStackIcon className="h-6 w-6" />;
      default: return <CpuChipIcon className="h-6 w-6" />;
    }
  };

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'ai-inference': return <BeakerIcon className="h-5 w-5" />;
      case 'data-processing': return <ChartBarIcon className="h-5 w-5" />;
      case 'analytics': return <SignalIcon className="h-5 w-5" />;
      case 'storage': return <ServerIcon className="h-5 w-5" />;
      case 'security': return <BoltIcon className="h-5 w-5" />;
      case 'gateway': return <ServerStackIcon className="h-5 w-5" />;
      case 'orchestrator': return <CogIcon className="h-5 w-5" />;
      default: return <ServerIcon className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-500';
      case 'offline': return 'text-gray-400';
      case 'degraded': return 'text-yellow-500';
      case 'maintenance': return 'text-orange-500';
      case 'deploying': return 'text-blue-500';
      case 'running': return 'text-green-500';
      case 'stopped': return 'text-gray-400';
      case 'restarting': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
      case 'running':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'offline':
      case 'stopped':
        return <XCircleIcon className="h-5 w-5 text-gray-400" />;
      case 'degraded':
      case 'restarting':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'maintenance':
        return <ClockIcon className="h-5 w-5 text-orange-500" />;
      case 'deploying':
        return <ArrowPathIcon className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getConnectivityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-500';
      case 'good': return 'text-blue-500';
      case 'fair': return 'text-yellow-500';
      case 'poor': return 'text-red-500';
      default: return 'text-gray-400';
    }
  };

  const getOptimizationLevelColor = (level: string) => {
    switch (level) {
      case 'basic': return 'bg-gray-100 text-gray-800';
      case 'optimized': return 'bg-blue-100 text-blue-800';
      case 'advanced': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edge Computing Management</h1>
          <p className="text-gray-600 mt-1">
            Manage distributed edge computing infrastructure and AI inference
          </p>
        </div>
        <div className="flex space-x-2">
          {['overview', 'nodes', 'services', 'performance'].map((viewType) => (
            <button
              key={viewType}
              onClick={() => setView(viewType as any)}
              className={`px-4 py-2 rounded-lg capitalize ${
                view === viewType ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              {viewType}
            </button>
          ))}
        </div>
      </div>

      {/* Edge Computing Overview Metrics */}
      {edgeMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-xl shadow-lg border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Edge Nodes</p>
                <p className="text-3xl font-bold text-gray-900">
                  {edgeMetrics.totalNodes}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <CpuChipIcon className="h-8 w-8 text-purple-500" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm">
                <span className="text-green-600 font-medium">
                  {edgeMetrics.onlineNodes} online
                </span>
                <span className="mx-2 text-gray-400">•</span>
                <span className="text-gray-600">
                  {edgeMetrics.offlineNodes} offline
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
                <p className="text-sm font-medium text-gray-600">AI Inference</p>
                <p className="text-3xl font-bold text-gray-900">
                  {edgeMetrics.totalInferenceRequests.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <BeakerIcon className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm">
                <span className="text-blue-600 font-medium">
                  {edgeMetrics.avgInferenceLatency.toFixed(1)}ms avg latency
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
                <p className="text-sm font-medium text-gray-600">Cost Savings</p>
                <p className="text-3xl font-bold text-gray-900">
                  ${edgeMetrics.costOptimization.costSavings.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <ChartBarIcon className="h-8 w-8 text-green-500" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm">
                <span className="text-green-600 font-medium">
                  {edgeMetrics.costOptimization.latencyReduced}ms latency reduced
                </span>
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
                <p className="text-sm font-medium text-gray-600">Cache Hit Rate</p>
                <p className="text-3xl font-bold text-gray-900">
                  {edgeMetrics.edgeCacheHitRate}%
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <SignalIcon className="h-8 w-8 text-yellow-500" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm">
                <span className="text-yellow-600 font-medium">
                  {edgeMetrics.costOptimization.bandwidthSaved.toFixed(1)} GB bandwidth saved
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Node Type
            </label>
            <select
              value={filter.type}
              onChange={(e) => setFilter({ ...filter, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Types</option>
              <option value="gateway">Gateway</option>
              <option value="micro-edge">Micro Edge</option>
              <option value="mobile-edge">Mobile Edge</option>
              <option value="cloud-edge">Cloud Edge</option>
              <option value="fog-node">Fog Node</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Status</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="degraded">Degraded</option>
              <option value="maintenance">Maintenance</option>
              <option value="deploying">Deploying</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Region
            </label>
            <select
              value={filter.region}
              onChange={(e) => setFilter({ ...filter, region: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Regions</option>
              <option value="US West Coast">US West Coast</option>
              <option value="US East Coast">US East Coast</option>
              <option value="US Central">US Central</option>
              <option value="Global">Global</option>
            </select>
          </div>
        </div>
      </div>

      {/* Edge Nodes Grid */}
      {view === 'nodes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {edgeNodes.map((node) => (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedNode(node)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    {getNodeIcon(node.type)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{node.name}</h3>
                    <p className="text-sm text-gray-500 capitalize">{node.type.replace('-', ' ')}</p>
                  </div>
                </div>
                {getStatusIcon(node.status)}
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">CPU Usage</span>
                  <span className="text-sm font-medium">{node.hardware.cpu.usage}%</span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full"
                    style={{ width: `${node.hardware.cpu.usage}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Memory</span>
                  <span className="text-sm font-medium">{node.hardware.memory.usage}%</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">AI Models</span>
                  <span className="text-sm font-medium">{node.aiInferencing.modelsLoaded}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Inference Rate</span>
                  <span className="text-sm font-medium">{node.aiInferencing.inferenceRate}/sec</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Accuracy</span>
                  <span className="text-sm font-medium">{node.aiInferencing.accuracy}%</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-xs text-gray-500">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    {node.location.region}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getOptimizationLevelColor(node.aiInferencing.modelOptimizationLevel)}`}>
                    {node.aiInferencing.modelOptimizationLevel}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Services View */}
      {view === 'services' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Edge Services</h2>
            <div className="space-y-4">
              {edgeNodes.flatMap(node => 
                node.services.map(service => (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedService(service)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          {getServiceIcon(service.type)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{service.name}</h3>
                          <p className="text-sm text-gray-500">{node.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(service.status)}
                        <span className={`capitalize ${getStatusColor(service.status)}`}>
                          {service.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">CPU</span>
                        <div className="font-medium">{service.resourceUsage.cpu}%</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Memory</span>
                        <div className="font-medium">{service.resourceUsage.memory}%</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Storage</span>
                        <div className="font-medium">{service.resourceUsage.storage} GB</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Network</span>
                        <div className="font-medium">{service.resourceUsage.network} Mbps</div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Performance View */}
      {view === 'performance' && edgeMetrics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">AI Performance</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Models Deployed</span>
                <span className="font-semibold">{edgeMetrics.aiPerformance.modelsDeployed}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Average Accuracy</span>
                <span className="font-semibold">{edgeMetrics.aiPerformance.avgAccuracy.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Inference Time</span>
                <span className="font-semibold">{(edgeMetrics.aiPerformance.totalInferenceTime / 1000).toFixed(1)}s</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Cloud Fallback Count</span>
                <span className="font-semibold">{edgeMetrics.aiPerformance.cloudFallbackCount}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Cost Optimization</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Bandwidth Saved</span>
                <span className="font-semibold">{edgeMetrics.costOptimization.bandwidthSaved.toFixed(1)} GB</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Latency Reduced</span>
                <span className="font-semibold">{edgeMetrics.costOptimization.latencyReduced.toFixed(1)} ms</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Compute Optimized</span>
                <span className="font-semibold">{edgeMetrics.costOptimization.computeOptimized.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Cost Savings</span>
                <span className="font-semibold">${edgeMetrics.costOptimization.costSavings.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Node Detail Modal */}
      {selectedNode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{selectedNode.name}</h2>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Node Information */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Node Information</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>ID:</strong> {selectedNode.id}</div>
                    <div><strong>Type:</strong> {selectedNode.type}</div>
                    <div><strong>Status:</strong> 
                      <span className={`ml-2 capitalize ${getStatusColor(selectedNode.status)}`}>
                        {selectedNode.status}
                      </span>
                    </div>
                    <div><strong>Region:</strong> {selectedNode.location.region}</div>
                    <div><strong>Edge Type:</strong> {selectedNode.location.edgeType}</div>
                    {selectedNode.location.facilityId && (
                      <div><strong>Facility:</strong> {selectedNode.location.facilityId}</div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3">Hardware</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">CPU ({selectedNode.hardware.cpu.cores} cores)</span>
                        <span className="text-sm font-medium">{selectedNode.hardware.cpu.usage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${selectedNode.hardware.cpu.usage}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Memory ({selectedNode.hardware.memory.total} GB)</span>
                        <span className="text-sm font-medium">{selectedNode.hardware.memory.usage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${selectedNode.hardware.memory.usage}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Storage ({selectedNode.hardware.storage.total} GB)</span>
                        <span className="text-sm font-medium">{selectedNode.hardware.storage.usage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-500 h-2 rounded-full"
                          style={{ width: `${selectedNode.hardware.storage.usage}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    {selectedNode.hardware.gpu && (
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">GPU ({selectedNode.hardware.gpu.model})</span>
                          <span className="text-sm font-medium">{selectedNode.hardware.gpu.usage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-500 h-2 rounded-full"
                            style={{ width: `${selectedNode.hardware.gpu.usage}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* AI & Performance */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">AI Inferencing</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Models Loaded:</strong> {selectedNode.aiInferencing.modelsLoaded}</div>
                    <div><strong>Inference Rate:</strong> {selectedNode.aiInferencing.inferenceRate}/sec</div>
                    <div><strong>Accuracy:</strong> {selectedNode.aiInferencing.accuracy}%</div>
                    <div><strong>Optimization:</strong> 
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getOptimizationLevelColor(selectedNode.aiInferencing.modelOptimizationLevel)}`}>
                        {selectedNode.aiInferencing.modelOptimizationLevel}
                      </span>
                    </div>
                    <div><strong>Cloud Fallback:</strong> {selectedNode.aiInferencing.fallbackToCloud ? 'Enabled' : 'Disabled'}</div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3">Connectivity</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Primary Channel:</strong> {selectedNode.connectivity.primaryChannel.toUpperCase()}</div>
                    <div><strong>Quality:</strong> 
                      <span className={`ml-2 capitalize ${getConnectivityColor(selectedNode.hardware.network.quality)}`}>
                        {selectedNode.hardware.network.quality}
                      </span>
                    </div>
                    <div><strong>Bandwidth:</strong> {selectedNode.hardware.network.bandwidth} Mbps</div>
                    <div><strong>Latency:</strong> {selectedNode.hardware.network.latency} ms</div>
                    <div><strong>Connection:</strong> {selectedNode.connectivity.connectionQuality}%</div>
                    <div><strong>Sync Status:</strong> {selectedNode.connectivity.dataSyncStatus}</div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3">Services</h3>
                  <div className="space-y-2">
                    {selectedNode.services.map(service => (
                      <div key={service.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center space-x-2">
                          {getServiceIcon(service.type)}
                          <span className="text-sm font-medium">{service.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(service.status)}
                          <span className={`text-xs ${getStatusColor(service.status)}`}>
                            {service.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EdgeComputingManagement;