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

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, onLogout, user }) => {
  return (
    <aside className="w-64 border-r border-zinc-200 dark:border-white/5 h-screen flex flex-col justify-between bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
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

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md group ${
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