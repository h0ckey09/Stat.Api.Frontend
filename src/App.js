import React from 'react';
import Header from './components/Header';

function App() {
  return (
    <div>
      <Header />
      <div className="container mt-5">
        <div className="row">
          <div className="col-12">
            <h1 className="text-primary">Stat API Frontend</h1>
            <p className="lead">
              A simple frontend for accessing some of the UI components of the API server.
            </p>
            <div className="alert alert-info" role="alert">
              <h4 className="alert-heading">Welcome!</h4>
              <p>This is a temporary frontend until Helix is done.</p>
              <hr />
              <p className="mb-0">Bootstrap 5 is loaded locally and ready to use.</p>
            </div>
            <button className="btn btn-primary me-2">Primary Button</button>
            <button className="btn btn-secondary">Secondary Button</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
