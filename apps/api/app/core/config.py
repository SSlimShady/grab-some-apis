"""
Core configuration settings for the FastAPI application.
"""

import secrets
from pathlib import Path
from typing import List, Optional

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# Get the path to the API root directory (where .env files are located)
API_ROOT = Path(__file__).parent.parent.parent


class Settings(BaseSettings):
    """Application settings with environment variable support."""

    model_config = SettingsConfigDict(
        env_file=[
            API_ROOT / ".env.local",
            API_ROOT / ".env",
        ],
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # API Configuration
    API_STR: str = "/api"
    PROJECT_NAME: str = "Grab Some APIs"
    VERSION: str = "0.1.0"
    DESCRIPTION: str = (
        "A unified dashboard of free public APIs with interactive widgets"
    )

    # Server Configuration
    DEBUG: bool = False
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    RELOAD: bool = False

    # Security
    SECRET_KEY: str = secrets.token_urlsafe(32)
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    ALGORITHM: str = "HS256"

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",  # Next.js dev server
        "http://localhost:8000",  # FastAPI dev server
        "https://grab-some-apis.vercel.app",  # Production frontend
    ]

    # Database Configuration
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "grab_some_apis"
    POSTGRES_PORT: int = 5432
    DATABASE_URL: Optional[str] = None

    @model_validator(mode="after")
    def assemble_db_connection(self) -> "Settings":
        if self.DATABASE_URL is None:
            self.DATABASE_URL = (
                f"postgresql+asyncpg://{self.POSTGRES_USER}:"
                f"{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:"
                f"{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
            )
        return self

    # Redis Configuration
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    REDIS_PASSWORD: Optional[str] = None
    REDIS_URL: Optional[str] = None

    @model_validator(mode="after")
    def assemble_redis_connection(self) -> "Settings":
        if self.REDIS_URL is None:
            auth_part = (
                f":{self.REDIS_PASSWORD}@" if self.REDIS_PASSWORD else ""
            )
            self.REDIS_URL = (
                f"redis://{auth_part}{self.REDIS_HOST}:"
                f"{self.REDIS_PORT}/{self.REDIS_DB}"
            )
        return self

    # External APIs Configuration
    API_RATE_LIMIT: int = 100  # requests per minute
    API_TIMEOUT: int = 30  # seconds

    # NASA
    NASA_API_KEY: str = (
        "DEMO_KEY"  # Default demo key, should be overridden in production
    )
    NASA_BASE_URL: str = "https://api.nasa.gov/"

    # Rick and Morty
    RICK_AND_MORTY_BASE_URL: str = "https://rickandmortyapi.com/api/"

    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

    def model_post_init(self, __context) -> None:
        """Post-initialization method to show loaded configuration."""
        if self.DEBUG:
            print("🔧 Configuration Debug Info:")
            print(f"   API_ROOT path: {API_ROOT}")
            print(
                f"   .env.local exists: {(API_ROOT / '.env.local').exists()}"
            )
            print(f"   .env exists: {(API_ROOT / '.env').exists()}")
            print(f"   DEBUG: {self.DEBUG} (type: {type(self.DEBUG)})")
            print(f"   HOST: {self.HOST}")
            print(f"   PORT: {self.PORT}")
            print(f"   RELOAD: {self.RELOAD}")
            nasa_key_display = (
                "***" + self.NASA_API_KEY[-4:]
                if len(self.NASA_API_KEY) > 4
                else "***"
            )
            print(f"   NASA_API_KEY: {nasa_key_display}")


# Create global settings instance
settings = Settings()
