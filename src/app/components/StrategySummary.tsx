import React from 'react';
import { Sparkles } from 'lucide-react';
import type { AiStrategySummary, VideoMetrics } from '@/types/youtube';

export function StrategySummary({ videos, summary }: { videos: VideoMetrics[]; summary?: AiStrategySummary }) {
  if (videos.length === 0) {
    return null;
  }

  if (summary) {
    return (
      <div className="bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/20 dark:to-zinc-900 border border-emerald-100 dark:border-emerald-900/50 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={20} className="text-emerald-500" />
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">AI Strategy Summary</h2>
        </div>
        <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-4xl">
          <p>{summary.overview}</p>
          <p>{summary.momentum}</p>
          <p>{summary.contentGap}</p>
          <div className="pt-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">Next Actions</p>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              {summary.nextActions.map((action) => (
                <div key={action} className="rounded-xl border border-emerald-100 bg-white/80 px-4 py-3 dark:border-emerald-900/40 dark:bg-zinc-950/40">
                  <p className="text-sm text-zinc-700 dark:text-zinc-200">{action}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const topVideo = [...videos].sort((left, right) => right.performanceScore - left.performanceScore)[0];
  const averageViews = videos.reduce((sum, video) => sum + video.viewCount, 0) / videos.length;
  const averageEngagement = videos.reduce((sum, video) => sum + video.engagementRate, 0) / videos.length;
  const outlierFactor = averageViews > 0 ? (topVideo.viewCount / averageViews).toFixed(1) : '0.0';
  const trendingCount = videos.filter((video) => video.isTrending).length;

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/20 dark:to-zinc-900 border border-emerald-100 dark:border-emerald-900/50 rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={20} className="text-emerald-500" />
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">AI Strategy Summary</h2>
      </div>
      <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-4xl">
        <p>
          <strong className="text-emerald-600 dark:text-emerald-400">{topVideo.title}</strong> is the current outlier at {outlierFactor}x the channel average. That topic and thumbnail style are the clearest short-term follow-up candidates.
        </p>
        <p>
          Average engagement is <strong className="text-emerald-600 dark:text-emerald-400">{averageEngagement.toFixed(2)}%</strong>. {averageEngagement >= 5 ? 'Audience response is healthy; keep the current content packaging.' : 'Audience response is softer; tighten hooks and clearer titles would help.'}
        </p>
        <p>
          {trendingCount > 0
            ? `${trendingCount} videos are showing above-average velocity. Publish adjacent follow-ups while momentum is still compounding.`
            : 'No current videos are outperforming the channel average on velocity. The next lever is topic selection rather than cadence alone.'}
        </p>
      </div>
    </div>
  );
}
