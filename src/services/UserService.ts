import { apiClient, MOCK_USER } from './api';
import { UserProfile } from '../types/models';
import { logger } from '../utils/logger';

export class UserService {
  /**
   * Fetch user profile via GET /api/users/:userId
   */
  static async getUserProfile(userId: number): Promise<UserProfile> {
    try {
      const response = await apiClient.get<UserProfile>(`/users/${userId}`);
      return {
        userId: (response.data as any).id || userId,
        name: response.data.name || 'User',
        email: response.data.email || `${response.data.name?.toLowerCase().replace(/\s+/g, '.')}@example.com`,
        phone: response.data.phone || '+91 98765 43210',
        balance: response.data.balance !== undefined ? Number(response.data.balance) : 10000.0,
        upiId: response.data.upiId || (response.data as any).upi_id || 'user@okaxis',
        avatar: response.data.avatar,
      };
    } catch (error: any) {
      logger.warn(`Backend user ${userId} fetch failed, using fallback profile:`, error.message);
      return { ...MOCK_USER, userId };
    }
  }

  static async getUserById(userId: number): Promise<UserProfile> {
  const response = await apiClient.get(`/users/${userId}`);

  return {
    userId: response.data.id,
    name: response.data.name,
    upiId: response.data.upiId || response.data.upi_id,
    balance: Number(response.data.balance),
    email: response.data.email || '',
    phone: response.data.phone || '',
    avatar: response.data.avatar,
  };
}

static async getUserByName(name: string): Promise<UserProfile> {
  const response = await apiClient.get(
    `/users/name/${encodeURIComponent(name)}`
  );

  return {
    userId: response.data.id,
    name: response.data.name,
    upiId: response.data.upiId || response.data.upi_id,
    balance: Number(response.data.balance),
    email: response.data.email || '',
    phone: response.data.phone || '',
    avatar: response.data.avatar,
  };
}

  /**
   * Fetch user balance via GET /api/users/:userId
   */
  static async getUserBalance(userId: number): Promise<number> {
    try {
      const user = await this.getUserProfile(userId);
      return user.balance;
    } catch (error: any) {
      return MOCK_USER.balance;
    }
  }

  static async createUser(
  name: string,
  upiId: string,
  balance: number
): Promise<UserProfile> {
  const response = await apiClient.post('/users', {
    name,
    upi_id: upiId,
    balance,
  });

  return {
    userId: response.data.id,
    name: response.data.name,
    upiId: response.data.upiId || response.data.upi_id,
    balance: Number(response.data.balance),
    email: response.data.email || '',
    phone: response.data.phone || '',
    avatar: response.data.avatar,
  };
}
}
