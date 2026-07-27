"""
Log API views — PDF download and LogViewSet.
"""

import logging
from django.http import HttpResponse
from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from models.log_sheet import DailyLog
from validators.log_validator import DailyLogSerializer
from services.log_generator import LogGenerator
from utils.response import error_response

logger = logging.getLogger(__name__)


@swagger_auto_schema(
    method='get',
    responses={
        200: openapi.Response('PDF stream of 24-hour DOT ELD driver log'),
        404: openapi.Response('Daily log not found'),
    },
    operation_description="Download DOT-compliant 24-hour ELD driver log PDF."
)
@api_view(['GET'])
@permission_classes([AllowAny])
def download_pdf_view(request: Request, log_id: str) -> HttpResponse:
    """GET /api/v1/logs/<log_id>/pdf/"""
    try:
        pdf_bytes = LogGenerator().generate_pdf_for_log(log_id)
        response = HttpResponse(pdf_bytes, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="daily_log_{log_id}.pdf"'
        return response
    except Exception as e:
        return Response(error_response(str(e)), status=status.HTTP_404_NOT_FOUND)


class LogViewSet(viewsets.ModelViewSet):
    """ViewSet for managing DailyLog instances."""

    queryset = DailyLog.objects.all().select_related('trip')
    serializer_class = DailyLogSerializer
    permission_classes = [AllowAny]
