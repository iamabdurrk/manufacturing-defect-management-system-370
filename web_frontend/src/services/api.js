import { http } from "./http";

/**
 * NOTE: Backend OpenAPI in this environment currently only exposes health check.
 * The endpoints below follow the project acceptance criteria paths.
 * If backend routes differ, update only this file to rewire the UI.
 */

// PUBLIC_INTERFACE
export async function apiHealth() {
  /** Health check. */
  const res = await http.get("/");
  return res.data;
}

// PUBLIC_INTERFACE
export async function apiLogin({ email, password }) {
  /** Auth login. Expected endpoint: POST /api/auth/login (fallbacks included). */
  const candidates = ["/api/auth/login", "/api/login", "/auth/login"];
  let lastErr;
  for (const path of candidates) {
    try {
      const res = await http.post(path, { email, password });
      return res.data;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr;
}

// PUBLIC_INTERFACE
export async function apiSignup({ name, email, password, role }) {
  /** Auth signup. Expected endpoint: POST /api/auth/signup. */
  const res = await http.post("/api/auth/signup", { name, email, password, role });
  return res.data;
}

// PUBLIC_INTERFACE
export async function apiGetDefects() {
  /** List defects. */
  const res = await http.get("/api/defects");
  return res.data;
}

// PUBLIC_INTERFACE
export async function apiCreateDefect(payload) {
  /** Create defect (supports optional photo upload via multipart if payload is FormData). */
  const isFormData = typeof FormData !== "undefined" && payload instanceof FormData;
  const res = await http.post("/api/defects", payload, {
    headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined
  });
  return res.data;
}

// PUBLIC_INTERFACE
export async function apiGetDefect(id) {
  /** Fetch a single defect. */
  const res = await http.get(`/api/defects/${encodeURIComponent(id)}`);
  return res.data;
}

// PUBLIC_INTERFACE
export async function apiGetOverdueActions() {
  /** Get overdue actions (dashboard helper). */
  const res = await http.get("/api/dashboard/overdue-actions");
  return res.data;
}

// PUBLIC_INTERFACE
export async function apiCreateAction(payload) {
  /** Create corrective action (expected: POST /api/actions). */
  const res = await http.post("/api/actions", payload);
  return res.data;
}

// PUBLIC_INTERFACE
export async function apiUpdateAction(id, payload) {
  /** Update corrective action (expected: PUT /api/actions/{id}). */
  const res = await http.put(`/api/actions/${encodeURIComponent(id)}`, payload);
  return res.data;
}

// PUBLIC_INTERFACE
export async function apiGetAnalyticsPareto(params) {
  /** Get pareto analytics: GET /api/analytics/pareto */
  const res = await http.get("/api/analytics/pareto", { params });
  return res.data;
}

// PUBLIC_INTERFACE
export async function apiGetAnalyticsTrends(params) {
  /** Get trends analytics: GET /api/analytics/trends */
  const res = await http.get("/api/analytics/trends", { params });
  return res.data;
}

// PUBLIC_INTERFACE
export function apiExportDefectPdfUrl(id) {
  /** Build the export URL (GET /api/defects/{id}/export). Browser download is handled by navigation. */
  const base = http.defaults.baseURL || "";
  return `${base}/api/defects/${encodeURIComponent(id)}/export`;
}
