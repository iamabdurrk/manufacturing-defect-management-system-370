import React from "react";
import { useNavigate } from "react-router-dom";
import { getOverdueActions } from "../services/api";
import { Badge, Skeleton } from "../components/ui.jsx";

function normalizeList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

function statusTone(status) {
  if (status === "Complete") return "green";
  if (status === "In Progress") return "amber";
  return "blue";
}

export default function OverduePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(true);
  const [items, setItems] = React.useState([]);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const data = await getOverdueActions();
        if (!mounted) return;
        const list = normalizeList(data);
        list.sort((a, b) => (b.overdue_days || 0) - (a.overdue_days || 0));
        setItems(list);
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
            Overdue actions
          </h1>
          <div className="h2">
            Due date is before today and status is not Complete
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 14 }}>
        {loading ? (
          <div className="col" style={{ gap: 10 }}>
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} height={44} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="small">No overdue actions. Good job.</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Overdue</th>
                <th>Description</th>
                <th>Owner</th>
                <th>Status</th>
                <th>Defect</th>
              </tr>
            </thead>
            <tbody>
              {items.map((a) => (
                <tr key={a._id || a.id} className="clickable">
                  <td>
                    <Badge tone="red">{a.overdue_days || 0} days</Badge>
                  </td>
                  <td style={{ maxWidth: 520 }}>{a.description}</td>
                  <td>{a.owner_name || a.owner_id || "—"}</td>
                  <td>
                    <Badge tone={statusTone(a.status)}>{a.status}</Badge>
                  </td>
                  <td>
                    <button
                      className="btn"
                      onClick={() => navigate(`/defects/${a.defect_id}`)}
                    >
                      Open defect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
