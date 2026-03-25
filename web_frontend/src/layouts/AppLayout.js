import React, { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { apiHealth, apiGetOverdueActions } from "../services/api";
import { toApiError } from "../services/http";

/** Map routes to titles/subtitles for the topbar. */
function useRouteMeta() {
  const { pathname } = useLocation();
  return useMemo(() => {
    if (pathname === "/") return { title: "Dashboard", subtitle: "Overview of quality operations" };
    if (pathname.startsWith("/defects/new")) return { title: "New Defect", subtitle: "Log a new production defect" };
    if (pathname.startsWith("/defects/")) return { title: "Defect Detail", subtitle: "RCA, actions, and export" };
    if (pathname.startsWith("/defects")) return { title: "Defects", subtitle: "Browse and manage defects" };
    if (pathname.startsWith("/rca")) return { title: "RCA", subtitle: "Root cause analysis workspace" };
    if (pathname.startsWith("/actions")) return { title: "Corrective Actions", subtitle: "Track owners, due dates, and completion" };
    if (pathname.startsWith("/overdue")) return { title: "Overdue", subtitle: "Overdue action monitoring" };
    if (pathname.startsWith("/analytics")) return { title: "Analytics", subtitle: "Pareto and trend dashboards" };
    return { title: "Quality System", subtitle: "" };
  }, [pathname]);
}

// PUBLIC_INTERFACE
export default function AppLayout() {
  /** Main authenticated shell: sidebar navigation + topbar + route outlet. */
  const { logout } = useAuth();
  const navigate = useNavigate();
  const meta = useRouteMeta();

  const [overdueCount, setOverdueCount] = useState(null);
  const [healthNote, setHealthNote] = useState("");

  useEffect(() => {
    let mounted = true;

    // Best-effort: show a small connectivity hint (not blocking).
    (async () => {
      try {
        await apiHealth();
        if (mounted) setHealthNote("");
      } catch (e) {
        if (mounted) setHealthNote(`Backend unreachable: ${toApiError(e).message}`);
      }
    })();

    (async () => {
      try {
        const data = await apiGetOverdueActions();
        const items = Array.isArray(data) ? data : data?.items || data?.data || [];
        if (mounted) setOverdueCount(items.length);
      } catch {
        if (mounted) setOverdueCount(null);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-badge" aria-hidden="true" />
          <div className="stack">
            <div className="brand-title">Defect Manager</div>
            <div className="brand-subtitle">Manufacturing Quality</div>
          </div>
        </div>

        <nav className="nav" aria-label="Main navigation">
          <NavLink to="/" end>
            <span aria-hidden="true">▦</span>
            <span className="label">Dashboard</span>
          </NavLink>
          <NavLink to="/defects">
            <span aria-hidden="true">🧾</span>
            <span className="label">Defects</span>
          </NavLink>
          <NavLink to="/defects/new">
            <span aria-hidden="true">＋</span>
            <span className="label">New Defect</span>
          </NavLink>
          <NavLink to="/rca">
            <span aria-hidden="true">⎇</span>
            <span className="label">RCA</span>
          </NavLink>
          <NavLink to="/actions">
            <span aria-hidden="true">✓</span>
            <span className="label">Actions</span>
          </NavLink>
          <NavLink to="/overdue">
            <span aria-hidden="true">⏱</span>
            <span className="label">Overdue</span>
            {typeof overdueCount === "number" && overdueCount > 0 && (
              <span className="pill" title="Overdue actions">
                {overdueCount}
              </span>
            )}
          </NavLink>
          <NavLink to="/analytics">
            <span aria-hidden="true">▤</span>
            <span className="label">Analytics</span>
          </NavLink>
        </nav>

        <hr className="sep" />

        <button
          className="btn btn-ghost"
          onClick={() => {
            logout();
            navigate("/login");
          }}
        >
          Sign out
        </button>
      </aside>

      <section className="main">
        <header className="topbar">
          <div className="topbar-left">
            <div className="page-title">{meta.title}</div>
            <div className="page-subtitle">{healthNote || meta.subtitle}</div>
          </div>

          <div className="topbar-right">
            <span className="badge">API: {process.env.REACT_APP_API_BASE || process.env.REACT_APP_BACKEND_URL || "same-origin"}</span>
          </div>
        </header>

        <main className="content">
          <Outlet />
        </main>
      </section>
    </div>
  );
}
