"""
Validation exceptions.
"""

from typing import Optional, Dict, Any
from exceptions.base import BaseAppException


class ValidationError(BaseAppException):
    """Validation failure exception."""

    def __init__(self, message: str = "Validation error occurred", errors: Optional[Dict[str, Any]] = None):
        super().__init__(message)
        self.errors = errors or {}
