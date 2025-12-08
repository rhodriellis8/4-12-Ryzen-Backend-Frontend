
import React, { useState } from 'react';
import { X, Search, ChevronLeft, Wallet, Upload, Plus, Server, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import BasicDropdown from './ui/BasicDropdown';

interface AccountManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: any[];
  onAddAccount: (account: any) => void;
  onSelectAccount: (id: string) => void;
  activeAccountId: string | null;
}

type WizardStep = 'list' | 'broker-select' | 'import-method' | 'sync-form';

const AccountManagerModal: React.FC<AccountManagerModalProps> = ({ 
  isOpen, 
  onClose, 
  accounts, 
  onAddAccount,
  onSelectAccount,
  activeAccountId
}) => {
  const [step, setStep] = useState<WizardStep>('list');
  const [selectedBroker, setSelectedBroker] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  // Form States
  const [server, setServer] = useState('');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [startDate, setStartDate] = useState('all');

  const START_DATE_OPTIONS = [
    { id: 'all', label: 'Import all records' },
    { id: '30d', label: 'Last 30 days' },
    { id: '90d', label: 'Last 90 days' },
    { id: 'ytd', label: 'Year to Date' },
  ];

  if (!isOpen) return null;

  const handleBack = () => {
    if (step === 'broker-select') setStep('list');
    else if (step === 'import-method') setStep('broker-select');
    else if (step === 'sync-form') setStep('import-method');
  };

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    setIsConnecting(true);

    // Simulate API call
    setTimeout(() => {
      const newAccount = {
        id: Date.now().toString(),
        name: `${selectedBroker} Account`,
        broker: selectedBroker,
        balance: '$100,000.00',
        type: 'Demo'
      };
      onAddAccount(newAccount);
      setIsConnecting(false);
      setStep('list');
      // Reset form
      setServer('');
      setLogin('');
      setPassword('');
      setSelectedBroker(null);
    }, 2000);
  };

  const brokers = [
    { id: 'mt4', name: 'MetaTrader 4', icon: 'M4', color: 'bg-emerald-600' },
    { id: 'mt5', name: 'MetaTrader 5', icon: 'M5', color: 'bg-blue-600' },
    { id: 'ctrader', name: 'cTrader', icon: 'cT', color: 'bg-orange-600' },
    { id: 'tradelocker', name: 'TradeLocker', icon: 'TL', color: 'bg-purple-600' },
    { id: 'ibkr', name: 'Interactive Brokers', icon: 'IB', color: 'bg-rose-600' },
    { id: 'topstep', name: 'TopstepX', icon: 'TS', color: 'bg-zinc-800' },
    { id: 'thinkorswim', name: 'Thinkorswim', icon: 'TD', color: 'bg-green-700' },
    { id: 'tradovate', name: 'Tradovate', icon: 'TV', color: 'bg-blue-500' },
  ].filter(b => b.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // Render Step: Account List
  const renderList = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <div>
           <h3 className="text-xl font-medium text-zinc-900 dark:text-white">My Accounts</h3>
           <p className="text-sm text-zinc-500">Manage your connected trading accounts.</p>
        </div>
        <button 
          onClick={() => setStep('broker-select')}
          className="flex items-center gap-2 px-3 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          Add Account
        </button>
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
        {accounts.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
             <Wallet size={32} className="mx-auto text-zinc-300 mb-2" />
             <p className="text-zinc-500 font-medium">No accounts connected</p>
             <p className="text-xs text-zinc-400">Add your first broker to start journaling.</p>
          </div>
        ) : (
          accounts.map(acc => (
            <div 
              key={acc.id}
              onClick={() => onSelectAccount(acc.id)}
              className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${activeAccountId === acc.id ? 'bg-zinc-100 dark:bg-white/10 border-zinc-300 dark:border-white/20' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'}`}
            >
               <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white text-xs ${acc.broker === 'MetaTrader 4' ? 'bg-emerald-600' : 'bg-blue-600'}`}>
                      {acc.broker === 'MetaTrader 4' ? 'M4' : 'M5'}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-zinc-900 dark:text-white">{acc.name}</h4>
                    <p className="text-xs text-zinc-500">{acc.broker} • {acc.type}</p>
                  </div>
               </div>
               <div className="text-right">
                  <p className="text-sm font-mono font-medium text-zinc-900 dark:text-white">{acc.balance}</p>
                  {activeAccountId === acc.id && (
                     <div className="flex items-center justify-end gap-1 text-xs text-emerald-500">
                       <CheckCircle2 size={10} />
                       Active
                     </div>
                  )}
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // Render Step: Broker Selection
  const renderBrokerSelect = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2 mb-8">
        <h3 className="text-2xl font-medium text-zinc-900 dark:text-white">Choose Broker, Prop Firm or Trading Platform</h3>
        <p className="text-zinc-500">Select the platform you want to connect to Ryzen.</p>
      </div>

      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input 
          type="text" 
          placeholder="Start typing the broker, prop firm or trading platform"
          className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div>
        <h4 className="text-sm font-medium text-zinc-500 mb-4 uppercase tracking-wider text-xs">Popular Brokers</h4>
        <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto">
          {brokers.map(broker => (
            <button 
              key={broker.id}
              onClick={() => { setSelectedBroker(broker.name); setStep('import-method'); }}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-left"
            >
              <div className={`w-8 h-8 rounded-full ${broker.color} text-white flex items-center justify-center font-bold text-xs`}>
                {broker.icon}
              </div>
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-200">{broker.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // Render Step: Import Method
  const renderImportMethod = () => (
    <div className="text-center space-y-8">
      <div>
         <div className={`w-12 h-12 rounded-xl mx-auto flex items-center justify-center font-bold text-white text-lg mb-4 ${selectedBroker === 'MetaTrader 4' ? 'bg-emerald-600' : 'bg-blue-600'}`}>
            {selectedBroker?.includes('4') ? 'M4' : 'M5'}
         </div>
         <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">You're linking <span className="text-zinc-900 dark:text-white">{selectedBroker}</span></p>
         <h3 className="text-2xl font-medium text-zinc-900 dark:text-white">Select Import Method</h3>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <button 
          onClick={() => setStep('sync-form')}
          className="group relative p-6 rounded-xl border-2 border-zinc-900 dark:border-white/20 bg-zinc-50 dark:bg-zinc-900/50 flex flex-col items-center gap-4 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
        >
          <div className="absolute top-3 left-3 px-1.5 py-0.5 bg-blue-500 text-white text-[9px] font-bold rounded">Recommended</div>
          <div className="w-12 h-12 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center group-hover:scale-110 transition-transform">
             <Server size={20} className="text-zinc-700 dark:text-zinc-300" />
          </div>
          <div>
             <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Auto-sync</h4>
             <p className="text-[10px] text-zinc-500 mt-1">Connect your broker directly</p>
          </div>
        </button>

        <button className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent flex flex-col items-center gap-4 hover:border-zinc-300 dark:hover:border-zinc-600 transition-all opacity-70 hover:opacity-100">
           <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800/50 flex items-center justify-center">
             <Upload size={20} className="text-zinc-500" />
          </div>
          <div>
             <h4 className="text-sm font-medium text-zinc-900 dark:text-white">File upload</h4>
             <p className="text-[10px] text-zinc-500 mt-1">Upload broker-provided file</p>
          </div>
        </button>

        <button className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent flex flex-col items-center gap-4 hover:border-zinc-300 dark:hover:border-zinc-600 transition-all opacity-70 hover:opacity-100">
           <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800/50 flex items-center justify-center">
             <Plus size={20} className="text-zinc-500" />
          </div>
          <div>
             <h4 className="text-sm font-medium text-zinc-900 dark:text-white">Add manually</h4>
             <p className="text-[10px] text-zinc-500 mt-1">Add trades one by one</p>
          </div>
        </button>
      </div>
    </div>
  );

  // Render Step: Sync Form
  const renderSyncForm = () => (
    <div className="flex gap-8 h-full">
       <div className="flex-1 space-y-6">
          <div className="space-y-4">
             <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1.5">Start date</label>
                <BasicDropdown 
                  label="Select Date Range"
                  items={START_DATE_OPTIONS}
                  selectedValue={startDate}
                  onChange={(item) => setStartDate(item.id as string)}
                  className="w-full"
                />
             </div>
             
             <div>
                <div className="flex justify-between mb-1.5">
                   <label className="block text-xs font-medium text-zinc-500">Server <span className="text-rose-500 text-[10px]">required</span></label>
                </div>
                <input 
                   type="text" 
                   value={server}
                   onChange={(e) => setServer(e.target.value)}
                   className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600"
                />
             </div>

             <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1.5">Login <span className="text-rose-500 text-[10px]">*</span></label>
                <input 
                   type="text" 
                   value={login}
                   onChange={(e) => setLogin(e.target.value)}
                   className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600"
                />
             </div>

             <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1.5">Password <span className="text-rose-500 text-[10px]">*</span></label>
                <input 
                   type="password" 
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600"
                />
             </div>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-lg flex gap-3 items-start">
             <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
             <p className="text-xs text-amber-600 dark:text-amber-500 leading-relaxed">
                This import has limitations. Please ensure you are using the Investor Password (read-only) for security purposes.
             </p>
          </div>

          <button 
            onClick={handleConnect}
            disabled={!server || !login || !password || isConnecting}
            className={`w-full py-3 rounded-lg text-sm font-medium transition-all ${(!server || !login || !password) ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed' : 'bg-zinc-900 dark:bg-white text-white dark:text-black hover:opacity-90'}`}
          >
             {isConnecting ? 'Connecting...' : 'Connect'}
          </button>
       </div>

       <div className="w-px bg-zinc-200 dark:bg-zinc-800 mx-2 hidden md:block"></div>

       <div className="w-80 hidden md:block pl-2">
          <div className="flex items-center gap-2 mb-6">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-xs ${selectedBroker === 'MetaTrader 4' ? 'bg-emerald-600' : 'bg-blue-600'}`}>
                {selectedBroker?.includes('4') ? 'M4' : 'M5'}
              </div>
              <span className="font-medium text-zinc-900 dark:text-white">{selectedBroker}</span>
              <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-500 text-[9px] rounded font-bold uppercase">New</span>
          </div>

          <div className="space-y-6">
             <div>
                <p className="text-xs font-medium text-zinc-900 dark:text-white mb-2">Supported Asset Types:</p>
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                   {['Stocks', 'Futures', 'Options', 'Forex', 'Crypto', 'Cfd'].map(asset => (
                      <div key={asset} className="flex items-center gap-1.5 text-xs text-zinc-500">
                         <CheckCircle2 size={12} className="text-zinc-400" />
                         {asset}
                      </div>
                   ))}
                </div>
             </div>

             <div>
                <div className="flex justify-between items-center mb-4">
                   <p className="text-xs font-medium text-zinc-900 dark:text-white">Linking {selectedBroker}</p>
                   <span className="text-[10px] text-zinc-500 underline cursor-pointer">Integration Guide</span>
                </div>
                
                <ul className="space-y-4">
                   <li className="flex gap-3 text-xs text-zinc-500 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700 mt-1.5 shrink-0"></span>
                      1. Select your Broker
                   </li>
                   <li className="flex gap-3 text-xs text-zinc-500 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700 mt-1.5 shrink-0"></span>
                      2. Input your Server. Your server can be found on the MetaTrader login window or from your account email.
                   </li>
                   <li className="flex gap-3 text-xs text-zinc-500 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700 mt-1.5 shrink-0"></span>
                      3. Input your Username or Account Number (Only numbers are allowed).
                   </li>
                   <li className="flex gap-3 text-xs text-zinc-500 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700 mt-1.5 shrink-0"></span>
                      4. Input your Investor Password. This is your read-only password.
                   </li>
                </ul>
             </div>
          </div>
       </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70" 
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-8 py-5 border-b border-zinc-100 dark:border-white/5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            {step !== 'list' && (
              <button onClick={handleBack} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors text-zinc-500">
                <ChevronLeft size={20} />
              </button>
            )}
            <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-widest">
              {step === 'list' && 'Accounts'}
              {step === 'broker-select' && 'Add Trades'}
              {step === 'import-method' && 'Add Trades'}
              {step === 'sync-form' && 'Add Trades'}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Progress Bar for Steps (Optional visually, but good for context) */}
        {step !== 'list' && (
           <div className="w-full h-1 bg-zinc-100 dark:bg-zinc-900">
              <div 
                className="h-full bg-indigo-500 transition-all duration-300"
                style={{ width: step === 'broker-select' ? '33%' : step === 'import-method' ? '66%' : '100%' }}
              ></div>
           </div>
        )}

        {/* Modal Body */}
        <div className="p-8 overflow-y-auto flex-1">
          {step === 'list' && renderList()}
          {step === 'broker-select' && renderBrokerSelect()}
          {step === 'import-method' && renderImportMethod()}
          {step === 'sync-form' && renderSyncForm()}
        </div>
      </div>
    </div>
  );
};

export default AccountManagerModal;
