import { PublishedEventModel } from './notification';

export type ScheduledNotificationStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface ScheduledNotificationModel {
  id: string;
  publishedEventId: string;
  publishedEvent?: PublishedEventModel;
  sendAt: string;
  status: ScheduledNotificationStatus;
  bullJobId?: string | null;
  createdAt: string;
  updatedAt: string;
}
