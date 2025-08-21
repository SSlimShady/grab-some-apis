# grab-some-apis

🎮 A fun, open-source playground for exploring and interacting with free public APIs! This project
is all about discovery, learning, and having fun with different APIs through interactive widgets and
a clean dashboard.

## Features

- 🔍 **API Discovery**: Browse and search through curated free public APIs
- 🧪 **Interactive Testing**: Test APIs directly in the browser with custom parameters
- 🎛️ **Widget Dashboard**: Interactive widgets for popular APIs (weather, quotes, etc.)
- 📊 **Usage Analytics**: Track API response times and success rates
- 🔖 **Favorites**: Save and organize your frequently used APIs
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile

## Tech Stack

### Frontend

- **Next.js 15+** with React 19 and TypeScript
- **Tailwind CSS** for styling
- **Vitest + React Testing Library + Playwright** for testing

### Backend

- **FastAPI** with Python 3.11+
- **Poetry** for dependency management
- **pytest** for testing

### Database & Caching

- **PostgreSQL** (Local Docker or Supabase)
- **Redis** (Local Docker or Upstash)

### Development Tools

- **Turborepo** monorepo with pnpm workspaces
- **ESLint 9** with flat config
- **Prettier** with Tailwind plugin
- **Husky** git hooks with lint-staged and commitlint

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm 9+
- Python 3.11+
- Docker (optional, for local services)

### Installation

1. **Clone and install dependencies**:

   ```bash
   git clone <repository-url> grab-some-apis
   cd grab-some-apis
   pnpm install
   ```

2. **Environment setup**:

   ```bash
   # Quick setup for local development
   pnpm env:local

   # Or configure manually
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start development**:

   ```bash
   # Local services (Docker required)
   pnpm dev:local

   # Cloud services (no Docker required)
   pnpm env:cloud
   pnpm dev:cloud
   ```

## Environment Configuration

This project supports flexible switching between local and cloud services:

- **Database**: Local PostgreSQL (Docker) ↔️ Supabase (Cloud)
- **Redis**: Local Redis (Docker) ↔️ Upstash (Cloud)

### Quick Configuration Commands

```bash
# Presets
pnpm env:local     # Full local development
pnpm env:cloud     # Full cloud services

# Custom combinations
pnpm env:switch --db=supabase --redis=local
pnpm env:switch --db=local --redis=upstash

# Check current setup
pnpm env:status
```

📖 **[Complete Environment Guide](./docs/ENVIRONMENT.md)** - Detailed configuration options and
workflows

📋 **[Scripts Reference](./docs/SCRIPTS.md)** - Complete explanation of all package.json scripts

🐳 **[Docker Reference](./docs/DOCKER.md)** - Detailed Docker Compose configuration guide

🐛 **[Debugging Guide](./docs/DEBUGGING.md)** - VS Code debugging setup and workflows

## Development Commands

### Core Development

```bash
pnpm dev           # Start all apps in development mode
pnpm build         # Build all apps for production
pnpm test          # Run all tests
pnpm lint          # Lint all applications
pnpm format        # Format code with Prettier
```

### Environment-Specific Development

```bash
pnpm dev:local     # Local PostgreSQL + Redis (Docker)
pnpm dev:supabase  # Supabase + Local Redis
pnpm dev:upstash   # Local PostgreSQL + Upstash Redis
pnpm dev:cloud     # Supabase + Upstash (No Docker)
```

### Service Management

```bash
pnpm services:local   # Start PostgreSQL + Redis
pnpm services:hybrid  # Start only Redis
pnpm services:down    # Stop all services
pnpm tools:up         # Start dev tools (pgAdmin, Redis Commander)
```

## Project Structure

```
grab-some-apis/
├── apps/
│   ├── web/           # Next.js frontend application
│   └── api/           # FastAPI backend application
├── packages/          # Internal shared packages (NOT published)
│   ├── ui/            # Shared React components for widgets
│   ├── types/         # Shared TypeScript types
│   ├── utils/         # Common utilities and helpers
│   └── config/        # Shared configurations
├── tools/
│   └── switch-env.js  # Environment switcher utility
├── docs/
│   └── *.md           # Comprehensive documentation
├── docker-compose.yml # Local services configuration
├── turbo.json         # Turborepo configuration
├── pnpm-workspace.yaml # pnpm workspace configuration
└── package.json       # Root package.json with scripts
```

## Contributing

1. **Setup development environment**:

   ```bash
   pnpm install
   pnpm env:local
   pnpm dev:local
   ```

2. **Code quality checks**:

   ```bash
   pnpm lint          # Check code style
   pnpm type-check    # TypeScript validation
   pnpm test          # Run tests
   pnpm format        # Auto-format code
   ```

3. **Commit guidelines**:
   - Follows [Conventional Commits](https://conventionalcommits.org/)
   - Husky hooks enforce linting and formatting
   - Use `git commit` for automatic validation

## License

MIT License - see [LICENSE](./LICENSE) for details.

Have fun with a collection of public apis
