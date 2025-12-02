'use client'

import { SectionWrapper } from '@/components/ui/SectionWrapper'
import { motion } from 'framer-motion'
import { 
  VideoCameraIcon,
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  AcademicCapIcon,
  PlayIcon,
  GlobeAltIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline'

export default function WebinarsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SectionWrapper>
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center px-4 py-2 rounded-full bg-red-100 text-red-800 text-sm font-medium mb-6"
            >
              <VideoCameraIcon className="h-4 w-4 mr-2" />
              Live Learning & Education
            </motion.div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Webinars & <span className="bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">Online Events</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join our expert-led webinars covering energy trading strategies, market insights, platform tutorials, 
              and industry trends. Learn from the best and advance your energy trading skills.
            </p>
          </div>

          {/* Upcoming Webinars */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Upcoming Live Webinars</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Webinar 1 */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        Advanced Energy Trading Strategies for 2025
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        Learn cutting-edge trading strategies for navigating the evolving energy markets, 
                        including renewable integration and AI-powered optimization.
                      </p>
                    </div>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium ml-4">
                      Live
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-2 text-blue-600" />
                      <span>December 5, 2025 • 2:00 PM EST</span>
                    </div>
                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-2 text-green-600" />
                      <span>Duration: 90 minutes</span>
                    </div>
                    <div className="flex items-center">
                      <UserGroupIcon className="h-4 w-4 mr-2 text-purple-600" />
                      <span>Speakers: 3 experts • Capacity: 500 attendees</span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">What You'll Learn:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Renewable energy market dynamics</li>
                      <li>• AI integration in trading strategies</li>
                      <li>• Risk management in volatile markets</li>
                      <li>• Portfolio optimization techniques</li>
                    </ul>
                  </div>
                  
                  <div className="flex gap-3">
                    <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                      Register Now
                    </button>
                    <button className="flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      Add to Calendar
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Webinar 2 */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        OptiBid Platform Deep Dive: Advanced Features
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        Comprehensive walkthrough of OptiBid's advanced features including knowledge graphs, 
                        AI insights, and real-time collaboration tools.
                      </p>
                    </div>
                    <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium ml-4">
                      Popular
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-2 text-blue-600" />
                      <span>December 10, 2025 • 1:00 PM EST</span>
                    </div>
                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-2 text-green-600" />
                      <span>Duration: 120 minutes</span>
                    </div>
                    <div className="flex items-center">
                      <UserGroupIcon className="h-4 w-4 mr-2 text-purple-600" />
                      <span>Speakers: Platform experts • Capacity: 300 attendees</span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Platform Features Covered:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Knowledge graphs and visualization</li>
                      <li>• AI-powered insights and predictions</li>
                      <li>• Real-time team collaboration</li>
                      <li>• API integration and automation</li>
                    </ul>
                  </div>
                  
                  <div className="flex gap-3">
                    <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                      Register Now
                    </button>
                    <button className="flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      Add to Calendar
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Webinar 3 */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        Energy Market Outlook 2025: Trends & Opportunities
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        Market analysis and forecasting for 2025, including renewable energy growth, 
                        grid modernization, and emerging trading opportunities.
                      </p>
                    </div>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium ml-4">
                      New
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-2 text-blue-600" />
                      <span>December 15, 2025 • 3:00 PM EST</span>
                    </div>
                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-2 text-green-600" />
                      <span>Duration: 75 minutes</span>
                    </div>
                    <div className="flex items-center">
                      <UserGroupIcon className="h-4 w-4 mr-2 text-purple-600" />
                      <span>Speakers: Industry analysts • Capacity: 1000 attendees</span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Market Insights Covered:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Renewable energy market forecasts</li>
                      <li>• Grid infrastructure developments</li>
                      <li>• Regulatory changes and impacts</li>
                      <li>• Investment opportunities</li>
                    </ul>
                  </div>
                  
                  <div className="flex gap-3">
                    <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                      Register Now
                    </button>
                    <button className="flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      Add to Calendar
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Webinar 4 */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        API Integration Workshop: Automate Your Trading
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        Hands-on workshop teaching developers and traders how to integrate OptiBid's API 
                        for automated trading and advanced analytics.
                      </p>
                    </div>
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium ml-4">
                      Workshop
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-2 text-blue-600" />
                      <span>December 20, 2025 • 11:00 AM EST</span>
                    </div>
                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-2 text-green-600" />
                      <span>Duration: 180 minutes</span>
                    </div>
                    <div className="flex items-center">
                      <UserGroupIcon className="h-4 w-4 mr-2 text-purple-600" />
                      <span>Instructor: API specialists • Capacity: 50 attendees</span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Technical Topics:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• API authentication and setup</li>
                      <li>• Data fetching and processing</li>
                      <li>• Automated trade execution</li>
                      <li>• Real-time monitoring setup</li>
                    </ul>
                  </div>
                  
                  <div className="flex gap-3">
                    <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                      Register Now
                    </button>
                    <button className="flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      Add to Calendar
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Webinar Series */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Ongoing Webinar Series</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <AcademicCapIcon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Energy Trading Fundamentals</h3>
                <p className="text-gray-600 mb-4">
                  Monthly series covering basics of energy markets, trading strategies, and risk management for beginners and intermediate traders.
                </p>
                <div className="text-sm text-gray-500">
                  <div>Next: January 15, 2025</div>
                  <div>Monthly • 2nd Tuesday</div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                  <RocketLaunchIcon className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Platform Updates & Features</h3>
                <p className="text-gray-600 mb-4">
                  Bi-weekly updates on new OptiBid features, best practices, and advanced techniques for maximizing platform benefits.
                </p>
                <div className="text-sm text-gray-500">
                  <div>Next: December 8, 2025</div>
                  <div>Bi-weekly • Fridays</div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                  <GlobeAltIcon className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Market Intelligence Briefings</h3>
                <p className="text-gray-600 mb-4">
                  Weekly market analysis and intelligence briefings covering global energy markets, policy changes, and trading opportunities.
                </p>
                <div className="text-sm text-gray-500">
                  <div>Next: December 6, 2025</div>
                  <div>Weekly • Mondays</div>
                </div>
              </div>
            </div>
          </section>

          {/* Past Webinars */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Recorded Webinars</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Past Webinar 1 */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <PlayIcon className="h-8 w-8 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      Renewable Energy Trading: From Basics to Advanced Strategies
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      Comprehensive guide to trading renewable energy certificates, carbon credits, and green energy derivatives.
                    </p>
                    <div className="text-sm text-gray-500 mb-3">
                      <span>Recorded: November 28, 2025</span> • <span>Duration: 105 min</span> • <span>Views: 2,847</span>
                    </div>
                    <button className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium">
                      <PlayIcon className="h-4 w-4 mr-2" />
                      Watch Recording
                    </button>
                  </div>
                </div>
              </div>

              {/* Past Webinar 2 */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <PlayIcon className="h-8 w-8 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      AI in Energy Trading: Predictive Analytics & Optimization
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      How artificial intelligence is transforming energy trading through advanced predictive models and optimization algorithms.
                    </p>
                    <div className="text-sm text-gray-500 mb-3">
                      <span>Recorded: November 15, 2025</span> • <span>Duration: 90 min</span> • <span>Views: 3,421</span>
                    </div>
                    <button className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium">
                      <PlayIcon className="h-4 w-4 mr-2" />
                      Watch Recording
                    </button>
                  </div>
                </div>
              </div>

              {/* Past Webinar 3 */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <PlayIcon className="h-8 w-8 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      Building Resilient Energy Portfolios
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      Strategies for building energy portfolios that can withstand market volatility and regulatory changes.
                    </p>
                    <div className="text-sm text-gray-500 mb-3">
                      <span>Recorded: October 30, 2025</span> • <span>Duration: 75 min</span> • <span>Views: 1,976</span>
                    </div>
                    <button className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium">
                      <PlayIcon className="h-4 w-4 mr-2" />
                      Watch Recording
                    </button>
                  </div>
                </div>
              </div>

              {/* Past Webinar 4 */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <PlayIcon className="h-8 w-8 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      OptiBid Platform: Complete Beginner's Guide
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      Step-by-step introduction to OptiBid Energy platform for new users, covering all essential features.
                    </p>
                    <div className="text-sm text-gray-500 mb-3">
                      <span>Recorded: October 15, 2025</span> • <span>Duration: 120 min</span> • <span>Views: 4,123</span>
                    </div>
                    <button className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium">
                      <PlayIcon className="h-4 w-4 mr-2" />
                      Watch Recording
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Webinar Features */}
          <section className="mb-16">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Webinar Platform Features</h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Interactive Features</h3>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span><strong>Live Q&A:</strong> Ask questions directly to speakers during the session</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span><strong>Chat integration:</strong> Real-time chat with other participants</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span><strong>Polls and surveys:</strong> Interactive polls and audience feedback</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span><strong>Downloadable resources:</strong> Access slides, whitepapers, and materials</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Post-Event Benefits</h3>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span><strong>Recording access:</strong> Watch missed webinars on-demand</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span><strong>Certificate of attendance:</strong> Professional development certificates</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span><strong>Follow-up resources:</strong> Additional materials and references</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span><strong>Networking opportunities:</strong> Connect with other participants</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <section className="text-center">
            <div className="bg-gradient-to-r from-red-600 to-pink-600 rounded-2xl p-8 text-white">
              <h2 className="text-3xl font-bold mb-4">Never Miss an Opportunity to Learn</h2>
              <p className="text-xl mb-6 opacity-90">
                Subscribe to our webinar notifications and stay ahead in the energy trading industry with expert insights and practical knowledge.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="/contact" 
                  className="inline-flex items-center px-6 py-3 bg-white text-red-600 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Subscribe to Notifications
                </a>
                <a 
                  href="/resources" 
                  className="inline-flex items-center px-6 py-3 border border-white text-white rounded-lg font-medium hover:bg-white/10 transition-colors"
                >
                  <DocumentTextIcon className="h-4 w-4 mr-2" />
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