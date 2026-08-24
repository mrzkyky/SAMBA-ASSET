import React, { useState } from 'react';
import {
  Lock,
  User as UserIcon,
  Mail,
  LogIn,
  UserPlus,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  ArrowLeft,
  ShieldAlert,
} from 'lucide-react';
import { login, registerUser, verifyEmailOTP, resendOTP } from '../api';
import sambaIcon from '../assets/samba-icon.png';

const LoginModal = ({ isOpen, onLoginSuccess }) => {
  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'verify_otp'
  
  // Login Form States
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register Form States
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // OTP Form States
  const [targetEmail, setTargetEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Common States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  // 1. Handle User Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const res = await login(loginIdentifier, loginPassword);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      onLoginSuccess(res.data.user);
    } catch (err) {
      if (err.response?.data?.is_unverified) {
        setTargetEmail(err.response.data.email);
        setMode('verify_otp');
        setError('Akun Anda belum diverifikasi. Masukkan kode OTP yang telah dikirim ke email Anda.');
      } else {
        setError(err.response?.data?.error || 'Gagal masuk. Periksa kembali username dan password Anda.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle User Self-Registration
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (regPassword !== regConfirmPassword) {
      setError('Konfirmasi password tidak cocok dengan password yang dimasukkan.');
      return;
    }

    if (regPassword.length < 6) {
      setError('Password minimal harus 6 karakter.');
      return;
    }

    setLoading(true);
    try {
      const res = await registerUser({
        username: regUsername,
        email: regEmail,
        password: regPassword,
      });

      setTargetEmail(regEmail);
      setSuccessMessage(res.message || 'Pendaftaran berhasil! Silakan masukkan kode OTP dari email Anda.');
      setMode('verify_otp');
      startCooldownTimer();
    } catch (err) {
      setError(err.response?.data?.error || 'Pendaftaran gagal. Pastikan username dan email belum pernah digunakan.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Handle OTP Verification
  const handleVerifyOTPSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (otpCode.length < 6) {
      setError('Masukkan 6-digit kode OTP lengkap.');
      return;
    }

    setLoading(true);
    try {
      const res = await verifyEmailOTP(targetEmail, otpCode);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setSuccessMessage('Verifikasi berhasil! Mengalihkan ke Dashboard...');
      setTimeout(() => {
        onLoginSuccess(res.data.user);
      }, 800);
    } catch (err) {
      setError(err.response?.data?.error || 'Kode OTP salah atau telah kadaluwarsa.');
    } finally {
      setLoading(false);
    }
  };

  // 4. Handle Resend OTP Code
  const handleResendOTP = async () => {
    if (resendCooldown > 0 || !targetEmail) return;
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const res = await resendOTP(targetEmail);
      setSuccessMessage(res.message || 'Kode OTP baru telah dikirim ke email Anda.');
      startCooldownTimer();
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal mengirim ulang kode OTP.');
    } finally {
      setLoading(false);
    }
  };

  const startCooldownTimer = () => {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Modal Header */}
        <div className="p-6 bg-slate-950 border-b border-slate-800 text-center relative">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-950 border border-cyan-500/30 p-1 flex items-center justify-center shadow-xl shadow-cyan-500/25 mb-3 overflow-hidden">
            <img src={sambaIcon} alt="SAMBA Logo" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">SAMBA ASSET</h2>
          <p className="text-xs text-slate-400 mt-1">System Asset Management Branch & Associates</p>
        </div>

        {/* Tab Selector: Login vs Register (Visible when not in OTP mode) */}
        {mode !== 'verify_otp' && (
          <div className="grid grid-cols-2 p-1.5 bg-slate-950/60 border-b border-slate-800/80 m-4 rounded-xl">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); setSuccessMessage(''); }}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
                mode === 'login'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Masuk (Login)</span>
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(''); setSuccessMessage(''); }}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
                mode === 'register'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Daftar Akun Baru</span>
            </button>
          </div>
        )}

        <div className="p-6 pt-2">
          {/* Feedback Alerts */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="flex-1">{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="flex-1">{successMessage}</span>
            </div>
          )}

          {/* ==================================================== */}
          {/* MODE 1: LOGIN FORM */}
          {/* ==================================================== */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Username atau Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="Masukkan username / email Anda"
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
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Masukkan password Anda"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-50"
              >
                <LogIn className="w-4 h-4" />
                <span>{loading ? 'Memverifikasi Sesi...' : 'Masuk ke Dashboard'}</span>
              </button>
            </form>
          )}

          {/* ==================================================== */}
          {/* MODE 2: REGISTER FORM */}
          {/* ==================================================== */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Username</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="Contoh: agus_tech"
                    className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Alamat Email Aktif (Gmail)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="nama@gmail.com"
                    className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition-all"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Kode verifikasi OTP 6-digit akan dikirimkan ke email ini.</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="password"
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Min 6 karakter"
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Ulangi Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="password"
                      required
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="Ulangi password"
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* RBAC Security Note */}
              <div className="p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-cyan-400 text-[11px] flex items-start space-x-2">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-cyan-400" />
                <span>Akun baru otomatis berstatus <strong>Auditor (Read-Only)</strong>. Super Admin dapat memberikan izin Branch Admin/Super Admin setelah akun Anda terdaftar.</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-50"
              >
                <UserPlus className="w-4 h-4" />
                <span>{loading ? 'Mendaftarkan Akun...' : 'Daftar & Kirim Kode OTP'}</span>
              </button>
            </form>
          )}

          {/* ==================================================== */}
          {/* MODE 3: OTP VERIFICATION FORM */}
          {/* ==================================================== */}
          {mode === 'verify_otp' && (
            <form onSubmit={handleVerifyOTPSubmit} className="space-y-4">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 mx-auto rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <KeyRound className="w-6 h-6 animate-pulse" />
                </div>
                <h3 className="text-sm font-bold text-white">Verifikasi Email Anda</h3>
                <p className="text-xs text-slate-400">
                  Masukkan 6-digit kode verifikasi yang dikirim ke:
                </p>
                <p className="text-xs font-mono font-bold text-cyan-400">{targetEmail}</p>
              </div>

              <div>
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full py-3 bg-slate-950 border-2 border-cyan-500/40 rounded-xl text-center text-2xl font-mono font-bold tracking-[0.5em] text-cyan-300 placeholder-slate-700 focus:border-cyan-400 focus:outline-none transition-all shadow-inner"
                />
              </div>

              <button
                type="submit"
                disabled={loading || otpCode.length < 6}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{loading ? 'Memverifikasi Kode OTP...' : 'Aktivasi Akun & Masuk'}</span>
              </button>

              {/* Resend OTP & Back Action */}
              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(''); setSuccessMessage(''); }}
                  className="text-slate-400 hover:text-white flex items-center space-x-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Kembali ke Login</span>
                </button>

                <button
                  type="button"
                  disabled={resendCooldown > 0 || loading}
                  onClick={handleResendOTP}
                  className="text-cyan-400 hover:text-cyan-300 font-semibold disabled:text-slate-600 flex items-center space-x-1"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>{resendCooldown > 0 ? `Kirim Ulang (${resendCooldown}s)` : 'Kirim Ulang OTP'}</span>
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

export default LoginModal;
