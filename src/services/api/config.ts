import axios from 'axios';
import { authService } from './auth';

export const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = authService.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (
      typeof window !== 'undefined' &&
      error.response?.status === 401 &&
      !error.config.url?.includes('/users/signin')
    ) {
      authService.removeToken();
      sessionStorage.setItem(
        'auth_error',
        'Session expired. Please log in again.'
      );
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
