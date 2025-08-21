# 📋 Package.json Scripts Reference

This document explains every script in `package.json` and what it does.

## 🚀 **Development Scripts**

### **`pnpm dev`**

```bash
pnpm dev
```

**Command:** `turbo dev`  
**Purpose:** Start all apps (Next.js frontend + FastAPI backend) in development mode  
**When to use:** Daily development when you want both frontend and backend running

### **`pnpm dev:web`**

```bash
pnpm dev:web
```

**Command:** `turbo dev --filter=web`  
**Purpose:** Start only the Next.js frontend in development mode  
**When to use:** Frontend-only development, API testing with external tools

### **`pnpm dev:api`**

```bash
pnpm dev:api
```

**Command:** `turbo dev --filter=api`  
**Purpose:** Start only the FastAPI backend in development mode  
**When to use:** Backend-only development, API development without frontend

---

## 🏗️ **Build & Test Scripts**

### **`pnpm build`**

```bash
pnpm build
```

**Command:** `turbo build`  
**Purpose:** Build all apps for production  
**When to use:** Before deployment, testing production builds

### **`pnpm test`**

```bash
pnpm test
```

**Command:** `turbo test`  
**Purpose:** Run all tests across the monorepo (unit tests, integration tests)  
**When to use:** Before committing code, in CI/CD pipelines

### **`pnpm test:watch`**

```bash
pnpm test:watch
```

**Command:** `turbo test:watch`  
**Purpose:** Run tests in watch mode (re-runs tests when files change)  
**When to use:** During development for immediate feedback on code changes

### **`pnpm test:e2e`**

```bash
pnpm test:e2e
```

**Command:** `turbo test:e2e`  
**Purpose:** Run end-to-end tests using Playwright  
**When to use:** Testing full user workflows, before releases

---

## 🧹 **Code Quality Scripts**

### **`pnpm lint`**

```bash
pnpm lint
```

**Command:** `turbo lint`  
**Purpose:** Check code for linting errors (ESLint rules)  
**When to use:** Before committing, finding code style issues

### **`pnpm lint:fix`**

```bash
pnpm lint:fix
```

**Command:** `turbo lint:fix`  
**Purpose:** Automatically fix auto-fixable linting errors  
**When to use:** After writing code to fix common style issues

### **`pnpm type-check`**

```bash
pnpm type-check
```

**Command:** `turbo type-check`  
**Purpose:** Run TypeScript type checking without building  
**When to use:** Verifying TypeScript types, finding type errors

### **`pnpm format`**

```bash
pnpm format
```

**Command:** `prettier --write "**/*.{ts,tsx,js,jsx,md,json,yaml,yml}"`  
**Purpose:** Format all files with Prettier (auto-fixes formatting)  
**When to use:** Before committing to ensure consistent code formatting

### **`pnpm format:check`**

```bash
pnpm format:check
```

**Command:** `prettier --check "**/*.{ts,tsx,js,jsx,md,json,yaml,yml}"`  
**Purpose:** Check if files are formatted correctly (doesn't change files)  
**When to use:** In CI/CD to ensure code is properly formatted

---

## 🧽 **Cleanup Scripts**

### **`pnpm clean`**

```bash
pnpm clean
```

**Command:** `turbo clean && rimraf node_modules .turbo`  
**Purpose:** Delete all build outputs, node_modules, and Turbo cache  
**When to use:** When things break, starting fresh, troubleshooting

### **`pnpm clean:install`**

```bash
pnpm clean:install
```

**Command:** `pnpm clean && pnpm install`  
**Purpose:** Clean everything and reinstall all dependencies  
**When to use:** When dependencies are corrupted, after package.json changes

---

## 🐳 **Docker Scripts (for local databases)**

### **`pnpm docker:up`**

```bash
pnpm docker:up
```

**Command:** `docker-compose --profile local-db up -d`  
**Purpose:** Start PostgreSQL + Redis containers in the background  
**When to use:** Setting up local development environment

### **`pnpm docker:down`**

```bash
pnpm docker:down
```

**Command:** `docker-compose down`  
**Purpose:** Stop all Docker containers (keeps data)  
**When to use:** When done developing, stopping services

### **`pnpm docker:reset`**

```bash
pnpm docker:reset
```

**Command:** `docker-compose down -v`  
**Purpose:** Stop containers and delete all data volumes (DESTRUCTIVE)  
**When to use:** Starting completely fresh, clearing test data

### **`pnpm docker:redis`**

```bash
pnpm docker:redis
```

**Command:** `docker-compose up -d redis`  
**Purpose:** Start only the Redis container  
**When to use:** When using Supabase for PostgreSQL but local Redis

### **`pnpm docker:postgres`**

```bash
pnpm docker:postgres
```

**Command:** `docker-compose --profile local-db up -d postgres`  
**Purpose:** Start only the PostgreSQL container  
**When to use:** When using Upstash for Redis but local PostgreSQL

---

## 🛠️ **Development Tools Scripts**

### **`pnpm tools:up`**

```bash
pnpm tools:up
```

**Command:** `docker-compose --profile tools up -d`  
**Purpose:** Start pgAdmin + Redis Insight web UIs  
**When to use:** When you need visual database management tools

### **`pnpm tools:down`**

```bash
pnpm tools:down
```

**Command:** `docker-compose --profile tools down`  
**Purpose:** Stop development tools (pgAdmin, Redis Insight)  
**When to use:** When done using database management tools

---

## 🌍 **Environment-Specific Development**

### **`pnpm dev:local`**

```bash
pnpm dev:local
```

**Command:**
`docker-compose up -d redis && docker-compose --profile local-db up -d postgres && turbo dev`  
**Purpose:** Start local Redis + PostgreSQL + all apps  
**When to use:** Full local development (no cloud dependencies)

### **`pnpm dev:cloud`**

```bash
pnpm dev:cloud
```

**Command:** `turbo dev`  
**Purpose:** Start apps using cloud services (Supabase + Upstash)  
**When to use:** Development with cloud databases (no Docker needed)

---

## ⚙️ **Environment Management Scripts**

### **`pnpm env:switch`**

```bash
pnpm env:switch
```

**Command:** `node tools/switch-env.js`  
**Purpose:** Interactive tool to switch between local/cloud services  
**When to use:** Switching database configurations

### **`pnpm env:status`**

```bash
pnpm env:status
```

**Command:** `node tools/switch-env.js --status`  
**Purpose:** Show current environment configuration  
**When to use:** Checking which services you're currently using

### **`pnpm env:check`**

```bash
pnpm env:check
```

**Command:** `node tools/validate-env.js`  
**Purpose:** Validate environment setup and check service health  
**When to use:** Troubleshooting environment issues

---

## 🔧 **Git & Release Scripts**

### **`pnpm prepare`**

```bash
pnpm prepare
```

**Command:** `husky`  
**Purpose:** Install git hooks (runs automatically after `pnpm install`)  
**When to use:** Usually automatic, sets up commit message validation

---

```bash
pnpm release
```

---

## 🎯 **Common Workflows**

### **Daily Development:**

```bash
pnpm docker:up    # Start databases
pnpm dev         # Start apps
```

### **Code Quality Check:**

```bash
pnpm lint        # Check for errors
pnpm type-check  # Check TypeScript
pnpm test        # Run tests
pnpm format      # Fix formatting
```

### **Troubleshooting:**

```bash
pnpm clean:install  # Fresh start
pnpm env:check      # Check environment
pnpm docker:reset   # Reset databases
```

### **Before Committing:**

```bash
pnpm lint:fix    # Fix linting issues
pnpm format      # Fix formatting
pnpm test        # Make sure tests pass
```
