"""
HOS Compliance engine — FMCSA 70-hour/8-day rule scheduler.
"""

import math
import logging
from typing import Any, Dict, List

from constants.hos import (
    MAX_DRIVING_HOURS_PER_DAY,
    MANDATORY_REST_BREAK_THRESHOLD,
    MANDATORY_REST_BREAK_DURATION,
    MANDATORY_SLEEPER_DURATION,
    MAX_CYCLE_HOURS_70_8,
    MILES_PER_FUEL_STOP,
    AVERAGE_SPEED_MPH,
)
from constants.status import StopType
from exceptions import ValidationError
from exceptions.trip import BusinessLogicError

logger = logging.getLogger(__name__)


class HOSService:
    """HOS Compliance calculation engine according to FMCSA guidelines."""

    def calculate_hos_schedule(
        self,
        total_distance_miles: float,
        cycle_hours_used: float = 0.0,
        current_location: str = '',
        pickup_location: str = '',
        dropoff_location: str = ''
    ) -> Dict[str, Any]:
        if cycle_hours_used < 0 or cycle_hours_used > MAX_CYCLE_HOURS_70_8:
            raise ValidationError(
                f"Cycle hours used ({cycle_hours_used}) must be between 0 and {MAX_CYCLE_HOURS_70_8}."
            )

        driving_hours_needed = total_distance_miles / AVERAGE_SPEED_MPH
        cycle_hours_remaining = MAX_CYCLE_HOURS_70_8 - cycle_hours_used

        if driving_hours_needed > cycle_hours_remaining:
            raise BusinessLogicError(
                f"Trip requires {driving_hours_needed:.1f} driving hours, but driver only has "
                f"{cycle_hours_remaining:.1f} hours remaining in 70-hour/8-day cycle."
            )

        stops: List[Dict[str, Any]] = []
        sequence = 1

        stops.append({
            'sequence': sequence,
            'location': current_location,
            'stop_type': StopType.CURRENT,
            'duration_hours': 0.0,
            'notes': 'Start location'
        })
        sequence += 1

        stops.append({
            'sequence': sequence,
            'location': pickup_location,
            'stop_type': StopType.PICKUP,
            'duration_hours': 1.0,
            'notes': 'Pickup cargo & inspection'
        })
        sequence += 1

        accumulated_driving = 0.0
        accumulated_miles = 0.0
        driving_since_last_break = 0.0
        daily_driving = 0.0
        fuel_stop_count = 0

        while accumulated_driving < driving_hours_needed:
            remaining_trip_hours = driving_hours_needed - accumulated_driving
            max_drive_step = min(
                remaining_trip_hours,
                MANDATORY_REST_BREAK_THRESHOLD - driving_since_last_break,
                MAX_DRIVING_HOURS_PER_DAY - daily_driving
            )

            accumulated_driving += max_drive_step
            driving_since_last_break += max_drive_step
            daily_driving += max_drive_step
            accumulated_miles += max_drive_step * AVERAGE_SPEED_MPH

            if accumulated_miles >= (fuel_stop_count + 1) * MILES_PER_FUEL_STOP and accumulated_driving < driving_hours_needed:
                fuel_stop_count += 1
                stops.append({
                    'sequence': sequence,
                    'location': f"Fuel Station #{fuel_stop_count} (~{int(accumulated_miles)} mi)",
                    'stop_type': StopType.FUEL,
                    'duration_hours': 0.5,
                    'notes': 'Refuel commercial vehicle'
                })
                sequence += 1

            if driving_since_last_break >= MANDATORY_REST_BREAK_THRESHOLD and accumulated_driving < driving_hours_needed:
                stops.append({
                    'sequence': sequence,
                    'location': f"Rest Area (~{int(accumulated_miles)} mi)",
                    'stop_type': StopType.REST_BREAK,
                    'duration_hours': MANDATORY_REST_BREAK_DURATION,
                    'notes': 'Mandatory 30-minute rest break after 8 hours driving'
                })
                sequence += 1
                driving_since_last_break = 0.0

            if daily_driving >= MAX_DRIVING_HOURS_PER_DAY and accumulated_driving < driving_hours_needed:
                stops.append({
                    'sequence': sequence,
                    'location': f"Truck Stop / Sleeper Berth (~{int(accumulated_miles)} mi)",
                    'stop_type': StopType.SLEEPER,
                    'duration_hours': MANDATORY_SLEEPER_DURATION,
                    'notes': 'Mandatory 10-hour sleeper berth / off-duty rest period'
                })
                sequence += 1
                daily_driving = 0.0
                driving_since_last_break = 0.0

        stops.append({
            'sequence': sequence,
            'location': dropoff_location,
            'stop_type': StopType.DROPOFF,
            'duration_hours': 1.0,
            'notes': 'Dropoff cargo & final inspection'
        })

        total_break_hours = sum(s['duration_hours'] for s in stops)
        total_trip_duration = driving_hours_needed + total_break_hours

        return {
            'total_distance_miles': round(total_distance_miles, 2),
            'driving_hours': round(driving_hours_needed, 2),
            'total_duration_hours': round(total_trip_duration, 2),
            'cycle_hours_remaining': round(cycle_hours_remaining - driving_hours_needed, 2),
            'stops': stops,
            'days_required': math.ceil(total_trip_duration / 24.0) or 1
        }
