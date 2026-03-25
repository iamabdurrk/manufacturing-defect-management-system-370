import axios from "axios";

/**
 * API base selection:
 * - Prefer REACT_APP_API_BASE if provided
 * - Else use REACT_APP_BACKEND_URL
 * - Else default to same-origin
 */
function computeBaseURL() {
  const base =
    process.env.REACT_APP_API_BASE ||
    process.env.REACT_APP_BACKEND_URL ||
    "";

  // Normalize trailing slash
  if (!base) return "";
  return base.endsWith("/") ? base.slice(0, -1) : base;
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
