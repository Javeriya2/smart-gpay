import React from 'react';
import { Send, BarChart2 } from 'lucide-react';

export interface QuickActionsProps {
  onPaymentClick: () => void;
  onReportsClick: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onPaymentClick,
  onReportsClick,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
        Quick Actions
      </h4>

      <div className="grid grid-cols-2 gap-3 text-center">
        <button
          onClick={onPaymentClick}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-primary-50 dark:bg-primary-950/40 text-primary hover:bg-primary-100 transition group"
        >
          <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center mb-1.5 shadow-md shadow-primary-500/20 group-hover:scale-105 transition">
            <Send className="w-5 h-5" />
          </div>

          <span className="text-xs font-semibold">Send</span>
        </button>

        <button
          onClick={onReportsClick}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 transition group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-1.5 shadow-md shadow-emerald-500/20 group-hover:scale-105 transition">
            <BarChart2 className="w-5 h-5" />
          </div>

          <span className="text-xs font-semibold">Reports</span>
        </button>
      </div>
    </div>
  );
};