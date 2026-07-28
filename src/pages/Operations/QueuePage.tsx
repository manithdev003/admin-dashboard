import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Activity, Clock, PlayCircle, CheckCircle2, AlertTriangle, PauseCircle, RefreshCw, Server, RotateCcw } from 'lucide-react';

export const QueueMonitorPage: React.FC = () => {
  const { queueMetrics, onRefresh, isRefreshing } = useOutletContext<any>();

  const cards = [
    { label: 'Waiting Jobs', value: queueMetrics.waiting, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-950/40 border-amber-800/50' },
    { label: 'Active Processing', value: queueMetrics.active, icon: PlayCircle, color: 'text-indigo-400', bg: 'bg-indigo-950/40 border-indigo-800/50' },
    { label: 'Delayed Jobs', value: queueMetrics.delayed, icon: Activity, color: 'text-purple-400', bg: 'bg-purple-950/40 border-purple-800/50' },
    { label: 'Completed Jobs', value: queueMetrics.completed, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-950/40 border-emerald-800/50' },
    { label: 'Failed Jobs', value: queueMetrics.failed, icon: AlertTriangle, color: 'text-rose-400', bg: 'bg-rose-950/40 border-rose-800/50' },
    { label: 'Paused Jobs', value: queueMetrics.paused || 0, icon: PauseCircle, color: 'text-sky-400', bg: 'bg-sky-950/40 border-sky-800/50' },
    { label: 'Retries Count', value: queueMetrics.retries || 0, icon: RotateCcw, color: 'text-teal-400', bg: 'bg-teal-950/40 border-teal-800/50' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white">BullMQ Worker Queue Monitor</h3>
          <p className="text-xs text-slate-400">Real-time Redis event processing queue states, job retries, and worker concurrency.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold">
            <Server className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-300">Redis Queue:</span>
            <span className="text-emerald-400 font-bold">Connected</span>
          </div>

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Queue Telemetry</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="glass-card rounded-2xl p-5 border space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">{c.label}</span>
                <div className={`p-2 rounded-xl border ${c.bg} ${c.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <h4 className="text-3xl font-black text-white">{c.value}</h4>
            </div>
          );
        })}
      </div>

      <div className="glass-panel rounded-2xl p-6 border space-y-3">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Redis Worker Concurrency & Retry Strategy</h4>
        <p className="text-xs text-slate-400">
          Workers listen on queue <code className="text-indigo-300 font-mono">notification-events</code> with automatic exponential backoff retries (3 attempts).
        </p>
      </div>
    </div>
  );
};
