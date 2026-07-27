"""
Integration tests for Trip planning and API endpoint workflow.
"""

from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from models.trip import Trip


class TripIntegrationTests(APITestCase):

    def test_plan_trip_api_endpoint(self):
        url = reverse('plan_trip')
        payload = {
            'current_location': 'New York, NY',
            'pickup_location': 'Philadelphia, PA',
            'dropoff_location': 'Chicago, IL',
            'cycle_hours_used': 10.0
        }

        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])
        self.assertIn('trip_id', response.data['data'])
        self.assertEqual(Trip.objects.count(), 1)
