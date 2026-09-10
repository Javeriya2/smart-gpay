import { Input } from '../Common/Input';
import { UserService } from '../../services/UserService';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, ArrowLeft } from 'lucide-react';
import { Button } from '../Common/Button';


interface SignUpModalProps {
  isOpen: boolean;
  onBack: () => void;
}

export const SignUpModal: React.FC<SignUpModalProps> = ({
  isOpen,
  onBack,
}) => {
  const [name, setName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [balance, setBalance] = useState('10000');
  const [error, setError] = useState('');
  const [createdUserId, setCreatedUserId] = useState<number | null>(null);

  if (!isOpen) return null;
  if (createdUserId !== null) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" />

      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 sm:p-8 text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
          Account Created 🎉
        </h2>

        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Your Smart GPay account has been created successfully.
        </p>

        <div className="bg-primary/10 rounded-xl p-4 mb-5">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Your User ID
          </p>
          <p className="text-3xl font-bold text-primary mt-1">
            {createdUserId}
          </p>
        </div>

        <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
          Use this User ID or your name to sign in.
        </p>

        <Button
          type="button"
          size="lg"
          className="w-full font-bold"
          onClick={onBack}
        >
          Go to Sign In
        </Button>
      </div>
    </div>
  );
}

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 sm:p-8"
      >
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-primary mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Sign In
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-primary/10">
            <UserPlus className="w-6 h-6 text-primary" />
          </div>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Create Smart GPay Account
          </h2>
        </div>

        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Create a new sandbox user. Your User ID will be generated automatically.
        </p>

        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-xl p-4 mb-5">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            This is a simulated sandbox account and is not connected to a real
            Google Pay profile or bank account.
          </p>
        </div>

      <form
  className="space-y-4"
  onSubmit={async (e) => {
    e.preventDefault();

    if (!name.trim() || !upiId.trim() || !balance.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      const user = await UserService.createUser(
        name.trim(),
        upiId.trim(),
        Number(balance)
      );

      console.log('User created successfully:', user);

      setCreatedUserId(user.userId);
    } catch (error) {
      console.error('Sign up failed:', error);
      setError('Failed to create account. Please check your details.');
    }
  }}
>
  <Input
    label="Name"
    type="text"
    value={name}
    onChange={(e) => {
      setName(e.target.value);
      setError('');
    }}
    placeholder="Enter your name"
  />

  <Input
    label="UPI ID"
    type="text"
    value={upiId}
    onChange={(e) => {
      setUpiId(e.target.value);
      setError('');
    }}
    placeholder="example@upi"
  />

  <Input
    label="Starting Balance"
    type="number"
    value={balance}
    onChange={(e) => {
      setBalance(e.target.value);
      setError('');
    }}
    placeholder="Enter starting balance"
  />

  {error && (
    <p className="text-sm text-red-600">
      {error}
    </p>
  )}

  <Button
    type="submit"
    size="lg"
    className="w-full font-bold"
    leftIcon={<UserPlus className="w-5 h-5" />}
  >
    Create Account
  </Button>
</form>
      </motion.div>
    </div>
  );
};