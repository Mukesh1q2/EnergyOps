# OptiBid Workspace Structure

## ⚠️ IMPORTANT: Two Applications Exist

This workspace contains TWO Next.js applications. **Only use one.**

---

## ✅ PRIMARY APPLICATION (USE THIS)

**Location:** `/enterprise-marketing/`

**Purpose:** Complete OptiBid Enterprise Energy Trading Platform

**Features:**
- Indian Energy Market Dashboard (IEX India integration)
- Quantum Computing & AI/ML capabilities
- Enterprise authentication & authorization
- Advanced analytics & reporting
- Blockchain & DeFi integration
- IoT & Edge computing
- Complete landing page with marketing content

**Start Development:**
```bash
cd enterprise-marketing
npm install
npm run dev
```

**URLs:**
- Landing Page: http://localhost:3000/
- Indian Energy Market: http://localhost:3000/india-energy-market
- AI Intelligence: http://localhost:3000/ai-intelligence
- Dashboard: http://localhost:3000/dashboard

---

## ❌ LEGACY APPLICATION (DO NOT USE)

**Location:** `/frontend/`

**Status:** Legacy/deprecated - basic dashboard only

**Why it exists:** Earlier iteration before enterprise transformation

**Action:** Ignore this folder or archive it

---

## 🤖 For AI Agents (Kiro, etc.)

**ALWAYS use `/enterprise-marketing/` as the main application.**

- Main app: `enterprise-marketing/`
- Landing page: `enterprise-marketing/app/page.tsx`
- Indian Energy Market: `enterprise-marketing/app/india-energy-market/page.tsx`
- Components: `enterprise-marketing/components/`
- Data sources: `enterprise-marketing/lib/`

**DO NOT use `/frontend/` folder - it's legacy code.**

---

## 📁 Quick Reference

```
workspace/
├── enterprise-marketing/     ✅ USE THIS - Complete platform
├── frontend/                 ❌ IGNORE - Legacy code
├── backend/                  ✅ Backend services
├── database/                 ✅ Database configs
└── kubernetes/               ✅ Deployment configs
```
