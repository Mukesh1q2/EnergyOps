import { Metadata } from 'next'
import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about OptiBid Energy and our mission to transform energy trading with AI-powered optimization.',
}

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <Navigation />
      
      <div className="pt-24 pb-16 bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl">
              About OptiBid Energy
            </h1>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
              Transforming energy trading with AI-powered optimization
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Mission</h2>
              <p className="text-gray-600 dark:text-gray-300">
                OptiBid Energy is revolutionizing the energy trading landscape with cutting-edge AI technology, 
                real-time analytics, and enterprise-grade solutions. We empower energy professionals to make 
                data-driven decisions and optimize their trading strategies.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Vision</h2>
              <p className="text-gray-600 dark:text-gray-300">
                To become the world's leading energy trading platform, enabling sustainable energy markets 
                through advanced technology, transparency, and innovation.
              </p>
            </div>
          </div>

          <div className="mt-16 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Why Choose Us</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">94.2%</div>
                <p className="text-gray-600 dark:text-gray-300">Price Forecast Accuracy</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">24/7</div>
                <p className="text-gray-600 dark:text-gray-300">Real-Time Monitoring</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">&lt;5ms</div>
                <p className="text-gray-600 dark:text-gray-300">Market Data Latency</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
