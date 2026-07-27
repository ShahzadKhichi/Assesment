"""
Stop domain model.
"""

from django.db import models
from models.base import BaseModel
from models.trip import Trip
from constants.status import StopType


class Stop(BaseModel):
    """Stop model representing scheduled rest, fuel, or cargo stops along route."""

    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='stops')
    location = models.CharField(max_length=255)
    stop_type = models.CharField(max_length=20, choices=StopType.choices)
    sequence = models.PositiveIntegerField(default=1)
    duration_hours = models.FloatField(default=0.0)
    notes = models.TextField(blank=True, default='')

    class Meta:
        db_table = 'trip_stops'
        ordering = ['sequence']

    def __str__(self) -> str:
        return f"Stop({self.sequence}: {self.stop_type} at {self.location})"
