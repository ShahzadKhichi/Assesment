"""
Trip & HOS domain exceptions.
"""

from exceptions.base import BaseAppException


class BusinessLogicError(BaseAppException):
    """HOS rule or business logic constraint violation."""

    def __init__(self, message: str = "Business rule violated"):
        super().__init__(message)
