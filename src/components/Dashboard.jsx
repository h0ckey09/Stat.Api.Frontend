import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <h1 className="display-4">Dashboard</h1>
          {user && (
            <p className="lead">Welcome, {user.name || user.email || 'User'}</p>
          )}
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Welcome to STAT Research</h5>
              <p className="card-text">
                This is your dashboard. You are successfully authenticated.
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
