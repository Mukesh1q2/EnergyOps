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
  FireIcon
} from '@heroicons/react/24/outline';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ScatterChart,
  Scatter
} from 'recharts';

interface QuantumComputingDashboardProps {
  className?: string;
}

interface QuantumMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: 'optimal' | 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  change: number;
  description: string;
}

interface QuantumJob {
  id: string;
  name: string;
  algorithm: string;
  qubits: number;
  status: 'running' | 'completed' | 'failed' | 'queued';
  progress: number;
  startTime: Date;
  estimatedCompletion: Date;
  priority: 'high' | 'medium' | 'low';
  resourceUsage: {
    qubits: number;
    gates: number;
    memory: number;
  };
}

interface QuantumCircuit {
  id: string;
  name: string;
  algorithm: string;
  qubits: number;
  depth: number;
  gates: number;
  complexity: 'low' | 'medium' | 'high';
  lastModified: Date;
  executionCount: number;
  avgExecutionTime: number;
}

interface QuantumProvider {
  id: string;
  name: string;
  type: 'cloud' | 'hybrid' | 'on-premise';
  availability: number;
  qubits: number;
  averageWaitTime: number;
  costPerShot: number;
  quantumVolume: number;
  errorRate: number;
}

const QuantumComputingDashboard: React.FC<QuantumComputingDashboardProps> = ({ className = '' }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [quantumMetrics, setQuantumMetrics] = useState<QuantumMetric[]>([]);
  const [quantumJobs, setQuantumJobs] = useState<QuantumJob[]>([]);
  const [quantumCircuits, setQuantumCircuits] = useState<QuantumCircuit[]>([]);
  const [quantumProviders, setQuantumProviders] = useState<QuantumProvider[]>([]);
  const [realTimeData, setRealTimeData] = useState<any[]>([]);

  useEffect(() => {
    // Initialize dashboard data
    initializeQuantumDashboard();
    
    // Set up real-time updates
    const interval = setInterval(updateRealTimeData, 5000);
    return () => clearInterval(interval);
  }, []);

  const initializeQuantumDashboard = () => {
    // Initialize quantum metrics
    setQuantumMetrics([
      {
        id: '1',
        name: 'Quantum Volume',
        value: 128,
        unit: '',
        status: 'optimal',
        trend: 'up',
        change: 12.5,
        description: 'Maximum circuit width x depth implementable on quantum computer'
      },
      {
        id: '2',
        name: 'Gate Fidelity',
        value: 99.7,
        unit: '%',
        status: 'optimal',
        trend: 'up',
        change: 0.3,
        description: 'Accuracy of quantum gate operations'
      },
      {
        id: '3',
        name: 'Qubit Coherence Time',
        value: 95.2,
        unit: 'μs',
        status: 'good',
        trend: 'stable',
        change: 0.0,
        description: 'Time quantum information is preserved'
      },
      {
        id: '4',
        name: 'Quantum Advantage',
        value: 2.8,
        unit: 'x',
        status: 'optimal',
        trend: 'up',
        change: 15.2,
        description: 'Speedup over classical computation'
      },
      {
        id: '5',
        name: 'Active Qubits',
        value: 127,
        unit: '/ 128',
        status: 'optimal',
        trend: 'up',
        change: 2.4,
        description: 'Currently available quantum bits'
      },
      {
        id: '6',
        name: 'Queue Utilization',
        value: 67,
        unit: '%',
        status: 'good',
        trend: 'down',
        change: -5.1,
        description: 'Current job queue occupancy'
      }
    ]);

    // Initialize quantum jobs
    setQuantumJobs([
      {
        id: 'qc-001',
        name: 'Quantum ML Training',
        algorithm: 'Variational Quantum Eigensolver',
        qubits: 16,
        status: 'running',
        progress: 67,
        startTime: new Date(Date.now() - 120000),
        estimatedCompletion: new Date(Date.now() - 120000 + 180000),
        priority: 'high',
        resourceUsage: {
          qubits: 16,
          gates: 1250,
          memory: 2.3
        }
      },
      {
        id: 'qc-002',
        name: 'Quantum Optimization',
        algorithm: 'Quantum Approximate Optimization',
        qubits: 8,
        status: 'completed',
        progress: 100,
        startTime: new Date(Date.now() - 300000),
        estimatedCompletion: new Date(Date.now() - 300000 + 240000),
        priority: 'medium',
        resourceUsage: {
          qubits: 8,
          gates: 890,
          memory: 1.8
        }
      },
      {
        id: 'qc-003',
        name: 'Quantum Cryptography',
        algorithm: 'Quantum Key Distribution',
        qubits: 4,
        status: 'queued',
        progress: 0,
        startTime: new Date(),
        estimatedCompletion: new Date(Date.now() + 300000),
        priority: 'low',
        resourceUsage: {
          qubits: 4,
          gates: 150,
          memory: 0.5
        }
      }
    ]);

    // Initialize quantum circuits
    setQuantumCircuits([
      {
        id: 'qcirc-001',
        name: 'Hardware Efficient Ansatz',
        algorithm: 'VQE',
        qubits: 4,
        depth: 12,
        gates: 45,
        complexity: 'medium',
        lastModified: new Date(Date.now() - 86400000),
        executionCount: 23,
        avgExecutionTime: 2.4
      },
      {
        id: 'qcirc-002',
        name: 'Quantum Fourier Transform',
        algorithm: 'QFT',
        qubits: 8,
        depth: 20,
        gates: 120,
        complexity: 'high',
        lastModified: new Date(Date.now() - 43200000),
        executionCount: 15,
        avgExecutionTime: 3.7
      },
      {
        id: 'qcirc-003',
        name: 'Bernstein-Vazirani',
        algorithm: 'BV',
        qubits: 6,
        depth: 8,
        gates: 25,
        complexity: 'low',
        lastModified: new Date(Date.now() - 3600000),
        executionCount: 156,
        avgExecutionTime: 1.2
      }
    ]);

    // Initialize quantum providers
    setQuantumProviders([
      {
        id: 'provider-001',
        name: 'IBM Quantum Network',
        type: 'cloud',
        availability: 99.8,
        qubits: 127,
        averageWaitTime: 125,
        costPerShot: 0.003,
        quantumVolume: 128,
        errorRate: 0.003
      },
      {
        id: 'provider-002',
        name: 'Rigetti Quantum Cloud',
        type: 'cloud',
        availability: 98.5,
        qubits: 80,
        averageWaitTime: 89,
        costPerShot: 0.002,
        quantumVolume: 64,
        errorRate: 0.005
      },
      {
        id: 'provider-003',
        name: 'Oxford Quantum Cloud',
        type: 'cloud',
        availability: 99.2,
        qubits: 32,
        averageWaitTime: 45,
        costPerShot: 0.005,
        quantumVolume: 32,
        errorRate: 0.002
      },
      {
        id: 'provider-004',
        name: 'Local Quantum Simulator',
        type: 'hybrid',
        availability: 100,
        qubits: 64,
        averageWaitTime: 1,
        costPerShot: 0,
        quantumVolume: 256,
        errorRate: 0
      }
    ]);

    // Initialize real-time data
    initializeRealTimeData();
  };

  const initializeRealTimeData = () => {
    const initialData = [];
    for (let i = 0; i < 20; i++) {
      initialData.push({
        time: new Date(Date.now() - (19 - i) * 60000).toLocaleTimeString(),
        quantum_volume: 100 + Math.random() * 40 + i * 0.5,
        gate_fidelity: 99.0 + Math.random() * 1.5,
        coherence_time: 80 + Math.random() * 30,
        quantum_advantage: 2.0 + Math.random() * 1.5,
        active_qubits: 120 + Math.random() * 8
      });
    }
    setRealTimeData(initialData);
  };

  const updateRealTimeData = () => {
    setRealTimeData(prevData => {
      const newData = [...prevData];
      newData.shift();
      newData.push({
        time: new Date().toLocaleTimeString(),
        quantum_volume: 100 + Math.random() * 40,
        gate_fidelity: 99.0 + Math.random() * 1.5,
        coherence_time: 80 + Math.random() * 30,
        quantum_advantage: 2.0 + Math.random() * 1.5,
        active_qubits: 120 + Math.random() * 8
      });
      return newData;
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'optimal':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'good':
        return <CheckCircleIcon className="w-5 h-5 text-blue-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />;
      case 'critical':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'good':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getJobStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <FireIcon className="w-4 h-4 text-orange-500 animate-pulse" />;
      case 'completed':
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />;
      case 'queued':
        return <ClockIcon className="w-4 h-4 text-blue-500" />;
      default:
        return <ClockIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Quantum Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quantumMetrics.map((metric) => (
          <div key={metric.id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CpuChipIcon className="w-8 h-8 text-blue-500 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-gray-500">{metric.name}</h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {metric.value}{metric.unit}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                {getStatusIcon(metric.status)}
                <span className={`text-xs px-2 py-1 rounded-full border mt-2 ${getStatusColor(metric.status)}`}>
                  {metric.status}
                </span>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Trend</span>
                <span className={`font-medium ${metric.trend === 'up' ? 'text-green-600' : metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
                  {metric.trend === 'up' ? '↗' : metric.trend === 'down' ? '↘' : '→'} {Math.abs(metric.change)}%
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-2">{metric.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Real-time Quantum Metrics Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <ChartBarIcon className="w-6 h-6 mr-2 text-blue-500" />
          Quantum Performance Metrics (Real-time)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={realTimeData}>
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
              dataKey="gate_fidelity" 
              stroke="#10B981" 
              strokeWidth={2}
              name="Gate Fidelity (%)" 
            />
            <Line 
              type="monotone" 
              dataKey="coherence_time" 
              stroke="#F59E0B" 
              strokeWidth={2}
              name="Coherence Time (μs)" 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Quantum Job Queue and Circuit Gallery */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Jobs */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <RocketLaunchIcon className="w-6 h-6 mr-2 text-blue-500" />
            Current Quantum Jobs
          </h3>
          <div className="space-y-4">
            {quantumJobs.map((job) => (
              <div key={job.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    {getJobStatusIcon(job.status)}
                    <span className="ml-2 font-medium text-gray-900">{job.name}</span>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(job.status)}`}>
                    {job.status}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  {job.algorithm} • {job.qubits} qubits
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${job.progress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>Progress: {job.progress}%</span>
                  <span>ETA: {job.estimatedCompletion.toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quantum Circuit Gallery */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CircuitBoardIcon className="w-6 h-6 mr-2 text-blue-500" />
            Quantum Circuit Library
          </h3>
          <div className="space-y-3">
            {quantumCircuits.map((circuit) => (
              <div key={circuit.id} className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-900">{circuit.name}</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    circuit.complexity === 'high' ? 'bg-red-100 text-red-800' :
                    circuit.complexity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {circuit.complexity}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  {circuit.algorithm} • {circuit.qubits} qubits • {circuit.gates} gates
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Executed {circuit.executionCount} times • Avg: {circuit.avgExecutionTime}s
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quantum Provider Comparison */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <BoltIcon className="w-6 h-6 mr-2 text-blue-500" />
          Quantum Computing Providers
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quantumProviders.map((provider) => (
            <div key={provider.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{provider.name}</h4>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  provider.type === 'cloud' ? 'bg-blue-100 text-blue-800' :
                  provider.type === 'hybrid' ? 'bg-purple-100 text-purple-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {provider.type}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Availability:</span>
                  <span className="font-medium">{provider.availability}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Qubits:</span>
                  <span className="font-medium">{provider.qubits}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Queue Time:</span>
                  <span className="font-medium">{provider.averageWaitTime}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cost/Shot:</span>
                  <span className="font-medium">${provider.costPerShot}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Quantum Volume:</span>
                  <span className="font-medium">{provider.quantumVolume}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderQuantumAlgorithms = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <BeakerIcon className="w-6 h-6 mr-2 text-blue-500" />
          Quantum Algorithm Suite
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: 'Variational Quantum Eigensolver', type: 'Optimization', qubits: '4-64', status: 'Available' },
            { name: 'Quantum Approximate Optimization', type: 'Optimization', qubits: '4-128', status: 'Available' },
            { name: 'Quantum Machine Learning', type: 'ML/AI', qubits: '4-32', status: 'Available' },
            { name: 'Quantum Fourier Transform', type: 'Signal Processing', qubits: '2-16', status: 'Available' },
            { name: 'Grover\'s Algorithm', type: 'Search', qubits: '2-32', status: 'Available' },
            { name: 'Bernstein-Vazirani', type: 'Function Finding', qubits: '2-16', status: 'Available' },
            { name: 'Quantum Genetic Algorithm', type: 'Optimization', qubits: '4-24', status: 'Beta' },
            { name: 'Quantum Annealing', type: 'Optimization', qubits: '8-2048', status: 'Available' },
            { name: 'Quantum Cryptography', type: 'Security', qubits: '2-8', status: 'Available' }
          ].map((algorithm, index) => (
            <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors">
              <h4 className="font-medium text-gray-900 mb-2">{algorithm.name}</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Type:</span>
                  <span className="font-medium">{algorithm.type}</span>
                </div>
                <div className="flex justify-between">
                  <span>Qubits:</span>
                  <span className="font-medium">{algorithm.qubits}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className={`font-medium ${
                    algorithm.status === 'Available' ? 'text-green-600' :
                    algorithm.status === 'Beta' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {algorithm.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderQuantumSecurity = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <ShieldCheckIcon className="w-6 h-6 mr-2 text-blue-500" />
          Quantum Cryptography & Security
        </h3>
        
        {/* Post-Quantum Cryptography */}
        <div className="mb-8">
          <h4 className="font-medium text-gray-900 mb-4">Post-Quantum Cryptographic Algorithms</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: 'CRYSTALS-Kyber', type: 'KEM', security: 'Level 3', status: 'NIST Standard' },
              { name: 'CRYSTALS-Dilithium', type: 'Signature', security: 'Level 2', status: 'NIST Standard' },
              { name: 'FALCON', type: 'Signature', security: 'Level 3', status: 'NIST Finalist' },
              { name: 'SPHINCS+', type: 'Signature', security: 'Level 5', status: 'NIST Finalist' },
              { name: 'Classic McEliece', type: 'KEM', security: 'Level 3', status: 'NIST Round 4' },
              { name: 'FrodoKEM', type: 'KEM', security: 'Level 3', status: 'NIST Round 3' }
            ].map((crypto, index) => (
              <div key={index} className="border rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <h5 className="font-medium text-gray-900">{crypto.name}</h5>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    crypto.status === 'NIST Standard' ? 'bg-green-100 text-green-800' :
                    crypto.status.includes('Finalist') ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {crypto.status}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <div>Type: {crypto.type}</div>
                  <div>Security: {crypto.security}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quantum Key Distribution */}
        <div className="mb-8">
          <h4 className="font-medium text-gray-900 mb-4">Quantum Key Distribution</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { protocol: 'BB84', type: 'Discrete Variable', security: 'Information Theoretic', status: 'Operational' },
              { protocol: 'E91', type: 'Entanglement-Based', security: 'Information Theoretic', status: 'Research' },
              { protocol: 'SARG04', type: 'Decoy States', security: 'Information Theoretic', status: 'Operational' }
            ].map((qkd, index) => (
              <div key={index} className="border rounded-lg p-3">
                <h5 className="font-medium text-gray-900 mb-2">{qkd.protocol}</h5>
                <div className="text-sm text-gray-600">
                  <div>Type: {qkd.type}</div>
                  <div>Security: {qkd.security}</div>
                  <div>Status: <span className={`font-medium ${
                    qkd.status === 'Operational' ? 'text-green-600' : 'text-yellow-600'
                  }`}>{qkd.status}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Homomorphic Encryption */}
        <div>
          <h4 className="font-medium text-gray-900 mb-4">Quantum-Safe Homomorphic Encryption</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { scheme: 'CKKS', type: 'Approximate', use: 'ML/AI', security: 'Quantum-Safe' },
              { scheme: 'BFV', type: 'Exact', use: 'General Computing', security: 'Quantum-Safe' },
              { scheme: 'BGV', type: 'Exact', use: 'General Computing', security: 'Quantum-Safe' },
              { scheme: 'TFHE', type: 'Boolean', use: 'Secure Computation', security: 'Quantum-Safe' }
            ].map((he, index) => (
              <div key={index} className="border rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <h5 className="font-medium text-gray-900">{he.scheme}</h5>
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                    {he.security}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <div>Type: {he.type}</div>
                  <div>Use Case: {he.use}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderQuantumML = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <AtomIcon className="w-6 h-6 mr-2 text-blue-500" />
          Quantum Machine Learning
        </h3>
        
        {/* Quantum ML Algorithms */}
        <div className="mb-8">
          <h4 className="font-medium text-gray-900 mb-4">Quantum ML Algorithms</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'Quantum Neural Network', type: 'Deep Learning', qubits: '4-16', advantage: 'Exponential' },
              { name: 'Quantum Support Vector Machine', type: 'Classification', qubits: '2-8', advantage: 'Quadratic' },
              { name: 'Quantum k-Means', type: 'Clustering', qubits: '4-32', advantage: 'Exponential' },
              { name: 'Quantum PCA', type: 'Dimensionality Reduction', qubits: '2-16', advantage: 'Exponential' },
              { name: 'Quantum GAN', type: 'Generative AI', qubits: '4-16', advantage: 'Exponential' },
              { name: 'Quantum Reinforcement Learning', type: 'RL', qubits: '4-32', advantage: 'Polynomial' }
            ].map((algorithm, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-2">{algorithm.name}</h5>
                <div className="space-y-1 text-sm text-gray-600">
                  <div>Type: {algorithm.type}</div>
                  <div>Qubits: {algorithm.qubits}</div>
                  <div className="flex justify-between">
                    <span>Quantum Advantage:</span>
                    <span className={`font-medium ${
                      algorithm.advantage === 'Exponential' ? 'text-green-600' :
                      algorithm.advantage === 'Quadratic' ? 'text-blue-600' :
                      'text-yellow-600'
                    }`}>
                      {algorithm.advantage}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Training Performance */}
        <div className="mb-8">
          <h4 className="font-medium text-gray-900 mb-4">Quantum ML Training Performance</h4>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={realTimeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="quantum_advantage" 
                stackId="1"
                stroke="#8B5CF6" 
                fill="#8B5CF6" 
                fillOpacity={0.6}
                name="Quantum Advantage Factor" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Federated Quantum Learning */}
        <div>
          <h4 className="font-medium text-gray-900 mb-4">Federated Quantum Learning</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="font-medium text-gray-700 mb-3">Client Participation</h5>
              <div className="space-y-2">
                {[
                  { client: 'Client A', accuracy: 94.2, participation: 100 },
                  { client: 'Client B', accuracy: 92.8, participation: 95 },
                  { client: 'Client C', accuracy: 89.1, participation: 88 },
                  { client: 'Client D', accuracy: 91.5, participation: 92 }
                ].map((client, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{client.client}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">{client.accuracy}%</span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${client.participation}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h5 className="font-medium text-gray-700 mb-3">Privacy Metrics</h5>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Differential Privacy Budget</span>
                  <span className="text-sm font-medium">ε = 1.2</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Quantum Privacy Preservation</span>
                  <span className="text-sm font-medium text-green-600">99.7%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Communication Overhead</span>
                  <span className="text-sm font-medium text-green-600">-45%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Federated Convergence Rate</span>
                  <span className="text-sm font-medium text-blue-600">2.3x faster</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderQuantumBlockchain = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <CubeIcon className="w-6 h-6 mr-2 text-blue-500" />
          Quantum Blockchain
        </h3>
        
        {/* Quantum Consensus Mechanisms */}
        <div className="mb-8">
          <h4 className="font-medium text-gray-900 mb-4">Quantum Consensus Mechanisms</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'Quantum PBFT', bft: '1/3', throughput: '10K TPS', latency: '100ms', status: 'Operational' },
              { name: 'Quantum Raft', bft: 'Majority', throughput: '50K TPS', latency: '50ms', status: 'Operational' },
              { name: 'Quantum Casper', bft: '1/3', throughput: '5K TPS', latency: '200ms', status: 'Beta' },
              { name: 'Quantum Tendermint', bft: '1/3', throughput: '8K TPS', latency: '150ms', status: 'Research' },
              { name: 'Quantum DAG Consensus', bft: '2/3', throughput: '100K TPS', latency: '10ms', status: 'Research' },
              { name: 'Quantum Proof of Stake', bft: '1/3', throughput: '15K TPS', latency: '80ms', status: 'Operational' }
            ].map((consensus, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h5 className="font-medium text-gray-900">{consensus.name}</h5>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    consensus.status === 'Operational' ? 'bg-green-100 text-green-800' :
                    consensus.status === 'Beta' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {consensus.status}
                  </span>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <div>BFT Tolerance: {consensus.bft}</div>
                  <div>Throughput: {consensus.throughput}</div>
                  <div>Latency: {consensus.latency}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Blockchain Metrics */}
        <div className="mb-8">
          <h4 className="font-medium text-gray-900 mb-4">Blockchain Network Metrics</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={[
                  { name: 'Transactions', classical: 5000, quantum: 15000 },
                  { name: 'Throughput', classical: 1000, quantum: 8000 },
                  { name: 'Energy Efficiency', classical: 100, quantum: 400 },
                  { name: 'Security Level', classical: 128, quantum: 256 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="classical" fill="#94A3B8" name="Classical" />
                  <Bar dataKey="quantum" fill="#3B82F6" name="Quantum" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Quantum Block Time</span>
                <span className="text-sm font-medium text-green-600">2.3s</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Quantum Finality</span>
                <span className="text-sm font-medium text-blue-600">6.7s</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Network TPS</span>
                <span className="text-sm font-medium text-green-600">15,000</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Quantum Security</span>
                <span className="text-sm font-medium text-green-600">256-bit</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Energy Consumption</span>
                <span className="text-sm font-medium text-green-600">-65%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Smart Contracts */}
        <div>
          <h4 className="font-medium text-gray-900 mb-4">Quantum Smart Contracts</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="font-medium text-gray-700 mb-3">Contract Types</h5>
              <div className="space-y-2">
                {[
                  { type: 'Quantum Treasury', contracts: 23, gas: 'Low' },
                  { type: 'Quantum Governance', contracts: 8, gas: 'Medium' },
                  { type: 'Quantum DeFi', contracts: 45, gas: 'High' },
                  { type: 'Quantum Identity', contracts: 12, gas: 'Low' }
                ].map((contract, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{contract.type}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">{contract.contracts} contracts</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        contract.gas === 'Low' ? 'bg-green-100 text-green-800' :
                        contract.gas === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {contract.gas}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h5 className="font-medium text-gray-700 mb-3">Quantum Features</h5>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                  <span>Quantum Entanglement State</span>
                </div>
                <div className="flex items-center">
                  <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                  <span>Quantum Error Correction</span>
                </div>
                <div className="flex items-center">
                  <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                  <span>Quantum Gas Optimization</span>
                </div>
                <div className="flex items-center">
                  <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                  <span>Quantum Byzantine Fault Tolerance</span>
                </div>
                <div className="flex items-center">
                  <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                  <span>Quantum Privacy Preservation</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'algorithms', name: 'Algorithms', icon: BeakerIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'quantum-ml', name: 'Quantum ML', icon: AtomIcon },
    { id: 'blockchain', name: 'Blockchain', icon: CubeIcon }
  ];

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <AtomIcon className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Quantum Computing Platform</h1>
          </div>
          <p className="text-lg text-gray-600">
            Next-generation quantum computing infrastructure with advanced cryptography, 
            machine learning, and blockchain capabilities
          </p>
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
          {activeTab === 'algorithms' && renderQuantumAlgorithms()}
          {activeTab === 'security' && renderQuantumSecurity()}
          {activeTab === 'quantum-ml' && renderQuantumML()}
          {activeTab === 'blockchain' && renderQuantumBlockchain()}
        </div>
      </div>
    </div>
  );
};

export default QuantumComputingDashboard;
