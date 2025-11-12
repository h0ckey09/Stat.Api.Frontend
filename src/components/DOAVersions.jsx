import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import studiesService from "../services/studiesService";
import doaService from "../services/doaService";

/**
 * DOAVersions Component
 * Displays a table of DOA versions for a specific study in reverse chronological order
 */
function DOAVersions() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [study, setStudy] = useState(null);
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStudyAndVersions();
  }, [id]);

  const loadStudyAndVersions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load study details to get study name and DOA versions
      const studyResponse = await studiesService.getStudy(id);
      setStudy(studyResponse.data.study);
      
      // Get DOA versions from the study data
      const doaVersions = studyResponse.data.study.STUDY_DOA_Versions || [];
      
      // Sort versions in reverse chronological order (newest first)
      const sortedVersions = [...doaVersions].sort((a, b) => {
        return new Date(b.createdAt || b.UpdatedAt) - new Date(a.createdAt || a.UpdatedAt);
      });
      
      setVersions(sortedVersions);
    } catch (err) {
      console.error("Error loading study and DOA versions:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to load DOA versions"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleView = (versionId) => {
    navigate(`/doa/${id}/view`);
  };

  const handleDownloadPDF = async (versionId) => {
    try {
      await doaService.downloadCompiledDoaLogPdf(id, { version: versionId });
    } catch (err) {
      console.error("Error downloading PDF:", err);
      alert("Failed to download PDF. This feature may not be implemented yet.");
    }
  };

  const handleBack = () => {
    navigate("/doa");
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading DOA versions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Error Loading DOA Versions</h4>
          <p>{error}</p>
          <hr />
          <button className="btn btn-danger" onClick={loadStudyAndVersions}>
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
            ← Back to Studies
          </button>
          <h2>DOA Versions</h2>
          {study && (
            <p className="text-muted">
              Study: <strong>{study.StudyName}</strong> ({study.id})
            </p>
          )}
        </div>
      </div>

      {versions.length === 0 ? (
        <div className="alert alert-info" role="alert">
          <h4 className="alert-heading">No DOA Versions</h4>
          <p>There are currently no DOA versions for this study.</p>
        </div>
      ) : (
        <div className="row">
          <div className="col">
            <div className="card">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">DOA Versions ({versions.length})</h5>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Version</th>
                        <th>Created Date</th>
                        <th>Updated Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {versions.map((version) => (
                        <tr key={version.id}>
                          <td>
                            <code>v{version.versionNumber || version.id}</code>
                          </td>
                          <td>
                            {version.createdAt
                              ? new Date(version.createdAt).toLocaleDateString()
                              : "-"}
                          </td>
                          <td>
                            {version.UpdatedAt
                              ? new Date(version.UpdatedAt).toLocaleDateString()
                              : "-"}
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                version.isFinalized
                                  ? "bg-success"
                                  : "bg-warning"
                              }`}>
                              {version.isFinalized ? "Finalized" : "Draft"}
                            </span>
                          </td>
                          <td>
                            <div className="btn-group" role="group">
                              <button
                                className="btn btn-sm btn-primary"
                                onClick={() => handleView(version.id)}>
                                View
                              </button>
                              <button
                                className="btn btn-sm btn-secondary"
                                onClick={() => handleDownloadPDF(version.id)}>
                                Download PDF
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DOAVersions;
