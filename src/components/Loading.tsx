import React from 'react';

interface LoadingProps {
  type?: 'card' | 'table' | 'full';
  count?: number;
}

export const Loading: React.FC<LoadingProps> = ({ type = 'card', count = 3 }) => {
  if (type === 'full') {
    return (
      <div className="flex items-center justify-center p-12 min-h-[300px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-semibold animate-pulse">Loading dashboard telemetry...</p>
        </div>
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="glass-card rounded-2xl border p-4 space-y-3 animate-pulse">
        <div className="h-8 bg-slate-800/60 rounded-xl w-full" />
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="h-12 bg-slate-800/40 rounded-xl w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-card rounded-2xl p-5 border space-y-4 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 bg-slate-800/80 rounded-xl" />
            <div className="w-16 h-5 bg-slate-800/80 rounded-full" />
          </div>
          <div className="space-y-2">
            <div className="w-3/4 h-5 bg-slate-800/80 rounded-lg" />
            <div className="w-1/2 h-3 bg-slate-800/50 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
};
