import React, { useState, useEffect } from 'react';
import { X, Printer, QrCode, SlidersHorizontal, Check, RefreshCw, Layers, ShieldCheck, Tag, ExternalLink } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { parseSNList } from './HierarchyView';
import { resolveRegionCode } from '../utils/regionCodes';

// Vector Logo Rapid Network with upward 3D Arrow (Faithful to physical sticker)
export const RapidLogo = ({ className = "h-7", dark = false }) => {
  const primaryColor = dark ? "#ffffff" : "#0d2b5c";
  const secondaryColor = dark ? "#38bdf8" : "#1e88e5";

  return (
    <div className={`inline-flex flex-col select-none leading-none ${className}`}>
      <div className="flex items-center">
        <span
          style={{ color: primaryColor }}
          className="font-black text-xl tracking-tighter lowercase font-sans"
        >
          rapi
        </span>
        <div className="relative flex items-center">
          <span
            style={{ color: primaryColor }}
            className="font-black text-xl tracking-tighter lowercase font-sans"
          >
            d
          </span>
          {/* 3D Arrow pointing up */}
          <svg viewBox="0 0 20 28" className="w-3.5 h-5 ml-0.5" fill="none">
            {/* Left dark side */}
            <path d="M10 2 L2 11 H6 V26 H10 V2 Z" fill={primaryColor} />
            {/* Right light/bright side */}
            <path d="M10 2 L18 11 H14 V26 H10 V2 Z" fill={secondaryColor} />
          </svg>
        </div>
      </div>
      <span
        style={{ color: primaryColor }}
        className="text-[6.5px] font-bold tracking-[0.28em] uppercase -mt-0.5 pl-0.5"
      >
        network
      </span>
    </div>
  );
};

// Official Contact Icons
const PhoneIcon = () => (
  <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded bg-[#10b981] text-white p-0.5 mr-1 shrink-0">
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-2.5 h-2.5">
      <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
    </svg>
  </span>
);

const WhatsAppIcon = () => (
  <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded bg-[#25d366] text-white p-0.5 mr-1 shrink-0">
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-2.5 h-2.5">
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm5.79 14.07c-.24.68-1.4 1.3-1.95 1.38-.5.08-1.14.12-3.69-.93-3.26-1.34-5.35-4.65-5.51-4.87-.16-.21-1.33-1.77-1.33-3.38 0-1.61.84-2.4 1.14-2.73.3-.32.65-.4 0.87-.4.21 0 .43 0 .62.01.2.01.47-.08.73.55.27.64.91 2.22.99 2.38.08.16.14.35.03.56-.11.22-.16.35-.32.54-.16.19-.34.42-.48.56-.16.16-.33.34-.14.66.19.32.84 1.38 1.8 2.23 1.24 1.1 2.28 1.44 2.61 1.6.32.16.51.14.7-.08.19-.22.81-.94 1.03-1.27.22-.32.43-.27.73-.16.3.11 1.89.89 2.21 1.05.32.16.54.24.62.38.08.14.08.81-.16 1.49z" />
    </svg>
  </span>
);

const MailIcon = () => (
  <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded bg-white text-[#ea4335] border border-red-200 p-0.5 mr-1 shadow-xs shrink-0">
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-2.5 h-2.5">
      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
    </svg>
  </span>
);

const QRCodeModal = ({ isOpen, onClose, asset }) => {
  const [selectedSNIndex, setSelectedSNIndex] = useState('ALL');
  const [activeTemplate, setActiveTemplate] = useState('landscape'); // 'landscape' (Foto 1), 'circle' (Foto 2), 'compact'
  const [printLayout, setPrintLayout] = useState('grid'); // 'grid' (A4 2-kolom) or 'single' (thermal label roll)
  const [showConfig, setShowConfig] = useState(false);

  // Dynamic configuration state with smart defaults
  const [config, setConfig] = useState({
    siteName: '',
    siteCode: '3329',
    prefix: 'AT/ADM',
    year: '2026',
    customSeq: '',
    companyName: 'PT Media Cepat Indonesia',
    brandName: 'Rapid Network',
    phone: '(0283) 617 4011',
    wa: '0812 1474 5080',
    email: 'helpdesk@rapid.net.id',
    qrPayloadType: 'sn', // 'sn' or 'url'
    resolvedRegion: null,
  });

  useEffect(() => {
    setSelectedSNIndex('ALL');
    if (asset) {
      // Deteksi otomatis Kode Wilayah dari alamat site, nama site, atau cabang (kodewilayah.web.id)
      const resolved = resolveRegionCode(asset.site, asset.site?.branch);
      const yearStr = asset.created_at ? new Date(asset.created_at).getFullYear().toString() : new Date().getFullYear().toString();
      const derivedSiteName = resolved.name ? `Site ${resolved.name}` : (asset.site?.site_name ? `Site ${asset.site.site_name}` : 'Site Kab. Brebes');
      const sequence = String(asset.id || 1).padStart(4, '0');

      setConfig((prev) => ({
        ...prev,
        siteName: derivedSiteName,
        siteCode: resolved.code, // Otomatis memakai kode Kemendagri 4 digit (misal: 3329)
        year: yearStr,
        customSeq: sequence,
        resolvedRegion: resolved,
      }));
    }
  }, [asset, isOpen]);

  if (!isOpen || !asset) return null;

  const handlePrint = () => {
    window.print();
  };

  const branchName = asset.site?.branch?.name || 'Nasional';
  const partnerName = asset.site?.partner_name || '';
  const siteName = asset.site?.site_name || '';
  const categoryName = asset.category?.name || 'Perangkat';

  const snList = parseSNList(asset.serial_number);
  const printSNs = selectedSNIndex === 'ALL' ? snList : [snList[parseInt(selectedSNIndex, 10)]];

  // Helper to generate dynamic Asset Registration Number
  const getAssetNumber = (index = 0) => {
    const seq = config.customSeq
      ? (printSNs.length > 1 ? `${config.customSeq}-${index + 1}` : config.customSeq)
      : String(asset.id || 1).padStart(4, '0');
    return `${config.prefix}/${config.siteCode}/${config.year}/${seq}`;
  };

  // Helper to get QR code payload
  const getQRPayload = (snItem) => {
    if (config.qrPayloadType === 'url') {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://samba-asset.rapid.net.id';
      return `${origin}/?sn=${encodeURIComponent(snItem || '')}`;
    }
    return snItem || `ASSET-${asset.id}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      
      {/* High Quality Print CSS Override */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-qr-modal, #printable-qr-modal * {
            visibility: visible !important;
          }
          #printable-qr-modal {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 8mm !important;
            background: #ffffff !important;
            color: #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
          .sticker-item {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
            margin-bottom: 6mm !important;
          }
        }
      `}</style>

      <div className="w-full max-w-4xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in duration-200">
        
        {/* Modal Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between no-print">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-white">Stiker Label QR Code Inventaris</h3>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  Official Rapid Network
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Format stiker resmi siap cetak untuk fisik perangkat & rack
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setShowConfig(!showConfig)}
              className={`p-1.5 rounded-xl border transition-colors flex items-center space-x-1.5 text-xs px-2.5 font-medium ${
                showConfig
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-800'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>{showConfig ? 'Tutup Pengaturan' : 'Sesuaikan Format'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Template Selector Bar & SN Selector */}
        <div className="p-3 bg-slate-950/80 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2.5 no-print text-xs">
          
          {/* Template Tabs */}
          <div className="flex items-center space-x-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTemplate('landscape')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 transition-all ${
                activeTemplate === 'landscape'
                  ? 'bg-[#005ba4] text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Aktiva Tetap (Landscape)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTemplate('circle')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 transition-all ${
                activeTemplate === 'circle'
                  ? 'bg-[#005ba4] text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Segel Bulat (Badge)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTemplate('compact')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 transition-all ${
                activeTemplate === 'compact'
                  ? 'bg-[#005ba4] text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Kompak Thermal</span>
            </button>
          </div>

          {/* Controls: SN Selector & Print Layout Mode */}
          <div className="flex items-center space-x-2">
            {snList.length > 1 && (
              <div className="flex items-center space-x-1.5 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                <span className="text-slate-400 font-medium">Unit:</span>
                <select
                  value={selectedSNIndex}
                  onChange={(e) => setSelectedSNIndex(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-cyan-400 font-semibold focus:outline-none"
                >
                  <option value="ALL">Semua ({snList.length} Unit)</option>
                  {snList.map((sn, idx) => (
                    <option key={idx} value={idx}>
                      Unit {idx + 1}: {sn}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-[11px]">
              <span className="text-slate-400 px-1 font-medium">Layout:</span>
              <button
                type="button"
                onClick={() => setPrintLayout('grid')}
                className={`px-2 py-0.5 rounded font-semibold transition-colors ${
                  printLayout === 'grid' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-white'
                }`}
                title="2 Kolom per halaman (Kertas Stiker A4)"
              >
                A4 (2 Kolom)
              </button>
              <button
                type="button"
                onClick={() => setPrintLayout('single')}
                className={`px-2 py-0.5 rounded font-semibold transition-colors ${
                  printLayout === 'single' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-white'
                }`}
                title="1 Kolom tengah (Printer Stiker Label Roll Thermal)"
              >
                Roll Label
              </button>
            </div>
          </div>

        </div>

        {/* Customization Drawer */}
        {showConfig && (
          <div className="p-4 bg-slate-900/95 border-b border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs no-print animate-in slide-in-from-top-2 duration-150">
            {/* Live Region Indicator */}
            {config.resolvedRegion && (
              <div className="col-span-2 sm:col-span-4 bg-blue-500/10 border border-blue-500/30 rounded-xl p-2.5 flex items-center justify-between text-xs flex-wrap gap-2">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                  <span className="text-cyan-300 font-bold">Wilayah Terdeteksi:</span>
                  <span className="text-white font-mono font-black px-1.5 py-0.5 bg-slate-950 rounded border border-slate-800">
                    {config.resolvedRegion.code}
                  </span>
                  <span className="text-slate-200 font-semibold">{config.resolvedRegion.name}</span>
                  <span className="text-slate-400 text-[11px]">(via {config.resolvedRegion.source})</span>
                </div>
                <a
                  href={`https://kodewilayah.web.id/`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center space-x-1"
                >
                  <span>cek di kodewilayah.web.id</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            <div>
              <label className="block text-slate-400 font-medium mb-1">Prefix Nomor</label>
              <input
                type="text"
                value={config.prefix}
                onChange={(e) => setConfig({ ...config, prefix: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white font-mono"
                placeholder="AT/ADM"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Kode Site / Daerah</label>
              <input
                type="text"
                value={config.siteCode}
                onChange={(e) => setConfig({ ...config, siteCode: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white font-mono"
                placeholder="3329"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Tahun Registrasi</label>
              <input
                type="text"
                value={config.year}
                onChange={(e) => setConfig({ ...config, year: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white font-mono"
                placeholder="2026"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Urutan No. / ID Aset</label>
              <input
                type="text"
                value={config.customSeq}
                onChange={(e) => setConfig({ ...config, customSeq: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white font-mono"
                placeholder="0001"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Label Nama Site</label>
              <input
                type="text"
                value={config.siteName}
                onChange={(e) => setConfig({ ...config, siteName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white"
                placeholder="Site Kab. Brebes"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">WhatsApp Helpdesk</label>
              <input
                type="text"
                value={config.wa}
                onChange={(e) => setConfig({ ...config, wa: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white"
                placeholder="0812 1474 5080"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Telepon Kantor</label>
              <input
                type="text"
                value={config.phone}
                onChange={(e) => setConfig({ ...config, phone: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white"
                placeholder="(0283) 617 4011"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Data dalam QR Code</label>
              <select
                value={config.qrPayloadType}
                onChange={(e) => setConfig({ ...config, qrPayloadType: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-cyan-400 font-semibold"
              >
                <option value="sn">Serial Number (SN Murni)</option>
                <option value="url">Link SAMBA-Asset Web</option>
              </select>
            </div>
          </div>
        )}

        {/* Printable Badge Preview Container */}
        <div
          id="printable-qr-modal"
          className="p-4 sm:p-6 bg-slate-950/60 max-h-[68vh] overflow-y-auto"
        >
          <div
            className={`grid gap-4 sm:gap-6 ${
              printLayout === 'grid'
                ? 'grid-cols-1 md:grid-cols-2'
                : 'grid-cols-1 max-w-lg mx-auto'
            }`}
          >
            {printSNs.map((snItem, idx) => {
              const assetNo = getAssetNumber(idx);
              const qrPayload = getQRPayload(snItem);

              /* ========================================================================= */
              /* TEMPLATE 1: LANDSCAPE AKTIVA TETAP (FAITHFUL TO PHOTO 1)                   */
              /* ========================================================================= */
              if (activeTemplate === 'landscape') {
                return (
                  <div
                    key={idx}
                    className="sticker-item bg-white text-slate-900 border border-slate-300 rounded-xl overflow-hidden shadow-lg flex flex-col justify-between select-none"
                    style={{
                      fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
                    }}
                  >
                    {/* Upper Section */}
                    <div className="p-3 pb-2 space-y-2">
                      
                      {/* Top Bar: Logo (Left) and Pill + Site (Right) */}
                      <div className="flex items-start justify-between">
                        <RapidLogo className="h-7" />
                        <div className="text-right flex flex-col items-end">
                          <div className="bg-[#005ba4] text-white px-3 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase inline-block shadow-xs">
                            AKTIVA TETAP (ASSET)
                          </div>
                          <div className="text-slate-800 font-extrabold text-[10px] mt-0.5 tracking-tight">
                            {config.siteName || `Site ${siteName || 'Kab. Brebes'}`}
                          </div>
                        </div>
                      </div>

                      {/* Middle Grid: QR Code + Asset Data */}
                      <div className="flex items-center space-x-3 pt-1">
                        
                        {/* QR Code Container */}
                        <div className="p-1.5 bg-white border border-slate-200 rounded-lg shadow-xs flex flex-col items-center justify-center shrink-0">
                          <QRCodeSVG
                            value={qrPayload}
                            size={76}
                            bgColor="#FFFFFF"
                            fgColor="#000000"
                            level="M"
                            includeMargin={false}
                          />
                          <span className="text-[7.5px] font-mono font-bold text-slate-500 tracking-wider mt-0.5 uppercase">
                            SCAN ASET
                          </span>
                        </div>

                        {/* Text Fields */}
                        <div className="flex-1 min-w-0 space-y-1">
                          
                          {/* Nomor Registrasi Resmi */}
                          <div className="flex items-baseline space-x-1 text-[11px] border-b border-slate-200 pb-0.5">
                            <span className="font-extrabold text-slate-900">No.:</span>
                            <span className="font-mono font-black text-[#005ba4] tracking-wide text-xs truncate">
                              {assetNo}
                            </span>
                          </div>

                          {/* Asset Name & Category */}
                          <div className="text-[11px] font-black text-slate-900 truncate leading-snug">
                            {asset.brand} - {asset.model}
                          </div>
                          
                          {/* SN & Location */}
                          <div className="text-[9.5px] text-slate-600 font-semibold flex items-center space-x-1.5 flex-wrap">
                            <span className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-[8.5px] font-bold border border-slate-200">
                              {categoryName}
                            </span>
                            <span>SN: <strong className="font-mono text-slate-900">{snItem}</strong></span>
                            {asset.location_detail && (
                              <span className="text-slate-700">• Rak: <strong className="text-slate-900">{asset.location_detail}</strong></span>
                            )}
                          </div>

                          {/* Contacts Line (Phone, WA, Email) */}
                          <div className="pt-0.5 flex items-center space-x-2 text-[8px] font-bold text-slate-700 flex-wrap">
                            <div className="flex items-center">
                              <PhoneIcon />
                              <span>{config.phone}</span>
                            </div>
                            <div className="flex items-center">
                              <WhatsAppIcon />
                              <span>{config.wa}</span>
                            </div>
                            <div className="flex items-center truncate">
                              <MailIcon />
                              <span className="truncate">{config.email}</span>
                            </div>
                          </div>

                        </div>

                      </div>

                    </div>

                    {/* Bottom Split Ribbon (Red: Property Of | Blue: Company Name) */}
                    <div className="flex items-stretch text-white text-[9.5px] font-bold border-t border-slate-200">
                      <div className="bg-[#d32f2f] px-2.5 py-1 flex flex-col justify-center leading-tight tracking-tight text-[8.5px] font-black uppercase shrink-0">
                        <span>Perangkat Milik</span>
                        <span className="text-[7px] font-normal lowercase tracking-tight -mt-0.5 opacity-90">(Property of):</span>
                      </div>
                      <div className="bg-[#005ba4] px-2.5 py-1 flex-1 flex items-center justify-start text-[10px] font-black tracking-wide truncate">
                        <span>{config.companyName} ({config.brandName})</span>
                      </div>
                    </div>

                  </div>
                );
              }

              /* ========================================================================= */
              /* TEMPLATE 2: CIRCULAR BADGE / SEGEL BULAT (FAITHFUL TO PHOTO 2)             */
              /* ========================================================================= */
              if (activeTemplate === 'circle') {
                return (
                  <div
                    key={idx}
                    className="sticker-item bg-white text-slate-900 border border-slate-300 rounded-xl p-4 shadow-lg flex flex-col items-center justify-center select-none"
                  >
                    <div className="relative w-[240px] h-[240px] flex items-center justify-center">
                      
                      {/* Outer SVG with Curved Text and Stars */}
                      <svg viewBox="0 0 260 260" className="w-full h-full absolute inset-0">
                        <defs>
                          <path id={`topArc-${idx}`} d="M 38,130 A 92,92 0 0,1 222,130" fill="none" />
                          <path id={`botArc-${idx}`} d="M 222,130 A 92,92 0 0,1 38,130" fill="none" />
                        </defs>
                        
                        {/* Outer Ring */}
                        <circle cx="130" cy="130" r="124" fill="#005ba4" stroke="#004080" strokeWidth="3" />
                        
                        {/* Inner White Circle */}
                        <circle cx="130" cy="130" r="98" fill="#ffffff" stroke="#005ba4" strokeWidth="2" />

                        {/* Top Curved Text: PERANGKAT MILIK */}
                        <text fill="#ffffff" fontSize="13.5" fontWeight="900" letterSpacing="1.5">
                          <textPath href={`#topArc-${idx}`} startOffset="50%" textAnchor="middle">
                            PERANGKAT MILIK
                          </textPath>
                        </text>

                        {/* Side Stars */}
                        <text x="24" y="136" fill="#ffffff" fontSize="16" textAnchor="middle">★</text>
                        <text x="236" y="136" fill="#ffffff" fontSize="16" textAnchor="middle">★</text>

                        {/* Bottom Curved Text: RAPID NETWORK */}
                        <text fill="#ffffff" fontSize="13.5" fontWeight="900" letterSpacing="1.5">
                          <textPath href={`#botArc-${idx}`} startOffset="50%" textAnchor="middle">
                            RAPID NETWORK
                          </textPath>
                        </text>
                      </svg>

                      {/* Center Content Inside Ring */}
                      <div className="relative z-10 flex flex-col items-center justify-center text-center p-2 max-w-[170px]">
                        <span className="text-[8px] text-slate-500 font-semibold uppercase -mb-0.5">
                          Property of:
                        </span>
                        
                        <RapidLogo className="h-5 scale-90 mb-0.5" />

                        {/* QR Code */}
                        <div className="p-1 bg-white border border-slate-200 rounded-md shadow-2xs my-0.5">
                          <QRCodeSVG
                            value={qrPayload}
                            size={64}
                            bgColor="#FFFFFF"
                            fgColor="#000000"
                            level="M"
                            includeMargin={false}
                          />
                        </div>

                        {/* Company Text */}
                        <span className="text-[8.5px] font-black text-[#005ba4] leading-tight tracking-tight uppercase mt-0.5">
                          PT MEDIA CEPAT INDONESIA
                        </span>
                        
                        <div className="text-[7.5px] font-bold text-slate-700 leading-tight space-y-0.2 mt-0.5">
                          <div className="truncate">✉ {config.email}</div>
                          <div>📱 {config.wa}</div>
                        </div>

                        <div className="text-[8px] font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.2 rounded mt-0.5">
                          SN: {snItem}
                        </div>
                      </div>

                    </div>
                  </div>
                );
              }

              /* ========================================================================= */
              /* TEMPLATE 3: COMPACT MONOCHROME (THERMAL PRINTER 58mm/80mm)                 */
              /* ========================================================================= */
              return (
                <div
                  key={idx}
                  className="sticker-item bg-white text-black border-2 border-black rounded-lg p-3 shadow-md flex items-center space-x-3 select-none"
                >
                  <div className="p-1 bg-white border border-black rounded flex flex-col items-center justify-center shrink-0">
                    <QRCodeSVG
                      value={qrPayload}
                      size={70}
                      bgColor="#FFFFFF"
                      fgColor="#000000"
                      level="H"
                      includeMargin={false}
                    />
                    <span className="text-[7.5px] font-mono font-bold tracking-tight mt-0.5">
                      RAPID ASSET
                    </span>
                  </div>

                  <div className="flex-1 min-w-0 space-y-0.5 text-black">
                    <div className="text-[10px] font-black uppercase tracking-wide border-b border-black pb-0.5">
                      PT MEDIA CEPAT INDONESIA
                    </div>
                    <div className="text-[11px] font-black truncate">{asset.brand} - {asset.model}</div>
                    <div className="text-[9px] font-mono font-bold">No: {assetNo}</div>
                    <div className="text-[9px] font-mono">SN: <strong>{snItem}</strong></div>
                    <div className="text-[8.5px] text-gray-700">
                      Site: {siteName || branchName} {asset.location_detail ? `• Rak: ${asset.location_detail}` : ''}
                    </div>
                    <div className="text-[8px] pt-0.5 text-gray-800">
                      Helpdesk: {config.phone} | {config.wa}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between no-print">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <span>Ukuran Preview:</span>
            <span className="font-semibold text-slate-200">
              {activeTemplate === 'landscape' ? '8.5 cm × 3.8 cm (Standar Fisik Rak)' : activeTemplate === 'circle' ? 'Diameter 5.5 cm (Segel)' : '5.5 cm × 3.5 cm (Thermal)'}
            </span>
          </div>
          
          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-[#005ba4] hover:from-blue-500 hover:to-blue-600 text-white font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-blue-600/30 transition-all active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak {printSNs.length} Stiker (Print)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default QRCodeModal;
