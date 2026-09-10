import { apiClient } from './api';
import { Transaction } from '../types/models';
import { logger } from '../utils/logger';

export class TransactionService {
  /**
   * Fetch transaction history for a user via GET /api/transaction/user/:userId
   */
  static async getUserTransactions(userId: number): Promise<Transaction[]> {
    try {
     const response = await apiClient.get<Transaction[]>(`/transactions/user/${userId}`);
      return response.data;
    } catch (error: any) {
     logger.warn('Backend transaction fetch failed, returning mock transactions:', error.message);
     throw error;
    }
  }

  /**
   * Fetch transaction by transaction ID
   */
  static async getTransactionById(txnId: string): Promise<Transaction | null> {
    try {
      const response = await apiClient.get<Transaction>(`/transaction/${txnId}`);
      return response.data;
    } catch (error: any) {
       logger.warn('Backend transaction lookup failed:', error.message);
  throw error;
    }
  }
}
