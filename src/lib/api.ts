import axios from 'axios';
import { useAuth } from './auth';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5080';

export const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((cfg) => {
  const token = useAuth.getState().accessToken;
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  (r) => r,
  async (err) => {
    if (err.response?.status === 401) {
      useAuth.getState().logout();
    }
    return Promise.reject(err);
  }
);
