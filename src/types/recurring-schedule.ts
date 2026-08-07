import { Application } from './application';
import { EventModel } from './event';

export type RecurringScheduleStatus = 'ACTIVE' | 'PAUSED';

export interface RecurringScheduleModel {
  id: string;
  applicationId: string;
  application?: Application;
  eventId: string;
  event?: EventModel;
  userId: string;
  callbackUrl?: string;
  payload: any;
  cronExpression: string;
  schedulerId?: string | null;
  status: RecurringScheduleStatus;
  createdAt: string;
  updatedAt: string;
}
