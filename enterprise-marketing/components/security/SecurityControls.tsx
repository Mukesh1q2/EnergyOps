'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ShieldCheckIcon,
  DevicePhoneMobileIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  LockClosedIcon,
  GlobeAltIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline'

interface SecurityControlsProps {
  userId: string
  onSecurityUpdate?: (data: any) => void
}

interface SecuritySession {
  id: string
  device: string
  location: string
  ipAddress: string
  lastActivity: string
  isCurrent: boolean
}

interface SecurityEvent {
  id: string
  type: 'login' | 'logout' | 'password_change' | 'mfa_setup' | 'failed_login' | 'suspicious_activity'
  timestamp: string
  device: string
  location: string
  ipAddress: string
  status: 'success' | 'failed' | 'warning'
}

export function SecurityControls({ userId, onSecurityUpdate }: SecurityControlsProps) {
  const [activeTab, setActiveTab] = useState('sessions')
  const [sessions, setSessions] = useState<SecuritySession[]>([])
  const [events, setEvents] = useState<SecurityEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    sessionTimeout: 3600, // 1 hour in seconds
    loginNotifications: true,
    deviceVerification: true,
    geoBlocking: false,
    allowedCountries: [] as string[]
  })

  useEffect(() => {
    loadSecurityData()
  }, [userId])

  const loadSecurityData = async () => {
    setLoading(true)
    try {
      const [sessionsRes, eventsRes, settingsRes] = await Promise.all([
        fetch(`/api/security/sessions/${userId}`),
        fetch(`/api/security/events/${userId}`),
        fetch(`/api/security/settings/${userId}`)
      ])

      const [sessionsData, eventsData, settingsData] = await Promise.all([
        sessionsRes.json(),
        eventsRes.json(),
        settingsRes.json()
      ])

      if (sessionsData.success) setSessions(sessionsData.data)
      if (eventsData.success) setEvents(eventsData.data)
      if (settingsData.success) setSecuritySettings(settingsData.data)
    } catch (error) {
      console.error('Failed to load security data:', error)
    } finally {
      setLoading(false)
    }
  }

  const terminateSession = async (sessionId: string) => {
    try {
      const response = await fetch('/api/security/sessions/terminate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, sessionId })
      })

      const data = await response.json()
      if (data.success) {
        setSessions(sessions.filter(s => s.id !== sessionId))
      }
    } catch (error) {
      console.error('Failed to terminate session:', error)
    }
  }

  const updateSecuritySettings = async (newSettings: any) => {
    try {
      const response = await fetch('/api/security/settings/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, settings: newSettings })
      })

      const data = await response.json()
      if (data.success) {
        setSecuritySettings(newSettings)
        onSecurityUpdate?.(newSettings)
      }
    } catch (error) {
      console.error('Failed to update security settings:', error)
    }
  }

  const tabs = [
    { id: 'sessions', name: 'Active Sessions', icon: DevicePhoneMobileIcon },
    { id: 'events', name: 'Security Events', icon: ClockIcon },
    { id: 'settings', name: 'Security Settings', icon: ShieldCheckIcon }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.name}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'sessions' && (
            <ActiveSessionsTab 
              sessions={sessions} 
              onTerminateSession={terminateSession}
              loading={loading}
            />
          )}
          {activeTab === 'events' && (
            <SecurityEventsTab events={events} loading={loading} />
          )}
          {activeTab === 'settings' && (
            <SecuritySettingsTab 
              settings={securitySettings}
              onUpdate={updateSecuritySettings}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function ActiveSessionsTab({ 
  sessions, 
  onTerminateSession, 
  loading 
}: { 
  sessions: SecuritySession[],
  onTerminateSession: (sessionId: string) => void,
  loading: boolean 
}) {
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Active Sessions</h3>
        <div className="text-sm text-gray-500">
          {sessions.length} active session{sessions.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="space-y-3">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between"
          >
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <ComputerDesktopIcon className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="font-medium text-gray-900">{session.device}</h4>
                  {session.isCurrent && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Current Session
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-500 flex items-center space-x-4">
                  <span className="flex items-center">
                    <GlobeAltIcon className="w-3 h-3 mr-1" />
                    {session.location}
                  </span>
                  <span>{session.ipAddress}</span>
                  <span className="flex items-center">
                    <ClockIcon className="w-3 h-3 mr-1" />
                    Last active {formatRelativeTime(session.lastActivity)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onTerminateSession(session.id)}
                disabled={session.isCurrent}
                className="text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                Terminate
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SecurityEventsTab({ events, loading }: { events: SecurityEvent[], loading: boolean }) {
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'login':
      case 'logout':
        return <DevicePhoneMobileIcon className="w-5 h-5" />
      case 'password_change':
        return <LockClosedIcon className="w-5 h-5" />
      case 'mfa_setup':
        return <ShieldCheckIcon className="w-5 h-5" />
      case 'failed_login':
      case 'suspicious_activity':
        return <ExclamationTriangleIcon className="w-5 h-5" />
      default:
        return <ClockIcon className="w-5 h-5" />
    }
  }

  const getEventColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-100'
      case 'failed':
        return 'text-red-600 bg-red-100'
      case 'warning':
        return 'text-yellow-600 bg-yellow-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getEventName = (type: string) => {
    switch (type) {
      case 'login': return 'User Login'
      case 'logout': return 'User Logout'
      case 'password_change': return 'Password Changed'
      case 'mfa_setup': return 'MFA Setup'
      case 'failed_login': return 'Failed Login'
      case 'suspicious_activity': return 'Suspicious Activity'
      default: return type
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Security Events</h3>
        <div className="text-sm text-gray-500">
          Last 30 days
        </div>
      </div>

      <div className="space-y-3">
        {events.map((event) => (
          <div
            key={event.id}
            className="bg-white border border-gray-200 rounded-lg p-4"
          >
            <div className="flex items-start space-x-3">
              <div className={`flex-shrink-0 p-2 rounded-full ${getEventColor(event.status)}`}>
                {getEventIcon(event.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">
                    {getEventName(event.type)}
                  </h4>
                  <div className="text-sm text-gray-500">
                    {formatRelativeTime(event.timestamp)}
                  </div>
                </div>
                <div className="text-sm text-gray-500 flex items-center space-x-4 mt-1">
                  <span>{event.device}</span>
                  <span>{event.location}</span>
                  <span>{event.ipAddress}</span>
                </div>
              </div>
              <div className={`flex-shrink-0 px-2 py-1 rounded-full text-xs font-medium ${
                event.status === 'success' ? 'bg-green-100 text-green-800' :
                event.status === 'failed' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {event.status}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SecuritySettingsTab({ 
  settings, 
  onUpdate 
}: { 
  settings: any,
  onUpdate: (settings: any) => void 
}) {
  const [localSettings, setLocalSettings] = useState(settings)

  const handleToggle = (key: string) => {
    const newSettings = { ...localSettings, [key]: !localSettings[key] }
    setLocalSettings(newSettings)
    onUpdate(newSettings)
  }

  const handleSelectChange = (key: string, value: any) => {
    const newSettings = { ...localSettings, [key]: value }
    setLocalSettings(newSettings)
    onUpdate(newSettings)
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>

      {/* Two-Factor Authentication */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
            <p className="text-sm text-gray-600 mt-1">
              Add an extra layer of security to your account
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {localSettings.twoFactorEnabled ? (
              <CheckCircleIcon className="w-5 h-5 text-green-500" />
            ) : (
              <XCircleIcon className="w-5 h-5 text-gray-400" />
            )}
            <button
              onClick={() => handleToggle('twoFactorEnabled')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                localSettings.twoFactorEnabled ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  localSettings.twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Session Timeout */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-medium text-gray-900">Session Timeout</h4>
            <p className="text-sm text-gray-600 mt-1">
              Automatically sign out after a period of inactivity
            </p>
          </div>
        </div>
        <select
          value={localSettings.sessionTimeout}
          onChange={(e) => handleSelectChange('sessionTimeout', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value={900}>15 minutes</option>
          <option value={1800}>30 minutes</option>
          <option value={3600}>1 hour</option>
          <option value={7200}>2 hours</option>
          <option value={28800}>8 hours</option>
          <option value={0}>Never</option>
        </select>
      </div>

      {/* Login Notifications */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">Login Notifications</h4>
            <p className="text-sm text-gray-600 mt-1">
              Get notified when someone signs in to your account
            </p>
          </div>
          <button
            onClick={() => handleToggle('loginNotifications')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              localSettings.loginNotifications ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                localSettings.loginNotifications ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Device Verification */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">Device Verification</h4>
            <p className="text-sm text-gray-600 mt-1">
              Require verification for new devices
            </p>
          </div>
          <button
            onClick={() => handleToggle('deviceVerification')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              localSettings.deviceVerification ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                localSettings.deviceVerification ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Geographic Restrictions */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-medium text-gray-900">Geographic Restrictions</h4>
            <p className="text-sm text-gray-600 mt-1">
              Block sign-ins from specific countries
            </p>
          </div>
          <button
            onClick={() => handleToggle('geoBlocking')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              localSettings.geoBlocking ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                localSettings.geoBlocking ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        
        {localSettings.geoBlocking && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Allowed Countries
            </label>
            <textarea
              rows={3}
              placeholder="Enter country codes separated by commas (e.g., US, CA, GB)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              defaultValue={localSettings.allowedCountries.join(', ')}
              onChange={(e) => handleSelectChange('allowedCountries', 
                e.target.value.split(',').map(c => c.trim()).filter(c => c)
              )}
            />
          </div>
        )}
      </div>
    </div>
  )
}

// Utility function to format relative time
function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
  
  return date.toLocaleDateString()
}