'use client';

import React, { useState } from 'react';
import AIModelManagementDashboard from '@/components/ai/AIModelManagementDashboard';
import RealTimeAIInsights from '@/components/ai/RealTimeAIInsights';
import AIOptimizationTools from '@/components/ai/AIOptimizationTools';
import { 
  CpuChipIcon,
  SparklesIcon,
  BoltIcon,
  ChartBarIcon,
  EyeIcon,
  CogIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

export default function AIManagementPage() {
  const [activeSection, setActiveSection] = useState<'dashboard' | 'insights' | 'optimization'>('dashboard');
  const [showQuickActions, setShowQuickActions] = useState(false);

  const sections = [
    {
      id: 'dashboard',
      name: 'AI Model Dashboard',
      icon: CpuChipIcon,
      component: AIModelManagementDashboard,
      description: 'Manage ML models, training jobs, and deployments'
    },
    {
      id: 'insights',
      name: 'Real-time AI Insights',
      icon: EyeIcon,
      component: RealTimeAIInsights,
      description: 'Live AI monitoring and intelligent recommendations'
    },
    {
      id: 'optimization',
      name: 'AI Optimization Tools',
      icon: BoltIcon,
      component: AIOptimizationTools,
      description: 'Intelligent optimization and resource allocation'
    }
  ];

  const quickActions = [
    {
      name: 'Train New Model',
      description: 'Start training a new ML model',
      icon: SparklesIcon,
      action: () => {
        setActiveSection('dashboard');
        // Trigger model training modal
      }
    },
    {
      name: 'Run Anomaly Detection',
      description: 'Detect anomalies in current data',
      icon: ExclamationTriangleIcon,
      action: async () => {
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
                value: 500 + Math.sin(i / 10) * 50 + Math.random() * 20
              }))
            })
          });
          
          if (response.ok) {
            alert('Anomaly detection completed! Check insights for results.');
            setActiveSection('insights');
          }
        } catch (error) {
          console.error('Error running anomaly detection:', error);
        }
      }
    },
    {
      name: 'Run Optimization',
      description: 'Execute AI optimization algorithm',
      icon: BoltIcon,
      action: async () => {
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
                { id: 'storage_001', type: 'storage', capacity: 500, current_output: 250, cost_per_unit: -30 }
              ]
            })
          });
          
          if (response.ok) {
            alert('Optimization started! Results will be available soon.');
            setActiveSection('optimization');
          }
        } catch (error) {
          console.error('Error running optimization:', error);
        }
      }
    },
    {
      name: 'Generate Predictions',
      description: 'Run AI predictions on current data',
      icon: ArrowTrendingUpIcon,
      action: async () => {
        try {
          const response = await fetch('/api/ai/predictive-analytics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              modelId: 'model-energy-001',
              inputData: {
                current_demand: 800,
                weather_temperature: 22,
                time_of_day: 14,
                seasonality: 0.15,
                trend: 0.08
              },
              predictionType: 'forecast',
              timeHorizon: 24,
              confidence: 0.95
            })
          });
          
          if (response.ok) {
            alert('Predictions generated! Check insights for results.');
            setActiveSection('insights');
          }
        } catch (error) {
          console.error('Error generating predictions:', error);
        }
      }
    }
  ];

  const activeComponent = sections.find(section => section.id === activeSection)?.component;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg">
                  <CpuChipIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">AI & Machine Learning Platform</h1>
                  <p className="text-sm text-gray-500">Enterprise AI-powered energy optimization</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Status Indicators */}
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <CheckCircleIcon className="h-4 w-4 text-green-500" />
                  <span className="text-xs text-gray-600">AI Systems Online</span>
                </div>
                <div className="w-px h-4 bg-gray-300" />
                <div className="text-xs text-gray-500">
                  5 Active Models
                </div>
              </div>
              
              {/* Quick Actions Toggle */}
              <button
                onClick={() => setShowQuickActions(!showQuickActions)}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <BoltIcon className="h-4 w-4" />
                <span className="text-sm">Quick Actions</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Dropdown */}
      {showQuickActions && (
        <div className="absolute top-16 right-4 z-50 w-80 bg-white rounded-lg shadow-lg border p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Quick AI Actions</h3>
          <div className="space-y-2">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="p-2 bg-blue-100 rounded-lg">
                  <action.icon className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{action.name}</p>
                  <p className="text-xs text-gray-500">{action.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeSection === section.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <section.icon className="h-5 w-5" />
                <span>{section.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Active Section Content */}
      <div className="py-6">
        {activeComponent && <activeComponent />}
      </div>

      {/* AI Status Footer */}
      <div className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>Real-time processing active</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span>Model training pipeline ready</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                <span>AI insights updating every 30s</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 text-sm">
              <span className="text-gray-500">Last updated:</span>
              <span className="font-medium text-gray-900">
                {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}