"""
API routes initialization and router configuration.
"""

from fastapi import APIRouter

from app.api.routes import (  # Keep health and monitoring at root level
    circuit_breakers,
    health,
)
from app.api.routes.v1 import router as v1_router

# Create main API router
router = APIRouter()

# Include root-level routes (non-versioned)
router.include_router(health.router, prefix="/health", tags=["health"])
router.include_router(
    circuit_breakers.router, prefix="/monitoring", tags=["monitoring"]
)

# Include versioned routes
router.include_router(v1_router, prefix="/v1", tags=["v1"])
