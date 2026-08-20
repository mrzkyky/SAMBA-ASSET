import React, { useEffect, useRef, useState } from 'react';
import { X, Camera, AlertCircle, RefreshCw } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

const QRScannerModal = ({ isOpen, onClose, onScanSuccess }) => {
  const [cameraError, setCameraError] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef(null);

  useEffect(() => {
    let html5QrcodeScanner = null;

    if (isOpen) {
      setCameraError('');
      setIsScanning(true);

      const config = { fps: 10, qrbox: { width: 250, height: 250 } };
      html5QrcodeScanner = new Html5Qrcode('qr-reader');
      scannerRef.current = html5QrcodeScanner;

      html5QrcodeScanner
        .start(
          { facingMode: 'environment' },
          config,
          (decodedText) => {
            // QR Code successfully scanned!
            if (html5QrcodeScanner) {
              html5QrcodeScanner.stop().then(() => {
                onScanSuccess(decodedText);
                onClose();
              }).catch(() => {
                onScanSuccess(decodedText);
                onClose();
              });
            }
          },
          (errorMessage) => {
            // Scanning in progress...
          }
        )
        .catch((err) => {
          console.error('Camera access error:', err);
          setCameraError('Gagal mengakses kamera web. Pastikan izin kamera telah diberikan di browser.');
          setIsScanning(false);
        });
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [isOpen, onScanSuccess, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Camera className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Pemindai QR Code Live Kamera</h3>
              <p className="text-[11px] text-slate-400">Arahkan kamera ke stiker QR perangkat</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera Feed */}
        <div className="p-6 bg-slate-950 flex flex-col items-center justify-center min-h-[300px]">
          {cameraError ? (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs text-center space-y-2">
              <AlertCircle className="w-8 h-8 mx-auto text-rose-400" />
              <p className="font-semibold">{cameraError}</p>
              <p className="text-[11px] text-slate-400">
                Anda juga dapat mengetik Serial Number secara manual pada bilah pencarian atas.
              </p>
            </div>
          ) : (
            <div className="w-full relative rounded-xl overflow-hidden border-2 border-cyan-500/40 shadow-lg">
              <div id="qr-reader" className="w-full"></div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-center">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
          >
            Batal Pemindaian
          </button>
        </div>

      </div>
    </div>
  );
};

export default QRScannerModal;
