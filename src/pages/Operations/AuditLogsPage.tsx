import React, { useState } from 'react';
import { Activity, Search, Filter, AlertCircle, CheckCircle, Code, Eye, Trash2 } from 'lucide-react';
import { useAuditLogs, AuditLogModel } from '../../hooks/useAuditLogs';
import { StatusBadge } from '../../components/StatusBadge';
import { useOutletContext } from 'react-router-dom';

export const AuditLogsPage: React.FC = () => {
  const { addToast } = useOutletContext<any>();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [actionSearch, setActionSearch] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLogModel | null>(null);

  // Clear Logs State
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [clearRetention, setClearRetention] = useState('24h');

  const { logs, meta, isLoading, clearLogs, isClearing } = useAuditLogs(page, 50, {
    status: statusFilter || undefined,
    action: actionSearch || undefined,
  });

  const handleClearLogs = async () => {
    try {
      const res = await clearLogs(clearRetention);
      addToast('success', 'Logs Cleared', `Successfully deleted ${res.deletedCount} logs.`);
      setIsClearModalOpen(false);
    } catch (error) {
      addToast('error', 'Clear Failed', 'Failed to clear audit logs.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-400" /> System Audit Logs
          </h3>
          <p className="text-xs text-slate-400">Review all system actions, API requests, and application errors.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Action..."
              value={actionSearch}
              onChange={(e) => {
                setActionSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-300 w-48 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm font-semibold text-slate-300 focus:outline-none focus:border-indigo-500 transition-colors"
          >
            <option value="">All Statuses</option>
            <option value="SUCCESS">Success</option>
            <option value="ERROR">Error</option>
          </select>

          <button
            onClick={() => setIsClearModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-950/50 hover:bg-rose-900/50 text-rose-400 border border-rose-900/50 transition-colors text-sm font-semibold"
          >
            <Trash2 className="w-4 h-4" /> Clear Logs
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-800/50 text-xs uppercase text-slate-300">
              <tr>
                <th scope="col" className="px-6 py-4 font-bold">Status / Action</th>
                <th scope="col" className="px-6 py-4 font-bold">Endpoint</th>
                <th scope="col" className="px-6 py-4 font-bold">Timestamp</th>
                <th scope="col" className="px-6 py-4 font-bold">Details</th>
                <th scope="col" className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                      Loading logs...
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No logs found matching your filters.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="group hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {log.status === 'SUCCESS' ? (
                          <div className="p-1.5 rounded-lg bg-emerald-950/50 text-emerald-400">
                            <CheckCircle className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="p-1.5 rounded-lg bg-rose-950/50 text-rose-400 animate-pulse">
                            <AlertCircle className="w-4 h-4" />
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-white text-xs">{log.action}</p>
                          {log.method && <p className="text-[10px] font-mono font-bold text-indigo-400 uppercase mt-0.5">{log.method}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs text-slate-300 truncate max-w-[200px] block" title={log.endpoint}>
                        {log.endpoint || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      {log.status === 'ERROR' && log.errorMessage ? (
                        <p className="text-xs text-rose-400 line-clamp-2" title={log.errorMessage}>
                          {log.errorMessage}
                        </p>
                      ) : (
                        <span className="text-slate-500 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-indigo-400 hover:bg-slate-700 transition-colors inline-flex items-center gap-1"
                        title="View Metadata"
                      >
                        <Eye className="w-4 h-4" /> <span className="text-[10px] font-bold uppercase">View</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 bg-slate-800/30 border-t border-slate-800/80">
            <span className="text-xs text-slate-400">
              Page <strong className="text-white">{meta.page}</strong> of <strong className="text-white">{meta.totalPages}</strong>
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs font-bold text-slate-300 disabled:opacity-50 hover:bg-slate-700 transition-colors"
              >
                Previous
              </button>
              <button
                disabled={page === meta.totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs font-bold text-slate-300 disabled:opacity-50 hover:bg-slate-700 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Metadata Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full flex flex-col max-h-[85vh] shadow-2xl animate-modal overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <Code className="w-5 h-5 text-indigo-400" />
                <h3 className="text-lg font-bold text-white">Log Details</h3>
              </div>
              <button onClick={() => setSelectedLog(null)} className="text-slate-400 hover:text-white transition-colors">
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-4 bg-slate-950/50 p-4 rounded-xl border border-slate-800/50">
                 <div>
                   <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Action</p>
                   <p className="text-sm font-semibold text-slate-200">{selectedLog.action}</p>
                 </div>
                 <div>
                   <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Status</p>
                   <StatusBadge status={selectedLog.status} />
                 </div>
                 {selectedLog.endpoint && (
                   <div className="col-span-2">
                     <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Endpoint</p>
                     <p className="text-sm font-mono text-slate-300 break-all">{selectedLog.method} {selectedLog.endpoint}</p>
                   </div>
                 )}
              </div>
              
              {selectedLog.errorMessage && (
                <div>
                  <p className="text-xs font-bold text-rose-400 mb-2">Error Message</p>
                  <div className="bg-rose-950/30 border border-rose-900/50 rounded-xl p-4 overflow-x-auto">
                    <pre className="text-xs font-mono text-rose-300 whitespace-pre-wrap">{selectedLog.errorMessage}</pre>
                  </div>
                </div>
              )}

              <div>
                <p className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-2">Metadata / Payload</p>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 overflow-x-auto">
                  <pre className="text-[11px] font-mono text-emerald-400">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Clear Logs Modal */}
      {isClearModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-modal">
            <h3 className="text-lg font-bold text-white mb-2">Clear Audit Logs</h3>
            <p className="text-sm text-slate-400 mb-4">Choose a retention policy. Logs older than this timeframe will be permanently deleted.</p>
            
            <select
              value={clearRetention}
              onChange={(e) => setClearRetention(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-semibold text-slate-200 mb-6 focus:outline-none focus:border-indigo-500"
            >
              <option value="1h">Older than 1 Hour</option>
              <option value="24h">Older than 24 Hours</option>
              <option value="7d">Older than 7 Days</option>
              <option value="30d">Older than 30 Days</option>
              <option value="all">All Logs (Clear Database)</option>
            </select>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsClearModalOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleClearLogs}
                disabled={isClearing}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-bold shadow-lg shadow-rose-950 disabled:opacity-50 flex items-center gap-2"
              >
                {isClearing ? <Activity className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Confirm Deletion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
