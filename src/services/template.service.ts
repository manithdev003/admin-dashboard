import { createApiClient } from './api';
import { NotificationTemplateModel } from '../types';

export const templateService = {
  getAll: async (): Promise<NotificationTemplateModel[]> => {
    const client = createApiClient();
    const res = await client.get('/templates');
    return res.data.data || res.data;
  },
  getById: async (id: string): Promise<NotificationTemplateModel> => {
    const client = createApiClient();
    const res = await client.get(`/templates/${id}`);
    return res.data.data || res.data;
  },
  create: async (data: {
    applicationId: string;
    eventId: string;
    channel: string;
    titleTemplate: string;
    bodyTemplate: string;
    enabled?: boolean;
  }): Promise<NotificationTemplateModel> => {
    const client = createApiClient();
    const res = await client.post('/templates', data);
    return res.data.data || res.data;
  },
  update: async (id: string, data: Partial<{
    channel: string;
    titleTemplate: string;
    bodyTemplate: string;
    enabled: boolean;
  }>): Promise<NotificationTemplateModel> => {
    const client = createApiClient();
    const res = await client.put(`/templates/${id}`, data);
    return res.data.data || res.data;
  },
  delete: async (id: string): Promise<void> => {
    const client = createApiClient();
    await client.delete(`/templates/${id}`);
  },
};
