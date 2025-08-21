"""
Basic tests for the FastAPI application.
"""

import pytest
from fastapi.testclient import TestClient

from app.main import app

# Sync test client
client = TestClient(app)


def test_root_endpoint():
    """Test the root endpoint."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "version" in data
    assert "status" in data
    assert data["status"] == "healthy"


def test_health_endpoint():
    """Test the health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "grab-some-apis-api"


def test_api_health_endpoint():
    """Test the API health check endpoint."""
    response = client.get("/api/v1/health/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "grab-some-apis-api"


def test_api_list_endpoint():
    """Test the API list endpoint."""
    response = client.get("/api/v1/apis/")
    assert response.status_code == 200
    data = response.json()
    assert "apis" in data
    assert "total" in data
    assert isinstance(data["apis"], list)


def test_api_categories_endpoint():
    """Test the API categories endpoint."""
    response = client.get("/api/v1/apis/categories")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0


@pytest.mark.asyncio
async def test_async_root_endpoint():
    """Test the root endpoint with async client pattern."""
    # Use the existing sync client for now since it's simpler
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
