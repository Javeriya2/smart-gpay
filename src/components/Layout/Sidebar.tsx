import React from 'react';
import { Send, LayoutDashboard, Users, History, Settings } from 'lucide-react';
import { useUIStore, ActiveTab } from '../../store/uiStore';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab } = useUIStore();

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'payment', label: 'Send Money', icon: <Send className="w-5 h-5" /> },
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
      { id: 'contacts', label: 'Contacts', icon: <Users className="w-5 h-5" /> },
    { id: 'transactions', label: 'History', icon: <History className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 p-4 space-y-2 border-r border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 min-h-[calc(100vh-4rem)]">
      <div className="text-xs font-semibold text-slate-400 uppercase px-3 py-2">Navigation</div>
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              isActive
                ? 'bg-primary text-white shadow-md shadow-primary-500/20'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        );
      })}
    </aside>
  );
};
