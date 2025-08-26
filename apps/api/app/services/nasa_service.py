"""
NASA API Service - Refactored to use BaseAPIService
"""

import logging
from datetime import date, datetime
from typing import Any, Dict, List, Optional, Union

from app.core.circuit_breaker import circuit_breaker
from app.core.config import settings
from app.schemas.nasa import APODRequest, APODResponse
from app.services.base import APIError, APIValidationError, BaseAPIService

# Configure logger
logger = logging.getLogger(__name__)


# ===================================================================
# NASA-Specific Exceptions (inherit from base)
# ===================================================================


class NASAAPIError(APIError):
    """NASA API specific error."""

    def __init__(self, status_code: int, message: str, response_data=None):
        super().__init__(status_code, message, response_data, "NASA")


class NASAValidationError(APIValidationError):
    """NASA API validation error."""

    def __init__(self, message: str):
        super().__init__(message, "NASA")


# ===================================================================
# NASA Service Implementation
# ===================================================================


class NASAService(BaseAPIService):
    """NASA API service for fetching astronomical data."""

    def __init__(self, api_key: Optional[str] = None):
        """Initialize NASA service."""
        base_url = "https://api.nasa.gov/"
        super().__init__("NASA", base_url)

        # Use provided API key or fall back to settings
        self.api_key = api_key or settings.NASA_API_KEY

        if not self.api_key or self.api_key == "DEMO_KEY":
            logger.warning(
                "Using NASA DEMO_KEY - API requests are heavily rate limited. "
                "Consider getting a free API key from https://api.nasa.gov/"
            )

    def _build_auth_params(
        self, params: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Build authentication parameters for NASA API."""
        auth_params = {"api_key": self.api_key}
        if params:
            auth_params.update(params)
        return auth_params

    @circuit_breaker(name="nasa_apod", failure_threshold=5, timeout=30)
    async def get_apod(
        self, request: APODRequest
    ) -> APODResponse | List[APODResponse]:
        """
        Get Astronomy Picture of the Day (APOD) from NASA API.

        Args:
            request: APOD request parameters

        Returns:
            APOD data as dict or list

        Raises:
            NASAAPIError: If API returns an error
            NASAValidationError: If response validation fails
        """
        logger.info(f"Fetching APOD data: {request}")

        # Build request parameters
        params = self._build_auth_params()

        if request.date:
            params["date"] = request.date
        if request.start_date:
            params["start_date"] = request.start_date
        if request.end_date:
            params["end_date"] = request.end_date
        if request.count is not None:
            params["count"] = str(request.count)
        if request.thumbs is not None:
            params["thumbs"] = str(request.thumbs).lower()

        try:
            response_data = await self._make_request("planetary/apod", params)

            # Validate the response structure
            if isinstance(response_data, list):
                for item in response_data:
                    self._validate_apod_response(item)
            else:
                self._validate_apod_response(response_data)

            logger.info("Successfully fetched APOD data")
            return response_data

        except APIError as e:
            # Re-raise as NASA-specific error
            raise NASAAPIError(e.status_code, e.message, e.response_data)
        except Exception as e:
            logger.error(f"Unexpected error in get_apod: {e}")
            raise NASAValidationError(f"Failed to process APOD data: {str(e)}")

    def _validate_apod_response(self, data: Dict[str, Any]) -> None:
        """Validate APOD response structure."""
        required_fields = ["title", "explanation", "media_type"]
        missing_fields = [
            field for field in required_fields if field not in data
        ]

        if missing_fields:
            raise NASAValidationError(
                f"Missing required fields in APOD response: {missing_fields}"
            )

    async def health_check(self) -> Dict[str, Any]:
        """
        Check NASA API service health.

        Returns:
            Health status information
        """
        try:
            # Make a simple APOD request to test connectivity
            today = date.today()
            params = self._build_auth_params(
                {"date": today.strftime("%Y-%m-%d")}
            )

            response_data = await self._make_request("planetary/apod", params)

            return {
                "status": "healthy",
                "service": "NASA API",
                "timestamp": datetime.utcnow().isoformat(),
                "api_key_valid": bool(response_data),
                "rate_limit_remaining": "unknown",  # NASA doesn't provide this in response
            }

        except APIError as e:
            return {
                "status": "unhealthy",
                "service": "NASA API",
                "timestamp": datetime.utcnow().isoformat(),
                "error": f"API Error {e.status_code}: {e.message}",
                "api_key_valid": e.status_code != 401,
            }
        except Exception as e:
            return {
                "status": "unhealthy",
                "service": "NASA API",
                "timestamp": datetime.utcnow().isoformat(),
                "error": str(e),
                "api_key_valid": "unknown",
            }


# ===================================================================
# Factory Function
# ===================================================================


def create_nasa_service(api_key: Optional[str] = None) -> NASAService:
    """Create NASA service instance."""
    return NASAService(api_key=api_key)


# ===================================================================
# Dependency for FastAPI Routes
# ===================================================================


async def get_nasa_service():
    """
    FastAPI dependency to provide NASA service instance.

    Usage in routes:
        @router.get("/apod")
        async def get_apod(nasa_service: NASAService = Depends(get_nasa_service)):
            return await nasa_service.get_apod(request)
    """
    service = create_nasa_service()
    try:
        yield service
    finally:
        # Service cleanup is handled by the base service
        pass
