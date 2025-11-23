'use client'

import React, { useState, useEffect, useContext } from 'react'
import { motion } from 'framer-motion'
import {
  ShieldCheckIcon,
  UserGroupIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  AdjustmentsHorizontalIcon,
  LockClosedIcon,
  LockOpenIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { Menu, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { clsx } from 'clsx'

interface RoleBasedAccessProps {
  user: any
  children: React.ReactNode
}

interface Permission {
  id: string
  name: string
  description: string
  category: string
  resource: string
  action: string
}

interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
  userCount: number
  isSystem?: boolean
}

interface UserPermission {
  userId: string
  permissions: string[]
  overrides: { [key: string]: 'allow' | 'deny' }
  role: string
}

// Permission definitions
const PERMISSIONS: Permission[] = [
  // Dashboard permissions
  { id: 'dashboard.view', name: 'View Dashboard', description: 'Can view dashboards', category: 'dashboard', resource: 'dashboard', action: 'view' },
  { id: 'dashboard.create', name: 'Create Dashboard', description: 'Can create new dashboards', category: 'dashboard', resource: 'dashboard', action: 'create' },
  { id: 'dashboard.edit', name: 'Edit Dashboard', description: 'Can edit existing dashboards', category: 'dashboard', resource: 'dashboard', action: 'edit' },
  { id: 'dashboard.delete', name: 'Delete Dashboard', description: 'Can delete dashboards', category: 'dashboard', resource: 'dashboard', action: 'delete' },
  { id: 'dashboard.share', name: 'Share Dashboard', description: 'Can share dashboards with others', category: 'dashboard', resource: 'dashboard', action: 'share' },
  
  // Widget permissions
  { id: 'widget.view', name: 'View Widgets', description: 'Can view widgets', category: 'widget', resource: 'widget', action: 'view' },
  { id: 'widget.create', name: 'Create Widgets', description: 'Can create new widgets', category: 'widget', resource: 'widget', action: 'create' },
  { id: 'widget.edit', name: 'Edit Widgets', description: 'Can edit widgets', category: 'widget', resource: 'widget', action: 'edit' },
  { id: 'widget.delete', name: 'Delete Widgets', description: 'Can delete widgets', category: 'widget', resource: 'widget', action: 'delete' },
  { id: 'widget.configure', name: 'Configure Widgets', description: 'Can configure widget settings', category: 'widget', resource: 'widget', action: 'configure' },
  
  // Data permissions
  { id: 'data.view-energy', name: 'View Energy Data', description: 'Can view energy generation data', category: 'data', resource: 'energy', action: 'view' },
  { id: 'data.view-market', name: 'View Market Data', description: 'Can view market pricing data', category: 'data', resource: 'market', action: 'view' },
  { id: 'data.view-asset', name: 'View Asset Data', description: 'Can view asset status data', category: 'data', resource: 'asset', action: 'view' },
  { id: 'data.export', name: 'Export Data', description: 'Can export data from dashboards', category: 'data', resource: 'data', action: 'export' },
  
  // Team permissions
  { id: 'team.view', name: 'View Team', description: 'Can view team members', category: 'team', resource: 'team', action: 'view' },
  { id: 'team.invite', name: 'Invite Team', description: 'Can invite new team members', category: 'team', resource: 'team', action: 'invite' },
  { id: 'team.manage', name: 'Manage Team', description: 'Can manage team members and roles', category: 'team', resource: 'team', action: 'manage' },
  { id: 'team.collaborate', name: 'Collaborate', description: 'Can collaborate with team on dashboards', category: 'team', resource: 'team', action: 'collaborate' },
  
  // Admin permissions
  { id: 'admin.users', name: 'User Management', description: 'Can manage users and their permissions', category: 'admin', resource: 'user', action: 'manage' },
  { id: 'admin.roles', name: 'Role Management', description: 'Can manage roles and permissions', category: 'admin', resource: 'role', action: 'manage' },
  { id: 'admin.system', name: 'System Settings', description: 'Can manage system-wide settings', category: 'admin', resource: 'system', action: 'manage' },
  { id: 'admin.audit', name: 'Audit Logs', description: 'Can view audit logs and security events', category: 'admin', resource: 'audit', action: 'view' },
  
  // Security permissions
  { id: 'security.view', name: 'View Security', description: 'Can view security settings', category: 'security', resource: 'security', action: 'view' },
  { id: 'security.manage', name: 'Manage Security', description: 'Can manage security settings', category: 'security', resource: 'security', action: 'manage' }
]

// Default role definitions
const ROLES: Role[] = [
  {
    id: 'viewer',
    name: 'Viewer',
    description: 'Can view dashboards and data',
    permissions: ['dashboard.view', 'widget.view', 'data.view-energy', 'data.view-market', 'data.view-asset', 'team.view', 'team.collaborate'],
    userCount: 12,
    isSystem: true
  },
  {
    id: 'editor',
    name: 'Editor',
    description: 'Can create and edit dashboards and widgets',
    permissions: ['dashboard.view', 'dashboard.create', 'dashboard.edit', 'widget.view', 'widget.create', 'widget.edit', 'widget.configure', 'data.view-energy', 'data.view-market', 'data.view-asset', 'data.export', 'team.view', 'team.collaborate'],
    userCount: 8,
    isSystem: true
  },
  {
    id: 'analyst',
    name: 'Analyst',
    description: 'Full access to analytics and reporting',
    permissions: ['dashboard.view', 'dashboard.create', 'dashboard.edit', 'dashboard.share', 'widget.view', 'widget.create', 'widget.edit', 'widget.delete', 'widget.configure', 'data.view-energy', 'data.view-market', 'data.view-asset', 'data.export', 'team.view', 'team.invite', 'team.collaborate'],
    userCount: 5,
    isSystem: true
  },
  {
    id: 'manager',
    name: 'Manager',
    description: 'Can manage team and access all features',
    permissions: [...PERMISSIONS.map(p => p.id)],
    userCount: 3,
    isSystem: true
  },
  {
    id: 'admin',
    name: 'Administrator',
    description: 'Full system access including user and role management',
    permissions: [...PERMISSIONS.map(p => p.id)],
    userCount: 1,
    isSystem: true
  }
]

export function RoleBasedAccess({ user, children }: RoleBasedAccessProps) {
  const [userPermissions, setUserPermissions] = useState<string[]>([])
  const [userRole, setUserRole] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [permissionOverrides, setPermissionOverrides] = useState<{ [key: string]: 'allow' | 'deny' }>({})

  useEffect(() => {
    if (user) {
      loadUserPermissions()
    }
  }, [user])

  const loadUserPermissions = async () => {
    try {
      // In a real implementation, this would fetch from an API
      const userRole = determineUserRole(user)
      const permissions = getPermissionsForRole(userRole)
      setUserRole(userRole)
      setUserPermissions(permissions)
      setIsLoading(false)
    } catch (error) {
      console.error('Failed to load user permissions:', error)
      setIsLoading(false)
    }
  }

  const determineUserRole = (user: any): string => {
    // Determine role based on user properties
    if (user.role === 'admin') return 'admin'
    if (user.role === 'manager') return 'manager'
    if (user.role === 'analyst') return 'analyst'
    if (user.role === 'editor') return 'editor'
    return 'viewer' // default
  }

  const getPermissionsForRole = (roleId: string): string[] => {
    const role = ROLES.find(r => r.id === roleId)
    return role ? role.permissions : []
  }

  const hasPermission = (permissionId: string): boolean => {
    // Check for explicit overrides first
    if (permissionOverrides[permissionId] === 'allow') return true
    if (permissionOverrides[permissionId] === 'deny') return false
    
    // Check base permissions
    return userPermissions.includes(permissionId)
  }

  const hasAnyPermission = (permissionIds: string[]): boolean => {
    return permissionIds.some(permissionId => hasPermission(permissionId))
  }

  const hasAllPermissions = (permissionIds: string[]): boolean => {
    return permissionIds.every(permissionId => hasPermission(permissionId))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  // If user doesn't have basic view permission, show access denied
  if (!hasPermission('dashboard.view') && !hasPermission('widget.view')) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <ShieldCheckIcon className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            Access Restricted
          </h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            You don't have permission to access this content. Please contact your administrator to request access.
          </p>
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
              <div className="ml-3">
                <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Current Role: {userRole}
                </h4>
                <p className="mt-1 text-xs text-yellow-700 dark:text-yellow-300">
                  Required permissions: dashboard.view or widget.view
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Render children with permission context
  return (
    <PermissionContext.Provider value={{
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
      userPermissions,
      userRole,
      permissionOverrides,
      setPermissionOverrides
    }}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
    </PermissionContext.Provider>
  )
}

// Permission Context
interface PermissionContextType {
  hasPermission: (permissionId: string) => boolean
  hasAnyPermission: (permissionIds: string[]) => boolean
  hasAllPermissions: (permissionIds: string[]) => boolean
  userPermissions: string[]
  userRole: string
  permissionOverrides: { [key: string]: 'allow' | 'deny' }
  setPermissionOverrides: (overrides: { [key: string]: 'allow' | 'deny' }) => void
}

const PermissionContext = React.createContext<PermissionContextType | undefined>(undefined)

// Permission checking hooks
export const usePermissions = () => {
  const context = useContext(PermissionContext)
  if (context === undefined) {
    throw new Error('usePermissions must be used within a RoleBasedAccess component')
  }
  return context
}

export const usePermission = (permissionId: string) => {
  const { hasPermission } = usePermissions()
  return hasPermission(permissionId)
}

export const useAnyPermission = (permissionIds: string[]) => {
  const { hasAnyPermission } = usePermissions()
  return hasAnyPermission(permissionIds)
}

export const useAllPermissions = (permissionIds: string[]) => {
  const { hasAllPermissions } = usePermissions()
  return hasAllPermissions(permissionIds)
}

// Permission-based component wrapper
interface PermissionGateProps {
  permission?: string
  permissions?: string[]
  requireAll?: boolean
  fallback?: React.ReactNode
  children: React.ReactNode
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
  permission,
  permissions = [],
  requireAll = false,
  fallback = null,
  children
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions()
  
  let hasAccess = false
  
  if (permission) {
    hasAccess = hasPermission(permission)
  } else if (permissions.length > 0) {
    hasAccess = requireAll ? hasAllPermissions(permissions) : hasAnyPermission(permissions)
  }
  
  if (!hasAccess) {
    return <>{fallback}</>
  }
  
  return <>{children}</>
}

// Permission badge component
export const PermissionBadge: React.FC<{ permission: string; className?: string }> = ({ 
  permission, 
  className 
}) => {
  const { hasPermission } = usePermissions()
  const permissionMeta = PERMISSIONS.find(p => p.id === permission)
  
  if (!permissionMeta) return null
  
  const hasAccess = hasPermission(permission)
  
  return (
    <span className={clsx(
      'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
      hasAccess 
        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      className
    )}>
      {hasAccess ? (
        <CheckCircleIcon className="w-3 h-3 mr-1" />
      ) : (
        <LockClosedIcon className="w-3 h-3 mr-1" />
      )}
      {permissionMeta.name}
    </span>
  )
}

// Role information component
export const RoleInfo: React.FC<{ user?: any; className?: string }> = ({ 
  user = null, 
  className 
}) => {
  const { userRole, userPermissions } = usePermissions()
  const role = ROLES.find(r => r.id === userRole)
  
  if (!role) return null
  
  return (
    <div className={clsx('bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4', className)}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Role Information
        </h3>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          {role.name}
        </span>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
        {role.description}
      </p>
      <div>
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          Permissions ({userPermissions.length})
        </h4>
        <div className="flex flex-wrap gap-1">
          {PERMISSIONS.filter(p => userPermissions.includes(p.id)).map(permission => (
            <span
              key={permission.id}
              className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            >
              {permission.name}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>{role.userCount} users with this role</span>
          {role.isSystem && (
            <span className="inline-flex items-center">
              <LockClosedIcon className="w-3 h-3 mr-1" />
              System Role
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// Permission debug panel (for development/admin use)
export const PermissionDebugPanel: React.FC<{ className?: string }> = ({ className }) => {
  const { userRole, userPermissions, hasPermission } = usePermissions()
  
  const categories = [...new Set(PERMISSIONS.map(p => p.category))]
  
  return (
    <div className={clsx('bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-600', className)}>
      <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
        Permission Debug Panel
      </h3>
      <div className="space-y-3">
        <div className="text-sm">
          <span className="font-medium text-gray-700 dark:text-gray-300">Role:</span>
          <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs">
            {userRole}
          </span>
        </div>
        <div className="text-sm">
          <span className="font-medium text-gray-700 dark:text-gray-300">Total Permissions:</span>
          <span className="ml-2 text-gray-600 dark:text-gray-400">{userPermissions.length}</span>
        </div>
        {categories.map(category => {
          const categoryPermissions = PERMISSIONS.filter(p => p.category === category)
          const userHasCount = categoryPermissions.filter(p => hasPermission(p.id)).length
          
          return (
            <div key={category} className="text-sm">
              <div className="font-medium text-gray-700 dark:text-gray-300 capitalize mb-1">
                {category} ({userHasCount}/{categoryPermissions.length})
              </div>
              <div className="pl-2 space-y-1">
                {categoryPermissions.map(permission => (
                  <div key={permission.id} className="flex items-center justify-between">
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {permission.name}
                    </span>
                    <span className={clsx(
                      'w-2 h-2 rounded-full',
                      hasPermission(permission.id) ? 'bg-green-500' : 'bg-red-500'
                    )}></span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default RoleBasedAccess