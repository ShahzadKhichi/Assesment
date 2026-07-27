"""
Unit tests for HOSService compliance engine.
"""

from django.test import TestCase
from services.hos_service import HOSService
from exceptions import ValidationError, BusinessLogicError


class HOSServiceTests(TestCase):

    def setUp(self):
        self.service = HOSService()

    def test_calculate_hos_schedule_valid(self):
        result = self.service.calculate_hos_schedule(
            total_distance_miles=600.0,
            cycle_hours_used=10.0,
            current_location='New York, NY',
            pickup_location='Philadelphia, PA',
            dropoff_location='Chicago, IL'
        )

        self.assertEqual(result['total_distance_miles'], 600.0)
        self.assertGreater(result['total_duration_hours'], 10.0)
        self.assertGreaterEqual(len(result['stops']), 4)

    def test_invalid_cycle_hours_raises_validation_error(self):
        with self.assertRaises(ValidationError):
            self.service.calculate_hos_schedule(
                total_distance_miles=100.0,
                cycle_hours_used=75.0
            )

    def test_exceeding_cycle_hours_raises_business_logic_error(self):
        with self.assertRaises(BusinessLogicError):
            self.service.calculate_hos_schedule(
                total_distance_miles=1000.0,
                cycle_hours_used=65.0
            )
