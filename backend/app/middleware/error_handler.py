"""
Global error handler middleware.
"""

import logging
import traceback
from django.http import JsonResponse
from exceptions import BaseAppException

logger = logging.getLogger(__name__)


class ErrorHandlerMiddleware:
    """Catches unhandled exceptions and returns standardized JSON error responses."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        return self.get_response(request)

    def process_exception(self, request, exception):
        if isinstance(exception, BaseAppException):
            logger.warning(f"Application error: {exception.message}")
            return JsonResponse({
                'success': False,
                'data': None,
                'error': exception.message,
                'errors': exception.details
            }, status=400)

        logger.error(f"Unhandled exception: {str(exception)}\n{traceback.format_exc()}")
        return JsonResponse({
            'success': False,
            'data': None,
            'error': 'Internal server error',
            'errors': {}
        }, status=500)
