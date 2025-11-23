import { NextRequest, NextResponse } from 'next/server';
import { createApiResponse, createApiError } from '../api-gateway/route';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import axios from 'axios';

// Webhook Database (in production, use a real database)
const webhooksDatabase: Record<string, any> = {};
const webhookEvents: Array<any> = [];

// Predefined webhook templates
const webhookTemplates = {
  'energy_data_update': {
    name: 'Energy Data Update',
    description: 'Triggered when energy data is updated',
    events: ['energy_data_created', 'energy_data_updated', 'energy_data_deleted'],
    examplePayload: {
      id: 'webhook_123',
      type: 'energy_data_created',
      timestamp: new Date().toISOString(),
      data: {
        assetId: 'asset_001',
        timestamp: new Date().toISOString(),
        powerOutput: 2.5,
        efficiency: 0.92
      },
      user: {
        id: 'user_001',
        name: 'John Doe',
        email: 'john@example.com'
      }
    }
  },
  'market_price_change': {
    name: 'Market Price Change',
    description: 'Triggered when market prices change significantly',
    events: ['market_price_updated', 'market_price_alert'],
    examplePayload: {
      id: 'webhook_456',
      type: 'market_price_updated',
      timestamp: new Date().toISOString(),
      data: {
        region: 'ERCOT',
        oldPrice: 0.045,
        newPrice: 0.052,
        changePercent: 15.56,
        timestamp: new Date().toISOString()
      }
    }
  },
  'dashboard_activity': {
    name: 'Dashboard Activity',
    description: 'Triggered on dashboard-related activities',
    events: ['dashboard_created', 'dashboard_updated', 'widget_added', 'widget_removed', 'dashboard_shared'],
    examplePayload: {
      id: 'webhook_789',
      type: 'dashboard_shared',
      timestamp: new Date().toISOString(),
      data: {
        dashboardId: 'dashboard_123',
        dashboardName: 'ERCOT Market Overview',
        sharedWith: ['user_002', 'user_003'],
        permissions: ['view', 'comment'],
        shareType: 'user'
      },
      user: {
        id: 'user_001',
        name: 'John Doe'
      }
    }
  }
};

// Sign webhook payload
function signWebhookPayload(payload: string, secret: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('hex');
}

// Verify webhook signature
function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = signWebhookPayload(payload, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}

// Webhook event types
export const WEBHOOK_EVENTS = {
  ENERGY_DATA_CREATED: 'energy_data_created',
  ENERGY_DATA_UPDATED: 'energy_data_updated',
  ENERGY_DATA_DELETED: 'energy_data_deleted',
  MARKET_PRICE_UPDATED: 'market_price_updated',
  MARKET_PRICE_ALERT: 'market_price_alert',
  DASHBOARD_CREATED: 'dashboard_created',
  DASHBOARD_UPDATED: 'dashboard_updated',
  DASHBOARD_SHARED: 'dashboard_shared',
  WIDGET_ADDED: 'widget_added',
  WIDGET_REMOVED: 'widget_removed',
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
  SYSTEM_ERROR: 'system_error',
  SYSTEM_MAINTENANCE: 'system_maintenance'
} as const;

// Get webhook templates
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');
  
  if (action === 'templates') {
    return createApiResponse({
      templates: webhookTemplates,
      events: Object.keys(WEBHOOK_EVENTS).map(key => ({
        key,
        value: WEBHOOK_EVENTS[key as keyof typeof WEBHOOK_EVENTS]
      }))
    });
  }
  
  if (action === 'events') {
    return createApiResponse({
      recentEvents: webhookEvents.slice(-50),
      totalEvents: webhookEvents.length
    });
  }
  
  return createApiResponse(webhookTemplates);
}

// Create webhook
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    return createApiError('Authentication required', 'AUTH_REQUIRED', 401);
  }

  try {
    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    const requestData = await req.json();
    const { name, url, events, secret, enabled = true, filters } = requestData;
    
    if (!name || !url || !events) {
      return createApiError('Missing required fields: name, url, events', 'MISSING_FIELDS', 400);
    }
    
    if (!Array.isArray(events) || events.length === 0) {
      return createApiError('Events must be a non-empty array', 'INVALID_EVENTS', 400);
    }
    
    // Validate URL format
    try {
      new URL(url);
    } catch {
      return createApiError('Invalid URL format', 'INVALID_URL', 400);
    }
    
    const webhookId = `webhook_${crypto.randomBytes(8).toString('hex')}`;
    const webhookSecret = secret || crypto.randomBytes(32).toString('hex');
    
    const webhook = {
      id: webhookId,
      name,
      url,
      events,
      secret: webhookSecret,
      enabled,
      filters: filters || {},
      userId: decoded.userId,
      createdAt: new Date().toISOString(),
      lastTriggered: null,
      successCount: 0,
      failureCount: 0,
      status: 'active'
    };
    
    webhooksDatabase[webhookId] = webhook;
    
    return createApiResponse({
      id: webhook.id,
      name: webhook.name,
      url: webhook.url,
      events: webhook.events,
      secret: webhook.secret,
      enabled: webhook.enabled,
      createdAt: webhook.createdAt,
      status: webhook.status
    }, 201);

  } catch (error) {
    return createApiError('Failed to create webhook', 'CREATION_FAILED', 500);
  }
}

// Test webhook endpoint
export async function PUT(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');
  
  if (action === 'test') {
    const requestData = await req.json();
    const { webhookId, eventType = WEBHOOK_EVENTS.ENERGY_DATA_CREATED } = requestData;
    
    if (!webhookId || !webhooksDatabase[webhookId]) {
      return createApiError('Invalid webhook ID', 'INVALID_WEBHOOK_ID', 404);
    }
    
    const webhook = webhooksDatabase[webhookId];
    
    // Create test payload
    const testPayload = {
      id: `test_${Date.now()}`,
      type: eventType,
      timestamp: new Date().toISOString(),
      test: true,
      data: webhookTemplates.energy_data_update.examplePayload.data
    };
    
    // Sign the payload
    const payload = JSON.stringify(testPayload);
    const signature = signWebhookPayload(payload, webhook.secret);
    
    try {
      const response = await axios.post(webhook.url, testPayload, {
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'User-Agent': 'OptiBidEnergy-Webhook/1.0'
        },
        timeout: 10000,
        validateStatus: () => true // Accept any status code
      });
      
      return createApiResponse({
        webhookId,
        testPayload,
        signature,
        response: {
          status: response.status,
          statusText: response.statusText,
          data: response.data
        },
        success: response.status >= 200 && response.status < 300
      });
      
    } catch (error: any) {
      return createApiResponse({
        webhookId,
        testPayload,
        success: false,
        error: error.message
      }, 200);
    }
  }
  
  return createApiError('Invalid action', 'INVALID_ACTION', 400);
}

// Trigger webhook event
export function triggerWebhookEvent(eventType: string, data: any, userId?: string) {
  const event = {
    id: `event_${Date.now()}`,
    type: eventType,
    timestamp: new Date().toISOString(),
    data,
    userId
  };
  
  webhookEvents.push(event);
  
  // Find matching webhooks
  const matchingWebhooks = Object.values(webhooksDatabase).filter(webhook => {
    return webhook.enabled && 
           webhook.events.includes(eventType) &&
           webhook.status === 'active';
  });
  
  // Trigger each matching webhook
  matchingWebhooks.forEach(async (webhook) => {
    try {
      const payload = JSON.stringify({
        ...event,
        webhook: {
          id: webhook.id,
          name: webhook.name
        }
      });
      
      const signature = signWebhookPayload(payload, webhook.secret);
      
      const response = await axios.post(webhook.url, JSON.parse(payload), {
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-Id': webhook.id,
          'User-Agent': 'OptiBidEnergy-Webhook/1.0'
        },
        timeout: 30000
      });
      
      // Update webhook statistics
      webhook.lastTriggered = new Date().toISOString();
      webhook.successCount++;
      
    } catch (error) {
      // Update webhook statistics on failure
      webhook.failureCount++;
    }
  });
}