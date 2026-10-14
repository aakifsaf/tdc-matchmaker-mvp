'use client';

import { useState } from 'react';
import { Phone, Users, ListChecks, MessageSquare, Plus, Loader2, ClipboardList } from 'lucide-react';
import { MatchNote } from '../types/customer';
import { timeAgo } from '../lib/utils';
import { api } from '../lib/api';

interface NotesTimelineProps {
  customerId: string;
  initialNotes: MatchNote[];
}

type NoteCategory = MatchNote['category'];

const CATEGORIES: { value: NoteCategory; label: string; icon: any; color: string }[] = [
  { value: 'Call', label: 'Call', icon: Phone, color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'In-Person Meeting', label: 'In-Person', icon: Users, color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { value: 'Preferences Update', label: 'Preferences', icon: ListChecks, color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'Client Feedback', label: 'Feedback', icon: MessageSquare, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
];

function getCategoryColor(category: NoteCategory) {
  return CATEGORIES.find(c => c.value === category)?.color || 'bg-slate-50 text-slate-600 border-slate-200';
}

export default function NotesTimeline({ customerId, initialNotes }: NotesTimelineProps) {
  const [notes, setNotes] = useState<MatchNote[]>(initialNotes);
  const [noteText, setNoteText] = useState('');
  const [category, setCategory] = useState<NoteCategory>('Call');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!noteText.trim()) return;
    setSaving(true);
    setError('');
    try {
      const res = await api.addNote(customerId, noteText.trim(), category);
      setNotes(prev => [res.note, ...prev]);
      setNoteText('');
    } catch (err) {
      setError('Failed to save note. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">

      {/* Composer */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="flex items-center space-x-2.5 px-5 py-3.5 border-b border-slate-100 bg-slate-50">
          <div className="p-1.5 bg-rose-50 rounded-lg">
            <Plus className="h-4 w-4 text-rose-600" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800">Log Interaction Note</h3>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Category Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wider">
              Interaction Type
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(({ value, label, icon: Icon, color }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setCategory(value)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                    category === value ? color + ' shadow-sm' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Textarea */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wider">
              Note
            </label>
            <textarea
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              placeholder="e.g. Spoke with client regarding preference for vegetarian partners. Confirmed interest in candidates from IIT alumni networks. Follow-up call scheduled for Friday 4pm."
              rows={3}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition"
            />
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-xs text-slate-400">{noteText.length} chars</span>
              {error && <span className="text-xs text-red-500">{error}</span>}
            </div>
          </div>

          <button
            type="submit"
            disabled={saving || !noteText.trim()}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-rose-600 text-white text-sm font-semibold transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            <span>{saving ? 'Saving...' : 'Log Interaction Note'}</span>
          </button>
        </form>
      </div>

      {/* Timeline Feed */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <ClipboardList className="h-4 w-4 text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-700">
            Interaction History
            <span className="ml-2 text-xs text-slate-400 font-normal">({notes.length} entries)</span>
          </h3>
        </div>

        {notes.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-xl border border-dashed border-slate-200">
            <ClipboardList className="h-8 w-8 text-slate-200 mx-auto mb-2" />
            <p className="text-slate-500 text-sm">No notes logged yet.</p>
            <p className="text-slate-400 text-xs mt-1">Use the form above to log your first interaction.</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline vertical line */}
            <div className="absolute left-4 top-2 bottom-2 w-px bg-slate-200" />

            <div className="space-y-4">
              {notes.map((note, index) => {
                const catColor = getCategoryColor(note.category);
                return (
                  <div key={note.id} className="relative pl-10">
                    {/* Dot */}
                    <div className="absolute left-[13px] top-4 h-2.5 w-2.5 rounded-full bg-white border-2 border-rose-400 z-10" />

                    <div className="bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 transition-all">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wider ${catColor}`}>
                            {note.category}
                          </span>
                          <span className="text-xs font-semibold text-slate-700">{note.matchmaker_name}</span>
                        </div>
                        <span className="text-xs text-slate-400 flex-shrink-0">{timeAgo(note.created_at)}</span>
                      </div>

                      {/* Note Text */}
                      <p className="text-sm text-slate-700 leading-relaxed">{note.note_text}</p>

                      {/* Exact Timestamp */}
                      <p className="text-[10px] text-slate-400 mt-2">
                        {new Date(note.created_at).toLocaleDateString('en-IN', {
                          weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}