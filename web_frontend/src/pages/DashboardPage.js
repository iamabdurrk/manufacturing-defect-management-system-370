import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiGetDefects, apiGetOverdueActions } from "../services/api";
import { toApiError } from "../services/http";
import { formatDistanceToNowStrict } from "date-fns";

function safeArray(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

// PUBLIC_INTERFACE
export default function DashboardPage() {
  /** Dashboard landing page. */
  const [defects, setDefects] = useState([]);
  const [overdue, setOverdue] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      setError("");
      try {
        const [d, o] = await Promise.all([apiGetDefects(), apiGetOverdueActions()]);
        if (!mounted) return;
        setDefects(safeArray(d));
        setOverdue(safeArray(o));
      } catch (e) {
        if (!mounted) return;
        setError(toApiError(e).message);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const kpis = useMemo(() => {
    const totalDefects = defects.length;

    const critical = defects.filter((x) => (x?.severity || "").toLowerCase() === "critical").length;
    const major = defects.filter((x) => (x?.severity || "").toLowerCase() === "major").length;
    const minor = defects.filter((x) => (x?.severity || "").toLowerCase() === "minor").length;

    return { totalDefects, critical, major, minor, overdue: overdue.length };
  }, [defects, overdue]);

  const recent = defects
    .slice()
    .sort((a, b) => new Date(b?.created_at || b?.createdAt || 0) - new Date(a?.created_at || a?.createdAt || 0))
    .slice(0, 6);

  return (
    <div className="grid">
      {error ? <div className="alert">API error: {error}</div> : null}

      <div className="grid cols-3">
        <div className="card kpi">
          <div className="kpi-label">Total defects</div>
          <div className="kpi-value">{kpis.totalDefects}</div>
          <div className="muted" style={{ fontSize: 12 }}>
            <Link to="/defects" className="btn btn-ghost">View list</Link>
          </div>
        </div>

        <div className="card kpi">
          <div className="kpi-label">Severity mix</div>
          <div className="inline">
            <span className="badge critical">Critical: {kpis.critical}</span>
            <span className="badge major">Major: {kpis.major}</span>
            <span className="badge minor">Minor: {kpis.minor}</span>
          </div>
          <div className="muted" style={{ fontSize: 12 }}>
            Classification can be manual or rule-driven (backend).
          </div>
        </div>

        <div className="card kpi">
          <div className="kpi-label">Overdue actions</div>
          <div className="kpi-value">{kpis.overdue}</div>
          <div className="muted" style={{ fontSize: 12 }}>
            <Link to="/overdue" className="btn btn-ghost">Review overdue</Link>
          </div>
        </div>
      </div>

      <div className="grid cols-2">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Recent defects</div>
              <div className="card-desc">Latest items logged on the floor</div>
            </div>
            <Link className="btn btn-primary" to="/defects/new">Log defect</Link>
          </div>

          <table className="table" aria-label="Recent defects table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Part</th>
                <th>Type</th>
                <th>Severity</th>
                <th>Created</th>
                <th className="actions"></th>
              </tr>
            </thead>
            <tbody>
              {recent.map((d) => {
                const id = d?._id || d?.id;
                const sev = (d?.severity || "Minor").toLowerCase();
                const created = d?.created_at || d?.createdAt;
                return (
                  <tr key={id}>
                    <td className="muted">{String(id).slice(-6)}</td>
                    <td>{d?.part_number || d?.partNumber || "-"}</td>
                    <td>{d?.defect_type || d?.defectType || d?.defect_type_name || "-"}</td>
                    <td><span className={`badge ${sev}`}>{d?.severity || "-"}</span></td>
                    <td className="muted">
                      {created ? formatDistanceToNowStrict(new Date(created), { addSuffix: true }) : "-"}
                    </td>
                    <td className="actions">
                      <Link className="btn" to={`/defects/${id}`}>Open</Link>
                    </td>
                  </tr>
                );
              })}
              {recent.length === 0 ? (
                <tr>
                  <td colSpan={6} className="muted">No defects yet.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Quick actions</div>
              <div className="card-desc">Common workflow entry points</div>
            </div>
          </div>

          <div className="grid">
            <div className="card" style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.08), rgba(255,255,255,0))" }}>
              <div className="spread">
                <div className="stack">
                  <div style={{ fontWeight: 800 }}>Perform RCA</div>
                  <div className="muted" style={{ fontSize: 12 }}>
                    Root cause required before advancing to “Under Investigation”
                  </div>
                </div>
                <Link className="btn btn-primary" to="/rca">RCA workspace</Link>
              </div>
            </div>

            <div className="card" style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.10), rgba(255,255,255,0))" }}>
              <div className="spread">
                <div className="stack">
                  <div style={{ fontWeight: 800 }}>Track actions</div>
                  <div className="muted" style={{ fontSize: 12 }}>
                    Assign owners and due dates; watch overdue automatically
                  </div>
                </div>
                <Link className="btn" to="/actions">Open actions</Link>
              </div>
            </div>

            <div className="card" style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.10), rgba(255,255,255,0))" }}>
              <div className="spread">
                <div className="stack">
                  <div style={{ fontWeight: 800 }}>Analytics</div>
                  <div className="muted" style={{ fontSize: 12 }}>
                    Pareto + trends for data-driven quality improvements
                  </div>
                </div>
                <Link className="btn" to="/analytics">View charts</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
