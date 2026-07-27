"""
Route URL routes.
"""

from django.urls import path
from views.route_view import calculate_route_view

urlpatterns = [
    path('calculate/', calculate_route_view, name='calculate_route'),
]
