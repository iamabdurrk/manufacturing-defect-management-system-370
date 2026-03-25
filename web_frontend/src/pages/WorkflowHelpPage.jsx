import React from "react";
import { Badge } from "../components/ui.jsx";

export default function WorkflowHelpPage() {
  return (
    <div className="col" style={{ gap: 14 }}>
      <div className="col" style={{ gap: 4 }}>
        <h1 className="h1" style={{ fontWeight: 950 }}>
          Workflow help
        </h1>
        <div className="h2">This system enforces a quality workflow (not just CRUD)</div>
      </div>

      <div className="card" style={{ padding: 14 }}>
        <div style={{ fontWeight: 950 }}>Lifecycle</div>
        <div className="small" style={{ marginTop: 8, lineHeight: 1.6 }}>
          Defect logged → <b>RCA required</b> (mandatory gate) → Corrective actions assigned →
          Execution tracking → Closure + audit evidence → Analytics learning.
        </div>

        <div className="row" style={{ marginTop: 12, flexWrap: "wrap" }}>
          <Badge tone="red">Red = Overdue / Risk</Badge>
          <Badge tone="amber">Amber = In progress / Attention</Badge>
          <Badge tone="green">Green = Complete</Badge>
          <Badge tone="blue">Blue = Informational</Badge>
        </div>

        <div style={{ fontWeight: 950, marginTop: 14 }}>What “blocked” means</div>
        <div className="small" style={{ marginTop: 8, lineHeight: 1.6 }}>
          If RCA is missing, the backend will reject attempts to progress the defect. The UI will
          show a clear “RCA required” callout and guide you to complete RCA first.
        </div>
      </div>
    </div>
  );
}
