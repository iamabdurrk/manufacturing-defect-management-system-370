import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiCreateDefect } from "../services/api";
import { toApiError } from "../services/http";

// PUBLIC_INTERFACE
export default function NewDefectPage() {
  /** Defect logging form. */
  const navigate = useNavigate();

  const [partNumber, setPartNumber] = useState("");
  const [defectType, setDefectType] = useState("");
  const [quantityAffected, setQuantityAffected] = useState(1);
  const [productionLine, setProductionLine] = useState("");
  const [shift, setShift] = useState("A");
  const [severity, setSeverity] = useState("Major");
  const [photo, setPhoto] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      // Use FormData so backend can accept optional file upload.
      const fd = new FormData();
      fd.append("part_number", partNumber.trim());
      fd.append("defect_type", defectType.trim());
      fd.append("quantity_affected", String(quantityAffected));
      fd.append("production_line", productionLine.trim());
      fd.append("shift", shift);
      fd.append("severity", severity);
      if (photo) fd.append("photo", photo);

      const created = await apiCreateDefect(fd);
      const id = created?._id || created?.id || created?.data?._id || created?.data?.id;
      if (id) navigate(`/defects/${id}`);
      else navigate("/defects");
    } catch (err) {
      setError(toApiError(err).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid">
      {error ? <div className="alert">{error}</div> : null}

      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Log a defect</div>
            <div className="card-desc">Capture at production time with optional photo evidence</div>
          </div>
        </div>

        <form className="form" onSubmit={onSubmit}>
          <div className="row">
            <div className="field">
              <div className="label">Part number</div>
              <input className="input" value={partNumber} onChange={(e) => setPartNumber(e.target.value)} required />
            </div>
            <div className="field">
              <div className="label">Defect type</div>
              <input className="input" value={defectType} onChange={(e) => setDefectType(e.target.value)} required />
            </div>
          </div>

          <div className="row">
            <div className="field">
              <div className="label">Quantity affected</div>
              <input
                className="input"
                type="number"
                min={1}
                value={quantityAffected}
                onChange={(e) => setQuantityAffected(Number(e.target.value))}
                required
              />
            </div>
            <div className="field">
              <div className="label">Production line</div>
              <input className="input" value={productionLine} onChange={(e) => setProductionLine(e.target.value)} required />
            </div>
          </div>

          <div className="row">
            <div className="field">
              <div className="label">Shift</div>
              <select className="select" value={shift} onChange={(e) => setShift(e.target.value)}>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </select>
            </div>
            <div className="field">
              <div className="label">Severity</div>
              <select className="select" value={severity} onChange={(e) => setSeverity(e.target.value)}>
                <option value="Critical">Critical</option>
                <option value="Major">Major</option>
                <option value="Minor">Minor</option>
              </select>
              <div className="muted" style={{ fontSize: 12 }}>
                Backend may override via severity rules.
              </div>
            </div>
          </div>

          <div className="field">
            <div className="label">Photo (optional)</div>
            <input
              className="input"
              type="file"
              accept="image/*"
              onChange={(e) => setPhoto(e.target.files?.[0] || null)}
            />
          </div>

          <div className="spread">
            <button className="btn" type="button" onClick={() => navigate("/defects")}>
              Cancel
            </button>
            <button className="btn btn-primary" disabled={submitting} type="submit">
              {submitting ? "Saving…" : "Create defect"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
