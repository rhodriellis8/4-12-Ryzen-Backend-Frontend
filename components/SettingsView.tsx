
import React, { useState, useEffect } from 'react';
import { Moon, Sun, User, Bell } from 'lucide-react';
import ButtonCopy from './ui/ButtonCopy';

interface SettingsViewProps {
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  user?: any;
  onUpdateProfile?: (data: any) => Promise<void>;
}

const SettingsView: React.FC<SettingsViewProps> = ({ isDarkMode, setIsDarkMode, user, onUpdateProfile }) => {
  const [displayName, setDisplayName] = useState(user?.user_metadata?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (user) {
      setDisplayName(user.user_metadata?.full_name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleSaveProfile = async () => {
    if (!onUpdateProfile) return;
    setLoading(true);
    setMessage(null);
    try {
      await onUpdateProfile({ data: { full_name: displayName } });
      setMessage({ type: 'success', text: 'Profile updated successfully' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl pb-10">
      <h2 className="text-2xl font-bold font-geist text-zinc-900 dark:text-white mb-8">Settings</h2>

      <div className="space-y-6">
        {/* Appearance Section */}
        <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
                <Sun size={20} className="text-zinc-500" />
                Appearance
            </h3>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Theme Mode</p>
                    <p className="text-xs text-zinc-500">Select your preferred interface theme.</p>
                </div>
                <div className="flex bg-zinc-100 dark:bg-black border border-zinc-200 dark:border-white/10 p-1 rounded-lg">
                    <button 
                        onClick={() => setIsDarkMode(false)}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm transition-all font-medium ${!isDarkMode ? 'bg-white text-black shadow-sm ring-1 ring-black/5' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'}`}
                    >
                        <Sun size={14} />
                        Light
                    </button>
                    <button 
                        onClick={() => setIsDarkMode(true)}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm transition-all font-medium ${isDarkMode ? 'bg-zinc-800 text-white shadow-sm ring-1 ring-white/10' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'}`}
                    >
                        <Moon size={14} />
                        Dark
                    </button>
                </div>
            </div>
        </div>

        {/* Profile Section */}
        <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <User size={20} className="text-zinc-500" />
                    Profile Information
                </h3>
                {message && (
                    <span className={`text-xs font-medium ${message.type === 'success' ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {message.text}
                    </span>
                )}
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1.5">Display Name</label>
                    <input 
                        type="text" 
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-white/10 rounded-md text-sm text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors" 
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1.5">Email Address</label>
                    <input 
                        type="email" 
                        value={email}
                        disabled
                        className="w-full px-3 py-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-md text-sm text-zinc-500 cursor-not-allowed" 
                    />
                </div>
            </div>
            <div className="flex justify-end mt-4">
                <button 
                    onClick={handleSaveProfile}
                    disabled={loading || !onUpdateProfile}
                    className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black text-xs font-medium rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50"
                >
                    {loading ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </div>

        {/* Notifications (Dummy) */}
        <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 rounded-xl p-6 opacity-75 shadow-sm">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
                <Bell size={20} className="text-zinc-500" />
                Notifications
            </h3>
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-700 dark:text-zinc-300">Daily Digest</span>
                    <div className="w-10 h-5 bg-emerald-500 rounded-full relative cursor-pointer"><div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm"></div></div>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-700 dark:text-zinc-300">Trade Alerts</span>
                    <div className="w-10 h-5 bg-zinc-200 dark:bg-zinc-700 rounded-full relative cursor-pointer"><div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm"></div></div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
