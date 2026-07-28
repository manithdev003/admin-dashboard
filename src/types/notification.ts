import { Application } from './application';
import { EventModel } from './event';

export type PublishedEventStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface PublishedEventModel {
  id: string;
  correlationId: string;
  applicationId: string;
  application?: Application;
  eventId: string;
  event?: EventModel;
  userId: string;
  payload: any;
  status: PublishedEventStatus;
  createdAt: string;
  processedAt?: string | null;
  updatedAt: string;
}

export interface NotificationLogModel {
  id: string;
  notificationId: string;
  status: string;
  message?: string | null;
  createdAt: string;
}
