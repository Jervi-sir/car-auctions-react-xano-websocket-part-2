import axios from 'axios';

// Base API configuration
export const API_BASE_URL = 'https://xqrx-tgqf-f4ju.n7e.xano.io/api:FnuTavOE'; //import.meta.env.VITE_API_BASE_URL || 'https://api.example.com';
export const API_GROUP = '';

// Create axios instance with default configuration
export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/${API_GROUP}`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor - Add authentication tokens here if needed
apiClient.interceptors.request.use(
  (config) => {
    // You can add auth tokens here
    // const token = localStorage.getItem('authToken');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response) {
      // Server responded with error
      const { error_type, error: errorMessage } = error.response.data;
      console.error(`API Error [${error_type}]:`, errorMessage);
    } else if (error.request) {
      // Request made but no response
      console.error('Network Error:', error.message);
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);
