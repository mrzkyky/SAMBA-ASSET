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
  Eye,
  EyeOff,
  Building2,
  Layers,
  ShieldCheck,
} from 'lucide-react';
import { login, registerUser, verifyEmailOTP, resendOTP } from '../api';
import sambaStackLogo from '../assets/samba-stack-logo.png';
import sambaSLogo from '../assets/samba-s-logo.png';

const LoginModal = ({ isOpen, onLoginSuccess }) => {
  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'verify_otp'

  // Form States
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register Form States
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

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
    <div className="min-h-screen w-full flex bg-[#F4F2EB] text-[#27332F] font-sans antialiased overflow-x-hidden selection:bg-[#0F766E] selection:text-white">
      
      {/* Container: 2-column Split on Desktop */}
      <div className="w-full flex flex-col lg:flex-row min-h-screen">
        
        {/* ========================================================= */}
        {/* LEFT COLUMN: BRANDING & ENTERPRISE SHOWCASE (FOREST GREEN) */}
        {/* ========================================================= */}
        <div className="lg:w-5/12 xl:w-1/2 bg-gradient-to-br from-[#183B3A] via-[#143231] to-[#112928] border-b lg:border-b-0 lg:border-r border-[#245451] p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden text-[#F4F2EB]">
          
          {/* Subtle Decorative Grid Pattern & Accent Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(#245451_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#0F766E]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#D9A441]/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Branding Section */}
          <div className="relative z-10">
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/95 dark:bg-[#1D332E] border-2 border-[#D9A441]/60 p-2 flex items-center justify-center shadow-xl shadow-[#112928]/40 shrink-0">
                <img src={sambaStackLogo} alt="SAMBA Stack Logo" className="w-full h-full object-contain drop-shadow-sm" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    SAMBA ASSET
                  </h1>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-[#D9A441]/20 text-[#D9A441] border border-[#D9A441]/40">
                    v2.5
                  </span>
                </div>
                <p className="text-xs text-[#A0B0A8] font-medium">
                  System Asset Management Branch & Associates
                </p>
              </div>
            </div>

            {/* Platform Tagline */}
            <div className="space-y-3 max-w-lg mt-6 hidden sm:block">
              <h2 className="text-2xl lg:text-3xl font-extrabold text-white leading-tight tracking-tight">
                Platform Sentralisasi Pengelolaan & Distribusi Aset Skala Nasional
              </h2>
              <p className="text-sm text-[#DDF3EC]/80 leading-relaxed">
                Dirancang untuk pemantauan terstruktur Level 1–4, pelacakan mutasi dan BAST digital, integrasi barcode QR scanner, serta sinkronisasi data master real-time.
              </p>
            </div>

            {/* Enterprise Feature Highlights */}
            <div className="mt-8 space-y-3.5 max-w-md hidden md:block">
              <div className="flex items-start space-x-3 text-xs text-[#F4F2EB]">
                <div className="p-1.5 rounded-lg bg-[#D9A441]/20 border border-[#D9A441]/40 text-[#D9A441] shrink-0 mt-0.5">
                  <Layers className="w-3.5 h-3.5" />
                </div>
                <div>
                  <strong className="text-white block font-semibold">Struktur Hierarki 4-Level</strong>
                  <span className="text-[#A0B0A8] text-[11px]">Cabang regional, mitra/site spesifik, kategori perangkat, hingga unit aset fisik.</span>
                </div>
              </div>

              <div className="flex items-start space-x-3 text-xs text-[#F4F2EB]">
                <div className="p-1.5 rounded-lg bg-[#0F766E]/30 border border-[#0F766E]/50 text-[#7CD0B8] shrink-0 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <strong className="text-white block font-semibold">Audit Trail & Riwayat Mutasi</strong>
                  <span className="text-[#A0B0A8] text-[11px]">Pencatatan BAST serah-terima otomatis dan log rekam jejak operasional terproteksi.</span>
                </div>
              </div>

              <div className="flex items-start space-x-3 text-xs text-[#F4F2EB]">
                <div className="p-1.5 rounded-lg bg-[#245451] border border-[#245451] text-[#DDF3EC] shrink-0 mt-0.5">
                  <Building2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <strong className="text-white block font-semibold">Integrasi Multi-Cabang & Internal</strong>
                  <span className="text-[#A0B0A8] text-[11px]">Pengelolaan terpadu aset operasional mitra dan aset kantor internal perusahaan.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Branding Area */}
          <div className="relative z-10 pt-8 mt-6 border-t border-[#245451] flex items-center justify-between text-xs text-[#A0B0A8]">
            <span className="text-[11px]">SAMBA ASSET Enterprise Edition</span>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#16845B] animate-pulse" />
              <span className="text-[11px] text-[#DDF3EC] font-medium">Sistem Aktif & Terverifikasi</span>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: AUTHENTICATION PANEL (WARM NEUTRAL / WHITE)  */}
        {/* ========================================================= */}
        <div className="lg:w-7/12 xl:w-1/2 bg-[#F4F2EB] dark:bg-[#172A27] p-6 sm:p-12 lg:p-16 flex items-center justify-center">
          <div className="w-full max-w-md bg-white dark:bg-[#1D332E] p-7 sm:p-9 rounded-2xl border border-[#E4E5DC] dark:border-[#355047] shadow-sm space-y-6">
            
            {/* Form Title & Subtitle */}
            <div className="space-y-1.5 text-center sm:text-left">
              <h3 className="text-xl sm:text-2xl font-bold text-[#27332F] dark:text-[#F1F5F2] tracking-tight">
                {mode === 'login' && 'Masuk ke Portal'}
                {mode === 'register' && 'Pendaftaran Akun Baru'}
                {mode === 'verify_otp' && 'Verifikasi Email (OTP)'}
              </h3>
              <p className="text-xs sm:text-sm text-[#718078] dark:text-[#829A8F]">
                {mode === 'login' && 'Gunakan kredensial internal Anda untuk mengakses sistem.'}
                {mode === 'register' && 'Lengkapi formulir untuk membuat akun auditor atau staf.'}
                {mode === 'verify_otp' && 'Periksa kotak masuk email Anda untuk kode aktivasi akun.'}
              </p>
            </div>

            {/* Mode Switcher Tabs (Login vs Register) */}
            {mode !== 'verify_otp' && (
              <div className="grid grid-cols-2 p-1 bg-[#F8F7F2] dark:bg-[#223B35] border border-[#E4E5DC] dark:border-[#355047] rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError('');
                    setSuccessMessage('');
                  }}
                  className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
                    mode === 'login'
                      ? 'bg-[#183B3A] dark:bg-[#31584C] text-white dark:text-[#F1F5F2] shadow-sm'
                      : 'text-[#718078] dark:text-[#829A8F] hover:text-[#27332F] dark:hover:text-[#F1F5F2]'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Masuk (Login)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setError('');
                    setSuccessMessage('');
                  }}
                  className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
                    mode === 'register'
                      ? 'bg-[#183B3A] dark:bg-[#31584C] text-white dark:text-[#F1F5F2] shadow-sm'
                      : 'text-[#718078] dark:text-[#829A8F] hover:text-[#27332F] dark:hover:text-[#F1F5F2]'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Daftar Akun Baru</span>
                </button>
              </div>
            )}

            {/* Feedback Alerts */}
            {error && (
              <div className="p-3.5 rounded-xl bg-[#C94B4B]/10 border border-[#C94B4B]/30 text-[#C94B4B] text-xs flex items-start space-x-2.5 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#C94B4B]" />
                <span className="flex-1 leading-relaxed">{error}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3.5 rounded-xl bg-[#16845B]/10 border border-[#16845B]/30 text-[#16845B] text-xs flex items-start space-x-2.5 animate-in fade-in duration-200">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#16845B]" />
                <span className="flex-1 leading-relaxed">{successMessage}</span>
              </div>
            )}

            {/* ==================================================== */}
            {/* 1. LOGIN FORM */}
            {/* ==================================================== */}
            {mode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-[#27332F] dark:text-[#F1F5F2] block mb-1.5">
                    Username atau Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#718078] dark:text-[#829A8F]">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      autoComplete="username"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="Masukkan username atau alamat email"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#F8F7F2] dark:bg-[#223B35] border border-[#E4E5DC] dark:border-[#355047] rounded-xl text-xs text-[#27332F] dark:text-[#F1F5F2] placeholder-[#718078] dark:placeholder-[#829A8F] focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/20 focus:bg-white dark:focus:bg-[#1D332E] focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-[#27332F] dark:text-[#F1F5F2]">
                      Password
                    </label>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#718078] dark:text-[#829A8F]">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Masukkan password akun Anda"
                      className="w-full pl-10 pr-10 py-2.5 bg-[#F8F7F2] dark:bg-[#223B35] border border-[#E4E5DC] dark:border-[#355047] rounded-xl text-xs text-[#27332F] dark:text-[#F1F5F2] placeholder-[#718078] dark:placeholder-[#829A8F] focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/20 focus:bg-white dark:focus:bg-[#1D332E] focus:outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#718078] dark:text-[#829A8F] hover:text-[#27332F] dark:hover:text-[#F1F5F2]"
                      title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Primary Button (Solid Emerald) */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white font-bold text-xs shadow-md shadow-[#0F766E]/20 transition-all flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-50 mt-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Memverifikasi Kredensial...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>Masuk ke Dashboard</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* ==================================================== */}
            {/* 2. REGISTER FORM */}
            {/* ==================================================== */}
            {mode === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div>
                  <label className="text-xs font-semibold text-[#27332F] dark:text-[#F1F5F2] block mb-1">
                    Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#718078] dark:text-[#829A8F]">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      placeholder="Contoh: agus_operasional"
                      className="w-full pl-10 pr-4 py-2 bg-[#F8F7F2] dark:bg-[#223B35] border border-[#E4E5DC] dark:border-[#355047] rounded-xl text-xs text-[#27332F] dark:text-[#F1F5F2] placeholder-[#718078] dark:placeholder-[#829A8F] focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/20 focus:bg-white dark:focus:bg-[#1D332E] focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#27332F] dark:text-[#F1F5F2] block mb-1">
                    Alamat Email Aktif
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#718078] dark:text-[#829A8F]">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="nama@perusahaan.com / nama@gmail.com"
                      className="w-full pl-10 pr-4 py-2 bg-[#F8F7F2] dark:bg-[#223B35] border border-[#E4E5DC] dark:border-[#355047] rounded-xl text-xs text-[#27332F] dark:text-[#F1F5F2] placeholder-[#718078] dark:placeholder-[#829A8F] focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/20 focus:bg-white dark:focus:bg-[#1D332E] focus:outline-none transition-all"
                    />
                  </div>
                  <p className="text-[10px] text-[#718078] dark:text-[#829A8F] mt-1">
                    Kode verifikasi OTP 6-digit akan dikirimkan ke email ini.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-semibold text-[#27332F] dark:text-[#F1F5F2] block mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#718078] dark:text-[#829A8F]">
                        <Lock className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Min 6 karakter"
                        className="w-full pl-9 pr-8 py-2 bg-[#F8F7F2] dark:bg-[#223B35] border border-[#E4E5DC] dark:border-[#355047] rounded-xl text-xs text-[#27332F] dark:text-[#F1F5F2] placeholder-[#718078] dark:placeholder-[#829A8F] focus:border-[#0F766E] focus:outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute inset-y-0 right-0 pr-2 flex items-center text-[#718078] dark:text-[#829A8F] hover:text-[#27332F] dark:hover:text-[#F1F5F2]"
                      >
                        {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#27332F] dark:text-[#F1F5F2] block mb-1">
                      Ulangi Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#718078] dark:text-[#829A8F]">
                        <Lock className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="Ulangi password"
                        className="w-full pl-9 pr-3 py-2 bg-[#F8F7F2] dark:bg-[#223B35] border border-[#E4E5DC] dark:border-[#355047] rounded-xl text-xs text-[#27332F] dark:text-[#F1F5F2] placeholder-[#718078] dark:placeholder-[#829A8F] focus:border-[#0F766E] focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* RBAC Note */}
                <div className="p-3 rounded-xl bg-[#DDF3EC] dark:bg-[#31584C]/40 border border-[#0F766E]/30 dark:border-[#355047] text-[#0F766E] dark:text-[#8DD6BB] text-[11px] flex items-start space-x-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-[#0F766E] dark:text-[#8DD6BB]" />
                  <span>
                    Akun baru otomatis berstatus <strong>Auditor (Read-Only)</strong>. Super Admin dapat memberikan hak akses Branch Admin atau Super Admin melalui panel manajemen pengguna.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white font-bold text-xs shadow-md shadow-[#0F766E]/20 transition-all flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Mendaftarkan Akun...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Daftar & Kirim Kode OTP</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* ==================================================== */}
            {/* 3. OTP VERIFICATION FORM */}
            {/* ==================================================== */}
            {mode === 'verify_otp' && (
              <form onSubmit={handleVerifyOTPSubmit} className="space-y-4">
                <div className="text-center space-y-1.5 p-4 rounded-xl bg-[#F8F7F2] dark:bg-[#223B35] border border-[#E4E5DC] dark:border-[#355047]">
                  <div className="w-12 h-12 mx-auto rounded-full bg-[#DDF3EC] dark:bg-[#31584C]/50 border border-[#0F766E]/30 flex items-center justify-center text-[#0F766E] dark:text-[#8DD6BB]">
                    <KeyRound className="w-6 h-6 animate-pulse" />
                  </div>
                  <h4 className="text-sm font-bold text-[#27332F] dark:text-[#F1F5F2]">Masukkan Kode Verifikasi</h4>
                  <p className="text-xs text-[#718078] dark:text-[#829A8F]">
                    Kami telah mengirimkan 6-digit kode OTP ke:
                  </p>
                  <p className="text-xs font-mono font-bold text-[#0F766E] dark:text-[#8DD6BB]">{targetEmail}</p>
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
                    className="w-full py-3 bg-white dark:bg-[#223B35] border-2 border-[#0F766E]/40 dark:border-[#355047] rounded-xl text-center text-2xl font-mono font-bold tracking-[0.5em] text-[#0F766E] dark:text-[#8DD6BB] placeholder-[#718078]/40 dark:placeholder-[#829A8F]/40 focus:border-[#0F766E] focus:outline-none transition-all shadow-inner"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || otpCode.length < 6}
                  className="w-full py-3 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white font-bold text-xs shadow-md shadow-[#0F766E]/20 transition-all flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Memverifikasi Kode OTP...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Aktivasi Akun & Masuk</span>
                    </>
                  )}
                </button>

                {/* Resend OTP & Back */}
                <div className="flex items-center justify-between text-xs pt-3 border-t border-[#E4E5DC] dark:border-[#355047]">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setError('');
                      setSuccessMessage('');
                    }}
                    className="text-[#718078] dark:text-[#829A8F] hover:text-[#27332F] dark:hover:text-[#F1F5F2] flex items-center space-x-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Kembali ke Login</span>
                  </button>

                  <button
                    type="button"
                    disabled={resendCooldown > 0 || loading}
                    onClick={handleResendOTP}
                    className="text-[#0F766E] dark:text-[#8DD6BB] hover:text-[#115E59] font-semibold disabled:text-[#718078] dark:disabled:text-[#829A8F] flex items-center space-x-1"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    <span>
                      {resendCooldown > 0 ? `Kirim Ulang (${resendCooldown}s)` : 'Kirim Ulang OTP'}
                    </span>
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginModal;
