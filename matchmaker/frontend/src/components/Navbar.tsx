'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HeartHandshake, ChevronLeft, LayoutDashboard, LogOut } from 'lucide-react';

interface NavbarProps {
  matchmakerName?: string;
  matchmakerRole?: string;
  backHref?: string;
  backLabel?: string;
}

export default function Navbar({
  matchmakerName = 'Priya Sharma',
  matchmakerRole = 'Senior Matchmaker',
  backHref,
  backLabel
}: NavbarProps) {
  const pathname = usePathname();
  const isDashboard = pathname === '/dashboard';

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Left: Brand & Breadcrumb */}
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="flex items-center space-x-2.5 group">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-rose-600 to-rose-500 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <HeartHandshake className="h-4.5 w-4.5 text-white h-5 w-5" />
              </div>
              <span className="font-bold text-[15px] tracking-tight text-slate-900">
                The Date Crew
              </span>
            </Link>

            {/* Breadcrumb back link */}
            {backHref && !isDashboard && (
              <>
                <span className="text-slate-300 text-lg">/</span>
                <Link
                  href={backHref}
                  className="flex items-center space-x-1 text-slate-500 hover:text-rose-600 text-sm font-medium transition-colors"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  <span>{backLabel || 'Back'}</span>
                </Link>
              </>
            )}
          </div>

          {/* Right: Session info */}
          <div className="flex items-center space-x-3">

            {/* Dashboard shortcut if on customer page */}
            {!isDashboard && (
              <Link
                href="/dashboard"
                className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-sm font-medium transition-colors"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            )}

            {/* Matchmaker session pill */}
            <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-full pl-1 pr-3 py-1">
              <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-rose-500 to-rose-400 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                {matchmakerName.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="hidden sm:block">
                <p className="text-[12px] font-semibold text-slate-800 leading-tight">{matchmakerName}</p>
                <p className="text-[10px] text-slate-500 leading-tight">{matchmakerRole}</p>
              </div>
            </div>

            {/* Logout */}
            <Link
              href="/login"
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}