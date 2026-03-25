import React from "react";

const ToastContext = React.createContext(null);

// PUBLIC_INTERFACE
export function ToastProvider({ children }) {
  /** Provider for toast notifications. */
  const [toasts, setToasts] = React.useState([]);

  const push = React.useCallback((toast) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const next = { id, variant: "info", title: "Info", message: "", ...toast };
    setToasts((t) => [next, ...t].slice(0, 4));
    window.setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 3600);
  }, []);

  const api = React.useMemo(
    () => ({
      success: (title, message) => push({ variant: "success", title, message }),
      error: (title, message) => push({ variant: "error", title, message }),
      info: (title, message) => push({ variant: "info", title, message })
    }),
    [push]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toastHost" aria-live="polite" aria-relevant="additions">
        {toasts.map((t) => (
          <div key={t.id} className="toast" role="status">
            <div className="toastTitle">{t.title}</div>
            <div className="toastMsg">{t.message}</div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// PUBLIC_INTERFACE
export function useToast() {
  /** Hook to access toast API. */
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
