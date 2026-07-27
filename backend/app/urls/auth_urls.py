"""
Auth URL routes.
"""

from django.urls import path
from views.auth_view import (
    signup_view,
    verify_otp_view,
    login_view,
    resend_otp_view,
    forgot_password_view,
    reset_password_view,
)

urlpatterns = [
    path('signup/', signup_view, name='signup'),
    path('verify-otp/', verify_otp_view, name='verify_otp'),
    path('login/', login_view, name='login'),
    path('resend-otp/', resend_otp_view, name='resend_otp'),
    path('forgot-password/', forgot_password_view, name='forgot_password'),
    path('reset-password/', reset_password_view, name='reset_password'),
]
