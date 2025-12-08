import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

// Base URLs from documentation
export const USER_API_BASE = 'https://xqrx-tgqf-f4ju.n7e.xano.io/api:4aZ5gqlM';
export const CAR_API_BASE = 'https://xqrx-tgqf-f4ju.n7e.xano.io/api:FnuTavOE';

export const userClient = axios.create({
  baseURL: USER_API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const carClient = axios.create({
  baseURL: CAR_API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper to get token safely
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
};

// Request Interceptor
const authInterceptor = (config: InternalAxiosRequestConfig) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

userClient.interceptors.request.use(authInterceptor);
carClient.interceptors.request.use(authInterceptor);

// Response Interceptor
const errorInterceptor = (error: AxiosError) => {
  if (error.response?.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      // Optional: Redirect to login
      // window.location.href = '/login'; 
    }
  }
  return Promise.reject(error);
};

userClient.interceptors.response.use((res) => res, errorInterceptor);
carClient.interceptors.response.use((res) => res, errorInterceptor);

// Error handling utility
export const handleAPIError = (error: any): Error => {
  if (axios.isAxiosError(error)) {
    if (error.response?.data?.error) {
      return new Error(error.response.data.error);
    }
    // Fallback based on status
    if (error.response?.status === 404) return new Error('Resource not found');
    if (error.response?.status === 403) return new Error('Access denied');
  }
  return error instanceof Error ? error : new Error('An unknown error occurred');
};
