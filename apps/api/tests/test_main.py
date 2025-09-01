"""
Basic tests for the FastAPI application.
"""

import pytest
from app.main import app
from fastapi.testclient import TestClient

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


def test_circuit_breaker_status_endpoint():
    """Test the circuit breaker status endpoint."""
    response = client.get("/api/monitoring/circuit-breakers")
    assert response.status_code == 200
    data = response.json()
    assert "circuit_breakers" in data
    assert isinstance(data["circuit_breakers"], dict)


def test_nasa_apod_endpoint():
    """Test the NASA APOD endpoint."""
    response = client.get("/api/v1/nasa/apod")
    assert response.status_code == 200
    data = response.json()
    # Should return either a single APOD or list depending on parameters
    assert "title" in data or isinstance(data, list)


def test_rickandmorty_characters_endpoint():
    """Test the Rick and Morty characters endpoint."""
    response = client.get("/api/v1/rickandmorty/character")
    assert response.status_code == 200
    data = response.json()
    assert "results" in data or isinstance(data, list)


@pytest.mark.asyncio
async def test_async_root_endpoint():
    """Test the root endpoint with async client pattern."""
    # Use the existing sync client for now since it's simpler
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
