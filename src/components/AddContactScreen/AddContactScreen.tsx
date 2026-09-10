import React, { useState } from 'react';
import { ArrowLeft, UserPlus, User, AtSign } from 'lucide-react';
import { Button } from '../Common/Button';

interface AddContactScreenProps {
  onBack: () => void;
  onSave: (name: string, vpa: string) => void;
  isLoading?: boolean;
}

export const AddContactScreen: React.FC<AddContactScreenProps> = ({
  onBack,
  onSave,
  isLoading = false,
}) => {
  const [name, setName] = useState('');
  const [vpa, setVpa] = useState('');
  const [error, setError] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !vpa.trim()) {
      setError('Please enter both contact name and UPI ID.');
      return;
    }

    setError('');
    onSave(name.trim(), vpa.trim());
  };

  return (
    <div className="w-full max-w-xl mx-auto animate-fadeIn">
      <div className="mb-6">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-primary transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Payment
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <UserPlus className="w-8 h-8 text-primary" />
          </div>

          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Add Contact
          </h1>

          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Add a new contact to your Smart GPay contacts.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Contact Name
            </label>

            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError('');
                }}
                placeholder="e.g. Rahul Sharma"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              UPI ID
            </label>

            <div className="relative">
              <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

              <input
                type="text"
                value={vpa}
                onChange={(e) => {
                  setVpa(e.target.value);
                  setError('');
                }}
                placeholder="e.g. rahul@upi"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <Button
            type="submit"
            isLoading={isLoading}
            size="lg"
            className="w-full"
            leftIcon={<UserPlus className="w-5 h-5" />}
          >
            Add Contact
          </Button>
        </form>
      </div>
    </div>
  );
};