"""
Unit tests for Stop model.
"""

from django.test import TestCase
from models.trip import Trip
from models.stop import Stop
from constants.status import StopType


class StopModelTests(TestCase):

    def test_create_stop(self):
        trip = Trip.objects.create(
            current_location='New York, NY',
            pickup_location='Chicago, IL',
            dropoff_location='Los Angeles, CA'
        )
        stop = Stop.objects.create(
            trip=trip,
            location='Chicago, IL',
            stop_type=StopType.PICKUP,
            sequence=1,
            duration_hours=1.0
        )

        self.assertEqual(stop.trip, trip)
        self.assertEqual(stop.stop_type, StopType.PICKUP)
