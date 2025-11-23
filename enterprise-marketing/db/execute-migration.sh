#!/bin/bash
# =============================================================================
# FEATURE FLAGS DATABASE MIGRATION SCRIPT
# =============================================================================
# Execute this script when database connection is available

echo "🚀 Starting Feature Flags Database Migration..."

# Database connection configuration
# Update these values according to your database setup
export PGHOST=${DB_HOST:-localhost}
export PGPORT=${DB_PORT:-5432}
export PGDATABASE=${DB_NAME:-optibid}
export PGUSER=${DB_USER:-postgres}
export PGPASSWORD=${DB_PASSWORD:-password}

# Check if PostgreSQL is available
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL client not found. Please install postgresql-client."
    exit 1
fi

# Execute the migration
echo "📊 Executing schema migration..."
psql -h $PGHOST -p $PGPORT -U $PGUSER -d $PGDATABASE -f db/feature-flags-schema.sql

if [ $? -eq 0 ]; then
    echo "✅ Migration completed successfully!"
    echo ""
    echo "🎯 Migration Summary:"
    echo "   • 8 tables created for feature flag system"
    echo "   • 6 indexes created for performance optimization"
    echo "   • 3 trigger functions for automated timestamp updates"
    echo "   • 3 validation functions for feature dependencies and conflicts"
    echo "   • Sample feature definitions and widget library entries"
    echo ""
    echo "🔍 Next Steps:"
    echo "   1. Verify all tables were created correctly"
    echo "   2. Test API endpoints for feature flag management"
    echo "   3. Integrate feature flag provider in React components"
    echo "   4. Start using the Feature Settings interface"
else
    echo "❌ Migration failed. Please check the error messages above."
    exit 1
fi