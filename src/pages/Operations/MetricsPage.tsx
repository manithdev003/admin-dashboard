import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { BarChart3, TrendingUp, Clock, ShieldCheck, AlertCircle, Activity } from 'lucide-react';

export const MetricsPage: React.FC = () => {
  const { queueMetrics, publishedEvents = [] } = useOutletContext<any>();

  const completed = queueMetrics.completed || publishedEvents.filter((e: any) => e.status === 'COMPLETED').length;
  const failed = queueMetrics.failed || publishedEvents.filter((e: any) => e.status === 'FAILED').length;
  const total = completed + failed;

  const successRate = total > 0 ? ((completed / total) * 100).toFixed(1) : '100.0';
  const failureRate = total > 0 ? ((failed / total) * 100).toFixed(1) : '0.0';
  const activeQueueSize = (queueMetrics.waiting || 0) + (queueMetrics.active || 0) + (queueMetrics.delayed || 0);


  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-white">Prometheus & OpenTelemetry Telemetry Metrics</h3>
        <p className="text-xs text-slate-400">Live event processing throughput, queue latency distributions, and reliability SLAs.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-5 border space-y-2">
          <div className="flex items-center justify-between text-indigo-400">
            <span className="text-xs font-semibold text-slate-400">Total Processed</span>
            <TrendingUp className="w-4 h-4" />
          </div>
          <h4 className="text-3xl font-black text-white">{completed} jobs</h4>
          <span className="text-[10px] text-emerald-400 font-semibold">Live database count</span>
        </div>

        <div className="glass-card rounded-2xl p-5 border space-y-2">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs font-semibold text-slate-400">Active Queue</span>
            <Activity className="w-4 h-4" />
          </div>
          <h4 className="text-3xl font-black text-white">{activeQueueSize} jobs</h4>
          <span className="text-[10px] text-slate-400 font-semibold">BullMQ Redis Queue</span>
        </div>

        <div className="glass-card rounded-2xl p-5 border space-y-2">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs font-semibold text-slate-400">Success Rate</span>
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h4 className="text-3xl font-black text-emerald-400">{successRate}%</h4>
          <span className="text-[10px] text-emerald-400 font-semibold">Target SLA &gt; 99.0%</span>
        </div>

        <div className="glass-card rounded-2xl p-5 border space-y-2">
          <div className="flex items-center justify-between text-rose-400">
            <span className="text-xs font-semibold text-slate-400">Failure Rate</span>
            <AlertCircle className="w-4 h-4" />
          </div>
          <h4 className="text-3xl font-black text-rose-400">{failureRate}%</h4>
          <span className="text-[10px] text-slate-400 font-semibold">Token invalidations</span>
        </div>
      </div>


      {/* Grafana Embedded Dashboard */}
      <div className="glass-panel rounded-2xl p-6 border space-y-4">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" /> Advanced Grafana Telemetry
        </h4>
        <div className="w-full h-[600px] rounded-xl overflow-hidden border border-slate-700/50 bg-[#111217]">
          <iframe 
            src={import.meta.env.VITE_GRAFANA_URL || "http://localhost:3000/?orgId=1&kiosk"} 
            width="100%" 
            height="100%" 
            frameBorder="0"
            title="Grafana Dashboard"
          />
        </div>
      </div>
    </div>
  );
};
