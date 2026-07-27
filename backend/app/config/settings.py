"""
Django settings for trip-planner backend.

Configures all application settings including database, REST framework,
CORS, logging, and security. All sensitive values are loaded from
environment variables via python-dotenv.
"""

import os
import sys
from pathlib import Path
from typing import List

from dotenv import load_dotenv

load_dotenv()

# ---------------------------------------------------------------------------
# Base
# ---------------------------------------------------------------------------
BASE_DIR: Path = Path(__file__).resolve().parent.parent

SECRET_KEY: str = os.getenv('DJANGO_SECRET_KEY', 'django-insecure-fallback')
DEBUG: bool = os.getenv('DJANGO_DEBUG', 'True') == 'True'

# Allow all hosts (useful for development/Vercel deployments)
allowed_hosts_str = os.getenv('DJANGO_ALLOWED_HOSTS', 'localhost,127.0.0.1')
if allowed_hosts_str.strip() == '*':
    ALLOWED_HOSTS: List[str] = ['*']
else:
    ALLOWED_HOSTS: List[str] = [
        host.strip() for host in allowed_hosts_str.split(',')
    ]

# Trust X-Forwarded-Host header from proxies (important for Vercel)
USE_X_FORWARDED_HOST: bool = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# ---------------------------------------------------------------------------
# Installed Apps
# ---------------------------------------------------------------------------
INSTALLED_APPS: List[str] = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Third-party
    'rest_framework',
    'corsheaders',
    'drf_yasg',
    # Local packages
    'models',
]

AUTH_USER_MODEL = 'models.User'

# ---------------------------------------------------------------------------
# Middleware
# ---------------------------------------------------------------------------
MIDDLEWARE: List[str] = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF: str = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION: str = 'config.wsgi.application'

# ---------------------------------------------------------------------------
# Database — MySQL via PyMySQL (falls back to SQLite in-memory during testing)
# ---------------------------------------------------------------------------
if 'test' in sys.argv or 'pytest' in sys.modules or 'pytest' in sys.argv[0]:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': ':memory:',
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.mysql',
            'NAME': os.getenv('DATABASE_NAME', 'trip_planner'),
            'USER': os.getenv('DATABASE_USER', 'root'),
            'PASSWORD': os.getenv('DATABASE_PASSWORD', 'password'),
            'HOST': os.getenv('DATABASE_HOST', 'localhost'),
            'PORT': os.getenv('DATABASE_PORT', '3306'),
            'OPTIONS': {
                'charset': 'utf8mb4',
                'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
            },
        }
    }

# ---------------------------------------------------------------------------
# Password Validation
# ---------------------------------------------------------------------------
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# ---------------------------------------------------------------------------
# Internationalization
# ---------------------------------------------------------------------------
LANGUAGE_CODE: str = 'en-us'
TIME_ZONE: str = 'UTC'
USE_I18N: bool = True
USE_TZ: bool = True

# ---------------------------------------------------------------------------
# Static & Media
# ---------------------------------------------------------------------------
STATIC_URL: str = 'static/'
STATIC_ROOT: Path = BASE_DIR / 'staticfiles'
MEDIA_URL: str = 'media/'
MEDIA_ROOT: Path = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD: str = 'django.db.models.BigAutoField'

# ---------------------------------------------------------------------------
# REST Framework
# ---------------------------------------------------------------------------
REST_FRAMEWORK = {
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}

# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------
# Allow all origins to avoid CORS issues
CORS_ALLOW_ALL_ORIGINS: bool = True
CORS_ALLOWED_ORIGINS: List[str] = []
CORS_ALLOW_CREDENTIALS: bool = True
CORS_EXPOSE_HEADERS: List[str] = ['Content-Type', 'X-CSRFToken']
CORS_ALLOW_METHODS: List[str] = ['DELETE', 'GET', 'OPTIONS', 'PATCH', 'POST', 'PUT']
CORS_ALLOW_HEADERS: List[str] = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

# CSRF Configuration for cross-origin requests
CSRF_TRUSTED_ORIGINS: List[str] = [
    'https://*.vercel.app',
    'http://localhost:3000',
    'http://localhost:8000',
]
CSRF_COOKIE_SECURE: bool = False
CSRF_COOKIE_HTTPONLY: bool = False
CSRF_COOKIE_SAMESITE: str = 'Lax'

# ---------------------------------------------------------------------------
# Google Maps
# ---------------------------------------------------------------------------
GOOGLE_MAPS_API_KEY: str = os.getenv('GOOGLE_MAPS_API_KEY', '')

# ---------------------------------------------------------------------------
# PDF Storage
# ---------------------------------------------------------------------------
PDF_STORAGE_PATH: str = os.getenv('PDF_STORAGE_PATH', 'media/')

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
# Logging is disabled globally. Django's default logging is turned off.
LOGGING_CONFIG = None

# ---------------------------------------------------------------------------
# Redis Cache Backend
# ---------------------------------------------------------------------------
REDIS_URL = os.getenv('REDIS_URL', 'redis://127.0.0.1:6379')

CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': f"{REDIS_URL}/1",
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        }
    }
}

# ---------------------------------------------------------------------------
# Celery Async Task Queue Configuration
# ---------------------------------------------------------------------------
CELERY_BROKER_URL = f"{REDIS_URL}/0"
CELERY_RESULT_BACKEND = f"{REDIS_URL}/0"
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = TIME_ZONE

# ---------------------------------------------------------------------------
# REST Framework & JWT Configuration
# ---------------------------------------------------------------------------
REST_FRAMEWORK['DEFAULT_AUTHENTICATION_CLASSES'] = [
    'rest_framework_simplejwt.authentication.JWTAuthentication',
    'rest_framework.authentication.SessionAuthentication',
]

from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# ---------------------------------------------------------------------------
# Email Configuration
# ---------------------------------------------------------------------------
EMAIL_BACKEND = os.getenv('EMAIL_BACKEND', 'django.core.mail.backends.smtp.EmailBackend')
EMAIL_HOST = os.getenv('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT = int(os.getenv('EMAIL_PORT', '587'))
EMAIL_USE_TLS = os.getenv('EMAIL_USE_TLS', 'True') == 'True'
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD', '')
DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL', 'shahzadkhichi996@gmail.com')


