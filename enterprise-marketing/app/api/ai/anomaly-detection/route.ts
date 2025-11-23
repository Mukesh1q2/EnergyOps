import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

interface AnomalyDetectionRequest {
  dataSource: 'sensor' | 'market' | 'operational' | 'financial' | 'grid';
  data: Array<{
    timestamp: string;
    value: number;
    sensor_id?: string;
    location?: string;
    asset_type?: string;
  }>;
  detectionType: 'statistical' | 'ml_based' | 'threshold' | 'pattern';
  sensitivity: 'low' | 'medium' | 'high' | 'critical';
  timeWindow: number; // in minutes
  alertThreshold?: number; // 0-1 scale
}

interface AnomalyResult {
  id: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  type: 'statistical' | 'operational' | 'market' | 'security' | 'performance';
  description: string;
  impact: {
    scope: 'local' | 'regional' | 'systemwide';
    duration: string;
    affected_assets: string[];
    potential_loss: number;
  };
  detection: {
    method: string;
    score: number;
    threshold: number;
    feature_importance: Record<string, number>;
  };
  context: {
    historical_baseline: number;
    current_value: number;
    deviation_percentage: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  };
  recommendations: string[];
  next_actions: Array<{
    action: string;
    priority: 'immediate' | 'urgent' | 'scheduled';
    timeline: string;
    owner: string;
  }>;
}

interface AnomalySummary {
  totalAnomalies: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  averageConfidence: number;
  averageResponseTime: number; // in minutes
  topCategories: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  trends: {
    daily: { increased: number; decreased: number };
    weekly: { increased: number; decreased: number };
    monthly: { increased: number; decreased: number };
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: AnomalyDetectionRequest = await request.json();
    const { dataSource, data, detectionType, sensitivity, timeWindow, alertThreshold } = body;

    if (!dataSource || !data || !detectionType || !sensitivity) {
      return NextResponse.json(
        { error: 'Missing required fields: dataSource, data, detectionType, sensitivity' },
        { status: 400 }
      );
    }

    if (!data.length) {
      return NextResponse.json(
        { error: 'Data array cannot be empty' },
        { status: 400 }
      );
    }

    // Analyze data for anomalies
    const anomalies = await detectAnomalies({
      dataSource,
      data,
      detectionType,
      sensitivity,
      timeWindow,
      alertThreshold: alertThreshold || 0.7
    });

    return NextResponse.json({
      anomalies,
      summary: {
        totalAnomalies: anomalies.length,
        criticalAnomalies: anomalies.filter(a => a.severity === 'critical').length,
        highAnomalies: anomalies.filter(a => a.severity === 'high').length,
        averageConfidence: anomalies.reduce((sum, a) => sum + a.confidence, 0) / anomalies.length,
        detectionMethod: detectionType,
        processingTime: Date.now() - new Date(data[0].timestamp).getTime()
      },
      metadata: {
        requestId: `anomaly_${Date.now()}`,
        dataSource,
        timeWindow,
        sensitivity
      }
    });
  } catch (error) {
    console.error('Anomaly Detection Error:', error);
    return NextResponse.json(
      { error: 'Anomaly detection service unavailable' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dataSource = searchParams.get('dataSource');
    const severity = searchParams.get('severity');
    const type = searchParams.get('type');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Generate historical anomaly data
    const allAnomalies: AnomalyResult[] = [];
    
    // Generate anomalies for different sources and types
    const sources = ['sensor', 'market', 'operational', 'financial', 'grid'];
    const types = ['statistical', 'operational', 'market', 'security', 'performance'];
    const severities = ['low', 'medium', 'high', 'critical'];

    // Generate sample anomalies for the last 30 days
    for (let day = 0; day < 30; day++) {
      const baseDate = new Date();
      baseDate.setDate(baseDate.getDate() - day);
      
      // Generate 2-8 anomalies per day
      const dailyAnomalies = Math.floor(Math.random() * 7) + 2;
      
      for (let i = 0; i < dailyAnomalies; i++) {
        const timestamp = new Date(baseDate.getTime() + Math.random() * 24 * 60 * 60 * 1000);
        const source = sources[Math.floor(Math.random() * sources.length)];
        const anomalyType = types[Math.floor(Math.random() * types.length)];
        const severityLevel = severities[Math.floor(Math.random() * severities.length)];
        
        allAnomalies.push(generateAnomaly({
          timestamp: timestamp.toISOString(),
          dataSource: source,
          type: anomalyType,
          severity: severityLevel
        }));
      }
    }

    // Filter anomalies based on query parameters
    let filteredAnomalies = allAnomalies;
    
    if (dataSource) {
      // For demo purposes, we'll simulate filtering
    }
    
    if (severity) {
      filteredAnomalies = filteredAnomalies.filter(a => a.severity === severity);
    }
    
    if (type) {
      filteredAnomalies = filteredAnomalies.filter(a => a.type === type);
    }
    
    if (startDate) {
      filteredAnomalies = filteredAnomalies.filter(a => new Date(a.timestamp) >= new Date(startDate));
    }
    
    if (endDate) {
      filteredAnomalies = filteredAnomalies.filter(a => new Date(a.timestamp) <= new Date(endDate));
    }

    // Apply pagination
    const totalAnomalies = filteredAnomalies.length;
    const paginatedAnomalies = filteredAnomalies.slice(offset, offset + limit);

    // Generate summary statistics
    const summary: AnomalySummary = {
      totalAnomalies: filteredAnomalies.length,
      criticalCount: filteredAnomalies.filter(a => a.severity === 'critical').length,
      highCount: filteredAnomalies.filter(a => a.severity === 'high').length,
      mediumCount: filteredAnomalies.filter(a => a.severity === 'medium').length,
      lowCount: filteredAnomalies.filter(a => a.severity === 'low').length,
      averageConfidence: filteredAnomalies.reduce((sum, a) => sum + a.confidence, 0) / filteredAnomalies.length,
      averageResponseTime: 12.5, // minutes
      topCategories: getTopCategories(filteredAnomalies),
      trends: {
        daily: { increased: 15, decreased: 8 },
        weekly: { increased: 23, decreased: 31 },
        monthly: { increased: 45, decreased: 67 }
      }
    };

    return NextResponse.json({
      anomalies: paginatedAnomalies,
      summary,
      pagination: {
        total: totalAnomalies,
        limit,
        offset,
        hasMore: offset + limit < totalAnomalies
      }
    });
  } catch (error) {
    console.error('Get Anomalies Error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve anomalies' },
      { status: 500 }
    );
  }
}

async function detectAnomalies(params: any): Promise<AnomalyResult[]> {
  const { dataSource, data, detectionType, sensitivity, timeWindow, alertThreshold } = params;
  const anomalies: AnomalyResult[] = [];

  // Extract values for statistical analysis
  const values = data.map(d => d.value);
  const mean = values.reduce((sum: number, val: number) => sum + val, 0) / values.length;
  const variance = values.reduce((sum: number, val: number) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  
  const threshold = getDetectionThreshold(sensitivity, alertThreshold);

  // Check each data point for anomalies
  data.forEach((point, index) => {
    const zScore = Math.abs((point.value - mean) / stdDev);
    
    if (zScore > threshold) {
      const severity = calculateSeverity(zScore, sensitivity);
      
      anomalies.push(generateAnomaly({
        timestamp: point.timestamp,
        dataSource,
        type: getAnomalyType(dataSource, point),
        severity,
        context: {
          current_value: point.value,
          historical_baseline: mean,
          deviation_percentage: ((point.value - mean) / mean) * 100,
          trend: index > 0 && point.value > data[index - 1].value ? 'increasing' : 
                index > 0 && point.value < data[index - 1].value ? 'decreasing' : 'stable'
        }
      }));
    }
  });

  // Pattern-based anomaly detection
  if (detectionType === 'pattern' || detectionType === 'ml_based') {
    const patternAnomalies = detectPatternAnomalies(data, dataSource);
    anomalies.push(...patternAnomalies);
  }

  return anomalies.slice(0, 20); // Limit to top 20 anomalies
}

function getDetectionThreshold(sensitivity: string, baseThreshold: number): number {
  const sensitivityMultipliers = {
    low: 0.5,
    medium: 0.75,
    high: 1.0,
    critical: 1.5
  };
  
  return baseThreshold * (sensitivityMultipliers[sensitivity] || 1.0);
}

function calculateSeverity(zScore: number, sensitivity: string): 'low' | 'medium' | 'high' | 'critical' {
  const thresholds = {
    low: { critical: 4.0, high: 3.0, medium: 2.0 },
    medium: { critical: 3.5, high: 2.5, medium: 1.8 },
    high: { critical: 3.0, high: 2.0, medium: 1.5 },
    critical: { critical: 2.5, high: 1.8, medium: 1.2 }
  };
  
  const t = thresholds[sensitivity] || thresholds.medium;
  
  if (zScore >= t.critical) return 'critical';
  if (zScore >= t.high) return 'high';
  if (zScore >= t.medium) return 'medium';
  return 'low';
}

function getAnomalyType(dataSource: string, point: any): 'statistical' | 'operational' | 'market' | 'security' | 'performance' {
  const typeMap: Record<string, string[]> = {
    sensor: ['operational', 'performance'],
    market: ['market'],
    operational: ['operational', 'performance'],
    financial: ['market', 'security'],
    grid: ['operational', 'performance']
  };
  
  const possibleTypes = typeMap[dataSource] || ['statistical'];
  return possibleTypes[Math.floor(Math.random() * possibleTypes.length)] as any;
}

function detectPatternAnomalies(data: any[], dataSource: string): AnomalyResult[] {
  const anomalies: AnomalyResult[] = [];
  
  // Detect sudden spikes or drops
  for (let i = 1; i < data.length; i++) {
    const change = Math.abs(data[i].value - data[i-1].value) / data[i-1].value;
    
    if (change > 0.3) { // 30% sudden change
      anomalies.push(generateAnomaly({
        timestamp: data[i].timestamp,
        dataSource,
        type: 'operational',
        severity: change > 0.5 ? 'critical' : 'high',
        description: `Sudden ${data[i].value > data[i-1].value ? 'spike' : 'drop'} detected in ${dataSource} data`,
        context: {
          current_value: data[i].value,
          previous_value: data[i-1].value,
          change_percentage: change * 100
        }
      }));
    }
  }
  
  return anomalies;
}

function generateAnomaly(params: any): AnomalyResult {
  const {
    timestamp,
    dataSource = 'sensor',
    type = 'statistical',
    severity = 'medium',
    description,
    context
  } = params;

  const defaultDescriptions = {
    sensor: {
      statistical: 'Statistical outlier detected in sensor readings',
      operational: 'Equipment operating outside normal parameters',
      performance: 'Performance degradation identified',
      security: 'Unusual sensor behavior pattern detected'
    },
    market: {
      market: 'Unusual market activity detected',
      security: 'Potential market manipulation indicators',
      operational: 'Market data integrity issues'
    },
    operational: {
      operational: 'Operational parameter deviation detected',
      performance: 'System performance anomaly identified',
      security: 'Security breach pattern detected'
    },
    financial: {
      market: 'Financial data anomaly detected',
      security: 'Financial security alert triggered',
      operational: 'Financial system irregularity identified'
    },
    grid: {
      operational: 'Grid parameter anomaly detected',
      performance: 'Grid performance degradation identified',
      security: 'Grid security threat detected'
    }
  };

  const desc = description || defaultDescriptions[dataSource]?.[type] || `Anomaly detected in ${dataSource} ${type} data`;

  const impact = generateImpact(dataSource, severity);
  const recommendations = generateRecommendations(type, severity);
  const nextActions = generateNextActions(type, severity);

  return {
    id: `anomaly_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp,
    severity,
    confidence: Math.random() * 0.3 + 0.7, // 0.7-1.0
    type,
    description: desc,
    impact,
    detection: {
      method: `${type}_detection_v2.1`,
      score: Math.random() * 0.4 + 0.6,
      threshold: 0.7,
      feature_importance: generateFeatureImportance(dataSource)
    },
    context: context || {
      current_value: Math.random() * 1000 + 500,
      historical_baseline: Math.random() * 1000 + 400,
      deviation_percentage: (Math.random() - 0.5) * 100,
      trend: Math.random() > 0.5 ? 'increasing' : 'decreasing'
    },
    recommendations,
    next_actions: nextActions
  };
}

function generateImpact(dataSource: string, severity: string) {
  const baseImpact = {
    scope: severity === 'critical' ? 'systemwide' : severity === 'high' ? 'regional' : 'local',
    duration: severity === 'critical' ? 'immediate and ongoing' : 
             severity === 'high' ? 'ongoing monitoring required' :
             severity === 'medium' ? 'temporary disruption' : 'minimal impact',
    affected_assets: severity === 'critical' ? ['multiple_generators', 'grid_stations', 'control_systems'] :
                    severity === 'high' ? ['generation_unit_1', 'transmission_line'] :
                    severity === 'medium' ? ['monitoring_station'] : ['sensor_array'],
    potential_loss: severity === 'critical' ? Math.random() * 500000 + 100000 :
                   severity === 'high' ? Math.random() * 100000 + 50000 :
                   severity === 'medium' ? Math.random() * 25000 + 10000 : Math.random() * 5000
  };

  return baseImpact;
}

function generateRecommendations(type: string, severity: string): string[] {
  const baseRecommendations: Record<string, string[]> = {
    statistical: [
      'Verify sensor calibration',
      'Check for environmental factors',
      'Review recent system changes'
    ],
    operational: [
      'Immediate equipment inspection required',
      'Schedule preventive maintenance',
      'Consider load redistribution'
    ],
    market: [
      'Verify data source integrity',
      'Cross-reference with market data',
      'Consider market intervention'
    ],
    security: [
      'Initiate security protocol',
      'Monitor for additional threats',
      'Review access logs'
    ],
    performance: [
      'Performance optimization required',
      'System capacity review',
      'Performance baseline recalibration'
    ]
  };

  let recommendations = baseRecommendations[type] || baseRecommendations.statistical;
  
  if (severity === 'critical') {
    recommendations = [
      'IMMEDIATE ACTION REQUIRED',
      'Alert operations team immediately',
      'Activate emergency protocols',
      ...recommendations
    ];
  } else if (severity === 'high') {
    recommendations = [
      'Urgent investigation required',
      'Prepare contingency plans',
      ...recommendations
    ];
  }

  return recommendations;
}

function generateNextActions(type: string, severity: string) {
  const actions = [
    {
      action: 'Investigate root cause',
      priority: severity === 'critical' ? 'immediate' : severity === 'high' ? 'urgent' : 'scheduled',
      timeline: severity === 'critical' ? '15 minutes' : severity === 'high' ? '1 hour' : '24 hours',
      owner: 'Operations Team'
    },
    {
      action: 'Document incident',
      priority: 'scheduled',
      timeline: '48 hours',
      owner: 'Incident Management'
    }
  ];

  if (type === 'security') {
    actions.push({
      action: 'Security team notification',
      priority: 'immediate',
      timeline: 'Immediately',
      owner: 'Security Team'
    });
  }

  return actions;
}

function generateFeatureImportance(dataSource: string) {
  const features: Record<string, Record<string, number>> = {
    sensor: {
      temperature: Math.random(),
      vibration: Math.random(),
      pressure: Math.random(),
      flow_rate: Math.random()
    },
    market: {
      price: Math.random(),
      volume: Math.random(),
      volatility: Math.random(),
      sentiment: Math.random()
    },
    operational: {
      load_factor: Math.random(),
      efficiency: Math.random(),
      availability: Math.random(),
      performance: Math.random()
    }
  };

  return features[dataSource] || {
    primary_factor: Math.random(),
    secondary_factor: Math.random(),
    tertiary_factor: Math.random()
  };
}

function getTopCategories(anomalies: AnomalyResult[]) {
  const categories = anomalies.reduce((acc, anomaly) => {
    acc[anomaly.type] = (acc[anomaly.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const total = anomalies.length;
  
  return Object.entries(categories)
    .map(([category, count]) => ({
      category,
      count,
      percentage: (count / total) * 100
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}