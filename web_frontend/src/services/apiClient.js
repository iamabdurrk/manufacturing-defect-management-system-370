import axios from "axios";
import { getApiBaseUrl } from "../config";
import { getToken, clearAuth } from "../auth/tokenStorage";

// PUBLIC_INTERFACE
export function createApiClient() {
  /** Create an Axios instance configured for this app (baseURL + auth). */
  const client = axios.create({
    baseURL: getApiBaseUrl(),
    timeout: 20000
  });

  client.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  client.interceptors.response.use(
    (resp) => resp,
    (err) => {
      // Normalize errors to a simple object the UI can display safely.
      const status = err?.response?.status;
      const data = err?.response?.data;

      const normalized = {
        status,
        message:
          data?.message ||
          data?.error ||
          err?.message ||
          "Request failed",
        errors: data?.errors || null
      };

      // If token is invalid/expired, clear it so RequireAuth redirects.
      if (status === 401) {
        clearAuth();
      }

      return Promise.reject(normalized);
    }
  );

  return client;
}

export const apiClient = createApiClient();
