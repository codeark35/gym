import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL ?? '/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Request interceptor: attach JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: unwrap Nest transform wrapper and handle 401
api.interceptors.response.use(
  (response) => {
    const payload = response.data;
    return {
      ...response,
      data: payload?.data === undefined ? payload : payload.data,
    };
  },
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      // Emitir evento para que el AuthProvider maneje el logout limpiamente
      window.dispatchEvent(new Event('gymtracker:session-expired'));
    }
    return Promise.reject(error);
  },
);

export default api;
