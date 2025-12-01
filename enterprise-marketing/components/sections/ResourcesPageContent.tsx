'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  DocumentTextIcon,
  CodeBracketSquareIcon,
  BookOpenIcon,
  AcademicCapIcon,
  VideoCameraIcon,
  ChartBarIcon,
  PresentationChartLineIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline'

interface Resource {
  id: string
  title: string
  description: string
  type: 'documentation' | 'api' | 'blog' | 'case-study' | 'whitepaper' | 'video' | 'webinar' | 'template'
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration?: string
  url: string
  icon: React.ComponentType<{ className?: string }>
}

const resources: Resource[] = [
  {
    id: 'getting-started',
    title: 'Getting Started with OptiBid Energy',
    description: 'Complete guide to setting up your first energy trading dashboard and connecting your data sources.',
    type: 'documentation',
    category: 'Getting Started',
    difficulty: 'beginner',
    duration: '30 min',
    url: '/docs/getting-started',
    icon: BookOpenIcon
  },
  {
    id: 'api-overview',
    title: 'API Reference',
    description: 'Comprehensive API documentation with examples, authentication, and best practices.',
    type: 'api',
    category: 'Developers',
    difficulty: 'intermediate',
    url: '/api/docs',
    icon: CodeBracketSquareIcon
  },
  {
    id: 'energy-analytics-guide',
    title: 'Energy Market Analytics Guide',
    description: 'Learn advanced analytics techniques for energy market analysis and forecasting.',
    type: 'documentation',
    category: 'Analytics',
    difficulty: 'intermediate',
    duration: '2 hours',
    url: '/docs/analytics-guide',
    icon: ChartBarIcon
  },
  {
    id: 'enterprise-case-study',
    title: 'Enterprise Case Study: Grid Optimization',
    description: 'How a major utility improved grid efficiency by 25% using OptiBid Energy platform.',
    type: 'case-study',
    category: 'Success Stories',
    difficulty: 'beginner',
    url: '/case-studies/grid-optimization',
    icon: PresentationChartLineIcon
  },
  {
    id: 'ai-forecasting-whitepaper',
    title: 'AI-Powered Energy Forecasting Whitepaper',
    description: 'Technical deep-dive into machine learning models for energy demand prediction.',
    type: 'whitepaper',
    category: 'Research',
    difficulty: 'advanced',
    url: '/whitepapers/ai-forecasting',
    icon: AcademicCapIcon
  },
  {
    id: 'api-quickstart',
    title: 'API Quickstart Tutorial',
    description: 'Step-by-step video guide to integrating OptiBid API into your applications.',
    type: 'video',
    category: 'Developers',
    difficulty: 'beginner',
    duration: '15 min',
    url: '/videos/api-quickstart',
    icon: VideoCameraIcon
  },
  {
    id: 'webinar-series',
    title: 'Energy Trading Webinar Series',
    description: 'Monthly webinars covering advanced energy trading strategies and platform updates.',
    type: 'webinar',
    category: 'Education',
    difficulty: 'intermediate',
    url: '/webinars',
    icon: VideoCameraIcon
  },
  {
    id: 'dashboard-templates',
    title: 'Dashboard Templates',
    description: 'Ready-to-use dashboard templates for common energy trading scenarios.',
    type: 'template',
    category: 'Templates',
    difficulty: 'beginner',
    url: '/templates',
    icon: DocumentArrowDownIcon
  }
]

const categories = ['All', 'Getting Started', 'Analytics', 'Developers', 'Success Stories', 'Research', 'Education', 'Templates']
const resourceTypes = ['documentation', 'api', 'blog', 'case-study', 'whitepaper', 'video', 'webinar', 'template']
const difficulties = ['beginner', 'intermediate', 'advanced']

const difficultyColors = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-red-100 text-red-800'
}

const typeColors = {
  documentation: 'bg-blue-100 text-blue-800',
  api: 'bg-purple-100 text-purple-800',
  blog: 'bg-green-100 text-green-800',
  'case-study': 'bg-indigo-100 text-indigo-800',
  whitepaper: 'bg-yellow-100 text-yellow-800',
  video: 'bg-red-100 text-red-800',
  webinar: 'bg-pink-100 text-pink-800',
  template: 'bg-gray-100 text-gray-800'
}

export function ResourcesPageContent() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')

  const filteredResources = resources.filter(resource => {
    const categoryMatch = selectedCategory === 'All' || resource.category === selectedCategory
    const typeMatch = selectedType === 'all' || resource.type === selectedType
    const difficultyMatch = selectedDifficulty === 'all' || resource.difficulty === selectedDifficulty
    
    return categoryMatch && typeMatch && difficultyMatch
  })

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Resources & Documentation
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to master energy trading with OptiBid. From quick tutorials to in-depth technical guides.
          </p>
        </div>

        {/* Quick Access Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white cursor-pointer"
            onClick={() => window.location.href = '/docs/getting-started'}
          >
            <BookOpenIcon className="h-8 w-8 mb-4" />
            <h3 className="font-semibold mb-2">Quick Start Guide</h3>
            <p className="text-blue-100 text-sm">Get up and running in 30 minutes</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white cursor-pointer"
            onClick={() => window.location.href = '/api/docs'}
          >
            <CodeBracketSquareIcon className="h-8 w-8 mb-4" />
            <h3 className="font-semibold mb-2">API Documentation</h3>
            <p className="text-purple-100 text-sm">Comprehensive API reference</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white cursor-pointer"
            onClick={() => window.location.href = '/case-studies'}
          >
            <PresentationChartLineIcon className="h-8 w-8 mb-4" />
            <h3 className="font-semibold mb-2">Case Studies</h3>
            <p className="text-green-100 text-sm">Real-world success stories</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white cursor-pointer"
            onClick={() => window.location.href = '/support'}
          >
            <DocumentTextIcon className="h-8 w-8 mb-4" />
            <h3 className="font-semibold mb-2">Support Center</h3>
            <p className="text-yellow-100 text-sm">Get help when you need it</p>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Type and Difficulty Filters */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Resource Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Types</option>
                {resourceTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty Level</label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Levels</option>
                {difficulties.map((difficulty) => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Resources Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource) => {
            const Icon = resource.icon
            
            return (
              <motion.div
                key={resource.id}
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                onClick={() => window.location.href = resource.url}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg mr-3">
                        <Icon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex flex-wrap gap-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColors[resource.type]}`}>
                          {resource.type.replace('-', ' ')}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyColors[resource.difficulty]}`}>
                          {resource.difficulty}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{resource.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{resource.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{resource.category}</span>
                    {resource.duration && (
                      <span className="text-sm text-gray-500">{resource.duration}</span>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {filteredResources.length === 0 && (
          <div className="text-center py-12">
            <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
            <p className="text-gray-600">Try adjusting your filters to see more results.</p>
          </div>
        )}

        {/* Support Section */}
        <div className="mt-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Need Additional Help?</h2>
          <p className="text-xl mb-6 opacity-90">
            Our team is here to support your success with personalized assistance and training.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
              Contact Support
            </button>
            <button className="border border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:text-blue-600 transition-colors">
              Schedule Training
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}