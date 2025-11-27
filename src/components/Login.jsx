import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, authModule, isLoggedIn, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const googleButtonRef = useRef(null);

  // If already logged in, redirect immediately
  useEffect(() => {
    if (!authLoading && isLoggedIn) {
      const redirectPath = sessionStorage.getItem("redirectAfterLogin");
      if (redirectPath && redirectPath !== "/login") {
        sessionStorage.removeItem("redirectAfterLogin");
        navigate(redirectPath);
      } else {
        navigate("/dashboard");
      }
    }
  }, [isLoggedIn, authLoading, navigate]);

  useEffect(() => {
    // Render Google Sign-In button when Auth module is ready
    if (authModule && googleButtonRef.current) {
      authModule
        .renderGoogleLogin(googleButtonRef.current, {
          theme: "outline",
          size: "large",
          text: "signin_with",
        })
        .catch((err) => {
          console.error("Failed to render Google button:", err);
          setError("Failed to initialize Google Sign-In");
        });

      // Listen for successful authentication
      const handleAuthChange = (event) => {
        if (event.detail && event.detail.loggedIn) {
          const redirectPath = sessionStorage.getItem("redirectAfterLogin");
          if (redirectPath && redirectPath !== "/login") {
            sessionStorage.removeItem("redirectAfterLogin");
            navigate(redirectPath);
          } else {
            navigate("/dashboard");
          }
        }
      };

      window.addEventListener("authStateChanged", handleAuthChange);
      return () =>
        window.removeEventListener("authStateChanged", handleAuthChange);
    }
  }, [authModule, navigate]);

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);

    const result = await login();

    if (result.success) {
      // Check for redirectAfterLogin
      const redirectPath = sessionStorage.getItem("redirectAfterLogin");
      if (redirectPath && redirectPath !== "/login") {
        sessionStorage.removeItem("redirectAfterLogin");
        navigate(redirectPath);
      } else {
        navigate("/dashboard");
      }
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "80vh" }}>
      <div
        className="card shadow"
        style={{ width: "100%", maxWidth: "400px", padding: "2rem" }}>
        <h1 className="text-center mb-4">Login</h1>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <div className="text-center mb-3">
          <p className="text-muted">
            Sign in with your Google account to access STAT Research
          </p>
        </div>

        {/* Google Sign-In Button Container */}
        <div
          ref={googleButtonRef}
          className="d-flex justify-content-center mb-3"></div>

        {/* Fallback manual login button */}
        <div className="text-center">
          <button
            onClick={handleGoogleLogin}
            className="btn btn-outline-primary"
            disabled={loading || !authModule}>
            {loading ? (
              <span>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"></span>
                Signing in...
              </span>
            ) : (
              "Sign in with Google (Manual)"
            )}
          </button>
        </div>

        <div className="text-center mt-4">
          <small className="text-muted">
            Enter your credentials to access the Stat API
          </small>
        </div>
      </div>
    </div>
  );
};

export default Login;
