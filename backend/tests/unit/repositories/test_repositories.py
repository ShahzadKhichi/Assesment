"""
Unit tests for UserRepository, TripRepository, StopRepository, LogRepository.
"""

from django.test import TestCase
from models.user import User
from models.trip import Trip
from models.stop import Stop
from models.log_sheet import DailyLog
from repositories.user_repository import UserRepository
from repositories.trip_repository import TripRepository
from repositories.stop_repository import StopRepository
from repositories.log_repository import LogRepository
from constants.status import TripStatus, StopType


class RepositoryTests(TestCase):

    def setUp(self):
        self.user_repo = UserRepository()
        self.trip_repo = TripRepository()
        self.stop_repo = StopRepository()
        self.log_repo = LogRepository()

    def test_user_repository_crud(self):
        user = self.user_repo.create(email='test@example.com', password='pass')
        self.assertIsNotNone(user.id)

        fetched = self.user_repo.get_by_email('test@example.com')
        self.assertEqual(fetched.id, user.id)

        verified = self.user_repo.mark_verified(user.id)
        self.assertTrue(verified.is_verified)

    def test_trip_and_stop_repository(self):
        trip = self.trip_repo.create(
            current_location='NY',
            pickup_location='PA',
            dropoff_location='IL'
        )
        self.assertEqual(trip.status, TripStatus.PENDING)

        stop = self.stop_repo.create(
            trip=trip,
            location='PA',
            stop_type=StopType.PICKUP,
            sequence=1
        )
        stops = self.stop_repo.get_by_trip(trip.id)
        self.assertEqual(len(stops), 1)

    def test_log_repository(self):
        trip = self.trip_repo.create(
            current_location='NY',
            pickup_location='PA',
            dropoff_location='IL'
        )
        log = self.log_repo.create(trip=trip, day_number=1, driving_hours=8.0)
        fetched = self.log_repo.get_by_trip_and_day(trip.id, 1)
        self.assertEqual(fetched.id, log.id)
