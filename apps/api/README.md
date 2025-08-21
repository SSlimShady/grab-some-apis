# Grab Some APIs - FastAPI Backend

Modern FastAPI backend for the Grab Some APIs dashboard.

## Features

- ⚡ **FastAPI** with async/await support
- 🔧 **Pydantic** for data validation and settings
- 🗃️ **SQLAlchemy** with async support
- 🚀 **Redis** for caching
- 🧪 **Pytest** for testing
- 🔍 **Type hints** everywhere
- 📝 **OpenAPI** documentation
- 🔒 **Security** best practices
- 🐳 **Docker** ready

## Project Structure

```
app/
├── api/                    # API routes
│   └── routes/            # Route modules
├── core/                  # Core configuration
├── models/                # Database models
├── services/              # Business logic
└── utils/                 # Utility functions
tests/                     # Test modules
```

## Setup

### Prerequisites

- Python 3.11+
- Poetry
- PostgreSQL (optional, for database features)
- Redis (optional, for caching)

### Installation

1. Install dependencies:

```bash
poetry install
```

2. Copy environment configuration:

```bash
cp .env.example .env
```

3. Update the `.env` file with your configuration.

## Development

### Start the development server:

```bash
poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Or using the script:

```bash
poetry run dev
```

### Run tests:

```bash
poetry run pytest
```

### Run with coverage:

```bash
poetry run pytest --cov=app --cov-report=html
```

### Code formatting:

```bash
poetry run black app tests
poetry run isort app tests
```

### Linting:

```bash
poetry run flake8 app tests
poetry run mypy app
```

## API Documentation

When running in development mode, visit:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Available Scripts

- `poetry run dev` - Start development server
- `poetry run start` - Start production server
- `poetry run test` - Run tests
- `poetry run test:coverage` - Run tests with coverage
- `poetry run lint` - Run linting
- `poetry run format` - Format code

## Environment Variables

Key environment variables (see `.env.example` for full list):

- `DEBUG` - Enable debug mode
- `SECRET_KEY` - Secret key for security
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `BACKEND_CORS_ORIGINS` - Allowed CORS origins

## Docker

Build and run with Docker:

```bash
docker build -t grab-some-apis-api .
docker run -p 8000:8000 grab-some-apis-api
```

## Contributing

1. Follow the existing code style
2. Add tests for new features
3. Update documentation as needed
4. Run linting and tests before submitting

## API Endpoints

### Health

- `GET /health` - Basic health check
- `GET /health/detailed` - Detailed health check

### APIs

- `GET /api/v1/apis` - List available APIs
- `GET /api/v1/apis/{id}` - Get API details
- `GET /api/v1/apis/categories` - Get API categories
- `POST /api/v1/apis/test` - Test an API endpoint
