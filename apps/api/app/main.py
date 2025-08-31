"""
Main FastAPI application factory and configuration.
"""

import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from pydantic import ValidationError

from app.api.routes import router as api_router
from app.core.config import settings
from app.services.base import shutdown_http_client, startup_http_client

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper()),
    format=settings.LOG_FORMAT,
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan events."""
    # Startup
    logger.info("Starting up Grab Some APIs backend...")
    logger.info(
        f"Environment: {'Development' if settings.DEBUG else 'Production'}")
    logger.info(f"API Version: {settings.VERSION}")

    # Initialize shared HTTP client
    await startup_http_client()
    logger.info("HTTP client initialized")

    yield

    # Shutdown
    logger.info("Shutting down Grab Some APIs backend...")

    # Cleanup shared HTTP client
    await shutdown_http_client()
    logger.info("HTTP client closed")


def create_application() -> FastAPI:
    """Create and configure the FastAPI application."""

    app = FastAPI(
        title=settings.PROJECT_NAME,
        description=settings.DESCRIPTION,
        version=settings.VERSION,
        debug=settings.DEBUG,
        lifespan=lifespan,
        docs_url="/docs" if settings.DEBUG else None,
        redoc_url="/redoc" if settings.DEBUG else None,
    )

    # Add security middleware
    if not settings.DEBUG:
        app.add_middleware(
            TrustedHostMiddleware,
            # Configure with your actual domains in production
            allowed_hosts=["*"],
        )

    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin)
                       for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Include API routes
    app.include_router(api_router, prefix=settings.API_STR)

    # Add exception handlers for better error responses
    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(
            request: Request, exc: RequestValidationError):
        """Handle FastAPI request validation errors (422 -> 400)."""
        return JSONResponse(
            status_code=400,
            content={
                "error": "Validation failed",
                "details": [
                    {
                        "field": " -> ".join(str(loc) for loc in error["loc"]),
                        "message": error["msg"],
                        "type": error["type"],
                    }
                    for error in exc.errors()
                ],
            },
        )

    @app.exception_handler(ValidationError)
    async def pydantic_validation_exception_handler(
            request: Request, exc: ValidationError):
        """Handle Pydantic validation errors."""
        return JSONResponse(
            status_code=400,
            content={
                "error": "Validation failed",
                "details": [
                    {
                        "field": " -> ".join(str(loc) for loc in error["loc"]),
                        "message": error["msg"],
                        "type": error["type"],
                    }
                    for error in exc.errors()
                ],
            },
        )

    # Root endpoint
    @app.get("/", response_class=JSONResponse)
    async def root():
        """Root endpoint with API information."""
        return {
            "message": f"Welcome to {settings.PROJECT_NAME} API",
            "version": settings.VERSION,
            "docs": ("/docs" if settings.DEBUG else "Documentation disabled in production"),
            "status": "healthy",
        }

    # Health check endpoint
    @app.get("/health", response_class=JSONResponse)
    async def health_check():
        """Health check endpoint."""
        return {
            "status": "healthy",
            "service": "grab-some-apis-api",
            "version": settings.VERSION,
            "environment": ("development" if settings.DEBUG else "production"),
        }

    return app


# Create the application instance
app = create_application()
