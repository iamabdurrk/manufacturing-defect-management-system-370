/**
 * Environment configuration for the frontend.
 * We intentionally support both REACT_APP_API_BASE and REACT_APP_BACKEND_URL
 * since orchestration may provide either (see .env.example).
 */

// PUBLIC_INTERFACE
export function getApiBaseUrl() {
  /** Returns API base URL (no trailing slash). */
  const raw =
    import.meta.env.VITE_API_BASE ||
    import.meta.env.REACT_APP_API_BASE ||
    import.meta.env.REACT_APP_BACKEND_URL ||
    "http://localhost:3001";

  return String(raw).replace(/\/+$/, "");
}
