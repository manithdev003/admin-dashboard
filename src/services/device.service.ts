import { createApiClient } from './api';
import { DeviceModel } from '../types';

export const deviceService = {
  getAll: async (): Promise<DeviceModel[]> => {
    const client = createApiClient();
    const res = await client.get('/devices');
    return res.data.data || res.data;
  },
  register: async (applicationId: string, data: { userId: string; deviceId: string; platform: string; fcmToken: string }): Promise<DeviceModel> => {
    const client = createApiClient();
    const res = await client.post(`/devices/applications/${applicationId}/devices`, data);
    return res.data.data || res.data;
  },
  getByUser: async (applicationId: string, userId: string): Promise<DeviceModel[]> => {
    const client = createApiClient();
    const res = await client.get(`/devices/applications/${applicationId}/users/${userId}/devices`);
    return res.data.data || res.data;
  },
  getById: async (deviceId: string): Promise<DeviceModel> => {
    const client = createApiClient();
    const res = await client.get(`/devices/devices/${deviceId}`);
    return res.data.data || res.data;
  },
  update: async (deviceId: string, data: Partial<{ platform: string; fcmToken: string }>): Promise<DeviceModel> => {
    const client = createApiClient();
    const res = await client.put(`/devices/devices/${deviceId}`, data);
    return res.data.data || res.data;
  },
  heartbeat: async (deviceId: string): Promise<DeviceModel> => {
    const client = createApiClient();
    const res = await client.patch(`/devices/devices/${deviceId}/heartbeat`);
    return res.data.data || res.data;
  },
  deactivate: async (deviceId: string): Promise<DeviceModel> => {
    const client = createApiClient();
    const res = await client.patch(`/devices/devices/${deviceId}/deactivate`);
    return res.data.data || res.data;
  },
  delete: async (deviceId: string): Promise<void> => {
    const client = createApiClient();
    await client.delete(`/devices/devices/${deviceId}`);
  },
};
