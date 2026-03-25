import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";

import { AuthProvider, useAuth } from "./auth/AuthContext";
import AppLayout from "./layouts/AppLayout";

import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import DefectsPage from "./pages/DefectsPage";
import DefectDetailPage from "./pages/DefectDetailPage";
import NewDefectPage from "./pages/NewDefectPage";
import RcaPage from "./pages/RcaPage";
import ActionsPage from "./pages/ActionsPage";
import OverduePage from "./pages/OverduePage";
import AnalyticsPage from "./pages/AnalyticsPage";

/** Protect routes that require authentication. */
function RequireAuth({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="auth-shell">Loading…</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

// PUBLIC_INTERFACE
function App() {
  /** App root: provides auth context and SPA routing. */
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/"
            element={
              <RequireAuth>
                <AppLayout />
              </RequireAuth>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="defects" element={<DefectsPage />} />
            <Route path="defects/new" element={<NewDefectPage />} />
            <Route path="defects/:id" element={<DefectDetailPage />} />
            <Route path="rca" element={<RcaPage />} />
            <Route path="actions" element={<ActionsPage />} />
            <Route path="overdue" element={<OverduePage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
