# OptiBid Energy Platform - Documentation Index

Welcome to the OptiBid Energy Platform documentation. This index provides quick access to all documentation resources.

## 📚 Documentation Overview

This comprehensive documentation suite covers all aspects of the OptiBid Energy Platform, from initial setup to production deployment, troubleshooting, and API reference.

---

## 🚀 Getting Started

### Quick Start Guides

1. **[Deployment Scenarios](./DEPLOYMENT_SCENARIOS.md)**
   - Minimal deployment (PostgreSQL only)
   - Standard development deployment
   - Full development deployment (all services)
   - Production deployment
   - Docker Compose deployment
   - Kubernetes deployment

2. **[Environment Configuration](./backend/.env.example)**
   - Complete list of environment variables
   - Required vs optional variables
   - Configuration examples
   - Deployment notes

---

## 🏗️ Architecture & Design

### System Architecture

1. **[Service Dependencies](./SERVICE_DEPENDENCIES.md)**
   - Complete service architecture diagrams
   - Service details and specifications
   - Service interactions and data flows
   - Port reference
   - Dependency matrix
   - Network diagrams
   - Scaling guidelines

2. **[Design Document](./.kiro/specs/project-analysis/design.md)**
   - System overview
   - Architecture components
   - Data models
   - Critical issues identified
   - Error handling strategies
   - Testing strategy
   - Correctness properties

### Requirements

1. **[Requirements Document](./.kiro/specs/project-analysis/requirements.md)**
   - System diagnostics requirements
   - Backend service configuration
   - Frontend asset loading
   - WebSocket communication
   - Database schema and migrations
   - API endpoint functionality
   - Service dependency management
   - Error handling and logging

---

## 🔧 Development

### Setup & Configuration

1. **[Deployment Scenarios](./DEPLOYMENT_SCENARIOS.md)**
   - Development environment setup
   - Service installation guides
   - Configuration instructions
   - Verification steps

2. **[Environment Variables](./backend/.env.example)**
   - All configuration options
   - Service-specific settings
   - Feature flags
   - Security settings

### Implementation

1. **[Task List](./.kiro/specs/project-analysis/tasks.md)**
   - Implementation plan
   - Task breakdown
   - Progress tracking
   - Requirements mapping

---

## 🔌 API Reference

### API Documentation

1. **[API Documentation](./API_DOCUMENTATION.md)**
   - Complete API reference
   - Authentication endpoints
   - User management
   - Organization management
   - Energy trading endpoints
   - Analytics endpoints
   - Notifications
   - Real-time data (WebSocket)
   - Machine learning endpoints
   - Market data endpoints
   - Performance optimization endpoints
   - System endpoints
   - Error handling
   - Rate limiting
   - API versioning
   - Usage examples (cURL, JavaScript)

### OpenAPI Specification

1. **[OpenAPI Specification](./optibid-openapi-v1.yaml)**
   - Machine-readable API specification
   - Can be imported into Postman, Insomnia, etc.

---

## 🐛 Troubleshooting

### Problem Resolution

1. **[Troubleshooting Guide](./TROUBLESHOOTING_GUIDE.md)**
   - Backend issues
   - Frontend issues
   - Database issues
   - Service connection issues
   - WebSocket issues
   - Authentication issues
   - Performance issues
   - Docker & container issues
   - Common error messages
   - Preventive measures

### Health Checks

- Backend: `curl http://localhost:8000/health`
- Frontend: `curl http://localhost:3000`
- Database: `psql -U optibid -d optibid -c "SELECT 1"`
- Redis: `redis-cli ping`
- Kafka: `kafka-topics.sh --list --bootstrap-server localhost:9092`

---

## 🚢 Deployment

### Deployment Guides

1. **[Deployment Scenarios](./DEPLOYMENT_SCENARIOS.md)**
   - Minimal deployment
   - Standard deployment
   - Full deployment
   - Production deployment
   - Docker Compose
   - Kubernetes

2. **[Production Deployment Guide](./PRODUCTION_DEPLOYMENT_GUIDE.md)** (if exists)
   - Production checklist
   - Security considerations
   - Monitoring setup
   - Backup strategies

### Infrastructure

1. **[Service Dependencies](./SERVICE_DEPENDENCIES.md)**
   - Infrastructure requirements
   - Resource requirements
   - Scaling guidelines
   - Cost optimization

---

## 📊 Operations

### Monitoring & Observability

1. **[Service Dependencies](./SERVICE_DEPENDENCIES.md)**
   - Health check endpoints
   - Monitoring metrics
   - Performance targets

2. **[Operations Manual](./OPERATIONS_MANUAL.md)** (if exists)
   - Day-to-day operations
   - Incident response
   - Maintenance procedures

### Performance

1. **[API Documentation](./API_DOCUMENTATION.md)**
   - Performance optimization endpoints
   - Cache management
   - CDN configuration
   - PWA management

---

## 🔒 Security

### Security Documentation

1. **[Service Dependencies](./SERVICE_DEPENDENCIES.md)**
   - Network security
   - Access control
   - Encryption

2. **[API Documentation](./API_DOCUMENTATION.md)**
   - Authentication
   - Authorization
   - Rate limiting

---

## 📈 Analytics & Reporting

### Analytics Documentation

1. **[API Documentation](./API_DOCUMENTATION.md)**
   - Analytics endpoints
   - Performance metrics
   - Risk metrics

2. **[Complete Project Analysis](./COMPLETE_PROJECT_ANALYSIS_REPORT.md)** (if exists)
   - Project status
   - Feature inventory
   - Analysis reports

---

## 🤖 Machine Learning

### ML Documentation

1. **[API Documentation](./API_DOCUMENTATION.md)**
   - ML model training
   - Predictions
   - Model management
   - Model comparison

---

## 📝 Additional Resources

### Project Documentation

1. **[README](./README.md)**
   - Project overview
   - Quick start
   - Contributing guidelines

2. **[Comprehensive Feature Inventory](./COMPREHENSIVE_FEATURE_INVENTORY.md)** (if exists)
   - Complete feature list
   - Feature status

3. **[Executive Summary](./EXECUTIVE_SUMMARY_ENTERPRISE_TRANSFORMATION.md)** (if exists)
   - High-level overview
   - Business value
   - Transformation status

### Development Resources

1. **[Sprint Backlog](./optibid-sprint-backlog.md)** (if exists)
   - Current sprint tasks
   - Priorities
   - Progress tracking

2. **[Testing Status](./TESTING_STATUS_REPORT.md)** (if exists)
   - Test coverage
   - Test results
   - Known issues

---

## 🗂️ Documentation by Role

### For Developers

**Essential Reading:**
1. [Deployment Scenarios](./DEPLOYMENT_SCENARIOS.md) - Minimal & Standard Development
2. [Environment Variables](./backend/.env.example)
3. [API Documentation](./API_DOCUMENTATION.md)
4. [Troubleshooting Guide](./TROUBLESHOOTING_GUIDE.md)
5. [Service Dependencies](./SERVICE_DEPENDENCIES.md)

**Quick Start:**
```bash
# 1. Clone repository
git clone <repository-url>

# 2. Set up backend
cd backend
cp .env.example .env
# Edit .env with your settings
pip install -r requirements.txt
uvicorn main:app --reload

# 3. Set up frontend
cd frontend
npm install
npm run dev

# 4. Access application
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
# API Docs: http://localhost:8000/api/docs
```

### For DevOps Engineers

**Essential Reading:**
1. [Deployment Scenarios](./DEPLOYMENT_SCENARIOS.md) - Production Deployment
2. [Service Dependencies](./SERVICE_DEPENDENCIES.md)
3. [Troubleshooting Guide](./TROUBLESHOOTING_GUIDE.md)
4. [Environment Variables](./backend/.env.example)

**Key Tasks:**
- Infrastructure setup
- Service configuration
- Monitoring setup
- Backup configuration
- Security hardening

### For System Administrators

**Essential Reading:**
1. [Service Dependencies](./SERVICE_DEPENDENCIES.md)
2. [Troubleshooting Guide](./TROUBLESHOOTING_GUIDE.md)
3. [Deployment Scenarios](./DEPLOYMENT_SCENARIOS.md)

**Key Tasks:**
- Service health monitoring
- Incident response
- Performance optimization
- User management
- Backup verification

### For Product Managers

**Essential Reading:**
1. [Requirements Document](./.kiro/specs/project-analysis/requirements.md)
2. [Design Document](./.kiro/specs/project-analysis/design.md)
3. [API Documentation](./API_DOCUMENTATION.md)
4. [Comprehensive Feature Inventory](./COMPREHENSIVE_FEATURE_INVENTORY.md) (if exists)

**Key Information:**
- Feature capabilities
- System requirements
- API capabilities
- Integration options

### For QA Engineers

**Essential Reading:**
1. [API Documentation](./API_DOCUMENTATION.md)
2. [Troubleshooting Guide](./TROUBLESHOOTING_GUIDE.md)
3. [Requirements Document](./.kiro/specs/project-analysis/requirements.md)
4. [Task List](./.kiro/specs/project-analysis/tasks.md)

**Key Tasks:**
- API testing
- Integration testing
- Performance testing
- Security testing

---

## 🔍 Quick Reference

### Common Commands

**Backend:**
```bash
# Start backend
uvicorn main:app --reload

# Run migrations
python -m alembic upgrade head

# Check health
curl http://localhost:8000/health
```

**Frontend:**
```bash
# Start frontend
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

**Database:**
```bash
# Connect to database
psql -U optibid -d optibid

# List tables
\dt

# Run migrations
python -m alembic upgrade head
```

**Docker:**
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Common Issues

| Issue | Solution | Documentation |
|-------|----------|---------------|
| Backend won't start | Check service dependencies | [Troubleshooting Guide](./TROUBLESHOOTING_GUIDE.md#backend-hangs-on-startup) |
| Styles not loading | Clear browser cache | [Troubleshooting Guide](./TROUBLESHOOTING_GUIDE.md#styles-not-loading--blank-page) |
| Database connection failed | Check PostgreSQL is running | [Troubleshooting Guide](./TROUBLESHOOTING_GUIDE.md#backend-crashes-with-connection-refused) |
| WebSocket not connecting | Check WebSocket configuration | [Troubleshooting Guide](./TROUBLESHOOTING_GUIDE.md#websocket-connection-fails) |
| API returns 401 | Check authentication token | [Troubleshooting Guide](./TROUBLESHOOTING_GUIDE.md#token-expired-or-invalid-token) |

### Service Ports

| Service | Port | Status | Documentation |
|---------|------|--------|---------------|
| Frontend | 3000 | REQUIRED | [Service Dependencies](./SERVICE_DEPENDENCIES.md#1-frontend-nextjs) |
| Backend | 8000 | REQUIRED | [Service Dependencies](./SERVICE_DEPENDENCIES.md#2-backend-fastapi) |
| PostgreSQL | 5432 | REQUIRED | [Service Dependencies](./SERVICE_DEPENDENCIES.md#3-postgresql) |
| Redis | 6379 | OPTIONAL | [Service Dependencies](./SERVICE_DEPENDENCIES.md#4-redis) |
| Kafka | 9092 | OPTIONAL | [Service Dependencies](./SERVICE_DEPENDENCIES.md#5-kafka) |
| ClickHouse | 8123 | OPTIONAL | [Service Dependencies](./SERVICE_DEPENDENCIES.md#6-clickhouse) |
| MLflow | 5000 | OPTIONAL | [Service Dependencies](./SERVICE_DEPENDENCIES.md#7-mlflow) |

---

## 📞 Support

### Getting Help

1. **Check Documentation:**
   - Start with [Troubleshooting Guide](./TROUBLESHOOTING_GUIDE.md)
   - Review relevant section in this index

2. **Check Logs:**
   - Backend: `backend/logs/app.log`
   - Frontend: Browser console (F12)
   - Docker: `docker-compose logs`

3. **Run Health Checks:**
   - Backend: `curl http://localhost:8000/health`
   - Services: See [Service Dependencies](./SERVICE_DEPENDENCIES.md#monitoring--health-checks)

4. **Contact Support:**
   - Email: support@optibid.io
   - API Support: api-support@optibid.io

---

## 📅 Document Versions

| Document | Version | Last Updated |
|----------|---------|--------------|
| API Documentation | 1.0 | 2025-11-21 |
| Deployment Scenarios | 1.0 | 2025-11-23 |
| Troubleshooting Guide | 1.0 | 2025-11-23 |
| Service Dependencies | 1.0 | 2025-11-23 |
| Environment Variables | 1.0 | 2025-11-23 |

---

## 🔄 Documentation Updates

This documentation is actively maintained. If you find any issues or have suggestions:

1. Check if the issue is already documented
2. Review the latest version of the documentation
3. Submit feedback to the documentation team
4. Contribute improvements via pull requests

---

**Last Updated:** 2025-11-23  
**Documentation Version:** 1.0  
**Platform Version:** 1.0.0
