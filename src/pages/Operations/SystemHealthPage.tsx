import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { ShieldCheck, Cpu, Database, Server, Flame, CheckCircle2, AlertCircle } from 'lucide-react';

export const SystemHealthPage: React.FC = () => {
  const { systemHealth, healthConnected } = useOutletContext<any>();

  const items = [
    { name: 'Backend API Service Express Engine', status: healthConnected, version: systemHealth.apiVersion, icon: ShieldCheck },
    { name: 'Redis Cache & Queue Adapter (BullMQ)', status: systemHealth.redis, version: 'Redis v7.2', icon: Server },
    { name: 'MySQL Relational Database Engine', status: systemHealth.mysql, version: 'Prisma Client 5.x', icon: Database },
    { name: 'Firebase Cloud Messaging Push Engine', status: systemHealth.firebase, version: 'FCM v1 API', icon: Flame },
    { name: 'Background Queue Worker Process', status: systemHealth.worker, version: 'Worker Thread', icon: Cpu },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-white">System Infrastructure Health & Dependencies</h3>
        <p className="text-xs text-slate-400">Diagnostic health probes for all connected datastores and messaging services.</p>
      </div>

      <div className="space-y-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.name} className="glass-card rounded-2xl p-5 border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl border ${item.status ? 'bg-emerald-950/60 border-emerald-800/60 text-emerald-400' : 'bg-rose-950/60 border-rose-800/60 text-rose-400'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{item.name}</h4>
                  <p className="text-xs text-slate-400">{item.version}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  item.status ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
                }`}>
                  {item.status ? 'ONLINE' : 'OFFLINE'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
