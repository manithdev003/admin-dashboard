import React from 'react';
import { BarChart3, TrendingUp, Clock, ShieldCheck, AlertCircle, Cpu } from 'lucide-react';

export const MetricsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-white">Prometheus & OpenTelemetry Platform Metrics</h3>
        <p className="text-xs text-slate-400">System throughput, latency distributions, and reliability metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-5 border space-y-2">
          <div className="flex items-center justify-between text-indigo-400">
            <span className="text-xs font-semibold text-slate-400">Throughput (min)</span>
            <TrendingUp className="w-4 h-4" />
          </div>
          <h4 className="text-3xl font-black text-white">42 msg/min</h4>
          <span className="text-[10px] text-emerald-400 font-semibold">+12% vs last hour</span>
        </div>

        <div className="glass-card rounded-2xl p-5 border space-y-2">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs font-semibold text-slate-400">Avg Latency</span>
            <Clock className="w-4 h-4" />
          </div>
          <h4 className="text-3xl font-black text-white">118 ms</h4>
          <span className="text-[10px] text-slate-400 font-semibold">p95: 184ms • p99: 310ms</span>
        </div>

        <div className="glass-card rounded-2xl p-5 border space-y-2">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs font-semibold text-slate-400">Success Rate</span>
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h4 className="text-3xl font-black text-emerald-400">98.4%</h4>
          <span className="text-[10px] text-emerald-400 font-semibold">Target SLA &gt; 99.0%</span>
        </div>

        <div className="glass-card rounded-2xl p-5 border space-y-2">
          <div className="flex items-center justify-between text-rose-400">
            <span className="text-xs font-semibold text-slate-400">Failure Rate</span>
            <AlertCircle className="w-4 h-4" />
          </div>
          <h4 className="text-3xl font-black text-rose-400">1.6%</h4>
          <span className="text-[10px] text-slate-400 font-semibold">Token invalidations</span>
        </div>
      </div>

      {/* Grafana-style visual graph mock */}
      <div className="glass-panel rounded-2xl p-6 border space-y-4">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-indigo-400" /> Real-time Throughput (OpenTelemetry Trace)
        </h4>

        <div className="h-48 flex items-end justify-between gap-2 pt-8 px-2 border-b border-slate-800">
          {[35, 42, 28, 55, 62, 48, 70, 85, 92, 60, 75, 88, 95, 100, 78, 65, 82, 90].map((height, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
              <div
                style={{ height: `${height}%` }}
                className="w-full bg-gradient-to-t from-indigo-600 via-indigo-500 to-purple-500 rounded-t-sm group-hover:brightness-125 transition-all"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
