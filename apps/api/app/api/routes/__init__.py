"""
API routes initialization and router configuration.
"""

from fastapi import APIRouter

from app.api.routes import apis, health

# Create main API router
router = APIRouter()

# Include route modules
router.include_router(health.router, prefix="/health", tags=["health"])
router.include_router(apis.router, prefix="/apis", tags=["apis"])
