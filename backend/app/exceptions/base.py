"""
Base application exceptions.
"""

from typing import Optional, Dict, Any


class BaseAppException(Exception):
    """Base exception for all application errors."""

    def __init__(self, message: str = "An error occurred", details: Optional[Dict[str, Any]] = None):
        super().__init__(message)
        self.message = message
        self.details = details or {}


class NotFoundError(BaseAppException):
    """Resource not found."""

    def __init__(self, message: str = "Resource not found"):
        super().__init__(message)


class APIError(BaseAppException):
    """External API error."""

    def __init__(self, message: str = "External API error", status_code: int = 500):
        super().__init__(message)
        self.status_code = status_code
