"""
Unit tests for User model and manager.
"""

from django.test import TestCase
from models.user import User


class UserModelTests(TestCase):
    """Test suite for custom User model."""

    def test_create_user_successful(self) -> None:
        user = User.objects.create_user(
            email='driver@example.com',
            password='Password123!',
            first_name='John',
            last_name='Doe'
        )

        self.assertEqual(user.email, 'driver@example.com')
        self.assertTrue(user.check_password('Password123!'))
        self.assertFalse(user.is_verified)
        self.assertTrue(user.is_active)
        self.assertFalse(user.is_staff)

    def test_create_user_without_email_raises_value_error(self) -> None:
        with self.assertRaises(ValueError):
            User.objects.create_user(email='', password='Password123!')

    def test_create_superuser_successful(self) -> None:
        superuser = User.objects.create_superuser(
            email='admin@example.com',
            password='SuperPassword123!'
        )

        self.assertTrue(superuser.is_staff)
        self.assertTrue(superuser.is_superuser)
        self.assertTrue(superuser.is_verified)
