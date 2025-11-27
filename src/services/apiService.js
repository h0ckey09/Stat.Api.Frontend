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
  timeout: 15000,
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
    // Handle 401 separately for auth redirects
    if (error.response?.status === 401) {
      // Skip redirect if this request has skipAuthRedirect flag (e.g., validateSession)
      if (error.config?.skipAuthRedirect) {
        return Promise.reject(error);
      }
      // Save current location for redirect after login
      const currentPath = window.location.pathname + window.location.search + window.location.hash;
      if (!window.location.pathname.startsWith('/login')) {
        sessionStorage.setItem('redirectAfterLogin', currentPath);
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    // For all other non-2xx responses, show error toast if handler is registered
    if (error.response && window.__showErrorToast) {
      const status = error.response.status;
      const message = error.response.data?.message ||
        error.response.data?.error ||
        error.response.statusText ||
        `Request failed with status ${status}`;

      window.__showErrorToast(message);
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


  /**
 * Validate user session
 * @returns {Promise<{name: string, ...}>} user info if valid, error if not
 */
  validateSession: () => {
    return api.get(`${API_BASE_URL}/api/v1/users/ValidateSession`, {
      skipAuthRedirect: true
    });
  },


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
