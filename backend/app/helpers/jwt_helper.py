"""
JWT token generation helper.
"""

from rest_framework_simplejwt.tokens import RefreshToken


def generate_tokens(user) -> dict:
    """Generate JWT access and refresh tokens for a user."""
    refresh = RefreshToken.for_user(user)
    return {
        'access': str(refresh.access_token),
        'refresh': str(refresh),
    }
