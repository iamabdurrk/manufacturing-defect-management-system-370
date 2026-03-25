import React, { useEffect, useState } from "react";
import { apiGetOverdueActions } from "../services/api";
import { toApiError } from "../services/http";

// PUBLIC_INTERFACE
export default function OverduePage() {
  /** Overdue monitoring page (server computes overdue_days). */
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      setError("");
      try {
        const data = await apiGetOverdueActions();
        const arr = Array.isArray(data) ? data : data?.items || data?.data || [];
        if (mounted) setItems(arr);
      } catch (e) {
        if (mounted) setError(toApiError(e).message);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="grid">
      {error ? <div className="alert">{error}</div> : null}

      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Overdue actions</div>
            <div className="card-desc">Computed server-side: today - due_date where status != Complete</div>
          </div>
        </div>

        <table className="table" aria-label="Overdue actions table">
          <thead>
            <tr>
              <th>Action</th>
              <th>Defect</th>
              <th>Owner</th>
              <th>Overdue days</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((x, idx) => (
              <tr key={x?._id || x?.id || idx}>
                <td>{x?.description || x?.action?.description || "-"}</td>
                <td className="muted">{x?.defect_id || x?.defect?._id || x?.defect?.id || "-"}</td>
                <td>{x?.owner_id || x?.owner?.name || x?.owner || "-"}</td>
                <td>
                  <span className="badge critical">{x?.overdue_days ?? x?.overdueDays ?? "-"}</span>
                </td>
                <td>
                  <span className="badge">{x?.status || x?.action?.status || "-"}</span>
                </td>
              </tr>
            ))}
            {items.length === 0 ? (
              <tr><td colSpan={5} className="muted">No overdue actions.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
