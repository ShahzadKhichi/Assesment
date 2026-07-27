"""
Auth API views — Signup, Verify OTP, Login, Resend OTP, Forgot & Reset Password.
"""

import logging
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from validators.auth_validator import (
    SignupValidator,
    VerifyOTPValidator,
    LoginValidator,
    ResendOTPValidator,
    ForgotPasswordValidator,
    ResetPasswordValidator,
)
from services.auth_service import AuthService
from utils.response import error_response

logger = logging.getLogger(__name__)


@swagger_auto_schema(
    method='post',
    request_body=SignupValidator,
    responses={
        201: openapi.Response('User created, OTP sent'),
        400: openapi.Response('Validation or duplicate error'),
    },
    operation_description="Register a new user and send a 6-digit OTP email."
)
@api_view(['POST'])
@permission_classes([AllowAny])
def signup_view(request: Request) -> Response:
    """POST /api/v1/auth/signup/"""
    serializer = SignupValidator(data=request.data)
    if not serializer.is_valid():
        return Response(
            error_response('Validation error', serializer.errors),
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        result = AuthService().signup(serializer.validated_data)
        return Response(result, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response(error_response(str(e)), status=status.HTTP_400_BAD_REQUEST)


@swagger_auto_schema(
    method='post',
    request_body=VerifyOTPValidator,
    responses={
        200: openapi.Response('Email verified, JWT tokens returned'),
        400: openapi.Response('Invalid or expired OTP'),
    },
    operation_description="Verify 6-digit OTP and receive JWT tokens."
)
@api_view(['POST'])
@permission_classes([AllowAny])
def verify_otp_view(request: Request) -> Response:
    """POST /api/v1/auth/verify-otp/"""
    serializer = VerifyOTPValidator(data=request.data)
    if not serializer.is_valid():
        return Response(
            error_response('Validation error', serializer.errors),
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        result = AuthService().verify_otp(
            email=serializer.validated_data['email'],
            otp_code=serializer.validated_data['otp_code']
        )
        return Response(result, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(error_response(str(e)), status=status.HTTP_400_BAD_REQUEST)


@swagger_auto_schema(
    method='post',
    request_body=LoginValidator,
    responses={
        200: openapi.Response('Login successful, JWT tokens returned'),
        400: openapi.Response('Invalid credentials'),
    },
    operation_description="Authenticate with email and password."
)
@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request: Request) -> Response:
    """POST /api/v1/auth/login/"""
    serializer = LoginValidator(data=request.data)
    if not serializer.is_valid():
        return Response(
            error_response('Validation error', serializer.errors),
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        result = AuthService().login(
            email=serializer.validated_data['email'],
            password=serializer.validated_data['password']
        )
        return Response(result, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(error_response(str(e)), status=status.HTTP_400_BAD_REQUEST)


@swagger_auto_schema(
    method='post',
    request_body=ResendOTPValidator,
    responses={
        200: openapi.Response('New OTP sent'),
        400: openapi.Response('User not found'),
    },
    operation_description="Resend a new 6-digit OTP to the user's email."
)
@api_view(['POST'])
@permission_classes([AllowAny])
def resend_otp_view(request: Request) -> Response:
    """POST /api/v1/auth/resend-otp/"""
    serializer = ResendOTPValidator(data=request.data)
    if not serializer.is_valid():
        return Response(
            error_response('Validation error', serializer.errors),
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        result = AuthService().resend_otp(email=serializer.validated_data['email'])
        return Response(result, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(error_response(str(e)), status=status.HTTP_400_BAD_REQUEST)


@swagger_auto_schema(
    method='post',
    request_body=ForgotPasswordValidator,
    responses={
        200: openapi.Response('Password reset OTP sent'),
        400: openapi.Response('User not found or validation error'),
    },
    operation_description="Send password reset OTP to registered email."
)
@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password_view(request: Request) -> Response:
    """POST /api/v1/auth/forgot-password/"""
    serializer = ForgotPasswordValidator(data=request.data)
    if not serializer.is_valid():
        return Response(
            error_response('Validation error', serializer.errors),
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        result = AuthService().forgot_password(email=serializer.validated_data['email'])
        return Response(result, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(error_response(str(e)), status=status.HTTP_400_BAD_REQUEST)


@swagger_auto_schema(
    method='post',
    request_body=ResetPasswordValidator,
    responses={
        200: openapi.Response('Password reset successfully'),
        400: openapi.Response('Invalid OTP or validation error'),
    },
    operation_description="Reset password using OTP verification code."
)
@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password_view(request: Request) -> Response:
    """POST /api/v1/auth/reset-password/"""
    serializer = ResetPasswordValidator(data=request.data)
    if not serializer.is_valid():
        return Response(
            error_response('Validation error', serializer.errors),
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        result = AuthService().reset_password(
            email=serializer.validated_data['email'],
            otp_code=serializer.validated_data['otp_code'],
            new_password=serializer.validated_data['new_password']
        )
        return Response(result, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(error_response(str(e)), status=status.HTTP_400_BAD_REQUEST)
