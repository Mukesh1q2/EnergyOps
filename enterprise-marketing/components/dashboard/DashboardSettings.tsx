'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  XMarkIcon,
  AdjustmentsHorizontalIcon,
  PaintBrushIcon,
  ShieldCheckIcon,
  ClockIcon,
  EyeIcon,
  BellIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  LanguageIcon,
  CurrencyDollarIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import { Dialog, Transition, Tab } from '@headlessui/react'
import { Fragment } from 'react'
import { clsx } from 'clsx'

interface DashboardSettingsProps {
  isOpen: boolean
  onClose: () => void
  dashboardData: any
  onUpdate: (updates: any) => void
}

const THEMES = [
  { id: 'light', name: 'Light', description: 'Clean and bright interface' },
  { id: 'dark', name: 'Dark', description: 'Easy on the eyes' },
  { id: 'auto', name: 'System', description: 'Follows system preference' }
]

const LANGUAGES = [
  { id: 'en', name: 'English', flag: '🇺🇸' },
  { id: 'es', name: 'Spanish', flag: '🇪🇸' },
  { id: 'fr', name: 'French', flag: '🇫🇷' },
  { id: 'de', name: 'German', flag: '🇩🇪' }
]

const TIMEZONES = [
  { id: 'America/New_York', name: 'Eastern Time (ET)' },
  { id: 'America/Chicago', name: 'Central Time (CT)' },
  { id: 'America/Denver', name: 'Mountain Time (MT)' },
  { id: 'America/Los_Angeles', name: 'Pacific Time (PT)' },
  { id: 'UTC', name: 'UTC' }
]

const CURRENCIES = [
  { id: 'USD', name: 'US Dollar', symbol: '$' },
  { id: 'EUR', name: 'Euro', symbol: '€' },
  { id: 'GBP', name: 'British Pound', symbol: '£' },
  { id: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { id: 'INR', name: 'Indian Rupee', symbol: '₹' }
]

const AUTO_REFRESH_INTERVALS = [
  { id: '30s', name: '30 seconds' },
  { id: '1m', name: '1 minute' },
  { id: '5m', name: '5 minutes' },
  { id: '15m', name: '15 minutes' },
  { id: '30m', name: '30 minutes' },
  { id: '1h', name: '1 hour' },
  { id: 'off', name: 'Never' }
]

export function DashboardSettings({ isOpen, onClose, dashboardData, onUpdate }: DashboardSettingsProps) {
  const [settings, setSettings] = useState({
    name: dashboardData?.name || 'My Dashboard',
    description: dashboardData?.description || '',
    theme: dashboardData?.theme || 'light',
    language: 'en',
    timezone: 'America/New_York',
    currency: 'USD',
    autoRefresh: '5m',
    notifications: {
      email: true,
      push: false,
      sound: true,
      desktop: true
    },
    privacy: {
      shareable: false,
      publicView: false,
      teamCollaboration: true
    },
    performance: {
      lazyLoading: true,
      animationLevel: 'medium',
      dataCompression: true,
      cacheTimeout: '1h'
    },
    accessibility: {
      highContrast: false,
      reducedMotion: false,
      fontSize: 'medium',
      screenReader: false
    }
  })

  const [activeTab, setActiveTab] = useState('general')

  const handleSettingChange = (path: string, value: any) => {
    setSettings(prev => {
      const keys = path.split('.')
      const newSettings = { ...prev }
      let current = newSettings
      
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] }
        current = current[keys[i]]
      }
      
      current[keys[keys.length - 1]] = value
      return newSettings
    })
  }

  const handleSave = () => {
    onUpdate(settings)
    onClose()
  }

  const handleReset = () => {
    setSettings({
      name: dashboardData?.name || 'My Dashboard',
      description: dashboardData?.description || '',
      theme: dashboardData?.theme || 'light',
      language: 'en',
      timezone: 'America/New_York',
      currency: 'USD',
      autoRefresh: '5m',
      notifications: {
        email: true,
        push: false,
        sound: true,
        desktop: true
      },
      privacy: {
        shareable: false,
        publicView: false,
        teamCollaboration: true
      },
      performance: {
        lazyLoading: true,
        animationLevel: 'medium',
        dataCompression: true,
        cacheTimeout: '1h'
      },
      accessibility: {
        highContrast: false,
        reducedMotion: false,
        fontSize: 'medium',
        screenReader: false
      }
    })
  }

  const tabs = [
    { id: 'general', name: 'General', icon: AdjustmentsHorizontalIcon },
    { id: 'appearance', name: 'Appearance', icon: PaintBrushIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'privacy', name: 'Privacy', icon: ShieldCheckIcon },
    { id: 'performance', name: 'Performance', icon: SparklesIcon },
    { id: 'accessibility', name: 'Accessibility', icon: EyeIcon }
  ]

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <AdjustmentsHorizontalIcon className="h-6 w-6 text-blue-500" />
                    <div>
                      <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-white">
                        Dashboard Settings
                      </Dialog.Title>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Customize your dashboard experience
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="flex h-[600px]">
                  {/* Sidebar */}
                  <div className="w-64 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <nav className="p-4 space-y-2">
                      {tabs.map(tab => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={clsx(
                            'w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                            activeTab === tab.id
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                          )}
                        >
                          <tab.icon className="h-5 w-5" />
                          <span>{tab.name}</span>
                        </button>
                      ))}
                    </nav>
                  </div>

                  {/* Content */}
                  <div className="flex-1 overflow-y-auto p-6">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                      >
                        {/* General Settings */}
                        {activeTab === 'general' && (
                          <div className="space-y-6">
                            <div>
                              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                General Settings
                              </h3>
                              
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Dashboard Name
                                  </label>
                                  <input
                                    type="text"
                                    value={settings.name}
                                    onChange={(e) => handleSettingChange('name', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter dashboard name"
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Description
                                  </label>
                                  <textarea
                                    value={settings.description}
                                    onChange={(e) => handleSettingChange('description', e.target.value)}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter dashboard description"
                                  />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                      Language
                                    </label>
                                    <select
                                      value={settings.language}
                                      onChange={(e) => handleSettingChange('language', e.target.value)}
                                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                                    >
                                      {LANGUAGES.map(lang => (
                                        <option key={lang.id} value={lang.id}>
                                          {lang.flag} {lang.name}
                                        </option>
                                      ))}
                                    </select>
                                  </div>

                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                      Timezone
                                    </label>
                                    <select
                                      value={settings.timezone}
                                      onChange={(e) => handleSettingChange('timezone', e.target.value)}
                                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                                    >
                                      {TIMEZONES.map(tz => (
                                        <option key={tz.id} value={tz.id}>
                                          {tz.name}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Default Currency
                                  </label>
                                  <select
                                    value={settings.currency}
                                    onChange={(e) => handleSettingChange('currency', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                                  >
                                    {CURRENCIES.map(curr => (
                                      <option key={curr.id} value={curr.id}>
                                        {curr.symbol} {curr.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Auto Refresh Interval
                                  </label>
                                  <select
                                    value={settings.autoRefresh}
                                    onChange={(e) => handleSettingChange('autoRefresh', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                                  >
                                    {AUTO_REFRESH_INTERVALS.map(interval => (
                                      <option key={interval.id} value={interval.id}>
                                        {interval.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Appearance Settings */}
                        {activeTab === 'appearance' && (
                          <div className="space-y-6">
                            <div>
                              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                Appearance
                              </h3>
                              
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    Theme
                                  </label>
                                  <div className="grid grid-cols-1 gap-3">
                                    {THEMES.map(theme => (
                                      <label key={theme.id} className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <input
                                          type="radio"
                                          name="theme"
                                          value={theme.id}
                                          checked={settings.theme === theme.id}
                                          onChange={(e) => handleSettingChange('theme', e.target.value)}
                                          className="text-blue-600 focus:ring-blue-500"
                                        />
                                        <div className="flex-1">
                                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                                            {theme.name}
                                          </div>
                                          <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {theme.description}
                                          </div>
                                        </div>
                                      </label>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Notifications Settings */}
                        {activeTab === 'notifications' && (
                          <div className="space-y-6">
                            <div>
                              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                Notifications
                              </h3>
                              
                              <div className="space-y-4">
                                {Object.entries(settings.notifications).map(([key, value]) => (
                                  <div key={key} className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                      {key === 'email' && <BellIcon className="h-5 w-5 text-gray-400" />}
                                      {key === 'push' && <DevicePhoneMobileIcon className="h-5 w-5 text-gray-400" />}
                                      {key === 'sound' && <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.773L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.797-3.773a1 1 0 011.617-.773zM15.854 6.146a1 1 0 011.414 0 5 5 0 010 7.071 1 1 0 01-1.414-1.414 3 3 0 000-4.243 1 1 0 010-1.414z" clipRule="evenodd" /></svg>}
                                      {key === 'desktop' && <ComputerDesktopIcon className="h-5 w-5 text-gray-400" />}
                                      <div>
                                        <div className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                                          {key} Notifications
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                          Receive notifications via {key}
                                        </div>
                                      </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={value}
                                        onChange={(e) => handleSettingChange(`notifications.${key}`, e.target.checked)}
                                        className="sr-only peer"
                                      />
                                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Privacy Settings */}
                        {activeTab === 'privacy' && (
                          <div className="space-y-6">
                            <div>
                              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                Privacy & Sharing
                              </h3>
                              
                              <div className="space-y-4">
                                {Object.entries(settings.privacy).map(([key, value]) => (
                                  <div key={key} className="flex items-center justify-between">
                                    <div>
                                      <div className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                                        {key.replace(/([A-Z])/g, ' $1').trim()}
                                      </div>
                                      <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {key === 'shareable' && 'Allow others to access this dashboard'}
                                        {key === 'publicView' && 'Make this dashboard publicly viewable'}
                                        {key === 'teamCollaboration' && 'Enable real-time collaboration features'}
                                      </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={value}
                                        onChange={(e) => handleSettingChange(`privacy.${key}`, e.target.checked)}
                                        className="sr-only peer"
                                      />
                                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Performance Settings */}
                        {activeTab === 'performance' && (
                          <div className="space-y-6">
                            <div>
                              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                Performance
                              </h3>
                              
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                      Lazy Loading
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      Load widgets only when they become visible
                                    </div>
                                  </div>
                                  <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={settings.performance.lazyLoading}
                                      onChange={(e) => handleSettingChange('performance.lazyLoading', e.target.checked)}
                                      className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                  </label>
                                </div>

                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                      Data Compression
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      Compress dashboard data to improve loading times
                                    </div>
                                  </div>
                                  <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={settings.performance.dataCompression}
                                      onChange={(e) => handleSettingChange('performance.dataCompression', e.target.checked)}
                                      className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                  </label>
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Animation Level
                                  </label>
                                  <select
                                    value={settings.performance.animationLevel}
                                    onChange={(e) => handleSettingChange('performance.animationLevel', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                                  >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Cache Timeout
                                  </label>
                                  <select
                                    value={settings.performance.cacheTimeout}
                                    onChange={(e) => handleSettingChange('performance.cacheTimeout', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                                  >
                                    <option value="15m">15 minutes</option>
                                    <option value="1h">1 hour</option>
                                    <option value="6h">6 hours</option>
                                    <option value="24h">24 hours</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Accessibility Settings */}
                        {activeTab === 'accessibility' && (
                          <div className="space-y-6">
                            <div>
                              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                Accessibility
                              </h3>
                              
                              <div className="space-y-4">
                                {Object.entries(settings.accessibility).map(([key, value]) => (
                                  <div key={key} className="flex items-center justify-between">
                                    <div>
                                      <div className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                                        {key.replace(/([A-Z])/g, ' $1').trim()}
                                      </div>
                                      <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {key === 'highContrast' && 'Increase contrast for better visibility'}
                                        {key === 'reducedMotion' && 'Minimize animations and transitions'}
                                        {key === 'fontSize' && 'Adjust text size for readability'}
                                        {key === 'screenReader' && 'Optimize for screen reader compatibility'}
                                      </div>
                                    </div>
                                    {key === 'fontSize' ? (
                                      <select
                                        value={value}
                                        onChange={(e) => handleSettingChange(`accessibility.${key}`, e.target.value)}
                                        className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                                      >
                                        <option value="small">Small</option>
                                        <option value="medium">Medium</option>
                                        <option value="large">Large</option>
                                      </select>
                                    ) : (
                                      <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                          type="checkbox"
                                          checked={value}
                                          onChange={(e) => handleSettingChange(`accessibility.${key}`, e.target.checked)}
                                          className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                      </label>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                  >
                    Reset to Defaults
                  </button>
                  <div className="flex space-x-3">
                    <button
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}