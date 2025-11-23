'use client'

import { QueryClient, QueryClientProvider } from 'react-query'
import { useState, createContext, useContext, ReactNode } from 'react'
import { AuthProvider } from '@/contexts/AuthContext'

interface AppNotification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  title?: string
}

interface GlobalState {
  user: any | null
  darkMode: boolean
  toggleDarkMode: () => void
  notifications: AppNotification[]
  addNotification: (notification: Omit<AppNotification, 'id'>) => void
  removeNotification: (id: string) => void
}

const GlobalContext = createContext<GlobalState>({
  user: null,
  darkMode: false,
  toggleDarkMode: () => {},
  notifications: [],
  addNotification: () => {},
  removeNotification: () => {},
})

export function useGlobalState() {
  return useContext(GlobalContext)
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  }))
  const [darkMode, setDarkMode] = useState(false)
  const [user, setUser] = useState(null)
  const [notifications, setNotifications] = useState<AppNotification[]>([])

  const toggleDarkMode = () => setDarkMode(!darkMode)

  const addNotification = (notification: Omit<AppNotification, 'id'>) => {
    const id = Date.now().toString()
    setNotifications(prev => [...prev, { ...notification, id }])
    setTimeout(() => removeNotification(id), 5000)
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <GlobalContext.Provider value={{ 
          user, 
          darkMode, 
          toggleDarkMode,
          notifications,
          addNotification,
          removeNotification
        }}>
          {children}
        </GlobalContext.Provider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
