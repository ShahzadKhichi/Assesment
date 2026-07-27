"""
Stop API view — placeholder for stop CRUD.
"""

from rest_framework import viewsets
from rest_framework.permissions import AllowAny

from models.stop import Stop
from validators.trip_validator import StopSerializer


class StopViewSet(viewsets.ModelViewSet):
    """ViewSet for managing Stop resources."""

    queryset = Stop.objects.all().select_related('trip')
    serializer_class = StopSerializer
    permission_classes = [AllowAny]
