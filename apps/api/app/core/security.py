"""
Security utilities and authentication helpers.
"""

from datetime import datetime, timedelta
from typing import Optional, Union

import jwt
from passlib.context import CryptContext

from app.core.config import settings

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def create_access_token(
        subject: Union[str, int], expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token.

    Example usage:
        token = create_access_token(subject=user.id)
        # Returns: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
    """
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM)
    return encoded_jwt


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against its hash.

    Example usage:
        is_valid = verify_password("user123", "$2b$12$...")
        # Returns: True or False
    """
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """
    Hash a password.

    Example usage:
        hashed = get_password_hash("user123")
        # Returns: "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW"
    """
    return pwd_context.hash(password)


def decode_access_token(token: str) -> Optional[str]:
    """
    Decode and validate a JWT token.

    Example usage:
        user_id = decode_access_token("eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...")
        # Returns: "user_123" or None if invalid
    """
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[
                settings.ALGORITHM])
        user_id: str = payload.get("sub")
        return user_id
    except jwt.PyJWTError:
        return None


def create_api_key() -> str:
    """
    Generate a secure API key.

    Example usage:
        api_key = create_api_key()
        # Returns: "gsk_live_abc123def456..."
    """
    import secrets

    return f"gsk_live_{secrets.token_urlsafe(32)}"


def validate_api_key(api_key: str) -> bool:
    """
    Validate an API key format.

    Example usage:
        is_valid = validate_api_key("gsk_live_abc123...")
        # Returns: True or False
    """
    if not api_key or not isinstance(api_key, str):
        return False

    return api_key.startswith("gsk_live_") and len(api_key) > 20
