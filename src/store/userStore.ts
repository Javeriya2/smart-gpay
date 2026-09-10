import { create } from 'zustand';
import { UserProfile } from '../types/models';
import { UserService } from '../services/UserService';
import { useContactStore } from './contactStore';
import { useTransactionStore } from './transactionStore';

const USER_STORAGE_KEY = 'smartgpay_active_user';

const getInitialUser = (): UserProfile | null => {
  try {
    const saved = localStorage.getItem(USER_STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    return null;
  }
};

interface UserState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isDarkMode: boolean;
  isLoading: boolean;
  loginUser: (profile: UserProfile) => void;
  logoutUser: () => void;
  updateBalance: (newBalance: number) => void;
  toggleDarkMode: () => void;
  refreshBalance: () => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => {
  const initialUser = getInitialUser();

  return {
    user: initialUser,
    isAuthenticated: !!initialUser,
    isDarkMode: true,
    isLoading: false,

    loginUser: (profile: UserProfile) => {
      try {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(profile));
      } catch (e) {}

      set({ user: profile, isAuthenticated: true });

      // Refresh contacts and transactions for signed-in user ID
      useContactStore.getState().fetchContacts(profile.userId);
      useContactStore.getState().fetchFrequentContacts(profile.userId);
      useTransactionStore.getState().fetchTransactions(profile.userId);
    },

    logoutUser: () => {
      try {
        localStorage.removeItem(USER_STORAGE_KEY);
      } catch (e) {}
      set({ user: null, isAuthenticated: false });
    },

    updateBalance: (newBalance: number) =>
      set((state) => {
        if (!state.user) return state;
        const updated = { ...state.user, balance: newBalance };
        try {
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated));
        } catch (e) {}
        return { user: updated };
      }),

    toggleDarkMode: () =>
      set((state) => {
        const nextMode = !state.isDarkMode;
        if (nextMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        return { isDarkMode: nextMode };
      }),

    refreshBalance: async () => {
      const currentUser = get().user;
      if (!currentUser) return;
      try {
        const balance = await UserService.getUserBalance(currentUser.userId);
        get().updateBalance(balance);
      } catch (e) {}
    },
  };
});
