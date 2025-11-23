import { NextRequest, NextResponse } from 'next/server';
import { createApiResponse, createApiError } from '../api-gateway/route';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// Mock API Key Database (In production, this would be a real database)
const apiKeysDatabase: Record<string, any> = {
  'optibid_live_sk_abc123xyz789': {
    id: 'optibid_live_sk_abc123xyz789',
    name: 'Production API Key',
    description: 'Production API key for live integrations',
    key: 'optibid_live_sk_abc123xyz789',
    secret: crypto.randomBytes(32).toString('hex'),
    userId: 'user_001',
    userRole: 'enterprise',
    permissions: ['read:energy_data', 'write:energy_data', 'read:market_data', 'read:analytics'],
    rateLimit: 10000, // requests per hour
    status: 'active',
    createdAt: new Date('2024-01-01T00:00:00Z').toISOString(),
    lastUsedAt: new Date().toISOString(),
    expiresAt: new Date('2025-12-31T23:59:59Z').toISOString(),
    environment: 'production',
    restrictions: {
      ipWhitelist: ['192.168.1.0/24', '10.0.0.0/8'],
      rateLimitPerMinute: 100,
      allowedDomains: ['localhost:3000', 'app.optibid.com']
    }
  },
  'optibid_dev_sk_def456uvw012': {
    id: 'optibid_dev_sk_def456uvw012',
    name: 'Development API Key',
    description: 'Development API key for testing integrations',
    key: 'optibid_dev_sk_def456uvw012',
    secret: crypto.randomBytes(32).toString('hex'),
    userId: 'user_001',
    userRole: 'developer',
    permissions: ['read:energy_data', 'read:market_data'],
    rateLimit: 1000, // requests per hour
    status: 'active',
    createdAt: new Date('2024-01-01T00:00:00Z').toISOString(),
    lastUsedAt: new Date().toISOString(),
    expiresAt: new Date('2025-01-01T00:00:00Z').toISOString(),
    environment: 'development',
    restrictions: {
      ipWhitelist: ['127.0.0.1', 'localhost'],
      rateLimitPerMinute: 50,
      allowedDomains: ['localhost:3000']
    }
  }
};

// Rate limiting for API key usage (in production, use Redis)
const apiKeyUsage = new Map<string, { count: number; resetTime: number }>();

// Verify API Key
export function verifyApiKey(apiKey: string): { valid: boolean; apiKeyData?: any; error?: string } {
  if (!apiKey) {
    return { valid: false, error: 'API key is required' };
  }

  const keyData = apiKeysDatabase[apiKey];
  
  if (!keyData) {
    return { valid: false, error: 'Invalid API key' };
  }

  if (keyData.status !== 'active') {
    return { valid: false, error: 'API key is not active' };
  }

  if (new Date(keyData.expiresAt) < new Date()) {
    return { valid: false, error: 'API key has expired' };
  }

  // Update last used timestamp
  keyData.lastUsedAt = new Date().toISOString();
  
  return { valid: true, apiKeyData: keyData };
}

// Check rate limiting for API key
export function checkApiKeyRateLimit(apiKeyId: string): boolean {
  const now = Date.now();
  const usage = apiKeyUsage.get(apiKeyId);
  
  if (!usage || now > usage.resetTime) {
    apiKeyUsage.set(apiKeyId, { count: 1, resetTime: now + (60 * 60 * 1000) }); // Reset in 1 hour
    return true;
  }
  
  const keyData = apiKeysDatabase[apiKeyId];
  if (usage.count >= keyData.rateLimit) {
    return false;
  }
  
  usage.count++;
  return true;
}

// Generate API Key
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    return createApiError('Authentication required', 'AUTH_REQUIRED', 401);
  }

  try {
    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    const requestData = await req.json();
    const { name, description, permissions, rateLimit, environment, restrictions } = requestData;
    
    if (!name || !permissions || !rateLimit) {
      return createApiError('Missing required fields: name, permissions, rateLimit', 'MISSING_FIELDS', 400);
    }

    // Generate unique API key
    const prefix = environment === 'production' ? 'optibid_live' : 'optibid_dev';
    const randomPart = crypto.randomBytes(12).toString('hex');
    const apiKey = `${prefix}_sk_${randomPart}`;
    
    const newApiKey = {
      id: apiKey,
      name,
      description: description || '',
      key: apiKey,
      secret: crypto.randomBytes(32).toString('hex'),
      userId: decoded.userId,
      userRole: decoded.role,
      permissions: Array.isArray(permissions) ? permissions : [permissions],
      rateLimit: parseInt(rateLimit),
      status: 'active',
      createdAt: new Date().toISOString(),
      lastUsedAt: null,
      expiresAt: new Date(Date.now() + (365 * 24 * 60 * 60 * 1000)).toISOString(), // 1 year
      environment: environment || 'development',
      restrictions: restrictions || {}
    };

    apiKeysDatabase[apiKey] = newApiKey;

    // Return API key (secret shown only once)
    return createApiResponse({
      id: newApiKey.id,
      name: newApiKey.name,
      description: newApiKey.description,
      key: newApiKey.key,
      secret: newApiKey.secret,
      permissions: newApiKey.permissions,
      rateLimit: newApiKey.rateLimit,
      status: newApiKey.status,
      createdAt: newApiKey.createdAt,
      expiresAt: newApiKey.expiresAt,
      environment: newApiKey.environment
    }, 201, { executionTime: 150 });

  } catch (error) {
    return createApiError('Failed to generate API key', 'GENERATION_FAILED', 500);
  }
}

// List API Keys
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    return createApiError('Authentication required', 'AUTH_REQUIRED', 401);
  }

  try {
    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Filter API keys by user
    const userApiKeys = Object.values(apiKeysDatabase).filter(key => 
      key.userId === decoded.userId
    ).map(key => ({
      id: key.id,
      name: key.name,
      description: key.description,
      permissions: key.permissions,
      rateLimit: key.rateLimit,
      status: key.status,
      createdAt: key.createdAt,
      lastUsedAt: key.lastUsedAt,
      expiresAt: key.expiresAt,
      environment: key.environment
    }));

    return createApiResponse(userApiKeys, 200, { 
      total: userApiKeys.length,
      executionTime: 80 
    });

  } catch (error) {
    return createApiError('Failed to retrieve API keys', 'RETRIEVAL_FAILED', 500);
  }
}