/**
 * Smart GPay Mock API Service
 * Mirrors the Spring Boot (Java) backend contracts for intent parsing, payee disambiguation,
 * transaction execution, and state traceability.
 */

export const MOCK_USER = {
  name: "Javeriya Taj",
  upiId: "javeriya@okaxis",
  phone: "+91 98765 43210",
  balance: 24850.75,
  bankName: "HDFC Bank (•••• 4092)",
  avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"
};

export const MOCK_CONTACTS = [
  {
    id: 'c1',
    name: 'Rahul Sharma',
    city: 'Bangalore',
    vpa: 'rahul.bgr@okaxis',
    phone: '+91 98111 22334',
    aliases: ['Rahul', 'Rahul Bangalore', 'Rahul B'],
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    type: 'FRIEND'
  },
  {
    id: 'c2',
    name: 'Rahul Sharma',
    city: 'Delhi',
    vpa: 'rahul.delhi@okicici',
    phone: '+91 98222 33445',
    aliases: ['Rahul Delhi', 'Rahul S'],
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80',
    type: 'COLLEAGUE'
  },
  {
    id: 'c3',
    name: 'Prem Kumar',
    city: 'Hyderabad',
    vpa: 'prem.kumar@okhdfc',
    phone: '+91 98333 44556',
    aliases: ['Prem', 'Premu', 'Prem bhai'],
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    type: 'FAMILY'
  },
  {
    id: 'c4',
    name: 'BESCOM Electricity',
    city: 'Karnataka',
    vpa: 'bescom.pay@sbi',
    phone: '1912',
    aliases: ['Electricity bill', 'Power bill', 'BESCOM'],
    avatar: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=120&auto=format&fit=crop&q=80',
    type: 'UTILITY'
  },
  {
    id: 'c5',
    name: 'Ayesha Khan',
    city: 'Mumbai',
    vpa: 'ayesha.k@okaxis',
    phone: '+91 98444 55667',
    aliases: ['Ayesha', 'Ayu'],
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    type: 'FRIEND'
  }
];

export let MOCK_TRANSACTIONS = [
  {
    id: 'TXN-902148',
    recipientName: 'Prem Kumar (Premu)',
    vpa: 'prem.kumar@okhdfc',
    amount: 1500.00,
    status: 'SUCCESS',
    timestamp: '2026-09-02 21:15',
    type: 'SENT',
    intentPrompt: 'Send 1500 to Premu',
    stateTrace: [
      { step: 'REQUEST_RECEIVED', time: '21:15:01', detail: 'Received prompt: "Send 1500 to Premu"' },
      { step: 'INTENT_PARSED', time: '21:15:02', detail: 'Parsed: Action=PAYMENT, Amount=1500, Target="Premu"' },
      { step: 'CONTACT_MATCHED', time: '21:15:02', detail: 'Matched alias "Premu" -> Prem Kumar (prem.kumar@okhdfc)' },
      { step: 'VALIDATION_PASSED', time: '21:15:03', detail: 'Sufficient balance available ($24,850.75 >= $1,500.00)' },
      { step: 'SUCCESS', time: '21:15:04', detail: 'Payment executed via UPI gateway. UTR: 6290184920' }
    ]
  },
  {
    id: 'TXN-902147',
    recipientName: 'BESCOM Electricity',
    vpa: 'bescom.pay@sbi',
    amount: 840.50,
    status: 'SUCCESS',
    timestamp: '2026-09-01 14:30',
    type: 'BILL',
    intentPrompt: 'Pay my electricity bill 840.50',
    stateTrace: [
      { step: 'REQUEST_RECEIVED', time: '14:30:00', detail: 'Received prompt: "Pay electricity bill"' },
      { step: 'INTENT_PARSED', time: '14:30:01', detail: 'Parsed: Action=BILL_PAY, Amount=840.50, Target="BESCOM Electricity"' },
      { step: 'SUCCESS', time: '14:30:03', detail: 'Utility bill cleared. Biller Ref: BES-2026-9912' }
    ]
  }
];

/**
 * Simulates Gemini AI Natural Language Understanding Intent Parsing
 */
export async function parseNaturalLanguageIntent(promptText) {
  // Artificial network latency simulating backend AI call
  await new Promise((resolve) => setTimeout(resolve, 800));

  const lower = promptText.toLowerCase();

  // Extract numbers (amount)
  const amountMatch = promptText.match(/\d+(\.\d{1,2})?/);
  const amount = amountMatch ? parseFloat(amountMatch[0]) : null;

  // Determine intent action
  let action = 'PAYMENT';
  if (lower.includes('bill') || lower.includes('electricity') || lower.includes('recharge')) {
    action = 'BILL_PAY';
  } else if (lower.includes('balance') || lower.includes('check balance')) {
    action = 'BALANCE_CHECK';
  }

  if (action === 'BALANCE_CHECK') {
    return {
      action: 'BALANCE_CHECK',
      amount: null,
      recipient: null,
      requiresClarification: false,
      message: `Your current balance is ₹${MOCK_USER.balance.toLocaleString('en-IN')}`
    };
  }

  // Find candidate payees by alias or name matching
  const matchingContacts = MOCK_CONTACTS.filter(contact => {
    const searchName = contact.name.toLowerCase();
    if (lower.includes(searchName)) return true;
    return contact.aliases.some(alias => lower.includes(alias.toLowerCase()));
  });

  if (matchingContacts.length === 0) {
    return {
      action,
      amount,
      recipient: null,
      requiresClarification: false,
      status: 'FAILED',
      error: 'Could not find a contact or utility matching your request. Please specify a valid contact name or phone number.'
    };
  }

  if (matchingContacts.length > 1) {
    return {
      action,
      amount,
      candidates: matchingContacts,
      requiresClarification: true,
      clarificationPrompt: `Multiple contacts found matching your request. Which "${matchingContacts[0].name.split(' ')[0]}" did you mean?`
    };
  }

  // Single candidate match
  return {
    action,
    amount: amount || 0,
    recipient: matchingContacts[0],
    requiresClarification: false
  };
}

/**
 * Executes payment and appends to transaction log
 */
export async function executePayment({ recipient, amount, promptText }) {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  if (MOCK_USER.balance < amount) {
    throw new Error('Insufficient balance in your linked bank account.');
  }

  MOCK_USER.balance -= amount;

  const txnId = `TXN-${Math.floor(100000 + Math.random() * 900000)}`;
  const now = new Date();
  const timestamp = `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 5)}`;

  const newTxn = {
    id: txnId,
    recipientName: recipient.name + (recipient.city ? ` (${recipient.city})` : ''),
    vpa: recipient.vpa,
    amount: amount,
    status: 'SUCCESS',
    timestamp,
    type: recipient.type === 'UTILITY' ? 'BILL' : 'SENT',
    intentPrompt: promptText,
    stateTrace: [
      { step: 'REQUEST_RECEIVED', time: now.toTimeString().slice(0, 8), detail: `Received prompt: "${promptText}"` },
      { step: 'INTENT_PARSED', time: now.toTimeString().slice(0, 8), detail: `Action=PAYMENT, Amount=₹${amount}, Target="${recipient.name}"` },
      { step: 'CONTACT_CONFIRMED', time: now.toTimeString().slice(0, 8), detail: `Resolved VPA: ${recipient.vpa}` },
      { step: 'SUCCESS', time: now.toTimeString().slice(0, 8), detail: `Payment of ₹${amount} executed successfully. Ref: ${txnId}` }
    ]
  };

  MOCK_TRANSACTIONS.unshift(newTxn);
  return newTxn;
}
