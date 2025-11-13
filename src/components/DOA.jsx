import React, { useState, useEffect } from 'react';
import studiesService from '../services/studiesService';

// Mock data for demo purposes when API is not available
const MOCK_STUDIES = [
  {
    id: 'STUDY-001',
    name: 'Clinical Trial Phase III',
    description: 'A randomized, double-blind study evaluating treatment efficacy',
    protocolNumber: 'PROTO-2024-001',
    sponsor: 'Research Institute',
    status: 'active',
    owner: {
      id: 'user1',
      name: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@example.com'
    },
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 'STUDY-002',
    name: 'Observational Study - Cardiovascular',
    description: 'Long-term observational study on cardiovascular outcomes',
    protocolNumber: 'PROTO-2024-002',
    sponsor: 'Heart Health Foundation',
    status: 'active',
    owner: {
      id: 'user2',
      name: 'Dr. Michael Chen',
      email: 'michael.chen@example.com'
    },
    updatedAt: '2024-02-20T14:45:00Z'
  },
  {
    id: 'STUDY-003',
    name: 'Pediatric Vaccine Trial',
    description: 'Safety and efficacy study of new pediatric vaccine formulation',
    protocolNumber: 'PROTO-2024-003',
    sponsor: 'Vaccine Research Group',
    status: 'active',
    owner: {
      id: 'user3',
      name: 'Dr. Emily Rodriguez',
      email: 'emily.rodriguez@example.com'
    },
    updatedAt: '2024-03-01T09:15:00Z'
  }
];

/**
 * DOA (Delegation of Authority) Component
 * First screen: Table of all active studies
 */
function DOA() {
  const [studies, setStudies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [useDemoMode, setUseDemoMode] = useState(false);

  useEffect(() => {
    loadActiveStudies();
  }, []);

  const loadActiveStudies = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await studiesService.getActiveStudies();
      setStudies(response.data.studies || []);
      setUseDemoMode(false);
    } catch (err) {
      console.error('Error loading active studies:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load studies');
    } finally {
      setLoading(false);
    }
  };

  const loadDemoData = () => {
    setStudies(MOCK_STUDIES);
    setError(null);
    setUseDemoMode(true);
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
          <div className="d-flex gap-2">
            <button className="btn btn-danger" onClick={loadActiveStudies}>
              Retry
            </button>
            <button className="btn btn-secondary" onClick={loadDemoData}>
              Load Demo Data
            </button>
          </div>
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
          {useDemoMode && (
            <div className="alert alert-warning" role="alert">
              <strong>Demo Mode:</strong> Showing sample data. Connect to API server to see real studies.
            </div>
          )}
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
