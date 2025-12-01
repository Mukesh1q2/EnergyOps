'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  XMarkIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  XCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import { APIError, APIErrorType, formatValidationErrors } from '@/lib/api-error-handler'

/**
 * Error Notification Component
 * Displays user-friendly error messages with retry options for recoverable errors.
 * 
 * Validates: Requirements 7.1, 7.5
 */

interface ErrorNotificationProps {
  error: APIError | null
  onDismiss: () => void
  onRetry?: () => void
  className?: string
  /** Auto-dismiss after this many milliseconds (0 = no auto-dismiss) */
  autoDismiss?: number
}

export function ErrorNotification({
  error,
  onDismiss,
  onRetry,
  className = '',
  autoDismiss = 0
}: ErrorNotificationProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (error) {
      setIsVisible(true)
      
      if (autoDismiss > 0) {
        const timer = setTimeout(() => {
          setIsVisible(false)
          setTimeout(onDismiss, 300) // Wait for animation
        }, autoDismiss)
        return () => clearTimeout(timer)
      }
    } else {
      setIsVisible(false)
    }
  }, [error, autoDismiss, onDismiss])

  const handleDismiss = () => {
    setIsVisible(false)
    setTimeout(onDismiss, 300)
  }

  const getIcon = () => {
    switch (error?.type) {
      case APIErrorType.AUTHENTICATION:
      case APIErrorType.AUTHORIZATION:
        return <XCircleIcon className="h-5 w-5 text-red-500" />
      case APIErrorType.VALIDATION:
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
      case APIErrorType.NETWORK:
      case APIErrorType.SERVICE_UNAVAILABLE:
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />
      default:
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
    }
  }

  const getBackgroundColor = () => {
    switch (error?.type) {
      case APIErrorType.VALIDATION:
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
      case APIErrorType.NETWORK:
      case APIErrorType.SERVICE_UNAVAILABLE:
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
      default:
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
    }
  }

  const validationErrors = formatValidationErrors(error?.details)

  return (
    <AnimatePresence>
      {isVisible && error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className={`rounded-lg border p-4 ${getBackgroundColor()} ${className}`}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {getIcon()}
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                {error.userMessage}
              </h3>
              
              {/* Validation errors list */}
              {validationErrors.length > 0 && (
                <ul className="mt-2 text-sm text-gray-700 dark:text-gray-300 list-disc list-inside">
                  {validationErrors.map((msg, idx) => (
                    <li key={idx}>{msg}</li>
                  ))}
                </ul>
              )}

              {/* Retry button for recoverable errors */}
              {error.retryable && onRetry && (
                <div className="mt-3">
                  <button
                    onClick={onRetry}
                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/40 hover:bg-blue-200 dark:hover:bg-blue-900/60 transition-colors"
                  >
                    <ArrowPathIcon className="h-4 w-4 mr-1.5" />
                    Try Again
                  </button>
                </div>
              )}
            </div>
            <div className="ml-4 flex-shrink-0">
              <button
                onClick={handleDismiss}
                className="inline-flex text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/**
 * Inline error display for form fields
 * Validates: Requirements 7.4 - Display specific field-level error messages
 */
interface FieldErrorProps {
  error?: string | string[]
  className?: string
}

export function FieldError({ error, className = '' }: FieldErrorProps) {
  if (!error) return null

  const errors = Array.isArray(error) ? error : [error]

  return (
    <div className={`mt-1 ${className}`}>
      {errors.map((msg, idx) => (
        <p key={idx} className="text-sm text-red-600 dark:text-red-400">
          {msg}
        </p>
      ))}
    </div>
  )
}

/**
 * Service unavailable banner with countdown
 * Validates: Requirements 7.5 - Display service unavailable message with retry options
 */
interface ServiceUnavailableBannerProps {
  onRetry: () => void
  retryCountdown?: number
  className?: string
}

export function ServiceUnavailableBanner({
  onRetry,
  retryCountdown = 30,
  className = ''
}: ServiceUnavailableBannerProps) {
  const [countdown, setCountdown] = useState(retryCountdown)
  const [isRetrying, setIsRetrying] = useState(false)

  useEffect(() => {
    if (countdown <= 0) {
      handleRetry()
      return
    }

    const timer = setInterval(() => {
      setCountdown(prev => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [countdown])

  const handleRetry = async () => {
    setIsRetrying(true)
    try {
      await onRetry()
    } finally {
      setIsRetrying(false)
      setCountdown(retryCountdown)
    }
  }

  return (
    <div className={`bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-3" />
          <div>
            <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Service Temporarily Unavailable
            </h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
              We're experiencing some issues. {countdown > 0 ? `Retrying in ${countdown}s...` : 'Retrying now...'}
            </p>
          </div>
        </div>
        <button
          onClick={handleRetry}
          disabled={isRetrying}
          className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-yellow-700 dark:text-yellow-200 bg-yellow-100 dark:bg-yellow-900/40 hover:bg-yellow-200 dark:hover:bg-yellow-900/60 disabled:opacity-50 transition-colors"
        >
          {isRetrying ? (
            <>
              <ArrowPathIcon className="h-4 w-4 mr-1.5 animate-spin" />
              Retrying...
            </>
          ) : (
            <>
              <ArrowPathIcon className="h-4 w-4 mr-1.5" />
              Retry Now
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default ErrorNotification
