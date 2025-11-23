# Production Security Checklist
## OptiBid Energy Platform

This checklist must be completed before deploying to production.

---

## 1. Environment Configuration

### SECRET_KEY Configuration ⚠ CRITICAL
- [ ] Generate a strong, random SECRET_KEY
  ```bash
  # Generate a secure key
  openssl rand -hex 32
  ```
- [ ] Set `SECRET_KEY` in production environment variables
- [ ] Verify SECRET_KEY is NOT the default value: `"your-secret-key-here-change-in-production"`
- [ ] Ensure SECRET_KEY is never committed to version control
- [ ] Document SECRET_KEY location in secure password manager

### JWT Configuration
- [ ] Verify `JWT_SECRET_KEY` is set (defaults to SECRET_KEY)
- [ ] Confirm `JWT_ALGORITHM` is set to `HS256`
- [ ] Review token expiration times:
  - [ ] `ACCESS_TOKEN_EXPIRE_MINUTES` (default: 30)
  - [ ] `REFRESH_TOKEN_EXPIRE_DAYS` (default: 7)

---

## 2. CORS Configuration ⚠ CRITICAL

### Production Domains
- [ ] Update `ALLOWED_HOSTS` with production domains
  ```bash
  # Example production configuration
  ALLOWED_HOSTS=https://app.optibid.io,https://api.optibid.io,https://www.optibid.io
  ```
- [ ] Remove development domains (localhost, 127.0.0.1, 0.0.0.0)
- [ ] Verify CORS origins match actual frontend domains
- [ ] Test CORS configuration with production domains

### CORS Settings Review
- [ ] Confirm `allow_credentials=True` is required
- [ ] Consider restricting `allow_methods` from `["*"]` to specific methods
- [ ] Consider restricting `allow_headers` from `["*"]` to specific headers
- [ ] Document CORS configuration in deployment guide

---

## 3. HTTPS/TLS Configuration ⚠ CRITICAL

### SSL/TLS Certificates
- [ ] Obtain SSL/TLS certificates for all production domains
- [ ] Configure web server (nginx/Apache) to use certificates
- [ ] Enable HTTPS on all endpoints
- [ ] Configure HTTP to HTTPS redirect
- [ ] Test certificate validity and expiration

### HSTS Configuration
- [ ] Verify `Strict-Transport-Security` header is enabled
- [ ] Confirm `max-age=31536000` (1 year)
- [ ] Verify `includeSubDomains` directive
- [ ] Consider adding to HSTS preload list (optional)

---

## 4. Rate Limiting Configuration ⚠ IMPORTANT

### Redis Setup
- [ ] Deploy Redis instance for production
- [ ] Configure `REDIS_URL` in production environment
- [ ] Set `ENABLE_REDIS=true`
- [ ] Test Redis connectivity
- [ ] Configure Redis persistence (AOF or RDB)
- [ ] Set up Redis monitoring

### Rate Limiting Implementation
- [ ] Implement Redis-based rate limiter (replace in-memory)
- [ ] Configure rate limits per endpoint type:
  - [ ] Authentication: 5 requests/minute
  - [ ] Read endpoints: 100 requests/minute
  - [ ] Write endpoints: 50 requests/minute
  - [ ] Admin endpoints: 1000 requests/hour
- [ ] Add rate limit headers to responses
- [ ] Test rate limiting with production Redis
- [ ] Document rate limits in API documentation

---

## 5. Security Headers

### Apply Security Headers Middleware
- [ ] Implement middleware to add security headers to all responses
  ```python
  @app.middleware("http")
  async def add_security_headers(request: Request, call_next):
      response = await call_next(request)
      for header, value in SECURITY_HEADERS.items():
          response.headers[header] = value
      return response
  ```
- [ ] Verify headers are present in responses:
  - [ ] `X-Content-Type-Options: nosniff`
  - [ ] `X-Frame-Options: DENY`
  - [ ] `X-XSS-Protection: 1; mode=block`
  - [ ] `Strict-Transport-Security: max-age=31536000; includeSubDomains`
  - [ ] `Content-Security-Policy: default-src 'self'`

### CSP Configuration
- [ ] Review Content-Security-Policy
- [ ] Test CSP doesn't break frontend functionality
- [ ] Adjust CSP directives as needed for external resources
- [ ] Consider CSP reporting endpoint

---

## 6. Database Security

### Connection Security
- [ ] Use SSL/TLS for database connections
- [ ] Configure `DATABASE_URL` with SSL parameters
- [ ] Verify database credentials are secure
- [ ] Use strong database passwords
- [ ] Restrict database access to application servers only

### Database Configuration
- [ ] Enable PostgreSQL SSL mode: `sslmode=require`
- [ ] Configure connection pooling limits
- [ ] Set up database backups
- [ ] Enable database audit logging
- [ ] Review database user permissions

---

## 7. Authentication & Authorization

### Password Security
- [ ] Verify bcrypt is used for password hashing
- [ ] Confirm password complexity requirements
- [ ] Test password reset flow
- [ ] Implement account lockout after failed attempts (optional)

### MFA Configuration
- [ ] Configure MFA settings:
  - [ ] `MFA_ISSUER_NAME`
  - [ ] `MFA_BACKUP_CODES_COUNT`
  - [ ] `MFA_RATE_LIMIT_ATTEMPTS`
  - [ ] `MFA_RATE_LIMIT_WINDOW_MINUTES`
- [ ] Enable MFA for admin accounts
- [ ] Test TOTP and SMS MFA flows
- [ ] Configure Twilio for SMS (if using):
  - [ ] `TWILIO_ACCOUNT_SID`
  - [ ] `TWILIO_AUTH_TOKEN`
  - [ ] `TWILIO_PHONE_NUMBER`

### Session Management
- [ ] Configure session timeout: `SESSION_TIMEOUT_MINUTES`
- [ ] Set maximum concurrent sessions: `MAX_CONCURRENT_SESSIONS`
- [ ] Configure trusted device duration: `TRUSTED_DEVICE_DAYS`
- [ ] Test session expiration and renewal

---

## 8. API Security

### API Key Management
- [ ] Review API key generation algorithm
- [ ] Implement API key rotation policy
- [ ] Set up API key expiration
- [ ] Monitor API key usage
- [ ] Document API key management procedures

### Input Validation
- [ ] Verify all endpoints validate input
- [ ] Test for SQL injection vulnerabilities
- [ ] Test for XSS vulnerabilities
- [ ] Test for CSRF vulnerabilities
- [ ] Implement request size limits

---

## 9. Logging & Monitoring

### Audit Logging
- [ ] Enable audit logging: `AUDIT_LOG_ENABLED=true`
- [ ] Configure audit log encryption: `AUDIT_LOG_ENCRYPTED=true`
- [ ] Set audit log retention: `AUDIT_LOG_RETENTION_DAYS=2555` (7 years)
- [ ] Log authentication attempts (success and failure)
- [ ] Log authorization failures
- [ ] Log sensitive operations (password changes, permission changes)
- [ ] Set up log aggregation (ELK, Splunk, CloudWatch)

### Security Monitoring
- [ ] Monitor failed authentication attempts
- [ ] Alert on unusual authentication patterns
- [ ] Monitor rate limit violations
- [ ] Track API key usage
- [ ] Set up security alerts
- [ ] Configure SIEM integration (optional)

### Log Configuration
- [ ] Set production log level: `LOG_LEVEL=INFO` or `WARNING`
- [ ] Configure log rotation
- [ ] Set up centralized logging
- [ ] Ensure sensitive data is masked in logs
- [ ] Test log aggregation pipeline

---

## 10. Compliance & Data Protection

### GDPR Compliance (if applicable)
- [ ] Enable GDPR compliance mode: `GDPR_COMPLIANCE=true`
- [ ] Implement data export functionality
- [ ] Implement data deletion functionality
- [ ] Document data retention policies
- [ ] Create privacy policy
- [ ] Implement cookie consent

### SOC2 Compliance (if applicable)
- [ ] Enable SOC2 compliance mode: `SOC2_COMPLIANCE=true`
- [ ] Implement required audit logging
- [ ] Document security controls
- [ ] Set up access reviews
- [ ] Implement change management procedures

### Data Encryption
- [ ] Enable encryption at rest for database
- [ ] Enable encryption in transit (HTTPS/TLS)
- [ ] Encrypt sensitive fields in database
- [ ] Configure audit log encryption
- [ ] Document encryption keys management

---

## 11. Backup & Disaster Recovery

### Backup Configuration
- [ ] Configure automated backups
- [ ] Set backup retention: `BACKUP_RETENTION_DAYS`
- [ ] Enable cross-region replication: `CROSS_REGION_REPLICATION=true`
- [ ] Test backup restoration
- [ ] Document backup procedures

### AWS Backup (if using)
- [ ] Configure AWS credentials:
  - [ ] `AWS_ACCESS_KEY_ID`
  - [ ] `AWS_SECRET_ACCESS_KEY`
  - [ ] `AWS_REGION`
- [ ] Set up S3 backup bucket: `S3_BACKUP_BUCKET`
- [ ] Configure replication bucket: `S3_BACKUP_REPLICATION_BUCKET`
- [ ] Set backup role ARN: `AWS_BACKUP_ROLE_ARN`

### Disaster Recovery
- [ ] Define RTO: `DR_RTO_MINUTES` (default: 120)
- [ ] Define RPO: `DR_RPO_MINUTES` (default: 60)
- [ ] Document disaster recovery procedures
- [ ] Test disaster recovery plan
- [ ] Train team on DR procedures

---

## 12. External Services Security

### Third-Party API Keys
- [ ] Secure storage of API keys (environment variables, secrets manager)
- [ ] Rotate API keys regularly
- [ ] Monitor API key usage
- [ ] Set up API key expiration alerts
- [ ] Document API key management

### Service Credentials
- [ ] Review all external service credentials
- [ ] Use least privilege principle
- [ ] Rotate credentials regularly
- [ ] Monitor for credential leaks
- [ ] Use secrets management service (AWS Secrets Manager, HashiCorp Vault)

---

## 13. Network Security

### Firewall Configuration
- [ ] Configure firewall rules
- [ ] Restrict database access to application servers
- [ ] Restrict Redis access to application servers
- [ ] Restrict admin endpoints to specific IPs (optional)
- [ ] Enable DDoS protection

### VPC Configuration (if using cloud)
- [ ] Configure VPC with private subnets
- [ ] Use security groups to restrict access
- [ ] Enable VPC flow logs
- [ ] Configure NAT gateway for outbound traffic
- [ ] Document network architecture

---

## 14. Dependency Security

### Dependency Scanning
- [ ] Run `pip-audit` or `safety` to check for vulnerabilities
  ```bash
  pip install pip-audit
  pip-audit
  ```
- [ ] Review and update vulnerable dependencies
- [ ] Set up automated dependency scanning (Dependabot, Snyk)
- [ ] Document dependency update procedures

### Dependency Pinning
- [ ] Pin all dependencies in `requirements.txt`
- [ ] Use `requirements-core.txt` for minimal dependencies
- [ ] Test with pinned versions
- [ ] Document dependency versions

---

## 15. Testing & Validation

### Security Testing
- [ ] Run security scan (OWASP ZAP, Burp Suite)
- [ ] Perform penetration testing
- [ ] Test authentication bypass attempts
- [ ] Test authorization bypass attempts
- [ ] Test rate limiting effectiveness
- [ ] Test CORS configuration
- [ ] Test input validation

### Load Testing
- [ ] Test rate limiting under load
- [ ] Test authentication under load
- [ ] Test database connection pooling
- [ ] Test Redis performance
- [ ] Document performance baselines

---

## 16. Documentation

### Security Documentation
- [ ] Document security architecture
- [ ] Document authentication flow
- [ ] Document authorization model
- [ ] Document rate limiting configuration
- [ ] Document incident response procedures
- [ ] Document security contacts

### Deployment Documentation
- [ ] Document production deployment steps
- [ ] Document rollback procedures
- [ ] Document environment variables
- [ ] Document service dependencies
- [ ] Document troubleshooting steps

---

## 17. Incident Response

### Incident Response Plan
- [ ] Define security incident categories
- [ ] Document incident response procedures
- [ ] Assign incident response roles
- [ ] Set up incident communication channels
- [ ] Document escalation procedures
- [ ] Test incident response plan

### Security Contacts
- [ ] Define security team contacts
- [ ] Set up security email (security@optibid.io)
- [ ] Document on-call procedures
- [ ] Set up alerting channels (PagerDuty, Slack)

---

## 18. Pre-Deployment Verification

### Final Checks
- [ ] Review all environment variables
- [ ] Verify no default passwords or keys
- [ ] Verify no debug mode enabled
- [ ] Verify no test data in production
- [ ] Review all security configurations
- [ ] Run final security scan
- [ ] Get security sign-off from team

### Post-Deployment Verification
- [ ] Verify HTTPS is working
- [ ] Verify CORS is configured correctly
- [ ] Verify rate limiting is working
- [ ] Verify authentication is working
- [ ] Verify authorization is working
- [ ] Verify logging is working
- [ ] Verify monitoring is working
- [ ] Verify backups are running

---

## Sign-Off

### Security Review Sign-Off
- [ ] Security review completed
- [ ] All critical items addressed
- [ ] All important items addressed
- [ ] Security documentation complete
- [ ] Team trained on security procedures

**Reviewed By:** ___________________________  
**Date:** ___________________________  
**Approved By:** ___________________________  
**Date:** ___________________________

---

## Notes

Use this space to document any deviations from the checklist or additional security measures implemented:

```
[Add notes here]
```

---

**Last Updated:** 2025-11-23  
**Version:** 1.0  
**Next Review:** Before each major release
