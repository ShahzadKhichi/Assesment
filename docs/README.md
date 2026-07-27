# Project Documentation

This document provides centralized developer-facing documentation for the Trip Planner project. It is intended to complement the root `README.md` with more detailed, reference-style information.

## Contents
- Architecture
- Backend reference
- Frontend reference
- Environment variables
- Local development workflow
- Testing
- Deployment

## Architecture

- Backend: Python-based API serving JSON under `/api/v1`. Services, repositories, models, and validators are organized under `backend/app/`.
- Frontend: Vite + React + TypeScript app living in `frontend/`. Uses `axios` for API requests and global state via the `store` directory.

## Backend reference

- Primary code: `backend/app/`
- Entry points and management: `backend/manage.py`
- Tests: `backend/tests/`

Common (example) endpoints to document and keep updated:

- `POST /api/v1/auth/login` — exchange credentials for access tokens.
- `POST /api/v1/auth/signup` — create a new user.
- `GET /api/v1/trips` — list trips for the authenticated user.
- `GET /api/v1/trips/:id` — retrieve a trip detail.
- `POST /api/v1/trips` — create a trip.

Note: Confirm the exact endpoints in `backend/app/urls` and update this list.

## Frontend reference

- Entry: `frontend/src/main.tsx` and `frontend/src/App.tsx`
- API client: `frontend/src/services/api/axiosInstance.ts` (uses `API_BASE_URL` from `frontend/src/config/env.ts`)
- Replace hard-coded URLs by adding `VITE_API_URL` to `.env.local` and restarting the dev server.

## Environment variables

Frontend (Vite) — examples (set in `frontend/.env.local`):

- `VITE_API_URL` — base API URL (e.g. `http://localhost:8000/api/v1`)
- `VITE_APP_NAME` — display name used in the UI

Backend — secrets and database connection strings belong in `backend/.env` or your host provider's secret store. Keep them out of git.

## Local development workflow

1. Backend: create virtualenv, install requirements, run server.

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py runserver
```

2. Frontend: install packages, copy env, start dev server.

```bash
cd frontend
pnpm install
cp .env.example .env.local
pnpm dev
```

3. Open the frontend at `http://localhost:5173` (default Vite port) and backend at `http://localhost:8000`.

## Testing

- Backend: `pytest` in the `backend/` folder.
- Frontend: run tests defined in `frontend/package.json` (if present).

## Deployment

- Frontend: build with `pnpm build` and deploy static files to Vercel/Netlify or serve via a CDN.
- Backend: containerize or deploy to your Python host. Ensure environment variables and secret management are configured on the host.

## Keeping docs current

- When you add or change API endpoints, update the "Backend reference" section.
- Add new developer notes, architecture diagrams, or sequence flows to `docs/` as separate markdown files.

If you want, I can generate a simple OpenAPI spec scaffold from the current backend routes (if you want that, say "generate OpenAPI scaffold").
