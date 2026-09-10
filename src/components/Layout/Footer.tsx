import React from 'react';
import { Send, LayoutDashboard, History, Settings } from 'lucide-react';
import { useUIStore, ActiveTab } from '../../store/uiStore';

export const Footer: React.FC = () => {
  const { activeTab, setActiveTab } = useUIStore();

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'payment', label: 'Pay', icon: <Send className="w-5 h-5" /> },
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'transactions', label: 'History', icon: <History className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <>
      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 flex justify-around items-center px-2 py-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center min-w-[64px] py-1 text-[11px] font-medium transition-colors ${
                isActive ? 'text-primary font-bold' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <div className={`p-1 rounded-full ${isActive ? 'bg-primary-100 dark:bg-primary-950 text-primary' : ''}`}>
                {item.icon}
              </div>
              <span className="mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Desktop Footer */}
      <footer className="hidden md:block py-6 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <p>© 2026 Smart GPay — AI Natural Language Payment System. All rights reserved.</p>
          <div className="flex space-x-4">
            <span className="hover:underline cursor-pointer">Privacy</span>
            <span className="hover:underline cursor-pointer">Terms</span>
            <span className="hover:underline cursor-pointer">Security</span>
          </div>
        </div>
      </footer>
    </>
  );
};
