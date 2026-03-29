'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Moon, Sun } from 'lucide-react';
import { useTheme } from '../themeContext';
import { getChannelInputError } from '@/lib/youtube';

interface TopNavProps {
  channelQuery: string;
}

export function TopNav({ channelQuery }: TopNavProps) {
  const { isDarkMode, toggleTheme } = useTheme();
  const router = useRouter();
  const [value, setValue] = useState(channelQuery);
  const [showValidation, setShowValidation] = useState(false);

  const channelError = useMemo(() => {
    if (!showValidation && value.trim().length === 0) {
      return null;
    }

    return getChannelInputError(value);
  }, [showValidation, value]);

  useEffect(() => {
    setValue(channelQuery);
    setShowValidation(false);
  }, [channelQuery]);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = value.trim();
    setShowValidation(true);
    if (getChannelInputError(trimmed)) return;
    router.push(`/analyze?channel=${encodeURIComponent(trimmed)}`);
  }

  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/50 px-4 py-3 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/50 md:px-6 md:py-3">
      <div className="flex items-center gap-3">
        <Link href="/" className="shrink-0 text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-xl">
          VidMetrics
        </Link>
        <form onSubmit={onSubmit} className="relative min-w-0 flex-1">
          <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-100 px-3 py-1.5 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 md:w-80">
            <Search size={16} />
            <input
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder="Search channels, videos..."
              className="w-full bg-transparent text-zinc-700 outline-none placeholder:text-zinc-500 dark:text-zinc-200 dark:placeholder:text-zinc-500"
            />
          </div>
          {channelError && (
            <p className="absolute top-full mt-2 text-xs text-red-600 dark:text-red-400">{channelError}</p>
          )}
        </form>
        <button 
          onClick={toggleTheme}
          className="shrink-0 rounded-full p-2 text-zinc-500 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </header>
  );
}
