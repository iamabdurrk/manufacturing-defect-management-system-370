import React from "react";
import { useNavigate } from "react-router-dom";
import { createDefect, uploadFile } from "../services/api";
import { useToast } from "../services/toast.jsx";

const SEVERITIES = ["Critical", "Major", "Minor"];

export default function NewDefectPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");

  const [form, setForm] = React.useState({
    part_number: "",
    defect_type_id: "",
    quantity_affected: 1,
    production_line: "",
    shift: "",
    severity: "Major",
    photo_file_id: null
  });

  const [photo, setPhoto] = React.useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      let photoFileId = null;

      // Photo upload is optional and should not block submission if it fails.
      if (photo) {
        try {
          const up = await uploadFile(photo);
          photoFileId = up.file_id;
        } catch {
          toast.error("Photo not uploaded", "Saved defect will proceed without photo.");
        }
      }

      const payload = {
        ...form,
        quantity_affected: Number(form.quantity_affected),
        photo_file_id: photoFileId
      };

      const created = await createDefect(payload);
      const id = created?._id || created?.id || created?.defect_id;

      toast.success("Defect logged", "Next step: complete RCA.");
      if (id) {
        navigate(`/defects/${id}`, { replace: true });
      } else {
        navigate("/defects", { replace: true });
      }
    } catch (err) {
      setError(err?.message || "Unable to save defect.");
      toast.error("Save failed", err?.message || "Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="col" style={{ gap: 14 }}>
      <div className="spread">
        <div className="col" style={{ gap: 4 }}>
          <h1 className="h1" style={{ fontWeight: 950 }}>
            Log a defect
          </h1>
          <div className="h2">Fast entry — target under 30 seconds</div>
        </div>
      </div>

      <form onSubmit={onSubmit} className="card" style={{ padding: 14 }}>
        <div className="row" style={{ alignItems: "stretch" }}>
          <div className="col" style={{ flex: 2 }}>
            <div className="field">
              <div className="label">Part number *</div>
              <input
                className="input"
                value={form.part_number}
                onChange={(e) =>
                  setForm((f) => ({ ...f, part_number: e.target.value }))
                }
                required
                placeholder="e.g., PN-100234"
              />
            </div>

            <div className="field">
              <div className="label">Defect type ID *</div>
              <input
                className="input"
                value={form.defect_type_id}
                onChange={(e) =>
                  setForm((f) => ({ ...f, defect_type_id: e.target.value }))
                }
                required
                placeholder="(temporary) enter defect type id"
              />
              <div className="small">
                Note: defect type master data is typically configured server-side.
              </div>
            </div>

            <div className="row">
              <div className="field" style={{ flex: 1 }}>
                <div className="label">Quantity affected *</div>
                <input
                  className="input"
                  type="number"
                  min={1}
                  value={form.quantity_affected}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, quantity_affected: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="field" style={{ flex: 1 }}>
                <div className="label">Severity</div>
                <select
                  className="select"
                  value={form.severity}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, severity: e.target.value }))
                  }
                >
                  {SEVERITIES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="row">
              <div className="field" style={{ flex: 1 }}>
                <div className="label">Production line *</div>
                <input
                  className="input"
                  value={form.production_line}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, production_line: e.target.value }))
                  }
                  required
                  placeholder="e.g., Line 2"
                />
              </div>

              <div className="field" style={{ flex: 1 }}>
                <div className="label">Shift *</div>
                <input
                  className="input"
                  value={form.shift}
                  onChange={(e) => setForm((f) => ({ ...f, shift: e.target.value }))}
                  required
                  placeholder="e.g., A"
                />
              </div>
            </div>
          </div>

          <div className="col" style={{ flex: 1 }}>
            <div className="field">
              <div className="label">Photo (optional)</div>
              <input
                className="input"
                type="file"
                accept="image/*"
                onChange={(e) => setPhoto(e.target.files?.[0] || null)}
              />
              <div className="small">If upload fails, defect can still be saved.</div>
            </div>

            {error ? (
              <div
                className="card"
                style={{
                  padding: 12,
                  borderColor: "rgba(239,68,68,0.35)",
                  background: "rgba(239,68,68,0.08)"
                }}
              >
                <div style={{ fontWeight: 900 }}>Can’t save</div>
                <div className="small">{error}</div>
              </div>
            ) : null}

            <button className="btn primary" type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save defect"}
            </button>

            <button
              className="btn"
              type="button"
              disabled={saving}
              onClick={() => navigate("/defects")}
            >
              Back to list
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
