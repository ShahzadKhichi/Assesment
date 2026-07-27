// Centralized environment helper for frontend
export const API_BASE_URL: string =
  (import.meta as any).env?.VITE_API_URL ?? '/api/v1';

export const APP_NAME: string =
  (import.meta as any).env?.VITE_APP_NAME ?? 'Trip Planner';

// Add additional exports for other VITE_ variables as needed
