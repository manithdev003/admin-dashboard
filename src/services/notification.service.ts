import { createApiClient } from './api';

export const notificationService = {
  sendDirect: async (data: any) => {
    const client = createApiClient();
    const res = await client.post('/notifications', data);
    return res.data;
  },
  sendFirebasePush: async (data: { fcmToken: string; title: string; body: string; data?: Record<string, any> }) => {
    const client = createApiClient();
    const res = await client.post('/firebase/send', data);
    return res.data;
  },
};
