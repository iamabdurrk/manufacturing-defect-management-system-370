import React from "react";

// PUBLIC_INTERFACE
export default function RcaPage() {
  /** RCA workspace (5-Why / Fishbone). Backend endpoints may be added; this page anchors the workflow in the UI. */
  return (
    <div className="grid">
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Root Cause Analysis (RCA)</div>
            <div className="card-desc">5-Why and Fishbone structure; server enforces RCA required before investigation</div>
          </div>
        </div>

        <div className="grid cols-2">
          <div className="card">
            <div className="card-title">5-Why Analysis</div>
            <div className="muted" style={{ marginTop: 6, fontSize: 13 }}>
              Capture multiple why levels for a selected defect. Integrate with backend RCA endpoints when available.
            </div>
            <hr className="sep" />
            <div className="muted" style={{ fontSize: 12 }}>
              Implementation note: wire to <code>root_causes</code> and <code>why_analysis</code> collections (backend).
            </div>
          </div>

          <div className="card">
            <div className="card-title">Fishbone (Ishikawa)</div>
            <div className="muted" style={{ marginTop: 6, fontSize: 13 }}>
              Categories: Man, Machine, Method, Material, Measurement, Environment.
            </div>
            <hr className="sep" />
            <div className="muted" style={{ fontSize: 12 }}>
              Implementation note: store method=<code>FISHBONE</code> with category entries.
            </div>
          </div>
        </div>

        <div className="alert" style={{ background: "rgba(245,158,11,0.10)", borderColor: "rgba(245,158,11,0.22)", color: "#92400e" }}>
          This UI is ready; connect it to backend RCA routes once they exist (update only <code>src/services/api.js</code> and add a small RCA service).
        </div>
      </div>
    </div>
  );
}
