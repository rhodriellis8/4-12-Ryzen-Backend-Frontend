import React from 'react';
import { Crosshair, Activity, ArrowRight } from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, Cell } from 'recharts';

const data = [
  { name: '1', value: 40, color: '#52525b' },
  { name: '2', value: 30, color: '#52525b' },
  { name: '3', value: 50, color: '#52525b' },
  { name: '4', value: 45, color: 'rgba(244, 63, 94, 0.6)' }, // Loss
  { name: '5', value: 35, color: '#52525b' },
  { name: '6', value: 60, color: 'rgba(16, 185, 129, 0.6)' }, // Win
  { name: '7', value: 75, color: '#10b981' }, // Big Win (Active)
  { name: '8', value: 70, color: 'rgba(16, 185, 129, 0.6)' },
  { name: '9', value: 80, color: '#52525b' },
  { name: '10', value: 65, color: '#52525b' },
];

const DashboardCard: React.FC = () => {
  return (
    <div className="relative group w-full lg:w-[420px]">
      {/* Glow effect behind */}
      <div className="absolute -inset-1 bg-gradient-to-r from-zinc-400/20 to-zinc-500/20 dark:from-zinc-700/20 dark:to-zinc-800/20 rounded-xl blur-xl opacity-50 group-hover:opacity-75 transition duration-1000"></div>

      {/* Main Card */}
      <div className="glass-panel rounded-xl p-1 relative overflow-hidden shadow-2xl transition-transform duration-500 hover:scale-[1.01]">
        {/* Window Controls */}
        <div className="bg-zinc-100/90 dark:bg-zinc-900/90 border-b border-zinc-200 dark:border-white/5 px-4 py-3 flex items-center justify-between">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700"></div>
          </div>
          <div className="text-[10px] uppercase tracking-widest text-zinc-400 dark:text-zinc-600 font-semibold font-geist">Latest Execution</div>
        </div>

        {/* Card Content */}
        <div className="p-6 bg-white/50 dark:bg-black/40">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-geist font-medium text-zinc-900 dark:text-white tracking-tight">ES Futures</h3>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 font-medium font-mono">LONG</span>
              </div>
              <p className="text-xs text-zinc-500 font-mono">Sep 24, 10:42 AM • Setup: A+ Reversal</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-geist font-medium text-emerald-600 dark:text-emerald-400 tracking-tight">+$850.00</p>
              <p className="text-xs text-zinc-500">12.5 Points</p>
            </div>
          </div>

          {/* Chart Visual */}
          <div className="h-32 w-full border border-zinc-200 dark:border-white/5 bg-zinc-50 dark:bg-zinc-900/30 rounded-lg mb-6 relative overflow-hidden p-2">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} barGap={4}>
                    <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Bar>
                </BarChart>
             </ResponsiveContainer>
             
             {/* Simple Line Overlay using SVG for the trend simulation */}
             <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
                 <path 
                    d="M 20 90 Q 60 100 100 70 T 180 50 T 260 30 T 340 40" 
                    fill="none" 
                    stroke="#10b981" 
                    strokeWidth="2" 
                    className="opacity-80 drop-shadow-md"
                    strokeLinecap="round"
                 />
             </svg>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-zinc-100/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 hover:bg-zinc-200/50 dark:hover:bg-zinc-900/70 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <Crosshair size={14} className="text-zinc-400 dark:text-zinc-500" />
                <span className="text-xs text-zinc-500 dark:text-zinc-400">Entry / Exit</span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-sm text-zinc-700 dark:text-zinc-300 font-mono">4150.25</span>
                <ArrowRight size={12} className="text-zinc-400 dark:text-zinc-600 mb-1" />
                <span className="text-sm text-zinc-900 dark:text-white font-mono">4162.75</span>
              </div>
            </div>
            
            <div className="p-3 rounded-lg bg-zinc-100/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 hover:bg-zinc-200/50 dark:hover:bg-zinc-900/70 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <Activity size={14} className="text-zinc-400 dark:text-zinc-500" />
                <span className="text-xs text-zinc-500 dark:text-zinc-400">Psychology</span>
              </div>
              <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-indigo-500 h-full w-[85%] rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-zinc-500">Focus</span>
                <span className="text-[10px] text-indigo-500 dark:text-indigo-400">8.5/10</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating decorative card behind (Desktop only) */}
      <div className="absolute -right-6 -bottom-6 w-48 p-4 glass-panel rounded-lg border border-zinc-200 dark:border-white/5 z-0 opacity-60 scale-90 hidden lg:block animate-pulse-slow">
         <div className="flex items-center gap-2 mb-3">
             <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]"></div>
             <span className="text-xs text-zinc-500 dark:text-zinc-300 font-medium">NQ Scalp</span>
         </div>
         <div className="h-12 flex items-center gap-1.5 items-end">
             <div className="w-1.5 h-4 bg-zinc-300 dark:bg-zinc-800 rounded-sm"></div>
             <div className="w-1.5 h-6 bg-zinc-300 dark:bg-zinc-800 rounded-sm"></div>
             <div className="w-1.5 h-3 bg-rose-400/50 dark:bg-rose-500/50 rounded-sm"></div>
             <div className="w-1.5 h-8 bg-zinc-300 dark:bg-zinc-800 rounded-sm"></div>
             <div className="w-1.5 h-5 bg-rose-500/80 rounded-sm"></div>
         </div>
      </div>
    </div>
  );
};

export default DashboardCard;