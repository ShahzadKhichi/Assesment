"""
Unit tests for MapService fallback logic.
"""

from unittest import TestCase
from services.map_service import MapService


class MapServiceTests(TestCase):

    def test_fallback_route_estimation(self):
        # Explicit empty string api_key triggers fallback route estimation
        service = MapService(api_key='')
        route = service.calculate_route('Origin', 'Pickup', 'Dropoff')

        self.assertEqual(route['total_distance'], 500.0)
        self.assertEqual(route['source'], 'FALLBACK_ESTIMATION')
        self.assertEqual(len(route['legs']), 2)
