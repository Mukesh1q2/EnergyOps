'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, ScatterChart, Scatter
} from 'recharts';
import { 
  MapPin, TrendingUp, Zap, Sun, Wind, Droplets, 
  Filter, Download, RefreshCw, Search, Settings,
  Info, Calendar, Users, Factory, Gauge,
  ChevronRight, Maximize2, Layers, Target
} from 'lucide-react';

interface IndiaEnergyDashboardProps {
  className?: string;
  initialData?: any;
}

/**
 * India Energy Market Dashboard Component
 * Interactive dashboard for Indian energy sector visualization
 * Integrates real-time data from IEX India and state-wise energy infrastructure
 */
const IndiaEnergyDashboard: React.FC<IndiaEnergyDashboardProps> = ({ 
  className = '', 
  initialData 
}) => {
  // State management
  const [marketData, setMarketData] = useState<any>(initialData || null);
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [selectedTechnology, setSelectedTechnology] = useState<string>('ALL');
  const [visualizationType, setVisualizationType] = useState<string>('map');
  const [timeRange, setTimeRange] = useState<string>('24h');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toISOString());
  const [activeTab, setActiveTab] = useState<string>('overview');
  
  // Refs for map visualization
  const mapRef = useRef<HTMLDivElement>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  // Fetch market data
  const fetchMarketData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/quantum/applications/india-energy-market', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'getMarketOverview',
          parameters: {}
        })
      });
      
      const result = await response.json();
      if (result.success) {
        setMarketData(result.data);
        setLastUpdated(new Date().toISOString());
      }
    } catch (error) {
      console.error('Failed to fetch market data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial data load
  useEffect(() => {
    fetchMarketData();
    
    // Set up real-time updates every 5 minutes
    const interval = setInterval(fetchMarketData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchMarketData]);

  // State capacity data for visualization
  const stateCapacityData = marketData?.topStates?.map((state: any) => ({
    state: state.stateName,
    capacity: state.capacity.total,
    renewable: state.capacity.solar + state.capacity.wind + state.capacity.hydro,
    conventional: state.capacity.coal + state.capacity.gas + state.capacity.nuclear,
    demand: state.demand.current
  })) || [];

  // Market segment data
  const marketSegmentData = marketData?.marketSegments?.map((segment: any) => ({
    name: segment.name,
    volume: segment.volume,
    price: segment.price,
    participants: segment.participants
  })) || [];

  // Renewable energy technology distribution
  const renewableDistribution = marketData?.renewablesOverview ? [
    { name: 'Solar', value: marketData.renewablesOverview.solarCapacity, color: '#f39c12' },
    { name: 'Wind', value: marketData.renewablesOverview.windCapacity, color: '#3498db' },
    { name: 'Hydro', value: marketData.renewablesOverview.hydroCapacity, color: '#1abc9c' },
    { name: 'Biomass', value: marketData.renewablesOverview.biomassCapacity, color: '#27ae60' }
  ] : [];

  // Price trend data (mock 30-day trend)
  const priceTrendData = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    price: 2000 + Math.sin(i * 0.2) * 300 + Math.random() * 200,
    volume: 50000 + Math.random() * 30000
  }));

  // Color scheme for visualizations
  const COLORS = ['#1f4e79', '#4472c4', '#70ad47', '#ffc000', '#e7e6e6', '#9966cc', '#ff6b6b', '#4ecdc4'];

  const formatCapacity = (value: number) => {
    if (value >= 1000) return `${(value / 1000).toFixed(1)} GW`;
    return `${value.toFixed(0)} MW`;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className={`w-full space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            India Energy Market
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Real-time insights into India's energy sector with IEX integration
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-green-600 border-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            Live Data
          </Badge>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchMarketData} 
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Market Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Price (RTM)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(marketData?.marketSummary?.currentPrice || 2140)}
            </div>
            <p className="text-xs text-muted-foreground">
              +{((marketData?.marketSummary?.priceChangePercent || 2.01)).toFixed(2)}% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(marketData?.marketSummary?.totalVolume || 68500).toLocaleString()} MWh
            </div>
            <p className="text-xs text-muted-foreground">
              Across all market segments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Renewable Capacity</CardTitle>
            <Sun className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCapacity(marketData?.renewablesOverview?.totalInstalled || 129900)}
            </div>
            <p className="text-xs text-muted-foreground">
              {((marketData?.renewablesOverview?.totalInstalled / (marketData?.marketSummary?.totalVolume || 1)) * 100).toFixed(1)}% of total capacity
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Participants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8,100+</div>
            <p className="text-xs text-muted-foreground">
              Across 28 states, 8 UTs
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Market Overview</TabsTrigger>
          <TabsTrigger value="geography">Geographic View</TabsTrigger>
          <TabsTrigger value="renewables">Renewables</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Market Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* State Capacity Chart */}
            <Card>
              <CardHeader>
                <CardTitle>State-wise Capacity Distribution</CardTitle>
                <CardDescription>
                  Total installed capacity by state (MW)
                </CardDescription>
              </CardHeader>
              <CardContent ref={chartContainerRef}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stateCapacityData.slice(0, 8)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="state" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip formatter={(value) => [formatCapacity(Number(value)), 'Capacity']} />
                    <Bar dataKey="renewable" stackId="a" fill="#70ad47" name="Renewable" />
                    <Bar dataKey="conventional" stackId="a" fill="#1f4e79" name="Conventional" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Market Segments */}
            <Card>
              <CardHeader>
                <CardTitle>Market Segments</CardTitle>
                <CardDescription>
                  Volume and pricing across different market types
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={marketSegmentData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Bar yAxisId="left" dataKey="volume" fill="#4472c4" name="Volume (MWh)" />
                    <Line yAxisId="right" type="monotone" dataKey="price" stroke="#ff6b6b" strokeWidth={3} name="Price (₹/MWh)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Price Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Price Trends (30 Days)</CardTitle>
              <CardDescription>
                Market clearing price trends across RTM and DAM segments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={priceTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'price' ? formatCurrency(Number(value)) : `${Number(value).toLocaleString()} MWh`,
                      name === 'price' ? 'Price' : 'Volume'
                    ]}
                  />
                  <Area type="monotone" dataKey="price" stroke="#1f4e79" fill="#1f4e79" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Geographic View Tab */}
        <TabsContent value="geography" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Map Visualization Placeholder */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>India Energy Infrastructure Map</CardTitle>
                <CardDescription>
                  Interactive map showing power plants, substations, and transmission networks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div 
                  ref={mapRef}
                  className="w-full h-[500px] bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600"
                >
                  <div className="text-center">
                    <MapPin className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 mb-2">Interactive India Map</p>
                    <p className="text-sm text-gray-400">
                      Real-time markers for {stateCapacityData.length} states
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Geographic Zones */}
            <Card>
              <CardHeader>
                <CardTitle>Regional Zones</CardTitle>
                <CardDescription>
                  Power grid zones and capacity distribution
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: 'Northern Region', code: 'NR', capacity: 85000, states: 8 },
                  { name: 'Western Region', code: 'WR', capacity: 92000, states: 5 },
                  { name: 'Southern Region', code: 'SR', capacity: 78000, states: 5 },
                  { name: 'Eastern Region', code: 'ER', capacity: 32000, states: 5 },
                  { name: 'North-Eastern', code: 'NER', capacity: 4500, states: 8 }
                ].map((zone) => (
                  <div key={zone.code} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div>
                      <p className="font-medium">{zone.name}</p>
                      <p className="text-sm text-gray-500">{zone.states} states</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatCapacity(zone.capacity)}</p>
                      <Badge variant="secondary">{zone.code}</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Renewables Tab */}
        <TabsContent value="renewables" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Technology Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Renewable Energy Mix</CardTitle>
                <CardDescription>
                  Installed capacity by technology type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={renewableDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${formatCapacity(value)}`}
                    >
                      {renewableDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [formatCapacity(Number(value)), 'Capacity']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Renewable States */}
            <Card>
              <CardHeader>
                <CardTitle>Top Renewable Energy States</CardTitle>
                <CardDescription>
                  Leading states in renewable energy capacity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {marketData?.renewablesOverview?.topSolarStates?.slice(0, 5).map((state: any, index: number) => (
                    <div key={state.state} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline">{index + 1}</Badge>
                        <span className="font-medium">{state.state}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCapacity(state.capacity)}</p>
                        <p className="text-xs text-gray-500">Solar</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Renewable Projects */}
          <Card>
            <CardHeader>
              <CardTitle>Major Renewable Projects</CardTitle>
              <CardDescription>
                Key solar and wind projects across India
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: 'Bhadla Solar Park', state: 'Rajasthan', capacity: 2245, technology: 'Solar', status: 'Operational' },
                  { name: 'Muppandal Wind Farm', state: 'Tamil Nadu', capacity: 1500, technology: 'Wind', status: 'Operational' },
                  { name: 'Gujarat Solar Park', state: 'Gujarat', capacity: 1000, technology: 'Solar', status: 'Operational' },
                  { name: 'Jaisalmer Wind Park', state: 'Rajasthan', capacity: 1064, technology: 'Wind', status: 'Operational' }
                ].map((project, index) => (
                  <Card key={index} className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-sm">{project.name}</h4>
                        <Badge variant={project.status === 'Operational' ? 'default' : 'secondary'}>
                          {project.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">{project.state}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          {project.technology === 'Solar' ? <Sun className="w-4 h-4 text-yellow-500" /> : <Wind className="w-4 h-4 text-blue-500" />}
                          <span className="text-sm">{project.technology}</span>
                        </div>
                        <span className="font-bold">{formatCapacity(project.capacity)}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Suppliers Tab */}
        <TabsContent value="suppliers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Major Energy Suppliers & DISCOMs</CardTitle>
              <CardDescription>
                Key players in the Indian energy market
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Top Generators */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Factory className="w-5 h-5 mr-2" />
                    Top Generators
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { name: 'Adani Green Energy', capacity: 12500, state: 'Gujarat', technology: 'Solar/Wind' },
                      { name: 'Tata Power', capacity: 12800, state: 'Maharashtra', technology: 'Multi-tech' },
                      { name: 'NTPC Limited', capacity: 25000, state: 'Multi-state', technology: 'Coal/Gas' },
                      { name: 'Power Grid Corp', capacity: 0, state: 'Pan-India', technology: 'Transmission' }
                    ].map((supplier, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold">{supplier.name}</h4>
                            <Badge variant="outline">{supplier.state}</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{supplier.technology}</p>
                          <div className="flex justify-between items-center">
                            <span className="text-2xl font-bold">
                              {formatCapacity(supplier.capacity)}
                            </span>
                            <Button variant="ghost" size="sm">
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Distribution Companies */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Major DISCOMs
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { name: 'MSEDCL', state: 'Maharashtra', consumers: '2.8Cr', revenue: '₹45,000 Cr' },
                      { name: 'BESCOM', state: 'Karnataka', consumers: '1.5Cr', revenue: '₹32,000 Cr' },
                      { name: 'TANGEDCO', state: 'Tamil Nadu', consumers: '3.2Cr', revenue: '₹38,000 Cr' },
                      { name: 'WBSEDCL', state: 'West Bengal', consumers: '1.8Cr', revenue: '₹28,000 Cr' }
                    ].map((discom, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold">{discom.name}</h4>
                            <Badge variant="secondary">{discom.state}</Badge>
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p>Consumers: {discom.consumers}</p>
                            <p>Annual Revenue: {discom.revenue}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Demand Forecast */}
            <Card>
              <CardHeader>
                <CardTitle>Demand Forecasting</CardTitle>
                <CardDescription>
                  Peak demand predictions by region
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={[
                    { hour: '00:00', demand: 52000, forecast: 51000 },
                    { hour: '06:00', demand: 68000, forecast: 67000 },
                    { hour: '12:00', demand: 85000, forecast: 84000 },
                    { hour: '18:00', demand: 92000, forecast: 91000 },
                    { hour: '23:59', demand: 65000, forecast: 64000 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${Number(value).toLocaleString()} MW`, '']} />
                    <Line type="monotone" dataKey="demand" stroke="#1f4e79" strokeWidth={3} name="Actual" />
                    <Line type="monotone" dataKey="forecast" stroke="#70ad47" strokeWidth={2} strokeDasharray="5 5" name="Forecast" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Grid Stability Index */}
            <Card>
              <CardHeader>
                <CardTitle>Grid Stability Metrics</CardTitle>
                <CardDescription>
                  Real-time grid health indicators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { metric: 'Frequency Deviation', value: 0.02, unit: 'Hz', status: 'good', target: '±0.05' },
                    { metric: 'Voltage Stability', value: 98.5, unit: '%', status: 'good', target: '>95%' },
                    { metric: 'Reserve Margin', value: 18.2, unit: '%', status: 'good', target: '15-25%' },
                    { metric: 'Transmission Loss', value: 4.8, unit: '%', status: 'warning', target: '<5%' }
                  ].map((metric, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div>
                        <p className="font-medium">{metric.metric}</p>
                        <p className="text-sm text-gray-500">Target: {metric.target}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">
                          {metric.value}{metric.unit}
                        </p>
                        <Badge variant={metric.status === 'good' ? 'default' : 'destructive'}>
                          {metric.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Market Performance Score */}
          <Card>
            <CardHeader>
              <CardTitle>Market Performance Scorecard</CardTitle>
              <CardDescription>
                Overall health of Indian energy market
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { score: 87, label: 'Price Competitiveness', icon: TrendingUp, color: 'text-green-500' },
                  { score: 92, label: 'Market Liquidity', icon: Gauge, color: 'text-blue-500' },
                  { score: 78, label: 'Renewable Integration', icon: Sun, color: 'text-yellow-500' },
                  { score: 84, label: 'Grid Reliability', icon: Zap, color: 'text-purple-500' }
                ].map((item, index) => (
                  <div key={index} className="text-center">
                    <div className="relative w-24 h-24 mx-auto mb-4">
                      <svg className="w-24 h-24 transform -rotate-90">
                        <circle
                          cx="48"
                          cy="48"
                          r="40"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="transparent"
                          className="text-gray-200"
                        />
                        <circle
                          cx="48"
                          cy="48"
                          r="40"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="transparent"
                          strokeDasharray={`${2 * Math.PI * 40}`}
                          strokeDashoffset={`${2 * Math.PI * 40 * (1 - item.score / 100)}`}
                          className={`${item.color} transition-all duration-1000 ease-out`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold">{item.score}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <item.icon className={`w-4 h-4 ${item.color}`} />
                      <p className="text-sm font-medium">{item.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-4">
        <p>Last updated: {new Date(lastUpdated).toLocaleString('en-IN')}</p>
        <div className="flex items-center space-x-4">
          <span>Data source: IEX India, MNRE, POSOCO</span>
          <Button variant="ghost" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
    </div>
  );
};

export default IndiaEnergyDashboard;