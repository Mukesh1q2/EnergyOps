'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { 
  UserCircleIcon, 
  PencilIcon, 
  CheckIcon, 
  XMarkIcon,
  CameraIcon,
  BellIcon,
  KeyIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  CalendarDaysIcon,
  Cog6ToothIcon,
  ArrowTopRightOnSquareIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

const ProfilePage = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    firstName: user?.firstName || 'John',
    lastName: user?.lastName || 'Doe',
    email: user?.email || 'john.doe@energycorp.com',
    phone: '+91 9876543210',
    organization: 'Energy Corp India',
    role: 'Energy Analyst',
    bio: 'Experienced energy analyst with 8+ years in renewable energy trading and optimization.',
    location: 'New Delhi, India',
    timezone: 'Asia/Kolkata',
    language: 'en',
    avatar: null
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsAlerts: false,
    weeklyReports: true,
    marketingEmails: false,
    priceAlerts: true,
    marketUpdates: true,
    tradingRecommendations: true
  });

  const [security, setSecurity] = useState({
    twoFactorEnabled: true,
    lastPasswordChange: '2024-11-15',
    activeDevices: 3,
    loginAlerts: true,
    biometricEnabled: false
  });

  const handleSave = () => {
    setIsEditing(false);
    // Handle save logic here
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePreferenceChange = (key: string, value: boolean) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const handleSecurityChange = (key: string, value: any) => {
    setSecurity(prev => ({ ...prev, [key]: value }));
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserCircleIcon },
    { id: 'preferences', name: 'Preferences', icon: Cog6ToothIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'activity', name: 'Activity', icon: ChartBarIcon },
  ];

  const profileStats = [
    { label: 'Account Created', value: 'Jan 2024', icon: CalendarDaysIcon },
    { label: 'Total Logins', value: '1,247', icon: UserCircleIcon },
    { label: 'Devices Connected', value: security.activeDevices.toString(), icon: PhoneIcon },
    { label: 'Two-Factor Auth', value: security.twoFactorEnabled ? 'Enabled' : 'Disabled', icon: KeyIcon }
  ];

  const recentActivity = [
    { action: 'Logged in from Mumbai, India', time: '2 hours ago', type: 'login' },
    { action: 'Updated energy portfolio settings', time: '1 day ago', type: 'update' },
    { action: 'Changed password', time: '3 days ago', type: 'security' },
    { action: 'Enabled 2FA authentication', time: '1 week ago', type: 'security' },
    { action: 'Updated notification preferences', time: '2 weeks ago', type: 'update' },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login': return <UserCircleIcon className="h-4 w-4 text-green-500" />;
      case 'security': return <ShieldCheckIcon className="h-4 w-4 text-blue-500" />;
      case 'update': return <Cog6ToothIcon className="h-4 w-4 text-purple-500" />;
      default: return <ChartBarIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation Header */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-blue-600 hover:text-blue-700">
                ← Back to Dashboard
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                  isEditing 
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                {isEditing ? 'Cancel Editing' : 'Edit Profile'}
              </button>
              {isEditing && (
                <button
                  onClick={handleSave}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  <CheckIcon className="h-4 w-4 mr-2" />
                  Save Changes
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                {formData.firstName[0]}{formData.lastName[0]}
              </div>
              {isEditing && (
                <button className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:bg-gray-50">
                  <CameraIcon className="h-4 w-4 text-gray-600" />
                </button>
              )}
              <div className="absolute -bottom-2 -right-2 bg-green-400 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                {isEditing ? (
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="text-2xl font-bold border-b border-gray-300 bg-transparent focus:outline-none focus:border-blue-500"
                    />
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="text-2xl font-bold border-b border-gray-300 bg-transparent focus:outline-none focus:border-blue-500"
                    />
                  </div>
                ) : (
                  <h1 className="text-3xl font-bold text-gray-900">
                    {formData.firstName} {formData.lastName}
                  </h1>
                )}
                <div className="flex items-center space-x-1 text-green-600">
                  <EyeIcon className="h-4 w-4" />
                  <span className="text-sm font-medium">Active</span>
                </div>
              </div>
              
              {isEditing ? (
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  className="text-lg text-gray-600 border-b border-gray-300 bg-transparent focus:outline-none focus:border-blue-500 mb-2"
                />
              ) : (
                <p className="text-lg text-gray-600 mb-2">{formData.role}</p>
              )}

              {isEditing ? (
                <textarea
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  rows={3}
                  className="w-full text-gray-700 border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-700 mb-4">{formData.bio}</p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <EnvelopeIcon className="h-4 w-4 mr-1" />
                  {isEditing ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="border-b border-gray-300 bg-transparent focus:outline-none focus:border-blue-500"
                    />
                  ) : (
                    formData.email
                  )}
                </div>
                <div className="flex items-center">
                  <PhoneIcon className="h-4 w-4 mr-1" />
                  {isEditing ? (
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="border-b border-gray-300 bg-transparent focus:outline-none focus:border-blue-500"
                    />
                  ) : (
                    formData.phone
                  )}
                </div>
                <div className="flex items-center">
                  <MapPinIcon className="h-4 w-4 mr-1" />
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="border-b border-gray-300 bg-transparent focus:outline-none focus:border-blue-500"
                    />
                  ) : (
                    formData.location
                  )}
                </div>
              </div>
            </div>

            {/* Profile Stats */}
            <div className="grid grid-cols-2 gap-4">
              {profileStats.map((stat, index) => (
                <div key={stat.label} className="text-center p-4 bg-gray-50 rounded-lg">
                  <stat.icon className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-xs text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-8">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Organization Details</h3>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Organization
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={formData.organization}
                            onChange={(e) => handleInputChange('organization', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                          />
                        ) : (
                          <p className="text-gray-900">{formData.organization}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Timezone
                        </label>
                        {isEditing ? (
                          <select
                            value={formData.timezone}
                            onChange={(e) => handleInputChange('timezone', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                          >
                            <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                            <option value="UTC">UTC</option>
                            <option value="America/New_York">America/New_York (EST)</option>
                            <option value="Europe/London">Europe/London (GMT)</option>
                          </select>
                        ) : (
                          <p className="text-gray-900">{formData.timezone}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Language
                        </label>
                        {isEditing ? (
                          <select
                            value={formData.language}
                            onChange={(e) => handleInputChange('language', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                          >
                            <option value="en">English</option>
                            <option value="hi">हिंदी</option>
                            <option value="es">Español</option>
                            <option value="fr">Français</option>
                          </select>
                        ) : (
                          <p className="text-gray-900">English</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        {getActivityIcon(activity.type)}
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                          <p className="text-xs text-gray-500">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
                  <div className="space-y-4">
                    {[
                      { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive updates via email' },
                      { key: 'pushNotifications', label: 'Push Notifications', desc: 'Get real-time alerts in browser' },
                      { key: 'smsAlerts', label: 'SMS Alerts', desc: 'Important alerts via SMS' },
                      { key: 'weeklyReports', label: 'Weekly Reports', desc: 'Weekly performance summaries' },
                      { key: 'marketingEmails', label: 'Marketing Emails', desc: 'Product updates and promotions' },
                      { key: 'priceAlerts', label: 'Price Alerts', desc: 'Energy price change notifications' },
                      { key: 'marketUpdates', label: 'Market Updates', desc: 'Industry news and trends' },
                      { key: 'tradingRecommendations', label: 'Trading Recommendations', desc: 'AI-powered trading suggestions' },
                    ].map((pref) => (
                      <div key={pref.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">{pref.label}</h4>
                          <p className="text-sm text-gray-600">{pref.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={preferences[pref.key as keyof typeof preferences]}
                            onChange={(e) => handlePreferenceChange(pref.key, e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h3>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                        <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          security.twoFactorEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {security.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                          Configure
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">Password</h4>
                        <p className="text-sm text-gray-600">Last changed: {security.lastPasswordChange}</p>
                      </div>
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
                        Change Password
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">Login Alerts</h4>
                        <p className="text-sm text-gray-600">Get notified of new login attempts</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={security.loginAlerts}
                          onChange={(e) => handleSecurityChange('loginAlerts', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">Biometric Authentication</h4>
                        <p className="text-sm text-gray-600">Use fingerprint or face recognition</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={security.biometricEnabled}
                          onChange={(e) => handleSecurityChange('biometricEnabled', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Devices</h3>
                  <div className="space-y-3">
                    {[
                      { device: 'Chrome on Windows', location: 'Mumbai, India', lastActive: 'Now', current: true },
                      { device: 'Safari on iPhone', location: 'New Delhi, India', lastActive: '2 hours ago', current: false },
                      { device: 'Mobile App on Android', location: 'Bangalore, India', lastActive: '1 day ago', current: false },
                    ].map((device, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <PhoneIcon className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{device.device}</h4>
                            <p className="text-sm text-gray-600">{device.location} • {device.lastActive}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {device.current && (
                            <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                              Current
                            </span>
                          )}
                          <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                            Revoke
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Activity</h3>
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">Login History</h4>
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                          Export Data
                        </button>
                      </div>
                    </div>
                    <div className="divide-y divide-gray-200">
                      {[
                        { action: 'Successful login', ip: '192.168.1.100', location: 'Mumbai, India', time: '2 hours ago', status: 'success' },
                        { action: 'Password changed', ip: '192.168.1.100', location: 'Mumbai, India', time: '3 days ago', status: 'info' },
                        { action: 'Failed login attempt', ip: '203.45.67.89', location: 'Unknown', time: '1 week ago', status: 'warning' },
                        { action: 'Two-factor authentication enabled', ip: '192.168.1.100', location: 'Mumbai, India', time: '2 weeks ago', status: 'info' },
                      ].map((activity, index) => (
                        <div key={index} className="p-4 flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-2 h-2 rounded-full ${
                              activity.status === 'success' ? 'bg-green-500' :
                              activity.status === 'warning' ? 'bg-yellow-500' :
                              'bg-blue-500'
                            }`}></div>
                            <div>
                              <p className="font-medium text-gray-900">{activity.action}</p>
                              <p className="text-sm text-gray-600">{activity.ip} • {activity.location}</p>
                            </div>
                          </div>
                          <span className="text-sm text-gray-500">{activity.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Export</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <ArrowTopRightOnSquareIcon className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                      <h4 className="font-medium text-gray-900 mb-1">Account Data</h4>
                      <p className="text-sm text-gray-600">Download your account information</p>
                    </button>
                    <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <ArrowTopRightOnSquareIcon className="h-6 w-6 text-green-600 mx-auto mb-2" />
                      <h4 className="font-medium text-gray-900 mb-1">Activity Log</h4>
                      <p className="text-sm text-gray-600">Export your complete activity history</p>
                    </button>
                    <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <ArrowTopRightOnSquareIcon className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                      <h4 className="font-medium text-gray-900 mb-1">Trading Data</h4>
                      <p className="text-sm text-gray-600">Download your trading records</p>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;