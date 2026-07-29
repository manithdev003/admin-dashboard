import { apiClient } from '../lib/axios';
import { RecurringScheduleModel } from '../types';

export const recurringScheduleService = {
  getAll: async (): Promise<RecurringScheduleModel[]> => {
    const res = await apiClient.get('/recurring-schedules');
    return res.data.data || res.data;
  },

  getById: async (id: string): Promise<RecurringScheduleModel> => {
    const res = await apiClient.get(`/recurring-schedules/${id}`);
    return res.data.data || res.data;
  },

  create: async (data: {
    application: string;
    event: string;
    userId: string;
    payload?: Record<string, any>;
    cronExpression: string;
  }): Promise<RecurringScheduleModel> => {
    const res = await apiClient.post('/recurring-schedules', data);
    return res.data.data || res.data;
  },

  pause: async (id: string): Promise<RecurringScheduleModel> => {
    const res = await apiClient.patch(`/recurring-schedules/${id}/pause`);
    return res.data.data || res.data;
  },

  resume: async (id: string): Promise<RecurringScheduleModel> => {
    const res = await apiClient.patch(`/recurring-schedules/${id}/resume`);
    return res.data.data || res.data;
  },

  reschedule: async (id: string, cronExpression: string): Promise<RecurringScheduleModel> => {
    const res = await apiClient.patch(`/recurring-schedules/${id}/reschedule`, { cronExpression });
    return res.data.data || res.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/recurring-schedules/${id}`);
  },
};
