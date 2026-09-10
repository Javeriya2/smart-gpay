import React from 'react';
import { Transaction } from '../../types/models';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { ArrowUpRight, ArrowDownLeft, Receipt, CheckCircle2, Clock, XCircle } from 'lucide-react';

export interface TransactionListProps {
  transactions: Transaction[];
  filterType: 'all' | 'sent' | 'received';
  onFilterChange: (filter: 'all' | 'sent' | 'received') => void;
  onTransactionClick?: (txn: Transaction) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  filterType,
  onFilterChange,
  onTransactionClick,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white font-heading">
            Recent Transactions
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time status of sent and received payments
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-medium self-start sm:self-auto">
          {(['all', 'sent', 'received'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => onFilterChange(filter)}
              className={`px-3 py-1.5 rounded-lg capitalize transition ${
                filterType === filter
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction Rows */}
      {transactions.length === 0 ? (
        <div className="text-center py-10 space-y-2">
          <Receipt className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No transactions found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {transactions.map((txn) => {
            const isReceived = txn.type === 'RECEIVED';

            return (
              <div
                key={txn.id}
                onClick={() => onTransactionClick && onTransactionClick(txn)}
                className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-slate-100 dark:border-slate-800 transition cursor-pointer group"
              >
                <div className="flex items-center space-x-3.5 min-w-0 flex-1">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                      isReceived
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                        : 'bg-blue-100 dark:bg-blue-950/60 text-primary'
                    }`}
                  >
                    {isReceived ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate group-hover:text-primary transition">
                        {txn.recipientName}
                      </h4>
                      {txn.category && (
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded font-medium">
                          {txn.category}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 font-mono truncate">{formatDate(txn.timestamp)}</p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <p
                    className={`font-bold font-mono text-sm ${
                      isReceived ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-100'
                    }`}
                  >
                    {isReceived ? '+' : '-'}{formatCurrency(txn.amount)}
                  </p>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                      txn.status === 'SUCCESS'
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                        : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400'
                    }`}
                  >
                    {txn.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
