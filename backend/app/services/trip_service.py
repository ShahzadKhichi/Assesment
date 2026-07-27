"""
Trip planning service — orchestrates route, HOS, and log creation.
"""

import logging
from typing import Any, Dict, Optional

from constants.status import TripStatus
from exceptions import ValidationError
from repositories.trip_repository import TripRepository
from repositories.stop_repository import StopRepository
from repositories.log_repository import LogRepository
from services.map_service import MapService
from services.hos_service import HOSService

logger = logging.getLogger(__name__)


class TripService:
    """Orchestrates trip planning, route calculation, HOS enforcement, and daily log creation."""

    def __init__(
        self,
        repository: Optional[TripRepository] = None,
        stop_repository: Optional[StopRepository] = None,
        log_repository: Optional[LogRepository] = None,
        map_service: Optional[MapService] = None,
        hos_service: Optional[HOSService] = None
    ) -> None:
        self.repository = repository or TripRepository()
        self.stop_repository = stop_repository or StopRepository()
        self.log_repository = log_repository or LogRepository()
        self.map_service = map_service or MapService()
        self.hos_service = hos_service or HOSService()

    def plan_trip(self, data: Dict[str, Any]) -> Dict[str, Any]:
        current = data.get('current_location', '').strip()
        pickup = data.get('pickup_location', '').strip()
        dropoff = data.get('dropoff_location', '').strip()
        cycle_hours = float(data.get('cycle_hours_used', 0.0))

        if not current or not pickup or not dropoff:
            raise ValidationError("Current, pickup, and dropoff locations are all required.")

        if current == pickup and pickup == dropoff:
            raise ValidationError("Origin, pickup, and dropoff locations cannot all be identical.")

        route_info = self.map_service.calculate_route(current, pickup, dropoff)
        distance_miles = route_info['total_distance']

        # Geocode the 3 key locations for real map coordinates
        origin_coords = self.map_service.geocode(current)
        pickup_coords = self.map_service.geocode(pickup)
        dropoff_coords = self.map_service.geocode(dropoff)

        hos_result = self.hos_service.calculate_hos_schedule(
            total_distance_miles=distance_miles,
            cycle_hours_used=cycle_hours,
            current_location=current,
            pickup_location=pickup,
            dropoff_location=dropoff
        )

        # Attach real geocoded lat/lng to every stop via linear interpolation
        total_stops = len(hos_result['stops'])
        for idx, stop in enumerate(hos_result['stops']):
            stop_type = stop.get('stop_type', '')
            if stop_type == 'CURRENT':
                stop['lat'] = origin_coords['lat']
                stop['lng'] = origin_coords['lng']
            elif stop_type == 'PICKUP':
                stop['lat'] = pickup_coords['lat']
                stop['lng'] = pickup_coords['lng']
            elif stop_type == 'DROPOFF':
                stop['lat'] = dropoff_coords['lat']
                stop['lng'] = dropoff_coords['lng']
            else:
                # Interpolate between pickup and dropoff based on sequence position
                ratio = idx / max(total_stops - 1, 1)
                stop['lat'] = round(pickup_coords['lat'] + (dropoff_coords['lat'] - pickup_coords['lat']) * ratio, 6)
                stop['lng'] = round(pickup_coords['lng'] + (dropoff_coords['lng'] - pickup_coords['lng']) * ratio, 6)

        trip = self.repository.create(
            current_location=current,
            pickup_location=pickup,
            dropoff_location=dropoff,
            cycle_hours_used=cycle_hours,
            total_distance_miles=hos_result['total_distance_miles'],
            estimated_duration_hours=hos_result['total_duration_hours'],
            status=TripStatus.PENDING
        )

        stops_data = [
            {
                'trip': trip,
                'location': stop['location'],
                'stop_type': stop['stop_type'],
                'sequence': stop['sequence'],
                'duration_hours': stop['duration_hours'],
                'notes': stop['notes']
            }
            for stop in hos_result['stops']
        ]
        self.stop_repository.bulk_create_stops(stops_data)

        # Generate daily logs
        days = hos_result['days_required']
        for day_num in range(1, days + 1):
            driving = min(11.0, hos_result['driving_hours'] / days)
            self.log_repository.create(
                trip=trip,
                day_number=day_num,
                off_duty_hours=round(24.0 - driving - 1.5, 2),
                sleeper_berth_hours=10.0 if day_num < days else 0.0,
                driving_hours=round(driving, 2),
                on_duty_not_driving_hours=1.5,
                total_miles_driven=round(distance_miles / days, 2)
            )

        trip_with_stops = self.repository.get_with_related(trip.id)

        return {
            'success': True,
            'data': {
                'trip_id': str(trip.id),
                'total_distance_miles': trip.total_distance_miles,
                'estimated_duration_hours': trip.estimated_duration_hours,
                'days_required': days,
                'stops_count': len(hos_result['stops']),
                'route_coordinates': {
                    'origin': {'lat': origin_coords['lat'], 'lng': origin_coords['lng']},
                    'pickup': {'lat': pickup_coords['lat'], 'lng': pickup_coords['lng']},
                    'dropoff': {'lat': dropoff_coords['lat'], 'lng': dropoff_coords['lng']},
                },
                'stops_with_coords': [
                    {
                        'sequence': s['sequence'],
                        'location': s['location'],
                        'stop_type': s['stop_type'],
                        'duration_hours': s['duration_hours'],
                        'notes': s['notes'],
                        'lat': s.get('lat', 0.0),
                        'lng': s.get('lng', 0.0),
                    }
                    for s in hos_result['stops']
                ],
                'trip': trip_with_stops,
            },
            'error': None,
            'errors': {}
        }

