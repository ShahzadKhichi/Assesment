"""
General-purpose helper functions.
"""

import uuid


def is_valid_uuid(value: str) -> bool:
    """Check if a string is a valid UUID."""
    try:
        uuid.UUID(str(value))
        return True
    except ValueError:
        return False


def truncate(text: str, max_length: int = 100) -> str:
    """Truncate a string to a maximum length."""
    if len(text) <= max_length:
        return text
    return text[:max_length - 3] + '...'
