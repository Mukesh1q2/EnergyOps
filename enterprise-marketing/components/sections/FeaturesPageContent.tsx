'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ChartBarIcon,
  CpuChipIcon,
  UserGroupIcon,
  MapIcon,
  ClockIcon,
  ShieldCheckIcon,
  CloudIcon,
  DevicePhoneMobileIcon
} from '@heroicons/react/24/outline'

interface Feature {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  image?: string
  highlights: string[]
  category: 'analytics' | 'ai' | 'collaboration' | 'visualization' | 'integration' | 'security' | 'performance' | 'mobile'
}

const features: Feature[] = [
  {
    id: 'visual-knowledge-graphs',
    title: 'Visual Knowledge Graphs',
    description: 'Interactive node/edge graphs with clustering, search, and real-time data visualization. Perfect for understanding complex energy relationships and market connections.',
    icon: ChartBarIcon,
    image: '/images/knowledge-graph-demo.jpg',
    highlights: [
      'Force-directed and hierarchical layouts',
      'Real-time data updates and streaming',
      'Advanced clustering and grouping',
      'Interactive filtering and search',
      'Export capabilities (PNG, SVG, CSV)'
    ],
    category: 'visualization'
  },
  {
    id: 'ai-powered-insights',
    title: 'AI-Powered Insights',
    description: 'Machine learning algorithms for predictive analytics, anomaly detection, and automated insights generation. Harness the power of AI to make better energy decisions.',
    icon: CpuChipIcon,
    image: '/images/ai-insights-demo.jpg',
    highlights: [
      'Time series forecasting with confidence intervals',
      'Anomaly detection and alerting',
      'Natural language explanations',
      'Pattern recognition and trend analysis',
      'Automated insight generation'
    ],
    category: 'ai'
  },
  {
    id: 'real-time-collaboration',
    title: 'Real-time Collaboration',
    description: 'Live team collaboration with presence indicators, shared cursors, and real-time updates. Work together seamlessly on energy analysis and trading strategies.',
    icon: UserGroupIcon,
    image: '/images/collaboration-demo.jpg',
    highlights: [
      'Live cursors and presence indicators',
      'Real-time dashboard sharing',
      'Threaded discussions and comments',
      'Change history and versioning',
      'Collaborative editing capabilities'
    ],
    category: 'collaboration'
  },
  {
    id: 'india-map-geospatial',
    title: 'India Map & Geospatial',
    description: 'Comprehensive geospatial visualization of India with energy infrastructure mapping, market regions, and interactive data overlays.',
    icon: MapIcon,
    image: '/images/india-map-demo.jpg',
    highlights: [
      'India energy infrastructure mapping',
      'Interactive regional data overlays',
      'Choropleth and heatmap visualizations',
      'Asset pinning and location management',
      'Custom geospatial layers'
    ],
    category: 'visualization'
  },
  {
    id: 'real-time-streaming',
    title: 'Real-time Data Streaming',
    description: 'High-performance real-time data streaming with WebSocket support, enabling live market updates and immediate visualization of energy data.',
    icon: ClockIcon,
    image: '/images/streaming-demo.jpg',
    highlights: [
      'Sub-second data latency',
      'WebSocket and Server-Sent Events',
      'Kafka integration for scalability',
      'Data buffering and reconnection',
      'Real-time chart updates'
    ],
    category: 'performance'
  },
  {
    id: 'enterprise-security',
    title: 'Enterprise Security',
    description: 'Bank-grade security with encryption, SSO, MFA, and comprehensive audit logging. SOC2 and ISO27001 compliance ready.',
    icon: ShieldCheckIcon,
    image: '/images/security-demo.jpg',
    highlights: [
      'SOC2 Type II and ISO27001 compliance',
      'Multi-factor authentication (MFA)',
      'Single Sign-On (SSO) integration',
      'End-to-end encryption',
      'Comprehensive audit logging'
    ],
    category: 'security'
  },
  {
    id: 'cloud-native',
    title: 'Cloud-Native Architecture',
    description: 'Scalable cloud-native architecture with Kubernetes orchestration, auto-scaling, and high availability. Built for enterprise workloads.',
    icon: CloudIcon,
    image: '/images/cloud-architecture-demo.jpg',
    highlights: [
      'Kubernetes orchestration',
      'Auto-scaling capabilities',
      'Multi-region deployment',
      'High availability design',
      'Disaster recovery built-in'
    ],
    category: 'performance'
  },
  {
    id: 'mobile-responsive',
    title: 'Mobile-First Design',
    description: 'Progressive Web App with offline capabilities, touch-optimized interfaces, and native app-like experience on all devices.',
    icon: DevicePhoneMobileIcon,
    image: '/images/mobile-demo.jpg',
    highlights: [
      'Progressive Web App (PWA)',
      'Offline functionality',
      'Touch-optimized interactions',
      'Responsive design',
      'App installation support'
    ],
    category: 'mobile'
  }
]

const categories = {
  analytics: { name: 'Analytics & Visualization', icon: ChartBarIcon, color: 'blue' },
  ai: { name: 'AI & Machine Learning', icon: CpuChipIcon, color: 'purple' },
  collaboration: { name: 'Real-time Collaboration', icon: UserGroupIcon, color: 'green' },
  visualization: { name: 'Data Visualization', icon: ChartBarIcon, color: 'indigo' },
  integration: { name: 'Integration & APIs', icon: CloudIcon, color: 'yellow' },
  security: { name: 'Security & Compliance', icon: ShieldCheckIcon, color: 'red' },
  performance: { name: 'Performance & Scale', icon: ClockIcon, color: 'orange' },
  mobile: { name: 'Mobile & PWA', icon: DevicePhoneMobileIcon, color: 'pink' }
}

const colorClasses = {
  blue: 'from-blue-500 to-blue-600',
  purple: 'from-purple-500 to-purple-600',
  green: 'from-green-500 to-green-600',
  indigo: 'from-indigo-500 to-indigo-600',
  yellow: 'from-yellow-500 to-yellow-600',
  red: 'from-red-500 to-red-600',
  orange: 'from-orange-500 to-orange-600',
  pink: 'from-pink-500 to-pink-600'
}

export function FeaturesPageContent() {
  const [selectedFeature, setSelectedFeature] = useState<string>('visual-knowledge-graphs')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const filteredFeatures = selectedCategory === 'all' 
    ? features 
    : features.filter(f => f.category === selectedCategory)

  const currentFeature = features.find(f => f.id === selectedFeature) || features[0]

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Powerful Features for Energy Trading
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover cutting-edge features designed specifically for energy professionals. 
            From AI-powered insights to real-time collaboration.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Features
          </button>
          {Object.entries(categories).map(([key, category]) => {
            const Icon = category.icon
            return (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center ${
                  selectedCategory === key
                    ? `bg-gradient-to-r ${colorClasses[category.color as keyof typeof colorClasses]} text-white`
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {category.name}
              </button>
            )
          })}
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {filteredFeatures.map((feature) => {
            const Icon = feature.icon
            const category = categories[feature.category]
            const isSelected = selectedFeature === feature.id
            
            return (
              <motion.div
                key={feature.id}
                onClick={() => setSelectedFeature(feature.id)}
                className={`bg-white rounded-xl border-2 cursor-pointer transition-all duration-200 p-6 ${
                  isSelected
                    ? `border-blue-500 shadow-lg scale-105`
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
                whileHover={{ scale: isSelected ? 1.05 : 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${colorClasses[category.color as keyof typeof colorClasses]}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full bg-gradient-to-r ${colorClasses[category.color as keyof typeof colorClasses]} text-white`}>
                    {category.name}
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{feature.description}</p>
                
                <div className="space-y-2">
                  {feature.highlights.slice(0, 3).map((highlight, index) => (
                    <div key={index} className="flex items-center text-sm text-gray-700">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mr-2" />
                      {highlight}
                    </div>
                  ))}
                  {feature.highlights.length > 3 && (
                    <div className="text-sm text-blue-600 font-medium">
                      +{feature.highlights.length - 3} more features
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Selected Feature Details */}
        <motion.div
          key={selectedFeature}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
        >
          <div className={`bg-gradient-to-r ${colorClasses[categories[currentFeature.category].color as keyof typeof colorClasses]} p-8 text-white`}>
            <div className="flex items-center mb-4">
              <currentFeature.icon className="h-12 w-12 mr-4" />
              <div>
                <h2 className="text-3xl font-bold">{currentFeature.title}</h2>
                <p className="text-xl opacity-90">{categories[currentFeature.category].name}</p>
              </div>
            </div>
            <p className="text-lg opacity-90">{currentFeature.description}</p>
          </div>

          <div className="p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Key Highlights</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {currentFeature.highlights.map((highlight, index) => (
                <div key={index} className="flex items-start">
                  <div className={`h-2 w-2 rounded-full bg-gradient-to-r ${colorClasses[categories[currentFeature.category].color as keyof typeof colorClasses]} mt-2 mr-3 flex-shrink-0`} />
                  <span className="text-gray-700">{highlight}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Feature Comparison */}
        <div className="mt-16 bg-gray-50 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Compare Features Across Plans
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Feature</th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-900">Free</th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-900">Starter</th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-900">Professional</th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-900">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 font-medium text-gray-900">Visual Knowledge Graphs</td>
                  <td className="text-center py-4 px-4 text-gray-400">—</td>
                  <td className="text-center py-4 px-4 text-gray-400">Limited</td>
                  <td className="text-center py-4 px-4 text-green-600">✓</td>
                  <td className="text-center py-4 px-4 text-green-600">✓</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 font-medium text-gray-900">AI-Powered Insights</td>
                  <td className="text-center py-4 px-4 text-green-600">Basic</td>
                  <td className="text-center py-4 px-4 text-green-600">Standard</td>
                  <td className="text-center py-4 px-4 text-green-600">Advanced</td>
                  <td className="text-center py-4 px-4 text-green-600">Custom</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 font-medium text-gray-900">Real-time Collaboration</td>
                  <td className="text-center py-4 px-4 text-gray-400">—</td>
                  <td className="text-center py-4 px-4 text-green-600">2 users</td>
                  <td className="text-center py-4 px-4 text-green-600">10 users</td>
                  <td className="text-center py-4 px-4 text-green-600">Unlimited</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 font-medium text-gray-900">India Map & Geospatial</td>
                  <td className="text-center py-4 px-4 text-green-600">Basic</td>
                  <td className="text-center py-4 px-4 text-green-600">✓</td>
                  <td className="text-center py-4 px-4 text-green-600">Advanced</td>
                  <td className="text-center py-4 px-4 text-green-600">Custom</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Experience the Full Power of OptiBid
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Try all features free during development phase. Get started with your personalized demo today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all">
              Start Free Trial
            </button>
            <button className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">
              View Pricing Plans
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}