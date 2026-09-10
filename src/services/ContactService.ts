import { apiClient } from './api';
import { Contact } from '../types/models';
import { logger } from '../utils/logger';

export class ContactService {
  /**
   * Fetch contacts for a specific user ID via GET /api/users/:userId/contacts
   */

    static async createContact(
    userId: number,
    name: string,
    vpa: string
  ): Promise<Contact> {
    const response = await apiClient.post('/contacts', {
      userId,
      name,
      vpa,
    });

    return {
      id: response.data.id,
      name: response.data.name,
      vpa: response.data.vpa,
    };
  }
  
  static async getUserContacts(userId: number): Promise<Contact[]> {
    try {
      const response = await apiClient.get<any[]>(`/users/${userId}/contacts`);
      if (Array.isArray(response.data)) {
        return response.data.map((c: any) => ({
          id: c.id,
          name: c.name,
          vpa: c.vpa,
          phone: c.phone,
          avatar: c.avatar,
          alias: c.alias,
          lastTransactionAmount: c.lastTransactionAmount || 500,
          lastTransactionDate: c.lastTransactionDate,
          frequency: c.frequency || 5,
        }));
      }
      return [];
    } catch (error: any) {
      logger.warn(`Backend contacts fetch for user ${userId} failed, returning mock contacts:`, error.message);
      return [];
    }
  }

  /**
   * Search contacts via GET /api/contacts/search?userId=:userId&name=:name
   */
  static async searchContacts(userId: number, query: string): Promise<Contact[]> {
    try {
      const response = await apiClient.get<any[]>(`/contacts/search`, {
        params: { userId, name: query },
      });
      if (Array.isArray(response.data)) {
        return response.data.map((c: any) => ({
          id: c.id,
          name: c.name,
          vpa: c.vpa,
        }));
      }
    } catch (e) {}

    const contacts = await this.getUserContacts(userId);
    const q = query.toLowerCase().trim();
    if (!q) return contacts;
    return contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.vpa.toLowerCase().includes(q) ||
        (c.alias && c.alias.toLowerCase().includes(q))
    );
  }

  /**
   * Get frequent payees
   */
  static async getFrequentPayees(userId: number, limit = 5): Promise<Contact[]> {
    const contacts = await this.getUserContacts(userId);
    return [...contacts]
      .sort((a, b) => (b.frequency || 0) - (a.frequency || 0))
      .slice(0, limit);
  }
}
