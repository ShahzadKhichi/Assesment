"""
Authentication Service — Signup, OTP Verify, Login, Resend OTP, Forgot & Reset Password.
"""

import logging
from typing import Any, Dict, Optional
from django.template.loader import render_to_string

from exceptions import AuthenticationError, DuplicateError, NotFoundError, ValidationError
from repositories.user_repository import UserRepository
from services.user_service import OTPService
from helpers.jwt_helper import generate_tokens

# pyrefly: ignore [missing-import]
from helpers.password_helper import hash_password

logger = logging.getLogger(__name__)


class AuthService:
    """Business service orchestrating authentication flows."""

    def __init__(
        self,
        repository: Optional[UserRepository] = None,
        otp_service: Optional[OTPService] = None
    ) -> None:
        self.repository = repository or UserRepository()
        self.otp_service = otp_service or OTPService()

    def signup(self, data: Dict[str, Any]) -> Dict[str, Any]:
        email = data.get('email', '').lower().strip()
        password = data.get('password')
        first_name = data.get('first_name', '')
        last_name = data.get('last_name', '')

        if not email or not password:
            raise ValidationError("Email and password are required for signup.")

        existing_user = self.repository.get_by_email(email)
        if existing_user:
            if existing_user.is_verified:
                raise DuplicateError(f"User with email '{email}' already exists.")
            user = existing_user
        else:
            user = self.repository.create(
                email=email,
                password=hash_password(password),
                first_name=first_name,
                last_name=last_name,
                is_verified=False
            )

        otp_code = self.otp_service.generate_otp(email, user=user)

        # Render HTML template for OTP verification
        try:
            html_body = render_to_string('emails/otp_verification.html', {'otp_code': otp_code})
        except Exception:
            html_body = f"<h2>Your Verification Code: {otp_code}</h2>"

        from services.mail_service import MailService
        MailService().send_email_async(
            to_email=email,
            subject=f"Your Verification Code: {otp_code}",
            body=f"Your HOS Trip Planner verification code is: {otp_code}. Valid for 10 minutes.",
            html_body=html_body
        )

        return {
            'success': True,
            'data': {
                'user_id': str(user.id),
                'email': user.email,
                'is_verified': user.is_verified,
                'otp_code': otp_code,
                'message': 'Signup successful. Verification OTP sent to your email.'
            },
            'error': None,
            'errors': {}
        }

    def verify_otp(self, email: str, otp_code: str) -> Dict[str, Any]:
        user = self.repository.get_by_email(email)
        if not user:
            raise NotFoundError(f"User with email '{email}' not found.")

        is_valid = self.otp_service.verify_otp(email, otp_code, user=user)
        if not is_valid:
            raise ValidationError("Invalid or expired OTP verification code.")

        verified_user = self.repository.mark_verified(user.id)
        tokens = generate_tokens(verified_user)

        return {
            'success': True,
            'data': {
                'user': {
                    'id': str(verified_user.id),
                    'email': verified_user.email,
                    'is_verified': verified_user.is_verified,
                },
                'tokens': tokens
            },
            'error': None,
            'errors': {}
        }

    def login(self, email: str, password: str) -> Dict[str, Any]:
        user = self.repository.get_by_email(email)
        if not user or not user.check_password(password):
            raise AuthenticationError("Invalid email or password.")

        if not user.is_verified:
            otp_code = self.otp_service.generate_otp(user.email, user=user)
            try:
                html_body = render_to_string('emails/otp_verification.html', {'otp_code': otp_code})
            except Exception:
                html_body = f"<h2>Your Verification Code: {otp_code}</h2>"

            from services.mail_service import MailService
            MailService().send_email_async(
                to_email=user.email,
                subject=f"Your Verification Code: {otp_code}",
                body=f"Your HOS Trip Planner verification code is: {otp_code}.",
                html_body=html_body
            )
            raise ValidationError(f"Account email not verified. A new OTP has been sent to your email.")

        tokens = generate_tokens(user)

        return {
            'success': True,
            'data': {
                'user': {
                    'id': str(user.id),
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'is_verified': user.is_verified,
                },
                'tokens': tokens
            },
            'error': None,
            'errors': {}
        }

    def resend_otp(self, email: str) -> Dict[str, Any]:
        user = self.repository.get_by_email(email)
        if not user:
            raise NotFoundError(f"User with email '{email}' not found.")

        if user.is_verified:
            return {
                'success': True,
                'data': {'message': 'User email is already verified.'},
                'error': None,
                'errors': {}
            }

        otp_code = self.otp_service.generate_otp(email, user=user)
        try:
            html_body = render_to_string('emails/otp_verification.html', {'otp_code': otp_code})
        except Exception:
            html_body = f"<h2>Your Verification Code: {otp_code}</h2>"

        from services.mail_service import MailService
        MailService().send_email_async(
            to_email=email,
            subject=f"Your Verification Code: {otp_code}",
            body=f"Your HOS Trip Planner verification code is: {otp_code}.",
            html_body=html_body
        )

        return {
            'success': True,
            'data': {
                'otp_code': otp_code,
                'message': 'New OTP verification code sent to your email.'
            },
            'error': None,
            'errors': {}
        }

    def forgot_password(self, email: str) -> Dict[str, Any]:
        """Generates reset OTP and dispatches password reset email."""
        user = self.repository.get_by_email(email)
        if not user:
            raise NotFoundError(f"User with email '{email}' not found.")

        otp_code = self.otp_service.generate_otp(email, user=user)

        try:
            html_body = render_to_string('emails/password_reset.html', {'otp_code': otp_code})
        except Exception:
            html_body = f"<h2>Password Reset Code: {otp_code}</h2>"

        from services.mail_service import MailService
        MailService().send_email_async(
            to_email=email,
            subject=f"Password Reset Code: {otp_code}",
            body=f"Your password reset authorization code is: {otp_code}. Valid for 10 minutes.",
            html_body=html_body
        )

        return {
            'success': True,
            'data': {
                'email': email,
                'otp_code': otp_code,
                'message': 'Password reset authorization code sent to your email.'
            },
            'error': None,
            'errors': {}
        }

    def reset_password(self, email: str, otp_code: str, new_password: str) -> Dict[str, Any]:
        """Verifies reset OTP and updates user password."""
        user = self.repository.get_by_email(email)
        if not user:
            raise NotFoundError(f"User with email '{email}' not found.")

        is_valid = self.otp_service.verify_otp(email, otp_code, user=user)
        if not is_valid:
            raise ValidationError("Invalid or expired password reset authorization code.")

        user.set_password(new_password)
        user.otp_code = None
        user.otp_expires_at = None
        user.save(update_fields=['password', 'otp_code', 'otp_expires_at', 'updated_at'])

        tokens = generate_tokens(user)

        return {
            'success': True,
            'data': {
                'user': {
                    'id': str(user.id),
                    'email': user.email,
                    'is_verified': user.is_verified,
                },
                'tokens': tokens,
                'message': 'Password reset successfully. You are now signed in.'
            },
            'error': None,
            'errors': {}
        }
