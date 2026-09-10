import React from 'react';
import { Sun, Moon, Zap, Settings } from 'lucide-react';
import { useUserStore } from '../../store/userStore';
import { useUIStore } from '../../store/uiStore';
import { formatCurrency } from '../../utils/formatters';

export const Header: React.FC = () => {
  const { user, isDarkMode, toggleDarkMode } = useUserStore();
const { setActiveTab } = useUIStore();

   return (
    <header className="sticky top-0 z-40 w-full glass-nav bg-white/80 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* Brand logo */}
        <div
          className="flex items-center space-x-3 cursor-pointer"
          onClick={() => setActiveTab('payment')}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-primary-500/20">
            <Zap className="w-6 h-6 fill-current text-white" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-extrabold text-lg text-slate-900 dark:text-white tracking-tight">
                Smart <span className="text-primary">GPay</span>
              </span>

              <span className="text-[10px] bg-primary-100 dark:bg-primary-950 text-primary font-bold px-2 py-0.5 rounded-full border border-primary-200 dark:border-primary-800">
                AI Powered
              </span>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
              Natural Language Assistant
            </p>
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">

          {/* Balance badge */}
          <div
            onClick={() => setActiveTab('dashboard')}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-primary transition cursor-pointer"
          >
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Balance:
            </span>

            <span className="text-xs font-bold font-mono text-slate-900 dark:text-emerald-400">
              {formatCurrency(user?.balance ?? 0)}
            </span>
          </div>

          {/* Dark mode toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            aria-label="Toggle Dark Mode"
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-slate-700" />
            )}
          </button>

          {/* Settings */}
          <button
            onClick={() => setActiveTab('settings')}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>

        </div>
      </div>
    </header>
  );
};

  