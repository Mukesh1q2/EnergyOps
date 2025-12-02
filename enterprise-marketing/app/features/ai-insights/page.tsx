'use client'

import { SectionWrapper } from '@/components/ui/SectionWrapper'
import { motion } from 'framer-motion'
import { 
  SparklesIcon,
  CpuChipIcon,
  ChartBarIcon,
  LightBulbIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  EyeIcon,
  RocketLaunchIcon,
  PlayIcon
} from '@heroicons/react/24/outline'

export default function AIInsightsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SectionWrapper>
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center px-4 py-2 rounded-full bg-yellow-100 text-yellow-800 text-sm font-medium mb-6"
            >
              <SparklesIcon className="h-4 w-4 mr-2" />
              Machine Learning Intelligence
            </motion.div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">AI-Powered</span> Insights
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Harness the power of advanced machine learning algorithms to gain predictive analytics, 
              optimization recommendations, and intelligent insights for superior energy trading performance.
            </p>
          </div>

          {/* AI Capabilities Overview */}
          <section className="mb-16">
            <div className="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-2xl p-8 text-white">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-3xl font-bold mb-4">Advanced AI at Your Fingertips</h2>
                  <p className="text-xl mb-6 opacity-90">
                    Our AI engine processes terabytes of energy market data, weather patterns, and trading signals 
                    to provide you with actionable insights and intelligent recommendations.
                  </p>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white/10 rounded-lg p-3">
                      <div className="text-2xl font-bold">98.5%</div>
                      <div className="text-sm opacity-75">Forecast Accuracy</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                      <div className="text-2xl font-bold">24/7</div>
                      <div className="text-sm opacity-75">Real-time Analysis</div>
                    </div>
                  </div>
                  <button className="inline-flex items-center px-6 py-3 bg-white text-orange-600 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                    <PlayIcon className="h-4 w-4 mr-2" />
                    Watch AI Demo
                  </button>
                </div>
                <div className="relative">
                  <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
                    <div className="text-center">
                      <CpuChipIcon className="h-32 w-32 mx-auto mb-4 text-white/80" />
                      <p className="text-lg font-medium">AI Processing Engine</p>
                      <p className="text-sm opacity-75">Processing 10TB+ market data daily</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Core AI Features */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Core AI Capabilities</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <ChartBarIcon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Predictive Forecasting</h3>
                <p className="text-gray-600 mb-4">
                  ML models predict energy demand, prices, and market trends with high accuracy using historical data and real-time signals.
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Multi-horizon forecasting (1h to 30 days)</li>
                  <li>• Weather pattern integration</li>
                  <li>• Seasonal adjustment algorithms</li>
                  <li>• Confidence intervals and accuracy metrics</li>
                </ul>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
              >
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                  <LightBulbIcon className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Optimization Engine</h3>
                <p className="text-gray-600 mb-4">
                  AI algorithms optimize trading strategies, portfolio allocation, and risk management decisions in real-time.
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Dynamic strategy optimization</li>
                  <li>• Risk-adjusted portfolio balancing</li>
                  <li>• Automated rebalancing triggers</li>
                  <li>• Multi-objective optimization</li>
                </ul>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
              >
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                  <EyeIcon className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Anomaly Detection</h3>
                <p className="text-gray-600 mb-4">
                  Machine learning models identify unusual market conditions, trading opportunities, and potential risks automatically.
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Real-time anomaly detection</li>
                  <li>• Automated alert generation</li>
                  <li>• Root cause analysis</li>
                  <li>• Predictive risk assessment</li>
                </ul>
              </motion.div>
            </div>
          </section>

          {/* AI Use Cases */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Intelligent Applications</h2>
            
            <div className="space-y-6">
              {/* Price Prediction */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-6 flex-shrink-0">
                    <ArrowTrendingUpIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Price Prediction & Market Forecasting</h3>
                    <p className="text-gray-600 mb-4">
                      Our AI models analyze thousands of market variables, weather patterns, demand cycles, and geopolitical events 
                      to predict energy prices with remarkable accuracy.
                    </p>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Prediction Capabilities:</h4>
                        <ul className="text-gray-600 text-sm space-y-1">
                          <li>• Hour-ahead, day-ahead, and week-ahead prices</li>
                          <li>• Peak and off-peak demand forecasting</li>
                          <li>• Renewable energy output prediction</li>
                          <li>• Cross-market price arbitrage opportunities</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Data Sources:</h4>
                        <ul className="text-gray-600 text-sm space-y-1">
                          <li>• Historical price and volume data</li>
                          <li>• Weather forecasts and historical patterns</li>
                          <li>• Grid operation data and constraints</li>
                          <li>• Economic indicators and market news</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trading Optimization */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-6 flex-shrink-0">
                    <RocketLaunchIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Automated Trading Optimization</h3>
                    <p className="text-gray-600 mb-4">
                      AI algorithms continuously optimize your trading strategies, automatically adjusting parameters based on 
                      market conditions, risk tolerance, and performance objectives.
                    </p>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Optimization Areas:</h4>
                        <ul className="text-gray-600 text-sm space-y-1">
                          <li>• Entry and exit timing optimization</li>
                          <li>• Position sizing based on risk metrics</li>
                          <li>• Multi-asset correlation analysis</li>
                          <li>• Dynamic hedging strategies</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Intelligent Actions:</h4>
                        <ul className="text-gray-600 text-sm space-y-1">
                          <li>• Automatic order placement</li>
                          <li>• Stop-loss optimization</li>
                          <li>• Profit-taking level adjustment</li>
                          <li>• Portfolio rebalancing recommendations</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Risk Assessment */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mr-6 flex-shrink-0">
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Intelligent Risk Assessment</h3>
                    <p className="text-gray-600 mb-4">
                      Advanced risk models use machine learning to identify potential market risks, credit issues, 
                      and operational challenges before they impact your portfolio.
                    </p>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Risk Detection:</h4>
                        <ul className="text-gray-600 text-sm space-y-1">
                          <li>• Market volatility spikes</li>
                          <li>• Counterparty credit deterioration</li>
                          <li>• Grid operation anomalies</li>
                          <li>• Regulatory change impacts</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Mitigation Actions:</h4>
                        <ul className="text-gray-600 text-sm space-y-1">
                          <li>• Automatic position reduction</li>
                          <li>• Hedging recommendation alerts</li>
                          <li>• Portfolio diversification suggestions</li>
                          <li>• Stress test scenario generation</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* AI Technology Stack */}
          <section className="mb-16">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Advanced AI Technology Stack</h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Machine Learning Models</h3>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span><strong>LSTM Networks:</strong> Long Short-Term Memory models for time series forecasting</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span><strong>Random Forest:</strong> Ensemble methods for robust prediction and feature importance</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span><strong>Gradient Boosting:</strong> XGBoost and LightGBM for high-performance regression</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span><strong>Deep Neural Networks:</strong> Multi-layer perception for complex pattern recognition</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Data Processing Pipeline</h3>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span><strong>Real-time ingestion:</strong> Streaming data from 100+ market sources</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span><strong>Feature engineering:</strong> Automated creation of predictive features</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span><strong>Model training:</strong> Continuous learning from new market data</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span><strong>Ensemble methods:</strong> Combining multiple models for optimal predictions</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Performance Metrics & Monitoring</h3>
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <ArrowTrendingUpIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="font-medium text-gray-900">98.5%</p>
                    <p className="text-sm text-gray-600">Price Accuracy</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <ClockIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="font-medium text-gray-900">&lt;100ms</p>
                    <p className="text-sm text-gray-600">Prediction Speed</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <EyeIcon className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="font-medium text-gray-900">24/7</p>
                    <p className="text-sm text-gray-600">Monitoring</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <CpuChipIcon className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <p className="font-medium text-gray-900">50+</p>
                    <p className="text-sm text-gray-600">ML Models Active</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Implementation Process */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">How AI Insights Work</h2>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-blue-600">1</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Data Collection</h3>
                  <p className="text-gray-600">
                    Our AI continuously gathers data from multiple energy markets, weather services, and economic sources
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-green-600">2</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Model Processing</h3>
                  <p className="text-gray-600">
                    Advanced algorithms analyze patterns, relationships, and trends across all collected data
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-purple-600">3</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Insight Generation</h3>
                  <p className="text-gray-600">
                    AI creates actionable recommendations and predictions tailored to your specific needs
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-orange-600">4</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Continuous Learning</h3>
                  <p className="text-gray-600">
                    Models continuously improve by learning from new data and market outcomes
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Success Stories */}
          <section className="mb-16">
            <div className="bg-gray-100 rounded-2xl p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">AI-Driven Success Stories</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg p-6">
                  <div className="text-3xl font-bold text-green-600 mb-2">23%</div>
                  <div className="font-semibold text-gray-900 mb-2">Portfolio Performance Increase</div>
                  <p className="text-gray-600 text-sm">
                    Major utility company improved portfolio returns by 23% using AI-optimized trading strategies
                  </p>
                </div>
                <div className="bg-white rounded-lg p-6">
                  <div className="text-3xl font-bold text-blue-600 mb-2">35%</div>
                  <div className="font-semibold text-gray-900 mb-2">Risk Reduction</div>
                  <p className="text-gray-600 text-sm">
                    Energy trader reduced portfolio risk by 35% through AI-powered anomaly detection and early warnings
                  </p>
                </div>
                <div className="bg-white rounded-lg p-6">
                  <div className="text-3xl font-bold text-purple-600 mb-2">$2.1M</div>
                  <div className="font-semibold text-gray-900 mb-2">Annual Savings</div>
                  <p className="text-gray-600 text-sm">
                    Industrial energy buyer saved $2.1M annually with AI-optimized purchasing and hedging strategies
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center">
            <div className="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-2xl p-8 text-white">
              <h2 className="text-3xl font-bold mb-4">Unlock AI-Powered Energy Trading</h2>
              <p className="text-xl mb-6 opacity-90">
                Start using advanced AI insights to make smarter trading decisions and optimize your energy portfolio performance.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="/contact" 
                  className="inline-flex items-center px-6 py-3 bg-white text-orange-600 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  Start AI Trial
                </a>
                <a 
                  href="/docs/getting-started" 
                  className="inline-flex items-center px-6 py-3 border border-white text-white rounded-lg font-medium hover:bg-white/10 transition-colors"
                >
                  <LightBulbIcon className="h-4 w-4 mr-2" />
                  Learn More
                </a>
              </div>
            </div>
          </section>
        </div>
      </SectionWrapper>
    </div>
  )
}


