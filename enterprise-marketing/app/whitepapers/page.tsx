import { Metadata } from 'next'
import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Whitepapers',
  description: 'In-depth research and technical papers on energy trading.',
}

export default function WhitepapersPage() {
  return (
    <main className="min-h-screen">
      <Navigation />
      
      <div className="pt-24 pb-16 bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Whitepapers
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-12">
            In-depth research and technical insights
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                AI-Powered Energy Trading: A Technical Overview
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Comprehensive analysis of machine learning algorithms used in energy market forecasting.
              </p>
              <button className="text-blue-600 dark:text-blue-400 hover:underline">
                Download PDF →
              </button>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Quantum Computing Applications in Portfolio Optimization
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Exploring how quantum algorithms can solve complex optimization problems in energy trading.
              </p>
              <button className="text-blue-600 dark:text-blue-400 hover:underline">
                Download PDF →
              </button>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                The Future of Energy Markets in India
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Market analysis and growth opportunities in the Indian energy sector.
              </p>
              <button className="text-blue-600 dark:text-blue-400 hover:underline">
                Download PDF →
              </button>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Risk Management in Energy Trading
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Best practices and advanced techniques for managing trading risk.
              </p>
              <button className="text-blue-600 dark:text-blue-400 hover:underline">
                Download PDF →
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
