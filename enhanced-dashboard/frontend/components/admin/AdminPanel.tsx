"""
Admin Panel Component
Phase 5: Theme System & Admin Controls

Comprehensive admin dashboard with organization management, user controls,
feature flags, system monitoring, and audit logs.
"""

import React, { useState, useEffect } from 'react';
import {
  Users,
  Settings,
  Shield,
  Activity,
  BarChart3,
  Flag,
  Building2,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  Download,
  Plus,
  Edit,
  Trash2,
  MoreVertical,
  RefreshCw,
  Eye,
  EyeOff,
  Lock,
  Unlock
} from 'lucide-react';

// Admin Panel Types
interface AdminStats {
  organization: {
    total_orgs: number;
    active_orgs: number;
    trial_orgs: number;
  };
  users: {
    total_users: number;
    active_users: number;
    new_users_today: number;
  };
  system: {
    health_status: 'healthy' | 'warning' | 'critical';
    total_requests_today: number;
    average_response_time: number;
    error_rate: number;
  };
  features: {
    total_flags: number;
    enabled_flags: number;
  };
}

interface Organization {
  id: number;
  name: string;
  slug: string;
  domain?: string;
  description?: string;
  subscription_tier: string;
  subscription_status: string;
  current_users: number;
  max_users: number;
  current_dashboards: number;
  max_dashboards: number;
  is_active: boolean;
  is_trial: boolean;
  created_at: string;
}

interface User {
  id: number;
  email: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  role: string;
  is_active: boolean;
  last_login_at?: string;
  created_at: string;
  organization_id: number;
}

interface FeatureFlag {
  id: number;
  name: string;
  key: string;
  description?: string;
  type: string;
  is_enabled: boolean;
  environment: string;
  created_at: string;
}

interface SystemHealthMetric {
  id: number;
  name: string;
  category: string;
  status: 'healthy' | 'warning' | 'critical';
  value: number;
  unit: string;
  threshold_warning?: number;
  threshold_critical?: number;
  recorded_at: string;
}

// Main Admin Panel Component
export const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'organizations' | 'users' | 'features' | 'system' | 'audit'>('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemHealthMetric[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Load admin data
  useEffect(() => {
    loadAdminData();
  }, [activeTab]);

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      switch (activeTab) {
        case 'overview':
          await loadAdminStats();
          break;
        case 'organizations':
          await loadOrganizations();
          break;
        case 'users':
          await loadUsers();
          break;
        case 'features':
          await loadFeatureFlags();
          break;
        case 'system':
          await loadSystemHealth();
          break;
      }
    } catch (error) {
      console.error('Failed to load admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAdminStats = async () => {
    // Mock data - in real implementation, this would fetch from API
    const mockStats: AdminStats = {
      organization: {
        total_orgs: 45,
        active_orgs: 42,
        trial_orgs: 8
      },
      users: {
        total_users: 1247,
        active_users: 1089,
        new_users_today: 23
      },
      system: {
        health_status: 'healthy',
        total_requests_today: 15420,
        average_response_time: 145,
        error_rate: 0.12
      },
      features: {
        total_flags: 12,
        enabled_flags: 8
      }
    };
    setStats(mockStats);
  };

  const loadOrganizations = async () => {
    // Mock data
    const mockOrgs: Organization[] = [
      {
        id: 1,
        name: 'Energy Corp Ltd',
        slug: 'energy-corp',
        domain: 'energycorp.com',
        description: 'Leading energy company',
        subscription_tier: 'enterprise',
        subscription_status: 'active',
        current_users: 45,
        max_users: 100,
        current_dashboards: 12,
        max_dashboards: 50,
        is_active: true,
        is_trial: false,
        created_at: '2025-01-15T10:30:00Z'
      },
      {
        id: 2,
        name: 'GreenTech Solutions',
        slug: 'greentech',
        domain: 'greentech.com',
        description: 'Renewable energy startup',
        subscription_tier: 'professional',
        subscription_status: 'trial',
        current_users: 8,
        max_users: 20,
        current_dashboards: 3,
        max_dashboards: 20,
        is_active: true,
        is_trial: true,
        created_at: '2025-11-10T14:20:00Z'
      }
    ];
    setOrganizations(mockOrgs);
  };

  const loadUsers = async () => {
    // Mock data
    const mockUsers: User[] = [
      {
        id: 1,
        email: 'admin@energycorp.com',
        username: 'admin',
        first_name: 'John',
        last_name: 'Admin',
        role: 'org_admin',
        is_active: true,
        last_login_at: '2025-11-18T08:30:00Z',
        created_at: '2025-01-15T10:30:00Z',
        organization_id: 1
      },
      {
        id: 2,
        email: 'analyst@energycorp.com',
        username: 'analyst',
        first_name: 'Sarah',
        last_name: 'Analyst',
        role: 'user',
        is_active: true,
        last_login_at: '2025-11-18T09:15:00Z',
        created_at: '2025-02-01T12:00:00Z',
        organization_id: 1
      }
    ];
    setUsers(mockUsers);
  };

  const loadFeatureFlags = async () => {
    // Mock data
    const mockFlags: FeatureFlag[] = [
      {
        id: 1,
        name: 'Knowledge Graphs',
        key: 'knowledge_graphs',
        description: 'Visual knowledge graph capabilities',
        type: 'boolean',
        is_enabled: true,
        environment: 'production',
        created_at: '2025-11-15T10:00:00Z'
      },
      {
        id: 2,
        name: 'AI Assistant',
        key: 'ai_assistant',
        description: 'AI-powered assistant',
        type: 'boolean',
        is_enabled: true,
        environment: 'production',
        created_at: '2025-11-15T10:00:00Z'
      },
      {
        id: 3,
        name: 'Advanced Analytics',
        key: 'advanced_analytics',
        description: 'Advanced analytics features',
        type: 'percentage',
        is_enabled: true,
        environment: 'production',
        created_at: '2025-11-15T10:00:00Z'
      }
    ];
    setFeatureFlags(mockFlags);
  };

  const loadSystemHealth = async () => {
    // Mock data
    const mockMetrics: SystemHealthMetric[] = [
      {
        id: 1,
        name: 'API Response Time',
        category: 'performance',
        status: 'healthy',
        value: 145,
        unit: 'ms',
        threshold_warning: 300,
        threshold_critical: 500,
        recorded_at: '2025-11-18T19:10:00Z'
      },
      {
        id: 2,
        name: 'CPU Usage',
        category: 'performance',
        status: 'healthy',
        value: 45.2,
        unit: '%',
        threshold_warning: 70,
        threshold_critical: 90,
        recorded_at: '2025-11-18T19:10:00Z'
      },
      {
        id: 3,
        name: 'Memory Usage',
        category: 'performance',
        status: 'warning',
        value: 78.9,
        unit: '%',
        threshold_warning: 80,
        threshold_critical: 95,
        recorded_at: '2025-11-18T19:10:00Z'
      }
    ];
    setSystemMetrics(mockMetrics);
  };

  const handleToggleFeatureFlag = async (flagId: number) => {
    try {
      // In real implementation, this would make an API call
      setFeatureFlags(flags =>
        flags.map(flag =>
          flag.id === flagId
            ? { ...flag, is_enabled: !flag.is_enabled }
            : flag
        )
      );
    } catch (error) {
      console.error('Failed to toggle feature flag:', error);
    }
  };

  const handleToggleUserStatus = async (userId: number) => {
    try {
      // In real implementation, this would make an API call
      setUsers(users =>
        users.map(user =>
          user.id === userId
            ? { ...user, is_active: !user.is_active }
            : user
        )
      );
    } catch (error) {
      console.error('Failed to toggle user status:', error);
    }
  };

  const filteredOrganizations = organizations.filter(org =>
    org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    org.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
    (user.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  );

  const filteredFeatureFlags = featureFlags.filter(flag =>
    flag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    flag.key.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Admin Panel
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage organizations, users, and system configuration
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={loadAdminData}
                disabled={isLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'organizations', label: 'Organizations', icon: Building2 },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'features', label: 'Feature Flags', icon: Flag },
              { id: 'system', label: 'System Health', icon: Activity },
              { id: 'audit', label: 'Audit Logs', icon: FileText }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`
                  flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }
                `}
              >
                <Icon size={16} />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <RefreshCw size={24} className="animate-spin text-blue-600" />
          </div>
        )}

        {!isLoading && activeTab === 'overview' && <OverviewTab stats={stats} />}
        
        {!isLoading && activeTab === 'organizations' && (
          <OrganizationsTab
            organizations={filteredOrganizations}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        )}
        
        {!isLoading && activeTab === 'users' && (
          <UsersTab
            users={filteredUsers}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onToggleUserStatus={handleToggleUserStatus}
          />
        )}
        
        {!isLoading && activeTab === 'features' && (
          <FeatureFlagsTab
            flags={filteredFeatureFlags}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onToggleFlag={handleToggleFeatureFlag}
          />
        )}
        
        {!isLoading && activeTab === 'system' && (
          <SystemHealthTab metrics={systemMetrics} />
        )}
        
        {!isLoading && activeTab === 'audit' && (
          <AuditLogsTab />
        )}
      </div>
    </div>
  );
};

// Overview Tab Component
const OverviewTab: React.FC<{ stats: AdminStats | null }> = ({ stats }) => {
  if (!stats) return null;

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    subtitle: string;
    icon: React.ComponentType<any>;
    color: string;
  }> = ({ title, value, subtitle, icon: Icon, color }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{value}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          System Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Organizations"
            value={stats.organization.total_orgs}
            subtitle={`${stats.organization.active_orgs} active`}
            icon={Building2}
            color="bg-blue-500"
          />
          <StatCard
            title="Total Users"
            value={stats.users.total_users}
            subtitle={`${stats.users.active_users} active`}
            icon={Users}
            color="bg-green-500"
          />
          <StatCard
            title="API Response Time"
            value={`${stats.system.average_response_time}ms`}
            subtitle={`${stats.system.total_requests_today} requests today`}
            icon={Activity}
            color="bg-purple-500"
          />
          <StatCard
            title="Feature Flags"
            value={stats.features.enabled_flags}
            subtitle={`of ${stats.features.total_flags} enabled`}
            icon={Flag}
            color="bg-orange-500"
          />
        </div>
      </div>

      {/* System Health Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          System Health
        </h3>
        <div className="flex items-center space-x-4">
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
            stats.system.health_status === 'healthy'
              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
              : stats.system.health_status === 'warning'
              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
              : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
          }`}>
            {stats.system.health_status === 'healthy' ? (
              <CheckCircle size={16} />
            ) : stats.system.health_status === 'warning' ? (
              <AlertTriangle size={16} />
            ) : (
              <XCircle size={16} />
            )}
            <span className="capitalize">{stats.system.health_status}</span>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Error Rate: {stats.system.error_rate}%
          </div>
        </div>
      </div>
    </div>
  );
};

// Organizations Tab Component
const OrganizationsTab: React.FC<{
  organizations: Organization[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}> = ({ organizations, searchQuery, setSearchQuery }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Organizations
        </h2>
        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus size={16} />
          <span>Add Organization</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search organizations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />
      </div>

      {/* Organizations List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Organization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Subscription
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Users
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {organizations.map((org) => (
                <tr key={org.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {org.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {org.slug}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      org.subscription_tier === 'enterprise'
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                        : org.subscription_tier === 'professional'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                    }`}>
                      {org.subscription_tier}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {org.current_users}/{org.max_users}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      org.is_active
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {org.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(org.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Users Tab Component
const UsersTab: React.FC<{
  users: User[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onToggleUserStatus: (userId: number) => void;
}> = ({ users, searchQuery, setSearchQuery, onToggleUserStatus }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Users
        </h2>
        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus size={16} />
          <span>Invite User</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />
      </div>

      {/* Users List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {user.first_name && user.last_name 
                          ? `${user.first_name} ${user.last_name}`
                          : user.email
                        }
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {user.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      user.is_active
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {user.last_login_at 
                      ? new Date(user.last_login_at).toLocaleDateString()
                      : 'Never'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onToggleUserStatus(user.id)}
                        className={`p-1 rounded ${
                          user.is_active
                            ? 'text-red-600 hover:text-red-800'
                            : 'text-green-600 hover:text-green-800'
                        }`}
                        title={user.is_active ? 'Deactivate user' : 'Activate user'}
                      >
                        {user.is_active ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button className="p-1 rounded text-gray-400 hover:text-gray-600">
                        <Edit size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Feature Flags Tab Component
const FeatureFlagsTab: React.FC<{
  flags: FeatureFlag[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onToggleFlag: (flagId: number) => void;
}> = ({ flags, searchQuery, setSearchQuery, onToggleFlag }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Feature Flags
        </h2>
        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus size={16} />
          <span>Create Flag</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search feature flags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />
      </div>

      {/* Feature Flags List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Flag
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Environment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {flags.map((flag) => (
                <tr key={flag.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {flag.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {flag.key}
                      </div>
                      {flag.description && (
                        <div className="text-xs text-gray-400 mt-1">
                          {flag.description}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400">
                      {flag.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                      {flag.environment}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => onToggleFlag(flag.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        flag.is_enabled
                          ? 'bg-green-600'
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          flag.is_enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(flag.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="p-1 rounded text-gray-400 hover:text-gray-600">
                      <Edit size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// System Health Tab Component
const SystemHealthTab: React.FC<{ metrics: SystemHealthMetric[] }> = ({ metrics }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'warning':
        return <AlertTriangle className="text-yellow-500" size={20} />;
      case 'critical':
        return <XCircle className="text-red-500" size={20} />;
      default:
        return <Clock className="text-gray-500" size={20} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          System Health
        </h2>
        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Activity size={16} />
          <span>Run Health Check</span>
        </button>
      </div>

      {/* Health Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric) => (
          <div
            key={metric.id}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                {getStatusIcon(metric.status)}
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {metric.name}
                </h3>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(metric.status)}`}>
                {metric.status}
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {metric.value}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {metric.unit}
                </span>
              </div>
              
              {(metric.threshold_warning || metric.threshold_critical) && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {metric.threshold_warning && (
                    <span>Warning: {metric.threshold_warning}{metric.unit}</span>
                  )}
                  {metric.threshold_critical && (
                    <span className="ml-2">
                      Critical: {metric.threshold_critical}{metric.unit}
                    </span>
                  )}
                </div>
              )}
            </div>
            
            <div className="mt-4 text-xs text-gray-400">
              Last updated: {new Date(metric.recorded_at).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Audit Logs Tab Component
const AuditLogsTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Audit Logs
        </h2>
        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Download size={16} />
          <span>Export Logs</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
          <option>All Actions</option>
          <option>User Login</option>
          <option>Dashboard Create</option>
          <option>User Invite</option>
          <option>Settings Change</option>
        </select>
        
        <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
          <option>All Users</option>
          <option>Admin Users</option>
          <option>Regular Users</option>
        </select>
        
        <input
          type="date"
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 text-center text-gray-500 dark:text-gray-400">
          <FileText size={48} className="mx-auto mb-4 text-gray-300" />
          <p>Audit logs will be displayed here</p>
          <p className="text-sm mt-2">
            Comprehensive audit logging tracks all user actions for compliance and security monitoring
          </p>
        </div>
      </div>
    </div>
  );
};