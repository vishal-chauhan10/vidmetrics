'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';
import { Dashboard } from '../components/Dashboard';
import type { AnalysisResult, SortField, TimeRange, VideoMetrics } from '@/types/youtube';
import { isWithinInterval, startOfMonth, subDays } from 'date-fns';

export default function AnalyzePage() {
  return (
    <Suspense fallback={<LoadingState channel="this channel" />}>
      <AnalyzePageContent />
    </Suspense>
  );
}

function AnalyzePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const channelParam = searchParams.get('channel');
  const compareParam = searchParams.get('compare');

  const [data, setData] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [compareData, setCompareData] = useState<AnalysisResult | null>(null);
  const [compareLoading, setCompareLoading] = useState(false);
  const [compareError, setCompareError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [sortField, setSortField] = useState<SortField>('publishedAt');

  const fetchAnalysis = useCallback(async (channel: string) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/analyze?channel=${encodeURIComponent(channel)}`);
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'Failed to analyze channel');
      }

      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (channelParam) {
      fetchAnalysis(channelParam);
    }
  }, [channelParam, fetchAnalysis]);

  useEffect(() => {
    let isCancelled = false;

    async function fetchCompareAnalysis(compareChannel: string) {
      setCompareLoading(true);
      setCompareError(null);

      try {
        const res = await fetch(`/api/analyze?channel=${encodeURIComponent(compareChannel)}`);
        const json = await res.json();

        if (!res.ok) {
          throw new Error(json.error || 'Failed to analyze your channel');
        }

        if (!isCancelled) {
          setCompareData(json);
        }
      } catch (err) {
        if (!isCancelled) {
          setCompareData(null);
          setCompareError(err instanceof Error ? err.message : 'An unexpected error occurred');
        }
      } finally {
        if (!isCancelled) {
          setCompareLoading(false);
        }
      }
    }

    if (!compareParam) {
      setCompareData(null);
      setCompareError(null);
      setCompareLoading(false);
      return () => {
        isCancelled = true;
      };
    }

    fetchCompareAnalysis(compareParam);

    return () => {
      isCancelled = true;
    };
  }, [compareParam]);

  function handleCompareChannelChange(compareChannel: string) {
    if (!channelParam) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    const trimmed = compareChannel.trim();

    if (trimmed) {
      params.set('compare', trimmed);
    } else {
      params.delete('compare');
    }

    router.push(`/analyze?${params.toString()}`);
  }

  const filteredVideos = useMemo<VideoMetrics[]>(() => {
    if (!data) return [];

    let videos = [...data.videos];
    const now = new Date();

    if (timeRange === '7d') {
      videos = videos.filter((video) =>
        isWithinInterval(new Date(video.publishedAt), { start: subDays(now, 7), end: now })
      );
    } else if (timeRange === '30d') {
      videos = videos.filter((video) =>
        isWithinInterval(new Date(video.publishedAt), { start: subDays(now, 30), end: now })
      );
    } else if (timeRange === 'month') {
      videos = videos.filter((video) =>
        isWithinInterval(new Date(video.publishedAt), { start: startOfMonth(now), end: now })
      );
    }

    videos.sort((a, b) => {
      if (sortField === 'viewCount') {
        return b.viewCount - a.viewCount;
      }

      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });

    return videos;
  }, [data, sortField, timeRange]);

  if (!channelParam) {
    router.push('/');
    return null;
  }

  if (loading && !data) {
    return <LoadingState channel={channelParam} />;
  }

  if (error) {
    return <ErrorState message={error} onBack={() => router.push('/')} />;
  }

  if (!data) return null;

  return (
    <Dashboard
      analysis={data}
      compareAnalysis={compareData}
      compareChannelQuery={compareParam ?? ''}
      compareLoading={compareLoading}
      compareError={compareError}
      onCompareChannelChange={handleCompareChannelChange}
      videos={filteredVideos}
      channelQuery={channelParam}
      timeRange={timeRange}
      onTimeRangeChange={setTimeRange}
      sortField={sortField}
      onSortFieldChange={setSortField}
    />
  );
}

function LoadingState({ channel }: { channel: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-xl rounded-3xl border border-zinc-800 bg-zinc-950/80 p-8 text-center shadow-2xl shadow-black/30">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-zinc-800 border-t-emerald-400" />
        <h2 className="mt-5 text-xl font-semibold text-zinc-50">Analyzing channel</h2>
        <p className="mt-2 text-sm text-zinc-400">Pulling live YouTube analytics for {channel}.</p>
      </div>
    </div>
  );
}

function ErrorState({ message, onBack }: { message: string; onBack: () => void }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(239,68,68,0.10),transparent_32%),linear-gradient(180deg,rgba(250,250,250,1),rgba(244,244,245,1))] px-6 py-16 dark:bg-[radial-gradient(circle_at_top,rgba(239,68,68,0.12),transparent_32%),linear-gradient(180deg,rgba(24,24,27,0.98),rgba(9,9,11,1))]">
      <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-5xl items-center justify-center">
        <div className="grid w-full gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="flex flex-col justify-center">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-red-600 dark:text-red-400">
              <AlertTriangle size={14} />
              Analysis Error
            </div>
            <h1 className="mt-6 max-w-2xl text-4xl font-bold tracking-tight text-zinc-950 md:text-5xl dark:text-zinc-50">
              The channel input could not be analyzed.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-zinc-600 dark:text-zinc-400">
              {message}
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <ErrorPill label="Use an @handle" />
              <ErrorPill label="Paste a full channel URL" />
              <ErrorPill label="Avoid video URLs" />
            </div>
          </section>

          <section className="rounded-3xl border border-zinc-200 bg-white/85 p-6 shadow-2xl shadow-zinc-300/30 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/80 dark:shadow-black/30">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Try Again</p>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  Common valid formats are listed below.
                </p>
              </div>
              <div className="h-3 w-3 rounded-full bg-red-400 shadow-[0_0_18px_rgba(248,113,113,0.5)]" />
            </div>

            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-600 dark:text-red-400">
                Why It Failed
              </p>
              <p className="mt-3 text-sm leading-6 text-zinc-700 dark:text-zinc-300">{message}</p>
            </div>

            <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Accepted Inputs</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-700 dark:text-zinc-300">
                <span className="rounded-full border border-zinc-300 px-3 py-1 dark:border-zinc-700">@handle</span>
                <span className="rounded-full border border-zinc-300 px-3 py-1 dark:border-zinc-700">youtube.com/@handle</span>
                <span className="rounded-full border border-zinc-300 px-3 py-1 dark:border-zinc-700">youtube.com/channel/UC...</span>
                <span className="rounded-full border border-zinc-300 px-3 py-1 dark:border-zinc-700">youtube.com/c/custom</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onBack}
              className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-2xl bg-zinc-950 px-5 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white"
            >
              Back to Search
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}

function ErrorPill({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white/80 px-4 py-3 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-300">
      <span className="h-2 w-2 rounded-full bg-red-500" />
      {label}
    </div>
  );
}