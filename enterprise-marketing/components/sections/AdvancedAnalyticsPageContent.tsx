import { SectionWrapper } from '@/components/ui/SectionWrapper'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  ChartBarIcon, 
  CubeIcon, 
  CurrencyDollarIcon, 
  ClockIcon,
  GlobeAltIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  BeakerIcon,
  ServerIcon,
  ShieldCheckIcon,
  PlayIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'

export function AdvancedAnalyticsPageContent() {
  return (
    <div className="relative z-10">
      {/* Analytics Hero Section */}
      <section className="relative py-24 lg:py-32">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-6">
              <Badge variant="outline" className="border-indigo-200 bg-indigo-50/50 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300">
                <ChartBarIcon className="w-4 h-4 mr-2" />
                Advanced Enterprise Analytics
              </Badge>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              Real-time Market Intelligence
              <br />
              <span className="text-2xl lg:text-4xl text-gray-600 dark:text-gray-300">
                Enterprise-Grade Analytics Platform
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Transform your energy trading decisions with advanced analytics, real-time market data, 
              AI-powered insights, and customizable dashboards designed for enterprise scale operations.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                <PlayIcon className="w-5 h-5 mr-2" />
                Launch Analytics Demo
              </Button>
              <Button size="lg" variant="outline" className="border-gray-300 dark:border-gray-600">
                <CubeIcon className="w-5 h-5 mr-2" />
                View Architecture
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Real-time Data Integration */}
      <SectionWrapper>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Real-time Market Data Integration
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Access live market data from major energy exchanges with millisecond precision 
              and real-time processing capabilities.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {dataSources.map((source, index) => (
              <Card key={index} className="relative overflow-hidden group hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg">
                        <source.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{source.name}</CardTitle>
                        <CardDescription>{source.description}</CardDescription>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                      Live
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                          {source.latency}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Latency</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {source.frequency}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Update Rate</div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Data Types</h4>
                      <div className="flex flex-wrap gap-2">
                        {source.dataTypes.map((type, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </SectionWrapper>

      {/* Advanced KPI Dashboard */}
      <SectionWrapper className="bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Enterprise KPI Dashboard
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Customizable dashboards with advanced KPIs, real-time metrics, and predictive analytics 
              tailored for energy trading operations.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {kpiMetrics.map((kpi, index) => (
              <Card key={index} className="relative overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                      <kpi.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500 dark:text-gray-400">{kpi.label}</div>
                      <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                        {kpi.value}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">{kpi.change}</span>
                    <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Interactive Dashboard Preview */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">Real-time Trading Dashboard</h3>
              <Button size="sm" variant="outline">
                <CubeIcon className="w-4 h-4 mr-2" />
                Customize View
              </Button>
            </div>
            
            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Market Overview */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">Market Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <ChartBarIcon className="w-16 h-16 text-indigo-500 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">Interactive Chart</p>
                      <p className="text-sm text-gray-500">Real-time price data</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Market Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Market Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {marketSummary.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{item.label}</span>
                      <div className="text-right">
                        <div className="font-semibold">{item.value}</div>
                        <div className={`text-xs ${item.trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {item.trend > 0 ? '+' : ''}{item.change}%
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* AI-Powered Insights */}
      <SectionWrapper>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              AI-Powered Market Insights
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Advanced machine learning algorithms provide predictive analytics, market forecasting, 
              and intelligent trading recommendations.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {aiCapabilities.map((capability, index) => (
              <Card key={index} className="relative overflow-hidden group hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center mb-4">
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                      <SparklesIcon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-xl mb-2">{capability.title}</CardTitle>
                  <CardDescription className="text-base">
                    {capability.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {capability.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <SparklesIcon className="w-4 h-4 text-purple-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Accuracy Rate</div>
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {capability.accuracy}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </SectionWrapper>

      {/* Enterprise Security & Compliance */}
      <SectionWrapper className="bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Enterprise Security & Compliance
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Bank-grade security with comprehensive compliance framework for enterprise deployments.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {securityFeatures.map((feature, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="p-3 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex-shrink-0">
                  <ShieldCheckIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">{feature.description}</p>
                  <ul className="space-y-1">
                    {feature.certifications.map((cert, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2 flex-shrink-0" />
                        {cert}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </SectionWrapper>

      {/* Global Deployment */}
      <SectionWrapper>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Global Deployment Architecture
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Multi-region deployment with edge computing, data sovereignty, and 24/7 global support.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              {globalFeatures.map((feature, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex-shrink-0">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{feature.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl">
              <h3 className="text-xl font-bold mb-6 text-center">Global Infrastructure</h3>
              <div className="grid grid-cols-2 gap-4">
                {globalRegions.map((region, index) => (
                  <div key={index} className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">
                      {region.location}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {region.capacity}
                    </div>
                    <div className="text-xs text-green-500 mt-1">
                      {region.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* CTA Section */}
      <SectionWrapper className="bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-700">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Transform Your Analytics Today
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join Fortune 500 energy companies using our advanced analytics platform 
            to optimize their trading operations and market intelligence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100">
              <PlayIcon className="w-5 h-5 mr-2" />
              Start Analytics Trial
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-indigo-600">
              Schedule Demo
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </SectionWrapper>
    </div>
  )
}

// Data arrays
const dataSources = [
  {
    name: "PJM Interconnection",
    description: "Real-time pricing and market data from PJM markets",
    latency: "< 5ms",
    frequency: "1 second",
    dataTypes: ["Real-time Pricing", "Load Forecast", "Market Clearing", "Congestion"],
    icon: GlobeAltIcon
  },
  {
    name: "ERCOT Grid",
    description: "Texas energy market real-time data and grid conditions",
    latency: "< 3ms",
    frequency: "500ms",
    dataTypes: ["System Load", "Pricing", "Renewable Output", "Grid Status"],
    icon: ServerIcon
  },
  {
    name: "CAISO Markets",
    description: "California ISO real-time market data and forecasts",
    latency: "< 4ms",
    frequency: "750ms",
    dataTypes: ["Market Clearing", "Load Forecast", "Renewable Integration", "Grid Operations"],
    icon: ChartBarIcon
  },
  {
    name: "India Energy Exchange",
    description: "Indian energy market real-time data and trading volumes",
    latency: "< 10ms",
    frequency: "2 seconds",
    dataTypes: ["Market Prices", "Trading Volume", "Renewable Credits", "Grid Statistics"],
    icon: CurrencyDollarIcon
  }
]

const kpiMetrics = [
  { icon: CurrencyDollarIcon, label: "Revenue Today", value: "$2.4M", change: "+15.2%" },
  { icon: ArrowTrendingUpIcon, label: "Efficiency Gain", value: "98.5%", change: "+3.1%" },
  { icon: ChartBarIcon, label: "Trade Volume", value: "847 MW", change: "+22.8%" },
  { icon: SparklesIcon, label: "AI Predictions", value: "94.2%", change: "+1.4%" }
]

const marketSummary = [
  { label: "Peak Load", value: "45.2 GW", trend: 2.3, change: 5.2 },
  { label: "Avg Price", value: "$32.50", trend: -1.2, change: -2.1 },
  { label: "Renewable %", value: "28.4%", trend: 4.1, change: 8.3 },
  { label: "Grid Stability", value: "99.8%", trend: 0.3, change: 0.8 }
]

const aiCapabilities = [
  {
    title: "Price Forecasting",
    description: "AI-powered predictions for electricity prices and market trends",
    features: [
      "Multi-timeframe forecasting (15min to 30 days)",
      "Weather pattern integration",
      "Historical data analysis",
      "Market sentiment analysis"
    ],
    accuracy: "94.2%"
  },
  {
    title: "Risk Assessment",
    description: "Automated risk analysis and portfolio optimization",
    features: [
      "Real-time risk monitoring",
      "Portfolio stress testing",
      "VaR calculations",
      "Credit risk assessment"
    ],
    accuracy: "97.8%"
  },
  {
    title: "Strategy Optimization",
    description: "Machine learning-driven trading strategy optimization",
    features: [
      "Strategy backtesting",
      "Performance optimization",
      "Risk-adjusted returns",
      "Adaptive algorithms"
    ],
    accuracy: "96.5%"
  }
]

const securityFeatures = [
  {
    title: "Data Protection",
    description: "End-to-end encryption and secure data handling",
    certifications: ["SOC 2 Type II", "ISO 27001", "GDPR Compliant", "CCPA Compliant"]
  },
  {
    title: "Access Control",
    description: "Role-based access with SSO integration",
    certifications: ["SAML 2.0", "OAuth 2.0", "Multi-factor Auth", "Audit Logging"]
  },
  {
    title: "Infrastructure Security",
    description: "Secure cloud infrastructure with regular audits",
    certifications: ["AWS Security", "Penetration Testing", "Vulnerability Scanning", "Incident Response"]
  },
  {
    title: "Compliance Framework",
    description: "Comprehensive compliance with industry standards",
    certifications: ["NERC CIP", "FERC Standards", "ISO Standards", "Industry Guidelines"]
  }
]

const globalFeatures = [
  {
    icon: GlobeAltIcon,
    title: "Multi-Region Deployment",
    description: "Deploy across multiple AWS regions for optimal performance and compliance"
  },
  {
    icon: ServerIcon,
    title: "Edge Computing",
    description: "Edge nodes for ultra-low latency market data processing"
  },
  {
    icon: ClockIcon,
    title: "24/7 Global Support",
    description: "Round-the-clock support with regional experts"
  },
  {
    icon: ShieldCheckIcon,
    title: "Data Sovereignty",
    description: "Local data residency options for regulatory compliance"
  }
]

const globalRegions = [
  { location: "US East", capacity: "99.9%", status: "Online" },
  { location: "US West", capacity: "99.9%", status: "Online" },
  { location: "EU Central", capacity: "99.8%", status: "Online" },
  { location: "Asia Pacific", capacity: "99.7%", status: "Online" }
]