"""
NASA API routes for astronomical data and imagery.
"""

from typing import List, Union

from fastapi import APIRouter, Depends, HTTPException, status

from app.schemas.nasa import APODRequest, APODResponse
from app.services.nasa_service import (
    NASAAPIError,
    NASAConnectionError,
    NASAService,
    NASATimeoutError,
    NASAValidationError,
    get_nasa_service,
)

router = APIRouter()


@router.get(
    "/apod",
    response_model=Union[APODResponse, List[APODResponse]],
    status_code=status.HTTP_200_OK,
    summary="Get Astronomy Picture of the Day",
    description="""
    Retrieve NASA's Astronomy Picture of the Day (APOD).

    - **date**: Specific date (YYYY-MM-DD) or leave empty for today
    - **start_date & end_date**: Date range for multiple APODs
    - **count**: Number of random APODs (max 100)

    Cannot combine date with start_date/end_date or count parameters.
    """,
)
async def get_astronomy_picture_of_day(
    request: APODRequest = Depends(),  # Auto-parses query params
    nasa_service: NASAService = Depends(get_nasa_service),  # Injects service
) -> Union[APODResponse, List[APODResponse]]:
    """
    Get Astronomy Picture of the Day from NASA.
    """
    try:
        return await nasa_service.get_apod(request)
    except NASAAPIError as e:
        # NASA API returned an error (403, 404, etc.)
        if e.status_code == 403:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid NASA API key or quota exceeded",
            )
        elif e.status_code == 404:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Requested APOD data not found",
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"NASA API error: {e.message}",
            )
    except NASAValidationError as e:
        # Invalid response from NASA API
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Invalid response from NASA API: {str(e)}",
        )
    except (NASAConnectionError, NASATimeoutError) as e:
        # Connection or timeout issues
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"NASA API temporarily unavailable: {str(e)}",
        )
    except Exception as err:
        # Any other unexpected errors
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred while fetching APOD data: {str(err)}",
        )
