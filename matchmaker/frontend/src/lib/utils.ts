import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { JourneyStatus } from '../types/customer';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatIncome(lpa: number): string {
  if (lpa >= 100) return `₹${(lpa / 100).toFixed(1)} Cr LPA`;
  return `₹${lpa} LPA`;
}

export function formatAge(dob: string): number {
  const today = new Date();
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export function getStatusConfig(status: JourneyStatus): {
  label: string;
  bg: string;
  text: string;
  border: string;
  dot: string;
} {
  const map: Record<JourneyStatus, { label: string; bg: string; text: string; border: string; dot: string }> = {
    'New': {
      label: 'New',
      bg: 'bg-slate-100',
      text: 'text-slate-700',
      border: 'border-slate-200',
      dot: 'bg-slate-400'
    },
    'Interviewing': {
      label: 'Interviewing',
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      dot: 'bg-blue-500'
    },
    'Active Matching': {
      label: 'Active Matching',
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      dot: 'bg-amber-500'
    },
    'Matches Sent': {
      label: 'Matches Sent',
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200',
      dot: 'bg-rose-500'
    },
    'Matched': {
      label: 'Matched',
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      dot: 'bg-emerald-500'
    }
  };
  return map[status];
}

export function getDietConfig(diet: string): { emoji: string; color: string } {
  const map: Record<string, { emoji: string; color: string }> = {
    'Vegetarian': { emoji: '🌿', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    'Vegan': { emoji: '🌱', color: 'text-green-700 bg-green-50 border-green-200' },
    'Jain': { emoji: '☮️', color: 'text-purple-700 bg-purple-50 border-purple-200' },
    'Eggetarian': { emoji: '🥚', color: 'text-yellow-700 bg-yellow-50 border-yellow-200' },
    'Non-Vegetarian': { emoji: '🍗', color: 'text-red-700 bg-red-50 border-red-200' },
  };
  return map[diet] || { emoji: '🍽️', color: 'text-slate-700 bg-slate-50 border-slate-200' };
}

export function getAnswerConfig(answer: string): { emoji: string; color: string } {
  if (answer === 'Yes') return { emoji: '✓', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
  if (answer === 'No') return { emoji: '✕', color: 'text-red-700 bg-red-50 border-red-200' };
  return { emoji: '~', color: 'text-amber-700 bg-amber-50 border-amber-200' };
}

export function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}