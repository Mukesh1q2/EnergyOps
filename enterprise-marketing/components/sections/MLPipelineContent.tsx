// =============================================================================
// MACHINE LEARNING PIPELINE CONTENT SECTION
// =============================================================================
'use client';

import React from 'react';
import { GitBranch, Database, Brain, Zap, Shield, TrendingUp } from 'lucide-react';

export function MLPipelineContent() {
  return (
    <section className="relative py-24 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mb-4">
            <Brain className="w-4 h-4 mr-2" />
            Advanced ML Pipeline
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            End-to-End
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {' '}Machine Learning Pipeline
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            From data ingestion to real-time inference, our comprehensive ML pipeline delivers 
            enterprise-grade intelligence with automated model training, validation, and deployment.
          </p>
        </div>

        {/* Pipeline Architecture */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-white text-center mb-12">
            ML Pipeline Architecture
          </h3>
          
          <div className="relative">
            {/* Pipeline Flow */}
            <div className="flex flex-col lg:flex-row items-center justify-between space-y-8 lg:space-y-0 lg:space-x-4">
              
              {/* Data Ingestion */}
              <div className="flex-1 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Database className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Data Ingestion</h4>
                <p className="text-gray-300 text-sm mb-4">Real-time market data, weather, news, and regulatory feeds</p>
                <div className="bg-blue-900/30 rounded-lg p-3 border border-blue-500/30">
                  <p className="text-xs text-blue-300">• 50+ data sources<br/>• Real-time streaming<br/>• Data validation & cleaning</p>
                </div>
              </div>

              <div className="hidden lg:block">
                <GitBranch className="w-8 h-8 text-gray-400 rotate-90" />
              </div>

              {/* Feature Engineering */}
              <div className="flex-1 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <GitBranch className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Feature Engineering</h4>
                <p className="text-gray-300 text-sm mb-4">Automated feature extraction and transformation</p>
                <div className="bg-green-900/30 rounded-lg p-3 border border-green-500/30">
                  <p className="text-xs text-green-300">• 1000+ engineered features<br/>• Automated scaling<br/>• Feature selection</p>
                </div>
              </div>

              <div className="hidden lg:block">
                <GitBranch className="w-8 h-8 text-gray-400 rotate-90" />
              </div>

              {/* Model Training */}
              <div className="flex-1 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Model Training</h4>
                <p className="text-gray-300 text-sm mb-4">Distributed training across GPU clusters</p>
                <div className="bg-purple-900/30 rounded-lg p-3 border border-purple-500/30">
                  <p className="text-xs text-purple-300">• Deep neural networks<br/>• Ensemble methods<br/>• AutoML optimization</p>
                </div>
              </div>

              <div className="hidden lg:block">
                <GitBranch className="w-8 h-8 text-gray-400 rotate-90" />
              </div>

              {/* Real-time Inference */}
              <div className="flex-1 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Real-time Inference</h4>
                <p className="text-gray-300 text-sm mb-4">Sub-millisecond prediction serving</p>
                <div className="bg-orange-900/30 rounded-lg p-3 border border-orange-500/30">
                  <p className="text-xs text-orange-300">• &lt;2ms latency<br/>• Auto-scaling<br/>• Model versioning</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Model Performance Metrics */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-white text-center mb-8">
            Model Performance Metrics
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="w-8 h-8 text-green-400" />
                <span className="text-3xl font-bold text-white">94.2%</span>
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Accuracy</h4>
              <p className="text-gray-300 text-sm">Price prediction accuracy across all timeframes</p>
              <div className="mt-4 bg-green-500/20 rounded-full h-2">
                <div className="bg-green-400 h-2 rounded-full" style={{width: '94.2%'}}></div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <Shield className="w-8 h-8 text-blue-400" />
                <span className="text-3xl font-bold text-white">97.8%</span>
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Precision</h4>
              <p className="text-gray-300 text-sm">Risk assessment and anomaly detection accuracy</p>
              <div className="mt-4 bg-blue-500/20 rounded-full h-2">
                <div className="bg-blue-400 h-2 rounded-full" style={{width: '97.8%'}}></div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <Zap className="w-8 h-8 text-yellow-400" />
                <span className="text-3xl font-bold text-white">1.8ms</span>
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Inference Time</h4>
              <p className="text-gray-300 text-sm">Average model inference latency</p>
              <div className="mt-4 bg-yellow-500/20 rounded-full h-2">
                <div className="bg-yellow-400 h-2 rounded-full" style={{width: '95%'}}></div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <Brain className="w-8 h-8 text-purple-400" />
                <span className="text-3xl font-bold text-white">99.9%</span>
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Availability</h4>
              <p className="text-gray-300 text-sm">Model serving uptime and reliability</p>
              <div className="mt-4 bg-purple-500/20 rounded-full h-2">
                <div className="bg-purple-400 h-2 rounded-full" style={{width: '99.9%'}}></div>
              </div>
            </div>
          </div>
        </div>

        {/* ML Models Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Deep Learning Models */}
          <div className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 backdrop-blur-lg rounded-xl p-8 border border-blue-500/20">
            <h3 className="text-xl font-bold text-white mb-6">Deep Learning Models</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
                <div>
                  <h4 className="font-semibold text-white">LSTM Price Forecaster</h4>
                  <p className="text-sm text-gray-300">Multi-variate time series prediction</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-400">94.2%</div>
                  <div className="text-xs text-gray-400">Accuracy</div>
                </div>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
                <div>
                  <h4 className="font-semibold text-white">Transformer Market Analyzer</h4>
                  <p className="text-sm text-gray-300">Attention-based market intelligence</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-400">92.7%</div>
                  <div className="text-xs text-gray-400">Accuracy</div>
                </div>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
                <div>
                  <h4 className="font-semibold text-white">CNN Volatility Predictor</h4>
                  <p className="text-sm text-gray-300">Pattern recognition in market data</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-400">96.1%</div>
                  <div className="text-xs text-gray-400">Accuracy</div>
                </div>
              </div>
            </div>
          </div>

          {/* Ensemble Models */}
          <div className="bg-gradient-to-br from-green-900/50 to-teal-900/50 backdrop-blur-lg rounded-xl p-8 border border-green-500/20">
            <h3 className="text-xl font-bold text-white mb-6">Ensemble Models</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
                <div>
                  <h4 className="font-semibold text-white">Random Forest Risk Assessor</h4>
                  <p className="text-sm text-gray-300">Multi-feature risk evaluation</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-400">97.8%</div>
                  <div className="text-xs text-gray-400">Precision</div>
                </div>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
                <div>
                  <h4 className="font-semibold text-white">XGBoost Trend Analyzer</h4>
                  <p className="text-sm text-gray-300">Gradient boosting for trends</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-teal-400">95.4%</div>
                  <div className="text-xs text-gray-400">Precision</div>
                </div>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
                <div>
                  <h4 className="font-semibold text-white">SVM Anomaly Detector</h4>
                  <p className="text-sm text-gray-300">Support vector anomaly detection</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-cyan-400">98.3%</div>
                  <div className="text-xs text-gray-400">Precision</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Automated Model Lifecycle */}
        <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 backdrop-blur-lg rounded-2xl p-8 border border-indigo-500/20">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white mb-4">
              Automated Model Lifecycle Management
            </h3>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Our platform automatically monitors model performance, triggers retraining, and deploys updates 
              to ensure optimal accuracy and reliability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-lg font-bold text-white">MLOps</span>
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Model Operations</h4>
              <p className="text-gray-300 text-sm">Automated CI/CD for ML models with version control and rollback capabilities</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-lg font-bold text-white">Auto</span>
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Auto Retraining</h4>
              <p className="text-gray-300 text-sm">Models automatically retrain when performance drops below thresholds</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-lg font-bold text-white">QA</span>
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Quality Assurance</h4>
              <p className="text-gray-300 text-sm">Rigorous testing and validation before production deployment</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}