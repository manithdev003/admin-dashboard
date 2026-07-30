import React from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import {
  Layers,
  Zap,
  FileCode,
  Sliders,
  Smartphone,
  Send,
  Clock,
  Activity,
  ShieldCheck,
  BellRing,
  Cpu,
  Database,
  Server,
  Flame,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export const OverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    applications,
    events,
    templates,
    rules,
    devices,
    scheduled,
    healthConnected,
    queueMetrics,
    systemHealth,
    publishedEvents = [],
    deadLetterEvents = [],
  } = useOutletContext<any>();

  const pendingDlqCount = deadLetterEvents.filter((e: any) => e.status === 'PENDING').length;

  const stats = [
    { label: 'Total Applications', count: applications.length, icon: Layers, path: '/applications', color: 'text-indigo-400', bg: 'bg-indigo-950/50 border-indigo-800/40' },
    { label: 'Total Events', count: events.length, icon: Zap, path: '/events', color: 'text-amber-400', bg: 'bg-amber-950/50 border-amber-800/40' },
    { label: 'Total Templates', count: templates.length, icon: FileCode, path: '/templates', color: 'text-blue-400', bg: 'bg-blue-950/50 border-blue-800/40' },
    { label: 'Total Rules', count: rules.length, icon: Sliders, path: '/rules', color: 'text-purple-400', bg: 'bg-purple-950/50 border-purple-800/40' },
    { label: 'Total Devices', count: devices.length, icon: Smartphone, path: '/devices', color: 'text-emerald-400', bg: 'bg-emerald-950/50 border-emerald-800/40' },
    { label: 'Dead Letter (DLQ)', count: pendingDlqCount > 0 ? `${pendingDlqCount} Pending` : deadLetterEvents.length, icon: AlertTriangle, path: '/operations/dead-letter', color: pendingDlqCount > 0 ? 'text-rose-400' : 'text-slate-400', bg: pendingDlqCount > 0 ? 'bg-rose-950/60 border-rose-800/60' : 'bg-slate-900/50 border-slate-800/40' },
    { label: 'Scheduled Jobs', count: scheduled.length, icon: Clock, path: '/automation/one-time', color: 'text-rose-400', bg: 'bg-rose-950/50 border-rose-800/40' },
    { label: 'Active Queue Jobs', count: queueMetrics.waiting + queueMetrics.active, icon: Activity, path: '/operations/queue', color: 'text-teal-400', bg: 'bg-teal-950/50 border-teal-800/40' },
  ];

  const infraStatus = [
    { label: 'Worker Process', ok: systemHealth.worker, icon: Cpu },
    { label: 'Redis Cache & Queue', ok: systemHealth.redis, icon: Server },
    { label: 'MySQL Database', ok: systemHealth.mysql, icon: Database },
    { label: 'Firebase Push API', ok: systemHealth.firebase, icon: Flame },
  ];

  return (
    <div className="space-y-6">
      {/* System Status Banner */}
      <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-2xl border ${healthConnected ? 'bg-emerald-950/80 border-emerald-800/60 text-emerald-400' : 'bg-rose-950/80 border-rose-800/60 text-rose-400'}`}>
              {healthConnected ? <ShieldCheck className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">Notification Engine Cluster</h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${healthConnected ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'}`}>
                  {healthConnected ? 'OPERATIONAL' : 'OFFLINE'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                API Version {systemHealth.apiVersion} • Prisma ORM • BullMQ Redis Queue Adapter
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/publisher')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-950 transition-all hover:scale-[1.02]"
            >
              <Send className="w-4 h-4" />
              <span>Launch Event Studio</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Cards Grid (8 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              onClick={() => navigate(stat.path)}
              className="glass-card rounded-2xl p-4 border cursor-pointer hover:border-slate-700 transition-all duration-200 group relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <div className={`p-2.5 rounded-xl border ${stat.bg} ${stat.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300 group-hover:translate-x-1 transition-all" />
              </div>
              <div className="mt-3">
                <h4 className="text-2xl font-black text-white tracking-tight">{stat.count}</h4>
                <p className="text-xs font-semibold text-slate-400 mt-0.5">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Infrastructure Telemetry Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Component Health */}
        <div className="glass-panel rounded-2xl p-5 border space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-400" /> Infrastructure Components
          </h4>
          <div className="space-y-2">
            {infraStatus.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                  <div className="flex items-center gap-2.5 text-slate-300 font-semibold">
                    <Icon className="w-4 h-4 text-slate-400" />
                    <span>{item.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium">
                    {item.ok ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 text-[11px]">Healthy</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                        <span className="text-rose-400 text-[11px]">Down</span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Recent Activity & Recent Errors Grid */}
        <div className="glass-panel rounded-2xl p-5 border space-y-3 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" /> Recent Activity & Diagnostic Errors
            </h4>
            <button onClick={() => navigate('/notification-logs')} className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold">
              View All Logs →
            </button>
          </div>
          <div className="space-y-2 text-xs">
            {publishedEvents.length === 0 && devices.filter((d: any) => !d.isActive).length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-900/60 text-slate-500 text-center text-xs">
                No recent activity recorded yet. Publish an event to see live logs.
              </div>
            ) : (
              <>
                {publishedEvents.slice(0, 3).map((item: any) => {
                  const isFailed = item.status === 'FAILED';
                  return (
                    <div
                      key={item.id}
                      className={`p-3 rounded-xl border flex items-center justify-between ${
                        isFailed ? 'bg-rose-950/40 border-rose-900/50' : 'bg-slate-900/80 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {isFailed ? (
                          <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                        )}
                        <span className={`font-mono ${isFailed ? 'text-rose-300 font-bold' : 'text-slate-300'}`}>
                          {isFailed ? 'error.event_failed' : 'event.published'}
                        </span>
                        <span className="text-slate-400 truncate max-w-[280px]">
                          {item.userId} ({item.status})
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 shrink-0">{new Date(item.createdAt).toLocaleTimeString()}</span>
                    </div>
                  );
                })}

                {devices.filter((d: any) => !d.isActive).slice(0, 2).map((d: any) => (
                  <div key={d.id} className="p-3 rounded-xl bg-amber-950/40 border border-amber-900/50 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="font-mono text-amber-300 font-bold">device.token_deactivated</span>
                      <span className="text-slate-400 truncate max-w-[280px]">
                        FCM token deactivated for {d.userId} ({d.platform})
                      </span>
                    </div>
                    <span className="text-[11px] text-amber-400 font-mono shrink-0">Deactivated</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
