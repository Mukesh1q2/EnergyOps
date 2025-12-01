# OptiBid Energy Platform - Complete Setup Guide

## ⚠️ IMPORTANT: Use Only enterprise-marketing Folder

**CRITICAL**: This project uses `/workspace/enterprise-marketing/` as the main application. Do NOT use the `/workspace/frontend/` folder - it's legacy/backup and will cause confusion.

## 📁 Project Structure
```
/workspace/
├── enterprise-marketing/          # 🎯 MAIN APPLICATION (USE THIS)
│   ├── app/                       # Next.js App Router pages
│   │   ├── page.tsx              # Landing page
│   │   ├── india-energy-market/  # India Energy Market dashboard
│   │   ├── dashboard/            # Main dashboard
│   │   ├── ai-intelligence/      # AI/ML features
│   │   └── ...other pages
│   ├── components/               # React components
│   ├── lib/                      # Core libraries & data sources
│   └── package.json             # Dependencies
├── frontend/                     # ⚠️ LEGACY/BACKUP (IGNORE)
└── enable-live-data.sh          # Deployment script
```

## 🔧 Step-by-Step Setup Instructions

### Step 1: Clean Up Project Structure

```bash
# Navigate to workspace
cd /workspace

# Rename frontend folder to avoid confusion
mv frontend frontend-legacy-backup

# Verify structure
ls -la
# Should show: enterprise-marketing/ (main app) and frontend-legacy-backup/ (old)
```

### Step 2: Navigate to Main Application

```bash
# Enter the correct application directory
cd enterprise-marketing

# Verify you're in the right place
pwd
# Should output: /workspace/enterprise-marketing
```

### Step 3: Install Dependencies

```bash
# Install all required packages
npm install

# Verify installation (should show node_modules created)
ls -la | grep node_modules
```

### Step 4: Environment Configuration

```bash
# Check if .env.production exists
ls -la .env*

# If .env.production doesn't exist, create it
cp .env.example .env.production

# Edit environment variables (optional - defaults work fine)
nano .env.production
```

**Key Environment Variables in .env.production:**
```bash
# Enable free data sources
NEXT_PUBLIC_FREE_DATA_ENABLED=true

# IEX India integration
NEXT_PUBLIC_IEX_INDIA_ENABLED=true
NEXT_PUBLIC_IEX_INDIA_URL=https://iexindia.com
NEXT_PUBLIC_NPP_URL=https://npp.gov.in
NEXT_PUBLIC_POSOCO_URL=https://grid-india.in

# Data refresh intervals (milliseconds)
NEXT_PUBLIC_DATA_REFRESH_INTERVAL=300000
```

### Step 5: Run Database Setup (Optional)

```bash
# If you have database migration scripts
chmod +x db/complete-migration.sh
./db/complete-migration.sh

# Verify migration status
ls -la db/migration_logs/
```

### Step 6: Start Development Server

```bash
# Start the development server
npm run dev

# Server will start on: http://localhost:3000
# You should see: "Local: http://localhost:3000"
```

### Step 7: Test Different Application Sections

Open new terminal tabs and test these URLs:

#### **Landing Page**
```
http://localhost:3000/
```
**Expected**: Professional enterprise landing page with:
- OptiBid Energy branding
- Hero section
- Solutions section
- Features showcase
- NO login/signup forms on homepage

#### **India Energy Market Dashboard**
```
http://localhost:3000/india-energy-market
```
**Expected**: Comprehensive dashboard with:
- 5-tab navigation (Market Overview, Geographic View, Renewables, Suppliers, Analytics)
- Real-time data from IEX India
- Interactive charts and visualizations
- Advanced analytics

#### **Main Dashboard**
```
http://localhost:3000/dashboard
```
**Expected**: Main dashboard with:
- Customizable widgets
- Team collaboration features
- Role-based access
- Widget library

#### **AI Intelligence**
```
http://localhost:3000/ai-intelligence
```
**Expected**: AI/ML features including:
- Model management
- Predictive analytics
- Optimization tools
- Quantum computing integration

### Step 8: Verify API Endpoints

Test these API routes to ensure backend is working:

```bash
# Test India Energy Market API
curl -X POST http://localhost:3000/api/quantum/applications/india-energy-market \
  -H "Content-Type: application/json" \
  -d '{"action":"getMarketOverview","parameters":{}}'

# Expected response: JSON with market data
```

### Step 9: Check Production Build (Optional)

```bash
# Test TypeScript compilation
npm run build

# If successful, should show: "build completed successfully"
# If errors appear, check console for missing dependencies
```

### Step 10: Access Advanced Features

#### **Feature Flags Management**
```
http://localhost:3000/admin/feature-flags
```

#### **API Management**
```
http://localhost:3000/api-management
```

#### **Blockchain Management**
```
http://localhost:3000/blockchain-management
```

## 🚀 Troubleshooting Guide

### Issue: "Cannot resolve module" errors
```bash
# Solution: Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Issue: Port 3000 already in use
```bash
# Solution: Use different port
npm run dev -- --port 3001
# Then access: http://localhost:3001
```

### Issue: India Energy Market showing "N/A" data
```bash
# Solution: Check environment variables
grep -n "FREE_DATA_ENABLED" .env.production

# Should show: NEXT_PUBLIC_FREE_DATA_ENABLED=true
# If missing, add to .env.production file
```

### Issue: Build failures
```bash
# Solution: Check for TypeScript errors
npm run type-check

# Or try: npm run build
```

### Issue: Database connection errors
```bash
# Solution: Check database configuration
ls -la db/
# Ensure migration scripts exist and are executable
chmod +x db/*.sh
```

## 📊 Key Application URLs Summary

| Feature | URL | Purpose |
|---------|-----|---------|
| Landing Page | `http://localhost:3000/` | Main homepage |
| India Energy Market | `http://localhost:3000/india-energy-market` | Energy dashboard |
| Main Dashboard | `http://localhost:3000/dashboard` | User dashboard |
| AI Intelligence | `http://localhost:3000/ai-intelligence` | AI/ML features |
| Enterprise | `http://localhost:3000/enterprise` | Enterprise features |
| Features | `http://localhost:3000/features` | Platform features |
| Solutions | `http://localhost:3000/solutions` | Solution pages |
| Pricing | `http://localhost:3000/pricing` | Pricing page |
| Contact | `http://localhost:3000/contact` | Contact form |

## 🔍 Verification Checklist

- [ ] ✅ Enterprise-marketing folder is the only active application
- [ ] ✅ Landing page shows professional homepage (not login/signup)
- [ ] ✅ India Energy Market dashboard loads with 5 tabs
- [ ] ✅ Navigation menu includes all sections
- [ ] ✅ API endpoints return JSON data
- [ ] ✅ Real-time data displays (or "N/A" with proper fallback)
- [ ] ✅ Responsive design works on different screen sizes

## 💡 Quick Reference Commands

```bash
# Start development server
cd enterprise-marketing && npm run dev

# Stop server (in terminal with server running)
Ctrl + C

# Build for production
cd enterprise-marketing && npm run build

# Type checking
cd enterprise-marketing && npm run type-check

# Access logs
cd enterprise-marketing && npm run lint
```

## 🎯 Next Steps

1. **Access the India Energy Market dashboard** to see all implemented features
2. **Explore the AI Intelligence section** for quantum computing features
3. **Test the responsive design** on mobile/tablet
4. **Review the feature flags** at `/admin/feature-flags`
5. **Check the API documentation** at `/api` (if implemented)

## ⚠️ Important Notes

1. **Never use the frontend-legacy-backup folder** - it's there for reference only
2. **All main features are in enterprise-marketing** - including India Energy Market, AI features, dashboards
3. **The landing page is enterprise-grade** - not a simple login form
4. **Indian Energy Market is a full dashboard** - not just basic data display
5. **Use enterprise-marketing as the source of truth** for all development

## 🆘 If Something Goes Wrong

1. **Check the console output** in the terminal where you ran `npm run dev`
2. **Verify environment variables** are set correctly
3. **Ensure all dependencies are installed** with `npm install`
4. **Restart the development server** with `Ctrl + C` then `npm run dev`
5. **Check browser console** for JavaScript errors

---

**Remember**: The enterprise-marketing folder contains the complete, production-ready implementation with all advanced features including the India Energy Market dashboard with IEX India integration!
