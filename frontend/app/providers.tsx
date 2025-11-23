'use client'

import { QueryClient, QueryClientProvider } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'
import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { WebSocketProvider } from '@/contexts/WebSocketContext'

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

interface AppState {
  // Theme
  darkMode: boolean
  toggleDarkMode: () => void
  
  // User
  user: User | null
  isAuthenticated: boolean
  login: (user: User) => void
  logout: () => void
  
  // Notifications
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
  
  // Dashboard preferences
  dashboardLayout: DashboardLayoutItem[]
  updateDashboardLayout: (layout: DashboardLayoutItem[]) => void
  
  // Asset filters
  assetFilters: AssetFilters
  updateAssetFilters: (filters: Partial<AssetFilters>) => void
  
  // Market data preferences
  marketSettings: MarketSettings
  updateMarketSettings: (settings: Partial<MarketSettings>) => void
}

interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  timestamp: Date
  read: boolean
  actionUrl?: string
}

interface DashboardLayoutItem {
  id: string
  type: 'chart' | 'metric' | 'table' | 'alert'
  title: string
  size: 'small' | 'medium' | 'large'
  position: { x: number; y: number; w: number; h: number }
  visible: boolean
}

interface AssetFilters {
  status: string[]
  types: string[]
  regions: string[]
  searchQuery: string
}

interface MarketSettings {
  timeRange: string
  selectedRegions: string[]
  showForecasts: boolean
  showWeather: boolean
  refreshInterval: number
}

// Create store
const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Theme
      darkMode: false,
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      
      // User
      user: null,
      isAuthenticated: false,
      login: (user: User) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
      
      // Notifications
      notifications: [],
      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: Date.now().toString(),
          timestamp: new Date(),
          read: false
        }
        set((state) => ({
          notifications: [newNotification, ...state.notifications].slice(0, 50) // Keep only latest 50
        }))
      },
      removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id)
      })),
      clearNotifications: () => set({ notifications: [] }),
      
      // Dashboard layout
      dashboardLayout: [],
      updateDashboardLayout: (layout) => set({ dashboardLayout: layout }),
      
      // Asset filters
      assetFilters: {
        status: [],
        types: [],
        regions: [],
        searchQuery: ''
      },
      updateAssetFilters: (filters) => set((state) => ({
        assetFilters: { ...state.assetFilters, ...filters }
      })),
      
      // Market settings
      marketSettings: {
        timeRange: '24h',
        selectedRegions: [],
        showForecasts: true,
        showWeather: true,
        refreshInterval: 30
      },
      updateMarketSettings: (settings) => set((state) => ({
        marketSettings: { ...state.marketSettings, ...settings }
      }))
    }),
    {
      name: 'optibid-app-storage',
      partialize: (state) => ({
        darkMode: state.darkMode,
        user: state.user,
        dashboardLayout: state.dashboardLayout,
        assetFilters: state.assetFilters,
        marketSettings: state.marketSettings
      })
    }
  )
)

// Create contexts for global state
const AppStateContext = createContext<{
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
  dashboardLayout: DashboardLayoutItem[]
  updateDashboardLayout: (layout: DashboardLayoutItem[]) => void
  assetFilters: AssetFilters
  updateAssetFilters: (filters: Partial<AssetFilters>) => void
  marketSettings: MarketSettings
  updateMarketSettings: (settings: Partial<MarketSettings>) => void
} | null>(null)

// Export hooks for using the global state
export function useGlobalState() {
  const store = useAppStore()
  const context = useContext(AppStateContext)
  
  // Context provides access to notifications and other shared state
  const appState = {
    notifications: store.notifications,
    addNotification: store.addNotification,
    removeNotification: store.removeNotification,
    clearNotifications: store.clearNotifications,
    dashboardLayout: store.dashboardLayout,
    updateDashboardLayout: store.updateDashboardLayout,
    assetFilters: store.assetFilters,
    updateAssetFilters: store.updateAssetFilters,
    marketSettings: store.marketSettings,
    updateMarketSettings: store.updateMarketSettings
  }
  
  return { ...store, ...appState }
}

// App State Provider Component
export function AppStateProvider({ children }: { children: ReactNode }) {
  const store = useAppStore()
  
  // Auto-login for demo purposes
  useEffect(() => {
    const demoUser: User = {
      id: '1',
      name: 'Rajesh Kumar',
      email: 'rajesh.kumar@company.com',
      avatar: '',
      role: 'Energy Trader',
      organization: 'GreenTech Energy Solutions',
      permissions: ['read_assets', 'write_bids', 'view_analytics', 'manage_users']
    }
    
    // Check if user is already logged in (from localStorage)
    const savedUser = localStorage.getItem('optibid_user')
    if (savedUser && !store.user) {
      try {
        const parsedUser = JSON.parse(savedUser)
        store.login(parsedUser)
      } catch (error) {
        console.error('Failed to parse saved user:', error)
      }
    } else if (!store.user) {
      // Auto-login with demo user
      store.login(demoUser)
    }
  }, [store.login, store.user])

  // Save user to localStorage
  useEffect(() => {
    if (store.user) {
      localStorage.setItem('optibid_user', JSON.stringify(store.user))
    } else {
      localStorage.removeItem('optibid_user')
    }
  }, [store.user])

  // Add demo notifications on mount
  useEffect(() => {
    if (store.notifications.length === 0) {
      setTimeout(() => {
        store.addNotification({
          type: 'success',
          title: 'System Online',
          message: 'All systems are operational and monitoring live data.',
          read: false,
        })
      }, 2000)

      setTimeout(() => {
        store.addNotification({
          type: 'info',
          title: 'Market Update',
          message: 'New market prices available for Day-Ahead bidding.',
          read: false,
        })
      }, 5000)

      setTimeout(() => {
        store.addNotification({
          type: 'warning',
          title: 'Maintenance Scheduled',
          read: false,
          message: 'Solar Farm C scheduled for maintenance tomorrow.',
        })
      }, 8000)
    }
  }, [store.addNotification, store.notifications.length])

  const contextValue = {
    notifications: store.notifications,
    addNotification: store.addNotification,
    removeNotification: store.removeNotification,
    clearNotifications: store.clearNotifications,
    dashboardLayout: store.dashboardLayout,
    updateDashboardLayout: store.updateDashboardLayout,
    assetFilters: store.assetFilters,
    updateAssetFilters: store.updateAssetFilters,
    marketSettings: store.marketSettings,
    updateMarketSettings: store.updateMarketSettings
  }

  return (
    <AppStateContext.Provider value={contextValue}>
      {children}
    </AppStateContext.Provider>
  )
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            cacheTime: 5 * 60 * 1000, // 5 minutes
            refetchOnWindowFocus: false,
            retry: (failureCount, error: any) => {
              // Don't retry on 401/403 errors
              if (error?.response?.status === 401 || error?.response?.status === 403) {
                return false
              }
              return failureCount < 3
            },
          },
          mutations: {
            retry: false,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <WebSocketProvider>
            <AppStateProvider>
              {children}
            </AppStateProvider>
          </WebSocketProvider>
        </AuthProvider>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

// Export types for use in components
export type {
  User,
  Notification,
  DashboardLayoutItem,
  AssetFilters,
  MarketSettings
}