import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Clock, Calendar, Plus, XCircle, Trash2, RefreshCw, Send, Eye } from 'lucide-react';
import { Application, EventModel, ScheduledNotificationModel } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { ConfirmModal } from '../../components/ConfirmModal';
import { EmptyState } from '../../components/EmptyState';

const PRESET_PAYLOAD = JSON.stringify(
  {
    marketStatus: 'OPEN',
    topGainer: {
      symbol: 'TCS',
      changePercent: 5.4,
    },
    topLoser: {
      symbol: 'INFY',
      changePercent: -2.1,
    },
  },
  null,
  2
);

export const OneTimeSchedulePage: React.FC = () => {
  const {
    applications,
    events,
    scheduled,
    searchQuery,
    onCreateSchedule,
    onReschedule,
    onCancelSchedule,
    onDeleteSchedule,
    addToast,
  } = useOutletContext<any>();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [reschedulingItem, setReschedulingItem] = useState<ScheduledNotificationModel | null>(null);
  const [deletingItem, setDeletingItem] = useState<ScheduledNotificationModel | null>(null);
  const [viewingItem, setViewingItem] = useState<ScheduledNotificationModel | null>(null);

  // Form State
  const [appCode, setAppCode] = useState(applications[0]?.code || 'equity');
  const [eventCode, setEventCode] = useState(events[0]?.code || 'portfolio.summary.updated');
  const [userId, setUserId] = useState('oiEYUVV7rCIM57KNQwHgN42ivddqvqVe');
  const [payloadJson, setPayloadJson] = useState(PRESET_PAYLOAD);

  const defaultFutureDate = new Date(Date.now() + 10 * 60 * 1000).toISOString().slice(0, 16);
  const [sendAtInput, setSendAtInput] = useState(defaultFutureDate);
  const [newSendAt, setNewSendAt] = useState('');
  const [loading, setLoading] = useState(false);

  const availableEvents = events.filter((e: EventModel) => {
    const parentApp = applications.find((a: Application) => a.code === appCode);
    return !parentApp || e.applicationId === parentApp.id;
  });

  const filtered = scheduled.filter((item: ScheduledNotificationModel) => {
    const q = searchQuery.toLowerCase();
    return (
      item.id.toLowerCase().includes(q) ||
      item.status.toLowerCase().includes(q) ||
      (item.publishedEventId && item.publishedEventId.toLowerCase().includes(q))
    );
  });

  const openCreateModal = () => {
    const defaultApp = applications[0]?.code || 'equity';
    setAppCode(defaultApp);
    const parentAppObj = applications.find((a: Application) => a.code === defaultApp);
    const appEvts = events.filter((e: EventModel) => !parentAppObj || e.applicationId === parentAppObj.id);
    setEventCode(appEvts[0]?.code || 'portfolio.summary.updated');
    setUserId('oiEYUVV7rCIM57KNQwHgN42ivddqvqVe');
    setPayloadJson(PRESET_PAYLOAD);
    setSendAtInput(new Date(Date.now() + 10 * 60 * 1000).toISOString().slice(0, 16));
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
    if (!appCode || !eventCode || !userId.trim() || !sendAtInput) {
      addToast('error', 'Validation Error', 'Application, Event, User ID, and Send Date are required.');
      return;
    }

    const sendDateObj = new Date(sendAtInput);
    if (sendDateObj.getTime() <= Date.now()) {
      addToast('error', 'Past Date Error', 'Scheduled sendAt date must be in the FUTURE.');
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
      await onCreateSchedule({
        application: appCode,
        event: eventCode,
        userId: userId.trim(),
        payload: parsedPayload,
        sendAt: sendAtInput.replace('T', ' ') + ':00',
      });
      setIsCreateOpen(false);
      addToast('success', 'Scheduled Event Created!', `Scheduled for ${sendDateObj.toLocaleString()}`);
    } catch (err: any) {
      addToast('error', 'Schedule Failed', err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const openRescheduleModal = (item: ScheduledNotificationModel) => {
    setReschedulingItem(item);
    const dateObj = new Date(item.sendAt);
    setNewSendAt(dateObj.toISOString().slice(0, 16));
  };

  const handleSaveReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reschedulingItem || !newSendAt) return;
    const sendDateObj = new Date(newSendAt);
    if (sendDateObj.getTime() <= Date.now()) {
      addToast('error', 'Past Date Error', 'sendAt must be a FUTURE date and time.');
      return;
    }
    setLoading(true);
    try {
      await onReschedule(reschedulingItem.id, sendDateObj.toISOString());
      setReschedulingItem(null);
      addToast('success', 'Notification Rescheduled', `Rescheduled for ${sendDateObj.toLocaleString()}.`);
    } catch (err: any) {
      addToast('error', 'Reschedule Failed', err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelJob = async (item: ScheduledNotificationModel) => {
    try {
      await onCancelSchedule(item.id);
      addToast('info', 'Scheduled Job Cancelled', `Job ${item.id.substring(0, 8)} status set to CANCELLED.`);
    } catch (err: any) {
      addToast('error', 'Cancel Failed', err.response?.data?.message || err.message);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;
    try {
      await onDeleteSchedule(deletingItem.id);
      addToast('success', 'Scheduled Job Removed', 'Record removed.');
    } catch (err: any) {
      addToast('error', 'Delete Failed', err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white">One-Time Scheduled Queue ({filtered.length})</h3>
          <p className="text-xs text-slate-400">Delayed notification jobs scheduled for future single execution.</p>
        </div>

        <button
          onClick={openCreateModal}
          disabled={applications.length === 0 || events.length === 0}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-950 transition-all disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>New Scheduled Job</span>
        </button>
      </div>

      {/* Queue Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="Scheduled Queue is Empty"
          description="No pending or processed single execution jobs found."
          actionLabel={applications.length > 0 && events.length > 0 ? 'Schedule First Event' : undefined}
          onAction={openCreateModal}
        />
      ) : (
        <div className="glass-card rounded-2xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 border-b border-slate-800 uppercase tracking-wider text-slate-400 font-semibold">
                <tr>
                  <th className="px-5 py-3">Scheduled ID</th>
                  <th className="px-5 py-3">Event Ref</th>
                  <th className="px-5 py-3">Send Date & Time</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filtered.map((item: ScheduledNotificationModel) => (
                  <tr key={item.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="px-5 py-3.5 text-indigo-300 font-bold">{item.id}</td>
                    <td className="px-5 py-3.5 text-slate-300">{item.publishedEventId}</td>
                    <td className="px-5 py-3.5 text-slate-200 font-sans">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{new Date(item.sendAt).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-sans">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right font-sans">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewingItem(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {item.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => openRescheduleModal(item)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
                              title="Reschedule Send Time"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleCancelJob(item)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
                              title="Cancel Scheduled Job"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => setDeletingItem(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                          title="Delete Record"
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
              <Clock className="w-5 h-5 text-indigo-400" /> Schedule One-Time Event
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

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">User ID *</label>
              <input type="text" required value={userId} onChange={(e) => setUserId(e.target.value)} className="w-full px-4 py-2 rounded-xl glass-input text-sm font-mono" />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">Scheduled Future Send Date & Time (Must be FUTURE) *</label>
              <input type="datetime-local" required value={sendAtInput} onChange={(e) => setSendAtInput(e.target.value)} className="w-full px-4 py-2 rounded-xl glass-input text-sm" />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">Payload JSON</label>
              <textarea rows={4} value={payloadJson} onChange={(e) => setPayloadJson(e.target.value)} className="w-full p-3 rounded-xl glass-input font-mono text-xs text-emerald-300 resize-none" />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button type="button" onClick={() => setIsCreateOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 rounded-xl">Cancel</button>
              <button type="submit" disabled={loading} className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl disabled:opacity-50 flex items-center gap-2">
                <Send className="w-3.5 h-3.5" />
                <span>{loading ? 'Scheduling...' : 'Schedule Event'}</span>
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
              <Calendar className="w-5 h-5 text-indigo-400" /> Reschedule Job
            </h3>

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">New Send Date & Time *</label>
              <input type="datetime-local" required value={newSendAt} onChange={(e) => setNewSendAt(e.target.value)} className="w-full px-4 py-2 rounded-xl glass-input text-sm" />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button type="button" onClick={() => setReschedulingItem(null)} className="px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 rounded-xl">Cancel</button>
              <button type="submit" disabled={loading} className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl disabled:opacity-50">{loading ? 'Rescheduling...' : 'Reschedule'}</button>
            </div>
          </form>
        </div>
      )}

      {/* Details View Modal */}
      {viewingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-modal space-y-4 font-mono text-xs">
            <h3 className="text-base font-bold text-white font-sans flex items-center gap-2">
              <Eye className="w-4 h-4 text-indigo-400" /> Job Details
            </h3>

            <div className="space-y-2 p-3 rounded-xl bg-slate-950 border border-slate-800">
              <p><span className="text-slate-500">ID:</span> <span className="text-indigo-300 font-bold">{viewingItem.id}</span></p>
              <p><span className="text-slate-500">Published Event ID:</span> <span className="text-slate-200">{viewingItem.publishedEventId}</span></p>
              <p><span className="text-slate-500">BullMQ Job ID:</span> <span className="text-amber-400">{viewingItem.bullJobId || 'Pending'}</span></p>
              <p><span className="text-slate-500">Status:</span> <span className="text-emerald-400">{viewingItem.status}</span></p>
              <p><span className="text-slate-500">Send At:</span> <span className="text-slate-200 font-sans">{new Date(viewingItem.sendAt).toLocaleString()}</span></p>
            </div>

            <div className="flex justify-end">
              <button onClick={() => setViewingItem(null)} className="px-4 py-2 rounded-xl bg-slate-800 text-white font-sans text-xs">Close</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deletingItem}
        title="Delete Scheduled Record?"
        message="Are you sure you want to remove this record?"
        confirmLabel="Delete Record"
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeletingItem(null)}
      />
    </div>
  );
};
