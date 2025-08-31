"""
Base service classes for external API integrations.

This module provides reusable patterns for all API services in the application.
"""

import asyncio
import logging
from abc import ABC, abstractmethod
from typing import Any, Dict, Optional, Union
from urllib.parse import urljoin

import httpx

from app.core.config import settings

# Configure logger
logger = logging.getLogger(__name__)


# ===================================================================
# Shared Exception Hierarchy
# ===================================================================


class APIServiceError(Exception):
    """Base exception for all API service errors."""

    pass


class APIError(APIServiceError):
    """External API returned an error response."""

    def __init__(
        self,
        status_code: int,
        message: str,
        response_data: Optional[Dict] = None,
        service_name: str = "API",
    ):
        self.status_code = status_code
        self.message = message
        self.response_data = response_data
        self.service_name = service_name
        super().__init__(f"{service_name} API Error {status_code}: {message}")


class APIConnectionError(APIServiceError):
    """Failed to connect to external API."""

    def __init__(self, message: str, service_name: str = "API"):
        self.service_name = service_name
        super().__init__(f"{service_name} connection error: {message}")


class APITimeoutError(APIServiceError):
    """API request timed out."""

    def __init__(self, message: str, service_name: str = "API"):
        self.service_name = service_name
        super().__init__(f"{service_name} timeout: {message}")


class APIValidationError(APIServiceError):
    """Invalid data received from API."""

    def __init__(self, message: str, service_name: str = "API"):
        self.service_name = service_name
        super().__init__(f"{service_name} validation error: {message}")


# ===================================================================
# HTTP Client Manager (Singleton)
# ===================================================================


class HTTPClientManager:
    """
    Singleton HTTP client manager for efficient connection pooling.

    This ensures all services share the same connection pool for better performance.
    """

    _instance: Optional["HTTPClientManager"] = None
    _client: Optional[httpx.AsyncClient] = None

    def __new__(cls) -> "HTTPClientManager":
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    async def get_client(self) -> httpx.AsyncClient:
        """Get or create the shared HTTP client."""
        if self._client is None:
            self._client = httpx.AsyncClient(
                timeout=httpx.Timeout(30.0),
                limits=httpx.Limits(
                    max_connections=20,  # Shared across all services
                    max_keepalive_connections=10,
                ),
                headers={
                    "User-Agent": f"GrabSomeAPIs/{settings.VERSION}",
                    "Accept": "application/json",
                },
            )
            logger.info("Shared HTTP client created")
        return self._client

    async def close(self):
        """Close the shared HTTP client."""
        if self._client:
            await self._client.aclose()
            self._client = None
            logger.info("Shared HTTP client closed")


# ===================================================================
# Base API Service Class
# ===================================================================


class BaseAPIService(ABC):
    """
    Abstract base class for all external API services.

    Provides common functionality:
    - HTTP client management
    - Retry logic with exponential backoff
    - Standardized error handling
    - Request/response logging
    - Health check interface
    """

    def __init__(
        self,
        service_name: str,
        base_url: str,
        api_key: Optional[str] = None,
        timeout: float = 30.0,
        max_retries: int = 3,
        **kwargs,
    ):
        """
        Initialize base API service.

        Args:
            service_name: Human-readable service name (e.g., "NASA", "GitHub")
            base_url: API base URL
            api_key: Optional API key
            timeout: Request timeout in seconds
            max_retries: Maximum retry attempts
            **kwargs: Additional service-specific configuration
        """
        self.service_name = service_name
        self.base_url = base_url.rstrip("/")  # Normalize URL
        self.api_key = api_key
        self.timeout = timeout
        self.max_retries = max_retries
        self.config = kwargs

        # Use shared HTTP client
        self._client_manager = HTTPClientManager()

        logger.info(
            f"{service_name} service initialized with base_url={base_url}")

    async def _get_client(self) -> httpx.AsyncClient:
        """Get the shared HTTP client."""
        return await self._client_manager.get_client()

    def _build_auth_params(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Add authentication to request parameters.

        Override this method in subclasses for different auth methods.
        """
        if self.api_key:
            params = params.copy()
            params["api_key"] = self.api_key
        return params

    def _build_headers(self) -> Dict[str, str]:
        """
        Build request headers.

        Override this method in subclasses for custom headers.
        """
        return {}

    async def _make_request(
        self,
        endpoint: str,
        params: Optional[Dict[str, Any]] = None,
        path_params: Optional[Dict[str, Any]] = None,
        method: str = "GET",
        data: Optional[Dict[str, Any]] = None,
        headers: Optional[Dict[str, str]] = None,
    ) -> Union[Dict[str, Any], list]:
        """
        Make HTTP request with retry logic and error handling.

        Args:
            method: HTTP method ("GET", "POST", etc.)
            endpoint: API endpoint (relative to base_url)
            params: Query parameters
            data: Request body data
            headers: Additional headers

        Returns:
            JSON response data

        Raises:
            APIError: API returned error response
            APIConnectionError: Connection failed
            APITimeoutError: Request timed out
        """
        # Prepare request
        if path_params:
            try:
                endpoint = endpoint.format(**path_params)
            except KeyError as e:
                raise APIValidationError(
                    f"Missing required path parameter: {e}",
                    self.service_name)
        url = urljoin(self.base_url + "/", endpoint.lstrip("/"))
        request_params = self._build_auth_params(params or {})
        request_headers = {**self._build_headers(), **(headers or {})}

        client = await self._get_client()
        last_exception: Optional[Union[APITimeoutError,
                                       APIConnectionError, APIServiceError]] = None

        # Retry logic with exponential backoff
        for attempt in range(self.max_retries + 1):
            try:
                logger.debug(
                    f"{self.service_name}: {method} {url} "
                    f"(attempt {attempt + 1}/{self.max_retries + 1})")

                response = await client.request(
                    method=method,
                    url=url,
                    params=request_params if method.upper() == "GET" else None,
                    json=data if method.upper() != "GET" else None,
                    headers=request_headers,
                )

                # Handle common HTTP errors
                if response.status_code == 401:
                    raise APIError(
                        401,
                        "Unauthorized - invalid API key",
                        service_name=self.service_name,
                    )
                elif response.status_code == 403:
                    raise APIError(
                        403,
                        "Forbidden - quota exceeded or insufficient permissions",
                        service_name=self.service_name,
                    )
                elif response.status_code == 404:
                    raise APIError(
                        404,
                        "Resource not found",
                        service_name=self.service_name,
                    )
                elif response.status_code == 429:
                    raise APIError(
                        429,
                        "Rate limit exceeded",
                        service_name=self.service_name,
                    )
                elif response.status_code >= 400:
                    try:
                        error_data = response.json()
                    except BaseException:
                        error_data = {"error": response.text}

                    raise APIError(
                        response.status_code,
                        f"API error: {response.status_code}",
                        error_data,
                        self.service_name,
                    )

                response.raise_for_status()

                # Parse response
                try:
                    data = response.json()
                except BaseException:
                    # Some APIs return non-JSON responses
                    data = {"content": response.text}

                logger.info(
                    f"{self.service_name}: Successfully fetched data from {endpoint}")
                return data

            except httpx.TimeoutException:
                last_exception = APITimeoutError(
                    f"Request to {endpoint} timed out after {self.timeout}s",
                    self.service_name,
                )
                logger.warning(
                    f"{self.service_name}: Timeout on attempt {attempt + 1}")

            except httpx.ConnectError as e:
                last_exception = APIConnectionError(
                    f"Failed to connect: {e}", self.service_name)
                logger.warning(
                    f"{self.service_name}: Connection error on attempt {attempt + 1}")

            except APIError:
                # Don't retry API errors (client errors, auth issues, etc.)
                raise

            except Exception as e:
                last_exception = APIServiceError(
                    f"{self.service_name}: Unexpected error: {e}")
                logger.error(
                    f"{self.service_name}: Unexpected error on attempt {attempt + 1}: {e}")

            # Wait before retry (exponential backoff)
            if attempt < self.max_retries:
                wait_time = 2**attempt  # 1s, 2s, 4s
                logger.info(
                    f"{self.service_name}: Retrying in {wait_time}s...")
                await asyncio.sleep(wait_time)

        # All retries exhausted
        raise last_exception or APIServiceError(
            f"{self.service_name}: All retry attempts failed")

    @abstractmethod
    async def health_check(self) -> Dict[str, Any]:
        """
        Check service health.

        Should return a dictionary with at least:
        {
            "status": "healthy" | "unhealthy",
            "service": service_name,
            "response_time_seconds": float,
            "last_checked": ISO timestamp
        }
        """
        pass

    async def close(self):
        """
        Close service resources.

        Note: This doesn't close the shared HTTP client as other services may be using it.
        The client is closed when the application shuts down.
        """
        logger.info(f"{self.service_name} service closed")


# ===================================================================
# Startup/Shutdown Helpers
# ===================================================================


async def startup_http_client():
    """Initialize shared HTTP client on application startup."""
    manager = HTTPClientManager()
    await manager.get_client()
    logger.info("HTTP client manager initialized")


async def shutdown_http_client():
    """Close shared HTTP client on application shutdown."""
    manager = HTTPClientManager()
    await manager.close()
    logger.info("HTTP client manager shutdown")
