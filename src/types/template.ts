import { Application } from './application';
import { EventModel } from './event';

export type NotificationChannelType = 'PUSH' | 'EMAIL' | 'SMS' | 'WHATSAPP' | 'IN_APP';

export interface NotificationTemplateModel {
  id: string;
  applicationId: string;
  application?: Application;
  eventId: string;
  event?: EventModel;
  channel: NotificationChannelType;
  titleTemplate: string;
  bodyTemplate: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}
