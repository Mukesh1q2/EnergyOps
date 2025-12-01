'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  actualTheme: 'light' | 'dark' // The actual resolved theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// Get system preference
function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

// Resolve theme to actual theme
function resolveTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') {
    return getSystemTheme()
  }
  return theme
}

// Apply theme to document
function applyTheme(actualTheme: 'light' | 'dark') {
  if (typeof document === 'undefined') return
  
  const root = document.documentElement
  
  // Remove existing theme classes
  root.classList.remove('light', 'dark')
  
  // Add new theme class
  root.classList.add(actualTheme)
  
  // Set meta theme-color for mobile browsers
  const metaThemeColor = document.querySelector('meta[name="theme-color"]')
  if (metaThemeColor) {
    metaThemeColor.setAttribute(
      'content', 
      actualTheme === 'dark' ? '#1f2937' : '#ffffff'
    )
  }
}

// Theme Provider Component
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system')
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)

  // Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('optibid-theme') as Theme
    if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
      setThemeState(savedTheme)
    }
    setMounted(true)
  }, [])

  // Resolve and apply theme changes
  useEffect(() => {
    if (!mounted) return
    
    const resolved = resolveTheme(theme)
    setActualTheme(resolved)
    applyTheme(resolved)
  }, [theme, mounted])

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = () => {
      if (theme === 'system') {
        const resolved = getSystemTheme()
        setActualTheme(resolved)
        applyTheme(resolved)
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem('optibid-theme', newTheme)
    
    const resolved = resolveTheme(newTheme)
    setActualTheme(resolved)
    applyTheme(resolved)
  }

  const toggleTheme = () => {
    const newTheme: Theme = actualTheme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
  }

  const value: ThemeContextType = {
    theme,
    actualTheme,
    setTheme,
    toggleTheme,
  }

  // Prevent flash of incorrect theme
  if (!mounted) {
    return (
      <div style={{ visibility: 'hidden' }}>
        {children}
      </div>
    )
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

// Hook to use theme context
export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

// Hook for theme-aware styling
export function useThemeClasses() {
  const { actualTheme } = useTheme()
  
  return {
    isDark: actualTheme === 'dark',
    themeClasses: actualTheme === 'dark' ? 'dark' : 'light',
    background: actualTheme === 'dark' ? 'bg-gray-900' : 'bg-white',
    text: actualTheme === 'dark' ? 'text-white' : 'text-gray-900',
    border: actualTheme === 'dark' ? 'border-gray-700' : 'border-gray-200',
  }
}

// Component for theme-aware CSS classes
export function ThemeClasses({ 
  children, 
  className,
  lightClass,
  darkClass 
}: { 
  children: React.ReactNode
  className?: string
  lightClass: string
  darkClass: string
}) {
  const { actualTheme } = useTheme()
  
  const themeClass = actualTheme === 'dark' ? darkClass : lightClass
  
  return (
    <div className={`${className || ''} ${themeClass}`}>
      {children}
    </div>
  )
}

// Higher-order component for theme-aware components
export function withTheme<P extends object>(Component: React.ComponentType<P>) {
  return function ThemedComponent(props: P) {
    return (
      <ThemeClasses lightClass="theme-light" darkClass="theme-dark">
        <Component {...props} />
      </ThemeClasses>
    )
  }
}

// Theme configuration
export const themeConfig = {
  colors: {
    light: {
      primary: '#3b82f6',
      secondary: '#64748b',
      background: '#ffffff',
      surface: '#f8fafc',
      text: '#0f172a',
      textSecondary: '#64748b',
      border: '#e2e8f0',
    },
    dark: {
      primary: '#60a5fa',
      secondary: '#94a3b8',
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f1f5f9',
      textSecondary: '#94a3b8',
      border: '#334155',
    },
  },
  transitions: {
    fast: 'transition-colors duration-150',
    normal: 'transition-colors duration-200',
    slow: 'transition-colors duration-300',
  },
}

// Theme-aware utility functions
export const themeUtils = {
  getColor: (colorName: keyof typeof themeConfig.colors.light) => {
    return (actualTheme: 'light' | 'dark') => 
      themeConfig.colors[actualTheme][colorName]
  },
  
  getTransition: (speed: keyof typeof themeConfig.transitions = 'normal') =>
    themeConfig.transitions[speed],
    
  isDark: (actualTheme: 'light' | 'dark') => actualTheme === 'dark',
}