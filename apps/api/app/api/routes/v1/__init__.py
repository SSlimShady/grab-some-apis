"""
Version 1 API routes initialization.
"""

from fastapi import APIRouter

from app.api.routes.v1 import nasa

router = APIRouter()

# Include v1 route modules
router.include_router(nasa.router, prefix="/nasa", tags=["nasa-v1"])
