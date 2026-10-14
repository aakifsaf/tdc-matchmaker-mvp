'use client';

import { useState } from 'react';
import {
  Send, Clock, CheckCircle2, HeartHandshake, Calendar,
  MessageSquare, ChevronDown, Loader2, Sparkles, AlertCircle,
  FileText, UserCheck, XCircle, ArrowRight
} from 'lucide-react';
import { DispatchedMatch, DispatchStatus } from '../types/customer';
import { timeAgo } from '../lib/utils';
import { api } from '../lib/api';

interface DispatchedHistoryProps {
  dispatches: DispatchedMatch[];
  onDispatchesUpdated: (updated: DispatchedMatch[]) => void;
}

const LIFECYCLE_STAGES: {
  status: DispatchStatus;
  label: string;
  icon: any;
  color: string;
  bg: string;
  border: string;
  dot: string;
}[] = [
  {
    status: 'Sent',
    label: 'Sent',
    icon: Send,
    color: 'text-slate-700',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    dot: 'bg-slate-400'
  },
  {
    status: 'Awaiting Client Feedback',
    label: 'Awaiting Feedback',
    icon: Clock,
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    dot: 'bg-amber-500'
  },
  {
    status: 'Client Interested',
    label: 'Client Liked / Interested',
    icon: HeartHandshake,
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    dot: 'bg-blue-500'
  },
  {
    status: 'Intro Call Scheduled',
    label: 'Intro Call Scheduled',
    icon: MessageSquare,
    color: 'text-purple-700',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    dot: 'bg-purple-500'
  },
  {
    status: 'First Date Arranged',
    label: 'First Date Arranged',
    icon: Calendar,
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500'
  },
  {
    status: 'Client Passed',
    label: 'Client Passed / Rejected',
    icon: XCircle,
    color: 'text-rose-700',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    dot: 'bg-rose-500'
  }
];

function getStageConfig(status: DispatchStatus) {
  return LIFECYCLE_STAGES.find(s => s.status === status) || LIFECYCLE_STAGES[0];
}

export default function DispatchedHistoryTab({
  dispatches,
  onDispatchesUpdated
}: DispatchedHistoryProps) {
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [activeNoteEditId, setActiveNoteEditId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedEmailId, setExpandedEmailId] = useState<string | null>(null);

  async function handleStatusUpdate(dispatchId: string, newStatus: DispatchStatus, note?: string) {
    setUpdatingId(dispatchId);
    setOpenDropdownId(null);
    try {
      const res = await api.updateDispatchFeedback(dispatchId, newStatus, note);
      const updatedList = dispatches.map(d => (d.id === dispatchId ? res.dispatched : d));
      onDispatchesUpdated(updatedList);
      setActiveNoteEditId(null);
      setNoteDraft('');
    } catch (err) {
      console.error('Failed to update feedback:', err);
    } finally {
      setUpdatingId(null);
    }
  }

  function startNoteEdit(dispatch: DispatchedMatch) {
    setActiveNoteEditId(dispatch.id);
    setNoteDraft(dispatch.feedback_notes || '');
  }

  return (
    <div className="space-y-6">

      {/* Summary Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-100">
              <Send className="h-5 w-5 text-rose-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Dispatched Matches & Client Feedback Lifecycle
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Track introductions sent, manage client responses, schedule intro calls, and progress toward dating milestones
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              Total Introductions: <strong>{dispatches.length}</strong>
            </span>
          </div>
        </div>

        {/* Milestone Pipeline Tracker */}
        <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-6 gap-2">
          {LIFECYCLE_STAGES.map(stage => {
            const count = dispatches.filter(d => d.status === stage.status).length;
            const Icon = stage.icon;
            return (
              <div
                key={stage.status}
                className={`p-2.5 rounded-xl border ${stage.bg} ${stage.border} flex flex-col justify-between`}
              >
                <div className="flex items-center justify-between">
                  <Icon className={`h-3.5 w-3.5 ${stage.color}`} />
                  <span className={`text-xs font-extrabold ${stage.color}`}>{count}</span>
                </div>
                <span className="text-[10px] font-semibold text-slate-600 mt-2 leading-tight">
                  {stage.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dispatches List */}
      {dispatches.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
            <Send className="h-6 w-6 text-slate-400" />
          </div>
          <h4 className="text-sm font-bold text-slate-800">No Introductions Dispatched Yet</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Run the Suggested Matches engine and click "Send Match Introduction" to dispatch your first curated match to this client.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {dispatches.map(item => {
            const stage = getStageConfig(item.status);
            const isDropdownOpen = openDropdownId === item.id;
            const isEditingNote = activeNoteEditId === item.id;
            const isEmailExpanded = expandedEmailId === item.id;
            const isUpdating = updatingId === item.id;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 transition-all shadow-sm overflow-hidden"
              >
                <div className="p-5 space-y-4">

                  {/* Header Line */}
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div className="flex items-start space-x-3.5">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-rose-500 to-rose-400 flex items-center justify-center text-white font-bold text-base shadow-sm flex-shrink-0">
                        {item.match_name.split(' ').map(n => n[0]).join('')}
                      </div>

                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-bold text-slate-900">{item.match_name}</h4>
                          <span className="text-xs px-2 py-0.5 rounded-md font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {item.compatibility_score}% Compatibility
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 flex items-center space-x-1.5">
                          <span>Dispatched:</span>
                          <span className="font-medium text-slate-700">
                            {new Date(item.sent_at).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          <span>({timeAgo(item.sent_at)})</span>
                        </p>
                      </div>
                    </div>

                    {/* Interactive Lifecycle Stage Selector */}
                    <div className="relative">
                      <button
                        onClick={() => setOpenDropdownId(isDropdownOpen ? null : item.id)}
                        disabled={isUpdating}
                        className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition shadow-sm ${stage.bg} ${stage.color} ${stage.border} hover:opacity-90`}
                      >
                        <span className={`w-2 h-2 rounded-full ${stage.dot} ${isUpdating ? 'animate-ping' : ''}`} />
                        <span>{stage.label}</span>
                        {isUpdating ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5" />
                        )}
                      </button>

                      {isDropdownOpen && (
                        <div className="absolute right-0 top-full mt-1.5 z-20 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 w-60">
                          <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider border-b border-slate-100">
                            Update Client Response:
                          </div>
                          {LIFECYCLE_STAGES.map(s => {
                            const Icon = s.icon;
                            return (
                              <button
                                key={s.status}
                                onClick={() => handleStatusUpdate(item.id, s.status, item.feedback_notes)}
                                className={`w-full text-left px-3 py-2 text-xs font-semibold flex items-center space-x-2.5 hover:bg-slate-50 transition ${
                                  s.status === item.status ? 'bg-slate-50 text-slate-900 font-bold' : 'text-slate-600'
                                }`}
                              >
                                <Icon className={`h-3.5 w-3.5 ${s.color}`} />
                                <span className="flex-1">{s.label}</span>
                                {s.status === item.status && (
                                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Feedback Notes Section */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center space-x-1.5">
                        <MessageSquare className="h-3 w-3 text-slate-400" />
                        <span>Client Feedback & Matchmaker Debrief</span>
                      </span>

                      {!isEditingNote && (
                        <button
                          onClick={() => startNoteEdit(item)}
                          className="text-xs font-semibold text-rose-600 hover:text-rose-700 transition"
                        >
                          {item.feedback_notes ? 'Edit Notes' : '+ Add Feedback Notes'}
                        </button>
                      )}
                    </div>

                    {isEditingNote ? (
                      <div className="space-y-2 pt-1">
                        <textarea
                          value={noteDraft}
                          onChange={e => setNoteDraft(e.target.value)}
                          placeholder="e.g. Client loved her education background and shared taste in pets. Requested matchmaker to schedule a 15-min virtual icebreaker call for this Sunday."
                          rows={3}
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition"
                        />
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => setActiveNoteEditId(null)}
                            className="px-2.5 py-1 text-xs text-slate-500 hover:bg-slate-200 rounded-md transition"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(item.id, item.status, noteDraft)}
                            disabled={isUpdating}
                            className="px-3 py-1 bg-slate-900 hover:bg-rose-600 text-white text-xs font-semibold rounded-md transition shadow-sm"
                          >
                            Save Feedback
                          </button>
                        </div>
                      </div>
                    ) : item.feedback_notes ? (
                      <p className="text-xs text-slate-700 italic leading-relaxed">
                        "{item.feedback_notes}"
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400 italic">
                        No feedback recorded yet. Click above to log client response after follow-up.
                      </p>
                    )}
                  </div>

                  {/* Dispatched Email Preview Drawer Toggle */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 truncate max-w-md">
                      <strong>Subject:</strong> {item.email_subject}
                    </span>

                    <button
                      onClick={() => setExpandedEmailId(isEmailExpanded ? null : item.id)}
                      className="text-slate-600 hover:text-slate-900 font-semibold flex items-center space-x-1"
                    >
                      <FileText className="h-3.5 w-3.5 text-slate-400" />
                      <span>{isEmailExpanded ? 'Hide Sent Email' : 'View Sent Email'}</span>
                    </button>
                  </div>

                  {isEmailExpanded && (
                    <div className="bg-slate-900 text-slate-100 rounded-xl p-4 text-xs font-mono whitespace-pre-wrap leading-relaxed shadow-inner">
                      {item.email_body}
                    </div>
                  )}

                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
