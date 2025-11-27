import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const counterRef = useRef(0);

  const removeToast = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message, options = {}) => {
      const {
        title = "",
        variant = "primary", // primary | success | danger | warning | info | secondary | dark | light
        delay = 4000, // ms
        autohide = true,
      } = options;

      const id = ++counterRef.current;
      const toast = { id, title, message, variant };
      setToasts((list) => [...list, toast]);

      if (autohide && delay > 0) {
        setTimeout(() => removeToast(id), delay);
      }

      return id;
    },
    [removeToast]
  );

  const api = useMemo(
    () => ({
      show: showToast,
      success: (msg, opts = {}) =>
        showToast(msg, { ...opts, variant: "success" }),
      error: (msg, opts = {}) => showToast(msg, { ...opts, variant: "danger" }),
      warning: (msg, opts = {}) =>
        showToast(msg, { ...opts, variant: "warning" }),
      info: (msg, opts = {}) => showToast(msg, { ...opts, variant: "info" }),
      remove: removeToast,
    }),
    [showToast, removeToast]
  );

  // Register global error toast handler for API interceptor
  useEffect(() => {
    window.__showErrorToast = (message) => {
      api.error(message);
    };
    return () => {
      delete window.__showErrorToast;
    };
  }, [api]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      {/* Toast container (top right) */}
      <div
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: "fixed",
          top: "16px",
          right: "16px",
          zIndex: 1080,
          width: "auto",
          maxWidth: "400px",
        }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
          }}>
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`toast show text-bg-${t.variant} mb-2`}
              role="alert"
              aria-live="assertive"
              aria-atomic="true"
              style={{ width: "100%", maxWidth: "400px" }}>
              {(t.title || true) && (
                <div className="toast-header">
                  <strong className="me-auto">
                    {t.title ||
                      (t.variant === "danger"
                        ? "Error"
                        : t.variant.charAt(0).toUpperCase() +
                          t.variant.slice(1))}
                  </strong>
                  <button
                    type="button"
                    className="btn-close ms-2 mb-1"
                    onClick={() => removeToast(t.id)}
                    aria-label="Close"></button>
                </div>
              )}
              <div className="toast-body">{t.message}</div>
            </div>
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  const ctx = useContext(ToastContext);
  if (!ctx)
    throw new Error("useToastContext must be used within a ToastProvider");
  return ctx;
}

export default ToastProvider;
