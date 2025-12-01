# Workspace Structure - Critical AI Agent Instructions

## ⚠️ IMPORTANT: Two Next.js Applications Exist

This workspace contains TWO separate Next.js applications. Always use the correct one:

### ✅ PRIMARY APPLICATION: `/enterprise-marketing/`
- **Location**: `/enterprise-marketing/`
- **Status**: Complete enterprise platform with all features
- **Landing Page**: `/enterprise-marketing/app/page.tsx`
- **Features**: 
  - Indian Energy Market Dashboard
  - Quantum Computing Applications
  - AI/ML Intelligence
  - Enterprise Authentication
  - Advanced Analytics
  - Real-time IEX India Data

### ❌ DEPRECATED: `/frontend/`
- **Location**: `/frontend/`
- **Status**: Legacy/backup - basic dashboard only
- **DO NOT USE** for new development
- **DO NOT REFERENCE** when building features
- **DO NOT DEPLOY** this application

## 🎯 Default Working Directory

When working on this project:
- **Always use**: `/enterprise-marketing/` as the main application
- **Package management**: Run `npm` commands in `/enterprise-marketing/`
- **Development server**: Start from `/enterprise-marketing/`
- **Component location**: `/enterprise-marketing/components/`
- **Data sources**: `/enterprise-marketing/lib/quantum-applications/`

## 📍 Key File Locations

### Landing Pages
- **Main Landing**: `/enterprise-marketing/app/page.tsx` (OptiBid Energy homepage)
- **India Energy Market**: `/enterprise-marketing/app/india-energy-market/page.tsx`
- **AI Intelligence**: `/enterprise-marketing/app/ai-intelligence/page.tsx`
- **Dashboard**: `/enterprise-marketing/app/dashboard/page.tsx`

### Configuration
- **Environment**: `/enterprise-marketing/.env.production`
- **Next Config**: `/enterprise-marketing/next.config.js`
- **TypeScript**: `/enterprise-marketing/tsconfig.json`

## 🚫 What NOT to Do

1. **Don't** suggest changes to `/frontend/` folder
2. **Don't** run commands in `/frontend/` directory
3. **Don't** reference `/frontend/` components or pages
4. **Don't** create new features in `/frontend/`
5. **Don't** assume `/frontend/` is the main application

## ✅ What TO Do

1. **Always** work in `/enterprise-marketing/`
2. **Always** verify you're in the correct directory before running commands
3. **Always** reference enterprise-marketing components and pages
4. **Always** check `/enterprise-marketing/` for existing implementations
5. **Always** deploy from `/enterprise-marketing/`

## 🔧 Quick Commands Reference

```bash
# Navigate to correct application
cd enterprise-marketing

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🌐 Correct URLs

- Landing Page: `http://localhost:3000/`
- India Energy Market: `http://localhost:3000/india-energy-market`
- AI Intelligence: `http://localhost:3000/ai-intelligence`
- Dashboard: `http://localhost:3000/dashboard`

## 📝 Notes for AI Agents

If you see references to `/frontend/` in conversation history or documentation:
- Treat it as deprecated/legacy code
- Redirect focus to `/enterprise-marketing/`
- Clarify with the user if they meant the enterprise-marketing application
- Do not implement features in both applications

This steering rule ensures consistent behavior across all AI agent sessions.
