#!/bin/bash
# Migration Script: Copy critical files from frontend-legacy-backup to enterprise-marketing

echo "🔄 Starting Migration: frontend-legacy-backup -> enterprise-marketing"
echo "========================================================="

# Create auth directory if it doesn't exist
mkdir -p /workspace/enterprise-marketing/contexts
mkdir -p /workspace/enterprise-marketing/lib

# Copy AuthProvider (CRITICAL - fixes dashboard)
echo "✅ Copying AuthProvider..."
cp /workspace/frontend-legacy-backup/contexts/AuthContext.tsx /workspace/enterprise-marketing/contexts/AuthContext.tsx

# Copy WebSocket context (for real-time data)
echo "✅ Copying WebSocketContext..."
cp /workspace/frontend-legacy-backup/contexts/WebSocketContext.tsx /workspace/enterprise-marketing/contexts/WebSocketContext.tsx

# Copy API client (comprehensive backend integration)
echo "✅ Copying API client..."
cp /workspace/frontend-legacy-backup/lib/api.ts /workspace/enterprise-marketing/lib/api-legacy.ts

# Copy other useful components
echo "✅ Copying additional components..."
cp /workspace/frontend-legacy-backup/contexts/ThemeContext.tsx /workspace/enterprise-marketing/contexts/ThemeContext.tsx 2>/dev/null || echo "ThemeContext not found"

# Add socket.io-client dependency to package.json
echo "✅ Adding missing dependencies to package.json..."
cd /workspace/enterprise-marketing
npm install socket.io-client react-query zustand react-grid-layout leaflet react-leaflet @types/leaflet react-flow-renderer dnd-kit react-hot-toast --save

echo ""
echo "🎉 Migration Complete!"
echo "Next steps:"
echo "1. Update dashboard imports to use AuthContext instead of AuthProvider"
echo "2. Wrap app with AuthProvider in layout.tsx"
echo "3. Test dashboard functionality"
echo "4. Delete frontend-legacy-backup folder"