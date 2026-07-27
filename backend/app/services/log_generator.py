"""
Log Generator — Daily log management and PDF rendering service.
"""

import logging
from typing import Any, Dict, Optional

from exceptions import NotFoundError
from repositories.log_repository import LogRepository
from services.pdf_generator import PDFGenerator

logger = logging.getLogger(__name__)


class LogGenerator:
    """Business service for daily log management and PDF rendering."""

    def __init__(
        self,
        repository: Optional[LogRepository] = None,
        pdf_generator: Optional[PDFGenerator] = None
    ) -> None:
        self.repository = repository or LogRepository()
        self.pdf_generator = pdf_generator or PDFGenerator()

    def generate_pdf_for_log(self, log_id: Any) -> bytes:
        daily_log = self.repository.get_with_related(log_id)
        if not daily_log:
            raise NotFoundError(f"DailyLog with ID '{log_id}' not found.")
        return self.pdf_generator.generate_daily_log_pdf(daily_log)

    def get_logs_for_trip(self, trip_id: Any):
        return self.repository.get_by_trip(trip_id)
