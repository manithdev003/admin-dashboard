import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Smartphone, Heart, Power, Trash2, Copy, Check, Plus, User, ShieldAlert } from 'lucide-react';
import { Application, DeviceModel, DevicePlatform } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { ConfirmModal } from '../../components/ConfirmModal';
import { EmptyState } from '../../components/EmptyState';

export const DevicesPage: React.FC = () => {
  const { applications, devices, searchQuery, onRegisterDevice, onHeartbeatDevice, onDeactivateDevice, onDeleteDevice, addToast } = useOutletContext<any>();

  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [deletingDevice, setDeletingDevice] = useState<DeviceModel | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State
  const [appId, setAppId] = useState(applications[0]?.id || '');
  const [userId, setUserId] = useState('user-101');
  const [deviceId, setDeviceId] = useState('device-android-01');
  const [platform, setPlatform] = useState<DevicePlatform>('ANDROID');
  const [fcmToken, setFcmToken] = useState('fcm_token_dummy_sample_12345');
  const [loading, setLoading] = useState(false);

  const filteredDevices = devices.filter((d: DeviceModel) => {
    const q = searchQuery.toLowerCase();
    return (
      d.userId.toLowerCase().includes(q) ||
      d.deviceId.toLowerCase().includes(q) ||
      d.platform.toLowerCase().includes(q) ||
      (d.fcmToken && d.fcmToken.toLowerCase().includes(q))
    );
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    addToast('success', 'Token Copied!', 'FCM token copied to clipboard.');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleHeartbeat = async (device: DeviceModel) => {
    try {
      const targetId = device.id || device.deviceId;
      await onHeartbeatDevice(targetId);
      addToast('success', 'Heartbeat Updated', `Pulse recorded for "${device.deviceId}".`);
    } catch (err: any) {
      addToast('error', 'Heartbeat Failed', err.response?.data?.message || err.message);
    }
  };

  const handleDeactivate = async (device: DeviceModel) => {
    try {
      const targetId = device.id || device.deviceId;
      await onDeactivateDevice(targetId);
      addToast('info', 'Device Deactivated', `Device "${device.deviceId}" set to inactive.`);
    } catch (err: any) {
      addToast('error', 'Deactivation Failed', err.response?.data?.message || err.message);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingDevice) return;
    const targetId = deletingDevice.id || deletingDevice.deviceId;
    try {
      await onDeleteDevice(targetId);
      addToast('success', 'Device Removed', `Device "${deletingDevice.deviceId}" removed.`);
    } catch (err: any) {
      addToast('error', 'Delete Failed', err.response?.data?.message || err.message);
    }
  };

  const handleSaveRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appId || !userId.trim() || !deviceId.trim() || !fcmToken.trim()) {
      addToast('error', 'Validation Error', 'Application, User ID, Device ID, and FCM Token are required.');
      return;
    }
    setLoading(true);
    try {
      await onRegisterDevice(appId, {
        userId: userId.trim(),
        deviceId: deviceId.trim(),
        platform,
        fcmToken: fcmToken.trim(),
      });
      setIsRegisterOpen(false);
      addToast('success', 'Device Registered', `Registered device "${deviceId}".`);
    } catch (err: any) {
      addToast('error', 'Registration Failed', err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white">Registered User Hardware Devices ({filteredDevices.length})</h3>
          <p className="text-xs text-slate-400">Manage target mobile/web devices and Firebase FCM push tokens.</p>
        </div>

        <button
          onClick={() => setIsRegisterOpen(true)}
          disabled={applications.length === 0}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-950 transition-all disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>Register Device</span>
        </button>
      </div>

      {/* Grid */}
      {filteredDevices.length === 0 ? (
        <EmptyState
          icon={Smartphone}
          title="No Registered Devices"
          description="Register user hardware devices to start sending push notifications."
          actionLabel={applications.length > 0 ? 'Register Device' : undefined}
          onAction={() => setIsRegisterOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDevices.map((d: DeviceModel) => {
            const parentApp = applications.find((a: Application) => a.id === d.applicationId);
            return (
              <div key={d.id || d.deviceId} className="glass-card rounded-2xl p-5 border flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-800/40 text-emerald-400">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white font-mono">{d.deviceId}</h4>
                        <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-400">
                          <User className="w-3.5 h-3.5 text-indigo-400" />
                          <span>User: <strong className="text-slate-200">{d.userId}</strong></span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <StatusBadge status={d.platform} type="platform" />
                      <StatusBadge status={d.isActive} />
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-slate-400">
                    App: <strong className="text-slate-200">{parentApp?.name || d.applicationId}</strong>
                  </div>

                  {/* FCM Token Box */}
                  <div className="mt-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase">
                      <span>FCM Token</span>
                      <button
                        onClick={() => handleCopy(d.fcmToken, `token-${d.id}`)}
                        className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                      >
                        {copiedId === `token-${d.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>Copy</span>
                      </button>
                    </div>
                    <p className="text-[11px] font-mono text-slate-300 truncate">{d.fcmToken}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="text-[11px] text-slate-500">
                    Last Seen: <span className="text-slate-400">{d.lastSeen ? new Date(d.lastSeen).toLocaleTimeString() : 'Active'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleHeartbeat(d)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      title="Send Heartbeat Pulse"
                    >
                      <Heart className="w-4 h-4" />
                    </button>
                    {d.isActive && (
                      <button
                        onClick={() => handleDeactivate(d)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
                        title="Deactivate Token"
                      >
                        <Power className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => setDeletingDevice(d)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      title="Delete Device"
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

      {/* Modal */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <form onSubmit={handleSaveRegister} className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-modal space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-400" /> Register User Device
            </h3>

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">Target Application *</label>
              <select required value={appId} onChange={(e) => setAppId(e.target.value)} className="w-full px-4 py-2 rounded-xl glass-input text-sm">
                {applications.map((app: Application) => (
                  <option key={app.id} value={app.id}>{app.name} ({app.code})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">User ID *</label>
                <input type="text" required value={userId} onChange={(e) => setUserId(e.target.value)} className="w-full px-4 py-2 rounded-xl glass-input text-sm font-mono" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">Device ID *</label>
                <input type="text" required value={deviceId} onChange={(e) => setDeviceId(e.target.value)} className="w-full px-4 py-2 rounded-xl glass-input text-sm font-mono" />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">Platform *</label>
              <select value={platform} onChange={(e) => setPlatform(e.target.value as DevicePlatform)} className="w-full px-4 py-2 rounded-xl glass-input text-sm font-semibold">
                <option value="ANDROID">ANDROID</option>
                <option value="IOS">IOS</option>
                <option value="WEB">WEB</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">FCM Push Token *</label>
              <input type="text" required value={fcmToken} onChange={(e) => setFcmToken(e.target.value)} className="w-full px-4 py-2 rounded-xl glass-input text-sm font-mono" />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button type="button" onClick={() => setIsRegisterOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 rounded-xl">Cancel</button>
              <button type="submit" disabled={loading} className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl disabled:opacity-50">{loading ? 'Registering...' : 'Register'}</button>
            </div>
          </form>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deletingDevice}
        title="Delete Device?"
        message={`Are you sure you want to remove device "${deletingDevice?.deviceId}"?`}
        confirmLabel="Delete Device"
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeletingDevice(null)}
      />
    </div>
  );
};
