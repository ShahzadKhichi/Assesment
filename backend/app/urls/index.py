"""
Root URL index — aggregates all domain URL routers.
"""

from django.urls import include, path

urlpatterns = [
    path('auth/', include('urls.auth_urls')),
    path('trips/', include('urls.trip_urls')),
    path('logs/', include('urls.log_urls')),
    path('routes/', include('urls.route_urls')),
]
