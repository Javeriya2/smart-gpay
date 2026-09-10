import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';
import { Contact, Transaction, UserProfile, PaymentProcessResponse } from '../types/models';
import { logger } from '../utils/logger';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Mock database for offline/demo mode
export const MOCK_USER: UserProfile = {
  userId: 101,
  name: 'Aarav Sharma',
  email: 'aarav.sharma@example.com',
  phone: '+91 98765 43210',
  balance: 14500.0,
  upiId: 'aarav.sharma@okaxis',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
};

export const MOCK_CONTACTS: Contact[] = [
  { id: 1, name: 'Mom (Sunita Sharma)', vpa: 'sunita.sharma@okicici', phone: '+91 98111 22334', alias: 'Mom', lastTransactionAmount: 2000, lastTransactionDate: '2026-09-05T14:30:00Z', frequency: 15 },
  { id: 2, name: 'Rahul Sharma (Flatmate)', vpa: 'rahul.s@okaxis', phone: '+91 98222 33445', alias: 'Rahul', lastTransactionAmount: 500, lastTransactionDate: '2026-09-04T18:15:00Z', frequency: 12 },
  { id: 3, name: 'Rahul Verma (Colleague)', vpa: 'rahul.v@okhdfc', phone: '+91 98333 44556', alias: 'Rahul', lastTransactionAmount: 1200, lastTransactionDate: '2026-08-28T11:00:00Z', frequency: 5 },
  { id: 4, name: 'Priya Patel', vpa: 'priya.patel@oksbi', phone: '+91 98444 55667', lastTransactionAmount: 750, lastTransactionDate: '2026-09-01T09:20:00Z', frequency: 8 },
  { id: 5, name: 'Rohan Gupta', vpa: 'rohan.g@paytm', phone: '+91 98555 66778', lastTransactionAmount: 300, lastTransactionDate: '2026-08-15T16:45:00Z', frequency: 3 },
  { id: 6, name: 'Electricity Bill (BESCOM)', vpa: 'bescom.bill@icici', phone: '1800-425-1912', lastTransactionAmount: 850, lastTransactionDate: '2026-08-20T10:00:00Z', frequency: 6 },
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 1001, txnId: 'TXN-2026-908123', amount: 1200, recipientName: 'Rahul Sharma (Flatmate)', recipientVPA: 'rahul.s@okaxis', senderUserId: 101, timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), status: 'SUCCESS', type: 'SENT', category: 'Friends', note: 'Dinner split' },
  { id: 1002, txnId: 'TXN-2026-908122', amount: 2000, recipientName: 'Mom (Sunita Sharma)', recipientVPA: 'sunita.sharma@okicici', senderUserId: 101, timestamp: new Date(Date.now() - 3600000 * 24).toISOString(), status: 'SUCCESS', type: 'SENT', category: 'Family', note: 'Monthly groceries' },
  { id: 1003, txnId: 'TXN-2026-908121', amount: 850, recipientName: 'Electricity Bill (BESCOM)', recipientVPA: 'bescom.bill@icici', senderUserId: 101, timestamp: new Date(Date.now() - 3600000 * 72).toISOString(), status: 'SUCCESS', type: 'BILL_PAY', category: 'Utilities', note: 'Bill payment' },
  { id: 1004, txnId: 'TXN-2026-908120', amount: 5000, recipientName: 'Aarav Sharma', recipientVPA: 'aarav.sharma@okaxis', senderUserId: 202, timestamp: new Date(Date.now() - 3600000 * 120).toISOString(), status: 'SUCCESS', type: 'RECEIVED', category: 'General', note: 'Freelance payment' },
];

// Fallback intelligent NL payment processor for seamless demo/offline operation
export const processMockNLPayment = (userId: number, message: string, selectedContactId?: number): PaymentProcessResponse => {
  logger.info('Processing mock payment prompt:', message, selectedContactId);
  const lower = message.toLowerCase();

  // Extract amount
  const amountMatch = message.match(/(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d{1,2})?)/i);
  const amount = amountMatch ? parseFloat(amountMatch[1]) : 0;

  if (amount <= 0 && !lower.includes('balance') && !lower.includes('history')) {
    return {
      status: 'ERROR',
      errorCode: 'INVALID_AMOUNT',
      errorMessage: 'Could not parse a valid payment amount. Please specify an amount, e.g. "Send ₹500 to Rahul".',
      suggestions: ['Send ₹1000 to Mom', 'Send ₹500 to Rahul', 'Check balance'],
    };
  }

  // Check balance
  if (amount > MOCK_USER.balance) {
    return {
      status: 'ERROR',
      errorCode: 'INSUFFICIENT_BALANCE',
      errorMessage: `Insufficient balance. Available: ₹${MOCK_USER.balance.toLocaleString('en-IN')}, Required: ₹${amount.toLocaleString('en-IN')}`,
      errorDetails: { available: MOCK_USER.balance, required: amount, shortBy: amount - MOCK_USER.balance },
      suggestions: ['Request money from contacts', 'Check recent transactions', 'Review balance'],
    };
  }

  // Handle disambiguation if contact specified by ID
  let targetContact: Contact | undefined;
  if (selectedContactId) {
    targetContact = MOCK_CONTACTS.find((c) => c.id === selectedContactId);
  } else {
    // Check for "rahul" ambiguity
    if (lower.includes('rahul')) {
      const rahuls = MOCK_CONTACTS.filter((c) => c.name.toLowerCase().includes('rahul'));
      if (rahuls.length > 1) {
        return {
          status: 'AMBIGUOUS',
          ambiguousContacts: rahuls,
          errorMessage: `Multiple contacts found matching "Rahul". Please select the intended recipient.`,
        };
      }
      targetContact = rahuls[0];
    } else if (lower.includes('mom')) {
      targetContact = MOCK_CONTACTS.find((c) => c.alias?.toLowerCase() === 'mom' || c.name.toLowerCase().includes('mom'));
    } else if (lower.includes('priya')) {
      targetContact = MOCK_CONTACTS.find((c) => c.name.toLowerCase().includes('priya'));
    } else if (lower.includes('rohan')) {
      targetContact = MOCK_CONTACTS.find((c) => c.name.toLowerCase().includes('rohan'));
    } else if (lower.includes('electricity') || lower.includes('bill')) {
      targetContact = MOCK_CONTACTS.find((c) => c.name.toLowerCase().includes('electricity'));
    }
  }

  if (!targetContact && amount > 0) {
    // Search by any match
    const match = MOCK_CONTACTS.find((c) =>
      lower.includes(c.name.toLowerCase().split(' ')[0]) ||
      (c.alias && lower.includes(c.alias.toLowerCase()))
    );

    if (match) {
      targetContact = match;
    } else {
      return {
        status: 'ERROR',
        errorCode: 'CONTACT_NOT_FOUND',
        errorMessage: `Recipient contact not found in your list.`,
        suggestions: ['Check recipient spelling', 'Select from frequent contacts', 'Try "Send ₹1000 to Mom"'],
      };
    }
  }

  // Create successful transaction
  const newTxn: Transaction = {
    id: Date.now(),
    txnId: `TXN-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
    amount: amount,
    recipientName: targetContact?.name || 'Recipient',
    recipientVPA: targetContact?.vpa || 'recipient@upi',
    senderUserId: userId,
    timestamp: new Date().toISOString(),
    status: 'SUCCESS',
    type: 'SENT',
    category: targetContact?.name.includes('Bill') ? 'Utilities' : targetContact?.alias === 'Mom' ? 'Family' : 'Friends',
    note: message,
  };

  MOCK_USER.balance -= amount;
  MOCK_TRANSACTIONS.unshift(newTxn);

  return {
    status: 'SUCCESS',
    transaction: newTxn,
    newBalance: MOCK_USER.balance,
  };
};
