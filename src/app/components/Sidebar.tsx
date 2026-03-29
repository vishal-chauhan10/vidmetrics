'use client';

import React from 'react';
import Link from 'next/link';
import { LayoutDashboard, BarChart3, Sparkles, Video, type LucideIcon } from 'lucide-react';

export type DashboardSectionId = 'overview' | 'strategy' | 'trends' | 'videos';

interface SidebarProps {
  activeSection: DashboardSectionId;
  onSectionSelect: (section: DashboardSectionId) => void;
}

const navItems: Array<{ id: DashboardSectionId; label: string; icon: LucideIcon }> = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'strategy', label: 'Strategy', icon: Sparkles },
  { id: 'trends', label: 'Trends', icon: BarChart3 },
  { id: 'videos', label: 'Videos', icon: Video },
];

export function Sidebar({ activeSection, onSectionSelect }: SidebarProps) {
  return (
    <>
      <aside className="hidden h-full w-16 shrink-0 flex-col items-center gap-8 border-r border-zinc-200 bg-white py-6 dark:border-zinc-800 dark:bg-zinc-950 md:flex">
        <Link
          href="/"
          aria-label="Go to landing page"
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-xl font-bold text-white shadow-lg shadow-emerald-500/20"
        >
          V
        </Link>
        <nav className="flex w-full flex-col items-center gap-6 text-zinc-400 dark:text-zinc-500">
          {navItems.map(({ id, label, icon: Icon }) => {
            const isActive = activeSection === id;

            return (
              <button
                key={id}
                type="button"
                aria-label={label}
                title={label}
                onClick={() => onSectionSelect(id)}
                className={`rounded-xl p-3 transition-colors ${
                  isActive
                    ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
                    : 'hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100'
                }`}
              >
                <Icon size={20} />
              </button>
            );
          })}
        </nav>
      </aside>

      <nav className="fixed bottom-4 left-4 right-4 z-30 flex items-center justify-between rounded-2xl border border-zinc-200 bg-white/95 px-3 py-2 shadow-xl shadow-zinc-300/20 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95 dark:shadow-black/20 md:hidden">
        <Link
          href="/"
          aria-label="Go to landing page"
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-lg font-bold text-white shadow-lg shadow-emerald-500/20"
        >
          V
        </Link>
        <div className="flex items-center gap-1">
          {navItems.map(({ id, label, icon: Icon }) => {
            const isActive = activeSection === id;

            return (
              <button
                key={id}
                type="button"
                aria-label={label}
                title={label}
                onClick={() => onSectionSelect(id)}
                className={`rounded-xl p-3 transition-colors ${
                  isActive
                    ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
                    : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100'
                }`}
              >
                <Icon size={18} />
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
