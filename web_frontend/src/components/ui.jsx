import React from "react";

// PUBLIC_INTERFACE
export function Badge({ tone = "blue", children }) {
  /** Simple semantic badge. tone: blue|amber|red|green */
  return <span className={`badge ${tone}`}>{children}</span>;
}

// PUBLIC_INTERFACE
export function Skeleton({ height = 14, width = "100%", style }) {
  /** Loading skeleton block. */
  return (
    <div
      className="skeleton"
      style={{ height, width, ...style }}
      aria-hidden="true"
    />
  );
}

// PUBLIC_INTERFACE
export function NextStepStrip({ title, description, action }) {
  /**
   * Workflow “next best action” strip.
   * action: {label, onClick, disabled, tone}
   */
  return (
    <div
      className="card"
      style={{ padding: 14, borderLeft: "6px solid rgba(245,158,11,0.65)" }}
    >
      <div className="spread">
        <div className="col" style={{ gap: 2 }}>
          <div style={{ fontWeight: 900 }}>{title}</div>
          {description ? <div className="small">{description}</div> : null}
        </div>
        {action ? (
          <button
            className={`btn ${action.tone || "secondary"}`}
            onClick={action.onClick}
            disabled={action.disabled}
          >
            {action.label}
          </button>
        ) : null}
      </div>
    </div>
  );
}
