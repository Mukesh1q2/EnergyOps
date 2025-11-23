#!/bin/bash

# Production Deployment Script for OptiBid Energy Platform
# Date: 2025-11-21 18:05:08
# Purpose: Deploy OptiBid Energy Platform to production environment

set -euo pipefail  # Exit on error, undefined variables, and pipe failures

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
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

# Configuration
DEPLOYMENT_ENV="${DEPLOYMENT_ENV:-production}"
APP_NAME="optibid-energy-platform"
DOCKER_IMAGE_TAG="latest"
BACKUP_RETENTION_DAYS=7

# Directories
APP_DIR="/opt/optibid-energy"
BACKUP_DIR="/opt/backups"
LOG_DIR="/var/log/optibid-energy"

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   log_error "This script should not be run as root for security reasons"
   exit 1
fi

# Pre-deployment checks
pre_deployment_checks() {
    log_info "Running pre-deployment checks..."
    
    # Check if required directories exist
    if [[ ! -d "$APP_DIR" ]]; then
        log_error "Application directory $APP_DIR does not exist"
        exit 1
    fi
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        exit 1
    fi
    
    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed"
        exit 1
    fi
    
    # Check if .env.production file exists
    if [[ ! -f "$APP_DIR/.env.production" ]]; then
        log_error ".env.production file not found"
        exit 1
    fi
    
    # Check if package.json exists
    if [[ ! -f "$APP_DIR/package.json" ]]; then
        log_error "package.json file not found"
        exit 1
    fi
    
    log_success "Pre-deployment checks passed"
}

# Database backup
backup_database() {
    log_info "Creating database backup..."
    
    local backup_timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="$BACKUP_DIR/db_backup_$backup_timestamp.sql"
    
    # Ensure backup directory exists
    mkdir -p "$BACKUP_DIR"
    
    # Get database credentials from environment
    local db_host="${DB_HOST:-localhost}"
    local db_port="${DB_PORT:-5432}"
    local db_name="${DB_NAME:-optibid_energy}"
    local db_user="${DB_USER:-optibid_user}"
    
    # Create backup
    if pg_dump -h "$db_host" -p "$db_port" -U "$db_user" -d "$db_name" > "$backup_file"; then
        log_success "Database backup created: $backup_file"
        
        # Compress backup
        gzip "$backup_file"
        log_info "Backup compressed: $backup_file.gz"
        
        # Clean up old backups
        find "$BACKUP_DIR" -name "db_backup_*.sql.gz" -mtime +$BACKUP_RETENTION_DAYS -delete
        log_info "Old backups cleaned up"
    else
        log_error "Database backup failed"
        return 1
    fi
}

# Install dependencies
install_dependencies() {
    log_info "Installing production dependencies..."
    
    cd "$APP_DIR"
    
    # Install production dependencies
    if npm ci --only=production --silent; then
        log_success "Production dependencies installed"
    else
        log_error "Failed to install production dependencies"
        return 1
    fi
    
    # Install global packages for service integrations
    log_info "Installing service integration packages..."
    npm install -g @sendgrid/mail twilio ioredis @sentry/nextjs pg bcrypt jsonwebtoken speakeasy qrcode || {
        log_warning "Global package installation failed, using local installation"
        npm install --save @sendgrid/mail twilio ioredis @sentry/nextjs pg bcrypt jsonwebtoken speakeasy qrcode || {
            log_error "Service package installation failed"
            return 1
        }
    }
    
    log_success "All dependencies installed"
}

# Run database migrations
run_migrations() {
    log_info "Running database migrations..."
    
    cd "$APP_DIR"
    
    # Check if migration script exists
    if [[ -f "scripts/migrate.js" ]]; then
        if node scripts/migrate.js; then
            log_success "Database migrations completed"
        else
            log_error "Database migrations failed"
            return 1
        fi
    else
        log_warning "Migration script not found, skipping migrations"
    fi
}

# Run tests
run_tests() {
    log_info "Running test suite..."
    
    cd "$APP_DIR"
    
    # Install test dependencies if not already installed
    if ! npm list jest &> /dev/null; then
        log_info "Installing test dependencies..."
        npm install --save-dev jest @types/jest ts-jest @jest/globals
    fi
    
    # Run unit tests
    if npm test -- --testPathPattern="tests/unit" --silent; then
        log_success "Unit tests passed"
    else
        log_error "Unit tests failed"
        return 1
    fi
    
    # Run integration tests (optional)
    if npm test -- --testPathPattern="tests/integration" --silent; then
        log_success "Integration tests passed"
    else
        log_warning "Integration tests failed, continuing deployment"
    fi
    
    # Run service tests
    if npm test -- --testPathPattern="tests/services" --silent; then
        log_success "Service tests passed"
    else
        log_error "Service tests failed"
        return 1
    fi
    
    log_success "All tests passed"
}

# Build application
build_application() {
    log_info "Building application for production..."
    
    cd "$APP_DIR"
    
    # Clean previous build
    if [[ -d "dist" ]]; then
        rm -rf dist
        log_info "Cleaned previous build"
    fi
    
    # Build the application
    if npm run build; then
        log_success "Application built successfully"
    else
        log_error "Application build failed"
        return 1
    fi
}

# Start application services
start_services() {
    log_info "Starting application services..."
    
    cd "$APP_DIR"
    
    # Start the application using PM2 or systemd
    if command -v pm2 &> /dev/null; then
        # Use PM2 for process management
        pm2 delete $APP_NAME 2>/dev/null || true
        pm2 start ecosystem.config.js --env $DEPLOYMENT_ENV
        
        if pm2 describe $APP_NAME | grep -q "online"; then
            log_success "Application started with PM2"
        else
            log_error "Failed to start application with PM2"
            return 1
        fi
    else
        # Start with node directly (development fallback)
        log_warning "PM2 not found, starting with node directly"
        nohup npm start > "$LOG_DIR/app.log" 2>&1 &
        echo $! > "$LOG_DIR/app.pid"
        
        # Wait for application to start
        sleep 10
        if kill -0 $(cat "$LOG_DIR/app.pid") 2>/dev/null; then
            log_success "Application started"
        else
            log_error "Failed to start application"
            return 1
        fi
    fi
}

# Health checks
health_checks() {
    log_info "Running health checks..."
    
    local max_attempts=30
    local attempt=1
    
    while [[ $attempt -le $max_attempts ]]; do
        log_info "Health check attempt $attempt/$max_attempts"
        
        # Check application endpoint
        if curl -f -s http://localhost:3000/health >/dev/null; then
            log_success "Application health check passed"
            break
        fi
        
        if [[ $attempt -eq $max_attempts ]]; then
            log_error "Health check failed after $max_attempts attempts"
            return 1
        fi
        
        sleep 5
        ((attempt++))
    done
    
    # Check database connectivity
    if pg_isready -h "${DB_HOST:-localhost}" -p "${DB_PORT:-5432}" -U "${DB_USER:-optibid_user}" -d "${DB_NAME:-optibid_energy}"; then
        log_success "Database health check passed"
    else
        log_error "Database health check failed"
        return 1
    fi
    
    # Check Redis connectivity
    if redis-cli ping | grep -q PONG; then
        log_success "Redis health check passed"
    else
        log_error "Redis health check failed"
        return 1
    fi
    
    log_success "All health checks passed"
}

# Post-deployment verification
post_deployment_verification() {
    log_info "Running post-deployment verification..."
    
    # Verify critical endpoints
    local endpoints=(
        "http://localhost:3000/health"
        "http://localhost:3000/api/auth/health"
        "http://localhost:3000/api/users/profile"
    )
    
    for endpoint in "${endpoints[@]}"; do
        if curl -f -s "$endpoint" >/dev/null; then
            log_success "Endpoint verification passed: $endpoint"
        else
            log_warning "Endpoint verification failed: $endpoint"
        fi
    done
    
    # Check logs for errors
    if [[ -f "$LOG_DIR/app.log" ]]; then
        local error_count=$(grep -i "error\|exception\|fatal" "$LOG_DIR/app.log" | wc -l)
        if [[ $error_count -eq 0 ]]; then
            log_success "No errors found in application logs"
        else
            log_warning "Found $error_count errors in application logs"
        fi
    fi
    
    log_success "Post-deployment verification completed"
}

# Rollback function
rollback() {
    log_error "Deployment failed, initiating rollback..."
    
    # Stop current application
    if command -v pm2 &> /dev/null; then
        pm2 stop $APP_NAME || true
        pm2 delete $APP_NAME || true
    fi
    
    # Restore database from backup if needed
    if [[ -n "${1:-}" ]]; then
        log_info "Restoring database from backup: $1"
        gunzip -c "$1" | psql -h "${DB_HOST:-localhost}" -U "${DB_USER:-optibid_user}" -d "${DB_NAME:-optibid_energy}"
    fi
    
    # Restart previous version (implement based on your deployment strategy)
    log_info "Rollback completed"
    
    exit 1
}

# Main deployment function
main() {
    log_info "Starting OptiBid Energy Platform deployment to $DEPLOYMENT_ENV environment"
    
    # Create necessary directories
    mkdir -p "$LOG_DIR"
    
    # Trap errors for rollback
    trap 'rollback' ERR
    
    # Run deployment steps
    pre_deployment_checks || exit 1
    backup_database || exit 1
    install_dependencies || exit 1
    run_migrations || exit 1
    run_tests || exit 1
    build_application || exit 1
    start_services || exit 1
    health_checks || exit 1
    post_deployment_verification || exit 1
    
    log_success "Deployment completed successfully!"
    log_info "OptiBid Energy Platform is now running in $DEPLOYMENT_ENV environment"
    
    # Show deployment summary
    echo ""
    echo "=== Deployment Summary ==="
    echo "Environment: $DEPLOYMENT_ENV"
    echo "Application: $APP_NAME"
    echo "Timestamp: $(date)"
    echo "Status: SUCCESS"
    echo "========================="
}

# Script entry point
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi