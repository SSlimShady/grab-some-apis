"""
NASA API related Pydantic schemas for request/response validation.
"""

from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, Field, field_validator, model_validator


class APODResponse(BaseModel):
    """Schema for APOD response from NASA API."""

    title: str
    date: str
    explanation: str
    url: str  # Using string for compatibility
    hdurl: Optional[str] = None
    media_type: str
    service_version: str
    copyright: Optional[str] = None


class APODRequest(BaseModel):
    """Schema for requesting the Astronomy Picture of the Day (APOD)."""

    date: Optional[str] = Field(
        None,
        description="Date for APOD in YYYY-MM-DD format. Defaults to today.",
        pattern=r"^\d{4}-\d{2}-\d{2}$",
    )
    start_date: Optional[str] = Field(
        None,
        description="Start date for APOD in YYYY-MM-DD format. Optional for range queries.",
        pattern=r"^\d{4}-\d{2}-\d{2}$",
    )
    end_date: Optional[str] = Field(
        None,
        description="End date for APOD in YYYY-MM-DD format. Optional for range queries.",
        pattern=r"^\d{4}-\d{2}-\d{2}$",
    )
    count: Optional[int] = Field(
        None, description="Number of random APOD images to retrieve."
    )
    thumbs: Optional[bool] = Field(
        True,
        description="Whether to include thumbnail images in the response in case of video.",
    )

    @field_validator("date", "start_date", "end_date")
    @classmethod
    def validate_apod_date(cls, v: Optional[str], info) -> Optional[str]:
        """Validate that any date field is valid for APOD API."""
        if v is not None:
            field_name = info.field_name

            try:
                parsed_date = datetime.strptime(v, "%Y-%m-%d").date()
            except ValueError:
                raise ValueError(
                    f"Invalid {field_name} format. Expected YYYY-MM-DD, got: {v}"
                )

            min_date = date(1995, 6, 16)  # First APOD date

            if parsed_date < min_date:
                raise ValueError(
                    f'{field_name.replace("_", " ").title()} must be on or after 1995-06-16 (first APOD). Got: {v}'
                )

            # Don't allow future dates beyond today
            if parsed_date > date.today():
                raise ValueError(
                    f'{field_name.replace("_", " ").title()} cannot be in the future. Got: {v}'
                )

        return v

    @model_validator(mode="after")
    def validate_date_logic(self):
        """Validate business logic between date fields."""
        # Note: When no parameters are provided, NASA API returns today's APOD
        # by default

        # Check that only one type of date parameter is used
        if self.date is not None and (
            self.start_date is not None or self.end_date is not None
        ):
            raise ValueError(
                'Cannot use "date" parameter with "start_date" or "end_date"'
            )

        # If using date range, both start_date and end_date must be provided
        if (self.start_date is not None) != (self.end_date is not None):
            raise ValueError(
                'Both "start_date" and "end_date" must be provided for date range queries'
            )

        # Validate that start_date < end_date
        if self.start_date is not None and self.end_date is not None:
            try:
                start = datetime.strptime(self.start_date, "%Y-%m-%d").date()
                end = datetime.strptime(self.end_date, "%Y-%m-%d").date()

                if start >= end:
                    raise ValueError(
                        f"Start date ({self.start_date}) must be before end date ({self.end_date})"
                    )

                # Check range is not too large (max 1 year for performance)
                if (end - start).days > 365:
                    raise ValueError(
                        f"Date range cannot exceed 365 days. Current range: {(end - start).days} days"
                    )

            except ValueError as e:
                if "does not match format" in str(e):
                    # This should not happen as individual field validators
                    # already checked format
                    pass
                else:
                    raise e

        return self
