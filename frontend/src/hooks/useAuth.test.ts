import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';
import { useLogin, useRegister, useLogout } from './useAuth';
import type { AuthResponse } from '../types/api.types';

const mockNavigate = vi.fn();
const mockSetAccessToken = vi.fn();
const mockLogout = vi.fn();
const mockNotificationsShow = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('@mantine/notifications', () => ({
  notifications: {
    show: (...args: unknown[]) => mockNotificationsShow(...args),
  },
}));

vi.mock('../services/auth.service', () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  },
}));

vi.mock('../stores/auth.store', () => ({
  useAuthStore: (
    selector: (state: {
      setAccessToken: typeof mockSetAccessToken;
      logout: typeof mockLogout;
    }) => unknown,
  ) => selector({ setAccessToken: mockSetAccessToken, logout: mockLogout }),
}));

import { authService } from '../services/auth.service';

const mockedAuthService = vi.mocked(authService);

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('useLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('при успешном входе устанавливает токен и переходит на /profile', async () => {
    const response: AuthResponse = {
      accessToken: 'token123',
      user: { id: '1', email: 'test@example.com', firstName: 'Иван', lastName: 'Иванов' },
    };
    mockedAuthService.login.mockResolvedValue(response);

    const { result } = renderHook(() => useLogin(), { wrapper: createWrapper() });

    result.current.mutate({ email: 'test@example.com', password: 'pass' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockSetAccessToken).toHaveBeenCalledWith('token123');
    expect(mockNavigate).toHaveBeenCalledWith('/profile');
  });

  it('при ошибке входа показывает уведомление', async () => {
    mockedAuthService.login.mockRejectedValue(new Error('Ошибка'));

    const { result } = renderHook(() => useLogin(), { wrapper: createWrapper() });

    result.current.mutate({ email: 'test@example.com', password: 'wrong' });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(mockNotificationsShow).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Ошибка входа',
        color: 'red',
      }),
    );
  });
});

describe('useRegister', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('при успешной регистрации устанавливает токен и переходит на /profile', async () => {
    const response: AuthResponse = {
      accessToken: 'regToken',
      user: { id: '2', email: 'new@example.com', firstName: 'Пётр', lastName: 'Петров' },
    };
    mockedAuthService.register.mockResolvedValue(response);

    const { result } = renderHook(() => useRegister(), { wrapper: createWrapper() });

    result.current.mutate({
      email: 'new@example.com',
      password: 'pass',
      firstName: 'Пётр',
      lastName: 'Петров',
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockSetAccessToken).toHaveBeenCalledWith('regToken');
    expect(mockNavigate).toHaveBeenCalledWith('/profile');
  });
});

describe('useLogout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('при успешном выходе вызывает logout из стора и переходит на /login', async () => {
    mockedAuthService.logout.mockResolvedValue(undefined as never);

    const { result } = renderHook(() => useLogout(), { wrapper: createWrapper() });

    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockLogout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});
