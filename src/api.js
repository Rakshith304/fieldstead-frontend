import axios from 'axios';

function resolveBaseUrl() {
  let url = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api').trim();
  while (url.endsWith('/')) {
    url = url.slice(0, -1);
  }
  if (!url.endsWith('/api')) {
    url += '/api';
  }
  return url;
}

const api = axios.create({ baseURL: resolveBaseUrl() });

api.interceptors.request.use((config) => {
  try {
    const session = JSON.parse(localStorage.getItem('user') || 'null');
    if (session?.token) config.headers.Authorization = `Bearer ${session.token}`;
  } catch {
    localStorage.removeItem('user');
  }
  return config;
});

api.interceptors.response.use((response) => response, (error) => {
  if (error.response?.status === 401 && error.config?.headers?.Authorization) {
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('auth:expired'));
  }
  return Promise.reject(error);
});

export function errorText(error) {
  if (!error.response) return 'Cannot connect to the server. Please try again.';
  return error.response.data?.message || `Request failed (${error.response.status}).`;
}

export default api;
