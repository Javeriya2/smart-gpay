import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Send, X, Wallet, Sparkles, User, AlertCircle, UserPlus } from 'lucide-react';
import { Button } from '../Common/Button';
import { ContactAvatar } from '../Common/ContactAvatar';
import { useVoiceInput } from '../../hooks/useVoiceInput';
import { formatCurrency } from '../../utils/formatters';
import { Contact } from '../../types/models';

export interface PaymentInputScreenProps {
  userId: number;
  onPaymentSubmit: (message: string) => void;
  isLoading: boolean;
  userBalance?: number;
  recentPayees?: Contact[];
  onCheckBalance?: () => void;
  onRecentTransactions?: () => void;
  onAddContact?: () => void;
}

export const PaymentInputScreen: React.FC<PaymentInputScreenProps> = ({
  userId,
  onPaymentSubmit,
  isLoading,
  userBalance = 14500,
recentPayees = [],
onCheckBalance,
onRecentTransactions,
onAddContact,
}) => {
  const [userMessage, setUserMessage] = useState('');
  const [inputError, setInputError] = useState('');

  const { isListening, transcript, isSupported, startListening, stopListening } = useVoiceInput((text) => {
    setUserMessage(text);
  });

  useEffect(() => {
    if (transcript) {
      setUserMessage(transcript);
    }
  }, [transcript]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (val.length <= 200) {
      setUserMessage(val);
      if (inputError) setInputError('');
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = userMessage.trim();
    if (!trimmed) {
      setInputError('Please enter a payment command or message.');
      return;
    }
    onPaymentSubmit(trimmed);
  };

  const suggestedMessages = [
  'Check balance',
  'Recent transactions',
  ...recentPayees
    .slice(0, 4)
    .map((payee) => `Send ₹500 to ${payee.name}`),
];

const handleChipClick = (chipMessage: string) => {
  if (chipMessage === 'Check balance') {
    onCheckBalance?.();
    return;
  }

  if (chipMessage === 'Recent transactions') {
    onRecentTransactions?.();
    return;
  }

  setUserMessage(chipMessage);
  setInputError('');
};
  const handlePayeeClick = (contact: Contact) => {
    setUserMessage(`Send ₹500 to ${contact.alias || contact.name.split(' ')[0]}`);
    setInputError('');
  };

  

  const charCount = userMessage.length;
  const isLowBalance = userBalance < 500;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Top Banner / Header card */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center space-x-2 text-blue-200 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Smart Assistant</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading mt-1">Send Money</h1>
            <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-md">
              Type or speak in plain natural language. Smart GPay handles the rest.
            </p>
          </div>

          {/* Balance chip */}
          <div className={`px-4 py-2 rounded-2xl backdrop-blur-md border text-right transition-all ${
            isLowBalance ? 'bg-amber-500/30 border-amber-300/50 text-amber-100' : 'bg-white/20 border-white/30 text-white'
          }`}>
            <div className="flex items-center justify-end gap-1.5 text-xs text-blue-100 font-medium">
              <Wallet className="w-3.5 h-3.5" />
              <span>Available</span>
            </div>
            <p className="text-lg font-bold font-mono mt-0.5">{formatCurrency(userBalance)}</p>
            {isLowBalance && (
              <span className="text-[10px] bg-amber-500 text-amber-950 px-1.5 py-0.5 rounded font-bold inline-block mt-0.5">
                Low Balance
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Payment Input Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <textarea
              value={userMessage}
              onChange={handleTextChange}
              placeholder='Try "Send ₹1000 to Mom" or "Pay ₹500 to Rahul for dinner"...'
              rows={3}
              autoFocus
              className={`w-full p-4 text-base bg-slate-50 dark:bg-slate-800/80 border text-slate-900 dark:text-slate-100 placeholder-slate-400 rounded-2xl resize-none focus:outline-none transition ${
                inputError
                  ? 'border-error focus:ring-2 focus:ring-error'
                  : 'border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/20'
              }`}
            />

            {/* Character counter & Clear button */}
            <div className="absolute bottom-3 right-3 flex items-center space-x-2 text-xs text-slate-400 font-mono">
              {userMessage && (
                <button
                  type="button"
                  onClick={() => {
                    setUserMessage('');
                    setInputError('');
                  }}
                  className="p-1 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                  title="Clear input"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <span className={charCount > 180 ? 'text-amber-500 font-bold' : ''}>
                {charCount}/200
              </span>
            </div>
          </div>

          {inputError && (
            <div className="flex items-center space-x-2 text-xs text-error font-medium px-1">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{inputError}</span>
            </div>
          )}

          {/* Action Row */}
          <div className="flex items-center justify-between gap-3 pt-2">
            {/* Voice Input Button */}
            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl font-medium text-sm transition-all ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
              title={isSupported ? 'Click to speak' : 'Voice input not supported in browser'}
            >
              {isListening ? (
                <>
                  <MicOff className="w-5 h-5" />
                  <span className="hidden sm:inline">Listening...</span>
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5 text-primary" />
                  <span className="hidden sm:inline">Voice Input</span>
                </>
              )}
            </button>

            {/* Process Payment Button */}
            <Button
              type="submit"
              isLoading={isLoading}
              size="lg"
              className="flex-1 sm:flex-initial sm:px-8 font-bold shadow-lg shadow-primary-500/25"
              leftIcon={<Send className="w-5 h-5" />}
            >
              Process Payment
            </Button>
          </div>
        </form>

        {/* Suggestion Chips */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Quick Suggestions
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestedMessages.map((msg, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleChipClick(msg)}
                className="text-xs px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-primary-50 hover:text-primary dark:hover:bg-slate-700 transition border border-slate-200 dark:border-slate-700/60"
              >
                ✨ {msg}
              </button>
            ))}
          </div>
        </div>

        {/* Recent Payees Section */}
       {/* Recent Payees Section */}
<div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
  <div className="flex items-center justify-between">
    <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
      Frequent Payees
    </p>

    <button
      type="button"
      onClick={onAddContact}
      className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-700 transition"
    >
      <UserPlus className="w-4 h-4" />
      Add Contact
    </button>
  </div>

  {recentPayees && recentPayees.length > 0 ? (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {recentPayees.slice(0, 4).map((payee) => (
        <button
          key={payee.id}
          type="button"
          onClick={() => handlePayeeClick(payee)}
          className="flex items-center space-x-3 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-700/50 transition text-left group"
        >
          <ContactAvatar name={payee.name} avatarUrl={payee.avatar} size="md" />

          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-primary transition">
              {payee.alias || payee.name.split(' ')[0]}
            </p>

            <p className="text-[10px] text-slate-400 truncate font-mono">
              {payee.vpa}
            </p>
          </div>
        </button>
      ))}
    </div>
  ) : (
    <p className="text-sm text-slate-400">
      No contacts yet. Add your first contact.
    </p>
  )}
</div>
      </div>
    </div>
  );
};
