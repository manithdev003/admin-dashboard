import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { ToastContainer, ToastMessage } from '../components/Toast';
import { SettingsModal } from '../components/SettingsModal';

interface DashboardLayoutProps {
  healthConnected: boolean | null;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  toasts: ToastMessage[];
  onDismissToast: (id: string) => void;
  onSavedSettings: () => void;
  contextValues: any;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  healthConnected,
  searchQuery,
  onSearchChange,
  onRefresh,
  isRefreshing,
  toasts,
  onDismissToast,
  onSavedSettings,
  contextValues,
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-indigo-500 selection:text-white font-sans">
      {/* Sidebar */}
      <Sidebar
        healthConnected={healthConnected}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          onRefresh={onRefresh}
          isRefreshing={isRefreshing}
          onOpenSettings={() => setIsSettingsOpen(true)}
          healthConnected={healthConnected}
        />

        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet context={contextValues} />
        </main>
      </div>

      {/* Toast System & Modals */}
      <ToastContainer toasts={toasts} onDismiss={onDismissToast} />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSaved={onSavedSettings}
      />
    </div>
  );
};
