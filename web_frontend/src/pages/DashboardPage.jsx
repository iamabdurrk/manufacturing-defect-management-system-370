import React from "react";
import { useNavigate } from "react-router-dom";
import { listDefects, getOverdueActions } from "../services/api";
import { Badge, Skeleton } from "../components/ui.jsx";

function normalizeList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

function severityTone(sev) {
  if (sev === "Critical") return "red";
  if (sev === "Major") return "amber";
  if (sev === "Minor") return "green";
  return "blue";
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(true);
  const [defects, setDefects] = React.useState([]);
  const [overdue, setOverdue] = React.useState([]);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const [d, o] = await Promise.all([listDefects(), getOverdueActions()]);
        if (!mounted) return;
        setDefects(normalizeList(d).slice(0, 8));
        setOverdue(normalizeList(o));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="col" style={{ gap: 14 }}>
      <div className="spread">
        <div className="col" style={{ gap: 4 }}>
          <h1 className="h1" style={{ fontWeight: 950 }}>
            Dashboard
          </h1>
          <div className="h2">Operational awareness — what needs attention now</div>
        </div>
        <button className="btn primary" onClick={() => navigate("/defects/new")}>
          Log defect
        </button>
      </div>

      <div className="row" style={{ alignItems: "stretch" }}>
        <div className="card" style={{ padding: 14, flex: 1 }}>
          <div className="spread">
            <div style={{ fontWeight: 900 }}>Overdue actions</div>
            {loading ? (
              <Skeleton width={40} height={18} />
            ) : overdue.length > 0 ? (
              <Badge tone="red">{overdue.length}</Badge>
            ) : (
              <Badge tone="green">0</Badge>
            )}
          </div>
          <div className="small" style={{ marginTop: 6 }}>
            Due date is before today and status is not Complete.
          </div>
          <button
            className="btn secondary"
            style={{ marginTop: 12, width: "100%" }}
            onClick={() => navigate("/overdue")}
            disabled={loading}
          >
            View overdue list
          </button>
        </div>

        <div className="card" style={{ padding: 14, flex: 2 }}>
          <div className="spread">
            <div style={{ fontWeight: 900 }}>Recent defects</div>
            {loading ? <Skeleton width={80} height={18} /> : null}
          </div>

          {loading ? (
            <div className="col" style={{ marginTop: 12, gap: 10 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} height={42} />
              ))}
            </div>
          ) : defects.length === 0 ? (
            <div className="small" style={{ marginTop: 12 }}>
              No defects yet. Log your first defect to start the workflow.
            </div>
          ) : (
            <table className="table" style={{ marginTop: 12 }}>
              <thead>
                <tr>
                  <th>Part</th>
                  <th>Line</th>
                  <th>Qty</th>
                  <th>Severity</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {defects.map((d) => (
                  <tr
                    key={d._id || d.id}
                    className="clickable"
                    onClick={() => navigate(`/defects/${d._id || d.id}`)}
                  >
                    <td>{d.part_number}</td>
                    <td>{d.production_line}</td>
                    <td>{d.quantity_affected}</td>
                    <td>
                      {d.severity ? (
                        <Badge tone={severityTone(d.severity)}>{d.severity}</Badge>
                      ) : (
                        <span className="small">—</span>
                      )}
                    </td>
                    <td>
                      <Badge tone="blue">{d.status || "Logged"}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
