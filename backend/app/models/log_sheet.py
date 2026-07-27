"""
DailyLog log sheet domain model.
"""

from django.db import models
from models.base import BaseModel
from models.trip import Trip


class DailyLog(BaseModel):
    """Model representing a 24-hour driver log sheet for FMCSA/DOT compliance."""

    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='daily_logs')
    day_number = models.PositiveIntegerField(default=1)
    off_duty_hours = models.FloatField(default=10.0)
    sleeper_berth_hours = models.FloatField(default=0.0)
    driving_hours = models.FloatField(default=11.0)
    on_duty_not_driving_hours = models.FloatField(default=3.0)
    total_miles_driven = models.FloatField(default=500.0)

    class Meta:
        db_table = 'daily_logs'
        ordering = ['day_number']
        unique_together = ('trip', 'day_number')

    def __str__(self) -> str:
        return f"DailyLog(Trip={self.trip_id}, Day={self.day_number})"
