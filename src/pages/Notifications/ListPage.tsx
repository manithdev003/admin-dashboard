import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { BellRing, User, Calendar, Filter, Layers } from 'lucide-react';
import { StatusBadge } from '../../components/StatusBadge';
import { EmptyState } from '../../components/EmptyState';
import { Application } from '../../types';
import { NOTIFICATION_CHANNELS } from '../../constants/channels';

export const NotificationsListPage: React.FC = () => {
  const { publishedEvents, applications, searchQuery } = useOutletContext<any>();

  const [selectedAppId, setSelectedAppId] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [recipientFilter, setRecipientFilter] = useState('');

  const filtered = publishedEvents.filter((item: any) => {
    const itemChannel = item.channel || item.event?.rules?.[0]?.channel || 'EMAIL';
    const matchesApp = !selectedAppId || item.applicationId === selectedAppId;
    const matchesChannel = !selectedChannel || itemChannel === selectedChannel;
    const matchesStatus = !selectedStatus || item.status === selectedStatus;
    const matchesRecipient = !recipientFilter || item.userId.toLowerCase().includes(recipientFilter.toLowerCase());

    const q = searchQuery.toLowerCase();
    const matchesQuery =
      item.id.toLowerCase().includes(q) ||
      item.userId.toLowerCase().includes(q) ||
      item.status.toLowerCase().includes(q);

    return matchesApp && matchesChannel && matchesStatus && matchesRecipient && matchesQuery;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white font-sans">Delivered Notifications ({filtered.length})</h3>
          <p className="text-xs text-slate-400 font-sans">All dispatched notifications across applications and channels.</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-card rounded-2xl p-4 border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Application</label>
          <select
            value={selectedAppId}
            onChange={(e) => setSelectedAppId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl glass-input"
          >
            <option value="">All Applications</option>
            {applications.map((app: Application) => (
              <option key={app.id} value={app.id}>{app.name} ({app.code})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Channel</label>
          <select
            value={selectedChannel}
            onChange={(e) => setSelectedChannel(e.target.value)}
            className="w-full px-3 py-2 rounded-xl glass-input"
          >
            <option value="">All Channels</option>
            {NOTIFICATION_CHANNELS.map((ch) => (
              <option key={ch} value={ch}>{ch}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Status</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 rounded-xl glass-input"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="PROCESSING">PROCESSING</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="FAILED">FAILED</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Recipient (userId)</label>
          <input
            type="text"
            value={recipientFilter}
            onChange={(e) => setRecipientFilter(e.target.value)}
            placeholder="Filter by userId..."
            className="w-full px-3 py-2 rounded-xl glass-input font-mono"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={BellRing}
          title="No Delivered Notifications"
          description="Dispatched notification logs will automatically appear here once events are published."
        />
      ) : (
        <div className="glass-card rounded-2xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 border-b border-slate-800 uppercase tracking-wider text-slate-400 font-semibold">
                <tr>
                  <th className="px-5 py-3">Correlation ID</th>
                  <th className="px-5 py-3">Recipient (userId)</th>
                  <th className="px-5 py-3">Channel</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Created Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filtered.map((item: any) => (
                  <tr key={item.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="px-5 py-3.5 text-indigo-300 font-bold">{item.correlationId || item.id}</td>
                    <td className="px-5 py-3.5 text-slate-200">
                      <div className="flex items-center gap-1.5 font-sans">
                        <User className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{item.userId}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-sans">
                      <StatusBadge status={item.channel || item.event?.rules?.[0]?.channel || 'EMAIL'} type="channel" />
                    </td>
                    <td className="px-5 py-3.5 font-sans">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-5 py-3.5 text-slate-400 font-sans">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>{new Date(item.createdAt).toLocaleString()}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};