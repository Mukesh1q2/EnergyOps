"use client";

import React, { useState, useEffect } from 'react';
import { 
  WebhookIcon,
  PlusIcon,
  PlayIcon,
  PauseIcon,
  TrashIcon,
  EditIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  EyeIcon,
  ClipboardDocumentIcon,
  RefreshCwIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  status: 'active' | 'inactive' | 'error';
  secret: string;
  enabled: boolean;
  filters?: any;
  createdAt: string;
  lastTriggered: string | null;
  successCount: number;
  failureCount: number;
  nextDelivery?: string | null;
}

interface WebhookEvent {
  id: string;
  type: string;
  timestamp: string;
  data: any;
  status: 'delivered' | 'failed' | 'pending';
  responseCode?: number;
  responseTime?: number;
  deliveryAttempts: number;
}

interface WebhookTemplate {
  id: string;
  name: string;
  description: string;
  events: string[];
  examplePayload: any;
}

export default function WebhookManagement() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [templates, setTemplates] = useState<WebhookTemplate[]>([]);
  const [activeTab, setActiveTab] = useState('webhooks');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null);
  const [showTestModal, setShowTestModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWebhookData();
  }, []);

  const loadWebhookData = async () => {
    setLoading(true);
    try {
      // Load webhooks
      const webhooksResponse = await fetch('/api/integrations/webhooks');
      if (webhooksResponse.ok) {
        const webhooksData = await webhooksResponse.json();
        setWebhooks([
          {
            id: 'webhook_123',
            name: 'Energy Data Updates',
            url: 'https://api.example.com/webhooks/energy-data',
            events: ['energy_data_created', 'energy_data_updated', 'energy_data_deleted'],
            status: 'active',
            secret: 'whsec_***',
            enabled: true,
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            lastTriggered: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
            successCount: 245,
            failureCount: 3,
            nextDelivery: null
          },
          {
            id: 'webhook_456',
            name: 'Market Price Alerts',
            url: 'https://hooks.slack.com/services/***/***/***',
            events: ['market_price_updated', 'market_price_alert'],
            status: 'active',
            secret: 'whsec_***',
            enabled: true,
            createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            lastTriggered: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            successCount: 1230,
            failureCount: 12,
            nextDelivery: null
          },
          {
            id: 'webhook_789',
            name: 'Dashboard Activities',
            url: 'https://webhook.site/unique-url',
            events: ['dashboard_created', 'dashboard_updated', 'dashboard_shared', 'widget_added', 'widget_removed'],
            status: 'active',
            secret: 'whsec_***',
            enabled: false,
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            lastTriggered: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            successCount: 89,
            failureCount: 1,
            nextDelivery: null
          }
        ]);
      }

      // Load events
      setEvents([
        {
          id: 'event_001',
          type: 'energy_data_created',
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          data: { assetId: 'asset_001', powerOutput: 2.5, efficiency: 0.92 },
          status: 'delivered',
          responseCode: 200,
          responseTime: 234,
          deliveryAttempts: 1
        },
        {
          id: 'event_002',
          type: 'market_price_updated',
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          data: { region: 'ERCOT', oldPrice: 0.045, newPrice: 0.052 },
          status: 'delivered',
          responseCode: 200,
          responseTime: 156,
          deliveryAttempts: 1
        },
        {
          id: 'event_003',
          type: 'dashboard_shared',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          data: { dashboardId: 'dashboard_123', sharedWith: ['user_002'] },
          status: 'failed',
          responseCode: 500,
          responseTime: 5000,
          deliveryAttempts: 3
        }
      ]);

      // Load templates
      setTemplates([
        {
          id: 'energy_data_update',
          name: 'Energy Data Update',
          description: 'Triggered when energy data is updated',
          events: ['energy_data_created', 'energy_data_updated', 'energy_data_deleted'],
          examplePayload: {
            id: 'webhook_123',
            type: 'energy_data_created',
            timestamp: new Date().toISOString(),
            data: {
              assetId: 'asset_001',
              timestamp: new Date().toISOString(),
              powerOutput: 2.5,
              efficiency: 0.92
            }
          }
        },
        {
          id: 'market_price_change',
          name: 'Market Price Change',
          description: 'Triggered when market prices change significantly',
          events: ['market_price_updated', 'market_price_alert'],
          examplePayload: {
            id: 'webhook_456',
            type: 'market_price_updated',
            timestamp: new Date().toISOString(),
            data: {
              region: 'ERCOT',
              oldPrice: 0.045,
              newPrice: 0.052,
              changePercent: 15.56
            }
          }
        }
      ]);

    } catch (error) {
      console.error('Failed to load webhook data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleWebhook = async (webhookId: string) => {
    setWebhooks(webhooks.map(webhook => 
      webhook.id === webhookId 
        ? { ...webhook, enabled: !webhook.enabled, status: !webhook.enabled ? 'active' : 'inactive' }
        : webhook
    ));
  };

  const deleteWebhook = async (webhookId: string) => {
    if (confirm('Are you sure you want to delete this webhook?')) {
      setWebhooks(webhooks.filter(webhook => webhook.id !== webhookId));
    }
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'delivered':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'inactive':
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'failed':
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ExclamationTriangleIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'delivered':
        return 'text-green-600 bg-green-100';
      case 'inactive':
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'failed':
      case 'error':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const renderWebhooksTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Webhook Endpoints</h3>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Create Webhook
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {webhooks.map((webhook) => (
          <div key={webhook.id} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <h4 className="text-lg font-medium text-gray-900">{webhook.name}</h4>
                  <span className={`ml-3 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(webhook.status)}`}>
                    {webhook.status}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">{webhook.url}</p>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {webhook.events.map((event) => (
                    <span key={event} className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                      {event}
                    </span>
                  ))}
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Success:</span> {webhook.successCount}
                  </div>
                  <div>
                    <span className="font-medium">Failures:</span> {webhook.failureCount}
                  </div>
                  <div>
                    <span className="font-medium">Last Triggered:</span> {webhook.lastTriggered ? new Date(webhook.lastTriggered).toLocaleString() : 'Never'}
                  </div>
                  <div>
                    <span className="font-medium">Created:</span> {new Date(webhook.createdAt).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="mt-3 flex items-center space-x-2">
                  <button
                    onClick={() => copyToClipboard(webhook.url)}
                    className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-800"
                  >
                    <ClipboardDocumentIcon className="h-3 w-3 mr-1" />
                    Copy URL
                  </button>
                  <button
                    onClick={() => copyToClipboard(webhook.secret)}
                    className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-800"
                  >
                    <ClipboardDocumentIcon className="h-3 w-3 mr-1" />
                    Copy Secret
                  </button>
                </div>
              </div>
              
              <div className="ml-6 flex flex-col space-y-2">
                <button
                  onClick={() => testWebhook(webhook.id)}
                  className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <BeakerIcon className="h-4 w-4 mr-1" />
                  Test
                </button>
                <button
                  onClick={() => toggleWebhook(webhook.id)}
                  className={`inline-flex items-center px-3 py-1 border text-sm font-medium rounded-md ${
                    webhook.enabled
                      ? 'border-green-300 text-green-700 bg-green-50 hover:bg-green-100'
                      : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                  }`}
                >
                  {webhook.enabled ? <PauseIcon className="h-4 w-4 mr-1" /> : <PlayIcon className="h-4 w-4 mr-1" />}
                  {webhook.enabled ? 'Disable' : 'Enable'}
                </button>
                <button className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                  <EditIcon className="h-4 w-4 mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => deleteWebhook(webhook.id)}
                  className="inline-flex items-center px-3 py-1 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                >
                  <TrashIcon className="h-4 w-4 mr-1" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderEventsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Recent Events</h3>
        <div className="flex space-x-2">
          <select className="border border-gray-300 rounded-md text-sm">
            <option>All Events</option>
            <option>Delivered</option>
            <option>Failed</option>
            <option>Pending</option>
          </select>
          <button
            onClick={loadWebhookData}
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <RefreshCwIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {events.map((event) => (
            <li key={event.id}>
              <div className="px-4 py-4 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center">
                    {getStatusIcon(event.status)}
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{event.type}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(event.timestamp).toLocaleString()} • 
                        Response: {event.responseCode} • 
                        Time: {event.responseTime}ms • 
                        Attempts: {event.deliveryAttempts}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <pre className="text-xs text-gray-600 bg-gray-50 rounded p-2 overflow-x-auto">
                      {JSON.stringify(event.data, null, 2)}
                    </pre>
                  </div>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(event.status)}`}>
                    {event.status}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  const renderTemplatesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Webhook Templates</h3>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {templates.map((template) => (
          <div key={template.id} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <h4 className="text-lg font-medium text-gray-900">{template.name}</h4>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {template.events.map((event) => (
                    <span key={event} className="inline-flex px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded">
                      {event}
                    </span>
                  ))}
                </div>
                
                <div className="mt-3">
                  <h5 className="text-sm font-medium text-gray-900 mb-2">Example Payload:</h5>
                  <pre className="text-xs text-gray-600 bg-gray-50 rounded p-3 overflow-x-auto">
                    {JSON.stringify(template.examplePayload, null, 2)}
                  </pre>
                </div>
              </div>
              
              <div className="ml-6">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center px-3 py-2 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Use Template
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCreateWebhookModal = () => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Webhook</h3>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                placeholder="My Webhook"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">URL</label>
              <input
                type="url"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                placeholder="https://example.com/webhook"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Events</label>
              <select multiple className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                <option value="energy_data_created">Energy Data Created</option>
                <option value="energy_data_updated">Energy Data Updated</option>
                <option value="market_price_updated">Market Price Updated</option>
                <option value="dashboard_created">Dashboard Created</option>
              </select>
            </div>
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

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
          <h1 className="text-3xl font-bold text-gray-900">Webhook Management</h1>
          <p className="mt-2 text-sm text-gray-600">
            Create and manage webhook endpoints to receive real-time notifications.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'webhooks', name: 'Webhooks', icon: WebhookIcon },
              { id: 'events', name: 'Events', icon: ClockIcon },
              { id: 'templates', name: 'Templates', icon: BeakerIcon }
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
        {activeTab === 'webhooks' && renderWebhooksTab()}
        {activeTab === 'events' && renderEventsTab()}
        {activeTab === 'templates' && renderTemplatesTab()}

        {/* Create Webhook Modal */}
        {showCreateModal && renderCreateWebhookModal()}
      </div>
    </div>
  );
}