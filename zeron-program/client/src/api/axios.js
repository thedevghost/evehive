import axios from 'axios';

const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.0' || window.location.hostname === '127.0.0.1';
const defaultApiUrl = isLocalhost ? 'http://localhost:5000/api' : '/api';
const baseURL = import.meta.env.VITE_API_URL || defaultApiUrl;

const api = axios.create({
  baseURL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')?.trim();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
