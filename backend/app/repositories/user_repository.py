"""
UserRepository handling database access for User model.
"""

from typing import Optional, Any
from repositories.base_repository import BaseRepository
from models.user import User


class UserRepository(BaseRepository[User]):
    """UserRepository implementation."""

    def __init__(self) -> None:
        super().__init__(model_class=User)

    def get_by_email(self, email: str) -> Optional[User]:
        try:
            return self.model_class.objects.get(email__iexact=email.strip())
        except self.model_class.DoesNotExist:
            return None

    def mark_verified(self, user_id: Any) -> Optional[User]:
        user = self.get_by_id(user_id)
        if user:
            user.is_verified = True
            user.otp_code = None
            user.otp_expires_at = None
            user.save(update_fields=['is_verified', 'otp_code', 'otp_expires_at', 'updated_at'])
        return user

    def set_otp(self, user: User, otp_code: str, expires_at: Any) -> User:
        user.otp_code = otp_code
        user.otp_expires_at = expires_at
        user.save(update_fields=['otp_code', 'otp_expires_at', 'updated_at'])
        return user

    def get_with_related(self, entity_id: Any) -> Optional[User]:
        return self.get_by_id(entity_id)
