'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheckIcon, 
  KeyIcon, 
  LockClosedIcon, 
  EyeIcon,
  DocumentDuplicateIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  CpuChipIcon,
  GlobeAltIcon,
  ServerIcon,
  FingerPrintIcon,
  CloudIcon
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

interface QuantumCryptographyManagerProps {
  className?: string;
}

interface CryptographicAlgorithm {
  id: string;
  name: string;
  type: 'KEM' | 'Signature' | 'Hash' | 'Encryption';
  category: 'Lattice-based' | 'Code-based' | 'Hash-based' | 'Multivariate' | 'Isogeny-based' | 'MQ-based';
  security_level: number;
  nist_status: 'Standard' | 'Finalist' | 'Semifinalist' | 'Additional' | 'Rejected';
  key_size: string;
  signature_size?: string;
  performance: {
    keygen_time: number;
    encryption_time: number;
    decryption_time: number;
    signing_time?: number;
    verification_time?: number;
  };
  quantum_resistance: 'Level_1' | 'Level_3' | 'Level_5';
  classical_security: string;
  implementation_status: 'Production' | 'Beta' | 'Research' | 'Deprecated';
}

interface KeyDistributionSession {
  id: string;
  protocol: string;
  status: 'active' | 'established' | 'failed' | 'timeout' | 'interrupted';
  key_length: number;
  error_rate: number;
  secure_key_rate: number;
  qber: number;
  sifted_key_rate: number;
  final_key_length: number;
  security_level: string;
  channel_info: {
    fiber_length: number;
    wavelength: number;
    bit_rate: number;
    error_correction: string;
  };
  start_time: Date;
  duration?: number;
}

interface HomomorphicOperation {
  id: string;
  scheme: 'CKKS' | 'BFV' | 'BGV' | 'TFHE';
  operation_type: 'Addition' | 'Multiplication' | 'Polynomial Evaluation' | 'Neural Network' | 'Database Query';
  input_ciphertexts: number;
  noise_budget: number;
  multiplicative_depth: number;
  scale_factor: number;
  computation_result?: any;
  performance: {
    computation_time: number;
    memory_usage: number;
    accuracy_loss: number;
  };
  status: 'running' | 'completed' | 'failed';
  start_time: Date;
}

interface MigrationPlan {
  id: string;
  from_algorithm: string;
  to_algorithm: string;
  migration_mode: 'Hybrid' | 'Pure Quantum' | 'Progressive' | 'Emergency';
  compatibility_score: number;
  performance_impact: {
    key_generation: number;
    encryption: number;
    decryption: number;
    signature: number;
  };
  security_improvement: number;
  migration_progress: number;
  estimated_completion: Date;
  rollback_plan: string;
  status: 'planning' | 'in_progress' | 'completed' | 'failed';
}

const QuantumCryptographyManager: React.FC<QuantumCryptographyManagerProps> = ({ className = '' }) => {
  const [activeTab, setActiveTab] = useState('algorithms');
  const [algorithms, setAlgorithms] = useState<CryptographicAlgorithm[]>([]);
  const [keyDistributionSessions, setKeyDistributionSessions] = useState<KeyDistributionSession[]>([]);
  const [homomorphicOperations, setHomomorphicOperations] = useState<HomomorphicOperation[]>([]);
  const [migrationPlans, setMigrationPlans] = useState<MigrationPlan[]>([]);
  const [securityMetrics, setSecurityMetrics] = useState<any>({});
  const [realTimeData, setRealTimeData] = useState<any[]>([]);

  useEffect(() => {
    // Initialize quantum cryptography manager
    initializeQuantumCryptography();
    
    // Set up real-time updates
    const interval = setInterval(updateRealTimeData, 5000);
    return () => clearInterval(interval);
  }, []);

  const initializeQuantumCryptography = () => {
    // Initialize cryptographic algorithms
    setAlgorithms([
      {
        id: 'kyber-512',
        name: 'CRYSTALS-Kyber',
        type: 'KEM',
        category: 'Lattice-based',
        security_level: 512,
        nist_status: 'Standard',
        key_size: '800 bytes',
        performance: {
          keygen_time: 0.2,
          encryption_time: 0.1,
          decryption_time: 0.1
        },
        quantum_resistance: 'Level_3',
        classical_security: 'AES-256 equivalent',
        implementation_status: 'Production'
      },
      {
        id: 'dilithium-2',
        name: 'CRYSTALS-Dilithium',
        type: 'Signature',
        category: 'Lattice-based',
        security_level: 256,
        nist_status: 'Standard',
        key_size: '1312 bytes',
        signature_size: '2420 bytes',
        performance: {
          keygen_time: 0.3,
          signing_time: 0.2,
          verification_time: 0.1
        },
        quantum_resistance: 'Level_2',
        classical_security: 'SHA-256 equivalent',
        implementation_status: 'Production'
      },
      {
        id: 'falcon-512',
        name: 'FALCON',
        type: 'Signature',
        category: 'Lattice-based',
        security_level: 512,
        nist_status: 'Finalist',
        key_size: '1281 bytes',
        signature_size: '690 bytes',
        performance: {
          keygen_time: 0.4,
          signing_time: 0.15,
          verification_time: 0.08
        },
        quantum_resistance: 'Level_3',
        classical_security: 'SHA-256 equivalent',
        implementation_status: 'Beta'
      },
      {
        id: 'sphincs-256f',
        name: 'SPHINCS+',
        type: 'Signature',
        category: 'Hash-based',
        security_level: 256,
        nist_status: 'Finalist',
        key_size: '64 bytes',
        signature_size: '49856 bytes',
        performance: {
          keygen_time: 0.02,
          signing_time: 35.0,
          verification_time: 0.9
        },
        quantum_resistance: 'Level_5',
        classical_security: 'SHA-256 equivalent',
        implementation_status: 'Research'
      },
      {
        id: 'mceliece-6960119',
        name: 'Classic McEliece',
        type: 'KEM',
        category: 'Code-based',
        security_level: 256,
        nist_status: 'Round 4',
        key_size: '1044992 bytes',
        performance: {
          keygen_time: 120.0,
          encryption_time: 0.02,
          decryption_time: 0.02
        },
        quantum_resistance: 'Level_3',
        classical_security: 'AES-256 equivalent',
        implementation_status: 'Research'
      },
      {
        id: 'bike-1',
        name: 'BIKE',
        type: 'KEM',
        category: 'Code-based',
        security_level: 128,
        nist_status: 'Round 3',
        key_size: '1543 bytes',
        performance: {
          keygen_time: 1.2,
          encryption_time: 0.15,
          decryption_time: 0.12
        },
        quantum_resistance: 'Level_1',
        classical_security: 'AES-128 equivalent',
        implementation_status: 'Beta'
      }
    ]);

    // Initialize key distribution sessions
    setKeyDistributionSessions([
      {
        id: 'qkd-session-001',
        protocol: 'BB84',
        status: 'active',
        key_length: 256,
        error_rate: 0.05,
        secure_key_rate: 0.85,
        qber: 0.05,
        sifted_key_rate: 0.92,
        final_key_length: 240,
        security_level: 'Information Theoretically Secure',
        channel_info: {
          fiber_length: 100,
          wavelength: 1550,
          bit_rate: 1000,
          error_correction: 'LDPC'
        },
        start_time: new Date(Date.now() - 300000)
      },
      {
        id: 'qkd-session-002',
        protocol: 'SARG04',
        status: 'established',
        key_length: 128,
        error_rate: 0.03,
        secure_key_rate: 0.91,
        qber: 0.03,
        sifted_key_rate: 0.95,
        final_key_length: 125,
        security_level: 'Information Theoretically Secure',
        channel_info: {
          fiber_length: 50,
          wavelength: 1550,
          bit_rate: 2000,
          error_correction: 'Cascade'
        },
        start_time: new Date(Date.now() - 600000),
        duration: 600000
      }
    ]);

    // Initialize homomorphic operations
    setHomomorphicOperations([
      {
        id: 'he-op-001',
        scheme: 'CKKS',
        operation_type: 'Neural Network',
        input_ciphertexts: 3,
        noise_budget: 89.2,
        multiplicative_depth: 15,
        scale_factor: 40,
        performance: {
          computation_time: 2.4,
          memory_usage: 512,
          accuracy_loss: 0.02
        },
        status: 'running',
        start_time: new Date(Date.now() - 120000)
      },
      {
        id: 'he-op-002',
        scheme: 'BFV',
        operation_type: 'Addition',
        input_ciphertexts: 2,
        noise_budget: 95.8,
        multiplicative_depth: 1,
        scale_factor: 32,
        computation_result: { result: 150 },
        performance: {
          computation_time: 0.1,
          memory_usage: 64,
          accuracy_loss: 0.0
        },
        status: 'completed',
        start_time: new Date(Date.now() - 30000)
      }
    ]);

    // Initialize migration plans
    setMigrationPlans([
      {
        id: 'migration-001',
        from_algorithm: 'RSA-2048',
        to_algorithm: 'CRYSTALS-Kyber-512',
        migration_mode: 'Hybrid',
        compatibility_score: 95.2,
        performance_impact: {
          key_generation: -15,
          encryption: -25,
          decryption: -20,
          signature: -30
        },
        security_improvement: 40.5,
        migration_progress: 67,
        estimated_completion: new Date(Date.now() + 86400000),
        rollback_plan: 'Immediate fallback to RSA if quantum migration fails',
        status: 'in_progress'
      },
      {
        id: 'migration-002',
        from_algorithm: 'ECDSA-P256',
        to_algorithm: 'CRYSTALS-Dilithium-2',
        migration_mode: 'Progressive',
        compatibility_score: 88.7,
        performance_impact: {
          key_generation: -10,
          encryption: 0,
          decryption: 0,
          signature: -35
        },
        security_improvement: 35.2,
        migration_progress: 23,
        estimated_completion: new Date(Date.now() + 172800000),
        rollback_plan: 'Maintain parallel ECDSA infrastructure during transition',
        status: 'planning'
      }
    ]);

    // Initialize security metrics
    setSecurityMetrics({
      overall_security_level: 256,
      quantum_resistance_score: 98.5,
      classical_breach_resistance: 99.9,
      future_threat_mitigation: 97.8,
      compliance_score: 96.3,
      performance_score: 92.1
    });

    // Initialize real-time data
    initializeRealTimeData();
  };

  const initializeRealTimeData = () => {
    const initialData = [];
    for (let i = 0; i < 20; i++) {
      initialData.push({
        time: new Date(Date.now() - (19 - i) * 60000).toLocaleTimeString(),
        key_distribution_rate: 1000 + Math.random() * 500 + i * 10,
        homomorphic_computations: 10 + Math.random() * 20,
        security_score: 95 + Math.random() * 5,
        quantum_advantage: 2.0 + Math.random() * 1.0
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
        key_distribution_rate: 1000 + Math.random() * 500,
        homomorphic_computations: 10 + Math.random() * 20,
        security_score: 95 + Math.random() * 5,
        quantum_advantage: 2.0 + Math.random() * 1.0
      });
      return newData;
    });
  };

  const getNISTStatusColor = (status: string) => {
    switch (status) {
      case 'Standard':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Finalist':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Semifinalist':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Additional':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getImplementationStatusIcon = (status: string) => {
    switch (status) {
      case 'Production':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'Beta':
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
      case 'Research':
        return <ExclamationTriangleIcon className="w-5 h-5 text-blue-500" />;
      case 'Deprecated':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const renderAlgorithmOverview = () => (
    <div className="space-y-6">
      {/* Security Metrics Dashboard */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <ShieldCheckIcon className="w-6 h-6 mr-2 text-blue-500" />
          Quantum Cryptography Security Dashboard
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
            <div className="flex items-center">
              <CpuChipIcon className="w-8 h-8 mr-3" />
              <div>
                <h4 className="text-sm font-medium opacity-90">Security Level</h4>
                <p className="text-2xl font-bold">{securityMetrics.overall_security_level}-bit</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-lg p-6 text-white">
            <div className="flex items-center">
              <LockClosedIcon className="w-8 h-8 mr-3" />
              <div>
                <h4 className="text-sm font-medium opacity-90">Quantum Resistance</h4>
                <p className="text-2xl font-bold">{securityMetrics.quantum_resistance_score}%</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-6 text-white">
            <div className="flex items-center">
              <FingerPrintIcon className="w-8 h-8 mr-3" />
              <div>
                <h4 className="text-sm font-medium opacity-90">Future Threat Protection</h4>
                <p className="text-2xl font-bold">{securityMetrics.future_threat_mitigation}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Security Metrics */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Real-time Security Metrics</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={realTimeData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="security_score" 
              stroke="#10B981" 
              strokeWidth={2}
              name="Security Score (%)" 
            />
            <Line 
              type="monotone" 
              dataKey="quantum_advantage" 
              stroke="#8B5CF6" 
              strokeWidth={2}
              name="Quantum Advantage Factor" 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Algorithm Performance Comparison */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Algorithm Performance Comparison</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={algorithms.map(alg => ({
            name: alg.name.split('-')[0],
            keygen: alg.performance.keygen_time * 1000,
            encryption: alg.performance.encryption_time * 1000,
            decryption: alg.performance.decryption_time * 1000,
            security: alg.security_level
          }))}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="keygen" fill="#3B82F6" name="KeyGen (ms)" />
            <Bar dataKey="encryption" fill="#10B981" name="Encryption (ms)" />
            <Bar dataKey="decryption" fill="#F59E0B" name="Decryption (ms)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderPostQuantumAlgorithms = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <KeyIcon className="w-6 h-6 mr-2 text-blue-500" />
          Post-Quantum Cryptographic Algorithms
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {algorithms.map((algorithm) => (
            <div key={algorithm.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">{algorithm.name}</h4>
                  <p className="text-sm text-gray-600">{algorithm.category} • {algorithm.type}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {getImplementationStatusIcon(algorithm.implementation_status)}
                  <span className={`px-2 py-1 text-xs rounded-full border ${getNISTStatusColor(algorithm.nist_status)}`}>
                    {algorithm.nist_status}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-1">Security Level</h5>
                  <p className="text-lg font-bold text-blue-600">{algorithm.security_level}-bit</p>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-1">Key Size</h5>
                  <p className="text-sm font-mono text-gray-900">{algorithm.key_size}</p>
                </div>
                {algorithm.signature_size && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-1">Signature Size</h5>
                    <p className="text-sm font-mono text-gray-900">{algorithm.signature_size}</p>
                  </div>
                )}
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-1">Quantum Resistance</h5>
                  <p className="text-sm font-medium text-green-600">{algorithm.quantum_resistance}</p>
                </div>
              </div>

              <div className="mb-4">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Performance Metrics</h5>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between">
                    <span>KeyGen:</span>
                    <span className="font-mono">{algorithm.performance.keygen_time.toFixed(2)}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Encrypt:</span>
                    <span className="font-mono">{algorithm.performance.encryption_time.toFixed(2)}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Decrypt:</span>
                    <span className="font-mono">{algorithm.performance.decryption_time.toFixed(2)}ms</span>
                  </div>
                  {algorithm.performance.signing_time && (
                    <div className="flex justify-between">
                      <span>Sign:</span>
                      <span className="font-mono">{algorithm.performance.signing_time.toFixed(2)}ms</span>
                    </div>
                  )}
                  {algorithm.performance.verification_time && (
                    <div className="flex justify-between">
                      <span>Verify:</span>
                      <span className="font-mono">{algorithm.performance.verification_time.toFixed(2)}ms</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Classical Security: {algorithm.classical_security}</span>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                    Deploy
                  </button>
                  <button className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                    Test
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderQuantumKeyDistribution = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <GlobeAltIcon className="w-6 h-6 mr-2 text-blue-500" />
          Quantum Key Distribution
        </h3>
        
        {/* Active Sessions */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Active QKD Sessions</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {keyDistributionSessions.map((session) => (
              <div key={session.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${
                      session.status === 'active' ? 'bg-green-500 animate-pulse' :
                      session.status === 'established' ? 'bg-blue-500' :
                      session.status === 'failed' ? 'bg-red-500' :
                      'bg-yellow-500'
                    }`}></div>
                    <span className="font-medium text-gray-900">{session.protocol} • {session.id}</span>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    session.status === 'active' ? 'bg-green-100 text-green-800' :
                    session.status === 'established' ? 'bg-blue-100 text-blue-800' :
                    session.status === 'failed' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {session.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Key Length:</span>
                    <span className="ml-1 font-medium">{session.key_length} bits</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Error Rate:</span>
                    <span className="ml-1 font-medium">{(session.error_rate * 100).toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-gray-600">QBER:</span>
                    <span className="ml-1 font-medium">{(session.qber * 100).toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Final Key:</span>
                    <span className="ml-1 font-medium">{session.final_key_length} bits</span>
                  </div>
                </div>

                <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
                  <div className="flex justify-between">
                    <span>Fiber: {session.channel_info.fiber_length}km</span>
                    <span>Bit Rate: {session.channel_info.bit_rate} Mbps</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* QKD Protocols */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Supported QKD Protocols</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { protocol: 'BB84', type: 'Discrete Variable', security: 'Information Theoretic', status: 'Production' },
              { protocol: 'E91', type: 'Entanglement-Based', security: 'Information Theoretic', status: 'Research' },
              { protocol: 'SARG04', type: 'Decoy States', security: 'Information Theoretic', status: 'Production' },
              { protocol: 'SIFO', type: 'Continuous Variable', security: 'Information Theoretic', status: 'Beta' },
              { protocol: 'DPS', type: 'Differential Phase Shift', security: 'Information Theoretic', status: 'Research' },
              { protocol: 'CVVDP', type: 'Continuous Variable', security: 'Information Theoretic', status: 'Beta' }
            ].map((protocol, index) => (
              <div key={index} className="border rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <h5 className="font-medium text-gray-900">{protocol.protocol}</h5>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    protocol.status === 'Production' ? 'bg-green-100 text-green-800' :
                    protocol.status === 'Beta' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {protocol.status}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <div>Type: {protocol.type}</div>
                  <div>Security: {protocol.security}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* QKD Performance Metrics */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Performance Metrics</h4>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={realTimeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="key_distribution_rate" 
                stackId="1"
                stroke="#3B82F6" 
                fill="#3B82F6" 
                fillOpacity={0.6}
                name="Key Distribution Rate (bps)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const renderHomomorphicEncryption = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <ServerIcon className="w-6 h-6 mr-2 text-blue-500" />
          Homomorphic Encryption
        </h3>

        {/* Active Operations */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Active Homomorphic Operations</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {homomorphicOperations.map((operation) => (
              <div key={operation.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${
                      operation.status === 'running' ? 'bg-blue-500 animate-pulse' :
                      operation.status === 'completed' ? 'bg-green-500' :
                      'bg-red-500'
                    }`}></div>
                    <span className="font-medium text-gray-900">{operation.scheme} • {operation.operation_type}</span>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    operation.status === 'running' ? 'bg-blue-100 text-blue-800' :
                    operation.status === 'completed' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {operation.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div>
                    <span className="text-gray-600">Input Ciphertexts:</span>
                    <span className="ml-1 font-medium">{operation.input_ciphertexts}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Noise Budget:</span>
                    <span className="ml-1 font-medium">{operation.noise_budget.toFixed(1)} bits</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Multiplicative Depth:</span>
                    <span className="ml-1 font-medium">{operation.multiplicative_depth}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Scale Factor:</span>
                    <span className="ml-1 font-medium">2^{operation.scale_factor}</span>
                  </div>
                </div>

                <div className="p-2 bg-gray-50 rounded text-xs">
                  <div className="flex justify-between mb-1">
                    <span>Computation Time:</span>
                    <span className="font-mono">{operation.performance.computation_time.toFixed(2)}s</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span>Memory Usage:</span>
                    <span className="font-mono">{operation.performance.memory_usage} MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Accuracy Loss:</span>
                    <span className="font-mono">{(operation.performance.accuracy_loss * 100).toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Homomorphic Encryption Schemes */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Supported Encryption Schemes</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { scheme: 'CKKS', type: 'Approximate Arithmetic', use_case: 'Machine Learning', security: 'Quantum-Safe' },
              { scheme: 'BFV', type: 'Exact Arithmetic', use_case: 'General Computing', security: 'Quantum-Safe' },
              { scheme: 'BGV', type: 'Exact Arithmetic', use_case: 'General Computing', security: 'Quantum-Safe' },
              { scheme: 'TFHE', type: 'Boolean Circuit', use_case: 'Secure Computation', security: 'Quantum-Safe' }
            ].map((scheme, index) => (
              <div key={index} className="border rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <h5 className="font-medium text-gray-900">{scheme.scheme}</h5>
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                    {scheme.security}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <div>Type: {scheme.type}</div>
                  <div>Use Case: {scheme.use_case}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* HE Performance Metrics */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Homomorphic Computing Performance</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={realTimeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="homomorphic_computations" 
                stroke="#F59E0B" 
                strokeWidth={2}
                name="Operations/Minute" 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const renderMigrationManagement = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <ArrowPathIcon className="w-6 h-6 mr-2 text-blue-500" />
          Cryptographic Migration Management
        </h3>

        {/* Migration Plans */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Active Migration Plans</h4>
          <div className="space-y-4">
            {migrationPlans.map((plan) => (
              <div key={plan.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h5 className="font-medium text-gray-900">
                      {plan.from_algorithm} → {plan.to_algorithm}
                    </h5>
                    <p className="text-sm text-gray-600">{plan.migration_mode} Migration</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      plan.status === 'completed' ? 'bg-green-100 text-green-800' :
                      plan.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      plan.status === 'planning' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {plan.status}
                    </span>
                    <span className="text-sm text-gray-500">{plan.migration_progress}%</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <h6 className="text-sm font-medium text-gray-700 mb-1">Compatibility Score</h6>
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${plan.compatibility_score}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{plan.compatibility_score.toFixed(1)}%</span>
                    </div>
                  </div>
                  <div>
                    <h6 className="text-sm font-medium text-gray-700 mb-1">Security Improvement</h6>
                    <p className="text-lg font-bold text-green-600">+{plan.security_improvement.toFixed(1)}%</p>
                  </div>
                  <div>
                    <h6 className="text-sm font-medium text-gray-700 mb-1">Estimated Completion</h6>
                    <p className="text-sm text-gray-900">{plan.estimated_completion.toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="mb-3">
                  <h6 className="text-sm font-medium text-gray-700 mb-2">Performance Impact</h6>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span>Key Generation:</span>
                      <span className={`font-medium ${
                        plan.performance_impact.key_generation < 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {plan.performance_impact.key_generation > 0 ? '+' : ''}{plan.performance_impact.key_generation}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Encryption:</span>
                      <span className={`font-medium ${
                        plan.performance_impact.encryption < 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {plan.performance_impact.encryption > 0 ? '+' : ''}{plan.performance_impact.encryption}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Decryption:</span>
                      <span className={`font-medium ${
                        plan.performance_impact.decryption < 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {plan.performance_impact.decryption > 0 ? '+' : ''}{plan.performance_impact.decryption}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Signature:</span>
                      <span className={`font-medium ${
                        plan.performance_impact.signature < 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {plan.performance_impact.signature > 0 ? '+' : ''}{plan.performance_impact.signature}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-2 bg-blue-50 rounded text-xs">
                  <span className="font-medium text-blue-800">Rollback Plan: </span>
                  <span className="text-blue-700">{plan.rollback_plan}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Migration Strategies */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Migration Strategies</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { strategy: 'Hybrid', description: 'Both classical and quantum algorithms running in parallel', risk: 'Low', timeline: '6-12 months' },
              { strategy: 'Pure Quantum', description: 'Complete migration to quantum-resistant algorithms', risk: 'Medium', timeline: '12-18 months' },
              { strategy: 'Progressive', description: 'Gradual migration based on security priority', risk: 'Low', timeline: '18-24 months' },
              { strategy: 'Emergency', description: 'Rapid migration in response to quantum threats', risk: 'High', timeline: '1-3 months' }
            ].map((strategy, index) => (
              <div key={index} className="border rounded-lg p-3">
                <h5 className="font-medium text-gray-900 mb-2">{strategy.strategy}</h5>
                <p className="text-sm text-gray-600 mb-3">{strategy.description}</p>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Risk:</span>
                    <span className={`font-medium ${
                      strategy.risk === 'Low' ? 'text-green-600' :
                      strategy.risk === 'Medium' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {strategy.risk}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Timeline:</span>
                    <span className="font-medium">{strategy.timeline}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Compliance Monitoring */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Compliance & Standards</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { standard: 'NIST Post-Quantum', status: 'Compliant', progress: 100 },
              { standard: 'ETSI Quantum Safe', status: 'In Progress', progress: 85 },
              { standard: 'IEEE Quantum Cryptography', status: 'Compliant', progress: 100 },
              { standard: 'ISO/IEC 23093', status: 'Planning', progress: 60 },
              { standard: 'FIPS 140-3', status: 'In Progress', progress: 90 }
            ].map((compliance, index) => (
              <div key={index} className="border rounded-lg p-3 text-center">
                <h5 className="font-medium text-gray-900 mb-2 text-sm">{compliance.standard}</h5>
                <div className="mb-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    compliance.status === 'Compliant' ? 'bg-green-100 text-green-800' :
                    compliance.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {compliance.status}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${compliance.progress}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-500 mt-1 block">{compliance.progress}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'algorithms', name: 'Algorithms', icon: KeyIcon },
    { id: 'key-distribution', name: 'QKD', icon: GlobeAltIcon },
    { id: 'homomorphic', name: 'Homomorphic', icon: ServerIcon },
    { id: 'migration', name: 'Migration', icon: ArrowPathIcon }
  ];

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <ShieldCheckIcon className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Quantum Cryptography Management</h1>
          </div>
          <p className="text-lg text-gray-600">
            Comprehensive post-quantum cryptography platform with quantum key distribution, 
            homomorphic encryption, and migration management
          </p>
        </div>

        {/* Algorithm Overview */}
        {renderAlgorithmOverview()}

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
          {activeTab === 'algorithms' && renderPostQuantumAlgorithms()}
          {activeTab === 'key-distribution' && renderQuantumKeyDistribution()}
          {activeTab === 'homomorphic' && renderHomomorphicEncryption()}
          {activeTab === 'migration' && renderMigrationManagement()}
        </div>
      </div>
    </div>
  );
};

export default QuantumCryptographyManager;
