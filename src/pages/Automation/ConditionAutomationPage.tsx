import React from 'react';
import { GitBranch, Zap, Layers, Sparkles } from 'lucide-react';

export const ConditionAutomationPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-2xl p-12 text-center border relative overflow-hidden">
        <div className="w-16 h-16 rounded-2xl bg-purple-950/60 border border-purple-800/60 text-purple-400 flex items-center justify-center mx-auto mb-4">
          <GitBranch className="w-8 h-8" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-950 text-purple-400 border border-purple-800/60 mb-3 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" /> Coming Soon in v2.0
        </div>
        <h3 className="text-xl font-bold text-white">Event-Driven Condition Workflow Automation</h3>
        <p className="text-xs text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
          Chain multi-step notification workflows with conditional branching, fallback channels (Push → Email → SMS), and user interaction hooks.
        </p>

        {/* Feature Preview Grid */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto text-left">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <GitBranch className="w-5 h-5 text-purple-400" />
            <h4 className="text-xs font-bold text-white">If/Else Branching</h4>
            <p className="text-[11px] text-slate-400">Route notifications based on user tier, region, or engagement.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <h4 className="text-xs font-bold text-white">Channel Escalation</h4>
            <p className="text-[11px] text-slate-400">Fallback to SMS if FCM push notification is unread after 15 mins.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <h4 className="text-xs font-bold text-white">Visual Flow Builder</h4>
            <p className="text-[11px] text-slate-400">Drag & drop workflow canvas for non-technical managers.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
