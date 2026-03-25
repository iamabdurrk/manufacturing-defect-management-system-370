import React from "react";

/**
 * This page is intentionally minimal in this iteration.
 * The primary operational action management is done via the Overdue view
 * and defect-context screens.
 */
export default function ActionsPage() {
  return (
    <div className="card" style={{ padding: 14 }}>
      <div style={{ fontWeight: 950 }}>Actions</div>
      <div className="small" style={{ marginTop: 8 }}>
        Use “Overdue actions” for operational follow-up. This page is reserved for future
        enhancements (global action management).
      </div>
    </div>
  );
}
