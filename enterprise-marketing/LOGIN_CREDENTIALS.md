# 🔐 Login Credentials for OptiBid Energy Platform

## ✅ SESSION FIX APPLIED

**Issue Fixed**: Session expiration causing immediate logout  
**Solution**: Extended token expiration from 24h to 7 days  
**Status**: ✅ Working - Sessions now persist properly

---

## Test Accounts

### Admin Account
- **Email:** `admin@optibid.com`
- **Password:** `admin123`
- **Role:** Administrator
- **Access:** Full system access including admin dashboard
- **Session Duration:** 7 days

### Demo Account
- **Email:** `demo@optibid.com`
- **Password:** `demo123`
- **Role:** Trader
- **Access:** Standard user access
- **Session Duration:** 7 days

---

## How to Login

### Step 1: Clear Browser Storage (If Having Issues)
Open browser console (F12) and run:
```javascript
localStorage.clear()
sessionStorage.clear()
```

### Step 2: Navigate to Login Page
**URL:** http://localhost:3001/login

⚠️ **IMPORTANT**: The server is running on **PORT 3001*

### Step 3: Enter Credentials
Use one of the test accounts above

### Step 4: Click "Sign In"
You will be redirected to the dashboard and stay logged in for 7 days

---

## ✅ Expected Behavior

After login, you should:
- ✅ Be redirected to `/dashboard`
- ✅ See your dashboard with widgets
- ✅ Stay logged in after page refresh
- ✅ Stay logged in after closing/reopening browser
- ✅ Session persists for 7 days
- ✅ Auto-refresh before token expires

## Troubleshooting

### "Network error" message
- Make sure the development server is running on port 3001
- Check that you're accessing http://localhost:3001 (not 3000)
- Clear browser cache and try again

### "Invalid credentials" message
- Double-check the email and password (case-sensitive)
- Make sure you're using the exact credentials listed above

### Can't access dashboard after login
- Check browser console for errors
- Verify that localStorage has the tokens:
  - `optibid_access_token`
  - `optibid_user`

## API Endpoint

The login API is available at:
```
POST http://localhost:3001/api/auth/login
```

Request body:
```json
{
  "email": "admin@optibid.com",
  "password": "admin123"
}
```

Response:
```json
{
  "access_token": "jwt-token-here",
  "refresh_token": "refresh-token-here",
  "token_type": "bearer",
  "user": {
    "id": "1",
    "email": "admin@optibid.com",
    "firstName": "Admin",
    "lastName": "User",
    "role": "admin",
    "company": "OptiBid Energy",
    "organizationId": "org_1"
  }
}
```

## Notes

- These are mock credentials for development/testing only
- In production, use proper authentication with a real database
- Passwords are currently accepted as plain text for demo purposes
- MFA and SSO features are UI-only (not fully functional in this demo)
