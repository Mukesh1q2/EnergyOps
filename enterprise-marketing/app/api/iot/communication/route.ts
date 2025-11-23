import { NextRequest, NextResponse } from 'next/server';
import { mqtt } from 'mqtt';

export interface DeviceMessage {
  id: string;
  deviceId: string;
  topic: string;
  protocol: 'mqtt' | 'coap' | 'opcua' | 'modbus' | 'websocket' | 'grpc';
  messageType: 'telemetry' | 'command' | 'response' | 'alert' | 'status' | 'configuration';
  payload: {
    sensorData?: Record<string, any>;
    command?: string;
    parameters?: Record<string, any>;
    timestamp: string;
    qualityOfService: 0 | 1 | 2;
    compressed?: boolean;
    encrypted?: boolean;
  };
  metadata: {
    size: number;
    latency: number;
    deliveryStatus: 'pending' | 'delivered' | 'failed' | 'acknowledged';
    retryCount: number;
    signature?: string;
    schema?: string;
  };
  timestamp: Date;
}

export interface MessageBroker {
  id: string;
  name: string;
  protocol: 'mqtt' | 'coap' | 'amqp' | 'kafka' | 'nats';
  endpoint: string;
  region: string;
  status: 'online' | 'offline' | 'maintenance' | 'degraded';
  performance: {
    messageRate: number; // messages/second
    throughput: number; // MB/second
    latency: number; // milliseconds
    connectionCount: number;
    topicCount: number;
    memoryUsage: number; // percentage
    cpuUsage: number; // percentage
  };
  security: {
    authentication: 'certificate' | 'oauth' | 'api-key' | 'jwt';
    encryption: 'tls' | 'wss' | 'none';
    authorization: 'rbac' | 'abac' | 'policy-based';
    certificateExpiry?: Date;
  };
  capabilities: string[];
  lastSeen: Date;
}

export interface StreamProcessing {
  id: string;
  name: string;
  type: 'aggregation' | 'filter' | 'transform' | 'enrichment' | 'analytics' | 'ml-inference';
  inputStreams: string[];
  outputStreams: string[];
  status: 'running' | 'stopped' | 'error' | 'deploying';
  configuration: {
    windowSize: number; // seconds
    batchSize: number;
    processingRate: number;
    parallelProcessing: boolean;
    faultTolerance: boolean;
  };
  performance: {
    inputRate: number; // messages/second
    outputRate: number; // messages/second
    processingLatency: number; // milliseconds
    errorRate: number; // percentage
    throughput: number; // MB/second
  };
  aiEnabled: boolean;
  modelConfig?: {
    modelType: string;
    version: string;
    inferenceEndpoint: string;
    confidenceThreshold: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface DeviceAlert {
  id: string;
  deviceId: string;
  alertType: 'threshold-exceeded' | 'device-offline' | 'communication-error' | 'security-breach' | 'performance-degradation';
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  resolvedAt?: Date;
  escalationLevel: number;
  affectedServices: string[];
  recommendations: string[];
}

export interface MessageMetrics {
  totalMessages: number;
  messagesPerSecond: number;
  averageLatency: number;
  deliveryRate: number; // percentage
  errorRate: number; // percentage
  protocolDistribution: {
    mqtt: number;
    coap: number;
    opcua: number;
    modbus: number;
    websocket: number;
    grpc: number;
  };
  topicMetrics: {
    activeTopics: number;
    highTrafficTopics: number;
    messageSizeDistribution: {
      small: number; // < 1KB
      medium: number; // 1KB - 64KB
      large: number; // > 64KB
    };
  };
  brokerMetrics: {
    totalBrokers: number;
    onlineBrokers: number;
    messageRatePerBroker: Record<string, number>;
    latencyPerBroker: Record<string, number>;
  };
  streamMetrics: {
    activeStreams: number;
    processingCapacity: number;
    aiInferenceRate: number;
    realTimeAnalyticsRate: number;
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const protocol = searchParams.get('protocol');
    const messageType = searchParams.get('type');
    const deviceId = searchParams.get('deviceId');
    const timeRange = searchParams.get('timeRange') || '1h';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');

    // Simulate real-time message broker infrastructure
    const messageBrokers: MessageBroker[] = [
      {
        id: 'broker-001',
        name: 'Primary MQTT Broker - US West',
        protocol: 'mqtt',
        endpoint: 'mqtt://mqtt-west.optibid.com:1883',
        region: 'us-west-2',
        status: 'online',
        performance: {
          messageRate: 15420,
          throughput: 234.7,
          latency: 12.3,
          connectionCount: 1247,
          topicCount: 3456,
          memoryUsage: 67.8,
          cpuUsage: 45.2
        },
        security: {
          authentication: 'certificate',
          encryption: 'tls',
          authorization: 'rbac',
          certificateExpiry: new Date('2024-12-31')
        },
        capabilities: ['quality-of-service', 'retained-messages', 'will-messages', 'bridge-connections'],
        lastSeen: new Date()
      },
      {
        id: 'broker-002',
        name: 'CoAP Gateway - Global',
        protocol: 'coap',
        endpoint: 'coap://coap.optibid.com:5683',
        region: 'global',
        status: 'online',
        performance: {
          messageRate: 8743,
          throughput: 89.4,
          latency: 23.7,
          connectionCount: 567,
          topicCount: 1234,
          memoryUsage: 34.5,
          cpuUsage: 28.9
        },
        security: {
          authentication: 'api-key',
          encryption: 'tls',
          authorization: 'abac'
        },
        capabilities: ['confirmable-messages', 'proxy-forwarding', 'resource-observation', 'blockwise-transfer'],
        lastSeen: new Date()
      },
      {
        id: 'broker-003',
        name: 'OPC UA Server Cluster',
        protocol: 'opcua',
        endpoint: 'opc.tcp://opcua.optibid.com:4840',
        region: 'us-east-1',
        status: 'online',
        performance: {
          messageRate: 3456,
          throughput: 456.8,
          latency: 8.9,
          connectionCount: 234,
          topicCount: 567,
          memoryUsage: 78.3,
          cpuUsage: 56.7
        },
        security: {
          authentication: 'certificate',
          encryption: 'tls',
          authorization: 'policy-based',
          certificateExpiry: new Date('2024-08-15')
        },
        capabilities: ['industrial-protocols', 'real-time-communication', 'data-modeling', 'event-notification'],
        lastSeen: new Date()
      }
    ];

    // Simulate real-time device messages
    const deviceMessages: DeviceMessage[] = [
      {
        id: 'msg-001',
        deviceId: 'iot-001-solar-panels',
        topic: 'sensors/solar-array-a/power',
        protocol: 'mqtt',
        messageType: 'telemetry',
        payload: {
          sensorData: {
            power: 2347.6,
            voltage: 23.4,
            current: 89.3,
            temperature: 24.5,
            efficiency: 18.7,
            irradiance: 847.2
          },
          timestamp: new Date().toISOString(),
          qualityOfService: 1,
          compressed: false,
          encrypted: true
        },
        metadata: {
          size: 245,
          latency: 15.3,
          deliveryStatus: 'delivered',
          retryCount: 0,
          signature: 'SHA256:abc123...',
          schema: 'solar-telemetry-v2.1'
        },
        timestamp: new Date()
      },
      {
        id: 'msg-002',
        deviceId: 'iot-002-wind-turbine',
        topic: 'devices/wind-turbine-7/status',
        protocol: 'opcua',
        messageType: 'status',
        payload: {
          sensorData: {
            rotorSpeed: 12.4,
            powerOutput: 4567.8,
            windSpeed: 15.6,
            direction: 234,
            vibration: 0.02,
            temperature: 18.3
          },
          timestamp: new Date().toISOString(),
          qualityOfService: 0
        },
        metadata: {
          size: 189,
          latency: 8.7,
          deliveryStatus: 'delivered',
          retryCount: 0
        },
        timestamp: new Date()
      },
      {
        id: 'msg-003',
        deviceId: 'iot-003-battery-storage',
        topic: 'battery/bess-01/command',
        protocol: 'mqtt',
        messageType: 'command',
        payload: {
          command: 'start-discharge',
          parameters: {
            duration: 3600,
            powerLimit: 1250,
            minSoc: 20,
            priority: 'peak-shaving'
          },
          timestamp: new Date().toISOString(),
          qualityOfService: 2,
          encrypted: true
        },
        metadata: {
          size: 156,
          latency: 12.1,
          deliveryStatus: 'acknowledged',
          retryCount: 0,
          signature: 'RSA:def456...'
        },
        timestamp: new Date()
      }
    ];

    // Apply filters
    let filteredMessages = deviceMessages;
    
    if (protocol) {
      filteredMessages = filteredMessages.filter(m => m.protocol === protocol);
    }
    
    if (messageType) {
      filteredMessages = filteredMessages.filter(m => m.messageType === messageType);
    }
    
    if (deviceId) {
      filteredMessages = filteredMessages.filter(m => m.deviceId === deviceId);
    }

    // Simulate stream processing pipelines
    const streamProcessing: StreamProcessing[] = [
      {
        id: 'stream-001',
        name: 'Solar Power Aggregation',
        type: 'aggregation',
        inputStreams: ['sensors/solar-array-*/power'],
        outputStreams: ['analytics/solar-farm-summary'],
        status: 'running',
        configuration: {
          windowSize: 60,
          batchSize: 100,
          processingRate: 1000,
          parallelProcessing: true,
          faultTolerance: true
        },
        performance: {
          inputRate: 456,
          outputRate: 8.7,
          processingLatency: 234,
          errorRate: 0.02,
          throughput: 12.3
        },
        aiEnabled: false,
        createdAt: new Date('2023-06-01'),
        updatedAt: new Date()
      },
      {
        id: 'stream-002',
        name: 'Predictive Maintenance AI',
        type: 'ml-inference',
        inputStreams: ['devices/*/sensors'],
        outputStreams: ['alerts/predictive-maintenance'],
        status: 'running',
        configuration: {
          windowSize: 300,
          batchSize: 50,
          processingRate: 100,
          parallelProcessing: false,
          faultTolerance: true
        },
        performance: {
          inputRate: 1234,
          outputRate: 23.4,
          processingLatency: 567,
          errorRate: 0.05,
          throughput: 45.6
        },
        aiEnabled: true,
        modelConfig: {
          modelType: 'anomaly-detection',
          version: '2.1.3',
          inferenceEndpoint: 'edge-ai/optib-maintenance-v2',
          confidenceThreshold: 0.85
        },
        createdAt: new Date('2023-08-15'),
        updatedAt: new Date()
      }
    ];

    // Calculate message metrics
    const messageMetrics: MessageMetrics = {
      totalMessages: 1456789,
      messagesPerSecond: 1247,
      averageLatency: 23.4,
      deliveryRate: 99.7,
      errorRate: 0.03,
      protocolDistribution: {
        mqtt: 67.8,
        coap: 15.4,
        opcua: 8.9,
        modbus: 4.2,
        websocket: 2.8,
        grpc: 0.9
      },
      topicMetrics: {
        activeTopics: 3456,
        highTrafficTopics: 234,
        messageSizeDistribution: {
          small: 78.4,
          medium: 18.7,
          large: 2.9
        }
      },
      brokerMetrics: {
        totalBrokers: 3,
        onlineBrokers: 3,
        messageRatePerBroker: {
          'broker-001': 15420,
          'broker-002': 8743,
          'broker-003': 3456
        },
        latencyPerBroker: {
          'broker-001': 12.3,
          'broker-002': 23.7,
          'broker-003': 8.9
        }
      },
      streamMetrics: {
        activeStreams: 2,
        processingCapacity: 2500,
        aiInferenceRate: 1234,
        realTimeAnalyticsRate: 456
      }
    };

    // Pagination for messages
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedMessages = filteredMessages.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      messages: paginatedMessages,
      messageBrokers,
      streamProcessing,
      metrics: messageMetrics,
      pagination: {
        page,
        limit,
        total: filteredMessages.length,
        pages: Math.ceil(filteredMessages.length / limit)
      },
      summary: {
        totalMessages: messageMetrics.totalMessages.toLocaleString(),
        messagesPerSecond: messageMetrics.messagesPerSecond,
        averageLatency: messageMetrics.averageLatency.toFixed(1) + 'ms',
        deliveryRate: messageMetrics.deliveryRate.toFixed(1) + '%',
        activeBrokers: messageMetrics.brokerMetrics.onlineBrokers,
        activeStreams: messageMetrics.streamMetrics.activeStreams,
        aiInferenceRate: messageMetrics.streamMetrics.aiInferenceRate + '/sec'
      }
    });

  } catch (error) {
    console.error('Device Communication API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to retrieve device communication data',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const messageData: Partial<DeviceMessage> = await request.json();

    // Validate required fields
    if (!messageData.deviceId || !messageData.topic || !messageData.protocol || !messageData.payload) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: deviceId, topic, protocol, payload' 
        },
        { status: 400 }
      );
    }

    // Generate unique message ID
    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create new device message
    const newMessage: DeviceMessage = {
      id: messageId,
      deviceId: messageData.deviceId,
      topic: messageData.topic,
      protocol: messageData.protocol,
      messageType: messageData.messageType || 'telemetry',
      payload: messageData.payload,
      metadata: {
        size: JSON.stringify(messageData.payload).length,
        latency: Math.random() * 50, // Simulate latency
        deliveryStatus: 'pending',
        retryCount: 0,
        signature: messageData.payload.encrypted ? `SHA256:${Math.random().toString(36).substr(2, 16)}` : undefined,
        schema: `iot-${messageData.messageType}-v1.0`
      },
      timestamp: new Date()
    };

    // Simulate message routing based on protocol
    let routingResult;
    
    switch (newMessage.protocol) {
      case 'mqtt':
        routingResult = {
          brokerEndpoint: 'mqtt://mqtt-west.optibid.com:1883',
          qos: newMessage.payload.qualityOfService || 1,
          retained: false,
          topic: newMessage.topic,
          encryption: 'TLS',
          routingPath: ['mqtt-gateway', 'message-broker', 'device']
        };
        break;
        
      case 'coap':
        routingResult = {
          gatewayEndpoint: 'coap://coap.optibid.com:5683',
          method: newMessage.messageType === 'command' ? 'PUT' : 'POST',
          proxying: true,
          congestionControl: ' exponential-backoff',
          routingPath: ['coap-gateway', 'resource-server', 'device']
        };
        break;
        
      case 'opcua':
        routingResult = {
          serverEndpoint: 'opc.tcp://opcua.optibid.com:4840',
          nodeId: `ns=4;s=${newMessage.deviceId}`,
          method: newMessage.messageType === 'command' ? 'Write' : 'Read',
          securityPolicy: 'Basic256Sha256',
          routingPath: ['opcua-server', 'information-model', 'device']
        };
        break;
        
      default:
        routingResult = {
          protocol: newMessage.protocol,
          endpoint: `generic://${newMessage.protocol}.optibid.com:8080`,
          routingPath: ['generic-gateway', 'message-router', 'device']
        };
    }

    // Add stream processing if applicable
    const streamProcessingResults = [];
    
    if (newMessage.messageType === 'telemetry') {
      streamProcessingResults.push({
        streamId: 'stream-001',
        type: 'aggregation',
        processed: true,
        outputTopic: 'analytics/telemetry-summary',
        latency: 234
      });
    }
    
    if (newMessage.messageType === 'sensorData') {
      streamProcessingResults.push({
        streamId: 'stream-002',
        type: 'ml-inference',
        processed: true,
        anomalyScore: 0.23,
        confidence: 0.89,
        outputTopic: 'alerts/predictive-maintenance'
      });
    }

    return NextResponse.json({
      success: true,
      message: newMessage,
      routing: routingResult,
      streamProcessing: streamProcessingResults,
      status: {
        messageId: newMessage.id,
        status: 'pending',
        estimatedDelivery: new Date(Date.now() + newMessage.metadata.latency).toISOString(),
        nextHop: routingResult.routingPath[0]
      },
      message: 'Device message queued for delivery successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Device Message Send Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to send device message',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}