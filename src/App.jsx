import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import SourceBinders from "./components/SourceBinders";
import TempLogsImport from "./components/TempLogsImport";
import DOA from "./components/DOA";
import DOAVersions from "./components/DOAVersions";
import DOAView from "./components/DOAView";
import Layout from "./components/Layout";
import "./App.css";

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, loading } = useAuth();

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "100vh" }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return isLoggedIn ? (
    <Layout>{children}</Layout>
  ) : (
    <Navigate to="/login" replace />
  );
};

function AppContent() {
  return (
    <div className="App">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/source-binders"
          element={
            <ProtectedRoute>
              <SourceBinders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/temp-logs-import"
          element={
            <ProtectedRoute>
              <TempLogsImport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doa"
          element={
            <ProtectedRoute>
              <DOA />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doa/:id"
          element={
            <ProtectedRoute>
              <DOAVersions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doa/:id/view"
          element={
            <ProtectedRoute>
              <DOAView />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
