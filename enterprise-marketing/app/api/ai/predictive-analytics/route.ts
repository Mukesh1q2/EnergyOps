import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

interface PredictionRequest {
  modelId: string;
  inputData: Record<string, any>;
  predictionType: 'forecast' | 'classification' | 'regression' | 'recommendation';
  timeHorizon?: number; // for forecasts
  confidence?: number;
  features?: Record<string, any>;
}

interface PredictionResult {
  id: string;
  modelId: string;
  prediction: any;
  confidence: number;
  uncertainty: {
    lowerBound: number;
    upperBound: number;
    confidenceInterval: number;
  };
  timestamp: string;
  processingTime: number;
  featureImportance?: Record<string, number>;
  modelVersion: string;
  explanation?: string;
  recommendations?: string[];
}

interface ForecastData {
  timestamps: string[];
  values: number[];
  confidence: {
    lower: number[];
    upper: number[];
  };
  trend: 'increasing' | 'decreasing' | 'stable' | 'volatile';
  seasonality: {
    detected: boolean;
    period?: number;
    strength: number;
  };
  anomalies: Array<{
    timestamp: string;
    value: number;
    expected: number;
    deviation: number;
    severity: 'low' | 'medium' | 'high';
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const body: PredictionRequest = await request.json();
    const { modelId, inputData, predictionType, timeHorizon, confidence } = body;

    if (!modelId || !inputData || !predictionType) {
      return NextResponse.json(
        { error: 'Missing required fields: modelId, inputData, predictionType' },
        { status: 400 }
      );
    }

    const startTime = Date.now();

    // Simulate different prediction types
    let prediction: any;
    let explanation = '';
    let recommendations: string[] = [];

    switch (predictionType) {
      case 'forecast':
        prediction = generateForecast(modelId, inputData, timeHorizon || 24);
        explanation = 'Energy demand forecast based on historical patterns, weather conditions, and market factors.';
        recommendations = generateForecastRecommendations(prediction);
        break;
      
      case 'classification':
        prediction = generateClassification(modelId, inputData);
        explanation = 'Classification result based on multi-dimensional feature analysis and trained patterns.';
        recommendations = generateClassificationRecommendations(prediction);
        break;
      
      case 'regression':
        prediction = generateRegression(modelId, inputData);
        explanation = 'Regression analysis providing precise numerical predictions with confidence intervals.';
        recommendations = generateRegressionRecommendations(prediction);
        break;
      
      case 'recommendation':
        prediction = generateRecommendations(modelId, inputData);
        explanation = 'AI-driven recommendations based on optimization algorithms and user preferences.';
        break;
      
      default:
        return NextResponse.json(
          { error: 'Unsupported prediction type' },
          { status: 400 }
        );
    }

    const processingTime = Date.now() - startTime;
    const confidenceLevel = confidence || 0.95;

    const result: PredictionResult = {
      id: `pred_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      modelId,
      prediction,
      confidence: confidenceLevel,
      uncertainty: generateUncertainty(prediction, confidenceLevel),
      timestamp: new Date().toISOString(),
      processingTime,
      modelVersion: getModelVersion(modelId),
      explanation,
      recommendations,
      featureImportance: generateFeatureImportance(modelId, inputData)
    };

    return NextResponse.json({
      prediction: result,
      metadata: {
        requestId: `req_${Date.now()}`,
        modelId,
        processingTime,
        version: '1.0.0'
      }
    });
  } catch (error) {
    console.error('Prediction API Error:', error);
    return NextResponse.json(
      { error: 'Prediction service temporarily unavailable' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const modelId = searchParams.get('modelId');
    const predictionType = searchParams.get('type');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '100');

    if (!modelId) {
      return NextResponse.json(
        { error: 'modelId parameter is required' },
        { status: 400 }
      );
    }

    // Generate historical prediction data
    const predictions: PredictionResult[] = [];
    const now = new Date();
    const days = Math.min(30, Math.ceil((now.getTime() - (startDate ? new Date(startDate).getTime() : now.getTime() - 30 * 24 * 60 * 60 * 1000)) / (24 * 60 * 60 * 1000)));

    for (let i = 0; i < days; i++) {
      const timestamp = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      
      predictions.push({
        id: `pred_${timestamp.getTime()}`,
        modelId,
        prediction: generateHistoricalPrediction(predictionType),
        confidence: 0.85 + Math.random() * 0.1,
        uncertainty: {
          lowerBound: Math.random() * 0.8,
          upperBound: Math.random() * 0.8 + 1.2,
          confidenceInterval: 0.95
        },
        timestamp: timestamp.toISOString(),
        processingTime: Math.floor(Math.random() * 100) + 50,
        modelVersion: '1.0.0',
        featureImportance: generateRandomFeatureImportance()
      });
    }

    // Filter by date range if specified
    let filteredPredictions = predictions;
    if (startDate) {
      filteredPredictions = filteredPredictions.filter(p => new Date(p.timestamp) >= new Date(startDate));
    }
    if (endDate) {
      filteredPredictions = filteredPredictions.filter(p => new Date(p.timestamp) <= new Date(endDate));
    }

    // Apply type filter
    if (predictionType) {
      // In a real implementation, this would filter by actual prediction type
      // For demo purposes, we'll just limit the results
    }

    return NextResponse.json({
      predictions: filteredPredictions.slice(0, limit),
      summary: {
        totalPredictions: filteredPredictions.length,
        averageConfidence: filteredPredictions.reduce((sum, p) => sum + p.confidence, 0) / filteredPredictions.length,
        averageProcessingTime: filteredPredictions.reduce((sum, p) => sum + p.processingTime, 0) / filteredPredictions.length,
        modelId,
        dateRange: {
          start: startDate || new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          end: endDate || now.toISOString()
        }
      }
    });
  } catch (error) {
    console.error('Get Predictions Error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve predictions' },
      { status: 500 }
    );
  }
}

// Helper functions
function generateForecast(modelId: string, inputData: Record<string, any>, hours: number): ForecastData {
  const timestamps = [];
  const values = [];
  const confidence = { lower: [], upper: [] };

  const baseValue = inputData.current_demand || 1000;
  const trend = inputData.trend || 0.1;
  const seasonality = inputData.seasonality || 0.15;

  for (let i = 0; i < hours; i++) {
    const timestamp = new Date(Date.now() + i * 60 * 60 * 1000);
    timestamps.push(timestamp.toISOString());
    
    const hourOfDay = timestamp.getHours();
    const dayOfWeek = timestamp.getDay();
    
    const timeVariation = Math.sin((2 * Math.PI * hourOfDay) / 24) * seasonality;
    const weeklyVariation = Math.sin((2 * Math.PI * dayOfWeek) / 7) * seasonality * 0.5;
    const noise = (Math.random() - 0.5) * 0.1;
    
    const value = baseValue * (1 + trend * (i / hours) + timeVariation + weeklyVariation + noise);
    values.push(value);
    confidence.lower.push(value * 0.9);
    confidence.upper.push(value * 1.1);
  }

  return {
    timestamps,
    values,
    confidence,
    trend: Math.abs(trend) < 0.05 ? 'stable' : trend > 0 ? 'increasing' : 'decreasing',
    seasonality: {
      detected: true,
      period: 24,
      strength: seasonality
    },
    anomalies: generateAnomalies(timestamps, values)
  };
}

function generateClassification(modelId: string, inputData: Record<string, any>) {
  const classes = ['Normal', 'Warning', 'Critical', 'Optimal'];
  const probabilities = classes.map(cls => Math.random());
  const sum = probabilities.reduce((a, b) => a + b, 0);
  const normalizedProbs = probabilities.map(p => p / sum);
  
  const predictedClass = classes[normalizedProbs.indexOf(Math.max(...normalizedProbs))];
  
  return {
    predictedClass,
    confidence: Math.max(...normalizedProbs),
    probabilities: classes.reduce((acc, cls, index) => {
      acc[cls] = normalizedProbs[index];
      return acc;
    }, {} as Record<string, number>),
    decision: predictedClass === 'Critical' ? 'immediate_action_required' : 
             predictedClass === 'Warning' ? 'monitoring_required' : 'normal_operation'
  };
}

function generateRegression(modelId: string, inputData: Record<string, any>) {
  const baseValue = inputData.target_value || 100;
  const factors = inputData.factors || ['demand', 'weather', 'market'];
  const noise = (Math.random() - 0.5) * 0.2;
  const value = baseValue * (1 + noise);
  
  return {
    predictedValue: value,
    unit: inputData.unit || 'MWh',
    range: {
      min: value * 0.85,
      max: value * 1.15
    },
    factors: factors.reduce((acc, factor) => {
      acc[factor] = Math.random() * 2 - 1;
      return acc;
    }, {} as Record<string, number>)
  };
}

function generateRecommendations(modelId: string, inputData: Record<string, any>) {
  const scenarios = [
    {
      scenario: 'Peak Demand Optimization',
      actions: ['Increase renewable generation', 'Reduce non-essential loads', 'Activate storage systems'],
      impact: '15% demand reduction',
      feasibility: 'High'
    },
    {
      scenario: 'Cost Minimization',
      actions: ['Shift flexible loads to off-peak', 'Optimize energy storage cycles', 'Negotiate better rates'],
      impact: '12% cost reduction',
      feasibility: 'Medium'
    },
    {
      scenario: 'Carbon Footprint Reduction',
      actions: ['Prioritize renewable sources', 'Implement smart scheduling', 'Optimize grid efficiency'],
      impact: '25% CO2 reduction',
      feasibility: 'High'
    }
  ];

  return {
    recommendations: scenarios,
    priority: scenarios[Math.floor(Math.random() * scenarios.length)],
    implementation: {
      timeline: '2-4 weeks',
      resources: ['Technical team', 'Automated systems'],
      risk: 'Low'
    }
  };
}

function generateUncertainty(prediction: any, confidence: number) {
  const baseUncertainty = 1 - confidence;
  
  if (prediction.values) {
    return {
      lowerBound: Math.min(...prediction.values) * (1 - baseUncertainty),
      upperBound: Math.max(...prediction.values) * (1 + baseUncertainty),
      confidenceInterval: confidence
    };
  } else {
    return {
      lowerBound: prediction.predictedValue ? prediction.predictedValue * (1 - baseUncertainty) : 0,
      upperBound: prediction.predictedValue ? prediction.predictedValue * (1 + baseUncertainty) : 2,
      confidenceInterval: confidence
    };
  }
}

function generateForecastRecommendations(forecast: ForecastData) {
  const recommendations = [];
  
  if (forecast.trend === 'increasing') {
    recommendations.push('Prepare for increased demand with additional generation capacity');
  } else if (forecast.trend === 'decreasing') {
    recommendations.push('Consider reducing generation or implementing demand response');
  }
  
  if (forecast.seasonality.strength > 0.2) {
    recommendations.push('Implement time-of-use optimization strategies');
  }
  
  if (forecast.anomalies.length > 2) {
    recommendations.push('Investigate recent anomalies for potential system issues');
  }
  
  return recommendations;
}

function generateClassificationRecommendations(classification: any) {
  if (classification.decision === 'immediate_action_required') {
    return ['Immediate intervention required', 'Alert operations team', 'Activate backup systems'];
  } else if (classification.decision === 'monitoring_required') {
    return ['Increase monitoring frequency', 'Prepare contingency plans', 'Schedule preventive maintenance'];
  } else {
    return ['Continue normal operations', 'Regular monitoring', 'Optimize for efficiency'];
  }
}

function generateRegressionRecommendations(regression: any) {
  return [
    `Predicted value: ${regression.predictedValue} ${regression.unit}`,
    'Monitor actual performance against predictions',
    'Adjust parameters if deviation exceeds threshold',
    'Consider external factors not captured in model'
  ];
}

function generateAnomalies(timestamps: string[], values: number[]) {
  const anomalies = [];
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const stdDev = Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length);
  
  values.forEach((value, index) => {
    const deviation = Math.abs(value - mean) / stdDev;
    if (deviation > 2) {
      anomalies.push({
        timestamp: timestamps[index],
        value,
        expected: mean,
        deviation,
        severity: deviation > 3 ? 'high' : deviation > 2.5 ? 'medium' : 'low'
      });
    }
  });
  
  return anomalies;
}

function generateHistoricalPrediction(predictionType: string | null) {
  if (predictionType === 'forecast') {
    return generateForecast('historical', {}, 24);
  } else if (predictionType === 'classification') {
    return generateClassification('historical', {});
  } else if (predictionType === 'regression') {
    return generateRegression('historical', {});
  } else {
    return generateRecommendations('historical', {});
  }
}

function generateRandomFeatureImportance() {
  const features = ['demand', 'weather', 'time', 'market', 'season'];
  return features.reduce((acc, feature) => {
    acc[feature] = Math.random();
    return acc;
  }, {} as Record<string, number>);
}

function generateFeatureImportance(modelId: string, inputData: Record<string, any>) {
  const features = Object.keys(inputData);
  const total = features.length;
  
  return features.reduce((acc, feature) => {
    acc[feature] = Math.random();
    return acc;
  }, {} as Record<string, number>);
}

function getModelVersion(modelId: string): string {
  const versions: Record<string, string> = {
    'model-energy-001': '2.1.0',
    'model-anomaly-001': '1.3.0',
    'model-trading-001': '3.0.1',
    'model-optimization-001': '1.1.0',
    'model-clustering-001': '2.0.0'
  };
  
  return versions[modelId] || '1.0.0';
}