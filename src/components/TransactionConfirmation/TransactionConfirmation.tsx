import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Share2, Printer, PlusCircle, FileText, QrCode, Check, Copy } from 'lucide-react';
import { Button } from '../Common/Button';
import { Modal } from '../Common/Modal';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { ConfettiEffect } from './Confetti';

export interface TransactionConfirmationProps {
  transactionId: string | number;
  amount: number;
  recipientName: string;
  recipientVPA: string;
  newBalance: number;
  timestamp: Date | string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  onNewPayment: () => void;
  onViewDetails: () => void;
}

export const TransactionConfirmation: React.FC<TransactionConfirmationProps> = ({
  transactionId,
  amount,
  recipientName,
  recipientVPA,
  newBalance,
  timestamp,
  status = 'SUCCESS',
  onNewPayment,
  onViewDetails,
}) => {
  const [showQrModal, setShowQrModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const formattedTxnId = typeof transactionId === 'number' ? `TXN-2026-${transactionId}` : transactionId;

  const handleShare = () => {
    const shareText = `Smart GPay Receipt: Successfully paid ${formatCurrency(amount)} to ${recipientName} (${formattedTxnId}).`;
    if (navigator.share) {
      navigator.share({
        title: 'Smart GPay Receipt',
        text: shareText,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-6 animate-fadeIn">
      <ConfettiEffect />

      {/* Primary Success Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6 relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Success Icon Animation */}
        <div className="flex justify-center">
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border-4 border-emerald-500/30 flex items-center justify-center text-emerald-500 shadow-xl shadow-emerald-500/20"
          >
            <CheckCircle2 className="w-16 h-16 sm:w-20 sm:h-20 fill-emerald-500 text-white dark:text-slate-900" />
          </motion.div>
        </div>

        {/* Amount & Recipient */}
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
            ✅ PAYMENT SUCCESSFUL
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight pt-2">
            {formatCurrency(amount)}
          </h2>
          <p className="text-lg font-semibold text-slate-700 dark:text-slate-200 pt-1">
            Sent to <span className="text-primary font-bold">{recipientName}</span>
          </p>
        </div>

        {/* Transaction Details Card */}
        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-5 border border-slate-100 dark:border-slate-700/60 text-left space-y-3 text-sm">
          <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Transaction ID</span>
            <span className="font-mono font-semibold text-slate-900 dark:text-slate-200">{formattedTxnId}</span>
          </div>

          <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Date & Time</span>
            <span className="text-slate-900 dark:text-slate-200 font-medium">{formatDate(timestamp)}</span>
          </div>

          <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Recipient UPI VPA</span>
            <span className="font-mono text-slate-900 dark:text-slate-200">{recipientVPA}</span>
          </div>

          <div className="flex justify-between items-center pt-1">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Updated Account Balance</span>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(newBalance)}</span>
          </div>
        </div>

        {/* Quick Action Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <Button
            variant="tertiary"
            size="sm"
            onClick={handleShare}
            leftIcon={copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
          >
            {copied ? 'Copied!' : 'Share'}
          </Button>

          <Button
            variant="tertiary"
            size="sm"
            onClick={handlePrint}
            leftIcon={<Printer className="w-4 h-4" />}
          >
            Print
          </Button>

          <Button
            variant="tertiary"
            size="sm"
            onClick={() => setShowQrModal(true)}
            leftIcon={<QrCode className="w-4 h-4" />}
          >
            QR Code
          </Button>

          <Button
            variant="tertiary"
            size="sm"
            onClick={onViewDetails}
            leftIcon={<FileText className="w-4 h-4" />}
          >
            Details
          </Button>
        </div>

        {/* Primary Action Button */}
        <div className="pt-2">
          <Button
            variant="primary"
            size="lg"
            onClick={onNewPayment}
            className="w-full font-bold shadow-lg shadow-primary-500/25"
            leftIcon={<PlusCircle className="w-5 h-5" />}
          >
            Make Another Payment
          </Button>
        </div>
      </div>

      {/* QR Code Receipt Modal */}
      <Modal isOpen={showQrModal} onClose={() => setShowQrModal(false)} title="Transaction Verification QR" maxWidth="sm">
        <div className="text-center space-y-4">
          <div className="bg-white p-4 rounded-2xl inline-block border shadow-inner">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                `SmartGPay:${formattedTxnId}:${amount}`
              )}`}
              alt={`QR Code for ${formattedTxnId}`}
              className="w-44 h-44 mx-auto"
            />
          </div>
          <div>
            <p className="font-mono text-xs text-slate-500 font-semibold">{formattedTxnId}</p>
            <p className="text-xs text-slate-400 mt-0.5">Scan to verify authentic bank payment receipt</p>
          </div>
          <Button variant="secondary" onClick={() => setShowQrModal(false)} className="w-full">
            Close
          </Button>
        </div>
      </Modal>
    </div>
  );
};
