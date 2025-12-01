'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'

// Types
interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: string
  organization: string
  permissions: string[]
}

interface LoginCredentials {
  email: string
  password: string
}

interface RegisterData {
  name: string
  email: string
  password: string
  organization: string
  role: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  refreshToken: () => Promise<void>
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// API client - using Next.js API routes
const apiClient = {
  async login(credentials: LoginCredentials) {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Login failed')
    }
    
    return response.json()
  },

  async register(data: RegisterData) {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Registration failed')
    }
    
    return response.json()
  },

  async getCurrentUser() {
    // Get user from localStorage instead of API call
    const userStr = localStorage.getItem('optibid_user')
    if (!userStr) throw new Error('No user found')

    return JSON.parse(userStr)
  },

  async refreshAccessToken() {
    const refreshToken = localStorage.getItem('optibid_refresh_token')
    if (!refreshToken) throw new Error('No refresh token found')

    // For now, just return the existing token
    // In production, implement proper token refresh
    return {
      access_token: localStorage.getItem('optibid_access_token'),
      refresh_token: refreshToken
    }
  }
}

// Auth Provider Component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Get current user query
  const { data: currentUser, refetch: refetchUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: apiClient.getCurrentUser,
    enabled: typeof window !== 'undefined' && !!localStorage.getItem('optibid_access_token'),
    retry: false,
  })

  // Handle query success/error with useEffect
  useEffect(() => {
    if (currentUser) {
      setUser(currentUser)
      setIsLoading(false)
    }
  }, [currentUser])

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: apiClient.login,
    onSuccess: (data) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('optibid_access_token', data.access_token)
        localStorage.setItem('optibid_refresh_token', data.refresh_token)
      }
      setUser(data.user)
      setIsLoading(false)
    },
  })

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: apiClient.register,
    onSuccess: (data) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('optibid_access_token', data.access_token)
        localStorage.setItem('optibid_refresh_token', data.refresh_token)
      }
      setUser(data.user)
      setIsLoading(false)
    },
  })

  // Refresh token mutation
  const refreshMutation = useMutation({
    mutationFn: apiClient.refreshAccessToken,
    onSuccess: (data) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('optibid_access_token', data.access_token)
        localStorage.setItem('optibid_refresh_token', data.refresh_token)
      }
    },
    onError: () => {
      // Refresh failed, logout user
      logout()
    }
  })

  // Auto-refresh token before expiry
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const token = localStorage.getItem('optibid_access_token')
    if (!token || !user) return

    // Decode JWT to get expiry (simple base64 decode)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const expiresIn = payload.exp * 1000 - Date.now()
      
      // Only refresh if token is expiring soon (less than 1 day remaining)
      if (expiresIn < 24 * 60 * 60 * 1000) {
        // Refresh token 5 minutes before expiry
        const refreshTime = Math.max(expiresIn - 5 * 60 * 1000, 1000)
        
        const timeoutId = setTimeout(() => {
          console.log('Auto-refreshing token...')
          refreshMutation.mutate()
        }, refreshTime)

        return () => clearTimeout(timeoutId)
      }
    } catch (error) {
      console.error('Failed to decode token for auto-refresh:', error)
      // Don't logout on decode error, token might still be valid
    }
  }, [user, refreshMutation])

  // Initialize auth state
  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsLoading(false)
      return
    }
    
    const token = localStorage.getItem('optibid_access_token')
    if (token && !user) {
      refetchUser()
    } else {
      setIsLoading(false)
    }
  }, [user, refetchUser])

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true)
    try {
      await loginMutation.mutateAsync(credentials)
    } catch (error) {
      setIsLoading(false)
      throw error
    }
  }

  const register = async (data: RegisterData) => {
    setIsLoading(true)
    try {
      await registerMutation.mutateAsync(data)
    } catch (error) {
      setIsLoading(false)
      throw error
    }
  }

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('optibid_access_token')
      localStorage.removeItem('optibid_refresh_token')
    }
    setUser(null)
    setIsLoading(false)
  }

  const refreshToken = async () => {
    try {
      await refreshMutation.mutateAsync()
    } catch (error) {
      throw error
    }
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    refreshToken,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Higher-order component for protected routes
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuth()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
      setMounted(true)
    }, [])

    if (!mounted || isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )
    }

    if (!isAuthenticated) {
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login'
      }
      return null
    }

    return <Component {...props} />
  }
}