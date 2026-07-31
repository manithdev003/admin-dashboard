import { EventModel } from './event';
import { NotificationChannelType } from './template';

export type RuleOperator = 
  | 'EQUALS' 
  | 'NOT_EQUALS' 
  | 'GREATER_THAN' 
  | 'GREATER_THAN_OR_EQUAL' 
  | 'LESS_THAN' 
  | 'LESS_THAN_OR_EQUAL' 
  | 'CONTAINS';

export interface RuleModel {
  id: string;
  eventId: string;
  event?: EventModel;
  name: string;
  description?: string | null;
  field: string;
  operator: RuleOperator;
  value: any;
  priority: number;
  enabled: boolean;
  channel: NotificationChannelType;
  createdAt: string;
  updatedAt: string;
}
