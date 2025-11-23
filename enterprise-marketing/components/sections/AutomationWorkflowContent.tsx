// =============================================================================
// AUTOMATION WORKFLOW CONTENT SECTION
// =============================================================================
'use client';

import React from 'react';
import { Workflow, Zap, Settings, Bot, ArrowRight, CheckCircle } from 'lucide-react';

export function AutomationWorkflowContent() {
  return (
    <section className="relative py-24 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-purple-100 text-purple-800 mb-4">
            <Workflow className="w-4 h-4 mr-2" />
            Enterprise Automation Platform
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Intelligent
            <span className="bg-gradient-to-r from-pink-400 to-red-400 bg-clip-text text-transparent">
              {' '}Workflow Automation
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Transform your enterprise operations with AI-powered workflow automation that adapts, learns, 
            and optimizes processes in real-time for maximum efficiency and performance.
          </p>
        </div>

        {/* Automation Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Trading Automation */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-bold text-white">Trading Automation</h3>
                <p className="text-green-400">AI-Powered Execution</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-white font-medium">Strategy Optimization</h4>
                  <p className="text-gray-300 text-sm">Automated strategy testing and optimization using genetic algorithms</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-white font-medium">Order Execution</h4>
                  <p className="text-gray-300 text-sm">Smart order routing with slippage minimization and timing optimization</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-white font-medium">Portfolio Rebalancing</h4>
                  <p className="text-gray-300 text-sm">Real-time portfolio optimization based on risk metrics and market conditions</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-white font-medium">Risk Controls</h4>
                  <p className="text-gray-300 text-sm">Automated position sizing, stop-loss, and take-profit management</p>
                </div>
              </div>
            </div>
          </div>

          {/* Operations Automation */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-bold text-white">Operations Automation</h3>
                <p className="text-blue-400">Process Optimization</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-white font-medium">Data Processing</h4>
                  <p className="text-gray-300 text-sm">Automated data validation, cleansing, and enrichment workflows</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-white font-medium">Report Generation</h4>
                  <p className="text-gray-300 text-sm">Scheduled and on-demand automated report creation and distribution</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-white font-medium">Compliance Monitoring</h4>
                  <p className="text-gray-300 text-sm">Real-time compliance checking and automated alert generation</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-white font-medium">System Health</h4>
                  <p className="text-gray-300 text-sm">Predictive maintenance and automated issue resolution</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Workflow Example */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-white text-center mb-8">
            Automated Trading Workflow Example
          </h3>
          
          <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <div className="flex flex-col lg:flex-row items-center justify-between space-y-6 lg:space-y-0 lg:space-x-4">
              
              {/* Market Analysis */}
              <div className="flex-1 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-sm">Market<br/>Analysis</span>
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">1. Market Analysis</h4>
                <p className="text-gray-300 text-sm">AI analyzes 1000+ factors in real-time</p>
              </div>

              <ArrowRight className="w-6 h-6 text-gray-400 hidden lg:block" />

              {/* Signal Generation */}
              <div className="flex-1 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-sm">Signal<br/>Generation</span>
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">2. Signal Generation</h4>
                <p className="text-gray-300 text-sm">ML models generate trading signals</p>
              </div>

              <ArrowRight className="w-6 h-6 text-gray-400 hidden lg:block" />

              {/* Risk Assessment */}
              <div className="flex-1 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-sm">Risk<br/>Check</span>
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">3. Risk Assessment</h4>
                <p className="text-gray-300 text-sm">Real-time risk validation</p>
              </div>

              <ArrowRight className="w-6 h-6 text-gray-400 hidden lg:block" />

              {/* Execution */}
              <div className="flex-1 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-sm">Auto<br/>Execute</span>
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">4. Auto Execution</h4>
                <p className="text-gray-300 text-sm">Optimal trade execution</p>
              </div>

              <ArrowRight className="w-6 h-6 text-gray-400 hidden lg:block" />

              {/* Performance Tracking */}
              <div className="flex-1 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-sm">Track<br/>Results</span>
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">5. Track Results</h4>
                <p className="text-gray-300 text-sm">Performance monitoring & learning</p>
              </div>
            </div>
          </div>
        </div>

        {/* Automation Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">87%</span>
            </div>
            <h4 className="text-lg font-semibold text-white mb-2">Process Automation</h4>
            <p className="text-gray-300 text-sm">Percentage of manual tasks automated</p>
            <div className="mt-4 bg-green-500/20 rounded-full h-2">
              <div className="bg-green-400 h-2 rounded-full" style={{width: '87%'}}></div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">94%</span>
            </div>
            <h4 className="text-lg font-semibold text-white mb-2">Time Savings</h4>
            <p className="text-gray-300 text-sm">Reduction in manual processing time</p>
            <div className="mt-4 bg-blue-500/20 rounded-full h-2">
              <div className="bg-blue-400 h-2 rounded-full" style={{width: '94%'}}></div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">99.2%</span>
            </div>
            <h4 className="text-lg font-semibold text-white mb-2">Accuracy Rate</h4>
            <p className="text-gray-300 text-sm">Automated task execution accuracy</p>
            <div className="mt-4 bg-purple-500/20 rounded-full h-2">
              <div className="bg-purple-400 h-2 rounded-full" style={{width: '99.2%'}}></div>
            </div>
          </div>
        </div>

        {/* Enterprise Features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Custom Workflow Builder */}
          <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 backdrop-blur-lg rounded-xl p-8 border border-indigo-500/20">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-bold text-white">Custom Workflow Builder</h3>
                <p className="text-indigo-400">Drag & Drop Automation</p>
              </div>
            </div>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-center">
                <div className="w-2 h-2 bg-indigo-400 rounded-full mr-3"></div>
                Visual workflow designer with drag-and-drop interface
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-indigo-400 rounded-full mr-3"></div>
                Pre-built templates for common energy trading workflows
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-indigo-400 rounded-full mr-3"></div>
                Conditional logic and branching workflows
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-indigo-400 rounded-full mr-3"></div>
                Integration with third-party systems and APIs
              </li>
            </ul>
          </div>

          {/* Intelligent Decision Making */}
          <div className="bg-gradient-to-br from-pink-900/50 to-red-900/50 backdrop-blur-lg rounded-xl p-8 border border-pink-500/20">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-red-600 rounded-lg flex items-center justify-center">
                <Workflow className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-bold text-white">Intelligent Decision Making</h3>
                <p className="text-pink-400">AI-Powered Logic</p>
              </div>
            </div>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-center">
                <div className="w-2 h-2 bg-pink-400 rounded-full mr-3"></div>
                Machine learning-powered decision trees and rules
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-pink-400 rounded-full mr-3"></div>
                Context-aware process adaptation and optimization
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-pink-400 rounded-full mr-3"></div>
                Predictive workflow recommendations
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-pink-400 rounded-full mr-3"></div>
                Automated error handling and recovery
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}