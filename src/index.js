import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './assets/css/bootstrap.min.css';
import './assets/js/bootstrap.bundle.min.js';
import './styles/main.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
