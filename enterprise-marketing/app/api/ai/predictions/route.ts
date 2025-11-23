// =============================================================================
// AI PREDICTIONS API ENDPOINT
// =============================================================================
import { NextRequest, NextResponse } from 'next/server';

interface Prediction {
  id: string;
  model_id: string;
  model_name: string;
  type: 'price_forecast' | 'risk_assessment' | 'anomaly_detection' | 'trend_analysis' | 'optimization';
  input_data: Record<string, any>;
  prediction: any;
  confidence: number;
  timestamp: string;
  expiry_time: string;
  status: 'pending' | 'completed' | 'expired' | 'failed';
  processing_time: number; // milliseconds
  market_region: string;
  asset_class: string;
  horizon: string; // e.g., '1h', '1d', '1w'
  accuracy_metrics?: {
    predicted_value?: number;
    actual_value?: number;
    error?: number;
    accuracy?: number;
  };
}

interface PredictionRequest {
  model_id: string;
  input_data: Record<string, any>;
  horizon?: string;
  market_region?: string;
}

const mockPredictions: Prediction[] = [
  {
    id: 'pred-001',
    model_id: 'model-lstm-001',
    model_name: 'LSTM Price Forecaster',
    type: 'price_forecast',
    input_data: {
      current_price: 45.67,
      volume: 125000,
      rsi: 68.5,
      macd: 0.23,
      volatility: 0.15,
    },
    prediction: {
      next_hour_price: 46.12,
      price_change: 0.45,
      price_change_percent: 0.98,
      trend: 'bullish',
    },
    confidence: 94.2,
    timestamp: '2025-11-21T13:40:00Z',
    expiry_time: '2025-11-21T14:40:00Z',
    status: 'completed',
    processing_time: 1.8,
    market_region: 'PJM',
    asset_class: 'Energy',
    horizon: '1h',
  },
  {
    id: 'pred-002',
    model_id: 'model-rf-risk-001',
    model_name: 'Random Forest Risk Assessor',
    type: 'risk_assessment',
    input_data: {
      position_size: 500000,
      portfolio_value: 2500000,
      market_volatility: 0.22,
      correlation: 0.67,
    },
    prediction: {
      risk_level: 'medium',
      var_95: 125000,
      var_99: 187000,
      risk_score: 6.8,
      recommendations: ['reduce_position', 'add_hedge'],
    },
    confidence: 97.8,
    timestamp: '2025-11-21T13:41:00Z',
    expiry_time: '2025-11-21T14:41:00Z',
    status: 'completed',
    processing_time: 0.8,
    market_region: 'ERCOT',
    asset_class: 'Portfolio',
    horizon: '1d',
  },
  {
    id: 'pred-003',
    model_id: 'model-svm-anomaly-001',
    model_name: 'SVM Anomaly Detector',
    type: 'anomaly_detection',
    input_data: {
      transaction_amount: 2500000,
      transaction_time: '2025-11-21T13:42:00Z',
      frequency_score: 8.7,
      amount_zscore: 3.2,
    },
    prediction: {
      is_anomaly: false,
      anomaly_score: 0.15,
      confidence: 98.3,
      reasons: ['normal_amount_pattern', 'expected_timing'],
    },
    confidence: 98.3,
    timestamp: '2025-11-21T13:42:00Z',
    expiry_time: '2025-11-21T14:42:00Z',
    status: 'completed',
    processing_time: 0.6,
    market_region: 'CAISO',
    asset_class: 'Trading',
    horizon: 'realtime',
  },
];

// GET /api/ai/predictions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const modelId = searchParams.get('model_id');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const marketRegion = searchParams.get('market_region');
    const limit = searchParams.get('limit') || '50';
    
    let predictions = [...mockPredictions];
    
    // Apply filters
    if (modelId) {
      predictions = predictions.filter(p => p.model_id === modelId);
    }
    
    if (type) {
      predictions = predictions.filter(p => p.type === type);
    }
    
    if (status) {
      predictions = predictions.filter(p => p.status === status);
    }
    
    if (marketRegion) {
      predictions = predictions.filter(p => p.market_region === marketRegion);
    }
    
    // Sort by timestamp (most recent first)
    predictions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    // Apply limit
    const limitNum = parseInt(limit);
    predictions = predictions.slice(0, limitNum);
    
    // Calculate summary statistics
    const stats = {
      total_predictions: mockPredictions.length,
      completed_predictions: mockPredictions.filter(p => p.status === 'completed').length,
      average_confidence: mockPredictions.reduce((acc, p) => acc + p.confidence, 0) / mockPredictions.length,
      average_processing_time: mockPredictions.reduce((acc, p) => acc + p.processing_time, 0) / mockPredictions.length,
      predictions_by_type: {
        price_forecast: mockPredictions.filter(p => p.type === 'price_forecast').length,
        risk_assessment: mockPredictions.filter(p => p.type === 'risk_assessment').length,
        anomaly_detection: mockPredictions.filter(p => p.type === 'anomaly_detection').length,
        trend_analysis: mockPredictions.filter(p => p.type === 'trend_analysis').length,
        optimization: mockPredictions.filter(p => p.type === 'optimization').length,
      },
      predictions_by_region: {
        PJM: mockPredictions.filter(p => p.market_region === 'PJM').length,
        ERCOT: mockPredictions.filter(p => p.market_region === 'ERCOT').length,
        CAISO: mockPredictions.filter(p => p.market_region === 'CAISO').length,
        MISO: mockPredictions.filter(p => p.market_region === 'MISO').length,
      },
    };
    
    return NextResponse.json({
      success: true,
      data: {
        predictions,
        stats,
        total: predictions.length,
      },
      message: 'Predictions retrieved successfully',
    });
    
  } catch (error) {
    console.error('Error fetching predictions:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch predictions',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST /api/ai/predictions
export async function POST(request: NextRequest) {
  try {
    const body: PredictionRequest = await request.json();
    
    // Validate required fields
    if (!body.model_id || !body.input_data) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: model_id, input_data',
        },
        { status: 400 }
      );
    }
    
    // Simulate prediction processing
    const processingStart = Date.now();
    
    // Mock prediction generation based on model type
    let prediction: any = {};
    let confidence = 90;
    let processingTime = Math.random() * 5 + 0.5; // 0.5-5.5ms
    
    // Simulate different prediction types
    if (body.model_id === 'model-lstm-001') {
      const currentPrice = body.input_data.current_price || 45;
      const priceChange = (Math.random() - 0.5) * 2; // -1 to 1
      prediction = {
        next_hour_price: currentPrice + priceChange,
        price_change: priceChange,
        price_change_percent: (priceChange / currentPrice) * 100,
        trend: priceChange > 0 ? 'bullish' : 'bearish',
      };
      confidence = 94.2;
    } else if (body.model_id === 'model-rf-risk-001') {
      const riskScore = Math.random() * 10;
      prediction = {
        risk_level: riskScore < 3 ? 'low' : riskScore < 7 ? 'medium' : 'high',
        risk_score: riskScore,
        var_95: Math.random() * 500000 + 100000,
        var_99: Math.random() * 800000 + 150000,
        recommendations: riskScore > 7 ? ['reduce_exposure', 'add_hedge'] : ['maintain_position'],
      };
      confidence = 97.8;
    } else if (body.model_id === 'model-svm-anomaly-001') {
      const anomalyScore = Math.random();
      prediction = {
        is_anomaly: anomalyScore > 0.8,
        anomaly_score: anomalyScore,
        confidence: 98.3,
        reasons: anomalyScore > 0.8 ? ['unusual_pattern'] : ['normal_behavior'],
      };
      confidence = 98.3;
    }
    
    const processingEnd = Date.now();
    processingTime = processingEnd - processingStart;
    
    // Create prediction object
    const newPrediction: Prediction = {
      id: `pred-${Date.now()}`,
      model_id: body.model_id,
      model_name: `Model ${body.model_id}`, // Would lookup actual name
      type: 'price_forecast', // Would determine from model
      input_data: body.input_data,
      prediction,
      confidence,
      timestamp: new Date().toISOString(),
      expiry_time: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
      status: 'completed',
      processing_time: processingTime,
      market_region: body.market_region || 'PJM',
      asset_class: 'Energy',
      horizon: body.horizon || '1h',
    };
    
    // Add to mock predictions (in production, would save to database)
    mockPredictions.unshift(newPrediction);
    
    // Keep only last 1000 predictions in memory
    if (mockPredictions.length > 1000) {
      mockPredictions.splice(1000);
    }
    
    return NextResponse.json({
      success: true,
      data: {
        prediction: newPrediction,
      },
      message: 'Prediction completed successfully',
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating prediction:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create prediction',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}