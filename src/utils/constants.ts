export const API_BASE_URL = 'http://localhost:8080/api';

export const SUGGESTED_MESSAGES = [
  'Send ₹1000 to Mom',
  'Check balance',
  'Recent transactions',
  'Request ₹500 from Rahul',
  'Pay ₹450 for Electricity bill',
  'Send ₹250 to Priya Patel',
];

export const ERROR_MESSAGES: Record<string, { title: string; defaultDetails: string }> = {
  INSUFFICIENT_BALANCE: {
    title: 'Insufficient Balance',
    defaultDetails: 'Your current balance is not enough to complete this payment.',
  },
  CONTACT_NOT_FOUND: {
    title: 'Contact Not Found',
    defaultDetails: 'We could not find any contact matching your request.',
  },
  AMBIGUOUS_CONTACT: {
    title: 'Multiple Contacts Found',
    defaultDetails: 'Please clarify which contact you intended to pay.',
  },
  INVALID_AMOUNT: {
    title: 'Invalid Amount',
    defaultDetails: 'Please enter a valid positive payment amount.',
  },
  INVALID_RECIPIENT: {
    title: 'Invalid Recipient',
    defaultDetails: 'Recipient details provided are invalid or incomplete.',
  },
  NETWORK_ERROR: {
    title: 'Network Error',
    defaultDetails: 'Unable to connect to Smart GPay servers. Please check your internet connection.',
  },
  TIMEOUT: {
    title: 'Request Timed Out',
    defaultDetails: 'Payment processing took too long. Please try again.',
  },
  VALIDATION_FAILED: {
    title: 'Validation Failed',
    defaultDetails: 'The payment request failed input validation.',
  },
  FRAUD_FLAG: {
    title: 'Security Alert',
    defaultDetails: 'This transaction was flagged for security review. Please contact support.',
  },
  UPI_ERROR: {
    title: 'UPI Payment Failed',
    defaultDetails: 'The payment gateway reported a transaction failure.',
  },
};
