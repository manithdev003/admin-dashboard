import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Activity, CheckCircle2, ChevronRight, Clock, Zap, Send, CheckCheck } from 'lucide-react';
import { StatusBadge } from '../../components/StatusBadge';

export const NotificationsLogsPage: React.FC = () => {
  const { publishedEvents } = useOutletContext<any>();

  const steps = [
    { label: 'Generated', icon: Zap, color: 'text-amber-400' },
    { label: 'Queued', icon: Clock, color: 'text-indigo-400' },
    { label: 'Processing', icon: Activity, color: 'text-purple-400' },
    { label: 'Sent', icon: Send, color: 'text-sky-400' },
    { label: 'Delivered', icon: CheckCheck, color: 'text-emerald-400' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-white">Notification Execution Trajectory Timeline</h3>
        <p className="text-xs text-slate-400">Step-by-step pipeline progression for published events.</p>
      </div>

      <div className="space-y-4">
        {publishedEvents.length === 0 ? (
          <div className="p-8 rounded-xl glass-card text-center text-xs text-slate-500">
            No execution trajectory logs recorded yet.
          </div>
        ) : (
          publishedEvents.map((item: any, idx: number) => (
            <div key={item.id || idx} className="glass-card rounded-2xl p-5 border space-y-4">
              <div className="flex items-center justify-between font-mono text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-indigo-300 font-bold">{item.correlationId || item.id}</span>
                  <StatusBadge status={item.status} />
                </div>
                <span className="text-[11px] text-slate-500 font-sans">{new Date(item.createdAt).toLocaleString()}</span>
              </div>

              {/* Visual Step Timeline */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-900 flex items-center justify-between gap-2 overflow-x-auto">
                {steps.map((step, sIdx) => {
                  const Icon = step.icon;
                  const isCompleted = item.status === 'COMPLETED' || (item.status === 'PENDING' && sIdx <= 1);
                  return (
                    <React.Fragment key={step.label}>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className={`p-2 rounded-xl border ${isCompleted ? 'bg-emerald-950/60 border-emerald-800/60 text-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-600'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className={`text-xs font-bold ${isCompleted ? 'text-white' : 'text-slate-500'}`}>{step.label}</p>
                          <span className="text-[10px] text-slate-500">{isCompleted ? 'OK' : 'Pending'}</span>
                        </div>
                      </div>
                      {sIdx < steps.length - 1 && (
                        <ChevronRight className="w-4 h-4 text-slate-700 shrink-0" />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
