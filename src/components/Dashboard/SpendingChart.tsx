import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { categoryColors } from '../../utils/colors';
import { formatCurrency } from '../../utils/formatters';

import { Transaction } from '../../types/models';

export interface SpendingChartProps {
  transactions: Transaction[];
}

export const SpendingChart: React.FC<SpendingChartProps> = ({ transactions }) => {
    const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

 const now = new Date();
const startDate = new Date(now);

if (timeRange === 'week') {
  startDate.setDate(now.getDate() - 7);
} else if (timeRange === 'month') {
  startDate.setDate(1);
  startDate.setHours(0, 0, 0, 0);
} else {
  startDate.setMonth(0, 1);
  startDate.setHours(0, 0, 0, 0);
}

const filteredTransactions = transactions.filter(
  (transaction) =>
    transaction.type === 'SENT' &&
    transaction.status === 'SUCCESS' &&
    new Date(transaction.timestamp) >= startDate &&
    new Date(transaction.timestamp) <= now
);

const spendingByRecipient = filteredTransactions.reduce(
  (acc, transaction) => {
    acc[transaction.recipientName] =
      (acc[transaction.recipientName] || 0) + transaction.amount;

    return acc;
  },
  {} as Record<string, number>
);

const chartData = Object.entries(spendingByRecipient)
  .map(([category, amount]) => ({
    category,
    amount,
  }))
  .sort((a, b) => b.amount - a.amount);

  const totalSpent = chartData.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white font-heading">
            Spending Analytics
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
           Spending by recipient ({timeRange})
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-medium self-start sm:self-auto">
          {(['week', 'month', 'year'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-lg capitalize transition ${
                timeRange === range
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center pt-2">
        {/* Pie Chart */}
        <div className="h-56 relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={4}
                dataKey="amount"
                nameKey="category"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                   fill={`hsl(${(index * 60) % 360}, 70%, 55%)`}
                  />
                ))}
              </Pie>
             <Tooltip
  formatter={(value: any) => [formatCurrency(Number(value)), 'Amount']}
  contentStyle={{
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderRadius: '12px',
    color: '#FFF',
    fontSize: '12px',
  }}
  itemStyle={{ color: '#FFF' }}
/> <Tooltip
                formatter={(value: any) => [formatCurrency(Number(value)), 'Amount']}
                contentStyle={{
                  backgroundColor: '#1E293B',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#FFF',
                  fontSize: '12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Center text in donut chart */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Total</span>
            <span className="text-base font-bold font-mono text-slate-900 dark:text-white">
              {formatCurrency(totalSpent)}
            </span>
          </div>
        </div>

        {/* Category List Details */}
        <div className="space-y-2.5">
          {chartData.map((item, idx) => {
            const percentage = totalSpent > 0 ? Math.round((item.amount / totalSpent) * 100) : 0;
            const color = `hsl(${(idx * 60) % 360}, 70%, 55%)`;

            return (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2.5">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                  <span className="font-semibold text-slate-700 dark:text-slate-200">{item.category}</span>
                </div>
                <div className="flex items-center space-x-3 font-mono">
                  <span className="text-slate-400 text-[11px]">{percentage}%</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{formatCurrency(item.amount)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
