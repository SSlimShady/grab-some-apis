"""
NASA API Service
"""

import asyncio
import logging
from abc import ABC, abstractmethod
from datetime import date, datetime
from typing import Any, Dict, List, Optional, Union
from urllib.parse import urljoin

import httpx
from pydantic import ValidationError

from app.core.circuit_breaker import circuit_breaker
from app.core.config import settings
from app.schemas.nasa import APODRequest, APODResponse

# Configure logger
logger = logging.getLogger(__name__)


# ===================================================================
# Custom Exceptions for Better Error Handling
# ===================================================================


class NASAServiceError(Exception):
    """Base exception for NASA service errors."""

    pass


class NASAAPIError(NASAServiceError):
    """NASA API returned an error response."""

    def __init__(
        self,
        status_code: int,
        message: str,
        response_data: Optional[Dict] = None,
    ):
        self.status_code = status_code
        self.message = message
        self.response_data = response_data
        super().__init__(f"NASA API Error {status_code}: {message}")


class NASAConnectionError(NASAServiceError):
    """Failed to connect to NASA API."""

    pass


class NASATimeoutError(NASAServiceError):
    """NASA API request timed out."""

    pass


class NASAValidationError(NASAServiceError):
    """Invalid data received from NASA API."""

    pass


# ===================================================================
# Abstract Interface for Testability
# ===================================================================


class NASAServiceInterface(ABC):
    """Abstract interface for NASA service operations."""

    @abstractmethod
    async def get_apod(
        self, request: APODRequest
    ) -> Union[APODResponse, List[APODResponse]]:
        """Get Astronomy Picture of the Day."""
        pass

    @abstractmethod
    async def health_check(self) -> Dict[str, Any]:
        """Check NASA API service health."""
        pass


# ===================================================================
# Main NASA Service Implementation
# ===================================================================


class NASAService(NASAServiceInterface):
    """
    Production-ready NASA API service with modern best practices.

    Features:
    - Async HTTP client with connection pooling
    - Automatic retries with exponential backoff
    - Circuit breaker for resilience
    - Request/response logging
    - Type-safe responses
    - Configuration-driven
    """

    def __init__(
        self,
        api_key: str = settings.NASA_API_KEY,
        base_url: str = settings.NASA_BASE_URL,
        timeout: float = 30.0,
        max_retries: int = 3,
    ):
        """
        Initialize NASA service.

        Args:
            api_key: NASA API key (default from settings)
            base_url: NASA API base URL (default from settings)
            timeout: Request timeout in seconds
            max_retries: Maximum number of retry attempts
        """
        self.api_key = api_key
        self.base_url = base_url
        self.timeout = timeout
        self.max_retries = max_retries

        # Initialize HTTP client with connection pooling
        self.client = httpx.AsyncClient(
            timeout=httpx.Timeout(timeout),
            limits=httpx.Limits(
                max_connections=10, max_keepalive_connections=5
            ),
            headers={"User-Agent": f"GrabSomeAPIs/{settings.VERSION}"},
        )

        logger.info(
            f"NASAService initialized with base_url={base_url}, timeout={timeout}s"
        )

    async def __aenter__(self):
        """Async context manager entry."""
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit - cleanup resources."""
        await self.close()

    async def close(self):
        """Close HTTP client and cleanup resources."""
        await self.client.aclose()
        logger.info("NASAService client closed")

    async def _make_request(
        self, endpoint: str, params: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Make HTTP request to NASA API with error handling and retries.

        Args:
            endpoint: API endpoint (e.g., '/planetary/apod')
            params: Query parameters

        Returns:
            JSON response data

        Raises:
            NASAAPIError: API returned error response
            NASAConnectionError: Connection failed
            NASATimeoutError: Request timed out
        """
        # Prepare request
        url = urljoin(self.base_url, endpoint)
        request_params = {"api_key": self.api_key}
        if params:
            request_params.update(params)

        # Retry logic with exponential backoff
        last_exception = None
        for attempt in range(self.max_retries + 1):
            try:
                logger.debug(
                    f"Making request to {url} (attempt {attempt + 1}/{self.max_retries + 1})"
                )

                response = await self.client.get(url, params=request_params)

                # Handle HTTP errors
                if response.status_code == 403:
                    raise NASAAPIError(
                        403,
                        "Invalid API key or quota exceeded",
                        response.json(),
                    )
                elif response.status_code == 404:
                    raise NASAAPIError(
                        404, "Resource not found", response.json()
                    )
                elif response.status_code >= 400:
                    error_data = (
                        response.json()
                        if response.headers.get("content-type", "").startswith(
                            "application/json"
                        )
                        else {"error": response.text}
                    )
                    raise NASAAPIError(
                        response.status_code,
                        f"NASA API error: {response.status_code}",
                        error_data,
                    )

                response.raise_for_status()

                data = response.json()
                logger.info(f"Successfully fetched data from {endpoint}")
                return data

            except httpx.TimeoutException as e:
                last_exception = NASATimeoutError(
                    f"Request to {endpoint} timed out after {self.timeout}s"
                )
                logger.warning(f"Timeout on attempt {attempt + 1}: {e}")

            except httpx.ConnectError as e:
                last_exception = NASAConnectionError(
                    f"Failed to connect to NASA API: {e}"
                )
                logger.warning(
                    f"Connection error on attempt {attempt + 1}: {e}"
                )

            except NASAAPIError:
                # Don't retry API errors (4xx, 5xx)
                raise

            except Exception as e:
                last_exception = NASAServiceError(f"Unexpected error: {e}")
                logger.error(f"Unexpected error on attempt {attempt + 1}: {e}")

            # Wait before retry (exponential backoff)
            if attempt < self.max_retries:
                wait_time = 2**attempt  # 1s, 2s, 4s
                logger.info(f"Retrying in {wait_time}s...")
                await asyncio.sleep(wait_time)

        # All retries exhausted
        raise last_exception or NASAServiceError("All retry attempts failed")

    @circuit_breaker("nasa-apod", failure_threshold=5, timeout=60)
    async def get_apod(
        self, request: APODRequest
    ) -> Union[APODResponse, List[APODResponse]]:
        """
        Get NASA Astronomy Picture of the Day.

        Args:
            request: APOD request parameters (validated)

        Returns:
            Single APOD response or list of responses for date ranges/random requests

        Raises:
            NASAServiceError: Various NASA service errors
            NASAValidationError: Invalid response data
        """
        logger.info(f"Fetching APOD data with request: {request}")

        # Build query parameters
        params = {}

        if request.date:
            params["date"] = request.date
        elif request.start_date and request.end_date:
            params["start_date"] = request.start_date
            params["end_date"] = request.end_date
        elif request.count:
            params["count"] = request.count

        if request.thumbs is not None:
            params["thumbs"] = str(request.thumbs).lower()

        try:
            # Make API request
            data = await self._make_request("/planetary/apod", params)

            # Validate and parse response
            if isinstance(data, list):
                # Multiple APODs (date range or random)
                apod_responses = []
                for item in data:
                    try:
                        if isinstance(item, dict):
                            apod_responses.append(APODResponse(**item))
                    except ValidationError as e:
                        logger.warning(f"Failed to validate APOD item: {e}")
                        continue

                if not apod_responses:
                    raise NASAValidationError("No valid APOD data received")

                logger.info(
                    f"Successfully fetched {len(apod_responses)} APOD entries"
                )
                return apod_responses
            else:
                # Single APOD
                apod_response = APODResponse(**data)
                logger.info(
                    f"Successfully fetched APOD for {apod_response.date}"
                )
                return apod_response

        except ValidationError as e:
            logger.error(f"Failed to validate NASA APOD response: {e}")
            raise NASAValidationError(f"Invalid APOD response format: {e}")

    async def health_check(self) -> Dict[str, Any]:
        """
        Check NASA API service health.

        Returns:
            Health status information
        """
        logger.info("Performing NASA service health check")

        try:
            # Make a simple APOD request to test connectivity
            start_time = datetime.now()

            test_request = APODRequest(
                date=date.today().strftime("%Y-%m-%d"),
                start_date=None,
                end_date=None,
                count=None,
                thumbs=True,
            )
            await self.get_apod(test_request)

            response_time = (datetime.now() - start_time).total_seconds()

            health_status = {
                "status": "healthy",
                "service": "nasa-api",
                "response_time_seconds": response_time,
                "base_url": self.base_url,
                "last_checked": datetime.now().isoformat(),
            }

            logger.info(
                f"NASA service health check passed: {response_time:.2f}s"
            )
            return health_status

        except Exception as e:
            logger.error(f"NASA service health check failed: {e}")
            return {
                "status": "unhealthy",
                "service": "nasa-api",
                "error": str(e),
                "base_url": self.base_url,
                "last_checked": datetime.now().isoformat(),
            }


# ===================================================================
# Factory Function for Dependency Injection
# ===================================================================


def create_nasa_service(
    api_key: Optional[str] = None, **kwargs
) -> NASAService:
    """
    Factory function to create NASA service instance.

    This allows for easy testing and configuration management.

    Args:
        api_key: NASA API key (falls back to environment/config)
        **kwargs: Additional configuration options

    Returns:
        Configured NASA service instance
    """
    # Use provided API key or fall back to configuration
    effective_api_key = api_key or getattr(
        settings, "NASA_API_KEY", "DEMO_KEY"
    )

    return NASAService(
        api_key=effective_api_key,
        base_url=kwargs.get("base_url", settings.NASA_BASE_URL),
        timeout=kwargs.get("timeout", 30.0),
        max_retries=kwargs.get("max_retries", 3),
    )


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
        await service.close()
