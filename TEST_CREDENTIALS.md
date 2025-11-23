# 🔐 OptiBid Energy Platform - Test Credentials

## ✅ System Status

### Services Running:
- ✅ **Backend API**: http://localhost:8000
- ✅ **Frontend Dashboard**: http://localhost:3000  
- ✅ **PostgreSQL Database**: localhost:5432 (Docker)
- ⚠️ **Redis**: Not running (optional - for caching)
- ⚠️ **Kafka**: Not running (optional - for real-time streaming)
- ⚠️ **ClickHouse**: Not running (optional - for analytics)

### Dependencies Status:
- ✅ Backend Python dependencies installed
- ✅ Frontend Node.js dependencies installed
- ✅ Database schema created
- ✅ Test users seeded

---

## 👥 Test User Accounts

All test users belong to **"Test Organization"** with enterprise-level access.

### 1. Admin Account (Full Access)
```
Email: admin@optibid.com
Password: admin123
Role: admin
Access: Full system administration, user management, all features
```

### 2. Trader Account
```
Email: trader@optibid.com
Password: trader123
Role: trader
Access: Bid creation, trading operations, market data
```

### 3. Analyst Account
```
Email: analyst@optibid.com
Password: analyst123
Role: analyst
Access: Analytics, reports, dashboards, read-only trading data
```

### 4. Viewer Account
```
Email: viewer@optibid.com
Password: viewer123
Role: viewer
Access: Read-only access to dashboards and reports
```

---

## 🚀 Quick Start

### 1. Access the Platform

**Frontend Dashboard:**
```
http://localhost:3000
```

**Backend API Documentation:**
```
http://localhost:8000/api/docs
```

**Health Check:**
```
http://localhost:8000/health
```

### 2. Login Process

1. Open http://localhost:3000 in your browser
2. Click "Login" or navigate to http://localhost:3000/auth/login
3. Enter one of the test credentials above
4. You'll be redirected to the dashboard

### 3. Test API Directly

**Login via API:**
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@optibid.com",
    "password": "admin123"
  }'
```

**Response:**
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer",
  "expires_in": 1800,
  "user": {
    "id": "...",
    "email": "admin@optibid.com",
    "role": "admin",
    ...
  }
}
```

---

## 📊 Available Features by Role

### Admin Features:
- ✅ User management (create, edit, delete users)
- ✅ Organization settings
- ✅ System configuration
- ✅ All trader and analyst features
- ✅ Audit logs and compliance reports
- ✅ Billing and subscription management

### Trader Features:
- ✅ Create and submit bids
- ✅ Manage assets (solar, wind, storage)
- ✅ View market prices and trends
- ✅ Portfolio management
- ✅ Real-time market data
- ✅ Trading dashboard

### Analyst Features:
- ✅ View all dashboards
- ✅ Generate reports
- ✅ Analytics and forecasting
- ✅ Market analysis
- ✅ Performance metrics
- ✅ Data visualization

### Viewer Features:
- ✅ View dashboards (read-only)
- ✅ View reports (read-only)
- ✅ Basic market data access

---

## 🔧 Troubleshooting

### Backend Not Starting?
```bash
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Not Starting?
```bash
cd frontend
npm run dev
```

### Database Connection Issues?
```bash
# Check if PostgreSQL is running
docker ps | findstr postgres

# Restart PostgreSQL
docker restart optibid-postgres
```

### Can't Login?
1. Verify backend is running: http://localhost:8000/health
2. Check browser console for errors (F12)
3. Verify credentials are correct (case-sensitive)
4. Try clearing browser cache/cookies

### Reset Test Users?
```bash
# Re-run the seed script
Get-Content backend/scripts/seed_simple.sql | docker exec -i optibid-postgres psql -U optibid -d optibid
```

---

## 📝 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - List users
- `GET /api/users/{id}` - Get user details
- `POST /api/users` - Create user (admin only)
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user (admin only)

### Organizations
- `GET /api/organizations` - List organizations
- `GET /api/organizations/{id}` - Get organization details
- `PUT /api/organizations/{id}` - Update organization

### Assets
- `GET /api/assets` - List assets
- `POST /api/assets` - Create asset
- `GET /api/assets/{id}` - Get asset details
- `PUT /api/assets/{id}` - Update asset
- `DELETE /api/assets/{id}` - Delete asset

### Bids
- `GET /api/bids` - List bids
- `POST /api/bids` - Create bid
- `GET /api/bids/{id}` - Get bid details
- `PUT /api/bids/{id}` - Update bid
- `DELETE /api/bids/{id}` - Delete bid

---

## 🎯 Next Steps

1. **Explore the Dashboard**: Login and navigate through different sections
2. **Create Test Data**: Add assets, create bids, explore features
3. **Test Different Roles**: Login with different accounts to see role-based access
4. **API Testing**: Use the Swagger docs at http://localhost:8000/api/docs
5. **Check Features**: Test all enabled features for each role

---

## 📞 Support

If you encounter any issues:
1. Check the backend logs in the terminal
2. Check the frontend logs in browser console (F12)
3. Verify all services are running
4. Check database connectivity

---

**Last Updated**: November 22, 2025
**Platform Version**: 1.0.0
**Status**: ✅ Ready for Testing
