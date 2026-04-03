import axios from 'axios';
import { useAuthStore } from '../stores/auth.store';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise: Promise<string> | null = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        if (!refreshPromise) {
          refreshPromise = axios
            .post<{ accessToken: string }>('/api/auth/refresh', null, {
              withCredentials: true,
            })
            .then((refreshResponse) => {
              useAuthStore.getState().setAccessToken(refreshResponse.data.accessToken);
              return refreshResponse.data.accessToken;
            })
            .catch((refreshError) => {
              useAuthStore.getState().logout();
              window.location.href = '/login';
              throw refreshError;
            })
            .finally(() => {
              refreshPromise = null;
            });
        }
        const token = await refreshPromise;
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch {
        throw error;
      }
    }
    throw error;
  },
);

export { api };
