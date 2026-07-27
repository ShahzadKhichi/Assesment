"""
Rate limiting middleware.
"""

import logging
from django.core.cache import cache
from django.http import JsonResponse

logger = logging.getLogger(__name__)

DEFAULT_RATE_LIMIT = 100  # requests per minute
RATE_LIMIT_WINDOW = 60    # seconds


class RateLimiterMiddleware:
    """Simple IP-based rate limiter using Redis cache."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        ip = self._get_client_ip(request)
        cache_key = f"rate_limit:{ip}"

        try:
            request_count = cache.get(cache_key, 0)
            if request_count >= DEFAULT_RATE_LIMIT:
                logger.warning(f"Rate limit exceeded for IP: {ip}")
                return JsonResponse({
                    'success': False,
                    'error': 'Rate limit exceeded. Please try again later.',
                    'data': None,
                    'errors': {}
                }, status=429)

            cache.set(cache_key, request_count + 1, timeout=RATE_LIMIT_WINDOW)
        except Exception:
            pass  # Fail open if cache unavailable

        return self.get_response(request)

    def _get_client_ip(self, request) -> str:
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR', '0.0.0.0')
