# OptiBid Energy Platform - Troubleshooting Guide

This guide provides solutions to common issues encountered when running the OptiBid Energy Platform.

## Table of Contents

1. [Backend Issues](#backend-issues)
2. [Frontend Issues](#frontend-issues)
3. [Database Issues](#database-issues)
4. [Service Connection Issues](#service-connection-issues)
5. [WebSocket Issues](#websocket-issues)
6. [Authentication Issues](#authentication-issues)
7. [Performance Issues](#performance-issues)
8. [Docker & Container Issues](#docker--container-issues)

---

## Backend Issues

### Issue: Backend Hangs on Startup

**Symptoms:**
- Backend starts but never becomes responsive
- No error messages in logs
- Health check endpoint times out

**Root Cause:**
Backend is trying to connect to optional services (Redis, Kafka, ClickHouse) that are not running, causing connection timeouts.

**Solution:**

1. **Check which services are enabled:**
   ```bash
   cat backend/.env | grep ENABLE_
   ```

2. **Disable optional services if not running:**
   ```bash
   # Edit backend/.env
   ENABLE_REDIS=false
   ENABLE_KAFKA=false
   ENABLE_CLICKHOUSE=false
   ENABLE_MLFLOW=false
   ```

3. **Restart backend:**
   ```bash
   cd backend
   uvicorn main:app --reload
   ```

4. **Verify startup:**
   ```bash
   curl http://localhost:8000/health
   ```

**Expected Output:**
```json
{
  "status": "healthy",
  "services": {
    "database": "available",
    "redis": "unavailable",
    "kafka": "unavailable",
    "clickhouse": "unavailable"
  }
}
```

### Issue: Backend Crashes with "Connection Refused"

**Symptoms:**
- Backend starts but crashes immediately
- Error: `Connection refused` or `Cannot connect to database`

**Root Cause:**
PostgreSQL is not running or connection string is incorrect.

**Solution:**

1. **Check if PostgreSQL is running:**
   ```bash
   # Linux
   sudo systemctl status postgresql
   
   # macOS
   brew services list | grep postgresql
   
   # Windows
   sc query postgresql-x64-14
   ```

2. **Start PostgreSQL if not running:**
   ```bash
   # Linux
   sudo systemctl start postgresql
   
   # macOS
   brew services start postgresql@14
   
   # Windows
   net start postgresql-x64-14
   ```

3. **Verify database exists:**
   ```bash
   psql -U postgres -l | grep optibid
   ```

4. **Check connection string in `.env`:**
   ```bash
   DATABASE_URL=postgresql+asyncpg://optibid:optibid_password@localhost:5432/optibid
   ```

5. **Test connection manually:**
   ```bash
   psql -U optibid -d optibid -h localhost
   ```

### Issue: Import Errors or Module Not Found

**Symptoms:**
- `ModuleNotFoundError: No module named 'fastapi'`
- `ImportError: cannot import name 'X' from 'Y'`

**Solution:**

1. **Verify Python version:**
   ```bash
   python --version  # Should be 3.11+
   ```

2. **Reinstall dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. **Check virtual environment:**
   ```bash
   # Create virtual environment if not exists
   python -m venv venv
   
   # Activate
   source venv/bin/activate  # Linux/macOS
   venv\Scripts\activate     # Windows
   
   # Install dependencies
   pip install -r requirements.txt
   ```

### Issue: "Port 8000 Already in Use"

**Symptoms:**
- `OSError: [Errno 48] Address already in use`

**Solution:**

1. **Find process using port 8000:**
   ```bash
   # Linux/macOS
   lsof -i :8000
   
   # Windows
   netstat -ano | findstr :8000
   ```

2. **Kill the process:**
   ```bash
   # Linux/macOS
   kill -9 <PID>
   
   # Windows
   taskkill /PID <PID> /F
   ```

3. **Or use a different port:**
   ```bash
   uvicorn main:app --reload --port 8001
   ```

---

## Frontend Issues

### Issue: Styles Not Loading / Blank Page

**Symptoms:**
- Page loads but has no styling
- Console shows 404 errors for CSS files
- Hard refresh (Ctrl+Shift+R) temporarily fixes it

**Root Cause:**
Browser cache is serving stale assets, or Next.js build didn't generate proper asset hashes.

**Solution:**

1. **Clear browser cache:**
   - Chrome: Ctrl+Shift+Delete → Clear browsing data
   - Firefox: Ctrl+Shift+Delete → Clear cache
   - Safari: Cmd+Option+E

2. **Clear Next.js cache:**
   ```bash
   cd frontend
   rm -rf .next
   npm run build
   npm run dev
   ```

3. **Disable cache in development:**
   - Open browser DevTools (F12)
   - Go to Network tab
   - Check "Disable cache"

4. **Verify asset hashes are generated:**
   ```bash
   cd frontend/.next/static
   ls -la
   # Should see files with hashes like: main-abc123.js
   ```

5. **Check Next.js configuration:**
   ```javascript
   // frontend/next.config.js
   module.exports = {
     generateBuildId: async () => {
       return `build-${Date.now()}`
     }
   }
   ```

### Issue: "Cannot Connect to Backend API"

**Symptoms:**
- Frontend loads but shows "Network Error"
- API calls fail with CORS errors
- Console shows `ERR_CONNECTION_REFUSED`

**Solution:**

1. **Verify backend is running:**
   ```bash
   curl http://localhost:8000/health
   ```

2. **Check API URL in frontend:**
   ```bash
   # frontend/.env.local
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

3. **Check CORS configuration in backend:**
   ```python
   # backend/main.py
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["http://localhost:3000"],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

4. **Restart both services:**
   ```bash
   # Terminal 1
   cd backend
   uvicorn main:app --reload
   
   # Terminal 2
   cd frontend
   npm run dev
   ```

### Issue: "Port 3000 Already in Use"

**Symptoms:**
- `Error: listen EADDRINUSE: address already in use :::3000`

**Solution:**

1. **Find and kill process:**
   ```bash
   # Linux/macOS
   lsof -ti:3000 | xargs kill -9
   
   # Windows
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   ```

2. **Or use different port:**
   ```bash
   PORT=3001 npm run dev
   ```

---

## Database Issues

### Issue: "Database Does Not Exist"

**Symptoms:**
- `FATAL: database "optibid" does not exist`

**Solution:**

1. **Create database:**
   ```bash
   psql -U postgres
   CREATE DATABASE optibid;
   CREATE USER optibid WITH PASSWORD 'optibid_password';
   GRANT ALL PRIVILEGES ON DATABASE optibid TO optibid;
   \q
   ```

2. **Verify database exists:**
   ```bash
   psql -U postgres -l | grep optibid
   ```

### Issue: "Relation Does Not Exist" / Missing Tables

**Symptoms:**
- `relation "users" does not exist`
- API calls fail with database errors

**Root Cause:**
Database migrations have not been run.

**Solution:**

1. **Check migration status:**
   ```bash
   cd backend
   python -m alembic current
   ```

2. **Run migrations:**
   ```bash
   python -m alembic upgrade head
   ```

3. **Verify tables exist:**
   ```bash
   psql -U optibid -d optibid
   \dt
   # Should show 25+ tables
   ```

4. **If migrations fail, reset database (DEVELOPMENT ONLY):**
   ```bash
   # WARNING: This deletes all data
   psql -U postgres
   DROP DATABASE optibid;
   CREATE DATABASE optibid;
   GRANT ALL PRIVILEGES ON DATABASE optibid TO optibid;
   \q
   
   # Run migrations
   cd backend
   python -m alembic upgrade head
   ```

### Issue: "Too Many Connections"

**Symptoms:**
- `FATAL: sorry, too many clients already`

**Solution:**

1. **Check current connections:**
   ```sql
   SELECT count(*) FROM pg_stat_activity;
   ```

2. **Kill idle connections:**
   ```sql
   SELECT pg_terminate_backend(pid)
   FROM pg_stat_activity
   WHERE state = 'idle'
   AND state_change < current_timestamp - INTERVAL '5 minutes';
   ```

3. **Increase max connections (if needed):**
   ```bash
   # Edit postgresql.conf
   max_connections = 200
   
   # Restart PostgreSQL
   sudo systemctl restart postgresql
   ```

4. **Use connection pooling:**
   ```bash
   # Install PgBouncer
   sudo apt-get install pgbouncer
   
   # Configure in backend/.env
   DATABASE_URL=postgresql+asyncpg://optibid:password@localhost:6432/optibid
   ```

---

## Service Connection Issues

### Issue: Redis Connection Failed

**Symptoms:**
- `ConnectionError: Error connecting to Redis`
- Backend logs show Redis warnings

**Solution:**

1. **Check if Redis is running:**
   ```bash
   redis-cli ping
   # Should return: PONG
   ```

2. **Start Redis:**
   ```bash
   # Linux
   sudo systemctl start redis
   
   # macOS
   brew services start redis
   
   # Windows
   redis-server
   ```

3. **Verify Redis URL:**
   ```bash
   # backend/.env
   REDIS_URL=redis://localhost:6379/0
   ```

4. **Test connection:**
   ```bash
   redis-cli -u redis://localhost:6379/0
   ```

5. **If Redis not needed, disable it:**
   ```bash
   # backend/.env
   ENABLE_REDIS=false
   ```

### Issue: Kafka Connection Failed

**Symptoms:**
- `KafkaConnectionError: Unable to bootstrap from [('localhost', 9092)]`

**Solution:**

1. **Check if Kafka is running:**
   ```bash
   # Check Zookeeper
   echo stat | nc localhost 2181
   
   # Check Kafka
   kafka-topics.sh --list --bootstrap-server localhost:9092
   ```

2. **Start Kafka:**
   ```bash
   # Start Zookeeper first
   zookeeper-server-start.sh config/zookeeper.properties
   
   # Then start Kafka
   kafka-server-start.sh config/server.properties
   ```

3. **If Kafka not needed, disable it:**
   ```bash
   # backend/.env
   ENABLE_KAFKA=false
   ```

### Issue: ClickHouse Connection Failed

**Symptoms:**
- `ClickHouseError: Connection refused`
- Analytics endpoints return errors

**Solution:**

1. **Check if ClickHouse is running:**
   ```bash
   curl http://localhost:8123/ping
   # Should return: Ok.
   ```

2. **Start ClickHouse:**
   ```bash
   sudo systemctl start clickhouse-server
   ```

3. **Check logs:**
   ```bash
   sudo tail -f /var/log/clickhouse-server/clickhouse-server.log
   ```

4. **If ClickHouse not needed, disable it:**
   ```bash
   # backend/.env
   ENABLE_CLICKHOUSE=false
   ```

---

## WebSocket Issues

### Issue: WebSocket Connection Fails

**Symptoms:**
- Real-time updates not working
- Console shows `WebSocket connection failed`
- Error: `WebSocket is closed before the connection is established`

**Solution:**

1. **Verify WebSocket endpoint:**
   ```bash
   # Test with wscat
   npm install -g wscat
   wscat -c ws://localhost:8000/api/ws/ws/market/PJM
   ```

2. **Check WebSocket is enabled:**
   ```bash
   # backend/.env
   ENABLE_WEBSOCKET=true
   ```

3. **Verify backend WebSocket route:**
   ```bash
   curl http://localhost:8000/api/ws/ws/stats
   ```

4. **Check frontend WebSocket URL:**
   ```javascript
   // frontend/.env.local
   NEXT_PUBLIC_WS_URL=ws://localhost:8000
   ```

5. **Check for proxy/firewall blocking WebSocket:**
   - Ensure WebSocket upgrade headers are allowed
   - Check nginx/load balancer configuration

### Issue: WebSocket Disconnects Frequently

**Symptoms:**
- Connection established but drops after a few seconds
- Constant reconnection attempts

**Solution:**

1. **Check backend logs for errors:**
   ```bash
   cd backend
   tail -f logs/app.log
   ```

2. **Increase timeout settings:**
   ```python
   # backend/app/services/websocket_manager.py
   WEBSOCKET_TIMEOUT = 300  # 5 minutes
   ```

3. **Implement heartbeat/ping:**
   ```javascript
   // Frontend
   setInterval(() => {
     if (socket.readyState === WebSocket.OPEN) {
       socket.send(JSON.stringify({ type: 'ping' }));
     }
   }, 30000);  // Every 30 seconds
   ```

4. **Check Redis connection (if using Redis for WebSocket state):**
   ```bash
   redis-cli ping
   ```

### Issue: WebSocket Messages Not Received

**Symptoms:**
- Connection established
- No errors in console
- But no messages received

**Solution:**

1. **Verify subscription:**
   ```javascript
   // Check that you're subscribed to the correct channel
   socket.send(JSON.stringify({
     type: 'subscribe',
     market_zone: 'PJM'
   }));
   ```

2. **Check backend is broadcasting:**
   ```bash
   # Test broadcast endpoint
   curl -X POST http://localhost:8000/api/ws/ws/broadcast/price \
     -H "Content-Type: application/json" \
     -d '{"market_zone": "PJM", "price": 50.5}'
   ```

3. **Verify message handler:**
   ```javascript
   socket.onmessage = (event) => {
     console.log('Received:', event.data);
     const data = JSON.parse(event.data);
     // Handle message
   };
   ```

---

## Authentication Issues

### Issue: "Invalid Credentials" on Login

**Symptoms:**
- Login fails with correct username/password
- Error: `Invalid credentials`

**Solution:**

1. **Verify user exists:**
   ```sql
   psql -U optibid -d optibid
   SELECT email, is_active FROM users WHERE email = 'user@example.com';
   ```

2. **Check if user is active:**
   ```sql
   UPDATE users SET is_active = true WHERE email = 'user@example.com';
   ```

3. **Reset password:**
   ```bash
   cd backend
   python scripts/reset_password.py user@example.com newpassword
   ```

4. **Create test user:**
   ```bash
   cd backend
   python scripts/seed_test_users.py
   ```

### Issue: "Token Expired" or "Invalid Token"

**Symptoms:**
- API calls fail with 401 Unauthorized
- Error: `Token has expired` or `Invalid token`

**Solution:**

1. **Check token expiration settings:**
   ```bash
   # backend/.env
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   REFRESH_TOKEN_EXPIRE_DAYS=7
   ```

2. **Implement token refresh:**
   ```javascript
   // Frontend
   async function refreshToken() {
     const response = await fetch('/api/auth/refresh', {
       method: 'POST',
       headers: {
         'Authorization': `Bearer ${refreshToken}`
       }
     });
     const data = await response.json();
     localStorage.setItem('access_token', data.access_token);
   }
   ```

3. **Clear tokens and re-login:**
   ```javascript
   localStorage.removeItem('access_token');
   localStorage.removeItem('refresh_token');
   // Redirect to login
   ```

### Issue: CORS Errors on Authentication

**Symptoms:**
- Login request blocked by CORS
- Error: `Access to fetch at '...' from origin '...' has been blocked by CORS policy`

**Solution:**

1. **Update CORS settings:**
   ```python
   # backend/main.py
   app.add_middleware(
       CORSMiddleware,
       allow_origins=[
           "http://localhost:3000",
           "http://127.0.0.1:3000"
       ],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

2. **Verify frontend is sending credentials:**
   ```javascript
   fetch('/api/auth/login', {
     method: 'POST',
     credentials: 'include',  // Important!
     headers: {
       'Content-Type': 'application/json'
     },
     body: JSON.stringify({ email, password })
   });
   ```

---

## Performance Issues

### Issue: Slow API Response Times

**Symptoms:**
- API calls take > 1 second
- Page loads slowly
- Timeout errors

**Solution:**

1. **Enable Redis caching:**
   ```bash
   # backend/.env
   ENABLE_REDIS=true
   REDIS_URL=redis://localhost:6379/0
   ```

2. **Check database query performance:**
   ```sql
   -- Enable query logging
   ALTER SYSTEM SET log_min_duration_statement = 100;  -- Log queries > 100ms
   SELECT pg_reload_conf();
   
   -- Check slow queries
   SELECT query, mean_exec_time, calls
   FROM pg_stat_statements
   ORDER BY mean_exec_time DESC
   LIMIT 10;
   ```

3. **Add database indexes:**
   ```sql
   -- Example: Add index on frequently queried column
   CREATE INDEX idx_market_data_timestamp ON market_data(timestamp);
   CREATE INDEX idx_bids_user_id ON bids(user_id);
   ```

4. **Use connection pooling:**
   ```python
   # backend/app/core/database.py
   engine = create_async_engine(
       DATABASE_URL,
       pool_size=20,
       max_overflow=10,
       pool_pre_ping=True
   )
   ```

5. **Monitor resource usage:**
   ```bash
   # Check CPU/Memory
   top
   
   # Check disk I/O
   iostat -x 1
   ```

### Issue: High Memory Usage

**Symptoms:**
- Backend process using > 1GB RAM
- System becomes slow
- Out of memory errors

**Solution:**

1. **Check for memory leaks:**
   ```bash
   # Use memory profiler
   pip install memory-profiler
   python -m memory_profiler main.py
   ```

2. **Limit query result sizes:**
   ```python
   # Add pagination
   @app.get("/api/items")
   async def get_items(skip: int = 0, limit: int = 100):
       return await crud.get_items(skip=skip, limit=limit)
   ```

3. **Clear caches periodically:**
   ```python
   # Implement cache eviction
   @app.on_event("startup")
   async def clear_old_cache():
       await redis.flushdb()
   ```

4. **Optimize data structures:**
   ```python
   # Use generators instead of lists for large datasets
   def get_large_dataset():
       for item in query.yield_per(1000):
           yield item
   ```

---

## Docker & Container Issues

### Issue: Docker Compose Services Not Starting

**Symptoms:**
- `docker-compose up` fails
- Services exit immediately
- Health checks failing

**Solution:**

1. **Check logs:**
   ```bash
   docker-compose logs <service-name>
   ```

2. **Verify Docker is running:**
   ```bash
   docker ps
   ```

3. **Check port conflicts:**
   ```bash
   # See what's using ports
   docker-compose ps
   netstat -tulpn | grep LISTEN
   ```

4. **Rebuild containers:**
   ```bash
   docker-compose down
   docker-compose build --no-cache
   docker-compose up -d
   ```

5. **Check disk space:**
   ```bash
   df -h
   docker system df
   
   # Clean up if needed
   docker system prune -a
   ```

### Issue: Cannot Connect to Services in Docker

**Symptoms:**
- Backend can't connect to PostgreSQL
- Services can't communicate

**Solution:**

1. **Use service names, not localhost:**
   ```bash
   # backend/.env (in Docker)
   DATABASE_URL=postgresql+asyncpg://optibid:password@postgres:5432/optibid
   REDIS_URL=redis://redis:6379/0
   ```

2. **Check Docker network:**
   ```bash
   docker network ls
   docker network inspect <network-name>
   ```

3. **Verify services are on same network:**
   ```yaml
   # docker-compose.yml
   services:
     backend:
       networks:
         - optibid-network
     postgres:
       networks:
         - optibid-network
   
   networks:
     optibid-network:
       driver: bridge
   ```

### Issue: Docker Container Keeps Restarting

**Symptoms:**
- Container starts then immediately exits
- Restart loop

**Solution:**

1. **Check container logs:**
   ```bash
   docker logs <container-id>
   ```

2. **Run container interactively:**
   ```bash
   docker run -it <image-name> /bin/bash
   ```

3. **Check health check:**
   ```yaml
   # docker-compose.yml
   healthcheck:
     test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
     interval: 30s
     timeout: 10s
     retries: 3
     start_period: 40s
   ```

4. **Increase resource limits:**
   ```yaml
   # docker-compose.yml
   services:
     backend:
       deploy:
         resources:
           limits:
             memory: 2G
           reservations:
             memory: 1G
   ```

---

## Getting Help

If you're still experiencing issues:

1. **Check logs:**
   - Backend: `backend/logs/app.log`
   - Frontend: Browser console (F12)
   - Database: PostgreSQL logs
   - Docker: `docker-compose logs`

2. **Enable debug mode:**
   ```bash
   # backend/.env
   DEBUG=true
   LOG_LEVEL=DEBUG
   ```

3. **Run health checks:**
   ```bash
   curl http://localhost:8000/health
   ```

4. **Check system resources:**
   ```bash
   # CPU, Memory, Disk
   top
   df -h
   free -h
   ```

5. **Verify all environment variables:**
   ```bash
   cd backend
   cat .env
   ```

6. **Test individual components:**
   - Database: `psql -U optibid -d optibid`
   - Redis: `redis-cli ping`
   - Backend: `curl http://localhost:8000/health`
   - Frontend: Open http://localhost:3000

7. **Create a minimal reproduction:**
   - Start with minimal deployment (PostgreSQL only)
   - Add services one by one
   - Identify which service causes the issue

8. **Contact support:**
   - Include error messages
   - Include relevant logs
   - Include environment details (OS, versions)
   - Include steps to reproduce

---

## Common Error Messages

| Error | Likely Cause | Solution |
|-------|--------------|----------|
| `Connection refused` | Service not running | Start the service |
| `Port already in use` | Another process using port | Kill process or use different port |
| `Module not found` | Missing dependencies | Run `pip install -r requirements.txt` |
| `Database does not exist` | Database not created | Create database with `CREATE DATABASE` |
| `Relation does not exist` | Migrations not run | Run `alembic upgrade head` |
| `Invalid credentials` | Wrong username/password | Check credentials or reset password |
| `Token expired` | JWT token expired | Refresh token or re-login |
| `CORS error` | CORS not configured | Update CORS settings in backend |
| `WebSocket closed` | WebSocket connection failed | Check WebSocket configuration |
| `Out of memory` | Memory leak or high usage | Optimize queries, add pagination |

---

## Preventive Measures

To avoid common issues:

1. **Always use environment variables** - Never hardcode configuration
2. **Run health checks regularly** - Monitor service status
3. **Keep dependencies updated** - But test before updating
4. **Use connection pooling** - For database connections
5. **Implement proper error handling** - Catch and log errors
6. **Monitor resource usage** - CPU, memory, disk
7. **Set up logging** - Centralized logging for debugging
8. **Use version control** - Track configuration changes
9. **Document customizations** - Keep notes on changes
10. **Test in staging first** - Before deploying to production
