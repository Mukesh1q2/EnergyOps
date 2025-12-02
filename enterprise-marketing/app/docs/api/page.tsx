'use client'

import { SectionWrapper } from '@/components/ui/SectionWrapper'
import { motion } from 'framer-motion'
import { 
  CodeBracketSquareIcon,
  BookOpenIcon,
  ShieldCheckIcon,
  RocketLaunchIcon,
  DocumentTextIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'

export default function ApiDocumentationPage() {
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
              <CodeBracketSquareIcon className="h-4 w-4 mr-2" />
              REST & WebSocket APIs
            </motion.div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              OptiBid Energy <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">API Documentation</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Integrate OptiBid Energy into your applications with our comprehensive REST and WebSocket APIs. 
              Build powerful energy trading automation with real-time data and intelligent recommendations.
            </p>
          </div>

          {/* Quick Start */}
          <section className="mb-16">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                <RocketLaunchIcon className="h-8 w-8 text-purple-600 mr-3" />
                Quick Start
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Base URL</h3>
                  <div className="bg-gray-900 rounded-lg p-4 text-green-400 font-mono text-sm mb-4">
                    https://api.optibid-energy.com/v1
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Authentication</h3>
                  <p className="text-gray-600 mb-3">
                    Use API keys for authentication. Include in the Authorization header:
                  </p>
                  <div className="bg-gray-900 rounded-lg p-4 text-green-400 font-mono text-sm">
                    Authorization: Bearer YOUR_API_KEY
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Rate Limits</h3>
                  <ul className="space-y-2 text-gray-600 mb-4">
                    <li>• <strong>Standard:</strong> 1000 requests/hour</li>
                    <li>• <strong>Professional:</strong> 5000 requests/hour</li>
                    <li>• <strong>Enterprise:</strong> Custom limits</li>
                  </ul>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Response Format</h3>
                  <div className="bg-gray-900 rounded-lg p-4 text-green-400 font-mono text-sm">
                    Content-Type: application/json
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* API Endpoints */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">API Endpoints</h2>
            
            <div className="space-y-6">
              {/* Portfolio API */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Portfolio Management</h3>
                  <p className="text-gray-600">Manage your energy assets and trading positions</p>
                </div>
                <div className="p-6 space-y-4">
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <div className="flex items-center space-x-3">
                        <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">GET</span>
                        <code className="text-gray-900">/portfolio</code>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-gray-600 mb-3">Get your complete portfolio overview</p>
                      <h4 className="font-semibold text-gray-900 mb-2">Response:</h4>
                      <pre className="bg-gray-900 text-green-400 p-3 rounded text-sm overflow-x-auto">
{`{
  "portfolio_id": "port_12345",
  "total_value": 2500000,
  "energy_assets": [
    {
      "asset_id": "solar_001",
      "type": "solar",
      "capacity_mw": 50,
      "location": "California",
      "current_output_mw": 45.2,
      "status": "active"
    }
  ],
  "trading_positions": [
    {
      "position_id": "pos_67890",
      "commodity": "electricity",
      "quantity": 100,
      "price": 45.50,
      "timestamp": "2025-12-02T00:30:00Z"
    }
  ]
}`}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>

              {/* Market Data API */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Market Data</h3>
                  <p className="text-gray-600">Real-time and historical energy market data</p>
                </div>
                <div className="p-6 space-y-4">
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <div className="flex items-center space-x-3">
                        <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">GET</span>
                        <code className="text-gray-900">/market/prices</code>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-gray-600 mb-3">Get current energy prices</p>
                      <div className="flex space-x-2 mb-3">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">region=california</span>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">commodity=electricity</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <div className="flex items-center space-x-3">
                        <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-semibold">WS</span>
                        <code className="text-gray-900">/market/stream</code>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-gray-600 mb-3">WebSocket stream for real-time price updates</p>
                      <pre className="bg-gray-900 text-green-400 p-3 rounded text-sm overflow-x-auto">
{`// Connection
wss://api.optibid-energy.com/v1/market/stream?api_key=YOUR_KEY

// Sample message
{
  "type": "price_update",
  "region": "california",
  "commodity": "electricity",
  "price": 45.67,
  "timestamp": "2025-12-02T00:30:14Z",
  "change": +0.23
}`}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>

              {/* Analytics API */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">AI Analytics</h3>
                  <p className="text-gray-600">Machine learning insights and optimization recommendations</p>
                </div>
                <div className="p-6 space-y-4">
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <div className="flex items-center space-x-3">
                        <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">GET</span>
                        <code className="text-gray-900">/analytics/forecast</code>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-gray-600 mb-3">Get AI-powered energy demand and price forecasts</p>
                      <h4 className="font-semibold text-gray-900 mb-2">Parameters:</h4>
                      <ul className="text-gray-600 text-sm space-y-1 mb-3">
                        <li>• <code>region</code> - Geographic region code</li>
                        <li>• <code>hours_ahead</code> - Forecast horizon (1-168)</li>
                        <li>• <code>granularity</code> - Time interval (15m, 1h, 1d)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trading API */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Automated Trading</h3>
                  <p className="text-gray-600">Execute trades and manage automated strategies</p>
                </div>
                <div className="p-6 space-y-4">
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <div className="flex items-center space-x-3">
                        <span className="bg-yellow-500 text-white px-2 py-1 rounded text-xs font-semibold">POST</span>
                        <code className="text-gray-900">/trading/execute</code>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-gray-600 mb-3">Execute a trade order</p>
                      <pre className="bg-gray-900 text-green-400 p-3 rounded text-sm overflow-x-auto">
{`{
  "action": "buy",
  "commodity": "electricity",
  "quantity": 100,
  "region": "california",
  "order_type": "limit",
  "price_limit": 45.50,
  "valid_until": "2025-12-02T01:30:00Z"
}`}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SDKs & Libraries */}
          <section className="mb-16">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                <GlobeAltIcon className="h-8 w-8 text-blue-600 mr-3" />
                Official SDKs & Libraries
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Python SDK</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Full-featured Python client with async support
                  </p>
                  <pre className="bg-gray-900 text-green-400 p-3 rounded text-xs">
pip install optibid-energy
                  </pre>
                </div>
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">JavaScript SDK</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Browser and Node.js compatible client
                  </p>
                  <pre className="bg-gray-900 text-green-400 p-3 rounded text-xs">
npm install @optibid/js-sdk
                  </pre>
                </div>
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">REST Client</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Generate API clients from OpenAPI spec
                  </p>
                  <a href="/api/openapi.yaml" className="text-blue-600 hover:underline text-sm">
                    Download OpenAPI Spec →
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Security & Rate Limits */}
          <section className="mb-16">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <ShieldCheckIcon className="h-6 w-6 text-green-600 mr-2" />
                  Security Best Practices
                </h2>
                <ul className="space-y-3 text-gray-600">
                  <li>• Store API keys securely using environment variables</li>
                  <li>• Use HTTPS for all API communications</li>
                  <li>• Implement proper error handling and retry logic</li>
                  <li>• Monitor API usage and set up alerts</li>
                  <li>• Rotate API keys regularly</li>
                </ul>
              </div>
              
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Rate Limits & Quotas</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">Standard Plan</h3>
                    <p className="text-gray-600">1,000 requests/hour</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Professional Plan</h3>
                    <p className="text-gray-600">5,000 requests/hour</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Enterprise Plan</h3>
                    <p className="text-gray-600">Custom limits and dedicated support</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Support */}
          <section className="text-center">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white">
              <h2 className="text-3xl font-bold mb-4">Need API Support?</h2>
              <p className="text-xl mb-6 opacity-90">
                Our developer team is here to help you integrate successfully with OptiBid Energy APIs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="/contact" 
                  className="inline-flex items-center px-6 py-3 bg-white text-purple-600 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  Contact Developer Support
                </a>
                <a 
                  href="/docs/tutorials" 
                  className="inline-flex items-center px-6 py-3 border border-white text-white rounded-lg font-medium hover:bg-white/10 transition-colors"
                >
                  View API Tutorials
                </a>
              </div>
            </div>
          </section>
        </div>
      </SectionWrapper>
    </div>
  )
}
