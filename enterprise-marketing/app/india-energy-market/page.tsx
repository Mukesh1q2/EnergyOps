import { Suspense } from 'react';
import IndiaEnergyMarketDashboard from '@/components/quantum/IndiaEnergyMarketDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MapPin, TrendingUp, Zap, Sun, Wind, Droplets, 
  Factory, Users, Gauge, BarChart3, 
  Info, ArrowRight, CheckCircle, Globe
} from 'lucide-react';

/**
 * India Energy Market Portal
 * Comprehensive dashboard for Indian energy sector analytics
 * Features real-time data integration with IEX India and state-wise energy infrastructure
 */

export default function IndiaEnergyMarketPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <Globe className="w-12 h-12 mr-4" />
              <h1 className="text-5xl font-bold">India Energy Market</h1>
            </div>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Comprehensive analytics platform for India's dynamic energy sector. 
              Real-time insights from IEX India, state-wise infrastructure mapping, 
              and quantum-powered market intelligence.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <Badge variant="secondary" className="text-lg py-2 px-4 bg-white/10 border-white/20">
                <CheckCircle className="w-4 h-4 mr-2" />
                IEX Integration
              </Badge>
              <Badge variant="secondary" className="text-lg py-2 px-4 bg-white/10 border-white/20">
                <MapPin className="w-4 h-4 mr-2" />
                28 States, 8 UTs
              </Badge>
              <Badge variant="secondary" className="text-lg py-2 px-4 bg-white/10 border-white/20">
                <Zap className="w-4 h-4 mr-2" />
                Real-time Data
              </Badge>
            </div>
            <Button 
              size="lg" 
              variant="secondary" 
              className="text-lg px-8 py-3 bg-white text-blue-600 hover:bg-blue-50"
            >
              Explore Market Insights
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      {/* Key Features Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Comprehensive Energy Market Intelligence
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Advanced analytics platform powered by quantum computing for India's energy sector
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <TrendingUp className="w-8 h-8 text-blue-500" />
                <Badge variant="outline">Live</Badge>
              </div>
              <CardTitle>Real-time Market Data</CardTitle>
              <CardDescription>
                Live pricing from IEX India across RTM, DAM, GDAM, and REC markets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  15-minute RTM price updates
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  DAM clearing prices and volumes
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Market segment analytics
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <MapPin className="w-8 h-8 text-green-500" />
                <Badge variant="outline">GIS</Badge>
              </div>
              <CardTitle>Geographic Visualization</CardTitle>
              <CardDescription>
                Interactive maps showing energy infrastructure across Indian states
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  State-wise capacity mapping
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Supplier location markers
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Grid zone visualization
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Sun className="w-8 h-8 text-yellow-500" />
                <Badge variant="outline">Clean</Badge>
              </div>
              <CardTitle>Renewable Energy Analytics</CardTitle>
              <CardDescription>
                Comprehensive tracking of solar, wind, and hydro energy infrastructure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  State renewable capacity rankings
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Major project tracking
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Grid integration metrics
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Factory className="w-8 h-8 text-purple-500" />
                <Badge variant="outline">B2B</Badge>
              </div>
              <CardTitle>Supplier & DISCOM Analytics</CardTitle>
              <CardDescription>
                Detailed profiles of energy producers, traders, and distribution companies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Top generator capacity analysis
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  DISCOM performance metrics
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Market participant insights
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <BarChart3 className="w-8 h-8 text-red-500" />
                <Badge variant="outline">AI</Badge>
              </div>
              <CardTitle>Advanced Analytics</CardTitle>
              <CardDescription>
                Quantum-powered forecasting and market intelligence
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Demand forecasting models
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Grid stability monitoring
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Price volatility analysis
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-indigo-500 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Users className="w-8 h-8 text-indigo-500" />
                <Badge variant="outline">Enterprise</Badge>
              </div>
              <CardTitle>Market Intelligence</CardTitle>
              <CardDescription>
                Enterprise-grade insights for energy sector decision making
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Market trend analysis
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Participant benchmarking
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Investment opportunity mapping
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Market Statistics Overview */}
      <div className="bg-white dark:bg-gray-900 border-y">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">129.9 GW</div>
              <div className="text-gray-600 dark:text-gray-400">Renewable Capacity</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">8,100+</div>
              <div className="text-gray-600 dark:text-gray-400">Market Participants</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">36</div>
              <div className="text-gray-600 dark:text-gray-400">States & UTs Covered</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">₹2,140</div>
              <div className="text-gray-600 dark:text-gray-400">Current RTM Price/MWh</div>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Interactive Market Dashboard
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Explore real-time market data, geographic visualizations, and advanced analytics 
            through our comprehensive dashboard interface
          </p>
        </div>

        <Card className="shadow-2xl border-0">
          <CardContent className="p-0">
            <Suspense fallback={
              <div className="flex items-center justify-center h-[800px] bg-gray-50 dark:bg-gray-800">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">Loading India Energy Market Dashboard...</p>
                </div>
              </div>
            }>
              <IndiaEnergyMarketDashboard />
            </Suspense>
          </CardContent>
        </Card>
      </div>

      {/* Data Sources and Integration */}
      <div className="bg-gray-100 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Trusted Data Sources
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Integrated with India's leading energy market platforms and regulatory bodies
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <Globe className="w-12 h-12 mx-auto text-blue-600 mb-4" />
                <CardTitle>IEX India</CardTitle>
                <CardDescription>
                  Real-time market data from Indian Energy Exchange
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Sun className="w-12 h-12 mx-auto text-green-600 mb-4" />
                <CardTitle>MNRE</CardTitle>
                <CardDescription>
                  Ministry of New and Renewable Energy official statistics
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Zap className="w-12 h-12 mx-auto text-yellow-600 mb-4" />
                <CardTitle>POSOCO</CardTitle>
                <CardDescription>
                  Power System Operation Corporation grid data
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Explore India's Energy Market?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Start analyzing real-time market data, track renewable energy projects, 
            and gain insights into India's dynamic energy sector
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary" 
              className="px-8 py-3 bg-white text-blue-600 hover:bg-blue-50"
            >
              <BarChart3 className="w-5 h-5 mr-2" />
              View Full Dashboard
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="px-8 py-3 border-white text-white hover:bg-white/10"
            >
              <Info className="w-5 h-5 mr-2" />
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}