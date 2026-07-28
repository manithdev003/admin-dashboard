import { createApiClient } from './api';
import { Application } from '../types';

export const applicationService = {
  getAll: async (): Promise<Application[]> => {
    const client = createApiClient();
    const res = await client.get('/applications');
    return res.data.data || res.data;
  },
  getById: async (id: string): Promise<Application> => {
    const client = createApiClient();
    const res = await client.get(`/applications/${id}`);
    return res.data.data || res.data;
  },
  create: async (data: { name: string; code: string; description?: string }): Promise<Application> => {
    const client = createApiClient();
    const res = await client.post('/applications', data);
    return res.data.data || res.data;
  },
  update: async (id: string, data: Partial<{ name: string; code: string; description?: string }>): Promise<Application> => {
    const client = createApiClient();
    const res = await client.put(`/applications/${id}`, data);
    return res.data.data || res.data;
  },
  delete: async (id: string): Promise<void> => {
    const client = createApiClient();
    await client.delete(`/applications/${id}`);
  },
};
