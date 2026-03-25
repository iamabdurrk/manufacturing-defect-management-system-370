import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

// PUBLIC_INTERFACE
export function RequireAuth({ children }) {
  /** Redirect unauthenticated users to /login and preserve the attempted URL. */
  const auth = useAuth();
  const location = useLocation();

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
