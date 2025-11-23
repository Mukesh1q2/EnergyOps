'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class StyleErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[StyleErrorBoundary] Caught error:', error, errorInfo)
    
    // Check if it's a style loading error
    if (
      error.message.includes('CSS') ||
      error.message.includes('style') ||
      error.message.includes('stylesheet')
    ) {
      console.error('[StyleErrorBoundary] Style loading error detected')
      
      // Try to reload styles
      this.reloadStyles()
    }
  }

  reloadStyles = () => {
    // Find all stylesheet links
    const stylesheets = document.querySelectorAll('link[rel="stylesheet"]')
    
    stylesheets.forEach((link) => {
      const href = link.getAttribute('href')
      if (href) {
        // Add cache-busting parameter
        const newHref = href.includes('?')
          ? `${href}&reload=${Date.now()}`
          : `${href}?reload=${Date.now()}`
        
        link.setAttribute('href', newHref)
      }
    })
  }

  handleReload = () => {
    // Clear cache and reload
    if ('caches' in window) {
      caches.keys().then((names) => {
        names.forEach((name) => {
          caches.delete(name)
        })
      })
    }
    
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '2rem',
            textAlign: 'center',
            backgroundColor: '#f9fafb',
          }}>
            <svg
              style={{ width: '64px', height: '64px', color: '#dc2626', marginBottom: '1rem' }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: 600,
              color: '#111827',
              marginBottom: '0.5rem',
            }}>
              Style Loading Error
            </h1>
            <p style={{
              color: '#6b7280',
              maxWidth: '500px',
              marginBottom: '1.5rem',
            }}>
              The application styles failed to load properly. This might be due to cached files.
              Please try refreshing the page.
            </p>
            <button
              onClick={this.handleReload}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 500,
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#2563eb'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#3b82f6'
              }}
            >
              Refresh Page
            </button>
            {this.state.error && (
              <details style={{
                marginTop: '2rem',
                padding: '1rem',
                backgroundColor: '#fee2e2',
                borderRadius: '0.375rem',
                maxWidth: '600px',
                textAlign: 'left',
              }}>
                <summary style={{
                  cursor: 'pointer',
                  fontWeight: 500,
                  color: '#991b1b',
                }}>
                  Error Details
                </summary>
                <pre style={{
                  marginTop: '0.5rem',
                  fontSize: '0.75rem',
                  color: '#7f1d1d',
                  overflow: 'auto',
                }}>
                  {this.state.error.message}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
