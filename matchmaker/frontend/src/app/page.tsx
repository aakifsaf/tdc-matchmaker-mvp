'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Sparkles, ShieldCheck, ArrowRight, HeartHandshake, Users, Zap, Brain } from 'lucide-react';

export default function HomePage() {
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    async function checkHealth() {
      try {
        const health = await api.getHealth();
        if (health.status === 'ok') {
          setBackendStatus('connected');
          const statsRes = await api.getStats();
          setStats(statsRes.stats);
        }
      } catch (err) {
        setBackendStatus('error');
      }
    }
    checkHealth();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">

      {/* Top Nav */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-rose-600 to-rose-500 flex items-center justify-center shadow-sm">
              <HeartHandshake className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-slate-900 tracking-tight">The Date Crew</span>
          </div>

        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 max-w-6xl mx-auto px-6 py-16 w-full">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">

          {/* Left: Hero Text */}
          <div className="md:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Two-Tier Engine + AI Copilot</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Internal Matchmaker
              <br />
              <span className="text-rose-600">Intelligence & Pipeline</span>
            </h1>

            <p className="text-slate-500 text-base md:text-lg max-w-xl leading-relaxed">
              Designed exclusively for TDC senior matchmakers. Evaluate verified Indian matrimonial biodata, run gender-specific dealbreaker gates, inspect AI friction risk alerts, and dispatch curated introductions — all in under 60 seconds.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/login"
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm shadow-lg shadow-rose-200 transition-all transform hover:-translate-y-0.5"
              >
                <span>Launch Matchmaker Portal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/dashboard"
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-sm transition-all"
              >
                <span>Skip to Dashboard (Demo)</span>
              </Link>
            </div>

          </div>

          {/* Right: Metrics Card */}
          <div className="md:col-span-5">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
              {/* Card Header */}
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-5 py-4 flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-rose-500 to-rose-400 flex items-center justify-center text-white text-xs font-bold shadow">
                  PS
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">Priya Sharma</p>
                  <p className="text-slate-400 text-xs">Senior Matchmaker · TDC Mumbai</p>
                </div>
                <div className="ml-auto">
                  <ShieldCheck className="h-4 w-4 text-rose-400" />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="p-5 grid grid-cols-2 gap-3">
                {[
                  { label: 'Assigned Clients', value: stats?.totalClients ?? '12', color: 'text-slate-900' },
                  { label: 'Active Matching', value: stats?.activeMatching ?? '5', color: 'text-rose-600' },
                  { label: 'Candidate Pool', value: '210+', color: 'text-emerald-600' },
                  { label: 'Matches Sent', value: stats?.matchesSent ?? '2', color: 'text-amber-600' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
                    <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>

              {/* CTA inside card */}
              <div className="px-5 pb-5">
                <Link
                  href="/login"
                  className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold transition-all"
                >
                  <span>Sign In as Priya Sharma</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
          <span>The Date Crew (TDC) · Confidential Internal Tool · v1.0</span>
          <span>Node/Express + Next.js 14 · openai/gpt-oss-120b</span>
        </div>
      </footer>
    </main>
  );
}
