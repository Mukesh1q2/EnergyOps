/**
 * India Energy Market Core Library
 * Comprehensive Indian energy sector analysis and visualization
 * Integrates with IEX India data, state-wise capacity, DISCOM operations
 */

export interface IndiaEnergyConfig {
  refreshInterval: number;
  dataRetentionDays: number;
  enableRealTimeUpdates: boolean;
  includeProjectDetails: boolean;
  defaultVisualization: 'map' | 'charts' | 'table';
}

export interface MarketAnalytics {
  priceVolatility: number;
  demandForecast: number;
  renewablePenetration: number;
  gridStability: number;
  carbonIntensity: number;
}

export interface IEXIntegration {
  realTimeData: boolean;
  marketSegments: string[];
  participantId: string;
  apiVersion: string;
  dataFormat: 'JSON' | 'CSV' | 'XML';
}

/**
 * India Energy Market Analytics Engine
 * Provides market intelligence and forecasting capabilities
 */
export class IndiaEnergyMarketAnalyzer {
  private config: IndiaEnergyConfig;
  
  constructor(config: IndiaEnergyConfig = {
    refreshInterval: 300, // 5 minutes
    dataRetentionDays: 90,
    enableRealTimeUpdates: true,
    includeProjectDetails: true,
    defaultVisualization: 'map'
  }) {
    this.config = config;
  }

  /**
   * Calculate market analytics and KPIs
   */
  calculateMarketAnalytics(marketData: any): MarketAnalytics {
    const priceVolatility = this.calculatePriceVolatility(marketData);
    const demandForecast = this.forecastDemand(marketData);
    const renewablePenetration = this.calculateRenewablePenetration(marketData);
    const gridStability = this.assessGridStability(marketData);
    const carbonIntensity = this.calculateCarbonIntensity(marketData);

    return {
      priceVolatility,
      demandForecast,
      renewablePenetration,
      gridStability,
      carbonIntensity
    };
  }

  /**
   * Price volatility analysis using standard deviation
   */
  private calculatePriceVolatility(marketData: any): number {
    if (!marketData.priceHistory || marketData.priceHistory.length < 2) return 0;
    
    const prices = marketData.priceHistory.map((p: any) => p.price);
    const mean = prices.reduce((a: number, b: number) => a + b) / prices.length;
    const variance = prices.reduce((sum: number, price: number) => sum + Math.pow(price - mean, 2), 0) / prices.length;
    
    return Math.sqrt(variance);
  }

  /**
   * Demand forecasting using linear regression
   */
  private forecastDemand(marketData: any): number {
    const demandHistory = marketData.demandHistory || [];
    if (demandHistory.length < 7) return 0;

    // Simple linear regression for next day demand
    const n = demandHistory.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

    demandHistory.forEach((point: any, index: number) => {
      sumX += index;
      sumY += point.demand;
      sumXY += index * point.demand;
      sumX2 += index * index;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Forecast for next period (index n)
    return slope * n + intercept;
  }

  /**
   * Calculate renewable energy penetration percentage
   */
  private calculateRenewablePenetration(marketData: any): number {
    const totalCapacity = marketData.totalCapacity || 0;
    const renewableCapacity = marketData.renewableCapacity || 0;
    
    return totalCapacity > 0 ? (renewableCapacity / totalCapacity) * 100 : 0;
  }

  /**
   * Grid stability assessment based on frequency deviation
   */
  private assessGridStability(marketData: any): number {
    // Simulate grid stability based on demand-supply balance
    const supplyCapacity = marketData.supplyCapacity || 0;
    const currentDemand = marketData.currentDemand || 0;
    const reserveMargin = ((supplyCapacity - currentDemand) / currentDemand) * 100;
    
    // Stability score: 0-100, higher is more stable
    // Optimal reserve margin is 15-25%
    if (reserveMargin >= 15 && reserveMargin <= 25) return 95;
    if (reserveMargin >= 10 && reserveMargin <= 30) return 85;
    if (reserveMargin >= 5 && reserveMargin <= 35) return 70;
    return 50;
  }

  /**
   * Calculate carbon intensity (kg CO2/MWh)
   */
  private calculateCarbonIntensity(marketData: any): number {
    const capacityMix = marketData.capacityMix || {};
    const emissionFactors = {
      coal: 0.82,
      gas: 0.35,
      nuclear: 0.012,
      hydro: 0.024,
      solar: 0.048,
      wind: 0.011,
      biomass: 0.18
    };

    let totalEmissions = 0;
    let totalCapacity = 0;

    Object.entries(capacityMix).forEach(([technology, capacity]) => {
      const emissions = (capacity as number) * (emissionFactors[technology as keyof typeof emissionFactors] || 0);
      totalEmissions += emissions;
      totalCapacity += capacity as number;
    });

    return totalCapacity > 0 ? totalEmissions / totalCapacity : 0;
  }
}

/**
 * India Energy Map Renderer
 * Creates interactive visualizations for Indian energy sector
 */
export class IndiaEnergyMapRenderer {
  private mapConfig: any;

  constructor() {
    this.mapConfig = {
      center: [78.9629, 20.5937], // Center of India
      zoom: 5,
      maxZoom: 12,
      minZoom: 4,
      style: 'https://tiles.openstreetmap.org/{z}/{x}/{y}.png'
    };
  }

  /**
   * Generate GeoJSON for Indian states with energy data
   */
  generateStateGeoJSON(stateData: any[]): any {
    const features = stateData.map(state => ({
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: this.generateStateCoordinates(state.coordinates)
      },
      properties: {
        stateCode: state.stateCode,
        stateName: state.stateName,
        totalCapacity: state.capacity.total,
        renewableCapacity: state.capacity.solar + state.capacity.wind + state.capacity.hydro,
        currentDemand: state.demand.current,
        peakDemand: state.demand.peak,
        transmissionLoss: state.transmissionLoss,
        renewablePotential: state.renewablePotential,
        discoms: state.discoms.map((d: any) => d.name)
      }
    }));

    return {
      type: 'FeatureCollection',
      features
    };
  }

  /**
   * Generate supplier markers for map visualization
   */
  generateSupplierMarkers(suppliers: any[]): any[] {
    return suppliers.map(supplier => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: supplier.coordinates
      },
      properties: {
        supplierId: supplier.id,
        supplierName: supplier.name,
        type: supplier.type,
        capacity: supplier.capacity,
        technology: supplier.technology,
        iexParticipant: supplier.iexParticipant,
        stateCode: supplier.stateCode,
        stateName: supplier.stateName,
        contactInfo: supplier.contactInfo,
        marketData: supplier.marketData
      }
    }));
  }

  /**
   * Generate renewable energy project markers
   */
  generateProjectMarkers(projects: any[]): any[] {
    return projects.map(project => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: project.coordinates
      },
      properties: {
        projectId: project.id,
        projectName: project.name,
        state: project.state,
        capacity: project.capacity,
        technology: project.technology,
        commissioningDate: project.commissioningDate,
        developer: project.developer,
        investment: project.investment,
        status: project.status
      }
    }));
  }

  /**
   * Simple coordinate generation (in production, use actual state boundaries)
   */
  private generateStateCoordinates(centerCoord: [number, number]): number[][] {
    const [lng, lat] = centerCoord;
    const offset = 0.5; // Approximate state size
    return [
      [lng - offset, lat - offset],
      [lng + offset, lat - offset],
      [lng + offset, lat + offset],
      [lng - offset, lat + offset],
      [lng - offset, lat - offset]
    ];
  }
}

/**
 * IEX India Integration Service
 * Handles real-time data from IEX India exchange
 */
export class IEXIntegrationService {
  private baseUrl = 'https://www.iexindia.com';
  private participantId: string;
  private apiKey: string;

  constructor(participantId: string = 'DEMO', apiKey: string = 'DEMO_KEY') {
    this.participantId = participantId;
    this.apiKey = apiKey;
  }

  /**
   * Fetch real-time market prices from IEX
   */
  async fetchRealTimePrices(marketSegment: string = 'RTM'): Promise<any> {
    // Mock implementation - in production, integrate with actual IEX API
    return {
      segment: marketSegment,
      price: 2140.50 + Math.random() * 100,
      volume: 5000 + Math.random() * 10000,
      timestamp: new Date().toISOString(),
      participants: Math.floor(Math.random() * 1000) + 500
    };
  }

  /**
   * Fetch market clearing data for DAM
   */
  async fetchMarketClearingData(): Promise<any> {
    return {
      date: new Date().toISOString().split('T')[0],
      market: 'DAM',
      mcp: 2450 + Math.random() * 200,
      mcv: 25000 + Math.random() * 15000,
      totalBids: 8500 + Math.random() * 3000,
      totalOffers: 30000 + Math.random() * 20000,
      curtailmentBlocks: Math.floor(Math.random() * 5)
    };
  }

  /**
   * Fetch participant registration status
   */
  async checkParticipantStatus(): Promise<any> {
    return {
      participantId: this.participantId,
      status: 'ACTIVE',
      permissions: ['RTM', 'DAM', 'GDAM', 'REC'],
      lastActivity: new Date().toISOString(),
      limits: {
        dailyVolume: 50000,
        maximumPrice: 10000,
        creditLimit: 10000000
      }
    };
  }

  /**
   * Subscribe to real-time market updates
   */
  async subscribeToRealTimeUpdates(callback: (data: any) => void): Promise<void> {
    // In production, implement WebSocket connection to IEX
    setInterval(() => {
      const update = {
        timestamp: new Date().toISOString(),
        segment: 'RTM',
        price: 2100 + Math.random() * 200,
        volume: Math.floor(Math.random() * 10000) + 1000,
        demand: Math.floor(Math.random() * 50000) + 30000,
        supply: Math.floor(Math.random() * 70000) + 45000
      };
      callback(update);
    }, 5000);
  }
}

/**
 * DISCOM Performance Analyzer
 * Analyzes distribution company performance metrics
 */
export class DISCOMPerformanceAnalyzer {
  /**
   * Calculate key performance indicators for DISCOMs
   */
  calculateKPIs(discData: any): any {
    const financialHealth = this.assessFinancialHealth(discData);
    const operationalEfficiency = this.assessOperationalEfficiency(discData);
    const consumerSatisfaction = this.assessConsumerSatisfaction(discData);
    const reliabilityScore = this.calculateReliabilityScore(discData);

    return {
      financialHealth,
      operationalEfficiency,
      consumerSatisfaction,
      reliabilityScore,
      overallScore: (financialHealth + operationalEfficiency + consumerSatisfaction + reliabilityScore) / 4
    };
  }

  private assessFinancialHealth(data: any): number {
    const revenueGrowth = data.revenueGrowth || 0;
    const debtRatio = data.debtRatio || 0.5;
    const profitMargin = data.profitMargin || 0.05;
    
    // Score: 0-100
    return Math.min(100, Math.max(0, 
      (revenueGrowth * 20) + 
      ((1 - debtRatio) * 30) + 
      (profitMargin * 400)
    ));
  }

  private assessOperationalEfficiency(data: any): number {
    const distributionLoss = data.distributionLoss || 20;
    const collectionEfficiency = data.collectionEfficiency || 85;
    const systemAvailability = data.systemAvailability || 95;
    
    // Lower distribution loss = higher efficiency
    const lossScore = Math.max(0, 100 - (distributionLoss - 10) * 5);
    const collectionScore = Math.min(100, collectionEfficiency);
    const availabilityScore = Math.min(100, systemAvailability);
    
    return (lossScore + collectionScore + availabilityScore) / 3;
  }

  private assessConsumerSatisfaction(data: any): number {
    // Mock implementation - in production, use actual survey data
    const complaintResolutionTime = data.complaintResolutionTime || 7; // days
    const serviceQuality = data.serviceQuality || 3.5; // 1-5 scale
    
    const resolutionScore = Math.max(0, 100 - (complaintResolutionTime * 10));
    const qualityScore = (serviceQuality / 5) * 100;
    
    return (resolutionScore + qualityScore) / 2;
  }

  private calculateReliabilityScore(data: any): number {
    const saifi = data.saifi || 2.5; // System Average Interruption Frequency Index
    const saidi = data.saidi || 300; // System Average Interruption Duration Index
    const caifi = data.caifi || 1.8; // Customer Average Interruption Frequency Index
    
    // Lower values = higher reliability
    const saifiScore = Math.max(0, 100 - (saifi * 20));
    const saidiScore = Math.max(0, 100 - (saidi / 10));
    const caifiScore = Math.max(0, 100 - (caifi * 25));
    
    return (saifiScore + saidiScore + caifiScore) / 3;
  }
}

/**
 * Export utility functions
 */
export const IndiaEnergyUtils = {
  /**
   * Format capacity values with appropriate units
   */
  formatCapacity(capacityMW: number): string {
    if (capacityMW >= 1000) {
      return `${(capacityMW / 1000).toFixed(1)} GW`;
    }
    return `${capacityMW.toFixed(0)} MW`;
  },

  /**
   * Format currency values for Indian market
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  },

  /**
   * Get state color based on renewable capacity
   */
  getStateColor(renewableCapacity: number): string {
    if (renewableCapacity >= 20000) return '#1f4e79'; // Dark blue
    if (renewableCapacity >= 15000) return '#2f5f8f';
    if (renewableCapacity >= 10000) return '#4472c4';
    if (renewableCapacity >= 5000) return '#70ad47';
    if (renewableCapacity >= 1000) return '#ffc000';
    return '#e7e6e6';
  },

  /**
   * Calculate total investment required for renewable projects
   */
  calculateInvestmentRequired(capacityMW: number, technology: string): number {
    const costPerMW = {
      solar: 4, // crores/MW
      wind: 6,  // crores/MW
      hydro: 8, // crores/MW
      biomass: 5 // crores/MW
    };
    
    return (capacityMW * (costPerMW[technology as keyof typeof costPerMW] || 5)) * 10000000; // Convert to rupees
  }
};

// Default export
export default {
  IndiaEnergyMarketAnalyzer,
  IndiaEnergyMapRenderer,
  IEXIntegrationService,
  DISCOMPerformanceAnalyzer,
  IndiaEnergyUtils
};