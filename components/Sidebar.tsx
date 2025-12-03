import React from 'react';
import { 
  LayoutGrid, 
  ScrollText, 
  Book, 
  Layers, 
  Settings,
  CandlestickChart,
  LogOut,
  ListChecks
} from 'lucide-react';
import { ViewState } from '../App';

interface SidebarProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, onLogout }) => {
  return (
    <aside className="w-64 border-r border-zinc-200 dark:border-white/5 h-screen flex flex-col justify-between bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50 transition-colors duration-300">
      <div className="p-6">
        {/* Logo */}
        <div 
          className="flex items-center gap-3 mb-10 group cursor-pointer"
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
        <nav className="space-y-1">
          <NavItem 
            icon={<LayoutGrid size={18} />} 
            label="Dashboard" 
            active={currentView === 'dashboard'} 
            onClick={() => onNavigate('dashboard')}
          />
           <NavItem 
            icon={<CandlestickChart size={18} />} 
            label="Trades" 
            active={currentView === 'trades'} 
            onClick={() => onNavigate('trades')}
          />
          <NavItem 
            icon={<ScrollText size={18} />} 
            label="Journal" 
            active={currentView === 'journal'} 
            onClick={() => onNavigate('journal')}
          />
          <NavItem 
            icon={<Book size={18} />} 
            label="Notebooks" 
            active={currentView === 'notebook'} 
            onClick={() => onNavigate('notebook')}
          />
          <NavItem 
            icon={<Layers size={18} />} 
            label="Playbooks" 
            active={currentView === 'playbooks'} 
            onClick={() => onNavigate('playbooks')}
          />
          <NavItem 
            icon={<ListChecks size={18} />} 
            label="Tasks" 
            active={currentView === 'tasks'} 
            onClick={() => onNavigate('tasks')}
          />
        </nav>
      </div>

      <div className="p-4 border-t border-zinc-200 dark:border-white/5">
        <button 
          onClick={() => onNavigate('settings')}
          className={`w-full flex items-center gap-3 px-2 py-2 rounded-md transition-all mb-1 ${currentView === 'settings' ? 'text-zinc-900 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-900/30' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900/30'}`}
        >
          <Settings size={16} />
          <span className="text-sm font-medium">Settings</span>
        </button>
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-2 py-2 rounded-md transition-all mb-4 text-zinc-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20"
        >
          <LogOut size={16} />
          <span className="text-sm font-medium">Log Out</span>
        </button>

        <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900/40 transition-colors cursor-pointer group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-600 border border-black/5 dark:border-white/10 flex items-center justify-center text-xs text-zinc-700 dark:text-white font-medium shadow-inner">
            JD
          </div>
          <div className="flex flex-col text-left">
            <span className="text-sm text-zinc-800 dark:text-zinc-200 font-medium group-hover:text-black dark:group-hover:text-white transition-colors">John Doe</span>
            <span className="text-xs text-zinc-500 dark:text-zinc-600 group-hover:text-zinc-600 dark:group-hover:text-zinc-500 transition-colors">Pro Plan</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-all group ${
      active
        ? 'bg-zinc-200/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 border border-zinc-300/50 dark:border-zinc-800/50 shadow-sm'
        : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900/30'
    }`}
  >
    {React.cloneElement(icon as React.ReactElement<any>, {
      className: active ? 'text-zinc-900 dark:text-zinc-100' : 'group-hover:text-zinc-700 dark:group-hover:text-zinc-200 transition-colors',
      size: 16
    })}
    <span className="text-sm font-medium">{label}</span>
  </button>
);

export default Sidebar;