import { userClient, handleAPIError } from './client';
import type {
  UserProfile,
  UpdateProfilePayload,
  UpdateProfileResponse,
  ChangePasswordPayload,
  ChangePasswordResponse,
  DeleteAccountPayload,
  DeleteAccountResponse
} from './types';

export const UserProfileService = {
  async getProfile(): Promise<UserProfile> {
    try {
      const response = await userClient.get<UserProfile>('/user/profile');
      return response.data;
    } catch (error) {
      throw handleAPIError(error);
    }
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<UpdateProfileResponse> {
    try {
      const response = await userClient.put<UpdateProfileResponse>('/user/profile', payload);
      return response.data;
    } catch (error) {
      throw handleAPIError(error);
    }
  },

  async changePassword(payload: ChangePasswordPayload): Promise<ChangePasswordResponse> {
    try {
      const response = await userClient.put<ChangePasswordResponse>('/user/password', payload);
      return response.data;
    } catch (error) {
      throw handleAPIError(error);
    }
  },

  async deleteAccount(payload: DeleteAccountPayload): Promise<DeleteAccountResponse> {
    try {
      const response = await userClient.delete<DeleteAccountResponse>('/user/account', {
        data: payload
      });
      return response.data;
    } catch (error) {
      throw handleAPIError(error);
    }
  }
};
