'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import {
  X, Send, RefreshCw, Loader2, CheckCircle2, AlertTriangle,
  Mail, Edit3, MapPin, Briefcase, GraduationCap, Sparkles
} from 'lucide-react';
import { MatchCandidateResult, Customer } from '../types/customer';
import { api } from '../lib/api';
import { formatIncome, getDietConfig } from '../lib/utils';

interface SendMatchModalProps {
  result: MatchCandidateResult;
  client: Customer;
  onClose: () => void;
  onDispatched: () => void;
}

export default function SendMatchModal({ result, client, onClose, onDispatched }: SendMatchModalProps) {
  const { candidate: c, ai_score, ai_badge, friction_points, synergy_highlights } = result;
  const dietCfg = getDietConfig(c.diet);

  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [loadingEmail, setLoadingEmail] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [dispatching, setDispatching] = useState(false);
  const [dispatched, setDispatched] = useState(false);
  const [error, setError] = useState('');
  const overlayRef = useRef<HTMLDivElement>(null);

  async function fetchEmailDraft() {
    setLoadingEmail(true);
    setError('');
    try {
      const res = await api.draftEmail(client.id, c.id);
      setEmailSubject(res.subject);
      setEmailBody(res.body);
    } catch (err) {
      setError('Could not generate AI email draft. Please type a message manually.');
      setEmailSubject(`Curated Introduction: ${client.first_name} ${client.last_name} & ${c.first_name} ${c.last_name} | The Date Crew`);
      setEmailBody(`Dear ${client.first_name},\n\nPlease find below an introduction to ${c.first_name} ${c.last_name}, ${c.designation} at ${c.current_company}.\n\nWarm regards,\nPriya Sharma\nSenior Matchmaker | The Date Crew`);
    } finally {
      setLoadingEmail(false);
    }
  }

  async function handleRegenerate() {
    setRegenerating(true);
    try {
      const res = await api.draftEmail(client.id, c.id);
      setEmailSubject(res.subject);
      setEmailBody(res.body);
    } catch (err) {
      setError('Regeneration failed. Your current draft is preserved.');
    } finally {
      setRegenerating(false);
    }
  }

  async function handleDispatch() {
    setDispatching(true);
    setError('');
    try {
      await api.dispatchMatch(client.id, c.id, emailSubject, emailBody, ai_score);
      setDispatched(true);
      setTimeout(() => {
        onDispatched();
        onClose();
      }, 2000);
    } catch (err) {
      setError('Failed to dispatch. Please try again.');
      setDispatching(false);
    }
  }

  useEffect(() => {
    fetchEmailDraft();
  }, []);

  // Close on overlay click
  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === overlayRef.current) onClose();
  }

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-rose-50 rounded-xl border border-rose-100">
              <Send className="h-4 w-4 text-rose-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Send Match Introduction</h2>
              <p className="text-xs text-slate-500">
                {client.first_name} {client.last_name} → {c.first_name} {c.last_name} · {ai_score}% {ai_badge}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-slate-200">

            {/* LEFT PANEL: Candidate Snapshot */}
            <div className="md:col-span-2 p-5 space-y-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Candidate Snapshot</h3>

              {/* Candidate Card */}
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="h-12 w-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                    {c.photo_url ? (
                      <Image
                        src={c.photo_url}
                        alt={`${c.first_name} ${c.last_name}`}
                        width={48}
                        height={48}
                        className="object-cover w-full h-full"
                        unoptimized
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-rose-100 to-slate-100 text-slate-600 font-bold">
                        {c.first_name[0]}{c.last_name[0]}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900 text-sm">{c.first_name} {c.last_name}</p>
                    <p className="text-xs text-slate-500">{c.age} yrs · {c.height_formatted}</p>
                    <div className="flex items-center space-x-1 mt-0.5">
                      <MapPin className="h-3 w-3 text-slate-400" />
                      <span className="text-xs text-slate-500">{c.city}</span>
                    </div>
                  </div>
                  {/* Score badge */}
                  <div className={`flex-shrink-0 text-center px-2 py-1.5 rounded-xl border-2 ${
                    ai_score >= 88 ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'
                  }`}>
                    <p className={`text-xl font-extrabold leading-none ${ai_score >= 88 ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {ai_score}
                    </p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase">Score</p>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1 border-t border-slate-200">
                  <div className="flex items-center space-x-2 text-xs text-slate-600">
                    <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                    <span>{c.designation} at {c.current_company}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-slate-600">
                    <GraduationCap className="h-3.5 w-3.5 text-slate-400" />
                    <span>{c.ug_college}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      {formatIncome(c.income_lpa)}
                    </span>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${dietCfg.color}`}>
                      {dietCfg.emoji} {c.diet}
                    </span>
                    <span className="text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                      {c.religion} · {c.caste}
                    </span>
                  </div>
                </div>
              </div>

              {/* AI Badge */}
              <div className="flex items-center space-x-2 px-3 py-2 bg-purple-50 border border-purple-200 rounded-xl">
                <Sparkles className="h-4 w-4 text-purple-600 flex-shrink-0" />
                <span className="text-xs font-semibold text-purple-700">{ai_badge}</span>
              </div>

              {/* Key Synergy Highlights */}
              {synergy_highlights.length > 0 && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5">
                  <div className="flex items-center space-x-1.5 mb-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide">Synergies</span>
                  </div>
                  <ul className="space-y-1">
                    {synergy_highlights.map((s, i) => (
                      <li key={i} className="text-xs text-emerald-800 flex items-start space-x-1.5">
                        <span className="text-emerald-400 flex-shrink-0">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Friction Risk Alerts Summary */}
              {friction_points.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5">
                  <div className="flex items-center space-x-1.5 mb-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                    <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wide">Friction Alerts</span>
                  </div>
                  <ul className="space-y-1.5">
                    {friction_points.map((fp, i) => (
                      <li key={i} className="text-xs text-amber-800">
                        <span className={`font-bold text-[10px] uppercase px-1 py-0.5 rounded mr-1 ${
                          fp.severity === 'high' ? 'bg-red-100 text-red-700' :
                          fp.severity === 'medium' ? 'bg-amber-200 text-amber-800' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {fp.severity}
                        </span>
                        {fp.title}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* RIGHT PANEL: Email Editor */}
            <div className="md:col-span-3 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-slate-500" />
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    AI-Drafted Introduction Email
                  </h3>
                </div>
                <button
                  onClick={handleRegenerate}
                  disabled={regenerating || loadingEmail}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${regenerating ? 'animate-spin' : ''}`} />
                  <span>{regenerating ? 'Regenerating...' : 'Regenerate with AI'}</span>
                </button>
              </div>

              {loadingEmail ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-3 text-slate-400">
                  <Loader2 className="h-6 w-6 animate-spin text-rose-500" />
                  <p className="text-sm font-medium">Drafting personalized email with AI...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Error Banner */}
                  {error && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-xs">
                      {error}
                    </div>
                  )}

                  {/* Subject */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
                      Subject Line
                    </label>
                    <div className="relative">
                      <Edit3 className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                      <input
                        value={emailSubject}
                        onChange={e => setEmailSubject(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent focus:bg-white transition"
                      />
                    </div>
                  </div>

                  {/* Body */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
                      Email Body
                      <span className="ml-2 text-[10px] text-slate-400 normal-case font-normal">(Editable — review before sending)</span>
                    </label>
                    <textarea
                      value={emailBody}
                      onChange={e => setEmailBody(e.target.value)}
                      rows={10}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent focus:bg-white resize-none transition font-mono leading-relaxed"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-200 px-6 py-4 bg-slate-50 flex-shrink-0 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            {dispatched && (
              <div className="flex items-center space-x-2 text-emerald-600 text-sm font-semibold">
                <CheckCircle2 className="h-4 w-4" />
                <span>Introduction Dispatched!</span>
              </div>
            )}
            <button
              onClick={handleDispatch}
              disabled={dispatching || loadingEmail || dispatched}
              className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold transition-all disabled:opacity-60 shadow-sm shadow-rose-200"
            >
              {dispatching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : dispatched ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span>
                {dispatching ? 'Dispatching...' : dispatched ? 'Sent!' : 'Confirm & Dispatch Introduction'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}