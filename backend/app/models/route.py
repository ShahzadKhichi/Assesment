"""
Route helper data model.
"""

from typing import List, Dict, Any


class Route:
    """In-memory data structure representing calculated route legs."""

    def __init__(self, total_distance: float, duration_hours: float, legs: List[Dict[str, Any]]) -> None:
        self.total_distance = total_distance
        self.duration_hours = duration_hours
        self.legs = legs
