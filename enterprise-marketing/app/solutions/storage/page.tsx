import { Metadata } from 'next'
import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Energy Storage Solutions',
  description: 'Optimize energy storage operations and maximize returns.',
}

export default function StoragePage() {
  return (
    <main className="min-h-screen">
      <Navigation />
      
      <div className="pt-24 pb-16 bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Energy Storage Solutions
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-12">
            Intelligent energy storage management and optimization
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Charge/Discharge Optimization
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                AI-driven strategies to optimize when to charge and discharge storage systems.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Arbitrage Opportunities
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Identify and capitalize on price arbitrage opportunities in energy markets.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
