import axios from "axios";

/**
 * API base selection:
 * - Prefer REACT_APP_API_BASE if provided
 * - Else use REACT_APP_BACKEND_URL
 * - Else attempt to auto-detect the backend on the same host at port 3001
 * - Else default to same-origin
 *
 * This project commonly runs React on :3000 and the Flask API on :3001.
 * When env vars are not provided, defaulting to same-origin breaks all `/api/*`
 * calls (they hit the frontend dev server), which surfaces as an Axios
 * "Network Error" after login when the app loads protected data.
 */
function computeBaseURL() {
  const base =
    process.env.REACT_APP_API_BASE ||
    process.env.REACT_APP_BACKEND_URL ||
    "";

  // Normalize trailing slash
  if (base) return base.endsWith("/") ? base.slice(0, -1) : base;

  // Best-effort auto-detection for local/dev and Kavia multi-port deployments.
  // Uses same protocol/hostname as the UI but switches to the backend port.
  try {
    if (typeof window !== "undefined" && window.location) {
      const url = new URL(window.location.href);
      // If UI runs on 3000 (or anything else), default backend to 3001.
      url.port = "3001";
      url.pathname = "";
      url.search = "";
      url.hash = "";
      return url.toString().replace(/\/$/, "");
    }
  } catch {
    // ignore; fall back to same-origin
  }

  return "";
}

export const http = axios.create({
  baseURL: computeBaseURL(),
  timeout: 30000
});

http.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // ignore
  }
  return config;
});

/**
 * Convert Axios errors to a friendly message payload.
 */
// PUBLIC_INTERFACE
export function toApiError(err) {
  /** Convert an axios error into {message, status, details}. */
  const status = err?.response?.status;
  const data = err?.response?.data;
  const message =
    data?.message ||
    data?.error ||
    err?.message ||
    "Request failed";
  return { message, status, details: data };
}
