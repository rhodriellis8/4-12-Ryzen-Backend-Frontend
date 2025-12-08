
import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, Bell, Sun, Moon, Sparkles, Wallet, X, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { ViewState } from '../App';

interface HeaderProps {
  title: string;
  isDarkMode: boolean;
  toggleTheme: () => void;
  onNavigate: (view: ViewState) => void;
  onOpenAccountManager: () => void;
  activeAccountName?: string;
}

interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  type: 'success' | 'warning' | 'info';
  read: boolean;
}

const initialNotifications: Notification[] = [
  { id: 1, title: 'Trade Execution', message: 'Long ES filled at 4150.25', time: '2m ago', type: 'success', read: false },
  { id: 2, title: 'Price Alert', message: 'NQ approaching resistance at 14550', time: '15m ago', type: 'warning', read: false },
  { id: 3, title: 'System Update', message: 'New metrics available in dashboard', time: '1h ago', type: 'info', read: true },
];

const Header: React.FC<HeaderProps> = ({ 
  title, 
  isDarkMode, 
  toggleTheme, 
  onNavigate, 
  onOpenAccountManager,
  activeAccountName 
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = (id: number) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-8 py-6 bg-white/80 dark:bg-black/80">
      <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-500">
        <span className="hover:text-zinc-800 dark:hover:text-zinc-300 transition-colors cursor-pointer" onClick={() => onNavigate('dashboard')}>Ryzen</span>
        <ChevronRight size={14} className="text-zinc-400 dark:text-zinc-700" />
        <span className="text-zinc-800 dark:text-zinc-200 font-medium">{title}</span>
      </div>
      
      <div className="flex items-center gap-4">
        {/* My Accounts Button */}
        <button 
          onClick={onOpenAccountManager}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all text-xs font-medium shadow-sm mr-2"
        >
          <Wallet size={12} />
          <span>{activeAccountName || 'My Accounts'}</span>
        </button>

        <button 
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-black text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors duration-200 shadow-sm"
          onClick={() => onNavigate('pricing')}
        >
          <Sparkles size={12} />
          Pricing
        </button>

        <button 
          onClick={toggleTheme}
          className="p-2 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-300 dark:hover:border-white/20 transition-all active:scale-95 shadow-sm"
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDarkMode ? <Sun size={16} /> : <Moon size={16} className="text-zinc-600" />}
        </button>
        
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <div 
            className="relative group cursor-pointer p-1"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={18} className="text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-black"></span>
            )}
          </div>

          {/* Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-full mt-4 w-80 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-50">
              <div className="p-4 border-b border-zinc-100 dark:border-white/5 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/50">
                <h3 className="font-medium text-sm text-zinc-900 dark:text-white">Notifications</h3>
                {notifications.length > 0 && (
                  <button onClick={handleClearAll} className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300">
                    Clear all
                  </button>
                )}
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-zinc-500 dark:text-zinc-400 text-xs">
                    No new notifications
                  </div>
                ) : (
                  <div className="divide-y divide-zinc-100 dark:divide-white/5">
                    {notifications.map(notif => (
                      <div 
                        key={notif.id} 
                        className={`p-4 flex gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors cursor-pointer ${notif.read ? 'opacity-60' : 'opacity-100'}`}
                        onClick={() => handleMarkAsRead(notif.id)}
                      >
                        <div className={`mt-0.5 shrink-0`}>
                           {notif.type === 'success' && <CheckCircle2 size={16} className="text-emerald-500" />}
                           {notif.type === 'warning' && <AlertTriangle size={16} className="text-amber-500" />}
                           {notif.type === 'info' && <Info size={16} className="text-blue-500" />}
                        </div>
                        <div className="flex-1 min-w-0">
                           <div className="flex justify-between items-start mb-0.5">
                              <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">{notif.title}</p>
                              <span className="text-[10px] text-zinc-400 whitespace-nowrap ml-2">{notif.time}</span>
                           </div>
                           <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-snug">{notif.message}</p>
                        </div>
                        {!notif.read && (
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0"></div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
