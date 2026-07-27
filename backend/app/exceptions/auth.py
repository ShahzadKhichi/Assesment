"""
Authentication related exceptions.
"""

from exceptions.base import BaseAppException


class AuthenticationError(BaseAppException):
    """Authentication credentials failure."""

    def __init__(self, message: str = "Authentication failed"):
        super().__init__(message)


class DuplicateError(BaseAppException):
    """Duplicate user account."""

    def __init__(self, message: str = "User account already exists"):
        super().__init__(message)
