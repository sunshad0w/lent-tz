import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';
import { useProfile } from './useProfile';
import type { User } from '../types/user.types';

vi.mock('@mantine/notifications', () => ({
  notifications: { show: vi.fn() },
}));

vi.mock('../services/user.service', () => ({
  userService: {
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
    uploadAvatar: vi.fn(),
  },
}));

import { userService } from '../services/user.service';

const mockedUserService = vi.mocked(userService);

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

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('useProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('возвращает данные профиля пользователя', async () => {
    mockedUserService.getProfile.mockResolvedValue(mockUser);

    const { result } = renderHook(() => useProfile(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockUser);
    expect(mockedUserService.getProfile).toHaveBeenCalled();
  });

  it('обрабатывает ошибку загрузки профиля', async () => {
    mockedUserService.getProfile.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useProfile(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeDefined();
  });
});
