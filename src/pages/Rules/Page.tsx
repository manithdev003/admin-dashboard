import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Edit2, Trash2, Sliders, Zap, Check, Copy, X, ShieldAlert } from 'lucide-react';
import { EventModel, RuleModel, RuleOperator, NotificationChannelType } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { ConfirmModal } from '../../components/ConfirmModal';
import { EmptyState } from '../../components/EmptyState';

const OPERATORS: RuleOperator[] = [
  'EQUALS',
  'NOT_EQUALS',
  'GREATER_THAN',
  'GREATER_THAN_OR_EQUAL',
  'LESS_THAN',
  'LESS_THAN_OR_EQUAL',
  'CONTAINS',
];

const CHANNELS: NotificationChannelType[] = ['PUSH', 'EMAIL', 'SMS', 'WHATSAPP', 'IN_APP'];

export const RulesPage: React.FC = () => {
  const { events, rules, searchQuery, onCreateRule, onUpdateRule, onToggleRule, onDeleteRule, addToast } = useOutletContext<any>();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<RuleModel | null>(null);
  const [deletingRule, setDeletingRule] = useState<RuleModel | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    addToast('success', 'Copied to clipboard!', text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Form State
  const [eventId, setEventId] = useState(events[0]?.id || '');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [field, setField] = useState('payload.marketStatus');
  const [operator, setOperator] = useState<RuleOperator>('EQUALS');
  const [value, setValue] = useState('OPEN');
  const [priority, setPriority] = useState<number>(1);
  const [channel, setChannel] = useState<NotificationChannelType>('PUSH');
  const [logicGroup, setLogicGroup] = useState<'AND' | 'OR'>('AND');
  const [loading, setLoading] = useState(false);

  const filteredRules = rules.filter((rule: RuleModel) => {
    const q = searchQuery.toLowerCase();
    return (
      rule.name.toLowerCase().includes(q) ||
      rule.field.toLowerCase().includes(q) ||
      rule.operator.toLowerCase().includes(q) ||
      (rule.channel && rule.channel.toLowerCase().includes(q))
    );
  });

  const openCreateModal = () => {
    setEventId(events[0]?.id || '');
    setName('Market Open Check');
    setDescription('Evaluates if stock market status equals OPEN');
    setField('payload.marketStatus');
    setOperator('EQUALS');
    setValue('OPEN');
    setPriority(1);
    setChannel('PUSH');
    setLogicGroup('AND');
    setIsCreateOpen(true);
  };

  const openEditModal = (rule: RuleModel) => {
    setEditingRule(rule);
    setName(rule.name);
    setDescription(rule.description || '');
    setField(rule.field);
    setOperator(rule.operator);
    setValue(typeof rule.value === 'object' ? JSON.stringify(rule.value) : String(rule.value));
    setPriority(rule.priority);
    setChannel(rule.channel || 'PUSH');
  };

  const handleSaveCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventId || !name.trim() || !field.trim() || !value.trim()) {
      addToast('error', 'Validation Error', 'Event, Rule Name, Field, and Value are required.');
      return;
    }
    setLoading(true);
    try {
      await onCreateRule({
        eventId,
        name: name.trim(),
        description: description.trim(),
        field: field.trim(),
        operator,
        value: value.trim(),
        priority: Number(priority),
        channel,
        enabled: true,
      });
      setIsCreateOpen(false);
      addToast('success', 'Rule Created', `Rule "${name}" added to evaluation pipeline.`);
    } catch (err: any) {
      addToast('error', 'Create Failed', err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRule) return;
    setLoading(true);
    try {
      await onUpdateRule(editingRule.id, {
        name: name.trim(),
        description: description.trim(),
        field: field.trim(),
        operator,
        value: value.trim(),
        priority: Number(priority),
        channel,
      });
      setEditingRule(null);
      addToast('success', 'Rule Updated', `Rule "${name}" updated.`);
    } catch (err: any) {
      addToast('error', 'Update Failed', err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingRule) return;
    try {
      await onDeleteRule(deletingRule.id);
      addToast('success', 'Rule Removed', `Rule removed from pipeline.`);
    } catch (err: any) {
      addToast('error', 'Delete Failed', err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white">Rule Engine & Evaluation Pipeline ({filteredRules.length})</h3>
          <p className="text-xs text-slate-400">Rules evaluate payload fields before rendering notification templates.</p>
        </div>
        <button
          onClick={openCreateModal}
          disabled={events.length === 0}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-950 transition-all disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>New Condition Rule</span>
        </button>
      </div>

      {/* Rules Grid */}
      {filteredRules.length === 0 ? (
        <EmptyState
          icon={Sliders}
          title="No Condition Rules"
          description="Create condition rules to dynamically evaluate payload values."
          actionLabel={events.length > 0 ? 'Create Rule' : undefined}
          onAction={openCreateModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredRules.map((rule: RuleModel) => {
            const parentEvt = events.find((e: EventModel) => e.id === rule.eventId);
            return (
              <div key={rule.id} className="glass-card rounded-2xl p-5 border flex flex-col justify-between space-y-4 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-950/30 transition-all group">
                <div>
                  <div className="flex items-start justify-between gap-3 min-w-0">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="p-2.5 rounded-xl bg-purple-950/70 border border-purple-800/40 text-purple-400 shrink-0 group-hover:scale-105 transition-transform">
                        <Sliders className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-base font-bold text-white leading-snug truncate" title={rule.name}>{rule.name}</h4>
                        <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-400">
                          <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span className="truncate">{parentEvt?.name || rule.eventId}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 shrink-0 justify-end">
                      {rule.channel && <StatusBadge status={rule.channel} type="channel" />}
                      <button
                        onClick={() => onToggleRule(rule.id, rule.enabled)}
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide transition-all ${
                          rule.enabled ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 hover:bg-emerald-900' : 'bg-slate-800/80 text-slate-400 border border-slate-700 hover:bg-slate-700'
                        }`}
                      >
                        {rule.enabled ? 'ENABLED' : 'DISABLED'}
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 mt-3 line-clamp-2 leading-relaxed">{rule.description || 'No description provided.'}</p>

                  {/* Condition Builder Expression Card */}
                  <div className="mt-3.5 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2 font-mono text-xs shadow-inner">
                    <div className="flex items-center justify-between text-[10px] text-purple-400 font-bold font-sans tracking-wider uppercase">
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                        CONDITION BUILDER
                      </span>
                      <span className="px-2 py-0.5 rounded bg-purple-950/60 border border-purple-800/50 text-purple-300 font-mono text-[10px]">
                        PRIORITY #{rule.priority}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800/80 text-slate-200 flex flex-wrap items-center gap-1.5 min-w-0 overflow-x-auto">
                      <span className="px-2 py-0.5 rounded bg-indigo-950/80 border border-indigo-800/50 text-indigo-300 font-bold truncate max-w-full">{rule.field}</span>
                      <span className="px-2 py-0.5 rounded bg-amber-950/80 border border-amber-800/50 text-amber-300 font-bold shrink-0">{rule.operator}</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/50 text-emerald-300 font-bold truncate max-w-full">"{String(rule.value)}"</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 min-w-0">
                    <span className="text-slate-500 font-medium shrink-0">ID:</span>
                    <span className="font-mono text-slate-300 font-medium truncate" title={rule.id}>
                      {rule.id}
                    </span>
                    <button
                      onClick={() => handleCopy(rule.id, `ruleid-${rule.id}`)}
                      className="p-1 text-slate-400 hover:text-purple-300 hover:bg-slate-800 rounded transition-colors shrink-0"
                      title="Copy Rule ID"
                    >
                      {copiedId === `ruleid-${rule.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => openEditModal(rule)} className="p-1.5 rounded-lg text-slate-400 hover:text-purple-400 hover:bg-slate-800 transition-colors" title="Edit Rule">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeletingRule(rule)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors" title="Delete Rule">
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
          <form onSubmit={handleSaveCreate} className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-modal space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-purple-400" /> Create Evaluation Rule
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">Target Event *</label>
                <select required value={eventId} onChange={(e) => setEventId(e.target.value)} className="w-full px-4 py-2 rounded-xl glass-input text-sm">
                  {events.map((evt: EventModel) => (
                    <option key={evt.id} value={evt.id}>{evt.name} ({evt.code})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">Execution Channel *</label>
                <select value={channel} onChange={(e) => setChannel(e.target.value as NotificationChannelType)} className="w-full px-4 py-2 rounded-xl glass-input text-sm font-semibold">
                  {CHANNELS.map((ch) => (
                    <option key={ch} value={ch}>{ch}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">Rule Name *</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2 rounded-xl glass-input text-sm" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">Target Field *</label>
                <input type="text" required value={field} onChange={(e) => setField(e.target.value)} placeholder="payload.marketStatus" className="w-full px-4 py-2 rounded-xl glass-input text-sm font-mono" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">Operator *</label>
                <select value={operator} onChange={(e) => setOperator(e.target.value as RuleOperator)} className="w-full px-4 py-2 rounded-xl glass-input text-sm font-mono font-semibold">
                  {OPERATORS.map((op) => (
                    <option key={op} value={op}>{op}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">Comparison Value *</label>
                <input type="text" required value={value} onChange={(e) => setValue(e.target.value)} placeholder="OPEN" className="w-full px-4 py-2 rounded-xl glass-input text-sm font-mono" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">Priority</label>
                <input type="number" min={1} max={100} value={priority} onChange={(e) => setPriority(Number(e.target.value))} className="w-full px-4 py-2 rounded-xl glass-input text-sm font-mono" />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">Condition Group Logic</label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input type="radio" name="logicGroup" checked={logicGroup === 'AND'} onChange={() => setLogicGroup('AND')} /> AND (All conditions must match)
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input type="radio" name="logicGroup" checked={logicGroup === 'OR'} onChange={() => setLogicGroup('OR')} /> OR (Any condition matches)
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button type="button" onClick={() => setIsCreateOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 rounded-xl">Cancel</button>
              <button type="submit" disabled={loading} className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl disabled:opacity-50">{loading ? 'Creating...' : 'Create Rule'}</button>
            </div>
          </form>
        </div>
      )}

      {editingRule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <form onSubmit={handleSaveEdit} className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-modal space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-purple-400" /> Edit Rule
            </h3>

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">Rule Name *</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2 rounded-xl glass-input text-sm" />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">Execution Channel *</label>
              <select value={channel} onChange={(e) => setChannel(e.target.value as NotificationChannelType)} className="w-full px-4 py-2 rounded-xl glass-input text-sm font-semibold">
                {CHANNELS.map((ch) => (
                  <option key={ch} value={ch}>{ch}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">Field *</label>
                <input type="text" required value={field} onChange={(e) => setField(e.target.value)} className="w-full px-4 py-2 rounded-xl glass-input text-sm font-mono" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">Operator *</label>
                <select value={operator} onChange={(e) => setOperator(e.target.value as RuleOperator)} className="w-full px-4 py-2 rounded-xl glass-input text-sm font-mono">
                  {OPERATORS.map((op) => (
                    <option key={op} value={op}>{op}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">Value *</label>
                <input type="text" required value={value} onChange={(e) => setValue(e.target.value)} className="w-full px-4 py-2 rounded-xl glass-input text-sm font-mono" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">Priority</label>
                <input type="number" min={1} max={100} value={priority} onChange={(e) => setPriority(Number(e.target.value))} className="w-full px-4 py-2 rounded-xl glass-input text-sm font-mono" />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button type="button" onClick={() => setEditingRule(null)} className="px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 rounded-xl">Cancel</button>
              <button type="submit" disabled={loading} className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl disabled:opacity-50">{loading ? 'Saving...' : 'Save Changes'}</button>
            </div>
          </form>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deletingRule}
        title="Delete Rule?"
        message="Are you sure you want to remove this evaluation rule?"
        confirmLabel="Delete Rule"
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeletingRule(null)}
      />
    </div>
  );
};
