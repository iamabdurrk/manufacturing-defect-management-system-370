import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { getOverdueActions } from "../services/api";
import { Badge } from "../components/ui.jsx";

function navLinkStyle({ isActive }) {
  return {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    padding: "12px 12px",
    borderRadius: 12,
    textDecoration: "none",
    background: isActive ? "rgba(37,99,235,0.12)" : "transparent",
    border: isActive ? "1px solid rgba(37,99,235,0.22)" : "1px solid transparent",
    fontWeight: 750
  };
}

// PUBLIC_INTERFACE
export function AppLayout() {
  /** Main shell layout: sidebar navigation + topbar. */
  const auth = useAuth();
  const navigate = useNavigate();
  const [overdueCount, setOverdueCount] = React.useState(null);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getOverdueActions();
        const items = Array.isArray(data) ? data : data?.items || [];
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
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside
        className="card"
        style={{
          width: 280,
          margin: 14,
          padding: 14,
          position: "sticky",
          top: 14,
          alignSelf: "flex-start",
          height: "calc(100vh - 28px)"
        }}
      >
        <div className="col" style={{ height: "100%" }}>
          <div style={{ padding: "6px 6px 10px 6px" }}>
            <div className="h1" style={{ fontWeight: 950 }}>
              Defect System
            </div>
            <div className="small">Workflow enforcement</div>
          </div>

          <nav className="col" style={{ gap: 6 }}>
            <NavLink to="/" end style={navLinkStyle}>
              <span>Dashboard</span>
            </NavLink>

            <NavLink to="/defects" style={navLinkStyle}>
              <span>Defects</span>
            </NavLink>

            <NavLink to="/defects/new" style={navLinkStyle}>
              <span>Log defect</span>
              <Badge tone="blue">Fast</Badge>
            </NavLink>

            <NavLink to="/overdue" style={navLinkStyle}>
              <span>Overdue actions</span>
              {typeof overdueCount === "number" ? (
                overdueCount > 0 ? (
                  <Badge tone="red">{overdueCount}</Badge>
                ) : (
                  <Badge tone="green">0</Badge>
                )
              ) : (
                <Badge tone="amber">…</Badge>
              )}
            </NavLink>

            <NavLink to="/analytics" style={navLinkStyle}>
              <span>Analytics</span>
            </NavLink>

            <NavLink to="/help/workflow" style={navLinkStyle}>
              <span>Workflow help</span>
            </NavLink>
          </nav>

          <div style={{ flex: 1 }} />

          <div className="card" style={{ padding: 12 }}>
            <div className="small">Signed in as</div>
            <div style={{ fontWeight: 900 }}>{auth.user?.name || "User"}</div>
            <div className="small">{auth.user?.role || ""}</div>
            <div className="row" style={{ marginTop: 10 }}>
              <button
                className="btn"
                onClick={() => {
                  auth.logout();
                  navigate("/login");
                }}
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </aside>

      <main style={{ flex: 1 }}>
        <div className="container">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
