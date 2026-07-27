"""
Password hashing helpers.
"""

from django.contrib.auth.hashers import make_password, check_password


def hash_password(raw_password: str) -> str:
    """Hash a raw password string."""
    return make_password(raw_password)


def verify_password(raw_password: str, hashed_password: str) -> bool:
    """Verify a raw password against its hash."""
    return check_password(raw_password, hashed_password)
