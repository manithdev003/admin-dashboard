import { useQuery } from '@tanstack/react-query';
import { operationsService } from '../services/operations.service';
import { ScheduledNotificationModel } from '../types';
import { getStoredAutoRefresh } from '../services/api';

export const useOperations = (scheduled: ScheduledNotificationModel[] = [], publishedEvents: any[] = []) => {
  const autoRefresh = getStoredAutoRefresh();

  const queueQuery = useQuery({
    queryKey: ['queueMetrics', scheduled.length, publishedEvents.length],
    queryFn: () => operationsService.getQueueMetrics(scheduled, publishedEvents),
  });

  const healthQuery = useQuery({
    queryKey: ['systemHealth'],
    queryFn: () => operationsService.getSystemHealth(),
    refetchInterval: autoRefresh ? 15000 : false,
  });

  return {
    queueMetrics: queueQuery.data || { waiting: 0, active: 0, delayed: 0, completed: 0, failed: 0, paused: 0, retries: 0, redisStatus: true },
    systemHealth: healthQuery.data || { backend: false, redis: false, mysql: false, firebase: false, worker: false, apiVersion: 'v1' },
    refetchQueue: queueQuery.refetch,
    refetchHealth: healthQuery.refetch,
  };
};
