import { Application } from './application';

export interface EventModel {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  status: boolean;
  payloadSchema?: any;
  applicationId: string;
  application?: Application;
  createdAt: string;
  updatedAt: string;
}
