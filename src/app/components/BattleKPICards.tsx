import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const kpiData = {
  views: { title: "7-Day Views", yours: "1.2M", comp: "980K", deltaText: "+22% ahead", isBetter: true },
  velocity: { title: "Avg. Velocity", yours: "850/hr", comp: "720/hr", deltaText: "+18% ahead", isBetter: true },
  subscribers: { title: "Sub Growth", yours: "12.4K", comp: "15.1K", deltaText: "-17% behind", isBetter: false },
};

export function BattleKPICards({ type }: { type: 'yours' | 'competitor' }) {
  const isYours = type === 'yours';
  
  return (
    <div className="grid grid-cols-1 2xl:grid-cols-3 gap-4">
      {Object.entries(kpiData).map(([key, kpi]) => (
        <div key={key} className={`bg-white dark:bg-zinc-900 border ${isYours ? 'border-blue-100 dark:border-blue-900/30' : 'border-amber-100 dark:border-amber-900/30'} rounded-xl p-5 shadow-sm relative overflow-hidden group`}>
          <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${isYours ? 'from-blue-500/5 to-transparent' : 'from-amber-500/5 to-transparent'} rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110`} />
          
          <div className="flex justify-between items-start mb-2 relative z-10">
            <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{kpi.title}</span>
          </div>
          
          <div className="flex flex-col items-start mt-2 relative z-10 gap-2">
            <h3 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
              {isYours ? kpi.yours : kpi.comp}
            </h3>
            
            {isYours && (
              <div className={`flex items-center text-xs font-bold px-2.5 py-1 rounded-md ${kpi.isBetter ? 'text-blue-700 bg-blue-100 dark:text-blue-400 dark:bg-blue-400/10' : 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-400/10'}`}>
                {kpi.isBetter ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
                {kpi.deltaText}
              </div>
            )}
            {!isYours && (
              <div className={`flex items-center text-xs font-bold px-2.5 py-1 rounded-md ${!kpi.isBetter ? 'text-amber-700 bg-amber-100 dark:text-amber-400 dark:bg-amber-400/10' : 'text-emerald-700 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-400/10'}`}>
                {!kpi.isBetter ? <ArrowDownRight size={14} className="mr-1" /> : <ArrowUpRight size={14} className="mr-1" />}
                {!kpi.isBetter ? 'Lagging' : 'Leading'}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
