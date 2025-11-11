import axios from 'axios';

const BASE_URL = 'https://www.statresearch.com:3001';

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
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
      localStorage.removeItem('authToken');
      window.location.href = '/login';
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
