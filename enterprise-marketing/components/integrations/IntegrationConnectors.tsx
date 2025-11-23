"use client";

import React, { useState, useEffect } from 'react';
import { 
  GoogleIcon,
  MicrosoftIcon,
  CloudIcon,
  MessageSquareIcon,
  LinkIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  CogIcon,
  KeyIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

interface IntegrationConfig {
  id: string;
  name: string;
  type: 'google' | 'microsoft' | 'aws' | 'slack' | 'custom';
  status: 'connected' | 'disconnected' | 'error' | 'authenticating';
  credentials: any;
  settings: any;
  lastSync: string | null;
  syncEnabled: boolean;
  errorMessage: string | null;
}

interface GoogleWorkspaceConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
  calendarSync: boolean;
  directorySync: boolean;
}

interface MicrosoftGraphConfig {
  clientId: string;
  clientSecret: string;
  tenantId: string;
  scopes: string[];
  teamsSync: boolean;
  outlookSync: boolean;
}

interface AWSConfig {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  s3Bucket: string;
  cloudWatchEnabled: boolean;
}

interface SlackConfig {
  botToken: string;
  signingSecret: string;
  defaultChannel: string;
  notificationsEnabled: boolean;
}

export default function IntegrationConnectors() {
  const [activeTab, setActiveTab] = useState('google');
  const [integrations, setIntegrations] = useState<IntegrationConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCredentials, setShowCredentials] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = () => {
    // Mock integration data
    const mockIntegrations: IntegrationConfig[] = [
      {
        id: 'google_workspace',
        name: 'Google Workspace',
        type: 'google',
        status: 'connected',
        credentials: {
          clientId: '123456789-abcdefghijk.apps.googleusercontent.com',
          accessToken: 'ya29.A0AfH6S...',
          refreshToken: '1//04gQ...',
          expiryDate: new Date(Date.now() + 3600000).toISOString()
        },
        settings: {
          scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
          calendarSync: true,
          directorySync: true,
          syncInterval: '15'
        },
        lastSync: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        syncEnabled: true,
        errorMessage: null
      },
      {
        id: 'microsoft_graph',
        name: 'Microsoft Graph',
        type: 'microsoft',
        status: 'disconnected',
        credentials: {},
        settings: {
          scopes: ['https://graph.microsoft.com/calendars.readwrite'],
          teamsSync: false,
          outlookSync: false
        },
        lastSync: null,
        syncEnabled: false,
        errorMessage: 'Authentication required'
      },
      {
        id: 'aws_s3',
        name: 'AWS S3',
        type: 'aws',
        status: 'connected',
        credentials: {
          accessKeyId: 'AKIA***',
          region: 'us-east-1',
          s3Bucket: 'optibid-energy-data'
        },
        settings: {
          autoBackup: true,
          compressionEnabled: true,
          retentionDays: 90
        },
        lastSync: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        syncEnabled: true,
        errorMessage: null
      },
      {
        id: 'slack_notifications',
        name: 'Slack Notifications',
        type: 'slack',
        status: 'connected',
        credentials: {
          botToken: 'xoxb-***',
          signingSecret: 'hcs***'
        },
        settings: {
          defaultChannel: '#energy-alerts',
          notificationsEnabled: true,
          alertTypes: ['price_spike', 'system_error', 'daily_report']
        },
        lastSync: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        syncEnabled: true,
        errorMessage: null
      }
    ];

    setIntegrations(mockIntegrations);
    setLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'disconnected':
        return <XCircleIcon className="h-5 w-5 text-gray-400" />;
      case 'error':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'authenticating':
        return <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>;
      default:
        return <XCircleIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'text-green-600 bg-green-100';
      case 'disconnected':
        return 'text-gray-600 bg-gray-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      case 'authenticating':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const toggleCredentialVisibility = (integrationId: string) => {
    setShowCredentials(prev => ({
      ...prev,
      [integrationId]: !prev[integrationId]
    }));
  };

  const connectGoogleWorkspace = async () => {
    setIntegrations(prev => prev.map(integration => 
      integration.id === 'google_workspace' 
        ? { ...integration, status: 'authenticating' as const }
        : integration
    ));

    try {
      // In a real implementation, this would redirect to Google OAuth
      const authUrl = `https://accounts.google.com/oauth/authorize?` +
        `client_id=${encodeURIComponent('123456789-abcdefghijk.apps.googleusercontent.com')}&` +
        `redirect_uri=${encodeURIComponent('http://localhost:3000/api/integrations/google/callback')}&` +
        `scope=${encodeURIComponent('https://www.googleapis.com/auth/calendar.readonly')}&` +
        `response_type=code&` +
        `access_type=offline&` +
        `prompt=consent`;

      // Simulate successful connection
      setTimeout(() => {
        setIntegrations(prev => prev.map(integration => 
          integration.id === 'google_workspace' 
            ? { 
                ...integration, 
                status: 'connected' as const,
                credentials: {
                  ...integration.credentials,
                  accessToken: 'ya29.A0AfH6S...',
                  expiryDate: new Date(Date.now() + 3600000).toISOString()
                },
                lastSync: new Date().toISOString()
              }
            : integration
        ));
      }, 2000);

    } catch (error) {
      setIntegrations(prev => prev.map(integration => 
        integration.id === 'google_workspace' 
          ? { ...integration, status: 'error' as const, errorMessage: 'Failed to authenticate' }
          : integration
      ));
    }
  };

  const connectMicrosoftGraph = async () => {
    setIntegrations(prev => prev.map(integration => 
      integration.id === 'microsoft_graph' 
        ? { ...integration, status: 'authenticating' as const }
        : integration
    ));

    try {
      // Simulate authentication flow
      setTimeout(() => {
        setIntegrations(prev => prev.map(integration => 
          integration.id === 'microsoft_graph' 
            ? { 
                ...integration, 
                status: 'connected' as const,
                credentials: {
                  accessToken: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
                  expiryDate: new Date(Date.now() + 3600000).toISOString()
                },
                lastSync: new Date().toISOString()
              }
            : integration
        ));
      }, 2000);

    } catch (error) {
      setIntegrations(prev => prev.map(integration => 
        integration.id === 'microsoft_graph' 
          ? { ...integration, status: 'error' as const, errorMessage: 'Failed to authenticate' }
          : integration
      ));
    }
  };

  const testIntegration = async (integrationId: string) => {
    const integration = integrations.find(i => i.id === integrationId);
    if (!integration) return;

    setIntegrations(prev => prev.map(i => 
      i.id === integrationId 
        ? { ...i, status: 'authenticating' as const }
        : i
    ));

    try {
      // Simulate test call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIntegrations(prev => prev.map(i => 
        i.id === integrationId 
          ? { ...i, status: 'connected' as const, lastSync: new Date().toISOString() }
          : i
      ));

    } catch (error) {
      setIntegrations(prev => prev.map(i => 
        i.id === integrationId 
          ? { ...i, status: 'error' as const, errorMessage: 'Test failed' }
          : i
      ));
    }
  };

  const renderGoogleWorkspace = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <GoogleIcon className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-gray-900">Google Workspace</h3>
              <p className="text-sm text-gray-500">Sync calendar events and team directory</p>
            </div>
          </div>
          <div className="flex items-center">
            {getStatusIcon('google_workspace' ? 'connected' : 'disconnected')}
            <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor('google_workspace' ? 'connected' : 'disconnected')}`}>
              Connected
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Configuration</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Client ID</label>
                <input
                  type="text"
                  value="123456789-abcdefghijk.apps.googleusercontent.com"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Redirect URI</label>
                <input
                  type="text"
                  value="http://localhost:3000/api/integrations/google/callback"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Scopes</label>
                <div className="mt-1 space-y-1">
                  <label className="flex items-center">
                    <input type="checkbox" checked className="rounded" readOnly />
                    <span className="ml-2 text-sm text-gray-600">Calendar Readonly</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" checked className="rounded" readOnly />
                    <span className="ml-2 text-sm text-gray-600">Directory Readonly</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Sync Settings</h4>
            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Calendar Sync</span>
                <input type="checkbox" checked className="rounded" />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Directory Sync</span>
                <input type="checkbox" checked className="rounded" />
              </label>
              <div>
                <label className="block text-sm font-medium text-gray-700">Sync Interval</label>
                <select className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                  <option>15 minutes</option>
                  <option>30 minutes</option>
                  <option>1 hour</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex space-x-3">
          <button
            onClick={() => testIntegration('google_workspace')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Test Connection
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100">
            Configure Sync
          </button>
        </div>
      </div>
    </div>
  );

  const renderMicrosoftGraph = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <MicrosoftIcon className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-gray-900">Microsoft Graph</h3>
              <p className="text-sm text-gray-500">Connect to Office 365 and Teams</p>
            </div>
          </div>
          <div className="flex items-center">
            {getStatusIcon('disconnected')}
            <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor('disconnected')}`}>
              Disconnected
            </span>
          </div>
        </div>

        <div className="text-center py-8">
          <MicrosoftIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">Connect to Microsoft Graph</h4>
          <p className="text-gray-500 mb-6">Authenticate with your Microsoft account to access Office 365 and Teams data</p>
          <button
            onClick={connectMicrosoftGraph}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <LinkIcon className="h-5 w-5 mr-2" />
            Connect with Microsoft
          </button>
        </div>
      </div>
    </div>
  );

  const renderAWSIntegration = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <CloudIcon className="h-8 w-8 text-orange-500 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-gray-900">AWS S3 Integration</h3>
              <p className="text-sm text-gray-500">Store and manage energy data backups</p>
            </div>
          </div>
          <div className="flex items-center">
            {getStatusIcon('connected')}
            <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor('connected')}`}>
              Connected
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Credentials</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Access Key ID</label>
                <div className="mt-1 flex">
                  <input
                    type={showCredentials.aws_access ? 'text' : 'password'}
                    value="AKIA***"
                    className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 text-sm"
                    readOnly
                  />
                  <button
                    onClick={() => toggleCredentialVisibility('aws_access')}
                    className="inline-flex items-center px-3 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100"
                  >
                    {showCredentials.aws_access ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Secret Access Key</label>
                <div className="mt-1 flex">
                  <input
                    type={showCredentials.aws_secret ? 'text' : 'password'}
                    value="wJalrXUtnFEMI/K7MDENG/bPxRfiCYzEXAMPLEKEY"
                    className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 text-sm"
                    readOnly
                  />
                  <button
                    onClick={() => toggleCredentialVisibility('aws_secret')}
                    className="inline-flex items-center px-3 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100"
                  >
                    {showCredentials.aws_secret ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Region</label>
                <input
                  type="text"
                  value="us-east-1"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  readOnly
                />
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Backup Settings</h4>
            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Automatic Backups</span>
                <input type="checkbox" checked className="rounded" />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Data Compression</span>
                <input type="checkbox" checked className="rounded" />
              </label>
              <div>
                <label className="block text-sm font-medium text-gray-700">Retention Period</label>
                <select className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                  <option>30 days</option>
                  <option>90 days</option>
                  <option>1 year</option>
                  <option>Forever</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Backup</label>
                <p className="text-sm text-gray-500 mt-1">{new Date(Date.now() - 30 * 60 * 1000).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            Test Connection
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100">
            Trigger Backup
          </button>
        </div>
      </div>
    </div>
  );

  const renderSlackIntegration = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <MessageSquareIcon className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-gray-900">Slack Notifications</h3>
              <p className="text-sm text-gray-500">Send alerts and reports to Slack channels</p>
            </div>
          </div>
          <div className="flex items-center">
            {getStatusIcon('connected')}
            <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor('connected')}`}>
              Connected
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Bot Configuration</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Bot Token</label>
                <div className="mt-1 flex">
                  <input
                    type={showCredentials.slack_token ? 'text' : 'password'}
                    value="xoxb-***"
                    className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 text-sm"
                    readOnly
                  />
                  <button
                    onClick={() => toggleCredentialVisibility('slack_token')}
                    className="inline-flex items-center px-3 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100"
                  >
                    {showCredentials.slack_token ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Signing Secret</label>
                <div className="mt-1 flex">
                  <input
                    type={showCredentials.slack_secret ? 'text' : 'password'}
                    value="hcs***"
                    className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 text-sm"
                    readOnly
                  />
                  <button
                    onClick={() => toggleCredentialVisibility('slack_secret')}
                    className="inline-flex items-center px-3 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100"
                  >
                    {showCredentials.slack_secret ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Notification Settings</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Default Channel</label>
                <input
                  type="text"
                  value="#energy-alerts"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  readOnly
                />
              </div>
              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Notifications Enabled</span>
                <input type="checkbox" checked className="rounded" />
              </label>
              <div>
                <label className="block text-sm font-medium text-gray-700">Alert Types</label>
                <div className="mt-1 space-y-1">
                  <label className="flex items-center">
                    <input type="checkbox" checked className="rounded" />
                    <span className="ml-2 text-sm text-gray-600">Price Spikes</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" checked className="rounded" />
                    <span className="ml-2 text-sm text-gray-600">System Errors</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" checked className="rounded" />
                    <span className="ml-2 text-sm text-gray-600">Daily Reports</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            Test Notifications
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-green-300 text-sm font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100">
            Send Test Alert
          </button>
        </div>
      </div>
    </div>
  );

  const renderCustomIntegrations = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center py-8">
          <CogIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">Custom Integrations</h4>
          <p className="text-gray-500 mb-6">Create custom integrations using our API endpoints</p>
          <button className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
            <LinkIcon className="h-5 w-5 mr-2" />
            Create Custom Integration
          </button>
        </div>

        <div className="mt-8">
          <h4 className="font-medium text-gray-900 mb-4">Available API Endpoints</h4>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="space-y-2 text-sm">
              <div><code className="text-blue-600">POST /api/integrations/google/auth-url</code> - Get Google OAuth URL</div>
              <div><code className="text-blue-600">POST /api/integrations/microsoft/create-meeting</code> - Create Teams meeting</div>
              <div><code className="text-blue-600">GET /api/integrations/analytics/overview</code> - Analytics overview</div>
              <div><code className="text-blue-600">POST /api/integrations/workflows/execute</code> - Execute workflow</div>
              <div><code className="text-blue-600">GET /api/integrations/api-gateway/health</code> - Health check</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'google':
        return renderGoogleWorkspace();
      case 'microsoft':
        return renderMicrosoftGraph();
      case 'aws':
        return renderAWSIntegration();
      case 'slack':
        return renderSlackIntegration();
      case 'custom':
        return renderCustomIntegrations();
      default:
        return renderGoogleWorkspace();
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
          <h1 className="text-3xl font-bold text-gray-900">Integration Connectors</h1>
          <p className="mt-2 text-sm text-gray-600">
            Connect OptiBid Energy with your favorite tools and services.
          </p>
        </div>

        {/* Integration Status Overview */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          {integrations.map((integration) => (
            <div key={integration.id} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center">
                {getStatusIcon(integration.status)}
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{integration.name}</p>
                  <p className="text-xs text-gray-500">{integration.status}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'google', name: 'Google Workspace', icon: GoogleIcon },
              { id: 'microsoft', name: 'Microsoft Graph', icon: MicrosoftIcon },
              { id: 'aws', name: 'AWS S3', icon: CloudIcon },
              { id: 'slack', name: 'Slack', icon: MessageSquareIcon },
              { id: 'custom', name: 'Custom', icon: CogIcon }
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