"""
Health check endpoints.
"""

from datetime import datetime
from typing import Dict

from fastapi import APIRouter, status
from pydantic import BaseModel

from app.core.config import settings

router = APIRouter()


class HealthResponse(BaseModel):
    """Health check response model."""

    status: str
    service: str
    version: str
    timestamp: datetime
    environment: str
    uptime: str


class DetailedHealthResponse(HealthResponse):
    """Detailed health check response model."""

    database: str = "not_checked"
    redis: str = "not_checked"
    external_apis: Dict[str, str] = {}


@router.get("/", response_model=HealthResponse, status_code=status.HTTP_200_OK)
async def health_check() -> HealthResponse:
    """Basic health check endpoint."""
    return HealthResponse(
        status="healthy",
        service="grab-some-apis-api",
        version=settings.VERSION,
        timestamp=datetime.utcnow(),
        environment="development" if settings.DEBUG else "production",
        uptime="0d 0h 0m",  # TODO: Implement actual uptime tracking
    )


@router.get(
    "/detailed",
    response_model=DetailedHealthResponse,
    status_code=status.HTTP_200_OK,
)
async def detailed_health_check() -> DetailedHealthResponse:
    """Detailed health check with dependency status."""
    # TODO: Implement actual database and Redis health checks
    return DetailedHealthResponse(
        status="healthy",
        service="grab-some-apis-api",
        version=settings.VERSION,
        timestamp=datetime.utcnow(),
        environment="development" if settings.DEBUG else "production",
        uptime="0d 0h 0m",
        database="healthy",
        redis="healthy",
        external_apis={"sample_api": "healthy"},
    )
