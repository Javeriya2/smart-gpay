export interface Contact {
  id: number;
  name: string;
  vpa: string;
  phone?: string;
  avatar?: string;
  alias?: string;
  lastTransactionAmount?: number;
  lastTransactionDate?: string;
  frequency?: number;
}

export type TransactionStatus = 'SUCCESS' | 'PENDING' | 'FAILED';
export type TransactionType = 'SENT' | 'RECEIVED' | 'BILL_PAY';

export interface Transaction {
  id: number;
  txnId: string;
  amount: number;
  recipientName: string;
  recipientVPA: string;
  senderUserId: number;
  timestamp: string;
  status: TransactionStatus;
  type: TransactionType;
  category?: 'Food & Dining' | 'Utilities' | 'Friends' | 'Family' | 'Shopping' | 'General';
  note?: string;
}

export interface UserProfile {
  userId: number;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  balance: number;
  upiId: string;
}

export interface PaymentProcessRequest {
  userId: number;
  message: string;
  selectedContactId?: number;
  confirmFraudWarning?: boolean;
  transactionId?: number;
  originalRequestId?: string;
}

export interface PaymentProcessResponse {
  status: 'SUCCESS' | 'AMBIGUOUS' | 'ERROR';
    transactionId?: number;
  originalRequestId?: string;
  transaction?: Transaction;
  newBalance?: number;
  ambiguousContacts?: Contact[];
  errorCode?: ErrorCode;
  errorMessage?: string;
  errorDetails?: Record<string, any>;
  suggestions?: string[];
}

export interface Receipt {
  transactionId: string;
  numericId: number;
  amount: number;
  recipientName: string;
  recipientVPA: string;
  newBalance: number;
  timestamp: string;
  status: TransactionStatus;
  category?: string;
  qrCodeUrl?: string;
}

export type ErrorCode =
  | 'INSUFFICIENT_BALANCE'
  | 'CONTACT_NOT_FOUND'
  | 'AMBIGUOUS_CONTACT'
  | 'INVALID_AMOUNT'
  | 'INVALID_RECIPIENT'
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  | 'VALIDATION_FAILED'
  | 'FRAUD_FLAG'
  | 'UPI_ERROR';

export interface ChartDataset {
  category: string;
  amount: number;
  color: string;
  percentage: number;
}
