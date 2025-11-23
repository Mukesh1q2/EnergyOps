import './globals.css'
import './critical.css'
import { Inter } from 'next/font/google'
import { Providers } from './providers-simple'
import LayoutClient from './layout-client'
import StyleErrorBoundary from '@/components/common/StyleErrorBoundary'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'OptiBid Energy Platform',
  description: 'Advanced energy bidding and trading platform with AI-powered optimization',
  keywords: ['energy', 'bidding', 'trading', 'renewable', 'solar', 'wind', 'india', 'electricity', 'market', 'dashboard'],
  authors: [{ name: 'MiniMax Agent' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#0ea5e9',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preload critical fonts */}
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* Fallback noscript message */}
        <noscript>
          <style>{`
            .loading-fallback {
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              flex-direction: column;
              gap: 1rem;
            }
          `}</style>
        </noscript>
      </head>
      <body className={`${inter.className} antialiased bg-gray-50 dark:bg-gray-900`}>
        <StyleErrorBoundary>
          <Providers>
            <LayoutClient>{children}</LayoutClient>
          </Providers>
        </StyleErrorBoundary>
        <noscript>
          <div className="loading-fallback">
            <h1>JavaScript Required</h1>
            <p>Please enable JavaScript to use the OptiBid Energy Platform.</p>
          </div>
        </noscript>
      </body>
    </html>
  )
}