"""
LogRepository for DailyLog entity queries.
"""

from typing import List, Optional, Any
from repositories.base_repository import BaseRepository
from models.log_sheet import DailyLog


class LogRepository(BaseRepository[DailyLog]):
    """LogRepository implementation."""

    def __init__(self) -> None:
        super().__init__(model_class=DailyLog)

    def get_with_related(self, entity_id: Any) -> Optional[DailyLog]:
        try:
            return self.model_class.objects.select_related('trip').get(pk=entity_id)
        except self.model_class.DoesNotExist:
            return None

    def get_by_trip(self, trip_id: Any) -> List[DailyLog]:
        return list(self.model_class.objects.filter(trip_id=trip_id).order_by('day_number'))

    def get_by_trip_and_day(self, trip_id: Any, day_number: int) -> Optional[DailyLog]:
        try:
            return self.model_class.objects.get(trip_id=trip_id, day_number=day_number)
        except self.model_class.DoesNotExist:
            return None
