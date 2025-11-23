'use client'

export default function LoadingFallback() {
  return (
    <div className="loading-fallback">
      <div className="loading-spinner" />
      <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
        Loading OptiBid Energy Platform...
      </p>
    </div>
  )
}
