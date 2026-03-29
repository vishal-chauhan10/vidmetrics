'use client';

import React, { useMemo, useState } from 'react';
import { Download, Share2, Flame, X, ChevronRight, BarChart2, Tag, Sparkles } from 'lucide-react';
import type { AiVideoInsight, VideoMetrics } from '@/types/youtube';
import { exportToCsv, formatNumber, formatDuration } from '@/lib/metrics';

export function DataTable({
  title,
  videos,
  channelTitle,
  emptyStateMessage,
  aiVideoInsights,
}: {
  title: string;
  videos: VideoMetrics[];
  channelTitle: string;
  emptyStateMessage?: string;
  aiVideoInsights?: AiVideoInsight[];
}) {
  const [selectedVideo, setSelectedVideo] = useState<VideoMetrics | null>(null);

  const shareReport = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      await navigator.share({
        title: `${channelTitle} analytics`,
        text: `Analytics snapshot for ${channelTitle}`,
      }).catch(() => undefined);
    }
  };

  const selectedVideoTags = selectedVideo
    ? Array.from(
        new Set(
          selectedVideo.title
            .split(/\s+/)
            .map((word) => word.replace(/[^a-z0-9]/gi, ''))
            .filter((word) => word.length > 3)
        )
      ).slice(0, 5)
    : [];

  const selectedVideoInsight = useMemo(() => {
    if (!selectedVideo || !aiVideoInsights) {
      return null;
    }

    return aiVideoInsights.find((insight) => insight.videoId === selectedVideo.id) ?? null;
  }, [aiVideoInsights, selectedVideo]);

  const formatPublishedDate = (publishedAt: string) =>
    new Date(publishedAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden flex flex-col relative">
      <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-white dark:bg-zinc-900">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{title}</h2>
        <div className="flex gap-2">
          <button onClick={() => void shareReport()} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-md transition-colors border border-zinc-200 dark:border-zinc-700">
            <Share2 size={16} />
            Share
          </button>
          <button onClick={() => exportToCsv(videos, channelTitle)} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-md transition-colors border border-zinc-200 dark:border-zinc-700">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <th className="py-3 px-6 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Video</th>
              <th className="py-3 px-6 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Published</th>
              <th className="py-3 px-6 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-right">Views</th>
              <th
                title="Engagement Rate: percentage of viewers who liked or commented relative to total views"
                className="py-3 px-6 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-center"
              >
                Engagement Rate
              </th>
              <th
                title="Velocity: average views per day since the video was published"
                className="py-3 px-6 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-right"
              >
                Velocity
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {videos.length > 0 ? (
              videos.map((video) => (
                <tr 
                  key={video.id} 
                  onClick={() => setSelectedVideo(video)}
                  className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer group"
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-14 bg-zinc-200 dark:bg-zinc-800 rounded-md overflow-hidden relative flex-shrink-0">
                        <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
                        <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1 rounded font-medium">{formatDuration(video.duration)}</div>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{video.title}</h4>
                        {video.isTrending && (
                          <span
                            title="Above channel average velocity"
                            aria-label="Above channel average velocity"
                            className="inline-flex items-center mt-1 text-orange-600 dark:text-orange-500 bg-orange-100 dark:bg-orange-500/10 p-1 rounded"
                          >
                            <Flame size={10} />
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-zinc-500 dark:text-zinc-400 whitespace-nowrap">{formatPublishedDate(video.publishedAt)}</td>
                  <td className="py-4 px-6 text-sm text-zinc-900 dark:text-zinc-100 font-medium text-right">{formatNumber(video.viewCount)}</td>
                  <td className="py-4 px-6 text-sm text-zinc-900 dark:text-zinc-100 font-medium text-center">{video.engagementRate}%</td>
                  <td className="py-4 px-6 text-sm text-zinc-900 dark:text-zinc-100 font-medium text-right">{formatNumber(video.velocity)}/day</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-14 text-center">
                  <div className="mx-auto max-w-md rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/80 px-6 py-8 dark:border-zinc-800 dark:bg-zinc-950/40">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">No videos in this range</p>
                    <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                      {emptyStateMessage ?? 'This channel has no videos matching the current filters.'}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedVideo && (
        <>
          <div className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-30 transition-opacity" onClick={() => setSelectedVideo(null)} />
          <div className="fixed inset-y-0 right-0 w-full md:w-[480px] bg-white dark:bg-zinc-900 shadow-2xl z-40 transform transition-transform duration-300 ease-in-out border-l border-zinc-200 dark:border-zinc-800 flex flex-col">
            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/80 sticky top-0 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <BarChart2 size={20} className="text-emerald-500" />
                Deep Dive Analysis
              </h3>
              <button onClick={() => setSelectedVideo(null)} className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-8">
              <div>
                <img src={selectedVideo.thumbnailUrl} alt={selectedVideo.title} className="w-full h-56 object-cover rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm" />
                <h2 className="text-xl font-bold mt-4 text-zinc-900 dark:text-zinc-50">{selectedVideo.title}</h2>
                <div className="flex gap-4 mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                  <span>Published {formatPublishedDate(selectedVideo.publishedAt)}</span>
                  <span>•</span>
                  <span>{formatDuration(selectedVideo.duration)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800/50">
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Total Views</div>
                  <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{formatNumber(selectedVideo.viewCount)}</div>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800/50">
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Engagement Rate</div>
                  <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{selectedVideo.engagementRate}%</div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3 flex items-center gap-2">
                  <Sparkles size={16} className="text-emerald-500" /> AI Video Insight
                </h4>
                {selectedVideoInsight ? (
                  <div className="space-y-4">
                    <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 p-4 rounded-xl text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                      {selectedVideoInsight.whyItWorked}
                    </div>
                    <div className="bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">Risk to Watch</p>
                      <p className="mt-2">{selectedVideoInsight.risks}</p>
                    </div>
                    <div className="rounded-xl border border-emerald-100 bg-white p-4 dark:border-emerald-900/30 dark:bg-zinc-950/50">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">Next Title Ideas</p>
                      <div className="mt-3 space-y-2 text-sm text-zinc-700 dark:text-zinc-200">
                        {selectedVideoInsight.nextTitleIdeas.map((idea) => (
                          <div key={idea} className="rounded-lg bg-zinc-50 px-3 py-2 dark:bg-zinc-900/80">
                            {idea}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 p-4 rounded-xl text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-300">Packaging Tip</p>
                      <p className="mt-2">{selectedVideoInsight.packagingTip}</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 p-4 rounded-xl text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                    Performance score is {selectedVideo.performanceScore} with {selectedVideo.isTrending ? 'above-channel-average' : 'normal'} velocity. This is measured against this channel&apos;s own recent catalog, not YouTube-wide trending.
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3 flex items-center gap-2">
                  <Tag size={16} className="text-zinc-500" /> Extracted Tags
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedVideoTags.map((tag) => (
                    <span key={tag} className="px-2.5 py-1 text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-md border border-zinc-200 dark:border-zinc-700">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <a
                href={`https://www.youtube.com/watch?v=${selectedVideo.id}`}
                target="_blank"
                rel="noreferrer"
                className="mt-auto w-full py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold rounded-xl hover:bg-zinc-800 dark:hover:bg-white transition-colors flex items-center justify-center gap-2 shadow-md"
              >
                Open on YouTube <ChevronRight size={18} />
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
