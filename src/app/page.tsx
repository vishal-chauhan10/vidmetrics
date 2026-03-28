'use client';

import { Search, BarChart3, TrendingUp, Zap, Moon, Sun } from 'lucide-react';
import { useTheme } from './themeContext';

export default function HomePage() {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div
      className={`min-h-screen px-6 py-16 ${
        isDarkMode
          ? 'bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.12),transparent_35%),linear-gradient(180deg,rgba(24,24,27,0.98),rgba(9,9,11,1))]'
          : 'bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.16),transparent_30%),linear-gradient(180deg,rgba(250,250,250,1),rgba(244,244,245,1))]'
      }`}
    >
      <div className="mx-auto flex max-w-6xl justify-end">
        <button
          type="button"
          onClick={toggleTheme}
          className={`inline-flex h-11 w-11 items-center justify-center rounded-full border transition-colors ${
            isDarkMode
              ? 'border-zinc-800 bg-zinc-950/70 text-zinc-300 hover:bg-zinc-900'
              : 'border-zinc-200 bg-white/80 text-zinc-600 hover:bg-zinc-100'
          }`}
          aria-label={isDarkMode ? 'Switch to light theme' : 'Switch to dark theme'}
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
      <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="flex flex-col justify-center">
            <div className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
              isDarkMode
                ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700'
            }`}>
              <BarChart3 size={14} />
              YouTube Analytics
            </div>
            <h1 className={`mt-6 max-w-2xl text-4xl font-bold tracking-tight md:text-5xl ${isDarkMode ? 'text-zinc-50' : 'text-zinc-950'}`}>
              Analyze any YouTube channel inside the VidMetrics3 workspace.
            </h1>
            <p className={`mt-4 max-w-xl text-base leading-7 ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
              Paste a channel URL, custom URL, or handle to pull live channel stats, video performance,
              engagement, velocity, and outlier detection using the working YouTube API flow.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <FeaturePill icon={<TrendingUp size={16} />} label="Real channel metrics" isDarkMode={isDarkMode} />
              <FeaturePill icon={<Zap size={16} />} label="Velocity and score" isDarkMode={isDarkMode} />
              <FeaturePill icon={<Search size={16} />} label="Handle or URL input" isDarkMode={isDarkMode} />
            </div>
          </section>

          <section className={`rounded-3xl border p-6 shadow-2xl backdrop-blur-xl ${
            isDarkMode
              ? 'border-zinc-800 bg-zinc-950/80 shadow-black/30'
              : 'border-zinc-200 bg-white/85 shadow-zinc-300/30'
          }`}>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className={`text-sm font-semibold ${isDarkMode ? 'text-zinc-100' : 'text-zinc-900'}`}>Start Analysis</p>
                <p className={`mt-1 text-sm ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>Use the live analyzer from the working app, now in this design.</p>
              </div>
              <div className="h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.5)]" />
            </div>

            <form action="/analyze" method="get" className="space-y-4">
              <label className={`block text-xs font-semibold uppercase tracking-[0.18em] ${isDarkMode ? 'text-zinc-500' : 'text-zinc-500'}`}>
                Channel URL or Handle
              </label>
              <div className="relative">
                <Search className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-zinc-500' : 'text-zinc-400'}`} size={18} />
                <input
                  type="text"
                  name="channel"
                  placeholder="https://youtube.com/@mkbhd or @mkbhd"
                  className={`h-14 w-full rounded-2xl border pl-12 pr-4 text-sm outline-none transition focus:border-emerald-500/40 focus:ring-2 focus:ring-emerald-500/20 ${
                    isDarkMode
                      ? 'border-zinc-800 bg-zinc-900 text-zinc-100'
                      : 'border-zinc-200 bg-zinc-50 text-zinc-900'
                  }`}
                />
              </div>
              <button
                type="submit"
                className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-emerald-500 px-5 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-400"
              >
                Run Channel Analysis
              </button>
            </form>

            <div className={`mt-6 rounded-2xl border p-4 ${
              isDarkMode ? 'border-zinc-800 bg-zinc-900/60' : 'border-zinc-200 bg-zinc-50/80'
            }`}>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Supported Inputs</p>
              <div className={`mt-3 flex flex-wrap gap-2 text-xs ${isDarkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>
                <span className={`rounded-full border px-3 py-1 ${isDarkMode ? 'border-zinc-700' : 'border-zinc-300'}`}>@handle</span>
                <span className={`rounded-full border px-3 py-1 ${isDarkMode ? 'border-zinc-700' : 'border-zinc-300'}`}>youtube.com/@handle</span>
                <span className={`rounded-full border px-3 py-1 ${isDarkMode ? 'border-zinc-700' : 'border-zinc-300'}`}>youtube.com/channel/UC...</span>
                <span className={`rounded-full border px-3 py-1 ${isDarkMode ? 'border-zinc-700' : 'border-zinc-300'}`}>youtube.com/c/custom</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function FeaturePill({ icon, label, isDarkMode }: { icon: React.ReactNode; label: string; isDarkMode: boolean }) {
  return (
    <div className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm ${
      isDarkMode
        ? 'border-zinc-800 bg-zinc-900/70 text-zinc-300'
        : 'border-zinc-200 bg-white/80 text-zinc-700'
    }`}>
      <span className={isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}>{icon}</span>
      {label}
    </div>
  );
}