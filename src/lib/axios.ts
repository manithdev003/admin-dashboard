import axios, { AxiosInstance } from 'axios';

const DEFAULT_API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

export const getStoredApiUrl = (): string => {
  return localStorage.getItem('admin_api_url') || DEFAULT_API_URL;
};

export const setStoredApiUrl = (url: string) => {
  localStorage.setItem('admin_api_url', url);
};

export const apiClient: AxiosInstance = axios.create({
  baseURL: getStoredApiUrl(),
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
  timeout: 10000,
});

apiClient.interceptors.request.use((config) => {
  config.baseURL = getStoredApiUrl();
  return config;
});
