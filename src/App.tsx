import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { DashboardLayout } from './layouts/DashboardLayout';
import { ToastMessage } from './components/Toast';

// Pages
import { OverviewPage } from './pages/Overview/Page';
import { ApplicationsPage } from './pages/Applications/Page';
import { EventsPage } from './pages/Events/Page';
import { TemplatesPage } from './pages/Templates/Page';
import { RulesPage } from './pages/Rules/Page';
import { DevicesPage } from './pages/Devices/Page';
import { PublisherPage } from './pages/Publisher/Page';
import { OneTimeSchedulePage } from './pages/Automation/OneTimeSchedulePage';
import { RecurringSchedulePage } from './pages/Automation/RecurringSchedulePage';
import { ConditionAutomationPage } from './pages/Automation/ConditionAutomationPage';
import { NotificationsListPage } from './pages/Notifications/ListPage';
import { NotificationsLogsPage } from './pages/Notifications/LogsPage';
import { QueueMonitorPage } from './pages/Operations/QueuePage';
import { DeadLetterPage } from './pages/Operations/DeadLetterPage';
import { MetricsPage } from './pages/Operations/MetricsPage';
import { WorkersPage } from './pages/Operations/WorkersPage';
import { SystemHealthPage } from './pages/Operations/SystemHealthPage';
import { SettingsPage } from './pages/Settings/Page';

// TanStack Query Custom Hooks
import { useApplications } from './hooks/useApplications';
import { useEvents } from './hooks/useEvents';
import { useTemplates } from './hooks/useTemplates';
import { useRules } from './hooks/useRules';
import { useDevices } from './hooks/useDevices';
import { useSchedules } from './hooks/useSchedules';
import { useRecurringSchedules } from './hooks/useRecurringSchedules';
import { useNotifications } from './hooks/useNotifications';
import { useOperations } from './hooks/useOperations';
import { useDeadLetter } from './hooks/useDeadLetter';

export const AppContent: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // TanStack Query Hooks
  const { applications, refetch: refetchApps, createApp, updateApp, deleteApp } = useApplications();
  const { events, refetch: refetchEvents, createEvent, updateEvent, deleteEvent } = useEvents(applications);
  const { templates, refetch: refetchTemplates, createTemplate, updateTemplate, deleteTemplate } = useTemplates();
  const { rules, refetch: refetchRules, createRule, updateRule, toggleRule, deleteRule } = useRules();
  const { devices, refetch: refetchDevices, registerDevice, heartbeatDevice, deactivateDevice, deleteDevice } = useDevices();
  const { scheduled, refetch: refetchSchedules, createSchedule, reschedule, cancelSchedule, deleteSchedule } = useSchedules();
  const {
    recurringSchedules,
    refetch: refetchRecurring,
    createRecurringSchedule,
    pauseRecurringSchedule,
    resumeRecurringSchedule,
    rescheduleRecurringSchedule,
    deleteRecurringSchedule,
  } = useRecurringSchedules();
  const { publishedEvents, refetch: refetchPublished, publishEvent } = useNotifications();
  const { deadLetterEvents, refetch: refetchDeadLetter, retryDeadLetter } = useDeadLetter();
  const { queueMetrics, systemHealth, refetchQueue, refetchHealth } = useOperations(scheduled, publishedEvents);

  const addToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const loadAllData = async () => {
    await Promise.all([
      refetchApps(),
      refetchEvents(),
      refetchTemplates(),
      refetchRules(),
      refetchDevices(),
      refetchSchedules(),
      refetchRecurring(),
      refetchPublished(),
      refetchDeadLetter(),
      refetchQueue(),
      refetchHealth(),
    ]);
  };

  const contextValues = {
    applications,
    events,
    templates,
    rules,
    devices,
    scheduled,
    recurringSchedules,
    publishedEvents,
    deadLetterEvents,
    healthConnected: systemHealth.backend,
    searchQuery,
    queueMetrics,
    systemHealth,
    onRefresh: loadAllData,
    isRefreshing: false,
    addToast,
    onRetryDeadLetter: retryDeadLetter,
    onCreateApp: createApp,
    onUpdateApp: (id: string, data: any) => updateApp({ id, data }),
    onDeleteApp: deleteApp,
    onCreateEvent: (applicationId: string, data: any) => createEvent({ applicationId, data }),
    onUpdateEvent: (id: string, data: any) => updateEvent({ id, data }),
    onDeleteEvent: deleteEvent,
    onCreateTemplate: createTemplate,
    onUpdateTemplate: (id: string, data: any) => updateTemplate({ id, data }),
    onDeleteTemplate: deleteTemplate,
    onCreateRule: createRule,
    onUpdateRule: (id: string, data: any) => updateRule({ id, data }),
    onToggleRule: (id: string, enabled: boolean) => toggleRule({ id, enabled }),
    onDeleteRule: deleteRule,
    onRegisterDevice: (appId: string, data: any) => registerDevice({ appId, data }),
    onHeartbeatDevice: heartbeatDevice,
    onDeactivateDevice: deactivateDevice,
    onDeleteDevice: deleteDevice,
    onCreateSchedule: createSchedule,
    onReschedule: (id: string, sendAt: string) => reschedule({ id, sendAt }),
    onCancelSchedule: cancelSchedule,
    onDeleteSchedule: deleteSchedule,
    onCreateRecurringSchedule: createRecurringSchedule,
    onPauseRecurringSchedule: pauseRecurringSchedule,
    onResumeRecurringSchedule: resumeRecurringSchedule,
    onRescheduleRecurringSchedule: (id: string, cronExpression: string) => rescheduleRecurringSchedule({ id, cronExpression }),
    onDeleteRecurringSchedule: deleteRecurringSchedule,
    onPublishEvent: publishEvent,
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <DashboardLayout
            healthConnected={systemHealth.backend}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onRefresh={loadAllData}
            isRefreshing={false}
            toasts={toasts}
            onDismissToast={removeToast}
            onSavedSettings={loadAllData}
            contextValues={contextValues}
          />
        }
      >
        <Route index element={<OverviewPage />} />
        <Route path="applications" element={<ApplicationsPage />} />
        <Route path="events" element={<EventsPage />} />
        <Route path="templates" element={<TemplatesPage />} />
        <Route path="rules" element={<RulesPage />} />
        <Route path="devices" element={<DevicesPage />} />
        <Route path="publisher" element={<PublisherPage />} />
        <Route path="automation/one-time" element={<OneTimeSchedulePage />} />
        <Route path="automation/recurring" element={<RecurringSchedulePage />} />
        <Route path="automation/conditions" element={<ConditionAutomationPage />} />
        <Route path="notifications" element={<NotificationsListPage />} />
        <Route path="notification-logs" element={<NotificationsLogsPage />} />
        <Route path="operations/queue" element={<QueueMonitorPage />} />
        <Route path="operations/dead-letter" element={<DeadLetterPage />} />
        <Route path="operations/metrics" element={<MetricsPage />} />
        <Route path="operations/workers" element={<WorkersPage />} />
        <Route path="operations/health" element={<SystemHealthPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </QueryClientProvider>
  );
};
