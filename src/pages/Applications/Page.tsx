import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Edit2, Trash2, Copy, Check, Layers, Code, ChevronLeft, ChevronRight } from 'lucide-react';
import { Application } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { ConfirmModal } from '../../components/ConfirmModal';
import { EmptyState } from '../../components/EmptyState';

export const ApplicationsPage: React.FC = () => {
  const { applications, searchQuery, onCreateApp, onUpdateApp, onDeleteApp, addToast } = useOutletContext<any>();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [deletingApp, setDeletingApp] = useState<Application | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const filteredApps = applications.filter((app: Application) => {
    const q = searchQuery.toLowerCase();
    return (
      app.name.toLowerCase().includes(q) ||
      app.code.toLowerCase().includes(q) ||
      (app.description && app.description.toLowerCase().includes(q))
    );
  });

  const totalPages = Math.ceil(filteredApps.length / itemsPerPage) || 1;
  const paginatedApps = filteredApps.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const openCreateModal = () => {
    setName('');
    setCode('');
    setDescription('');
    setIsCreateOpen(true);
  };

  const openEditModal = (app: Application) => {
    setEditingApp(app);
    setName(app.name);
    setCode(app.code);
    setDescription(app.description || '');
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    addToast('success', 'Copied to clipboard!', text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      addToast('error', 'Validation Error', 'Name and Unique Code are required.');
      return;
    }
    setLoading(true);
    try {
      await onCreateApp({ name: name.trim(), code: code.trim().toLowerCase(), description: description.trim() });
      setIsCreateOpen(false);
      addToast('success', 'Application Created', `Application "${name}" added successfully.`);
    } catch (err: any) {
      addToast('error', 'Create Failed', err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingApp) return;
    setLoading(true);
    try {
      await onUpdateApp(editingApp.id, { name: name.trim(), code: code.trim().toLowerCase(), description: description.trim() });
      setEditingApp(null);
      addToast('success', 'Application Updated', `Application "${name}" updated successfully.`);
    } catch (err: any) {
      addToast('error', 'Update Failed', err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingApp) return;
    try {
      await onDeleteApp(deletingApp.id);
      addToast('success', 'Application Deleted', `Deleted application "${deletingApp.name}".`);
    } catch (err: any) {
      addToast('error', 'Delete Failed', err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white">Registered Applications ({filteredApps.length})</h3>
          <p className="text-xs text-slate-400">Applications serve as tenant boundaries for events and devices.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-950 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>New Application</span>
        </button>
      </div>

      {/* Grid List */}
      {filteredApps.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No Applications Found"
          description={searchQuery ? 'No applications match your search query.' : 'Create your first application to set up client API codes.'}
          actionLabel={searchQuery ? undefined : 'Create Application'}
          onAction={openCreateModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedApps.map((app: Application) => (
            <div key={app.id} className="glass-card rounded-2xl p-5 border flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-xl bg-indigo-950/70 border border-indigo-800/40 text-indigo-400">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white leading-snug">{app.name}</h4>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Code className="w-3 h-3 text-indigo-400" />
                        <span className="text-xs font-mono text-indigo-300 font-semibold">{app.code}</span>
                        <button
                          onClick={() => handleCopy(app.code, `code-${app.id}`)}
                          className="text-slate-500 hover:text-slate-300 p-0.5 rounded transition-colors"
                        >
                          {copiedId === `code-${app.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={app.status} />
                </div>

                <p className="text-xs text-slate-400 mt-3 line-clamp-2 leading-relaxed">
                  {app.description || 'No description provided.'}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <div className="text-[11px] text-slate-500">
                  ID: <span className="font-mono text-slate-400">{app.id.substring(0, 10)}...</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(app)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingApp(app)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <span className="text-xs text-slate-400">
            Page {currentPage} of {totalPages} ({filteredApps.length} total apps)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <form onSubmit={handleSaveCreate} className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-modal space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-400" /> Create Application
            </h3>

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">Application Name *</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Equity App" className="w-full px-4 py-2 rounded-xl glass-input text-sm" />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">Unique App Code *</label>
              <input type="text" required value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. equity" className="w-full px-4 py-2 rounded-xl glass-input text-sm font-mono" />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">Description</label>
              <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-2 rounded-xl glass-input text-sm resize-none" />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button type="button" onClick={() => setIsCreateOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 rounded-xl">Cancel</button>
              <button type="submit" disabled={loading} className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl disabled:opacity-50">{loading ? 'Creating...' : 'Create App'}</button>
            </div>
          </form>
        </div>
      )}

      {editingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <form onSubmit={handleSaveEdit} className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-modal space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-indigo-400" /> Edit Application
            </h3>

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">Application Name *</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2 rounded-xl glass-input text-sm" />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">Unique Code *</label>
              <input type="text" required value={code} onChange={(e) => setCode(e.target.value)} className="w-full px-4 py-2 rounded-xl glass-input text-sm font-mono" />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">Description</label>
              <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-2 rounded-xl glass-input text-sm resize-none" />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button type="button" onClick={() => setEditingApp(null)} className="px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 rounded-xl">Cancel</button>
              <button type="submit" disabled={loading} className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl disabled:opacity-50">{loading ? 'Saving...' : 'Save Changes'}</button>
            </div>
          </form>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deletingApp}
        title="Delete Application?"
        message={`Are you sure you want to delete "${deletingApp?.name}"?`}
        confirmLabel="Delete Application"
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeletingApp(null)}
      />
    </div>
  );
};
