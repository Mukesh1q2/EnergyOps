// Admin Dashboard - Main Dashboard Component
'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  UsersIcon as Users,
  CogIcon as Settings,
  CreditCardIcon as CreditCard,
  ChartBarIcon as BarChart3,
  ShieldCheckIcon as Shield,
  CircleStackIcon as Database,
  BoltIcon as Activity,
  ExclamationTriangleIcon as AlertTriangle,
  CheckCircleIcon as CheckCircle,
  ClockIcon as Clock,
  ArrowTrendingUpIcon as TrendingUp
} from '@heroicons/react/24/outline'

interface AdminStats {
  totalOrganizations: number
  totalUsers: number
  activeSubscriptions: number
  monthlyRevenue: number
  systemHealth: 'healthy' | 'warning' | 'critical'
  recentActivity: Array<{
    id: string
    type: string
    description: string
    timestamp: string
    status: 'success' | 'warning' | 'error'
  }>
}

interface FeatureFlags {
  enabled: boolean
  rollout_percentage: number
  target_organizations: string[]
}

interface QuotaUsage {
  resource_type: string
  quota_limit: number
  current_usage: number
  percentage_used: number
  status: 'ok' | 'warning' | 'exceeded'
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [featureFlags, setFeatureFlags] = useState<Record<string, FeatureFlags>>({})
  const [quotaUsage, setQuotaUsage] = useState<QuotaUsage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  const router = useRouter()

  useEffect(() => {
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    try {
      setLoading(true)
      
      // Mock API calls - replace with actual API endpoints
      const [statsResponse, flagsResponse, quotaResponse] = await Promise.all([
        fetch('/api/admin/organizations/summary', {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/admin/feature-flags', {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/admin/usage/quota', {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ])

      if (!statsResponse.ok) throw new Error('Failed to fetch admin data')

      const statsData = await statsResponse.json()
      const flagsData = await flagsResponse.json()
      const quotaData = await quotaResponse.json()

      setStats({
        totalOrganizations: statsData.data?.statistics?.total_organizations || 0,
        totalUsers: statsData.data?.statistics?.total_users || 0,
        activeSubscriptions: statsData.data?.statistics?.active_subscriptions || 0,
        monthlyRevenue: statsData.data?.revenue?.monthly || 0,
        systemHealth: 'healthy',
        recentActivity: [
          {
            id: '1',
            type: 'user_registration',
            description: 'New user registered',
            timestamp: new Date().toISOString(),
            status: 'success'
          }
        ]
      })

      setFeatureFlags(flagsData.data?.reduce((acc: Record<string, FeatureFlags>, flag: any) => {
        acc[flag.name] = {
          enabled: flag.status === 'enabled',
          rollout_percentage: flag.rollout_percentage,
          target_organizations: flag.target_organizations
        }
        return acc
      }, {}) || {})

      setQuotaUsage(quotaData.data || [])

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-600 bg-green-50'
      case 'warning': return 'text-yellow-600 bg-yellow-50'
      case 'critical': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getQuotaStatusColor = (status: string) => {
    switch (status) {
      case 'ok': return 'text-green-600'
      case 'warning': return 'text-yellow-600'
      case 'exceeded': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Admin Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchAdminData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Manage your OptiBid Energy Platform</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => router.push('/admin/settings')}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center space-x-2"
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Create Organization
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: BarChart3 },
              { id: 'users', name: 'Users', icon: Users },
              { id: 'billing', name: 'Billing', icon: CreditCard },
              { id: 'features', name: 'Features', icon: Shield },
              { id: 'system', name: 'System', icon: Database },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats?.totalUsers}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <CreditCard className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Subscriptions</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats?.activeSubscriptions}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      ${stats?.monthlyRevenue?.toLocaleString() || '0'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${getHealthColor(stats?.systemHealth || 'unknown')}`}>
                    <Activity className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">System Health</p>
                    <p className="text-2xl font-semibold text-gray-900 capitalize">
                      {stats?.systemHealth || 'Unknown'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quota Usage */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Resource Usage</h3>
              <div className="space-y-4">
                {quotaUsage.map((quota) => (
                  <div key={quota.resource_type} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {quota.resource_type.replace('_', ' ')}
                        </span>
                        <span className={`text-sm font-medium ${getQuotaStatusColor(quota.status)}`}>
                          {quota.current_usage} / {quota.quota_limit || 'Unlimited'}
                        </span>
                      </div>
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            quota.status === 'ok' ? 'bg-green-600' : 
                            quota.status === 'warning' ? 'bg-yellow-600' : 'bg-red-600'
                          }`}
                          style={{ width: `${Math.min(quota.percentage_used, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {stats?.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4">
                    <div className={`p-2 rounded-full ${
                      activity.status === 'success' ? 'bg-green-50' :
                      activity.status === 'warning' ? 'bg-yellow-50' : 'bg-red-50'
                    }`}>
                      {activity.status === 'success' ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : activity.status === 'warning' ? (
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'features' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Feature Flags</h3>
            <div className="space-y-4">
              {Object.entries(featureFlags).map(([name, flag]) => (
                <div key={name} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${
                      flag.enabled ? 'bg-green-500' : 'bg-gray-300'
                    }`}></div>
                    <div>
                      <h4 className="font-medium text-gray-900">{name}</h4>
                      <p className="text-sm text-gray-500">
                        {flag.enabled ? 'Enabled' : 'Disabled'} • {flag.rollout_percentage}% rollout
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-800 text-sm">
                      Edit
                    </button>
                    <button className="text-gray-600 hover:text-gray-800 text-sm">
                      Settings
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add other tab content as needed */}
        {(activeTab === 'users' || activeTab === 'billing' || activeTab === 'system') && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center py-12">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-64 mx-auto"></div>
              </div>
              <p className="text-gray-500 mt-4">This section is under development</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard