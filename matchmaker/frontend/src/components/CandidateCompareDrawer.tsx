'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  X, Send, ArrowRightLeft, Sparkles, AlertTriangle,
  CheckCircle2, User, GraduationCap, Briefcase, Globe,
  Leaf, Heart, ShieldCheck
} from 'lucide-react';
import { Customer, MatchCandidateResult } from '../types/customer';
import { formatIncome, getDietConfig } from '../lib/utils';

interface CandidateCompareDrawerProps {
  client: Customer;
  matchResult: MatchCandidateResult;
  onClose: () => void;
  onSendMatch: (match: MatchCandidateResult) => void;
}

export default function CandidateCompareDrawer({
  client,
  matchResult,
  onClose,
  onSendMatch,
}: CandidateCompareDrawerProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const { candidate: c, ai_score, ai_badge, synergy_highlights, friction_points } = matchResult;

  const clientDietCfg = getDietConfig(client.diet);
  const candDietCfg = getDietConfig(c.diet);

  // Close on Escape key
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // Handle outside click
  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === overlayRef.current) onClose();
  }

  // Calculate Deltas
  const ageDelta = client.age - c.age;
  const heightDeltaInches = client.height_cm - c.height_cm;
  const incomeDelta = client.income_lpa - c.income_lpa;
  const sameDiet = client.diet.toLowerCase() === c.diet.toLowerCase();
  const sameKids = client.want_kids === c.want_kids;
  const sameRelocate = client.open_to_relocate === c.open_to_relocate;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end transition-opacity"
    >
      <div className="w-full max-w-4xl bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">

        {/* 1. Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-rose-50 rounded-xl border border-rose-100">
              <ArrowRightLeft className="h-5 w-5 text-rose-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Side-by-Side Deep-Dive</h2>
              <p className="text-xs text-slate-500">
                Comparing Client <span className="font-semibold text-slate-700">{client.first_name}</span> vs Candidate <span className="font-semibold text-slate-700">{c.first_name}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-xl border font-bold text-xs ${
              ai_score >= 88 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              <Sparkles className="h-3.5 w-3.5" />
              <span>{ai_score}% {ai_badge}</span>
            </div>

            <button
              onClick={() => {
                onClose();
                onSendMatch(matchResult);
              }}
              className="flex items-center space-x-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Send Match</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* 2. Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Quick Delta Comparison Strip */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <div className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
              <ShieldCheck className="h-4 w-4 text-rose-600" />
              <span>Compatibility & Delta Alignment</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {/* Age */}
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Age Delta</span>
                <span className="text-xs font-bold text-slate-800">
                  {ageDelta > 0 ? `${ageDelta}y Younger` : ageDelta < 0 ? `${Math.abs(ageDelta)}y Older` : 'Same Age'}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">{client.age} vs {c.age}</span>
              </div>

              {/* Height */}
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Height Delta</span>
                <span className="text-xs font-bold text-slate-800">
                  {heightDeltaInches > 0 ? `${heightDeltaInches}cm Lower` : heightDeltaInches < 0 ? `${Math.abs(heightDeltaInches)}cm Taller` : 'Equal'}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">{client.height_formatted} vs {c.height_formatted}</span>
              </div>

              {/* Income */}
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">CTC Comparison</span>
                <span className="text-xs font-bold text-slate-800">
                  {formatIncome(c.income_lpa)}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Client: {formatIncome(client.income_lpa)}</span>
              </div>

              {/* Diet */}
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Diet Match</span>
                <span className={`text-xs font-bold ${sameDiet ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {sameDiet ? 'Harmonious ✓' : 'Mismatch ⚠️'}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">{client.diet} · {c.diet}</span>
              </div>

              {/* Relocation / Kids */}
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center col-span-2 sm:col-span-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Kids & Move</span>
                <span className={`text-xs font-bold ${sameKids && sameRelocate ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {sameKids && sameRelocate ? 'Aligned ✓' : 'Check Points'}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Kids: {c.want_kids}</span>
              </div>
            </div>
          </div>

          {/* AI Synergy & Friction Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Synergy */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5">
              <div className="flex items-center space-x-1.5 mb-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">Key Synergies</span>
              </div>
              <ul className="space-y-1.5">
                {synergy_highlights.slice(0, 3).map((s, idx) => (
                  <li key={idx} className="text-xs text-emerald-900 flex items-start space-x-1.5">
                    <span className="text-emerald-400 flex-shrink-0">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Friction Points */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5">
              <div className="flex items-center space-x-1.5 mb-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">Friction Alerts</span>
              </div>
              {friction_points.length === 0 ? (
                <p className="text-xs text-amber-800">No major dealbreaker friction detected.</p>
              ) : (
                <ul className="space-y-2">
                  {friction_points.map((fp, idx) => (
                    <li key={idx} className="text-xs text-amber-900">
                      <span className="font-semibold text-amber-800">[{fp.severity.toUpperCase()}] {fp.title}:</span>{' '}
                      {fp.description}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Detailed Dual-Column Comparison */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
            {/* Table Header */}
            <div className="grid grid-cols-12 bg-slate-100 border-b border-slate-200 text-xs font-bold text-slate-700 py-3 px-4">
              <div className="col-span-4 uppercase tracking-wider text-slate-400">Attribute</div>
              <div className="col-span-4 text-slate-900 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span className="truncate">{client.first_name} (Client)</span>
              </div>
              <div className="col-span-4 text-slate-900 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                <span className="truncate">{c.first_name} (Candidate)</span>
              </div>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {/* Profile Snapshot */}
              <div className="grid grid-cols-12 py-3 px-4 items-center bg-slate-50/50">
                <div className="col-span-4 font-semibold text-slate-500">Profile Photo</div>
                <div className="col-span-4">
                  <div className="h-10 w-10 rounded-lg overflow-hidden border border-slate-200">
                    {client.photo_url ? (
                      <Image src={client.photo_url} alt="" width={40} height={40} className="object-cover w-full h-full" unoptimized />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-slate-200 font-bold">{client.first_name[0]}</div>
                    )}
                  </div>
                </div>
                <div className="col-span-4">
                  <div className="h-10 w-10 rounded-lg overflow-hidden border border-slate-200">
                    {c.photo_url ? (
                      <Image src={c.photo_url} alt="" width={40} height={40} className="object-cover w-full h-full" unoptimized />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-slate-200 font-bold">{c.first_name[0]}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* 1. Personal & Physical */}
              <div className="grid grid-cols-12 py-2 px-4"><div className="col-span-4 text-slate-400">Age & DOB</div><div className="col-span-4 font-medium">{client.age} yrs ({client.dob})</div><div className="col-span-4 font-medium">{c.age} yrs ({c.dob})</div></div>
              <div className="grid grid-cols-12 py-2 px-4"><div className="col-span-4 text-slate-400">Height</div><div className="col-span-4 font-medium">{client.height_formatted}</div><div className="col-span-4 font-medium">{c.height_formatted}</div></div>
              <div className="grid grid-cols-12 py-2 px-4"><div className="col-span-4 text-slate-400">Marital Status</div><div className="col-span-4 font-medium">{client.marital_status}</div><div className="col-span-4 font-medium">{c.marital_status}</div></div>
              <div className="grid grid-cols-12 py-2 px-4"><div className="col-span-4 text-slate-400">Current City</div><div className="col-span-4 font-medium">{client.city}</div><div className="col-span-4 font-medium">{c.city}</div></div>
              <div className="grid grid-cols-12 py-2 px-4"><div className="col-span-4 text-slate-400">Hometown</div><div className="col-span-4 font-medium">{client.hometown}</div><div className="col-span-4 font-medium">{c.hometown}</div></div>

              {/* 2. Education & Career */}
              <div className="grid grid-cols-12 py-2 px-4 bg-slate-50/40"><div className="col-span-4 text-slate-400 font-semibold">Undergrad College</div><div className="col-span-4 font-medium">{client.ug_college}</div><div className="col-span-4 font-medium">{c.ug_college}</div></div>
              <div className="grid grid-cols-12 py-2 px-4 bg-slate-50/40"><div className="col-span-4 text-slate-400">Highest Degree</div><div className="col-span-4 font-medium">{client.degree}</div><div className="col-span-4 font-medium">{c.degree}</div></div>
              <div className="grid grid-cols-12 py-2 px-4 bg-slate-50/40"><div className="col-span-4 text-slate-400">Profession / Title</div><div className="col-span-4 font-medium">{client.designation}</div><div className="col-span-4 font-medium">{c.designation}</div></div>
              <div className="grid grid-cols-12 py-2 px-4 bg-slate-50/40"><div className="col-span-4 text-slate-400">Company</div><div className="col-span-4 font-medium">{client.current_company}</div><div className="col-span-4 font-medium">{c.current_company}</div></div>
              <div className="grid grid-cols-12 py-2 px-4 bg-slate-50/40"><div className="col-span-4 text-slate-400 font-semibold">Annual Income</div><div className="col-span-4 font-bold text-emerald-700">{formatIncome(client.income_lpa)}</div><div className="col-span-4 font-bold text-emerald-700">{formatIncome(c.income_lpa)}</div></div>

              {/* 3. Cultural & Family */}
              <div className="grid grid-cols-12 py-2 px-4"><div className="col-span-4 text-slate-400">Religion & Community</div><div className="col-span-4 font-medium">{client.religion} · {client.caste}</div><div className="col-span-4 font-medium">{c.religion} · {c.caste}</div></div>
              <div className="grid grid-cols-12 py-2 px-4"><div className="col-span-4 text-slate-400">Mother Tongue</div><div className="col-span-4 font-medium">{client.mother_tongue}</div><div className="col-span-4 font-medium">{c.mother_tongue}</div></div>
              <div className="grid grid-cols-12 py-2 px-4"><div className="col-span-4 text-slate-400">Family Type</div><div className="col-span-4 font-medium">{client.family_type}</div><div className="col-span-4 font-medium">{c.family_type}</div></div>
              <div className="grid grid-cols-12 py-2 px-4"><div className="col-span-4 text-slate-400">Manglik Status</div><div className="col-span-4 font-medium">{client.manglik_status}</div><div className="col-span-4 font-medium">{c.manglik_status}</div></div>

              {/* 4. Lifestyle & Habits */}
              <div className="grid grid-cols-12 py-2 px-4 bg-slate-50/40"><div className="col-span-4 text-slate-400 font-semibold">Diet</div><div className="col-span-4 font-medium">{clientDietCfg.emoji} {client.diet}</div><div className="col-span-4 font-medium">{candDietCfg.emoji} {c.diet}</div></div>
              <div className="grid grid-cols-12 py-2 px-4 bg-slate-50/40"><div className="col-span-4 text-slate-400">Smoking</div><div className="col-span-4 font-medium">{client.smoking}</div><div className="col-span-4 font-medium">{c.smoking}</div></div>
              <div className="grid grid-cols-12 py-2 px-4 bg-slate-50/40"><div className="col-span-4 text-slate-400">Drinking</div><div className="col-span-4 font-medium">{client.drinking}</div><div className="col-span-4 font-medium">{c.drinking}</div></div>

              {/* 5. Dealbreakers & Outlook */}
              <div className="grid grid-cols-12 py-2 px-4"><div className="col-span-4 text-slate-400 font-semibold">Want Kids</div><div className="col-span-4 font-medium">{client.want_kids}</div><div className="col-span-4 font-medium">{c.want_kids}</div></div>
              <div className="grid grid-cols-12 py-2 px-4"><div className="col-span-4 text-slate-400 font-semibold">Open to Relocate</div><div className="col-span-4 font-medium">{client.open_to_relocate}</div><div className="col-span-4 font-medium">{c.open_to_relocate}</div></div>
              <div className="grid grid-cols-12 py-2 px-4"><div className="col-span-4 text-slate-400 font-semibold">Open to Pets</div><div className="col-span-4 font-medium">{client.open_to_pets}</div><div className="col-span-4 font-medium">{c.open_to_pets}</div></div>
            </div>
          </div>

          {/* Partner Preferences */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1">
              Candidate's Expressed Preferences
            </span>
            <p className="text-xs text-slate-700 italic">
              "{c.partner_preferences_summary}"
            </p>
          </div>

        </div>

    

      </div>
    </div>
  );
}