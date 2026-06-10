import axios from 'axios';

/**
 * Axios instance configured for Finance Dashboard API
 * Base URL: http://localhost:8081/api
 * 
 * Features:
 * - Automatic JWT token attachment from localStorage
 * - Request/Response interceptors
 * - Centralized error handling (401, 403)
 */
// Use environment variable for API URL or default to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

/**
 * Request Interceptor
 * - Attaches JWT token from localStorage to Authorization header
 * - Adds timestamp for request tracking
 */
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('authToken');
    
    // Add Bearer token to headers if it exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Optional: Add request timestamp for debugging
    config.headers['X-Request-ID'] = `${Date.now()}-${Math.random()}`;

    return config;
  },
  (error) => {
    // Handle request errors
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * - Handles error responses
 * - 401: Unauthorized - Clear auth and redirect to login
 * - 403: Forbidden - Show permission denied message
 * - Other errors: Log and pass through
 */
axiosInstance.interceptors.response.use(
  (response) => {
    // Return successful responses as-is
    return response;
  },
  (error) => {
    const { response, config } = error;

    // Log error for debugging
    console.error('API Error:', {
      status: response?.status,
      statusText: response?.statusText,
      message: response?.data?.message,
      url: config?.url,
      method: config?.method,
    });

    // Handle specific error status codes
    if (response) {
      switch (response.status) {
        // 401 Unauthorized - Token invalid or expired
        case 401:
          console.warn('Unauthorized access (401) - Redirecting to login');
          
          // Clear auth data
          localStorage.removeItem('authToken');
          localStorage.removeItem('userData');
          
          // Show notification (optional)
          const message = response.data?.message || 'Your session has expired. Please login again.';
          
          // Create and dispatch custom event for auth error
          window.dispatchEvent(new CustomEvent('authError', { detail: { message } }));
          
          // Redirect to login only if not already on login page
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
          break;

        // 403 Forbidden - User lacks permissions
        case 403:
          console.warn('Forbidden access (403)');
          
          // Create and dispatch custom event for permission error
          const forbiddenMessage = response.data?.message || 'You do not have permission to access this resource.';
          window.dispatchEvent(new CustomEvent('permissionError', { detail: { message: forbiddenMessage } }));
          break;

        // 400 Bad Request
        case 400:
          console.error('Bad request (400):', response.data);
          break;

        // 404 Not Found
        case 404:
          console.error('Resource not found (404):', response.data);
          break;

        // 500 Server Error
        case 500:
          console.error('Server error (500):', response.data);
          break;

        // Other errors
        default:
          console.error(`API Error (${response.status}):`, response.data);
      }
    } else if (error.request) {
      // Request made but no response received (network error)
      console.error('Network error - No response from server:', error.request);
      window.dispatchEvent(new CustomEvent('networkError', { 
        detail: { message: 'Network error - Please check your connection.' } 
      }));
    } else {
      // Error in request setup
      console.error('Error setting up request:', error.message);
    }

    // Return rejected promise to allow calling code to handle errors
    return Promise.reject(error);
  }
);

/**
 * Helper methods for common API operations
 */

// GET request
const get = (url, config = {}) => axiosInstance.get(url, config);

// POST request
const post = (url, data = {}, config = {}) => axiosInstance.post(url, data, config);

// PUT request
const put = (url, data = {}, config = {}) => axiosInstance.put(url, data, config);

// PATCH request
const patch = (url, data = {}, config = {}) => axiosInstance.patch(url, data, config);

// DELETE request
const remove = (url, config = {}) => axiosInstance.delete(url, config);

/**
 * API endpoints collection (optional - for better organization)
 */
const endpoints = {
  // Auth endpoints
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
  },
  // Account endpoints
  accounts: {
    list: '/accounts',
    detail: (id) => `/accounts/${id}`,
    create: '/accounts',
    update: (id) => `/accounts/${id}`,
    delete: (id) => `/accounts/${id}`,
  },
  // Transaction endpoints
  transactions: {
    base: '/transactions',
    list: '/transactions',
    transfer: '/transactions/transfer',
    export: '/transactions/export',
    byAccount: (id) => `/transactions/account/${id}`,
    detail: (id) => `/transactions/${id}`,
    create: '/transactions',
    update: (id) => `/transactions/${id}`,
    delete: (id) => `/transactions/${id}`,
  },
  // User endpoints
  users: {
    profile: '/users/profile',
    update: '/users/profile',
    delete: '/users/profile',
  },
  // Goal endpoints
  goals: {
    list: '/goals',
    create: '/goals',
    update: (id) => `/goals/${id}`,
    delete: (id) => `/goals/${id}`,
  },
  // Analytics endpoints
  analytics: {
    dashboard: '/analytics/dashboard',
    spending: '/analytics/spending',
    trends: '/analytics/trends',
  },
  // User endpoints
  user: {
    profile: '/user/profile',
    update: '/user/profile',
    changePassword: '/user/change-password',
  },
};

export default axiosInstance;
export { get, post, put, patch, remove, endpoints };
