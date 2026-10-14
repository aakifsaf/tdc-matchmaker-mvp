'use client';

import { useState } from 'react';
import { Sparkles, Loader2, RotateCcw, Send, Compass } from 'lucide-react';

interface AICopilotSteeringBarProps {
  onRerank: (prompt: string) => void;
  onReset: () => void;
  loading: boolean;
  activePrompt: string | null;
}

const QUICK_PROMPTS = [
  'Strict vegetarian lifestyle & values',
  'Working in Tech/Startups or Product roles',
  'Graduates from IIT/BITS/SRCC Tier-1 institutions',
  'Based in Mumbai with nuclear family preference',
  'Pet lovers open to dogs and cats',
  'High-income career parity (₹30L+ LPA)'
];

export default function AICopilotSteeringBar({
  onRerank,
  onReset,
  loading,
  activePrompt
}: AICopilotSteeringBarProps) {
  const [promptText, setPromptText] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!promptText.trim() || loading) return;
    onRerank(promptText.trim());
  }

  function handleQuickPrompt(text: string) {
    setPromptText(text);
    onRerank(text);
  }

  return (
    <div className="bg-gradient-to-r from-purple-50 via-rose-50 to-amber-50 border border-purple-200/80 rounded-2xl p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-purple-600 rounded-xl text-white shadow-sm shadow-purple-300">
            <Compass className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-slate-900">AI Match Steering Copilot</h3>

            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Guide the matching algorithm in plain English to re-rank candidates based on custom client requirements
            </p>
          </div>
        </div>

        {activePrompt && (
          <button
            onClick={onReset}
            disabled={loading}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-600 rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-50"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset to Standard Engine</span>
          </button>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <input
          type="text"
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          placeholder="e.g., Prioritize strict vegetarians in tech startups who want to live in Mumbai..."
          disabled={loading}
          className="w-full pl-4 pr-32 py-3 bg-white border border-purple-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition shadow-sm"
        />
        <button
          type="submit"
          disabled={loading || !promptText.trim()}
          className="absolute right-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1.5 disabled:opacity-50 shadow-sm"
        >
          {loading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-3.5 w-3.5" />
              <span>Steer AI</span>
            </>
          )}
        </button>
      </form>

      {/* Quick Suggestion Pills */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Quick Steering Presets:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_PROMPTS.map((qp) => (
            <button
              key={qp}
              type="button"
              onClick={() => handleQuickPrompt(qp)}
              disabled={loading}
              className={`text-xs px-2.5 py-1 rounded-lg border transition font-medium ${
                activePrompt === qp
                  ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                  : 'bg-white/80 hover:bg-white text-slate-600 border-purple-200/60 hover:border-purple-300'
              }`}
            >
              {qp}
            </button>
          ))}
        </div>
      </div>

      {/* Active Filter Notification */}
      {activePrompt && (
        <div className="flex items-center justify-between text-xs bg-purple-100/70 border border-purple-200 rounded-xl px-3.5 py-2 text-purple-900">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-3.5 w-3.5 text-purple-600 flex-shrink-0" />
            <span>
              Matches actively re-ordered for: <strong className="font-semibold">"{activePrompt}"</strong>
            </span>
          </div>
          <span className="text-[11px] text-purple-700 font-medium ml-2">Dynamic Scores Applied</span>
        </div>
      )}
    </div>
  );
}