# 🚀 OptiBid Energy Platform - Quick Start Guide

## ✅ Services Running

Both services are now running successfully:

- **Frontend**: http://localhost:3000 ✓
- **Backend API**: http://localhost:8000 ✓
- **API Docs**: http://localhost:8000/api/docs ✓
- **Database**: PostgreSQL on localhost:5432 ✓

---

## 🔐 Demo Account Credentials

Use these credentials to login at http://localhost:3000/auth/login:

### Admin Account (Full Access)
- **Email**: `admin@optibid.com`
- **Password**: `admin123`
- **Role**: Administrator
- **Access**: Full system administration, user management, all features

### Energy Trader Account
- **Email**: `trader@optibid.com`
- **Password**: `trader123`
- **Role**: Trader
- **Access**: Bid creation, trading operations, market data

### Portfolio Manager / Analyst Account
- **Email**: `analyst@optibid.com`
- **Password**: `analyst123`
- **Role**: Analyst
- **Access**: Analytics, reports, dashboards, read-only trading data

### Viewer Account
- **Email**: `viewer@optibid.com`
- **Password**: `viewer123`
- **Role**: Viewer
- **Access**: Read-only access to dashboards and reports

---

## 📝 Important Notes

1. **Password Requirements**: Passwords must be at least 8 characters long
2. **Landing Page**: Visit http://localhost:3000 to see the landing page with quick links
3. **Login Page**: http://localhost:3000/auth/login
4. **Dashboard**: After login, you'll be redirected to the dashboard

---

## 🔧 Troubleshooting

### If login fails:
1. Make sure you're using the correct email and password (case-sensitive)
2. Password must be at least 8 characters
3. Check browser console (F12) for detailed error messages
4. Verify backend is running: http://localhost:8000/api/docs

### If you see a blank page:
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+F5)
3. Try a different browser

### To restart services:
```bash
# Backend (from project root)
cd backend
python main.py

# Frontend (from project root)
cd frontend
npm run dev
```

---

## 🎯 Next Steps

1. **Visit Landing Page**: http://localhost:3000
2. **Login**: Click "Login to Dashboard" or go to http://localhost:3000/auth/login
3. **Use Demo Credentials**: Try any of the accounts above
4. **Explore Dashboard**: Navigate through different features based on your role
5. **API Testing**: Visit http://localhost:8000/api/docs for interactive API documentation

---

**Status**: ✅ All systems operational
**Last Updated**: November 25, 2025
