import { CAR_API_BASE } from '@/config';
import axios from 'axios';

// Create axios instance with default configuration
export const apiClient = axios.create({
  baseURL: `${CAR_API_BASE}`,
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
