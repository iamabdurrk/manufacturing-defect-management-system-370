import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { RequireAuth } from "./auth/RequireAuth";
import { ToastProvider } from "./services/toast.jsx";

import { AppLayout } from "./layouts/AppLayout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import DefectsPage from "./pages/DefectsPage";
import NewDefectPage from "./pages/NewDefectPage";
import DefectDetailPage from "./pages/DefectDetailPage";
import RcaPage from "./pages/RcaPage";
import OverduePage from "./pages/OverduePage";
import AnalyticsPage from "./pages/AnalyticsPage";
import WorkflowHelpPage from "./pages/WorkflowHelpPage";

// PUBLIC_INTERFACE
export default function App() {
  /** Application root with routing and providers. */
  return (
    <AuthProvider>
      <ToastProvider>
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
              <Route path="defects/:defectId" element={<DefectDetailPage />} />
              <Route path="defects/:defectId/rca" element={<RcaPage />} />
              <Route path="overdue" element={<OverduePage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="help/workflow" element={<WorkflowHelpPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
