'use client';

import { useEffect, useState, useCallback } from 'react';
import { Search, SlidersHorizontal, RefreshCw } from 'lucide-react';
import Navbar from '@/components/Navbar';
import PipelineMetrics from '@/components/PipelineMetrics';
import CustomerCard from '@/components/CustomerCard';
import { Customer, JourneyStatus } from '@/types/customer';
import { api } from '@/lib/api';

type FilterStatus = 'All' | JourneyStatus;

const FILTER_TABS: FilterStatus[] = ['All', 'New', 'Interviewing', 'Active Matching', 'Matches Sent', 'Matched'];

interface StatsData {
  totalClients: number;
  newOnboarding: number;
  interviewing: number;
  activeMatching: number;
  matchesSent: number;
  matched: number;
}

export default function DashboardPage() {
  const [matchmaker, setMatchmaker] = useState<{ name: string; role: string } | null>(null);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('All');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Load matchmaker session
  useEffect(() => {
    const stored = localStorage.getItem('tdc_matchmaker');
    if (stored) setMatchmaker(JSON.parse(stored));
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 250);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch dashboard data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, customersRes] = await Promise.all([
        api.getStats(),
        api.getCustomers(
          activeFilter !== 'All' ? activeFilter : undefined,
          debouncedSearch || undefined
        )
      ]);
      setStats(statsRes.stats);
      setCustomers(customersRes.customers);
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    } finally {
      setLoading(false);
    }
  }, [activeFilter, debouncedSearch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function handleStatusChange(id: string, newStatus: JourneyStatus) {
    // Immediately remove from current filtered view if it no longer matches
    if (activeFilter !== 'All' && newStatus !== activeFilter) {
      setCustomers(prev => prev.filter(c => c.id !== id));
    }
  }

  const tabCount = (tab: FilterStatus): number | null => {
    if (!stats) return null;
    const map: Record<FilterStatus, number> = {
      'All': stats.totalClients,
      'New': stats.newOnboarding,
      'Interviewing': stats.interviewing,
      'Active Matching': stats.activeMatching,
      'Matches Sent': stats.matchesSent,
      'Matched': stats.matched
    };
    return map[tab];
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar matchmakerName={matchmaker?.name} matchmakerRole={matchmaker?.role} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Client Pipeline
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              {matchmaker ? `Assigned to ${matchmaker.name}` : 'Matchmaker Dashboard'} · {stats?.totalClients ?? '–'} active clients
            </p>
          </div>
          <button
            onClick={fetchData}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-white hover:border-slate-300 text-sm font-medium transition-all"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span className="hidden sm:block">Refresh</span>
          </button>
        </div>

        {/* Pipeline Metrics */}
        {stats && <PipelineMetrics stats={stats} />}
        {!stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-24 bg-white rounded-xl border border-slate-200 animate-pulse" />
            ))}
          </div>
        )}

        {/* Filter Tabs + Search */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Stage Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
            {FILTER_TABS.map(tab => {
              const count = tabCount(tab);
              const isActive = activeFilter === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveFilter(tab)}
                  className={`flex-shrink-0 flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-white hover:border-slate-300 border border-transparent'
                  }`}
                >
                  <span>{tab}</span>
                  {count !== null && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search clients..."
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition"
            />
          </div>
        </div>

        {/* Client Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-52 bg-white rounded-xl border border-slate-200 animate-pulse" />
            ))}
          </div>
        ) : customers.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
            <SlidersHorizontal className="h-8 w-8 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">No clients match your filter</p>
            <p className="text-slate-400 text-sm mt-1">Try adjusting the stage filter or clearing the search.</p>
            <button
              onClick={() => { setActiveFilter('All'); setSearch(''); }}
              className="mt-4 px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-700 transition"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {customers.map(customer => (
              <CustomerCard
                key={customer.id}
                customer={customer}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}