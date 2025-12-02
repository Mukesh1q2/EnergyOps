'use client'

import { SectionWrapper } from '@/components/ui/SectionWrapper'
import { motion } from 'framer-motion'
import { 
  DocumentTextIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  TagIcon,
  ArrowRightIcon,
  ArrowTrendingUpIcon,
  SparklesIcon,
  GlobeAltIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SectionWrapper>
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-100 text-indigo-800 text-sm font-medium mb-6"
            >
              <DocumentTextIcon className="h-4 w-4 mr-2" />
              Expert Insights & Analysis
            </motion.div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Blog</span> & Insights
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Stay ahead of the curve with expert insights, market analysis, and innovative perspectives 
              from the energy trading industry. Learn from thought leaders and industry experts.
            </p>
          </div>

          {/* Featured Article */}
          <section className="mb-16">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="p-8 lg:p-12">
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-sm font-medium mb-4">
                    Featured Article
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    The Future of Energy Trading: How AI is Revolutionizing Market Analysis
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Artificial intelligence is transforming how energy markets are analyzed, predicted, and traded. 
                    Discover how machine learning algorithms are creating new opportunities and changing the industry landscape.
                  </p>
                  <div className="flex items-center text-sm text-gray-500 mb-6">
                    <UserIcon className="h-4 w-4 mr-2" />
                    <span>Dr. Sarah Chen, Chief AI Officer</span>
                    <span className="mx-2">•</span>
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    <span>December 1, 2025</span>
                    <span className="mx-2">•</span>
                    <ClockIcon className="h-4 w-4 mr-1" />
                    <span>8 min read</span>
                  </div>
                  <button className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">
                    Read Full Article
                    <ArrowRightIcon className="h-4 w-4 ml-2" />
                  </button>
                </div>
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-8 lg:p-12 flex items-center justify-center">
                  <div className="text-center text-white">
                    <SparklesIcon className="h-24 w-24 mx-auto mb-4 opacity-80" />
                    <h3 className="text-xl font-bold">AI & Machine Learning</h3>
                    <p className="text-indigo-100">The cutting edge of energy trading</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Article Categories */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Browse by Category</h2>
            
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              <button className="p-4 bg-white rounded-lg border border-gray-200 text-center hover:border-indigo-300 hover:bg-indigo-50 transition-colors">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <ArrowTrendingUpIcon className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Market Analysis</h3>
                <p className="text-sm text-gray-500">24 articles</p>
              </button>

              <button className="p-4 bg-white rounded-lg border border-gray-200 text-center hover:border-green-300 hover:bg-green-50 transition-colors">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <SparklesIcon className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Technology</h3>
                <p className="text-sm text-gray-500">18 articles</p>
              </button>

              <button className="p-4 bg-white rounded-lg border border-gray-200 text-center hover:border-blue-300 hover:bg-blue-50 transition-colors">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <GlobeAltIcon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Industry Trends</h3>
                <p className="text-sm text-gray-500">32 articles</p>
              </button>

              <button className="p-4 bg-white rounded-lg border border-gray-200 text-center hover:border-purple-300 hover:bg-purple-50 transition-colors">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <ChartBarIcon className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Strategy</h3>
                <p className="text-sm text-gray-500">15 articles</p>
              </button>
            </div>
          </section>

          {/* Latest Articles */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Latest Articles</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Article 1 */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="h-48 bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <ChartBarIcon className="h-16 w-16 text-white opacity-80" />
                </div>
                <div className="p-6">
                  <div className="flex items-center mb-3">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                      Market Analysis
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Renewable Energy Market Forecast 2025
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Comprehensive analysis of renewable energy market trends, growth projections, and investment opportunities for 2025.
                  </p>
                  <div className="flex items-center text-xs text-gray-500 mb-4">
                    <span>John Martinez, Energy Analyst</span>
                    <span className="mx-2">•</span>
                    <span>2 hours ago</span>
                    <span className="mx-2">•</span>
                    <span>6 min read</span>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                    Read more →
                  </button>
                </div>
              </motion.div>

              {/* Article 2 */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="h-48 bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                  <SparklesIcon className="h-16 w-16 text-white opacity-80" />
                </div>
                <div className="p-6">
                  <div className="flex items-center mb-3">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                      Technology
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Blockchain in Energy Trading: Current State and Future
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Exploring how blockchain technology is being implemented in energy trading and what the future holds for decentralized energy markets.
                  </p>
                  <div className="flex items-center text-xs text-gray-500 mb-4">
                    <span>Dr. Emily Zhang, Blockchain Architect</span>
                    <span className="mx-2">•</span>
                    <span>5 hours ago</span>
                    <span className="mx-2">•</span>
                    <span>10 min read</span>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                    Read more →
                  </button>
                </div>
              </motion.div>

              {/* Article 3 */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="h-48 bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                  <GlobeAltIcon className="h-16 w-16 text-white opacity-80" />
                </div>
                <div className="p-6">
                  <div className="flex items-center mb-3">
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                      Industry Trends
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Grid Modernization and Smart Energy Systems
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    How smart grid technology and IoT devices are transforming the energy landscape and creating new trading opportunities.
                  </p>
                  <div className="flex items-center text-xs text-gray-500 mb-4">
                    <span>Michael Thompson, Grid Solutions Lead</span>
                    <span className="mx-2">•</span>
                    <span>8 hours ago</span>
                    <span className="mx-2">•</span>
                    <span>12 min read</span>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                    Read more →
                  </button>
                </div>
              </motion.div>

              {/* Article 4 */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="h-48 bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                  <ArrowTrendingUpIcon className="h-16 w-16 text-white opacity-80" />
                </div>
                <div className="p-6">
                  <div className="flex items-center mb-3">
                    <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">
                      Strategy
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Risk Management in Volatile Energy Markets
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Advanced strategies for managing portfolio risk in increasingly volatile and interconnected energy markets.
                  </p>
                  <div className="flex items-center text-xs text-gray-500 mb-4">
                    <span>Lisa Rodriguez, Risk Management Director</span>
                    <span className="mx-2">•</span>
                    <span>12 hours ago</span>
                    <span className="mx-2">•</span>
                    <span>8 min read</span>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                    Read more →
                  </button>
                </div>
              </motion.div>

              {/* Article 5 */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="h-48 bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
                  <DocumentTextIcon className="h-16 w-16 text-white opacity-80" />
                </div>
                <div className="p-6">
                  <div className="flex items-center mb-3">
                    <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs font-medium">
                      Market Analysis
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Carbon Credit Trading: Market Dynamics and Opportunities
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Deep dive into carbon credit markets, regulatory changes, and emerging opportunities for environmental commodity trading.
                  </p>
                  <div className="flex items-center text-xs text-gray-500 mb-4">
                    <span>David Park, Environmental Markets Expert</span>
                    <span className="mx-2">•</span>
                    <span>1 day ago</span>
                    <span className="mx-2">•</span>
                    <span>15 min read</span>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                    Read more →
                  </button>
                </div>
              </motion.div>

              {/* Article 6 */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="h-48 bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center">
                  <SparklesIcon className="h-16 w-16 text-white opacity-80" />
                </div>
                <div className="p-6">
                  <div className="flex items-center mb-3">
                    <span className="bg-pink-100 text-pink-800 px-2 py-1 rounded-full text-xs font-medium">
                      Technology
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Quantum Computing Applications in Energy Optimization
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    How quantum computing algorithms are being developed to solve complex energy optimization problems that classical computers cannot handle.
                  </p>
                  <div className="flex items-center text-xs text-gray-500 mb-4">
                    <span>Dr. Rachel Kim, Quantum Research Lead</span>
                    <span className="mx-2">•</span>
                    <span>2 days ago</span>
                    <span className="mx-2">•</span>
                    <span>20 min read</span>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                    Read more →
                  </button>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Newsletter Signup */}
          <section className="mb-16">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white text-center">
              <h2 className="text-3xl font-bold mb-4">Stay Informed with Our Newsletter</h2>
              <p className="text-xl mb-6 opacity-90">
                Get the latest energy trading insights, market analysis, and expert opinions delivered directly to your inbox.
              </p>
              <div className="max-w-md mx-auto">
                <div className="flex gap-4">
                  <input 
                    type="email" 
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500"
                  />
                  <button className="px-6 py-3 bg-white text-indigo-600 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                    Subscribe
                  </button>
                </div>
                <p className="text-sm opacity-75 mt-3">
                  Join 15,000+ energy professionals • Weekly insights • Unsubscribe anytime
                </p>
              </div>
            </div>
          </section>

          {/* Popular Topics */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Popular Topics</h2>
            
            <div className="flex flex-wrap gap-3 justify-center">
              <span className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors">
                AI in Energy Trading
              </span>
              <span className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors">
                Renewable Energy Markets
              </span>
              <span className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors">
                Risk Management
              </span>
              <span className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors">
                Carbon Credits
              </span>
              <span className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors">
                Blockchain Technology
              </span>
              <span className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors">
                Energy Storage
              </span>
              <span className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors">
                Grid Modernization
              </span>
              <span className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors">
                Market Regulation
              </span>
            </div>
          </section>

          {/* Call to Action */}
          <section className="text-center">
            <div className="bg-gray-100 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Want to Contribute?</h2>
              <p className="text-gray-600 mb-6">
                Share your expertise and insights with the energy trading community. We're always looking for guest authors and industry experts.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="/contact" 
                  className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                >
                  <DocumentTextIcon className="h-4 w-4 mr-2" />
                  Become a Contributor
                </a>
                <a 
                  href="/resources" 
                  className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  View All Resources
                </a>
              </div>
            </div>
          </section>
        </div>
      </SectionWrapper>
    </div>
  )
}

