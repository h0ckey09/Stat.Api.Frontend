import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import doaService from "../services/doaService";

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString();
};

const resolveDisplayName = (user) => {
  if (!user) return "Unknown";
  return (
    (user.displayName ??
    user.name ??
    `${user.FirstName ?? ""} ${user.LastName ?? ""}`.trim()) ||
    "-"
  );
};

const resolveRole = (user) =>
  user?.titleOrRole ?? user?.Title ?? user?.role ?? user?.Role ?? "-";

function DOAView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      loadDOAData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadDOAData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await doaService.getStudyDoa(id);
      setRecord(response.data || null);
    } catch (err) {
      console.error("Error loading DOA data:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to load DOA data"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(`/doa/${id}`);
  };

  const handleAddTask = () => {
    alert("Add Task is not implemented yet.");
  };

  const handleAddDelegate = () => {
    alert("Add Delegate is not implemented yet.");
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading DOA details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Error Loading DOA</h4>
          <p>{error}</p>
          <hr />
          <button className="btn btn-danger" onClick={loadDOAData}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  const studyInfo =
    record?.studyInfo ??
    record?.StudyInfo ??
    record?.study ??
    record?.Study ??
    {};
  const currentVersion =
    record?.currentVersion ??
    record?.CurrentVersion ??
    record?.versions?.find((v) => v?.isFinalized || v?.IsFinalized) ??
    record?.versions?.[0] ??
    null;
  const versionSnapshot =
    currentVersion?.compiledSnapshot ??
    currentVersion?.CompiledSnapshot ??
    currentVersion ??
    null;
  const entries =
    versionSnapshot?.entries ??
    versionSnapshot?.Entries ??
    versionSnapshot?.assignments ??
    [];
  const taskSnapshot =
    versionSnapshot?.taskCodes ??
    versionSnapshot?.TaskCodes ??
    versionSnapshot?.tasks ??
    [];

  return (
    <div className="container mt-4">
      <div className="row mb-2">
        <div className="col">
          <h2>DOA Study Details</h2>
          <p className="text-muted mb-0">
            Study: <strong>{studyInfo?.studyName ?? studyInfo?.StudyName}</strong>{" "}
            (ID: <code>{id}</code>)
          </p>
          <small className="text-muted">Menu Actions</small>
        </div>
        <div className="col-auto d-flex flex-wrap gap-2">
          <button className="btn btn-outline-primary" onClick={handleAddTask}>
            Add Task
          </button>
          <button className="btn btn-outline-primary" onClick={handleAddDelegate}>
            Add Delegate
          </button>
          <button className="btn btn-secondary" onClick={handleBack}>
            Back to DOA Versions
          </button>
        </div>
      </div>

      <div className="row gy-3">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">Current Version</h5>
            </div>
            <div className="card-body">
              <p className="mb-1">
                <strong>Version:</strong>{" "}
                {currentVersion?.versionNumber ??
                  currentVersion?.version ??
                  currentVersion?.Version ??
                  "-"}
              </p>
              <p className="mb-1">
                <strong>Created:</strong>{" "}
                {formatDate(currentVersion?.created ?? currentVersion?.Created)}
              </p>
              <p className="mb-1">
                <strong>Finalized:</strong>{" "}
                {formatDate(
                  currentVersion?.finalizedDate ?? currentVersion?.FinalizedDate
                )}
              </p>
              <p className="mb-0">
                <strong>Status:</strong>{" "}
                {currentVersion?.isFinalized || currentVersion?.IsFinalized
                  ? "Finalized"
                  : "Draft"}
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card">
            <div className="card-header bg-secondary text-white">
              <h5 className="mb-0">Study Details</h5>
            </div>
            <div className="card-body">
              <p className="mb-1">
                <strong>Protocol:</strong>{" "}
                {studyInfo?.protocolNameOfficial ??
                  studyInfo?.protocolName ??
                  "-"}
              </p>
              <p className="mb-1">
                <strong>Sponsor:</strong>{" "}
                {studyInfo?.sponsorName ?? studyInfo?.Sponsor ?? "-"}
              </p>
              <p className="mb-1">
                <strong>PI:</strong>{" "}
                {studyInfo?.piName ??
                  studyInfo?.PI ??
                  studyInfo?.pi ??
                  "-"}
              </p>
              <p className="mb-0">
                <strong>Last Updated:</strong>{" "}
                {formatDate(studyInfo?.updatedAt ?? studyInfo?.UpdatedAt)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="row gy-3 mt-4">
        <div className="col">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">Delegations ({entries.length})</h5>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Name</th>
                      <th>Task</th>
                      <th>Action</th>
                      <th>Assigned</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center text-muted">
                          No delegation entries found for this version.
                        </td>
                      </tr>
                    ) : (
                      entries.map((entry, index) => {
                        const user = entry?.user;
                        const task = entry?.task;
                        const action =
                          entry?.isRemoval || entry?.IsRemoval
                            ? "Removed"
                            : "Assigned";
                        const assignedAt =
                          entry?.createdAt ??
                          entry?.CreatedAt ??
                          entry?.assignedAt ??
                          entry?.AssignedAt;

                        return (
                          <tr key={entry?.entryId ?? entry?.EntryId ?? index}>
                            <td>
                              <strong>{resolveDisplayName(user)}</strong>
                              <div className="text-muted small">
                                {resolveRole(user)}
                              </div>
                            </td>
                            <td>
                              <div>
                                <strong>
                                  {task?.code ?? task?.Code ?? "-"}
                                </strong>
                              </div>
                              <small className="text-muted">
                                {task?.title ?? task?.Title ?? "-"}
                              </small>
                            </td>
                            <td>{action}</td>
                            <td>{formatDate(assignedAt)}</td>
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

      <div className="row gy-3 mt-3">
        <div className="col">
          <div className="card">
            <div className="card-header bg-warning text-dark">
              <h5 className="mb-0">Task Codes ({taskSnapshot.length})</h5>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-sm mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Code</th>
                      <th>Title</th>
                      <th>Description</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {taskSnapshot.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center text-muted">
                          No task codes defined for this version.
                        </td>
                      </tr>
                    ) : (
                      taskSnapshot.map((task, index) => (
                        <tr
                          key={task?.taskId ?? task?.TaskId ?? task?.code ?? index}>
                          <td>{task?.code ?? task?.Code ?? "-"}</td>
                          <td>{task?.title ?? task?.Title ?? "-"} </td>
                          <td>{task?.description ?? task?.Description ?? "-"}</td>
                          <td>
                            {task?.isRemoved || task?.IsRemoved ? (
                              <span className="badge bg-danger text-dark">
                                Removed
                              </span>
                            ) : (
                              <span className="badge bg-success">Active</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DOAView;
