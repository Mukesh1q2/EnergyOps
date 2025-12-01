import { Metadata } from 'next'
import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Case Studies',
  description: 'Success stories from OptiBid Energy customers.',
}

export default function CaseStudiesPage() {
  return (
    <main className="min-h-screen">
      <Navigation />
      
      <div className="pt-24 pb-16 bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Case Studies
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-12">
            Real-world success stories from our customers
          </p>

          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Major Utility Company Reduces Trading Costs by 35%
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Learn how a leading utility company leveraged OptiBid Energy's AI-powered platform 
                to optimize their trading strategies and significantly reduce operational costs.
              </p>
              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <span>Industry: Utilities</span>
                <span>•</span>
                <span>Region: North America</span>
                <span>•</span>
                <span>Results: 35% cost reduction</span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Renewable Energy Producer Maximizes Revenue
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Discover how a renewable energy producer used our platform to optimize bidding 
                strategies and increase revenue by 28% in the first year.
              </p>
              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <span>Industry: Renewable Energy</span>
                <span>•</span>
                <span>Region: Europe</span>
                <span>•</span>
                <span>Results: 28% revenue increase</span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Energy Storage Operator Optimizes Operations
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                See how an energy storage operator improved charge/discharge efficiency and 
                captured more arbitrage opportunities using our AI algorithms.
              </p>
              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <span>Industry: Energy Storage</span>
                <span>•</span>
                <span>Region: Asia Pacific</span>
                <span>•</span>
                <span>Results: 42% efficiency gain</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
