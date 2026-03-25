import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiLogin } from "../services/api";

/**
 * Simple JWT token storage model for the frontend.
 * Backend auth endpoints may vary; we attempt to be tolerant by accepting multiple token field names.
 */

const AuthContext = createContext(null);

function getStoredToken() {
  try {
    return localStorage.getItem("auth_token") || "";
  } catch {
    return "";
  }
}

function storeToken(token) {
  try {
    if (token) localStorage.setItem("auth_token", token);
    else localStorage.removeItem("auth_token");
  } catch {
    // ignore
  }
}

// PUBLIC_INTERFACE
export function AuthProvider({ children }) {
  /** Provides auth state (token) and login/logout actions to the app. */
  const [token, setToken] = useState(getStoredToken());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate hydration and allow future enhancements (token validation/refresh).
    setLoading(false);
  }, []);

  const isAuthenticated = !!token;

  // PUBLIC_INTERFACE
  const login = async (email, password) => {
    /** Log in via backend and persist received JWT token. */
    const data = await apiLogin({ email, password });

    const receivedToken =
      data?.access_token ||
      data?.token ||
      data?.jwt ||
      data?.data?.access_token ||
      data?.data?.token;

    if (!receivedToken) {
      throw new Error("Login succeeded but no token was returned by the API.");
    }

    storeToken(receivedToken);
    setToken(receivedToken);
    return receivedToken;
  };

  // PUBLIC_INTERFACE
  const logout = () => {
    /** Clear local auth token. */
    storeToken("");
    setToken("");
  };

  const value = useMemo(
    () => ({
      token,
      isAuthenticated,
      loading,
      login,
      logout
    }),
    [token, isAuthenticated, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// PUBLIC_INTERFACE
export function useAuth() {
  /** Hook to access the auth context. */
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
