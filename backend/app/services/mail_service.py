"""
Mail Service — Email dispatcher with non-blocking background SMTP and Redis BullMQ queue integration.
"""

import json
import logging
import threading
import uuid
from typing import Optional
import redis
from django.core.mail import send_mail
from django.conf import settings

logger = logging.getLogger(__name__)


class MailService:
    """Handles dispatching emails asynchronously via background threads and Redis BullMQ broker."""

    def __init__(self, redis_url: Optional[str] = None) -> None:
        self.redis_url = redis_url or getattr(settings, 'REDIS_URL', 'redis://127.0.0.1:6379')
        self._redis_client: Optional[redis.Redis] = None

    @property
    def redis_client(self) -> Optional[redis.Redis]:
        if self._redis_client is None:
            try:
                self._redis_client = redis.Redis.from_url(self.redis_url, decode_responses=True, socket_timeout=2)
                self._redis_client.ping()
            except Exception as exc:
                logger.warning(f"Redis is unavailable for BullMQ mail queue: {exc}")
                self._redis_client = None
        return self._redis_client

    def _send_direct_smtp(self, to_email: str, subject: str, body: str, html_body: Optional[str] = None) -> bool:
        """Sends email synchronously via Django SMTP backend."""
        try:
            from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'shahzadkhichi996@gmail.com')
            send_mail(
                subject=subject,
                message=body,
                from_email=from_email,
                recipient_list=[to_email],
                html_message=html_body,
                fail_silently=False
            )
            logger.info(f"Email sent successfully via Django SMTP backend to {to_email}")
            return True
        except Exception as exc:
            logger.error(f"Failed to send email via SMTP to {to_email}: {exc}", exc_info=True)
            return False

    def send_email_async(
        self,
        to_email: str,
        subject: str,
        body: str,
        html_body: Optional[str] = None
    ) -> bool:
        """
        Dispatches email asynchronously in a non-blocking background thread
        and queues to BullMQ Redis if available.
        """
        payload = {
            'to': to_email,
            'subject': subject,
            'text': body,
            'html': html_body or body,
            'timestamp': int(uuid.uuid4().time_low)
        }

        # 1. Try enqueueing into BullMQ Redis Queue
        client = self.redis_client
        if client:
            try:
                job_id = str(uuid.uuid4())
                client.lpush('bull:mail-queue:wait', job_id)
                client.hset(f'bull:mail-queue:{job_id}', mapping={
                    'name': 'send_email',
                    'data': json.dumps(payload),
                    'opts': json.dumps({'attempts': 3, 'backoff': 5000}),
                    'timestamp': str(payload['timestamp'])
                })
                logger.info(f"Queued email job {job_id} to BullMQ for {to_email}")
            except Exception as exc:
                logger.warning(f"Failed to push to BullMQ: {exc}")

        # 2. Dispatch SMTP send in background thread so HTTP call never blocks/hangs
        thread = threading.Thread(
            target=self._send_direct_smtp,
            args=(to_email, subject, body, html_body),
            daemon=True
        )
        thread.start()
        return True
