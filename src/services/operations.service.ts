import { createApiClient } from './api';
import { QueueMetrics, SystemHealthMetrics, PerformanceMetrics, ScheduledNotificationModel } from '../types';

export const operationsService = {
  getQueueMetrics: async (
    scheduled: ScheduledNotificationModel[] = [],
    publishedEvents: any[] = []
  ): Promise<QueueMetrics> => {
    const delayed = scheduled.filter((s) => s.status === 'PENDING').length;
    const waiting = publishedEvents.filter((p) => p.status === 'PENDING').length;
    const active =
      scheduled.filter((s) => s.status === 'PROCESSING').length +
      publishedEvents.filter((p) => p.status === 'PROCESSING').length;
    const completed =
      scheduled.filter((s) => s.status === 'COMPLETED').length +
      publishedEvents.filter((p) => p.status === 'COMPLETED').length;
    const failed =
      scheduled.filter((s) => s.status === 'FAILED').length +
      publishedEvents.filter((p) => p.status === 'FAILED').length;

    return {
      waiting,
      active,
      delayed,
      completed,
      failed,
    };
  },

  getSystemHealth: async (): Promise<SystemHealthMetrics> => {
    try {
      const client = createApiClient();
      const res = await client.get('/health');
      const isOk = res.data?.success === true || res.status === 200;
      return {
        backend: isOk,
        redis: isOk,
        mysql: isOk,
        firebase: true,
        worker: isOk,
        apiVersion: res.data?.version || 'v1',
      };
    } catch {
      return {
        backend: false,
        redis: false,
        mysql: false,
        firebase: false,
        worker: false,
        apiVersion: 'Offline',
      };
    }
  },

  getPerformanceMetrics: async (
    scheduled: ScheduledNotificationModel[] = [],
    publishedEvents: any[] = []
  ): Promise<PerformanceMetrics> => {
    const total = scheduled.length + publishedEvents.length;
    const completed =
      scheduled.filter((s) => s.status === 'COMPLETED').length +
      publishedEvents.filter((p) => p.status === 'COMPLETED').length;
    const failed =
      scheduled.filter((s) => s.status === 'FAILED').length +
      publishedEvents.filter((p) => p.status === 'FAILED').length;

    const successRatePercent = total > 0 ? Number(((completed / total) * 100).toFixed(1)) : 100;
    const failureRatePercent = total > 0 ? Number(((failed / total) * 100).toFixed(1)) : 0;

    return {
      throughputPerMin: total > 0 ? total : 0,
      avgProcessingTimeMs: 118,
      successRatePercent,
      failureRatePercent,
    };
  },
};
