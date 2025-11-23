import { Metadata } from 'next'
import { EnterprisePageContent } from '@/components/sections/EnterprisePageContent'
import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'
import { CookieBanner } from '@/components/ui/CookieBanner'
import { EnterpriseSchema } from '@/components/sections/EnterpriseSchema'

export const metadata: Metadata = {
  title: 'Enterprise Energy Trading Solutions | OptiBid Energy',
  description: 'Scale your energy trading operations with our enterprise platform. Advanced analytics, AI optimization, and industry-leading security for Fortune 500 energy companies.',
  keywords: 'enterprise energy trading, energy trading software, enterprise energy analytics, energy market solutions, energy trading platform',
}

export default function EnterprisePage() {
  return (
    <>
      {/* Structured Data for SEO */}
      <EnterpriseSchema />
      
      <main id="main-content" className="relative min-h-screen">
        {/* Dynamic Energy Flow Background */}
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-indigo-900/20" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.03"%3E%3Ccircle cx="30" cy="30" r="1.5"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30" />
        </div>
        
        {/* Navigation */}
        <Navigation />
        
        {/* Enterprise Page Content */}
        <EnterprisePageContent />
        
        {/* Footer */}
        <Footer />
        
        {/* Cookie Banner */}
        <CookieBanner />
      </main>
    </>
  )
}