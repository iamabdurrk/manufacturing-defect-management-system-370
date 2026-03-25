import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { exportDefectPdf, getDefect, getRca, listActions } from "../services/api";
import { Badge, NextStepStrip, Skeleton } from "../components/ui.jsx";
import { useToast } from "../services/toast.jsx";

function severityTone(sev) {
  if (sev === "Critical") return "red";
  if (sev === "Major") return "amber";
  if (sev === "Minor") return "green";
  return "blue";
}

function normalizeList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

export default function DefectDetailPage() {
  const { defectId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = React.useState(true);
  const [defect, setDefect] = React.useState(null);
  const [rca, setRca] = React.useState(null);
  const [actions, setActions] = React.useState([]);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const [d, r, a] = await Promise.all([
          getDefect(defectId),
          getRca(defectId).catch(() => null),
          listActions().catch(() => [])
        ]);

        if (!mounted) return;

        setDefect(d);
        setRca(r);
        const allActions = normalizeList(a);
        setActions(allActions.filter((x) => String(x.defect_id) === String(defectId)));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [defectId]);

  const rcaMissing = !rca || (!rca.method && !rca?.data?.method);
  const openActions = actions.filter((a) => a.status !== "Complete");

  async function onExport() {
    try {
      const resp = await exportDefectPdf(defectId);
      const blob = resp.data;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `defect_${defectId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Export ready", "Downloaded PDF report.");
    } catch (err) {
      toast.error("Export failed", err?.message || "Unable to export PDF.");
    }
  }

  return (
    <div className="col" style={{ gap: 14 }}>
      <div className="spread">
        <div className="col" style={{ gap: 4 }}>
          <h1 className="h1" style={{ fontWeight: 950 }}>
            Defect detail
          </h1>
          <div className="h2">Workflow hub — keep the next step obvious</div>
        </div>
        <div className="row">
          <button className="btn" onClick={() => navigate("/defects")}>
            Back
          </button>
          <button className="btn" onClick={onExport} disabled={loading}>
            Export PDF
          </button>
        </div>
      </div>

      {loading ? (
        <div className="card" style={{ padding: 14 }}>
          <Skeleton height={18} width={220} />
          <div style={{ height: 10 }} />
          <Skeleton height={14} width="100%" />
          <div style={{ height: 10 }} />
          <Skeleton height={14} width="85%" />
        </div>
      ) : defect ? (
        <>
          {rcaMissing ? (
            <NextStepStrip
              title="RCA required"
              description="This defect cannot progress until a Root Cause Analysis is saved."
              action={{
                label: "Complete RCA now",
                onClick: () => navigate(`/defects/${defectId}/rca`),
                tone: "secondary"
              }}
            />
          ) : openActions.length > 0 ? (
            <NextStepStrip
              title="Corrective actions pending"
              description="Add or update actions until all are marked Complete."
              action={{
                label: "Manage actions",
                onClick: () => navigate(`/overdue`),
                tone: "secondary"
              }}
            />
          ) : (
            <NextStepStrip
              title="Next step"
              description="RCA is saved and no open actions detected."
              action={null}
            />
          )}

          <div className="card" style={{ padding: 14 }}>
            <div className="spread">
              <div className="col" style={{ gap: 6 }}>
                <div style={{ fontWeight: 950, fontSize: 18 }}>
                  {defect.part_number}
                </div>
                <div className="small">
                  Line: <b>{defect.production_line}</b> · Shift: <b>{defect.shift}</b> · Qty:{" "}
                  <b>{defect.quantity_affected}</b>
                </div>
              </div>
              <div className="row">
                {defect.severity ? (
                  <Badge tone={severityTone(defect.severity)}>{defect.severity}</Badge>
                ) : null}
                <Badge tone="blue">{defect.status || "Logged"}</Badge>
              </div>
            </div>

            <div className="row" style={{ marginTop: 12 }}>
              <div className="card" style={{ padding: 12, flex: 1 }}>
                <div style={{ fontWeight: 900 }}>RCA</div>
                <div className="small" style={{ marginTop: 4 }}>
                  {rcaMissing ? "Missing (blocked)" : `Saved (${rca.method || rca?.data?.method})`}
                </div>
                <button
                  className={`btn ${rcaMissing ? "secondary" : ""}`}
                  style={{ marginTop: 10, width: "100%" }}
                  onClick={() => navigate(`/defects/${defectId}/rca`)}
                >
                  {rcaMissing ? "Add RCA" : "View / update RCA"}
                </button>
              </div>

              <div className="card" style={{ padding: 12, flex: 1 }}>
                <div style={{ fontWeight: 900 }}>Actions</div>
                <div className="small" style={{ marginTop: 4 }}>
                  {actions.length} total · {openActions.length} open
                </div>
                <button
                  className="btn"
                  style={{ marginTop: 10, width: "100%" }}
                  onClick={() => navigate("/overdue")}
                >
                  Open actions view
                </button>
              </div>

              <div className="card" style={{ padding: 12, flex: 1 }}>
                <div style={{ fontWeight: 900 }}>Audit & reporting</div>
                <div className="small" style={{ marginTop: 4 }}>
                  Download a PDF report for audits.
                </div>
                <button className="btn" style={{ marginTop: 10, width: "100%" }} onClick={onExport}>
                  Export PDF
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="card" style={{ padding: 14 }}>
          <div style={{ fontWeight: 900 }}>Defect not found</div>
          <div className="small">Return to the defects list and try again.</div>
        </div>
      )}
    </div>
  );
}
