import React from 'react';
import { 
  LayoutGrid, 
  CandlestickChart,
  ScrollText, 
  Book, 
  Layers, 
  ListChecks,
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
  const menuItems: { id: ViewState; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutGrid size={18} /> },
    { id: 'trades', label: 'Trades', icon: <CandlestickChart size={18} /> },
    { id: 'journal', label: 'Journal', icon: <ScrollText size={18} /> },
    { id: 'notebook', label: 'Notebooks', icon: <Book size={18} /> },
    { id: 'playbooks', label: 'Playbooks', icon: <Layers size={18} /> },
    { id: 'tasks', label: 'Tasks', icon: <ListChecks size={18} /> },
  ];

  const totalItems = menuItems.length;

  const profileData = user ? {
    name: user.name,
    email: user.email,
    avatar: user.avatar || "https://ferf1mheo22r9ira.public.blob.vercel-storage.com/profile-mjss82WnWBRO86MHHGxvJ2TVZuyrDv.jpeg",
    subscription: "PRO",
    model: "Gemini 2.0 Flash"
  } : undefined;

  return (
    <aside className="w-64 border-r border-zinc-200 dark:border-white/5 h-screen flex flex-col justify-between bg-zinc-950 text-white relative z-50">
       <style>{`
        .radio-nav-container {
          display: flex;
          flex-direction: column;
          position: relative;
          padding-left: 0.5rem;
          --main-color: #ffffff;
          --main-color-opacity: rgba(255, 255, 255, 0.1);
          --total-radio: ${totalItems};
        }

        .radio-nav-container input {
          cursor: pointer;
          appearance: none;
          position: absolute;
          opacity: 0;
          pointer-events: none;
        }

        .radio-nav-container .glider-container {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          background: linear-gradient(0deg,
              rgba(0, 0, 0, 0) 0%,
              rgba(27, 27, 27, 1) 50%,
              rgba(0, 0, 0, 0) 100%);
          width: 1px;
          pointer-events: none;
        }

        .radio-nav-container .glider-container .glider {
          position: relative;
          height: calc(100% / var(--total-radio));
          width: 100%;
          background: linear-gradient(0deg,
              rgba(0, 0, 0, 0) 0%,
              var(--main-color) 50%,
              rgba(0, 0, 0, 0) 100%);
          transition: transform 0.3s cubic-bezier(0.37, 1.95, 0.66, 0.56);
        }

        .radio-nav-container .glider-container .glider::before {
          content: "";
          position: absolute;
          height: 60%;
          width: 300%;
          top: 50%;
          transform: translateY(-50%);
          background: var(--main-color);
          filter: blur(10px);
          opacity: 0.6;
        }

        .radio-nav-container .glider-container .glider::after {
          content: "";
          position: absolute;
          left: 0;
          height: 100%;
          width: 150px;
          background: linear-gradient(90deg,
              var(--main-color-opacity) 0%,
              rgba(0, 0, 0, 0) 100%);
        }

        .radio-nav-container label {
          cursor: pointer;
          padding: 0.75rem;
          position: relative;
          color: rgb(163, 163, 163);
          transition: all 0.3s ease-in-out;
          border-radius: 0.75rem;
          border: 1px solid transparent;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .radio-nav-container input:checked + label {
          color: var(--main-color);
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.1);
        }
        
        ${menuItems.map((_, index) => `
        .radio-nav-container input:nth-of-type(${index + 1}):checked ~ .glider-container .glider {
          transform: translateY(${index * 100}%);
        }
        `).join('')}
      `}</style>

      <div className="p-4">
        {/* Logo */}
        <div 
          className="flex items-center gap-3 mb-10 px-2 group cursor-pointer"
          onClick={() => onNavigate('dashboard')}
        >
          <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center font-bold font-geist tracking-tighter text-sm group-hover:scale-105 transition-transform duration-300 shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            R
          </div>
          <span className="font-geist font-medium text-sm tracking-tight text-zinc-100">
            Ryzen
          </span>
        </div>

        {/* Radio Navigation */}
        <div className="radio-nav-container">
          {menuItems.map((item) => (
            <React.Fragment key={item.id}>
              <input 
                type="radio" 
                id={`nav-${item.id}`} 
                name="nav-menu" 
                checked={currentView === item.id} 
                onChange={() => onNavigate(item.id)}
              />
              <label htmlFor={`nav-${item.id}`} className="text-sm">
                {item.icon}
                {item.label}
              </label>
            </React.Fragment>
          ))}

          <div className="glider-container">
            <div className="glider"></div>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-white/5">
        <ProfileDropdown data={profileData} onLogout={onLogout} />
      </div>
    </aside>
  );
};

export default Sidebar;
