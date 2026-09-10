import React, { useState } from 'react';
import { RefreshCw, Eye, EyeOff, Wallet, ArrowUpRight, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export interface BalanceCardProps {
  balance: number;
  upiId: string;
  onRefresh: () => void;
  isRefreshing: boolean;
  onSendClick: () => void;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  balance,
  upiId,
  onRefresh,
  isRefreshing,
  onSendClick,
}) => {
  const [showBalance, setShowBalance] = useState(true);

  return (
    <div className="bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
      {/* Decorative blurred backdrop glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
        <div>
          <div className="flex items-center space-x-2 text-blue-200 text-xs font-semibold uppercase tracking-wider">
            <Wallet className="w-4 h-4 text-blue-200" />
            <span>Primary Account Balance</span>
          </div>

          <div className="flex items-baseline space-x-3 mt-2">
            <h2 className="text-3xl sm:text-5xl font-extrabold font-mono tracking-tight">
              {showBalance ? formatCurrency(balance) : '••••••••'}
            </h2>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="p-1.5 hover:bg-white/10 rounded-lg transition text-blue-200 hover:text-white"
              title={showBalance ? 'Hide balance' : 'Show balance'}
            >
              {showBalance ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <p className="text-xs text-blue-200 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-300" />
<span>Connected Account (UPI ID: {upiId})</span>          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 transition disabled:opacity-50"
            title="Refresh balance"
          >
            <RefreshCw className={`w-5 h-5 text-white ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={onSendClick}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white text-primary font-bold text-sm hover:bg-blue-50 transition shadow-lg shadow-black/10 active:scale-95"
          >
            <span>Send Money</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
