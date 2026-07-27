"""
Unit tests for Trip model.
"""

from django.test import TestCase
from models.trip import Trip
from constants.status import TripStatus


class TripModelTests(TestCase):

    def test_create_trip_defaults(self):
        trip = Trip.objects.create(
            current_location='New York, NY',
            pickup_location='Chicago, IL',
            dropoff_location='Los Angeles, CA'
        )

        self.assertEqual(trip.status, TripStatus.PENDING)
        self.assertEqual(trip.cycle_hours_used, 0.0)
        self.assertIsNotNone(trip.id)
