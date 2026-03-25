import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getRca, upsertRca } from "../services/api";
import { useToast } from "../services/toast.jsx";
import { Badge, Skeleton } from "../components/ui.jsx";

function emptyFishbone() {
  return {
    Man: "",
    Machine: "",
    Method: "",
    Material: "",
    Measurement: "",
    Environment: ""
  };
}

export default function RcaPage() {
  const { defectId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  const [method, setMethod] = React.useState("5WHY"); // 5WHY | FISHBONE
  const [fiveWhys, setFiveWhys] = React.useState(["", "", "", "", ""]);
  const [fishbone, setFishbone] = React.useState(emptyFishbone());

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const existing = await getRca(defectId);
        if (!mounted || !existing) return;

        if (existing.method) setMethod(existing.method);
        if (Array.isArray(existing.five_whys)) {
          setFiveWhys([...existing.five_whys, "", "", "", "", ""].slice(0, 5));
        }
        if (existing.fishbone && typeof existing.fishbone === "object") {
          setFishbone({ ...emptyFishbone(), ...existing.fishbone });
        }
      } catch {
        // No RCA is fine; keep defaults.
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [defectId]);

  async function onSave() {
    setSaving(true);
    try {
      const payload =
        method === "5WHY"
          ? { method, five_whys: fiveWhys.map((x) => String(x || "").trim()).filter(Boolean) }
          : { method, fishbone };

      await upsertRca(defectId, payload);
      toast.success("RCA saved", "You can now proceed with corrective actions.");
      navigate(`/defects/${defectId}`);
    } catch (err) {
      toast.error("Save failed", err?.message || "Unable to save RCA.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="col" style={{ gap: 14 }}>
      <div className="spread">
        <div className="col" style={{ gap: 4 }}>
          <h1 className="h1" style={{ fontWeight: 950 }}>
            Root Cause Analysis
          </h1>
          <div className="h2">Defect #{defectId}</div>
        </div>
        <div className="row">
          <button className="btn" onClick={() => navigate(`/defects/${defectId}`)} disabled={saving}>
            Back to defect
          </button>
          <button className="btn primary" onClick={onSave} disabled={saving || loading}>
            {saving ? "Saving…" : "Save RCA"}
          </button>
        </div>
      </div>

      <div className="row">
        <button
          className={`btn ${method === "5WHY" ? "primary" : ""}`}
          type="button"
          onClick={() => setMethod("5WHY")}
        >
          5 Why
        </button>
        <button
          className={`btn ${method === "FISHBONE" ? "secondary" : ""}`}
          type="button"
          onClick={() => setMethod("FISHBONE")}
        >
          Fishbone
        </button>
        <Badge tone="amber">Gate</Badge>
        <div className="small">Saving RCA removes the workflow block.</div>
      </div>

      {loading ? (
        <div className="card" style={{ padding: 14 }}>
          <Skeleton height={18} width={180} />
          <div style={{ height: 10 }} />
          <Skeleton height={40} />
          <div style={{ height: 10 }} />
          <Skeleton height={40} />
        </div>
      ) : method === "5WHY" ? (
        <div className="card" style={{ padding: 14 }}>
          <div style={{ fontWeight: 900 }}>5 Why</div>
          <div className="small" style={{ marginTop: 4 }}>
            Recommended: fill at least 3 whys. You can save partial progress.
          </div>

          <div className="col" style={{ marginTop: 12 }}>
            {fiveWhys.map((val, idx) => (
              <div key={idx} className="field">
                <div className="label">Why {idx + 1}</div>
                <input
                  className="input"
                  value={val}
                  onChange={(e) =>
                    setFiveWhys((arr) => {
                      const next = [...arr];
                      next[idx] = e.target.value;
                      return next;
                    })
                  }
                  placeholder="Enter a reason…"
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: 14 }}>
          <div style={{ fontWeight: 900 }}>Fishbone</div>
          <div className="small" style={{ marginTop: 4 }}>
            Use short phrases. Save often.
          </div>

          <div className="row" style={{ marginTop: 12, alignItems: "stretch" }}>
            {Object.keys(emptyFishbone()).map((k) => (
              <div key={k} className="field" style={{ flex: 1, minWidth: 180 }}>
                <div className="label">{k}</div>
                <textarea
                  className="textarea"
                  value={fishbone[k]}
                  onChange={(e) => setFishbone((f) => ({ ...f, [k]: e.target.value }))}
                  placeholder={`Notes for ${k}…`}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
