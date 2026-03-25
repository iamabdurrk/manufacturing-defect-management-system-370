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

  /**
   * Best-effort auto-detection for local/dev and Kavia deployments.
   *
   * Important: in hosted environments the public URL may not expose an explicit
   * ":3000" port even though the underlying container maps ports. Blindly
   * forcing ":3001" can produce an unreachable host => Axios "Network Error".
   *
   * Strategy:
   * - If the current URL explicitly has port 3000, swap to 3001.
   * - If the current URL has *some* explicit port, still swap to 3001 (matches
   *   typical dev setups), but only when a port is present.
   * - If there's no explicit port in the URL, assume reverse-proxying and use
   *   same-origin (empty baseURL).
   */
  try {
    if (typeof window !== "undefined" && window.location) {
      const url = new URL(window.location.href);

      // If the origin has an explicit port, we can safely switch to 3001.
      if (url.port) {
        url.port = "3001";
        url.pathname = "";
        url.search = "";
        url.hash = "";
        return url.toString().replace(/\/$/, "");
      }
    }
  } catch {
    // ignore; fall back to same-origin
  }

  // Same-origin (useful when a reverse proxy routes /api to backend).
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

  // Ensure the UI always receives a renderable string. Some APIs return
  // `{ code, details, message }` objects (or even nested objects) as `message`.
  const pickStringMessage = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (typeof value === "number" || typeof value === "boolean") return String(value);

    // Common API error object shapes:
    // - { message: "..." }
    // - { code, details, message: "..." }
    if (typeof value === "object") {
      if (typeof value.message === "string") return value.message;

      // Last resort: safe stringify (avoid crashing React by rendering objects)
      try {
        return JSON.stringify(value);
      } catch {
        return "Request failed";
      }
    }

    return "Request failed";
  };

  const message =
    pickStringMessage(data?.message) ||
    pickStringMessage(data?.error) ||
    pickStringMessage(err?.message) ||
    "Request failed";

  return { message, status, details: data };
}
