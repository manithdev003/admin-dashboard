import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Cpu } from 'lucide-react';
import { StatusBadge } from '../../components/StatusBadge';

export const WorkersPage: React.FC = () => {
  const { systemHealth, queueMetrics, scheduled = [], recurringSchedules = [] } = useOutletContext<any>();

  const isWorkerOnline = systemHealth?.worker !== false;
  const isRedisOnline = systemHealth?.redis !== false;

  const workers = [
    {
      id: 'wrk-01',
      name: 'Event Processing Worker #1',
      concurrency: 5,
      status: isWorkerOnline ? (queueMetrics.active > 0 ? 'ACTIVE' : 'IDLE') : 'FAILED',
      processedCount: queueMetrics.completed || 0,
      failedCount: queueMetrics.failed || 0,
      lastHeartbeat: isWorkerOnline ? 'Just now' : 'Offline',
    },
    {
      id: 'wrk-02',
      name: 'One-Time Job Scheduler',
      concurrency: 2,
      status: isRedisOnline ? (scheduled.length > 0 ? 'ACTIVE' : 'IDLE') : 'FAILED',
      processedCount: scheduled.filter((s: any) => s.status === 'COMPLETED').length,
      failedCount: scheduled.filter((s: any) => s.status === 'FAILED').length,
      lastHeartbeat: isRedisOnline ? '3s ago' : 'Offline',
    },
    {
      id: 'wrk-03',
      name: 'Recurring Cron Looper',
      concurrency: 2,
      status: isRedisOnline ? (recurringSchedules.filter((r: any) => r.status === 'ACTIVE').length > 0 ? 'ACTIVE' : 'IDLE') : 'FAILED',
      processedCount: recurringSchedules.length,
      failedCount: 0,
      lastHeartbeat: isRedisOnline ? 'Just now' : 'Offline',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-white">Background Workers & Concurrency</h3>
        <p className="text-xs text-slate-400">Live BullMQ worker threads, cron loopers, and queue concurrency states.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {workers.map((w) => (
          <div key={w.id} className="glass-card rounded-2xl p-5 border space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-indigo-950/70 border border-indigo-800/40 text-indigo-400">
                <Cpu className="w-5 h-5" />
              </div>
              <StatusBadge status={w.status} />
            </div>

            <div>
              <h4 className="text-sm font-bold text-white">{w.name}</h4>
              <p className="text-xs font-mono text-slate-400 mt-0.5">Concurrency: {w.concurrency} jobs</p>
            </div>

            <div className="pt-2 border-t border-slate-800/80 text-xs space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Processed:</span>
                <strong className="text-emerald-400 font-mono">{w.processedCount}</strong>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Failed:</span>
                <strong className="text-rose-400 font-mono">{w.failedCount}</strong>
              </div>
              <div className="flex justify-between text-slate-500 text-[11px] pt-1">
                <span>Heartbeat:</span>
                <span>{w.lastHeartbeat}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
