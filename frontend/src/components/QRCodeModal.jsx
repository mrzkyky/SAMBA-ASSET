import React from 'react';
import { X, Printer, QrCode, Building2, MapPin, Box } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const QRCodeModal = ({ isOpen, onClose, asset }) => {
  if (!isOpen || !asset) return null;

  const handlePrint = () => {
    window.print();
  };

  const branchName = asset.site?.branch?.name || 'Nasional';
  const siteName = `${asset.site?.partner_name || ''} - ${asset.site?.site_name || ''}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
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
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Badge Area */}
        <div className="p-6 flex flex-col items-center justify-center bg-slate-950 text-slate-100 print:p-0 print:bg-white print:text-black" id="printable-qr">
          
          <div className="w-full border-2 border-dashed border-slate-800 rounded-2xl p-6 bg-slate-900/90 text-center space-y-4 shadow-inner print:border-black print:bg-white">
            
            {/* Header info */}
            <div className="border-b border-slate-800 pb-3 print:border-gray-300">
              <span className="text-[10px] font-bold tracking-widest text-cyan-400 uppercase block print:text-black">
                PROPERTY OF NATIONAL ASSET MANAGEMENT
              </span>
              <h4 className="text-sm font-bold text-white mt-1 print:text-black">{asset.brand} - {asset.model}</h4>
              <p className="text-xs text-slate-400 print:text-gray-700">{categoryName(asset)}</p>
            </div>

            {/* QR Code Canvas */}
            <div className="p-4 bg-white rounded-xl inline-block shadow-md mx-auto">
              <QRCodeSVG
                value={asset.serial_number}
                size={140}
                bgColor="#FFFFFF"
                fgColor="#000000"
                level="H"
                includeMargin={false}
              />
            </div>

            {/* Serial Number & Location */}
            <div className="space-y-1">
              <div className="font-mono font-bold text-sm text-cyan-400 bg-slate-950 py-1.5 px-3 rounded-lg border border-slate-800 inline-block print:bg-gray-100 print:text-black print:border-gray-400">
                SN: {asset.serial_number}
              </div>
              <div className="text-[11px] text-slate-400 pt-1 print:text-gray-700">
                <div>{branchName} • {siteName}</div>
                <div>Rak: <strong>{asset.location_detail}</strong></div>
              </div>
            </div>

          </div>

        </div>

        {/* Footer Actions */}
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
            className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-purple-600/25 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Stiker (Print)</span>
          </button>
        </div>

      </div>
    </div>
  );
};

const categoryName = (asset) => asset.category?.name || 'Device';

export default QRCodeModal;
