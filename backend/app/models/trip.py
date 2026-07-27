"""
Trip domain model.
"""

from django.db import models
from models.base import BaseModel
from constants.status import TripStatus


class Trip(BaseModel):
    """Trip model representing commercial truck haul."""

    current_location = models.CharField(max_length=255)
    pickup_location = models.CharField(max_length=255)
    dropoff_location = models.CharField(max_length=255)
    cycle_hours_used = models.FloatField(default=0.0)
    total_distance_miles = models.FloatField(default=0.0)
    estimated_duration_hours = models.FloatField(default=0.0)
    status = models.CharField(
        max_length=20,
        choices=TripStatus.choices,
        default=TripStatus.PENDING
    )

    class Meta:
        db_table = 'trips'
        ordering = ['-created_at']

    def __str__(self) -> str:
        return f"Trip({self.id}: {self.pickup_location} → {self.dropoff_location})"
