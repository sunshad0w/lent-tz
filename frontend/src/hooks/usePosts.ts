import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { useState } from 'react';
import { postService } from '../services/post.service';

const PAGE_SIZE = 10;

export function usePosts() {
  const [sort, setSort] = useState<'asc' | 'desc'>('desc');

  const query = useInfiniteQuery({
    queryKey: ['posts', { sort }],
    queryFn: ({ pageParam }) => postService.getAll({ offset: pageParam, limit: PAGE_SIZE, sort }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((sum, page) => sum + page.data.length, 0);
      return loaded < lastPage.total ? loaded : undefined;
    },
  });

  const posts = query.data?.pages.flatMap((page) => page.data) ?? [];
  const total = query.data?.pages[0]?.total ?? 0;

  return {
    ...query,
    posts,
    total,
    sort,
    setSort,
  };
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: FormData) => postService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      notifications.show({ title: 'Успешно', message: 'Пост опубликован', color: 'green' });
    },
    onError: () => {
      notifications.show({ title: 'Ошибка', message: 'Не удалось создать пост', color: 'red' });
    },
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) => postService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      notifications.show({ title: 'Успешно', message: 'Пост обновлён', color: 'green' });
    },
    onError: () => {
      notifications.show({ title: 'Ошибка', message: 'Не удалось обновить пост', color: 'red' });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => postService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      notifications.show({ title: 'Успешно', message: 'Пост удалён', color: 'green' });
    },
    onError: () => {
      notifications.show({ title: 'Ошибка', message: 'Не удалось удалить пост', color: 'red' });
    },
  });
}
