import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import doaService from "../services/doaService";

/**
 * DOAView Component
 * Displays the delegated users for a specific study
 */
function DOAView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doaData, setDoaData] = useState(null);
  const [delegatedUsers, setDelegatedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDOAData();
  }, [id]);

  const loadDOAData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load current finalized DOA for the study to get delegated users
      const response = await doaService.getCurrentFinalizedDoaForStudy(id);
      setDoaData(response.data);
      
      // Extract delegated users from the DOA data
      // The structure may vary, so we handle different possible formats
      const users = response.data.delegatedUsers || 
                    response.data.users || 
                    response.data.DOA_Users || 
                    [];
      
      setDelegatedUsers(users);
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

  return (
    <div className="container mt-4">
      <div className="row mb-3">
        <div className="col">
          <button className="btn btn-secondary mb-3" onClick={handleBack}>
            ← Back to DOA Versions
          </button>
          <h2>Delegated Users</h2>
          <p className="text-muted">
            Study ID: <code>{id}</code>
          </p>
        </div>
      </div>

      {delegatedUsers.length === 0 ? (
        <div className="alert alert-info" role="alert">
          <h4 className="alert-heading">No Delegated Users</h4>
          <p>There are no users delegated on this study.</p>
        </div>
      ) : (
        <div className="row">
          <div className="col">
            <div className="card">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">
                  Delegated Users ({delegatedUsers.length})
                </h5>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Name</th>
                        <th>Title</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Date Added</th>
                      </tr>
                    </thead>
                    <tbody>
                      {delegatedUsers.map((user, index) => (
                        <tr key={user.id || index}>
                          <td>
                            <strong>
                              {user.displayName || 
                               user.name || 
                               `${user.FirstName || ''} ${user.LastName || ''}`.trim() ||
                               "-"}
                            </strong>
                          </td>
                          <td>{user.title || user.Title || "-"}</td>
                          <td>
                            {user.email || user.Email ? (
                              <a href={`mailto:${user.email || user.Email}`}>
                                {user.email || user.Email}
                              </a>
                            ) : (
                              "-"
                            )}
                          </td>
                          <td>
                            {user.role || user.Role ? (
                              <span className="badge bg-info">
                                {user.role || user.Role}
                              </span>
                            ) : (
                              "-"
                            )}
                          </td>
                          <td>
                            {user.addedAt || user.createdAt || user.CreatedAt
                              ? new Date(
                                  user.addedAt || user.createdAt || user.CreatedAt
                                ).toLocaleDateString()
                              : "-"}
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

      {doaData && (
        <div className="row mt-4">
          <div className="col">
            <div className="alert alert-info" role="alert">
              <strong>Note:</strong> This table shows users who have been
              delegated authority on this study. Any changes require approval
              from the study owner or administrator.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DOAView;
