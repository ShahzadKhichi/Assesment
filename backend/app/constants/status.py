"""
Trip status and Stop type constants.
"""

from django.db import models


class TripStatus(models.TextChoices):
    PENDING = 'PENDING', 'Pending'
    IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
    COMPLETED = 'COMPLETED', 'Completed'
    CANCELLED = 'CANCELLED', 'Cancelled'


class StopType(models.TextChoices):
    CURRENT = 'CURRENT', 'Current Location'
    PICKUP = 'PICKUP', 'Pickup Location'
    DROPOFF = 'DROPOFF', 'Dropoff Location'
    REST_BREAK = 'REST_BREAK', '30-Minute Rest Break'
    SLEEPER = 'SLEEPER', '10-Hour Sleeper Berth'
    FUEL = 'FUEL', 'Fuel Stop'
