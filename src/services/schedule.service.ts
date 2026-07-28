import { createApiClient } from './api';
import { ScheduledNotificationModel } from '../types';

export const scheduleService = {
  getAll: async (): Promise<ScheduledNotificationModel[]> => {
    const client = createApiClient();
    const res = await client.get('/scheduled-notifications');
    return res.data.data || res.data;
  },
  create: async (data: {
    application: string;
    event: string;
    userId: string;
    payload?: Record<string, any>;
    sendAt: string;
  }): Promise<ScheduledNotificationModel> => {
    const client = createApiClient();
    const res = await client.post('/scheduled-notifications', data);
    return res.data.data || res.data;
  },
  getById: async (id: string): Promise<ScheduledNotificationModel> => {
    const client = createApiClient();
    const res = await client.get(`/scheduled-notifications/${id}`);
    return res.data.data || res.data;
  },
  reschedule: async (id: string, sendAt: string): Promise<ScheduledNotificationModel> => {
    const client = createApiClient();
    const res = await client.patch(`/scheduled-notifications/${id}/reschedule`, { sendAt });
    return res.data.data || res.data;
  },
  cancel: async (id: string): Promise<ScheduledNotificationModel> => {
    const client = createApiClient();
    const res = await client.patch(`/scheduled-notifications/${id}/cancel`);
    return res.data.data || res.data;
  },
  delete: async (id: string): Promise<void> => {
    const client = createApiClient();
    await client.delete(`/scheduled-notifications/${id}`);
  },
};
