'use client'

import { SectionWrapper } from '@/components/ui/SectionWrapper'
import { motion } from 'framer-motion'
import { 
  AcademicCapIcon,
  PlayIcon,
  DocumentTextIcon,
  CogIcon,
  ChatBubbleLeftRightIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline'

export default function TutorialsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SectionWrapper>
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center px-4 py-2 rounded-full bg-yellow-100 text-yellow-800 text-sm font-medium mb-6"
            >
              <AcademicCapIcon className="h-4 w-4 mr-2" />
              Learn by Doing
            </motion.div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              API <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">Tutorials</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Master OptiBid Energy API integration with our hands-on tutorials. From basic setup to advanced automation, 
              learn through practical examples and real-world scenarios.
            </p>
          </div>

          {/* Tutorial Categories */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Tutorial Categories</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Getting Started</h3>
                <p className="text-gray-600 mb-4">
                  Learn the basics of API authentication, environment setup, and your first API calls.
                </p>
                <div className="text-sm text-gray-500">3 tutorials • 45 minutes</div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
              >
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                  <PlayIcon className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Trading Automation</h3>
                <p className="text-gray-600 mb-4">
                  Build automated trading strategies using market data, alerts, and execution APIs.
                </p>
                <div className="text-sm text-gray-500">5 tutorials • 2 hours</div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
              >
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                  <CogIcon className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Advanced Integration</h3>
                <p className="text-gray-600 mb-4">
                  Master WebSocket streaming, error handling, rate limiting, and production deployment.
                </p>
                <div className="text-sm text-gray-500">4 tutorials • 1.5 hours</div>
              </motion.div>
            </div>
          </section>

          {/* Getting Started Tutorials */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Getting Started Tutorials</h2>
            
            <div className="space-y-6">
              {/* Tutorial 1 */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        Tutorial 1: API Authentication & Setup
                      </h3>
                      <p className="text-gray-600">
                        Learn how to authenticate with OptiBid Energy API and set up your development environment.
                      </p>
                    </div>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      15 min
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">What You'll Learn</h4>
                      <ul className="space-y-2 text-gray-600">
                        <li>• Generate and manage API keys</li>
                        <li>• Set up authentication headers</li>
                        <li>• Handle authentication errors</li>
                        <li>• Test your first API call</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Prerequisites</h4>
                      <ul className="space-y-2 text-gray-600">
                        <li>• OptiBid Energy account</li>
                        <li>• Basic understanding of HTTP APIs</li>
                        <li>• Text editor or IDE</li>
                        <li>• API key from your dashboard</li>
                      </ul>
                    </div>
                  </div>
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <a href="#" className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                      <PlayIcon className="h-4 w-4 mr-2" />
                      Start Tutorial
                    </a>
                  </div>
                </div>
              </div>

              {/* Tutorial 2 */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        Tutorial 2: Fetching Market Data
                      </h3>
                      <p className="text-gray-600">
                        Learn to retrieve real-time and historical energy market data using the Market Data API.
                      </p>
                    </div>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      20 min
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">What You'll Learn</h4>
                      <ul className="space-y-2 text-gray-600">
                        <li>• Query real-time electricity prices</li>
                        <li>• Access historical market data</li>
                        <li>• Filter data by region and time</li>
                        <li>• Handle large datasets efficiently</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Code Examples</h4>
                      <pre className="bg-gray-900 text-green-400 p-3 rounded text-sm overflow-x-auto">
{`// Get current prices
GET /v1/market/prices?region=california

// Historical data
GET /v1/market/historical?region=california&days=30`}
                      </pre>
                    </div>
                  </div>
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <a href="#" className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                      <PlayIcon className="h-4 w-4 mr-2" />
                      Start Tutorial
                    </a>
                  </div>
                </div>
              </div>

              {/* Tutorial 3 */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        Tutorial 3: Managing Your Portfolio
                      </h3>
                      <p className="text-gray-600">
                        Learn to programmatically manage your energy portfolio, assets, and trading positions.
                      </p>
                    </div>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      25 min
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">What You'll Learn</h4>
                      <ul className="space-y-2 text-gray-600">
                        <li>• Query portfolio overview</li>
                        <li>• Add and manage energy assets</li>
                        <li>• Track trading positions</li>
                        <li>• Monitor portfolio performance</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Key Operations</h4>
                      <pre className="bg-gray-900 text-green-400 p-3 rounded text-sm overflow-x-auto">
{`// Portfolio overview
GET /v1/portfolio

// Add solar asset
POST /v1/portfolio/assets`}
                      </pre>
                    </div>
                  </div>
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <a href="#" className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                      <PlayIcon className="h-4 w-4 mr-2" />
                      Start Tutorial
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Trading Automation Tutorials */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Trading Automation Tutorials</h2>
            
            <div className="space-y-6">
              {/* Trading Tutorial 1 */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        Tutorial 4: Your First Automated Trade
                      </h3>
                      <p className="text-gray-600">
                        Build a simple trading bot that executes trades based on price thresholds and market conditions.
                      </p>
                    </div>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      30 min
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">What You'll Build</h4>
                      <ul className="space-y-2 text-gray-600">
                        <li>• Price monitoring system</li>
                        <li>• Trade execution logic</li>
                        <li>• Risk management controls</li>
                        <li>• Notification system</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Technologies Used</h4>
                      <ul className="space-y-2 text-gray-600">
                        <li>• Python & OptiBid SDK</li>
                        <li>• WebSocket connections</li>
                        <li>• Database for logging</li>
                        <li>• Email notifications</li>
                      </ul>
                    </div>
                  </div>
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <a href="#" className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors">
                      <PlayIcon className="h-4 w-4 mr-2" />
                      Start Tutorial
                    </a>
                  </div>
                </div>
              </div>

              {/* Trading Tutorial 2 */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        Tutorial 5: AI-Powered Trading Strategies
                      </h3>
                      <p className="text-gray-600">
                        Integrate machine learning forecasts with automated trading for intelligent decision making.
                      </p>
                    </div>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      45 min
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">What You'll Learn</h4>
                      <ul className="space-y-2 text-gray-600">
                        <li>• Use AI analytics endpoints</li>
                        <li>• Interpret forecast data</li>
                        <li>• Build predictive models</li>
                        <li>• Implement smart order routing</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Advanced Features</h4>
                      <ul className="space-y-2 text-gray-600">
                        <li>• Multi-timeframe analysis</li>
                        <li>• Risk-adjusted position sizing</li>
                        <li>• Dynamic stop-loss orders</li>
                        <li>• Performance backtesting</li>
                      </ul>
                    </div>
                  </div>
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <a href="#" className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors">
                      <PlayIcon className="h-4 w-4 mr-2" />
                      Start Tutorial
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Advanced Integration */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Advanced Integration</h2>
            
            <div className="space-y-6">
              {/* Advanced Tutorial */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        Tutorial 6: Real-time Streaming with WebSockets
                      </h3>
                      <p className="text-gray-600">
                        Build high-performance real-time applications using WebSocket streaming for market data and alerts.
                      </p>
                    </div>
                    <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                      35 min
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">What You'll Build</h4>
                      <ul className="space-y-2 text-gray-600">
                        <li>• WebSocket connection management</li>
                        <li>• Real-time price monitoring dashboard</li>
                        <li>• Stream processing and filtering</li>
                        <li>• Connection resilience and reconnection</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Code Preview</h4>
                      <pre className="bg-gray-900 text-green-400 p-3 rounded text-sm overflow-x-auto">
{`const ws = new WebSocket('wss://api.optibid-energy.com/v1/stream');

ws.on('message', (data) => {
  const update = JSON.parse(data);
  updatePriceDisplay(update);
});`}
                      </pre>
                    </div>
                  </div>
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <a href="#" className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors">
                      <PlayIcon className="h-4 w-4 mr-2" />
                      Start Tutorial
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Video Tutorials */}
          <section className="mb-16">
            <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl p-8 text-white">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-3xl font-bold mb-4">Prefer Video Learning?</h2>
                  <p className="text-xl mb-6 opacity-90">
                    Watch our comprehensive video tutorials covering all aspects of OptiBid Energy API integration.
                  </p>
                  <ul className="space-y-2 opacity-90">
                    <li>• Step-by-step screen recordings</li>
                    <li>• Live coding sessions</li>
                    <li>• Q&A with developers</li>
                    <li>• Best practices and tips</li>
                  </ul>
                </div>
                <div className="text-center">
                  <div className="bg-white/10 rounded-xl p-6 mb-4">
                    <VideoCameraIcon className="h-16 w-16 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">Video Series</h3>
                    <p className="opacity-90">Available on our YouTube channel</p>
                  </div>
                  <a 
                    href="/webinars" 
                    className="inline-flex items-center px-6 py-3 bg-white text-orange-600 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                  >
                    View Video Tutorials
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Support */}
          <section className="text-center">
            <div className="bg-gray-100 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Need Help with Tutorials?</h2>
              <p className="text-gray-600 mb-6">
                Stuck on a tutorial? Our developer community and support team are here to help you succeed.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="/contact" 
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
                  Ask for Help
                </a>
                <a 
                  href="/api" 
                  className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  <DocumentTextIcon className="h-4 w-4 mr-2" />
                  API Reference
                </a>
              </div>
            </div>
          </section>
        </div>
      </SectionWrapper>
    </div>
  )
}
