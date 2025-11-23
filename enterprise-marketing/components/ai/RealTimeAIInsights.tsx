'use client';

import React, { useState, useEffect } from 'react';
import { 
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  BoltIcon,
  ChartBarIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  BellIcon,
  EyeIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';

interface AIInsight {
  id: string;
  type: 'prediction' | 'anomaly' | 'optimization' | 'recommendation' | 'alert';
  category: 'trading' | 'operational' | 'financial' | 'technical' | 'security';
  title: string;
  description: string;
  confidence: number;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  impact: 'positive' | 'negative' | 'neutral';
  actionable: boolean;
  estimated_value?: number;
  energy_source?: string;
  recommendation?: string;
  data_points?: number;
  trend?: 'increasing' | 'decreasing' | 'stable';
  location?: string;
}

interface LiveMetrics {
  total_insights_today: number;
  critical_alerts: number;
  active_predictions: number;
  optimization_opportunities: number;
  average_confidence: number;
  response_time: number;
}

export default function RealTimeAIInsights() {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [metrics, setMetrics] = useState<LiveMetrics | null>(null);
  const [selectedInsight, setSelectedInsight] = useState<AIInsight | null>(null);
  const [filter, setFilter] = useState<'all' | 'critical' | 'actionable'>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    loadAIInsights();
    
    // Set up auto-refresh
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(() => {
        loadAIInsights();
      }, 30000); // Refresh every 30 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const loadAIInsights = async () => {
    try {
      // Simulate real-time AI insights
      const mockInsights: AIInsight[] = [
        {
          id: 'insight_001',
          type: 'prediction',
          category: 'trading',
          title: 'Demand Surge Forecast',
          description: 'AI predicts 23% increase in energy demand for 6PM-9PM peak hours due to heat wave conditions across the region.',
          confidence: 0.94,
          timestamp: new Date().toISOString(),
          severity: 'high',
          impact: 'negative',
          actionable: true,
          estimated_value: 145000,
          recommendation: 'Activate additional generation capacity and implement demand response programs',
          data_points: 45672,
          trend: 'increasing',
          location: 'Regional Grid Zone A'
        },
        {
          id: 'insight_002',
          type: 'anomaly',
          category: 'operational',
          title: 'Wind Turbine Performance Anomaly',
          description: 'Turbine WT-15 showing 18% efficiency drop with unusual vibration patterns. Immediate inspection recommended.',
          confidence: 0.89,
          timestamp: new Date(Date.now() - 300000).toISOString(),
          severity: 'critical',
          impact: 'negative',
          actionable: true,
          estimated_value: -25000,
          recommendation: 'Schedule immediate maintenance and reduce load on affected turbine',
          data_points: 2341,
          trend: 'decreasing',
          location: 'Wind Farm Alpha'
        },
        {
          id: 'insight_003',
          type: 'optimization',
          category: 'financial',
          title: 'Portfolio Rebalancing Opportunity',
          description: 'Market conditions favor shifting 12% allocation from solar to battery storage systems for optimal arbitrage.',
          confidence: 0.91,
          timestamp: new Date(Date.now() - 600000).toISOString(),
          severity: 'medium',
          impact: 'positive',
          actionable: true,
          estimated_value: 89000,
          recommendation: 'Execute gradual reallocation over next 72 hours to maximize returns',
          data_points: 7834,
          trend: 'increasing',
          location: 'Trading Portfolio'
        },
        {
          id: 'insight_004',
          type: 'alert',
          category: 'security',
          title: 'Grid Security Breach Attempt',
          description: 'AI detected suspicious pattern in SCADA communications. Security protocols activated automatically.',
          confidence: 0.97,
          timestamp: new Date(Date.now() - 900000).toISOString(),
          severity: 'critical',
          impact: 'negative',
          actionable: true,
          estimated_value: 0,
          recommendation: 'Incident response team engaged, monitoring additional threats',
          data_points: 156789,
          trend: 'stable',
          location: 'Control Systems'
        },
        {
          id: 'insight_005',
          type: 'recommendation',
          category: 'technical',
          title: 'Storage Optimization Schedule',
          description: 'ML algorithm identifies optimal charging schedule for battery systems based on predicted price patterns.',
          confidence: 0.96,
          timestamp: new Date(Date.now() - 1200000).toISOString(),
          severity: 'low',
          impact: 'positive',
          actionable: true,
          estimated_value: 34000,
          recommendation: 'Implement auto-scheduling for next 48 hours to capture price arbitrage opportunities',
          data_points: 12456,
          trend: 'stable',
          location: 'Energy Storage Hub'
        },
        {
          id: 'insight_006',
          type: 'prediction',
          category: 'operational',
          title: 'Equipment Maintenance Alert',
          description: 'Predictive model indicates Transformer T-7 will require maintenance within next 5-7 days.',
          confidence: 0.86,
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          severity: 'medium',
          impact: 'negative',
          actionable: true,
          estimated_value: -18000,
          recommendation: 'Schedule preventive maintenance during next maintenance window',
          data_points: 8765,
          trend: 'increasing',
          location: 'Substation Beta'
        },
        {
          id: 'insight_007',
          type: 'optimization',
          category: 'financial',
          title: 'Renewable Energy Trading',
          description: 'AI suggests increasing solar energy sales by 15% over next 4 hours due to favorable market conditions.',
          confidence: 0.93,
          timestamp: new Date(Date.now() - 2400000).toISOString(),
          severity: 'medium',
          impact: 'positive',
          actionable: true,
          estimated_value: 67000,
          recommendation: 'Execute optimized trading strategy through approved channels',
          data_points: 9234,
          trend: 'increasing',
          location: 'Trading Desk'
        },
        {
          id: 'insight_008',
          type: 'anomaly',
          category: 'operational',
          title: 'Load Pattern Deviation',
          description: 'Industrial load zone showing unexpected 12% reduction during peak hours. Investigating causes.',
          confidence: 0.84,
          timestamp: new Date(Date.now() - 3000000).toISOString(),
          severity: 'medium',
          impact: 'neutral',
          actionable: false,
          estimated_value: -8000,
          recommendation: 'Monitor for 24 hours before taking action, could be temporary variation',
          data_points: 15632,
          trend: 'decreasing',
          location: 'Industrial Zone C'
        }
      ];

      setInsights(mockInsights);

      // Calculate live metrics
      const nowMetrics: LiveMetrics = {
        total_insights_today: mockInsights.length,
        critical_alerts: mockInsights.filter(i => i.severity === 'critical').length,
        active_predictions: mockInsights.filter(i => i.type === 'prediction' && 
          new Date(i.timestamp) > new Date(Date.now() - 3600000)).length,
        optimization_opportunities: mockInsights.filter(i => i.type === 'optimization').length,
        average_confidence: mockInsights.reduce((sum, i) => sum + i.confidence, 0) / mockInsights.length,
        response_time: Math.floor(Math.random() * 500) + 200 // ms
      };

      setMetrics(nowMetrics);
      setLastUpdate(new Date());

    } catch (error) {
      console.error('Error loading AI insights:', error);
    }
  };

  const getInsightIcon = (type: string, category: string) => {
    switch (type) {
      case 'prediction':
        return <ChartBarIcon className="h-5 w-5 text-blue-600" />;
      case 'anomaly':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />;
      case 'optimization':
        return <BoltIcon className="h-5 w-5 text-green-600" />;
      case 'alert':
        return <XCircleIcon className="h-5 w-5 text-orange-600" />;
      case 'recommendation':
        return <SparklesIcon className="h-5 w-5 text-purple-600" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-red-500 bg-red-50';
      case 'high':
        return 'border-orange-500 bg-orange-50';
      case 'medium':
        return 'border-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-green-500 bg-green-50';
      default:
        return 'border-gray-300 bg-white';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'positive':
        return <ArrowTrendingUpIcon className="h-4 w-4 text-green-600" />;
      case 'negative':
        return <ArrowTrendingDownIcon className="h-4 w-4 text-red-600" />;
      default:
        return <div className="h-4 w-4 bg-gray-400 rounded-full" />;
    }
  };

  const filteredInsights = insights.filter(insight => {
    if (filter === 'critical') {
      return insight.severity === 'critical' || insight.severity === 'high';
    }
    if (filter === 'actionable') {
      return insight.actionable;
    }
    return true;
  });

  const takeAction = (insight: AIInsight) => {
    // Simulate taking action on an insight
    setInsights(prev => prev.map(i => 
      i.id === insight.id 
        ? { ...i, actionable: false, timestamp: new Date().toISOString() }
        : i
    ));
    setSelectedInsight(null);
  };

  const dismissInsight = (insightId: string) => {
    setInsights(prev => prev.filter(i => i.id !== insightId));
    setSelectedInsight(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg">
            <CpuChipIcon className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Real-time AI Insights</h1>
            <p className="text-gray-600">Live AI monitoring and intelligent recommendations</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <ClockIcon className="h-4 w-4" />
            <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
          </div>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">Auto-refresh</span>
          </label>
        </div>
      </div>

      {/* Live Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <EyeIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs text-gray-600">Today's Insights</p>
                <p className="text-lg font-bold text-gray-900">{metrics.total_insights_today}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircleIcon className="h-5 w-5 text-red-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs text-gray-600">Critical Alerts</p>
                <p className="text-lg font-bold text-gray-900">{metrics.critical_alerts}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <ArrowTrendingUpIcon className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs text-gray-600">Active Predictions</p>
                <p className="text-lg font-bold text-gray-900">{metrics.active_predictions}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BoltIcon className="h-5 w-5 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs text-gray-600">Optimizations</p>
                <p className="text-lg font-bold text-gray-900">{metrics.optimization_opportunities}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <CheckCircleIcon className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs text-gray-600">Avg Confidence</p>
                <p className="text-lg font-bold text-gray-900">{(metrics.average_confidence * 100).toFixed(0)}%</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <ClockIcon className="h-5 w-5 text-orange-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs text-gray-600">Response Time</p>
                <p className="text-lg font-bold text-gray-900">{metrics.response_time}ms</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex space-x-2">
          {['all', 'critical', 'actionable'].map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption as any)}
              className={`px-3 py-2 rounded-lg text-sm font-medium ${
                filter === filterOption
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
            </button>
          ))}
        </div>
        
        <div className="flex items-center space-x-2">
          <BellIcon className="h-5 w-5 text-gray-400" />
          <span className="text-sm text-gray-600">
            {filteredInsights.filter(i => i.actionable).length} actionable items
          </span>
        </div>
      </div>

      {/* Insights List */}
      <div className="space-y-4">
        {filteredInsights.map((insight) => (
          <div
            key={insight.id}
            className={`border-l-4 p-6 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow ${
              getSeverityColor(insight.severity)
            }`}
            onClick={() => setSelectedInsight(insight)}
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                {getInsightIcon(insight.type, insight.category)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-medium text-gray-900">{insight.title}</h3>
                  <div className="flex items-center space-x-2">
                    {getImpactIcon(insight.impact)}
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      insight.severity === 'critical' ? 'bg-red-200 text-red-800' :
                      insight.severity === 'high' ? 'bg-orange-200 text-orange-800' :
                      insight.severity === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                      'bg-green-200 text-green-800'
                    }`}>
                      {insight.severity}
                    </span>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-3">{insight.description}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center space-x-1">
                      <CheckCircleIcon className="h-4 w-4" />
                      <span>{(insight.confidence * 100).toFixed(0)}% confidence</span>
                    </span>
                    {insight.location && (
                      <span>{insight.location}</span>
                    )}
                    {insight.estimated_value !== undefined && (
                      <span className={`font-medium ${
                        insight.estimated_value > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        ${insight.estimated_value.toLocaleString()}
                      </span>
                    )}
                  </div>
                  
                  <span>{new Date(insight.timestamp).toLocaleString()}</span>
                </div>
                
                {insight.recommendation && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-900">AI Recommendation:</p>
                    <p className="text-sm text-blue-800">{insight.recommendation}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Insight Detail Modal */}
      {selectedInsight && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                {getInsightIcon(selectedInsight.type, selectedInsight.category)}
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{selectedInsight.title}</h3>
                  <p className="text-sm text-gray-500">{selectedInsight.category} • {selectedInsight.type}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedInsight(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-700">{selectedInsight.description}</p>
              
              {selectedInsight.recommendation && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">AI Recommendation</h4>
                  <p className="text-blue-800">{selectedInsight.recommendation}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Confidence:</span>
                  <span className="ml-2">{(selectedInsight.confidence * 100).toFixed(1)}%</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Data Points:</span>
                  <span className="ml-2">{selectedInsight.data_points?.toLocaleString()}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Severity:</span>
                  <span className="ml-2 capitalize">{selectedInsight.severity}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Impact:</span>
                  <span className="ml-2 capitalize">{selectedInsight.impact}</span>
                </div>
                {selectedInsight.estimated_value !== undefined && (
                  <div className="col-span-2">
                    <span className="font-medium text-gray-700">Estimated Value:</span>
                    <span className={`ml-2 font-bold ${
                      selectedInsight.estimated_value > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      ${selectedInsight.estimated_value.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => dismissInsight(selectedInsight.id)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Dismiss
              </button>
              {selectedInsight.actionable && (
                <button
                  onClick={() => takeAction(selectedInsight)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Take Action
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}