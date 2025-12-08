import React, { useState } from 'react';
import { User, Mail, Camera } from 'lucide-react';

interface ProfileViewProps {
    user: any; // Using any for simplicity with Supabase user object
    onUpdateProfile: (data: any) => Promise<void>;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, onUpdateProfile }) => {
    const [name, setName] = useState(user?.user_metadata?.full_name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        
        try {
            await onUpdateProfile({ data: { full_name: name } });
            setMessage({ type: 'success', text: 'Profile updated successfully' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update profile' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">Profile</h1>
                <p className="text-zinc-500">Manage your personal information</p>
            </div>

            <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Avatar Section */}
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 relative overflow-hidden group cursor-pointer">
                            {user?.user_metadata?.avatar_url ? (
                                <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <User size={32} />
                            )}
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera size={20} className="text-white" />
                            </div>
                        </div>
                        <div>
                            <h3 className="font-medium text-zinc-900 dark:text-white">Profile Photo</h3>
                            <p className="text-sm text-zinc-500 mb-2">Click to upload a new photo</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                Display Name
                            </label>
                            <div className="relative">
                                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-zinc-900 dark:text-zinc-100"
                                    placeholder="Your name"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                                <input
                                    type="email"
                                    value={email}
                                    disabled
                                    className="w-full pl-10 pr-4 py-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-500 cursor-not-allowed"
                                />
                            </div>
                            <p className="text-xs text-zinc-500 mt-1">Email cannot be changed</p>
                        </div>
                    </div>

                    {message && (
                        <div className={`p-3 rounded-lg text-sm ${
                            message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                        }`}>
                            {message.text}
                        </div>
                    )}

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfileView;
