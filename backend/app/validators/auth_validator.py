"""
Auth request validators.
"""

from rest_framework import serializers


class SignupValidator(serializers.Serializer):
    """Validates user registration request payload."""

    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, min_length=8, write_only=True)
    first_name = serializers.CharField(required=False, allow_blank=True, default='')
    last_name = serializers.CharField(required=False, allow_blank=True, default='')


class VerifyOTPValidator(serializers.Serializer):
    """Validates OTP verification payload."""

    email = serializers.EmailField(required=True)
    otp_code = serializers.CharField(required=True, min_length=6, max_length=6)


class LoginValidator(serializers.Serializer):
    """Validates user login request payload."""

    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True)


class ResendOTPValidator(serializers.Serializer):
    """Validates resend OTP request payload."""

    email = serializers.EmailField(required=True)


class ForgotPasswordValidator(serializers.Serializer):
    """Validates forgot password request payload."""

    email = serializers.EmailField(required=True)


class ResetPasswordValidator(serializers.Serializer):
    """Validates reset password request payload."""

    email = serializers.EmailField(required=True)
    otp_code = serializers.CharField(required=True, min_length=6, max_length=6)
    new_password = serializers.CharField(required=True, min_length=8, write_only=True)
