import { Metadata } from 'next'
import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Latest insights and updates from OptiBid Energy.',
}

export default function BlogPage() {
  return (
    <main className="min-h-screen">
      <Navigation />
      
      <div className="pt-24 pb-16 bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Blog
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-12">
            Latest insights, updates, and industry trends
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <article className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              <div className="p-6">
                <div className="text-sm text-blue-600 dark:text-blue-400 mb-2">Nov 27, 2025</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  The Future of Energy Trading
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Exploring how AI and machine learning are transforming energy markets.
                </p>
                <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
                  Read more →
                </a>
              </div>
            </article>

            <article className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              <div className="p-6">
                <div className="text-sm text-blue-600 dark:text-blue-400 mb-2">Nov 20, 2025</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  India Energy Market Update
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Latest trends and opportunities in the Indian energy sector.
                </p>
                <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
                  Read more →
                </a>
              </div>
            </article>

            <article className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              <div className="p-6">
                <div className="text-sm text-blue-600 dark:text-blue-400 mb-2">Nov 15, 2025</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Quantum Computing in Energy
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  How quantum algorithms are revolutionizing portfolio optimization.
                </p>
                <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
                  Read more →
                </a>
              </div>
            </article>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
