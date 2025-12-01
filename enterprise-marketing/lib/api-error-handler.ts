/**
 * Centralized API Error Handler
 * Provides consistent error handling across all API calls in the dashboard.
 * 
 * Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5
 */

import toast from 'react-hot-toast'

/**
 * API Error types for categorization
 */
export enum APIErrorType {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  NOT_FOUND = 'not_found',
  SERVER_ERROR = 'server_error',
  NETWORK = 'network',
  SERVICE_UNAVAILABLE = 'service_unavailable',
  UNKNOWN = 'unknown'
}

/**
 * Structured API error with user-friendly message and details
 */
export interface APIError {
  type: APIErrorType
  message: string
  userMessage: string
  status?: number
  details?: Record<string, string[]>
  retryable: boolean
  originalError?: Error
}

/**
 * Options for API error handling
 */
export interface ErrorHandlerOptions {
  /** Show toast notification for errors */
  showToast?: boolean
  /** Redirect to login on 401 */
  redirectOnAuth?: boolean
  /** Custom error messages by status code */
  customMessages?: Record<number, string>
  /** Callback when error occurs */
  onError?: (error: APIError) => void
}

const DEFAULT_OPTIONS: ErrorHandlerOptions = {
  showToast: true,
  redirectOnAuth: true
}

/**
 * Maps HTTP status codes to error types
 */
function getErrorType(status: number): APIErrorType {
  switch (status) {
    case 401:
      return APIErrorType.AUTHENTICATION
    case 403:
      return APIErrorType.AUTHORIZATION
    case 400:
    case 422:
      return APIErrorType.VALIDATION
    case 404:
      return APIErrorType.NOT_FOUND
    case 503:
      return APIErrorType.SERVICE_UNAVAILABLE
    case 500:
    case 502:
    case 504:
      return APIErrorType.SERVER_ERROR
    default:
      return APIErrorType.UNKNOWN
  }
}

/**
 * Gets user-friendly message based on error type
 * Validates: Requirements 7.1 - Display user-friendly error messages
 */
function getUserMessage(type: APIErrorType, status?: number, serverMessage?: string): string {
  switch (type) {
    case APIErrorType.AUTHENTICATION:
      return 'Your session has expired. Please log in again.'
    case APIErrorType.AUTHORIZATION:
      return 'You do not have permission to perform this action.'
    case APIErrorType.VALIDATION:
      return serverMessage || 'Please check your input and try again.'
    case APIErrorType.NOT_FOUND:
      return 'The requested resource was not found.'
    case APIErrorType.SERVICE_UNAVAILABLE:
      return 'Service is temporarily unavailable. Please try again in a few moments.'
    case APIErrorType.SERVER_ERROR:
      return 'Something went wrong on our end. Please try again later.'
    case APIErrorType.NETWORK:
      return 'Unable to connect. Please check your internet connection.'
    default:
      return serverMessage || 'An unexpected error occurred. Please try again.'
  }
}

/**
 * Determines if an error is retryable
 */
function isRetryable(type: APIErrorType): boolean {
  return [
    APIErrorType.NETWORK,
    APIErrorType.SERVICE_UNAVAILABLE,
    APIErrorType.SERVER_ERROR
  ].includes(type)
}

/**
 * Parses validation errors from API response
 * Validates: Requirements 7.4 - Display specific field-level error messages
 */
async function parseValidationErrors(response: Response): Promise<Record<string, string[]> | undefined> {
  try {
    const data = await response.clone().json()
    if (data.errors && typeof data.errors === 'object') {
      return data.errors
    }
    if (data.detail && Array.isArray(data.detail)) {
      // FastAPI validation error format
      const errors: Record<string, string[]> = {}
      data.detail.forEach((err: any) => {
        const field = err.loc?.join('.') || 'general'
        if (!errors[field]) errors[field] = []
        errors[field].push(err.msg)
      })
      return errors
    }
  } catch {
    // Ignore parsing errors
  }
  return undefined
}

/**
 * Extracts error message from API response
 */
async function extractErrorMessage(response: Response): Promise<string | undefined> {
  try {
    const data = await response.clone().json()
    return data.message || data.error || data.detail
  } catch {
    return undefined
  }
}

/**
 * Centralized API response handler
 * Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5
 * 
 * @param response - Fetch Response object
 * @param options - Error handling options
 * @returns Parsed response data
 * @throws APIError on failure
 */
export async function handleAPIResponse<T>(
  response: Response,
  options: ErrorHandlerOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  if (response.ok) {
    try {
      return await response.json()
    } catch {
      // Response might be empty (204 No Content)
      return {} as T
    }
  }

  // Handle error responses
  const errorType = getErrorType(response.status)
  const serverMessage = await extractErrorMessage(response)
  const validationErrors = errorType === APIErrorType.VALIDATION 
    ? await parseValidationErrors(response) 
    : undefined

  const userMessage = opts.customMessages?.[response.status] 
    || getUserMessage(errorType, response.status, serverMessage)

  const apiError: APIError = {
    type: errorType,
    message: serverMessage || response.statusText,
    userMessage,
    status: response.status,
    details: validationErrors,
    retryable: isRetryable(errorType)
  }

  // Log error for debugging
  // Validates: Requirements 7.2 - Log detailed error information to console
  console.error('API Error:', {
    url: response.url,
    status: response.status,
    type: errorType,
    message: serverMessage,
    details: validationErrors
  })

  // Handle authentication failure
  // Validates: Requirements 7.3 - Redirect to login on 401
  if (errorType === APIErrorType.AUTHENTICATION && opts.redirectOnAuth) {
    localStorage.removeItem('optibid_access_token')
    localStorage.removeItem('optibid_refresh_token')
    
    if (typeof window !== 'undefined') {
      // Show toast before redirect
      if (opts.showToast) {
        toast.error(userMessage)
      }
      // Small delay to allow toast to show
      setTimeout(() => {
        window.location.href = '/login'
      }, 1000)
    }
  }

  // Show toast notification
  // Validates: Requirements 7.1 - Display user-friendly error message
  if (opts.showToast && errorType !== APIErrorType.AUTHENTICATION) {
    if (apiError.retryable) {
      toast.error(userMessage, {
        duration: 5000,
        icon: '🔄'
      })
    } else {
      toast.error(userMessage)
    }
  }

  // Call custom error handler
  if (opts.onError) {
    opts.onError(apiError)
  }

  throw apiError
}

/**
 * Handles network/fetch errors
 * Validates: Requirements 7.5 - Display service unavailable message with retry options
 */
export function handleNetworkError(error: Error, options: ErrorHandlerOptions = {}): APIError {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  const apiError: APIError = {
    type: APIErrorType.NETWORK,
    message: error.message,
    userMessage: 'Unable to connect. Please check your internet connection and try again.',
    retryable: true,
    originalError: error
  }

  console.error('Network Error:', error)

  if (opts.showToast) {
    toast.error(apiError.userMessage, {
      duration: 5000,
      icon: '📡'
    })
  }

  if (opts.onError) {
    opts.onError(apiError)
  }

  return apiError
}

/**
 * Wrapper for fetch that includes centralized error handling
 */
export async function fetchWithErrorHandling<T>(
  url: string,
  init?: RequestInit,
  options?: ErrorHandlerOptions
): Promise<T> {
  try {
    const response = await fetch(url, init)
    return await handleAPIResponse<T>(response, options)
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw handleNetworkError(error, options)
    }
    throw error
  }
}

/**
 * Creates an authenticated fetch wrapper with error handling
 */
export function createAuthenticatedFetch(getToken: () => string | null) {
  return async function<T>(
    url: string,
    init?: RequestInit,
    options?: ErrorHandlerOptions
  ): Promise<T> {
    const token = getToken()
    const headers = new Headers(init?.headers)
    
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
    headers.set('Content-Type', 'application/json')

    return fetchWithErrorHandling<T>(
      url,
      { ...init, headers },
      options
    )
  }
}

/**
 * Default authenticated fetch using localStorage token
 */
export const authFetch = createAuthenticatedFetch(
  () => localStorage.getItem('optibid_access_token')
)

/**
 * Utility to format validation errors for display
 */
export function formatValidationErrors(details?: Record<string, string[]>): string[] {
  if (!details) return []
  
  return Object.entries(details).flatMap(([field, messages]) =>
    messages.map(msg => field === 'general' ? msg : `${field}: ${msg}`)
  )
}

/**
 * Safe state update with rollback on API failure
 * Validates: Requirements 8.5 - Optimistic update with rollback
 */
export async function safeStateUpdate<T, R>(
  optimisticUpdate: () => void,
  apiCall: () => Promise<R>,
  rollback: () => void,
  options?: ErrorHandlerOptions
): Promise<R> {
  // Apply optimistic update
  optimisticUpdate()
  
  try {
    // Make API call
    const result = await apiCall()
    return result
  } catch (error) {
    // Rollback on failure
    rollback()
    
    // Re-throw for caller to handle
    throw error
  }
}
