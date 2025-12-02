'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  XMarkIcon,
  ShareIcon,
  LinkIcon,
  EnvelopeIcon,
  UserGroupIcon,
  ClockIcon,
  EyeIcon,
  PencilIcon,
  LockClosedIcon,
  LockOpenIcon,
  CheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { Dialog, Transition, Tab } from '@headlessui/react'
import { Fragment } from 'react'
import { clsx } from 'clsx'

/**
 * Hook to isolate scroll events within a container, preventing propagation
 * to parent components. This prevents modal scroll from triggering
 * unintended state mutations in the dashboard.
 * Validates: Requirements 2.3, 2.4
 */
function useScrollIsolation(ref: React.RefObject<HTMLElement>) {
  useEffect(() => {
    const container = ref.current
    if (!container) return

    const handleScroll = (e: Event) => {
      e.stopPropagation()
    }

    const handleWheel = (e: WheelEvent) => {
      e.stopPropagation()
    }

    const handleTouchMove = (e: TouchEvent) => {
      e.stopPropagation()
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    container.addEventListener('wheel', handleWheel, { passive: true })
    container.addEventListener('touchmove', handleTouchMove, { passive: true })

    return () => {
      container.removeEventListener('scroll', handleScroll)
      container.removeEventListener('wheel', handleWheel)
      container.removeEventListener('touchmove', handleTouchMove)
    }
  }, [ref])
}

interface ShareDashboardProps {
  isOpen: boolean
  onClose: () => void
  dashboard: any
  user: any
  /** If true, shows a "Feature coming soon" message instead of the full UI */
  isFeatureDisabled?: boolean
}

interface SharedUser {
  id: string
  name: string
  email: string
  avatar?: string
  role: string
  permission: 'viewer' | 'editor' | 'admin'
  invitedAt: string
  acceptedAt?: string
  lastAccessed?: string
}

interface ShareLink {
  id: string
  name: string
  url: string
  permission: 'viewer' | 'editor'
  expiresAt?: string
  password?: string
  isActive: boolean
  createdAt: string
  accessCount: number
}

const MOCK_SHARED_USERS: SharedUser[] = [
  {
    id: 'user-2',
    name: 'Sarah Wilson',
    email: 'sarah@optibid.com',
    role: 'Data Scientist',
    permission: 'editor',
    invitedAt: '2024-01-15T10:00:00Z',
    acceptedAt: '2024-01-15T10:30:00Z',
    lastAccessed: '2024-01-20T11:45:00Z'
  },
  {
    id: 'user-3',
    name: 'Mike Chen',
    email: 'mike@optibid.com',
    role: 'Energy Analyst',
    permission: 'viewer',
    invitedAt: '2024-01-18T14:20:00Z',
    acceptedAt: '2024-01-18T14:35:00Z',
    lastAccessed: '2024-01-20T09:20:00Z'
  },
  {
    id: 'user-4',
    name: 'Emily Davis',
    email: 'emily@optibid.com',
    role: 'Portfolio Manager',
    permission: 'admin',
    invitedAt: '2024-01-10T09:00:00Z',
    acceptedAt: '2024-01-10T09:15:00Z',
    lastAccessed: '2024-01-20T12:00:00Z'
  }
]

const MOCK_SHARE_LINKS: ShareLink[] = [
  {
    id: 'link-1',
    name: 'Client Presentation',
    url: 'https://app.optibid.com/share/dashboard-123?token=abc123',
    permission: 'viewer',
    expiresAt: '2024-02-20T23:59:59Z',
    password: 'client2024',
    isActive: true,
    createdAt: '2024-01-20T10:00:00Z',
    accessCount: 5
  },
  {
    id: 'link-2',
    name: 'Team Review',
    url: 'https://app.optibid.com/share/dashboard-123?token=def456',
    permission: 'editor',
    isActive: true,
    createdAt: '2024-01-18T15:30:00Z',
    accessCount: 12
  }
]

export function ShareDashboard({ isOpen, onClose, dashboard, user, isFeatureDisabled = false }: ShareDashboardProps) {
  // Ref for scroll isolation - prevents scroll events from propagating to parent
  // Validates: Requirements 2.3, 2.4
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  useScrollIsolation(scrollContainerRef)
  
  // State declarations must come before any conditional returns (React hooks rules)
  const [activeTab, setActiveTab] = useState('people')
  const [sharedUsers, setSharedUsers] = useState<SharedUser[]>(MOCK_SHARED_USERS)
  const [shareLinks, setShareLinks] = useState<ShareLink[]>(MOCK_SHARE_LINKS)
  const [newUserEmail, setNewUserEmail] = useState('')
  const [newUserPermission, setNewUserPermission] = useState<'viewer' | 'editor' | 'admin'>('viewer')
  const [linkName, setLinkName] = useState('')
  const [linkPermission, setLinkPermission] = useState<'viewer' | 'editor'>('viewer')
  const [linkExpiration, setLinkExpiration] = useState('never')
  const [linkPassword, setLinkPassword] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [isPublic, setIsPublic] = useState(false)
  const [notificationEmail, setNotificationEmail] = useState(true)
  const [copySuccess, setCopySuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  // Safety checks to prevent crashes - Validates: Requirements 6.1
  // These checks ensure the component renders without crashing when props are missing
  if (!dashboard) {
    console.warn('ShareDashboard: dashboard prop is undefined')
    return null
  }
  
  if (!user) {
    console.warn('ShareDashboard: user prop is undefined')
    return null
  }

  // Graceful fallback for incomplete share feature - Validates: Requirements 6.4
  // Display "Feature coming soon" message if share is not fully implemented
  if (isFeatureDisabled) {
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
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                  <div className="flex items-center justify-center mb-4">
                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900">
                      <ShareIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <Dialog.Title className="text-lg font-semibold text-center text-gray-900 dark:text-white">
                    Share Feature Coming Soon
                  </Dialog.Title>
                  <p className="mt-2 text-sm text-center text-gray-500 dark:text-gray-400">
                    We're working on bringing you powerful sharing capabilities. 
                    This feature will allow you to share dashboards with team members and external collaborators.
                  </p>
                  <div className="mt-6 flex justify-center">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Got it, thanks!
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    )
  }

  // Safe access to dashboard properties with fallbacks
  const dashboardName = dashboard?.name || 'My Dashboard'
  const dashboardId = dashboard?.id || 'default'

  const handleInviteUser = () => {
    if (!newUserEmail.trim()) return

    // In a real app, this would send an invitation
    const newUser: SharedUser = {
      id: `user-${Date.now()}`,
      name: newUserEmail.split('@')[0],
      email: newUserEmail,
      role: 'Team Member',
      permission: newUserPermission,
      invitedAt: new Date().toISOString()
    }

    setSharedUsers(prev => [...prev, newUser])
    setNewUserEmail('')
  }

  const handleRemoveUser = (userId: string) => {
    setSharedUsers(prev => prev.filter(u => u.id !== userId))
  }

  const handleUpdateUserPermission = (userId: string, permission: 'viewer' | 'editor' | 'admin') => {
    setSharedUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, permission } : u
    ))
  }

  const handleCreateLink = () => {
    if (!linkName.trim()) return

    const newLink: ShareLink = {
      id: `link-${Date.now()}`,
      name: linkName,
      url: `https://app.optibid.com/share/dashboard-${dashboardId}?token=${Math.random().toString(36).substr(2, 9)}`,
      permission: linkPermission,
      expiresAt: linkExpiration === 'never' ? undefined : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      password: linkPassword || undefined,
      isActive: true,
      createdAt: new Date().toISOString(),
      accessCount: 0
    }

    setShareLinks(prev => [...prev, newLink])
    setLinkName('')
    setLinkPassword('')
    setShowAdvanced(false)
  }

  const handleToggleLink = (linkId: string) => {
    setShareLinks(prev => prev.map(link =>
      link.id === linkId ? { ...link, isActive: !link.isActive } : link
    ))
  }

  const handleCopyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopySuccess(url)
      // Clear success message after 2 seconds
      setTimeout(() => setCopySuccess(null), 2000)
    } catch (err) {
      console.error('Failed to copy link:', err)
      setError('Failed to copy link to clipboard')
      setTimeout(() => setError(null), 3000)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getPermissionIcon = (permission: string) => {
    switch (permission) {
      case 'admin':
        return <LockOpenIcon className="h-4 w-4 text-green-500" />
      case 'editor':
        return <PencilIcon className="h-4 w-4 text-blue-500" />
      case 'viewer':
        return <EyeIcon className="h-4 w-4 text-gray-500" />
      default:
        return <EyeIcon className="h-4 w-4 text-gray-500" />
    }
  }

  const getPermissionColor = (permission: string) => {
    switch (permission) {
      case 'admin':
        return 'text-green-600 bg-green-100 dark:text-green-300 dark:bg-green-900'
      case 'editor':
        return 'text-blue-600 bg-blue-100 dark:text-blue-300 dark:bg-blue-900'
      case 'viewer':
        return 'text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-gray-700'
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-gray-700'
    }
  }

  const tabs = [
    { id: 'people', name: 'People', icon: UserGroupIcon },
    { id: 'links', name: 'Share Links', icon: LinkIcon },
    { id: 'settings', name: 'Settings', icon: LockClosedIcon }
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
                    <ShareIcon className="h-6 w-6 text-blue-500" />
                    <div>
                      <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-white">
                        Share Dashboard
                      </Dialog.Title>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {dashboardName} - Control access and permissions
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

                {/* Tabs - Tab.Group must wrap both Tab.List and Tab.Panels */}
                <Tab.Group>
                  <div className="border-b border-gray-200 dark:border-gray-700">
                    <Tab.List className="flex space-x-8 px-6">
                      {tabs.map(tab => (
                        <Tab
                          key={tab.id}
                          className={({ selected }) =>
                            clsx(
                              'py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap',
                              selected
                                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                            )
                          }
                        >
                          <div className="flex items-center space-x-2">
                            <tab.icon className="h-4 w-4" />
                            <span>{tab.name}</span>
                            {tab.id === 'people' && sharedUsers.length > 0 && (
                              <span className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded-full text-xs">
                                {sharedUsers.length}
                              </span>
                            )}
                            {tab.id === 'links' && shareLinks.length > 0 && (
                              <span className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded-full text-xs">
                                {shareLinks.length}
                              </span>
                            )}
                          </div>
                        </Tab>
                      ))}
                    </Tab.List>
                  </div>

                  {/* Tab Content - with scroll isolation to prevent state mutations */}
                  {/* Validates: Requirements 2.3, 2.4 */}
                  <div ref={scrollContainerRef} className="h-96 overflow-hidden">
                    <Tab.Panels>
                    {/* People Tab */}
                    <Tab.Panel className="h-full flex flex-col">
                      <div className="p-6 space-y-6">
                        {/* Invite User */}
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                            Invite People
                          </h3>
                          <div className="flex space-x-3">
                            <div className="flex-1">
                              <input
                                type="email"
                                value={newUserEmail}
                                onChange={(e) => setNewUserEmail(e.target.value)}
                                placeholder="Enter email address"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <select
                              value={newUserPermission}
                              onChange={(e) => setNewUserPermission(e.target.value as any)}
                              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="viewer">Viewer</option>
                              <option value="editor">Editor</option>
                              <option value="admin">Admin</option>
                            </select>
                            <button
                              onClick={handleInviteUser}
                              disabled={!newUserEmail.trim()}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Invite
                            </button>
                          </div>
                        </div>

                        {/* Shared Users List */}
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                            People with Access ({sharedUsers.length})
                          </h3>
                          <div className="space-y-3">
                            {sharedUsers.map(sharedUser => (
                              <div key={sharedUser.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                    <span className="text-blue-600 dark:text-blue-300 text-sm font-medium">
                                      {sharedUser.name.split(' ').map(n => n[0]).join('')}
                                    </span>
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                      {sharedUser.name}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      {sharedUser.email}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                  <select
                                    value={sharedUser.permission}
                                    onChange={(e) => handleUpdateUserPermission(sharedUser.id, e.target.value as any)}
                                    className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                                  >
                                    <option value="viewer">Viewer</option>
                                    <option value="editor">Editor</option>
                                    <option value="admin">Admin</option>
                                  </select>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {sharedUser.lastAccessed && (
                                      <div className="flex items-center">
                                        <ClockIcon className="h-3 w-3 mr-1" />
                                        {formatDate(sharedUser.lastAccessed)}
                                      </div>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => handleRemoveUser(sharedUser.id)}
                                    className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                                  >
                                    <XMarkIcon className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                            {sharedUsers.length === 0 && (
                              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                <UserGroupIcon className="mx-auto h-8 w-8 mb-2" />
                                <p>No one has access to this dashboard yet</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </Tab.Panel>

                    {/* Share Links Tab */}
                    <Tab.Panel className="h-full flex flex-col">
                      <div className="p-6 space-y-6">
                        {/* Create Link */}
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                            Create Share Link
                          </h3>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Link Name
                                </label>
                                <input
                                  type="text"
                                  value={linkName}
                                  onChange={(e) => setLinkName(e.target.value)}
                                  placeholder="e.g., Client Presentation"
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Permission
                                </label>
                                <select
                                  value={linkPermission}
                                  onChange={(e) => setLinkPermission(e.target.value as any)}
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                                >
                                  <option value="viewer">Viewer</option>
                                  <option value="editor">Editor</option>
                                </select>
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <button
                                onClick={() => setShowAdvanced(!showAdvanced)}
                                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                              >
                                {showAdvanced ? 'Hide' : 'Show'} Advanced Options
                              </button>
                              <button
                                onClick={handleCreateLink}
                                disabled={!linkName.trim()}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Create Link
                              </button>
                            </div>

                            <AnimatePresence>
                              {showAdvanced && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="space-y-3 border-t border-gray-200 dark:border-gray-600 pt-3"
                                >
                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Expiration
                                      </label>
                                      <select
                                        value={linkExpiration}
                                        onChange={(e) => setLinkExpiration(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                                      >
                                        <option value="never">Never</option>
                                        <option value="1d">1 Day</option>
                                        <option value="7d">7 Days</option>
                                        <option value="30d">30 Days</option>
                                      </select>
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Password (Optional)
                                      </label>
                                      <input
                                        type="password"
                                        value={linkPassword}
                                        onChange={(e) => setLinkPassword(e.target.value)}
                                        placeholder="Leave blank for no password"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                                      />
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>

                        {/* Existing Links */}
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                            Active Links ({shareLinks.length})
                          </h3>
                          <div className="space-y-3">
                            {shareLinks.map(link => (
                              <div key={link.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                      {link.name}
                                    </span>
                                    <span className={clsx(
                                      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                                      getPermissionColor(link.permission)
                                    )}>
                                      {getPermissionIcon(link.permission)}
                                      <span className="ml-1 capitalize">{link.permission}</span>
                                    </span>
                                    {!link.isActive && (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                        Inactive
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    <div className="flex items-center">
                                      <LinkIcon className="h-3 w-3 mr-1" />
                                      {link.accessCount} views
                                    </div>
                                    {link.expiresAt && (
                                      <div className="flex items-center">
                                        <ClockIcon className="h-3 w-3 mr-1" />
                                        Expires {formatDate(link.expiresAt)}
                                      </div>
                                    )}
                                    {link.password && (
                                      <div className="flex items-center">
                                        <LockClosedIcon className="h-3 w-3 mr-1" />
                                        Password protected
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => handleCopyLink(link.url)}
                                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                    title="Copy link"
                                  >
                                    <LinkIcon className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleToggleLink(link.id)}
                                    className={clsx(
                                      'p-1 rounded',
                                      link.isActive 
                                        ? 'text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300'
                                        : 'text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300'
                                    )}
                                    title={link.isActive ? 'Deactivate link' : 'Activate link'}
                                  >
                                    {link.isActive ? <LockOpenIcon className="h-4 w-4" /> : <LockClosedIcon className="h-4 w-4" />}
                                  </button>
                                </div>
                              </div>
                            ))}
                            {shareLinks.length === 0 && (
                              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                <LinkIcon className="mx-auto h-8 w-8 mb-2" />
                                <p>No share links created yet</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </Tab.Panel>

                    {/* Settings Tab */}
                    <Tab.Panel className="h-full flex flex-col">
                      <div className="p-6 space-y-6">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                            Sharing Settings
                          </h3>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  Public Dashboard
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  Allow anyone with the link to view this dashboard
                                </div>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={isPublic}
                                  onChange={(e) => setIsPublic(e.target.checked)}
                                  className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                              </label>
                            </div>

                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  Email Notifications
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  Send email when dashboard is shared or accessed
                                </div>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={notificationEmail}
                                  onChange={(e) => setNotificationEmail(e.target.checked)}
                                  className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                              </label>
                            </div>
                          </div>
                        </div>

                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                          <div className="flex">
                            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
                            <div className="ml-3">
                              <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                Security Reminder
                              </h4>
                              <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                                <p>
                                  Regularly review and update sharing permissions. Remove access for users who no longer need it.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Tab.Panel>
                    </Tab.Panels>
                  </div>
                </Tab.Group>

                {/* Footer */}
                <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {sharedUsers.length} people • {shareLinks.length} links
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                    >
                      Close
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