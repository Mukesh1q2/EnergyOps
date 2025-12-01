#!/bin/bash
# Kiro Dev Workspace Verification Script
# This script helps verify which folder to work in and current status

echo "🔍 Kiro Dev Workspace Verification"
echo "=================================="

echo ""
echo "✅ CURRENT WORKING FOLDER:"
echo "   /workspace/enterprise-marketing/"

echo ""
echo "❌ FORBIDDEN FOLDERS (DO NOT ANALYZE):"
echo "   - /workspace/frontend/ (doesn't exist)"
echo "   - /workspace/frontend-legacy-backup/ (old codebase)"

echo ""
echo "📁 WORKSPACE STRUCTURE:"
cd /workspace/enterprise-marketing
echo "   Current directory: $(pwd)"
echo "   Package.json exists: $(test -f package.json && echo 'YES' || echo 'NO')"
echo "   Components directory: $(test -d components && echo 'YES' || echo 'NO')"
echo "   App directory: $(test -d app && echo 'YES' || echo 'NO')"

echo ""
echo "📦 DEPENDENCIES CHECK:"
if [ -f package.json ]; then
    echo "   Dependencies count: $(grep -o '"[^"]*":' package.json | wc -l)"
    echo "   Package name: $(grep -o '"name": "[^"]*"' package.json | cut -d'"' -f4)"
    echo "   Version: $(grep -o '"version": "[^"]*"' package.json | cut -d'"' -f4)"
fi

echo ""
echo "🔍 AUTH PROVIDER STATUS:"
if [ -f components/auth/AuthProvider.tsx ]; then
    echo "   ✅ AuthProvider exists"
else
    echo "   ❌ AuthProvider missing (REAL ISSUE)"
fi

echo ""
echo "🚀 SERVER STATUS:"
echo "   Check if server is running on http://localhost:3000"
echo "   To start: use 'start_process' tool with npm run dev"

echo ""
echo "✅ VERIFICATION COMPLETE"
echo "Remember: Only work with files in /workspace/enterprise-marketing/"