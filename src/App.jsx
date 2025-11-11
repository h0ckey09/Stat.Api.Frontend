import React from 'react'
import './App.css'

function App() {
  return (
    <div className="App">
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container-fluid">
          <a className="navbar-brand" href="#">Stat API Frontend</a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav">
              <li className="nav-item">
                <a className="nav-link active" href="#">Home</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">Features</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">About</a>
              </li>
            </ul>
          </div>
        </div>
      </nav>

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
                <h5 className="card-title">Feature 1</h5>
                <p className="card-text">Some quick example text to build on the card title.</p>
                <a href="#" className="btn btn-primary">Learn more</a>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Feature 2</h5>
                <p className="card-text">Some quick example text to build on the card title.</p>
                <a href="#" className="btn btn-primary">Learn more</a>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Feature 3</h5>
                <p className="card-text">Some quick example text to build on the card title.</p>
                <a href="#" className="btn btn-primary">Learn more</a>
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
    </div>
  )
}

export default App
