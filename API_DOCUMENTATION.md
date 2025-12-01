# OptiBid Energy Platform - API Documentation

**Version:** 1.0  
**Date:** 2025-11-21 18:31:50  
**Base URL:** `https://optibid-energy.com/api/v1`  

---

## 🎯 Overview

The OptiBid Energy Platform API provides comprehensive endpoints for energy trading, user management, authentication, and real-time data integration. All endpoints follow RESTful conventions and include comprehensive error handling.

### 🔐 Authentication

All API endpoints (except public endpoints) require authentication via JWT tokens or API keys.

**Headers Required:**
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
X-API-Version: 1.0
```

### 📊 Rate Limiting

- **Default Limit:** 100 requests per 15 minutes per user
- **Authentication endpoints:** 5 requests per minute
- **Trading endpoints:** 60 requests per minute
- **Public endpoints:** 1000 requests per hour

**Rate Limit Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

---

## 🔑 Authentication Endpoints

### POST `/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "phone": "+1234567890",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "organizationId": "org_123"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "isVerified": false
    },
    "verificationSent": true
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": {
      "email": "Email format is invalid"
    }
  }
}
```

### POST `/auth/login`

Authenticate user and receive JWT tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "organizationId": "org_123",
      "permissions": ["read", "write", "admin"]
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
      "expiresIn": 3600
    }
  }
}
```

### POST `/auth/verify-email`

Verify user email address.

**Request Body:**
```json
{
  "token": "verification_token_here",
  "userId": "user_123"
}
```

### POST `/auth/forgot-password`

Request password reset email.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

### POST `/auth/reset-password`

Reset password with token.

**Request Body:**
```json
{
  "token": "reset_token_here",
  "newPassword": "NewSecurePass123!",
  "userId": "user_123"
}
```

### POST `/auth/mfa/verify`

Verify multi-factor authentication code.

**Request Body:**
```json
{
  "userId": "user_123",
  "code": "123456"
}
```

---

## 👤 User Management Endpoints

### GET `/users/profile`

Get current user profile.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "organizationId": "org_123",
    "isVerified": true,
    "lastLogin": "2025-11-21T18:31:50Z",
    "preferences": {
      "timezone": "UTC",
      "notifications": {
        "email": true,
        "sms": false,
        "push": true
      }
    }
  }
}
```

### PUT `/users/profile`

Update user profile.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "preferences": {
    "timezone": "UTC",
    "notifications": {
      "email": true,
      "sms": false,
      "push": true
    }
  }
}
```

### PUT `/users/password`

Change user password.

**Request Body:**
```json
{
  "currentPassword": "CurrentPass123!",
  "newPassword": "NewSecurePass123!",
  "confirmPassword": "NewSecurePass123!"
}
```

### POST `/users/mfa/setup`

Setup multi-factor authentication.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgA...",
    "secret": "JBSWY3DPEHPK3PXP",
    "backupCodes": [
      "123456",
      "789012",
      "345678"
    ]
  }
}
```

---

## 🏢 Organization Endpoints

### GET `/organizations`

List organizations (admin only).

**Query Parameters:**
```
limit: number (default: 20, max: 100)
offset: number (default: 0)
search: string (optional)
status: 'active' | 'inactive' | 'suspended' (optional)
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "organizations": [
      {
        "id": "org_123",
        "name": "Acme Energy Corp",
        "status": "active",
        "subscription": "enterprise",
        "memberCount": 50,
        "createdAt": "2025-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "total": 100,
      "limit": 20,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

### GET `/organizations/:id`

Get organization details.

### POST `/organizations`

Create new organization (admin only).

**Request Body:**
```json
{
  "name": "New Energy Corp",
  "subscription": "pro",
  "settings": {
    "allowRegistration": true,
    "requireMFA": true,
    "maxUsers": 100
  }
}
```

### PUT `/organizations/:id`

Update organization settings.

---

## 📊 Energy Trading Endpoints

### GET `/trading/markets`

Get available energy markets.

**Query Parameters:**
```
region: string (optional)
energyType: 'solar' | 'wind' | 'hydro' | 'gas' | 'coal' (optional)
timeframe: 'hourly' | 'daily' | 'weekly' | 'monthly' (optional)
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "markets": [
      {
        "id": "market_123",
        "name": "California ISO",
        "region": "CA",
        "energyType": "solar",
        "currentPrice": 0.089,
        "currency": "USD",
        "unit": "kWh",
        "lastUpdated": "2025-11-21T18:30:00Z"
      }
    ]
  }
}
```

### POST `/trading/orders`

Create new trading order.

**Request Body:**
```json
{
  "marketId": "market_123",
  "orderType": "limit",
  "side": "buy",
  "quantity": 1000,
  "price": 0.085,
  "validity": "GTC",
  "metadata": {
    "contractId": "cont_123"
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "order_123",
      "status": "pending",
      "filledQuantity": 0,
      "remainingQuantity": 1000,
      "averagePrice": 0.085,
      "createdAt": "2025-11-21T18:31:50Z"
    }
  }
}
```

### GET `/trading/orders`

Get user's trading orders.

**Query Parameters:**
```
status: 'pending' | 'filled' | 'cancelled' (optional)
limit: number (default: 20, max: 100)
offset: number (default: 0)
```

### GET `/trading/positions`

Get current trading positions.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "positions": [
      {
        "marketId": "market_123",
        "marketName": "California ISO",
        "quantity": 500,
        "averagePrice": 0.082,
        "unrealizedPnL": 15.50,
        "realizedPnL": 0,
        "lastUpdated": "2025-11-21T18:31:50Z"
      }
    ]
  }
}
```

### GET `/trading/portfolio`

Get portfolio summary.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalValue": 85000.00,
      "totalPnL": 1250.50,
      "dailyChange": 1.25,
      "positions": 5,
      "marginUsed": 5000.00,
      "marginAvailable": 45000.00
    }
  }
}
```

---

## 📈 Analytics Endpoints

### GET `/analytics/performance`

Get trading performance analytics.

**Query Parameters:**
```
period: 'day' | 'week' | 'month' | 'year' (default: month)
startDate: ISO 8601 date (optional)
endDate: ISO 8601 date (optional)
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "performance": {
      "totalReturn": 1250.50,
      "returnPercentage": 1.25,
      "sharpeRatio": 1.8,
      "maxDrawdown": -0.05,
      "volatility": 0.12,
      "winRate": 0.65,
      "profitFactor": 1.4,
      "tradesCount": 45,
      "averageWin": 85.30,
      "averageLoss": -42.15
    },
    "timeSeries": [
      {
        "date": "2025-11-01",
        "value": 1000.00,
        "return": 0
      }
    ]
  }
}
```

### GET `/analytics/risk`

Get risk metrics.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "riskMetrics": {
      "valueAtRisk": 2500.00,
      "expectedShortfall": 3500.00,
      "beta": 0.8,
      "correlation": 0.6,
      "concentration": {
        "maxPosition": 0.25,
        "herfindahlIndex": 0.15
      }
    }
  }
}
```

---

## 🔔 Notifications Endpoints

### GET `/notifications`

Get user notifications.

**Query Parameters:**
```
unreadOnly: boolean (default: false)
limit: number (default: 20, max: 100)
offset: number (default: 0)
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notif_123",
        "type": "trade_executed",
        "title": "Trade Executed",
        "message": "Your order for 1000 kWh has been executed",
        "read": false,
        "createdAt": "2025-11-21T18:30:00Z",
        "data": {
          "orderId": "order_123",
          "marketId": "market_123"
        }
      }
    ],
    "unreadCount": 3
  }
}
```

### PUT `/notifications/:id/read`

Mark notification as read.

### PUT `/notifications/read-all`

Mark all notifications as read.

---

## 🌐 Real-Time Data Endpoints

### WebSocket `/ws/market-data`

Real-time market data stream.

**Connection URL:**
```
wss://optibid-energy.com/ws/market-data?token=<jwt-token>
```

**Message Format:**
```json
{
  "type": "market_data",
  "data": {
    "marketId": "market_123",
    "price": 0.089,
    "volume": 15000,
    "change": 0.02,
    "timestamp": "2025-11-21T18:31:50Z"
  }
}
```

### WebSocket `/ws/trades`

Real-time trade updates.

**Message Format:**
```json
{
  "type": "trade_update",
  "data": {
    "orderId": "order_123",
    "status": "filled",
    "filledQuantity": 1000,
    "averagePrice": 0.085,
    "timestamp": "2025-11-21T18:31:50Z"
  }
}
```

---

## 📊 System Endpoints

### GET `/health`

Health check endpoint.

**Response (200):**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-21T18:31:50Z",
  "version": "1.0.0",
  "uptime": 3600,
  "checks": {
    "database": "healthy",
    "redis": "healthy",
    "external_apis": "healthy"
  }
}
```

### GET `/metrics`

System metrics (admin only).

**Response (200):**
```json
{
  "success": true,
  "data": {
    "system": {
      "cpu": 45.2,
      "memory": 68.5,
      "disk": 23.1
    },
    "application": {
      "activeUsers": 1250,
      "apiCalls": 45670,
      "responseTime": 156,
      "errorRate": 0.02
    }
  }
}
```

---

## 🚨 Error Handling

### Standard Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {
      "field": "Additional error details"
    },
    "requestId": "req_123"
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `RATE_LIMITED` | 429 | Rate limit exceeded |
| `INTERNAL_ERROR` | 500 | Internal server error |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable |

---

## 🔄 API Versioning

### Version Header
```
X-API-Version: 1.0
```

### Deprecation Policy
- **Current Version:** 1.0
- **Deprecation Notice:** 90 days before retirement
- **Support Period:** 2 years from release
- **Migration Guide:** Provided for each version update

---

## 📝 API Usage Examples

### cURL Examples

```bash
# Register user
curl -X POST https://optibid-energy.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe"
  }'

# Get portfolio
curl -X GET https://optibid-energy.com/api/v1/trading/portfolio \
  -H "Authorization: Bearer <jwt-token>"

# Create trading order
curl -X POST https://optibid-energy.com/api/v1/trading/orders \
  -H "Authorization: Bearer <jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "marketId": "market_123",
    "orderType": "limit",
    "side": "buy",
    "quantity": 1000,
    "price": 0.085
  }'
```

### JavaScript Examples

```javascript
// Login and get token
const loginResponse = await fetch('/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
const { data } = await loginResponse.json();
const token = data.tokens.accessToken;

// Make authenticated request
const portfolioResponse = await fetch('/api/v1/trading/portfolio', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const portfolio = await portfolioResponse.json();
```

---

**Document Version:** 1.0  
**Last Updated:** 2025-11-21 18:31:50  
**Base URL:** `https://optibid-energy.com/api/v1`  
**Authentication:** JWT Bearer Token  
**Rate Limiting:** 100 requests per 15 minutes  

**Support:** For API support, contact: api-support@optibid-energy.com