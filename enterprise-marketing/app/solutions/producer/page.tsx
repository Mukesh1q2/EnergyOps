import { Metadata } from 'next'
import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Energy Producer Solutions',
  description: 'Optimize energy production and maximize revenue.',
}

export default function ProducerPage() {
  return (
    <main className="min-h-screen">
      <Navigation />
      
      <div className="pt-24 pb-16 bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Energy Producer Solutions
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-12">
            Maximize revenue from your energy production assets
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Production Optimization
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Optimize production schedules based on market prices and demand forecasts.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Revenue Maximization
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                AI-powered bidding strategies to maximize revenue from energy sales.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
