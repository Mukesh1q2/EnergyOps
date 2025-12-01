import { Metadata } from 'next'
import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Documentation',
  description: 'Complete documentation for OptiBid Energy platform.',
}

export default function DocsPage() {
  return (
    <main className="min-h-screen">
      <Navigation />
      
      <div className="pt-24 pb-16 bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Documentation
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-12">
            Everything you need to get started with OptiBid Energy
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link href="/docs/getting-started" className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <h3 className="text-xl font-semibold text-blue-600 dark:text-blue-400 mb-3">
                Getting Started
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Quick start guide to set up your account and begin trading.
              </p>
            </Link>

            <Link href="/docs/api" className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <h3 className="text-xl font-semibold text-blue-600 dark:text-blue-400 mb-3">
                API Reference
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Complete API documentation for developers.
              </p>
            </Link>

            <Link href="/docs/tutorials" className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <h3 className="text-xl font-semibold text-blue-600 dark:text-blue-400 mb-3">
                Tutorials
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Step-by-step tutorials for common use cases.
              </p>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
