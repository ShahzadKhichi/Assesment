"""
User profile view — placeholder for user profile CRUD.
"""

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from utils.response import success_response


@api_view(['GET'])
@permission_classes([AllowAny])
def user_profile_view(request: Request) -> Response:
    """GET /api/v1/users/profile/ — placeholder for user profile."""
    return Response(success_response({'message': 'User profile endpoint'}))
