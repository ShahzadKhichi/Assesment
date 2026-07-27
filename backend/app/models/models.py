"""
Aggregate imports for Django model registry discovery.
"""

from models.base import BaseModel
from models.user import User
from models.profile import OTPVerification
from models.trip import Trip
from models.stop import Stop
from models.log_sheet import DailyLog

__all__ = [
    'BaseModel',
    'User',
    'OTPVerification',
    'Trip',
    'Stop',
    'DailyLog',
]
