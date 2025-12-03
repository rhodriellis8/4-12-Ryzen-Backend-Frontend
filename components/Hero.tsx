import React from 'react';
import { ArrowUpRight, TrendingUp, Activity, BarChart3, Zap, Clock } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis } from 'recharts';

const chartData = [
  { name: 'Mon', value: 400 },
  { name: 'Tue', value: 300 },
  { name: 'Wed', value: 550 },
  { name: 'Thu', value: 450 },
  { name: 'Fri', value: 650 },
  { name: 'Sat', value: 600 },
  { name: 'Sun', value: 800 },
];

const Hero: React.FC = () => {
  return (
    <div className="mt-4">
      <div className="mb-8">
        <h1 className="text-3xl font-light tracking-tight text-zinc-900 dark:text-white font-geist mb-2">
            Welcome back, <span className="font-medium">John</span>
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400">Here's what's happening in your trading workspace today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatWidget 
            label="Net P&L (Monthly)" 
            value="+$12,450" 
            change="+12.5%" 
            isPositive={true} 
            icon={<TrendingUp size={16} />}
        />
        <StatWidget 
            label="Win Rate" 
            value="68.4%" 
            change="+2.1%" 
            isPositive={true} 
            icon={<Activity size={16} />}
        />
        <StatWidget 
            label="Profit Factor" 
            value="2.41" 
            change="-0.05" 
            isPositive={false} 
            icon={<BarChart3 size={16} />}
        />
        <StatWidget 
            label="Avg. R:R" 
            value="1 : 2.8" 
            change="+0.2" 
            isPositive={true} 
            icon={<Zap size={16} />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Widget */}
        <div className="lg:col-span-2 border-gradient before:rounded-xl rounded-xl bg-white/50 dark:bg-zinc-900/50 border border-transparent shadow-sm p-6 relative overflow-hidden group hover:bg-white dark:hover:bg-zinc-900 transition-all">
            <div className="flex justify-between items-center mb-6 relative z-10">
                <div>
                    <h3 className="text-lg font-medium text-zinc-900 dark:text-white font-geist">Equity Curve</h3>
                    <p className="text-xs text-zinc-500">Real-time performance tracking</p>
                </div>
                <div className="flex gap-2">
                    <span className="px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-xs font-medium text-zinc-600 dark:text-zinc-400">1W</span>
                    <span className="px-2 py-1 rounded-md bg-zinc-900 dark:bg-white text-xs font-medium text-white dark:text-black">1M</span>
                    <span className="px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-xs font-medium text-zinc-600 dark:text-zinc-400">YTD</span>
                </div>
            </div>
            
            <div className="h-64 w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 10}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 10}} />
                        <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
            
            {/* Background noise/grain could go here */}
        </div>

        {/* Side Widgets Column */}
        <div className="space-y-6">
            {/* Active Playbook Widget */}
            <div className="border-gradient before:rounded-xl rounded-xl bg-white/50 dark:bg-zinc-900/50 border border-transparent shadow-sm p-6 hover:bg-white dark:hover:bg-zinc-900 transition-all group">
                <div className="flex items-center gap-2 mb-4">
                    <Zap size={16} className="text-amber-500" />
                    <h3 className="font-medium text-zinc-900 dark:text-white">Focus Playbook</h3>
                </div>
                <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-white/5">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Gap & Go</span>
                            <span className="px-1.5 py-0.5 text-[10px] bg-emerald-500/10 text-emerald-500 rounded border border-emerald-500/20">A+ Setup</span>
                        </div>
                        <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full w-3/4"></div>
                        </div>
                        <p className="text-[10px] text-zinc-500 mt-1.5">75% win rate this week</p>
                    </div>
                </div>
            </div>

            {/* Recent Activity Widget */}
            <div className="border-gradient before:rounded-xl rounded-xl bg-white/50 dark:bg-zinc-900/50 border border-transparent shadow-sm p-6 hover:bg-white dark:hover:bg-zinc-900 transition-all group">
                 <div className="flex items-center gap-2 mb-4">
                    <Clock size={16} className="text-zinc-400" />
                    <h3 className="font-medium text-zinc-900 dark:text-white">Recent Log</h3>
                </div>
                <div className="space-y-4">
                    <div className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5"></div>
                        <div>
                            <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200">Trade Execution: ES Long</p>
                            <p className="text-[10px] text-zinc-500">2 hours ago</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5"></div>
                        <div>
                            <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200">Journal Entry: Weekly Review</p>
                            <p className="text-[10px] text-zinc-500">5 hours ago</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

const StatWidget: React.FC<{label: string; value: string; change: string; isPositive: boolean; icon: React.ReactNode}> = ({ label, value, change, isPositive, icon }) => (
    <div className="border-gradient before:rounded-xl rounded-xl bg-white/50 dark:bg-zinc-900/50 border border-transparent p-5 hover:bg-white dark:hover:bg-zinc-900 transition-all group">
        <div className="flex justify-between items-start mb-4">
            <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                {icon}
            </div>
            <div className={`flex items-center text-xs font-medium ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                {change}
                <ArrowUpRight size={12} className={isPositive ? '' : 'rotate-90'} />
            </div>
        </div>
        <div>
            <h4 className="text-2xl font-medium text-zinc-900 dark:text-white font-geist tracking-tight">{value}</h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">{label}</p>
        </div>
    </div>
);

export default Hero;