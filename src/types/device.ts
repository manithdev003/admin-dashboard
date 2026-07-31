import { Application } from './application';

export type DevicePlatform = 'ANDROID' | 'IOS' | 'WEB';

export interface DeviceModel {
  id: string;
  applicationId: string;
  application?: Application;
  userId: string;
  email?: string | null;
  phone?: string | null;
  deviceId: string;
  platform: DevicePlatform;
  fcmToken: string;
  isActive: boolean;
  lastSeen?: string | null;
  createdAt: string;
  updatedAt: string;
}
  