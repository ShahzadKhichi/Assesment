"""
JWT authentication middleware.
"""

import logging
from django.http import JsonResponse
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

logger = logging.getLogger(__name__)

# Paths that don't require authentication
PUBLIC_PATHS = [
    '/api/v1/auth/',
    '/swagger/',
    '/redoc/',
    '/health/',
    '/admin/',
]


class JWTAuthMiddleware:
    """Middleware to validate JWT tokens on protected endpoints."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Skip public paths
        if any(request.path.startswith(path) for path in PUBLIC_PATHS):
            return self.get_response(request)

        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if not auth_header.startswith('Bearer '):
            return self.get_response(request)

        try:
            jwt_auth = JWTAuthentication()
            validated_token = jwt_auth.get_validated_token(
                auth_header.split(' ')[1]
            )
            request.user = jwt_auth.get_user(validated_token)
        except (InvalidToken, TokenError) as e:
            logger.warning(f"JWT validation failed: {str(e)}")

        return self.get_response(request)
