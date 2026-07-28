import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Send, Play, Copy, Check, Terminal, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Application, EventModel } from '../../types';
import { publisherService } from '../../services/publisher.service';
import { getStoredApiUrl } from '../../services/api';

const PRESET_PAYLOADS: Record<string, any> = {
  'Portfolio Summary': {
    marketStatus: 'OPEN',
    topGainer: {
      symbol: 'TCS',
      changePercent: 5.42,
    },
    topLoser: {
      symbol: 'INFY',
      changePercent: -3.18,
    },
  },
  'Welcome User': {
    user: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'ADMIN',
    },
    app: {
      name: 'Notification OS',
    },
  },
  'Order Placed': {
    orderId: 'ORD-998822',
    amount: 299.99,
    currency: 'USD',
    itemsCount: 3,
    user: {
      name: 'Alice Smith',
      tier: 'GOLD',
    },
  },
  'Security OTP Alert': {
    otp: '589210',
    validMinutes: 10,
    device: 'iPhone 15 Pro',
    ip: '192.168.1.45',
  },
};

export const PublisherPage: React.FC = () => {
  const { applications, events, addToast } = useOutletContext<any>();

  const [selectedAppCode, setSelectedAppCode] = useState(applications[0]?.code || 'equity');
  const [selectedEventCode, setSelectedEventCode] = useState(events[0]?.code || 'portfolio.summary.updated');
  const [userId, setUserId] = useState('oiEYUVV7rCIM57KNQwHgN42ivddqvqVe');
  const [payloadJson, setPayloadJson] = useState(JSON.stringify(PRESET_PAYLOADS['Portfolio Summary'], null, 2));

  const [loading, setLoading] = useState(false);
  const [responseResult, setResponseResult] = useState<any>(null);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [copiedBody, setCopiedBody] = useState(false);

  const selectedApp = applications.find((a: Application) => a.code === selectedAppCode);
  const availableEvents = events.filter((e: EventModel) => !selectedApp || e.applicationId === selectedApp.id);

  const handleAppChange = (code: string) => {
    setSelectedAppCode(code);
    const parentAppObj = applications.find((a: Application) => a.code === code);
    const appEvts = events.filter((e: EventModel) => !parentAppObj || e.applicationId === parentAppObj.id);
    if (appEvts.length > 0) {
      setSelectedEventCode(appEvts[0].code);
    }
  };

  const cleanPayload = (data: any): any => {
    if (data && typeof data === 'object' && !Array.isArray(data) && data.payload && typeof data.payload === 'object' && !Array.isArray(data.payload)) {
      return cleanPayload(data.payload);
    }
    return data;
  };

  const getFinalPayloadObject = () => {
    let body = {};
    try {
      body = cleanPayload(JSON.parse(payloadJson));
    } catch {
      body = {};
    }
    return {
      application: selectedAppCode,
      event: selectedEventCode,
      userId: userId.trim(),
      payload: body,
    };
  };

  const generateCurl = () => {
    const baseUrl = getStoredApiUrl();
    const dataObj = getFinalPayloadObject();
    return `curl -X POST "${baseUrl}/publishEvents/publish" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(dataObj, null, 2)}'`;
  };

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(generateCurl());
    setCopiedCurl(true);
    addToast('success', 'cURL Copied', 'Paste in terminal or Postman.');
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  const handleCopyBody = () => {
    navigator.clipboard.writeText(JSON.stringify(getFinalPayloadObject(), null, 2));
    setCopiedBody(true);
    addToast('success', 'JSON Copied', 'Flat request JSON copied to clipboard.');
    setTimeout(() => setCopiedBody(false), 2000);
  };

  const handleTriggerEvent = async () => {
    let parsedPayload = {};
    try {
      parsedPayload = cleanPayload(JSON.parse(payloadJson));
    } catch (err: any) {
      addToast('error', 'Invalid Payload JSON', 'Fix syntax errors before sending.');
      return;
    }

    setLoading(true);
    setResponseResult(null);
    try {
      const res = await publisherService.publish({
        application: selectedAppCode,
        event: selectedEventCode,
        userId: userId.trim(),
        payload: parsedPayload,
      });
      setResponseResult({
        success: true,
        data: res,
        timestamp: new Date().toISOString(),
      });
      addToast('success', 'Event Published Successfully!', `Correlation ID: ${res.data?.correlationId || res.correlationId || 'OK'}`);
    } catch (err: any) {
      const errData = err.response?.data || { message: err.message };
      setResponseResult({
        success: false,
        data: errData,
        timestamp: new Date().toISOString(),
      });
      addToast('error', 'Publish Failed', errData.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Form Editor Column */}
      <div className="lg:col-span-7 space-y-6">
        <div className="glass-card rounded-2xl p-6 border space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Send className="w-5 h-5 text-indigo-400" /> Event Publisher Studio
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Simulate client microservice events and test template rendering.</p>
            </div>
            <button
              onClick={handleTriggerEvent}
              disabled={loading || applications.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold shadow-lg shadow-indigo-950/60 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              <Play className={`w-4 h-4 fill-white ${loading ? 'animate-pulse' : ''}`} />
              <span>{loading ? 'Publishing...' : 'Trigger & Publish Event'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">Target Application *</label>
              <select
                value={selectedAppCode}
                onChange={(e) => handleAppChange(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-xs font-medium"
              >
                {applications.map((app: Application) => (
                  <option key={app.id} value={app.code}>{app.name} ({app.code})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">Target Event Code *</label>
              <select
                value={selectedEventCode}
                onChange={(e) => setSelectedEventCode(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-xs font-mono font-medium"
              >
                {availableEvents.map((evt: EventModel) => (
                  <option key={evt.id} value={evt.code}>{evt.name} ({evt.code})</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">User Identifier (userId) *</label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="e.g. oiEYUVV7rCIM57KNQwHgN42ivddqvqVe"
              className="w-full px-4 py-2.5 rounded-xl glass-input text-xs font-mono text-indigo-300 font-bold"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Event Payload (JSON)
              </label>
              <div className="flex items-center gap-1">
                {Object.keys(PRESET_PAYLOADS).map((presetKey) => (
                  <button
                    key={presetKey}
                    onClick={() => setPayloadJson(JSON.stringify(PRESET_PAYLOADS[presetKey], null, 2))}
                    className="px-2 py-1 rounded text-[10px] font-semibold bg-slate-900 hover:bg-slate-800 text-indigo-300 border border-slate-800 transition-colors"
                  >
                    + {presetKey}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              rows={9}
              value={payloadJson}
              onChange={(e) => setPayloadJson(e.target.value)}
              className="w-full p-4 rounded-xl glass-input font-mono text-xs text-emerald-300 leading-relaxed resize-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
        </div>

        {/* cURL Snippet Panel */}
        <div className="glass-panel rounded-2xl p-5 border space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" /> Instant cURL Command Generator
            </h4>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyBody}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors"
              >
                {copiedBody ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy JSON</span>
              </button>
              <button
                onClick={handleCopyCurl}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-300 hover:text-white bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors"
              >
                {copiedCurl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy cURL</span>
              </button>
            </div>
          </div>
          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-900 font-mono text-[11px] text-slate-300 overflow-x-auto whitespace-pre-wrap select-all">
            {generateCurl()}
          </pre>
        </div>
      </div>

      {/* Right Execution Inspector Column */}
      <div className="lg:col-span-5 space-y-6">
        <div className="glass-panel rounded-2xl p-6 border space-y-4 h-full flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-indigo-400" /> Response Inspector & Recent Execution Log
            </h4>

            {!responseResult ? (
              <div className="p-8 rounded-xl bg-slate-950/60 border border-slate-900 text-center space-y-2">
                <Play className="w-8 h-8 text-slate-700 mx-auto" />
                <p className="text-xs text-slate-400 font-medium">Ready to send event</p>
                <p className="text-[11px] text-slate-600">Click "Trigger & Publish Event" to inspect execution response.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-bold ${
                  responseResult.success ? 'bg-emerald-950/50 border-emerald-800/60 text-emerald-300' : 'bg-rose-950/50 border-rose-800/60 text-rose-300'
                }`}>
                  {responseResult.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span>{responseResult.success ? 'HTTP 200 OK — Event Enqueued' : 'HTTP Error — Execution Rejected'}</span>
                </div>

                <pre className="p-4 rounded-xl bg-slate-950 border border-slate-900 font-mono text-[11px] text-emerald-400 overflow-x-auto max-h-[300px]">
                  {JSON.stringify(responseResult.data, null, 2)}
                </pre>

                {/* Recent Requests list */}
                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Recent Published Event History</span>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-900 text-xs font-mono flex items-center justify-between">
                    <div className="truncate pr-2">
                      <span className="text-indigo-400 font-bold">{selectedAppCode}</span> / <span className="text-slate-200">{selectedEventCode}</span>
                    </div>
                    <span className="text-emerald-400 text-[10px]">200 OK</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
