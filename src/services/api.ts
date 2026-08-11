import axios, { AxiosInstance } from 'axios';
import { HealthCheckResponse } from '../types';

const DEFAULT_API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1';

export const getStoredApiUrl = (): string => {
  const stored = localStorage.getItem('admin_api_url');
  if (stored && stored.includes('localhost:3000')) {
    localStorage.removeItem('admin_api_url');
    return DEFAULT_API_URL;
  }
  return stored || DEFAULT_API_URL;
};

export const setStoredApiUrl = (url: string) => {
  localStorage.setItem('admin_api_url', url);
};

export const createApiClient = (): AxiosInstance => {
  const baseURL = getStoredApiUrl();

  const client = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    },
    timeout: 10000,
  });

  return client;
};

export const checkHealth = async (): Promise<HealthCheckResponse> => {
  const client = createApiClient();
  const res = await client.get('/health');
  return res.data;
};
