'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Cog6ToothIcon, 
  BellIcon, 
  GlobeAltIcon,
  ShieldCheckIcon,
  KeyIcon,
  PaintBrushIcon,
  DevicePhoneMobileIcon,
  LanguageIcon,
  ClockIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckIcon,
  XMarkIcon,
  CloudIcon,
  WifiIcon,
  UserGroupIcon,
  ChartBarIcon,
  DocumentTextIcon,
  LinkIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

const SettingsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKey] = useState('opti_1234567890abcdef1234567890abcdef');

  const [settings, setSettings] = useState({
    general: {
      timezone: 'Asia/Kolkata',
      language: 'en',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h',
      theme: 'light',
      currency: 'INR',
      region: 'India'
    },
    notifications: {
      emailEnabled: true,
      pushEnabled: true,
      smsEnabled: false,
      inAppEnabled: true,
      priceAlerts: true,
      systemUpdates: true,
      weeklyReports: true,
      securityAlerts: true,
      marketingEmails: false,
      quietHours: {
        enabled: true,
        start: '22:00',
        end: '08:00'
      }
    },
    privacy: {
      analyticsEnabled: true,
      errorReporting: true,
      performanceTracking: true,
      thirdPartyCookies: false,
      dataRetention: '2years'
    },
    api: {
      rateLimit: 1000,
      corsEnabled: true,
      webhookUrl: 'https://api.energycorp.com/webhooks',
      timeout: 30
    },
    integrations: {
      tradingPlatforms: ['NASDAQ', 'NSE', 'BSE'],
      weatherAPIs: ['OpenWeather', 'WeatherAPI'],
      newsFeeds: ['Reuters', 'Bloomberg'],
      calendarIntegration: true,
      slackIntegration: false,
      teamsIntegration: true
    }
  });

  const handleSettingChange = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value
      }
    }));
  };

  const handleNestedSettingChange = (category: string, subKey: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [subKey]: {
          ...(prev[category as keyof typeof prev] as any)[subKey],
          [key]: value
        }
      }
    }));
  };

  const tabs = [
    { id: 'general', name: 'General', icon: Cog6ToothIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'privacy', name: 'Privacy & Security', icon: ShieldCheckIcon },
    { id: 'api', name: 'API Settings', icon: KeyIcon },
    { id: 'integrations', name: 'Integrations', icon: LinkIcon },
    { id: 'appearance', name: 'Appearance', icon: PaintBrushIcon }
  ];

  const quickStats = [
    { label: 'API Calls Today', value: '1,247', change: '+12%', icon: ChartBarIcon },
    { label: 'Active Integrations', value: settings.integrations.tradingPlatforms.length.toString(), change: '+2', icon: LinkIcon },
    { label: 'Notifications Sent', value: '89', change: '-5%', icon: BellIcon },
    { label: 'System Health', value: '99.9%', change: '0%', icon: CloudIcon }
  ];

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
              <span className="ml-4 text-gray-400">|</span>
              <h1 className="ml-4 text-lg font-semibold text-gray-900">Settings</h1>
            </div>
            <div className="flex items-center space-x-3">
              <button className="flex items-center px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                <ArrowPathIcon className="h-4 w-4 mr-2" />
                Reset to Defaults
              </button>
              <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <CheckIcon className="h-4 w-4 mr-2" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Settings Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-6 lg:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Settings</h1>
              <p className="text-lg text-gray-600">
                Customize your OptiBid experience and manage your preferences
              </p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {quickStats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center p-4 bg-gray-50 rounded-lg"
                >
                  <stat.icon className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <div className="text-xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-xs text-gray-600">{stat.label}</div>
                  <div className={`text-xs mt-1 ${
                    stat.change.startsWith('+') ? 'text-green-600' : 
                    stat.change.startsWith('-') ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    {stat.change}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Settings Content */}
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="h-5 w-5 mr-3" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              {/* General Settings */}
              {activeTab === 'general' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Regional Settings</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Timezone
                        </label>
                        <select
                          value={settings.general.timezone}
                          onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                        >
                          <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                          <option value="UTC">UTC</option>
                          <option value="America/New_York">America/New_York (EST)</option>
                          <option value="Europe/London">Europe/London (GMT)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Language
                        </label>
                        <select
                          value={settings.general.language}
                          onChange={(e) => handleSettingChange('general', 'language', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                        >
                          <option value="en">English</option>
                          <option value="hi">हिंदी</option>
                          <option value="es">Español</option>
                          <option value="fr">Français</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date Format
                        </label>
                        <select
                          value={settings.general.dateFormat}
                          onChange={(e) => handleSettingChange('general', 'dateFormat', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                        >
                          <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                          <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Time Format
                        </label>
                        <select
                          value={settings.general.timeFormat}
                          onChange={(e) => handleSettingChange('general', 'timeFormat', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                        >
                          <option value="24h">24 Hour</option>
                          <option value="12h">12 Hour (AM/PM)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Currency
                        </label>
                        <select
                          value={settings.general.currency}
                          onChange={(e) => handleSettingChange('general', 'currency', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                        >
                          <option value="INR">₹ Indian Rupee (INR)</option>
                          <option value="USD">$ US Dollar (USD)</option>
                          <option value="EUR">€ Euro (EUR)</option>
                          <option value="GBP">£ British Pound (GBP)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Region
                        </label>
                        <select
                          value={settings.general.region}
                          onChange={(e) => handleSettingChange('general', 'region', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                        >
                          <option value="India">India</option>
                          <option value="North America">North America</option>
                          <option value="Europe">Europe</option>
                          <option value="Asia Pacific">Asia Pacific</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Notifications Settings */}
              {activeTab === 'notifications' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Notification Channels</h3>
                    <div className="space-y-4">
                      {[
                        { key: 'emailEnabled', label: 'Email Notifications', desc: 'Receive updates via email' },
                        { key: 'pushEnabled', label: 'Push Notifications', desc: 'Browser and mobile push alerts' },
                        { key: 'smsEnabled', label: 'SMS Notifications', desc: 'Critical alerts via SMS' },
                        { key: 'inAppEnabled', label: 'In-App Notifications', desc: 'Notifications within the platform' },
                      ].map((notification) => (
                        <div key={notification.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <h4 className="font-medium text-gray-900">{notification.label}</h4>
                            <p className="text-sm text-gray-600">{notification.desc}</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.notifications[notification.key as keyof typeof settings.notifications] as boolean}
                              onChange={(e) => handleSettingChange('notifications', notification.key, e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Notification Types</h3>
                    <div className="space-y-4">
                      {[
                        { key: 'priceAlerts', label: 'Price Alerts', desc: 'Energy price change notifications' },
                        { key: 'systemUpdates', label: 'System Updates', desc: 'Platform maintenance and updates' },
                        { key: 'weeklyReports', label: 'Weekly Reports', desc: 'Performance summaries and insights' },
                        { key: 'securityAlerts', label: 'Security Alerts', desc: 'Account security notifications' },
                        { key: 'marketingEmails', label: 'Marketing Emails', desc: 'Product updates and promotions' },
                      ].map((type) => (
                        <div key={type.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <h4 className="font-medium text-gray-900">{type.label}</h4>
                            <p className="text-sm text-gray-600">{type.desc}</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.notifications[type.key as keyof typeof settings.notifications] as boolean}
                              onChange={(e) => handleSettingChange('notifications', type.key, e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Quiet Hours</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">Enable Quiet Hours</h4>
                          <p className="text-sm text-gray-600">Pause notifications during specified hours</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.notifications.quietHours.enabled}
                            onChange={(e) => handleNestedSettingChange('notifications', 'quietHours', 'enabled', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      {settings.notifications.quietHours.enabled && (
                        <div className="grid md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                            <input
                              type="time"
                              value={settings.notifications.quietHours.start}
                              onChange={(e) => handleNestedSettingChange('notifications', 'quietHours', 'start', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                            <input
                              type="time"
                              value={settings.notifications.quietHours.end}
                              onChange={(e) => handleNestedSettingChange('notifications', 'quietHours', 'end', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Privacy & Security Settings */}
              {activeTab === 'privacy' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Data Collection</h3>
                    <div className="space-y-4">
                      {[
                        { key: 'analyticsEnabled', label: 'Analytics Data', desc: 'Help us improve the platform' },
                        { key: 'errorReporting', label: 'Error Reports', desc: 'Automatically report technical issues' },
                        { key: 'performanceTracking', label: 'Performance Tracking', desc: 'Monitor platform performance' },
                        { key: 'thirdPartyCookies', label: 'Third-party Cookies', desc: 'Allow analytics and marketing cookies' },
                      ].map((privacy) => (
                        <div key={privacy.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <h4 className="font-medium text-gray-900">{privacy.label}</h4>
                            <p className="text-sm text-gray-600">{privacy.desc}</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.privacy[privacy.key as keyof typeof settings.privacy] as boolean}
                              onChange={(e) => handleSettingChange('privacy', privacy.key, e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Data Retention</h3>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        How long should we keep your data?
                      </label>
                      <select
                        value={settings.privacy.dataRetention}
                        onChange={(e) => handleSettingChange('privacy', 'dataRetention', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      >
                        <option value="1year">1 Year</option>
                        <option value="2years">2 Years</option>
                        <option value="5years">5 Years</option>
                        <option value="indefinite">Indefinite</option>
                      </select>
                      <p className="text-sm text-gray-600 mt-2">
                        You can request data deletion at any time by contacting support.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* API Settings */}
              {activeTab === 'api' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">API Key</h3>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your API Key
                      </label>
                      <div className="flex items-center space-x-3">
                        <div className="flex-1 relative">
                          <input
                            type={showApiKey ? "text" : "password"}
                            value={apiKey}
                            readOnly
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white pr-10"
                          />
                          <button
                            onClick={() => setShowApiKey(!showApiKey)}
                            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                          >
                            {showApiKey ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                          </button>
                        </div>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                          Regenerate
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        Keep your API key secure. Regenerating will invalidate the old key.
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">API Configuration</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Rate Limit (requests/hour)
                        </label>
                        <input
                          type="number"
                          value={settings.api.rateLimit}
                          onChange={(e) => handleSettingChange('api', 'rateLimit', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Timeout (seconds)
                        </label>
                        <input
                          type="number"
                          value={settings.api.timeout}
                          onChange={(e) => handleSettingChange('api', 'timeout', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Webhook URL
                        </label>
                        <input
                          type="url"
                          value={settings.api.webhookUrl}
                          onChange={(e) => handleSettingChange('api', 'webhookUrl', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <h4 className="font-medium text-gray-900">CORS Enabled</h4>
                            <p className="text-sm text-gray-600">Allow cross-origin requests from your applications</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.api.corsEnabled}
                              onChange={(e) => handleSettingChange('api', 'corsEnabled', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Integrations Settings */}
              {activeTab === 'integrations' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Trading Platforms</h3>
                    <div className="space-y-3">
                      {['NASDAQ', 'NSE', 'BSE', 'NYSE'].map((platform) => (
                        <div key={platform} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <ChartBarIcon className="h-5 w-5 text-blue-600" />
                            <span className="font-medium text-gray-900">{platform}</span>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.integrations.tradingPlatforms.includes(platform)}
                              onChange={(e) => {
                                const platforms = e.target.checked
                                  ? [...settings.integrations.tradingPlatforms, platform]
                                  : settings.integrations.tradingPlatforms.filter(p => p !== platform);
                                handleSettingChange('integrations', 'tradingPlatforms', platforms);
                              }}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">External Services</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <WifiIcon className="h-5 w-5 text-green-600" />
                          <div>
                            <h4 className="font-medium text-gray-900">Calendar Integration</h4>
                            <p className="text-sm text-gray-600">Sync with Google Calendar</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.integrations.calendarIntegration}
                            onChange={(e) => handleSettingChange('integrations', 'calendarIntegration', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <UserGroupIcon className="h-5 w-5 text-purple-600" />
                          <div>
                            <h4 className="font-medium text-gray-900">Microsoft Teams</h4>
                            <p className="text-sm text-gray-600">Team collaboration</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.integrations.teamsIntegration}
                            onChange={(e) => handleSettingChange('integrations', 'teamsIntegration', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Appearance Settings */}
              {activeTab === 'appearance' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Theme Settings</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-4">
                          Color Theme
                        </label>
                        <div className="space-y-3">
                          {[
                            { value: 'light', label: 'Light', preview: 'bg-white border border-gray-300' },
                            { value: 'dark', label: 'Dark', preview: 'bg-gray-800' },
                            { value: 'blue', label: 'Blue', preview: 'bg-blue-600' },
                            { value: 'auto', label: 'System', preview: 'bg-gradient-to-r from-white to-gray-800' },
                          ].map((theme) => (
                            <label key={theme.value} className="flex items-center space-x-3 cursor-pointer">
                              <input
                                type="radio"
                                name="theme"
                                value={theme.value}
                                checked={settings.general.theme === theme.value}
                                onChange={(e) => handleSettingChange('general', 'theme', e.target.value)}
                                className="text-blue-600 focus:ring-blue-500"
                              />
                              <div className={`w-6 h-6 rounded ${theme.preview}`}></div>
                              <span className="text-sm font-medium text-gray-700">{theme.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;