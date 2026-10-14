import { Users, UserSearch, Send, Heart, MessageSquare, Star } from 'lucide-react';

interface StatsData {
  totalClients: number;
  newOnboarding: number;
  interviewing: number;
  activeMatching: number;
  matchesSent: number;
  matched: number;
}

interface PipelineMetricsProps {
  stats: StatsData;
}

const tiles = [
  { key: 'totalClients', label: 'Total Clients', icon: Users, color: 'text-slate-600', bg: 'bg-slate-100' },
  { key: 'newOnboarding', label: 'New / Onboarding', icon: Star, color: 'text-blue-600', bg: 'bg-blue-50' },
  { key: 'interviewing', label: 'Interviewing', icon: MessageSquare, color: 'text-purple-600', bg: 'bg-purple-50' },
  { key: 'activeMatching', label: 'Active Matching', icon: UserSearch, color: 'text-amber-600', bg: 'bg-amber-50' },
  { key: 'matchesSent', label: 'Matches Sent', icon: Send, color: 'text-rose-600', bg: 'bg-rose-50' },
  { key: 'matched', label: 'Matched', icon: Heart, color: 'text-emerald-600', bg: 'bg-emerald-50' },
];

export default function PipelineMetrics({ stats }: PipelineMetricsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {tiles.map(({ key, label, icon: Icon, color, bg }) => (
        <div
          key={key}
          className="bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 hover:shadow-sm transition-all"
        >
          <div className={`inline-flex p-2 rounded-lg ${bg} mb-3`}>
            <Icon className={`h-4 w-4 ${color}`} />
          </div>
          <p className="text-2xl font-bold text-slate-900 leading-none">
            {stats[key as keyof StatsData]}
          </p>
          <p className="text-xs text-slate-500 mt-1 leading-tight">{label}</p>
        </div>
      ))}
    </div>
  );
}