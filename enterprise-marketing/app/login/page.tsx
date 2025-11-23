import { Metadata } from 'next'
import { LoginSignupContent } from '@/components/sections/LoginSignupContent'
import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'
import { CookieBanner } from '@/components/ui/CookieBanner'

export const metadata: Metadata = {
  title: 'Login | OptiBid Energy - Access Your Energy Trading Platform',
  description: 'Login to OptiBid Energy platform with email/password, SSO, or social authentication. Enterprise-grade security with MFA support.',
  keywords: 'energy trading login, OptiBid signin, enterprise authentication, SSO login',
}

export default function LoginPage() {
  return (
    <main id="main-content" className="relative min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Navigation */}
      <Navigation />
      
      {/* Login Signup Content */}
      <LoginSignupContent />
      
      {/* Footer */}
      <Footer />
      
      {/* Cookie Banner */}
      <CookieBanner />
    </main>
  )
}