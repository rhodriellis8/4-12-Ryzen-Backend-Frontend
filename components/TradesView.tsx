
import React, { useState, useEffect, useRef } from 'react';
import { ArrowUpRight, ArrowDownRight, Search, Filter, Calendar as CalendarIcon, ChevronDown } from 'lucide-react';

interface Trade {
  id: string;
  symbol: string;
  tvSymbol: string; // TradingView symbol
  type: 'Long' | 'Short';
  entryDate: string;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  pnl: number;
  status: 'Win' | 'Loss' | 'Breakeven';
}

const dummyTrades: Trade[] = [
  { id: 'T-1024', symbol: 'ES Futures', tvSymbol: 'CME_MINI:ES1!', type: 'Long', entryDate: '2024-09-24 10:42', entryPrice: 4150.25, exitPrice: 4162.75, quantity: 2, pnl: 1250.00, status: 'Win' },
  { id: 'T-1023', symbol: 'NQ Futures', tvSymbol: 'CME_MINI:NQ1!', type: 'Short', entryDate: '2024-09-23 14:15', entryPrice: 14520.50, exitPrice: 14550.00, quantity: 1, pnl: -590.00, status: 'Loss' },
  { id: 'T-1022', symbol: 'AAPL', tvSymbol: 'NASDAQ:AAPL', type: 'Long', entryDate: '2024-09-22 09:35', entryPrice: 175.50, exitPrice: 178.20, quantity: 100, pnl: 270.00, status: 'Win' },
  { id: 'T-1021', symbol: 'BTCUSD', tvSymbol: 'COINBASE:BTCUSD', type: 'Long', entryDate: '2024-09-21 18:20', entryPrice: 26500, exitPrice: 26800, quantity: 0.5, pnl: 150.00, status: 'Win' },
  { id: 'T-1020', symbol: 'EURUSD', tvSymbol: 'FX:EURUSD', type: 'Short', entryDate: '2024-09-20 08:00', entryPrice: 1.0650, exitPrice: 1.0640, quantity: 100000, pnl: 100.00, status: 'Win' },
  { id: 'T-1019', symbol: 'NVDA', tvSymbol: 'NASDAQ:NVDA', type: 'Long', entryDate: '2024-09-19 11:30', entryPrice: 420.10, exitPrice: 418.50, quantity: 50, pnl: -80.00, status: 'Loss' },
];

declare global {
  interface Window {
    TradingView: any;
  }
}

const TradesView: React.FC = () => {
  const [selectedTrade, setSelectedTrade] = useState<Trade>(dummyTrades[0]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Dynamically load the TradingView script if not already present
    if (!document.getElementById('tradingview-widget-script')) {
      const script = document.createElement('script');
      script.id = 'tradingview-widget-script';
      script.src = 'https://s3.tradingview.com/tv.js';
      script.async = true;
      script.onload = () => initWidget();
      document.head.appendChild(script);
    } else {
      initWidget();
    }

    function initWidget() {
      if (window.TradingView && containerRef.current) {
        new window.TradingView.widget({
          autosize: true,
          symbol: selectedTrade.tvSymbol,
          interval: "D",
          timezone: "Etc/UTC",
          theme: document.documentElement.classList.contains('dark') ? "dark" : "light",
          style: "1",
          locale: "en",
          enable_publishing: false,
          allow_symbol_change: true,
          container_id: containerRef.current.id,
          hide_side_toolbar: false,
        });
      }
    }
  }, [selectedTrade]); // Re-run when selected trade changes

  return (
    <div className="h-[calc(100vh-140px)] flex gap-6">
      
      {/* Trade Log List */}
      <div className="w-1/3 flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-zinc-200 dark:border-white/5 bg-zinc-50 dark:bg-zinc-900/50 flex gap-2">
            <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input 
                    type="text" 
                    placeholder="Search Symbol..." 
                    className="w-full pl-9 pr-4 py-2 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                />
            </div>
            <button className="p-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 bg-white dark:bg-black">
                <Filter size={16} />
            </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-zinc-50 dark:bg-zinc-950 sticky top-0 z-10">
                    <tr>
                        <th className="px-4 py-3 font-medium text-zinc-500 text-xs">Symbol</th>
                        <th className="px-4 py-3 font-medium text-zinc-500 text-xs">P&L</th>
                        <th className="px-4 py-3 font-medium text-zinc-500 text-xs text-right">Date</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
                    {dummyTrades.map(trade => (
                        <tr 
                            key={trade.id} 
                            onClick={() => setSelectedTrade(trade)}
                            className={`cursor-pointer transition-colors hover:bg-zinc-50 dark:hover:bg-white/5 ${selectedTrade.id === trade.id ? 'bg-zinc-100 dark:bg-white/10' : ''}`}
                        >
                            <td className="px-4 py-3">
                                <div className="flex flex-col">
                                    <span className="font-medium text-zinc-900 dark:text-zinc-200">{trade.symbol}</span>
                                    <span className={`text-[10px] inline-flex items-center gap-1 ${trade.type === 'Long' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        {trade.type} {trade.type === 'Long' ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                                    </span>
                                </div>
                            </td>
                            <td className="px-4 py-3">
                                <span className={`font-mono font-medium ${trade.pnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {trade.pnl >= 0 ? '+' : ''}${Math.abs(trade.pnl).toFixed(2)}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                                <div className="flex flex-col items-end">
                                    <span className="text-zinc-700 dark:text-zinc-300">{trade.entryDate.split(' ')[0]}</span>
                                    <span className="text-[10px] text-zinc-500">{trade.entryDate.split(' ')[1]}</span>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>

      {/* Detail / Chart Area */}
      <div className="flex-1 flex flex-col gap-6">
        {/* Stats Row */}
        <div className="flex gap-4">
            <div className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl p-4 flex justify-between items-center shadow-sm">
                <div>
                    <p className="text-xs text-zinc-500">Entry Price</p>
                    <p className="text-lg font-mono font-medium text-zinc-900 dark:text-white">{selectedTrade.entryPrice}</p>
                </div>
            </div>
            <div className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl p-4 flex justify-between items-center shadow-sm">
                <div>
                    <p className="text-xs text-zinc-500">Exit Price</p>
                    <p className="text-lg font-mono font-medium text-zinc-900 dark:text-white">{selectedTrade.exitPrice}</p>
                </div>
            </div>
            <div className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl p-4 flex justify-between items-center shadow-sm">
                <div>
                    <p className="text-xs text-zinc-500">Net P&L</p>
                    <p className={`text-lg font-mono font-medium ${selectedTrade.pnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {selectedTrade.pnl >= 0 ? '+' : ''}${selectedTrade.pnl}
                    </p>
                </div>
            </div>
        </div>

        {/* Chart Container */}
        <div className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl overflow-hidden shadow-sm relative">
            <div id="tradingview_widget" ref={containerRef} className="w-full h-full min-h-[400px]"></div>
            
            {/* Overlay if needed or just let TV widget take over */}
            {!window.TradingView && (
                <div className="absolute inset-0 flex items-center justify-center text-zinc-500 bg-zinc-50 dark:bg-zinc-900">
                    Loading Chart...
                </div>
            )}
        </div>
      </div>

    </div>
  );
};

export default TradesView;
