import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Clock,
  RefreshCw,
  Search,
  Filter,
  Eye,
  X,
  Code2,
  Terminal,
  Layers,
  ArrowRight,
  Flame,
  ShieldAlert,
} from 'lucide-react';
import { DeadLetterEventModel, BatchDeadLetterEventModel } from '../../types';
import { EmptyState } from '../../components/EmptyState';

export const DeadLetterPage: React.FC = () => {
  const {
    deadLetterEvents = [],
    batchDeadLetterEvents = [],
    onRefresh,
    isRefreshing,
    onRetryDeadLetter,
    onRetryBatchDeadLetter,
    addToast,
  } = useOutletContext<any>();

  const [activeTab, setActiveTab] = useState<'standard' | 'batch'>('standard');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedEvent, setSelectedEvent] = useState<DeadLetterEventModel | null>(null);
  const [selectedBatchEvent, setSelectedBatchEvent] = useState<BatchDeadLetterEventModel | null>(null);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  // Filter logic
  const filteredEvents = deadLetterEvents.filter((item: DeadLetterEventModel) => {
    const matchesStatus = !selectedStatus || item.status === selectedStatus;
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      !q ||
      item.id.toLowerCase().includes(q) ||
      item.originalJobId.toLowerCase().includes(q) ||
      item.queueName?.toLowerCase().includes(q) ||
      item.publishedEventId?.toLowerCase().includes(q) ||
      item.errorMessage.toLowerCase().includes(q);

    return matchesStatus && matchesQuery;
  });

  const filteredBatchEvents = batchDeadLetterEvents.filter((item: BatchDeadLetterEventModel) => {
    const matchesStatus = !selectedStatus || item.status === selectedStatus;
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      !q ||
      item.id.toLowerCase().includes(q) ||
      item.originalJobId.toLowerCase().includes(q) ||
      item.application.toLowerCase().includes(q) ||
      item.event.toLowerCase().includes(q) ||
      item.errorMessage.toLowerCase().includes(q);

    return matchesStatus && matchesQuery;
  });

  const currentEvents = activeTab === 'standard' ? deadLetterEvents : batchDeadLetterEvents;
  const currentFiltered = activeTab === 'standard' ? filteredEvents : filteredBatchEvents;

  const totalCount = currentEvents.length;
  const pendingCount = currentEvents.filter((e: any) => e.status === 'PENDING').length;
  const retriedCount = currentEvents.filter((e: any) => e.status === 'RETRIED').length;
  const resolvedCount = currentEvents.filter((e: any) => e.status === 'RESOLVED').length;

  const handleRetry = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      setRetryingId(id);
      if (activeTab === 'standard') {
        await onRetryDeadLetter(id);
      } else {
        await onRetryBatchDeadLetter(id);
      }
      addToast('success', 'Retry Queued', `Dead letter event ${id.substring(0, 8)}... has been re-queued for processing.`);
      if (selectedEvent?.id === id) setSelectedEvent(null);
      if (selectedBatchEvent?.id === id) setSelectedBatchEvent(null);
    } catch (err: any) {
      addToast('error', 'Retry Failed', err?.response?.data?.message || err?.message || 'Failed to retry event');
    } finally {
      setRetryingId(null);
    }
  };

  const cards = [
    {
      label: 'Total DLQ Messages',
      value: totalCount,
      icon: Layers,
      color: 'text-indigo-400',
      bg: 'bg-indigo-950/40 border-indigo-800/50',
    },
    {
      label: 'Pending DLQ (Requires Action)',
      value: pendingCount,
      icon: AlertTriangle,
      color: pendingCount > 0 ? 'text-rose-400' : 'text-slate-400',
      bg: pendingCount > 0 ? 'bg-rose-950/50 border-rose-800/60' : 'bg-slate-900/40 border-slate-800/50',
      pulse: pendingCount > 0,
    },
    {
      label: 'Retried Items',
      value: retriedCount,
      icon: RotateCcw,
      color: 'text-amber-400',
      bg: 'bg-amber-950/40 border-amber-800/50',
    },
    {
      label: 'Resolved Items',
      value: resolvedCount,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bg: 'bg-emerald-950/40 border-emerald-800/50',
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-950/80 text-rose-400 border border-rose-800/80">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
            PENDING
          </span>
        );
      case 'RETRIED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-950/80 text-amber-400 border border-amber-800/80">
            <RotateCcw className="w-3 h-3 text-amber-400" />
            RETRIED
          </span>
        );
      case 'RESOLVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800/80">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            RESOLVED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-800 text-slate-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Refresh Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-lg font-bold text-white">Dead Letter Queue (DLQ) & Retry Dashboard</h3>
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-rose-500 text-white animate-pulse">
                {pendingCount} PENDING
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor exhausted jobs, inspect detailed stack traces, and manually trigger job retries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold shadow-md transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
            <span>Refresh DLQ</span>
          </button>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveTab('standard')}
          className={`px-4 py-2 text-sm font-semibold transition-colors border-b-2 ${
            activeTab === 'standard' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Standard Events
        </button>
        <button
          onClick={() => setActiveTab('batch')}
          className={`px-4 py-2 text-sm font-semibold transition-colors border-b-2 ${
            activeTab === 'batch' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Batch Events
        </button>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className={`glass-card rounded-2xl p-5 border ${c.bg} transition-all duration-200`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">{c.label}</span>
                <div className={`p-2 rounded-xl border bg-slate-950/50 ${c.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <h4 className="text-3xl font-black text-white tracking-tight">{c.value}</h4>
                {c.pulse && <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Action Needed</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters & Search Toolbar */}
      <div className="glass-card rounded-2xl p-4 border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Job ID, Event ID, Queue or Error..."
            className="w-full pl-9 pr-4 py-2 rounded-xl glass-input text-xs font-mono"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 text-xs font-semibold">Status:</span>
          </div>

          <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800">
            {[
              { id: '', label: 'All' },
              { id: 'PENDING', label: 'Pending' },
              { id: 'RETRIED', label: 'Retried' },
              { id: 'RESOLVED', label: 'Resolved' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setSelectedStatus(st.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  selectedStatus === st.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* DLQ Events Table */}
      {currentFiltered.length === 0 ? (
        <EmptyState
          icon={ShieldAlert}
          title={`No ${activeTab === 'batch' ? 'Batch ' : ''}Dead Letter Events Found`}
          description={
            searchQuery || selectedStatus
              ? 'No DLQ messages match your current filter criteria.'
              : 'Great job! There are currently no failed or exhausted jobs in the Dead Letter Queue.'
          }
        />
      ) : (
        <div className="glass-card rounded-2xl border overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 border-b border-slate-800 uppercase tracking-wider text-slate-400 font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Job / {activeTab === 'standard' ? 'Queue' : 'App'}</th>
                  <th className="px-5 py-3.5">Event ID</th>
                  <th className="px-5 py-3.5">Attempts</th>
                  <th className="px-5 py-3.5">Failure Reason</th>
                  <th className="px-5 py-3.5">Failed Time</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {currentFiltered.map((item: any) => {
                  const isRetrying = retryingId === item.id;
                  const canRetry = item.status !== 'RESOLVED';
                  
                  const isBatch = activeTab === 'batch';
                  const maxAttempts = isBatch ? 3 : (item.maxAttempts || 3);
                  const attemptsMade = isBatch ? item.retryCount : item.attemptsMade;

                  return (
                    <tr
                      key={item.id}
                      onClick={() => isBatch ? setSelectedBatchEvent(item) : setSelectedEvent(item)}
                      className="hover:bg-slate-900/60 transition-colors cursor-pointer group"
                    >
                      <td className="px-5 py-4">
                        <div className="font-bold text-indigo-300 flex items-center gap-1.5">
                          <Terminal className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span>Job #{item.originalJobId}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-sans mt-0.5">
                          {isBatch ? 'App:' : 'Queue:'} <code className="text-slate-300 bg-slate-900 px-1 py-0.5 rounded">{isBatch ? item.application : item.queueName}</code>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-slate-200">
                        <div className="truncate max-w-[140px] text-slate-300" title={isBatch ? item.event : item.publishedEventId}>
                          {isBatch ? item.event : item.publishedEventId}
                        </div>
                      </td>

                      <td className="px-5 py-4 font-sans">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-rose-500 h-full rounded-full transition-all"
                              style={{ width: `${Math.min(100, (attemptsMade / maxAttempts) * 100)}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-bold text-rose-300">
                            {attemptsMade}/{maxAttempts}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4 font-sans">
                        <div className="text-rose-300 font-semibold truncate max-w-[220px]" title={item.errorMessage}>
                          {item.errorMessage}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-slate-400 font-sans text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>{new Date(item.failedAt || item.createdAt).toLocaleString()}</span>
                        </div>
                      </td>

                      <td className="px-5 py-4 font-sans">{getStatusBadge(item.status)}</td>

                      <td className="px-5 py-4 text-right font-sans" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              isBatch ? setSelectedBatchEvent(item) : setSelectedEvent(item);
                            }}
                            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
                            title="View Full Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={(e) => handleRetry(item.id, e)}
                            disabled={!canRetry || isRetrying}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md ${
                              !canRetry
                                ? 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed'
                                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-950 hover:scale-[1.02]'
                            }`}
                            title="Re-enqueue job"
                          >
                            <RotateCcw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
                            <span>{isRetrying ? 'Retrying...' : 'Retry Event'}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Standard Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-rose-950/80 border border-rose-800/60 text-rose-400">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    Dead Letter Event Details #{selectedEvent.originalJobId}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">ID: {selectedEvent.id}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedEvent(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Event Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Queue Name</span>
                  <span className="font-mono text-indigo-300 font-semibold">{selectedEvent.queueName}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Attempts Exhausted</span>
                  <span className="font-mono text-rose-400 font-semibold">
                    {selectedEvent.attemptsMade} of {selectedEvent.maxAttempts || 3}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Status</span>
                  <div className="mt-1">{getStatusBadge(selectedEvent.status)}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Published Event ID</span>
                  <span className="font-mono text-slate-300 truncate block">{selectedEvent.publishedEventId}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Failed At</span>
                  <span className="text-slate-300 font-sans">
                    {new Date(selectedEvent.failedAt || selectedEvent.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Retried At</span>
                  <span className="text-slate-300 font-sans">
                    {selectedEvent.retriedAt ? new Date(selectedEvent.retriedAt).toLocaleString() : 'Never'}
                  </span>
                </div>
              </div>

              {/* Error Message */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> Error Summary
                </h4>
                <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-900/60 text-rose-300 font-mono text-xs leading-relaxed">
                  {selectedEvent.errorMessage}
                </div>
              </div>

              {/* Error Stack Trace */}
              {selectedEvent.errorStack && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-indigo-400" /> Stack Trace
                  </h4>
                  <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-mono text-[11px] overflow-x-auto leading-relaxed max-h-48">
                    {selectedEvent.errorStack}
                  </pre>
                </div>
              )}

              {/* Job Payload */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-purple-400" /> Event Payload (JSON)
                </h4>
                <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-indigo-300 font-mono text-[11px] overflow-x-auto leading-relaxed max-h-48">
                  {JSON.stringify(selectedEvent.payload, null, 2)}
                </pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
              >
                Close
              </button>

              <button
                onClick={() => handleRetry(selectedEvent.id)}
                disabled={selectedEvent.status === 'RESOLVED' || retryingId === selectedEvent.id}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-950 transition-all hover:scale-[1.02]"
              >
                <RotateCcw className={`w-4 h-4 ${retryingId === selectedEvent.id ? 'animate-spin' : ''}`} />
                <span>{retryingId === selectedEvent.id ? 'Queuing Retry...' : 'Retry Dead Letter Event'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Batch Event Details Modal */}
      {selectedBatchEvent && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-rose-950/80 border border-rose-800/60 text-rose-400">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    Batch Dead Letter Event #{selectedBatchEvent.originalJobId}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">ID: {selectedBatchEvent.id}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedBatchEvent(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Event Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Application / Event</span>
                  <span className="font-mono text-indigo-300 font-semibold">{selectedBatchEvent.application} / {selectedBatchEvent.event}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Retry Count</span>
                  <span className="font-mono text-rose-400 font-semibold">
                    {selectedBatchEvent.retryCount} of 3
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Status</span>
                  <div className="mt-1">{getStatusBadge(selectedBatchEvent.status)}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Channel</span>
                  <span className="font-mono text-slate-300 truncate block">{selectedBatchEvent.channel}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Failed At</span>
                  <span className="text-slate-300 font-sans">
                    {new Date(selectedBatchEvent.failedAt || selectedBatchEvent.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Retried At</span>
                  <span className="text-slate-300 font-sans">
                    {selectedBatchEvent.retriedAt ? new Date(selectedBatchEvent.retriedAt).toLocaleString() : 'Never'}
                  </span>
                </div>
              </div>

              {/* Error Message */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> Error Summary
                </h4>
                <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-900/60 text-rose-300 font-mono text-xs leading-relaxed">
                  {selectedBatchEvent.errorMessage}
                </div>
              </div>

              {/* Job Payload */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-purple-400" /> Notification Payload (JSON)
                </h4>
                <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-indigo-300 font-mono text-[11px] overflow-x-auto leading-relaxed max-h-48">
                  {JSON.stringify(selectedBatchEvent.notifications, null, 2)}
                </pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
              <button
                onClick={() => setSelectedBatchEvent(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
              >
                Close
              </button>

              <button
                onClick={() => handleRetry(selectedBatchEvent.id)}
                disabled={selectedBatchEvent.status === 'RESOLVED' || retryingId === selectedBatchEvent.id}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-950 transition-all hover:scale-[1.02]"
              >
                <RotateCcw className={`w-4 h-4 ${retryingId === selectedBatchEvent.id ? 'animate-spin' : ''}`} />
                <span>{retryingId === selectedBatchEvent.id ? 'Queuing Retry...' : 'Retry Batch Event'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

