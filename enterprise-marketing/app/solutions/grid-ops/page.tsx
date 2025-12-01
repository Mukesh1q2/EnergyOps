import { Metadata } from 'next'
import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Grid Operations Solutions',
  description: 'Advanced grid management and optimization tools.',
}

export default function GridOpsPage() {
  return (
    <main className="min-h-screen">
      <Navigation />
      
      <div className="pt-24 pb-16 bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Grid Operations Solutions
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-12">
            Real-time grid management and optimization
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Load Balancing
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                AI-powered load balancing to optimize grid stability and efficiency.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Demand Response
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Automated demand response programs to manage peak loads effectively.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
