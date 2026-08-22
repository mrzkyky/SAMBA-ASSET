import React, { useState, useEffect } from 'react';
import { X, Printer, FileText, Settings, ChevronDown, ChevronUp, Image as ImageIcon } from 'lucide-react';
import { parseSNList } from './HierarchyView';

const BASTModal = ({ isOpen, onClose, transfer, asset }) => {
  const [showEditPanel, setShowEditPanel] = useState(false);
  const [customLogoUrl, setCustomLogoUrl] = useState(null);

  const [bastData, setBastData] = useState({
    companyName: 'PT Media Cepat Indonesia',
    brandName: 'Rapid Network',
    companyEmail: 'helpdesk@rapid.net.id',
    companyPhone: '(0283) 617 4011',
    companyWA: '0812-1474-5080',
    companyInstagram: '@rapidnetwork.id',
    companyWebsite: 'https://rapid.net.id',
    companyAddress: 'Jl. Anggrek No. 91F, RT 02 RW 05, Gandasuli, Kab. Brebes - 52215',

    refNo: '',
    dateStr: '',
    
    pemberiNama: 'Moh Kevin Hidayat',
    pemberiJabatan: 'Branch Manager Infrastruktur',
    pemberiInstansi: 'PT Media Cepat Indonesia',
    
    penerimaNama: 'Nama PIC',
    penerimaJabatan: 'PIC',
    penerimaInstansi: 'Mitra / Site Target',
    
    mengetahuiNama: 'Restu Hidayat',
    mengetahuiJabatan: 'Head Operasional (GA)',
    mengetahuiInstansi: 'PT Media Cepat Indonesia',
    
    notes: 'Pengujian dengan mencoba di site lain yang menggunakan bandwith lebih kecil',
  });

  useEffect(() => {
    if (transfer) {
      const formattedDate = new Date(transfer.transfer_date || transfer.created_at).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

      setBastData((prev) => ({
        ...prev,
        refNo: transfer.reference_no,
        dateStr: formattedDate,
        penerimaInstansi: transfer.to_site?.partner_name || transfer.to_site?.site_name || 'Mitra Site',
        penerimaNama: 'Nama PIC',
        notes: transfer.reason || 'Perangkat dalam keadaan baik, teruji, dan siap beroperasi.',
      }));
    } else if (asset) {
      const todayStr = new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      const generatedRef = `MUT/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${asset.id}`;
      setBastData((prev) => ({
        ...prev,
        refNo: generatedRef,
        dateStr: todayStr,
        penerimaInstansi: asset.site?.partner_name || asset.site?.site_name || 'Mitra Site',
        penerimaNama: 'Nama PIC',
        notes: asset.notes || 'Pengujian dengan mencoba di site lain yang menggunakan bandwith lebih kecil',
      }));
    }
  }, [transfer, asset, isOpen]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCustomLogoUrl(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const targetAsset = transfer ? transfer.asset : asset;
  const fromSiteName = transfer
    ? `${transfer.from_site?.site_name || ''} - ${transfer.from_site?.partner_name || ''} (Branch ${transfer.from_site?.branch?.name || ''})`
    : targetAsset?.site
    ? `${targetAsset.site.site_name || ''} - ${targetAsset.site.partner_name || ''} (Branch ${targetAsset.site.branch?.name || ''})`
    : '-';

  const toSiteName = transfer
    ? `${transfer.to_site?.site_name || ''} - ${transfer.to_site?.partner_name || ''} (Branch ${transfer.to_site?.branch?.name || ''})`
    : 'Site Operasional Lapangan';

  const snText = transfer ? transfer.serial_numbers : targetAsset?.serial_number || '';
  const snList = parseSNList(snText);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      
      {/* Print CSS Overrides */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 0;
          }
          body * {
            visibility: hidden;
          }
          #printable-bast, #printable-bast * {
            visibility: visible;
          }
          #printable-bast {
            position: absolute;
            left: 0;
            top: 0;
            width: 210mm;
            min-height: 297mm;
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
            color: black !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="w-full max-w-4xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 my-auto">
        
        {/* Modal Header Bar */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between no-print">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Preview & cetak Dokumen Resmi BAST</h3>
              <p className="text-[11px] text-slate-400">Template Vector Kop Surat resmi PT Media Cepat Indonesia - Rapid Network</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setShowEditPanel(!showEditPanel)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
            >
              <Settings className="w-3.5 h-3.5 text-cyan-400" />
              <span>{showEditPanel ? 'Sembunyikan Panel Edit' : 'Edit Penandatangan & Kop'}</span>
              {showEditPanel ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
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

        {/* Collapsible Edit Panel */}
        {showEditPanel && (
          <div className="p-4 bg-slate-950/90 border-b border-slate-800 no-print space-y-4 max-h-[30vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Kustomisasi Penandatangan & Kop Surat</h4>
              <label className="cursor-pointer px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs text-white rounded-lg border border-slate-700 flex items-center space-x-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-teal-400" />
                <span>{customLogoUrl ? 'Ganti Image Kop' : 'Upload Image Kop (Optional)'}</span>
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              {/* Pemberi */}
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="font-bold text-slate-300 block">Pihak Pertama (Pemberi):</span>
                <input
                  type="text"
                  placeholder="Nama Pemberi"
                  value={bastData.pemberiNama}
                  onChange={(e) => setBastData({ ...bastData, pemberiNama: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200"
                />
                <input
                  type="text"
                  placeholder="Jabatan Pemberi"
                  value={bastData.pemberiJabatan}
                  onChange={(e) => setBastData({ ...bastData, pemberiJabatan: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200"
                />
              </div>

              {/* Penerima */}
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="font-bold text-slate-300 block">Pihak Kedua (Penerima):</span>
                <input
                  type="text"
                  placeholder="Nama Penerima"
                  value={bastData.penerimaNama}
                  onChange={(e) => setBastData({ ...bastData, penerimaNama: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200"
                />
                <input
                  type="text"
                  placeholder="Jabatan Penerima"
                  value={bastData.penerimaJabatan}
                  onChange={(e) => setBastData({ ...bastData, penerimaJabatan: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200"
                />
              </div>

              {/* Mengetahui */}
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="font-bold text-slate-300 block">Mengetahui (Operasional):</span>
                <input
                  type="text"
                  placeholder="Nama Head"
                  value={bastData.mengetahuiNama}
                  onChange={(e) => setBastData({ ...bastData, mengetahuiNama: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200"
                />
                <input
                  type="text"
                  placeholder="Jabatan Head"
                  value={bastData.mengetahuiJabatan}
                  onChange={(e) => setBastData({ ...bastData, mengetahuiJabatan: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Nomor BAST:</label>
                <input
                  type="text"
                  value={bastData.refNo}
                  onChange={(e) => setBastData({ ...bastData, refNo: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Catatan & Syarat Ketentuan:</label>
                <input
                  type="text"
                  value={bastData.notes}
                  onChange={(e) => setBastData({ ...bastData, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200"
                />
              </div>
            </div>
          </div>
        )}

        {/* Printable Document Body (High Quality Vector Vector HTML/CSS Layout) */}
        <div className="p-0 bg-white text-slate-900 max-h-[75vh] overflow-y-auto font-sans shadow-inner" id="printable-bast">
          
          <div className="flex flex-col justify-between bg-white min-h-[280mm] print:min-h-[297mm]">
            
            {/* TOP CONTAINER: HEADER KOP SURAT */}
            <div>
              {customLogoUrl ? (
                <div className="w-full">
                  <img src={customLogoUrl} alt="Custom Kop Surat Logo" className="w-full max-h-[160px] object-contain" />
                </div>
              ) : (
                /* OFFICIAL RAPID NETWORK VECTOR HTML/CSS KOP SURAT BANNER */
                <div className="bg-[#182b58] text-white px-8 py-5 relative overflow-hidden flex items-center justify-between border-b-4 border-[#1e3a78] print:bg-[#182b58] print:text-white">
                  
                  {/* Decorative Background Arrow Graphic */}
                  <div className="absolute right-0 top-0 bottom-0 w-56 pointer-events-none opacity-95">
                    <svg viewBox="0 0 160 100" fill="none" className="w-full h-full">
                      <path d="M110 100 L140 25 L128 25 L148 5 L168 25 L156 25 L126 100 Z" fill="#ffffff" />
                      <path d="M135 100 L158 45 L148 45 L160 20 L172 45 L162 45 L145 100 Z" fill="#ffffff" opacity="0.65" />
                    </svg>
                  </div>

                  {/* Left Brand Identity */}
                  <div className="z-10 flex items-center space-x-3">
                    <div className="text-left">
                      <div className="text-[11px] font-bold tracking-widest text-slate-200 uppercase">
                        {bastData.companyName}
                      </div>
                      <div className="text-2xl font-black tracking-tight text-white flex items-center space-x-1">
                        <span>Rapid Network</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Company Details */}
                  <div className="text-right z-10 pr-20 text-[10px] leading-tight space-y-0.5 text-slate-200">
                    <div className="font-bold text-slate-200 uppercase tracking-wide text-[10.5px]">
                      {bastData.companyName}
                    </div>
                    <div className="text-xl font-black text-white tracking-wide">
                      {bastData.brandName}
                    </div>
                    <div className="flex items-center justify-end space-x-2 text-[9.5px] text-slate-200 pt-0.5 font-medium">
                      <span>✉ {bastData.companyEmail}</span>
                      <span>📞 {bastData.companyPhone}</span>
                      <span>📱 {bastData.companyWA}</span>
                    </div>
                    <div className="flex items-center justify-end space-x-2 text-[9.5px] text-slate-200 font-medium">
                      <span>📸 {bastData.companyInstagram}</span>
                      <span>🌐 {bastData.companyWebsite}</span>
                    </div>
                  </div>

                </div>
              )}

              {/* DOCUMENT MAIN CONTENT */}
              <div className="px-10 py-6 space-y-5 text-slate-800 text-xs">
                
                {/* JUDUL DOKUMEN BAST */}
                <div className="text-center my-3">
                  <h1 className="text-base font-extrabold underline tracking-wider text-slate-900 uppercase">
                    BERITA ACARA SERAH TERIMA (BAST)
                  </h1>
                  <p className="text-xs font-mono text-slate-700 mt-1 font-semibold">
                    Nomor: {bastData.refNo}
                  </p>
                </div>

                {/* TEKS PEMBUKA */}
                <p className="text-xs leading-relaxed text-slate-800">
                  Pada hari ini <strong>{bastData.dateStr}</strong>, kami yang bertanda tangan di bawah ini telah melaksanakan serah terima dan pemindahan aset fisik berupa perangkat telekomunikasi / IT:
                </p>

                {/* TABEL SPESIFIKASI PERANGKAT (Styled matching user image) */}
                <div className="overflow-hidden border border-slate-300 rounded-xl shadow-sm">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead className="bg-slate-100/90 border-b border-slate-300 text-slate-800 font-bold uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="p-3 border-r border-slate-300 w-1/4">DESKRIPSI PERANGKAT</th>
                        <th className="p-3 border-r border-slate-300">KATEGORI</th>
                        <th className="p-3 border-r border-slate-300">LOKASI ASAL</th>
                        <th className="p-3 border-r border-slate-300">LOKASI TUJUAN</th>
                        <th className="p-3 text-center w-24">JUMLAH UNIT</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-800">
                      <tr className="hover:bg-slate-50">
                        <td className="p-3 border-r border-slate-200">
                          <div className="font-bold text-slate-900">{targetAsset?.brand} - {targetAsset?.model}</div>
                          <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                            Rak: {targetAsset?.location_detail || 'Sub Rack'}
                          </div>
                        </td>
                        <td className="p-3 border-r border-slate-200 font-medium">
                          {targetAsset?.category?.name || 'Switch'}
                        </td>
                        <td className="p-3 border-r border-slate-200 font-medium leading-normal">
                          {fromSiteName}
                        </td>
                        <td className="p-3 border-r border-slate-200 font-medium leading-normal">
                          {toSiteName}
                        </td>
                        <td className="p-3 text-center font-bold text-slate-900 text-sm">
                          {transfer ? transfer.unit_count : targetAsset?.unit_count || 1} Unit
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* BOX RINCIAN SERIAL NUMBER PERANGKAT */}
                <div className="p-4 bg-slate-50/80 border border-slate-300 rounded-xl space-y-2">
                  <div className="text-xs font-bold text-slate-800">
                    Rincian Serial Number Perangkat ({snList.length} Unit):
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {snList.length > 0 ? (
                      snList.map((sn, idx) => (
                        <div
                          key={idx}
                          className="font-mono text-xs font-bold bg-white px-3 py-1.5 rounded-lg border border-slate-300 shadow-xs flex items-center space-x-1.5"
                        >
                          <span className="text-slate-400 font-normal">#{idx + 1}</span>
                          <span className="text-slate-900">{sn}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-slate-500 italic text-xs">Serial Number Tidak Tersedia</span>
                    )}
                  </div>
                </div>

                {/* BOX CATATAN & SYARAT KETENTUAN */}
                <div className="p-4 bg-amber-50/40 border border-amber-300/80 rounded-xl space-y-1 text-xs">
                  <div className="font-bold text-slate-900">Catatan & Syarat Ketentuan:</div>
                  <p className="text-slate-700 leading-relaxed">
                    {bastData.notes || 'Pengujian dengan mencoba di site lain yang menggunakan bandwith lebih kecil'}
                  </p>
                </div>

                {/* 3 KOLOM TANDA TANGAN RESMI */}
                <div className="pt-6 mt-6 grid grid-cols-3 gap-6 text-center text-xs">
                  
                  {/* Pihak 1: Pemberi */}
                  <div className="flex flex-col justify-between h-40">
                    <div>
                      <p className="font-extrabold text-slate-900 uppercase tracking-wide">PIHAK PERTAMA (PEMBERI)</p>
                      <p className="text-[10.5px] text-slate-600 font-medium mt-0.5">{bastData.pemberiInstansi}</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-bold text-slate-900 underline text-sm tracking-wide">{bastData.pemberiNama}</p>
                      <p className="text-[10.5px] text-slate-600 font-medium">{bastData.pemberiJabatan}</p>
                    </div>
                  </div>

                  {/* Pihak 2: Penerima */}
                  <div className="flex flex-col justify-between h-40">
                    <div>
                      <p className="font-extrabold text-slate-900 uppercase tracking-wide">PIHAK KEDUA (PENERIMA)</p>
                      <p className="text-[10.5px] text-slate-600 font-medium mt-0.5">{bastData.penerimaInstansi}</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-bold text-slate-900 underline text-sm tracking-wide">{bastData.penerimaNama}</p>
                      <p className="text-[10.5px] text-slate-600 font-medium">{bastData.penerimaJabatan}</p>
                    </div>
                  </div>

                  {/* Pihak 3: Mengetahui */}
                  <div className="flex flex-col justify-between h-40">
                    <div>
                      <p className="font-extrabold text-slate-900 uppercase tracking-wide">MENGETAHUI (OPERASIONAL)</p>
                      <p className="text-[10.5px] text-slate-600 font-medium mt-0.5">{bastData.mengetahuiInstansi}</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-bold text-slate-900 underline text-sm tracking-wide">{bastData.mengetahuiNama}</p>
                      <p className="text-[10.5px] text-slate-600 font-medium">{bastData.mengetahuiJabatan}</p>
                    </div>
                  </div>

                </div>

              </div>
            </div>

            {/* BOTTOM CONTAINER: FOOTER KOP SURAT (VECTOR HTML/CSS) */}
            <div className="bg-[#182b58] text-white px-8 py-3.5 flex items-center justify-between border-t-4 border-[#1e3a78] mt-8 print:bg-[#182b58] print:text-white">
              <div className="flex items-center space-x-2">
                <span className="text-xl font-black italic tracking-tighter text-white">rapid</span>
                <span className="text-[9px] font-bold bg-white text-[#182b58] px-1.5 py-0.5 rounded tracking-widest uppercase">
                  NETWORK
                </span>
              </div>
              <div className="text-right text-[9.5px] text-slate-200 leading-tight">
                <div className="font-bold text-white">{bastData.companyName} - {bastData.brandName}</div>
                <div className="text-slate-300">{bastData.companyAddress}</div>
                <div className="text-slate-300">
                  email: {bastData.companyEmail} | Phone: {bastData.companyPhone} | WhatsApp: {bastData.companyWA}
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between no-print">
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
            className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center space-x-2 shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Dokumen BAST (Print / PDF)</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default BASTModal;
