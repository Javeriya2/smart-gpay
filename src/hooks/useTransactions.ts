import { useEffect, useMemo } from 'react';
import { useTransactionStore } from '../store/transactionStore';
import { useUserStore } from '../store/userStore';

export const useTransactions = () => {
  const userId = useUserStore((state) => state.user.userId);
  const transactionStore = useTransactionStore();

  useEffect(() => {
    if (userId) {
      transactionStore.fetchTransactions(userId);
    }
  }, [userId]);

  const filteredTransactions = useMemo(() => {
    const { transactions, filterType } = transactionStore;
    if (filterType === 'sent') return transactions.filter((t) => t.type === 'SENT' || t.type === 'BILL_PAY');
    if (filterType === 'received') return transactions.filter((t) => t.type === 'RECEIVED');
    return transactions;
  }, [transactionStore.transactions, transactionStore.filterType]);

  return {
    ...transactionStore,
    filteredTransactions,
  };
};
