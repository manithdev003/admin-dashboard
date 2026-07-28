import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, RefreshCw, Send, Settings, CheckCircle2, AlertCircle, ChevronRight, Sun, Moon, Palette } from 'lucide-react';
import { getStoredTheme, applyTheme, ThemeMode } from '../utils/theme';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onOpenSettings: () => void;
  healthConnected: boolean | null;
}

const pathMeta: Record<string, { title: string; subtitle: string; category: string }> = {
  '/': { category: 'Platform', title: 'System Overview & Telemetry', subtitle: 'Real-time metrics snapshot, service health, and quick actions' },
  '/applications': { category: 'Management', title: 'Applications', subtitle: 'Manage client applications and API tenant isolation codes' },
  '/events': { category: 'Management', title: 'Events', subtitle: 'Define notification events and JSON payload schemas per application' },
  '/templates': { category: 'Management', title: 'Templates', subtitle: 'Create message templates across PUSH, EMAIL, SMS, WHATSAPP, and IN_APP' },
  '/rules': { category: 'Management', title: 'Rule Engine', subtitle: 'Configure evaluation rules, priority ordering, and condition filters' },
  '/devices': { category: 'Management', title: 'Devices', subtitle: 'Registered user hardware devices, FCM tokens, and pulse status' },
  '/publisher': { category: 'Automation', title: 'Event Publisher Studio', subtitle: 'Interactive event payload editor, trigger simulator, and cURL generator' },
  '/automation/one-time': { category: 'Automation', title: 'One-Time Schedule', subtitle: 'Schedule delayed notification events for future date and time' },
  '/automation/recurring': { category: 'Automation', title: 'Recurring Schedule (Coming Soon)', subtitle: 'Cron and interval recurring notification jobs' },
  '/automation/conditions': { category: 'Automation', title: 'Condition Automation (Coming Soon)', subtitle: 'Multi-step event workflow automations and triggers' },
  '/notifications': { category: 'Delivery', title: 'Notifications', subtitle: 'List and search sent notifications across channels' },
  '/notification-logs': { category: 'Delivery', title: 'Notification Logs', subtitle: 'Detailed timeline logs, attempt counters, and error tracebacks' },
  '/operations/queue': { category: 'Operations', title: 'Queue Monitor', subtitle: 'Live BullMQ worker queues (Waiting, Active, Delayed, Failed, Paused)' },
  '/operations/metrics': { category: 'Operations', title: 'Prometheus & OpenTelemetry Metrics', subtitle: 'Throughput per minute, processing times, and success/failure rates' },
  '/operations/workers': { category: 'Operations', title: 'Background Workers', subtitle: 'Worker thread pool status, concurrency, and processed counts' },
  '/operations/health': { category: 'Operations', title: 'System Health', subtitle: 'Infrastructure status for Backend, Redis, MySQL, Firebase, and Workers' },
  '/settings': { category: 'System', title: 'Platform Settings', subtitle: 'Configure API endpoints, theme preferences, and dashboard defaults' },
};

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  onRefresh,
  isRefreshing,
  onOpenSettings,
  healthConnected,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>(getStoredTheme());

  const current = pathMeta[location.pathname] || {
    category: 'Console',
    title: 'Admin Dashboard',
    subtitle: 'Notification Automation Platform',
  };

  const cycleTheme = () => {
    let nextTheme: ThemeMode = 'dark';
    if (currentTheme === 'dark') nextTheme = 'glass';
    else if (currentTheme === 'glass') nextTheme = 'light';
    else nextTheme = 'dark';

    setCurrentTheme(nextTheme);
    applyTheme(nextTheme);
  };

  return (
    <header className="sticky top-0 z-20 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
      <div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-0.5">
          <span>{current.category}</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-indigo-400 font-semibold">{current.title}</span>
        </div>
        <p className="text-[11px] text-slate-400">{current.subtitle}</p>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        {/* Search Bar */}
        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search records..."
            className="w-full pl-8 pr-4 py-1.5 rounded-xl text-xs glass-input"
          />
        </div>

        {/* Theme Quick Switcher Button */}
        <button
          onClick={cycleTheme}
          title={`Current Theme: ${currentTheme.toUpperCase()} (Click to toggle)`}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-semibold transition-all"
        >
          {currentTheme === 'light' ? (
            <Sun className="w-3.5 h-3.5 text-amber-400" />
          ) : currentTheme === 'glass' ? (
            <Palette className="w-3.5 h-3.5 text-cyan-400" />
          ) : (
            <Moon className="w-3.5 h-3.5 text-indigo-400" />
          )}
          <span className="capitalize">{currentTheme}</span>
        </button>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          title="Refresh Data"
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
        </button>

        {/* Health Chip */}
        <button
          onClick={onOpenSettings}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
            healthConnected
              ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-300'
              : 'bg-rose-950/40 border-rose-800/50 text-rose-300'
          }`}
        >
          {healthConnected ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          )}
          <span>{healthConnected ? 'v1 Ready' : 'Offline'}</span>
          <Settings className="w-3.5 h-3.5 opacity-60 ml-1" />
        </button>

        {/* Quick Trigger Event Studio Button */}
        <button
          onClick={() => navigate('/publisher')}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold shadow-lg shadow-indigo-950/50 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Publish Event</span>
        </button>
      </div>
    </header>
  );
};
