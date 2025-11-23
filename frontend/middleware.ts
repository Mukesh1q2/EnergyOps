import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Add cache control headers for static assets
  const pathname = request.nextUrl.pathname
  
  // Static assets should be cached with immutable flag
  if (
    pathname.startsWith('/_next/static/') ||
    pathname.startsWith('/_next/image/')
  ) {
    response.headers.set(
      'Cache-Control',
      'public, max-age=31536000, immutable'
    )
  }
  
  // HTML pages should not be cached
  if (pathname.endsWith('.html') || pathname === '/') {
    response.headers.set(
      'Cache-Control',
      'no-cache, no-store, must-revalidate'
    )
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
  }
  
  // Add ETag for all responses
  const etag = `"${Date.now()}-${Math.random().toString(36).substring(7)}"`
  response.headers.set('ETag', etag)
  
  // Check if client has matching ETag
  const clientEtag = request.headers.get('if-none-match')
  if (clientEtag && clientEtag === etag) {
    return new NextResponse(null, { status: 304 })
  }
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/webpack-hmr (hot module replacement)
     */
    '/((?!api|_next/webpack-hmr).*)',
  ],
}
