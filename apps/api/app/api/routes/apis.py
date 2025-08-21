"""
API endpoints for managing and exploring external APIs.
"""

from typing import List, Optional

from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel, HttpUrl

router = APIRouter()


class APIInfo(BaseModel):
    """API information model."""

    name: str
    description: str
    base_url: HttpUrl
    category: str
    authentication: Optional[str] = None
    rate_limit: Optional[str] = None
    documentation_url: Optional[HttpUrl] = None
    is_free: bool = True
    status: str = "active"


class APIListResponse(BaseModel):
    """API list response model."""

    apis: List[APIInfo]
    total: int
    page: int
    per_page: int


@router.get(
    "/", response_model=APIListResponse, status_code=status.HTTP_200_OK
)
async def list_apis(
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    category: Optional[str] = Query(None, description="Filter by category"),
    search: Optional[str] = Query(None, description="Search query"),
) -> APIListResponse:
    """Get a list of available APIs with pagination and filtering."""
    # TODO: Implement actual API fetching from database/service
    sample_apis = [
        APIInfo(
            name="JSONPlaceholder",
            description="Fake REST API for testing and prototyping",
            base_url="https://jsonplaceholder.typicode.com",
            category="testing",
            documentation_url=("https://jsonplaceholder.typicode.com/guide/"),
            is_free=True,
            status="active",
        ),
        APIInfo(
            name="REST Countries",
            description="Information about countries via REST API",
            base_url="https://restcountries.com",
            category="data",
            documentation_url="https://restcountries.com/",
            is_free=True,
            status="active",
        ),
    ]

    return APIListResponse(
        apis=sample_apis,
        total=len(sample_apis),
        page=page,
        per_page=per_page,
    )


@router.get(
    "/categories", response_model=List[str], status_code=status.HTTP_200_OK
)
async def get_categories() -> List[str]:
    """Get available API categories."""
    # TODO: Implement actual category fetching
    return [
        "data",
        "testing",
        "weather",
        "news",
        "finance",
        "entertainment",
        "social",
        "utilities",
        "health",
        "education",
    ]


@router.get(
    "/{api_id}", response_model=APIInfo, status_code=status.HTTP_200_OK
)
async def get_api_details(api_id: str) -> APIInfo:
    """Get detailed information about a specific API."""
    # TODO: Implement actual API fetching by ID
    if api_id == "jsonplaceholder":
        return APIInfo(
            name="JSONPlaceholder",
            description="Fake REST API for testing and prototyping",
            base_url="https://jsonplaceholder.typicode.com",
            category="testing",
            documentation_url=("https://jsonplaceholder.typicode.com/guide/"),
            is_free=True,
            status="active",
        )

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"API with ID '{api_id}' not found",
    )


@router.post("/test", status_code=status.HTTP_200_OK)
async def test_api_endpoint(
    api_url: HttpUrl, method: str = "GET", headers: Optional[dict] = None
):
    """Test an API endpoint and return the response."""
    # TODO: Implement actual API testing functionality
    return {
        "message": f"Testing {method} request to {api_url}",
        "status": "success",
        "response_time": "245ms",
        "status_code": 200,
    }
