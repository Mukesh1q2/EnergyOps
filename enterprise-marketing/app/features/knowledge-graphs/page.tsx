'use client'

import { SectionWrapper } from '@/components/ui/SectionWrapper'
import { motion } from 'framer-motion'
import { 
  SwatchIcon,
  ShareIcon,
  ChartBarIcon,
  BoltIcon,
  CubeTransparentIcon,
  SparklesIcon,
  CpuChipIcon,
  GlobeAltIcon,
  EyeIcon,
  ArrowsPointingOutIcon,
  PlayIcon
} from '@heroicons/react/24/outline'

export default function KnowledgeGraphsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SectionWrapper>
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center px-4 py-2 rounded-full bg-purple-100 text-purple-800 text-sm font-medium mb-6"
            >
              <SwatchIcon className="h-4 w-4 mr-2" />
              Interactive Network Visualization
            </motion.div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Visual <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Knowledge Graphs</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Transform your energy market data into interactive, visual networks with our advanced knowledge graphs. 
              Discover hidden relationships, patterns, and insights through intuitive node-and-edge visualizations.
            </p>
          </div>

          {/* Demo Section */}
          <section className="mb-16">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-3xl font-bold mb-4">See Knowledge Graphs in Action</h2>
                  <p className="text-xl mb-6 opacity-90">
                    Watch how energy market data, assets, and trading relationships come to life through interactive visualization.
                  </p>
                  <div className="flex gap-4">
                    <button className="inline-flex items-center px-6 py-3 bg-white text-purple-600 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                      <PlayIcon className="h-4 w-4 mr-2" />
                      Watch Demo
                    </button>
                    <button className="inline-flex items-center px-6 py-3 border border-white text-white rounded-lg font-medium hover:bg-white/10 transition-colors">
                      <CubeTransparentIcon className="h-4 w-4 mr-2" />
                      Try Live Demo
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
                    <div className="text-center">
                      <ShareIcon className="h-32 w-32 mx-auto mb-4 text-white/80" />
                      <p className="text-lg font-medium">Interactive Energy Network</p>
                      <p className="text-sm opacity-75">Nodes: 1,247 | Edges: 3,892</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Key Features */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Powerful Visualization Features</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
              >
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                  <ShareIcon className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Interactive Networks</h3>
                <p className="text-gray-600 mb-4">
                  Click, drag, and explore node relationships with smooth animations and intuitive controls.
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Zoom and pan with mouse/touch</li>
                  <li>• Real-time data updates</li>
                  <li>• Customizable node layouts</li>
                </ul>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <SparklesIcon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Intelligent Clustering</h3>
                <p className="text-gray-600 mb-4">
                  Automatic grouping of related entities using machine learning algorithms and pattern recognition.
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Community detection algorithms</li>
                  <li>• Similarity-based grouping</li>
                  <li>• Dynamic cluster visualization</li>
                </ul>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
              >
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                  <EyeIcon className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Real-time Updates</h3>
                <p className="text-gray-600 mb-4">
                  Watch your knowledge graphs evolve as new data flows in, showing live market relationships.
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Live data streaming</li>
                  <li>• Animated transitions</li>
                  <li>• Historical timeline views</li>
                </ul>
              </motion.div>
            </div>
          </section>

          {/* Use Cases */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Real-World Applications</h2>
            
            <div className="space-y-6">
              {/* Market Analysis */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-6 flex-shrink-0">
                    <ChartBarIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Energy Market Analysis</h3>
                    <p className="text-gray-600 mb-4">
                      Visualize relationships between different energy commodities, trading venues, and market participants 
                      to identify trading opportunities and understand market dynamics.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Market Insights:</h4>
                        <ul className="text-gray-600 text-sm space-y-1">
                          <li>• Cross-commodity correlations</li>
                          <li>• Trading venue relationships</li>
                          <li>• Market participant networks</li>
                          <li>• Price discovery patterns</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Benefits:</h4>
                        <ul className="text-gray-600 text-sm space-y-1">
                          <li>• Identify arbitrage opportunities</li>
                          <li>• Understand market influence</li>
                          <li>• Discover hidden connections</li>
                          <li>• Track market evolution</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Asset Management */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-6 flex-shrink-0">
                    <BoltIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Energy Asset Management</h3>
                    <p className="text-gray-600 mb-4">
                      Map relationships between your energy assets, grid connections, and market participation 
                      to optimize portfolio performance and operational efficiency.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Asset Relationships:</h4>
                        <ul className="text-gray-600 text-sm space-y-1">
                          <li>• Generation capacity mapping</li>
                          <li>• Grid interconnection status</li>
                          <li>• Operational dependencies</li>
                          <li>• Maintenance scheduling</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Optimization:</h4>
                        <ul className="text-gray-600 text-sm space-y-1">
                          <li>• Portfolio diversification</li>
                          <li>• Risk distribution analysis</li>
                          <li>• Performance correlation</li>
                          <li>• Strategic planning support</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Risk Analysis */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mr-6 flex-shrink-0">
                    <CpuChipIcon className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Risk Network Analysis</h3>
                    <p className="text-gray-600 mb-4">
                      Understand how different risk factors, market conditions, and operational issues 
                      cascade through your energy portfolio and trading operations.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Risk Mapping:</h4>
                        <ul className="text-gray-600 text-sm space-y-1">
                          <li>• Credit risk propagation</li>
                          <li>• Market volatility networks</li>
                          <li>• Operational risk factors</li>
                          <li>• Regulatory impact chains</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Mitigation:</h4>
                        <ul className="text-gray-600 text-sm space-y-1">
                          <li>• Identify critical dependencies</li>
                          <li>• Stress test scenarios</li>
                          <li>• Contingency planning</li>
                          <li>• Portfolio rebalancing</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Technical Capabilities */}
          <section className="mb-16">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Advanced Technical Capabilities</h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Visualization Engine</h3>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span><strong>D3.js powered:</strong> Industry-leading data visualization library for maximum flexibility</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span><strong>Force-directed layouts:</strong> Automatic positioning algorithms for optimal node placement</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span><strong>Hierarchical layouts:</strong> Tree and radial layouts for organized data structures</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span><strong>Performance optimized:</strong> Handle graphs with 10,000+ nodes smoothly</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Data Integration</h3>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span><strong>Real-time data:</strong> Live streaming updates from multiple data sources</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span><strong>API integration:</strong> Connect to your existing energy trading systems</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span><strong>Custom data sources:</strong> Import from databases, files, and APIs</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span><strong>Data transformation:</strong> Automatic entity extraction and relationship mapping</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Export & Sharing Options</h3>
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <GlobeAltIcon className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                    <p className="font-medium text-gray-900">PNG/SVG</p>
                    <p className="text-sm text-gray-600">High-resolution images</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <CubeTransparentIcon className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                    <p className="font-medium text-gray-900">PDF</p>
                    <p className="text-sm text-gray-600">Vector graphics</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <ArrowsPointingOutIcon className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                    <p className="font-medium text-gray-900">JSON</p>
                    <p className="text-sm text-gray-600">Raw data export</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <ShareIcon className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                    <p className="font-medium text-gray-900">Web Embed</p>
                    <p className="text-sm text-gray-600">Interactive sharing</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Implementation Guide */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Getting Started with Knowledge Graphs</h2>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-blue-600">1</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Data Connection</h3>
                  <p className="text-gray-600">
                    Connect your energy data sources through our API or import existing datasets
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-green-600">2</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Graph Generation</h3>
                  <p className="text-gray-600">
                    Our algorithms automatically map relationships and generate your knowledge graph
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-purple-600">3</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Interactive Exploration</h3>
                  <p className="text-gray-600">
                    Start exploring and discovering insights in your interconnected energy data
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white">
              <h2 className="text-3xl font-bold mb-4">Ready to Visualize Your Energy Networks?</h2>
              <p className="text-xl mb-6 opacity-90">
                Start discovering hidden relationships in your energy data with our powerful knowledge graphs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="/contact" 
                  className="inline-flex items-center px-6 py-3 bg-white text-purple-600 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  Start Free Trial
                </a>
                <a 
                  href="/docs/getting-started" 
                  className="inline-flex items-center px-6 py-3 border border-white text-white rounded-lg font-medium hover:bg-white/10 transition-colors"
                >
                  View Documentation
                </a>
              </div>
            </div>
          </section>
        </div>
      </SectionWrapper>
    </div>
  )
}

