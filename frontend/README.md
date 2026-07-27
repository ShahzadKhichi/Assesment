# Frontend environment variables

This frontend uses Vite. Environment variables must be prefixed with `VITE_` to be exposed to the client.

Quick setup:

1. Copy `.env.example` to `.env.local` in the `frontend` folder.
2. Update values, e.g. `VITE_API_URL`.
3. Start the dev server: `pnpm dev` / `npm run dev` / `yarn dev` depending on your package manager.

Example variables are in [.env.example](.env.example).

Access them in code via `import.meta.env.VITE_API_URL` or via the helper at [src/config/env.ts](src/config/env.ts).
