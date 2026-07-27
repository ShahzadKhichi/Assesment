"""
Celery async tasks — OTP email dispatch.
"""

import logging
from celery import shared_task
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_otp_email_task(self, email: str, otp_code: str) -> dict:
    """Async task to send OTP verification email via Celery."""
    try:
        subject = f"Your Verification Code: {otp_code}"

        try:
            html_message = render_to_string('emails/otp_verification.html', {
                'otp_code': otp_code,
                'email': email,
            })
        except Exception:
            html_message = f"""
            <html><body style="font-family:Arial,sans-serif;padding:20px;">
            <h2>Email Verification</h2>
            <p>Your verification code is:</p>
            <div style="font-size:32px;font-weight:bold;letter-spacing:8px;
                        background:#f0f0f0;padding:20px;text-align:center;
                        border-radius:8px;margin:20px 0;">
                {otp_code}
            </div>
            <p>This code expires in 10 minutes.</p>
            </body></html>
            """

        send_mail(
            subject=subject,
            message=f"Your verification code is: {otp_code}",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            html_message=html_message,
            fail_silently=False,
        )

        logger.info(f"OTP email sent successfully to {email}")
        return {'status': 'sent', 'email': email}

    except Exception as exc:
        logger.error(f"Failed to send OTP email to {email}: {str(exc)}")
        raise self.retry(exc=exc)
