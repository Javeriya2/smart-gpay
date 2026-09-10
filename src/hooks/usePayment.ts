import { usePaymentStore } from '../store/paymentStore';
import { useUserStore } from '../store/userStore';

export const usePayment = () => {
  const user = useUserStore((state) => state.user);
  const paymentStore = usePaymentStore();

  const handlePaymentSubmit = async (message: string) => {
    return paymentStore.processPaymentPrompt(user.userId, message);
  };

  const handleSelectAmbiguous = async (contactId: number) => {
    return paymentStore.selectAmbiguousContact(user.userId, contactId);
  };

  const handleRetry = async () => {
    return paymentStore.retryPayment(user.userId);
  };

  return {
    ...paymentStore,
    submitPayment: handlePaymentSubmit,
    selectContact: handleSelectAmbiguous,
    retry: handleRetry,
  };
};
