export * from './application';
export * from './event';
export * from './template';
export * from './rule';
export * from './device';
export * from './notification';
export * from './schedule';
export * from './recurring-schedule';
export * from './dead-letter';

export interface QueueMetrics {
  waiting: number;
  active: number;
  delayed: number;
  completed: number;
  failed: number;
  paused?: number;
  retries?: number;
  dlqCount?: number;
  dlqPendingCount?: number;
  redisStatus?: boolean;
}

export interface SystemHealthMetrics {
  backend: boolean;
  redis: boolean;
  mysql: boolean;
  firebase: boolean;
  worker: boolean;
  apiVersion: string;
}

export interface PerformanceMetrics {
  throughputPerMin: number;
  avgProcessingTimeMs: number;
  successRatePercent: number;
  failureRatePercent: number;
}

export interface WorkerInfo {
  id: string;
  name: string;
  concurrency: number;
  status: 'ACTIVE' | 'IDLE' | 'STOPPED';
  processedCount: number;
  failedCount: number;
  lastHeartbeat: string;
}

export interface HealthCheckResponse {
  success: boolean;
  service: string;
  version: string;
  message: string;
  timestamp: string;
}
