import { Metadata } from 'next'

export function generateMetadata(): Metadata {
  return {
    metadataBase: new URL('https://optibid-energy.com'),
    title: {
      default: 'Enterprise Security & Compliance | OptiBid Energy - Bank-Grade Protection',
      template: '%s | OptiBid Energy'
    },
    description: 'Comprehensive enterprise security platform with SOC 2 Type II certification, advanced encryption, SSO integration, and compliance framework for energy trading companies.',
    keywords: [
      'enterprise security',
      'SOC 2 compliance',
      'data encryption',
      'SSO integration',
      'enterprise access control',
      'security auditing',
      'compliance framework',
      'bank-grade security',
      'energy security',
      'cybersecurity compliance'
    ],
    authors: [{ name: 'OptiBid Energy Security Team' }],
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
      url: 'https://optibid-energy.com/enterprise-security',
      title: 'Enterprise Security & Compliance | OptiBid Energy',
      description: 'Comprehensive enterprise security platform with SOC 2 Type II certification, advanced encryption, SSO integration, and compliance framework for energy trading companies.',
      siteName: 'OptiBid Energy',
      images: [
        {
          url: '/images/security-og-image.jpg',
          width: 1200,
          height: 630,
          alt: 'OptiBid Enterprise Security & Compliance Platform',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Enterprise Security & Compliance | OptiBid Energy',
      description: 'Comprehensive enterprise security platform with SOC 2 Type II certification, advanced encryption, SSO integration, and compliance framework for energy trading companies.',
      images: ['/images/security-twitter-image.jpg'],
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

export function EnterpriseSecuritySchema() {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "OptiBid Enterprise Security Platform",
    "description": "Comprehensive enterprise security platform with SOC 2 Type II certification, advanced encryption, SSO integration, and compliance framework for energy trading companies.",
    "url": "https://optibid-energy.com/enterprise-security",
    "serviceType": "Cybersecurity Service",
    "provider": {
      "@type": "Organization",
      "name": "OptiBid Energy",
      "url": "https://optibid-energy.com"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Enterprise Security Features",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "SOC 2 Type II Compliance",
            "description": "Service Organization Control certification for security and availability"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "ISO 27001 Certification",
            "description": "Information Security Management System certification"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Enterprise SSO Integration",
            "description": "Seamless integration with enterprise identity providers"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Data Protection & Encryption",
            "description": "End-to-end encryption and comprehensive data protection"
          }
        }
      ]
    },
    "areaServed": {
      "@type": "Place",
      "name": "Global"
    },
    "availableChannel": {
      "@type": "ServiceChannel",
      "serviceUrl": "https://optibid-energy.com/contact",
      "servicePhone": "+1-555-SECURITY"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.95",
      "reviewCount": "1,247",
      "bestRating": "5",
      "worstRating": "1"
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