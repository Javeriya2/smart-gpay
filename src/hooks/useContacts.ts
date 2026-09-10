import { useEffect } from 'react';
import { useContactStore } from '../store/contactStore';
import { useUserStore } from '../store/userStore';

export const useContacts = () => {
  const userId = useUserStore((state) => state.user.userId);
  const contactStore = useContactStore();

  useEffect(() => {
    if (userId) {
      contactStore.fetchContacts(userId);
      contactStore.fetchFrequentContacts(userId);
    }
  }, [userId]);

  return contactStore;
};
