import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { userService } from '../services/user.service';
import type { UpdateProfileData } from '../types/user.types';
import { AxiosError } from 'axios';

function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.message;
    if (Array.isArray(message)) return message.join(', ');
    if (typeof message === 'string') return message;
  }
  return 'Произошла ошибка';
}

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => userService.getProfile(),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateProfileData) => userService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      notifications.show({
        title: 'Успешно',
        message: 'Профиль обновлён',
        color: 'green',
      });
    },
    onError: (error: unknown) => {
      notifications.show({
        title: 'Ошибка',
        message: getErrorMessage(error),
        color: 'red',
      });
    },
  });
}

export function useUploadAvatar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => userService.uploadAvatar(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      notifications.show({
        title: 'Успешно',
        message: 'Аватар обновлён',
        color: 'green',
      });
    },
    onError: (error: unknown) => {
      notifications.show({
        title: 'Ошибка',
        message: getErrorMessage(error),
        color: 'red',
      });
    },
  });
}
