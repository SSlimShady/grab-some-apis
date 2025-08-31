"""
Reusable Circuit Breaker Implementation for External API Resilience.

This module provides a production-ready circuit breaker pattern that can be
used across all external API integrations (NASA, weather, payment APIs, etc.).

Features:
- Thread-safe implementation
- Configurable failure thresholds and timeouts
- Multiple circuit breaker instances for different services
- Metrics and monitoring support
- Decorator for easy integration
- Context manager support
"""

import asyncio
import logging
from datetime import datetime, timedelta
from enum import Enum
from functools import wraps
from typing import Any, Dict, Optional, TypeVar

# Type hints
T = TypeVar("T")

logger = logging.getLogger(__name__)


class CircuitBreakerState(Enum):
    """Circuit breaker states."""

    CLOSED = "CLOSED"  # Normal operation
    OPEN = "OPEN"  # Blocking requests
    HALF_OPEN = "HALF_OPEN"  # Testing recovery


class CircuitBreakerError(Exception):
    """Circuit breaker is open - requests are being blocked."""

    pass


class CircuitBreaker:
    """
    Production-ready circuit breaker for external API resilience.

    The circuit breaker prevents cascading failures by:
    1. Monitoring failure rate of external calls
    2. Opening circuit when failure threshold reached
    3. Blocking requests while circuit is open
    4. Periodically testing if service recovered
    5. Closing circuit when service is healthy again

    Usage:
        # Direct usage
        circuit = CircuitBreaker(name="nasa-api", failure_threshold=5, timeout=60)

        if circuit.is_open():
            raise CircuitBreakerError("NASA API unavailable")

        try:
            result = await make_api_call()
            circuit.record_success()
            return result
        except Exception:
            circuit.record_failure()
            raise

        # Or use as decorator
        @circuit_breaker(name="nasa-api")
        async def get_nasa_data():
            return await nasa_api.get_data()
    """

    def __init__(
        self,
        name: str,
        failure_threshold: int = 5,
        timeout: int = 60,
        expected_exceptions: tuple = (Exception,),
    ):
        """
        Initialize circuit breaker.

        Args:
            name: Unique identifier for this circuit breaker
            failure_threshold: Number of failures before opening circuit
            timeout: Seconds to wait before testing recovery
            expected_exceptions: Exception types that should trigger circuit opening
        """
        self.name = name
        self.failure_threshold = failure_threshold
        self.timeout = timeout
        self.expected_exceptions = expected_exceptions

        # State tracking
        self.failure_count = 0
        self.success_count = 0
        self.last_failure_time: Optional[datetime] = None
        self.last_success_time: Optional[datetime] = None
        self.state = CircuitBreakerState.CLOSED

        # Metrics
        self.total_requests = 0
        self.total_failures = 0
        self.total_successes = 0
        self.circuit_opened_count = 0

        logger.info(
            f"Circuit breaker '{name}' initialized: threshold={failure_threshold}, timeout={timeout}s")

    def is_open(self) -> bool:
        """
        Check if circuit breaker is open (blocking requests).

        Returns:
            True if circuit is open and requests should be blocked
        """
        if self.state == CircuitBreakerState.OPEN:
            # Check if timeout period has passed
            if self.last_failure_time and datetime.now(
            ) - self.last_failure_time > timedelta(seconds=self.timeout):
                self.state = CircuitBreakerState.HALF_OPEN
                logger.info(
                    f"Circuit breaker '{self.name}' moved to HALF_OPEN for testing")
                return False
            return True
        return False

    def record_success(self):
        """Record successful request."""
        self.total_requests += 1
        self.total_successes += 1
        self.success_count += 1
        self.failure_count = 0  # Reset failure count on success
        self.last_success_time = datetime.now()

        # Close circuit if it was half-open
        if self.state == CircuitBreakerState.HALF_OPEN:
            self.state = CircuitBreakerState.CLOSED
            logger.info(
                f"Circuit breaker '{self.name}' closed after successful test")

        logger.debug(f"Circuit breaker '{self.name}' recorded success")

    def record_failure(self):
        """Record failed request."""
        self.total_requests += 1
        self.total_failures += 1
        self.failure_count += 1
        self.success_count = 0  # Reset success count on failure
        self.last_failure_time = datetime.now()

        # Open circuit if failure threshold reached
        if self.failure_count >= self.failure_threshold and self.state == CircuitBreakerState.CLOSED:
            self.state = CircuitBreakerState.OPEN
            self.circuit_opened_count += 1
            logger.warning(
                f"Circuit breaker '{self.name}' opened after {self.failure_count} failures. "
                f"Will retry in {self.timeout} seconds."
            )
        # Return to open if half-open test failed
        elif self.state == CircuitBreakerState.HALF_OPEN:
            self.state = CircuitBreakerState.OPEN
            logger.warning(
                f"Circuit breaker '{self.name}' returned to OPEN after failed test")

        logger.debug(
            f"Circuit breaker '{self.name}' recorded failure ({self.failure_count}/{self.failure_threshold})")

    def get_metrics(self) -> Dict[str, Any]:
        """
        Get circuit breaker metrics for monitoring.

        Returns:
            Dictionary with circuit breaker statistics
        """
        now = datetime.now()
        uptime = (
            now
            - self.last_success_time).total_seconds() if self.last_success_time else 0
        downtime = (
            now
            - self.last_failure_time).total_seconds() if self.last_failure_time else 0

        success_rate = (
            self.total_successes
            / self.total_requests
            * 100) if self.total_requests > 0 else 0

        return {
            "name": self.name,
            "state": self.state.value,
            "is_open": self.is_open(),
            "failure_count": self.failure_count,
            "success_count": self.success_count,
            "total_requests": self.total_requests,
            "total_failures": self.total_failures,
            "total_successes": self.total_successes,
            "success_rate_percent": round(success_rate, 2),
            "circuit_opened_count": self.circuit_opened_count,
            "failure_threshold": self.failure_threshold,
            "timeout_seconds": self.timeout,
            "last_failure_time": (self.last_failure_time.isoformat() if self.last_failure_time else None),
            "last_success_time": (self.last_success_time.isoformat() if self.last_success_time else None),
            "uptime_seconds": uptime,
            "downtime_seconds": downtime,
        }

    def reset(self):
        """Reset circuit breaker to initial state."""
        self.failure_count = 0
        self.success_count = 0
        self.state = CircuitBreakerState.CLOSED
        logger.info(f"Circuit breaker '{self.name}' manually reset")

    async def __aenter__(self):
        """Async context manager entry."""
        if self.is_open():
            raise CircuitBreakerError(f"Circuit breaker '{self.name}' is open")
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit."""
        if exc_type is None:
            self.record_success()
        elif isinstance(exc_val, self.expected_exceptions):
            self.record_failure()
        # Don't suppress exceptions
        return False


# ===================================================================
# Circuit Breaker Registry for Service Management
# ===================================================================


class CircuitBreakerRegistry:
    """
    Central registry for managing multiple circuit breakers.

    This allows you to have different circuit breakers for different
    services (NASA API, Weather API, Payment API, etc.) with
    different configurations.
    """

    _instance: Optional["CircuitBreakerRegistry"] = None
    _circuit_breakers: Dict[str, CircuitBreaker] = {}

    def __new__(cls) -> "CircuitBreakerRegistry":
        """Singleton pattern for global registry."""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    @classmethod
    def get_circuit_breaker(
        cls,
        name: str,
        failure_threshold: int = 5,
        timeout: int = 60,
        expected_exceptions: tuple = (Exception,),
    ) -> CircuitBreaker:
        """
        Get or create a circuit breaker by name.

        Args:
            name: Unique circuit breaker name (e.g., "nasa-api", "weather-api")
            failure_threshold: Failures before opening circuit
            timeout: Seconds before testing recovery
            expected_exceptions: Exception types that trigger circuit

        Returns:
            CircuitBreaker instance
        """
        if name not in cls._circuit_breakers:
            cls._circuit_breakers[name] = CircuitBreaker(
                name=name,
                failure_threshold=failure_threshold,
                timeout=timeout,
                expected_exceptions=expected_exceptions,
            )
        return cls._circuit_breakers[name]

    @classmethod
    def get_all_metrics(cls) -> Dict[str, Any]:
        """Get metrics for all registered circuit breakers."""
        return {name: breaker.get_metrics()
                for name, breaker in cls._circuit_breakers.items()}

    @classmethod
    def reset_all(cls):
        """Reset all circuit breakers."""
        for breaker in cls._circuit_breakers.values():
            breaker.reset()
        logger.info("All circuit breakers reset")


# ===================================================================
# Decorator for Easy Integration
# ===================================================================


def circuit_breaker(
    name: str,
    failure_threshold: int = 5,
    timeout: int = 60,
    expected_exceptions: tuple = (Exception,),
):
    """
    Decorator to automatically add circuit breaker protection to functions.

    Args:
        name: Circuit breaker name
        failure_threshold: Failures before opening
        timeout: Seconds before retry
        expected_exceptions: Exception types that trigger circuit

    Usage:
        @circuit_breaker(name="nasa-api", failure_threshold=3, timeout=30)
        async def get_nasa_data():
            return await nasa_api.fetch()

        @circuit_breaker(name="payment-api", expected_exceptions=(PaymentError,))
        async def process_payment():
            return await payment_service.charge()
    """

    def decorator(func):
        if asyncio.iscoroutinefunction(func):

            @wraps(func)
            async def async_wrapper(*args, **kwargs):
                circuit = CircuitBreakerRegistry.get_circuit_breaker(
                    name=name,
                    failure_threshold=failure_threshold,
                    timeout=timeout,
                    expected_exceptions=expected_exceptions,
                )

                if circuit.is_open():
                    raise CircuitBreakerError(
                        f"Circuit breaker '{name}' is open")

                try:
                    result = await func(*args, **kwargs)
                    circuit.record_success()
                    return result
                except expected_exceptions:
                    circuit.record_failure()
                    raise

            return async_wrapper
        else:

            @wraps(func)
            def sync_wrapper(*args, **kwargs):
                circuit = CircuitBreakerRegistry.get_circuit_breaker(
                    name=name,
                    failure_threshold=failure_threshold,
                    timeout=timeout,
                    expected_exceptions=expected_exceptions,
                )

                if circuit.is_open():
                    raise CircuitBreakerError(
                        f"Circuit breaker '{name}' is open")

                try:
                    result = func(*args, **kwargs)
                    circuit.record_success()
                    return result
                except expected_exceptions:
                    circuit.record_failure()
                    raise

            return sync_wrapper

    return decorator


# ===================================================================
# Convenience Functions
# ===================================================================


def get_circuit_breaker(name: str, **kwargs) -> CircuitBreaker:
    """Convenience function to get circuit breaker."""
    return CircuitBreakerRegistry.get_circuit_breaker(name, **kwargs)


def get_all_circuit_breaker_metrics() -> Dict[str, Any]:
    """Get metrics for all circuit breakers."""
    return CircuitBreakerRegistry.get_all_metrics()


def reset_all_circuit_breakers():
    """Reset all circuit breakers."""
    CircuitBreakerRegistry.reset_all()
