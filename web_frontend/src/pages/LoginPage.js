import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { toApiError } from "../services/http";

// PUBLIC_INTERFACE
export default function LoginPage() {
  /** Login page for JWT-based authentication. */
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("quality.engineer@example.com");
  const [password, setPassword] = useState("password");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (isAuthenticated) {
    navigate("/", { replace: true });
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(toApiError(err).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card" role="dialog" aria-label="Login">
        <div className="auth-hero">
          <h1>Quality Defect System</h1>
          <p>Sign in to log defects, perform RCA, assign actions, and export audit PDFs.</p>
        </div>

        <div className="auth-body">
          {error ? <div className="alert" role="alert">{error}</div> : null}

          <form className="form" onSubmit={onSubmit}>
            <div className="field">
              <div className="label">Email</div>
              <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
            </div>
            <div className="field">
              <div className="label">Password</div>
              <input
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                autoComplete="current-password"
              />
            </div>

            <div className="spread">
              <span className="muted" style={{ fontSize: 12 }}>
                Uses <code>REACT_APP_API_BASE</code>/<code>REACT_APP_BACKEND_URL</code>
              </span>
              <button className="btn btn-primary" disabled={submitting} type="submit">
                {submitting ? "Signing in…" : "Sign in"}
              </button>
            </div>

            <div className="muted" style={{ fontSize: 12 }}>
              If your backend uses a different login route, update <code>src/services/api.js</code>.
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
