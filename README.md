# Trip Planner

A simple trip planning application (fullstack) with a Python backend and a Vite + React frontend.

## Tech stack

- Backend: Python (Django/FastAPI-style layout) — uses `manage.py`, `pytest` for tests
- Frontend: Vite + React + TypeScript
- API client: `axios`

## Repository layout

- `backend/` — Python backend, tests, and API implementation
- `frontend/` — Vite React frontend

## Prerequisites

- Node.js (recommended 18+) and a package manager: `pnpm`, `npm`, or `yarn`
- Python 3.10+ and `pip`

## Environment variables

Frontend uses Vite env variables and expects keys prefixed with `VITE_`.
- See `frontend/.env.example` and copy to `frontend/.env.local` for local development.

Backend environment variables live in `backend/` (see backend README or `.env` patterns). Do not commit secrets.

## Setup

Backend (example):

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
# run migrations or other setup steps if applicable
python manage.py runserver
```

Frontend:

```bash
cd frontend
# install dependencies (use your preferred package manager)
pnpm install # or npm install / yarn
# copy example env and edit
cp .env.example .env.local
# run dev server
pnpm dev # or npm run dev / yarn dev
```

## Running tests

Backend unit and integration tests use `pytest`:

```bash
cd backend
pytest
```

Frontend tests (if present) depend on the setup in `frontend/package.json`.

## Deployment

- The frontend is a Vite app suitable for static deploy (Vercel, Netlify, etc.). See `frontend/vercel.json` for sample Vercel settings.
- The backend can be deployed to any Python host (Heroku, Fly, Railway) — follow your provider's guides.

## Contributing

1. Fork the repo and create a feature branch
2. Run tests locally and ensure linting passes
3. Open a pull request with a clear description

## Notes

- Environment variables are read in the frontend via `import.meta.env`. A small helper lives at `frontend/src/config/env.ts`.
- Keep secret keys and production credentials out of git. Use `frontend/.env.local` and server-side secret management for deployment.

If you'd like, I can also:

- Add a CI workflow for running tests on push
- Commit these changes and open a PR# Assesment
