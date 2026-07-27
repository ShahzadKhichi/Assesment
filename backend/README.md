# 🚛 Commercial Truck Trip Planner & HOS Compliance Backend API

![Python Version](https://img.shields.io/badge/python-3.14-blue.svg)
![Django Version](https://img.shields.io/badge/django-4.2+-green.svg)
![DRF Version](https://img.shields.io/badge/DRF-3.14+-red.svg)
![Database](https://img.shields.io/badge/database-MySQL--8.0-orange.svg)
![Cache & Queue](https://img.shields.io/badge/cache%20%26%20queue-Redis--7.0-darkgreen.svg)
![Swagger UI](https://img.shields.io/badge/documentation-Swagger%20%2F%20ReDoc-purple.svg)
![Test Coverage](https://img.shields.io/badge/test%20coverage-90%25-brightgreen.svg)

An enterprise-grade, **SOLID-compliant** Django REST Framework backend service engineered for commercial freight logistics. The application automates commercial route calculations, computes Federal Motor Carrier Safety Administration (FMCSA) **70-hour / 8-day Hours of Service (HOS)** compliance schedules, generates Department of Transportation (DOT) compliant 24-hour Electronic Logging Device (ELD) PDF log sheets, and provides secure **Email OTP Authentication** with Redis caching and async background task queues.

---

## 📋 Table of Contents

- [Architectural Overview](#-architectural-overview)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [System Prerequisites](#-system-prerequisites)
- [Quick Start Setup Guide](#-quick-start-setup-guide)
  - [1. Infrastructure Containers (MySQL & Redis)](#1-infrastructure-containers-mysql--redis)
  - [2. Environment & Dependencies](#2-environment--dependencies)
  - [3. Database Migrations](#3-database-migrations)
  - [4. Running the REST API Server](#4-running-the-rest-api-server)
  - [5. Running the Celery Async Task Worker](#5-running-the-celery-async-task-worker)
- [Interactive API Documentation (Swagger & ReDoc)](#-interactive-api-documentation-swagger--redoc)
- [API Endpoints Reference](#-api-endpoints-reference)
  - [Authentication Endpoints](#authentication-endpoints)
  - [Trip Planning & Management](#trip-planning--management)
  - [ELD Daily Logs](#eld-daily-logs)
  - [System Health](#system-health)
- [HOS Compliance Engine Rules](#-hos-compliance-engine-rules)
- [Unit Testing & Code Quality](#-unit-testing--code-quality)
- [Directory Structure](#-directory-structure)

---

## 🏗️ Architectural Overview

The project adopts a strict **Model-Repository-Service** clean architecture, separating data models, database queries, and business logic into modular components with explicit dependency injection:

```
                  ┌──────────────────────────────┐
                  │    HTTP Client / Swagger     │
                  └──────────────┬───────────────┘
                                 │
                                 ▼
                  ┌──────────────────────────────┐
                  │     DRF API Views / Route    │
                  └──────────────┬───────────────┘
                                 │
                                 ▼
                  ┌──────────────────────────────┐
                  │    Domain Service Layer      │
                  │ (Auth, HOS, Trip, PDF Engine)│
                  └──────┬───────────────┬───────┘
                         │               │
                         ▼               ▼
          ┌────────────────────┐   ┌────────────────────┐
          │  Repository Layer  │   │ External Services  │
          │(User, Trip, Log DB)│   │ (Google Maps, Mail)│
          └──────────┬─────────┘   └────────────────────┘
                     │
                     ▼
          ┌────────────────────┐
          │  MySQL Database    │
          └────────────────────┘
```

### Key Architectural Principles:
1. **Single Responsibility Principle (SRP)**: Each service class (e.g., `HOSService`, `RouteService`, `PDFService`, `AuthService`) handles a single, well-defined domain responsibility.
2. **Dependency Inversion Principle (DIP)**: Services accept injected repositories or external API providers, allowing effortless mocking during unit testing.
3. **Failover Resilience**: `RouteService` gracefully switches to heuristic spatial estimations if external Google Maps API credentials are absent or fail.

---

## ✨ Key Features

### 🔐 1. Email OTP Authentication & JWT Sessions
- **Email OTP Verification**: Registration requires 6-digit numeric OTP verification sent via email.
- **Redis Caching**: Verification codes are cached in Redis with a 10-minute Time-To-Live (TTL).
- **Async Task Queue**: Emails are dispatched asynchronously using Celery and Redis to prevent HTTP thread blocking.
- **JWT Token Issuance**: Authenticated users receive secure JSON Web Tokens (`access` and `refresh`) for API authorization.

### 🗺️ 2. Route Calculation & Geocoding Engine
- Calculates total trip distance and driving time between current position, pickup location, and dropoff destination.
- Integrated with Google Distance Matrix API and Geocoding API with fallback estimation.

### ⏱️ 3. FMCSA Hours of Service (HOS) Engine
- **70-Hour / 8-Day Rule**: Tracks cumulative cycle hours to prevent driver over-exertion.
- **11-Hour Driving Limit**: Limits daily driving to maximum 11 hours following 10 consecutive hours off-duty.
- **14-Hour Shift Window**: Enforces a strict 14-hour window from the start of duty.
- **Mandatory 30-Minute Break**: Automatically inserts a 30-minute rest break after 8 consecutive driving hours.
- **Fuel Stop Placement**: Calculates required fuel stops every 1,000 miles.

### 📄 4. DOT-Compliant ELD PDF Log Generator
- Uses **ReportLab** to dynamically generate 24-hour grid log PDF documents matching Federal DOT guidelines.
- Provides a dedicated REST endpoint (`GET /api/v1/logs/{id}/pdf/`) for drivers and fleet managers to download log PDFs.

---

## 🛠️ Technology Stack

- **Core**: Python 3.14, Django 4.2+, Django REST Framework 3.14+
- **Database**: MySQL 8.0 (via `pymysql` adapter)
- **Caching & Broker**: Redis 7.0 (via `django-redis` and `redis-py`)
- **Async Task Queue**: Celery 5.3+
- **Security**: DRF SimpleJWT (JWT Authentication), Passlib
- **PDF Engine**: ReportLab 4.0+
- **Documentation**: drf-yasg (Swagger UI 2.0 / OpenAPI 3.0)
- **Testing**: Pytest, Pytest-Django, Pytest-Cov, Pytest-Mock

---

## 💻 System Prerequisites

Ensure you have the following installed on your host system:
- **Docker** & **Docker Compose**
- **Python 3.10+** (Python 3.14 supported)
- **Git**

---

## 🚀 Quick Start Setup Guide

### 1. Infrastructure Containers (MySQL & Redis)

Launch the MySQL database and Redis cache containers using Docker:

```bash
# Start MySQL 8.0 Container
sudo docker run -d \
  --name mysql-trip \
  -e MYSQL_ROOT_PASSWORD=root123 \
  -e MYSQL_DATABASE=trip_planner \
  -e MYSQL_USER=trip_user \
  -e MYSQL_PASSWORD=trip_pass \
  -p 3306:3306 \
  -v mysql_data:/var/lib/mysql \
  mysql:8.0

# Start Redis 7.0 Container
sudo docker run -d \
  --name redis-trip \
  -p 6379:6379 \
  -v redis_data:/data \
  redis:7-alpine \
  redis-server --appendonly yes
```

Verify containers are running:
```bash
sudo docker ps
```

### 2. Environment & Dependencies

Clone the workspace and activate the Python virtual environment:

```bash
# Navigate to backend directory
cd /home/msk/Desktop/vs_code/assesment/trip-planner/backend

# Activate virtual environment
source venv/bin/activate

# Install required packages
pip install -r requirements.txt
```

Ensure your `.env` file contains valid database and Redis connections:

```env
SECRET_KEY=django-insecure-trip-planner-key
DEBUG=True
ALLOWED_HOSTS=*

DATABASE_NAME=trip_planner
DATABASE_USER=root
DATABASE_PASSWORD=root123
DATABASE_HOST=127.0.0.1
DATABASE_PORT=3306

REDIS_URL=redis://127.0.0.1:6379

GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### 3. Database Migrations

Apply database migrations to setup MySQL schema:

```bash
python manage.py migrate
```

### 4. Running the REST API Server

Start the Django development server:

```bash
python manage.py runserver 0.0.0.0:8000
```

The API server will run at `http://localhost:8000/`.

### 5. Running the Celery Async Task Worker

In a separate terminal window, activate `venv` and run the Celery worker for handling background email tasks:

```bash
source venv/bin/activate
celery -A config worker --loglevel=info
```

---

## 📖 Interactive API Documentation (Swagger & ReDoc)

Interactive OpenAPI / Swagger UI documentation is available directly at runtime:

| Documentation Interface | URL | Description |
| :--- | :--- | :--- |
| 🎨 **Swagger UI** | [http://localhost:8000/swagger/](http://localhost:8000/swagger/) | Interactive API explorer & sandbox |
| 📄 **ReDoc** | [http://localhost:8000/redoc/](http://localhost:8000/redoc/) | Detailed three-panel reference docs |
| 🔍 **OpenAPI Spec (JSON)** | [http://localhost:8000/swagger.json](http://localhost:8000/swagger.json) | Raw OpenAPI schema for Postman import |

---

## 🔑 API Endpoints Reference

### Authentication Endpoints

#### `POST /api/v1/auth/signup/`
Registers a new user and enqueues a background task via Redis to send a 6-digit OTP code.

**Request Body:**
```json
{
  "email": "driver@trucking.com",
  "password": "SecurePassword123!",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "user_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "email": "driver@trucking.com",
    "is_verified": false,
    "message": "Signup successful. Verification OTP sent to your email."
  },
  "error": null,
  "errors": {}
}
```

#### `POST /api/v1/auth/verify-otp/`
Verifies the 6-digit OTP, activates the user account, and returns JWT tokens.

**Request Body:**
```json
{
  "email": "driver@trucking.com",
  "otp_code": "482915"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      "email": "driver@trucking.com",
      "is_verified": true
    },
    "tokens": {
      "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  },
  "error": null,
  "errors": {}
}
```

#### `POST /api/v1/auth/login/`
Authenticates existing verified credentials.

**Request Body:**
```json
{
  "email": "driver@trucking.com",
  "password": "SecurePassword123!"
}
```

#### `POST /api/v1/auth/resend-otp/`
Re-generates and dispatches a fresh 6-digit OTP to the user's email.

---

### Trip Planning & Management

#### `POST /api/v1/plan/`
Plans a new trip, calculates total distance, schedules mandatory HOS rest breaks, and stores stops.

**Request Body:**
```json
{
  "current_location": "New York, NY",
  "pickup_location": "Chicago, IL",
  "dropoff_location": "Los Angeles, CA",
  "cycle_hours_used": 15.5
}
```

#### `GET /api/v1/trips/`
Retrieves a paginated list of created trips.

#### `GET /api/v1/trips/{id}/`
Retrieves detailed trip info, including scheduled fuel/rest stops and daily logs.

---

### ELD Daily Logs

#### `GET /api/v1/logs/{id}/pdf/`
Streams/downloads the DOT-compliant 24-hour ELD PDF log sheet for a specific log ID.

---

### System Health

#### `GET /health/`
Returns current system operational status:
```json
{
  "status": "healthy",
  "service": "trip-planner-backend",
  "version": "1.0.0"
}
```

---

## ⏱️ HOS Compliance Engine Rules

The application enforces standard FMCSA commercial motor vehicle regulations:

| Rule Constraint | Value / Limit | Description |
| :--- | :--- | :--- |
| **Max Driving Limit** | 11 Hours | Driver may drive a maximum of 11 hours after 10 consecutive hours off duty. |
| **Duty Shift Window** | 14 Hours | Driver may not drive beyond the 14th consecutive hour after coming on duty. |
| **30-Minute Break** | Every 8 Hours | Driving is prohibited if more than 8 hours have passed without at least a 30-minute break. |
| **Cycle Limit** | 70 Hours / 8 Days | Maximum 70 on-duty hours accumulated in any rolling 8-day window. |
| **Fuel Stop Interval** | 1,000 Miles | Mandatory fuel stop scheduled every 1,000 miles driven. |

---

## 🧪 Unit Testing & Code Quality

The test suite is structured cleanly under `tests/unit/` according to separation of concerns:

```
tests/unit/
├── auth/          # User model, OTPService, AuthService, and Auth API tests
├── core/          # BaseModel, BaseRepository, and BaseService tests
├── trips/         # Trip, Stop, HOSService, and Trip API tests
├── logs/          # DailyLog model, PDFService, and Log API tests
├── routes/        # RouteService and Google Maps failover tests
└── health/        # Health check endpoint tests
```

### Executing Tests:

```bash
# Run complete test suite with coverage
pytest tests/unit/ -v

# Run authentication domain tests only
pytest tests/unit/auth/ -v
```

---

## 📂 Directory Structure

```
trip-planner/backend/
├── apps/
│   ├── authentication/     # User, OTP models, AuthService, OTPService, tasks & views
│   ├── core/               # Base abstractions (BaseModel, BaseRepository, BaseService)
│   ├── trips/              # Trip & Stop models, HOS engine, serializers & views
│   ├── logs/               # DailyLog model, PDFService (ReportLab) & log views
│   └── routes/             # RouteService with Google Maps API & fallback estimation
├── config/                 # Settings, URL routing, WSGI, and Celery app configuration
├── tests/unit/             # Organized domain unit test suite
├── requirements.txt        # Python dependency manifest
└── manage.py               # Django management script
```
