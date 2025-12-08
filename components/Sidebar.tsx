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
      className="w-64 border-r border-zinc-200 dark:border-white/5 h-screen flex flex-col justify-between bg-white dark:bg-zinc-950 sticky top-0 z-50"
      style={{ 
        "--main-color": "#ffffff", 
        "--main-color-opacity": "rgba(255, 255, 255, 0.1)", 
        "--total-radio": NAV_ITEMS.length 
      } as React.CSSProperties}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        .glider-container {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 1px;
          pointer-events: none;
          background: linear-gradient(0deg,
              rgba(0, 0, 0, 0) 0%,
              rgba(27, 27, 27, 0.2) 50%,
              rgba(0, 0, 0, 0) 100%);
        }
        
        /* Dark mode override for track */
        .dark .glider-container {
           background: linear-gradient(0deg,
              rgba(0, 0, 0, 0) 0%,
              rgba(255, 255, 255, 0.2) 50%,
              rgba(0, 0, 0, 0) 100%);
        }

        .glider-track {
          position: relative;
          height: calc(100% / var(--total-radio));
          width: 100%;
          transition: transform 0.5s cubic-bezier(0.37, 1.95, 0.66, 0.56);
          pointer-events: none;
        }

        .glider-track::before {
          content: "";
          position: absolute;
          height: 60%;
          width: 2px;
          top: 50%;
          left: 0;
          transform: translateY(-50%);
          background: var(--main-color);
          z-index: 10;
          box-shadow: 0 0 10px var(--main-color);
        }
        
        .glider-track::after {
          content: "";
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          width: 150px;
          background: linear-gradient(90deg,
              var(--main-color-opacity) 0%,
              rgba(0, 0, 0, 0) 100%);
          z-index: 0;
        }
      `}} />

      <div className="p-6 pb-2">
        {/* Logo */}
        <div 
          className="flex items-center gap-3 mb-8 group cursor-pointer px-2"
          onClick={() => onNavigate('dashboard')}
        >
          <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-black flex items-center justify-center font-bold font-geist tracking-tighter text-sm group-hover:scale-105 transition-transform duration-200 shadow-md">
            R
          </div>
          <span className="font-geist font-medium text-sm tracking-tight text-zinc-900 dark:text-zinc-100">
            Ryzen
          </span>
        </div>

        {/* Navigation Links */}
        <div className="relative flex flex-col pl-2 pr-2">
          {/* Glider Container (Track + Moving Glider) */}
          <div className="glider-container">
             <div 
               className="glider-track"
               style={{
                 transform: activeIndex !== -1 ? `translateY(${activeIndex * 100}%)` : 'translateY(-100%)',
                 opacity: activeIndex !== -1 ? 1 : 0,
               }}
             />
          </div>

          {/* Items */}
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.value)}
              className={`
                relative flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors duration-200 z-10
                ${currentView === item.value 
                  ? 'text-zinc-900 dark:text-white bg-zinc-100/10 dark:bg-white/5' 
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-50/50 dark:hover:bg-white/5'
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
