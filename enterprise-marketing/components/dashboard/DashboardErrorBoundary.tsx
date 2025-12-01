'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import {
  ExclamationTriangleIcon,
  ArrowPathIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

/**
 * DashboardErrorBoundary - A specialized error boundary for dashboard components.
 * Provides graceful error handling and fallback UI for dashboard modals and widgets.
 * 
 * Validates: Requirements 6.2 - Error boundary displays fallback message instead of crashing
 */

interface DashboardErrorBoundaryProps {
  children: ReactNode
  /** Custom fallback UI to display when an error occurs */
  fallback?: ReactNode
  /** Callback when an error is caught */
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  /** Callback to close the modal/component when error occurs */
  onClose?: () => void
  /** Title for the error message */
  errorTitle?: string
  /** Description for the error message */
  errorDescription?: string
  /** Whether to show a close button */
  showCloseButton?: boolean
  /** Type of component being wrapped (affects styling) */
  componentType?: 'modal' | 'widget' | 'panel'
}

interface DashboardErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class DashboardErrorBoundary extends Component<DashboardErrorBoundaryProps, DashboardErrorBoundaryState> {
  constructor(props: DashboardErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): Partial<DashboardErrorBoundaryState> {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo })

    // Log error for debugging
    console.error('DashboardErrorBoundary caught an error:', error, errorInfo)

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  handleClose = () => {
    this.handleReset()
    if (this.props.onClose) {
      this.props.onClose()
    }
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      const {
        errorTitle = 'Something went wrong',
        errorDescription = 'This feature encountered an error. Please try again.',
        showCloseButton = true,
        componentType = 'modal'
      } = this.props

      // Modal-style error display
      if (componentType === 'modal') {
        return (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900">
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {errorTitle}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                    {errorDescription}
                  </p>
                  {process.env.NODE_ENV === 'development' && this.state.error && (
                    <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                      <p className="text-xs font-mono text-red-800 dark:text-red-200 break-all">
                        {this.state.error.message}
                      </p>
                    </div>
                  )}
                </div>
                {showCloseButton && (
                  <button
                    onClick={this.handleClose}
                    className="flex-shrink-0 ml-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
              <div className="mt-6 flex space-x-3">
                <button
                  onClick={this.handleReset}
                  className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <ArrowPathIcon className="w-4 h-4 mr-2" />
                  Try Again
                </button>
                {showCloseButton && (
                  <button
                    onClick={this.handleClose}
                    className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          </div>
        )
      }

      // Widget-style error display
      if (componentType === 'widget') {
        return (
          <div className="h-full flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg">
            <ExclamationTriangleIcon className="h-8 w-8 text-red-500 mb-2" />
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
              {errorTitle}
            </h4>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-center">
              {errorDescription}
            </p>
            <button
              onClick={this.handleReset}
              className="mt-3 inline-flex items-center px-3 py-1 text-xs font-medium rounded text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800"
            >
              <ArrowPathIcon className="w-3 h-3 mr-1" />
              Retry
            </button>
          </div>
        )
      }

      // Panel-style error display (default)
      return (
        <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-500 mr-3" />
            <div>
              <h4 className="text-sm font-medium text-red-800 dark:text-red-200">
                {errorTitle}
              </h4>
              <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                {errorDescription}
              </p>
            </div>
          </div>
          <div className="mt-4 flex space-x-3">
            <button
              onClick={this.handleReset}
              className="inline-flex items-center px-3 py-1 text-sm font-medium rounded text-red-700 dark:text-red-200 bg-red-100 dark:bg-red-900/40 hover:bg-red-200 dark:hover:bg-red-900/60"
            >
              <ArrowPathIcon className="w-4 h-4 mr-1" />
              Try Again
            </button>
            {showCloseButton && this.props.onClose && (
              <button
                onClick={this.handleClose}
                className="inline-flex items-center px-3 py-1 text-sm font-medium rounded text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Close
              </button>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default DashboardErrorBoundary
