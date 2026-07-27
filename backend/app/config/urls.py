"""
Root URL Configuration for Trip Planner API.

Includes Swagger API documentation (drf_yasg), health check endpoint,
and v1 API routing for trips, logs, and routes apps.
"""

from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path
from drf_yasg import openapi
from drf_yasg.views import get_schema_view
from rest_framework import permissions

# Swagger Schema View configuration
schema_view = get_schema_view(
    openapi.Info(
        title="Trip Planner Backend API",
        default_version="v1",
        description="SOLID-compliant commercial truck trip planner and HOS compliance engine API.",
        contact=openapi.Contact(email="support@tripplanner.com"),
        license=openapi.License(name="MIT License"),
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)


def health_check(request):
    """
    Health check endpoint returning JSON service status.
    """
    return JsonResponse(
        {
            'status': 'healthy',
            'service': 'trip-planner-backend',
            'version': '1.0.0',
        },
        status=200
    )


urlpatterns = [
    # Admin Panel
    path('admin/', admin.site.urls),

    # Health Check
    path('health/', health_check, name='health'),

    # Swagger / OpenAPI Documentation
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    path('swagger.json', schema_view.without_ui(cache_timeout=0), name='schema-json'),

    # API v1 Domain Endpoints
    path('api/v1/', include('urls.index')),
]
