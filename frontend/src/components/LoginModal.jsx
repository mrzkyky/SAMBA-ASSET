import React, { useState } from 'react';
import { Network, Lock, User as UserIcon, LogIn, AlertCircle } from 'lucide-react';
import { login } from '../api';

const LoginModal = ({ isOpen, onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const performLogin = async (userToLogin, passToLogin) => {
    setLoading(true);
    setError('');

    try {
      const res = await login(userToLogin, passToLogin);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      onLoginSuccess(res.data.user);
    } catch (err) {
      setError(err.response?.data?.debug_info || err.response?.data?.error || 'Gagal masuk. Periksa username dan password Anda.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    performLogin(username, password);
  };

  const handleQuickDemo = (demoUser, demoPass) => {
    setUsername(demoUser);
    setPassword(demoPass);
    performLogin(demoUser, demoPass);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Modal Header */}
        <div className="p-6 bg-slate-950 border-b border-slate-800 text-center relative">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-white border border-slate-700 p-1 flex items-center justify-center shadow-lg shadow-cyan-500/20 mb-3 overflow-hidden">
            <img src="/favicon.png" alt="SAMBA Logo" className="w-full h-full object-contain rounded-xl" />
          </div>
          <h2 className="text-xl font-bold text-white">Masuk Sistem SAMBA Asset</h2>
          <p className="text-xs text-slate-400 mt-1">System Asset Management Branch & Associates • Terproteksi JWT</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Username</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <UserIcon className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username Anda"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password Anda"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center space-x-2 active:scale-95"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? 'Memverifikasi Sesi...' : 'Masuk ke Dashboard'}</span>
          </button>
        </form>

        {/* Quick Demo Login Preset Buttons */}
        <div className="p-4 bg-slate-950/60 border-t border-slate-800 text-center space-y-2">
          <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Coba Akun Demo Cepat (1-Klik):</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('admin', 'admin123')}
              className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-semibold transition-all active:scale-95 shadow-sm"
            >
              Super Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('admin_brebes', 'brebes123')}
              className="px-3 py-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/30 text-xs font-semibold transition-all active:scale-95 shadow-sm"
            >
              Admin Brebes
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('auditor', 'auditor123')}
              className="px-3 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 text-xs font-semibold transition-all active:scale-95 shadow-sm"
            >
              Auditor
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginModal;
