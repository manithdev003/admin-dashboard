import { createApiClient } from './api';
import { RuleModel } from '../types';

export const ruleService = {
  getAll: async (): Promise<RuleModel[]> => {
    const client = createApiClient();
    const res = await client.get('/rules');
    return res.data.data || res.data;
  },
  getByEvent: async (eventId: string): Promise<RuleModel[]> => {
    const client = createApiClient();
    const res = await client.get(`/rules/event/${eventId}`);
    return res.data.data || res.data;
  },
  getById: async (id: string): Promise<RuleModel> => {
    const client = createApiClient();
    const res = await client.get(`/rules/${id}`);
    return res.data.data || res.data;
  },
  create: async (data: {
    eventId: string;
    name: string;
    description?: string;
    field: string;
    operator: string;
    value: string;
    priority?: number;
    enabled?: boolean;
    channel: string;
  }): Promise<RuleModel> => {
    const client = createApiClient();
    const res = await client.post('/rules', data);
    return res.data.data || res.data;
  },
  update: async (id: string, data: Partial<{
    name: string;
    description?: string;
    field: string;
    operator: string;
    value: string;
    priority?: number;
    enabled?: boolean;
    channel: string;
  }>): Promise<RuleModel> => {
    const client = createApiClient();
    const res = await client.put(`/rules/${id}`, data);
    return res.data.data || res.data;
  },
  enable: async (id: string): Promise<RuleModel> => {
    const client = createApiClient();
    const res = await client.patch(`/rules/${id}/enable`);
    return res.data.data || res.data;
  },
  disable: async (id: string): Promise<RuleModel> => {
    const client = createApiClient();
    const res = await client.patch(`/rules/${id}/disable`);
    return res.data.data || res.data;
  },
  delete: async (id: string): Promise<void> => {
    const client = createApiClient();
    await client.delete(`/rules/${id}`);
  },
};
