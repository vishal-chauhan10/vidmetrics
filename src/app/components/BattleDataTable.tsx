import React from 'react';
import { yourVideos, compVideos } from '../data/mockData';

export function BattleDataTable({ type }: { type: 'yours' | 'competitor' }) {
  const isYours = type === 'yours';
  const videos = isYours ? yourVideos : compVideos;
  const accentText = isYours ? 'text-blue-600 dark:text-blue-400' : 'text-amber-600 dark:text-amber-400';
  const accentBgHover = isYours ? 'hover:bg-blue-50 dark:hover:bg-blue-900/10' : 'hover:bg-amber-50 dark:hover:bg-amber-900/10';

  return (
    <div className={`bg-white dark:bg-zinc-900 border ${isYours ? 'border-blue-100 dark:border-blue-900/30' : 'border-amber-100 dark:border-amber-900/30'} rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col`}>
      <div className={`px-4 py-3 border-b ${isYours ? 'border-blue-100 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-900/10' : 'border-amber-100 dark:border-amber-900/30 bg-amber-50/50 dark:bg-amber-900/10'} flex justify-between items-center`}>
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Last 5 Videos Comparison</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[300px]">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800">
              <th className="py-2 px-4 text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Video</th>
              <th className="py-2 px-4 text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-right">Views</th>
              <th className="py-2 px-4 text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-right">CTR</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {videos.slice(0, 5).map((video) => (
              <tr key={video.id} className={`${accentBgHover} transition-colors group`}>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-10 bg-zinc-200 dark:bg-zinc-800 rounded flex-shrink-0 overflow-hidden relative">
                       <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                       <div className="absolute bottom-0.5 right-0.5 bg-black/80 text-white text-[8px] px-1 rounded font-medium">{video.duration}</div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className={`text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate w-32 xl:w-48 group-hover:${accentText} transition-colors`}>{video.title}</h4>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">{video.publishedAt}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-xs font-medium text-zinc-900 dark:text-zinc-100 text-right">{video.views.toLocaleString()}</td>
                <td className="py-3 px-4 text-xs font-medium text-zinc-900 dark:text-zinc-100 text-right">{video.ctr}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
