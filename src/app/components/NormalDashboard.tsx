import React, { useEffect, useMemo, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, LoaderCircle, Plus, X } from 'lucide-react';
import { KPICards } from './KPICards';
import { StrategySummary } from './StrategySummary';
import { PerformanceTrends } from './PerformanceTrends';
import { DataTable } from './DataTable';
import { formatNumber } from '@/lib/metrics';
import type { AiCompareInsight, AnalysisResult, SortField, TimeRange, VideoMetrics } from '@/types/youtube';

interface NormalDashboardProps {
  analysis: AnalysisResult;
  compareAnalysis: AnalysisResult | null;
  compareChannelQuery: string;
  compareLoading: boolean;
  compareError: string | null;
  compareInsight: AiCompareInsight | null;
  compareInsightLoading: boolean;
  compareInsightError: string | null;
  onCompareChannelChange: (value: string) => void;
  videos: VideoMetrics[];
  timeRange: TimeRange;
  onTimeRangeChange: (value: TimeRange) => void;
  sortField: SortField;
  onSortFieldChange: (value: SortField) => void;
}

export function NormalDashboard({
  analysis,
  compareAnalysis,
  compareChannelQuery,
  compareLoading,
  compareError,
  compareInsight,
  compareInsightLoading,
  compareInsightError,
  onCompareChannelChange,
  videos,
  timeRange,
  onTimeRangeChange,
  sortField,
  onSortFieldChange,
}: NormalDashboardProps) {
  const [isCompareOpen, setIsCompareOpen] = useState(Boolean(compareChannelQuery));
  const [compareValue, setCompareValue] = useState(compareChannelQuery);
  const videoSectionTitle = timeRange === 'all' ? 'All Videos' : 'Recent Videos';
  const emptyVideosMessage = getEmptyVideosMessage(timeRange, analysis.channel.title);
  const headerBackgroundImage = analysis.channel.bannerUrl || analysis.channel.thumbnailUrl;
  const hasBannerImage = Boolean(analysis.channel.bannerUrl);
  const overviewStats = useMemo(() => {
    const channelAgeYears = getChannelAgeYears(analysis.channel.publishedAt);
    const trendingVideos = videos.filter((video) => video.isTrending).length;

    return [
      {
        label: 'Subscribers',
        value: formatNumber(analysis.channel.subscriberCount),
        subtext: 'Current audience size',
      },
      {
        label: 'Lifetime Views',
        value: formatNumber(analysis.channel.viewCount),
        subtext: 'Channel-wide total',
      },
      {
        label: 'Videos',
        value: formatNumber(analysis.channel.videoCount),
        subtext: 'Published library',
      },
      {
        label: 'Created',
        value: formatPublishedDate(analysis.channel.publishedAt),
        subtext: `${channelAgeYears} in market`,
      },
      {
        label: 'Avg. Views / Video',
        value: formatNumber(analysis.averageViews),
        subtext: 'Content efficiency',
      },
      {
        label: 'Avg. Engagement',
        value: `${analysis.averageEngagement.toFixed(2)}%`,
        subtext: `${trendingVideos} above-channel-average videos`,
      },
    ];
  }, [analysis, videos]);

  useEffect(() => {
    setCompareValue(compareChannelQuery);
    if (compareChannelQuery) {
      setIsCompareOpen(true);
    }
  }, [compareChannelQuery]);

  const comparisonStats = useMemo(() => {
    if (!compareAnalysis) {
      return [];
    }

    const compareAverageViews = compareAnalysis.videos.length > 0
      ? Math.round(compareAnalysis.totalViews / compareAnalysis.videos.length)
      : 0;
    const thisAverageViews = videos.length > 0 ? Math.round(analysis.totalViews / videos.length) : 0;

    return [
      {
        label: 'Subscribers',
        primaryValue: formatNumber(compareAnalysis.channel.subscriberCount),
        ...getDeltaStat(compareAnalysis.channel.subscriberCount, analysis.channel.subscriberCount),
      },
      {
        label: 'Avg. Views',
        primaryValue: formatNumber(compareAverageViews),
        ...getDeltaStat(compareAverageViews, thisAverageViews),
      },
      {
        label: 'Engagement',
        primaryValue: `${compareAnalysis.averageEngagement.toFixed(2)}%`,
        ...getSignedPercentDeltaStat(compareAnalysis.averageEngagement, analysis.averageEngagement),
      },
    ];
  }, [analysis.averageEngagement, analysis.channel.subscriberCount, analysis.totalViews, compareAnalysis, videos.length]);

  function handleCompareSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onCompareChannelChange(compareValue);
  }

  function handleCompareClear() {
    setCompareValue('');
    onCompareChannelChange('');
    setIsCompareOpen(false);
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <section id="overview" data-dashboard-section="overview" className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{analysis.channel.title}</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              {analysis.periodLabel} performance snapshot with AI-driven insights.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-start gap-2 md:justify-end">
            <select
              value={timeRange}
              onChange={(event) => onTimeRangeChange(event.target.value as TimeRange)}
              className="h-10 rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-700 outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
            >
              <option value="month">This Month</option>
              <option value="7d">Last 7 Days</option>
              <option value="all">All Videos</option>
            </select>
            <select
              value={sortField}
              onChange={(event) => onSortFieldChange(event.target.value as SortField)}
              className="h-10 rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-700 outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
            >
              <option value="publishedAt">Recently Uploaded</option>
              <option value="viewCount">Most Viewed</option>
            </select>
            <button
              type="button"
              onClick={() => setIsCompareOpen((current) => !current)}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 text-sm font-medium text-emerald-600 transition hover:bg-emerald-500/15 dark:text-emerald-400"
            >
              <Plus size={15} />
              Add Your Channel
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white/90 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/90">
          <div className="relative border-b border-zinc-200 dark:border-zinc-800">
            {headerBackgroundImage ? (
              <div
                className={`absolute inset-0 bg-cover bg-center ${hasBannerImage ? '' : 'scale-110 blur-2xl opacity-35'}`}
                style={{ backgroundImage: `url(${headerBackgroundImage})` }}
                aria-hidden="true"
              />
            ) : null}
            <div
              className={`absolute inset-0 ${
                hasBannerImage
                  ? 'bg-gradient-to-r from-zinc-950/92 via-zinc-950/82 to-zinc-950/68'
                  : 'bg-gradient-to-r from-zinc-950/88 via-zinc-950/72 to-zinc-950/78'
              }`}
            />
            {!hasBannerImage ? (
              <div
                className="absolute inset-0 bg-[radial-gradient(circle_at_left,rgba(16,185,129,0.24),transparent_28%),radial-gradient(circle_at_right,rgba(244,244,245,0.08),transparent_18%)]"
                aria-hidden="true"
              />
            ) : null}

            <div className="relative z-10 p-6">
              <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
              <div className="flex items-start gap-4">
                <img
                  src={analysis.channel.thumbnailUrl}
                  alt={analysis.channel.title}
                  className="h-16 w-16 rounded-2xl border border-white/15 object-cover shadow-sm"
                />
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-300">
                    Channel Intelligence
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">{analysis.channel.title}</h3>
                    <p className="mt-1 text-sm text-zinc-300">
                      {getChannelIdentity(analysis.channel.customUrl, analysis.channel.title)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {overviewStats.map((stat) => (
                  <div key={stat.label} className="min-w-[160px] rounded-2xl border border-white/10 bg-zinc-950/60 px-4 py-3 backdrop-blur-sm">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400">{stat.label}</p>
                    <p className="mt-2 text-lg font-semibold text-white">{stat.value}</p>
                    <p className="mt-1 text-xs text-zinc-400">{stat.subtext}</p>
                  </div>
                ))}
              </div>
            </div>
            </div>
          </div>

          <div className="grid gap-px bg-zinc-200 dark:bg-zinc-800 sm:grid-cols-3">
            <div className="bg-white px-6 py-4 dark:bg-zinc-900">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">Positioning</p>
              <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
                {analysis.channel.title} is operating as a {getScaleDescriptor(analysis.channel.subscriberCount)} creator with a deep catalog and established audience moat.
              </p>
            </div>
            <div className="bg-white px-6 py-4 dark:bg-zinc-900">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">Momentum</p>
              <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
                {analysis.averageEngagement >= 5
                  ? 'Audience response is healthy enough to support aggressive follow-up sequencing.'
                  : 'The channel has scale, but packaging and topic precision remain the main unlocks.'}
              </p>
            </div>
            <div className="bg-white px-6 py-4 dark:bg-zinc-900">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">Benchmark Lens</p>
              <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
                This section distills the channel into a compact operator view so the core performance signals are easy to scan.
              </p>
            </div>
          </div>
        </div>

        {(isCompareOpen || compareAnalysis || compareLoading || compareError) && (
          <div className="rounded-2xl border border-sky-200 bg-sky-50/45 p-4 shadow-sm dark:border-sky-900/40 dark:bg-sky-950/12">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-sky-950 dark:text-sky-100">Compare With Your Channel</p>
                <p className="text-sm text-sky-800/80 dark:text-sky-200/70">
                  Add your own channel to benchmark against {analysis.channel.title} without leaving this view.
                </p>
              </div>
              {compareAnalysis && !isCompareOpen && (
                <button
                  type="button"
                  onClick={handleCompareClear}
                  className="inline-flex items-center gap-2 self-start rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  <X size={15} />
                  Remove
                </button>
              )}
            </div>

            {isCompareOpen && (
              <form onSubmit={handleCompareSubmit} className="mt-4 flex flex-col gap-3 md:flex-row md:items-center">
                <input
                  value={compareValue}
                  onChange={(event) => setCompareValue(event.target.value)}
                  placeholder="https://youtube.com/@yourchannel or @yourchannel"
                  className="h-11 flex-1 rounded-xl border border-sky-200 bg-white px-4 text-sm text-zinc-700 outline-none transition focus:border-sky-500/40 focus:ring-2 focus:ring-sky-500/20 dark:border-sky-900/40 dark:bg-zinc-950 dark:text-zinc-200"
                />
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="inline-flex h-11 items-center justify-center rounded-xl bg-sky-500 px-4 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-70"
                    disabled={compareLoading || compareValue.trim().length === 0}
                  >
                    {compareLoading ? 'Analyzing...' : 'Compare'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCompareValue(compareChannelQuery);
                      setIsCompareOpen(false);
                    }}
                    className="inline-flex h-11 items-center justify-center rounded-xl border border-zinc-200 px-4 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {compareLoading && (
              <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-sky-200 bg-white/80 px-3 py-2 text-sm text-sky-800 dark:border-sky-900/40 dark:bg-zinc-950/80 dark:text-sky-200">
                <LoaderCircle size={16} className="animate-spin" />
                Pulling analytics for your channel.
              </div>
            )}

            {compareError && (
              <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-600 dark:text-red-400">
                {compareError}
              </div>
            )}

            {compareAnalysis && !compareLoading && (
              <div className="mt-4 rounded-2xl border border-sky-500/15 bg-gradient-to-r from-sky-500/10 to-transparent p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700 dark:text-sky-300">
                      Your Channel Loaded
                    </div>
                    <h3 className="mt-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">{compareAnalysis.channel.title}</h3>
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                      Comparison is ready. KPI and strategy overlays can now build on this baseline.
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {comparisonStats.map((stat) => (
                      <div key={stat.label} className="rounded-xl border border-zinc-200 bg-white/80 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950/70">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">{stat.label}</p>
                        <p className="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">{stat.primaryValue}</p>
                        <p className={`mt-1 inline-flex items-center gap-1 text-xs font-medium ${stat.deltaToneClass}`}>
                          {stat.isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                          {stat.deltaText}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {compareInsightLoading && compareAnalysis ? (
              <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-sky-200 bg-white/80 px-3 py-2 text-sm text-sky-800 dark:border-sky-900/40 dark:bg-zinc-950/80 dark:text-sky-200">
                <LoaderCircle size={16} className="animate-spin" />
                Generating AI compare insight.
              </div>
            ) : null}

            {compareInsightError && compareAnalysis ? (
              <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
                {compareInsightError}
              </div>
            ) : null}

            {compareInsight && compareAnalysis ? (
              <div className="mt-4 rounded-2xl border border-sky-200 bg-white/70 p-4 dark:border-sky-900/40 dark:bg-zinc-950/40">
                <div className="flex flex-col gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700 dark:text-sky-300">AI Compare Insight</p>
                    <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                      Structured from the metrics and top-performing videos across both channels.
                    </p>
                  </div>
                  <div className="grid gap-3 lg:grid-cols-3">
                    <CompareInsightList title="Strengths" items={compareInsight.strengths} />
                    <CompareInsightList title="Weaknesses" items={compareInsight.weaknesses} />
                    <CompareInsightList title="Opportunities" items={compareInsight.opportunities} />
                  </div>
                  <div className="rounded-xl border border-sky-100 bg-sky-50/70 px-4 py-3 dark:border-sky-900/30 dark:bg-sky-950/20">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700 dark:text-sky-300">Next Move</p>
                    <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-200">{compareInsight.nextMove}</p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}

        <KPICards analysis={analysis} videos={videos} />
      </section>

      <section id="strategy" data-dashboard-section="strategy">
        <StrategySummary videos={videos} summary={analysis.aiSummary} />
      </section>

      <section id="trends" data-dashboard-section="trends">
        <PerformanceTrends videos={videos} />
      </section>

      <section id="videos" data-dashboard-section="videos">
        <DataTable
          title={videoSectionTitle}
          videos={videos}
          channelTitle={analysis.channel.title}
          emptyStateMessage={emptyVideosMessage}
          aiVideoInsights={analysis.aiVideoInsights}
        />
      </section>
    </div>
  );
}

function CompareInsightList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white/80 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950/70">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">{title}</p>
      <div className="mt-3 space-y-2 text-sm text-zinc-700 dark:text-zinc-200">
        {items.map((item) => (
          <div key={`${title}-${item}`} className="rounded-lg bg-zinc-50 px-3 py-2 dark:bg-zinc-900/80">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function getEmptyVideosMessage(timeRange: TimeRange, channelTitle: string) {
  if (timeRange === 'all') {
    return `${channelTitle} does not have any public uploads available right now.`;
  }

  return `No public uploads were found for ${channelTitle} in the selected window. Switch to All Videos to inspect the older catalog.`;
}

function formatPublishedDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

function getChannelAgeYears(value: string) {
  const publishedAt = new Date(value);
  const now = new Date();
  const diffYears = Math.max(now.getFullYear() - publishedAt.getFullYear(), 0);

  return diffYears === 1 ? '1 year' : `${diffYears} years`;
}

function getChannelIdentity(customUrl: string, title: string) {
  if (customUrl) {
    return customUrl.startsWith('@') ? customUrl : `@${customUrl}`;
  }

  return title;
}

function getScaleDescriptor(subscriberCount: number) {
  if (subscriberCount >= 10_000_000) {
    return 'category-defining';
  }

  if (subscriberCount >= 1_000_000) {
    return 'large-scale';
  }

  if (subscriberCount >= 100_000) {
    return 'mid-market';
  }

  return 'emerging';
}

function getDeltaStat(value: number, benchmark: number) {
  if (benchmark === 0) {
    return {
      deltaText: 'No benchmark yet',
      isPositive: true,
      deltaToneClass: 'text-zinc-500 dark:text-zinc-400',
    };
  }

  const delta = ((value - benchmark) / benchmark) * 100;
  const direction = delta >= 0 ? 'ahead' : 'behind';
  const isPositive = delta >= 0;

  return {
    deltaText: `${Math.abs(delta).toFixed(1)}% ${direction}`,
    isPositive,
    deltaToneClass: isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400',
  };
}

function getSignedPercentDeltaStat(value: number, benchmark: number) {
  if (benchmark === 0) {
    return {
      deltaText: 'No benchmark yet',
      isPositive: true,
      deltaToneClass: 'text-zinc-500 dark:text-zinc-400',
    };
  }

  const delta = value - benchmark;
  const prefix = delta >= 0 ? '+' : '-';
  const isPositive = delta >= 0;

  return {
    deltaText: `${prefix}${Math.abs(delta).toFixed(2)} pts vs competitor`,
    isPositive,
    deltaToneClass: isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400',
  };
}
