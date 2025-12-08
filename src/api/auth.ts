import { userClient, handleAPIError } from './client';
import type { AuthResponse, User } from './types';

export interface SignupData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  city?: string;
  country?: string;
}

export const AuthService = {
  async signup(userData: SignupData): Promise<AuthResponse> {
    try {
      const response = await userClient.post<AuthResponse>('/auth/signup', userData);
      if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', response.data.authToken);
      }
      return response.data;
    } catch (error) {
      throw handleAPIError(error);
    }
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await userClient.post<AuthResponse>('/auth/login', { email, password });
      if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', response.data.authToken);
      }
      return response.data;
    } catch (error) {
      throw handleAPIError(error);
    }
  },

  async getCurrentUser(): Promise<User> {
    try {
      const response = await userClient.get<User>('/auth/me');
      return response.data;
    } catch (error) {
      throw handleAPIError(error);
    }
  },

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
  },

  isAuthenticated(): boolean {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('authToken');
    }
    return false;
  }
};
