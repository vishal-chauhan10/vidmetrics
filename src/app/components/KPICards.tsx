import React from 'react';
import { ArrowUpRight, ArrowDownRight, TrendingUp, Clock, Users, Play } from 'lucide-react';
import type { AnalysisResult, VideoMetrics } from '@/types/youtube';
import { formatNumber } from '@/lib/metrics';

export function KPICards({ analysis, videos }: { analysis: AnalysisResult; videos: VideoMetrics[] }) {
  const averageVelocity = videos.length > 0
    ? Math.round(videos.reduce((sum, video) => sum + video.velocity, 0) / videos.length)
    : 0;
  const trendingVideos = videos.filter((video) => video.isTrending).length;
  const averageDurationMinutes = videos.length > 0
    ? Math.round(
        videos.reduce((sum, video) => {
          const match = video.duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
          const hours = Number(match?.[1] || 0);
          const minutes = Number(match?.[2] || 0);
          return sum + hours * 60 + minutes;
        }, 0) / videos.length
      )
    : 0;

  const cards = [
    {
      title: 'Total Views',
      value: formatNumber(analysis.totalViews),
      trend: `${videos.length} videos`,
      isPositive: true,
      icon: <Play size={18} />,
    },
    {
      title: 'Avg. Duration',
      value: `${averageDurationMinutes} min`,
      trend: analysis.periodLabel,
      isPositive: true,
      icon: <Clock size={18} />,
    },
    {
      title: 'Avg. Velocity',
      value: `${formatNumber(averageVelocity)}/day`,
      trend: `${trendingVideos} above avg`,
      isPositive: trendingVideos > 0,
      icon: <TrendingUp size={18} />,
    },
    {
      title: 'Subscribers',
      value: formatNumber(analysis.channel.subscriberCount),
      trend: `${analysis.averageEngagement}% engage`,
      isPositive: true,
      icon: <Users size={18} />,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <div key={`kpi-${i}`} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-start mb-4 text-zinc-500 dark:text-zinc-400">
            <span className="text-sm font-medium">{card.title}</span>
            <div className="p-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg">{card.icon}</div>
          </div>
          <div className="flex items-baseline gap-3">
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{card.value}</h3>
            <span className={`flex items-center text-xs font-semibold px-2 py-1 rounded-full ${card.isPositive ? 'text-emerald-700 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-400/10' : 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-400/10'}`}>
              {card.isPositive ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
              {card.trend}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
