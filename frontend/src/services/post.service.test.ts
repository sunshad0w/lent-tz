import { describe, it, expect, vi, beforeEach } from 'vitest';
import { postService } from './post.service';
import { api } from './api';
import type { Post } from '../types/post.types';
import type { PaginatedResponse } from '../types/api.types';

vi.mock('./api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockedApi = vi.mocked(api);

const mockPost: Post = {
  id: '1',
  content: 'Тестовый пост',
  images: [{ id: 'img1', url: '/uploads/image.jpg', order: 0 }],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

describe('postService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('вызывает GET /posts с параметрами пагинации и сортировки', async () => {
      const params = { offset: 0, limit: 10, sort: 'desc' };
      const response: PaginatedResponse<Post> = {
        data: [mockPost],
        total: 1,
        limit: 10,
        offset: 0,
      };
      mockedApi.get.mockResolvedValue({ data: response });

      const result = await postService.getAll(params);

      expect(mockedApi.get).toHaveBeenCalledWith('/posts', { params });
      expect(result).toEqual(response);
    });
  });

  describe('create', () => {
    it('вызывает POST /posts с FormData и возвращает созданный пост', async () => {
      const formData = new FormData();
      formData.append('content', 'Новый пост');
      mockedApi.post.mockResolvedValue({ data: mockPost });

      const result = await postService.create(formData);

      expect(mockedApi.post).toHaveBeenCalledWith('/posts', formData);
      expect(result).toEqual(mockPost);
    });
  });

  describe('update', () => {
    it('вызывает PATCH /posts/:id с FormData и возвращает обновлённый пост', async () => {
      const formData = new FormData();
      formData.append('content', 'Обновлённый пост');
      const updatedPost = { ...mockPost, content: 'Обновлённый пост' };
      mockedApi.patch.mockResolvedValue({ data: updatedPost });

      const result = await postService.update('1', formData);

      expect(mockedApi.patch).toHaveBeenCalledWith('/posts/1', formData);
      expect(result).toEqual(updatedPost);
    });
  });

  describe('remove', () => {
    it('вызывает DELETE /posts/:id', async () => {
      mockedApi.delete.mockResolvedValue({ data: undefined });

      await postService.remove('1');

      expect(mockedApi.delete).toHaveBeenCalledWith('/posts/1');
    });
  });
});
