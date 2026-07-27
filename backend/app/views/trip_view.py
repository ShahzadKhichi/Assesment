"""
Trip API views — plan_trip_view and TripViewSet.
"""

import logging
from typing import List, Dict, Any
from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from models.trip import Trip
from validators.trip_validator import TripInputValidator, TripSerializer
from services.map_service import MapService
from services.trip_service import TripService
from utils.response import error_response

logger = logging.getLogger(__name__)


def _build_location_suggestions(query: str) -> List[Dict[str, Any]]:
    """Return autocomplete suggestions from Google Places or fallback local matches."""
    cleaned = (query or '').strip()
    if not cleaned:
        return []

    try:
        return MapService().autocomplete(cleaned)
    except Exception as exc:
        logger.warning('Location suggestions failed: %s', exc)
        return []


@api_view(['GET'])
@permission_classes([AllowAny])
def location_suggestions_view(request: Request) -> Response:
    """GET /api/v1/trips/suggestions/"""
    query = request.query_params.get('q', '')
    suggestions = _build_location_suggestions(query)
    return Response({'suggestions': suggestions}, status=status.HTTP_200_OK)


@swagger_auto_schema(
    method='post',
    request_body=TripInputValidator,
    responses={
        201: openapi.Response('Trip planned successfully', TripSerializer),
        400: openapi.Response('Validation or HOS error'),
    },
    operation_description="Calculate route, HOS schedule, and plan a trip."
)
@api_view(['POST'])
@permission_classes([AllowAny])
def plan_trip_view(request: Request) -> Response:
    """POST /api/v1/trips/plan/"""
    serializer = TripInputValidator(data=request.data)
    if not serializer.is_valid():
        return Response(
            error_response('Validation error', serializer.errors),
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        result = TripService().plan_trip(serializer.validated_data)
        trip_instance = result['data'].pop('trip', None)
        if trip_instance:
            result['data']['trip'] = TripSerializer(trip_instance).data
        return Response(result, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response(error_response(str(e)), status=status.HTTP_400_BAD_REQUEST)


class TripViewSet(viewsets.ModelViewSet):
    """ViewSet for managing Trip resources."""

    queryset = Trip.objects.all().prefetch_related('stops', 'daily_logs')
    serializer_class = TripSerializer
    permission_classes = [AllowAny]
