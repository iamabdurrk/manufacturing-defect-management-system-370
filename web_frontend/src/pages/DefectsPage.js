import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiGetDefects } from "../services/api";
import { toApiError } from "../services/http";
import { format } from "date-fns";

function safeArray(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function norm(s) {
  return String(s || "").toLowerCase();
}

// PUBLIC_INTERFACE
export default function DefectsPage() {
  /** Browse defects. */
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      setError("");
      try {
        const data = await apiGetDefects();
        if (!mounted) return;
        setItems(safeArray(data));
      } catch (e) {
        if (!mounted) return;
        setError(toApiError(e).message);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const q = norm(query);
    return items.filter((d) => {
      const blob = [
        d?._id || d?.id,
        d?.part_number || d?.partNumber,
        d?.defect_type || d?.defectType || d?.defect_type_name,
        d?.production_line || d?.productionLine,
        d?.shift,
        d?.severity,
        d?.status
      ]
        .map((x) => norm(x))
        .join(" ");
      return blob.includes(q);
    });
  }, [items, query]);

  return (
    <div className="grid">
      {error ? <div className="alert">API error: {error}</div> : null}

      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Defects</div>
            <div className="card-desc">Search, open details, export audit PDFs</div>
          </div>
          <div className="inline">
            <input
              className="input"
              placeholder="Search (part, type, line, severity…)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ width: 320, maxWidth: "50vw" }}
            />
            <Link className="btn btn-primary" to="/defects/new">Log defect</Link>
          </div>
        </div>

        <table className="table" aria-label="Defects table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Part</th>
              <th>Defect Type</th>
              <th>Qty</th>
              <th>Line</th>
              <th>Shift</th>
              <th>Severity</th>
              <th>Status</th>
              <th>Created</th>
              <th className="actions"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d) => {
              const id = d?._id || d?.id;
              const sev = (d?.severity || "minor").toLowerCase();
              const st = (d?.status || "Open").toLowerCase().replace(/\s+/g, "");
              const created = d?.created_at || d?.createdAt;
              return (
                <tr key={id}>
                  <td className="muted">{String(id).slice(-6)}</td>
                  <td>{d?.part_number || d?.partNumber || "-"}</td>
                  <td>{d?.defect_type || d?.defectType || d?.defect_type_name || "-"}</td>
                  <td>{d?.quantity_affected ?? d?.quantityAffected ?? "-"}</td>
                  <td>{d?.production_line || d?.productionLine || "-"}</td>
                  <td>{d?.shift || "-"}</td>
                  <td><span className={`badge ${sev}`}>{d?.severity || "-"}</span></td>
                  <td><span className={`badge ${st}`}>{d?.status || "-"}</span></td>
                  <td className="muted">{created ? format(new Date(created), "yyyy-MM-dd HH:mm") : "-"}</td>
                  <td className="actions">
                    <Link className="btn" to={`/defects/${id}`}>Open</Link>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 ? (
              <tr><td colSpan={10} className="muted">No results.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
