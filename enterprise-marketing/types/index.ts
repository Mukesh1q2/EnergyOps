// Theme types
export type Theme = 'light' | 'dark' | 'auto' | 'blue'

export interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: 'light' | 'dark'
  toggleTheme: () => void
}

// Internationalization types
export type Language = 'en' | 'hi' | 'es' | 'fr'

export interface Translation {
  [key: string]: string | Translation
}

export interface I18nContextType {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string, params?: Record<string, string | number>) => string
  isRTL: boolean
}

// Analytics types
export interface AnalyticsEvent {
  event: string
  parameters?: Record<string, any>
  timestamp: string
  userAgent: string
  url: string
}

export interface ConversionEvent {
  type: string
  value?: number
  source?: string
  timestamp: string
}

export interface UserInteractionEvent {
  element: string
  action: string
  timestamp: string
}

// Component types
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
  children: React.ReactNode
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  className?: string
  'aria-label'?: string
}

export interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
  shadow?: 'none' | 'sm' | 'md' | 'lg'
  rounded?: 'none' | 'sm' | 'md' | 'lg'
  border?: boolean
  hover?: boolean
}

// Navigation types
export interface NavigationItem {
  name: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
  submenu?: NavigationItem[]
  external?: boolean
}

export interface NavigationProps {
  items: NavigationItem[]
  mobile?: boolean
  className?: string
}

// Form types
export interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'password' | 'tel' | 'url' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio'
  placeholder?: string
  required?: boolean
  validation?: {
    pattern?: RegExp
    minLength?: number
    maxLength?: number
    min?: number
    max?: number
  }
  options?: { value: string; label: string }[]
}

export interface FormProps {
  fields: FormField[]
  onSubmit: (data: Record<string, any>) => void
  loading?: boolean
  submitLabel?: string
  className?: string
}

// API types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  status?: number
}

export interface PaginatedResponse<T = any> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

// Energy data types (mock types for future use)
export interface EnergyAsset {
  id: string
  name: string
  type: 'solar' | 'wind' | 'hydro' | 'thermal' | 'nuclear'
  capacity: number
  location: {
    lat: number
    lng: number
    region: string
    country: string
  }
  status: 'active' | 'maintenance' | 'offline'
  efficiency: number
  lastUpdated: string
}

export interface MarketData {
  id: string
  timestamp: string
  region: string
  price: number
  demand: number
  supply: number
  renewablePercentage: number
  carbonIntensity: number
}

export interface BiddingData {
  id: string
  assetId: string
  timestamp: string
  quantity: number
  price: number
  status: 'pending' | 'accepted' | 'rejected' | 'executed'
  type: 'buy' | 'sell'
}

// User types
export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'analyst' | 'trader' | 'viewer'
  organization: string
  preferences: {
    theme: Theme
    language: Language
    timezone: string
    notifications: {
      email: boolean
      push: boolean
      sms: boolean
    }
  }
  lastLogin: string
  createdAt: string
}

// Organization types
export interface Organization {
  id: string
  name: string
  type: 'utility' | 'trader' | 'producer' | 'consultant' | 'regulator'
  size: 'startup' | 'medium' | 'large' | 'enterprise'
  region: string
  country: string
  subscription: {
    plan: 'free' | 'starter' | 'professional' | 'enterprise'
    status: 'active' | 'past_due' | 'canceled' | 'trialing'
    billing: 'monthly' | 'annual'
    expiresAt?: string
  }
  settings: {
    branding: {
      logo?: string
      primaryColor: string
      secondaryColor: string
    }
    features: string[]
    limits: {
      users: number
      dashboards: number
      apiCalls: number
      storage: number
    }
  }
}

// Feature flag types
export interface FeatureFlag {
  id: string
  key: string
  name: string
  description: string
  enabled: boolean
  conditions: {
    environments: string[]
    organizations: string[]
    userRoles: string[]
  }
  config: Record<string, any>
}

// Knowledge graph types
export interface GraphNode {
  id: string
  label: string
  type: 'asset' | 'market' | 'region' | 'user' | 'transaction'
  properties: Record<string, any>
  position?: {
    x: number
    y: number
  }
}

export interface GraphEdge {
  id: string
  source: string
  target: string
  label?: string
  type: 'connects' | 'influences' | 'trades_with' | 'located_in'
  weight: number
  properties: Record<string, any>
}

export interface KnowledgeGraph {
  nodes: GraphNode[]
  edges: GraphEdge[]
  metadata: {
    id: string
    name: string
    description: string
    createdAt: string
    updatedAt: string
    version: string
  }
}

// Collaboration types
export interface CollaborationSession {
  id: string
  dashboardId: string
  participants: User[]
  startedAt: string
  endedAt?: string
  activities: Activity[]
}

export interface Activity {
  id: string
  userId: string
  type: 'edit' | 'comment' | 'share' | 'view'
  target: string
  timestamp: string
  data: Record<string, any>
}

// Performance types
export interface PerformanceMetrics {
  loadTime: number
  renderTime: number
  bundleSize: number
  firstContentfulPaint: number
  largestContentfulPaint: number
  cumulativeLayoutShift: number
  firstInputDelay: number
  timeToInteractive: number
}

// Error types
export interface ErrorInfo {
  name: string
  message: string
  stack?: string
  componentStack?: string
  timestamp: string
  url: string
  userAgent: string
  userId?: string
  sessionId?: string
}

// Cookie consent types
export interface CookieConsent {
  necessary: boolean
  analytics: boolean
  marketing: boolean
  timestamp: string
  version: string
  userAgent: string
  ip?: string
}

// PWA types
export interface PWAInstallPrompt {
  canInstall: boolean
  prompt: any
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
}

export interface ServiceWorkerMessage {
  type: string
  payload?: any
}

// Newsletter types
export interface NewsletterSubscription {
  email: string
  preferences: {
    updates: boolean
    insights: boolean
    events: boolean
    security: boolean
  }
  source: string
  timestamp: string
}

// Social media types
export interface SocialLink {
  platform: 'twitter' | 'linkedin' | 'github' | 'youtube' | 'facebook'
  url: string
  handle?: string
  verified?: boolean
}

// Contact types
export interface ContactForm {
  name: string
  email: string
  company?: string
  phone?: string
  subject: string
  message: string
  source: string
  consent: {
    marketing: boolean
    terms: boolean
  }
  timestamp: string
}

// Status types
export interface SystemStatus {
  status: 'operational' | 'degraded' | 'down' | 'maintenance'
  uptime: number
  lastIncident?: string
  services: {
    name: string
    status: 'operational' | 'degraded' | 'down'
    lastCheck: string
    responseTime?: number
  }[]
}

// Sitemap types
export interface SitemapUrl {
  loc: string
  lastmod?: string
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority?: number
}