import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check, AlertCircle } from 'lucide-react';
import { BUILDING_BLOCKS, Building } from '../../types';
import { useApp } from '../../context/AppContext';

interface BuildingBlockSelectProps {
  value: string;
  onChange: (val: Building) => void;
  error?: string;
  label?: string;
  required?: boolean;
}

export const BuildingBlockSelect: React.FC<BuildingBlockSelectProps> = ({
  value,
  onChange,
  error,
  label = 'Building Block',
  required = true,
}) => {
  const { buildingBlocks } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const availableBlocks = buildingBlocks && buildingBlocks.length > 0 ? buildingBlocks : BUILDING_BLOCKS;

  const filteredOptions = availableBlocks.filter((opt) =>
    opt.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (option: Building) => {
    onChange(option);
    setIsOpen(false);
    setSearch('');
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearch('');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredOptions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredOptions.length - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
        handleSelect(filteredOptions[highlightedIndex]);
      }
    }
  };

  return (
    <div className="w-full relative" ref={containerRef}>
      {label && (
        <label className="block text-[15px] font-semibold text-[#334155] mb-2">
          {label} {required && <span className="text-[#DC2626] ml-0.5">*</span>}
        </label>
      )}

      {/* Main Select Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className={`w-full bg-white h-[56px] rounded-[12px] px-4 flex items-center justify-between border text-left transition-all duration-200 outline-none cursor-pointer ${
          error
            ? 'border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/20'
            : isOpen
            ? 'border-[#2563EB] ring-2 ring-[#2563EB]/20'
            : 'border-[#CBD5E1] hover:border-[#94A3B8] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20'
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span
          className={`text-base font-medium truncate ${
            value ? 'text-[#0F172A]' : 'text-[#94A3B8]'
          }`}
        >
          {value || 'Select Building Block'}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-[#64748B] transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-[#2563EB]' : ''
          }`}
        />
      </button>

      {/* Validation Error Message */}
      {error && (
        <div className="flex items-center gap-1.5 mt-1.5 text-xs font-semibold text-[#DC2626]">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Searchable Dropdown Popup */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-2 bg-white border border-[#CBD5E1] rounded-[12px] shadow-[0_12px_32px_rgba(15,23,42,0.15)] overflow-hidden transition-all duration-150">
          {/* Search Input Field inside Dropdown */}
          <div className="p-2.5 border-b border-[#E2E8F0] bg-[#F8FAFC]">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search building block..."
                className="w-full bg-white border border-[#CBD5E1] rounded-[8px] pl-9 pr-3 py-2 text-sm text-[#0F172A] placeholder-[#94A3B8] outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
              />
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-[220px] overflow-y-auto p-1 divide-y divide-slate-50">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-sm text-[#94A3B8] text-center italic">
                No matching building blocks
              </div>
            ) : (
              filteredOptions.map((option, idx) => {
                const isSelected = value === option;
                const isHighlighted = highlightedIndex === idx;

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleSelect(option)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={`w-full text-left px-4 py-3 rounded-[8px] text-sm font-medium transition-colors flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-[#EFF6FF] text-[#2563EB] font-bold'
                        : isHighlighted
                        ? 'bg-slate-100 text-[#0F172A]'
                        : 'text-[#334155] hover:bg-slate-50'
                    }`}
                  >
                    <span>{option}</span>
                    {isSelected && <Check className="w-4 h-4 text-[#2563EB]" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
