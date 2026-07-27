"""
Root conftest.py — shared fixtures for all tests.

Provides mock repositories, services, and common test data
so that unit tests remain isolated from the database and
external services.
"""

import uuid
from datetime import datetime, timedelta
from decimal import Decimal
from typing import Any, Dict, List
from unittest.mock import MagicMock, patch

import pytest


# ---------------------------------------------------------------------------
# Database fixture — required by pytest-django for any DB-touching test
# ---------------------------------------------------------------------------
@pytest.fixture
def db_access(db):
    """Provide database access for integration tests."""
    pass


# ---------------------------------------------------------------------------
# Mock Repository Fixtures
# ---------------------------------------------------------------------------
@pytest.fixture
def mock_repository() -> MagicMock:
    """Create a generic mock repository with standard CRUD methods."""
    repo = MagicMock()
    repo.get_all.return_value = []
    repo.get_by_id.return_value = None
    repo.create.return_value = MagicMock(id=uuid.uuid4())
    repo.update.return_value = None
    repo.delete.return_value = False
    repo.bulk_create.return_value = []
    repo.get_with_related.return_value = None
    return repo


@pytest.fixture
def mock_trip_repository() -> MagicMock:
    """Create a mock TripRepository with trip-specific methods."""
    repo = MagicMock()
    trip_id = uuid.uuid4()
    mock_trip = MagicMock()
    mock_trip.id = trip_id
    mock_trip.status = 'PENDING'
    mock_trip.current_location = 'New York, NY'
    mock_trip.pickup_location = 'Chicago, IL'
    mock_trip.dropoff_location = 'Los Angeles, CA'
    mock_trip.cycle_hours_used = Decimal('10.00')

    repo.create.return_value = mock_trip
    repo.get_by_id.return_value = mock_trip
    repo.get_all.return_value = [mock_trip]
    repo.get_active_trips.return_value = [mock_trip]
    repo.get_completed_trips.return_value = []
    repo.search_by_location.return_value = [mock_trip]
    repo.get_by_date_range.return_value = [mock_trip]
    repo.get_with_related.return_value = mock_trip
    return repo


# ---------------------------------------------------------------------------
# Mock Service Fixtures
# ---------------------------------------------------------------------------
@pytest.fixture
def mock_service() -> MagicMock:
    """Create a generic mock service."""
    service = MagicMock()
    service.execute.return_value = {
        'success': True,
        'data': {},
    }
    return service


@pytest.fixture
def mock_hos_service() -> MagicMock:
    """Create a mock HOSService with standard calculation results."""
    service = MagicMock()
    service.calculate_logs.return_value = {
        'total_days': 2,
        'fuel_stops': 1,
        'cycle_used': 20.0,
        'cycle_remaining': 50.0,
        'daily_logs': [
            {
                'day': 1,
                'driving_hours': 11.0,
                'on_duty_hours': 3.0,
                'off_duty_hours': 10.0,
                'duty_statuses': [],
            },
            {
                'day': 2,
                'driving_hours': 9.09,
                'on_duty_hours': 3.0,
                'off_duty_hours': 10.0,
                'duty_statuses': [],
            },
        ],
    }
    return service


# ---------------------------------------------------------------------------
# Common Test Data
# ---------------------------------------------------------------------------
@pytest.fixture
def valid_trip_data() -> Dict[str, Any]:
    """Return valid trip input data."""
    return {
        'current_location': 'New York, NY',
        'pickup_location': 'Chicago, IL',
        'dropoff_location': 'Los Angeles, CA',
        'cycle_hours_used': 10.0,
    }


@pytest.fixture
def invalid_trip_data_missing_fields() -> Dict[str, Any]:
    """Return trip data with missing required fields."""
    return {
        'current_location': 'New York, NY',
    }


@pytest.fixture
def invalid_trip_data_same_locations() -> Dict[str, Any]:
    """Return trip data where locations are the same."""
    return {
        'current_location': 'New York, NY',
        'pickup_location': 'New York, NY',
        'dropoff_location': 'Los Angeles, CA',
        'cycle_hours_used': 10.0,
    }
