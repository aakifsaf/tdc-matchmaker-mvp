'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { HeartHandshake, Mail, Lock, Zap, AlertCircle, Loader2, ShieldCheck, ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e?: React.FormEvent, demoMode = false) {
    e?.preventDefault();
    setError('');
    setLoading(true);

    const loginEmail = demoMode ? 'priya.sharma@thedatecrew.com' : email;
    const loginPassword = demoMode ? 'tdc2026' : password;

    try {
      const res = await api.login(loginEmail, loginPassword);
      localStorage.setItem('tdc_matchmaker', JSON.stringify(res.matchmaker));
      localStorage.setItem('tdc_token', res.token);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">

      {/* Top Nav */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-rose-600 to-rose-500 flex items-center justify-center shadow-sm">
              <HeartHandshake className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-slate-900 tracking-tight">The Date Crew</span>
          </Link>

          <Link
            href="/"
            className="flex items-center space-x-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Main */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-6">

          {/* Heading */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-rose-50 border border-rose-100 mb-4">
              <ShieldCheck className="h-7 w-7 text-rose-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Matchmaker Sign In</h1>
            <p className="text-slate-500 text-sm mt-1">Internal access only</p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

            <div className="p-6 space-y-5">
              {/* Error */}
              {error && (
                <div className="flex items-start space-x-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}

              <form onSubmit={(e) => handleLogin(e, false)} className="space-y-4">
                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Staff Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="name@thedatecrew.com"
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition bg-slate-50 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition bg-slate-50 focus:bg-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-700 text-white text-sm font-semibold transition-all flex items-center justify-center space-x-2 disabled:opacity-60"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  <span>{loading ? 'Signing in...' : 'Sign In'}</span>
                </button>
              </form>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 bg-white text-xs text-slate-400 font-medium">or use demo</span>
                </div>
              </div>

              {/* One-Click Demo */}
              <button
                onClick={() => handleLogin(undefined, true)}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold transition-all flex items-center justify-center space-x-2 shadow-sm shadow-rose-200 disabled:opacity-60"
              >
                <Zap className="h-4 w-4" />
                <span>One-Click Login as Priya Sharma</span>
              </button>
            </div>

            {/* Demo Credentials Footer */}
            <div className="bg-slate-50 border-t border-slate-100 px-6 py-4">
              <p className="text-xs font-semibold text-slate-600 mb-1">Demo Credentials</p>
              <p className="text-xs text-slate-500 font-mono">priya.sharma@thedatecrew.com</p>
              <p className="text-xs text-slate-500 mt-0.5">Password: <span className="font-mono">tdc2026</span></p>
            </div>
          </div>

          <p className="text-center text-slate-400 text-xs">
            The Date Crew · Confidential Internal Tool
          </p>
        </div>
      </div>
    </div>
  );
}