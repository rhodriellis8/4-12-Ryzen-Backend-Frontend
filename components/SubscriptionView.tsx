import React from 'react';
import { CheckCircle2, Zap } from 'lucide-react';

const SubscriptionView: React.FC = () => {
    return (
        <div className="max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">Subscription</h1>
                <p className="text-zinc-500">Manage your plan and billing</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 dark:from-zinc-800 dark:to-zinc-900 rounded-2xl p-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                    
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 bg-emerald-500/20 rounded-lg">
                                <Zap className="text-emerald-400" size={20} />
                            </div>
                            <span className="font-medium text-emerald-400">Current Plan</span>
                        </div>
                        
                        <h2 className="text-3xl font-bold mb-2">Pro Plan</h2>
                        <p className="text-zinc-400 mb-6">Billed monthly</p>
                        
                        <div className="space-y-3 mb-8">
                            <div className="flex items-center gap-2 text-sm text-zinc-300">
                                <CheckCircle2 size={16} className="text-emerald-400" />
                                <span>Unlimited Trade Logs</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-zinc-300">
                                <CheckCircle2 size={16} className="text-emerald-400" />
                                <span>Advanced Analytics</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-zinc-300">
                                <CheckCircle2 size={16} className="text-emerald-400" />
                                <span>AI Playbook Generator</span>
                            </div>
                        </div>

                        <button className="w-full py-2 bg-white text-zinc-900 rounded-lg font-medium hover:bg-zinc-100 transition-colors">
                            Manage Subscription
                        </button>
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
                    <h3 className="font-bold text-lg mb-4 text-zinc-900 dark:text-white">Billing History</h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center justify-between p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-lg transition-colors border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700">
                                <div>
                                    <p className="font-medium text-zinc-900 dark:text-zinc-200">Pro Plan - Monthly</p>
                                    <p className="text-xs text-zinc-500">Oct {24 - i}, 2024</p>
                                </div>
                                <span className="text-sm font-medium text-zinc-900 dark:text-white">$29.00</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionView;



