import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from './auth.service';
import { api } from './api';
import type { AuthResponse, RegisterData, LoginData } from '../types/api.types';

vi.mock('./api', () => ({
  api: {
    post: vi.fn(),
  },
}));

const mockedApi = vi.mocked(api);

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('register', () => {
    it('вызывает POST /auth/register с переданными данными и возвращает data', async () => {
      const registerData: RegisterData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Иван',
        lastName: 'Иванов',
      };
      const response: AuthResponse = {
        accessToken: 'token123',
        user: { id: '1', email: 'test@example.com', firstName: 'Иван', lastName: 'Иванов' },
      };
      mockedApi.post.mockResolvedValue({ data: response });

      const result = await authService.register(registerData);

      expect(mockedApi.post).toHaveBeenCalledWith('/auth/register', registerData);
      expect(result).toEqual(response);
    });
  });

  describe('login', () => {
    it('вызывает POST /auth/login с переданными данными и возвращает data', async () => {
      const loginData: LoginData = {
        email: 'test@example.com',
        password: 'password123',
      };
      const response: AuthResponse = {
        accessToken: 'token456',
        user: { id: '1', email: 'test@example.com', firstName: 'Иван', lastName: 'Иванов' },
      };
      mockedApi.post.mockResolvedValue({ data: response });

      const result = await authService.login(loginData);

      expect(mockedApi.post).toHaveBeenCalledWith('/auth/login', loginData);
      expect(result).toEqual(response);
    });
  });

  describe('refresh', () => {
    it('вызывает POST /auth/refresh и возвращает accessToken', async () => {
      const response = { accessToken: 'newToken789' };
      mockedApi.post.mockResolvedValue({ data: response });

      const result = await authService.refresh();

      expect(mockedApi.post).toHaveBeenCalledWith('/auth/refresh');
      expect(result).toEqual(response);
    });
  });

  describe('logout', () => {
    it('вызывает POST /auth/logout', async () => {
      mockedApi.post.mockResolvedValue({ data: undefined });

      await authService.logout();

      expect(mockedApi.post).toHaveBeenCalledWith('/auth/logout');
    });
  });
});
