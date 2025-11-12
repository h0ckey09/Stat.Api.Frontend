import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import './App.css'
import DOA from './components/DOA'

function Home() {
  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-12">
          <h1 className="display-4">Welcome to Stat API Frontend</h1>
          <p className="lead">A simple frontend for accessing UI components of the API server.</p>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Delegation of Authority</h5>
              <p className="card-text">Manage study DOA settings and permissions.</p>
              <Link to="/doa" className="btn btn-primary">Go to DOA</Link>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Studies</h5>
              <p className="card-text">View and manage research studies.</p>
              <a href="#" className="btn btn-primary">Coming Soon</a>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Source Binders</h5>
              <p className="card-text">Access and manage source documentation.</p>
              <a href="#" className="btn btn-primary">Coming Soon</a>
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-5">
        <div className="col-12">
          <div className="alert alert-info" role="alert">
            This is a temporary frontend until Helix is completed.
          </div>
        </div>
      </div>
    </div>
  )
}

function NavBar() {
  const location = useLocation()
  
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">Stat API Frontend</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link className={`nav-link ${location.pathname === '/' ? 'active' : ''}`} to="/">Home</Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${location.pathname === '/doa' ? 'active' : ''}`} to="/doa">DOA</Link>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">About</a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}

function App() {
  return (
    <Router>
      <div className="App">
        <NavBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/doa" element={<DOA />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
