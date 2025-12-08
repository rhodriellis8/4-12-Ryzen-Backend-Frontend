import React, { useMemo } from 'react';
import { 
  LayoutGrid, 
  ScrollText, 
  Book, 
  Layers, 
  CandlestickChart,
  ListChecks
} from 'lucide-react';
import { ViewState } from '../App';
import ProfileDropdown from './ProfileDropdown';

interface SidebarProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  onLogout: () => void;
  user?: {
      name: string;
      email: string;
      avatar?: string;
  };
}

const NAV_ITEMS: { id: string; value: ViewState; label: string; icon: React.ReactNode }[] = [
  { id: 'nav-dashboard', value: 'dashboard', label: 'Dashboard', icon: <LayoutGrid size={18} /> },
  { id: 'nav-trades', value: 'trades', label: 'Trades', icon: <CandlestickChart size={18} /> },
  { id: 'nav-journal', value: 'journal', label: 'Journal', icon: <ScrollText size={18} /> },
  { id: 'nav-notebook', value: 'notebook', label: 'Notebooks', icon: <Book size={18} /> },
  { id: 'nav-playbooks', value: 'playbooks', label: 'Playbooks', icon: <Layers size={18} /> },
  { id: 'nav-tasks', value: 'tasks', label: 'Tasks', icon: <ListChecks size={18} /> },
];

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, onLogout, user }) => {
  const activeIndex = useMemo(() => {
    return NAV_ITEMS.findIndex(item => item.value === currentView);
  }, [currentView]);

  // Calculate glider position: activeIndex * 100% of item height
  // If activeIndex is -1 (not in list, e.g. settings), hide glider or keep it at 0?
  // We'll hide it by opacity if activeIndex is -1
  const showGlider = activeIndex !== -1;

  return (
    <aside 
      className="w-64 border-r border-zinc-200 dark:border-white/5 h-screen flex flex-col justify-between bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50"
      style={{ 
        "--main-color": "#ffffff", 
        "--main-color-opacity": "rgba(255, 255, 255, 0.1)", 
        "--total-radio": NAV_ITEMS.length 
      } as React.CSSProperties}
    >
      <div className="p-6 pb-2">
        {/* Logo */}
        <div 
          className="flex items-center gap-3 mb-8 group cursor-pointer px-2"
          onClick={() => onNavigate('dashboard')}
        >
          <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-black flex items-center justify-center font-bold font-geist tracking-tighter text-sm group-hover:scale-105 transition-transform duration-300 shadow-lg dark:shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            R
          </div>
          <span className="font-geist font-medium text-sm tracking-tight text-zinc-900 dark:text-zinc-100">
            Ryzen
          </span>
        </div>

        {/* Navigation Links */}
        <div className="relative flex flex-col pl-2 pr-2">
          {/* Glider Track */}
          <div className="absolute left-2 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-zinc-200 dark:via-zinc-800 to-transparent pointer-events-none" />

          {/* Glider */}
          <div 
            className="absolute left-2 w-full pointer-events-none transition-all duration-500 cubic-bezier(0.37, 1.95, 0.66, 0.56)"
            style={{
              height: `${100 / NAV_ITEMS.length}%`,
              top: 0,
              transform: `translateY(${activeIndex * 100}%)`,
              opacity: showGlider ? 1 : 0,
            }}
          >
            <div className="relative w-full h-full">
               {/* Glider Line */}
               <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-zinc-900 dark:via-white to-transparent" />
               {/* Glow Effect */}
               <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[150px] h-[60%] bg-zinc-900/10 dark:bg-white/10 blur-md rounded-full -z-10" />
            </div>
          </div>

          {/* Items */}
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.value)}
              className={`
                relative flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-300
                ${currentView === item.value 
                  ? 'text-zinc-900 dark:text-white bg-zinc-100/50 dark:bg-white/5' 
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-white/5'
                }
              `}
            >
              <span className="relative z-10 flex items-center gap-3">
                {item.icon}
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-zinc-200 dark:border-white/5">
        <ProfileDropdown 
            onNavigate={onNavigate as any} 
            onLogout={onLogout}
            data={user ? {
                name: user.name || 'User',
                email: user.email || '',
                avatar: user.avatar || '',
                subscription: 'PRO'
            } : undefined}
        />
      </div>
    </aside>
  );
};

export default Sidebar;
