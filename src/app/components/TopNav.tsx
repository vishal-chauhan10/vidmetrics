'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Moon, Sun } from 'lucide-react';
import { useTheme } from '../themeContext';

interface TopNavProps {
  channelQuery: string;
}

export function TopNav({ channelQuery }: TopNavProps) {
  const { isDarkMode, toggleTheme } = useTheme();
  const router = useRouter();
  const [value, setValue] = useState(channelQuery);

  useEffect(() => {
    setValue(channelQuery);
  }, [channelQuery]);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    router.push(`/analyze?channel=${encodeURIComponent(trimmed)}`);
  }

  return (
    <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">VidMetrics</h1>
        <form onSubmit={onSubmit} className="hidden md:block">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-500 dark:text-zinc-400 w-80">
            <Search size={16} />
            <input
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder="Search channels, videos..."
              className="w-full bg-transparent text-zinc-700 outline-none placeholder:text-zinc-500 dark:text-zinc-200 dark:placeholder:text-zinc-500"
            />
          </div>
        </form>
      </div>

      <div className="flex items-center gap-6">
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-colors"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </header>
  );
}
