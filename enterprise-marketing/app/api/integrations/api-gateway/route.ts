import { NextRequest, NextResponse } from 'next/server';
import { RateLimiterMemory, RateLimiterRedis } from 'rate-limiter-flexible';
import jwt from 'jsonwebtoken';

// Rate limiter configurations
const rateLimiterBasic = new RateLimiterMemory({
  points: 100, // Number of requests
  duration: 60, // Per 60 seconds by IP
});

const rateLimiterAuthenticated = new RateLimiterMemory({
  points: 1000, // Number of requests for authenticated users
  duration: 60, // Per 60 seconds
});

// API Gateway Middleware
export async function apiGateway(req: NextRequest) {
  const startTime = Date.now();
  const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
  const userAgent = req.headers.get('user-agent') || 'unknown';
  const authHeader = req.headers.get('authorization');
  
  let userId = 'anonymous';
  let userRole = 'anonymous';
  let rateLimitPoints = 100;
  
  // JWT Authentication
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const token = authHeader.replace('Bearer ', '');
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      userId = decoded.userId;
      userRole = decoded.role;
      
      // Admin users get higher rate limits
      if (userRole === 'admin' || userRole === 'enterprise') {
        rateLimitPoints = 1000;
      }
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid authentication token', code: 'AUTH_INVALID_TOKEN' },
        { status: 401 }
      );
    }
  }
  
  // Apply rate limiting based on role and authentication
  try {
    const rateLimiter = userRole !== 'anonymous' ? rateLimiterAuthenticated : rateLimiterBasic;
    await rateLimiter.consume(clientIP, 1);
  } catch (rateLimiterRes) {
    const remainingPoints = rateLimiterRes.remainingPoints;
    const msBeforeNext = rateLimiterRes.msBeforeNext;
    
    return NextResponse.json(
      {
        error: 'Rate limit exceeded',
        code: 'RATE_LIMIT_EXCEEDED',
        resetTime: new Date(Date.now() + msBeforeNext).toISOString(),
        remaining: remainingPoints,
        limit: userRole !== 'anonymous' ? 1000 : 100
      },
      {
        status: 429,
        headers: {
          'Retry-After': Math.ceil(msBeforeNext / 1000).toString(),
          'X-RateLimit-Limit': userRole !== 'anonymous' ? '1000' : '100',
          'X-RateLimit-Remaining': remainingPoints.toString(),
          'X-RateLimit-Reset': new Date(Date.now() + msBeforeNext).toISOString(),
        }
      }
    );
  }
  
  // Security headers
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  response.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'");
  
  // Request logging for analytics
  const requestLog = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    userAgent,
    clientIP,
    userId,
    userRole,
    rateLimitPoints: rateLimiterBasic.points
  };
  
  // Add timing information to response
  const originalResponse = NextResponse.next();
  
  return new Response(originalResponse.body, {
    headers: {
      ...Object.fromEntries(originalResponse.headers.entries()),
      'X-Response-Time': `${Date.now() - startTime}ms`,
      'X-Request-ID': crypto.randomUUID(),
      'X-User-ID': userId,
      'X-User-Role': userRole,
    }
  });
}

// API Response formatting
export function createApiResponse(
  data: any,
  status: number = 200,
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    hasNext?: boolean;
    executionTime?: number;
  }
) {
  return NextResponse.json(
    {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        ...meta
      }
    },
    { status }
  );
}

// API Error response formatting
export function createApiError(
  error: string,
  code: string = 'API_ERROR',
  status: number = 400,
  details?: any
) {
  return NextResponse.json(
    {
      success: false,
      error: {
        message: error,
        code,
        details
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    },
    { status }
  );
}

// Health check endpoint
export async function GET(req: NextRequest) {
  const startTime = Date.now();
  
  // Check system status
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    executionTime: Date.now() - startTime
  };
  
  return createApiResponse(health, 200, { executionTime: Date.now() - startTime });
}

// API documentation endpoint
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Max-Age': '86400'
      }
    }
  );
}