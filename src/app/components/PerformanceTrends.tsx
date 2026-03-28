import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { VideoMetrics } from '@/types/youtube';
import { formatNumber } from '@/lib/metrics';

export function PerformanceTrends({ videos }: { videos: VideoMetrics[] }) {
  const data = [...videos]
    .sort((left, right) => new Date(left.publishedAt).getTime() - new Date(right.publishedAt).getTime())
    .map((video) => ({
      id: video.id,
      name: new Date(video.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      views: video.viewCount,
    }));

  if (data.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-6">Performance Trends</h2>
      <div className="w-full">
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <defs key="defs">
              <linearGradient key="gradient" id="colorViews" x1="0" y1="0" x2="0" y2="1">
                <stop key="stop1" offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop key="stop2" offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid key="grid" strokeDasharray="3 3" vertical={false} stroke="#3f3f46" strokeOpacity={0.2} />
            <XAxis key="xaxis" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} dy={10} />
            <YAxis key="yaxis" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} tickFormatter={(value) => formatNumber(value)} />
            <Tooltip 
              key="tooltip"
              contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#f4f4f5' }}
              itemStyle={{ color: '#10b981' }}
              formatter={(value) => [formatNumber(Number(value)), 'Views']}
            />
            <Area key="area" type="monotone" dataKey="views" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorViews)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
