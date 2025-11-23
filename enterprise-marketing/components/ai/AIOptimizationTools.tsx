'use client';

import React, { useState, useEffect } from 'react';
import { 
  BoltIcon,
  ChartBarIcon,
  CogIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlayIcon,
  StopIcon,
  PauseIcon,
  ArrowPathIcon,
  EyeIcon,
  AdjustmentsHorizontalIcon,
  SparklesIcon,
  FireIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

interface Optimization {
  id: string;
  problemType: 'trading' | 'portfolio' | 'dispatch' | 'scheduling' | 'resource_allocation';
  objective: string;
  status: 'running' | 'completed' | 'failed' | 'paused';
  progress: number;
  startTime: string;
  estimatedCompletion?: string;
  results?: {
    total_cost: number;
    total_profit: number;
    total_efficiency: number;
    risk_score: number;
    carbon_emissions: number;
    reliability_index: number;
  };
  recommendations: string[];
  confidence: number;
  processingTime?: number;
}

interface OptimizationScenario {
  id: string;
  name: string;
  description: string;
  constraints: Record<string, any>;
  expectedOutcome: {
    profit_improvement: number;
    efficiency_gain: number;
    risk_reduction: number;
    implementation_cost: number;
  };
  feasibility: 'high' | 'medium' | 'low';
  timeline: string;
}

export default function AIOptimizationTools() {
  const [activeTab, setActiveTab] = useState<'active' | 'scenarios' | 'results' | 'settings'>('active');
  const [optimizations, setOptimizations] = useState<Optimization[]>([]);
  const [scenarios, setScenarios] = useState<OptimizationScenario[]>([]);
  const [selectedOptimization, setSelectedOptimization] = useState<Optimization | null>(null);
  const [newOptimization, setNewOptimization] = useState({
    problemType: 'trading',
    objective: 'maximize_profit',
    timeHorizon: 'daily',
    riskTolerance: 'medium',
    sustainabilityWeight: 0.5
  });
  const [isOptimizing, setIsOptimizing] = useState(false);

  useEffect(() => {
    loadOptimizationData();
  }, []);

  const loadOptimizationData = async () => {
    try {
      // Simulate fetching optimization data
      const mockOptimizations: Optimization[] = [
        {
          id: 'opt_001',
          problemType: 'trading',
          objective: 'maximize_profit',
          status: 'completed',
          progress: 100,
          startTime: new Date(Date.now() - 3600000).toISOString(),
          processingTime: 180,
          results: {
            total_cost: -125000,
            total_profit: 245000,
            total_efficiency: 94.2,
            risk_score: 23.5,
            carbon_emissions: 1240,
            reliability_index: 97.8
          },
          recommendations: [
            'Increase solar allocation by 15% during peak hours',
            'Reduce gas generation during off-peak periods',
            'Implement demand response programs for industrial clients'
          ],
          confidence: 0.91
        },
        {
          id: 'opt_002',
          problemType: 'portfolio',
          objective: 'minimize_risk',
          status: 'running',
          progress: 67,
          startTime: new Date(Date.now() - 1800000).toISOString(),
          estimatedCompletion: new Date(Date.now() + 900000).toISOString(),
          results: undefined,
          recommendations: [],
          confidence: 0.0
        },
        {
          id: 'opt_003',
          problemType: 'dispatch',
          objective: 'maximize_efficiency',
          status: 'completed',
          progress: 100,
          startTime: new Date(Date.now() - 7200000).toISOString(),
          processingTime: 240,
          results: {
            total_cost: -89000,
            total_profit: 167000,
            total_efficiency: 96.7,
            risk_score: 18.2,
            carbon_emissions: 980,
            reliability_index: 98.9
          },
          recommendations: [
            'Optimal unit commitment achieved',
            'Maintenance scheduling aligned with demand patterns',
            'Storage utilization maximized for arbitrage opportunities'
          ],
          confidence: 0.94
        },
        {
          id: 'opt_004',
          problemType: 'scheduling',
          objective: 'minimize_cost',
          status: 'paused',
          progress: 43,
          startTime: new Date(Date.now() - 1200000).toISOString(),
          results: undefined,
          recommendations: [],
          confidence: 0.0
        },
        {
          id: 'opt_005',
          problemType: 'resource_allocation',
          objective: 'optimize_reliability',
          status: 'failed',
          progress: 23,
          startTime: new Date(Date.now() - 3000000).toISOString(),
          results: undefined,
          recommendations: ['Data quality issues detected', 'Insufficient constraint information'],
          confidence: 0.0
        }
      ];

      setOptimizations(mockOptimizations);

      const mockScenarios: OptimizationScenario[] = [
        {
          id: 'scenario_001',
          name: 'Peak Demand Optimization',
          description: 'Optimize energy allocation for peak demand periods with focus on cost minimization',
          constraints: {
            max_demand: '1500 MW',
            min_renewable: '60%',
            max_emissions: '800 tons CO2/day',
            budget_limit: '$2M'
          },
          expectedOutcome: {
            profit_improvement: 18.5,
            efficiency_gain: 12.3,
            risk_reduction: 8.7,
            implementation_cost: 125000
          },
          feasibility: 'high',
          timeline: '2-3 weeks'
        },
        {
          id: 'scenario_002',
          name: 'Carbon Neutral Portfolio',
          description: 'Transition to carbon-neutral energy portfolio while maintaining profitability',
          constraints: {
            carbon_limit: '0 tons CO2',
            renewable_min: '100%',
            cost_increase_max: '25%',
            reliability_min: '99.5%'
          },
          expectedOutcome: {
            profit_improvement: -5.2,
            efficiency_gain: 8.9,
            risk_reduction: 15.4,
            implementation_cost: 450000
          },
          feasibility: 'medium',
          timeline: '8-12 weeks'
        },
        {
          id: 'scenario_003',
          name: 'Storage Arbitrage Maximization',
          description: 'Optimize battery storage scheduling for maximum arbitrage opportunities',
          constraints: {
            storage_capacity: '500 MWh',
            charge_cycles_max: '2 per day',
            degradation_limit: '0.1% per cycle',
            min_profit_threshold: '$50K/month'
          },
          expectedOutcome: {
            profit_improvement: 34.2,
            efficiency_gain: 22.1,
            risk_reduction: 5.3,
            implementation_cost: 75000
          },
          feasibility: 'high',
          timeline: '1-2 weeks'
        },
        {
          id: 'scenario_004',
          name: 'Risk-Averse Trading Strategy',
          description: 'Conservative trading approach with focus on risk mitigation',
          constraints: {
            var_limit: '5%',
            max_position_size: '10%',
            min_hold_period: '30 days',
            diversification_min: '8 assets'
          },
          expectedOutcome: {
            profit_improvement: 8.7,
            efficiency_gain: 6.2,
            risk_reduction: 45.8,
            implementation_cost: 89000
          },
          feasibility: 'high',
          timeline: '3-4 weeks'
        },
        {
          id: 'scenario_005',
          name: 'Emergency Response Optimization',
          description: 'Prepare grid for emergency situations with optimal resource allocation',
          constraints: {
            backup_capacity_min: '200%',
            response_time_max: '5 minutes',
            min_uptime: '99.99%',
            cost_no_limit: true
          },
          expectedOutcome: {
            profit_improvement: -15.3,
            efficiency_gain: -8.2,
            risk_reduction: 78.5,
            implementation_cost: 1200000
          },
          feasibility: 'low',
          timeline: '16-24 weeks'
        }
      ];

      setScenarios(mockScenarios);

    } catch (error) {
      console.error('Error loading optimization data:', error);
    }
  };

  const runOptimization = async () => {
    setIsOptimizing(true);
    try {
      const response = await fetch('/api/ai/optimization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemType: newOptimization.problemType,
          objective: newOptimization.objective,
          timeHorizon: newOptimization.timeHorizon,
          assets: generateMockAssets(),
          parameters: {
            risk_tolerance: newOptimization.riskTolerance,
            sustainability_weight: newOptimization.sustainabilityWeight
          }
        })
      });
      
      const result = await response.json();
      if (response.ok && result.optimization) {
        alert('Optimization started successfully!');
        await loadOptimizationData();
      }
    } catch (error) {
      console.error('Error running optimization:', error);
      alert('Failed to start optimization');
    } finally {
      setIsOptimizing(false);
    }
  };

  const pauseOptimization = (id: string) => {
    setOptimizations(prev => prev.map(opt => 
      opt.id === id ? { ...opt, status: 'paused' } : opt
    ));
  };

  const resumeOptimization = (id: string) => {
    setOptimizations(prev => prev.map(opt => 
      opt.id === id ? { ...opt, status: 'running' } : opt
    ));
  };

  const stopOptimization = (id: string) => {
    setOptimizations(prev => prev.map(opt => 
      opt.id === id ? { ...opt, status: 'failed', progress: 0 } : opt
    ));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'running':
        return <ArrowPathIcon className="h-5 w-5 text-blue-600 animate-spin" />;
      case 'paused':
        return <PauseIcon className="h-5 w-5 text-yellow-600" />;
      case 'failed':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />;
      default:
        return <div className="h-5 w-5 bg-gray-400 rounded-full" />;
    }
  };

  const getFeasibilityColor = (feasibility: string) => {
    switch (feasibility) {
      case 'high':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  function generateMockAssets() {
    return [
      { id: 'gen_001', type: 'generator', capacity: 1000, current_output: 600, cost_per_unit: 45 },
      { id: 'gen_002', type: 'generator', capacity: 800, current_output: 400, cost_per_unit: 52 },
      { id: 'storage_001', type: 'storage', capacity: 500, current_output: 250, cost_per_unit: -30 },
      { id: 'load_001', type: 'load', capacity: 1200, current_output: 800, cost_per_unit: 0 },
      { id: 'wind_001', type: 'generator', capacity: 1200, current_output: 800, cost_per_unit: 15 },
      { id: 'solar_001', type: 'generator', capacity: 600, current_output: 450, cost_per_unit: 8 }
    ];
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg">
            <BoltIcon className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AI Optimization Tools</h1>
            <p className="text-gray-600">Intelligent energy optimization and resource allocation</p>
          </div>
        </div>
        
        <button
          onClick={runOptimization}
          disabled={isOptimizing}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isOptimizing ? (
            <ArrowPathIcon className="h-5 w-5 animate-spin" />
          ) : (
            <SparklesIcon className="h-5 w-5" />
          )}
          <span>Run New Optimization</span>
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'active', name: 'Active Optimizations', icon: BoltIcon },
            { id: 'scenarios', name: 'Optimization Scenarios', icon: ChartBarIcon },
            { id: 'results', name: 'Results & Analytics', icon: EyeIcon },
            { id: 'settings', name: 'Settings', icon: AdjustmentsHorizontalIcon }
          ].map(({ id, name, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Active Optimizations Tab */}
      {activeTab === 'active' && (
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BoltIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {optimizations.filter(o => o.status === 'running').length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed Today</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {optimizations.filter(o => o.status === 'completed').length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <CurrencyDollarIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Savings</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${(optimizations
                      .filter(o => o.results)
                      .reduce((sum, o) => sum + (o.results?.total_profit || 0), 0) / 1000).toFixed(0)}K
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <ClockIcon className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Time</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(optimizations
                      .filter(o => o.processingTime)
                      .reduce((sum, o) => sum + (o.processingTime || 0), 0) / 
                      Math.max(optimizations.filter(o => o.processingTime).length, 1) / 60).toFixed(1)}m
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Optimization Jobs */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Optimization Jobs</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {optimizations.map((optimization) => (
                  <div key={optimization.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(optimization.status)}
                        <div>
                          <h4 className="font-medium text-gray-900 capitalize">
                            {optimization.problemType.replace('_', ' ')} Optimization
                          </h4>
                          <p className="text-sm text-gray-500 capitalize">
                            {optimization.objective.replace('_', ' ')} • {optimization.status}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {optimization.status === 'running' && (
                          <>
                            <button
                              onClick={() => pauseOptimization(optimization.id)}
                              className="p-2 text-yellow-600 hover:bg-yellow-50 rounded"
                            >
                              <PauseIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => stopOptimization(optimization.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded"
                            >
                              <StopIcon className="h-5 w-5" />
                            </button>
                          </>
                        )}
                        {optimization.status === 'paused' && (
                          <button
                            onClick={() => resumeOptimization(optimization.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded"
                          >
                            <PlayIcon className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{optimization.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            optimization.status === 'completed' ? 'bg-green-500' :
                            optimization.status === 'failed' ? 'bg-red-500' :
                            'bg-blue-500'
                          }`}
                          style={{ width: `${optimization.progress}%` }}
                        />
                      </div>
                    </div>
                    
                    {/* Results Preview */}
                    {optimization.results && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
                        <div className="bg-green-50 p-3 rounded">
                          <p className="text-green-800 font-medium">Profit</p>
                          <p className="text-green-900 text-lg font-bold">
                            ${optimization.results.total_profit.toLocaleString()}
                          </p>
                        </div>
                        <div className="bg-blue-50 p-3 rounded">
                          <p className="text-blue-800 font-medium">Efficiency</p>
                          <p className="text-blue-900 text-lg font-bold">
                            {optimization.results.total_efficiency.toFixed(1)}%
                          </p>
                        </div>
                        <div className="bg-orange-50 p-3 rounded">
                          <p className="text-orange-800 font-medium">Risk Score</p>
                          <p className="text-orange-900 text-lg font-bold">
                            {optimization.results.risk_score.toFixed(1)}
                          </p>
                        </div>
                        <div className="bg-purple-50 p-3 rounded">
                          <p className="text-purple-800 font-medium">Reliability</p>
                          <p className="text-purple-900 text-lg font-bold">
                            {optimization.results.reliability_index.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {/* Recommendations */}
                    {optimization.recommendations.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700 mb-2">Key Recommendations:</p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {optimization.recommendations.slice(0, 2).map((rec, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <span className="text-blue-500 mt-1">•</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                          {optimization.recommendations.length > 2 && (
                            <li className="text-blue-600 font-medium">
                              +{optimization.recommendations.length - 2} more recommendations
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Started: {new Date(optimization.startTime).toLocaleString()}</span>
                      {optimization.confidence > 0 && (
                        <span>Confidence: {(optimization.confidence * 100).toFixed(0)}%</span>
                      )}
                      {optimization.processingTime && (
                        <span>Duration: {Math.floor(optimization.processingTime / 60)}m {optimization.processingTime % 60}s</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Optimization Scenarios Tab */}
      {activeTab === 'scenarios' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Pre-defined Optimization Scenarios</h3>
                <button className="text-sm text-blue-600 hover:text-blue-800">
                  Create Custom Scenario
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {scenarios.map((scenario) => (
                  <div key={scenario.id} className="border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-medium text-gray-900">{scenario.name}</h4>
                      <span className={`px-3 py-1 text-xs rounded-full ${getFeasibilityColor(scenario.feasibility)}`}>
                        {scenario.feasibility} feasibility
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-4">{scenario.description}</p>
                    
                    {/* Expected Outcomes */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-green-50 p-3 rounded">
                        <p className="text-sm text-green-800 font-medium">Profit Improvement</p>
                        <p className="text-lg font-bold text-green-900">
                          {scenario.expectedOutcome.profit_improvement > 0 ? '+' : ''}{scenario.expectedOutcome.profit_improvement.toFixed(1)}%
                        </p>
                      </div>
                      <div className="bg-blue-50 p-3 rounded">
                        <p className="text-sm text-blue-800 font-medium">Efficiency Gain</p>
                        <p className="text-lg font-bold text-blue-900">
                          +{scenario.expectedOutcome.efficiency_gain.toFixed(1)}%
                        </p>
                      </div>
                      <div className="bg-purple-50 p-3 rounded">
                        <p className="text-sm text-purple-800 font-medium">Risk Reduction</p>
                        <p className="text-lg font-bold text-purple-900">
                          -{scenario.expectedOutcome.risk_reduction.toFixed(1)}%
                        </p>
                      </div>
                      <div className="bg-orange-50 p-3 rounded">
                        <p className="text-sm text-orange-800 font-medium">Implementation Cost</p>
                        <p className="text-lg font-bold text-orange-900">
                          ${scenario.expectedOutcome.implementation_cost.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    {/* Timeline */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-gray-600">Implementation Timeline:</span>
                      <span className="text-sm font-medium text-gray-900">{scenario.timeline}</span>
                    </div>
                    
                    {/* Constraints Preview */}
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Key Constraints:</p>
                      <div className="text-sm text-gray-600 space-y-1">
                        {Object.entries(scenario.constraints).slice(0, 3).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="capitalize">{key.replace('_', ' ')}:</span>
                            <span className="font-medium">{value}</span>
                          </div>
                        ))}
                        {Object.keys(scenario.constraints).length > 3 && (
                          <p className="text-blue-600 font-medium">
                            +{Object.keys(scenario.constraints).length - 3} more constraints
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Action Button */}
                    <button className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Run Scenario Optimization
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results & Analytics Tab */}
      {activeTab === 'results' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Optimization Results & Analytics</h3>
            </div>
            <div className="p-6">
              <div className="text-center py-12">
                <ChartBarIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Interactive Analytics Dashboard</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Comprehensive analytics dashboard would be displayed here showing optimization trends, 
                  performance metrics, ROI analysis, and comparative studies across different optimization scenarios.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Optimization Settings</h3>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {/* New Optimization Form */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">Create New Optimization</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Problem Type
                      </label>
                      <select
                        value={newOptimization.problemType}
                        onChange={(e) => setNewOptimization(prev => ({ ...prev, problemType: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      >
                        <option value="trading">Energy Trading</option>
                        <option value="portfolio">Portfolio Management</option>
                        <option value="dispatch">Economic Dispatch</option>
                        <option value="scheduling">Unit Scheduling</option>
                        <option value="resource_allocation">Resource Allocation</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Objective
                      </label>
                      <select
                        value={newOptimization.objective}
                        onChange={(e) => setNewOptimization(prev => ({ ...prev, objective: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      >
                        <option value="maximize_profit">Maximize Profit</option>
                        <option value="minimize_cost">Minimize Cost</option>
                        <option value="maximize_efficiency">Maximize Efficiency</option>
                        <option value="minimize_risk">Minimize Risk</option>
                        <option value="optimize_reliability">Optimize Reliability</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Time Horizon
                      </label>
                      <select
                        value={newOptimization.timeHorizon}
                        onChange={(e) => setNewOptimization(prev => ({ ...prev, timeHorizon: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      >
                        <option value="hourly">Hourly</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Risk Tolerance
                      </label>
                      <select
                        value={newOptimization.riskTolerance}
                        onChange={(e) => setNewOptimization(prev => ({ ...prev, riskTolerance: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sustainability Weight: {newOptimization.sustainabilityWeight}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={newOptimization.sustainabilityWeight}
                      onChange={(e) => setNewOptimization(prev => ({ ...prev, sustainabilityWeight: parseFloat(e.target.value) }))}
                      className="w-full"
                    />
                  </div>
                </div>
                
                {/* System Settings */}
                <div className="border-t pt-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4">System Configuration</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-700">Auto-optimization</p>
                        <p className="text-sm text-gray-600">Automatically run optimizations based on triggers</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-700">Email Notifications</p>
                        <p className="text-sm text-gray-600">Receive alerts for optimization completion</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-700">High-Performance Mode</p>
                        <p className="text-sm text-gray-600">Use faster algorithms with reduced accuracy</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}