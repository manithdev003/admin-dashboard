import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Edit2, Trash2, Zap, Layers, Copy, Check, Filter } from 'lucide-react';
import { Application, EventModel } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { ConfirmModal } from '../../components/ConfirmModal';
import { EmptyState } from '../../components/EmptyState';

export const EventsPage: React.FC = () => {
  const { applications, events, searchQuery, onCreateEvent, onUpdateEvent, onDeleteEvent, addToast } = useOutletContext<any>();

  const [selectedAppId, setSelectedAppId] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventModel | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<EventModel | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State
  const [targetAppId, setTargetAppId] = useState(applications[0]?.id || '');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const filteredEvents = events.filter((evt: EventModel) => {
    const matchesApp = !selectedAppId || evt.applicationId === selectedAppId;
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      evt.name.toLowerCase().includes(q) ||
      evt.code.toLowerCase().includes(q) ||
      (evt.description && evt.description.toLowerCase().includes(q));
    return matchesApp && matchesQuery;
  });

  const openCreateModal = () => {
    setTargetAppId(selectedAppId || (applications[0]?.id || ''));
    setName('');
    setCode('');
    setDescription('');
    setIsCreateOpen(true);
  };

  const openEditModal = (evt: EventModel) => {
    setEditingEvent(evt);
    setName(evt.name);
    setCode(evt.code);
    setDescription(evt.description || '');
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    addToast('success', 'Copied to clipboard!', text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetAppId || !name.trim() || !code.trim()) {
      addToast('error', 'Validation Error', 'Target Application, Event Name, and Event Code are required.');
      return;
    }
    setLoading(true);
    try {
      await onCreateEvent(targetAppId, { name: name.trim(), code: code.trim().toLowerCase(), description: description.trim() });
      setIsCreateOpen(false);
      addToast('success', 'Event Created', `Event "${name}" added successfully.`);
    } catch (err: any) {
      addToast('error', 'Create Failed', err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;
    setLoading(true);
    try {
      await onUpdateEvent(editingEvent.id, { name: name.trim(), code: code.trim().toLowerCase(), description: description.trim() });
      setEditingEvent(null);
      addToast('success', 'Event Updated', `Event "${name}" updated successfully.`);
    } catch (err: any) {
      addToast('error', 'Update Failed', err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingEvent) return;
    try {
      await onDeleteEvent(deletingEvent.id);
      addToast('success', 'Event Deleted', `Deleted event "${deletingEvent.name}".`);
    } catch (err: any) {
      addToast('error', 'Delete Failed', err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={selectedAppId}
              onChange={(e) => setSelectedAppId(e.target.value)}
              className="pl-8 pr-8 py-2 rounded-xl text-xs glass-input font-medium appearance-none cursor-pointer"
            >
              <option value="">All Applications ({applications.length})</option>
              {applications.map((app: Application) => (
                <option key={app.id} value={app.id}>
                  {app.name} ({app.code})
                </option>
              ))}
            </select>
          </div>
          <span className="text-xs text-slate-400">Total {filteredEvents.length} events</span>
        </div>

        <button
          onClick={openCreateModal}
          disabled={applications.length === 0}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-950 transition-all disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>New Event</span>
        </button>
      </div>

      {/* Grid */}
      {filteredEvents.length === 0 ? (
        <EmptyState
          icon={Zap}
          title="No Events Found"
          description={selectedAppId ? 'No events found for this application filter.' : 'Create event triggers to start publishing notifications.'}
          actionLabel={applications.length > 0 ? 'Create Event' : undefined}
          onAction={openCreateModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredEvents.map((evt: EventModel) => {
            const parentApp = applications.find((a: Application) => a.id === evt.applicationId);
            return (
              <div key={evt.id} className="glass-card rounded-2xl p-5 border flex flex-col justify-between space-y-4 hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-950/30 transition-all group">
                <div>
                  <div className="flex items-start justify-between gap-3 min-w-0">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="p-2.5 rounded-xl bg-amber-950/70 border border-amber-800/40 text-amber-400 shrink-0 group-hover:scale-105 transition-transform">
                        <Zap className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-base font-bold text-white leading-snug truncate" title={evt.name}>{evt.name}</h4>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-950/50 border border-amber-800/40 text-xs font-mono text-amber-300 font-semibold">
                            <span className="truncate max-w-[140px]">{evt.code}</span>
                          </span>
                          <button
                            onClick={() => handleCopy(evt.code, `code-${evt.id}`)}
                            className="text-slate-400 hover:text-amber-300 p-1 rounded hover:bg-slate-800 transition-colors"
                            title="Copy Event Code"
                          >
                            {copiedId === `code-${evt.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0">
                      <StatusBadge status={evt.status} />
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-slate-400 bg-slate-900/60 p-2 rounded-xl border border-slate-800/60">
                    <Layers className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span className="truncate">App: <strong className="text-slate-200">{parentApp?.name || evt.applicationId}</strong></span>
                  </div>

                  <p className="text-xs text-slate-400 mt-2.5 line-clamp-2 leading-relaxed">
                    {evt.description || 'No description specified.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 min-w-0">
                    <span className="text-slate-500 font-medium shrink-0">ID:</span>
                    <span className="font-mono text-slate-300 font-medium truncate" title={evt.id}>
                      {evt.id}
                    </span>
                    <button
                      onClick={() => handleCopy(evt.id, `evtid-${evt.id}`)}
                      className="p-1 text-slate-400 hover:text-amber-300 hover:bg-slate-800 rounded transition-colors shrink-0"
                      title="Copy Event ID"
                    >
                      {copiedId === `evtid-${evt.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => openEditModal(evt)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
                      title="Edit Event"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingEvent(evt)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      title="Delete Event"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <form onSubmit={handleSaveCreate} className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-modal space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-amber-400" /> Create Event
            </h3>

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">Target Application *</label>
              <select required value={targetAppId} onChange={(e) => setTargetAppId(e.target.value)} className="w-full px-4 py-2 rounded-xl glass-input text-sm">
                {applications.map((app: Application) => (
                  <option key={app.id} value={app.id}>{app.name} ({app.code})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">Event Name *</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Portfolio Summary Updated" className="w-full px-4 py-2 rounded-xl glass-input text-sm" />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">Event Code *</label>
              <input type="text" required value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. portfolio.summary.updated" className="w-full px-4 py-2 rounded-xl glass-input text-sm font-mono" />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">Description</label>
              <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-2 rounded-xl glass-input text-sm resize-none" />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button type="button" onClick={() => setIsCreateOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 rounded-xl">Cancel</button>
              <button type="submit" disabled={loading} className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl disabled:opacity-50">{loading ? 'Creating...' : 'Create Event'}</button>
            </div>
          </form>
        </div>
      )}

      {editingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <form onSubmit={handleSaveEdit} className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-modal space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-amber-400" /> Edit Event
            </h3>

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">Event Name *</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2 rounded-xl glass-input text-sm" />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">Event Code *</label>
              <input type="text" required value={code} onChange={(e) => setCode(e.target.value)} className="w-full px-4 py-2 rounded-xl glass-input text-sm font-mono" />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">Description</label>
              <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-2 rounded-xl glass-input text-sm resize-none" />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button type="button" onClick={() => setEditingEvent(null)} className="px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 rounded-xl">Cancel</button>
              <button type="submit" disabled={loading} className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl disabled:opacity-50">{loading ? 'Saving...' : 'Save Changes'}</button>
            </div>
          </form>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deletingEvent}
        title="Delete Event?"
        message={`Are you sure you want to delete event "${deletingEvent?.name}"?`}
        confirmLabel="Delete Event"
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeletingEvent(null)}
      />
    </div>
  );
};
