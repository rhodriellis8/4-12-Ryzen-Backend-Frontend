import React from 'react';
import { Zap, BrainCircuit, TrendingUp } from 'lucide-react';

const Features: React.FC = () => {
  return (
    <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6">
      <FeatureCard 
        icon={<Zap size={20} className="text-zinc-300" />}
        title="Automated Import"
        description="Sync trades instantly from NinjaTrader, MetaTrader, and 20+ other brokers via API or CSV upload."
      />
      <FeatureCard 
        icon={<BrainCircuit size={20} className="text-zinc-300" />}
        title="Psycho-Metrics"
        description="Correlate your emotional state tags with P&L to identify costly behavioral leaks in your system."
      />
      <FeatureCard 
        icon={<TrendingUp size={20} className="text-zinc-300" />}
        title="Equity Curve Sim"
        description="Forecast future performance based on your rolling 30-day expectancy, win rate, and R:R statistics."
      />
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
  <div className="p-6 rounded-xl border border-white/5 bg-zinc-900/20 hover:bg-zinc-900/40 transition-colors group cursor-default">
    <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:border-white/20 transition-all duration-300 shadow-sm">
      {icon}
    </div>
    <h3 className="text-lg font-geist font-medium text-zinc-200 mb-2">{title}</h3>
    <p className="text-sm text-zinc-500 leading-relaxed group-hover:text-zinc-400 transition-colors">{description}</p>
  </div>
);

export default Features;