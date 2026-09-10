import { ErrorCode } from '../types/models';
import { ERROR_MESSAGES } from './constants';

export interface AppError {
  code: ErrorCode;
  title: string;
  message: string;
  details?: Record<string, any>;
  suggestions?: string[];
}

export const parseApiError = (error: any): AppError => {
  if (error?.response?.data) {
    const data = error.response.data;
    const code: ErrorCode = data.errorCode || 'NETWORK_ERROR';
    const config = ERROR_MESSAGES[code] || {
      title: 'Transaction Error',
      defaultDetails: 'An unexpected error occurred.',
    };

    return {
      code,
      title: config.title,
      message: data.errorMessage || data.message || config.defaultDetails,
      details: data.errorDetails || data.details,
      suggestions: data.suggestions || getFallbackSuggestions(code),
    };
  }

  if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
    return {
      code: 'TIMEOUT',
      title: ERROR_MESSAGES.TIMEOUT.title,
      message: ERROR_MESSAGES.TIMEOUT.defaultDetails,
      suggestions: ['Check connection', 'Try payment again'],
    };
  }

  return {
    code: 'NETWORK_ERROR',
    title: ERROR_MESSAGES.NETWORK_ERROR.title,
    message: error?.message || ERROR_MESSAGES.NETWORK_ERROR.defaultDetails,
    suggestions: ['Check internet connection', 'Retry payment', 'Refresh dashboard'],
  };
};

export const getFallbackSuggestions = (code: ErrorCode): string[] => {
  switch (code) {
    case 'INSUFFICIENT_BALANCE':
      return [
        'Request money from contacts',
        'Check recent transactions',
        'Review spending limits',
        'Contact support',
      ];
    case 'CONTACT_NOT_FOUND':
      return [
        'Check recipient spelling',
        'Select from recent payees',
        'Enter UPI VPA manually',
      ];
    case 'AMBIGUOUS_CONTACT':
      return ['Select from matched contact list', 'Enter full full name or phone number'];
    case 'INVALID_AMOUNT':
      return ['Enter amount greater than ₹0', 'Check decimal formatting'];
    default:
      return ['Try again in a few moments', 'Contact GPay customer support'];
  }
};
