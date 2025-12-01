#!/bin/bash

# =============================================================================
# Live Data Sources Enable Script
# OptiBid Energy Platform - Production Deployment
# 
# This script enables live IEX Indian energy market data sources
# using free government data APIs without requiring API keys
# =============================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ROOT=$(pwd)
ENV_FILE="$PROJECT_ROOT/.env.production"
BACKUP_FILE="$PROJECT_ROOT/.env.production.backup.$(date +%Y%m%d_%H%M%S)"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
check_project_structure() {
    log_info "Checking project structure..."
    
    if [[ ! -f "$ENV_FILE" ]]; then
        log_error "Production environment file not found: $ENV_FILE"
        exit 1
    fi
    
    if [[ ! -d "app/api/quantum/applications/india-energy-market" ]]; then
        log_error "API route directory not found"
        exit 1
    fi
    
    if [[ ! -f "lib/quantum-applications/free-data-sources.ts" ]]; then
        log_error "Free data sources implementation not found"
        exit 1
    fi
    
    log_success "Project structure verified"
}

# Backup current environment
backup_environment() {
    log_info "Creating backup of current environment..."
    
    if [[ -f "$ENV_FILE" ]]; then
        cp "$ENV_FILE" "$BACKUP_FILE"
        log_success "Environment backed up to: $BACKUP_FILE"
    else
        log_warning "No existing environment file to backup"
    fi
}

# Add live data configuration to environment
configure_environment() {
    log_info "Configuring live data sources in environment..."
    
    # Check if already configured
    if grep -q "ENABLE_LIVE_DATA_SOURCES" "$ENV_FILE"; then
        log_warning "Live data configuration already exists. Updating..."
        # Remove existing configuration
        sed -i '/ENABLE_LIVE_DATA_SOURCES/d' "$ENV_FILE"
        sed -i '/FREE_DATA_SOURCES_ENABLED/d' "$ENV_FILE"
        sed -i '/DATA_REFRESH_INTERVAL/d' "$ENV_FILE"
        sed -i '/LOG_DATA_SOURCE_ACTIVITY/d' "$ENV_FILE"
        sed -i '/USE_NPP_DASHBOARD/d' "$ENV_FILE"
        sed -i '/USE_CEA_REPORTS/d' "$ENV_FILE"
        sed -i '/USE_POSOCO_DATA/d' "$ENV_FILE"
    fi
    
    # Add new configuration
    cat >> "$ENV_FILE" << EOF

# ==============================================
# LIVE DATA SOURCES CONFIGURATION
# Added by enable-live-data.sh on $(date)
# ==============================================

# Enable live data sources (set to true for production)
ENABLE_LIVE_DATA_SOURCES=true

# Free Data Sources Configuration
FREE_DATA_SOURCES_ENABLED=true
DATA_REFRESH_INTERVAL=300  # 5 minutes in seconds

# Government Data Sources
USE_NPP_DASHBOARD=true
USE_CEA_REPORTS=true
USE_POSOCO_DATA=true
USE_SRGD_DATA=true

# Data Quality & Reliability
MAX_RETRY_ATTEMPTS=3
RETRY_DELAY_MS=2000
TIMEOUT_MS=10000

# Fallback Settings
FALLBACK_TO_MOCK_DATA=true
FALLBACK_THRESHOLD=3  # Failures before fallback

# Monitoring & Logging
LOG_DATA_SOURCE_ACTIVITY=true
DATA_QUALITY_MONITORING=true

EOF

    log_success "Environment configuration updated"
}

# Verify configuration
verify_configuration() {
    log_info "Verifying configuration..."
    
    # Check environment variables
    if ! grep -q "ENABLE_LIVE_DATA_SOURCES=true" "$ENV_FILE"; then
        log_error "Failed to enable live data sources"
        exit 1
    fi
    
    log_success "Configuration verified"
}

# Test API endpoint
test_api_endpoint() {
    log_info "Testing API endpoint..."
    
    # Check if server is running
    if ! curl -s -f http://localhost:3000/api/health > /dev/null 2>&1; then
        log_warning "Server not running. Please start the server and run this script again"
        log_info "To start server: npm run build && npm start"
        return 1
    fi
    
    # Test the specific endpoint
    local response=$(curl -s http://localhost:3000/api/quantum/applications/india-energy-market)
    
    if echo "$response" | grep -q "success"; then
        local data_source=$(echo "$response" | grep -o '"dataSource":\s*\[[^]]*\]' | head -1)
        log_success "API endpoint is responding"
        log_info "Data source: $data_source"
        
        if echo "$response" | grep -q "LIVE"; then
            log_success "✅ Live data sources are ACTIVE!"
        else
            log_warning "⚠️ Live data sources may not be properly configured yet"
            log_info "Please restart the application after running this script"
        fi
    else
        log_error "API endpoint test failed"
        return 1
    fi
}

# Create monitoring script
create_monitoring_script() {
    log_info "Creating monitoring script..."
    
    cat > "$PROJECT_ROOT/scripts/monitor-data-sources.js" << 'EOF'
#!/usr/bin/env node

/**
 * Data Sources Monitoring Script
 * Monitors the health and performance of live data sources
 */

const fetch = require('fetch');

async function monitorDataSources() {
    const endpoints = [
        {
            name: 'India Energy Market API',
            url: 'http://localhost:3000/api/quantum/applications/india-energy-market',
            critical: true
        },
        {
            name: 'Health Check',
            url: 'http://localhost:3000/api/health/data-sources',
            critical: false
        }
    ];

    console.log('🔍 Monitoring Live Data Sources...\n');

    for (const endpoint of endpoints) {
        try {
            const startTime = Date.now();
            const response = await fetch(endpoint.url);
            const data = await response.json();
            const duration = Date.now() - startTime;

            console.log(`✅ ${endpoint.name}:`);
            console.log(`   Status: ${response.status}`);
            console.log(`   Response Time: ${duration}ms`);
            
            if (endpoint.name.includes('India Energy Market')) {
                console.log(`   Data Source: ${data.dataSource || 'Unknown'}`);
                console.log(`   Live Enabled: ${data.data?.liveDataEnabled || false}`);
                console.log(`   Last Update: ${data.timestamp || 'Never'}`);
                
                if (data.dataSource && data.dataSource.includes('LIVE')) {
                    console.log(`   🎉 Status: LIVE DATA ACTIVE`);
                } else {
                    console.log(`   ⚠️ Status: Using fallback data`);
                }
            }

            if (data.dataQuality) {
                console.log(`   Reliability: ${data.dataQuality.reliabilityScore}%`);
            }

            console.log('');

        } catch (error) {
            console.log(`❌ ${endpoint.name}: ERROR`);
            console.log(`   Error: ${error.message}`);
            console.log('');
        }
    }
}

// Run monitoring
monitorDataSources().catch(console.error);
EOF

    chmod +x "$PROJECT_ROOT/scripts/monitor-data-sources.js"
    log_success "Monitoring script created: scripts/monitor-data-sources.js"
}

# Create quick test script
create_test_script() {
    log_info "Creating quick test script..."
    
    cat > "$PROJECT_ROOT/scripts/test-live-data.sh" << 'EOF'
#!/bin/bash

# Quick test script for live data sources

echo "🚀 Testing Live Data Sources Configuration..."
echo ""

# Test environment variables
echo "📋 Environment Configuration:"
grep -E "(ENABLE_LIVE_DATA_SOURCES|FREE_DATA_SOURCES_ENABLED)" .env.production || echo "❌ Missing environment variables"

echo ""

# Test API endpoint
echo "🔌 API Endpoint Test:"
response=$(curl -s http://localhost:3000/api/quantum/applications/india-energy-market)

if echo "$response" | grep -q "success"; then
    data_source=$(echo "$response" | grep -o '"dataSource":\s*\[[^]]*\]' | head -1)
    echo "✅ API responding: $data_source"
    
    if echo "$response" | grep -q "LIVE"; then
        echo "🎉 LIVE DATA SOURCES: ACTIVE"
    else
        echo "⚠️ LIVE DATA SOURCES: Not yet active (restart may be needed)"
    fi
else
    echo "❌ API endpoint not responding"
fi

echo ""
echo "🔄 To activate live data sources:"
echo "   1. npm run build"
echo "   2. npm start"
echo "   3. node scripts/monitor-data-sources.js"
EOF

    chmod +x "$PROJECT_ROOT/scripts/test-live-data.sh"
    log_success "Test script created: scripts/test-live-data.sh"
}

# Main execution
main() {
    echo "===================================================="
    echo "  OptiBid Energy Platform"
    echo "  Live Data Sources Configuration"
    echo "===================================================="
    echo ""
    
    check_project_structure
    backup_environment
    configure_environment
    verify_configuration
    create_monitoring_script
    create_test_script
    
    echo ""
    echo "===================================================="
    echo "  ✅ CONFIGURATION COMPLETE"
    echo "===================================================="
    echo ""
    echo "📋 Next Steps:"
    echo "   1. Build application: npm run build"
    echo "   2. Start server: npm start"
    echo "   3. Test configuration: ./scripts/test-live-data.sh"
    echo "   4. Monitor data sources: node scripts/monitor-data-sources.js"
    echo ""
    echo "📊 Backup Location: $BACKUP_FILE"
    echo "📚 Documentation: LIVE_DATA_CONFIGURATION_GUIDE.md"
    echo ""
    log_success "Live data sources configuration completed successfully!"
}

# Run main function
main "$@"
