import React, { useState, useEffect } from 'react';
import studiesService from '../services/studiesService';

/**
 * DOA (Delegation of Authority) Component
 * First screen: Table of all active studies
 */
function DOA() {
  const [studies, setStudies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadActiveStudies();
  }, []);

  const loadActiveStudies = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await studiesService.getActiveStudies();
      setStudies(response.data.studies || []);
    } catch (err) {
      console.error('Error loading active studies:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load studies');
    } finally {
      setLoading(false);
    }
  };

  const handleStudyClick = (studyId) => {
    // TODO: Navigate to DOA details for the selected study
    console.log('Selected study:', studyId);
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading active studies...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Error Loading Studies</h4>
          <p>{error}</p>
          <hr />
          <button className="btn btn-danger" onClick={loadActiveStudies}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row mb-4">
        <div className="col">
          <h2>Delegation of Authority (DOA)</h2>
          <p className="text-muted">Select a study to manage its delegation of authority</p>
        </div>
      </div>

      {studies.length === 0 ? (
        <div className="alert alert-info" role="alert">
          <h4 className="alert-heading">No Active Studies</h4>
          <p>There are currently no active studies available.</p>
        </div>
      ) : (
        <div className="row">
          <div className="col">
            <div className="card">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">Active Studies ({studies.length})</h5>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Study ID</th>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Protocol Number</th>
                        <th>Owner</th>
                        <th>Last Updated</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studies.map((study) => (
                        <tr key={study.id}>
                          <td>
                            <code>{study.id}</code>
                          </td>
                          <td>
                            <strong>{study.name}</strong>
                          </td>
                          <td>
                            {study.description ? (
                              <span className="text-truncate d-inline-block" style={{ maxWidth: '300px' }}>
                                {study.description}
                              </span>
                            ) : (
                              <span className="text-muted fst-italic">No description</span>
                            )}
                          </td>
                          <td>{study.protocolNumber || '-'}</td>
                          <td>
                            {study.owner ? (
                              <div>
                                <div>{study.owner.name}</div>
                                <small className="text-muted">{study.owner.email}</small>
                              </div>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td>
                            {study.updatedAt
                              ? new Date(study.updatedAt).toLocaleDateString()
                              : '-'}
                          </td>
                          <td>
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => handleStudyClick(study.id)}
                            >
                              Manage DOA
                            </button>
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

      <div className="row mt-4">
        <div className="col">
          <div className="alert alert-info" role="alert">
            <strong>Note:</strong> This table shows only active studies. Click "Manage DOA" to view 
            and modify delegation of authority settings for a specific study.
          </div>
        </div>
      </div>
    </div>
  );
}

export default DOA;
