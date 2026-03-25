import { apiClient } from "./apiClient";

// PUBLIC_INTERFACE
export async function healthCheck() {
  /** GET / */
  const { data } = await apiClient.get("/");
  return data;
}

// PUBLIC_INTERFACE
export async function signup(payload) {
  /** POST /api/auth/signup */
  const { data } = await apiClient.post("/api/auth/signup", payload);
  return data;
}

// PUBLIC_INTERFACE
export async function login(payload) {
  /** POST /api/auth/login */
  const { data } = await apiClient.post("/api/auth/login", payload);
  return data;
}

// PUBLIC_INTERFACE
export async function listDefects() {
  /** GET /api/defects */
  const { data } = await apiClient.get("/api/defects");
  return data;
}

// PUBLIC_INTERFACE
export async function createDefect(payload) {
  /** POST /api/defects */
  const { data } = await apiClient.post("/api/defects", payload);
  return data;
}

// PUBLIC_INTERFACE
export async function getDefect(defectId) {
  /** GET /api/defects/{defect_id} */
  const { data } = await apiClient.get(`/api/defects/${defectId}`);
  return data;
}

// PUBLIC_INTERFACE
export async function updateDefect(defectId, payload) {
  /** PUT /api/defects/{defect_id} */
  const { data } = await apiClient.put(`/api/defects/${defectId}`, payload);
  return data;
}

// PUBLIC_INTERFACE
export async function getRca(defectId) {
  /** GET /api/defects/{defect_id}/rca */
  const { data } = await apiClient.get(`/api/defects/${defectId}/rca`);
  return data;
}

// PUBLIC_INTERFACE
export async function upsertRca(defectId, payload) {
  /** POST /api/defects/{defect_id}/rca */
  const { data } = await apiClient.post(`/api/defects/${defectId}/rca`, payload);
  return data;
}

// PUBLIC_INTERFACE
export async function exportDefectPdf(defectId) {
  /**
   * GET /api/defects/{defect_id}/export
   * Note: backend likely returns PDF bytes; caller should handle as blob.
   */
  const resp = await apiClient.get(`/api/defects/${defectId}/export`, {
    responseType: "blob"
  });
  return resp;
}

// PUBLIC_INTERFACE
export async function listActions() {
  /** GET /api/actions */
  const { data } = await apiClient.get("/api/actions");
  return data;
}

// PUBLIC_INTERFACE
export async function createAction(payload) {
  /** POST /api/actions */
  const { data } = await apiClient.post("/api/actions", payload);
  return data;
}

// PUBLIC_INTERFACE
export async function updateAction(actionId, payload) {
  /** PUT /api/actions/{action_id} */
  const { data } = await apiClient.put(`/api/actions/${actionId}`, payload);
  return data;
}

// PUBLIC_INTERFACE
export async function getOverdueActions() {
  /** GET /api/dashboard/overdue-actions */
  const { data } = await apiClient.get("/api/dashboard/overdue-actions");
  return data;
}

// PUBLIC_INTERFACE
export async function getPareto(params = {}) {
  /** GET /api/analytics/pareto?start&end */
  const { data } = await apiClient.get("/api/analytics/pareto", { params });
  return data;
}

// PUBLIC_INTERFACE
export async function getTrends(params = {}) {
  /** GET /api/analytics/trends?start&end&interval&production_line&part_number&defect_type_id */
  const { data } = await apiClient.get("/api/analytics/trends", { params });
  return data;
}

// PUBLIC_INTERFACE
export async function uploadFile(file) {
  /**
   * POST /api/uploads
   * OpenAPI snapshot does not specify requestBody schema; we use multipart/form-data with "file".
   */
  const form = new FormData();
  form.append("file", file);
  const { data } = await apiClient.post("/api/uploads", form, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return data;
}

// PUBLIC_INTERFACE
export function getPublicUploadUrl(fileId) {
  /** GET /uploads/{file_id} (public serving) */
  return `${apiClient.defaults.baseURL}/uploads/${fileId}`;
}
