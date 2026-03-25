import React from "react";
import { clearAuth, getToken, getUser, setAuth } from "./tokenStorage";

const AuthContext = React.createContext(null);

// PUBLIC_INTERFACE
export function AuthProvider({ children }) {
  /** Provides auth state (token + user) and login/logout helpers. */
  const [token, setToken] = React.useState(getToken());
  const [user, setUser] = React.useState(getUser());

  const setSession = React.useCallback(({ token: t, user: u }) => {
    setAuth({ token: t, user: u });
    setToken(t);
    setUser(u);
  }, []);

  const logout = React.useCallback(() => {
    clearAuth();
    setToken(null);
    setUser(null);
  }, []);

  const value = React.useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      setSession,
      logout
    }),
    [token, user, setSession, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// PUBLIC_INTERFACE
export function useAuth() {
  /** Hook for reading auth state and actions. */
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
