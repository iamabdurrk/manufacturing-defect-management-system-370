import React, { useState } from "react";
import { apiCreateAction, apiUpdateAction } from "../services/api";
import { toApiError } from "../services/http";

// PUBLIC_INTERFACE
export default function ActionsPage() {
  /** Corrective action management (create/update). */
  const [defectId, setDefectId] = useState("");
  const [description, setDescription] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState("Open");

  const [updateId, setUpdateId] = useState("");
  const [updateStatus, setUpdateStatus] = useState("In Progress");

  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  const create = async (e) => {
    e.preventDefault();
    setError("");
    setResult("");
    try {
      const payload = {
        defect_id: defectId.trim(),
        description: description.trim(),
        owner_id: ownerId.trim(),
        due_date: dueDate,
        status
      };
      const data = await apiCreateAction(payload);
      const id = data?._id || data?.id || data?.data?._id || data?.data?.id;
      setResult(`Created action ${id || "(id unknown)"}`);
    } catch (err) {
      setError(toApiError(err).message);
    }
  };

  const update = async (e) => {
    e.preventDefault();
    setError("");
    setResult("");
    try {
      const payload = { status: updateStatus };
      await apiUpdateAction(updateId.trim(), payload);
      setResult("Updated action status.");
    } catch (err) {
      setError(toApiError(err).message);
    }
  };

  return (
    <div className="grid cols-2">
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Create action</div>
            <div className="card-desc">Assign ownership and due date</div>
          </div>
        </div>

        {error ? <div className="alert">{error}</div> : null}
        {result ? <div className="badge" style={{ padding: "8px 10px" }}>{result}</div> : null}

        <form className="form" onSubmit={create}>
          <div className="field">
            <div className="label">Defect ID</div>
            <input className="input" value={defectId} onChange={(e) => setDefectId(e.target.value)} required />
          </div>
          <div className="field">
            <div className="label">Description</div>
            <textarea className="textarea" value={description} onChange={(e) => setDescription(e.target.value)} required />
          </div>
          <div className="row">
            <div className="field">
              <div className="label">Owner ID</div>
              <input className="input" value={ownerId} onChange={(e) => setOwnerId(e.target.value)} required />
            </div>
            <div className="field">
              <div className="label">Due date</div>
              <input className="input" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
            </div>
          </div>
          <div className="field">
            <div className="label">Status</div>
            <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option>Open</option>
              <option>In Progress</option>
              <option>Complete</option>
            </select>
          </div>

          <button className="btn btn-primary" type="submit">Create</button>
        </form>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Update action</div>
            <div className="card-desc">Update status by action id</div>
          </div>
        </div>

        <form className="form" onSubmit={update}>
          <div className="field">
            <div className="label">Action ID</div>
            <input className="input" value={updateId} onChange={(e) => setUpdateId(e.target.value)} required />
          </div>
          <div className="field">
            <div className="label">New status</div>
            <select className="select" value={updateStatus} onChange={(e) => setUpdateStatus(e.target.value)}>
              <option>Open</option>
              <option>In Progress</option>
              <option>Complete</option>
            </select>
          </div>

          <button className="btn" type="submit">Update</button>

          <div className="muted" style={{ fontSize: 12 }}>
            Endpoint expected: <code>PUT /api/actions/&lt;id&gt;</code>
          </div>
        </form>
      </div>
    </div>
  );
}
