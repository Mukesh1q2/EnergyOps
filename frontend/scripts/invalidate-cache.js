#!/usr/bin/env node

/**
 * Cache Invalidation Script
 * Run this script after deployment to update the service worker with the new build ID
 */

const fs = require('fs');
const path = require('path');

const BUILD_ID = process.env.BUILD_ID || `build-${Date.now()}`;
const SW_PATH = path.join(__dirname, '../public/sw.js');

console.log('[Cache Invalidation] Starting...');
console.log('[Cache Invalidation] Build ID:', BUILD_ID);

try {
  // Read the service worker file
  let swContent = fs.readFileSync(SW_PATH, 'utf8');
  
  // Replace the BUILD_ID placeholder
  swContent = swContent.replace('{{BUILD_ID}}', BUILD_ID);
  
  // Update the cache version with timestamp
  const timestamp = Date.now();
  swContent = swContent.replace(
    /const BUILD_TIMESTAMP = \d+;/,
    `const BUILD_TIMESTAMP = ${timestamp};`
  );
  
  // Write the updated service worker
  fs.writeFileSync(SW_PATH, swContent, 'utf8');
  
  console.log('[Cache Invalidation] Service worker updated successfully');
  console.log('[Cache Invalidation] Cache will be invalidated on next deployment');
} catch (error) {
  console.error('[Cache Invalidation] Failed:', error.message);
  process.exit(1);
}
