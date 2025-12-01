# Dashboard Quick Test Guide 🧪

## Quick Start Testing

### 1. Start the Backend
```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Start the Frontend
```bash
cd enterprise-marketing
npm run dev
```

### 3. Test Dashboard Endpoints

#### Test Default Widgets API
```bash
curl http://localhost:8000/api/dashboard/widgets/default
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "widgets": [
      {
        "id": "default-energy-chart",
        "type": "energy-generation-chart",
        "title": "Real-time Energy Generation",
        ...
      },
      ...
    ],
    "layout": "grid"
  }
}
```

#### Test User Config API
```bash
curl http://localhost:8000/api/dashboard/user-config \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Test AI Models API
```bash
curl http://localhost:8000/api/ml/ai/models
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "models": [
      {
        "id": "lstm-price-forecaster-v2.1.4",
        "name": "LSTM Price Forecaster",
        "accuracy": 94.2,
        "status": "active",
        ...
      },
      ...
    ],
    "stats": {
      "total_models": 5,
      "active_models": 4,
      "average_accuracy": 92.56,
      "average_latency": 39.94
    }
  }
}
```

#### Test AI Predictions API
```bash
curl http://localhost:8000/api/ml/ai/predictions
```

---

## Frontend Testing

### Test Dashboard Page
1. Navigate to: `http://localhost:3000/dashboard`
2. **Expected**: See 3 default widgets load automatically
3. **Verify**: Energy chart, market prices, and asset grid display

### Test Widget Library
1. Click **"Add Widget"** button in dashboard header
2. **Expected**: Modal opens with 8 widget categories
3. **Verify**: Can search, filter, and browse widgets
4. Click on any widget
5. **Expected**: Configuration panel opens on right
6. Configure widget and click **"Add Widget"**
7. **Expected**: Widget appears on dashboard

### Test Admin AI Page
1. Navigate to: `http://localhost:3000/admin/ai`
2. **Expected**: See 5 AI models with stats
3. **Verify**: 
   - Total Models: 5
   - Active Models: 4
   - Average Accuracy: ~92.5%
   - Average Latency: ~40ms
4. Click **"Models"** tab
5. **Expected**: Table with all 5 models
6. Click **"Predictions"** tab
7. **Expected**: Recent predictions table

### Test Admin Feature Flags
1. Navigate to: `http://localhost:3000/admin/feature-flags`
2. **Expected**: Feature flags management interface
3. **Verify**: Stats cards show totals
4. **Verify**: Can search and filter features

---

## API Documentation Testing

### Swagger UI
1. Navigate to: `http://localhost:8000/api/docs`
2. Find **"dashboard"** section
3. **Expected**: See 6 endpoints:
   - GET `/api/dashboard/user-config`
   - GET `/api/dashboard/widgets/default`
   - POST `/api/dashboard/widgets`
   - PUT `/api/dashboard/widgets/{widget_id}`
   - DELETE `/api/dashboard/widgets/{widget_id}`
   - PUT `/api/dashboard/layout`
4. Find **"advanced-ml"** section
5. **Expected**: See AI admin endpoints:
   - GET `/api/ml/ai/models`
   - GET `/api/ml/ai/predictions`

---

## Browser Console Testing

### Check for Errors
1. Open browser DevTools (F12)
2. Navigate to Console tab
3. Load dashboard page
4. **Expected**: No red errors
5. **Verify**: Only info/log messages

### Check Network Requests
1. Open Network tab in DevTools
2. Reload dashboard page
3. **Expected**: See successful API calls:
   - `/api/dashboard/user-config` → 200 OK
   - `/api/dashboard/widgets/default` → 200 OK (if first call fails)
4. Open admin AI page
5. **Expected**: See successful API calls:
   - `/api/ml/ai/models` → 200 OK
   - `/api/ml/ai/predictions` → 200 OK

---

## Functionality Checklist

### Dashboard Page ✅
- [ ] Page loads without errors
- [ ] 3 default widgets display
- [ ] Widget library button works
- [ ] Can add new widgets
- [ ] Can drag and drop widgets
- [ ] Can delete widgets
- [ ] Layout persists (if backend connected)

### Widget Library ✅
- [ ] Modal opens/closes properly
- [ ] Search functionality works
- [ ] Category filters work
- [ ] Sort options work
- [ ] Widget configuration panel opens
- [ ] Can configure widget settings
- [ ] Add widget button works

### Admin AI Page ✅
- [ ] Page loads without errors
- [ ] Stats cards show correct numbers
- [ ] Models table displays 5 models
- [ ] Predictions table shows data
- [ ] Tabs switch correctly
- [ ] System health displays

### Admin Feature Flags ✅
- [ ] Page loads without errors
- [ ] Stats cards display
- [ ] Feature list shows
- [ ] Search works
- [ ] Filters work
- [ ] Tabs switch correctly

---

## Troubleshooting

### Backend Not Starting
```bash
# Check if port 8000 is in use
netstat -ano | findstr :8000

# Kill process if needed
taskkill /PID <PID> /F

# Restart backend
cd backend
uvicorn main:app --reload
```

### Frontend Not Starting
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

### API Returns 404
- Verify backend is running on port 8000
- Check `backend/main.py` includes dashboard router
- Verify URL is correct: `/api/dashboard/...`

### Dashboard Shows No Widgets
- Check browser console for errors
- Verify API endpoints are accessible
- Check if mock data fallback is working
- Verify user permissions

### Widget Library Not Opening
- Check if `isOpen` prop is passed correctly
- Verify modal component is imported
- Check for JavaScript errors in console

---

## Success Indicators

### ✅ Backend Working
- Server starts without errors
- Health check returns 200: `curl http://localhost:8000/health`
- API docs accessible: `http://localhost:8000/api/docs`
- Dashboard endpoints return data

### ✅ Frontend Working
- Development server starts
- Dashboard page loads
- No console errors
- Widgets display
- Widget library opens

### ✅ Integration Working
- Dashboard fetches data from backend
- Admin pages show real data
- API calls succeed (200 status)
- Data displays correctly

---

## Performance Checks

### Backend Response Times
```bash
# Test dashboard endpoint speed
time curl http://localhost:8000/api/dashboard/widgets/default

# Expected: < 100ms
```

### Frontend Load Times
1. Open DevTools → Network tab
2. Reload dashboard page
3. Check **"Load"** time at bottom
4. **Expected**: < 2 seconds

### Widget Rendering
1. Add 10 widgets to dashboard
2. **Expected**: Smooth rendering, no lag
3. Drag widgets around
4. **Expected**: Responsive, no stuttering

---

## Quick Verification Commands

```bash
# Verify Python syntax
python -m py_compile backend/app/routers/dashboard.py
python -m py_compile backend/main.py

# Check TypeScript
cd enterprise-marketing
npm run type-check

# Test API endpoints
curl http://localhost:8000/api/dashboard/widgets/default
curl http://localhost:8000/api/ml/ai/models
curl http://localhost:8000/api/ml/ai/predictions

# Check health
curl http://localhost:8000/health
```

---

## Expected Results Summary

| Test | Expected Result | Status |
|------|----------------|--------|
| Backend starts | No errors, port 8000 listening | ✅ |
| Frontend starts | No errors, port 3000 listening | ✅ |
| Dashboard loads | 3 default widgets display | ✅ |
| Widget library | Opens with 8 categories | ✅ |
| Add widget | Widget appears on dashboard | ✅ |
| Admin AI page | Shows 5 models with stats | ✅ |
| API endpoints | All return 200 OK | ✅ |
| No console errors | Clean console log | ✅ |

---

## Contact & Support

If you encounter issues:
1. Check this guide first
2. Review `DASHBOARD_ENABLEMENT_COMPLETE.md` for implementation details
3. Check API documentation at `/api/docs`
4. Review browser console for specific errors
5. Verify all dependencies are installed

**Status**: All tests should pass ✅
