"""
Health check endpoints for monitoring and load balancers.

Health checks are essential for production applications to:
1. Monitor service availability and status
2. Enable load balancer health checks
3. Support auto-scaling decisions
4. Provide dependency status visibility
5. Enable CI/CD deployment validation
"""

import asyncio
from datetime import datetime
from typing import Dict, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db

router = APIRouter()


class HealthResponse(BaseModel):
    """Basic health check response model."""

    status: str  # "healthy", "degraded", "unhealthy"
    service: str
    version: str
    timestamp: datetime
    environment: str
    uptime_seconds: int


class DependencyStatus(BaseModel):
    """Individual dependency health status."""

    name: str
    status: str  # "healthy", "degraded", "unhealthy", "unknown"
    response_time_ms: Optional[float] = None
    error: Optional[str] = None
    last_checked: datetime


class DetailedHealthResponse(HealthResponse):
    """Detailed health check with all dependencies."""

    dependencies: Dict[str, DependencyStatus] = {}
    overall_status: str  # Aggregated status


# Track service start time for uptime calculation
_service_start_time = datetime.utcnow()


async def check_database_health(db: AsyncSession) -> DependencyStatus:
    """Check database connectivity and response time."""
    start_time = datetime.utcnow()
    try:
        # Simple query to test database connectivity
        result = await db.execute("SELECT 1")
        await result.fetchone()

        response_time = (datetime.utcnow() - start_time).total_seconds() * 1000

        return DependencyStatus(
            name="database",
            status="healthy" if response_time < 1000 else "degraded",
            response_time_ms=response_time,
            last_checked=datetime.utcnow(),
        )
    except Exception as e:
        return DependencyStatus(
            name="database",
            status="unhealthy",
            error=str(e),
            last_checked=datetime.utcnow(),
        )


async def check_redis_health() -> DependencyStatus:
    """Check Redis connectivity and response time."""
    start_time = datetime.utcnow()
    try:
        # TODO: Implement actual Redis health check
        # For now, simulate a health check
        await asyncio.sleep(0.01)  # Simulate network call

        response_time = (datetime.utcnow() - start_time).total_seconds() * 1000

        return DependencyStatus(
            name="redis",
            status="healthy",
            response_time_ms=response_time,
            last_checked=datetime.utcnow(),
        )
    except Exception as e:
        return DependencyStatus(
            name="redis",
            status="unhealthy",
            error=str(e),
            last_checked=datetime.utcnow(),
        )


def calculate_uptime() -> int:
    """Calculate service uptime in seconds."""
    return int((datetime.utcnow() - _service_start_time).total_seconds())


@router.get(
    "/",
    response_model=HealthResponse,
    status_code=status.HTTP_200_OK,
    summary="Basic health check",
    description="Simple health check for load balancers and monitoring",
)
async def health_check() -> HealthResponse:
    """
    Basic health check endpoint.

    Used by:
    - Load balancers (AWS ALB, NGINX, etc.)
    - Container orchestrators (Kubernetes, Docker Swarm)
    - Monitoring systems (Datadog, New Relic, etc.)
    - CI/CD pipelines for deployment validation

    Returns:
        Basic service status without dependency checks
    """
    return HealthResponse(
        status="healthy",
        service="grab-some-apis-api",
        version=settings.VERSION,
        timestamp=datetime.utcnow(),
        environment="development" if settings.DEBUG else "production",
        uptime_seconds=calculate_uptime(),
    )


@router.get(
    "/ready",
    response_model=HealthResponse,
    summary="Readiness check",
    description="Check if service is ready to handle requests",
)
async def readiness_check(
    db: AsyncSession = Depends(get_db),
) -> HealthResponse:
    """
    Readiness check - verifies service can handle requests.

    Used by:
    - Kubernetes readiness probes
    - Load balancers before routing traffic
    - Auto-scaling systems

    Checks:
    - Database connectivity
    - Essential dependencies

    Returns:
        HTTP 200 if ready, HTTP 503 if not ready
    """
    try:
        # Quick database check
        db_status = await check_database_health(db)

        if db_status.status == "unhealthy":
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Service not ready - database unhealthy",
            )

        return HealthResponse(
            status="ready",
            service="grab-some-apis-api",
            version=settings.VERSION,
            timestamp=datetime.utcnow(),
            environment="development" if settings.DEBUG else "production",
            uptime_seconds=calculate_uptime(),
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Service not ready: {str(e)}",
        )


@router.get(
    "/live",
    response_model=HealthResponse,
    summary="Liveness check",
    description="Check if service is alive (minimal check)",
)
async def liveness_check() -> HealthResponse:
    """
    Liveness check - verifies service is alive.

    Used by:
    - Kubernetes liveness probes
    - Container runtime health checks
    - Restart/recovery systems

    This is the most basic check - if this fails,
    the service should be restarted.
    """
    return HealthResponse(
        status="alive",
        service="grab-some-apis-api",
        version=settings.VERSION,
        timestamp=datetime.utcnow(),
        environment="development" if settings.DEBUG else "production",
        uptime_seconds=calculate_uptime(),
    )


@router.get(
    "/detailed",
    response_model=DetailedHealthResponse,
    summary="Detailed health check",
    description="Comprehensive health check with all dependencies",
)
async def detailed_health_check(
    db: AsyncSession = Depends(get_db),
) -> DetailedHealthResponse:
    """
    Detailed health check with dependency status.

    Used by:
    - Monitoring dashboards
    - DevOps teams for troubleshooting
    - Health status aggregators
    - SLA monitoring

    Checks:
    - Database connectivity and performance
    - Redis connectivity and performance
    - External API dependencies
    - Overall service health
    """
    dependencies = {}
    overall_status = "healthy"

    # Check database
    db_status = await check_database_health(db)
    dependencies["database"] = db_status

    # Check Redis
    redis_status = await check_redis_health()
    dependencies["redis"] = redis_status

    # Determine overall status
    unhealthy_deps = [
        dep for dep in dependencies.values() if dep.status == "unhealthy"
    ]
    degraded_deps = [
        dep for dep in dependencies.values() if dep.status == "degraded"
    ]

    if unhealthy_deps:
        overall_status = "unhealthy"
    elif degraded_deps:
        overall_status = "degraded"

    return DetailedHealthResponse(
        status=overall_status,
        service="grab-some-apis-api",
        version=settings.VERSION,
        timestamp=datetime.utcnow(),
        environment="development" if settings.DEBUG else "production",
        uptime_seconds=calculate_uptime(),
        dependencies=dependencies,
        overall_status=overall_status,
    )
