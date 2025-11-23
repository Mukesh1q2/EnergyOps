'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import {
  ExclamationTriangleIcon,
  ArrowPathIcon,
  HomeIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'
import { clsx } from 'clsx'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  showDetails?: boolean
  level?: 'page' | 'component' | 'widget'
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    })

    // Call the optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // In production, you might want to log this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: logErrorToService(error, errorInfo)
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      const { level = 'component', showDetails = false } = this.props

      if (level === 'page') {
        return <PageLevelError error={this.state.error} onReload={this.handleReload} onGoHome={this.handleGoHome} />
      }

      if (level === 'widget') {
        return <WidgetLevelError error={this.state.error} onReset={this.handleReset} showDetails={showDetails} />
      }

      return <ComponentLevelError error={this.state.error} onReset={this.handleReset} showDetails={showDetails} />
    }

    return this.props.children
  }
}

// Page-level error display
function PageLevelError({ error, onReload, onGoHome }: { 
  error: Error | null
  onReload: () => void
  onGoHome: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 dark:bg-red-900 rounded-full">
          <ExclamationTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
        </div>
        <div className="mt-4 text-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Something went wrong
          </h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            We're sorry, but something unexpected happened. Please try refreshing the page or contact support if the problem persists.
          </p>
          {process.env.NODE_ENV === 'development' && error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-left">
              <p className="text-sm font-mono text-red-800 dark:text-red-200">
                {error.message}
              </p>
            </div>
          )}
          <div className="mt-6 flex space-x-3">
            <button
              onClick={onReload}
              className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowPathIcon className="w-4 h-4 mr-2" />
              Reload Page
            </button>
            <button
              onClick={onGoHome}
              className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <HomeIcon className="w-4 h-4 mr-2" />
              Go Home
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Component-level error display
function ComponentLevelError({ error, onReset, showDetails }: {
  error: Error | null
  onReset: () => void
  showDetails: boolean
}) {
  return (
    <div className="flex items-center justify-center p-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
      <div className="text-center max-w-sm">
        <ExclamationTriangleIcon className="mx-auto h-8 w-8 text-red-500" />
        <h4 className="mt-2 text-sm font-medium text-red-800 dark:text-red-200">
          Component Error
        </h4>
        <p className="mt-1 text-sm text-red-700 dark:text-red-300">
          This component encountered an error and couldn't load properly.
        </p>
        {showDetails && process.env.NODE_ENV === 'development' && error && (
          <div className="mt-3 p-2 bg-red-100 dark:bg-red-900/40 border border-red-300 dark:border-red-700 rounded text-left">
            <p className="text-xs font-mono text-red-800 dark:text-red-200 break-all">
              {error.message}
            </p>
          </div>
        )}
        <button
          onClick={onReset}
          className="mt-3 inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-red-700 dark:text-red-200 bg-red-100 dark:bg-red-900/40 hover:bg-red-200 dark:hover:bg-red-900/60"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}

// Widget-level error display (for dashboard widgets)
function WidgetLevelError({ error, onReset, showDetails }: {
  error: Error | null
  onReset: () => void
  showDetails: boolean
}) {
  return (
    <div className="h-full flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-10 w-10 rounded-full bg-red-100 dark:bg-red-900">
          <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
        </div>
        <h3 className="mt-3 text-sm font-medium text-gray-900 dark:text-white">
          Widget Error
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Failed to load widget data
        </p>
        <div className="mt-4 space-y-2">
          <button
            onClick={onReset}
            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800"
          >
            <ArrowPathIcon className="w-3 h-3 mr-1" />
            Retry
          </button>
          {showDetails && process.env.NODE_ENV === 'development' && error && (
            <details className="text-left">
              <summary className="text-xs text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-200">
                Error Details
              </summary>
              <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-xs font-mono text-red-800 dark:text-red-200">
                {error.message}
              </div>
            </details>
          )}
        </div>
      </div>
    </div>
  )
}

// HOC for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
}

// Hook for manual error reporting
export function useErrorHandler() {
  return (error: Error, errorInfo?: ErrorInfo) => {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Manual error report:', error, errorInfo)
    }
    
    // In production, you would send this to an error reporting service
    // Example: reportError(error, errorInfo)
  }
}

export default ErrorBoundary