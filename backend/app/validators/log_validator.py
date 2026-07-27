"""
Log validators and serializers.
"""

from rest_framework import serializers
from models.log_sheet import DailyLog


class DailyLogSerializer(serializers.ModelSerializer):
    """Serializer for DailyLog entity."""

    class Meta:
        model = DailyLog
        fields = [
            'id',
            'trip',
            'day_number',
            'off_duty_hours',
            'sleeper_berth_hours',
            'driving_hours',
            'on_duty_not_driving_hours',
            'total_miles_driven',
            'created_at',
            'updated_at',
        ]
