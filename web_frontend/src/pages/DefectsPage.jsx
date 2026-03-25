import React from "react";
import { useNavigate } from "react-router-dom";
import { listDefects } from "../services/api";
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

export default function DefectsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(true);
  const [defects, setDefects] = React.useState([]);
  const [q, setQ] = React.useState("");

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const data = await listDefects();
        if (!mounted) return;
        setDefects(normalizeList(data));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = React.useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return defects;
    return defects.filter((d) => {
      const hay = [
        d.part_number,
        d.production_line,
        d.shift,
        d.status,
        d.severity,
        d.defect_type_id
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(s);
    });
  }, [defects, q]);

  return (
    <div className="col" style={{ gap: 14 }}>
      <div className="spread">
        <div className="col" style={{ gap: 4 }}>
          <h1 className="h1" style={{ fontWeight: 950 }}>
            Defects
          </h1>
          <div className="h2">Search and drill down quickly</div>
        </div>
        <button className="btn primary" onClick={() => navigate("/defects/new")}>
          New defect
        </button>
      </div>

      <div className="card" style={{ padding: 14 }}>
        <div className="row">
          <div className="field" style={{ flex: 1 }}>
            <div className="label">Search</div>
            <input
              className="input"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Part number, line, shift, status…"
            />
          </div>
          <div className="small" style={{ marginTop: 18 }}>
            {loading ? "Loading…" : `${filtered.length} results`}
          </div>
        </div>

        {loading ? (
          <div className="col" style={{ marginTop: 12, gap: 10 }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} height={44} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="small" style={{ marginTop: 12 }}>
            No matching defects.
          </div>
        ) : (
          <table className="table" style={{ marginTop: 12 }}>
            <thead>
              <tr>
                <th>Part</th>
                <th>Line</th>
                <th>Shift</th>
                <th>Qty</th>
                <th>Severity</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr
                  key={d._id || d.id}
                  className="clickable"
                  onClick={() => navigate(`/defects/${d._id || d.id}`)}
                >
                  <td>{d.part_number}</td>
                  <td>{d.production_line}</td>
                  <td>{d.shift}</td>
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
  );
}
