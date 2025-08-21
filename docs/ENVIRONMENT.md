# Environment Configuration Guide

This project supports flexible switching between local and cloud services. You can use any
combination of:

- **Database**: Local PostgreSQL (Docker) or Supabase (Cloud)
- **Redis**: Local Redis (Docker) or Upstash (Cloud)

## Quick Setup

### 1. Environment Configuration

Create your `.env` file:

```bash
# Copy from example
cp .env.example .env

# Or use the environment switcher
pnpm env:local    # Sets up for full local development
pnpm env:cloud    # Sets up for full cloud services
```

### 2. Configure Your Services

Edit `.env` and set your credentials:

```env
# For Supabase (if using DB_MODE="supabase")
SUPABASE_URL="your-project-url"
SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# For Upstash (if using REDIS_MODE="upstash")
UPSTASH_REDIS_REST_URL="your-rest-url"
UPSTASH_REDIS_REST_TOKEN="your-rest-token"
```

## Development Workflows

### Full Local Development

Everything runs in Docker:

```bash
pnpm env:local     # Switch to local config
pnpm dev:local     # Start all services + development
```

### Hybrid Development Options

Mix and match services:

#### Supabase + Local Redis

```bash
pnpm env:switch --db=supabase --redis=local
pnpm dev:supabase
```

#### Local PostgreSQL + Upstash Redis

```bash
pnpm env:switch --db=local --redis=upstash
pnpm dev:upstash
```

### Full Cloud Development

No Docker required:

```bash
pnpm env:cloud     # Switch to cloud config
pnpm dev:cloud     # Start development (cloud services)
```

## Environment Switcher Commands

### Presets

```bash
pnpm env:local     # Local PostgreSQL + Local Redis
pnpm env:cloud     # Supabase + Upstash
```

### Custom Configuration

```bash
# Switch individual services
pnpm env:switch --db=supabase --redis=local
pnpm env:switch --db=local --redis=upstash

# Check current configuration
pnpm env:status
```

### Advanced Usage

```bash
# Using the tool directly
node tools/switch-env.js --preset=full-local
node tools/switch-env.js --db=supabase --redis=upstash
node tools/switch-env.js --status
node tools/switch-env.js --help
```

## Service Management

### Docker Services

```bash
# Start services based on current config
pnpm services:local    # PostgreSQL + Redis
pnpm services:hybrid   # Only Redis (for Supabase + Local Redis)

# Individual services
pnpm postgres:up       # Local PostgreSQL
pnpm redis:up          # Local Redis

# Stop services
pnpm services:down     # Stop all Docker services
pnpm services:reset    # Stop and remove volumes
```

### Development Tools

```bash
# Optional development tools (pgAdmin, Redis Commander)
pnpm tools:up          # Start development tools
pnpm tools:down        # Stop development tools
```

## Configuration Modes

### Database Modes

#### `DB_MODE="local"`

- Uses PostgreSQL in Docker
- Connection: `postgresql://postgres:postgres@localhost:5432/grab_some_apis`
- Automatic database creation
- Persistent data with Docker volumes

#### `DB_MODE="supabase"`

- Uses Supabase PostgreSQL
- Requires `SUPABASE_URL` and `SUPABASE_ANON_KEY`
- Built-in auth, real-time, and APIs
- Managed scaling and backups

### Redis Modes

#### `REDIS_MODE="local"`

- Uses Redis in Docker
- Connection: `redis://localhost:6379`
- Persistent data with Docker volumes
- Redis Commander UI available

#### `REDIS_MODE="upstash"`

- Uses Upstash Redis
- Requires `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
- Serverless Redis with HTTP API
- Global edge locations

## Best Practices

### Development

- Use **local** services for offline development
- Use **hybrid** when you need specific cloud features
- Use **cloud** services for production-like testing

### Team Collaboration

- Keep `.env.example` updated with latest variables
- Document any new environment variables
- Use presets for consistent team setups

### CI/CD

- Use cloud services in CI/CD pipelines
- Mock services for unit tests
- Use Docker services for integration tests

## Troubleshooting

### Docker Issues

```bash
# Reset everything
pnpm services:reset
pnpm clean:install

# Check Docker status
docker compose ps
docker compose logs postgres
docker compose logs redis
```

### Environment Issues

```bash
# Check current configuration
pnpm env:status

# Reset to known good state
pnpm env:local
cat .env
```

### Service Connection Issues

```bash
# Test PostgreSQL connection
docker compose exec postgres psql -U postgres -d grab_some_apis

# Test Redis connection
docker compose exec redis redis-cli ping
```

## Environment Variables Reference

### Core Configuration

- `DB_MODE`: `"local"` | `"supabase"`
- `REDIS_MODE`: `"local"` | `"upstash"`
- `NODE_ENV`: `"development"` | `"production"` | `"test"`

### Database URLs (Auto-generated)

- `DATABASE_URL`: Full database connection URL
- `REDIS_URL`: Full Redis connection URL

### Supabase Configuration

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key

### Upstash Configuration

- `UPSTASH_REDIS_REST_URL`: Upstash Redis REST URL
- `UPSTASH_REDIS_REST_TOKEN`: Upstash Redis REST token

### Local Service Configuration

- `POSTGRES_USER`: PostgreSQL username (default: postgres)
- `POSTGRES_PASSWORD`: PostgreSQL password (default: postgres)
- `POSTGRES_DB`: PostgreSQL database name (default: grab_some_apis)
