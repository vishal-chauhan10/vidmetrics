import React from 'react';
import { Shield, Target } from 'lucide-react';
import { BattleKPICards } from './BattleKPICards';
import { BattleDataTable } from './BattleDataTable';

export function BattleModeDashboard() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col gap-6 h-full">
      
      <div className="flex items-center justify-between bg-zinc-900 dark:bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-xl overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/40 via-zinc-900 to-amber-900/40" />
        
        <div className="flex items-center gap-4 relative z-10 w-1/2 justify-start px-4">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)]">
            <Shield className="text-white" size={24} />
          </div>
          <div>
            <div className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-1">Your Channel</div>
            <h2 className="text-xl font-bold text-white">VidMetrics Pro</h2>
          </div>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center px-4">
          <div className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">Versus</div>
          <div className="h-8 w-px bg-gradient-to-b from-transparent via-zinc-500 to-transparent"></div>
        </div>

        <div className="flex items-center gap-4 relative z-10 w-1/2 justify-end px-4 text-right">
          <div>
            <div className="text-amber-500 text-xs font-bold uppercase tracking-widest mb-1">Competitor Channel</div>
            <h2 className="text-xl font-bold text-white">TechVision Media</h2>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.4)]">
            <Target className="text-white" size={24} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <div className="space-y-6 flex flex-col md:border-r border-zinc-200 dark:border-zinc-800 md:pr-6">
          <BattleKPICards type="yours" />
          <BattleDataTable type="yours" />
        </div>

        <div className="space-y-6 flex flex-col md:pl-6">
          <BattleKPICards type="competitor" />
          <BattleDataTable type="competitor" />
        </div>
      </div>
      
    </div>
  );
}
