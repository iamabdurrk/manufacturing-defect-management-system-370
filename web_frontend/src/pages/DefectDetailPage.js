import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiExportDefectPdfUrl, apiGetDefect } from "../services/api";
import { toApiError } from "../services/http";
import { format } from "date-fns";

function badgeSeverity(sev) {
  const s = String(sev || "minor").toLowerCase();
  if (s.includes("critical")) return "critical";
  if (s.includes("major")) return "major";
  return "minor";
}

// PUBLIC_INTERFACE
export default function DefectDetailPage() {
  /** Defect detail with export trigger and workflow summary. */
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      setError("");
      try {
        const data = await apiGetDefect(id);
        if (!mounted) return;
        setItem(data?.data || data);
      } catch (e) {
        if (!mounted) return;
        setError(toApiError(e).message);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  const exportUrl = useMemo(() => apiExportDefectPdfUrl(id), [id]);

  return (
    <div className="grid">
      {error ? <div className="alert">{error}</div> : null}

      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Defect #{String(id).slice(-6)}</div>
            <div className="card-desc">Audit-ready PDF export available anytime</div>
          </div>
          <div className="inline">
            <a className="btn" href={exportUrl} target="_blank" rel="noreferrer">
              Export PDF
            </a>
            <Link className="btn btn-primary" to="/rca">
              RCA workspace
            </Link>
          </div>
        </div>

        {!item ? (
          <div className="muted">Loading…</div>
        ) : (
          <>
            <div className="grid cols-3">
              <div className="card">
                <div className="kpi-label">Part number</div>
                <div style={{ fontWeight: 900, fontSize: 18 }}>{item?.part_number || item?.partNumber || "-"}</div>
              </div>
              <div className="card">
                <div className="kpi-label">Defect type</div>
                <div style={{ fontWeight: 900, fontSize: 18 }}>
                  {item?.defect_type || item?.defectType || item?.defect_type_name || "-"}
                </div>
              </div>
              <div className="card">
                <div className="kpi-label">Severity</div>
                <div className={`badge ${badgeSeverity(item?.severity)}`}>{item?.severity || "-"}</div>
              </div>
            </div>

            <div className="grid cols-2">
              <div className="card">
                <div className="card-title">Production context</div>
                <div className="grid" style={{ marginTop: 10 }}>
                  <div className="spread">
                    <span className="muted">Line</span>
                    <span>{item?.production_line || item?.productionLine || "-"}</span>
                  </div>
                  <div className="spread">
                    <span className="muted">Shift</span>
                    <span>{item?.shift || "-"}</span>
                  </div>
                  <div className="spread">
                    <span className="muted">Quantity affected</span>
                    <span>{item?.quantity_affected ?? item?.quantityAffected ?? "-"}</span>
                  </div>
                  <div className="spread">
                    <span className="muted">Status</span>
                    <span className="badge">{item?.status || "Open"}</span>
                  </div>
                  <div className="spread">
                    <span className="muted">Created</span>
                    <span className="muted">
                      {item?.created_at || item?.createdAt ? format(new Date(item.created_at || item.createdAt), "yyyy-MM-dd HH:mm") : "-"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-title">Workflow rule</div>
                <div className="card-desc" style={{ marginTop: 6 }}>
                  A defect cannot progress unless Root Cause exists and at least one RCA entry is recorded.
                  This rule is enforced server-side.
                </div>
                <hr className="sep" />
                <div className="inline">
                  <Link className="btn" to="/actions">Manage actions</Link>
                  <Link className="btn" to="/overdue">Overdue list</Link>
                  <Link className="btn" to="/analytics">Analytics</Link>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
