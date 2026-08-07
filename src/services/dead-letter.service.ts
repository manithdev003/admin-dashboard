import { createApiClient } from './api';
import { DeadLetterEventModel, BatchDeadLetterEventModel } from '../types';

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

  getBatchAll: async (): Promise<BatchDeadLetterEventModel[]> => {
    try {
      const client = createApiClient();
      const res = await client.get('/dead-letter/batch');
      const data = res.data.data || res.data;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.warn('Failed to fetch batch dead letter events:', error);
      return [];
    }
  },

  getBatchById: async (id: string): Promise<BatchDeadLetterEventModel> => {
    const client = createApiClient();
    const res = await client.get(`/dead-letter/batch/${id}`);
    return res.data.data || res.data;
  },

  retryBatch: async (id: string): Promise<{ message: string }> => {
    const client = createApiClient();
    const res = await client.post(`/dead-letter/batch/${id}/retry`);
    return res.data.data || res.data;
  },
};
