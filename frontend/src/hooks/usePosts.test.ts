import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';
import { usePosts } from './usePosts';
import type { Post } from '../types/post.types';
import type { PaginatedResponse } from '../types/api.types';

vi.mock('@mantine/notifications', () => ({
  notifications: { show: vi.fn() },
}));

vi.mock('../services/post.service', () => ({
  postService: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}));

import { postService } from '../services/post.service';

const mockedPostService = vi.mocked(postService);

const mockPost: Post = {
  id: '1',
  content: 'Тестовый пост',
  images: [{ id: 'img1', url: '/uploads/image.jpg', order: 0 }],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

const mockResponse: PaginatedResponse<Post> = {
  data: [mockPost],
  total: 1,
  limit: 10,
  offset: 0,
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('usePosts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('возвращает массив постов после загрузки', async () => {
    mockedPostService.getAll.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => usePosts(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.posts).toEqual([mockPost]);
    expect(result.current.total).toBe(1);
    expect(mockedPostService.getAll).toHaveBeenCalledWith(
      expect.objectContaining({ offset: 0, limit: 10, sort: 'desc' }),
    );
  });

  it('по умолчанию сортировка desc', () => {
    mockedPostService.getAll.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => usePosts(), { wrapper: createWrapper() });

    expect(result.current.sort).toBe('desc');
  });

  it('позволяет менять направление сортировки', async () => {
    mockedPostService.getAll.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => usePosts(), { wrapper: createWrapper() });

    act(() => {
      result.current.setSort('asc');
    });

    expect(result.current.sort).toBe('asc');

    await waitFor(() => {
      expect(mockedPostService.getAll).toHaveBeenCalledWith(
        expect.objectContaining({ sort: 'asc' }),
      );
    });
  });

  it('возвращает пустой массив постов до загрузки', () => {
    mockedPostService.getAll.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => usePosts(), { wrapper: createWrapper() });

    expect(result.current.posts).toEqual([]);
    expect(result.current.total).toBe(0);
  });
});
