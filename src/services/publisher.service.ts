import { createApiClient } from './api';

export const publisherService = {
  publish: async (data: {
    application: string;
    event: string;
    userId: string;
    payload?: Record<string, any>;
  }): Promise<any> => {
    const client = createApiClient();
    const res = await client.post('/publishEvents/publish', data);
    return res.data;
  },
  getAllPublished: async (): Promise<any[]> => {
    const client = createApiClient();
    const res = await client.get('/publishEvents/published');
    return res.data.data || res.data;
  },
  getPending: async (): Promise<any[]> => {
    const client = createApiClient();
    const res = await client.get('/publishEvents/published/pending');
    return res.data.data || res.data;
  },
  deletePublished: async (id: string): Promise<void> => {
    const client = createApiClient();
    await client.delete(`/publishEvents/published/${id}`);
  },
};
