import { Metadata } from 'next'
import { PricingSection } from '@/components/sections/PricingSection'
import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'
import { CookieBanner } from '@/components/ui/CookieBanner'

export const metadata: Metadata = {
  title: 'Pricing Plans | OptiBid Energy - Enterprise Energy Trading',
  description: 'Choose the perfect plan for your energy trading needs. From free development tier to enterprise solutions with advanced AI, SSO, and compliance features.',
  keywords: 'energy trading pricing, enterprise software plans, energy analytics cost, grid optimization pricing',
}

export default function PricingPage() {
  return (
    <main id="main-content" className="relative min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Navigation */}
      <Navigation />
      
      {/* Pricing Section */}
      <PricingSection />
      
      {/* FAQ Preview Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="font-semibold text-gray-900 mb-2">Is OptiBid free during development?</h3>
              <p className="text-gray-600 text-sm">Yes — full-feature access for registered users while we develop. Usage limits may apply.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="font-semibold text-gray-900 mb-2">What authentication methods are supported?</h3>
              <p className="text-gray-600 text-sm">Email/password, MFA, SSO via SAML/OIDC, SCIM provisioning for enterprise customers.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="font-semibold text-gray-900 mb-2">Can we deploy OptiBid on-premise?</h3>
              <p className="text-gray-600 text-sm">Enterprise supports hybrid and on-prem deployment with LLM & data residency options.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="font-semibold text-gray-900 mb-2">How do you ensure data security?</h3>
              <p className="text-gray-600 text-sm">TLS, RBAC, audit logs, KMS encryption, vulnerability scanning, and SOC2/ISO programs.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <Footer />
      
      {/* Cookie Banner */}
      <CookieBanner />
    </main>
  )
}