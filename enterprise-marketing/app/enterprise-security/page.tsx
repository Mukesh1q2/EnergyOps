import { Metadata } from 'next'
import { EnterpriseSecurityPageContent } from '@/components/sections/EnterpriseSecurityPageContent'
import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'
import { CookieBanner } from '@/components/ui/CookieBanner'
import { EnterpriseSecuritySchema } from '@/components/sections/EnterpriseSecuritySchema'

export const metadata: Metadata = {
  title: 'Enterprise Security & Compliance | OptiBid Energy - Bank-Grade Protection',
  description: 'Comprehensive enterprise security platform with SOC 2 Type II certification, advanced encryption, SSO integration, and compliance framework for energy trading companies.',
  keywords: 'enterprise security, SOC 2 compliance, data encryption, SSO integration, enterprise access control, security auditing, compliance framework',
}

export default function EnterpriseSecurityPage() {
  return (
    <>
      {/* Structured Data for SEO */}
      <EnterpriseSecuritySchema />
      
      <main id="main-content" className="relative min-h-screen">
        {/* Security Background */}
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 via-blue-900/20 to-indigo-900/20" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%23ffffff" fill-opacity="0.02"%3E%3Cpath d="M20 20c0 11.046-8.954 20-20 20v-40c11.046 0 20 8.954 20 20z"/%3E%3C/g%3E%3C/svg%3E')] opacity-30" />
        </div>
        
        {/* Navigation */}
        <Navigation />
        
        {/* Enterprise Security Content */}
        <EnterpriseSecurityPageContent />
        
        {/* Footer */}
        <Footer />
        
        {/* Cookie Banner */}
        <CookieBanner />
      </main>
    </>
  )
}