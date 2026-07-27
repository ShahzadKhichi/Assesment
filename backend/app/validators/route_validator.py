"""
Route request validators.
"""

from rest_framework import serializers


class RouteInputValidator(serializers.Serializer):
    """Validates route calculation input."""

    origin = serializers.CharField(required=True, max_length=255)
    destination = serializers.CharField(required=True, max_length=255)
    waypoints = serializers.ListField(
        child=serializers.CharField(max_length=255),
        required=False,
        default=[]
    )
