import { create } from 'zustand';

export type ActiveTab = 'dashboard' | 'payment' | 'contacts' | 'transactions' | 'settings';
export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
  duration?: number;
}

interface UIState {
  activeTab: ActiveTab;
  toasts: ToastMessage[];
  setActiveTab: (tab: ActiveTab) => void;
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeTab: 'payment',
  toasts: [],
  setActiveTab: (activeTab) => set({ activeTab }),
  addToast: (toast) => {
    const id = Date.now().toString();
    const newToast: ToastMessage = { ...toast, id };
    set((state) => ({ toasts: [...state.toasts, newToast] }));

    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, toast.duration || 4000);
  },
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
