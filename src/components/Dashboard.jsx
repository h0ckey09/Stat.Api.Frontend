import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 className="display-4">STAT Research</h1>
              {user && (
                <p className="lead">Welcome, {user.name || user.email || 'User'}</p>
              )}
            </div>
            <button onClick={handleLogout} className="btn btn-outline-danger">
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="row mt-5">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Welcome to STAT Research</h5>
              <p className="card-text">
                This is a temporary landing page. You are successfully authenticated.
              </p>
              <p className="card-text">
                <small className="text-muted">
                  User authenticated via Google OAuth
                </small>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
