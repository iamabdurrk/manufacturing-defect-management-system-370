const TOKEN_KEY = "mdms_token";
const USER_KEY = "mdms_user";
const LAST_EMAIL_KEY = "mdms_last_email";

// PUBLIC_INTERFACE
export function getToken() {
  /** Get stored JWT token (or null). */
  return localStorage.getItem(TOKEN_KEY);
}

// PUBLIC_INTERFACE
export function setAuth({ token, user }) {
  /** Persist token + user for subsequent API calls. */
  if (token) localStorage.setItem(TOKEN_KEY, token);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
}

// PUBLIC_INTERFACE
export function clearAuth() {
  /** Clear stored auth data. */
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// PUBLIC_INTERFACE
export function getUser() {
  /** Get stored user object (or null). */
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// PUBLIC_INTERFACE
export function setLastEmail(email) {
  /** Persist last-used email to reduce typing on shared terminals. */
  if (email) localStorage.setItem(LAST_EMAIL_KEY, email);
}

// PUBLIC_INTERFACE
export function getLastEmail() {
  /** Get last-used email if present. */
  return localStorage.getItem(LAST_EMAIL_KEY) || "";
}
