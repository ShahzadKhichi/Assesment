"""
Date/time utility helpers.
"""

from datetime import datetime, timedelta
from django.utils import timezone


def utc_now() -> datetime:
    """Return timezone-aware current UTC datetime."""
    return timezone.now()


def minutes_from_now(minutes: int) -> datetime:
    """Return a datetime N minutes from now."""
    return timezone.now() + timedelta(minutes=minutes)


def format_date(dt: datetime, fmt: str = '%Y-%m-%d') -> str:
    """Format a datetime to string."""
    return dt.strftime(fmt)
