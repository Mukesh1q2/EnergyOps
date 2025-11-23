# OptiBid Energy Platform - Quick Start Deployment
## Fast Track Guide (30 Minutes to Running System)

**For:** Immediate local development setup  
**Time:** 30 minutes  
**Difficulty:** Easy

---

## 🚀 FASTEST PATH TO RUNNING SYSTEM

### Prerequisites
- Node.js 18+ installed
- Python 3.11+ installed
- Docker Desktop installed and running

---

## ⚡ 5-STEP QUICK START

### STEP 1: Install Dependencies (10 min)
```bash
# Open PowerShell/CMD in project root
cd "C:\Users\crypt\Downloads\Ai projects\websites\Optibid Energy"

# Install all dependencies in parallel
start cmd /k "cd frontend && npm install"
start cmd /k "cd enterprise-marketing && npm install"
start cmd /k "cd backend && pip install -r requirements.txt"

# Wait for all to complete...
```

### STEP 2: Start Infrastructure (2 min)
```bash
# Start Docker services
docker-compose up -d postgres redis

# Wait 30 seconds for services to initialize
timeout /t 30
```

### STEP 3: Setup Database (3 min)
```bash
# Run database migrations
docker exec -i optibid-postgres psql -U optibid -d optibid < database/schema.sql
```

### STEP 4: Configure Environment (5 min)
```bash
# Backend
cd backend
echo DATABASE_URL=postgresql+asyncpg://optibid:optibid_password_2025@localhost:5432/optibid > .env
echo REDIS_URL=redis://:redis_password_2025@localhost:6379/0 >> .env
echo SECRET_KEY=dev-secret-key-change-in-production >> .env
echo ENVIRONMENT=development >> .env

# Frontend
cd ../frontend
echo NEXT_PUBLIC_API_URL=http://localhost:8000 > .env.local
echo NEXT_PUBLIC_WS_URL=ws://localhost:8000 >> .env.local

# Enterprise Marketing
cd ../enterprise-marketing
echo NODE_ENV=development > .env.local
echo PORT=3001 >> .env.local
```

### STEP 5: Start Applications (10 min)
```bash
# Open 3 separate terminals:

# Terminal 1 - Backend
cd backend
python -m uvicorn main:app --reload --port 8000

# Terminal 2 - Frontend
cd frontend
npm run dev

# Terminal 3 - Enterprise Marketing
cd enterprise-marketing
npm run dev
```

---

## ✅ VERIFY IT'S WORKING

### Check These URLs:
- Backend API: http://localhost:8000/health
- API Docs: http://localhost:8000/api/docs
- Frontend: http://localhost:3000
- Marketing: http://localhost:3001

### Expected Results:
✅ Backend returns JSON health status
✅ API docs page loads
✅ Frontend dashboard loads
✅ Marketing site loads

---

## 🔧 QUICK FIXES

### If Backend Won't Start:
```bash
# Check Python version
python --version  # Should be 3.11+

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

### If Frontend Won't Start:
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
```

### If Database Connection Fails:
```bash
# Restart PostgreSQL
docker-compose restart postgres

# Check it's running
docker ps | grep postgres
```

---

## 🎯 YOU'RE DONE!

Your OptiBid Energy Platform is now running locally!

**Next Steps:**
1. Create a test user at http://localhost:3001
2. Login to dashboard at http://localhost:3000
3. Explore the API at http://localhost:8000/api/docs

**For Full Production Deployment:**
See `DEPLOYMENT_EXECUTION_PLAN.md`

---

**Questions?** Check `PRODUCTION_DEPLOYMENT_GUIDE.md` for detailed instructions.
