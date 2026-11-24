import React from 'react';
import {
  Sparkles,
  CheckCircle2,
  X,
  Layers,
  ArrowRight,
  ShieldCheck,
  Moon,
  Smartphone,
} from 'lucide-react';

export const CURRENT_APP_VERSION = 'v3.0';

const UpdateAnnouncementModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#1D332E] rounded-3xl border border-[#E4E5DC] dark:border-[#355047] shadow-2xl overflow-hidden text-[#27332F] dark:text-[#F1F5F2] animate-in zoom-in-95 duration-200">
        
        {/* Header Ribbon / Banner */}
        <div className="p-6 bg-gradient-to-r from-[#183B3A] via-[#1D332E] to-[#245451] text-white relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-[#D9A441]/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-start justify-between relative z-10">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-2xl bg-[#D9A441]/20 border border-[#D9A441]/40 text-[#D9A441]">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-black tracking-tight text-white">
                    Pembaruan Sistem Tersedia
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-[#D9A441] text-[#183B3A] shadow-sm">
                    {CURRENT_APP_VERSION}
                  </span>
                </div>
                <p className="text-xs text-[#A8D3C8] mt-0.5">
                  SAMBA ASSET Enterprise Major Release
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-[#A8D3C8] hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto no-scrollbar text-xs">
          <p className="text-[#718078] dark:text-[#B8CCC3] leading-relaxed">
            Selamat datang di <strong>SAMBA ASSET v3.0</strong>! Pembaruan besar ini menghadirkan perombakan total pada antarmuka pengguna, sistem tema, dan navigasi untuk mendukung efisiensi operasional pengelolaan aset nasional.
          </p>

          <div className="space-y-3 pt-1">
            <div className="p-3 rounded-2xl bg-[#F8F7F2] dark:bg-[#223B35] border border-[#E4E5DC] dark:border-[#355047] flex items-start space-x-3">
              <div className="p-1.5 rounded-xl bg-[#DDF3EC] dark:bg-[#31584C] text-[#0F766E] dark:text-[#8DD6BB] shrink-0 mt-0.5">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-[#27332F] dark:text-[#F1F5F2] block font-bold text-xs">
                  Sidebar Navigation Fleksibel (260px / 76px)
                </strong>
                <span className="text-[#718078] dark:text-[#829A8F] text-[11px] leading-tight block mt-0.5">
                  Navigasi horizontal lama kini digantikan sidebar kiri yang dapat diciutkan dan diperluas dengan hierarki menu terstruktur.
                </span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#F8F7F2] dark:bg-[#223B35] border border-[#E4E5DC] dark:border-[#355047] flex items-start space-x-3">
              <div className="p-1.5 rounded-xl bg-[#DDF3EC] dark:bg-[#31584C] text-[#0F766E] dark:text-[#8DD6BB] shrink-0 mt-0.5">
                <Moon className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-[#27332F] dark:text-[#F1F5F2] block font-bold text-xs">
                  Dark Mode Eksklusif & Identitas Forest Green
                </strong>
                <span className="text-[#718078] dark:text-[#829A8F] text-[11px] leading-tight block mt-0.5">
                  Sistem warna baru: Forest Green & Warm Neutral untuk mode terang, serta Deep Forest & Light Mint untuk mode gelap.
                </span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#F8F7F2] dark:bg-[#223B35] border border-[#E4E5DC] dark:border-[#355047] flex items-start space-x-3">
              <div className="p-1.5 rounded-xl bg-[#DDF3EC] dark:bg-[#31584C] text-[#0F766E] dark:text-[#8DD6BB] shrink-0 mt-0.5">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-[#27332F] dark:text-[#F1F5F2] block font-bold text-xs">
                  Ikon & Identitas Logo Baru
                </strong>
                <span className="text-[#718078] dark:text-[#829A8F] text-[11px] leading-tight block mt-0.5">
                  Logo hex "S" untuk ikon aplikasi browser & PWA, serta logo tumpukan dimensi untuk portal autentikasi.
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#DDF3EC] dark:bg-[#31584C]/40 border border-[#0F766E]/30 dark:border-[#355047] text-[#0F766E] dark:text-[#8DD6BB] text-[11px] flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#16845B] dark:text-[#8DD6BB]" />
            <span>Seluruh data master, API, dan hak akses RBAC Anda tetap aman dan berjalan normal.</span>
          </div>
        </div>

        {/* Footer Action */}
        <div className="p-4 px-6 border-t border-[#E4E5DC] dark:border-[#355047] bg-[#F8F7F2] dark:bg-[#142522] flex items-center justify-between">
          <span className="text-[11px] text-[#718078] dark:text-[#829A8F]">
            Versi Aktif: <strong>{CURRENT_APP_VERSION}</strong>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#16845B] text-white font-bold text-xs shadow-md shadow-[#0F766E]/20 transition-all flex items-center space-x-2 active:scale-95"
          >
            <span>Mengerti & Lanjutkan</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};

export default UpdateAnnouncementModal;
