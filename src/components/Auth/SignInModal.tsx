import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Info, ArrowRight, Database } from 'lucide-react';
import { Button } from '../Common/Button';
import { Input } from '../Common/Input';
import { UserService } from '../../services/UserService';
import { useUserStore } from '../../store/userStore';
import { SignUpModal } from './SignUpModal';


export interface SignInModalProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const SignInModal: React.FC<SignInModalProps> = ({ isOpen, onClose }) => {
  
const { loginUser } = useUserStore();
 const [loginInput, setLoginInput] = useState('');
  const [error, setError] = useState('');
const [showSignUp, setShowSignUp] = useState(false);

  if (!isOpen) return null;
  if (showSignUp) {
  return (
    <SignUpModal
      isOpen={true}
      onBack={() => setShowSignUp(false)}
    />
  );
} 
const handleSubmit = async (e: React.FormEvent) => {
e.preventDefault();

if (!loginInput.trim()) {
  setError('Please enter your User ID or Name.');
  return;
}

try {
  const input = loginInput.trim();

  const user = /^\d+$/.test(input)
    ? await UserService.getUserById(Number(input))
    : await UserService.getUserByName(input);

  loginUser(user);

} catch (error) {
  console.error('Sign in failed:', error);
  setError('User not found. Please check your User ID or Name.');
}
};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Dark backdrop */}
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" />

      {/* Modal Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 p-6 sm:p-8 space-y-6"
      >
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-primary-500/20">
            <Zap className="w-8 h-8 fill-current text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-heading">
            Sign In to Smart GPay
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Connect your user profile from your PostgreSQL <code className="text-primary font-bold">users</code> database table.
          </p>
        </div>

        {/* Informative Notice Badge */}
        <div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/60 rounded-2xl p-4 flex items-start space-x-3 text-xs text-slate-700 dark:text-slate-300">
          <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-primary">Simulated Sandbox Environment Notice</p>
            <p className="text-slate-600 dark:text-slate-400">
This is a sandbox application and is not connected to your live Google Pay profile or bank account. Your account details and balance are loaded from the Smart GPay database.            </p>
          </div>
        </div>

        {/* Sign In Form */}
        {/* Sign In Form */}
<form onSubmit={handleSubmit} className="space-y-4">
  <Input
    label="User ID or Name"
    type="text"
    value={loginInput}
    onChange={(e) => {
      setLoginInput(e.target.value);
      setError('');
    }}
    placeholder="Enter your User ID or Name"
    leftIcon={<Database className="w-4 h-4" />}
  />

  <p className="text-xs text-slate-500 dark:text-slate-400">
    Your details such as Name, UPI ID and balance will be loaded automatically
    from the database.
  </p>

  {error && (
    <p className="text-xs text-error font-semibold bg-red-50 dark:bg-red-950/40 p-2.5 rounded-xl border border-red-200 dark:border-red-800">
      ⚠️ {error}
    </p>
  )}

  <Button
    type="submit"
    size="lg"
    className="w-full font-bold shadow-lg shadow-primary-500/25 mt-2"
    rightIcon={<ArrowRight className="w-5 h-5" />}
  >
    Sign In & Open Smart GPay
  </Button>
</form>
<div className="text-center pt-2">
  <p className="text-xs text-slate-500 dark:text-slate-400">
    New to Smart GPay?
  </p>
  <button
    type="button"
    onClick={() => setShowSignUp(true)}
    className="text-sm font-semibold text-primary hover:underline mt-1"
  >
    Create a new account
  </button>
</div>
      </motion.div>
    </div>
  );
};
