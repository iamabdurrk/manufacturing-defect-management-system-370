import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { apiSignup } from "../services/api";
import { toApiError } from "../services/http";

function extractAuthToken(data) {
  return (
    data?.access_token ||
    data?.token ||
    data?.jwt ||
    data?.data?.access_token ||
    data?.data?.token ||
    ""
  );
}

// PUBLIC_INTERFACE
export default function LoginPage() {
  /** Login + Signup page for JWT-based authentication. */
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState("signin"); // 'signin' | 'signup'

  const [name, setName] = useState("Quality Engineer");
  const [role, setRole] = useState("quality_engineer");

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
      if (mode === "signin") {
        await login(email.trim(), password);
        navigate("/", { replace: true });
        return;
      }

      // Signup mode
      const data = await apiSignup({
        name: name.trim(),
        email: email.trim(),
        password,
        role
      });

      // If backend returns a token on signup (it does per OpenAPI), store it by
      // using the same key AuthContext expects.
      const token = extractAuthToken(data);
      if (token) {
        try {
          localStorage.setItem("auth_token", token);
        } catch {
          // ignore
        }
        navigate("/", { replace: true });
        return;
      }

      // Fallback: if no token returned, try signing in.
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
      <div className="auth-card" role="dialog" aria-label="Authentication">
        <div className="auth-hero">
          <h1>Quality Defect System</h1>
          <p>Sign in to log defects, perform RCA, assign actions, and export audit PDFs.</p>
        </div>

        <div className="auth-body">
          {error ? (
            <div className="alert" role="alert">
              {error}
            </div>
          ) : null}

          <div className="spread" style={{ marginBottom: 10 }}>
            <div className="inline">
              <button
                type="button"
                className={`btn ${mode === "signin" ? "btn-primary" : ""}`}
                onClick={() => {
                  setError("");
                  setMode("signin");
                }}
              >
                Sign in
              </button>
              <button
                type="button"
                className={`btn ${mode === "signup" ? "btn-primary" : ""}`}
                onClick={() => {
                  setError("");
                  setMode("signup");
                }}
              >
                Sign up
              </button>
            </div>

            <span className="muted" style={{ fontSize: 12 }}>
              Uses <code>REACT_APP_API_BASE</code>/<code>REACT_APP_BACKEND_URL</code>
            </span>
          </div>

          <form className="form" onSubmit={onSubmit}>
            {mode === "signup" ? (
              <>
                <div className="field">
                  <div className="label">Name</div>
                  <input
                    className="input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    required
                  />
                </div>

                <div className="field">
                  <div className="label">Role</div>
                  <select className="select" value={role} onChange={(e) => setRole(e.target.value)}>
                    <option value="quality_engineer">Quality engineer</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </>
            ) : null}

            <div className="field">
              <div className="label">Email</div>
              <input
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
              />
            </div>

            <div className="field">
              <div className="label">Password</div>
              <input
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                required
              />
              {mode === "signup" ? (
                <div className="muted" style={{ fontSize: 12 }}>
                  Minimum 6 characters (per backend validation).
                </div>
              ) : null}
            </div>

            <div className="spread">
              <div className="muted" style={{ fontSize: 12 }}>
                {mode === "signup" ? (
                  <>
                    Creates account via <code>POST /api/auth/signup</code>
                  </>
                ) : (
                  <>
                    Signs in via <code>POST /api/auth/login</code>
                  </>
                )}
              </div>

              <button className="btn btn-primary" disabled={submitting} type="submit">
                {submitting
                  ? mode === "signup"
                    ? "Creating account…"
                    : "Signing in…"
                  : mode === "signup"
                    ? "Create account"
                    : "Sign in"}
              </button>
            </div>

            <div className="muted" style={{ fontSize: 12 }}>
              If your backend uses different auth routes, update <code>src/services/api.js</code>.
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
