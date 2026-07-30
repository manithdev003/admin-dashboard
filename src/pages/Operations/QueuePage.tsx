import React from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Activity, Clock, PlayCircle, CheckCircle2, AlertTriangle, PauseCircle, RefreshCw, Server, RotateCcw, Flame, ArrowRight } from 'lucide-react';
import { DeadLetterEventModel } from '../../types';

export const QueueMonitorPage: React.FC = () => {
  const navigate = useNavigate();
  const { queueMetrics, deadLetterEvents = [], onRefresh, isRefreshing } = useOutletContext<any>();

  const pendingDlq = deadLetterEvents.filter((e: DeadLetterEventModel) => e.status === 'PENDING').length;
  const totalDlq = deadLetterEvents.length;

  const cards = [
    { label: 'Waiting Jobs', value: queueMetrics.waiting, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-950/40 border-amber-800/50' },
    { label: 'Active Processing', value: queueMetrics.active, icon: PlayCircle, color: 'text-indigo-400', bg: 'bg-indigo-950/40 border-indigo-800/50' },
    { label: 'Delayed Jobs', value: queueMetrics.delayed, icon: Activity, color: 'text-purple-400', bg: 'bg-purple-950/40 border-purple-800/50' },
    { label: 'Completed Jobs', value: queueMetrics.completed, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-950/40 border-emerald-800/50' },
    { label: 'Failed Jobs', value: queueMetrics.failed, icon: AlertTriangle, color: 'text-rose-400', bg: 'bg-rose-950/40 border-rose-800/50' },
    { label: 'Paused Jobs', value: queueMetrics.paused || 0, icon: PauseCircle, color: 'text-sky-400', bg: 'bg-sky-950/40 border-sky-800/50' },
    { label: 'Retries Executed', value: queueMetrics.retries || deadLetterEvents.filter((e: any) => e.status === 'RETRIED').length, icon: RotateCcw, color: 'text-teal-400', bg: 'bg-teal-950/40 border-teal-800/50' },
    { label: 'Dead Letter Queue (DLQ)', value: totalDlq, icon: Flame, color: pendingDlq > 0 ? 'text-rose-400' : 'text-amber-400', bg: pendingDlq > 0 ? 'bg-rose-950/50 border-rose-800/60' : 'bg-amber-950/40 border-amber-800/50', path: '/operations/dead-letter' },
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
            <div
              key={c.label}
              onClick={() => c.path && navigate(c.path)}
              className={`glass-card rounded-2xl p-5 border space-y-2 ${c.path ? 'cursor-pointer hover:border-indigo-600 transition-all' : ''}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">{c.label}</span>
                <div className={`p-2 rounded-xl border ${c.bg} ${c.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <h4 className="text-3xl font-black text-white">{c.value}</h4>
                {c.path && <ArrowRight className="w-4 h-4 text-slate-500 hover:text-white" />}
              </div>
            </div>
          );
        })}
      </div>

      {/* Dead Letter Callout Banner */}
      <div className="glass-panel rounded-2xl p-6 border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-rose-950/30">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-rose-950/80 border border-rose-800/60 text-rose-400 shrink-0">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white">Dead Letter Queue (DLQ) & Retry Policy</h4>
              {pendingDlq > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white">
                  {pendingDlq} Pending Retry
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Failed jobs are automatically retried up to 3 times with exponential backoff. Jobs exceeding maximum retry attempts are captured in the Dead Letter Queue for isolation, detailed error inspection, and manual re-queuing.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/operations/dead-letter')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-950 transition-all shrink-0"
        >
          <span>Open DLQ Console</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="glass-panel rounded-2xl p-6 border space-y-3">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Redis Worker Concurrency & Retry Strategy</h4>
        <p className="text-xs text-slate-400">
          Workers listen on queue <code className="text-indigo-300 font-mono">notification-events</code> with automatic exponential backoff retries (3 max attempts). Failed jobs transition to the Dead Letter Queue (<code className="text-rose-300 font-mono">DeadLetterEvent</code> model).
        </p>
      </div>
    </div>
  );
};
