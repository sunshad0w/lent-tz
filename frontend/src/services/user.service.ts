import { api } from './api';
import type { User, UpdateProfileData } from '../types/user.types';

export const userService = {
  getProfile: () => api.get<User>('/profile').then((response) => response.data),

  updateProfile: (data: UpdateProfileData) =>
    api.patch<User>('/profile', data).then((response) => response.data),

  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api
      .patch<{ avatarUrl: string }>('/profile/avatar', formData)
      .then((response) => response.data);
  },
};
