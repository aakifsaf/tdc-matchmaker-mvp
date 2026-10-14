'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  MapPin, Briefcase, ChevronDown, Loader2,
  ClipboardList, Heart, Sparkles, GraduationCap,
  ArrowLeft, ShieldCheck, RefreshCw, Users, Clock, Send
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import BiodataView from '@/components/BiodataView';
import NotesTimeline from '@/components/NotesTimeline';
import MatchCandidateCard from '@/components/MatchCandidateCard';
import SendMatchModal from '@/components/SendMatchModal';
import CandidateCompareDrawer from '@/components/CandidateCompareDrawer';
import AICopilotSteeringBar from '@/components/AICopilotSteeringBar';
import DispatchedHistoryTab from '@/components/DispatchedHistoryTab';
import { Customer, MatchNote, DispatchedMatch, JourneyStatus, MatchCandidateResult } from '@/types/customer';
import { api } from '@/lib/api';
import { getStatusConfig, formatIncome } from '@/lib/utils';

type Tab = 'biodata' | 'matches' | 'dispatches' | 'notes';
const ALL_STATUSES: JourneyStatus[] = ['New', 'Interviewing', 'Active Matching', 'Matches Sent', 'Matched'];

export default function CustomerDetailPage() {
  const params = useParams<{ id: string }>();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [notes, setNotes] = useState<MatchNote[]>([]);
  const [dispatches, setDispatches] = useState<DispatchedMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('biodata');
  const [status, setStatus] = useState<JourneyStatus>('New');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [matchmaker, setMatchmaker] = useState<{ name: string; role: string } | null>(null);
  const [activePrompt, setActivePrompt] = useState<string | null>(null);
  const [reranking, setReranking] = useState(false);
  const [originalMatches, setOriginalMatches] = useState<MatchCandidateResult[]>([]);

  // Matching state & Cache
  const [matches, setMatches] = useState<MatchCandidateResult[]>([]);
  const [matchLoading, setMatchLoading] = useState(false);
  const [cachedTime, setCachedTime] = useState<string | null>(null);
  const [matchMeta, setMatchMeta] = useState<{
    total_pool: number;
    passed_tier1: number;
    showing: number;
  } | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<MatchCandidateResult | null>(null);
  const [comparingCandidate, setComparingCandidate] = useState<MatchCandidateResult | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('tdc_matchmaker');
    if (stored) setMatchmaker(JSON.parse(stored));
  }, []);

  useEffect(() => {
    async function fetchCustomer() {
      if (!params.id) return;
      setLoading(true);
      try {
        const res = await api.getCustomerById(params.id);
        setCustomer(res.customer);
        setNotes(res.notes);
        setDispatches(res.dispatches);
        setStatus(res.customer.status_tag);

        // Load cached matches for this customer if they exist
        const cacheKey = `tdc_matches_${params.id}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (parsed.matches && parsed.matches.length > 0) {
              setMatches(parsed.matches);
              setMatchMeta(parsed.meta || null);
              setCachedTime(parsed.savedAt || null);
            }
          } catch (e) {
            console.error('Failed to parse cached matches', e);
          }
        }
      } catch (err) {
        console.error('Failed to load customer', err);
      } finally {
        setLoading(false);
      }
    }
    fetchCustomer();
  }, [params.id]);

  // Fetch / Regenerate matches
  const fetchMatches = useCallback(async (force = false) => {
    if (!customer) return;

    const cacheKey = `tdc_matches_${customer.id}`;

    // If not forcing and cache exists, restore cache
    if (!force) {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed.matches && parsed.matches.length > 0) {
            setMatches(parsed.matches);
            setMatchMeta(parsed.meta || null);
            setCachedTime(parsed.savedAt || null);
            return;
          }
        } catch (e) {}
      }
    }

    // Otherwise run engine through Groq API
    setMatchLoading(true);
    try {
      const res = await api.generateMatches(customer.id);
      const meta = {
        total_pool: res.total_pool_evaluated,
        passed_tier1: res.passed_tier1_count,
        showing: res.matches.length
      };
      const nowStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

      setMatches(res.matches);
      setOriginalMatches(res.matches);
      setMatchMeta(meta);
      setCachedTime(nowStr);

      // Save to localStorage for instant load next time
      localStorage.setItem(cacheKey, JSON.stringify({
        matches: res.matches,
        meta,
        savedAt: nowStr
      }));
    } catch (err) {
      console.error('Failed to generate matches', err);
    } finally {
      setMatchLoading(false);
    }
  }, [customer]);

  // Auto-load matches on tab switch only if not already loaded and not cached
  useEffect(() => {
    if (activeTab === 'matches' && matches.length === 0 && customer) {
      fetchMatches(false);
    }
  }, [activeTab, matches.length, customer, fetchMatches]);

  async function handleStatusChange(newStatus: JourneyStatus) {
    if (!customer) return;
    setShowStatusDropdown(false);
    setStatus(newStatus);
    try {
      await api.updateCustomerStatus(customer.id, newStatus);
    } catch (err) {
      setStatus(customer.status_tag);
    }
  }

  function handleMatchDispatched() {
    setStatus('Matches Sent');
    if (customer) {
      api.getCustomerById(customer.id).then(res => setDispatches(res.dispatches));
    }
  }

    async function handlePromptRerank(prompt: string) {
    if (!customer || matches.length === 0) return;
    setReranking(true);
    try {
      const candidateIds = matches.map(m => m.candidate.id);
      const res = await api.rerankMatches(customer.id, prompt, candidateIds);

      // Map reranked results back onto matches
      const updatedMatches = matches.map(match => {
        const insight = res.results.find(r => r.candidate_id === match.candidate.id);
        if (!insight) return match;
        return {
          ...match,
          ai_score: insight.reranked_score,
          ai_badge: insight.custom_badge,
          synergy_highlights: insight.synergy_highlights && insight.synergy_highlights.length > 0
            ? insight.synergy_highlights
            : [insight.prompt_justification, ...match.synergy_highlights.slice(0, 1)]
        };
      });

      // Sort by the new reranked score descending
      updatedMatches.sort((a, b) => b.ai_score - a.ai_score);

      setMatches(updatedMatches);
      setActivePrompt(prompt);
    } catch (err) {
      console.error('Failed to rerank with prompt:', err);
    } finally {
      setReranking(false);
    }
  }

  function handleResetPrompt() {
    if (originalMatches.length > 0) {
      setMatches(originalMatches);
    }
    setActivePrompt(null);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar matchmakerName={matchmaker?.name} matchmakerRole={matchmaker?.role} backHref="/dashboard" backLabel="Dashboard" />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex items-center space-x-3 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin text-rose-500" />
            <span className="text-sm font-medium">Loading client profile...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar backHref="/dashboard" backLabel="Dashboard" />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <p className="text-slate-500">Client profile not found.</p>
          <Link href="/dashboard" className="mt-4 inline-block text-rose-600 hover:underline text-sm font-medium">← Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  const statusCfg = getStatusConfig(status);

  const TABS = [
    { key: 'biodata' as Tab, label: 'Biodata Profile', icon: GraduationCap },
    { key: 'matches' as Tab, label: 'Suggested Matches', icon: Sparkles, badge: matches.length > 0 ? `${matches.length}` : 'AI' },
    { key: 'dispatches' as Tab, label: 'Dispatched & Feedback', icon: Send, badge: dispatches.length > 0 ? `${dispatches.length}` : undefined },
    { key: 'notes' as Tab, label: 'Matchmaker Notes', icon: ClipboardList, badge: notes.length > 0 ? String(notes.length) : undefined }
  ];

  const tier1Rules = customer.gender === 'Male'
    ? ['Candidate strictly younger', 'Candidate earns strictly less', 'Candidate strictly shorter', 'Matching views on children']
    : ['Candidate income ≥ 90% client income', 'Relocation harmony enforced', 'Kids outlook aligned'];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar
        matchmakerName={matchmaker?.name}
        matchmakerRole={matchmaker?.role}
        backHref="/dashboard"
        backLabel="All Clients"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* Hero Banner */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="h-1.5 bg-gradient-to-r from-rose-500 via-rose-400 to-amber-400" />
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-start gap-5">
              {/* Photo */}
              <div className="relative flex-shrink-0">
                <div className="h-20 w-20 rounded-2xl overflow-hidden bg-slate-100 border-2 border-slate-200 shadow-sm">
                  {customer.photo_url ? (
                    <Image
                      src={customer.photo_url}
                      alt={`${customer.first_name} ${customer.last_name}`}
                      width={80}
                      height={80}
                      className="object-cover w-full h-full"
                      unoptimized
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-rose-100 to-slate-100 text-slate-700 font-bold text-2xl">
                      {customer.first_name[0]}{customer.last_name[0]}
                    </div>
                  )}
                </div>
                <div className={`absolute -bottom-2 -right-2 px-1.5 py-0.5 rounded-full border-2 border-white text-[9px] font-bold ${customer.gender === 'Male' ? 'bg-blue-500 text-white' : 'bg-rose-500 text-white'}`}>
                  {customer.gender === 'Male' ? '♂' : '♀'}
                </div>
              </div>

              {/* Core Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h1 className="text-xl font-bold text-slate-900">{customer.first_name} {customer.last_name}</h1>
                    <p className="text-slate-500 text-sm mt-0.5">{customer.age} yrs · {customer.height_formatted} · {customer.marital_status}</p>
                  </div>

                  {/* Status Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                      className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border} hover:opacity-80`}
                    >
                      <span className={`w-2 h-2 rounded-full ${statusCfg.dot}`} />
                      <span>{status}</span>
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                    {showStatusDropdown && (
                      <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-slate-200 rounded-xl shadow-lg py-1 w-44">
                        {ALL_STATUSES.map(s => {
                          const cfg = getStatusConfig(s);
                          return (
                            <button
                              key={s}
                              onClick={() => handleStatusChange(s)}
                              className={`w-full text-left px-3 py-1.5 text-xs font-medium flex items-center space-x-2 hover:bg-slate-50 transition-colors ${s === status ? 'opacity-40 pointer-events-none' : ''}`}
                            >
                              <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                              <span>{s}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick chips */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {[
                    { icon: MapPin, label: customer.city },
                    { icon: Briefcase, label: `${customer.designation} · ${customer.current_company}` },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center space-x-1.5 text-xs text-slate-600 bg-slate-50 rounded-lg px-2.5 py-1 border border-slate-100">
                      <Icon className="h-3 w-3 text-slate-400" />
                      <span>{label}</span>
                    </div>
                  ))}
                  <div className="text-xs font-bold text-emerald-700 bg-emerald-50 rounded-lg px-2.5 py-1 border border-emerald-100">
                    {formatIncome(customer.income_lpa)}
                  </div>
                  <div className="text-xs text-slate-600 bg-slate-50 rounded-lg px-2.5 py-1 border border-slate-100">
                    {customer.religion} · {customer.caste}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Bar */}
          <div className="border-t border-slate-100 px-6 flex items-center space-x-1 overflow-x-auto">
            {TABS.map(({ key, label, icon: Icon, badge }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center space-x-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap -mb-px ${
                  activeTab === key
                    ? 'border-rose-500 text-rose-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
                {badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${badge === 'AI' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                    {badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {/* Tab 1: Biodata */}
          {activeTab === 'biodata' && <BiodataView customer={customer} />}

          {/* Tab 2: Suggested Matches */}
          {activeTab === 'matches' && (
            <div className="space-y-5">

              {/* Active Rules Banner */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-rose-50 rounded-xl border border-rose-100">
                      <ShieldCheck className="h-5 w-5 text-rose-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        Tier 1 Active Rules · {customer.gender} Client Logic
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">Hard dealbreaker gates applied before scoring</p>
                    </div>
                  </div>
                  {matchMeta && (
                    <div className="flex items-center gap-3 text-xs font-semibold">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg border border-slate-200">
                        {matchMeta.total_pool} evaluated
                      </span>
                      <span className="text-slate-400">→</span>
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200">
                        {matchMeta.passed_tier1} passed gates
                      </span>
                      <span className="text-slate-400">→</span>
                      <span className="px-2.5 py-1 bg-rose-50 text-rose-700 rounded-lg border border-rose-200">
                        Top {matchMeta.showing} shown
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  {tier1Rules.map(rule => (
                    <div key={rule} className="flex items-center space-x-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-600">
                      <ShieldCheck className="h-3 w-3 text-slate-400" />
                      <span>{rule}</span>
                    </div>
                  ))}
                </div>

                {/* Cache Status & Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
                  <div className="text-xs text-slate-500 flex items-center space-x-1.5">
                    {cachedTime ? (
                      <>
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <span>Saved matches loaded (Generated at {cachedTime})</span>
                      </>
                    ) : (
                      <span>No saved matches. Click below to generate.</span>
                    )}
                  </div>
                  <button
                    onClick={() => fetchMatches(true)}
                    disabled={matchLoading}
                    className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-rose-600 text-white text-xs font-bold transition-all disabled:opacity-50"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${matchLoading ? 'animate-spin' : ''}`} />
                    <span>{matchLoading ? 'Analyzing...' : matches.length > 0 ? 'Regenerate Matches' : 'Run Matching Engine'}</span>
                  </button>
                </div>
              </div>

              {/* Loading State */}
              {matchLoading && (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <div className="h-16 w-16 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center">
                    <Sparkles className="h-8 w-8 text-rose-500 animate-pulse" />
                  </div>
                  <div className="text-center">
                    <p className="text-slate-700 font-semibold">Running Two-Tier Matching Engine...</p>
                    <p className="text-slate-400 text-sm mt-1">AI is evaluating compatibility & analyzing friction points</p>
                  </div>
                </div>
              )}

              {/* Empty state: no matches yet */}
              {!matchLoading && matches.length === 0 && (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
                  <Users className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-600 font-semibold">No matches generated yet</p>
                  <p className="text-slate-400 text-sm mt-1">Click "Run Matching Engine" above to start AI scoring.</p>
                </div>
              )}
              {matches.length > 0 && (
                <AICopilotSteeringBar
                  onRerank={handlePromptRerank}
                  onReset={handleResetPrompt}
                  loading={reranking}
                  activePrompt={activePrompt}
                />
              )}

              {/* Match Cards Grid */}
              {!matchLoading && matches.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {matches.map((result, i) => (
                    <MatchCandidateCard
                      key={result.candidate.id}
                      result={result}
                      rank={i + 1}
                      onSendMatch={setSelectedMatch}
                      onCompare={setComparingCandidate}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Dispatched Matches & Feedback Lifecycle */}
          {activeTab === 'dispatches' && (
            <DispatchedHistoryTab
              dispatches={dispatches}
              onDispatchesUpdated={(updated) => setDispatches(updated)}
            />
          )}

          {/* Tab 4: Notes */}
          {activeTab === 'notes' && (
            <NotesTimeline customerId={customer.id} initialNotes={notes} />
          )}
        </div>
      </div>

      {/* Side-by-Side Biodata Deep-Dive Drawer */}
      {comparingCandidate && customer && (
        <CandidateCompareDrawer
          client={customer}
          matchResult={comparingCandidate}
          onClose={() => setComparingCandidate(null)}
          onSendMatch={setSelectedMatch}
        />
      )}

      {/* Send Match Modal */}
      {selectedMatch && customer && (
        <SendMatchModal
          result={selectedMatch}
          client={customer}
          onClose={() => setSelectedMatch(null)}
          onDispatched={handleMatchDispatched}
        />
      )}
    </div>
  );
}