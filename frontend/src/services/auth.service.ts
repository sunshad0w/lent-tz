import { api } from './api';
import type { AuthResponse, RegisterData, LoginData } from '../types/api.types';

export const authService = {
  register: (data: RegisterData) =>
    api.post<AuthResponse>('/auth/register', data).then((response) => response.data),

  login: (data: LoginData) =>
    api.post<AuthResponse>('/auth/login', data).then((response) => response.data),

  refresh: () =>
    api.post<{ accessToken: string }>('/auth/refresh').then((response) => response.data),

  logout: () => api.post('/auth/logout'),
};
