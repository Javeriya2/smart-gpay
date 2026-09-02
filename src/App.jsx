import React, { useState } from 'react';

function App() {
  const [balance, setBalance] = useState(24500.00);
  const [showBalance, setShowBalance] = useState(true);

  const transactions = [
    { id: 1, name: 'Rahul Sharma', type: 'Received', amount: 1200, date: 'Today, 2:45 PM', status: 'Success' },
    { id: 2, name: 'Electricity Bill', type: 'Paid', amount: 850, date: 'Yesterday', status: 'Success' },
    { id: 3, name: 'Priya Patel', type: 'Sent', amount: 500, date: '28 Aug 2026', status: 'Success' },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans p-4 sm:p-6">
      {/* Top Header */}
      <div className="max-w-xl mx-auto flex justify-between items-center bg-slate-800 p-4 rounded-2xl shadow-lg border border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600 text-white font-bold w-10 h-10 rounded-full flex items-center justify-center text-lg">
            S
          </div>
          <div>
            <h1 className="font-bold text-lg">Smart Gpay</h1>
            <p className="text-xs text-slate-400">Welcome back, User</p>
          </div>
        </div>
        <button 
          onClick={() => alert('Profile settings coming soon!')}
          className="bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-xl text-sm transition"
        >
          Profile
        </button>
      </div>

      {/* Main Content Dashboard */}
      <div className="max-w-xl mx-auto mt-6 space-y-6">
        
        {/* Wallet Balance Card */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-6 rounded-2xl shadow-xl flex justify-between items-center">
          <div>
            <p className="text-indigo-200 text-sm font-medium">Account Balance</p>
            <h2 className="text-3xl font-extrabold mt-1">
              {showBalance ? `₹${balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '••••••••'}
            </h2>
          </div>
          <button 
            onClick={() => setShowBalance(!showBalance)}
            className="bg-white/20 hover:bg-white/30 text-xs px-3 py-2 rounded-lg transition"
          >
            {showBalance ? 'Hide' : 'Show'}
          </button>
        </div>

        {/* Quick Actions Grid */}
        <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-lg">
          <h3 className="text-sm font-semibold text-slate-400 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-4 gap-3 text-center">
            <button onClick={() => alert('Scan QR clicked')} className="bg-slate-700/50 hover:bg-slate-700 p-3 rounded-xl transition flex flex-col items-center justify-center">
              <span className="text-xl mb-1">📷</span>
              <span className="text-xs">Scan QR</span>
            </button>
            <button onClick={() => alert('Pay Contacts clicked')} className="bg-slate-700/50 hover:bg-slate-700 p-3 rounded-xl transition flex flex-col items-center justify-center">
              <span className="text-xl mb-1">👤</span>
              <span className="text-xs">To Contacts</span>
            </button>
            <button onClick={() => alert('Bank Transfer clicked')} className="bg-slate-700/50 hover:bg-slate-700 p-3 rounded-xl transition flex flex-col items-center justify-center">
              <span className="text-xl mb-1">🏦</span>
              <span className="text-xs">Bank Transfer</span>
            </button>
            <button onClick={() => alert('Check Balance clicked')} className="bg-slate-700/50 hover:bg-slate-700 p-3 rounded-xl transition flex flex-col items-center justify-center">
              <span className="text-xl mb-1">📊</span>
              <span className="text-xs">History</span>
            </button>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-lg">
          <h3 className="text-sm font-semibold text-slate-400 mb-3">Recent Transactions</h3>
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex justify-between items-center bg-slate-700/30 p-3 rounded-xl">
                <div>
                  <p className="font-semibold text-sm">{tx.name}</p>
                  <p className="text-xs text-slate-400">{tx.date}</p>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-sm ${tx.type === 'Received' ? 'text-emerald-400' : 'text-slate-200'}`}>
                    {tx.type === 'Received' ? '+' : '-'}₹{tx.amount}
                  </p>
                  <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800">
                    {tx.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;