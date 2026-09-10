import { create } from 'zustand';
import { Contact } from '../types/models';
import { ContactService } from '../services/ContactService';

interface ContactState {
  contacts: Contact[];
  frequentContacts: Contact[];
  isLoading: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  fetchContacts: (userId: number) => Promise<void>;
  fetchFrequentContacts: (userId: number) => Promise<void>;
}

export const useContactStore = create<ContactState>((set) => ({
  contacts: [],
  frequentContacts: [],
  isLoading: false,
  searchQuery: '',
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  fetchContacts: async (userId) => {
    set({ isLoading: true });
    try {
      const contacts = await ContactService.getUserContacts(userId);
      set({ contacts, isLoading: false });
    } catch (e) {
      set({ isLoading: false });
    }
  },
  fetchFrequentContacts: async (userId) => {
    try {
      const frequentContacts = await ContactService.getFrequentPayees(userId, 5);
      set({ frequentContacts });
    } catch (e) {}
  },
}));
