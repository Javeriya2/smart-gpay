import React, { useState } from 'react';
import {
  Zap,
  Search,
  User,
  ChevronDown,
  ShieldCheck,
  Wallet,
  CreditCard,
  LogOut,
  Settings,
  HelpCircle,
  Bell,
  Sparkles
} from 'lucide-react';
import { MOCK_USER } from '../services/mockApi';

export default function Navbar({ onSearch, currentBalance }) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showBalance, setShowBalance] = useState(false);

  return (
    <header className="sticky top-0 z-50 glass-nav shadow-lg backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">

          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="relative group cursor-pointer">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300 animate-pulse"></div>
              <div className="relative w-10 h-10 sm:w-11 sm:h-11 bg-slate-900 rounded-2xl flex items-center justify-center border border-white/10 shadow-glow-blue">
                <Zap className="w-6 h-6 text-cyan-400 fill-cyan-400/20" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-white font-sans">
                  Smart<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-300">GPay</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 rounded-full flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> AI UPI
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">Natural Language Payments</p>
            </div>
          </div>

          {/* Quick Search Bar */}
          <div className="flex-1 max-w-md mx-2 hidden md:block">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                onChange={(e) => onSearch && onSearch(e.target.value)}
                placeholder="Search contacts, VPAs, or recent transactions..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-800/60 text-slate-200 placeholder-slate-400 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
              />
            </div>
          </div>

          {/* Right Action Items & Profile Avatar Placeholder */}
          <div className="flex items-center gap-3">

            {/* Backend Status Pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Spring Boot API</span>
            </div>

            {/* Notification Bell */}
            <button
              aria-label="Notifications"
              className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 border border-white/5 transition-colors relative"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500"></span>
            </button>

            {/* Profile Avatar & Dropdown Placeholder */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 text-white transition-all shadow-md active:scale-95"
              >
                <div className="relative">
                  <img
                    src={MOCK_USER.avatarUrl}
                    alt={MOCK_USER.name}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl object-cover ring-2 ring-blue-500/40"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-900"></span>
                </div>
                <div className="text-left hidden lg:block">
                  <p className="text-xs font-semibold leading-none text-slate-200">{MOCK_USER.name}</p>
                  <p className="text-[10px] text-cyan-400 font-mono mt-0.5">{MOCK_USER.upiId}</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Dropdown Modal Placeholder */}
              {showProfileMenu && (
                <div
                  className="absolute right-0 mt-2 w-72 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl py-2 z-50 text-slate-200 divide-y divide-white/5 animate-in fade-in slide-in-from-top-2 duration-150"
                  onMouseLeave={() => setShowProfileMenu(false)}
                >
                  <div className="px-4 py-3">
                    <p className="text-sm font-bold text-white">{MOCK_USER.name}</p>
                    <p className="text-xs text-cyan-400 font-mono mt-0.5">{MOCK_USER.upiId}</p>
                    <p className="text-xs text-slate-400 mt-1">{MOCK_USER.phone}</p>
                  </div>

                  {/* Balance Shortcut Card */}
                  <div className="px-4 py-3 bg-gradient-to-r from-blue-900/20 to-slate-800/40">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Wallet className="w-3.5 h-3.5 text-blue-400" /> Bank Balance
                      </span>
                      <button
                        onClick={() => setShowBalance(!showBalance)}
                        className="text-[11px] text-blue-400 hover:text-blue-300 font-medium"
                      >
                        {showBalance ? 'Hide' : 'Check'}
                      </button>
                    </div>
                    <p className="text-lg font-bold text-white tracking-tight font-mono">
                      {showBalance ? `₹${(currentBalance ?? MOCK_USER.balance).toLocaleString('en-IN')}` : '••••••••'}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                      <CreditCard className="w-3 h-3 text-emerald-400" /> {MOCK_USER.bankName}
                    </p>
                  </div>

                  {/* Menu Options */}
                  <div className="py-1 text-xs">
                    <button className="w-full px-4 py-2 text-left hover:bg-white/5 flex items-center gap-2 text-slate-300">
                      <User className="w-4 h-4 text-blue-400" /> Account Settings
                    </button>
                    <button className="w-full px-4 py-2 text-left hover:bg-white/5 flex items-center gap-2 text-slate-300">
                      <Settings className="w-4 h-4 text-purple-400" /> Payment Preferences
                    </button>
                    <button className="w-full px-4 py-2 text-left hover:bg-white/5 flex items-center gap-2 text-slate-300">
                      <HelpCircle className="w-4 h-4 text-amber-400" /> Help & Support
                    </button>
                  </div>

                  <div className="py-1">
                    <button className="w-full px-4 py-2 text-left hover:bg-red-500/10 text-red-400 flex items-center gap-2 text-xs font-medium">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
}
