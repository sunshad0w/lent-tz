import { api } from './api';
import type { Post } from '../types/post.types';
import type { PaginatedResponse } from '../types/api.types';

export const postService = {
  getAll: (params: { offset: number; limit: number; sort: string }) =>
    api.get<PaginatedResponse<Post>>('/posts', { params }).then((response) => response.data),
  create: (data: FormData) => api.post<Post>('/posts', data).then((response) => response.data),
  update: (id: string, data: FormData) =>
    api.patch<Post>(`/posts/${id}`, data).then((response) => response.data),
  remove: (id: string) => api.delete(`/posts/${id}`),
};
