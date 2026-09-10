import React, { useState, useEffect } from 'react';
import { Modal } from '../Common/Modal';
import { Button } from '../Common/Button';
import { ContactAvatar } from '../Common/ContactAvatar';
import { Contact } from '../../types/models';
import { AlertTriangle, CheckCircle2, User, Clock, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export interface DisambiguationModalProps {
  isOpen: boolean;
  ambiguousContacts: Contact[];
  originalMessage: string;
  onSelect: (contactId: number) => void;
  onCancel: () => void;
}

export const DisambiguationModal: React.FC<DisambiguationModalProps> = ({
  isOpen,
  ambiguousContacts,
  originalMessage,
  onSelect,
  onCancel,
}) => {
  const [selectedContactId, setSelectedContactId] = useState<number | null>(null);

  useEffect(() => {
    if (ambiguousContacts && ambiguousContacts.length > 0) {
      setSelectedContactId(ambiguousContacts[0].id);
    }
  }, [ambiguousContacts]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || !ambiguousContacts.length) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const currentIndex = ambiguousContacts.findIndex((c) => c.id === selectedContactId);
        const nextIndex = (currentIndex + 1) % ambiguousContacts.length;
        setSelectedContactId(ambiguousContacts[nextIndex].id);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const currentIndex = ambiguousContacts.findIndex((c) => c.id === selectedContactId);
        const prevIndex = (currentIndex - 1 + ambiguousContacts.length) % ambiguousContacts.length;
        setSelectedContactId(ambiguousContacts[prevIndex].id);
      } else if (e.key === 'Enter' && selectedContactId !== null) {
        e.preventDefault();
        onSelect(selectedContactId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, ambiguousContacts, selectedContactId, onSelect]);

  const selectedContact = ambiguousContacts.find((c) => c.id === selectedContactId);

  return (
    <Modal isOpen={isOpen} onClose={onCancel} maxWidth="lg" showCloseButton={true}>
      <div className="space-y-6">
        {/* Modal Header Icon & Text */}
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center text-amber-600 dark:text-amber-400 flex-shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white font-heading">
              Multiple Contacts Found
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Which recipient did you mean for <span className="font-semibold text-slate-700 dark:text-slate-300">"{originalMessage}"</span>?
            </p>
          </div>
        </div>

        {/* Contact Selection List */}
        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {ambiguousContacts.map((contact) => {
            const isSelected = selectedContactId === contact.id;

            return (
              <div
                key={contact.id}
                onClick={() => setSelectedContactId(contact.id)}
                className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer select-none ${
                  isSelected
                    ? 'border-primary bg-primary-50/50 dark:bg-primary-950/30 shadow-md'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center space-x-3.5 min-w-0 flex-1">
                  {/* Custom Radio check */}
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      isSelected ? 'border-primary bg-primary text-white' : 'border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="w-4 h-4 fill-current text-white" />}
                  </div>

                  <ContactAvatar name={contact.name} avatarUrl={contact.avatar} size="lg" />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                        {contact.name}
                      </h4>
                      {contact.alias && (
                        <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded">
                          {contact.alias}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate">
                      {contact.vpa}
                    </p>

                    {contact.lastTransactionAmount && (
                      <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                        <Clock className="w-3 h-3" />
                        <span>
                          Last sent: {formatCurrency(contact.lastTransactionAmount)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant="primary"
            disabled={selectedContactId === null}
            onClick={() => selectedContactId !== null && onSelect(selectedContactId)}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            {selectedContact ? `Continue with ${selectedContact.name.split(' ')[0]}` : 'Continue'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
