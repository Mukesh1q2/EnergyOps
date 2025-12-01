# 🚀 Quick Login Guide - OptiBid Energy

## ✅ SERVER IS NOW RUNNING!

**Server Status**: 🟢 Running  
**Port**: 3001  
**URL**: http://localhost:3001

---

## 🔐 LOGIN NOW

### Step 1: Open Your Browser
Navigate to: **http://localhost:3001/login**

### Step 2: Enter Credentials

**Admin Account**:
```
Email: admin@optibid.com
Password: admin123
```

**Demo Account**:
```
Email: demo@optibid.com
Password: demo123
```

### Step 3: Click "Sign In"
You will be redirected to the dashboard at: http://localhost:3001/dashboard

---

## 🎯 IMPORTANT NOTES

### ⚠️ Port Number
- The server is running on **PORT 3001** (not 3000)
- Port 3000 was already in use by another process
- Always use: `http://localhost:3001`

### ✅ What Should Happen
1. Enter credentials → Click "Sign In"
2. See loading spinner briefly
3. Redirected to `/dashboard`
4. Dashboard loads with widgets
5. Session persists for 7 days

### ❌ If You Get 404 Error
The 404 error means you're trying to access the wrong port. Make sure you're using:
- ✅ **http://localhost:3001/login** (CORRECT)
- ❌ ~~http://localhost:3000/login~~ (WRONG - different app)

---

## 🔍 TROUBLESHOOTING

### Issue: Still Getting 404
**Solution**: Make sure you're using port 3001
```
✅ http://localhost:3001/login
❌ http://localhost:3000/login
```

### Issue: "Network Error"
**Solution**: Check if server is running
```bash
# In browser, visit:
http://localhost:3001

# Should see the OptiBid Energy homepage
```

### Issue: Server Not Running
**Solution**: Start the server
```bash
cd enterprise-marketing
npm run dev
```

### Issue: Need to Clear Browser Storage
**Solution**: Open browser console (F12) and run:
```javascript
localStorage.clear()
sessionStorage.clear()
```

---

## 📱 AVAILABLE PAGES

Once logged in, you can access:

### Main Pages
- **Home**: http://localhost:3001/
- **Login**: http://localhost:3001/login
- **Dashboard**: http://localhost:3001/dashboard
- **Demo**: http://localhost:3001/demo

### Feature Pages
- **India Energy Market**: http://localhost:3001/india-energy-market
- **AI Intelligence**: http://localhost:3001/ai-intelligence
- **Quantum Applications**: http://localhost:3001/quantum-applications
- **Advanced Analytics**: http://localhost:3001/advanced-analytics

### Resources
- **Documentation**: http://localhost:3001/docs
- **API Reference**: http://localhost:3001/api
- **Blog**: http://localhost:3001/blog
- **Case Studies**: http://localhost:3001/case-studies

### Admin (Admin account only)
- **Admin Dashboard**: http://localhost:3001/admin
- **Feature Flags**: http://localhost:3001/admin/feature-flags
- **AI Management**: http://localhost:3001/admin/ai

---

## 🎉 QUICK TEST

### 1. Test Homepage
Visit: http://localhost:3001
- Should see OptiBid Energy landing page
- Navigation bar at top
- Hero section with "Get Started" button

### 2. Test Login
Visit: http://localhost:3001/login
- Enter: `admin@optibid.com` / `admin123`
- Click "Sign In"
- Should redirect to dashboard

### 3. Test Dashboard
After login, you should see:
- Dashboard header with user info
- Widget library button
- Demo widgets (Energy Generation, Market Prices, Asset Status)
- Ability to add/edit/delete widgets

### 4. Test Navigation
Click around:
- Resources → Documentation
- Resources → API Reference
- Try Demo
- All links should work (no 404 errors)

---

## 🔧 SERVER COMMANDS

### Start Server
```bash
cd enterprise-marketing
npm run dev
```

### Stop Server
Press `Ctrl + C` in the terminal

### Build for Production
```bash
npm run build
npm start
```

### Check Server Status
Visit: http://localhost:3001
- If you see the homepage, server is running
- If you get "connection refused", server is not running

---

## 📊 SERVER INFO

**Current Status**:
```
✓ Next.js 14.2.33
✓ Ready in 16.8s
✓ Local: http://localhost:3001
✓ Environments: .env.local
```

**Port**: 3001 (3000 was in use)  
**Framework**: Next.js 14.2.33  
**Mode**: Development  
**Hot Reload**: Enabled

---

## ✅ VERIFICATION CHECKLIST

Before logging in, verify:
- [ ] Server is running (visit http://localhost:3001)
- [ ] You see the OptiBid Energy homepage
- [ ] Navigation bar is visible
- [ ] No console errors in browser DevTools

After logging in, verify:
- [ ] Redirected to /dashboard
- [ ] Dashboard loads without errors
- [ ] Can see widgets
- [ ] Can refresh page and stay logged in
- [ ] Session persists

---

## 🎯 READY TO LOGIN!

**Everything is set up and ready to go!**

1. Open browser: http://localhost:3001/login
2. Enter: `admin@optibid.com` / `admin123`
3. Click "Sign In"
4. Enjoy your dashboard!

**Session Duration**: 7 days  
**Auto-Refresh**: Enabled  
**Status**: ✅ All systems operational

---

**Server Started**: December 1, 2025  
**Port**: 3001  
**Status**: 🟢 Running  
**Ready**: ✅ Yes
