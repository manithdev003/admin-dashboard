import React from 'react';

interface StatusBadgeProps {
  status?: string | boolean;
  type?: 'default' | 'channel' | 'platform' | 'status';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'default' }) => {
  let label = String(status);
  let colorClasses = 'bg-slate-800 text-slate-300 border-slate-700';

  if (typeof status === 'boolean') {
    label = status ? 'ACTIVE' : 'INACTIVE';
    colorClasses = status
      ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50'
      : 'bg-rose-950/60 text-rose-400 border-rose-800/50';
  } else if (status) {
    const s = String(status).toUpperCase();
    switch (s) {
      case 'ACTIVE':
      case 'COMPLETED':
      case 'ENABLED':
      case 'TRUE':
        colorClasses = 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50';
        break;
      case 'PENDING':
      case 'PROCESSING':
        colorClasses = 'bg-amber-950/60 text-amber-400 border-amber-800/50';
        break;
      case 'FAILED':
      case 'CANCELLED':
      case 'INACTIVE':
      case 'DISABLED':
      case 'FALSE':
        colorClasses = 'bg-rose-950/60 text-rose-400 border-rose-800/50';
        break;

      // Channels
      case 'PUSH':
        colorClasses = 'bg-purple-950/60 text-purple-400 border-purple-800/50';
        break;
      case 'EMAIL':
        colorClasses = 'bg-blue-950/60 text-blue-400 border-blue-800/50';
        break;
      case 'SMS':
        colorClasses = 'bg-teal-950/60 text-teal-400 border-teal-800/50';
        break;
      case 'WHATSAPP':
        colorClasses = 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50';
        break;
      case 'IN_APP':
        colorClasses = 'bg-indigo-950/60 text-indigo-400 border-indigo-800/50';
        break;

      // Platforms
      case 'ANDROID':
        colorClasses = 'bg-green-950/60 text-green-400 border-green-800/50';
        break;
      case 'IOS':
        colorClasses = 'bg-sky-950/60 text-sky-400 border-sky-800/50';
        break;
      case 'WEB':
        colorClasses = 'bg-cyan-950/60 text-cyan-400 border-cyan-800/50';
        break;
    }
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorClasses}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80" />
      {label}
    </span>
  );
};
