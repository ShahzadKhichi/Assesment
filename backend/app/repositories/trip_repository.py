"""
TripRepository for Trip database queries.
"""

from typing import List, Optional, Any
from django.db.models import Q
from repositories.base_repository import BaseRepository
from models.trip import Trip
from constants.status import TripStatus


class TripRepository(BaseRepository[Trip]):
    """TripRepository implementation."""

    def __init__(self) -> None:
        super().__init__(model_class=Trip)

    def get_with_related(self, entity_id: Any) -> Optional[Trip]:
        try:
            return self.model_class.objects.prefetch_related('stops', 'daily_logs').get(pk=entity_id)
        except self.model_class.DoesNotExist:
            return None

    def get_active_trips(self) -> List[Trip]:
        return list(
            self.model_class.objects.filter(
                status__in=[TripStatus.PENDING, TripStatus.IN_PROGRESS]
            ).prefetch_related('stops')
        )

    def get_completed_trips(self, limit: int = 10) -> List[Trip]:
        return list(
            self.model_class.objects.filter(status=TripStatus.COMPLETED)
            .prefetch_related('stops')[:limit]
        )

    def get_by_date_range(self, start_date: Any, end_date: Any) -> List[Trip]:
        return list(
            self.model_class.objects.filter(
                created_at__range=(start_date, end_date)
            ).prefetch_related('stops')
        )

    def search_by_location(self, term: str) -> List[Trip]:
        if not term or not term.strip():
            return []
        term = term.strip()
        return list(
            self.model_class.objects.filter(
                Q(current_location__icontains=term) |
                Q(pickup_location__icontains=term) |
                Q(dropoff_location__icontains=term)
            ).prefetch_related('stops')
        )
