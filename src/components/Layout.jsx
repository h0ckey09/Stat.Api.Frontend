import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="d-flex flex-column vh-100">
      {/* Top Banner */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container-fluid">
          <button
            className="btn btn-outline-light me-3"
            type="button"
            onClick={toggleSidebar}
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <Link className="navbar-brand" to="/dashboard">
            STAT Research
          </Link>
          <div className="ms-auto d-flex align-items-center">
            {user && (
              <span className="text-light me-3">
                {user.name || user.email || 'User'}
              </span>
            )}
            <button onClick={handleLogout} className="btn btn-outline-light">
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area with Sidebar */}
      <div className="d-flex flex-grow-1 position-relative overflow-hidden">
        {/* Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
            style={{ zIndex: 1040 }}
            onClick={closeSidebar}
          ></div>
        )}

        {/* Slide-out Sidebar */}
        <div
          className={`bg-light border-end position-absolute h-100 ${
            sidebarOpen ? 'translate-x-0' : 'translate-x-n100'
          }`}
          style={{
            width: '250px',
            transition: 'transform 0.3s ease-in-out',
            transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
            zIndex: 1050,
          }}
        >
          <div className="list-group list-group-flush">
            <Link
              to="/dashboard"
              className="list-group-item list-group-item-action"
              onClick={closeSidebar}
            >
              Dashboard
            </Link>
            <Link
              to="/source-binders"
              className="list-group-item list-group-item-action"
              onClick={closeSidebar}
            >
              Source Binders
            </Link>
            <Link
              to="/temp-logs-import"
              className="list-group-item list-group-item-action"
              onClick={closeSidebar}
            >
              Temp Logs Import
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-grow-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
