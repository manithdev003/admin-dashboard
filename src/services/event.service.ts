import { createApiClient } from './api';
import { EventModel } from '../types';

export const eventService = {
  getByApplication: async (applicationId: string): Promise<EventModel[]> => {
    const client = createApiClient();
    const res = await client.get(`/events/applications/${applicationId}/events`);
    return res.data.data || res.data;
  },
  getById: async (id: string): Promise<EventModel> => {
    const client = createApiClient();
    const res = await client.get(`/events/${id}`);
    return res.data.data || res.data;
  },
  create: async (applicationId: string, data: { name: string; code: string; description?: string }): Promise<EventModel> => {
    const client = createApiClient();
    const res = await client.post(`/events/applications/${applicationId}/events`, data);
    return res.data.data || res.data;
  },
  update: async (id: string, data: Partial<{ name: string; code: string; description?: string }>): Promise<EventModel> => {
    const client = createApiClient();
    const res = await client.put(`/events/${id}`, data);
    return res.data.data || res.data;
  },
  delete: async (id: string): Promise<void> => {
    const client = createApiClient();
    await client.delete(`/events/${id}`);
  },
};
