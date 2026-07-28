import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Edit2, Trash2, FileCode, Layers, Zap, Eye } from 'lucide-react';
import { Application, EventModel, NotificationTemplateModel, NotificationChannelType } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { ConfirmModal } from '../../components/ConfirmModal';
import { EmptyState } from '../../components/EmptyState';

const CHANNELS: NotificationChannelType[] = ['PUSH', 'EMAIL', 'SMS', 'WHATSAPP', 'IN_APP'];

export const TemplatesPage: React.FC = () => {
  const { applications, events, templates, searchQuery, onCreateTemplate, onUpdateTemplate, onDeleteTemplate, addToast } = useOutletContext<any>();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplateModel | null>(null);
  const [deletingTemplate, setDeletingTemplate] = useState<NotificationTemplateModel | null>(null);
  const [channelFilter, setChannelFilter] = useState<string>('');

  // Form state
  const [applicationId, setApplicationId] = useState(applications[0]?.id || '');
  const [eventId, setEventId] = useState('');
  const [channel, setChannel] = useState<NotificationChannelType>('PUSH');
  const [titleTemplate, setTitleTemplate] = useState('');
  const [bodyTemplate, setBodyTemplate] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(false);

  const availableEvents = events.filter((e: EventModel) => !applicationId || e.applicationId === applicationId);

  const filteredTemplates = templates.filter((tpl: NotificationTemplateModel) => {
    const matchesChannel = !channelFilter || tpl.channel === channelFilter;
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      tpl.titleTemplate.toLowerCase().includes(q) ||
      tpl.bodyTemplate.toLowerCase().includes(q) ||
      tpl.channel.toLowerCase().includes(q);
    return matchesChannel && matchesQuery;
  });

  const renderMustachePreview = (tplStr: string) => {
    return tplStr
      .replace(/\{\{\s*user\.name\s*\}\}/g, 'John Doe')
      .replace(/\{\{\s*app\.name\s*\}\}/g, 'Equity OS')
      .replace(/\{\{\s*otp\s*\}\}/g, '849201')
      .replace(/\{\{\s*marketStatus\s*\}\}/g, 'OPEN')
      .replace(/\{\{\s*topGainer\.symbol\s*\}\}/g, 'TCS');
  };

  const openCreateModal = () => {
    const defaultApp = applications[0]?.id || '';
    setApplicationId(defaultApp);
    const appEvents = events.filter((e: EventModel) => e.applicationId === defaultApp);
    setEventId(appEvents[0]?.id || '');
    setChannel('PUSH');
    setTitleTemplate('Portfolio Update: {{marketStatus}}');
    setBodyTemplate('Top Gainer: {{topGainer.symbol}}. Welcome {{user.name}}!');
    setEnabled(true);
    setIsCreateOpen(true);
  };

  const openEditModal = (tpl: NotificationTemplateModel) => {
    setEditingTemplate(tpl);
    setChannel(tpl.channel);
    setTitleTemplate(tpl.titleTemplate);
    setBodyTemplate(tpl.bodyTemplate);
    setEnabled(tpl.enabled);
  };

  const handleAppChange = (appId: string) => {
    setApplicationId(appId);
    const appEvts = events.filter((e: EventModel) => e.applicationId === appId);
    setEventId(appEvts[0]?.id || '');
  };

  const handleSaveCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicationId || !eventId || !titleTemplate.trim() || !bodyTemplate.trim()) {
      addToast('error', 'Validation Error', 'Application, Event, Title, and Body are required.');
      return;
    }
    setLoading(true);
    try {
      await onCreateTemplate({
        applicationId,
        eventId,
        channel,
        titleTemplate: titleTemplate.trim(),
        bodyTemplate: bodyTemplate.trim(),
        enabled,
      });
      setIsCreateOpen(false);
      addToast('success', 'Template Created', `${channel} template created.`);
    } catch (err: any) {
      addToast('error', 'Create Failed', err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate) return;
    setLoading(true);
    try {
      await onUpdateTemplate(editingTemplate.id, {
        channel,
        titleTemplate: titleTemplate.trim(),
        bodyTemplate: bodyTemplate.trim(),
        enabled,
      });
      setEditingTemplate(null);
      addToast('success', 'Template Updated', `Template updated successfully.`);
    } catch (err: any) {
      addToast('error', 'Update Failed', err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTemplate) return;
    try {
      await onDeleteTemplate(deletingTemplate.id);
      addToast('success', 'Template Deleted', 'Template removed successfully.');
    } catch (err: any) {
      addToast('error', 'Delete Failed', err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setChannelFilter('')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              !channelFilter ? 'bg-indigo-600 border-indigo-500 text-white' : 'glass-card text-slate-400 hover:text-white'
            }`}
          >
            All Channels
          </button>
          {CHANNELS.map((ch) => (
            <button
              key={ch}
              onClick={() => setChannelFilter(ch)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                channelFilter === ch ? 'bg-indigo-600 border-indigo-500 text-white' : 'glass-card text-slate-400 hover:text-white'
              }`}
            >
              {ch}
            </button>
          ))}
        </div>

        <button
          onClick={openCreateModal}
          disabled={applications.length === 0 || events.length === 0}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-950 transition-all disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>New Template</span>
        </button>
      </div>

      {/* Templates List */}
      {filteredTemplates.length === 0 ? (
        <EmptyState
          icon={FileCode}
          title="No Notification Templates"
          description={channelFilter ? `No templates found for ${channelFilter} channel.` : 'Create templates with mustache variables for auto-rendering.'}
          actionLabel={applications.length > 0 && events.length > 0 ? 'Create Template' : undefined}
          onAction={openCreateModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTemplates.map((tpl: NotificationTemplateModel) => {
            const parentApp = applications.find((a: Application) => a.id === tpl.applicationId);
            const parentEvt = events.find((e: EventModel) => e.id === tpl.eventId);
            return (
              <div key={tpl.id} className="glass-card rounded-2xl p-5 border flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all">
                <div>
                  <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-3 mb-3">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={tpl.channel} type="channel" />
                      <StatusBadge status={tpl.enabled} />
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEditModal(tpl)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeletingTemplate(tpl)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1 mb-3 text-xs">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Layers className="w-3.5 h-3.5 text-indigo-400" />
                      <span>App: <strong className="text-slate-200">{parentApp?.name || tpl.applicationId}</strong></span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span>Event: <strong className="text-slate-200">{parentEvt?.name || tpl.eventId}</strong> ({parentEvt?.code})</span>
                    </div>
                  </div>

                  {/* Rendered Preview & JSON Payload Box */}
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-indigo-300">
                      <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5 text-indigo-400" /> Live Rendered Output:</span>
                      <span className="text-[10px] text-slate-500 font-mono">Mustache Engine</span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 space-y-1">
                      <p className="text-xs font-bold text-white">{renderMustachePreview(tpl.titleTemplate)}</p>
                      <p className="text-xs text-slate-300 font-mono leading-relaxed">{renderMustachePreview(tpl.bodyTemplate)}</p>
                    </div>

                    {/* Variable List & JSON Payload Preview */}
                    <div className="pt-2 border-t border-slate-900 space-y-1.5">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Available Mustache Variables & Payload Preview</span>
                      <div className="flex flex-wrap gap-1 text-[10px] font-mono">
                        <span className="px-1.5 py-0.5 rounded bg-slate-900 text-indigo-300 border border-slate-800">user.name</span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-900 text-indigo-300 border border-slate-800">app.name</span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-900 text-indigo-300 border border-slate-800">otp</span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-900 text-indigo-300 border border-slate-800">marketStatus</span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-900 text-indigo-300 border border-slate-800">topGainer.symbol</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-800/60">
                  ID: <span className="font-mono text-slate-400">{tpl.id}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <form onSubmit={handleSaveCreate} className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-modal space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-400" /> Create Notification Template
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">Application *</label>
                <select required value={applicationId} onChange={(e) => handleAppChange(e.target.value)} className="w-full px-4 py-2 rounded-xl glass-input text-sm">
                  {applications.map((app: Application) => (
                    <option key={app.id} value={app.id}>{app.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">Event *</label>
                <select required value={eventId} onChange={(e) => setEventId(e.target.value)} className="w-full px-4 py-2 rounded-xl glass-input text-sm">
                  {availableEvents.map((evt: EventModel) => (
                    <option key={evt.id} value={evt.id}>{evt.name} ({evt.code})</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">Channel *</label>
              <select value={channel} onChange={(e) => setChannel(e.target.value as NotificationChannelType)} className="w-full px-4 py-2 rounded-xl glass-input text-sm font-semibold">
                {CHANNELS.map((ch) => (
                  <option key={ch} value={ch}>{ch}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">Title Template (Mustache e.g. {'{{user.name}}'}) *</label>
              <input type="text" required value={titleTemplate} onChange={(e) => setTitleTemplate(e.target.value)} className="w-full px-4 py-2 rounded-xl glass-input text-sm font-mono" />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">Body Template *</label>
              <textarea rows={4} required value={bodyTemplate} onChange={(e) => setBodyTemplate(e.target.value)} className="w-full px-4 py-2 rounded-xl glass-input text-sm font-mono resize-none" />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button type="button" onClick={() => setIsCreateOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 rounded-xl">Cancel</button>
              <button type="submit" disabled={loading} className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl disabled:opacity-50">{loading ? 'Creating...' : 'Create Template'}</button>
            </div>
          </form>
        </div>
      )}

      {editingTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <form onSubmit={handleSaveEdit} className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-modal space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-blue-400" /> Edit Template
            </h3>

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">Channel</label>
              <select value={channel} onChange={(e) => setChannel(e.target.value as NotificationChannelType)} className="w-full px-4 py-2 rounded-xl glass-input text-sm font-semibold">
                {CHANNELS.map((ch) => (
                  <option key={ch} value={ch}>{ch}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">Title Template *</label>
              <input type="text" required value={titleTemplate} onChange={(e) => setTitleTemplate(e.target.value)} className="w-full px-4 py-2 rounded-xl glass-input text-sm font-mono" />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">Body Template *</label>
              <textarea rows={4} required value={bodyTemplate} onChange={(e) => setBodyTemplate(e.target.value)} className="w-full px-4 py-2 rounded-xl glass-input text-sm font-mono resize-none" />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button type="button" onClick={() => setEditingTemplate(null)} className="px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 rounded-xl">Cancel</button>
              <button type="submit" disabled={loading} className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl disabled:opacity-50">{loading ? 'Saving...' : 'Save Changes'}</button>
            </div>
          </form>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deletingTemplate}
        title="Delete Template?"
        message="Are you sure you want to remove this notification template?"
        confirmLabel="Delete Template"
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeletingTemplate(null)}
      />
    </div>
  );
};
