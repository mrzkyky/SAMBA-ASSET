import React, { useState, useEffect } from 'react';
import { X, Printer, FileText } from 'lucide-react';
import { parseSNList } from './HierarchyView';

const BASTModal = ({ isOpen, onClose, transfer, asset }) => {
  const [bastData, setBastData] = useState({
    refNo: '',
    dateStr: '',
    pemberiNama: 'Ahmad Subagja',
    pemberiJabatan: 'Teknisi Field Operations',
    pemberiInstansi: 'PT SAMBA Asset Indonesia',
    penerimaNama: 'Budi Santoso',
    penerimaJabatan: 'Site Manager / Supervisor',
    penerimaInstansi: 'Mitra Telkom',
    mengetahuiNama: 'M. Rizky',
    mengetahuiJabatan: 'Head of National Asset',
    notes: 'Perangkat dalam keadaan baik, teruji, dan siap beroperasi.',
  });

  useEffect(() => {
    if (transfer) {
      setBastData((prev) => ({
        ...prev,
        refNo: transfer.reference_no,
        dateStr: new Date(transfer.transfer_date || transfer.created_at).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
        penerimaInstansi: transfer.to_site?.partner_name || 'Mitra Site',
        notes: transfer.reason || 'Perangkat dalam keadaan baik, teruji, dan siap beroperasi.',
      }));
    } else if (asset) {
      const todayStr = new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      setBastData((prev) => ({
        ...prev,
        refNo: `BAST/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${asset.id}`,
        dateStr: todayStr,
        notes: asset.notes || 'Perangkat dalam keadaan baik, teruji, dan siap beroperasi.',
      }));
    }
  }, [transfer, asset, isOpen]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const targetAsset = transfer ? transfer.asset : asset;
  const fromSiteName = transfer
    ? `${transfer.from_site?.partner_name} - ${transfer.from_site?.site_name} (${transfer.from_site?.branch?.name})`
    : targetAsset?.site
    ? `${targetAsset.site.partner_name} - ${targetAsset.site.site_name} (${targetAsset.site.branch?.name})`
    : '-';

  const toSiteName = transfer
    ? `${transfer.to_site?.partner_name} - ${transfer.to_site?.site_name} (${transfer.to_site?.branch?.name})`
    : 'Site Operasional Lapangan';

  const snText = transfer ? transfer.serial_numbers : targetAsset?.serial_number || '';
  const snList = parseSNList(snText);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
      
      {/* Print CSS Overrides */}
      <style>{`
        @media print {
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
            width: 100%;
            padding: 30px;
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="w-full max-w-3xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Modal Bar */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between no-print">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Dokumen BAST Resmi (Berita Acara Serah Terima)</h3>
              <p className="text-[11px] text-slate-400">Siap diprint atau disimpan sebagai berkas resmi BAST</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 bg-white text-slate-900 max-h-[75vh] overflow-y-auto font-sans" id="printable-bast">
          
          {/* KOP SURAT PERUSAHAAN */}
          <div className="border-b-2 border-slate-900 pb-4 mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-black tracking-wider text-slate-900 uppercase">NATIONAL ASSET MANAGEMENT</h1>
              <p className="text-xs text-slate-600 font-medium">Sistem Integrasi Pengelolaan Aset Infrastruktur & Telekomunikasi Nasional</p>
              <p className="text-[11px] text-slate-500">Jl. Jend. Sudirman Hub Level 12, Jakarta Pusat • Support: (021) 555-ASSET</p>
            </div>
            <div className="text-right">
              <span className="px-3 py-1 bg-slate-100 border border-slate-300 rounded font-mono font-bold text-xs">
                OFFICIAL DOC
              </span>
            </div>
          </div>

          {/* JUDUL BAST */}
          <div className="text-center my-4">
            <h2 className="text-base font-bold underline uppercase tracking-wide">BERITA ACARA SERAH TERIMA (BAST)</h2>
            <p className="text-xs font-mono text-slate-700 mt-0.5">Nomor: {bastData.refNo}</p>
          </div>

          <p className="text-xs leading-relaxed mb-4">
            Pada hari ini <strong>{bastData.dateStr}</strong>, kami yang bertanda tangan di bawah ini telah melaksanakan serah terima dan pemindahan aset fisik berupa perangkat telekomunikasi / IT:
          </p>

          {/* TABEL SPESIFIKASI PERANGKAT */}
          <div className="my-4 overflow-hidden border border-slate-300 rounded-lg">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold uppercase">
                <tr>
                  <th className="p-2 border-r border-slate-300">Deskripsi Perangkat</th>
                  <th className="p-2 border-r border-slate-300">Kategori</th>
                  <th className="p-2 border-r border-slate-300">Lokasi Asal</th>
                  <th className="p-2 border-r border-slate-300">Lokasi Tujuan</th>
                  <th className="p-2 text-center">Jumlah Unit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                <tr>
                  <td className="p-2 border-r border-slate-200">
                    <div className="font-bold">{targetAsset?.brand} - {targetAsset?.model}</div>
                    <div className="text-[10px] text-slate-500 font-mono">Rak: {targetAsset?.location_detail}</div>
                  </td>
                  <td className="p-2 border-r border-slate-200">{targetAsset?.category?.name || 'Networking'}</td>
                  <td className="p-2 border-r border-slate-200">{fromSiteName}</td>
                  <td className="p-2 border-r border-slate-200">{toSiteName}</td>
                  <td className="p-2 text-center font-bold">{transfer ? transfer.unit_count : targetAsset?.unit_count} Unit</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* TABEL RINCIAN SERIAL NUMBER */}
          <div className="my-4 p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="text-xs font-bold text-slate-700 mb-1.5">Rincian Serial Number Perangkat ({snList.length} Unit):</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {snList.map((sn, idx) => (
                <div key={idx} className="font-mono text-[11px] bg-white p-1 rounded border border-slate-300">
                  <span className="text-slate-400 mr-1">#{idx + 1}</span>
                  <strong className="text-slate-900">{sn}</strong>
                </div>
              ))}
            </div>
          </div>

          {/* KETENTUAN & CATATAN */}
          <div className="my-4 text-xs text-slate-700 bg-amber-50/50 p-3 rounded-lg border border-amber-200">
            <strong>Catatan & Syarat Ketentuan:</strong>
            <p className="mt-0.5">{bastData.notes}</p>
          </div>

          {/* KOLOM 3 TANDA TANGAN RESMI */}
          <div className="mt-10 pt-4 border-t border-slate-200 grid grid-cols-3 gap-4 text-center text-xs">
            
            {/* Pihak 1: Pemberi */}
            <div className="space-y-12">
              <div>
                <p className="font-bold text-slate-700 uppercase">Pihak Pertama (Pemberi)</p>
                <p className="text-[10px] text-slate-500">{bastData.pemberiInstansi}</p>
              </div>
              <div>
                <p className="font-bold underline text-slate-900">{bastData.pemberiNama}</p>
                <p className="text-[10px] text-slate-600">{bastData.pemberiJabatan}</p>
              </div>
            </div>

            {/* Pihak 2: Penerima */}
            <div className="space-y-12">
              <div>
                <p className="font-bold text-slate-700 uppercase">Pihak Kedua (Penerima)</p>
                <p className="text-[10px] text-slate-500">{bastData.penerimaInstansi}</p>
              </div>
              <div>
                <p className="font-bold underline text-slate-900">{bastData.penerimaNama}</p>
                <p className="text-[10px] text-slate-600">{bastData.penerimaJabatan}</p>
              </div>
            </div>

            {/* Mengetahui / Head */}
            <div className="space-y-12">
              <div>
                <p className="font-bold text-slate-700 uppercase">Mengetahui (Head / Admin)</p>
                <p className="text-[10px] text-slate-500">PT SAMBA Asset Indonesia</p>
              </div>
              <div>
                <p className="font-bold underline text-slate-900">{bastData.mengetahuiNama}</p>
                <p className="text-[10px] text-slate-600">{bastData.mengetahuiJabatan}</p>
              </div>
            </div>

          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between no-print">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-cyan-500/20 active:scale-95"
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
