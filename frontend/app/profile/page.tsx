'use client'

import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useGlobalState } from '@/app/providers-simple'
import { 
  UserIcon, 
  EnvelopeIcon, 
  BuildingOfficeIcon, 
  CalendarIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

export default function ProfilePage() {
  const { user } = useAuth()
  const { notifications } = useGlobalState()
  const [activeTab, setActiveTab] = useState('overview')

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'activity', name: 'Activity', icon: ClockIcon },
    { id: 'permissions', name: 'Permissions', icon: ShieldCheckIcon },
    { id: 'settings', name: 'Settings', icon: Cog6ToothIcon }
  ]

  const recentActivity = [
    { 
      action: 'Created new bid', 
      target: 'BID-2024-156', 
      time: '2 hours ago',
      type: 'bidding',
      icon: ChartBarIcon
    },
    { 
      action: 'Updated asset settings', 
      target: 'Solar Farm A', 
      time: '4 hours ago',
      type: 'assets',
      icon: UserIcon
    },
    { 
      action: 'Downloaded report', 
      target: 'Weekly Performance Report', 
      time: '1 day ago',
      type: 'reports',
      icon: ChartBarIcon
    },
    { 
      action: 'Changed password', 
      target: 'Account Security', 
      time: '3 days ago',
      type: 'security',
      icon: ShieldCheckIcon
    }
  ]

  const permissions = [
    { name: 'View Assets', granted: true, description: 'View asset information and performance data' },
    { name: 'Manage Assets', granted: false, description: 'Create, edit, and delete assets' },
    { name: 'Create Bids', granted: true, description: 'Submit new bids to energy markets' },
    { name: 'Bid Management', granted: true, description: 'Edit and manage existing bids' },
    { name: 'View Analytics', granted: true, description: 'Access advanced analytics and reports' },
    { name: 'User Management', granted: false, description: 'Manage user accounts and permissions' },
    { name: 'System Configuration', granted: false, description: 'Configure system settings' },
    { name: 'API Access', granted: true, description: 'Access platform APIs programmatically' }
  ]

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'bidding': return '📊'
      case 'assets': return '⚡'
      case 'reports': return '📄'
      case 'security': return '🔒'
      default: return '⚙️'
    }
  }

  const stats = {
    totalBids: 1247,
    acceptedBids: 1089,
    totalRevenue: 2456789.50,
    assetsManaged: 48,
    daysActive: 156,
    avgPerformance: 94.7
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-6">
          {/* Avatar */}
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
            <span className="text-3xl font-bold text-white">
              {user?.name?.charAt(0) || 'U'}
            </span>
          </div>
          
          {/* User Info */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {user?.name || 'User Name'}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {user?.role || 'Energy Trader'}
            </p>
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center">
                <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                {user?.organization || 'Organization'}
              </div>
              <div className="flex items-center">
                <EnvelopeIcon className="h-4 w-4 mr-1" />
                {user?.email || 'email@example.com'}
              </div>
              <div className="flex items-center">
                <CalendarIcon className="h-4 w-4 mr-1" />
                Member since Jan 2024
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col space-y-2">
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
              Edit Profile
            </button>
            <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              View Settings
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20">
              <ChartBarIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Bids</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {stats.totalBids.toLocaleString()}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                {((stats.acceptedBids / stats.totalBids) * 100).toFixed(1)}% acceptance rate
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/20">
              <UserIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Assets Managed</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {stats.assetsManaged}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Across all regions
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/20">
              <CalendarIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Days Active</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {stats.daysActive}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Platform member
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              )
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance Summary</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Revenue Generated</h4>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      ${stats.totalRevenue.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">This year</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Average Performance</h4>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {stats.avgPerformance}%
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Last 30 days</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Achievements</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border border-yellow-200 dark:border-yellow-800 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                    <div className="text-2xl mb-2">🏆</div>
                    <h4 className="font-medium text-yellow-800 dark:text-yellow-200">Top Trader</h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">March 2024</p>
                  </div>
                  <div className="p-4 border border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                    <div className="text-2xl mb-2">📈</div>
                    <h4 className="font-medium text-blue-800 dark:text-blue-200">High Performance</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">95% bid acceptance</p>
                  </div>
                  <div className="p-4 border border-green-200 dark:border-green-800 rounded-lg bg-green-50 dark:bg-green-900/20">
                    <div className="text-2xl mb-2">⚡</div>
                    <h4 className="font-medium text-green-800 dark:text-green-200">Asset Expert</h4>
                    <p className="text-sm text-green-700 dark:text-green-300">50+ assets managed</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <div className="text-2xl">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {activity.action}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {activity.target}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {activity.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Permissions Tab */}
          {activeTab === 'permissions' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Account Permissions</h3>
              <div className="space-y-3">
                {permissions.map((permission, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {permission.name}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {permission.description}
                      </p>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      permission.granted
                        ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                        : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                    }`}>
                      {permission.granted ? 'Granted' : 'Denied'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Notification Preferences</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Manage your notification settings
                  </p>
                  <button className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors">
                    Configure
                  </button>
                </div>
                <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Privacy Settings</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Control your data privacy
                  </p>
                  <button className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors">
                    Manage
                  </button>
                </div>
                <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">API Access</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Generate and manage API keys
                  </p>
                  <button className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors">
                    View Keys
                  </button>
                </div>
                <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Export Data</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Download your account data
                  </p>
                  <button className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors">
                    Export
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
