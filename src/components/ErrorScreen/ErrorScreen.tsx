import { UserPlus } from 'lucide-react';
import React, { useState } from 'react';
import {
  Wallet,
  Search,
  AlertTriangle,
  XCircle,
  WifiOff,
  Clock,
  ShieldAlert,
  RotateCcw,
  ArrowLeft,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { Button } from '../Common/Button';
import { Modal } from '../Common/Modal';
import { formatCurrency } from '../../utils/formatters';

export interface ErrorScreenProps {
  errorCode: string;
  errorMessage: string;
  errorDetails?: Record<string, any>;
  suggestions?: string[];
  retryCount?: number;
  onRetry: () => void;
  onDismiss: () => void;
  onContinue?: () => void;
  onAddContact?: () => void;
  onSuggest?: (suggestion: string) => void;
}

export const ErrorScreen: React.FC<ErrorScreenProps> = ({
  errorCode,
  errorMessage,
  errorDetails,
  suggestions = [],
  retryCount = 0,
  onRetry,
  onDismiss,
  onContinue,
  onSuggest,
  onAddContact,
}) => {
  const [showSupportModal, setShowSupportModal] = useState(false);

  const getErrorIcon = (code: string) => {
    switch (code) {
      case 'INSUFFICIENT_BALANCE':
        return <Wallet className="w-16 h-16 text-amber-500" />;
      case 'CONTACT_NOT_FOUND':
        return <Search className="w-16 h-16 text-blue-500" />;
      case 'NETWORK_ERROR':
        return <WifiOff className="w-16 h-16 text-red-500" />;
      case 'TIMEOUT':
        return <Clock className="w-16 h-16 text-orange-500" />;
      case 'FRAUD_FLAG':
        return <ShieldAlert className="w-16 h-16 text-red-600" />;
      default:
        return <XCircle className="w-16 h-16 text-red-500" />;
    }
  };

  const getErrorTitle = (code: string) => {
    switch (code) {
      case 'INSUFFICIENT_BALANCE':
        return 'Insufficient Balance';
      case 'CONTACT_NOT_FOUND':
        return 'Contact Not Found';
      case 'NETWORK_ERROR':
        return 'Connection Failed';
      case 'TIMEOUT':
        return 'Request Timed Out';
      case 'FRAUD_FLAG':
        return 'Security Flag';
      default:
        return 'Payment Could Not Be Processed';
    }
  };

  const isMaxRetries = retryCount >= 3;

  return (
    <div className="w-full max-w-xl mx-auto space-y-6 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6 relative overflow-hidden">
        {/* Error Header Icon */}
        <div className="flex justify-center">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-red-50 dark:bg-red-950/60 border-4 border-red-200 dark:border-red-900/60 flex items-center justify-center shadow-lg">
            {getErrorIcon(errorCode)}
          </div>
        </div>

        {/* Error Title & Message */}
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-heading">
            {getErrorTitle(errorCode)}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
            {errorMessage}
          </p>
        </div>

        {/* Error Details Breakdown */}
        {errorDetails && (
          <div className="bg-red-50/80 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-2xl p-4 text-left space-y-2 text-xs sm:text-sm">
            {errorDetails.available !== undefined && (
              <div className="flex justify-between text-slate-700 dark:text-slate-300">
                <span>Available Balance:</span>
                <span className="font-mono font-bold">{formatCurrency(errorDetails.available)}</span>
              </div>
            )}
            {errorDetails.required !== undefined && (
              <div className="flex justify-between text-slate-700 dark:text-slate-300">
                <span>Required Amount:</span>
                <span className="font-mono font-bold text-red-600 dark:text-red-400">{formatCurrency(errorDetails.required)}</span>
              </div>
            )}
            {errorDetails.shortBy !== undefined && (
              <div className="flex justify-between text-red-700 dark:text-red-400 pt-1 border-t border-red-200/60 dark:border-red-900/40 font-bold">
                <span>Shortfall:</span>
                <span className="font-mono">{formatCurrency(errorDetails.shortBy)}</span>
              </div>
            )}
          </div>
        )}

        {/* Suggestions Section */}
        {suggestions.length > 0 && (
          <div className="pt-2 text-left space-y-2">
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Recommended Actions</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onSuggest && onSuggest(item)}
                  className="text-xs px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-primary-50 hover:text-primary dark:hover:bg-slate-700 transition border border-slate-200 dark:border-slate-700"
                >
                  💡 {item}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        
        {errorCode === 'FRAUD_FLAG' && onContinue && (
    <Button
      variant="primary"
      size="lg"
      onClick={onContinue}
      className="w-full sm:w-auto flex-1 font-bold shadow-lg shadow-primary-500/25"
    >
      Continue & Pay
    </Button>
  )}
  
    <Button
            variant="secondary"
            size="lg"
            onClick={onDismiss}
            className="w-full sm:w-auto flex-1"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Go Back
          </Button>

          <Button
            variant="primary"
            size="lg"
            disabled={isMaxRetries}
            onClick={onRetry}
            className="w-full sm:w-auto flex-1 font-bold shadow-lg shadow-primary-500/25"
            leftIcon={<RotateCcw className="w-4 h-4" />}
          >
            {isMaxRetries ? 'Max Retries Reached' : retryCount > 0 ? `Retry (${retryCount}/3)` : 'Try Again'}
          </Button>

          {onAddContact && (
  <Button
    variant="secondary"
    onClick={onAddContact}
    className="w-full"
    leftIcon={<UserPlus className="w-5 h-5" />}
  >
    Add Contact
  </Button>
)}
        </div>

        {/* Support Link */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setShowSupportModal(true)}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-primary font-medium transition"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Need help with this transaction? Contact Support</span>
          </button>
        </div>
      </div>

      {/* Support Modal */}
      <Modal isOpen={showSupportModal} onClose={() => setShowSupportModal(false)} title="Contact Smart GPay Support">
        <div className="space-y-4 text-sm">
          <p className="text-slate-600 dark:text-slate-300">
            Our 24/7 AI payment support center is ready to assist you. Reference code: <span className="font-mono font-bold text-primary">{errorCode}</span>
          </p>
          <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl space-y-1 text-xs">
            <p><strong>Support Hotline:</strong> 1800-425-GPAY (4729)</p>
            <p><strong>Email Support:</strong> help@smartgpay.in</p>
          </div>
          <Button variant="primary" onClick={() => setShowSupportModal(false)} className="w-full">
            Close
          </Button>
        </div>
      </Modal>
    </div>
  );
};
