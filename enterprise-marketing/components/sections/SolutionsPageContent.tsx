'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  BoltIcon, 
  CpuChipIcon,
  BuildingOfficeIcon,
  Battery100Icon
} from '@heroicons/react/24/outline'

interface Solution {
  id: string
  title: string
  subtitle: string
  icon: React.ComponentType<{ className?: string }>
  description: string
  benefits: string[]
  useCases: string[]
  targetUsers: string[]
  color: string
}

const solutions: Solution[] = [
  {
    id: 'analyst',
    title: 'Energy Analyst',
    subtitle: 'Advanced Analytics & Forecasting',
    icon: ChartBarIcon,
    description: 'Powerful analytics tools for energy market analysts to analyze trends, forecast demand, and identify market opportunities.',
    benefits: [
      'Real-time market data visualization',
      'Advanced forecasting models (Prophet, TFT, N-BEATS)',
      'Custom KPI calculations and benchmarking',
      'Historical data analysis and backtesting',
      'Automated report generation'
    ],
    useCases: [
      'Market trend analysis and reporting',
      'Demand forecasting for planning',
      'Price volatility analysis',
      'Regulatory impact assessment',
      'Portfolio performance evaluation'
    ],
    targetUsers: ['Market Analysts', 'Research Teams', 'Data Scientists', 'Strategic Planners'],
    color: 'blue'
  },
  {
    id: 'trader',
    title: 'Energy Trader',
    subtitle: 'Intelligent Bidding Optimization',
    icon: CurrencyDollarIcon,
    description: 'AI-powered trading tools for energy traders to optimize bids, manage risk, and maximize revenue in dynamic market conditions.',
    benefits: [
      'AI-powered bid optimization',
      'Real-time risk assessment',
      'Automated trading strategies',
      'Portfolio management tools',
      'Performance analytics and reporting'
    ],
    useCases: [
      'Day-ahead market bidding',
      'Real-time trading optimization',
      'Risk management and hedging',
      'Portfolio balancing',
      'Arbitrage opportunities identification'
    ],
    targetUsers: ['Energy Traders', 'Portfolio Managers', 'Risk Analysts', 'Trading Teams'],
    color: 'green'
  },
  {
    id: 'producer',
    title: 'Energy Producer',
    subtitle: 'Production Optimization & Revenue',
    icon: BoltIcon,
    description: 'Optimize energy production schedules, maximize revenue, and manage grid interactions for energy producers and generators.',
    benefits: [
      'Production schedule optimization',
      'Revenue maximization algorithms',
      'Grid integration management',
      'Maintenance scheduling',
      'Environmental compliance tracking'
    ],
    useCases: [
      'Renewable energy optimization',
      'Cogeneration planning',
      'Maintenance scheduling',
      'Grid stability support',
      'Carbon credit management'
    ],
    targetUsers: ['Plant Managers', 'Operations Teams', 'Asset Managers', 'Grid Operators'],
    color: 'yellow'
  },
  {
    id: 'grid-ops',
    title: 'Grid Operations',
    subtitle: 'Grid Stability & Real-time Operations',
    icon: BuildingOfficeIcon,
    description: 'Comprehensive grid operations tools for maintaining stability, managing load, and ensuring reliable energy delivery.',
    benefits: [
      'Real-time grid monitoring',
      'Load balancing optimization',
      'Anomaly detection and alerts',
      'Grid stability analysis',
      'Emergency response protocols'
    ],
    useCases: [
      'Load forecasting and balancing',
      'Grid stability monitoring',
      'Outage management',
      'Renewable integration',
      'Demand response programs'
    ],
    targetUsers: ['Grid Operators', 'System Engineers', 'Control Room Operators', 'Reliability Engineers'],
    color: 'purple'
  },
  {
    id: 'storage',
    title: 'Energy Storage',
    subtitle: 'Battery Optimization & Management',
    icon: Battery100Icon,
    description: 'Advanced energy storage optimization tools for battery systems, including charge/discharge scheduling and revenue optimization.',
    benefits: [
      'Battery state optimization',
      'Revenue maximization strategies',
      'Lifecycle management',
      'Safety monitoring and alerts',
      'Integration with grid services'
    ],
    useCases: [
      'Peak shaving and load leveling',
      'Frequency regulation services',
      'Energy arbitrage',
      'Backup power management',
      'Renewable energy integration'
    ],
    targetUsers: ['Battery Operators', 'Storage Managers', 'Asset Optimizers', 'Microgrid Operators'],
    color: 'indigo'
  },
  {
    id: 'ai-platform',
    title: 'AI & ML Platform',
    subtitle: 'Custom Model Development',
    icon: CpuChipIcon,
    description: 'Comprehensive AI/ML platform for developing custom energy forecasting, optimization, and predictive analytics models.',
    benefits: [
      'Custom model development',
      'Automated ML pipeline',
      'Model governance and monitoring',
      'RAG-powered insights',
      'Explainable AI features'
    ],
    useCases: [
      'Custom forecasting models',
      'Anomaly detection systems',
      'Predictive maintenance',
      'Market sentiment analysis',
      'Automated decision making'
    ],
    targetUsers: ['Data Scientists', 'ML Engineers', 'AI Researchers', 'Innovation Teams'],
    color: 'red'
  }
]

const colorClasses = {
  blue: 'from-blue-500 to-blue-600 border-blue-200 text-blue-600',
  green: 'from-green-500 to-green-600 border-green-200 text-green-600',
  yellow: 'from-yellow-500 to-yellow-600 border-yellow-200 text-yellow-600',
  purple: 'from-purple-500 to-purple-600 border-purple-200 text-purple-600',
  indigo: 'from-indigo-500 to-indigo-600 border-indigo-200 text-indigo-600',
  red: 'from-red-500 to-red-600 border-red-200 text-red-600'
}

export function SolutionsPageContent() {
  const [selectedSolution, setSelectedSolution] = useState<string>('analyst')

  const currentSolution = solutions.find(s => s.id === selectedSolution) || solutions[0]

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Industry-Specific Energy Solutions
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Specialized solutions designed for different roles in the energy sector. 
            From analysts to traders, producers to grid operators.
          </p>
        </div>

        {/* Solution Selector */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
          {solutions.map((solution) => {
            const Icon = solution.icon
            const isSelected = selectedSolution === solution.id
            
            return (
              <motion.button
                key={solution.id}
                onClick={() => setSelectedSolution(solution.id)}
                className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                  isSelected
                    ? `${colorClasses[solution.color as keyof typeof colorClasses]} border-current bg-white shadow-lg`
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className={`h-8 w-8 mb-3 ${isSelected ? 'currentColor' : 'text-gray-400'}`} />
                <h3 className={`font-semibold text-sm ${isSelected ? 'currentColor' : 'text-gray-900'}`}>
                  {solution.title}
                </h3>
                <p className={`text-xs mt-1 ${isSelected ? 'currentColor opacity-80' : 'text-gray-500'}`}>
                  {solution.subtitle}
                </p>
              </motion.button>
            )
          })}
        </div>

        {/* Selected Solution Details */}
        <motion.div
          key={selectedSolution}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
        >
          <div className={`bg-gradient-to-r ${colorClasses[currentSolution.color as keyof typeof colorClasses].split(' ')[0]} ${colorClasses[currentSolution.color as keyof typeof colorClasses].split(' ')[1]} p-8 text-white`}>
            <div className="flex items-center mb-4">
              <currentSolution.icon className="h-12 w-12 mr-4" />
              <div>
                <h2 className="text-3xl font-bold">{currentSolution.title}</h2>
                <p className="text-xl opacity-90">{currentSolution.subtitle}</p>
              </div>
            </div>
            <p className="text-lg opacity-90">{currentSolution.description}</p>
          </div>

          <div className="p-8">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Benefits */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Key Benefits</h3>
                <ul className="space-y-3">
                  {currentSolution.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <div className={`h-2 w-2 rounded-full bg-gradient-to-r ${colorClasses[currentSolution.color as keyof typeof colorClasses].split(' ')[0]} ${colorClasses[currentSolution.color as keyof typeof colorClasses].split(' ')[1]} mt-2 mr-3 flex-shrink-0`} />
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Use Cases */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Use Cases</h3>
                <ul className="space-y-3">
                  {currentSolution.useCases.map((useCase, index) => (
                    <li key={index} className="flex items-start">
                      <div className={`h-2 w-2 rounded-full bg-gradient-to-r ${colorClasses[currentSolution.color as keyof typeof colorClasses].split(' ')[0]} ${colorClasses[currentSolution.color as keyof typeof colorClasses].split(' ')[1]} mt-2 mr-3 flex-shrink-0`} />
                      <span className="text-gray-700">{useCase}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Target Users */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Target Users</h3>
                <div className="space-y-2">
                  {currentSolution.targetUsers.map((user, index) => (
                    <span
                      key={index}
                      className={`inline-block bg-gradient-to-r ${colorClasses[currentSolution.color as keyof typeof colorClasses].split(' ')[0]} ${colorClasses[currentSolution.color as keyof typeof colorClasses].split(' ')[1]} text-white px-3 py-1 rounded-full text-sm mr-2 mb-2`}
                    >
                      {user}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Transform Your Energy Operations?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Get started with a personalized demo tailored to your specific use case and industry requirements.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all">
              Request Demo
            </button>
            <button className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">
              View Pricing
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}