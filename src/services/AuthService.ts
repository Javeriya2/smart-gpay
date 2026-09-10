import { logger } from '../utils/logger';

export class AuthService {
  private static TOKEN_KEY = 'smartgpay_auth_token';

  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  static removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  static isAuthenticated(): boolean {
    return true; // Simplified for demo application
  }
}
