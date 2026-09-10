import { create } from 'zustand';
import { Transaction, TransactionType } from '../types/models';
import { TransactionService } from '../services/TransactionService';

interface TransactionState {
  transactions: Transaction[];
  filterType: 'all' | 'sent' | 'received';
  isLoading: boolean;
  selectedTransaction: Transaction | null;
  setFilterType: (filter: 'all' | 'sent' | 'received') => void;
  setSelectedTransaction: (txn: Transaction | null) => void;
  fetchTransactions: (userId: number) => Promise<void>;
  addTransaction: (txn: Transaction) => void;
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  filterType: 'all',
  isLoading: false,
  selectedTransaction: null,
  setFilterType: (filterType) => set({ filterType }),
  setSelectedTransaction: (selectedTransaction) => set({ selectedTransaction }),
  fetchTransactions: async (userId) => {
    set({ isLoading: true });
    try {
      const transactions = await TransactionService.getUserTransactions(userId);
      set({ transactions, isLoading: false });
    } catch (e) {
      set({ isLoading: false });
    }
  },
  addTransaction: (newTxn) =>
    set((state) => ({
      transactions: [newTxn, ...state.transactions],
    })),
}));
