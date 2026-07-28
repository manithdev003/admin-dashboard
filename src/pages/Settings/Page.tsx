import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Save } from 'lucide-react';
import { getStoredApiUrl, setStoredApiUrl } from '../../services/api';
import { getStoredTheme, applyTheme, ThemeMode } from '../../utils/theme';

export const SettingsPage: React.FC = () => {
  const { onRefresh, addToast } = useOutletContext<any>();

  const [apiUrl, setApiUrl] = useState(getStoredApiUrl());
  const [theme, setTheme] = useState<ThemeMode>(getStoredTheme());
  const [autoRefresh, setAutoRefresh] = useState(true);

  const handleThemeChange = (newTheme: ThemeMode) => {
    setTheme(newTheme);
    applyTheme(newTheme);
    addToast('info', 'Theme Applied', `Dashboard theme changed to ${newTheme.toUpperCase()}.`);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiUrl.trim()) return;
    setStoredApiUrl(apiUrl.trim());
    applyTheme(theme);
    addToast('success', 'Settings Saved', 'Platform API base URL & theme preferences saved.');
    onRefresh();
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h3 className="text-lg font-bold text-white">Platform Settings & Environment</h3>
        <p className="text-xs text-slate-400">Configure microservice connection endpoints, theme options, and dashboard preferences.</p>
      </div>

      <form onSubmit={handleSave} className="glass-card rounded-2xl p-6 border space-y-5">
        <div>
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">
            Backend API Base URL (Express Engine) *
          </label>
          <input
            type="text"
            required
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            placeholder="http://localhost:3000/api/v1"
            className="w-full px-4 py-2.5 rounded-xl glass-input text-xs font-mono text-indigo-300 font-bold"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Accepts local endpoints (<code className="text-slate-300">http://localhost:3000/api/v1</code>) or Ngrok tunnels (<code className="text-slate-300">https://xxxx.ngrok-free.dev/api/v1</code>).
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">
              Dashboard Theme *
            </label>
            <select
              value={theme}
              onChange={(e) => handleThemeChange(e.target.value as ThemeMode)}
              className="w-full px-4 py-2 rounded-xl glass-input text-xs font-semibold"
            >
              <option value="dark">Supabase Dark Mode (Default Slate)</option>
              <option value="glass">Cyber Neon Glass (Obsidian & Cyan)</option>
              <option value="light">Minimalist Light Mode (Crisp White)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">
              Auto-Refresh Telemetry
            </label>
            <select
              value={autoRefresh ? 'enabled' : 'disabled'}
              onChange={(e) => setAutoRefresh(e.target.value === 'enabled')}
              className="w-full px-4 py-2 rounded-xl glass-input text-xs font-semibold"
            >
              <option value="enabled">Enabled (Every 30s)</option>
              <option value="disabled">Disabled (Manual Only)</option>
            </select>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-950 transition-all hover:scale-[1.02]"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
};
