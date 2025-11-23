'use client';

import React, { useState, useEffect } from 'react';
import { 
  CpuChipIcon, 
  ChartBarIcon, 
  ExclamationTriangleIcon,
  CogIcon,
  PlayIcon,
  StopIcon,
  ArrowPathIcon,
  EyeIcon,
  ArrowTrendingUpIcon,
  BoltIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  FireIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

interface MLModel {
  id: string;
  name: string;
  type: string;
  version: string;
  status: 'training' | 'deployed' | 'failed' | 'archived';
  accuracy: number;
  createdAt: string;
  useCases: string[];
  inferenceLatency: number;
  throughput: number;
}

interface AIInsight {
  id: string;
  type: 'prediction' | 'anomaly' | 'optimization' | 'recommendation';
  title: string;
  description: string;
  confidence: number;
  timestamp: string;
  severity: 'low' | 'medium' | 'high';
  actionable: boolean;
}

interface ModelPerformance {
  accuracy: number[];
  precision: number[];
  recall: number[];
  f1Score: number[];
  timestamps: string[];
}

export default function AIModelManagementDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'models' | 'training' | 'insights' | 'analytics'>('overview');
  const [models, setModels] = useState<MLModel[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [selectedModel, setSelectedModel] = useState<MLModel | null>(null);
  const [modelPerformance, setModelPerformance] = useState<ModelPerformance | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTraining, setIsTraining] = useState(false);

  useEffect(() => {
    fetchAIOverview();
  }, []);

  const fetchAIOverview = async () => {
    try {
      // Fetch models
      const modelsResponse = await fetch('/api/ai/ml-models');
      const modelsData = await modelsResponse.json();
      setModels(modelsData.models || []);

      // Fetch AI insights
      const insightsResponse = await fetch('/api/ai/anomaly-detection');
      const insightsData = await insightsResponse.json();
      
      const mockInsights: AIInsight[] = [
        {
          id: 'insight_001',
          type: 'prediction',
          title: 'Peak Demand Alert',
          description: 'AI predicts 15% increase in energy demand for next 24 hours based on weather patterns and historical data.',
          confidence: 0.94,
          timestamp: new Date().toISOString(),
          severity: 'high',
          actionable: true
        },
        {
          id: 'insight_002',
          type: 'anomaly',
          title: 'Equipment Performance Deviation',
          description: 'Generator Unit 7 showing 12% efficiency drop - recommended immediate inspection.',
          confidence: 0.87,
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          severity: 'medium',
          actionable: true
        },
        {
          id: 'insight_003',
          type: 'optimization',
          title: 'Portfolio Rebalancing Opportunity',
          description: 'AI suggests reallocating 8% from solar to wind assets based on market conditions.',
          confidence: 0.91,
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          severity: 'medium',
          actionable: true
        },
        {
          id: 'insight_004',
          type: 'recommendation',
          title: 'Energy Storage Optimization',
          description: 'Optimal charging schedule identified for battery systems to maximize arbitrage opportunities.',
          confidence: 0.96,
          timestamp: new Date(Date.now() - 10800000).toISOString(),
          severity: 'low',
          actionable: false
        }
      ];
      
      setAiInsights(mockInsights);
      
      // Generate mock performance data
      setModelPerformance({
        accuracy: Array.from({length: 30}, (_, i) => 0.85 + Math.sin(i / 10) * 0.05 + Math.random() * 0.02),
        precision: Array.from({length: 30}, (_, i) => 0.82 + Math.sin(i / 12) * 0.04 + Math.random() * 0.02),
        recall: Array.from({length: 30}, (_, i) => 0.88 + Math.sin(i / 8) * 0.06 + Math.random() * 0.02),
        f1Score: Array.from({length: 30}, (_, i) => 0.85 + Math.sin(i / 9) * 0.05 + Math.random() * 0.02),
        timestamps: Array.from({length: 30}, (_, i) => 
          new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        )
      });

    } catch (error) {
      console.error('Error fetching AI overview:', error);
    } finally {
      setLoading(false);
    }
  };

  const trainNewModel = async (modelConfig: any) => {
    setIsTraining(true);
    try {
      const response = await fetch('/api/ai/model-training/train', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(modelConfig)
      });
      const result = await response.json();
      
      if (response.ok) {
        alert('Model training initiated successfully!');
        await fetchAIOverview();
      }
    } catch (error) {
      console.error('Error training model:', error);
      alert('Failed to initiate model training');
    } finally {
      setIsTraining(false);
    }
  };

  const deployModel = async (modelId: string) => {
    try {
      const response = await fetch('/api/ai/model-training/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelId,
          deploymentConfig: {
            endpoint: `/api/models/${modelId}/predict`,
            scaling: { minReplicas: 2, maxReplicas: 10, targetUtilization: 70 },
            resources: { cpu: '2 cores', memory: '4GB', storage: '10GB' },
            latency: { p50: 50, p95: 100, p99: 200 }
          },
          environment: {
            production: true,
            monitoring: true,
            alerting: true,
            backup: true
          }
        })
      });
      
      if (response.ok) {
        alert('Model deployment initiated!');
        await fetchAIOverview();
      }
    } catch (error) {
      console.error('Error deploying model:', error);
      alert('Failed to deploy model');
    }
  };

  const runAnomalyDetection = async () => {
    try {
      const response = await fetch('/api/ai/anomaly-detection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dataSource: 'sensor',
          detectionType: 'ml_based',
          sensitivity: 'high',
          timeWindow: 60,
          data: Array.from({length: 100}, (_, i) => ({
            timestamp: new Date(Date.now() - (99 - i) * 60000).toISOString(),
            value: 500 + Math.sin(i / 10) * 50 + Math.random() * 20 + 
                  (i === 75 ? 200 : 0) // Add anomaly
          }))
        })
      });
      
      const result = await response.json();
      if (response.ok && result.anomalies?.length > 0) {
        alert(`Detected ${result.anomalies.length} anomalies! Check insights panel.`);
        await fetchAIOverview();
      }
    } catch (error) {
      console.error('Error running anomaly detection:', error);
    }
  };

  const runOptimization = async () => {
    try {
      const response = await fetch('/api/ai/optimization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemType: 'trading',
          objective: 'maximize_profit',
          timeHorizon: 'daily',
          assets: [
            { id: 'gen_001', type: 'generator', capacity: 1000, current_output: 600, cost_per_unit: 45 },
            { id: 'gen_002', type: 'generator', capacity: 800, current_output: 400, cost_per_unit: 52 },
            { id: 'storage_001', type: 'storage', capacity: 500, current_output: 250, cost_per_unit: -30 },
            { id: 'load_001', type: 'load', capacity: 1200, current_output: 800, cost_per_unit: 0 }
          ],
          parameters: {
            risk_tolerance: 'medium',
            sustainability_weight: 0.6
          }
        })
      });
      
      const result = await response.json();
      if (response.ok && result.optimization) {
        alert('Optimization completed! Check insights for recommendations.');
        await fetchAIOverview();
      }
    } catch (error) {
      console.error('Error running optimization:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg">
              <CpuChipIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI & Machine Learning</h1>
              <p className="text-gray-600">Intelligent energy optimization and predictive analytics</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={runAnomalyDetection}
              className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <ExclamationTriangleIcon className="h-5 w-5" />
              <span>Run Anomaly Detection</span>
            </button>
            <button
              onClick={runOptimization}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <BoltIcon className="h-5 w-5" />
              <span>Run Optimization</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Overview', icon: SparklesIcon },
            { id: 'models', name: 'Models', icon: CpuChipIcon },
            { id: 'training', name: 'Training', icon: PlayIcon },
            { id: 'insights', name: 'AI Insights', icon: EyeIcon },
            { id: 'analytics', name: 'Analytics', icon: ChartBarIcon }
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

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CpuChipIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Models</p>
                  <p className="text-2xl font-bold text-gray-900">{models.filter(m => m.status === 'deployed').length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <ChartBarIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Accuracy</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(models.reduce((sum, m) => sum + m.accuracy, 0) / models.length * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <ClockIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Latency</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(models.reduce((sum, m) => sum + m.inferenceLatency, 0) / models.length).toFixed(0)}ms
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <ArrowTrendingUpIcon className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Throughput</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(models.reduce((sum, m) => sum + m.throughput, 0) / 1000).toFixed(1)}K/s
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* AI Insights */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recent AI Insights</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {aiInsights.slice(0, 4).map((insight) => (
                  <div key={insight.id} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                    <div className={`p-2 rounded-lg ${
                      insight.type === 'prediction' ? 'bg-blue-100' :
                      insight.type === 'anomaly' ? 'bg-red-100' :
                      insight.type === 'optimization' ? 'bg-green-100' :
                      'bg-purple-100'
                    }`}>
                      {insight.type === 'prediction' && <ChartBarIcon className="h-5 w-5 text-blue-600" />}
                      {insight.type === 'anomaly' && <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />}
                      {insight.type === 'optimization' && <BoltIcon className="h-5 w-5 text-green-600" />}
                      {insight.type === 'recommendation' && <SparklesIcon className="h-5 w-5 text-purple-600" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">{insight.title}</h4>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            insight.severity === 'high' ? 'bg-red-100 text-red-800' :
                            insight.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {insight.severity}
                          </span>
                          <span className="text-sm text-gray-500">
                            {(insight.confidence * 100).toFixed(0)}% confidence
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(insight.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Models Tab */}
      {activeTab === 'models' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">ML Models</h3>
                <button
                  onClick={() => trainNewModel({
                    name: 'New Energy Forecast Model',
                    type: 'lstm',
                    features: ['weather', 'demand', 'economic'],
                    targetVariables: ['energy_demand'],
                    createdBy: 'user'
                  })}
                  disabled={isTraining}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isTraining ? (
                    <ArrowPathIcon className="h-5 w-5 animate-spin" />
                  ) : (
                    <PlayIcon className="h-5 w-5" />
                  )}
                  <span>Train New Model</span>
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {models.map((model) => (
                  <div key={model.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">{model.name}</h4>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          model.status === 'deployed' ? 'bg-green-100 text-green-800' :
                          model.status === 'training' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {model.status}
                        </span>
                        <span className="text-xs text-gray-500">{model.version}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Accuracy:</span>
                        <span className="font-medium">{(model.accuracy * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <span className="font-medium">{model.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Latency:</span>
                        <span className="font-medium">{model.inferenceLatency}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Throughput:</span>
                        <span className="font-medium">{(model.throughput / 1000).toFixed(1)}K/s</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex space-x-2">
                      {model.status === 'deployed' ? (
                        <button className="flex items-center space-x-1 px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200">
                          <StopIcon className="h-4 w-4" />
                          <span>Stop</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => deployModel(model.id)}
                          className="flex items-center space-x-1 px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                        >
                          <PlayIcon className="h-4 w-4" />
                          <span>Deploy</span>
                        </button>
                      )}
                      <button className="flex items-center space-x-1 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                        <EyeIcon className="h-4 w-4" />
                        <span>View</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Training Tab */}
      {activeTab === 'training' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Training Jobs</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {/* Training job status cards would go here */}
                <div className="text-center py-8 text-gray-500">
                  <CogIcon className="h-12 w-12 mx-auto mb-4" />
                  <p>Training job management interface would be displayed here</p>
                  <p className="text-sm">Monitor training progress, manage resource allocation, and review training logs</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Insights Tab */}
      {activeTab === 'insights' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">AI Insights & Alerts</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {aiInsights.map((insight) => (
                  <div key={insight.id} className="border rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${
                        insight.type === 'prediction' ? 'bg-blue-100' :
                        insight.type === 'anomaly' ? 'bg-red-100' :
                        insight.type === 'optimization' ? 'bg-green-100' :
                        'bg-purple-100'
                      }`}>
                        {insight.type === 'prediction' && <ChartBarIcon className="h-5 w-5 text-blue-600" />}
                        {insight.type === 'anomaly' && <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />}
                        {insight.type === 'optimization' && <BoltIcon className="h-5 w-5 text-green-600" />}
                        {insight.type === 'recommendation' && <SparklesIcon className="h-5 w-5 text-purple-600" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{insight.title}</h4>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              insight.severity === 'high' ? 'bg-red-100 text-red-800' :
                              insight.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {insight.severity}
                            </span>
                            <span className="text-sm text-gray-500">
                              {(insight.confidence * 100).toFixed(0)}% confidence
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">
                            {new Date(insight.timestamp).toLocaleString()}
                          </span>
                          {insight.actionable && (
                            <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                              Take Action →
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Model Performance Analytics</h3>
            </div>
            <div className="p-6">
              {modelPerformance ? (
                <div className="space-y-6">
                  {/* Performance charts would go here */}
                  <div className="text-center py-8 text-gray-500">
                    <ChartBarIcon className="h-12 w-12 mx-auto mb-4" />
                    <p>Interactive performance charts would be displayed here</p>
                    <p className="text-sm">Track model accuracy, precision, recall, and F1-score over time</p>
                  </div>
                  
                  {/* Performance metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Latest Accuracy</h4>
                      <p className="text-2xl font-bold text-blue-600">
                        {(modelPerformance.accuracy[modelPerformance.accuracy.length - 1] * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Latest Precision</h4>
                      <p className="text-2xl font-bold text-green-600">
                        {(modelPerformance.precision[modelPerformance.precision.length - 1] * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Latest Recall</h4>
                      <p className="text-2xl font-bold text-purple-600">
                        {(modelPerformance.recall[modelPerformance.recall.length - 1] * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Latest F1-Score</h4>
                      <p className="text-2xl font-bold text-orange-600">
                        {(modelPerformance.f1Score[modelPerformance.f1Score.length - 1] * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No performance data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}