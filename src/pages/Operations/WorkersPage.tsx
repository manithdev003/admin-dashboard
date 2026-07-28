import React from 'react';
import { Cpu, CheckCircle2, Play, Pause, Activity } from 'lucide-react';
import { StatusBadge } from '../../components/StatusBadge';

export const WorkersPage: React.FC = () => {
  const workers = [
    { id: 'wrk-01', name: 'Queue Worker Thread #1', concurrency: 5, status: 'ACTIVE', processedCount: 142, failedCount: 0, lastHeartbeat: 'Just now' },
    { id: 'wrk-02', name: 'Queue Worker Thread #2', concurrency: 5, status: 'ACTIVE', processedCount: 98, failedCount: 1, lastHeartbeat: 'Just now' },
    { id: 'wrk-03', name: 'Scheduled Job Looper', concurrency: 2, status: 'IDLE', processedCount: 15, failedCount: 0, lastHeartbeat: '3s ago' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-white">Background Workers & Concurrency</h3>
        <p className="text-xs text-slate-400">BullMQ worker threads processing Redis event queues.</p>
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
