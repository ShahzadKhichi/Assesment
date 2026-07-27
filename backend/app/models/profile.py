"""
OTP Verification profile model.
"""

from django.db import models
from models.base import BaseModel
from models.user import User


class OTPVerification(BaseModel):
    """Model tracking OTP verification attempts."""

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='otp_verifications')
    otp_code = models.CharField(max_length=6)
    is_used = models.BooleanField(default=False)
    expires_at = models.DateTimeField()

    class Meta:
        db_table = 'otp_verifications'
        verbose_name = 'OTP Verification'

    def __str__(self) -> str:
        return f"OTP({self.user.email}, code={self.otp_code}, used={self.is_used})"
