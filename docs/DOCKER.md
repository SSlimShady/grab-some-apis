# 🐳 Docker Compose Reference

This document explains every part of the `docker-compose.yml` file and how to use it effectively.

## 📋 **Services Overview**

| Service           | Purpose                  | When to Use           | Access URL            |
| ----------------- | ------------------------ | --------------------- | --------------------- |
| **redis**         | Caching & sessions       | Always (recommended)  | localhost:6379        |
| **postgres**      | Database                 | If not using Supabase | localhost:5432        |
| **redis-insight** | Redis management UI      | Database debugging    | http://localhost:8001 |
| **pgadmin**       | PostgreSQL management UI | Database management   | http://localhost:5050 |

## 🔴 **Redis Service**

### **Configuration**

```yaml
redis:
  image: redis:7-alpine
  container_name: grab-apis-redis
  ports: ['6379:6379']
```

### **What it does:**

- **API Caching**: Stores frequently requested data for faster responses
- **Rate Limiting**: Prevents API abuse by tracking request counts
- **Session Storage**: Manages user login sessions
- **Job Queues**: Handles background tasks and scheduled jobs
- **Temporary Data**: Stores ephemeral data that doesn't need persistence

### **Key Features:**

- **Password Protected**: Uses `redis_password` for security
- **Data Persistence**: `--appendonly yes` saves data to disk
- **Health Checks**: Automatically verifies Redis is responding
- **Always Available**: Starts with basic `docker-compose up`

### **Connection Details:**

```
Host: localhost
Port: 6379
Password: redis_password
URL: redis://:redis_password@localhost:6379
```

---

## 🐘 **PostgreSQL Service**

### **Configuration**

```yaml
postgres:
  image: postgres:16-alpine
  container_name: grab-apis-postgres
  ports: ['5432:5432']
  profiles: ['local-db']
```

### **What it does:**

- **Primary Database**: Stores all application data (users, APIs, settings)
- **ACID Compliance**: Ensures data consistency and reliability
- **SQL Support**: Full SQL database with advanced features
- **Local Development**: Alternative to cloud databases like Supabase

### **Key Features:**

- **Profile-Based**: Only starts when explicitly requested
- **Auto-Initialization**: Runs setup scripts on first start
- **Data Persistence**: All data survives container restarts
- **Health Monitoring**: Checks database readiness

### **Connection Details:**

```
Host: localhost
Port: 5432
Database: grab_apis_dev
Username: postgres
Password: postgres
URL: postgresql://postgres:postgres@localhost:5432/grab_apis_dev
```

### **When to Use:**

- ✅ Offline development
- ✅ Full control over database
- ✅ Testing database migrations
- ✅ Learning SQL and database concepts
- ❌ Don't use if you prefer Supabase features

---

## 🛠️ **Development Tools**

### **Redis Insight**

```yaml
redis-insight:
  image: redislabs/redisinsight:latest
  ports: ['8001:8001']
  profiles: ['tools']
```

**Purpose**: Visual Redis management interface  
**Access**: http://localhost:8001  
**Use for**:

- Viewing cached data
- Monitoring Redis performance
- Debugging cache issues
- Manual cache management

### **pgAdmin**

```yaml
pgadmin:
  image: dpage/pgadmin4:latest
  ports: ['5050:80']
  profiles: ['local-db', 'tools']
```

**Purpose**: PostgreSQL database administration  
**Access**: http://localhost:5050  
**Login**: admin@grab-apis.local / admin  
**Use for**:

- Creating/editing database tables
- Writing SQL queries
- Viewing database schema
- Managing database users and permissions

---

## 🗄️ **Data Persistence**

### **Docker Volumes**

```yaml
volumes:
  postgres_data: # PostgreSQL database files
  redis_data: # Redis cache and persistence files
  pgadmin_data: # pgAdmin settings and connections
  redis_insight_data: # Redis Insight configurations
```

### **What happens to your data:**

- ✅ **Survives container restarts** (docker-compose down/up)
- ✅ **Survives system reboots**
- ✅ **Survives Docker updates**
- ❌ **Lost with `pnpm docker:reset`** (removes volumes)

### **Data locations** (for reference):

- **Windows**: `C:\ProgramData\docker\volumes\`
- **Linux/Mac**: `/var/lib/docker/volumes/`

---

## 🌐 **Networking**

### **Custom Network**

```yaml
networks:
  grab-apis-network:
    driver: bridge
```

**Purpose**: Isolated network for container communication  
**Benefits**:

- Containers can talk to each other by name
- Isolated from other Docker networks
- Better security and organization

**Example**: Redis container can reach PostgreSQL as `postgres:5432`

---

## 📊 **Profiles Explained**

Profiles control which services start together:

### **Default Profile** (no profile needed)

```bash
docker-compose up -d
```

**Starts**: Redis only  
**Use for**: Supabase + Local Redis setups

### **local-db Profile**

```bash
docker-compose --profile local-db up -d
```

**Starts**: Redis + PostgreSQL  
**Use for**: Full local development

### **tools Profile**

```bash
docker-compose --profile tools up -d
```

**Starts**: Redis + PostgreSQL + pgAdmin + Redis Insight  
**Use for**: Database management and debugging

---

## 🚀 **Common Commands**

### **Start Services**

```bash
# Redis only
pnpm docker:redis

# PostgreSQL + Redis
pnpm docker:up

# Everything including tools
pnpm tools:up

# Custom combinations
docker-compose up -d redis                    # Redis only
docker-compose --profile local-db up -d       # Redis + PostgreSQL
docker-compose --profile tools up -d          # Everything
```

### **Stop Services**

```bash
# Stop all containers (keeps data)
pnpm docker:down

# Stop specific services
docker-compose stop redis
docker-compose stop postgres

# Stop and remove all data (DESTRUCTIVE)
pnpm docker:reset
```

### **Monitor Services**

```bash
# Check running containers
docker-compose ps

# View logs
docker-compose logs redis
docker-compose logs postgres

# Follow live logs
docker-compose logs -f redis
```

### **Troubleshooting**

```bash
# Restart specific service
docker-compose restart redis

# Rebuild containers (if images updated)
docker-compose up -d --force-recreate

# Check health status
docker-compose ps --filter health=healthy
```

---

## ⚡ **Health Checks**

Both Redis and PostgreSQL have health checks that ensure they're ready:

### **Redis Health Check**

```yaml
healthcheck:
  test: ['CMD', 'redis-cli', '--raw', 'incr', 'ping']
  interval: 10s
  timeout: 3s
  retries: 5
```

### **PostgreSQL Health Check**

```yaml
healthcheck:
  test: ['CMD-SHELL', 'pg_isready -U postgres -d grab_apis_dev']
  interval: 10s
  timeout: 5s
  retries: 5
```

**Benefits**:

- Other services wait for dependencies to be ready
- Docker can detect and restart unhealthy containers
- Your applications get reliable service availability

---

## 🔧 **Customization**

### **Change Passwords**

Edit the docker-compose.yml file:

```yaml
# For Redis
command: redis-server --appendonly yes --requirepass YOUR_PASSWORD

# For PostgreSQL
environment:
  POSTGRES_PASSWORD: YOUR_PASSWORD
```

### **Change Ports**

```yaml
# Change Redis port from 6379 to 6380
ports:
  - "6380:6379"

# Change PostgreSQL port from 5432 to 5433
ports:
  - "5433:5432"
```

### **Add Environment Variables**

```yaml
postgres:
  environment:
    POSTGRES_DB: grab_apis_dev
    POSTGRES_USER: postgres
    POSTGRES_PASSWORD: postgres
    TZ: America/New_York # Add timezone
    POSTGRES_MAX_CONNECTIONS: 200 # Add custom settings
```

---

## 🎯 **Best Practices**

### **For Development**

1. **Use profiles**: Start only what you need
2. **Monitor health**: Check `docker-compose ps` regularly
3. **Clean up**: Use `pnpm docker:reset` when things break
4. **Check logs**: Use `docker-compose logs` for debugging

### **For Team Collaboration**

1. **Document changes**: Update this file when modifying docker-compose.yml
2. **Version control**: Commit docker-compose.yml changes
3. **Share credentials**: Update team on password changes
4. **Standardize**: Use the same Docker version across team

### **For Production**

- Don't use this docker-compose.yml for production
- Use managed services (Supabase, Upstash) in production
- This setup is optimized for development only

---

## 🆘 **Troubleshooting Guide**

### **Container won't start**

```bash
# Check logs for errors
docker-compose logs SERVICE_NAME

# Try recreating the container
docker-compose up -d --force-recreate SERVICE_NAME
```

### **Port already in use**

```bash
# Find what's using the port
netstat -an | findstr :5432   # Windows
lsof -i :5432                 # Mac/Linux

# Change port in docker-compose.yml or stop the conflicting service
```

### **Data corruption/weird behavior**

```bash
# Nuclear option - reset everything
pnpm docker:reset
pnpm docker:up
```

### **Can't connect from application**

1. Check if containers are running: `docker-compose ps`
2. Verify health status: All should show "healthy"
3. Check network connectivity: `docker-compose exec redis redis-cli ping`
4. Verify connection strings match the documented URLs above
