import axios from 'axios';

// Endpoints - auto-detect API server or use configured base
var API_BASE_URL = (function () {
  // If we're on localhost:5500 (VS Code Live Server), point to the API server
  if (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost') {
    // Check if we're on a non-standard port (like 5500 for Live Server)

    return 'http://localhost:3001'; // Default API server port

  }
  // Otherwise use relative paths (same origin)
  return '';
})();

// Create axios instance with default config
// Send authentication token if available
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    // Try to get token from Auth module first, then fall back to sessionStorage
    let token = null;
    if (window.Auth && typeof window.Auth.getLocalToken === 'function') {
      token = window.Auth.getLocalToken();
    }
    if (!token) {
      token = sessionStorage.getItem('statSessionToken');
    }
    if (!token) {
      token = localStorage.getItem('authToken');
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      //localStorage.removeItem('authToken');
      //window.location.href = '/login';
      window.alert('Got a 401 from the server..??');
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  // Authentication
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),

  // User management
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),

  // Generic API methods for exploration
  get: (endpoint) => api.get(endpoint),
  post: (endpoint, data) => api.post(endpoint, data),
  put: (endpoint, data) => api.put(endpoint, data),
  delete: (endpoint) => api.delete(endpoint),

  // Method to discover available endpoints
  discoverEndpoints: async () => {
    try {
      // Try common API discovery endpoints
      const endpoints = [
        '/api',
        '/api/v1',
        '/health',
        '/status',
        '/docs',
        '/swagger',
        '/openapi.json'
      ];

      const results = [];

      for (const endpoint of endpoints) {
        try {
          const response = await api.get(endpoint);
          results.push({ endpoint, status: 'success', data: response.data });
        } catch (error) {
          results.push({
            endpoint,
            status: 'error',
            error: error.response?.status || error.message
          });
        }
      }

      return results;
    } catch (error) {
      console.error('Error discovering endpoints:', error);
      return [];
    }
  }
};

export default api;
