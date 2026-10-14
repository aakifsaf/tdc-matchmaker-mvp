'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  MapPin, Briefcase, GraduationCap, Sparkles, AlertTriangle,
  ChevronDown, ChevronUp, Send, Lightbulb, CheckCircle2,
  Leaf, Globe, Navigation, ArrowUpDown, ArrowRightLeft
} from 'lucide-react';
import { MatchCandidateResult } from '../types/customer';
import { formatIncome, getDietConfig } from '../lib/utils';

interface MatchCandidateCardProps {
  result: MatchCandidateResult;
  rank: number;
  onSendMatch: (result: MatchCandidateResult) => void;
  onCompare?: (result: MatchCandidateResult) => void;
}

function ScoreDial({ score }: { score: number }) {
  const color =
    score >= 88 ? 'text-emerald-600' :
    score >= 75 ? 'text-amber-600' :
    'text-slate-600';

  const bgColor =
    score >= 88 ? 'bg-emerald-50 border-emerald-200' :
    score >= 75 ? 'bg-amber-50 border-amber-200' :
    'bg-slate-50 border-slate-200';

  return (
    <div className={`flex flex-col items-center justify-center h-16 w-16 rounded-2xl border-2 ${bgColor} flex-shrink-0`}>
      <span className={`text-2xl font-extrabold leading-none ${color}`}>{score}</span>
      <span className="text-[9px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider">Score</span>
    </div>
  );
}

function BadgePill({ badge }: { badge: string }) {
  const config =
    badge === 'High Potential Match'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : badge === 'Strong Lifestyle Synergy'
      ? 'bg-blue-50 text-blue-700 border-blue-200'
      : 'bg-purple-50 text-purple-700 border-purple-200';

  return (
    <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold ${config}`}>
      <Sparkles className="h-3 w-3" />
      <span>{badge}</span>
    </span>
  );
}

const SCORE_DIMENSIONS = [
  { key: 'pedigree_and_career', label: 'Pedigree & Career', icon: GraduationCap, max: 25, color: 'bg-blue-500' },
  { key: 'lifestyle_and_habits', label: 'Lifestyle & Habits', icon: Leaf, max: 25, color: 'bg-emerald-500' },
  { key: 'cultural_and_family', label: 'Cultural & Family', icon: Globe, max: 25, color: 'bg-purple-500' },
  { key: 'relocation_and_geography', label: 'Relocation & City', icon: Navigation, max: 15, color: 'bg-amber-500' },
  { key: 'delta_optimum', label: 'Age & Height Delta', icon: ArrowUpDown, max: 10, color: 'bg-rose-500' },
];

export default function MatchCandidateCard({ result, rank, onSendMatch, onCompare }: MatchCandidateCardProps) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const { candidate: c, ai_score, ai_badge, tier2_breakdown, synergy_highlights, friction_points, icebreakers } = result;
  const dietCfg = getDietConfig(c.diet);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all overflow-hidden flex flex-col justify-between">

      {/* Score accent bar */}
      <div>
        <div
          className="h-1"
          style={{
            background: ai_score >= 88
              ? 'linear-gradient(to right, #10b981, #34d399)'
              : ai_score >= 75
              ? 'linear-gradient(to right, #f59e0b, #fbbf24)'
              : 'linear-gradient(to right, #94a3b8, #cbd5e1)'
          }}
        />

        <div className="p-5">

          {/* Header Row: Rank + Photo + Name + Score */}
          <div className="flex items-start gap-4">
            {/* Rank */}
            <div className="flex-shrink-0 h-7 w-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-500 mt-0.5">
              #{rank}
            </div>

            {/* Photo */}
            <div
              className={`flex-shrink-0 ${onCompare ? 'cursor-pointer group' : ''}`}
              onClick={() => onCompare?.(result)}
              title={onCompare ? 'Click to compare full biodata' : undefined}
            >
              <div className="h-14 w-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 relative">
                {c.photo_url ? (
                  <Image
                    src={c.photo_url}
                    alt={`${c.first_name} ${c.last_name}`}
                    width={56}
                    height={56}
                    className="object-cover w-full h-full transition group-hover:scale-105"
                    unoptimized
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-rose-100 to-slate-100 text-slate-600 font-bold text-lg">
                    {c.first_name[0]}{c.last_name[0]}
                  </div>
                )}
              </div>
            </div>

            {/* Name + Quick Facts */}
            <div className="flex-1 min-w-0">
              <button
                type="button"
                onClick={() => onCompare?.(result)}
                className="text-left font-bold text-slate-900 text-base leading-tight hover:text-rose-600 transition"
              >
                {c.first_name} {c.last_name}
              </button>
              <p className="text-xs text-slate-500 mt-0.5">
                {c.age} yrs · {c.height_formatted} · {c.marital_status}
              </p>
              <div className="flex items-center space-x-1 mt-1">
                <MapPin className="h-3 w-3 text-slate-400 flex-shrink-0" />
                <span className="text-xs text-slate-500">{c.city}</span>
              </div>
            </div>

            {/* Score Dial */}
            <ScoreDial score={ai_score} />
          </div>

          {/* AI Badge */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <BadgePill badge={ai_badge} />
            <span className={`text-xs px-2 py-0.5 rounded-md font-medium border ${dietCfg.color}`}>
              {dietCfg.emoji} {c.diet}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-md font-medium bg-slate-50 text-slate-600 border border-slate-200">
              {formatIncome(c.income_lpa)}
            </span>
          </div>

          {/* Professional */}
          <div className="mt-3 space-y-1.5">
            <div className="flex items-center space-x-2">
              <Briefcase className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
              <span className="text-xs text-slate-700 font-medium">{c.designation}</span>
            </div>
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
              <span className="text-xs text-slate-500">{c.ug_college}</span>
            </div>
            <div className="text-xs text-slate-500 pl-5">{c.current_company} · {c.religion} · {c.family_type} Family</div>
          </div>

          {/* Score Breakdown Toggle */}
          <button
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="mt-4 w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors text-xs font-semibold text-slate-600"
          >
            <span>Tier 2 Compatibility Breakdown</span>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-slate-900">{tier2_breakdown.total}/100</span>
              {showBreakdown ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </div>
          </button>

          {showBreakdown && (
            <div className="mt-2 space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
              {SCORE_DIMENSIONS.map(({ key, label, icon: Icon, max, color }) => {
                const val = tier2_breakdown[key as keyof typeof tier2_breakdown] as number;
                const pct = Math.round((val / max) * 100);
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-1.5">
                        <Icon className="h-3 w-3 text-slate-400" />
                        <span className="text-[11px] font-medium text-slate-600">{label}</span>
                      </div>
                      <span className="text-[11px] font-bold text-slate-700">{val}/{max}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${color} transition-all`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Synergy Highlights */}
          {synergy_highlights.length > 0 && (
            <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-xl p-3.5">
              <div className="flex items-center space-x-1.5 mb-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">Synergy Highlights</span>
              </div>
              <ul className="space-y-1.5">
                {synergy_highlights.map((s, i) => (
                  <li key={i} className="flex items-start space-x-2 text-xs text-emerald-800">
                    <span className="text-emerald-400 mt-0.5 flex-shrink-0">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* AI Friction Points & Risk Analysis */}
          {friction_points.length > 0 && (
            <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3.5">
              <div className="flex items-center space-x-1.5 mb-2.5">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">AI Friction & Risk Analysis</span>
              </div>
              <div className="space-y-3">
                {friction_points.map((fp, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase ${
                        fp.severity === 'high' ? 'bg-red-100 text-red-700' :
                        fp.severity === 'medium' ? 'bg-amber-100 text-amber-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {fp.severity}
                      </span>
                      <span className="text-xs font-semibold text-amber-900">{fp.title}</span>
                    </div>
                    <p className="text-xs text-amber-800 pl-1">{fp.description}</p>
                    <p className="text-[11px] text-amber-700 italic pl-1">
                      💬 Talking point: "{fp.talking_point_for_matchmaker}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Icebreakers */}
          {icebreakers.length > 0 && (
            <div className="mt-3 bg-blue-50 border border-blue-200 rounded-xl p-3.5">
              <div className="flex items-center space-x-1.5 mb-2">
                <Lightbulb className="h-4 w-4 text-blue-600" />
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">AI Icebreakers</span>
              </div>
              <ul className="space-y-1">
                {icebreakers.map((ice, i) => (
                  <li key={i} className="text-xs text-blue-800 flex items-start space-x-2">
                    <span className="text-blue-400 flex-shrink-0 mt-0.5">{i + 1}.</span>
                    <span>{ice}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons: Compare + Send */}
      <div className="p-5 pt-0 grid grid-cols-2 gap-2 mt-4">
        {onCompare && (
          <button
            onClick={() => onCompare(result)}
            className="flex items-center justify-center space-x-1.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition"
          >
            <ArrowRightLeft className="h-3.5 w-3.5 text-slate-500" />
            <span>Compare Details</span>
          </button>
        )}
        <button
          onClick={() => onSendMatch(result)}
          className={`flex items-center justify-center space-x-1.5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-sm shadow-rose-200 ${
            !onCompare ? 'col-span-2' : ''
          }`}
        >
          <Send className="h-3.5 w-3.5" />
          <span>Send Match</span>
        </button>
      </div>

    </div>
  );
}