"""
Health check tests
"""

from django.test import TestCase
from django.urls import reverse
import json

class HealthCheckTests(TestCase):
    def test_health_check_returns_200(self):
        url = reverse('health')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
    
    def test_health_check_returns_json(self):
        url = reverse('health')
        response = self.client.get(url)
        self.assertEqual(response['Content-Type'], 'application/json')
    
    def test_health_check_has_required_fields(self):
        url = reverse('health')
        response = self.client.get(url)
        data = json.loads(response.content)
        self.assertIn('status', data)
        self.assertIn('service', data)
        self.assertIn('version', data)
        self.assertEqual(data['status'], 'healthy')
