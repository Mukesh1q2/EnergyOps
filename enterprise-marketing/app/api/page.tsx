import { Metadata } from 'next'
import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'API Reference',
  description: 'Complete API reference for OptiBid Energy platform.',
}

export default function ApiPage() {
  return (
    <main className="min-h-screen">
      <Navigation />
      
      <div className="pt-24 pb-16 bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            API Reference
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-12">
            RESTful API for integrating OptiBid Energy into your applications
          </p>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Available Endpoints
            </h2>
            
            <div className="space-y-6">
              <div className="border-l-4 border-blue-600 pl-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Market Data API
                </h3>
                <code className="text-sm text-gray-600 dark:text-gray-300">
                  GET /api/market-data
                </code>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  Retrieve real-time energy market data and pricing information.
                </p>
              </div>

              <div className="border-l-4 border-green-600 pl-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Trading API
                </h3>
                <code className="text-sm text-gray-600 dark:text-gray-300">
                  POST /api/trades
                </code>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  Execute energy trades programmatically.
                </p>
              </div>

              <div className="border-l-4 border-purple-600 pl-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Analytics API
                </h3>
                <code className="text-sm text-gray-600 dark:text-gray-300">
                  GET /api/analytics
                </code>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  Access AI-powered analytics and forecasts.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
