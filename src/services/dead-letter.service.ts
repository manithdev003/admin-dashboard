import { createApiClient } from './api';
import { DeadLetterEventModel } from '../types';

export const deadLetterService = {
  getAll: async (): Promise<DeadLetterEventModel[]> => {
    try {
      const client = createApiClient();
      const res = await client.get('/dead-letter');
      const data = res.data.data || res.data;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.warn('Failed to fetch dead letter events:', error);
      return [];
    }
  },

  getById: async (id: string): Promise<DeadLetterEventModel> => {
    const client = createApiClient();
    const res = await client.get(`/dead-letter/${id}`);
    return res.data.data || res.data;
  },

  retry: async (id: string): Promise<{ message: string }> => {
    const client = createApiClient();
    const res = await client.post(`/dead-letter/${id}/retry`);
    return res.data.data || res.data;
  },
};
