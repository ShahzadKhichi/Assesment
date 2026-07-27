"""
Route API view — placeholder for route endpoints.
"""

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from validators.route_validator import RouteInputValidator
from services.map_service import MapService
from utils.response import success_response, error_response


@swagger_auto_schema(
    method='post',
    request_body=RouteInputValidator,
    responses={
        200: openapi.Response('Route calculated'),
        400: openapi.Response('Validation error'),
    },
    operation_description="Calculate route between two locations."
)
@api_view(['POST'])
@permission_classes([AllowAny])
def calculate_route_view(request: Request) -> Response:
    """POST /api/v1/routes/calculate/"""
    serializer = RouteInputValidator(data=request.data)
    if not serializer.is_valid():
        return Response(error_response('Validation error', serializer.errors), status=400)

    try:
        result = MapService().calculate_route(
            serializer.validated_data['origin'],
            serializer.validated_data['origin'],
            serializer.validated_data['destination']
        )
        return Response(success_response(result))
    except Exception as e:
        return Response(error_response(str(e)), status=400)
