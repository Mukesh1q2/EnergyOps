'use client'

import React, { useState } from 'react'
import { useGlobalState } from '@/app/providers-simple'
import { 
  ChartBarIcon, 
  CalculatorIcon, 
  GlobeAmericasIcon,
  ClockIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline'

export default function AnalyticsPage() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d')
  const [selectedRegion, setSelectedRegion] = useState('all')

  // Advanced analytics data
  const kpiMetrics = {
    tradingPerformance: 94.7,
    riskAdjustedReturn: 12.3,
    marketEfficiency: 87.1,
    portfolioDiversification: 73.8,
    bidOptimization: 91.5,
    systemUptime: 99.8
  }

  const benchmarkData = [
    { metric: 'Trading Performance', current: 94.7, industry: 89.2, percentile: 78 },
    { metric: 'Risk-Adjusted Return', current: 12.3, industry: 9.8, percentile: 85 },
    { metric: 'Market Efficiency', current: 87.1, industry: 83.5, percentile: 72 },
    { metric: 'Portfolio Diversification', current: 73.8, industry: 68.4, percentile: 69 },
    { metric: 'Bid Optimization', current: 91.5, industry: 85.1, percentile: 82 }
  ]

  const insights = [
    {
      type: 'opportunity',
      title: 'Market Volatility Opportunity',
      description: 'High volatility detected in Real-Time market. Consider aggressive bidding strategy.',
      impact: 'High',
      confidence: 87
    },
    {
      type: 'optimization',
      title: 'Asset Portfolio Optimization',
      description: 'Solar assets underperforming. Consider shifting capacity to wind during peak hours.',
      impact: 'Medium',
      confidence: 92
    },
    {
      type: 'risk',
      title: 'Concentration Risk Alert',
      description: 'Portfolio heavily weighted towards Day-Ahead market. Diversification recommended.',
      impact: 'Medium',
      confidence: 76
    }
  ]

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'opportunity': return 'border-green-500 bg-green-50 dark:bg-green-900/20'
      case 'optimization': return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
      case 'risk': return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
      default: return 'border-gray-500 bg-gray-50 dark:bg-gray-900/20'
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'High': return 'text-red-600 dark:text-red-400'
      case 'Medium': return 'text-yellow-600 dark:text-yellow-400'
      case 'Low': return 'text-green-600 dark:text-green-400'
      default: return 'text-gray-600 dark:text-gray-400'
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <ChartBarIcon className="h-8 w-8 mr-3 text-blue-600" />
              Advanced Analytics
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Deep insights into trading performance, risk metrics, and market intelligence
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="all">All Regions</option>
              <option value="north">Northern Grid</option>
              <option value="south">Southern Grid</option>
              <option value="east">Eastern Grid</option>
              <option value="west">Western Grid</option>
            </select>
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(kpiMetrics).map(([key, value], index) => {
          const labels = {
            tradingPerformance: 'Trading Performance',
            riskAdjustedReturn: 'Risk-Adjusted Return',
            marketEfficiency: 'Market Efficiency',
            portfolioDiversification: 'Portfolio Diversification',
            bidOptimization: 'Bid Optimization',
            systemUptime: 'System Uptime'
          }
          
          const icons = {
            tradingPerformance: ArrowTrendingUpIcon,
            riskAdjustedReturn: CalculatorIcon,
            marketEfficiency: ArrowTrendingUpIcon,
            portfolioDiversification: GlobeAmericasIcon,
            bidOptimization: ChartBarIcon,
            systemUptime: ClockIcon
          }

          const Icon = icons[key as keyof typeof icons]
          const colors = ['blue', 'green', 'purple', 'orange', 'cyan', 'pink']
          const color = colors[index % colors.length]

          return (
            <div key={key} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg bg-${color}-100 dark:bg-${color}-900/20`}>
                  <Icon className={`h-6 w-6 text-${color}-600 dark:text-${color}-400`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {labels[key as keyof typeof labels]}
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {typeof value === 'number' && value % 1 !== 0 ? value.toFixed(1) : value}
                    {key.includes('Return') ? '%' : key.includes('Performance') || key.includes('Efficiency') || key.includes('Diversification') || key.includes('Optimization') ? '%' : key.includes('Uptime') ? '%' : ''}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Benchmark Comparison */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Industry Benchmark Comparison
        </h3>
        <div className="space-y-4">
          {benchmarkData.map((item, index) => (
            <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900 dark:text-white">{item.metric}</h4>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {item.percentile}th percentile
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-2">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Current</p>
                  <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                    {item.current}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Industry Avg</p>
                  <p className="text-lg font-semibold text-gray-600 dark:text-gray-400">
                    {item.industry}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Percentile</p>
                  <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                    {item.percentile}%
                  </p>
                </div>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${item.percentile}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent font-bold mr-2">
            AI-Powered Insights
          </span>
          <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full text-gray-600 dark:text-gray-400">
            Beta
          </span>
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {insights.map((insight, index) => (
            <div key={index} className={`p-4 border-l-4 rounded-lg ${getInsightColor(insight.type)}`}>
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {insight.title}
                </h4>
                <span className={`text-xs font-medium ${getImpactColor(insight.impact)}`}>
                  {insight.impact}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {insight.description}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {insight.confidence}% confidence
                  </span>
                </div>
                <button className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                  View details →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Advanced Analytics Dashboard */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Performance Trends */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Performance Trends
          </h3>
          <div className="space-y-4">
            <div className="h-64 bg-gray-50 dark:bg-gray-900/50 rounded-lg flex items-center justify-center">
              <p className="text-gray-500 dark:text-gray-400">Advanced performance trend charts would be displayed here</p>
            </div>
          </div>
        </div>

        {/* Risk Analysis */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Risk Analysis
          </h3>
          <div className="space-y-4">
            <div className="h-64 bg-gray-50 dark:bg-gray-900/50 rounded-lg flex items-center justify-center">
              <p className="text-gray-500 dark:text-gray-400">Risk metrics and VaR analysis would be displayed here</p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Insights */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Market Intelligence
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">92%</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Prediction Accuracy</p>
            <p className="text-xs text-gray-500 dark:text-gray-500">Last 30 days</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">$2.4M</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Saved via Optimization</p>
            <p className="text-xs text-gray-500 dark:text-gray-500">This quarter</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">24/7</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Market Monitoring</p>
            <p className="text-xs text-gray-500 dark:text-gray-500">Real-time analysis</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">15+</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">ML Models Active</p>
            <p className="text-xs text-gray-500 dark:text-gray-500">Continuous learning</p>
          </div>
        </div>
      </div>
    </div>
  )
}
