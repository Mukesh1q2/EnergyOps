"use client";

import React, { useState, useEffect } from 'react';
import { 
  ApiIcon, 
  KeyIcon, 
  WebhookIcon, 
  AnalyticsIcon, 
  WorkflowIcon,
  GoogleIcon,
  MicrosoftIcon,
  SettingIcon,
  PlusIcon,
  PlayIcon,
  PauseIcon,
  TrashIcon,
  EditIcon,
  RefreshCwIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  DatabaseIcon,
  ShieldIcon
} from '@heroicons/react/24/outline';

interface ApiKey {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  rateLimit: number;
  status: 'active' | 'inactive' | 'expired';
  createdAt: string;
  lastUsed: string;
  environment: 'development' | 'production';
}

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  status: 'active' | 'inactive';
  lastTriggered: string | null;
  successCount: number;
  failureCount: number;
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'paused' | 'error';
  enabled: boolean;
  runCount: number;
  lastRun: string | null;
  nextRun: string | null;
}

interface Integration {
  id: string;
  name: string;
  type: 'google' | 'microsoft' | 'aws' | 'slack' | 'custom';
  status: 'connected' | 'disconnected' | 'error';
  lastSync: string | null;
  credentialsValid: boolean;
}

export default function ApiManagementDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load API Keys
      const apiKeysResponse = await fetch('/api/integrations/api-keys', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (apiKeysResponse.ok) {
        const apiKeysData = await apiKeysResponse.json();
        setApiKeys(apiKeysData.data || []);
      }

      // Load Webhooks
      const webhooksResponse = await fetch('/api/integrations/webhooks');
      if (webhooksResponse.ok) {
        const webhooksData = await webhooksResponse.json();
        setWebhooks([
          {
            id: 'webhook_123',
            name: 'Energy Data Updates',
            url: 'https://example.com/webhook/energy',
            events: ['energy_data_created', 'energy_data_updated'],
            status: 'active',
            lastTriggered: new Date().toISOString(),
            successCount: 245,
            failureCount: 3
          },
          {
            id: 'webhook_456',
            name: 'Market Price Alerts',
            url: 'https://example.com/webhook/prices',
            events: ['market_price_updated', 'market_price_alert'],
            status: 'active',
            lastTriggered: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            successCount: 1230,
            failureCount: 12
          }
        ]);
      }

      // Load Workflows
      const workflowsResponse = await fetch('/api/integrations/workflows?action=list');
      if (workflowsResponse.ok) {
        const workflowsData = await workflowsResponse.json();
        setWorkflows(workflowsData.data?.workflows || []);
      }

      // Load Integrations
      setIntegrations([
        {
          id: 'google_workspace',
          name: 'Google Workspace',
          type: 'google',
          status: 'connected',
          lastSync: new Date().toISOString(),
          credentialsValid: true
        },
        {
          id: 'microsoft_graph',
          name: 'Microsoft Graph',
          type: 'microsoft',
          status: 'disconnected',
          lastSync: null,
          credentialsValid: false
        },
        {
          id: 'aws_s3',
          name: 'AWS S3',
          type: 'aws',
          status: 'connected',
          lastSync: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          credentialsValid: true
        }
      ]);

      // Load Analytics
      const analyticsResponse = await fetch('/api/integrations/analytics?action=overview');
      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json();
        setAnalyticsData(analyticsData.data);
      }

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createApiKey = async () => {
    // Mock API key creation
    const newKey: ApiKey = {
      id: `api_key_${Date.now()}`,
      name: 'New API Key',
      description: 'Generated via dashboard',
      permissions: ['read:energy_data', 'read:market_data'],
      rateLimit: 1000,
      status: 'active',
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
      environment: 'development'
    };
    
    setApiKeys([...apiKeys, newKey]);
  };

  const toggleWorkflow = async (workflowId: string) => {
    setWorkflows(workflows.map(w => 
      w.id === workflowId ? { ...w, enabled: !w.enabled } : w
    ));
  };

  const testWebhook = async (webhookId: string) => {
    try {
      const response = await fetch('/api/integrations/webhooks?action=test', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ webhookId })
      });
      
      if (response.ok) {
        const result = await response.json();
        alert(`Webhook test ${result.data.success ? 'succeeded' : 'failed'}`);
      }
    } catch (error) {
      console.error('Webhook test failed:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'connected':
      case 'success':
        return 'text-green-600 bg-green-100';
      case 'inactive':
      case 'disconnected':
        return 'text-gray-600 bg-gray-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      case 'paused':
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-blue-600 bg-blue-100';
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <KeyIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">API Keys</p>
              <p className="text-2xl font-semibold text-gray-900">{apiKeys.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <WebhookIcon className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Webhooks</p>
              <p className="text-2xl font-semibold text-gray-900">{webhooks.filter(w => w.status === 'active').length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <WorkflowIcon className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Workflows</p>
              <p className="text-2xl font-semibold text-gray-900">{workflows.filter(w => w.enabled).length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <DatabaseIcon className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Integrations</p>
              <p className="text-2xl font-semibold text-gray-900">{integrations.filter(i => i.status === 'connected').length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">API Key Generated</p>
                <p className="text-sm text-gray-500">Production API Key created by John Doe</p>
                <p className="text-xs text-gray-400">2 minutes ago</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <WebhookIcon className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Webhook Triggered</p>
                <p className="text-sm text-gray-500">Market Price Update sent to Slack</p>
                <p className="text-xs text-gray-400">15 minutes ago</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <PlayIcon className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Workflow Executed</p>
                <p className="text-sm text-gray-500">Daily Energy Report completed successfully</p>
                <p className="text-xs text-gray-400">1 hour ago</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <AlertCircleIcon className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Integration Error</p>
                <p className="text-sm text-gray-500">Microsoft Graph connection failed</p>
                <p className="text-xs text-gray-400">2 hours ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderApiKeys = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">API Keys Management</h3>
        <button
          onClick={createApiKey}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Create API Key
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {apiKeys.map((key) => (
            <li key={key.id}>
              <div className="px-4 py-4 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-blue-600 truncate">{key.name}</p>
                    <div className="ml-2 flex-shrink-0 flex">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(key.status)}`}>
                        {key.status}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">{key.description}</p>
                  <div className="mt-2 flex items-center text-sm text-gray-500 space-x-4">
                    <span>Rate Limit: {key.rateLimit}/hour</span>
                    <span>Environment: {key.environment}</span>
                    <span>Permissions: {key.permissions.length}</span>
                  </div>
                </div>
                <div className="ml-4 flex-shrink-0 flex space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <EditIcon className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  const renderWebhooks = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Webhook Management</h3>
        <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
          <PlusIcon className="h-4 w-4 mr-2" />
          Create Webhook
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {webhooks.map((webhook) => (
          <div key={webhook.id} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center">
                  <h4 className="text-lg font-medium text-gray-900">{webhook.name}</h4>
                  <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(webhook.status)}`}>
                    {webhook.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{webhook.url}</p>
                <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                  <span>Events: {webhook.events.join(', ')}</span>
                  <span>Success: {webhook.successCount}</span>
                  <span>Failures: {webhook.failureCount}</span>
                  {webhook.lastTriggered && (
                    <span>Last triggered: {new Date(webhook.lastTriggered).toLocaleString()}</span>
                  )}
                </div>
              </div>
              <div className="ml-4 flex space-x-2">
                <button
                  onClick={() => testWebhook(webhook.id)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Test
                </button>
                <button className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                  Edit
                </button>
                <button className="inline-flex items-center px-3 py-2 border border-red-300 text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50">
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderWorkflows = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Workflow Automation</h3>
        <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700">
          <PlusIcon className="h-4 w-4 mr-2" />
          Create Workflow
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center">
                <h4 className="text-lg font-medium text-gray-900">Daily Energy Report</h4>
                <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full text-green-600 bg-green-100">
                  active
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">Generate daily energy production and market analysis report</p>
              <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                <span>Runs: Daily at 8:00 AM</span>
                <span>Executions: 45</span>
                <span>Last run: {new Date().toLocaleDateString()}</span>
              </div>
            </div>
            <div className="ml-4 flex space-x-2">
              <button
                onClick={() => toggleWorkflow('workflow_123')}
                className={`inline-flex items-center px-3 py-2 border text-sm leading-4 font-medium rounded-md ${
                  true
                    ? 'border-green-300 text-green-700 bg-green-50 hover:bg-green-100'
                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                }`}
              >
                <PauseIcon className="h-4 w-4 mr-1" />
                Pause
              </button>
              <button className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Edit
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center">
                <h4 className="text-lg font-medium text-gray-900">Price Alert System</h4>
                <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full text-green-600 bg-green-100">
                  active
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">Monitor market prices and trigger alerts when thresholds are met</p>
              <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                <span>Runs: Every 15 minutes</span>
                <span>Executions: 1,280</span>
                <span>Last run: {new Date(Date.now() - 15 * 60 * 1000).toLocaleString()}</span>
              </div>
            </div>
            <div className="ml-4 flex space-x-2">
              <button
                onClick={() => toggleWorkflow('workflow_456')}
                className="inline-flex items-center px-3 py-2 border border-green-300 text-sm leading-4 font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100"
              >
                <PauseIcon className="h-4 w-4 mr-1" />
                Pause
              </button>
              <button className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Edit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderIntegrations = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Third-party Integrations</h3>
        <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Integration
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {integrations.map((integration) => (
          <div key={integration.id} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {integration.type === 'google' && <GoogleIcon className="h-8 w-8 text-blue-500" />}
                  {integration.type === 'microsoft' && <MicrosoftIcon className="h-8 w-8 text-blue-600" />}
                  {integration.type === 'aws' && <ShieldIcon className="h-8 w-8 text-orange-500" />}
                </div>
                <div className="ml-4">
                  <div className="flex items-center">
                    <h4 className="text-lg font-medium text-gray-900">{integration.name}</h4>
                    <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(integration.status)}`}>
                      {integration.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">Type: {integration.type}</p>
                  {integration.lastSync && (
                    <p className="text-sm text-gray-500">Last sync: {new Date(integration.lastSync).toLocaleString()}</p>
                  )}
                </div>
              </div>
              <div className="ml-4 flex space-x-2">
                {integration.status === 'disconnected' ? (
                  <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                    Connect
                  </button>
                ) : (
                  <button className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                    Configure
                  </button>
                )}
                <button className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                  <RefreshCwIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">API Analytics</h3>
        <div className="flex space-x-2">
          <select className="border border-gray-300 rounded-md text-sm">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
          </select>
          <button
            onClick={loadDashboardData}
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <RefreshCwIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {analyticsData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Metrics */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h4>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Average Power Output</span>
                <span className="text-sm font-medium text-gray-900">
                  {analyticsData.metrics?.averagePowerOutput?.toFixed(1)} MW
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Average Efficiency</span>
                <span className="text-sm font-medium text-gray-900">
                  {(analyticsData.metrics?.averageEfficiency * 100)?.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Price Volatility</span>
                <span className="text-sm font-medium text-gray-900">
                  {analyticsData.metrics?.priceVolatility?.toFixed(3)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Demand Correlation</span>
                <span className="text-sm font-medium text-gray-900">
                  {analyticsData.metrics?.demandCorrelation?.toFixed(3)}
                </span>
              </div>
            </div>
          </div>

          {/* Risk Assessment */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Risk Assessment</h4>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">VaR (95%)</span>
                <span className="text-sm font-medium text-red-600">
                  {analyticsData.riskMetrics?.var95?.toFixed(4)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Max Drawdown</span>
                <span className="text-sm font-medium text-red-600">
                  {(analyticsData.riskMetrics?.maxDrawdown * 100)?.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Sharpe Ratio</span>
                <span className="text-sm font-medium text-blue-600">
                  {analyticsData.riskMetrics?.sharpeRatio?.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Volatility</span>
                <span className="text-sm font-medium text-yellow-600">
                  {analyticsData.riskMetrics?.volatility?.toFixed(3)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'api-keys':
        return renderApiKeys();
      case 'webhooks':
        return renderWebhooks();
      case 'workflows':
        return renderWorkflows();
      case 'integrations':
        return renderIntegrations();
      case 'analytics':
        return renderAnalytics();
      default:
        return renderOverview();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">API Management & Integration Center</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage API keys, webhooks, workflows, and third-party integrations for your energy trading platform.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: ApiIcon },
              { id: 'api-keys', name: 'API Keys', icon: KeyIcon },
              { id: 'webhooks', name: 'Webhooks', icon: WebhookIcon },
              { id: 'workflows', name: 'Workflows', icon: WorkflowIcon },
              { id: 'integrations', name: 'Integrations', icon: SettingIcon },
              { id: 'analytics', name: 'Analytics', icon: AnalyticsIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        {renderContent()}
      </div>
    </div>
  );
}