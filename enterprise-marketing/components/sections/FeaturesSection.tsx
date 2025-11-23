'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  SwatchIcon,
  SparklesIcon,
  UsersIcon,
  PlayIcon,
} from '@heroicons/react/24/outline'
import { useI18n } from '@/components/providers/I18nProvider'
import { trackInteraction } from '@/components/providers/Analytics'

const features = [
  {
    id: 'knowledge-graphs',
    icon: SwatchIcon,
    title: 'Visual Knowledge Graphs',
    description: 'Interactive node and edge graphs with intelligent clustering and real-time updates',
    benefits: [
      'Interactive network visualization',
      'Automatic pattern recognition',
      'Real-time data relationships',
      'Export to multiple formats',
    ],
    demoVideo: '/videos/knowledge-graphs-demo.mp4',
  },
  {
    id: 'ai-insights',
    icon: SparklesIcon,
    title: 'AI-Powered Insights',
    description: 'Advanced machine learning algorithms providing predictive analytics and optimization recommendations',
    benefits: [
      'Predictive market forecasting',
      'Automated optimization suggestions',
      'Risk assessment algorithms',
      'Natural language explanations',
    ],
    demoVideo: '/videos/ai-insights-demo.mp4',
  },
  {
    id: 'collaboration',
    icon: UsersIcon,
    title: 'Real-time Collaboration',
    description: 'Live team collaboration with presence indicators, comments, and shared dashboards',
    benefits: [
      'Live cursor tracking',
      'Real-time commenting system',
      'Shared dashboard editing',
      'Version control and history',
    ],
    demoVideo: '/videos/collaboration-demo.mp4',
  },
]

export function FeaturesSection() {
  const { t } = useI18n()
  const [activeFeature, setActiveFeature] = useState(0)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)

  const handleFeatureInteraction = (featureId: string, action: string) => {
    trackInteraction('feature', `${action}_${featureId}`)
  }

  const toggleVideo = (featureId: string) => {
    setIsVideoPlaying(!isVideoPlaying)
    handleFeatureInteraction(featureId, isVideoPlaying ? 'pause_video' : 'play_video')
  }

  return (
    <section className="py-24 bg-white dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl"
          >
            Powerful Features for Modern Energy Trading
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="mt-4 text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
          >
            Discover the advanced capabilities that set OptiBid apart from traditional energy trading platforms
          </motion.p>
        </div>

        {/* Feature Navigation */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <button
                  key={feature.id}
                  onClick={() => setActiveFeature(index)}
                  className={`
                    flex items-center space-x-2 px-4 py-3 rounded-md text-sm font-medium transition-all duration-200
                    ${activeFeature === index
                      ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                    }
                  `}
                  onMouseEnter={() => handleFeatureInteraction(feature.id, 'hover_tab')}
                >
                  <Icon className="h-5 w-5" />
                  <span className="hidden sm:inline">{feature.title}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Active Feature Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Feature Content */}
          <motion.div
            key={`content-${activeFeature}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="flex items-center space-x-3">
              {(() => {
                const Icon = features[activeFeature].icon
                return (
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                )
              })()}
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {features[activeFeature].title}
              </h3>
            </div>

            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              {features[activeFeature].description}
            </p>

            {/* Benefits List */}
            <div className="space-y-4">
              {features[activeFeature].benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-center space-x-3"
                >
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                </motion.div>
              ))}
            </div>

            {/* Demo Button */}
            <div className="pt-4">
              <button
                onClick={() => toggleVideo(features[activeFeature].id)}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
                onMouseEnter={() => handleFeatureInteraction(features[activeFeature].id, 'hover_demo')}
              >
                <PlayIcon className="mr-2 h-5 w-5" />
                {isVideoPlaying ? 'Pause Demo' : 'Watch Demo'}
              </button>
            </div>
          </motion.div>

          {/* Feature Visualization */}
          <motion.div
            key={`visual-${activeFeature}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-2xl p-8 shadow-2xl">
              {/* Feature-specific visualizations */}
              {activeFeature === 0 && (
                // Visual Knowledge Graphs
                <div className="space-y-6">
                  {/* Network visualization */}
                  <div className="relative h-64 bg-white dark:bg-gray-800 rounded-lg p-4 overflow-hidden">
                    <div className="absolute inset-0">
                      {/* Nodes */}
                      <div className="absolute top-4 left-4 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                      <div className="absolute top-12 right-8 w-4 h-4 bg-green-500 rounded-full animate-pulse delay-100"></div>
                      <div className="absolute bottom-8 left-8 w-3 h-3 bg-purple-500 rounded-full animate-pulse delay-200"></div>
                      <div className="absolute bottom-4 right-4 w-2 h-2 bg-orange-500 rounded-full animate-pulse delay-300"></div>
                      <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-pink-500 rounded-full animate-pulse delay-400"></div>
                      
                      {/* Connection lines */}
                      <svg className="absolute inset-0 w-full h-full">
                        <line x1="20%" y1="15%" x2="70%" y2="35%" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="2" className="animate-pulse"></line>
                        <line x1="70%" y1="35%" x2="30%" y2="80%" stroke="rgba(34, 197, 94, 0.3)" strokeWidth="2" className="animate-pulse delay-100"></line>
                        <line x1="20%" y1="15%" x2="50%" y2="50%" stroke="rgba(139, 92, 246, 0.3)" strokeWidth="2" className="animate-pulse delay-200"></line>
                        <line x1="70%" y1="35%" x2="80%" y2="75%" stroke="rgba(249, 115, 22, 0.3)" strokeWidth="2" className="animate-pulse delay-300"></line>
                        <line x1="30%" y1="80%" x2="80%" y2="75%" stroke="rgba(236, 72, 153, 0.3)" strokeWidth="2" className="animate-pulse delay-400"></line>
                      </svg>
                    </div>
                    <div className="absolute top-2 left-2 text-xs font-medium text-gray-600 dark:text-gray-400">
                      Energy Network
                    </div>
                  </div>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">127</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Active Nodes</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">23</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Connections</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">5</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Clusters</div>
                    </div>
                  </div>
                </div>
              )}

              {activeFeature === 1 && (
                // AI Insights
                <div className="space-y-6">
                  {/* Prediction chart */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">Price Forecast</h4>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-gray-600 dark:text-gray-400">AI Model v2.1</span>
                      </div>
                    </div>
                    <div className="h-32 relative">
                      <svg className="w-full h-full">
                        <defs>
                          <linearGradient id="forecastGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="rgba(59, 130, 246, 0.3)" />
                            <stop offset="100%" stopColor="rgba(59, 130, 246, 0.1)" />
                          </linearGradient>
                        </defs>
                        <path
                          d="M0,80 Q20,60 40,70 T80,50 T120,65 T160,40 L160,100 L0,100 Z"
                          fill="url(#forecastGradient)"
                        />
                        <path
                          d="M0,80 Q20,60 40,70 T80,50 T120,65 T160,40"
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="2"
                        />
                      </svg>
                    </div>
                  </div>
                  
                  {/* AI Insights */}
                  <div className="space-y-3">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <SparklesIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-medium text-blue-900 dark:text-blue-200">AI Insight</span>
                      </div>
                      <p className="text-sm text-blue-800 dark:text-blue-300">
                        Price spike expected between 2-4 PM due to increased demand forecast
                      </p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <SparklesIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <span className="text-sm font-medium text-green-900 dark:text-green-200">Optimization</span>
                      </div>
                      <p className="text-sm text-green-800 dark:text-green-300">
                        Consider increasing bid volume by 15% for 15:30 slot
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeFeature === 2 && (
                // Real-time Collaboration
                <div className="space-y-6">
                  {/* Active users */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Team Collaboration</h4>
                    <div className="flex items-center space-x-4">
                      <div className="flex -space-x-2">
                        <div className="w-8 h-8 bg-blue-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                          <span className="text-white text-xs font-medium">JD</span>
                        </div>
                        <div className="w-8 h-8 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                          <span className="text-white text-xs font-medium">SM</span>
                        </div>
                        <div className="w-8 h-8 bg-purple-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                          <span className="text-white text-xs font-medium">AL</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">3 team members active</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Live editing dashboard</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Comments */}
                  <div className="space-y-3">
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-medium">JD</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">John Doe</span>
                        <span className="text-xs text-gray-600 dark:text-gray-400">2 min ago</span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 ml-8">
                        Great analysis! Could we add a volatility indicator?
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-medium">SM</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Sarah Miller</span>
                        <span className="text-xs text-gray-600 dark:text-gray-400">1 min ago</span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 ml-8">
                        Added to the roadmap. Should be live this week!
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Floating elements */}
            <motion.div
              animate={{
                y: [0, -10, 0],
                rotate: [0, 5, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg"
            >
              {(() => {
                const Icon = features[activeFeature].icon
                return <Icon className="w-8 h-8 text-white" />
              })()}
            </motion.div>
          </motion.div>
        </div>

        {/* Feature Navigation Dots */}
        <div className="flex justify-center mt-12 space-x-2">
          {features.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveFeature(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                activeFeature === index
                  ? 'bg-blue-600 dark:bg-blue-400 scale-110'
                  : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
              }`}
              onMouseEnter={() => handleFeatureInteraction(features[index].id, 'hover_dot')}
            />
          ))}
        </div>
      </div>
    </section>
  )
}