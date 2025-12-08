import { apiClient } from './config';

// Types for User API
export interface CreateUserParams {
  name: string;
  email: string;
  phone?: string;
  city?: string;
  country?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  city?: string;
  country?: string;
  is_verified: boolean;
  is_active: boolean;
  total_bids: number;
  total_wins: number;
  total_spent: number;
  created_at: string;
  updated_at: string;
}

export interface UserStatistics {
  total_bids: number;
  total_wins: number;
  total_spent: number;
  active_winning_bids: number;
  watchlist_count: number;
}

export interface UserProfileResponse {
  user: User;
  statistics: UserStatistics;
}

/**
 * User API Service
 */
export const userApi = {
  /**
   * Create a new user account
   * @param params User creation parameters
   * @returns Created user data
   */
  create: async (params: CreateUserParams) => {
    const response = await apiClient.post('/users/create', params);
    return response.data;
  },

  /**
   * Get user profile and statistics
   * @param userId User ID
   * @returns User profile with statistics
   */
  getProfile: async (userId: number): Promise<UserProfileResponse> => {
    const response = await apiClient.get('/users/show', {
      params: { user_id: userId },
    });
    return response.data;
  },
};
