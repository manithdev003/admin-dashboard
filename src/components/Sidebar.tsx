import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Layers,
  Zap,
  FileCode,
  Sliders,
  Smartphone,
  Send,
  Clock,
  Repeat,
  GitBranch,
  BellRing,
  FileText,
  Mail,
  Activity,
  BarChart3,
  Cpu,
  ShieldCheck,
  Settings,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
} from 'lucide-react';

interface SidebarProps {
  healthConnected: boolean | null;
  onOpenSettings: () => void;
}

interface SidebarItem {
  path: string;
  label: string;
  icon: any;
  badge?: string;
}

interface SidebarGroup {
  label: string;
  items: SidebarItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ healthConnected, onOpenSettings }) => {
  const groups: SidebarGroup[] = [
    {
      label: 'Main',
      items: [
        { path: '/', label: 'Overview', icon: LayoutDashboard },
      ],
    },
    {
      label: 'Management',
      items: [
        { path: '/applications', label: 'Applications', icon: Layers },
        { path: '/events', label: 'Events', icon: Zap },
        { path: '/templates', label: 'Templates', icon: FileCode },
        { path: '/rules', label: 'Rules Engine', icon: Sliders },
        { path: '/devices', label: 'Devices', icon: Smartphone },
      ],
    },
    {
      label: 'Automation',
      items: [
        { path: '/publisher', label: 'Event Publisher', icon: Send },
        { path: '/automation/one-time', label: 'One-Time Schedule', icon: Clock },
        { path: '/automation/recurring', label: 'Recurring Schedule', icon: Repeat },
        { path: '/automation/conditions', label: 'Condition Automation', icon: GitBranch, badge: 'Soon' },
      ],
    },
    {
      label: 'Delivery',
      items: [
        { path: '/email-editor', label: 'Email Studio', icon: Mail },
        { path: '/notifications', label: 'Notifications', icon: BellRing },
        { path: '/notification-logs', label: 'Notification Logs', icon: FileText },
      ],
    },
    {
      label: 'Operations',
      items: [
        { path: '/operations/queue', label: 'Queue Monitor', icon: Activity },
        { path: '/operations/dead-letter', label: 'Dead Letter Queue', icon: AlertTriangle },
        { path: '/operations/metrics', label: 'Metrics', icon: BarChart3 },
        { path: '/operations/workers', label: 'Workers', icon: Cpu },
        { path: '/operations/health', label: 'System Health', icon: ShieldCheck },
      ],
    },
    {
      label: 'System',
      items: [
        { path: '/settings', label: 'Settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside className="w-64 border-r border-slate-800/80 bg-slate-950 flex flex-col h-screen sticky top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <BellRing className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-wide leading-tight">Notification Platform</h1>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-indigo-400">Supabase Studio Grade</span>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {groups.map((group) => (
          <div key={group.label} className="space-y-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              {group.label}
            </p>
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-950/50'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide bg-amber-950 text-amber-400 border border-amber-800/60">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer Connection Status */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60">
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800/80">
          <div className="flex items-center gap-2 overflow-hidden">
            <Activity className="w-4 h-4 text-indigo-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-slate-300 truncate">Platform API</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                {healthConnected === null ? (
                  <span className="text-[10px] text-amber-400">Checking...</span>
                ) : healthConnected ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span className="text-[10px] text-emerald-400 font-medium">Online</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3 h-3 text-rose-400" />
                    <span className="text-[10px] text-rose-400 font-medium">Offline</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onOpenSettings}
            title="Configure API Connection"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
