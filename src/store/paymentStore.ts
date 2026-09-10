import { create } from 'zustand';
import { Transaction, Contact, ErrorCode } from '../types/models';
import { PaymentService } from '../services/PaymentService';
import { useUserStore } from './userStore';
import { AppError, parseApiError } from '../utils/errorHandler';

interface PaymentState {
  userMessage: string;
  isProcessing: boolean;
  activeTransaction: Transaction | null;
  ambiguousContacts: Contact[] | null;
  clarificationTransactionId?: number;
clarificationOriginalRequestId?: string;
  originalMessage: string;
  currentError: AppError | null;
  retryCount: number;

  setUserMessage: (msg: string) => void;
  resetPaymentState: () => void;
  processPaymentPrompt: (userId: number, prompt: string) => Promise<boolean>;
  selectAmbiguousContact: (
  userId: number,
  contactId: number,
  transactionId: number,
  originalRequestId: string
) => Promise<boolean>;
  retryPayment: (userId: number) => Promise<boolean>;
  proceedWithFraudWarning: (userId: number) => Promise<boolean>;
}

export const usePaymentStore = create<PaymentState>((set, get) => ({
  userMessage: '',
  isProcessing: false,
  activeTransaction: null,
  ambiguousContacts: null,
  originalMessage: '',
  currentError: null,
  retryCount: 0,

  setUserMessage: (userMessage) => set({ userMessage }),

  resetPaymentState: () =>
    set({
      userMessage: '',
      isProcessing: false,
      activeTransaction: null,
      ambiguousContacts: null,
      originalMessage: '',
      currentError: null,
      retryCount: 0,
    }),

  processPaymentPrompt: async (userId, message) => {
    set({ isProcessing: true, currentError: null, originalMessage: message });
    try {
      const response = await PaymentService.processPayment({ userId, message });

      if (response.status === 'SUCCESS' && response.transaction) {
        if (response.newBalance !== undefined) {
          useUserStore.getState().updateBalance(response.newBalance);
        }
        set({
          isProcessing: false,
          activeTransaction: response.transaction,
          ambiguousContacts: null,
          userMessage: '',
        });
        return true;
      } else if (response.status === 'AMBIGUOUS' && response.ambiguousContacts) {
      set({
  isProcessing: false,
  ambiguousContacts: response.ambiguousContacts,
  clarificationTransactionId: response.transactionId,
  clarificationOriginalRequestId: response.originalRequestId,
});
        return false;
      } else {
        const error: AppError = {
          code: response.errorCode || 'VALIDATION_FAILED',
          title: response.errorMessage || 'Payment Failed',
          message: response.errorMessage || 'Transaction could not be completed.',
          details: response.errorDetails,
          suggestions: response.suggestions,
        };
        set({
          isProcessing: false,
          currentError: error,
        });
        return false;
      }
    } catch (err: any) {
      const appErr = parseApiError(err);
      set({
        isProcessing: false,
        currentError: appErr,
      });
      return false;
    }
  },

  selectAmbiguousContact: async (
  userId,
  contactId,
  transactionId,
  originalRequestId
) => {
    const originalMessage = get().originalMessage || get().userMessage;
    set({ isProcessing: true, ambiguousContacts: null });

    try {
   const response = await PaymentService.clarifyContact(
  userId,
  originalMessage,
  contactId,
  get().clarificationTransactionId!,
  get().clarificationOriginalRequestId!
);
      if (response.status === 'SUCCESS' && response.transaction) {
        if (response.newBalance !== undefined) {
          useUserStore.getState().updateBalance(response.newBalance);
        }
        set({
          isProcessing: false,
          activeTransaction: response.transaction,
          userMessage: '',
        });
        return true;
      } else {
        set({
          isProcessing: false,
          currentError: {
            code: response.errorCode || 'VALIDATION_FAILED',
            title: 'Clarification Failed',
            message: response.errorMessage || 'Could not clarify contact.',
            suggestions: response.suggestions,
          },
        });
        return false;
      }
    } catch (err) {
      set({
        isProcessing: false,
        currentError: parseApiError(err),
      });
      return false;
    }
  },

  retryPayment: async (userId) => {
    const currentRetries = get().retryCount;
    if (currentRetries >= 3) {
      return false;
    }

    set({ retryCount: currentRetries + 1 });
    const msg = get().originalMessage || get().userMessage;
    return get().processPaymentPrompt(userId, msg);
  },
    proceedWithFraudWarning: async (userId) => {
    const currentError = get().currentError;

    if (!currentError || currentError.code !== 'FRAUD_FLAG') {
      return false;
    }

    const message = get().originalMessage || get().userMessage;

    set({
      isProcessing: true,
      currentError: null,
    });

    try {
      const response = await PaymentService.processPayment({
        userId,
        message,
        confirmFraudWarning: true,
        transactionId: currentError.details?.transactionId,
        originalRequestId: currentError.details?.originalRequestId,
      });

      if (response.status === 'SUCCESS' && response.transaction) {
        if (response.newBalance !== undefined) {
          useUserStore.getState().updateBalance(response.newBalance);
        }

        set({
          isProcessing: false,
          activeTransaction: response.transaction,
          ambiguousContacts: null,
          userMessage: '',
          currentError: null,
        });

        return true;
      }

      const error: AppError = {
        code: response.errorCode || 'VALIDATION_FAILED',
        title: response.errorMessage || 'Payment Failed',
        message: response.errorMessage || 'Transaction could not be completed.',
        details: response.errorDetails,
        suggestions: response.suggestions,
      };

      set({
        isProcessing: false,
        currentError: error,
      });

      return false;
    } catch (err: any) {
      set({
        isProcessing: false,
        currentError: parseApiError(err),
      });

      return false;
    }
  },
}));
