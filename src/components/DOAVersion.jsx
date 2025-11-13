import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import doaService from "../services/doaService";

/**
 * DOAVersion Component
 * Displays/edits a specific DOA version
 */
function DOAVersion() {
  const { id, versionNumber } = useParams();
  const navigate = useNavigate();
  const [doaData, setDoaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDOAVersion();
  }, [id, versionNumber]);

  const loadDOAVersion = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load the DOA version data
      const response = await doaService.getDoaSnapshotVersion(id);
      setDoaData(response.data);
    } catch (err) {
      console.error("Error loading DOA version:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to load DOA version"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(`/doa/${id}`);
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading DOA version...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Error Loading DOA Version</h4>
          <p>{error}</p>
          <hr />
          <button className="btn btn-danger" onClick={loadDOAVersion}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row mb-3">
        <div className="col">
          <button className="btn btn-secondary mb-3" onClick={handleBack}>
            ← Back to DOA Versions
          </button>
          <h2>DOA Version {versionNumber}</h2>
          <p className="text-muted">
            Study ID: <code>{id}</code>
          </p>
        </div>
      </div>

      {doaData ? (
        <div className="row">
          <div className="col">
            <div className="card">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">DOA Version Details</h5>
              </div>
              <div className="card-body">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <strong>Version Number:</strong> {versionNumber}
                  </div>
                  <div className="col-md-6">
                    <strong>Study ID:</strong> {id}
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-12">
                    <pre className="bg-light p-3 rounded">
                      {JSON.stringify(doaData, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="alert alert-info" role="alert">
          <h4 className="alert-heading">No Data Available</h4>
          <p>Unable to load DOA version data.</p>
        </div>
      )}
    </div>
  );
}

export default DOAVersion;
