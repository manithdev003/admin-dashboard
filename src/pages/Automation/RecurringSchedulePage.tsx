import React from 'react';
import { Repeat, Calendar, Clock, Sparkles } from 'lucide-react';

export const RecurringSchedulePage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-2xl p-12 text-center border relative overflow-hidden">
        <div className="w-16 h-16 rounded-2xl bg-amber-950/60 border border-amber-800/60 text-amber-400 flex items-center justify-center mx-auto mb-4">
          <Repeat className="w-8 h-8 animate-spin-slow" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-950 text-amber-400 border border-amber-800/60 mb-3 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" /> Coming Soon in v2.0
        </div>
        <h3 className="text-xl font-bold text-white">Recurring Cron & Interval Schedules</h3>
        <p className="text-xs text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
          Define automated cron schedules (e.g. <code className="text-amber-300 font-mono">0 9 * * 1-5</code>) or fixed interval triggers for daily portfolio digests and weekly market newsletters.
        </p>

        {/* Feature Preview Card Grid */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto text-left">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <Calendar className="w-5 h-5 text-amber-400" />
            <h4 className="text-xs font-bold text-white">Cron Syntax Editor</h4>
            <p className="text-[11px] text-slate-400">Visual expression builder with timezone awareness.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <Clock className="w-5 h-5 text-indigo-400" />
            <h4 className="text-xs font-bold text-white">Interval Loopers</h4>
            <p className="text-[11px] text-slate-400">Fixed rate repetitions (every 5 mins, hourly, monthly).</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <Repeat className="w-5 h-5 text-emerald-400" />
            <h4 className="text-xs font-bold text-white">Missed Job Recovery</h4>
            <p className="text-[11px] text-slate-400">Automatic backfill catchup for worker downtime.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
