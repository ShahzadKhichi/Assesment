"""
Map Service — Google Maps API integration with fallback estimation.
"""

import logging
import os
from typing import Any, Dict, List, Optional
import requests
from exceptions import APIError

logger = logging.getLogger(__name__)

GOOGLE_MAPS_API_KEY = os.environ.get('GOOGLE_MAPS_API_KEY', '')
DISTANCE_MATRIX_URL = 'https://maps.googleapis.com/maps/api/distancematrix/json'
GEOCODE_URL = 'https://maps.googleapis.com/maps/api/geocode/json'
DIRECTIONS_URL = 'https://maps.googleapis.com/maps/api/directions/json'
PLACES_AUTOCOMPLETE_URL = 'https://maps.googleapis.com/maps/api/place/autocomplete/json'


class MapService:
    """Google Maps API service with automatic fallback estimation."""

    COMMON_LOCATION_SUGGESTIONS = [
        'New York, NY',
        'Philadelphia, PA',
        'Chicago, IL',
        'Los Angeles, CA',
        'Houston, TX',
        'Miami, FL',
        'Atlanta, GA',
        'Dallas, TX',
        'Denver, CO',
        'Seattle, WA',
        'San Francisco, CA',
        'Phoenix, AZ',
        'Orlando, FL',
        'Portland, OR',
        'Nashville, TN',
        'Boston, MA',
        'Charlotte, NC',
        'Minneapolis, MN',
        'Salt Lake City, UT',
        'Jacksonville, FL',
    ]

    def __init__(self, api_key: Optional[str] = None) -> None:
        self.api_key: str = api_key if api_key is not None else GOOGLE_MAPS_API_KEY

    def _is_api_key_valid(self) -> bool:
        return bool(self.api_key and not self.api_key.startswith('your_'))

    def calculate_route(self, current: str, pickup: str, dropoff: str) -> Dict[str, Any]:
        if not self._is_api_key_valid():
            logger.warning("No Google Maps API key configured, using fallback estimation.")
            return self._fallback_estimate(current, pickup, dropoff)

        try:
            leg1 = self._get_distance(current, pickup)
            leg2 = self._get_distance(pickup, dropoff)

            total_meters = leg1['distance_meters'] + leg2['distance_meters']
            total_seconds = leg1['duration_seconds'] + leg2['duration_seconds']
            total_miles = round(total_meters * 0.000621371, 2)
            total_hours = round(total_seconds / 3600, 2)

            return {
                'total_distance': total_miles,
                'estimated_duration_hours': total_hours,
                'legs': [
                    {
                        'origin': current,
                        'destination': pickup,
                        'distance_miles': round(leg1['distance_meters'] * 0.000621371, 2),
                        'duration_hours': round(leg1['duration_seconds'] / 3600, 2),
                    },
                    {
                        'origin': pickup,
                        'destination': dropoff,
                        'distance_miles': round(leg2['distance_meters'] * 0.000621371, 2),
                        'duration_hours': round(leg2['duration_seconds'] / 3600, 2),
                    },
                ],
            }
        except Exception as exc:
            logger.error(f"Google Maps API failed: {exc}", exc_info=True)
            return self._fallback_estimate(current, pickup, dropoff)

    def _get_distance(self, origin: str, destination: str) -> Dict[str, Any]:
        params = {
            'origins': origin,
            'destinations': destination,
            'units': 'imperial',
            'key': self.api_key,
        }
        resp = requests.get(DISTANCE_MATRIX_URL, params=params, timeout=10)
        resp.raise_for_status()
        data = resp.json()

        if data.get('status') != 'OK':
            raise APIError(f"Distance Matrix API error: {data.get('status')}")

        element = data['rows'][0]['elements'][0]
        if element.get('status') != 'OK':
            raise APIError(f"Route element error: {element.get('status')}")

        return {
            'distance_meters': element['distance']['value'],
            'duration_seconds': element['duration']['value'],
        }

    def geocode(self, address: str) -> Dict[str, Any]:
        if not self._is_api_key_valid():
            logger.warning("No API key for geocoding, using city coordinate lookup dictionary.")
            return self._lookup_city_coordinates(address)

        params = {'address': address, 'key': self.api_key}
        resp = requests.get(GEOCODE_URL, params=params, timeout=10)
        resp.raise_for_status()
        data = resp.json()

        if data.get('status') != 'OK' or not data.get('results'):
            return self._lookup_city_coordinates(address)

        result = data['results'][0]
        location = result['geometry']['location']

        return {
            'lat': location['lat'],
            'lng': location['lng'],
            'formatted_address': result.get('formatted_address', address),
        }

    def autocomplete(self, query: str) -> List[Dict[str, str]]:
        if not query or len(query.strip()) < 2:
            return []

        suggestions = self._query_google_autocomplete(query)
        if suggestions:
            return suggestions

        logger.info('Falling back to local autocomplete suggestions for query: %s', query)
        return self._local_autocomplete_suggestions(query)

    def _query_google_autocomplete(self, query: str) -> List[Dict[str, str]]:
        if not self._is_api_key_valid():
            logger.warning('No Google Maps API key configured, autocomplete unavailable.')
            return []

        params = {
            'input': query,
            'key': self.api_key,
            'types': 'geocode',
            'language': 'en',
        }

        try:
            resp = requests.get(PLACES_AUTOCOMPLETE_URL, params=params, timeout=10)
            resp.raise_for_status()
            data = resp.json()
        except Exception as exc:
            logger.warning('Google Places autocomplete request failed: %s', exc)
            return []

        if data.get('status') != 'OK' or not data.get('predictions'):
            logger.warning(
                'Google Places autocomplete response invalid: status=%s error_message=%s',
                data.get('status'),
                data.get('error_message'),
            )
            return []

        return [
            {
                'label': prediction.get('description', ''),
                'value': prediction.get('description', ''),
                'source': 'google',
            }
            for prediction in data.get('predictions', [])
            if prediction.get('description')
        ]

    def _local_autocomplete_suggestions(self, query: str) -> List[Dict[str, str]]:
        lower_query = query.strip().lower()
        matches = [
            location for location in self.COMMON_LOCATION_SUGGESTIONS
            if lower_query in location.lower()
        ]
        return [
            {
                'label': location,
                'value': location,
                'source': 'fallback',
            }
            for location in matches
        ]

    def _lookup_city_coordinates(self, address: str) -> Dict[str, Any]:
        known_cities = {
            'new york': {'lat': 40.7128, 'lng': -74.0060},
            'ny': {'lat': 40.7128, 'lng': -74.0060},
            'philadelphia': {'lat': 39.9526, 'lng': -75.1652},
            'pa': {'lat': 39.9526, 'lng': -75.1652},
            'chicago': {'lat': 41.8781, 'lng': -87.6298},
            'il': {'lat': 41.8781, 'lng': -87.6298},
            'atlanta': {'lat': 33.7490, 'lng': -84.3880},
            'ga': {'lat': 33.7490, 'lng': -84.3880},
            'miami': {'lat': 25.7617, 'lng': -80.1918},
            'fl': {'lat': 25.7617, 'lng': -80.1918},
            'dallas': {'lat': 32.7767, 'lng': -96.7970},
            'tx': {'lat': 32.7767, 'lng': -96.7970},
            'denver': {'lat': 39.7392, 'lng': -104.9903},
            'co': {'lat': 39.7392, 'lng': -104.9903},
            'los angeles': {'lat': 34.0522, 'lng': -118.2437},
            'ca': {'lat': 34.0522, 'lng': -118.2437},
            'seattle': {'lat': 47.6062, 'lng': -122.3321},
            'wa': {'lat': 47.6062, 'lng': -122.3321},
            'washington': {'lat': 38.9072, 'lng': -77.0369},
            'dc': {'lat': 38.9072, 'lng': -77.0369},
        }

        addr_lower = address.lower()
        for city, coords in known_cities.items():
            if city in addr_lower:
                return {'lat': coords['lat'], 'lng': coords['lng'], 'formatted_address': address}

        # Fallback default (geographic center of US)
        return {'lat': 39.8283, 'lng': -98.5795, 'formatted_address': address}

    def get_directions(self, origin: str, destination: str, waypoints: Optional[List[str]] = None) -> Dict[str, Any]:
        if not self._is_api_key_valid():
            return {'polyline': '', 'steps': 0, 'distance_miles': 0.0, 'duration_hours': 0.0}

        params: Dict[str, Any] = {
            'origin': origin,
            'destination': destination,
            'key': self.api_key,
        }
        if waypoints:
            params['waypoints'] = '|'.join(waypoints)

        resp = requests.get(DIRECTIONS_URL, params=params, timeout=10)
        resp.raise_for_status()
        data = resp.json()

        if data.get('status') != 'OK' or not data.get('routes'):
            raise APIError(f"Directions API failed: {data.get('status')}")

        route = data['routes'][0]
        total_meters = sum(leg['distance']['value'] for leg in route['legs'])
        total_seconds = sum(leg['duration']['value'] for leg in route['legs'])

        return {
            'polyline': route.get('overview_polyline', {}).get('points', ''),
            'steps': sum(len(leg.get('steps', [])) for leg in route['legs']),
            'distance_miles': round(total_meters * 0.000621371, 2),
            'duration_hours': round(total_seconds / 3600, 2),
        }

    def _fallback_estimate(self, current: str, pickup: str, dropoff: str) -> Dict[str, Any]:
        c_coords = self._lookup_city_coordinates(current)
        p_coords = self._lookup_city_coordinates(pickup)
        d_coords = self._lookup_city_coordinates(dropoff)

        # Calculate approximate distance using Euclidean approximation (converted to miles)
        d1 = (((p_coords['lat'] - c_coords['lat']) * 69) ** 2 + ((p_coords['lng'] - c_coords['lng']) * 53) ** 2) ** 0.5
        d2 = (((d_coords['lat'] - p_coords['lat']) * 69) ** 2 + ((d_coords['lng'] - p_coords['lng']) * 53) ** 2) ** 0.5
        estimated_distance = max(100.0, round(d1 + d2, 1))
        estimated_hours = round(estimated_distance / 55.0, 2)

        return {
            'total_distance': estimated_distance,
            'estimated_duration_hours': estimated_hours,
            'coordinates': {
                'current': c_coords,
                'pickup': p_coords,
                'dropoff': d_coords
            },
            'legs': [
                {'origin': current, 'destination': pickup, 'distance_miles': round(d1, 1), 'duration_hours': round(d1 / 55.0, 2)},
                {'origin': pickup, 'destination': dropoff, 'distance_miles': round(d2, 1), 'duration_hours': round(d2 / 55.0, 2)},
            ],
            'source': 'FALLBACK_ESTIMATION',
        }

