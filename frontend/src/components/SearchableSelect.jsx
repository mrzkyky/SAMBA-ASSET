import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, X, Plus } from 'lucide-react';

const SearchableSelect = ({
  options = [],
  value = '',
  onChange,
  placeholder = 'Pilih opsi...',
  searchPlaceholder = 'Cari...',
  onAddNew,
  addNewLabel = '+ Tambah Baru...',
  required = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);
  const optionsListRef = useRef(null);
  const itemRefs = useRef([]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => String(opt.value) === String(value));

  const filteredOptions = options.filter((opt) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    const labelMatch = opt.label && opt.label.toLowerCase().includes(q);
    const sublabelMatch = opt.sublabel && opt.sublabel.toLowerCase().includes(q);
    const keywordsMatch = opt.searchKeywords && opt.searchKeywords.toLowerCase().includes(q);
    return labelMatch || sublabelMatch || keywordsMatch;
  });

  // Auto focus search input and set initial highlighted index when opened
  useEffect(() => {
    if (isOpen) {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
      // Highlight currently selected option if available, otherwise first option
      const currentIdx = filteredOptions.findIndex((opt) => String(opt.value) === String(value));
      setHighlightedIndex(currentIdx >= 0 ? currentIdx : 0);
    } else {
      setSearchTerm('');
      setHighlightedIndex(0);
    }
  }, [isOpen]);

  // Reset highlighted index when search term changes
  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchTerm]);

  // Smooth scroll highlighted option into view
  useEffect(() => {
    if (isOpen && itemRefs.current[highlightedIndex]) {
      itemRefs.current[highlightedIndex].scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [highlightedIndex, isOpen]);

  const handleSelect = (optValue) => {
    onChange(optValue);
    setIsOpen(false);
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (filteredOptions.length > 0) {
        setHighlightedIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : 0));
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (filteredOptions.length > 0) {
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredOptions.length - 1));
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      if (filteredOptions.length > 0 && highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
        handleSelect(filteredOptions[highlightedIndex].value);
      } else if (onAddNew && filteredOptions.length === 0) {
        setIsOpen(false);
        onAddNew();
      }
    } else if (e.key === 'Tab') {
      // On Tab press, select the currently highlighted option and close dropdown so focus advances naturally
      if (filteredOptions.length > 0 && highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
        handleSelect(filteredOptions[highlightedIndex].value);
      } else {
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  return (
    <div className={`relative ${className}`} ref={containerRef} onKeyDown={handleKeyDown}>
      {/* Hidden input for HTML form validation if required */}
      {required && (
        <input
          type="text"
          value={value}
          onChange={() => {}}
          required
          tabIndex={-1}
          className="sr-only"
        />
      )}

      {/* Select Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none flex items-center justify-between transition-all hover:border-slate-700 text-left select-none"
      >
        <span className={selectedOption ? 'text-slate-100 font-semibold truncate' : 'text-slate-500 truncate'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 ml-2 transition-transform duration-200 ${isOpen ? 'rotate-180 text-cyan-400' : ''}`} />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Search Box */}
          <div className="p-2 border-b border-slate-800 bg-slate-950/60 sticky top-0 z-10">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-7 py-1.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            <div className="text-[10px] text-slate-500 mt-1 px-1 flex items-center justify-between">
              <span>Gunakan tombol <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-400 text-[9px] font-mono">↑</kbd> <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-400 text-[9px] font-mono">↓</kbd> & <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-400 text-[9px] font-mono">Enter</kbd> / <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-400 text-[9px] font-mono">Tab</kbd></span>
              {filteredOptions.length > 0 && (
                <span className="font-mono text-cyan-400/80">{highlightedIndex + 1}/{filteredOptions.length}</span>
              )}
            </div>
          </div>

          {/* Options List */}
          <div ref={optionsListRef} className="max-h-60 overflow-y-auto divide-y divide-slate-800/40 p-1 space-y-0.5">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-center text-xs text-slate-500 italic">
                Tidak ada opsi yang cocok dengan "{searchTerm}"
              </div>
            ) : (
              filteredOptions.map((opt, idx) => {
                const isSelected = String(opt.value) === String(value);
                const isHighlighted = idx === highlightedIndex;
                return (
                  <div
                    key={opt.value}
                    ref={(el) => (itemRefs.current[idx] = el)}
                    onClick={() => handleSelect(opt.value)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={`px-3 py-2 rounded-lg text-xs cursor-pointer flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                        : isHighlighted
                        ? 'bg-slate-800/90 text-white font-semibold ring-1 ring-cyan-500/40 shadow-sm'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <div className="flex items-center space-x-1.5">
                        <span className="truncate">{opt.label}</span>
                      </div>
                      {opt.sublabel && <div className="text-[10px] text-slate-500 font-normal truncate mt-0.5">{opt.sublabel}</div>}
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-cyan-400 shrink-0" />}
                  </div>
                );
              })
            )}

            {/* Quick Add Option */}
            {onAddNew && (
              <div
                onClick={() => {
                  setIsOpen(false);
                  onAddNew();
                }}
                className="px-3 py-2 rounded-lg text-xs cursor-pointer flex items-center space-x-1.5 text-cyan-400 hover:bg-cyan-500/10 font-bold border-t border-slate-800/80 mt-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{addNewLabel}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
