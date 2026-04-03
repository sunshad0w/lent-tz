import { describe, it, expect, vi, beforeEach } from 'vitest';
import { userService } from './user.service';
import { api } from './api';
import type { User, UpdateProfileData } from '../types/user.types';

vi.mock('./api', () => ({
  api: {
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

const mockedApi = vi.mocked(api);

const mockUser: User = {
  id: '1',
  email: 'test@example.com',
  firstName: 'Иван',
  lastName: 'Иванов',
  birthDate: '1990-01-01',
  about: 'Описание',
  phone: '+79991234567',
  avatarUrl: '/uploads/avatar.jpg',
  createdAt: '2024-01-01T00:00:00.000Z',
};

describe('userService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getProfile', () => {
    it('вызывает GET /profile и возвращает данные пользователя', async () => {
      mockedApi.get.mockResolvedValue({ data: mockUser });

      const result = await userService.getProfile();

      expect(mockedApi.get).toHaveBeenCalledWith('/profile');
      expect(result).toEqual(mockUser);
    });
  });

  describe('updateProfile', () => {
    it('вызывает PATCH /profile с данными и возвращает обновлённого пользователя', async () => {
      const updateData: UpdateProfileData = {
        firstName: 'Пётр',
        about: 'Новое описание',
      };
      const updatedUser: User = { ...mockUser, ...updateData };
      mockedApi.patch.mockResolvedValue({ data: updatedUser });

      const result = await userService.updateProfile(updateData);

      expect(mockedApi.patch).toHaveBeenCalledWith('/profile', updateData);
      expect(result).toEqual(updatedUser);
    });
  });

  describe('uploadAvatar', () => {
    it('вызывает PATCH /profile/avatar с FormData и возвращает avatarUrl', async () => {
      const file = new File(['content'], 'avatar.png', { type: 'image/png' });
      const response = { avatarUrl: '/uploads/new-avatar.png' };
      mockedApi.patch.mockResolvedValue({ data: response });

      const result = await userService.uploadAvatar(file);

      expect(mockedApi.patch).toHaveBeenCalledWith('/profile/avatar', expect.any(FormData));
      const calledFormData = mockedApi.patch.mock.calls[0][1] as FormData;
      expect(calledFormData.get('file')).toBe(file);
      expect(result).toEqual(response);
    });
  });
});
