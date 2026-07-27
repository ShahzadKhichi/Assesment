"""
Log URL routes.
"""

from django.urls import include, path
from rest_framework.routers import DefaultRouter
from views.log_view import LogViewSet, download_pdf_view

router = DefaultRouter()
router.register(r'', LogViewSet, basename='log')

urlpatterns = [
    path('<uuid:log_id>/pdf/', download_pdf_view, name='download_log_pdf'),
    path('', include(router.urls)),
]
