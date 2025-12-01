import { Metadata } from 'next'
import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Try Demo',
  description: 'Experience OptiBid Energy platform with our interactive demo.',
}

export default function DemoPage() {
  return (
    <main className="min-h-screen">
      <Navigation />
      
      <div className="pt-24 pb-16 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl">
              Try OptiBid Energy Demo
            </h1>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
              Experience the power of AI-driven energy trading
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Explore Our Platform
            </h2>
            
            <div className="space-y-4">
              <Link
                href="/dashboard"
                className="block p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
              >
                <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-2">
                  Interactive Dashboard
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Explore real-time energy market data and analytics
                </p>
              </Link>

              <Link
                href="/india-energy-market"
                className="block p-6 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
              >
                <h3 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-2">
                  India Energy Market
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Live IEX India market data and trading insights
                </p>
              </Link>

              <Link
                href="/ai-intelligence"
                className="block p-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
              >
                <h3 className="text-lg font-semibold text-purple-600 dark:text-purple-400 mb-2">
                  AI Intelligence
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  AI-powered price forecasting and risk assessment
                </p>
              </Link>

              <Link
                href="/quantum-applications"
                className="block p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
              >
                <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 mb-2">
                  Quantum Applications
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Advanced quantum computing for portfolio optimization
                </p>
              </Link>
            </div>

            <div className="mt-8 text-center">
              <Link
                href="/signup"
                className="inline-block px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
