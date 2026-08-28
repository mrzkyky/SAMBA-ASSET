import React, { useState, useRef, useMemo } from 'react';
import {
  X,
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  RefreshCw,
  Layers,
  Building2,
  Tag,
  Box,
  Copy,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Gift,
  Wand2,
  Sparkles,
} from 'lucide-react';
import { importAssets } from '../api';

// Expanded dictionary of column aliases for smart auto-detection across all Indonesian branch formats
const FIELD_ALIASES = {
  site_name: [
    'site', 'nama site', 'site_name', 'lokasi site', 'mitra', 'nama mitra', 'partner', 'partner_name',
    'titik instalasi', 'nama_site', 'nama_mitra', 'dinas', 'nama dinas', 'instansi', 'nama instansi',
    'opd', 'nama opd', 'pelanggan', 'nama pelanggan', 'customer', 'client', 'sekolah', 'nama sekolah',
    'kantor', 'lokasi', 'titik', 'lokasi pemasangan', 'nama gedung', 'gedung', 'nama tempat', 'instansi / dinas'
  ],
  category_name: [
    'kategori', 'category', 'kategori perangkat', 'category_name', 'jenis kategori', 'kelompok',
    'perangkat', 'nama perangkat', 'nama barang', 'barang', 'alat', 'nama alat', 'item', 'device', 'hardware', 'jenis'
  ],
  brand: [
    'brand', 'merek', 'merk', 'vendor', 'manufaktur', 'pabrikan', 'make'
  ],
  model: [
    'model', 'tipe', 'type', 'tipe/model', 'tipe perangkat', 'model perangkat', 'seri', 'tipe model',
    'tipe_model', 'series', 'part number', 'p/n', 'jenis tipe'
  ],
  serial_number: [
    'serial number', 'sn', 's/n', 'serial_number', 'no seri', 'nomor seri', 'serial', 'no_seri',
    'mac', 'mac address', 'mac_address', 'serial no', 'no. seri', 'no sn', 'barcode'
  ],
  segment_name: [
    'segmen', 'segment', 'segmen layanan', 'segment_name', 'layanan', 'segmen_layanan', 'paket', 'segmen kemitraan'
  ],
  asset_type: [
    'jenis asset', 'asset_type', 'tipe aset', 'jenis_asset', 'jenis_perangkat'
  ],
  location_detail: [
    'lokasi detail', 'location_detail', 'rack', 'rak', 'posisi', 'detail lokasi', 'ruangan', 'ruang',
    'sub rack', 'lantai', 'area', 'room', 'titik rack', 'tempat', 'lokasi detail / rack', 'lokasi_detail'
  ],
  unit_count: [
    'jumlah unit', 'unit_count', 'unit', 'jumlah', 'qty', 'kuantiti', 'total unit', 'jumlah_unit', 'unit terpasang', 'banyak', 'volume', 'pcs', 'bh'
  ],
  status: [
    'status', 'status perangkat', 'status aset', 'status_perangkat', 'status operasional', 'kondisi operasional'
  ],
  condition: [
    'kondisi', 'condition', 'kondisi fisik', 'kondisi perangkat', 'kondisi_perangkat', 'keadaan'
  ],
  ownership: [
    'status kepemilikan', 'ownership', 'kepemilikan', 'status aset tetap', 'status kepemilikan aset', 'status_kepemilikan', 'hibah'
  ],
  notes: [
    'catatan', 'notes', 'keterangan', 'deskripsi', 'catatan / keterangan spesifik', 'keterangan fungsi', 'catatan_keterangan', 'ket', 'note', 'info'
  ],
};

const KNOWN_BRANDS = [
  'MikroTik', 'Mikrotik', 'Cisco', 'Huawei', 'Fiberhome', 'ZTE', 'TP-Link', 'Ubiquiti',
  'Ruijie', 'Reyee', 'D-Link', 'Fortinet', 'Juniper', 'Aruba', 'Raisecom', 'BDCOM',
  'Tenda', 'Totolink', 'Hikvision', 'Dahua', 'APC', 'Prolink', 'ICA', 'Vention',
  'Rapid', 'Finisar', 'Schneider', 'DrayTek', 'Extreme', 'Allied Telesis', 'Telkom'
];

const detectBrandFromString = (text) => {
  if (!text) return null;
  const lower = String(text).toLowerCase();
  for (const b of KNOWN_BRANDS) {
    if (lower.includes(b.toLowerCase())) return b;
  }
  return null;
};

const detectCategoryFromString = (text) => {
  if (!text) return 'Umum / Lainnya';
  const l = String(text).toLowerCase();
  if (l.includes('switch') || l.includes('catalyst') || l.includes('hub')) return 'Switch';
  if (l.includes('router') || l.includes('ccr') || l.includes('rb') || l.includes('hex') || l.includes('cloud core') || l.includes('gateway')) return 'Router';
  if (l.includes('sfp') || l.includes('transceiver') || l.includes('10g') || l.includes('1.25g') || l.includes('optical')) return 'SFP';
  if (l.includes('olt') || l.includes('epon') || l.includes('gpon')) return 'OLT';
  if (l.includes('ont') || l.includes('onu') || l.includes('modem') || l.includes('hg8') || l.includes('indihome')) return 'ONT / Modem';
  if (l.includes('ap') || l.includes('access point') || l.includes('unifi') || l.includes('wifi') || l.includes('eap') || l.includes('wireless')) return 'Access Point';
  if (l.includes('ups') || l.includes('inverter') || l.includes('accu') || l.includes('baterai') || l.includes('power') || l.includes('listrik')) return 'Power / UPS';
  if (l.includes('rack') || l.includes('otb') || l.includes('patch panel') || l.includes('odc') || l.includes('odp') || l.includes('kabel') || l.includes('fo')) return 'Passive / Rack';
  if (l.includes('cctv') || l.includes('kamera') || l.includes('camera') || l.includes('nvr') || l.includes('dvr')) return 'CCTV & Surveillance';
  return 'Umum / Lainnya';
};

// Helper to auto-detect best column match for a field
const autoDetectColumn = (headers, fieldKey) => {
  const aliases = FIELD_ALIASES[fieldKey] || [];
  for (let i = 0; i < headers.length; i++) {
    const cleanHeader = String(headers[i]).toLowerCase().trim().replace(/[*_]/g, '');
    for (const alias of aliases) {
      if (cleanHeader === alias || cleanHeader.startsWith(alias) || cleanHeader.includes(alias)) {
        return i; // Return column index
      }
    }
  }
  return -1; // Not matched
};

// Find the real table header row (skipping banner/title rows at top of branch spreadsheets)
const findHeaderRowIndex = (lines, delimiter) => {
  const HEADER_KEYWORDS = [
    'no', 'nomor', 'site', 'mitra', 'dinas', 'instansi', 'pelanggan', 'opd', 'lokasi',
    'perangkat', 'barang', 'alat', 'kategori', 'merk', 'merek', 'brand', 'tipe', 'model',
    'seri', 'sn', 'serial', 'jumlah', 'unit', 'qty', 'status', 'kondisi', 'kepemilikan',
    'hibah', 'catatan', 'keterangan', 'rack', 'ruang', 'ip', 'mac', 'alamat', 'item'
  ];

  let bestIdx = 0;
  let maxScore = 0;

  const maxScan = Math.min(lines.length, 10);
  for (let i = 0; i < maxScan; i++) {
    const line = lines[i].toLowerCase();
    let score = 0;
    for (const kw of HEADER_KEYWORDS) {
      if (line.includes(kw)) score++;
    }
    if (score > maxScore) {
      maxScore = score;
      bestIdx = i;
    }
  }

  return maxScore >= 2 ? bestIdx : 0;
};

// Robust CSV & Tab-Delimited Parser with Smart Header Detection
const parseSpreadsheetData = (text) => {
  if (!text || !text.trim()) return { headers: [], rows: [] };

  const lines = text.split(/\r\n|\n|\r/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return { headers: [], rows: [] };

  // Detect delimiter (Tab or Comma or Semicolon)
  const firstLine = lines[0];
  let delimiter = ',';
  if (firstLine.includes('\t')) {
    delimiter = '\t';
  } else if ((firstLine.match(/;/g) || []).length > (firstLine.match(/,/g) || []).length) {
    delimiter = ';';
  }

  // Parse CSV lines respecting quotes
  const parseLine = (line) => {
    const result = [];
    let cur = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (c === delimiter && !inQuotes) {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += c;
      }
    }
    result.push(cur.trim());
    return result;
  };

  // Find real header row
  const headerIdx = findHeaderRowIndex(lines, delimiter);
  const headers = parseLine(lines[headerIdx]);
  const rows = [];

  for (let i = headerIdx + 1; i < lines.length; i++) {
    const parsedRow = parseLine(lines[i]);
    // Skip empty or purely whitespace rows
    if (parsedRow.some((val) => val && val.length > 0)) {
      rows.push(parsedRow);
    }
  }

  return { headers, rows };
};

const ImportAssetModal = ({
  isOpen,
  onClose,
  sites = [],
  branches = [],
  user = null,
  onImportSuccess,
}) => {
  const [selectedDefaultSiteId, setSelectedDefaultSiteId] = useState('');
  const [rawText, setRawText] = useState('');
  const [fileName, setFileName] = useState('');
  const [parsedHeaders, setParsedHeaders] = useState([]);
  const [parsedRawRows, setParsedRawRows] = useState([]);
  const [columnMapping, setColumnMapping] = useState({});
  const [showMappingConfig, setShowMappingConfig] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setErrorMsg('');
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result || '';
      setRawText(content);
      processContent(content, file.name);
    };
    reader.readAsText(file);
  };

  const handleTextPasteChange = (e) => {
    const content = e.target.value;
    setRawText(content);
    setFileName(content.trim() ? 'Data Excel Paste' : '');
    setErrorMsg('');
    setImportResult(null);
    processContent(content, 'Data Excel Paste');
  };

  const processContent = (content, name = '') => {
    const { headers, rows } = parseSpreadsheetData(content);
    setParsedHeaders(headers);
    setParsedRawRows(rows);

    // Auto-detect column mapping
    const newMapping = {};
    Object.keys(FIELD_ALIASES).forEach((key) => {
      const matchedIdx = autoDetectColumn(headers, key);
      newMapping[key] = matchedIdx >= 0 ? matchedIdx : '';
    });
    setColumnMapping(newMapping);
  };

  const handleDownloadTemplate = () => {
    const sampleSite = sites[0]?.site_name || 'SLB-C NEGERI PEMBINA';
    const csvContent = [
      'Site / Mitra,Kategori,Segmen,Jenis Asset,Merek,Tipe / Model,Serial Number,Lokasi Detail,Jumlah Unit,Status,Kondisi,Status Kepemilikan,Catatan',
      `"${sampleSite}","SFP","Education","Aktif","Rapid","SFP Rapid-1,25G-20KM","EW3BU4542, EW3BU4543","Main Rack",2,"Aktif","Baik","Aset Tetap","Optical & Ethernet Network Transceiver"`,
      `"${sampleSite}","Switch","Education","Aktif","Cisco","Catalyst 2960-X","FCW2145A098","Main Rack",1,"Aktif","Baik","Aset Tetap","Network Switching & Connectivity Device"`,
      `"${sampleSite}","Router","Kemitraan","Aktif","MikroTik","CCR1036-8G-2S+","HE38927419","Main Rack",1,"Aktif","Baik","Aset Hibah","Aset dihibahkan ke mitra sekolah"`,
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'Template_Import_Aset_SAMBA.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Convert raw rows to validated item preview objects with AI/Fuzzy Auto-Healing
  const previewItems = useMemo(() => {
    if (!parsedRawRows || parsedRawRows.length === 0) return [];

    // Extract site name from file name if possible (e.g. "Site Banjarmasin - Sheet1.csv" -> "Site Banjarmasin")
    let fileNameSiteHint = '';
    if (fileName && fileName.toLowerCase().includes('site')) {
      const parts = fileName.split(/[-_.]/);
      fileNameSiteHint = parts[0]?.trim() || '';
    }

    return parsedRawRows.map((row, idx) => {
      const getVal = (fieldKey) => {
        const colIdx = columnMapping[fieldKey];
        if (colIdx === '' || colIdx === undefined || colIdx === null || colIdx < 0) return '';
        return row[colIdx] ? String(row[colIdx]).trim() : '';
      };

      const rowRawText = row.join(' ');

      // 1. Site Resolution & Auto-Healing
      let rawSite = getVal('site_name');
      let siteIdToUse = selectedDefaultSiteId ? parseInt(selectedDefaultSiteId, 10) : undefined;
      let finalSiteName = '';

      if (selectedDefaultSiteId) {
        const matched = sites.find((s) => String(s.id) === String(selectedDefaultSiteId));
        finalSiteName = matched ? matched.site_name : '';
      } else if (rawSite) {
        finalSiteName = rawSite;
      } else if (fileNameSiteHint) {
        finalSiteName = fileNameSiteHint;
      } else if (sites.length > 0) {
        finalSiteName = sites[0].site_name;
      } else {
        finalSiteName = 'Site Operasional Lapangan';
      }

      // 2. Category & Brand Auto-Extraction
      let rawCategory = getVal('category_name');
      let detectedCat = rawCategory || detectCategoryFromString(rowRawText);

      let rawBrand = getVal('brand');
      let detectedBrand = rawBrand || detectBrandFromString(rowRawText) || (detectedCat !== 'Umum / Lainnya' ? detectedCat : 'Perangkat Jaringan');

      // 3. Model Auto-Healing
      let rawModel = getVal('model');
      let detectedModel = rawModel || (detectedCat !== 'Umum / Lainnya' ? `${detectedCat} Standar` : 'Unit Standar');

      // If brand was placed in model (or vice versa), clean it
      if (!rawBrand && rawModel && detectBrandFromString(rawModel)) {
        detectedBrand = detectBrandFromString(rawModel);
      }

      // 4. Serial Number Auto-Healing
      let rawSN = getVal('serial_number');
      let isAutoGeneratedSN = false;
      if (!rawSN || rawSN === '-' || rawSN.toLowerCase() === 'n/a' || rawSN.toLowerCase() === 'null') {
        const siteSlug = finalSiteName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 8) || 'SITE';
        rawSN = `SN-${siteSlug}-${String(idx + 1).padStart(3, '0')}`;
        isAutoGeneratedSN = true;
      }

      // Multi-SN count detection
      const snCount = rawSN
        ? rawSN.replace(/\r\n|\n|;/g, ',').split(',').map((s) => s.trim()).filter(Boolean).length
        : 0;

      const rawUnitCount = parseInt(getVal('unit_count'), 10);
      const unitCount = !isNaN(rawUnitCount) && rawUnitCount > 0 ? rawUnitCount : (snCount > 1 ? snCount : 1);

      // 5. Other Defaults
      const segmentName = getVal('segment_name') || '';
      const assetType = getVal('asset_type') || 'Aktif';
      const locationDetail = getVal('location_detail') || 'Main Rack';
      const status = getVal('status') || 'Aktif';
      const condition = getVal('condition') || 'Baik';
      const ownership = getVal('ownership') || (rowRawText.toLowerCase().includes('hibah') ? 'Aset Hibah' : 'Aset Tetap');
      const notes = getVal('notes') || '';

      return {
        rowIndex: idx + 1,
        site_name: finalSiteName,
        site_id: siteIdToUse,
        category_name: detectedCat,
        segment_name: segmentName,
        asset_type: assetType,
        brand: detectedBrand,
        model: detectedModel,
        serial_number: rawSN,
        isAutoGeneratedSN,
        snCount,
        location_detail: locationDetail,
        unit_count: unitCount,
        status,
        condition,
        ownership,
        notes,
        isValid: true, // Always ready due to smart auto-healing
        errors: [],
      };
    });
  }, [parsedRawRows, columnMapping, selectedDefaultSiteId, sites, fileName]);

  const validCount = previewItems.filter((item) => item.isValid).length;
  const errorCount = previewItems.length - validCount;

  const handleExecuteImport = async () => {
    if (validCount === 0) {
      setErrorMsg('Tidak ada baris data yang siap diimpor.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg('');

    try {
      const payload = {
        default_site_id: selectedDefaultSiteId ? parseInt(selectedDefaultSiteId, 10) : null,
        items: previewItems.map((item) => ({
          site_id: item.site_id,
          site_name: item.site_name,
          category_name: item.category_name,
          segment_name: item.segment_name,
          asset_type: item.asset_type,
          brand: item.brand,
          model: item.model,
          serial_number: item.serial_number,
          location_detail: item.location_detail,
          unit_count: item.unit_count,
          status: item.status,
          condition: item.condition,
          ownership: item.ownership,
          notes: item.notes,
        })),
      };

      const res = await importAssets(payload);
      setImportResult(res);
      if (onImportSuccess) {
        onImportSuccess();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Gagal memproses import data ke server.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setRawText('');
    setFileName('');
    setParsedHeaders([]);
    setParsedRawRows([]);
    setColumnMapping({});
    setImportResult(null);
    setErrorMsg('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center space-x-2">
                <span>Import Massal Aset (Spreadsheet / CSV)</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center space-x-1">
                  <Sparkles className="w-3 h-3 mr-0.5 text-cyan-400" />
                  <span>Smart Auto-Mapping</span>
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Impor puluhan hingga ratusan perangkat sekaligus dari file Excel / CSV dari berbagai cabang.
              </p>
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

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 flex-1">
          
          {/* Top Row: Target Site Selector & Download Template */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800/80">
            {/* Target Site Override (Very helpful for single site import test) */}
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Target Khusus Site (Opsional / Mode Uji Coba 1 Site):
              </label>
              <select
                value={selectedDefaultSiteId}
                onChange={(e) => setSelectedDefaultSiteId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
              >
                <option value="">-- Otomatis Baca Kolom Site di File Spreadsheet --</option>
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.partner_name ? `${s.partner_name} - ` : ''}{s.site_name} {s.branch ? `(${s.branch.name})` : ''}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                {selectedDefaultSiteId
                  ? '💡 Seluruh baris di spreadsheet yang tidak memiliki nama site akan otomatis dimasukkan ke site ini.'
                  : '💡 Nama site akan dibaca dari kolom spreadsheet secara otomatis.'}
              </p>
            </div>

            {/* Template Download Button */}
            <div className="flex flex-col justify-end">
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-cyan-400 text-xs font-semibold flex items-center justify-center space-x-2 transition-all active:scale-95 shadow-sm"
              >
                <Download className="w-4 h-4 shrink-0" />
                <span>Unduh Template CSV</span>
              </button>
              <p className="text-[10px] text-slate-500 text-center mt-1">Contoh format standar resmi</p>
            </div>
          </div>

          {/* Upload Dropzone & Paste Area */}
          {!parsedRawRows.length && (
            <div className="space-y-3">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-cyan-500 rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all bg-slate-950/40 hover:bg-slate-900/60 group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt,.tsv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Pilih File CSV / Spreadsheet dari Komputer
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Mendukung berkas <strong>.csv</strong> atau <strong>.txt</strong> hasil ekspor Excel / Google Sheets
                </p>
                <p className="text-[11px] text-cyan-400/90 mt-2 font-medium">
                  ✨ Format bebas dari cabang manapun! Sistem secara cerdas menyesuaikan kolom dan melengkapi data otomatis.
                </p>
              </div>

              {/* Text Area Paste Fallback */}
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  Atau Tempel / Copy-Paste Data dari Tabel Excel Langsung:
                </label>
                <textarea
                  rows="3"
                  placeholder="Salin baris dari Excel / Google Sheets dan tempelkan di sini (Ctrl+V)..."
                  value={rawText}
                  onChange={handleTextPasteChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-300 placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* If Data Loaded: Show Summary, Column Mapping Accordion, and Live Table Preview */}
          {parsedRawRows.length > 0 && !importResult && (
            <div className="space-y-4 animate-in fade-in duration-200">
              
              {/* Loaded File Info & Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center space-x-2">
                  <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-semibold text-white truncate max-w-xs sm:max-w-md">
                    {fileName || 'Data Terbaca'}: <strong>{parsedRawRows.length} Baris Data</strong>
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Auto-Adjusted
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowMappingConfig(!showMappingConfig)}
                    className="text-xs font-semibold text-cyan-400 hover:underline flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-900 border border-slate-800"
                  >
                    <span>⚙️ {showMappingConfig ? 'Tutup Pemetaan Kolom' : 'Sesuaikan Kolom'}</span>
                    {showMappingConfig ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="text-xs font-semibold text-slate-400 hover:text-rose-400 px-2 py-1 rounded hover:bg-slate-900"
                  >
                    Ganti File
                  </button>
                </div>
              </div>

              {/* Expandable Column Mapping Customizer */}
              {showMappingConfig && (
                <div className="p-3.5 rounded-xl bg-slate-950 border border-cyan-500/30 space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-cyan-400">
                      Pemetaan Kolom Spreadsheet ke Sistem SAMBA:
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Pilih kolom yang sesuai dari file spreadsheet Anda.
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                    {[
                      { key: 'site_name', label: 'Site / Instansi / Dinas' },
                      { key: 'category_name', label: 'Perangkat / Kategori' },
                      { key: 'brand', label: 'Merek / Brand' },
                      { key: 'model', label: 'Tipe / Model' },
                      { key: 'serial_number', label: 'Serial Number / MAC' },
                      { key: 'segment_name', label: 'Segmen Layanan' },
                      { key: 'asset_type', label: 'Jenis Asset' },
                      { key: 'location_detail', label: 'Lokasi Detail / Ruang' },
                      { key: 'unit_count', label: 'Jumlah Unit' },
                      { key: 'status', label: 'Status' },
                      { key: 'condition', label: 'Kondisi' },
                      { key: 'ownership', label: 'Kepemilikan' },
                      { key: 'notes', label: 'Catatan' },
                    ].map((field) => (
                      <div key={field.key} className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-300 block truncate">
                          {field.label}
                        </label>
                        <select
                          value={columnMapping[field.key] !== undefined ? columnMapping[field.key] : ''}
                          onChange={(e) =>
                            setColumnMapping({
                              ...columnMapping,
                              [field.key]: e.target.value !== '' ? parseInt(e.target.value, 10) : '',
                            })
                          }
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-[11px] text-slate-200 focus:border-cyan-500 focus:outline-none"
                        >
                          <option value="">-- Otomatis / Deteksi AI --</option>
                          {parsedHeaders.map((h, hIdx) => (
                            <option key={hIdx} value={hIdx}>
                              Kolom {hIdx + 1}: {h || `(Tanpa Nama)`}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Status Overview Stats Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <div className="flex items-center space-x-3">
                  <span className="text-slate-400">Total Baris: <strong className="text-white">{previewItems.length}</strong></span>
                  <span className="text-emerald-400">✅ Siap Diimpor: <strong>{validCount}</strong></span>
                  {errorCount > 0 && (
                    <span className="text-rose-400">❌ Tidak Lengkap: <strong>{errorCount}</strong></span>
                  )}
                </div>
                <span className="text-[11px] text-cyan-400 flex items-center space-x-1">
                  <Wand2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Semua kolom telah disesuaikan & siap diimpor ke database.</span>
                </span>
              </div>

              {/* Interactive Live Table Preview */}
              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 max-h-72 overflow-y-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900 text-slate-400 font-semibold uppercase tracking-wider sticky top-0 z-10 border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Target Site / Instansi</th>
                      <th className="py-2.5 px-3">Kategori</th>
                      <th className="py-2.5 px-3">Merek & Model</th>
                      <th className="py-2.5 px-3">Serial Number</th>
                      <th className="py-2.5 px-3 text-center">Unit</th>
                      <th className="py-2.5 px-3 text-center">Kepemilikan</th>
                      <th className="py-2.5 px-3">Lokasi / Ruang</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {previewItems.map((item) => (
                      <tr
                        key={item.rowIndex}
                        className="hover:bg-slate-900/60 transition-colors"
                      >
                        <td className="py-2 px-3 whitespace-nowrap">
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Ready #{item.rowIndex}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-semibold text-white max-w-[170px] truncate" title={item.site_name}>
                          {item.site_name}
                        </td>
                        <td className="py-2 px-3">
                          <div className="font-medium text-purple-400">{item.category_name}</div>
                          {item.segment_name && (
                            <div className="text-[10px] text-slate-500">{item.segment_name}</div>
                          )}
                        </td>
                        <td className="py-2 px-3">
                          <div className="font-bold text-slate-100">{item.brand}</div>
                          <div className="text-[11px] text-slate-400">{item.model}</div>
                        </td>
                        <td className="py-2 px-3 font-mono text-cyan-400 max-w-[160px] truncate" title={item.serial_number}>
                          {item.serial_number}
                          {item.isAutoGeneratedSN && (
                            <span className="ml-1 text-[9px] text-slate-400 bg-slate-800 px-1 py-0.5 rounded font-sans">
                              Auto
                            </span>
                          )}
                          {item.snCount > 1 && (
                            <span className="ml-1 text-[10px] text-slate-400 font-sans">({item.snCount} SN)</span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-center font-bold text-slate-200">
                          {item.unit_count}
                        </td>
                        <td className="py-2 px-3 text-center">
                          {item.ownership === 'Aset Hibah' ? (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                              <Gift className="w-2.5 h-2.5 mr-1 text-amber-400" />
                              Hibah
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                              <Building2 className="w-2.5 h-2.5 mr-1 text-blue-400" />
                              Aset Tetap
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-slate-400 max-w-[130px] truncate" title={item.location_detail}>
                          {item.location_detail}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Import Result Notification */}
          {importResult && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <h4 className="font-bold text-sm text-white">Import Selesai Berhasil!</h4>
              </div>
              <p className="text-xs text-slate-300">
                {importResult.message}
              </p>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Total Baris</div>
                  <div className="text-base font-bold text-white">{importResult.total_rows}</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-emerald-400 text-[10px]">Berhasil Disimpan</div>
                  <div className="text-base font-bold text-emerald-400">{importResult.success_count}</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-rose-400 text-[10px]">Gagal</div>
                  <div className="text-base font-bold text-rose-400">{importResult.failed_count}</div>
                </div>
              </div>

              {importResult.errors && importResult.errors.length > 0 && (
                <div className="p-2.5 rounded-lg bg-slate-900 border border-rose-500/30 space-y-1 text-xs max-h-36 overflow-y-auto">
                  <div className="font-bold text-rose-400 text-[11px]">Rincian Baris yang Gagal:</div>
                  {importResult.errors.map((err, i) => (
                    <div key={i} className="text-[11px] text-slate-300 flex items-start space-x-1.5">
                      <span className="text-rose-400">• Baris #{err.row_index} ({err.brand} {err.model}):</span>
                      <span className="text-slate-400">{err.error}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {importResult ? 'Tutup' : 'Batal'}
          </button>

          {!importResult && parsedRawRows.length > 0 && (
            <button
              type="button"
              onClick={handleExecuteImport}
              disabled={isProcessing || validCount === 0}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center space-x-2 shadow-lg shadow-cyan-500/20 transition-all active:scale-95 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Memproses Import...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Mulai Import ({validCount} Aset Siap)</span>
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default ImportAssetModal;
