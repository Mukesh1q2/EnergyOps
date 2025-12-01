# Dashboard Testing Guide - Quick Reference 🧪

## Quick Start Testing

### 1. Start Services

```bash
# Terminal 1: Backend
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2: Frontend
cd enterprise-marketing
npm run dev
```

**Expected**:
- Backend: `http://localhost:8000`
- Frontend: `http://localhost:3000`
- API Docs: `http://localhost:8000/api/docs`

---

## 🧪 Test Checklist

### ✅ Test 1: Dashboard Loads (30 seconds)

1. Navigate to `http://localhost:3000/dashboard`
2. Login if required
3. **Expected**: Dashboard loads with 3 default widgets
4. **Expected**: No console errors

**Pass Criteria**:
- ✅ Page loads in < 2 seconds
- ✅ 3 widgets visible (Energy Chart, Market Prices, Asset Grid)
- ✅ No red errors in console

---

### ✅ Test 2: Widget Library (1 minute)

1. Click **"+"** button in dashboard header
2. **Expected**: Widget Library modal opens
3. **Expected**: See 8 categories
4. **Expected**: See at least 8 widgets

**Categories to Verify**:
- Analytics & Charts
- KPI Metrics
- Real-time Data
- Geographic
- Financial
- Team & Collaboration
- Reports
- Energy Specific

**Pass Criteria**:
- ✅ Modal opens without errors
- ✅ All 8 categories visible
- ✅ Widgets display with names and descriptions
- ✅ Search box works
- ✅ Category filters work

---

### ✅ Test 3: Add Widget (1 minute)

1. In Widget Library, click **"Energy Generation Chart"**
2. **Expected**: Configuration panel opens on right
3. Configure settings:
   - Data Source: "all"
   - Time Range: "24h"
   - Aggregation: "sum"
4. Click **"Add Widget"**
5. **Expected**: Widget appears on dashboard
6. **Expected**: Modal closes

**Pass Criteria**:
- ✅ Configuration panel opens
- ✅ Can change settings
- ✅ Widget appears on dashboard
- ✅ Widget renders correctly with chart

---

### ✅ Test 4: Drag & Drop (30 seconds)

1. Hover over any widget
2. Click and drag widget to new position
3. **Expected**: Widget moves smoothly
4. Release mouse
5. **Expected**: Widget stays in new position

**Pass Criteria**:
- ✅ Can drag widgets
- ✅ Grid snaps to positions
- ✅ Other widgets adjust
- ✅ No layout breaks

---

### ✅ Test 5: Settings Persistence (2 minutes)

1. Click **gear icon** in dashboard
2. Go to **"General"** tab
3. Change:
   - Dashboard Name: "Test Dashboard"
   - Auto Refresh: "1m"
4. Go to **"Appearance"** tab
5. Change:
   - Theme: "Dark"
6. Click **"Save Changes"**
7. **Expected**: Modal closes
8. **Refresh browser page** (F5)
9. **Expected**: Dashboard name is "Test Dashboard"
10. **Expected**: Theme is dark
11. Open settings again
12. **Expected**: Auto Refresh shows "1m"

**Pass Criteria**:
- ✅ Settings modal opens
- ✅ Can change all settings
- ✅ Save button works
- ✅ Settings persist after reload
- ✅ Theme changes immediately

---

### ✅ Test 6: Auto-Refresh (2 minutes)

1. Open browser console (F12)
2. Look for message: `Auto-refresh enabled: 1m (60000ms)`
3. Wait 1 minute
4. **Expected**: See message: `Auto-refreshing dashboard data...`
5. **Expected**: Dashboard data refreshes

**Pass Criteria**:
- ✅ Console shows auto-refresh enabled
- ✅ Refresh happens automatically
- ✅ No errors during refresh
- ✅ Widgets update smoothly

**To Disable**:
- Settings → General → Auto Refresh: "Never"

---

### ✅ Test 7: Share Dashboard (1 minute)

1. Click **"Share"** button
2. **Expected**: Share modal opens
3. Go to **"People"** tab
4. Enter email: `test@example.com`
5. Select permission: "Editor"
6. Click **"Invite"**
7. **Expected**: User appears in list
8. Go to **"Share Links"** tab
9. Enter link name: "Test Link"
10. Click **"Create Link"**
11. **Expected**: Link appears in list
12. Click **"Done"**

**Pass Criteria**:
- ✅ Modal opens without errors
- ✅ Can invite users
- ✅ Can create share links
- ✅ All tabs work
- ✅ Modal closes properly

---

### ✅ Test 8: Team Collaboration (1 minute)

1. Click **"Team"** icon in header
2. **Expected**: Collaboration panel opens
3. Go to **"Comments"** tab
4. Type comment: "Test comment"
5. Press Enter or click send
6. **Expected**: Comment appears
7. Go to **"Team"** tab
8. **Expected**: See team members
9. Go to **"Activity"** tab
10. **Expected**: See recent activities

**Pass Criteria**:
- ✅ Panel opens
- ✅ Can post comments
- ✅ Team members display
- ✅ Activity feed shows actions

---

### ✅ Test 9: Admin Pages (2 minutes)

**AI Admin Page**:
1. Navigate to `http://localhost:3000/admin/ai`
2. **Expected**: Page loads with AI models
3. **Expected**: See 5 models with stats
4. Click **"Models"** tab
5. **Expected**: Table with model details
6. Click **"Predictions"** tab
7. **Expected**: Recent predictions table

**Feature Flags Page**:
1. Navigate to `http://localhost:3000/admin/feature-flags`
2. **Expected**: Page loads with feature list
3. **Expected**: See stats cards
4. Try search: "dashboard"
5. **Expected**: Filters features
6. Click on a feature
7. **Expected**: Can view details

**Pass Criteria**:
- ✅ Both admin pages load
- ✅ Data displays correctly
- ✅ Tabs work
- ✅ Search/filter works
- ✅ No console errors

---

### ✅ Test 10: Backend APIs (2 minutes)

```bash
# Test 1: Default Widgets
curl http://localhost:8000/api/dashboard/widgets/default

# Expected: JSON with 3 default widgets

# Test 2: User Config
curl http://localhost:8000/api/dashboard/user-config

# Expected: JSON with dashboard configuration

# Test 3: Save Config
curl -X POST http://localhost:8000/api/dashboard/config \
  -H "Content-Type: application/json" \
  -d '{"dashboard_id":"test","settings":{"name":"API Test","theme":"dark"}}'

# Expected: {"success": true, "message": "Dashboard configuration saved successfully"}

# Test 4: AI Models
curl http://localhost:8000/api/ml/ai/models

# Expected: JSON with 5 AI models

# Test 5: Health Check
curl http://localhost:8000/health

# Expected: {"status": "healthy", ...}
```

**Pass Criteria**:
- ✅ All endpoints return 200 OK
- ✅ JSON responses are valid
- ✅ No 404 or 500 errors

---

## 🐛 Troubleshooting

### Issue: Dashboard Shows No Widgets

**Solution**:
1. Check console for errors
2. Verify backend is running on port 8000
3. Check API call: `curl http://localhost:8000/api/dashboard/widgets/default`
4. Clear browser cache and reload

### Issue: Settings Don't Persist

**Solution**:
1. Check console for API errors
2. Verify `/api/dashboard/config` endpoint exists
3. Test endpoint: `curl -X POST http://localhost:8000/api/dashboard/config -H "Content-Type: application/json" -d '{"settings":{}}'`
4. Check localStorage for auth token

### Issue: Widget Library Empty

**Solution**:
1. Check console for errors
2. Verify user permissions: `console.log(user?.permissions)`
3. Check if widgets are defined: `console.log(AVAILABLE_WIDGETS?.length)`
4. Should show 8 widgets

### Issue: Auto-Refresh Not Working

**Solution**:
1. Check console for: `Auto-refresh enabled: [interval]`
2. Verify settings: Dashboard Settings → General → Auto Refresh
3. Make sure it's not set to "Never"
4. Check for JavaScript errors

### Issue: Backend Not Starting

**Solution**:
```bash
# Check if port 8000 is in use
netstat -ano | findstr :8000

# Kill process if needed
taskkill /PID <PID> /F

# Restart backend
cd backend
uvicorn main:app --reload
```

### Issue: Frontend Not Starting

**Solution**:
```bash
# Check if port 3000 is in use
netstat -ano | findstr :3000

# Kill process if needed
taskkill /PID <PID> /F

# Clear cache and restart
cd enterprise-marketing
rm -rf .next
npm run dev
```

---

## ✅ Success Indicators

### Backend Healthy
- ✅ Server starts without errors
- ✅ Health check returns 200: `curl http://localhost:8000/health`
- ✅ API docs accessible: `http://localhost:8000/api/docs`
- ✅ All endpoints return valid JSON

### Frontend Healthy
- ✅ Development server starts
- ✅ Dashboard page loads
- ✅ No console errors (red text)
- ✅ Widgets display correctly
- ✅ All interactions work

### Integration Healthy
- ✅ Dashboard fetches data from backend
- ✅ API calls succeed (200 status)
- ✅ Settings persist
- ✅ Auto-refresh works
- ✅ All features functional

---

## 📊 Test Results Template

```
DASHBOARD TESTING RESULTS
Date: ___________
Tester: ___________

[ ] Test 1: Dashboard Loads
[ ] Test 2: Widget Library
[ ] Test 3: Add Widget
[ ] Test 4: Drag & Drop
[ ] Test 5: Settings Persistence
[ ] Test 6: Auto-Refresh
[ ] Test 7: Share Dashboard
[ ] Test 8: Team Collaboration
[ ] Test 9: Admin Pages
[ ] Test 10: Backend APIs

Issues Found:
_______________________________
_______________________________
_______________________________

Overall Status: [ ] PASS  [ ] FAIL
Notes:
_______________________________
_______________________________
```

---

## 🎯 Quick Verification (30 seconds)

**Fastest way to verify everything works**:

1. Open `http://localhost:3000/dashboard`
2. See 3 widgets? ✅
3. Click "+", see widgets? ✅
4. Add a widget, appears? ✅
5. Open console, no errors? ✅
6. See "Auto-refresh enabled"? ✅

**If all ✅**: Dashboard is working perfectly!

---

**Testing Time**: ~15 minutes for complete test  
**Quick Test**: ~30 seconds  
**Status**: Ready for testing

