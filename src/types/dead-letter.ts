export type DeadLetterStatus = 'PENDING' | 'RETRIED' | 'RESOLVED';

export interface DeadLetterEventModel {
  id: string;
  originalJobId: string;
  queueName: string;
  publishedEventId: string;
  attemptsMade: number;
  maxAttempts: number;
  payload: any;
  errorMessage: string;
  errorStack?: string | null;
  status: DeadLetterStatus;
  failedAt: string;
  retriedAt?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  publishedEvent?: {
    id: string;
    correlationId: string;
    applicationId: string;
    eventId: string;
    userId: string;
    payload: any;
    status: string;
  };
}

export interface BatchDeadLetterEventModel {
  id: string;
  originalJobId: string;
  application: string;
  event: string;
  channel: string;
  retryCount: number;
  notifications: any;
  errorMessage: string;
  status: DeadLetterStatus;
  failedAt: string;
  retriedAt?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}
