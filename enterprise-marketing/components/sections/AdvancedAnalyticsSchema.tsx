import { Metadata } from 'next'

export function generateMetadata(): Metadata {
  return {
    metadataBase: new URL('https://optibid-energy.com'),
    title: {
      default: 'Advanced Enterprise Analytics | OptiBid Energy - Real-time Market Intelligence',
      template: '%s | OptiBid Energy'
    },
    description: 'Enterprise-grade analytics platform with real-time market data, advanced KPIs, custom reporting, and AI-powered insights for energy trading professionals.',
    keywords: [
      'energy analytics',
      'market intelligence', 
      'real-time reporting',
      'enterprise KPIs',
      'energy trading analytics',
      'market data visualization',
      'AI analytics',
      'predictive analytics',
      'energy market data',
      'trading analytics'
    ],
    authors: [{ name: 'OptiBid Energy Team' }],
    creator: 'OptiBid Energy',
    publisher: 'OptiBid Energy',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: 'https://optibid-energy.com/advanced-analytics',
      title: 'Advanced Enterprise Analytics | OptiBid Energy',
      description: 'Enterprise-grade analytics platform with real-time market data, advanced KPIs, custom reporting, and AI-powered insights for energy trading professionals.',
      siteName: 'OptiBid Energy',
      images: [
        {
          url: '/images/analytics-og-image.jpg',
          width: 1200,
          height: 630,
          alt: 'OptiBid Advanced Enterprise Analytics Platform',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Advanced Enterprise Analytics | OptiBid Energy',
      description: 'Enterprise-grade analytics platform with real-time market data, advanced KPIs, custom reporting, and AI-powered insights for energy trading professionals.',
      images: ['/images/analytics-twitter-image.jpg'],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: 'your-google-verification-code',
    },
  }
}

export function AdvancedAnalyticsSchema() {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "OptiBid Advanced Analytics Platform",
    "description": "Enterprise-grade analytics platform with real-time market data, AI-powered insights, and advanced KPIs for energy trading.",
    "url": "https://optibid-energy.com/advanced-analytics",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "Custom",
      "priceCurrency": "USD",
      "availability": "InStock",
      "category": "Enterprise Software"
    },
    "featureList": [
      "Real-time market data integration",
      "AI-powered price forecasting",
      "Advanced KPI dashboards",
      "Risk assessment and optimization",
      "Custom reporting and analytics",
      "Multi-region deployment",
      "Enterprise security compliance"
    ],
    "provider": {
      "@type": "Organization",
      "name": "OptiBid Energy",
      "url": "https://optibid-energy.com"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "847",
      "bestRating": "5",
      "worstRating": "1"
    },
    "audience": {
      "@type": "BusinessAudience",
      "name": "Energy Trading Professionals"
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schemaData, null, 2)
      }}
    />
  )
}