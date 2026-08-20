import React, { useState, useEffect } from 'react';
import { X, Printer, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { parseSNList } from './HierarchyView';

const QRCodeModal = ({ isOpen, onClose, asset }) => {
  const [selectedSNIndex, setSelectedSNIndex] = useState('ALL'); // 'ALL' or index 0..N

  useEffect(() => {
    setSelectedSNIndex('ALL');
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
      
      {/* Print CSS Override */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-qr, #printable-qr * {
            visibility: visible;
          }
          #printable-qr {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
            background: white !important;
            color: black !important;
          }
        }
      `}</style>

      <div className="w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Modal Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Stiker Label QR Code Perangkat</h3>
              <p className="text-[11px] text-slate-400">Siap dicetak dan ditempel di rack/fisik perangkat</p>
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

        {/* Multi-SN Selector Bar (if multiple SNs exist) */}
        {snList.length > 1 && (
          <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs print:hidden">
            <span className="text-slate-300 font-semibold">Pilih Unit untuk Dicetak:</span>
            <select
              value={selectedSNIndex}
              onChange={(e) => setSelectedSNIndex(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-cyan-400 font-semibold focus:outline-none"
            >
              <option value="ALL">Cetak Semua ({snList.length} Stiker Unit)</option>
              {snList.map((sn, idx) => (
                <option key={idx} value={idx}>
                  Unit {idx + 1}: SN {sn}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Printable Badge Container */}
        <div className="p-6 bg-slate-950 text-slate-100 max-h-[70vh] overflow-y-auto" id="printable-qr">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {printSNs.map((snItem, idx) => (
              <div
                key={idx}
                className="w-full border-2 border-dashed border-slate-700 rounded-2xl p-4 bg-slate-900/90 text-center space-y-3 shadow-inner print:border-black print:bg-white"
              >
                {/* Header info */}
                <div className="border-b border-slate-800 pb-2 print:border-gray-300">
                  <span className="text-[9px] font-bold tracking-widest text-cyan-400 uppercase block print:text-black">
                    PROPERTY OF NATIONAL ASSET
                  </span>
                  <h4 className="text-xs font-bold text-white mt-0.5 print:text-black">{asset.brand} - {asset.model}</h4>
                  <p className="text-[10px] text-slate-400 print:text-gray-700">{categoryName}</p>
                </div>

                {/* QR Code SVG */}
                <div className="p-3 bg-white rounded-xl inline-block shadow-md mx-auto">
                  <QRCodeSVG
                    value={snItem}
                    size={120}
                    bgColor="#FFFFFF"
                    fgColor="#000000"
                    level="H"
                    includeMargin={false}
                  />
                </div>

                {/* Serial Number & Location Specs */}
                <div className="space-y-1">
                  <div className="font-mono font-bold text-[11px] text-cyan-400 bg-slate-950 py-1 px-2 rounded-lg border border-slate-800 inline-block print:bg-gray-100 print:text-black">
                    SN: {snItem}
                  </div>
                  <div className="text-[10px] text-slate-400 print:text-gray-700">
                    <div>{branchName} • {partnerName} - {siteName}</div>
                    <div>Rak: <strong className="text-slate-200 print:text-black">{asset.location_detail}</strong></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Footer Action Buttons */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between print:hidden">
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
            className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-purple-600/25 transition-all active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak {printSNs.length} Stiker (Print)</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default QRCodeModal;
