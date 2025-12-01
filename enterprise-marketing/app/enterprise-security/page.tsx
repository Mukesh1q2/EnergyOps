import { Metadata } from 'next'
import { EnterpriseSecurityPageContent } from '@/components/sections/EnterpriseSecurityPageContent'
import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'
import { CookieBanner } from '@/components/ui/CookieBanner'
import { EnterpriseSecuritySchema } from '@/components/sections/EnterpriseSecuritySchema'

export const metadata: Metadata = {
  title: 'Enterprise Security & Compliance | OptiBid Energy',
  description: 'Enterprise-grade security with SOC 2, ISO 27001, GDPR compliance, advanced encryption, and comprehensive audit trails.',
  keywords: 'enterprise security, compliance, SOC 2, ISO 27001, GDPR, data encryption, audit trails',
}

export default function EnterpriseSecurityPage() {
  return (
    <div>
      <EnterpriseSecuritySchema />
      
      <main id="main-content" className="relative min-h-screen">
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900/20 via-blue-900/20 to-indigo-900/20" />
        </div>
        
        <Navigation />
        
        <EnterpriseSecurityPageContent />
        
        <Footer />
        
        <CookieBanner />
      </main>
    </div>
  )
}
