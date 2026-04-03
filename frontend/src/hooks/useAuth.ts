import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../stores/auth.store';
import type { RegisterData, LoginData } from '../types/api.types';
import { AxiosError } from 'axios';

function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.message;
    if (Array.isArray(message)) return message.join(', ');
    if (typeof message === 'string') return message;
  }
  return 'Произошла ошибка';
}

export function useLogin() {
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: LoginData) => authService.login(data),
    onSuccess: (response) => {
      setAccessToken(response.accessToken);
      navigate('/profile');
    },
    onError: (error) => {
      notifications.show({
        title: 'Ошибка входа',
        message: getErrorMessage(error),
        color: 'red',
      });
    },
  });
}

export function useRegister() {
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: RegisterData) => authService.register(data),
    onSuccess: (response) => {
      setAccessToken(response.accessToken);
      navigate('/profile');
    },
    onError: (error) => {
      notifications.show({
        title: 'Ошибка регистрации',
        message: getErrorMessage(error),
        color: 'red',
      });
    },
  });
}

export function useLogout() {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      logout();
      navigate('/login');
    },
  });
}
