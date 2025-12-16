import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import doaService from "../services/doaService";
import {
  formatDate,
  getVersionIdentifier,
  resolveStudyName,
  getCodeLetters,
} from "../utils/doaUtils";

/**
 * Helper function to build and sort study tasks from DOA record
 * @param {Object} record - The DOA record containing version data
 * @returns {Array} Sorted array of task codes
 */
const buildStudyTasks = (record) => {
  if (!record) return [];

  let tasks = [];

  if (record.currentVersion) {
    tasks = record.currentVersion.compiledSnapshot.taskCodes || [];
  }
  if (record.pendingVersion) {
    tasks = record.pendingVersion.compiledSnapshot.taskCodes || [];
  }

  // Make a shallow copy to avoid mutating original data
  return [...tasks].sort((a, b) => {
    if (a.code < b.code) return -1;
    if (a.code > b.code) return 1;
    return 0;
  });
};

/**
 * DOAVersions Component
 * 
 * Displays a list of all DOA versions for a specific study.
 * Allows users to:
 * - View all versions (sorted by version number descending)
 * - See version metadata (created date, finalized date, status)
 * - Navigate to specific version details
 * - Download version PDFs
 * - View delegated users for the study
 * - See all study tasks across versions
 * 
 * @component
 */
function DOAVersions() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [study, setStudy] = useState(null);
  const [versions, setVersions] = useState([]);
  const [currentVersion, setCurrentVersion] = useState(null);
  const [pendingVersion, setPendingVersion] = useState(null);
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      loadStudyAndVersions();
    }
  }, [id]);

  const studyTasks = useMemo(() => buildStudyTasks(record), [record]);

  const loadStudyAndVersions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await doaService.getStudyDoa(id);
      const payload = response.data || {};
      setRecord(payload);
      setStudy(payload.studyInfo ?? null);
      const rawVersions = payload.versions ?? [];
      const sortedVersions = [...rawVersions].sort((a, b) => {
        const aValue = Number(
          a?.versionNumber ?? a?.version ?? a?.Version ?? a?.id ?? 0
        );
        const bValue = Number(
          b?.versionNumber ?? b?.version ?? b?.Version ?? b?.id ?? 0
        );
        return bValue - aValue;
      });
      setVersions(sortedVersions);
      setCurrentVersion(payload.currentVersion ?? null);
      setPendingVersion(payload.pendingVersion ?? null);
    } catch (err) {
      console.error("Error loading study and DOA versions:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load DOA versions"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleViewVersion = (version) => {
    const versionLabel = getVersionIdentifier(version);
    navigate(`/doa/${id}/version/${encodeURIComponent(versionLabel)}`);
  };

  const handleDownloadVersionPDF = async (version) => {
    const versionLabel = getVersionIdentifier(version);
    try {
      await doaService.downloadCompiledDoaLogPdf(id, { version: versionLabel });
    } catch (err) {
      console.error("Error downloading PDF:", err);
      alert("Failed to download PDF. This feature may not be implemented yet.");
    }
  };

  const handleViewDelegatedUsers = () => {
    navigate(`/doa/${id}/view`);
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
            🡠 Back to Studies
          </button>
          <h2>DOA Versions</h2>
          <p className="text-muted">
            Study: <strong>{resolveStudyName(study)}</strong> ({id})
          </p>
          {(currentVersion || pendingVersion) && (
            <div className="d-flex flex-wrap gap-2 mb-2">
              {currentVersion && (
                <span className="badge bg-success">
                  Current: v{getVersionIdentifier(currentVersion)}
                </span>
              )}
              {pendingVersion && (
                <span className="badge bg-warning text-dark">
                  Pending: v{getVersionIdentifier(pendingVersion)}
                </span>
              )}
            </div>
          )}
        </div>
        <div className="col-auto d-flex flex-column gap-2">
          <button
            className="btn btn-outline-primary"
            onClick={handleViewDelegatedUsers}>
            View Delegated Users
          </button>
        </div>
      </div>

      {versions.length === 0 ? (
        <div className="alert alert-info" role="alert">
          <h4 className="alert-heading">No DOA Versions</h4>
          <p>There are currently no DOA versions for this study.</p>
        </div>
      ) : (
        <>
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
                          <th>Created</th>
                          <th>Finalized</th>
                          <th>Status</th>
                          <th>Users</th>
                          <th>Tasks</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {versions.map((version) => {
                          const versionLabel = getVersionIdentifier(version);
                          const createdAt =
                            version?.created ??
                            version?.Created ??
                            version?.createdAt ??
                            version?.CreatedAt;
                          const finalizedAt =
                            version?.finalizedDate ??
                            version?.FinalizedDate ??
                            version?.finalizedAt ??
                            version?.FinalizedAt;
                          const isFinalized =
                            version?.isFinalized ??
                            version?.IsFinalized ??
                            false;
                          const userCount =
                            version?.usersOnStudy?.length ??
                            version?.UsersOnStudy?.length ??
                            version?.delegatedUsers?.length ??
                            version?.entries?.length ??
                            "-";
                          const taskCount =
                            version?.taskCodes?.length ??
                            version?.TaskCodes?.length ??
                            version?.entries?.length ??
                            "-";

                          return (
                            <tr key={versionLabel}>
                              <td>
                                <code>v{versionLabel}</code>
                              </td>
                              <td>{formatDate(createdAt)}</td>
                              <td>{formatDate(finalizedAt)}</td>
                              <td>
                                <span
                                  className={`badge ${
                                    isFinalized ? "bg-success" : "bg-secondary"
                                  }`}>
                                  {isFinalized ? "Finalized" : "Draft"}
                                </span>
                              </td>
                              <td>{userCount}</td>
                              <td>{taskCount}</td>
                              <td>
                                <div className="btn-group" role="group">
                                  <button
                                    className="btn btn-sm btn-primary"
                                    onClick={() => handleViewVersion(version)}>
                                    View
                                  </button>
                                  <button
                                    className="btn btn-sm btn-secondary"
                                    onClick={() =>
                                      handleDownloadVersionPDF(version)
                                    }>
                                    Download PDF
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="row mt-4">
            <div className="col">
              <div className="card">
                <div className="card-header bg-secondary text-white">
                  <h5 className="mb-0">Study Tasks</h5>
                </div>
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Code</th>
                          <th>Title</th>
                          <th>Description</th>
                          <th>Versions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studyTasks.length === 0 ? (
                          <tr>
                            <td colSpan="4" className="text-center text-muted">
                              No study tasks available.
                            </td>
                          </tr>
                        ) : (
                          studyTasks.map((task) => {
                            const taskCode = task.task.code;
                            const codeLetters = getCodeLetters(taskCode);
                            const rowClass = codeLetters
                              ? `taskcode_${codeLetters}`
                              : "";

                            return (
                              <tr key={taskCode} className={rowClass}>
                                <td>{taskCode}</td>
                                <td>{task.task.title}</td>
                                <td>
                                  {task.task.description
                                    ? task.task.description
                                    : "-"}
                                </td>
                                <td>
                                  <span className="badge rounded-pill bg-success">
                                    v{task.addedVersion}
                                  </span>
                                  {task.removedVersion && (
                                    <span className="badge rounded-pill bg-danger ms-2">
                                      v{task.removedVersion}
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default DOAVersions;
