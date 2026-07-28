export const NOTIFICATION_CHANNELS = ['PUSH', 'EMAIL', 'SMS', 'WHATSAPP', 'IN_APP'] as const;
export type NotificationChannel = typeof NOTIFICATION_CHANNELS[number];
