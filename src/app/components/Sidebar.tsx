'use client';

import React from 'react';
import { LayoutDashboard, BarChart3, Users, Settings, Video, type LucideIcon } from 'lucide-react';

export type DashboardSectionId = 'overview' | 'strategy' | 'trends' | 'videos';

interface SidebarProps {
  activeSection: DashboardSectionId;
  onSectionSelect: (section: DashboardSectionId) => void;
}

const navItems: Array<{ id: DashboardSectionId; label: string; icon: LucideIcon }> = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'strategy', label: 'Strategy', icon: Users },
  { id: 'trends', label: 'Trends', icon: BarChart3 },
  { id: 'videos', label: 'Videos', icon: Video },
];

export function Sidebar({ activeSection, onSectionSelect }: SidebarProps) {
  return (
    <aside className="w-16 flex-shrink-0 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col items-center py-6 gap-8 z-10 h-full">
      <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-emerald-500/20">
        V
      </div>
      <nav className="flex flex-col gap-6 w-full items-center text-zinc-400 dark:text-zinc-500">
        {navItems.map(({ id, label, icon: Icon }) => {
          const isActive = activeSection === id;

          return (
            <button
              key={id}
              type="button"
              aria-label={label}
              title={label}
              onClick={() => onSectionSelect(id)}
              className={`p-3 rounded-xl transition-colors ${
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
      <div className="mt-auto flex flex-col gap-6 items-center w-full text-zinc-400 dark:text-zinc-500">
        <button type="button" className="p-3 rounded-xl hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 transition-colors">
          <Settings size={20} />
        </button>
        <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100&h=100" alt="User" className="w-9 h-9 rounded-full object-cover border border-zinc-200 dark:border-zinc-800" />
      </div>
    </aside>
  );
}
