"""
StopRepository for Stop entity database queries.
"""

from typing import List, Optional, Any
from repositories.base_repository import BaseRepository
from models.stop import Stop
from constants.status import StopType


class StopRepository(BaseRepository[Stop]):
    """StopRepository implementation."""

    def __init__(self) -> None:
        super().__init__(model_class=Stop)

    def get_with_related(self, entity_id: Any) -> Optional[Stop]:
        try:
            return self.model_class.objects.select_related('trip').get(pk=entity_id)
        except self.model_class.DoesNotExist:
            return None

    def get_by_trip(self, trip_id: Any) -> List[Stop]:
        return list(self.model_class.objects.filter(trip_id=trip_id).order_by('sequence'))

    def get_fuel_stops(self, trip_id: Any) -> List[Stop]:
        return list(
            self.model_class.objects.filter(
                trip_id=trip_id,
                stop_type=StopType.FUEL
            ).order_by('sequence')
        )

    def bulk_create_stops(self, stops_data: List[dict]) -> List[Stop]:
        stops = [Stop(**data) for data in stops_data]
        return Stop.objects.bulk_create(stops)
