// =============================================================================
// AI-POWERED INTELLIGENCE CONTENT SECTION
// =============================================================================
'use client';

import React from 'react';
import { Brain, Zap, Target, TrendingUp, Shield, Clock } from 'lucide-react';

export function AIIntelligenceContent() {
  return (
    <section className="relative py-24 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-purple-100 text-purple-800 mb-4">
            <Brain className="w-4 h-4 mr-2" />
            AI-Powered Intelligence Platform
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Next-Generation AI for
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              {' '}Energy Trading
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Harness the power of advanced machine learning, predictive analytics, and automated optimization 
            to revolutionize your energy trading strategy with 94%+ accuracy and real-time intelligence.
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <Target className="w-8 h-8 text-cyan-400" />
              <span className="text-2xl font-bold text-white">94.2%</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Price Forecast Accuracy</h3>
            <p className="text-gray-300 text-sm">Advanced ML models predict market movements with unprecedented precision</p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <Zap className="w-8 h-8 text-yellow-400" />
              <span className="text-2xl font-bold text-white">&lt;2ms</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">AI Decision Latency</h3>
            <p className="text-gray-300 text-sm">Ultra-fast neural networks make split-second trading decisions</p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-green-400" />
              <span className="text-2xl font-bold text-white">27.3%</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">ROI Improvement</h3>
            <p className="text-gray-300 text-sm">AI-optimized strategies consistently outperform manual trading</p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <Shield className="w-8 h-8 text-red-400" />
              <span className="text-2xl font-bold text-white">99.7%</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Risk Detection</h3>
            <p className="text-gray-300 text-sm">AI systems identify and mitigate risks before they impact your portfolio</p>
          </div>
        </div>

        {/* AI Features Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Predictive Analytics */}
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-bold text-white">Predictive Analytics</h3>
                <p className="text-cyan-400">Advanced Market Intelligence</p>
              </div>
            </div>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-center">
                <div className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></div>
                Price forecasting with 94.2% accuracy using deep neural networks
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></div>
                Demand prediction 30 days ahead with seasonal adjustments
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></div>
                Supply chain optimization using reinforcement learning
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></div>
                Weather pattern integration for renewable energy forecasting
              </li>
            </ul>
          </div>

          {/* Automated Trading */}
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-bold text-white">Automated Trading</h3>
                <p className="text-green-400">AI-Powered Execution</p>
              </div>
            </div>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                Self-optimizing trading strategies with genetic algorithms
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                Portfolio rebalancing based on risk-adjusted returns
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                Real-time market sentiment analysis from news and social media
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                Cross-market arbitrage opportunity detection
              </li>
            </ul>
          </div>

          {/* Risk Management */}
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-bold text-white">Risk Management</h3>
                <p className="text-red-400">Intelligent Protection</p>
              </div>
            </div>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-center">
                <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
                Real-time risk assessment using ensemble models
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
                Anomaly detection for fraud and market manipulation
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
                VaR calculation with Monte Carlo simulations
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
                Automated stop-loss and take-profit optimization
              </li>
            </ul>
          </div>

          {/* Market Insights */}
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-bold text-white">Market Insights</h3>
                <p className="text-purple-400">Real-Time Intelligence</p>
              </div>
            </div>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-center">
                <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                Pattern recognition in market data using computer vision
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                Correlation analysis across global energy markets
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                Volatility prediction using LSTM networks
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                Natural language processing for regulatory updates
              </li>
            </ul>
          </div>
        </div>

        {/* AI Capabilities Showcase */}
        <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white mb-4">
              Enterprise-Grade AI Capabilities
            </h3>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Our AI platform processes millions of data points per second, continuously learning and adapting 
              to deliver unmatched trading performance and risk management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">10M+</span>
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Data Points/sec</h4>
              <p className="text-gray-300 text-sm">Real-time processing of market data, weather, news, and social sentiment</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">24/7</span>
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Continuous Learning</h4>
              <p className="text-gray-300 text-sm">Self-improving models that adapt to market conditions and optimize performance</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">99.9%</span>
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">System Uptime</h4>
              <p className="text-gray-300 text-sm">Enterprise-grade reliability with redundant AI processing and failover systems</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}