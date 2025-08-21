"""
API service for managing external API interactions.
"""

from typing import Any, Dict, List, Optional

import httpx

from app.core.config import settings


class APIService:
    """Service for handling external API operations."""

    def __init__(self):
        self.timeout = httpx.Timeout(settings.API_TIMEOUT)
        self.rate_limit = settings.API_RATE_LIMIT

    async def test_api_endpoint(
        self,
        url: str,
        method: str = "GET",
        headers: Optional[Dict[str, str]] = None,
        params: Optional[Dict[str, Any]] = None,
        data: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Test an external API endpoint."""
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                response = await client.request(
                    method=method,
                    url=url,
                    headers=headers,
                    params=params,
                    json=data,
                )

                return {
                    "status": "success",
                    "status_code": response.status_code,
                    "response_time": (
                        response.elapsed.total_seconds() * 1000
                    ),  # ms
                    "headers": dict(response.headers),
                    "data": (
                        response.json()
                        if response.headers.get("content-type", "").startswith(
                            "application/json"
                        )
                        else response.text
                    ),
                }

            except httpx.TimeoutException:
                return {
                    "status": "error",
                    "error": "Request timed out",
                    "status_code": 408,
                }
            except httpx.RequestError as e:
                return {
                    "status": "error",
                    "error": f"Request failed: {str(e)}",
                    "status_code": 0,
                }
            except Exception as e:
                return {
                    "status": "error",
                    "error": f"Unexpected error: {str(e)}",
                    "status_code": 0,
                }

    async def get_api_info(self, api_id: str) -> Optional[Dict[str, Any]]:
        """Get information about a specific API."""
        # TODO: Implement database lookup
        # This would typically fetch from a database
        sample_apis = {
            "jsonplaceholder": {
                "id": "jsonplaceholder",
                "name": "JSONPlaceholder",
                "description": "Fake REST API for testing and prototyping",
                "base_url": "https://jsonplaceholder.typicode.com",
                "category": "testing",
                "documentation_url": (
                    "https://jsonplaceholder.typicode.com/guide/"
                ),
                "endpoints": [
                    {
                        "path": "/posts",
                        "method": "GET",
                        "description": "Get all posts",
                    },
                    {
                        "path": "/posts/{id}",
                        "method": "GET",
                        "description": "Get post by ID",
                    },
                    {
                        "path": "/users",
                        "method": "GET",
                        "description": "Get all users",
                    },
                ],
            },
            "restcountries": {
                "id": "restcountries",
                "name": "REST Countries",
                "description": "Information about countries via REST API",
                "base_url": "https://restcountries.com/v3.1",
                "category": "data",
                "documentation_url": "https://restcountries.com/",
                "endpoints": [
                    {
                        "path": "/all",
                        "method": "GET",
                        "description": "Get all countries",
                    },
                    {
                        "path": "/name/{name}",
                        "method": "GET",
                        "description": "Get country by name",
                    },
                    {
                        "path": "/alpha/{code}",
                        "method": "GET",
                        "description": "Get country by code",
                    },
                ],
            },
        }

        return sample_apis.get(api_id)

    async def list_apis(
        self,
        page: int = 1,
        per_page: int = 20,
        category: Optional[str] = None,
        search: Optional[str] = None,
    ) -> Dict[str, Any]:
        """List available APIs with filtering and pagination."""
        # TODO: Implement database query with filtering
        all_apis = await self._get_all_apis()

        # Apply filters
        filtered_apis = all_apis
        if category:
            filtered_apis = [
                api for api in filtered_apis if api.get("category") == category
            ]
        if search:
            filtered_apis = [
                api
                for api in filtered_apis
                if search.lower() in api.get("name", "").lower()
                or search.lower() in api.get("description", "").lower()
            ]

        # Apply pagination
        start_idx = (page - 1) * per_page
        end_idx = start_idx + per_page
        paginated_apis = filtered_apis[start_idx:end_idx]

        return {
            "apis": paginated_apis,
            "total": len(filtered_apis),
            "page": page,
            "per_page": per_page,
            "total_pages": ((len(filtered_apis) + per_page - 1) // per_page),
        }

    async def _get_all_apis(self) -> List[Dict[str, Any]]:
        """Get all APIs from the database."""
        # TODO: Replace with actual database query
        return [
            {
                "id": "jsonplaceholder",
                "name": "JSONPlaceholder",
                "description": "Fake REST API for testing and prototyping",
                "base_url": "https://jsonplaceholder.typicode.com",
                "category": "testing",
                "is_free": True,
                "status": "active",
            },
            {
                "id": "restcountries",
                "name": "REST Countries",
                "description": "Information about countries via REST API",
                "base_url": "https://restcountries.com/v3.1",
                "category": "data",
                "is_free": True,
                "status": "active",
            },
            {
                "id": "openweather",
                "name": "OpenWeatherMap",
                "description": "Weather data and forecasts",
                "base_url": "https://api.openweathermap.org/data/2.5",
                "category": "weather",
                "is_free": False,
                "status": "active",
            },
        ]


# Create a global instance
api_service = APIService()
