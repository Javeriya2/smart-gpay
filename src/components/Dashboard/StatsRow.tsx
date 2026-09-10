import React from 'react';
import { ArrowUpRight, Users, Clock } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export interface StatsRowProps {
  totalSentThisMonth: number;
  frequentPayeesCount: number;
  transactionsTodayCount: number;
}

export const StatsRow: React.FC<StatsRowProps> = ({
  totalSentThisMonth,
  frequentPayeesCount,
  transactionsTodayCount,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Total Sent */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-2">
        <div className="flex justify-between items-center text-slate-400 dark:text-slate-500">
<span className="text-xs font-semibold uppercase tracking-wider">
  Total Sent ({new Date().toLocaleString('en-US', { month: 'short' })})
</span>
          <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-primary">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
          {formatCurrency(totalSentThisMonth)}
        </p>
      </div>

      {/* Payees */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-2">
        <div className="flex justify-between items-center text-slate-400 dark:text-slate-500">
          <span className="text-xs font-semibold uppercase tracking-wider">Frequent Payees</span>
          <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
          {frequentPayeesCount} Contacts
        </p>
      </div>

      {/* Transactions Today */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-2">
        <div className="flex justify-between items-center text-slate-400 dark:text-slate-500">
          <span className="text-xs font-semibold uppercase tracking-wider">Sent Today</span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
          {transactionsTodayCount} Transactions
        </p>
      </div>
    </div>
  );
};
