import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Save, Plus, DoorOpen, Building, Layers, Users, Tag, AlertTriangle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { RoomItem, FloorName, RoomType, RoomStatus, Department } from '../../types';

interface RoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingRoom?: RoomItem | null;
  defaultBlock?: string;
  defaultFloor?: FloorName;
}

const DEPARTMENTS: Department[] = [
  'Computer Science & Engineering',
  'Information Technology',
  'Electronics & Communication',
  'Electrical & Electronics',
  'Mechanical Engineering',
  'Civil Engineering',
  'Artificial Intelligence & Data Science',
  'Administrative Office',
  'Central Library',
  'Hostel Management',
  'Physical Education',
];

const ROOM_TYPES: RoomType[] = [
  'Classroom',
  'Laboratory',
  'Staff Room',
  'Seminar Hall',
  'Office',
  'Store Room',
  'Server Room',
];

const ROOM_STATUSES: RoomStatus[] = [
  'Active',
  'Occupied',
  'Vacant',
  'Under Maintenance',
  'Under Renovation',
];

const FLOORS: FloorName[] = [
  'Ground Floor',
  'First Floor',
  'Second Floor',
  'Third Floor',
  'Fourth Floor',
];

export const RoomModal: React.FC<RoomModalProps> = ({
  isOpen,
  onClose,
  editingRoom,
  defaultBlock = 'S Block',
  defaultFloor = 'Ground Floor',
}) => {
  const { blocks, buildingBlocks, addRoom, updateRoom } = useApp();

  const [roomNumber, setRoomNumber] = useState('');
  const [roomName, setRoomName] = useState('');
  const [block, setBlock] = useState(defaultBlock);
  const [floor, setFloor] = useState<FloorName>(defaultFloor);
  const [department, setDepartment] = useState<Department>('Computer Science & Engineering');
  const [capacity, setCapacity] = useState<number>(60);
  const [roomType, setRoomType] = useState<RoomType>('Classroom');
  const [status, setStatus] = useState<RoomStatus>('Active');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const availableBlocks = blocks && blocks.length > 0 ? blocks.map((b) => b.name) : buildingBlocks;

  useEffect(() => {
    if (editingRoom) {
      setRoomNumber(editingRoom.roomNumber || '');
      setRoomName(editingRoom.roomName || '');
      setBlock(editingRoom.block || defaultBlock);
      setFloor(editingRoom.floor || defaultFloor);
      setDepartment(editingRoom.department || 'Computer Science & Engineering');
      setCapacity(editingRoom.capacity || 60);
      setRoomType(editingRoom.roomType || 'Classroom');
      setStatus(editingRoom.status || 'Active');
      setDescription(editingRoom.description || '');
      setError('');
    } else {
      setRoomNumber('');
      setRoomName('');
      setBlock(defaultBlock);
      setFloor(defaultFloor);
      setDepartment('Computer Science & Engineering');
      setCapacity(60);
      setRoomType('Classroom');
      setStatus('Active');
      setDescription('');
      setError('');
    }
  }, [editingRoom, defaultBlock, defaultFloor, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNumber.trim()) {
      setError('Room Number is required (e.g. S110)');
      return;
    }
    if (!roomName.trim()) {
      setError('Room Name is required (e.g. AI & Data Science Innovation Lab)');
      return;
    }

    try {
      if (editingRoom) {
        await updateRoom(editingRoom.id, {
          roomNumber: roomNumber.trim(),
          roomName: roomName.trim(),
          block,
          floor,
          department,
          capacity: Number(capacity) || 30,
          roomType,
          status,
          description: description.trim(),
        });
      } else {
        await addRoom({
          roomNumber: roomNumber.trim(),
          roomName: roomName.trim(),
          block,
          floor,
          department,
          capacity: Number(capacity) || 30,
          roomType,
          status,
          description: description.trim(),
        });
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save room details.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl relative my-8"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] flex items-center justify-center border border-blue-100 dark:border-blue-900/50">
            <DoorOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white font-display">
              {editingRoom ? `Edit Room — ${editingRoom.roomNumber}` : 'Add Campus Room / Lab'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {editingRoom
                ? 'Modify room attributes, capacity, and status'
                : 'Register a new room, lab, or seminar hall under campus hierarchy'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-semibold rounded-xl border border-rose-200 dark:border-rose-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Room Number *
              </label>
              <input
                type="text"
                placeholder="e.g. S110, S205, N102"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm rounded-xl px-3.5 py-2.5 outline-none focus:border-[#2563EB]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Room Name / Title *
              </label>
              <input
                type="text"
                placeholder="e.g. AI & Data Science Innovation Lab"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm rounded-xl px-3.5 py-2.5 outline-none focus:border-[#2563EB]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Building Block *
              </label>
              <select
                value={block}
                onChange={(e) => setBlock(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs rounded-xl px-3 py-2.5 outline-none cursor-pointer"
              >
                {availableBlocks.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Floor *
              </label>
              <select
                value={floor}
                onChange={(e) => setFloor(e.target.value as FloorName)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs rounded-xl px-3 py-2.5 outline-none cursor-pointer"
              >
                {FLOORS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Department *
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value as Department)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs rounded-xl px-3 py-2.5 outline-none cursor-pointer"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Room Type *
              </label>
              <select
                value={roomType}
                onChange={(e) => setRoomType(e.target.value as RoomType)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs rounded-xl px-3 py-2.5 outline-none cursor-pointer"
              >
                {ROOM_TYPES.map((rt) => (
                  <option key={rt} value={rt}>
                    {rt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Seating Capacity
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={capacity === 0 ? '' : capacity}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, '');
                  setCapacity(val ? Number(val) : 0);
                }}
                placeholder="e.g. 60"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#2563EB]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Status *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as RoomStatus)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs rounded-xl px-3 py-2.5 outline-none cursor-pointer"
              >
                {ROOM_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Description / Equipment Facilities
            </label>
            <textarea
              placeholder="e.g. 60 High-end Workstations, Samsung Smart Display, Dual Air Conditioners"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs rounded-xl p-3.5 outline-none focus:border-[#2563EB]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white font-semibold rounded-xl text-xs shadow-lg shadow-blue-500/20 flex items-center gap-2 cursor-pointer"
            >
              {editingRoom ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>{editingRoom ? 'Save Changes' : 'Add Room'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
