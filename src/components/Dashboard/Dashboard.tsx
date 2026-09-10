import React from 'react';
import { BalanceCard } from './BalanceCard';
import { StatsRow } from './StatsRow';
import { SpendingChart } from './SpendingChart';
import { TransactionList } from './TransactionList';
import { QuickActions } from './QuickActions';
import { ContactAvatar } from '../Common/ContactAvatar';
import { useUserStore } from '../../store/userStore';
import { useTransactionStore } from '../../store/transactionStore';
import { useContactStore } from '../../store/contactStore';
import { useUIStore } from '../../store/uiStore';
import { useBalance } from '../../hooks/useBalance';
import { Transaction } from '../../types/models';
import { Sparkles, Plus, Send } from 'lucide-react';
import { ReportService } from '../../services/ReportService';

export interface DashboardProps {
  userId: number;
  onPaymentClick: () => void;
  onTransactionClick?: (transactionId: number) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  userId,
  onPaymentClick,
  onTransactionClick,
}) => {
  const { user } = useUserStore();
  const { balance, isRefreshing, refreshBalance } = useBalance();
  const { transactions, filterType, setFilterType, setSelectedTransaction } = useTransactionStore();
  const { frequentContacts } = useContactStore();
   const { addToast, setActiveTab } = useUIStore();

  if (!user) {
    return null;
  }

  const now = new Date();

  
const totalSentThisMonth = transactions
  .filter((t) => {
    const transactionDate = new Date(t.timestamp);

    return (
      (t.type === 'SENT' || t.type === 'BILL_PAY') &&
      t.status === 'SUCCESS' &&
      transactionDate.getMonth() === now.getMonth() &&
      transactionDate.getFullYear() === now.getFullYear()
    );
  })
  .reduce((acc, curr) => acc + curr.amount, 0);

  const transactionsToday = transactions.filter((t) => {
  const today = new Date().toDateString();
  const transactionDate = new Date(t.timestamp).toDateString();

  return (
    transactionDate === today &&
    t.type === 'SENT' &&
    t.status === 'SUCCESS'
  );
}).length;

  const handleTxnClick = (txn: Transaction) => {
    setSelectedTransaction(txn);
    if (onTransactionClick) {
      onTransactionClick(txn.id);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Greeting Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-heading">
            Welcome back, {user.name.split(' ')[0]} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Smart GPay AI Assistant is active and ready for commands.
          </p>
        </div>

        <button
          onClick={onPaymentClick}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary text-white font-bold text-sm hover:bg-primary-700 shadow-md shadow-primary-500/20 transition self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>New AI Payment</span>
        </button>
      </div>

      {/* Balance Card Hero */}
     <BalanceCard
  balance={balance}
  upiId={user.upiId}
  onRefresh={refreshBalance}
  isRefreshing={isRefreshing}
  onSendClick={onPaymentClick}
/>

      {/* Quick Stats Row */}
      <StatsRow 
  totalSentThisMonth={totalSentThisMonth} 
  frequentPayeesCount={frequentContacts.length} 
  transactionsTodayCount={transactionsToday} 
/>

   <QuickActions
  onPaymentClick={() => setActiveTab('payment')}
  onReportsClick={async () => {
  addToast({
    type: 'info',
    message: '📄 Your report is being generated. This may take a few minutes. Please wait...',
  });

  try {
    await ReportService.generateUserReport(userId);

    addToast({
      type: 'success',
      message: '✅ Your report has been generated successfully!',
    });
  } catch (error) {
    console.error('Report generation failed:', error);

    addToast({
      type: 'error',
      message: '⚠️ We couldn’t generate your report. Please try again.',
    });
  }
}}
/>

      {/* Frequent Contacts Row */}
      {frequentContacts.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Frequent Payees</h4>
            <button
              onClick={() => setActiveTab('payment')}
              className="text-xs font-semibold text-primary hover:underline"
            >
              View All
            </button>
          </div>

          <div className="flex items-center space-x-4 overflow-x-auto pb-2 scrollbar-none">
            {frequentContacts.map((contact) => (
              <button
                key={contact.id}
                onClick={onPaymentClick}
                className="flex flex-col items-center space-y-1.5 min-w-[72px] group"
              >
                <div className="relative">
                  <ContactAvatar name={contact.name} avatarUrl={contact.avatar} size="lg" />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center border-2 border-white dark:border-slate-900 shadow">
                    <Send className="w-2.5 h-2.5" />
                  </div>
                </div>
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate max-w-[80px] group-hover:text-primary transition">
                  {contact.alias || contact.name.split(' ')[0]}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Spending Analytics Chart */}
      <SpendingChart transactions={transactions} />

      {/* Recent Transactions List */}
      <TransactionList
        transactions={transactions}
        filterType={filterType}
        onFilterChange={setFilterType}
        onTransactionClick={handleTxnClick}
      />
    </div>
  );
};
