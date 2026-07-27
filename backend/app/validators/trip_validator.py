"""
Trip request validators.
"""

from rest_framework import serializers
from models.trip import Trip
from models.stop import Stop


class TripInputValidator(serializers.Serializer):
    """Validates trip planning input payload."""

    current_location = serializers.CharField(required=True, max_length=255)
    pickup_location = serializers.CharField(required=True, max_length=255)
    dropoff_location = serializers.CharField(required=True, max_length=255)
    cycle_hours_used = serializers.FloatField(required=False, default=0.0, min_value=0.0, max_value=70.0)


class StopSerializer(serializers.ModelSerializer):
    """Serializer for Stop model."""

    class Meta:
        model = Stop
        fields = ['id', 'location', 'stop_type', 'sequence', 'duration_hours', 'notes']


class TripSerializer(serializers.ModelSerializer):
    """Serializer for detailed Trip response."""

    stops = StopSerializer(many=True, read_only=True)

    class Meta:
        model = Trip
        fields = [
            'id',
            'current_location',
            'pickup_location',
            'dropoff_location',
            'cycle_hours_used',
            'total_distance_miles',
            'estimated_duration_hours',
            'status',
            'stops',
            'created_at',
            'updated_at',
        ]
