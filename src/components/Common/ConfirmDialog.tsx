import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDangerous = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="sm">
      <div className="text-center space-y-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white font-heading">{title}</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{message}</p>
        </div>
        <div className="flex gap-3 justify-center pt-2">
          <Button variant="secondary" onClick={onClose} className="w-full">
            {cancelText}
          </Button>
          <Button
            variant={isDangerous ? 'danger' : 'primary'}
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="w-full"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
