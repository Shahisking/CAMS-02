import React, { useState, useEffect } from 'react';
import { Building, Layers, DoorOpen, Check, ChevronDown, Plus, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { FloorName, RoomItem } from '../../types';

interface CascadingLocationSelectProps {
  selectedBlock: string;
  selectedFloor: FloorName | '';
  selectedRoomNumber: string;
  onBlockChange: (block: string) => void;
  onFloorChange: (floor: FloorName) => void;
  onRoomChange: (roomNumber: string, roomObj?: RoomItem) => void;
  required?: boolean;
  error?: string;
  compact?: boolean;
}

const STANDARD_FLOORS: FloorName[] = [
  'Ground Floor',
  'First Floor',
  'Second Floor',
  'Third Floor',
  'Fourth Floor',
];

export const CascadingLocationSelect: React.FC<CascadingLocationSelectProps> = ({
  selectedBlock,
  selectedFloor,
  selectedRoomNumber,
  onBlockChange,
  onFloorChange,
  onRoomChange,
  required = true,
  error,
  compact = false,
}) => {
  const { blocks, rooms, buildingBlocks } = useApp();
  const [isCustomRoom, setIsCustomRoom] = useState(false);
  const [customRoomInput, setCustomRoomInput] = useState('');

  // Available blocks from context or static list
  const availableBlocks = blocks && blocks.length > 0 ? blocks.map((b) => b.name) : buildingBlocks;

  // Filter rooms by selected block and floor
  const filteredRooms = rooms.filter((r) => {
    const matchBlock = selectedBlock ? r.block.toLowerCase() === selectedBlock.toLowerCase() : true;
    const matchFloor = selectedFloor ? r.floor === selectedFloor : true;
    return matchBlock && matchFloor;
  });

  // When selected block changes, if room doesn't match, auto update floor or room if available
  const handleBlockSelect = (bName: string) => {
    onBlockChange(bName);
    // Auto-select ground floor if none selected
    if (!selectedFloor) {
      onFloorChange('Ground Floor');
    }
  };

  const handleFloorSelect = (fName: FloorName) => {
    onFloorChange(fName);
  };

  const handleRoomSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === '__custom__') {
      setIsCustomRoom(true);
      setCustomRoomInput('');
      onRoomChange('');
    } else {
      setIsCustomRoom(false);
      const matched = rooms.find(
        (r) =>
          r.roomNumber === val &&
          (!selectedBlock || r.block.toLowerCase() === selectedBlock.toLowerCase())
      );
      onRoomChange(val, matched);
    }
  };

  return (
    <div className="space-y-3.5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* 1. Building Block Dropdown */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>Building Block {required && <span className="text-rose-500">*</span>}</span>
          </label>
          <div className="relative">
            <select
              value={selectedBlock}
              onChange={(e) => handleBlockSelect(e.target.value)}
              className={`w-full bg-slate-50 dark:bg-slate-800 border text-slate-900 dark:text-white text-xs rounded-xl px-3 py-2.5 outline-none cursor-pointer appearance-none ${
                error ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700 focus:border-[#2563EB]'
              }`}
            >
              <option value="">Select Block</option>
              {availableBlocks.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* 2. Floor Dropdown */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>Floor {required && <span className="text-rose-500">*</span>}</span>
          </label>
          <div className="relative">
            <select
              value={selectedFloor}
              onChange={(e) => handleFloorSelect(e.target.value as FloorName)}
              disabled={!selectedBlock}
              className={`w-full bg-slate-50 dark:bg-slate-800 border text-slate-900 dark:text-white text-xs rounded-xl px-3 py-2.5 outline-none cursor-pointer appearance-none ${
                !selectedBlock ? 'opacity-50 cursor-not-allowed' : ''
              } ${error ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700 focus:border-[#2563EB]'}`}
            >
              <option value="">Select Floor</option>
              {STANDARD_FLOORS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* 3. Room Number Cascading Dropdown */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
            <DoorOpen className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>Room Number {required && <span className="text-rose-500">*</span>}</span>
          </label>

          {!isCustomRoom ? (
            <div className="relative">
              <select
                value={selectedRoomNumber}
                onChange={handleRoomSelect}
                disabled={!selectedBlock || !selectedFloor}
                className={`w-full bg-slate-50 dark:bg-slate-800 border text-slate-900 dark:text-white text-xs rounded-xl px-3 py-2.5 outline-none cursor-pointer appearance-none ${
                  !selectedBlock || !selectedFloor ? 'opacity-50 cursor-not-allowed' : ''
                } ${error ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700 focus:border-[#2563EB]'}`}
              >
                <option value="">
                  {!selectedBlock || !selectedFloor
                    ? 'Select Block & Floor First'
                    : filteredRooms.length === 0
                    ? 'No registered rooms (Choose Custom)'
                    : 'Select Room'}
                </option>
                {filteredRooms.map((r) => (
                  <option key={r.id} value={r.roomNumber}>
                    {r.roomNumber} — {r.roomName} ({r.roomType})
                  </option>
                ))}
                <option value="__custom__">+ Enter Custom Room Number</option>
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                placeholder="e.g. S110 or Lab 3"
                value={customRoomInput}
                onChange={(e) => {
                  setCustomRoomInput(e.target.value);
                  onRoomChange(e.target.value);
                }}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs rounded-xl px-3 py-2.5 outline-none focus:border-[#2563EB]"
                required={required}
              />
              <button
                type="button"
                onClick={() => {
                  setIsCustomRoom(false);
                  setCustomRoomInput('');
                }}
                className="px-2.5 py-2.5 text-[11px] font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-xl cursor-pointer shrink-0"
                title="Select from list"
              >
                List
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Validation Error Message */}
      {error && (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
