import React, { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Mail,
  Send,
  Eye,
  Code,
  Smartphone,
  Monitor,
  Sparkles,
  FileCode,
  CheckCircle2,
  AlertCircle,
  Play,
  Copy,
  Check,
  RotateCcw,
  Zap,
  Layers,
  User,
  Plus,
} from 'lucide-react';
import { Application, EventModel, NotificationTemplateModel } from '../../types';
import { notificationService } from '../../services/notification.service';

interface PresetEmailTemplate {
  name: string;
  description: string;
  category: string;
  subject: string;
  body: string;
  sampleData: Record<string, any>;
}

const PRESET_TEMPLATES: PresetEmailTemplate[] = [
  {
    name: 'Welcome Email',
    description: 'Onboarding email with primary Call To Action button.',
    category: 'User Lifecycle',
    subject: 'Welcome to {{appName}}, {{user.name}}! 🎉',
    body: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #0f172a; color: #f8fafc; border-radius: 16px; border: 1px solid #1e293b;">
  <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #1e293b;">
    <h1 style="color: #6366f1; margin: 0; font-size: 24px;">Welcome to {{appName}}</h1>
    <p style="color: #94a3b8; font-size: 14px; margin-top: 6px;">We are excited to have you on board!</p>
  </div>
  
  <div style="padding: 24px 0;">
    <p style="font-size: 15px; line-height: 1.6; color: #e2e8f0;">Hi <strong>{{user.name}}</strong>,</p>
    <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1;">
      Thank you for joining <strong>{{appName}}</strong>. Your account (<code>{{user.email}}</code>) has been successfully activated with <strong>{{user.role}}</strong> permissions.
    </p>
    
    <div style="background-color: #1e293b; border-left: 4px solid #6366f1; padding: 16px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0; font-size: 13px; color: #818cf8; font-weight: bold;">Quick Start Tip:</p>
      <p style="margin: 6px 0 0 0; font-size: 13px; color: #94a3b8;">Explore your personalized dashboard to configure notifications and API credentials.</p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="{{dashboardLink}}" style="background: linear-gradient(135deg, #6366f1, #4f46e5); color: #ffffff; padding: 12px 32px; font-weight: bold; text-decoration: none; border-radius: 10px; display: inline-block; font-size: 14px; box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);">Launch Dashboard &rarr;</a>
    </div>
  </div>

  <div style="border-t: 1px solid #1e293b; padding-top: 16px; text-align: center; font-size: 12px; color: #64748b;">
    <p style="margin: 0;">If you didn't create this account, please ignore this email.</p>
    <p style="margin: 4px 0 0 0;">&copy; {{appName}} Notification Engine. All rights reserved.</p>
  </div>
</div>`,
    sampleData: {
      user: {
        name: 'Alex Mercer',
        email: 'alex.mercer@example.com',
        role: 'Administrator',
      },
      appName: 'Notification Platform',
      dashboardLink: 'https://admin.example.com/dashboard',
    },
  },
  {
    name: 'Security OTP Code',
    description: 'High priority 2FA / Authentication code alert.',
    category: 'Security',
    subject: '🔒 {{otp}} is your {{appName}} verification code',
    body: `<div style="font-family: Arial, sans-serif; max-width: 550px; margin: 0 auto; padding: 24px; background-color: #090d16; color: #f8fafc; border-radius: 16px; border: 1px solid #1e293b;">
  <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #1e293b; padding-bottom: 16px;">
    <span style="font-size: 18px; font-weight: bold; color: #f43f5e;">🛡️ Security Alert</span>
    <span style="font-size: 11px; background-color: #4c0519; color: #fda4af; padding: 4px 8px; border-radius: 6px; font-weight: bold;">CRITICAL</span>
  </div>

  <div style="padding: 20px 0; text-align: center;">
    <p style="font-size: 14px; color: #94a3b8; margin-bottom: 8px;">Your one-time security authentication passcode is:</p>
    
    <div style="background-color: #111827; border: 2px dashed #f43f5e; padding: 20px; border-radius: 12px; display: inline-block; margin: 12px 0;">
      <span style="font-family: monospace; font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #fb7185;">{{otp}}</span>
    </div>

    <p style="font-size: 12px; color: #cbd5e1; margin-top: 12px;">This code is valid for <strong>{{validMinutes}} minutes</strong>. Do not share this code with anyone.</p>
  </div>

  <div style="background-color: #1e1b4b; border: 1px solid #3730a3; padding: 14px; border-radius: 10px; font-size: 12px; color: #a5b4fc; margin-top: 10px;">
    <strong>Device Info:</strong> Request initiated from {{device}} (IP: {{ipLocation}}).
  </div>
</div>`,
    sampleData: {
      otp: '784920',
      validMinutes: '10',
      device: 'Chrome on macOS Apple Silicon',
      ipLocation: '192.168.1.88 (San Francisco, CA)',
      appName: 'Notification Platform',
    },
  },
  {
    name: 'Order Invoice & Receipt',
    description: 'Transaction confirmation with key-value table.',
    category: 'Billing',
    subject: 'Receipt for Order #{{orderId}} - {{appName}}',
    body: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #0f172a; color: #f8fafc; border-radius: 16px; border: 1px solid #1e293b;">
  <div style="border-bottom: 1px solid #1e293b; padding-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
    <div>
      <h2 style="margin: 0; color: #10b981; font-size: 20px;">Payment Confirmed</h2>
      <p style="margin: 4px 0 0 0; font-size: 12px; color: #94a3b8;">Order ID: <strong>{{orderId}}</strong></p>
    </div>
    <span style="background-color: #064e3b; color: #34d399; font-size: 11px; padding: 4px 10px; border-radius: 20px; font-weight: bold;">PAID</span>
  </div>

  <div style="padding: 20px 0;">
    <p style="font-size: 14px; color: #e2e8f0;">Hello {{user.name}},</p>
    <p style="font-size: 13px; color: #94a3b8;">We have processed your payment. Below is your invoice summary:</p>

    <table style="width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px;">
      <thead>
        <tr style="background-color: #1e293b; color: #94a3b8; text-align: left;">
          <th style="padding: 10px; border-radius: 6px 0 0 6px;">Item Description</th>
          <th style="padding: 10px; text-align: right; border-radius: 0 6px 6px 0;">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr style="border-bottom: 1px solid #1e293b;">
          <td style="padding: 12px 10px; color: #cbd5e1;">{{planName}} Plan Subscription</td>
          <td style="padding: 12px 10px; text-align: right; color: #f8fafc; font-weight: bold;">\${{totalAmount}} {{currency}}</td>
        </tr>
      </tbody>
    </table>

    <div style="margin-top: 20px; padding: 14px; background-color: #1e293b; border-radius: 10px; text-align: right;">
      <span style="font-size: 13px; color: #94a3b8; margin-right: 12px;">Total Paid:</span>
      <span style="font-size: 18px; font-weight: bold; color: #10b981;">\${{totalAmount}} {{currency}}</span>
    </div>
  </div>
</div>`,
    sampleData: {
      orderId: 'INV-2026-9941',
      user: {
        name: 'Sarah Connor',
      },
      planName: 'Enterprise Notification Suite (Monthly)',
      totalAmount: '149.00',
      currency: 'USD',
      appName: 'Notification Platform',
    },
  },
  {
    name: 'Feature Announcement',
    description: 'Marketing & Product update email with rich visual banner.',
    category: 'Product Update',
    subject: '🚀 Introducing {{featureName}} in {{appName}}',
    body: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #0f172a; color: #f8fafc; border-radius: 16px; border: 1px solid #1e293b;">
  <div style="background: linear-gradient(135deg, #4f46e5, #9333ea); padding: 32px 24px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
    <span style="background-color: rgba(255,255,255,0.2); color: #ffffff; font-size: 11px; padding: 4px 12px; border-radius: 20px; font-weight: bold; uppercase; tracking-wider: 1px;">NEW FEATURE RELEASE</span>
    <h1 style="color: #ffffff; font-size: 26px; margin: 12px 0 6px 0;">{{featureName}}</h1>
    <p style="color: #e0e7ff; font-size: 14px; margin: 0;">Designed for high-throughput enterprise messaging</p>
  </div>

  <div style="padding: 10px 0; font-size: 14px; line-height: 1.6; color: #cbd5e1;">
    <p>Hi {{user.name}},</p>
    <p>We are thrilled to launch <strong>{{featureName}}</strong> today! You can now send customized emails directly from your dashboard with full mustache variable interpolation and live HTML previews.</p>
    
    <div style="text-align: center; margin: 24px 0;">
      <a href="{{ctaUrl}}" style="background-color: #38bdf8; color: #0f172a; padding: 12px 28px; font-weight: bold; text-decoration: none; border-radius: 8px; font-size: 14px;">Try {{featureName}} Now &rarr;</a>
    </div>
  </div>
</div>`,
    sampleData: {
      user: {
        name: 'Jordan Belfort',
      },
      featureName: 'Interactive Email Studio',
      appName: 'Notification Platform',
      ctaUrl: 'https://admin.example.com/email-editor',
    },
  },
];

export const EmailEditorPage: React.FC = () => {
  const { applications, events, templates, addToast } = useOutletContext<any>();

  // Target metadata
  const [recipientEmail, setRecipientEmail] = useState('user.demo@example.com');
  const [recipientUserId, setRecipientUserId] = useState('usr_998822');
  const [selectedAppCode, setSelectedAppCode] = useState(applications[0]?.code || 'equity');
  const [selectedEventCode, setSelectedEventCode] = useState(events[0]?.code || 'user.welcome');

  // Email subject & body
  const [subject, setSubject] = useState(PRESET_TEMPLATES[0].subject);
  const [body, setBody] = useState(PRESET_TEMPLATES[0].body);
  const [testDataJson, setTestDataJson] = useState(
    JSON.stringify(PRESET_TEMPLATES[0].sampleData, null, 2)
  );

  // View state
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'html'>('editor');
  const [previewViewport, setPreviewViewport] = useState<'desktop' | 'mobile'>('desktop');
  const [selectedPresetName, setSelectedPresetName] = useState(PRESET_TEMPLATES[0].name);

  // Execution state
  const [loading, setLoading] = useState(false);
  const [responseResult, setResponseResult] = useState<any>(null);
  const [copiedHtml, setCopiedHtml] = useState(false);

  // DB templates filtered by channel === 'EMAIL'
  const dbEmailTemplates = useMemo(() => {
    return templates ? templates.filter((t: NotificationTemplateModel) => t.channel === 'EMAIL') : [];
  }, [templates]);

  // Selected app object & available events
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

  const handleSelectPreset = (preset: PresetEmailTemplate) => {
    setSelectedPresetName(preset.name);
    setSubject(preset.subject);
    setBody(preset.body);
    setTestDataJson(JSON.stringify(preset.sampleData, null, 2));
    addToast('info', `Loaded Preset: ${preset.name}`, 'Subject, body, and test data updated.');
  };

  const handleSelectDbTemplate = (tpl: NotificationTemplateModel) => {
    setSelectedPresetName(`DB Template #${tpl.id.substring(0, 6)}`);
    setSubject(tpl.titleTemplate);
    setBody(tpl.bodyTemplate);
    addToast('info', 'Loaded DB Template', `Template channel ${tpl.channel} loaded into editor.`);
  };

  // Interpolated Mustache replacement helper
  const parsedVariables = useMemo(() => {
    try {
      return JSON.parse(testDataJson);
    } catch {
      return {};
    }
  }, [testDataJson]);

  const interpolateMustache = (templateStr: string, dataObj: any): string => {
    if (!templateStr) return '';
    return templateStr.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, keyPath) => {
      const keys = keyPath.split('.');
      let current: any = dataObj;
      for (const k of keys) {
        if (current && typeof current === 'object' && k in current) {
          current = current[k];
        } else {
          return `{{${keyPath}}}`;
        }
      }
      return current !== undefined && current !== null ? String(current) : `{{${keyPath}}}`;
    });
  };

  const renderedSubject = useMemo(() => {
    return interpolateMustache(subject, parsedVariables);
  }, [subject, parsedVariables]);

  const renderedBody = useMemo(() => {
    return interpolateMustache(body, parsedVariables);
  }, [body, parsedVariables]);

  // Snippet toolbar insertion helper
  const insertSnippet = (snippetHtml: string) => {
    setBody((prev) => prev + '\n' + snippetHtml);
    addToast('success', 'Snippet Inserted', 'Added HTML snippet to email body.');
  };

  const handleSendEmail = async () => {
    if (!recipientEmail.trim()) {
      addToast('error', 'Missing Recipient Email', 'Please enter a valid recipient email address.');
      return;
    }
    if (!subject.trim() || !body.trim()) {
      addToast('error', 'Missing Content', 'Subject and Body are required to send email.');
      return;
    }

    setLoading(true);
    setResponseResult(null);

    try {
      const res = await notificationService.sendDirect({
        application: selectedAppCode,
        event: selectedEventCode,
        channel: 'EMAIL',
        recipient: {
          email: recipientEmail.trim(),
          userId: recipientUserId.trim() || undefined,
        },
        notification: {
          title: renderedSubject,
          body: renderedBody,
        },
        data: {
          source: 'ADMIN_EMAIL_STUDIO',
          presetUsed: selectedPresetName,
        },
      });

      setResponseResult({
        success: true,
        data: res,
        timestamp: new Date().toISOString(),
      });

      addToast(
        'success',
        'Email Sent Successfully! 📧',
        `Delivered to ${recipientEmail.trim()} via Notification Service.`
      );
    } catch (err: any) {
      const errData = err.response?.data || { message: err.message };
      setResponseResult({
        success: false,
        data: errData,
        timestamp: new Date().toISOString(),
      });
      addToast('error', 'Send Failed', errData.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyHtml = () => {
    navigator.clipboard.writeText(renderedBody);
    setCopiedHtml(true);
    addToast('success', 'HTML Copied', 'Rendered HTML copied to clipboard.');
    setTimeout(() => setCopiedHtml(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-card rounded-2xl p-6 border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-950">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Email Editor & Dispatch Studio
              </h2>
              <p className="text-xs text-slate-400">
                Compose, template-fill, and send manual HTML/text emails to users with live mustache variable rendering.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSendEmail}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-xl shadow-indigo-950/80 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            <Send className={`w-4 h-4 fill-white ${loading ? 'animate-bounce' : ''}`} />
            <span>{loading ? 'Sending Email...' : 'Send Email Now'}</span>
          </button>
        </div>
      </div>

      {/* Preset Templates Showcase */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" /> Select Template Preset or Database Template
          </label>
          <span className="text-[11px] text-slate-500 font-mono">
            Active: <span className="text-indigo-400 font-bold">{selectedPresetName}</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PRESET_TEMPLATES.map((preset) => (
            <button
              key={preset.name}
              onClick={() => handleSelectPreset(preset)}
              className={`p-3.5 rounded-xl text-left border transition-all flex flex-col justify-between space-y-2 ${
                selectedPresetName === preset.name
                  ? 'bg-slate-900 border-indigo-500 ring-2 ring-indigo-500/20'
                  : 'glass-card hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/60">
                    {preset.category}
                  </span>
                  {selectedPresetName === preset.name && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                  )}
                </div>
                <h4 className="text-xs font-bold text-white">{preset.name}</h4>
                <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">{preset.description}</p>
              </div>
              <span className="text-[10px] text-indigo-400 font-semibold flex items-center gap-1">
                Load Preset &rarr;
              </span>
            </button>
          ))}
        </div>

        {/* Database Email Templates dropdown if any exist */}
        {dbEmailTemplates.length > 0 && (
          <div className="pt-2 flex items-center gap-2">
            <FileCode className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-xs text-slate-300 font-medium">Database Email Templates:</span>
            <div className="flex items-center gap-2 overflow-x-auto py-1">
              {dbEmailTemplates.map((tpl: NotificationTemplateModel) => (
                <button
                  key={tpl.id}
                  onClick={() => handleSelectDbTemplate(tpl)}
                  className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-indigo-500 transition-all shrink-0"
                >
                  Template #{tpl.id.substring(0, 6)} ({tpl.titleTemplate.substring(0, 20)}...)
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Workspace Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Controls, Inputs & Editor */}
        <div className="lg:col-span-7 space-y-5">
          {/* Target Recipient Config */}
          <div className="glass-card rounded-2xl p-5 border space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-slate-800/80 pb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-400" /> 1. Recipient & Event Target Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">
                  Recipient Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="e.g. john.doe@example.com"
                  className="w-full px-3.5 py-2 rounded-xl glass-input text-xs font-mono font-bold text-indigo-300"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">
                  User ID (Optional)
                </label>
                <input
                  type="text"
                  value={recipientUserId}
                  onChange={(e) => setRecipientUserId(e.target.value)}
                  placeholder="e.g. usr_998822"
                  className="w-full px-3.5 py-2 rounded-xl glass-input text-xs font-mono text-slate-300"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">
                  Application Scope
                </label>
                <select
                  value={selectedAppCode}
                  onChange={(e) => handleAppChange(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl glass-input text-xs font-medium"
                >
                  {applications.map((app: Application) => (
                    <option key={app.id} value={app.code}>
                      {app.name} ({app.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">
                  Event Scope
                </label>
                <select
                  value={selectedEventCode}
                  onChange={(e) => setSelectedEventCode(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl glass-input text-xs font-mono font-medium"
                >
                  {availableEvents.map((evt: EventModel) => (
                    <option key={evt.id} value={evt.code}>
                      {evt.name} ({evt.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Email Subject & Body Composition */}
          <div className="glass-card rounded-2xl p-5 border space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <FileCode className="w-4 h-4 text-purple-400" /> 2. Subject & HTML Email Body Editor
              </h3>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() =>
                    insertSnippet(
                      `<div style="text-align: center; margin: 20px 0;"><a href="https://example.com" style="background-color: #6366f1; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px;">Action Button &rarr;</a></div>`
                    )
                  }
                  className="px-2 py-1 rounded text-[10px] font-semibold bg-slate-900 text-indigo-300 border border-slate-800 hover:bg-slate-800 transition-colors"
                >
                  + Button Snippet
                </button>
                <button
                  type="button"
                  onClick={() =>
                    insertSnippet(
                      `<div style="background-color: #1e293b; border-left: 4px solid #f43f5e; padding: 12px; border-radius: 6px; margin: 16px 0; font-size: 13px; color: #fda4af;"><strong>Notice:</strong> Important alert content here.</div>`
                    )
                  }
                  className="px-2 py-1 rounded text-[10px] font-semibold bg-slate-900 text-rose-300 border border-slate-800 hover:bg-slate-800 transition-colors"
                >
                  + Alert Snippet
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">
                Email Subject Line (Supports Mustache e.g. {'{{user.name}}'}) *
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-xs font-mono font-semibold text-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">
                Email Body HTML (Supports Mustache variables & HTML styling) *
              </label>
              <textarea
                rows={12}
                required
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full p-4 rounded-xl glass-input font-mono text-xs text-slate-200 leading-relaxed resize-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
          </div>

          {/* Test Variables Data Editor */}
          <div className="glass-card rounded-2xl p-5 border space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" /> 3. Test Variables Engine (JSON Payload)
              </label>
              <span className="text-[10px] text-slate-500">Live Mustache Replacer</span>
            </div>

            <textarea
              rows={5}
              value={testDataJson}
              onChange={(e) => setTestDataJson(e.target.value)}
              className="w-full p-3.5 rounded-xl glass-input font-mono text-xs text-emerald-400 leading-relaxed resize-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
        </div>

        {/* Right Column: Live Multi-View Preview & Response Inspector */}
        <div className="lg:col-span-5 space-y-5">
          {/* Viewport Switcher Header */}
          <div className="glass-panel rounded-2xl p-4 border flex items-center justify-between">
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'preview' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" /> Preview
              </button>
              <button
                onClick={() => setActiveTab('html')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'html' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Code className="w-3.5 h-3.5" /> HTML Source
              </button>
            </div>

            {activeTab === 'preview' && (
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setPreviewViewport('desktop')}
                  className={`p-1.5 rounded-lg text-xs transition-all ${
                    previewViewport === 'desktop' ? 'bg-slate-800 text-indigo-400' : 'text-slate-500 hover:text-slate-300'
                  }`}
                  title="Desktop View"
                >
                  <Monitor className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPreviewViewport('mobile')}
                  className={`p-1.5 rounded-lg text-xs transition-all ${
                    previewViewport === 'mobile' ? 'bg-slate-800 text-indigo-400' : 'text-slate-500 hover:text-slate-300'
                  }`}
                  title="Mobile View"
                >
                  <Smartphone className="w-4 h-4" />
                </button>
              </div>
            )}

            {activeTab === 'html' && (
              <button
                onClick={handleCopyHtml}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-300 bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors"
              >
                {copiedHtml ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy HTML</span>
              </button>
            )}
          </div>

          {/* Rendered Live Email Preview */}
          <div className="glass-panel rounded-2xl p-5 border space-y-4 min-h-[420px] flex flex-col">
            {activeTab === 'preview' ? (
              <div className={`transition-all mx-auto w-full ${previewViewport === 'mobile' ? 'max-w-[360px]' : 'max-w-full'}`}>
                {/* Email Client Header Simulator */}
                <div className="bg-slate-900 rounded-t-xl border border-slate-800 p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
                    <span className="font-semibold text-slate-300">From: Notification Engine &lt;no-reply@app.com&gt;</span>
                    <span className="text-[10px] text-slate-500 font-mono">LIVE PREVIEW</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">To: <strong className="text-indigo-300 font-mono">{recipientEmail}</strong></span>
                  </div>
                  <div className="pt-1">
                    <p className="text-sm font-bold text-white leading-snug">{renderedSubject || '(No Subject Line)'}</p>
                  </div>
                </div>

                {/* Rendered HTML Container */}
                <div className="bg-slate-950 border-x border-b border-slate-800 rounded-b-xl p-4 overflow-y-auto max-h-[500px]">
                  <div
                    dangerouslySetInnerHTML={{ __html: renderedBody || '<p style="color: #64748b; font-style: italic;">No body content written yet...</p>' }}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2 flex-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Mustache Interpolated Raw HTML Output</span>
                <pre className="p-4 rounded-xl bg-slate-950 border border-slate-900 font-mono text-[11px] text-emerald-400 overflow-x-auto whitespace-pre-wrap max-h-[460px]">
                  {renderedBody}
                </pre>
              </div>
            )}
          </div>

          {/* Execution & Response Inspector */}
          <div className="glass-panel rounded-2xl p-5 border space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Play className="w-4 h-4 text-indigo-400" /> Response Inspector Log
            </h4>

            {!responseResult ? (
              <div className="p-6 rounded-xl bg-slate-950/60 border border-slate-900 text-center space-y-1.5">
                <Send className="w-6 h-6 text-slate-700 mx-auto" />
                <p className="text-xs text-slate-400 font-medium">Ready to dispatch</p>
                <p className="text-[11px] text-slate-600">Click "Send Email Now" to execute delivery via backend Email Channel.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div
                  className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-bold ${
                    responseResult.success
                      ? 'bg-emerald-950/50 border-emerald-800/60 text-emerald-300'
                      : 'bg-rose-950/50 border-rose-800/60 text-rose-300'
                  }`}
                >
                  {responseResult.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span>{responseResult.success ? 'HTTP 201 — Email Sent & Enqueued' : 'HTTP Error — Dispatch Failed'}</span>
                </div>

                <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-900 font-mono text-[11px] text-emerald-400 overflow-x-auto max-h-[200px]">
                  {JSON.stringify(responseResult.data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
