import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { login, signup } from "../services/api";
import { useAuth } from "../auth/AuthContext";
import { getLastEmail, setLastEmail } from "../auth/tokenStorage";
import { useToast } from "../services/toast.jsx";

const ROLES = [
  { value: "quality_engineer", label: "Quality Engineer" },
  { value: "supervisor", label: "Supervisor" },
  { value: "admin", label: "Admin" }
];

export default function LoginPage() {
  const auth = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = React.useState("login"); // login | signup
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const [form, setForm] = React.useState({
    name: "",
    email: getLastEmail(),
    password: "",
    role: "quality_engineer"
  });

  React.useEffect(() => {
    if (auth.isAuthenticated) navigate("/", { replace: true });
  }, [auth.isAuthenticated, navigate]);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      setLastEmail(form.email);

      const payload =
        mode === "login"
          ? { email: form.email, password: form.password }
          : {
              name: form.name,
              email: form.email,
              password: form.password,
              role: form.role
            };

      const resp = mode === "login" ? await login(payload) : await signup(payload);

      auth.setSession({ token: resp.token, user: resp.user });
      toast.success("Signed in", "Welcome back. Redirecting…");

      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    } catch (err) {
      setError(err?.message || "Unable to sign in.");
      toast.error("Sign-in failed", err?.message || "Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container" style={{ maxWidth: 520, paddingTop: 46 }}>
      <div className="card" style={{ padding: 18 }}>
        <div className="col" style={{ gap: 4 }}>
          <div className="h1" style={{ fontWeight: 950 }}>
            Manufacturing Defect Management
          </div>
          <div className="h2">
            {mode === "login" ? "Sign in" : "Create an account"}
          </div>
        </div>

        <div className="row" style={{ marginTop: 14 }}>
          <button
            className={`btn ${mode === "login" ? "primary" : ""}`}
            onClick={() => setMode("login")}
            type="button"
            style={{ flex: 1 }}
          >
            Sign in
          </button>
          <button
            className={`btn ${mode === "signup" ? "secondary" : ""}`}
            onClick={() => setMode("signup")}
            type="button"
            style={{ flex: 1 }}
          >
            Sign up
          </button>
        </div>

        <form onSubmit={onSubmit} className="col" style={{ marginTop: 14 }}>
          {mode === "signup" ? (
            <div className="field">
              <div className="label">Name</div>
              <input
                className="input"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
                placeholder="e.g., Alex Kim"
              />
            </div>
          ) : null}

          <div className="field">
            <div className="label">Email</div>
            <input
              className="input"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
              placeholder="name@company.com"
              autoComplete="email"
            />
          </div>

          <div className="field">
            <div className="label">Password</div>
            <input
              className="input"
              type="password"
              value={form.password}
              onChange={(e) =>
                setForm((f) => ({ ...f, password: e.target.value }))
              }
              required
              placeholder="••••••••"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
            <div className="small">Minimum 6 characters.</div>
          </div>

          {mode === "signup" ? (
            <div className="field">
              <div className="label">Role</div>
              <select
                className="select"
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {error ? (
            <div className="card" style={{ padding: 12, borderColor: "rgba(239,68,68,0.35)", background: "rgba(239,68,68,0.08)" }}>
              <div style={{ fontWeight: 900 }}>Can’t sign in</div>
              <div className="small">{error}</div>
            </div>
          ) : null}

          <button className="btn primary" disabled={loading} type="submit">
            {loading ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>
      </div>

      <div className="small" style={{ marginTop: 14, textAlign: "center" }}>
        Factory-friendly tip: use the same email each time to speed up sign-in.
      </div>
    </div>
  );
}
