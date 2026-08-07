import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Repeat, Plus, PauseCircle, PlayCircle, Trash2, RefreshCw, Send, Calendar, Clock } from 'lucide-react';
import { Application, EventModel, RecurringScheduleModel } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { ConfirmModal } from '../../components/ConfirmModal';
import { EmptyState } from '../../components/EmptyState';

const CRON_PRESETS = [
  { label: 'Every Minute', cron: '* * * * *' },
  { label: 'Every Hour', cron: '0 * * * *' },
  { label: 'Daily at 9:00 AM', cron: '0 9 * * *' },
  { label: 'Mon-Fri at 9:00 AM', cron: '0 9 * * 1-5' },
];

const DEFAULT_PAYLOAD = JSON.stringify(
  {
    marketStatus: 'OPEN',
    topGainer: {
      symbol: 'TCS',
      changePercent: 5.4,
    },
  },
  null,
  2
);

export const RecurringSchedulePage: React.FC = () => {
  const {
    applications,
    events,
    recurringSchedules,
    searchQuery,
    onCreateRecurringSchedule,
    onPauseRecurringSchedule,
    onResumeRecurringSchedule,
    onRescheduleRecurringSchedule,
    onDeleteRecurringSchedule,
    addToast,
  } = useOutletContext<any>();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [reschedulingItem, setReschedulingItem] = useState<RecurringScheduleModel | null>(null);
  const [deletingItem, setDeletingItem] = useState<RecurringScheduleModel | null>(null);

  // Form State
  const [appCode, setAppCode] = useState(applications[0]?.code || 'equity');
  const [eventCode, setEventCode] = useState(events[0]?.code || 'portfolio.summary.updated');
  const [userId, setUserId] = useState('oiEYUVV7rCIM57KNQwHgN42ivddqvqVe');
  const [callbackUrl, setCallbackUrl] = useState('');
  const [cronExpression, setCronExpression] = useState('0 9 * * 1-5');
  const [payloadJson, setPayloadJson] = useState(DEFAULT_PAYLOAD);

  const [newCronExpression, setNewCronExpression] = useState('');
  const [loading, setLoading] = useState(false);

  const availableEvents = events.filter((e: EventModel) => {
    const parentApp = applications.find((a: Application) => a.code === appCode);
    return !parentApp || e.applicationId === parentApp.id;
  });

  const filtered = recurringSchedules.filter((item: RecurringScheduleModel) => {
    const q = searchQuery.toLowerCase();
    return (
      item.id.toLowerCase().includes(q) ||
      item.cronExpression.toLowerCase().includes(q) ||
      item.status.toLowerCase().includes(q) ||
      item.userId.toLowerCase().includes(q)
    );
  });

  const openCreateModal = () => {
    const defaultApp = applications[0]?.code || 'equity';
    setAppCode(defaultApp);
    const parentAppObj = applications.find((a: Application) => a.code === defaultApp);
    const appEvts = events.filter((e: EventModel) => !parentAppObj || e.applicationId === parentAppObj.id);
    setEventCode(appEvts[0]?.code || 'portfolio.summary.updated');
    setUserId('oiEYUVV7rCIM57KNQwHgN42ivddqvqVe');
    setCallbackUrl('');
    setCronExpression('0 9 * * 1-5');
    setPayloadJson(DEFAULT_PAYLOAD);
    setIsCreateOpen(true);
  };

  const handleAppChange = (code: string) => {
    setAppCode(code);
    const parentAppObj = applications.find((a: Application) => a.code === code);
    const appEvts = events.filter((e: EventModel) => !parentAppObj || e.applicationId === parentAppObj.id);
    if (appEvts.length > 0) {
      setEventCode(appEvts[0].code);
    }
  };

  const handleSaveCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appCode || !eventCode || !userId.trim() || !cronExpression.trim()) {
      addToast('error', 'Validation Error', 'Application, Event, User ID, and Cron Expression are required.');
      return;
    }

    if (cronExpression.trim().split(/\s+/).length !== 5) {
      addToast('error', 'Cron Error', 'Cron expression must have exactly 5 space-separated fields.');
      return;
    }

    let parsedPayload = {};
    try {
      parsedPayload = JSON.parse(payloadJson);
    } catch {
      addToast('error', 'Invalid JSON', 'Fix payload JSON syntax errors.');
      return;
    }

    setLoading(true);
    try {
      await onCreateRecurringSchedule({
        application: appCode,
        event: eventCode,
        userId: userId.trim(),
        callbackUrl: callbackUrl.trim() || undefined,
        payload: parsedPayload,
        cronExpression: cronExpression.trim(),
      });
      setIsCreateOpen(false);
      addToast('success', 'Recurring Schedule Created!', `Cron "${cronExpression}" registered successfully.`);
    } catch (err: any) {
      addToast('error', 'Schedule Creation Failed', err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePause = async (item: RecurringScheduleModel) => {
    try {
      await onPauseRecurringSchedule(item.id);
      addToast('info', 'Schedule Paused', `Cron schedule ${item.id.substring(0, 8)} paused.`);
    } catch (err: any) {
      addToast('error', 'Pause Failed', err.response?.data?.message || err.message);
    }
  };

  const handleResume = async (item: RecurringScheduleModel) => {
    try {
      await onResumeRecurringSchedule(item.id);
      addToast('success', 'Schedule Resumed', `Cron schedule ${item.id.substring(0, 8)} resumed.`);
    } catch (err: any) {
      addToast('error', 'Resume Failed', err.response?.data?.message || err.message);
    }
  };

  const openRescheduleModal = (item: RecurringScheduleModel) => {
    setReschedulingItem(item);
    setNewCronExpression(item.cronExpression);
  };

  const handleSaveReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reschedulingItem || !newCronExpression.trim()) return;

    if (newCronExpression.trim().split(/\s+/).length !== 5) {
      addToast('error', 'Cron Error', 'Cron expression must have 5 space-separated fields.');
      return;
    }

    setLoading(true);
    try {
      await onRescheduleRecurringSchedule(reschedulingItem.id, newCronExpression.trim());
      setReschedulingItem(null);
      addToast('success', 'Rescheduled Successfully', `New Cron expression: "${newCronExpression}".`);
    } catch (err: any) {
      addToast('error', 'Reschedule Failed', err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;
    try {
      await onDeleteRecurringSchedule(deletingItem.id);
      addToast('success', 'Recurring Schedule Removed', 'Record removed.');
    } catch (err: any) {
      addToast('error', 'Delete Failed', err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white">Recurring Cron Schedules ({filtered.length})</h3>
          <p className="text-xs text-slate-400">Automated recurring cron loopers (every minute, daily, weekly) powered by BullMQ Scheduler.</p>
        </div>

        <button
          onClick={openCreateModal}
          disabled={applications.length === 0 || events.length === 0}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-950 transition-all disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>New Recurring Schedule</span>
        </button>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Repeat}
          title="No Recurring Schedules"
          description="Create automated cron schedules for recurring newsletters, alerts, or daily digests."
          actionLabel={applications.length > 0 && events.length > 0 ? 'Create Recurring Schedule' : undefined}
          onAction={openCreateModal}
        />
      ) : (
        <div className="glass-card rounded-2xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 border-b border-slate-800 uppercase tracking-wider text-slate-400 font-semibold">
                <tr>
                  <th className="px-5 py-3">Schedule ID</th>
                  <th className="px-5 py-3">Recipient / Callback</th>
                  <th className="px-5 py-3">Cron Expression</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Created</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filtered.map((item: RecurringScheduleModel) => (
                  <tr key={item.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="px-5 py-3.5 text-indigo-300 font-bold">{item.id}</td>
                    <td className="px-5 py-3.5 text-slate-200 font-sans">
                      <div className="flex flex-col">
                        <span>{item.userId}</span>
                        {item.callbackUrl && <span className="text-[10px] text-indigo-300 truncate max-w-[200px]" title={item.callbackUrl}>{item.callbackUrl}</span>}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-amber-300 font-bold">
                      <div className="flex items-center gap-1.5 font-mono">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>{item.cronExpression}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-sans">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-5 py-3.5 text-slate-400 font-sans">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5 text-right font-sans">
                      <div className="flex items-center justify-end gap-1">
                        {item.status === 'ACTIVE' ? (
                          <button
                            onClick={() => handlePause(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
                            title="Pause Schedule"
                          >
                            <PauseCircle className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleResume(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
                            title="Resume Schedule"
                          >
                            <PlayCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => openRescheduleModal(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
                          title="Update Cron Expression"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingItem(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                          title="Delete Schedule"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <form onSubmit={handleSaveCreate} className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-modal space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Repeat className="w-5 h-5 text-amber-400" /> Create Recurring Cron Schedule
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">Application *</label>
                <select required value={appCode} onChange={(e) => handleAppChange(e.target.value)} className="w-full px-4 py-2 rounded-xl glass-input text-sm">
                  {applications.map((app: Application) => (
                    <option key={app.id} value={app.code}>{app.name} ({app.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">Event Code *</label>
                <select required value={eventCode} onChange={(e) => setEventCode(e.target.value)} className="w-full px-4 py-2 rounded-xl glass-input text-sm font-mono">
                  {availableEvents.map((evt: EventModel) => (
                    <option key={evt.id} value={evt.code}>{evt.name} ({evt.code})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">User ID *</label>
                <input type="text" required value={userId} onChange={(e) => setUserId(e.target.value)} className="w-full px-4 py-2 rounded-xl glass-input text-sm font-mono" />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">Callback URL</label>
                <input type="url" value={callbackUrl} onChange={(e) => setCallbackUrl(e.target.value)} placeholder="https://api.example.com/webhook" className="w-full px-4 py-2 rounded-xl glass-input text-sm font-mono" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Cron Expression (5 fields) *</label>
                <div className="flex gap-1">
                  {CRON_PRESETS.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setCronExpression(p.cron)}
                      className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-indigo-300 hover:bg-slate-700 font-mono"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
              <input type="text" required value={cronExpression} onChange={(e) => setCronExpression(e.target.value)} placeholder="0 9 * * 1-5" className="w-full px-4 py-2 rounded-xl glass-input text-sm font-mono text-amber-300 font-bold" />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">Payload JSON</label>
              <textarea rows={4} value={payloadJson} onChange={(e) => setPayloadJson(e.target.value)} className="w-full p-3 rounded-xl glass-input font-mono text-xs text-emerald-300 resize-none" />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button type="button" onClick={() => setIsCreateOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 rounded-xl">Cancel</button>
              <button type="submit" disabled={loading} className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl disabled:opacity-50 flex items-center gap-2">
                <Send className="w-3.5 h-3.5" />
                <span>{loading ? 'Creating...' : 'Create Cron Schedule'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reschedule Modal */}
      {reschedulingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <form onSubmit={handleSaveReschedule} className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-modal space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-amber-400" /> Update Cron Expression
            </h3>

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">New Cron Expression (5 fields) *</label>
              <input type="text" required value={newCronExpression} onChange={(e) => setNewCronExpression(e.target.value)} className="w-full px-4 py-2 rounded-xl glass-input text-sm font-mono text-amber-300 font-bold" />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button type="button" onClick={() => setReschedulingItem(null)} className="px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 rounded-xl">Cancel</button>
              <button type="submit" disabled={loading} className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl disabled:opacity-50">{loading ? 'Updating...' : 'Update Cron'}</button>
            </div>
          </form>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deletingItem}
        title="Delete Recurring Schedule?"
        message="Are you sure you want to remove this recurring schedule?"
        confirmLabel="Delete Schedule"
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeletingItem(null)}
      />
    </div>
  );
};
