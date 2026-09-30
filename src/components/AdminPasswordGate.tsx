import React, { useState } from 'react';
import { Lock, ShieldCheck } from 'lucide-react';

// Change this value any time you want a new Admin Portal password.
const ADMIN_PASSWORD = '2565';

interface AdminPasswordGateProps {
  onSuccess: () => void;
}

export const AdminPasswordGate: React.FC<AdminPasswordGateProps> = ({ onSuccess }) => {
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      sessionStorage.setItem('admin_authenticated', 'true');
      setError(null);
      onSuccess();
    } else {
      setError('Incorrect password. Please try again.');
      setPasswordInput('');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl p-6 space-y-5">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-800 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-blue-400" />
          </div>
          <h1 className="font-display text-lg font-bold text-white">Admin Portal Login</h1>
          <p className="text-xs text-neutral-400">
            Enter the admin password to continue. This area is restricted to store staff only.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              autoFocus
              placeholder="Admin password"
              className="w-full pl-9 pr-3 py-3 bg-neutral-950 border border-neutral-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 font-semibold text-center">{error}</p>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md shadow-blue-600/30 transition-all cursor-pointer"
          >
            Unlock Admin Portal
          </button>
        </form>
      </div>
    </div>
  );
};
