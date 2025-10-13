import api from './api';
import type { LoginFormData, RegisterFormData, LoginResponse, User } from '../types/types';

export const authService = {
  login: async (credentials: LoginFormData): Promise<LoginResponse> => {
    const response = await api.post('/auth/signin', credentials);
    // Transform backend response to frontend format
    return {
      user: response.data.user,
      token: response.data.tokens.accessToken
    };
  },

  register: async (userData: RegisterFormData): Promise<LoginResponse> => {
    const response = await api.post('/auth/signup', userData);
    // Transform backend response to frontend format
    return {
      user: response.data.user,
      token: response.data.tokens.accessToken
    };
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },
};
