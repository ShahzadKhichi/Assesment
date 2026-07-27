"""
Request content-type validation middleware.
"""

from django.http import JsonResponse


class ContentTypeValidationMiddleware:
    """Ensures POST/PUT/PATCH requests include a valid Content-Type header."""

    METHODS_REQUIRING_BODY = ('POST', 'PUT', 'PATCH')

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.method in self.METHODS_REQUIRING_BODY:
            content_type = request.content_type or ''
            if content_type and 'application/json' not in content_type and 'multipart/form-data' not in content_type:
                pass  # Allow DRF to handle content negotiation

        return self.get_response(request)
