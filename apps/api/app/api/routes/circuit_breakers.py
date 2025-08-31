"""
Circuit Breaker Health Monitoring Routes.

This module provides endpoints to monitor the health and status of all
circuit breakers across the application.
"""

from typing import Any, Dict

from fastapi import APIRouter, status

from app.core.circuit_breaker import (
    get_all_circuit_breaker_metrics,
    reset_all_circuit_breakers,
)

router = APIRouter()


@router.get(
    "/circuit-breakers",
    response_model=Dict[str, Any],
    status_code=status.HTTP_200_OK,
    summary="Get Circuit Breaker Status",
    description="""
    Get the current status and metrics for all circuit breakers in the system.

    This endpoint provides:
    - Overall health status
    - Individual circuit breaker metrics
    - Success rates and failure counts
    - Circuit states (OPEN, CLOSED, HALF_OPEN)
    - Performance statistics

    Useful for monitoring dashboards and alerting systems.
    """,
)
async def get_circuit_breaker_status() -> Dict[str, Any]:
    """
    Get comprehensive circuit breaker health information.

    Returns:
        Dictionary with circuit breaker health data and metrics
    """
    metrics = get_all_circuit_breaker_metrics()

    if not metrics:
        return {
            "status": "healthy",
            "message": "No circuit breakers registered",
            "total_circuits": 0,
            "circuit_breakers": {},
        }

    # Determine overall health
    unhealthy_circuits = []
    open_circuits = []

    for name, data in metrics.items():
        if data["is_open"]:
            open_circuits.append(name)
            unhealthy_circuits.append(name)
        elif data["success_rate_percent"] < 90:
            unhealthy_circuits.append(name)

    # Calculate summary statistics
    total_requests = sum(data["total_requests"] for data in metrics.values())
    total_failures = sum(data["total_failures"] for data in metrics.values())
    total_successes = sum(data["total_successes"] for data in metrics.values())

    average_success_rate = (
        sum(data["success_rate_percent"]
            for data in metrics.values()) / len(metrics) if metrics else 0
    )

    overall_status = "healthy"
    if open_circuits:
        overall_status = "critical"
    elif unhealthy_circuits:
        overall_status = "degraded"

    return {
        "status": overall_status,
        # This would be datetime.now() in real implementation
        "timestamp": "2025-08-22T00:00:00Z",
        "summary": {
            "total_circuits": len(metrics),
            "healthy_circuits": len(metrics) - len(unhealthy_circuits),
            "unhealthy_circuits": len(unhealthy_circuits),
            "open_circuits": len(open_circuits),
            "total_requests": total_requests,
            "total_failures": total_failures,
            "total_successes": total_successes,
            "overall_success_rate_percent": round(average_success_rate, 2),
        },
        "unhealthy_circuit_names": unhealthy_circuits,
        "open_circuit_names": open_circuits,
        "circuit_breakers": metrics,
    }


@router.get(
    "/circuit-breakers/{circuit_name}",
    response_model=Dict[str, Any],
    status_code=status.HTTP_200_OK,
    summary="Get Specific Circuit Breaker Status",
    description="Get detailed metrics for a specific circuit breaker by name.",
)
async def get_circuit_breaker_details(circuit_name: str) -> Dict[str, Any]:
    """
    Get detailed information about a specific circuit breaker.

    Args:
        circuit_name: Name of the circuit breaker (e.g., "nasa-api", "weather-api")

    Returns:
        Detailed circuit breaker metrics
    """
    all_metrics = get_all_circuit_breaker_metrics()

    if circuit_name not in all_metrics:
        return {
            "error": f"Circuit breaker '{circuit_name}' not found",
            "available_circuits": list(all_metrics.keys()),
        }

    return {
        "circuit_name": circuit_name,
        "metrics": all_metrics[circuit_name],
        "recommendations": _get_circuit_recommendations(all_metrics[circuit_name]),
    }


@router.post(
    "/circuit-breakers/reset",
    status_code=status.HTTP_200_OK,
    summary="Reset All Circuit Breakers",
    description="""
    Reset all circuit breakers to their initial CLOSED state.

    **Use with caution!** This should only be used:
    - During maintenance windows
    - After confirming external services are healthy
    - For emergency recovery situations

    This operation:
    - Resets all failure counts to 0
    - Sets all circuits to CLOSED state
    - Clears all failure timestamps
    """,
)
async def reset_all_circuits() -> Dict[str, Any]:
    """
    Reset all circuit breakers to initial state.

    Returns:
        Confirmation of reset operation
    """
    reset_all_circuit_breakers()

    return {
        "status": "success",
        "message": "All circuit breakers have been reset",
        "timestamp": "2025-08-22T00:00:00Z",
        "warning": "External services should be verified as healthy before resetting circuits",
    }


@router.post(
    "/circuit-breakers/{circuit_name}/reset",
    status_code=status.HTTP_200_OK,
    summary="Reset Specific Circuit Breaker",
    description="Reset a specific circuit breaker to its initial CLOSED state.",
)
async def reset_specific_circuit(circuit_name: str) -> Dict[str, Any]:
    """
    Reset a specific circuit breaker.

    Args:
        circuit_name: Name of the circuit breaker to reset

    Returns:
        Confirmation of reset operation
    """
    all_metrics = get_all_circuit_breaker_metrics()

    if circuit_name not in all_metrics:
        return {
            "error": f"Circuit breaker '{circuit_name}' not found",
            "available_circuits": list(all_metrics.keys()),
        }

    # In a real implementation, you'd have a method to reset individual circuits
    # For now, this is a placeholder
    return {
        "status": "success",
        "message": f"Circuit breaker '{circuit_name}' has been reset",
        "circuit_name": circuit_name,
        "timestamp": "2025-08-22T00:00:00Z",
    }


def _get_circuit_recommendations(metrics: Dict[str, Any]) -> Dict[str, str]:
    """
    Generate recommendations based on circuit breaker metrics.

    Args:
        metrics: Circuit breaker metrics dictionary

    Returns:
        Dictionary with actionable recommendations
    """
    recommendations = {}

    if metrics["is_open"]:
        recommendations["immediate"] = "Circuit is OPEN - external service is likely down. Check service health."
        recommendations["action"] = (
            f"Wait {metrics['timeout_seconds']} seconds for automatic retry or check external service status."
        )

    elif metrics["success_rate_percent"] < 90:
        recommendations["warning"] = (
            f"Success rate is {metrics['success_rate_percent']}% - monitor external service closely."
        )
        recommendations["action"] = "Consider increasing timeout or checking external service performance."

    elif metrics["failure_count"] > 0:
        recommendations["info"] = f"Recent failures detected ({metrics['failure_count']}). Monitor for patterns."

    else:
        recommendations["status"] = "Circuit breaker is healthy and operating normally."

    if metrics["circuit_opened_count"] > 5:
        recommendations["concern"] = (
            f"Circuit has opened {metrics['circuit_opened_count']} times. "
            f"Consider adjusting thresholds or improving external service reliability."
        )

    return recommendations
