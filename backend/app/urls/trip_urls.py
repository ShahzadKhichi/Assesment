"""
Trip URL routes.
"""

from django.urls import include, path
from rest_framework.routers import DefaultRouter
from views.trip_view import TripViewSet, location_suggestions_view, plan_trip_view

router = DefaultRouter()
router.register(r'', TripViewSet, basename='trip')

urlpatterns = [
    path('plan/', plan_trip_view, name='plan_trip'),
    path('suggestions/', location_suggestions_view, name='location_suggestions'),
    path('', include(router.urls)),
]
