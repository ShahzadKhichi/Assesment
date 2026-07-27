"""
OTP Service — Generates and verifies OTP codes via Redis cache.
"""

import logging
import random
from datetime import timedelta
from typing import Optional
from django.core.cache import cache
from django.utils import timezone
from models.user import User

logger = logging.getLogger(__name__)
OTP_EXPIRY_SECONDS = 600  # 10 minutes


class OTPService:
    """Service for generating, Redis-caching, DB-storing, and verifying OTP verification codes."""

    def generate_otp(self, email: str, user: Optional[User] = None) -> str:
        otp_code = f"{random.randint(100000, 999999)}"
        cache_key = self._get_cache_key(email)

        # 1. Store in Redis Cache
        try:
            cache.set(cache_key, otp_code, timeout=OTP_EXPIRY_SECONDS)
            logger.info(f"Cached OTP for email '{email}' in Redis with {OTP_EXPIRY_SECONDS}s TTL")
        except Exception as e:
            logger.warning(f"Could not cache OTP in Redis: {str(e)}")

        # 2. Store persistently in DB if user object provided
        if user:
            try:
                user.otp_code = otp_code
                user.otp_expires_at = timezone.now() + timedelta(seconds=OTP_EXPIRY_SECONDS)
                user.save(update_fields=['otp_code', 'otp_expires_at', 'updated_at'])
                logger.info(f"Saved OTP '{otp_code}' for user {user.email} in DB")
            except Exception as exc:
                logger.error(f"Failed to save OTP to database: {exc}")

        return otp_code

    def verify_otp(self, email: str, submitted_otp: str, user: Optional[User] = None) -> bool:
        submitted_clean = str(submitted_otp).strip()
        cache_key = self._get_cache_key(email)

        # 1. Check Redis Cache
        try:
            cached_otp = cache.get(cache_key)
            if cached_otp and str(cached_otp).strip() == submitted_clean:
                cache.delete(cache_key)
                logger.info(f"OTP verified successfully via Redis cache for email '{email}'")
                return True
        except Exception as e:
            logger.warning(f"Failed to check OTP from Redis: {str(e)}")

        # 2. Fallback check DB
        if user and user.otp_code and user.otp_expires_at:
            if user.otp_expires_at >= timezone.now() and str(user.otp_code).strip() == submitted_clean:
                logger.info(f"OTP verified successfully via Database for user '{email}'")
                return True

        logger.warning(f"OTP verification failed for email '{email}'")
        return False

    def get_cached_otp(self, email: str) -> Optional[str]:
        try:
            return cache.get(self._get_cache_key(email))
        except Exception:
            return None

    def _get_cache_key(self, email: str) -> str:
        return f"otp:{email.lower().strip()}"

