from django.urls import reverse
from rest_framework.test import APITestCase


class TripSuggestionTests(APITestCase):
    def test_suggestions_endpoint_returns_matches(self):
        url = reverse('location_suggestions')
        response = self.client.get(url, {'q': 'new yo'})

        self.assertEqual(response.status_code, 200)
        self.assertIn('suggestions', response.data)
        self.assertTrue(response.data['suggestions'])
        self.assertTrue(any(item['label'] == 'New York, NY' for item in response.data['suggestions']))
