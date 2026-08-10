import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Smartphone, Heart, Power, Trash2, Copy, Check, Plus, User, Mail, Phone, ShieldAlert } from 'lucide-react';
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
  const [email, setEmail] = useState('user101@example.com');
  const [phone, setPhone] = useState('');
  const [deviceId, setDeviceId] = useState('device-android-01');
  const [platform, setPlatform] = useState<DevicePlatform>('ANDROID');
  const [fcmToken, setFcmToken] = useState('fcm_token_dummy_sample_12345');
  const [loading, setLoading] = useState(false);

  const [selectedAppId, setSelectedAppId] = useState<string>('ALL');

  const filteredDevices = devices.filter((d: DeviceModel) => {
    if (selectedAppId !== 'ALL' && d.applicationId !== selectedAppId) return false;
    
    const q = searchQuery.toLowerCase();
    return (
      d.userId.toLowerCase().includes(q) ||
      (d.email && d.email.toLowerCase().includes(q)) ||
      (d.phone && d.phone.toLowerCase().includes(q)) ||
      d.deviceId.toLowerCase().includes(q) ||
      d.platform.toLowerCase().includes(q) ||
      (d.fcmToken && d.fcmToken.toLowerCase().includes(q))
    );
  });

  const groupedDevices = filteredDevices.reduce((acc: Record<string, DeviceModel[]>, device: DeviceModel) => {
    const appId = device.applicationId;
    if (!acc[appId]) {
      acc[appId] = [];
    }
    acc[appId].push(device);
    return acc;
  }, {});

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
    if (!appId || !userId.trim() || !email.trim() || !deviceId.trim() || !fcmToken.trim()) {
      addToast('error', 'Validation Error', 'Application, User ID, Email, Device ID, and FCM Token are required.');
      return;
    }
    setLoading(true);
    try {
      await onRegisterDevice(appId, {
        userId: userId.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
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

        <div className="flex items-center gap-4">
          {applications.length > 0 && (
            <select
              value={selectedAppId}
              onChange={(e) => setSelectedAppId(e.target.value)}
              className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 text-xs font-semibold focus:outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="ALL">All Applications</option>
              {applications.map((app: Application) => (
                <option key={app.id} value={app.id}>{app.name}</option>
              ))}
            </select>
          )}
          <button
            onClick={() => setIsRegisterOpen(true)}
            disabled={applications.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-950 transition-all disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>Register Device</span>
          </button>
        </div>
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
        <div className="space-y-8">
          {applications.map((app: Application) => {
            const appDevices = groupedDevices[app.id] || [];
            if (appDevices.length === 0) return null;

            return (
              <div key={app.id} className="space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-2">
                  <h4 className="text-sm font-bold text-slate-200">{app.name}</h4>
                  <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-lg">{app.code}</span>
                  <span className="text-xs font-semibold text-slate-500 ml-auto bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-800">{appDevices.length} Devices</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {appDevices.map((d: DeviceModel) => {
                    const devKey = d.id || d.deviceId;
                    return (
                      <div key={devKey} className="glass-card rounded-2xl p-5 border flex flex-col justify-between space-y-4 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-950/30 transition-all group">
                        <div>
                          <div className="flex items-start justify-between gap-3 min-w-0">
                            <div className="flex items-start gap-3 min-w-0 flex-1">
                              <div className="p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-800/40 text-emerald-400 shrink-0 group-hover:scale-105 transition-transform">
                                <Smartphone className="w-5 h-5" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <h4 className="text-xs font-bold text-white font-mono truncate flex-1" title={d.deviceId}>{d.deviceId}</h4>
                                  <button
                                    onClick={() => handleCopy(d.deviceId, `devid-${devKey}`)}
                                    className="text-slate-400 hover:text-emerald-300 p-0.5 rounded hover:bg-slate-800 transition-colors shrink-0"
                                    title="Copy Device ID"
                                  >
                                    {copiedId === `devid-${devKey}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                  </button>
                                </div>
                                <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-400 min-w-0">
                                  <User className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                                  <span className="truncate">User: <strong className="text-slate-200 font-mono">{d.userId}</strong></span>
                                  <button
                                    onClick={() => handleCopy(d.userId, `userid-${devKey}`)}
                                    className="text-slate-400 hover:text-indigo-300 p-0.5 rounded hover:bg-slate-800 transition-colors shrink-0"
                                    title="Copy User ID"
                                  >
                                    {copiedId === `userid-${devKey}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                  </button>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5 shrink-0 justify-end">
                              <StatusBadge status={d.platform} type="platform" />
                              <StatusBadge status={d.isActive} />
                            </div>
                          </div>

                          <div className="mt-3.5 space-y-1.5 text-xs text-slate-400 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60">
                            {d.email && (
                              <div className="flex items-center gap-1.5 text-slate-300 min-w-0">
                                <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                                <span className="font-mono text-[11px] truncate">{d.email}</span>
                              </div>
                            )}
                            {d.phone && (
                              <div className="flex items-center gap-1.5 text-slate-300 min-w-0">
                                <Phone className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                                <span className="font-mono text-[11px] truncate">{d.phone}</span>
                              </div>
                            )}
                          </div>

                          {/* FCM Token Box */}
                          <div className="mt-3.5 p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1 shadow-inner">
                            <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                              <span className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                                FCM TOKEN
                              </span>
                              <button
                                onClick={() => handleCopy(d.fcmToken, `token-${devKey}`)}
                                className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-sans text-[11px] font-semibold"
                              >
                                {copiedId === `token-${devKey}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                <span>Copy</span>
                              </button>
                            </div>
                            <p className="text-[11px] font-mono text-slate-300 truncate" title={d.fcmToken}>{d.fcmToken}</p>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span>Last Seen:</span>
                            <span className="text-slate-300 font-medium">{d.lastSeen ? new Date(d.lastSeen).toLocaleTimeString() : 'Active'}</span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
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
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">Email Address *</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@example.com" className="w-full px-4 py-2 rounded-xl glass-input text-sm font-mono" />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">Phone Number (Optional)</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1234567890" className="w-full px-4 py-2 rounded-xl glass-input text-sm font-mono" />
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
