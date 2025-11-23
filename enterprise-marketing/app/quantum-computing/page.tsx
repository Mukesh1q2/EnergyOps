'use client';

import React, { useState, useEffect } from 'react';
import { 
  CubeIcon, 
  CpuChipIcon, 
  ShieldCheckIcon, 
  ChartBarIcon,
  BoltIcon,
  CircuitBoardIcon,
  AtomIcon,
  BeakerIcon,
  RocketLaunchIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  FireIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  ArrowPathIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import QuantumComputingDashboard from '@/components/quantum/QuantumComputingDashboard';
import QuantumCryptographyManager from '@/components/quantum/QuantumCryptographyManager';

interface QuantumComputingPageProps {
  className?: string;
}

interface QuantumSystemStatus {
  overall_status: 'optimal' | 'operational' | 'degraded' | 'critical';
  active_quantum_jobs: number;
  quantum_computers_online: number;
  total_quantum_computers: number;
  quantum_volume_average: number;
  quantum_advantage_factor: number;
  security_level: string;
  compliance_status: string;
  last_updated: Date;
}

interface QuantumResource {
  id: string;
  name: string;
  type: 'quantum_computer' | 'quantum_simulator' | 'quantum_network' | 'quantum_storage';
  status: 'online' | 'offline' | 'maintenance' | 'error';
  capacity: {
    qubits: number;
    quantum_volume: number;
    throughput: number;
  };
  utilization: {
    current_usage: number;
    peak_usage: number;
    average_queue_time: number;
  };
  performance: {
    gate_fidelity: number;
    coherence_time: number;
    error_rate: number;
    temperature: number;
  };
  location: string;
  provider: string;
  cost_per_hour: number;
}

interface QuantumExperiment {
  id: string;
  name: string;
  type: 'machine_learning' | 'optimization' | 'cryptography' | 'simulation' | 'blockchain';
  status: 'queued' | 'running' | 'completed' | 'failed' | 'paused';
  progress: number;
  start_time: Date;
  estimated_completion?: Date;
  actual_completion?: Date;
  resource_requirements: {
    qubits: number;
    shots: number;
    runtime: number;
  };
  results?: any;
  quantum_advantage_achieved: boolean;
  performance_metrics?: {
    speedup_factor: number;
    accuracy_improvement: number;
    resource_efficiency: number;
  };
  priority: 'low' | 'medium' | 'high' | 'critical';
  user_id: string;
  collaboration_id?: string;
}

const QuantumComputingPage: React.FC<QuantumComputingPageProps> = ({ className = '' }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [systemStatus, setSystemStatus] = useState<QuantumSystemStatus | null>(null);
  const [quantumResources, setQuantumResources] = useState<QuantumResource[]>([]);
  const [quantumExperiments, setQuantumExperiments] = useState<QuantumExperiment[]>([]);
  const [realTimeMetrics, setRealTimeMetrics] = useState<any[]>([]);
  const [selectedResource, setSelectedResource] = useState<QuantumResource | null>(null);
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000);

  useEffect(() => {
    initializeQuantumSystem();
    
    if (isAutoRefresh) {
      const interval = setInterval(fetchSystemData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [isAutoRefresh, refreshInterval]);

  const initializeQuantumSystem = () => {
    // Initialize system status
    setSystemStatus({
      overall_status: 'optimal',
      active_quantum_jobs: 23,
      quantum_computers_online: 47,
      total_quantum_computers: 52,
      quantum_volume_average: 128,
      quantum_advantage_factor: 2.8,
      security_level: 'NIST Post-Quantum Security Level 3',
      compliance_status: 'Fully Compliant',
      last_updated: new Date()
    });

    // Initialize quantum resources
    setQuantumResources([
      {
        id: 'qc-001',
        name: 'IBM Quantum System One',
        type: 'quantum_computer',
        status: 'online',
        capacity: {
          qubits: 127,
          quantum_volume: 128,
          throughput: 1000
        },
        utilization: {
          current_usage: 78,
          peak_usage: 95,
          average_queue_time: 125
        },
        performance: {
          gate_fidelity: 99.7,
          coherence_time: 95.2,
          error_rate: 0.003,
          temperature: 0.015
        },
        location: 'IBM Quantum Network - US East',
        provider: 'IBM',
        cost_per_hour: 3.50
      },
      {
        id: 'qc-002',
        name: 'Rigetti Aspen-11',
        type: 'quantum_computer',
        status: 'online',
        capacity: {
          qubits: 80,
          quantum_volume: 64,
          throughput: 800
        },
        utilization: {
          current_usage: 65,
          peak_usage: 88,
          average_queue_time: 89
        },
        performance: {
          gate_fidelity: 99.4,
          coherence_time: 87.3,
          error_rate: 0.005,
          temperature: 0.020
        },
        location: 'Rigetti Cloud Services',
        provider: 'Rigetti Computing',
        cost_per_hour: 2.80
      },
      {
        id: 'qc-003',
        name: 'Local Quantum Simulator',
        type: 'quantum_simulator',
        status: 'online',
        capacity: {
          qubits: 64,
          quantum_volume: 256,
          throughput: 10000
        },
        utilization: {
          current_usage: 42,
          peak_usage: 67,
          average_queue_time: 1
        },
        performance: {
          gate_fidelity: 100.0,
          coherence_time: Infinity,
          error_rate: 0.0,
          temperature: 0.0
        },
        location: 'Local Data Center',
        provider: 'OptiBid Quantum',
        cost_per_hour: 0.50
      },
      {
        id: 'qn-001',
        name: 'Global Quantum Network',
        type: 'quantum_network',
        status: 'online',
        capacity: {
          qubits: 1000,
          quantum_volume: 500,
          throughput: 50000
        },
        utilization: {
          current_usage: 34,
          peak_usage: 52,
          average_queue_time: 5
        },
        performance: {
          gate_fidelity: 99.2,
          coherence_time: 500,
          error_rate: 0.008,
          temperature: 0.0
        },
        location: 'Distributed Global Network',
        provider: 'Quantum Internet Alliance',
        cost_per_hour: 12.00
      }
    ]);

    // Initialize quantum experiments
    setQuantumExperiments([
      {
        id: 'exp-001',
        name: 'Quantum ML for Energy Optimization',
        type: 'machine_learning',
        status: 'running',
        progress: 67,
        start_time: new Date(Date.now() - 7200000),
        estimated_completion: new Date(Date.now() - 7200000 + 3600000),
        resource_requirements: {
          qubits: 16,
          shots: 10000,
          runtime: 1800
        },
        quantum_advantage_achieved: true,
        performance_metrics: {
          speedup_factor: 3.2,
          accuracy_improvement: 12.5,
          resource_efficiency: 87.3
        },
        priority: 'high',
        user_id: 'user-123',
        collaboration_id: 'collab-456'
      },
      {
        id: 'exp-002',
        name: 'Quantum Cryptography Benchmark',
        type: 'cryptography',
        status: 'completed',
        progress: 100,
        start_time: new Date(Date.now() - 14400000),
        actual_completion: new Date(Date.now() - 14400000 + 10800000),
        resource_requirements: {
          qubits: 4,
          shots: 5000,
          runtime: 900
        },
        results: {
          security_analysis: 'quantum_resistant',
          performance_metrics: {
            key_generation_time: 0.2,
            encryption_time: 0.1,
            quantum_resistance: 'Level_3'
          }
        },
        quantum_advantage_achieved: false,
        priority: 'medium',
        user_id: 'user-789'
      },
      {
        id: 'exp-003',
        name: 'Portfolio Optimization Quantum Algorithm',
        type: 'optimization',
        status: 'queued',
        progress: 0,
        start_time: new Date(),
        estimated_completion: new Date(Date.now() + 5400000),
        resource_requirements: {
          qubits: 8,
          shots: 8000,
          runtime: 1200
        },
        quantum_advantage_achieved: false,
        priority: 'medium',
        user_id: 'user-456'
      },
      {
        id: 'exp-004',
        name: 'Quantum Blockchain Consensus',
        type: 'blockchain',
        status: 'running',
        progress: 34,
        start_time: new Date(Date.now() - 3600000),
        estimated_completion: new Date(Date.now() - 3600000 + 7200000),
        resource_requirements: {
          qubits: 32,
          shots: 15000,
          runtime: 2400
        },
        quantum_advantage_achieved: true,
        performance_metrics: {
          speedup_factor: 2.1,
          accuracy_improvement: 8.7,
          resource_efficiency: 76.2
        },
        priority: 'critical',
        user_id: 'user-123'
      }
    ]);

    // Initialize real-time metrics
    initializeRealTimeMetrics();
  };

  const initializeRealTimeMetrics = () => {
    const initialMetrics = [];
    for (let i = 0; i < 30; i++) {
      initialMetrics.push({
        time: new Date(Date.now() - (29 - i) * 30000).toLocaleTimeString(),
        quantum_volume: 100 + Math.random() * 60 + i * 0.5,
        quantum_jobs: 15 + Math.random() * 20,
        quantum_advantage: 2.0 + Math.random() * 1.5,
        system_utilization: 60 + Math.random() * 30,
        security_score: 95 + Math.random() * 5
      });
    }
    setRealTimeMetrics(initialMetrics);
  };

  const fetchSystemData = () => {
    // Simulate real-time data updates
    setRealTimeMetrics(prevMetrics => {
      const newMetrics = [...prevMetrics];
      newMetrics.shift();
      newMetrics.push({
        time: new Date().toLocaleTimeString(),
        quantum_volume: 100 + Math.random() * 60,
        quantum_jobs: 15 + Math.random() * 20,
        quantum_advantage: 2.0 + Math.random() * 1.5,
        system_utilization: 60 + Math.random() * 30,
        security_score: 95 + Math.random() * 5
      });
      return newMetrics;
    });

    // Update system status timestamp
    setSystemStatus(prev => prev ? { ...prev, last_updated: new Date() } : null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal':
      case 'online':
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'operational':
      case 'running':
        return 'text-blue-600 bg-blue-100';
      case 'degraded':
      case 'maintenance':
      case 'paused':
      case 'queued':
        return 'text-yellow-600 bg-yellow-100';
      case 'critical':
      case 'offline':
      case 'failed':
      case 'error':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
      case 'completed':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'running':
        return <FireIcon className="w-5 h-5 text-orange-500 animate-pulse" />;
      case 'queued':
      case 'paused':
        return <ClockIcon className="w-5 h-5 text-blue-500" />;
      case 'failed':
      case 'offline':
      case 'error':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* System Status Dashboard */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <CpuChipIcon className="w-6 h-6 mr-2 text-blue-500" />
            Quantum Computing System Status
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsAutoRefresh(!isAutoRefresh)}
              className={`px-3 py-1 text-xs rounded ${
                isAutoRefresh ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Auto Refresh: {isAutoRefresh ? 'ON' : 'OFF'}
            </button>
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="text-xs border rounded px-2 py-1"
            >
              <option value={1000}>1s</option>
              <option value={5000}>5s</option>
              <option value={10000}>10s</option>
              <option value={30000}>30s</option>
            </select>
            <button
              onClick={fetchSystemData}
              className="p-1 text-gray-500 hover:text-gray-700"
            >
              <ArrowPathIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {systemStatus && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
              <div className="flex items-center">
                <BoltIcon className="w-8 h-8 mr-3" />
                <div>
                  <h4 className="text-sm font-medium opacity-90">System Status</h4>
                  <p className="text-2xl font-bold capitalize">{systemStatus.overall_status}</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-lg p-6 text-white">
              <div className="flex items-center">
                <RocketLaunchIcon className="w-8 h-8 mr-3" />
                <div>
                  <h4 className="text-sm font-medium opacity-90">Active Jobs</h4>
                  <p className="text-2xl font-bold">{systemStatus.active_quantum_jobs}</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-6 text-white">
              <div className="flex items-center">
                <CircuitBoardIcon className="w-8 h-8 mr-3" />
                <div>
                  <h4 className="text-sm font-medium opacity-90">Online QCs</h4>
                  <p className="text-2xl font-bold">
                    {systemStatus.quantum_computers_online}/{systemStatus.total_quantum_computers}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg p-6 text-white">
              <div className="flex items-center">
                <ArrowTrendingUpIcon className="w-8 h-8 mr-3" />
                <div>
                  <h4 className="text-sm font-medium opacity-90">Quantum Advantage</h4>
                  <p className="text-2xl font-bold">{systemStatus.quantum_advantage_factor}x</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Real-time Metrics */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <ChartBarIcon className="w-6 h-6 mr-2 text-blue-500" />
          Real-time Quantum Metrics
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={realTimeMetrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="quantum_volume" 
                stroke="#3B82F6" 
                strokeWidth={2}
                name="Quantum Volume" 
              />
              <Line 
                type="monotone" 
                dataKey="quantum_advantage" 
                stroke="#10B981" 
                strokeWidth={2}
                name="Quantum Advantage" 
              />
              <Line 
                type="monotone" 
                dataKey="system_utilization" 
                stroke="#F59E0B" 
                strokeWidth={2}
                name="System Utilization (%)" 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quantum Resources and Experiments Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quantum Resources */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CpuChipIcon className="w-6 h-6 mr-2 text-blue-500" />
            Quantum Resources
          </h3>
          <div className="space-y-3">
            {quantumResources.map((resource) => (
              <div 
                key={resource.id} 
                className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => setSelectedResource(resource)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    {getStatusIcon(resource.status)}
                    <span className="ml-2 font-medium text-gray-900">{resource.name}</span>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(resource.status)}`}>
                    {resource.status}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  {resource.type.replace('_', ' ').toUpperCase()} • {resource.provider}
                </div>
                <div className="flex justify-between text-sm">
                  <span>Qubits: {resource.capacity.qubits}</span>
                  <span>Volume: {resource.capacity.quantum_volume}</span>
                  <span>Usage: {resource.utilization.current_usage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quantum Experiments */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BeakerIcon className="w-6 h-6 mr-2 text-blue-500" />
            Quantum Experiments
          </h3>
          <div className="space-y-3">
            {quantumExperiments.map((experiment) => (
              <div key={experiment.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    {getStatusIcon(experiment.status)}
                    <span className="ml-2 font-medium text-gray-900">{experiment.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(experiment.status)}`}>
                      {experiment.status}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      experiment.priority === 'critical' ? 'bg-red-100 text-red-800' :
                      experiment.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                      experiment.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {experiment.priority}
                    </span>
                  </div>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  {experiment.type.replace('_', ' ').toUpperCase()} • {experiment.resource_requirements.qubits} qubits
                </div>
                {experiment.status === 'running' || experiment.status === 'paused' ? (
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${experiment.progress}%` }}
                    ></div>
                  </div>
                ) : null}
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Progress: {experiment.progress}%</span>
                  <span>
                    {experiment.quantum_advantage_achieved ? (
                      <span className="text-green-600">✓ Quantum Advantage</span>
                    ) : (
                      <span className="text-gray-600">Classical Baseline</span>
                    )}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderComputingPlatform = () => (
    <QuantumComputingDashboard />
  );

  const renderCryptographyPlatform = () => (
    <QuantumCryptographyManager />
  );

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'computing', name: 'Computing', icon: CpuChipIcon },
    { id: 'cryptography', name: 'Cryptography', icon: ShieldCheckIcon }
  ];

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <AtomIcon className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Quantum Computing & Cryptography Platform</h1>
          </div>
          <p className="text-lg text-gray-600">
            Comprehensive quantum computing infrastructure with advanced cryptography, 
            machine learning, blockchain integration, and quantum-resistant security
          </p>
          {systemStatus && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <ShieldCheckIcon className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="text-sm text-blue-800">
                    Security Level: {systemStatus.security_level} • 
                    Compliance: {systemStatus.compliance_status} • 
                    Last Updated: {systemStatus.last_updated.toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className={`w-2 h-2 rounded-full ${
                    systemStatus.overall_status === 'optimal' ? 'bg-green-500' :
                    systemStatus.overall_status === 'operational' ? 'bg-blue-500' :
                    systemStatus.overall_status === 'degraded' ? 'bg-yellow-500' :
                    'bg-red-500'
                  } animate-pulse`}></div>
                  <span className="text-xs text-gray-600 capitalize">{systemStatus.overall_status}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-2" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'computing' && renderComputingPlatform()}
          {activeTab === 'cryptography' && renderCryptographyPlatform()}
        </div>

        {/* Resource Detail Modal */}
        {selectedResource && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{selectedResource.name}</h3>
                <button
                  onClick={() => setSelectedResource(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Capacity</h4>
                  <div className="space-y-1 text-sm">
                    <div>Qubits: {selectedResource.capacity.qubits}</div>
                    <div>Quantum Volume: {selectedResource.capacity.quantum_volume}</div>
                    <div>Throughput: {selectedResource.capacity.throughput}</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Performance</h4>
                  <div className="space-y-1 text-sm">
                    <div>Gate Fidelity: {selectedResource.performance.gate_fidelity}%</div>
                    <div>Coherence Time: {selectedResource.performance.coherence_time}μs</div>
                    <div>Error Rate: {selectedResource.performance.error_rate}</div>
                    <div>Temperature: {selectedResource.performance.temperature}K</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Utilization</h4>
                  <div className="space-y-1 text-sm">
                    <div>Current Usage: {selectedResource.utilization.current_usage}%</div>
                    <div>Peak Usage: {selectedResource.utilization.peak_usage}%</div>
                    <div>Avg Queue Time: {selectedResource.utilization.average_queue_time}s</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Details</h4>
                  <div className="space-y-1 text-sm">
                    <div>Location: {selectedResource.location}</div>
                    <div>Provider: {selectedResource.provider}</div>
                    <div>Cost: ${selectedResource.cost_per_hour}/hour</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuantumComputingPage;
