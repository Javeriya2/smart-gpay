import { apiClient, processMockNLPayment } from './api';
import { PaymentProcessRequest, PaymentProcessResponse } from '../types/models';
import { logger } from '../utils/logger';

export class PaymentService {
  /**
   * Process NL payment prompt via POST /api/payment/process
   */
  static async processPayment(request: PaymentProcessRequest): Promise<PaymentProcessResponse> {
    const payload = {
      userId: request.userId,
      userMessage: request.message,
      selectedContactId: request.selectedContactId,
      confirmFraudWarning: request.confirmFraudWarning,
      transactionId: request.transactionId,
      originalRequestId: request.originalRequestId,
    };

    try {
      const response = await apiClient.post<any>('/payment/process', payload);
      const data = response.data;

      if (data.status === 'SUCCESS') {
        return {
          status: 'SUCCESS',
          transaction: {
            id: data.transactionId || Date.now(),
            txnId: `TXN-2026-${data.transactionId || Math.floor(100000 + Math.random() * 900000)}`,
            amount: data.amount || 0,
            recipientName: data.recipientName || 'Recipient',
recipientVPA: data.recipientVPA || 'payee@upi',
            senderUserId: request.userId,
            timestamp: new Date().toISOString(),
            status: 'SUCCESS',
            type: 'SENT',
            note: request.message,
          },
          newBalance: data.newBalance,
        };
        } else if (data.status === 'FRAUD_WARNING') {
  return {
    status: 'ERROR',
    errorCode: 'FRAUD_FLAG',
    errorMessage: data.message || 'Unusual amount for this recipient.',
    errorDetails: {
      transactionId: data.transactionId,
      originalRequestId: data.originalRequestId,
    },
  };
      } else if (data.status === 'AWAITING_CLARIFICATION' && data.ambiguousContacts) {
       return {
  status: 'AMBIGUOUS',
  transactionId: data.transactionId,
  originalRequestId: data.originalRequestId,
  ambiguousContacts: data.ambiguousContacts.map((c: any) => ({
            id: c.id,
            name: c.name,
            vpa: c.vpa,
            alias: c.alias,
          })),
          errorMessage: data.message,
        };
      } else {
        return {
          status: 'ERROR',
          errorCode: data.status === 'VALIDATION_FAILED' ? 'VALIDATION_FAILED' : 'INVALID_AMOUNT',
          errorMessage: data.message || 'Payment failed.',
        };
      }
    } catch (error: any) {
      logger.warn(
        'Spring Boot backend offline/unreachable on localhost:8080. Executing smart mock fallback:',
        error.message
      );
      await new Promise((resolve) => setTimeout(resolve, 300));
      return processMockNLPayment(
        request.userId,
        request.message,
        request.selectedContactId
      );
    }
  }

  /**
   * Clarify ambiguous contact choice via POST /api/payment/clarify
   */
 static async clarifyContact(
  userId: number,
  originalMessage: string,
  selectedContactId: number,
  transactionId: number,
  originalRequestId: string
): Promise<PaymentProcessResponse> {
    const payload = {
  selectedContactId,
  transactionId: transactionId.toString(),
  originalRequestId,
};

    try {
      const response = await apiClient.post<any>('/payment/clarify', payload);
      const data = response.data;

      if (data.status === 'SUCCESS') {
        return {
          status: 'SUCCESS',
          transaction: {
            id: data.transactionId || Date.now(),
            txnId: `TXN-2026-${data.transactionId || Math.floor(100000 + Math.random() * 900000)}`,
            amount: data.amount || 0,
            recipientName: data.recipientName || 'Recipient',
recipientVPA:
  data.recipientVPA ||
  (await apiClient.get<any>(`/contacts/${selectedContactId}`)).data.vpa,            senderUserId: userId,
            timestamp: new Date().toISOString(),
            status: 'SUCCESS',
            type: 'SENT',
            note: originalMessage,
          },
          newBalance: data.newBalance,
        };
      } else {
        return {
          status: 'ERROR',
          errorMessage: data.message || 'Clarification failed.',
        };
      }
    } catch (error: any) {
      logger.warn(
        'Spring Boot clarify endpoint offline, using mock fallback:',
        error.message
      );
      await new Promise((resolve) => setTimeout(resolve, 300));
      return processMockNLPayment(
        userId,
        originalMessage,
        selectedContactId
      );
    }
  }
}