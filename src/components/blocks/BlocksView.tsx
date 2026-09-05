import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Building,
  Plus,
  Search,
  ArrowUpDown,
  Filter,
  Eye,
  Edit,
  Trash2,
  Boxes,
  CheckCircle2,
  Wrench,
  X,
  Save,
  Building2,
  AlertTriangle,
  Layers,
  DoorOpen,
  Users,
  ChevronRight,
  ChevronDown,
  ArrowLeft,
  Tag,
  QrCode,
  Laptop,
  Printer,
  Monitor,
  Tv,
  Armchair,
  Grid,
  ShieldCheck,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BlockItem, RoomItem, Asset, Department, FloorName, RoomStatus } from '../../types';
import { RoomModal } from './RoomModal';
import { AddAssetModal } from '../assets/AddAssetModal';

export const BlocksView: React.FC = () => {
  const {
    blocks,
    rooms,
    assets,
    currentUser,
    addBlock,
    updateBlock,
    deleteBlock,
    deleteRoom,
    setActiveTab,
    setSelectedBuildingFilter,
    selectedRoomFilter,
    setSelectedRoomFilter,
    selectedBlockFilter,
    setSelectedBlockFilter,
  } = useApp();

  const isMonitor = currentUser?.role === 'Monitor';

  // Navigation Level State
  // selectedBlock: string name (e.g. 'S Block')
  // selectedRoom: string room number (e.g. 'S110')
  const [selectedBlock, setSelectedBlock] = useState<string | null>(selectedBlockFilter);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(selectedRoomFilter);

  // Keep state synced with context filters if set from other components
  useEffect(() => {
    if (selectedBlockFilter) {
      setSelectedBlock(selectedBlockFilter);
    }
  }, [selectedBlockFilter]);

  useEffect(() => {
    if (selectedRoomFilter) {
      setSelectedRoom(selectedRoomFilter);
      // Auto-find matching room to also set block
      const matchR = rooms.find((r) => r.roomNumber.toLowerCase() === selectedRoomFilter.toLowerCase());
      if (matchR) {
        setSelectedBlock(matchR.block);
      }
    }
  }, [selectedRoomFilter, rooms]);

  // Filters & Search for Level 1 (Blocks Overview)
  const [blockSearch, setBlockSearch] = useState('');
  const [blockDeptFilter, setBlockDeptFilter] = useState<string>('All');
  const [blockSortBy, setBlockSortBy] = useState<'highest' | 'lowest' | 'name-asc' | 'name-desc'>('highest');

  // Filters & Search for Level 2 (Block Rooms View)
  const [roomSearch, setRoomSearch] = useState('');
  const [roomFloorFilter, setRoomFloorFilter] = useState<string>('All');
  const [roomDeptFilter, setRoomDeptFilter] = useState<string>('All');
  const [roomStatusFilter, setRoomStatusFilter] = useState<string>('All');
  const [roomAssetCountFilter, setRoomAssetCountFilter] = useState<string>('All');

  // Filters & Search for Level 3 (Room Asset View)
  const [assetSearch, setAssetSearch] = useState('');
  const [assetCategoryFilter, setAssetCategoryFilter] = useState<string>('All');

  // Modals state
  const [isAddBlockModalOpen, setIsAddBlockModalOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<BlockItem | null>(null);
  const [deletingBlock, setDeletingBlock] = useState<BlockItem | null>(null);

  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<RoomItem | null>(null);
  const [deletingRoom, setDeletingRoom] = useState<RoomItem | null>(null);

  const [isAddAssetModalOpen, setIsAddAssetModalOpen] = useState(false);

  // Form states for Block
  const [blockName, setBlockName] = useState('');
  const [blockDesc, setBlockDesc] = useState('');
  const [formError, setFormError] = useState('');

  // Department list
  const departmentsList: Department[] = [
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

  // Helper stats calculation
  const getBlockStats = (bName: string) => {
    const blockRooms = rooms.filter((r) => r.block.toLowerCase() === bName.toLowerCase());
    const blockAssets = assets.filter((a) => a.building && a.building.toLowerCase() === bName.toLowerCase());

    const totalRooms = blockRooms.length;
    const occupiedRooms = blockRooms.filter((r) => r.status === 'Occupied' || r.status === 'Active').length;
    const totalAssets = blockAssets.length;
    const activeAssets = blockAssets.filter((a) => a.status === 'Active' || a.status === 'In Use').length;
    const maintenanceAssets = blockAssets.filter(
      (a) => a.status === 'Under Maintenance' || a.status === 'Damaged'
    ).length;
    const totalValue = blockAssets.reduce((acc, a) => acc + (a.purchaseCost || 0), 0);

    const depts = Array.from(
      new Set([
        ...blockRooms.map((r) => r.department),
        ...blockAssets.map((a) => a.department),
      ])
    );

    return { totalRooms, occupiedRooms, totalAssets, activeAssets, maintenanceAssets, depts, totalValue };
  };

  const getRoomStats = (roomNumberStr: string, blockNameStr?: string) => {
    const roomAssets = assets.filter((a) => {
      const matchRoom = a.roomNumber && a.roomNumber.toLowerCase() === roomNumberStr.toLowerCase();
      if (blockNameStr) {
        return matchRoom && a.building && a.building.toLowerCase() === blockNameStr.toLowerCase();
      }
      return matchRoom;
    });

    const totalAssets = roomAssets.length;
    const workingAssets = roomAssets.filter((a) => a.status === 'Active' || a.status === 'In Use').length;
    const maintenanceAssets = roomAssets.filter(
      (a) => a.status === 'Under Maintenance' || a.status === 'Damaged'
    ).length;
    const totalValue = roomAssets.reduce((acc, a) => acc + (a.purchaseCost || 0), 0);

    return { totalAssets, workingAssets, maintenanceAssets, roomAssets, totalValue };
  };

  // Block handlers
  const handleOpenAddBlockModal = () => {
    setBlockName('');
    setBlockDesc('');
    setFormError('');
    setIsAddBlockModalOpen(true);
  };

  const handleOpenEditBlockModal = (b: BlockItem) => {
    setEditingBlock(b);
    setBlockName(b.name);
    setBlockDesc(b.description || '');
    setFormError('');
  };

  const handleAddBlockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockName.trim()) {
      setFormError('Block name is required');
      return;
    }
    try {
      await addBlock(blockName, blockDesc);
      setIsAddBlockModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to add block');
    }
  };

  const handleEditBlockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBlock) return;
    if (!blockName.trim()) {
      setFormError('Block name is required');
      return;
    }
    try {
      await updateBlock(editingBlock.id, blockName, blockDesc);
      setEditingBlock(null);
    } catch (err: any) {
      setFormError(err.message || 'Failed to update block');
    }
  };

  const handleDeleteBlockConfirm = async () => {
    if (!deletingBlock) return;
    await deleteBlock(deletingBlock.id);
    setDeletingBlock(null);
  };

  // Room handlers
  const handleOpenAddRoomModal = () => {
    setEditingRoom(null);
    setIsRoomModalOpen(true);
  };

  const handleOpenEditRoomModal = (r: RoomItem) => {
    setEditingRoom(r);
    setIsRoomModalOpen(true);
  };

  const handleDeleteRoomConfirm = async () => {
    if (!deletingRoom) return;
    await deleteRoom(deletingRoom.id);
    setDeletingRoom(null);
  };

  // Navigation functions
  const handleSelectBlock = (bName: string) => {
    setSelectedBlock(bName);
    setSelectedBlockFilter(bName);
    setSelectedRoom(null);
    setSelectedRoomFilter(null);
  };

  const handleSelectRoom = (rNum: string) => {
    setSelectedRoom(rNum);
    setSelectedRoomFilter(rNum);
  };

  const handleBackToCampus = () => {
    setSelectedBlock(null);
    setSelectedBlockFilter(null);
    setSelectedRoom(null);
    setSelectedRoomFilter(null);
  };

  const handleBackToBlock = () => {
    setSelectedRoom(null);
    setSelectedRoomFilter(null);
  };

  // Filtered blocks for Level 1
  const filteredBlocks = blocks.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(blockSearch.toLowerCase()) ||
      (b.description && b.description.toLowerCase().includes(blockSearch.toLowerCase()));

    const stats = getBlockStats(b.name);
    const matchesDept =
      blockDeptFilter === 'All' || stats.depts.includes(blockDeptFilter as Department);

    return matchesSearch && matchesDept;
  });

  const sortedBlocks = [...filteredBlocks].sort((a, b) => {
    const statsA = getBlockStats(a.name);
    const statsB = getBlockStats(b.name);

    if (blockSortBy === 'highest') return statsB.totalAssets - statsA.totalAssets;
    if (blockSortBy === 'lowest') return statsA.totalAssets - statsB.totalAssets;
    if (blockSortBy === 'name-asc') return a.name.localeCompare(b.name);
    if (blockSortBy === 'name-desc') return b.name.localeCompare(a.name);
    return 0;
  });

  // Filtered rooms for Level 2 (when inside a block)
  const currentBlockRooms = selectedBlock
    ? rooms.filter((r) => r.block.toLowerCase() === selectedBlock.toLowerCase())
    : [];

  const filteredRooms = currentBlockRooms.filter((r) => {
    const matchesSearch =
      r.roomNumber.toLowerCase().includes(roomSearch.toLowerCase()) ||
      r.roomName.toLowerCase().includes(roomSearch.toLowerCase()) ||
      r.department.toLowerCase().includes(roomSearch.toLowerCase());

    const matchesFloor = roomFloorFilter === 'All' || r.floor === roomFloorFilter;
    const matchesDept = roomDeptFilter === 'All' || r.department === roomDeptFilter;
    const matchesStatus = roomStatusFilter === 'All' || r.status === roomStatusFilter;

    const stats = getRoomStats(r.roomNumber, r.block);
    let matchesAssetCount = true;
    if (roomAssetCountFilter === 'Has Assets') matchesAssetCount = stats.totalAssets > 0;
    if (roomAssetCountFilter === 'No Assets') matchesAssetCount = stats.totalAssets === 0;

    return matchesSearch && matchesFloor && matchesDept && matchesStatus && matchesAssetCount;
  });

  // Group rooms by Floor
  const floorOrder: FloorName[] = [
    'Ground Floor',
    'First Floor',
    'Second Floor',
    'Third Floor',
    'Fourth Floor',
  ];

  // Current room & assets for Level 3
  const currentRoomObj = selectedRoom
    ? rooms.find((r) => r.roomNumber.toLowerCase() === selectedRoom.toLowerCase())
    : null;

  const roomAssets = selectedRoom
    ? assets.filter(
        (a) =>
          a.roomNumber &&
          a.roomNumber.toLowerCase() === selectedRoom.toLowerCase() &&
          (!selectedBlock || (a.building && a.building.toLowerCase() === selectedBlock.toLowerCase()))
      )
    : [];

  const filteredRoomAssets = roomAssets.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(assetSearch.toLowerCase()) ||
      a.id.toLowerCase().includes(assetSearch.toLowerCase()) ||
      a.category.toLowerCase().includes(assetSearch.toLowerCase());

    const matchesCat = assetCategoryFilter === 'All' || a.category === assetCategoryFilter;

    return matchesSearch && matchesCat;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 overflow-x-auto pb-1">
        <button
          onClick={handleBackToCampus}
          className="hover:text-[#2563EB] flex items-center gap-1 transition-colors cursor-pointer shrink-0"
        >
          <Building className="w-3.5 h-3.5 text-[#2563EB]" />
          <span>Campus Blocks</span>
        </button>

        {selectedBlock && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <button
              onClick={handleBackToBlock}
              className={`hover:text-[#2563EB] flex items-center gap-1 transition-colors cursor-pointer shrink-0 ${
                !selectedRoom ? 'text-[#2563EB] font-bold' : ''
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{selectedBlock}</span>
            </button>
          </>
        )}

        {selectedRoom && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-[#2563EB] font-bold flex items-center gap-1 shrink-0">
              <DoorOpen className="w-3.5 h-3.5" />
              <span>Room {selectedRoom}</span>
            </span>
          </>
        )}
      </div>

      {/* =========================================================================
          LEVEL 3: ROOM ASSET VIEW (e.g. S110)
         ========================================================================= */}
      {selectedRoom ? (
        <div className="space-y-6">
          {/* Room Header Card */}
          <div className="bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
              <div className="flex items-start gap-4">
                <button
                  onClick={handleBackToBlock}
                  className="p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl transition-colors cursor-pointer shrink-0 mt-0.5"
                  title="Back to Block Rooms"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="px-3 py-1 bg-[#2563EB] text-white text-xs font-black rounded-lg uppercase tracking-wider">
                      Room {selectedRoom}
                    </span>
                    {currentRoomObj?.roomType && (
                      <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-400 text-xs font-bold rounded-lg border border-blue-100 dark:border-blue-900/40">
                        {currentRoomObj.roomType}
                      </span>
                    )}
                    {currentRoomObj?.status && (
                      <span
                        className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
                          currentRoomObj.status === 'Active' || currentRoomObj.status === 'Occupied'
                            ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                        }`}
                      >
                        ● {currentRoomObj.status}
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl font-black text-slate-900 dark:text-white font-display tracking-tight mt-1.5">
                    {currentRoomObj?.roomName || `Room ${selectedRoom}`}
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                    <span>
                      {currentRoomObj?.floor || 'First Floor'}, {selectedBlock}
                    </span>
                    <span>•</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {currentRoomObj?.department || 'Department Facility'}
                    </span>
                    {currentRoomObj?.capacity && (
                      <>
                        <span>•</span>
                        <span>Capacity: {currentRoomObj.capacity} Seats</span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {isMonitor && currentRoomObj && (
                  <button
                    onClick={() => handleOpenEditRoomModal(currentRoomObj)}
                    className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" /> Edit Room
                  </button>
                )}
                <button
                  onClick={() => setIsAddAssetModalOpen(true)}
                  className="px-4 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Register Asset to Room
                </button>
              </div>
            </div>

            {/* Metric Summary Widgets for Room */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-[#2563EB] flex items-center justify-center shrink-0">
                  <Boxes className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Assets</div>
                  <div className="text-lg font-black text-slate-900 dark:text-white">{roomAssets.length}</div>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Working Assets</div>
                  <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                    {roomAssets.filter((a) => a.status === 'Active' || a.status === 'In Use').length}
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-600 flex items-center justify-center shrink-0">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Maintenance</div>
                  <div className="text-lg font-black text-amber-600 dark:text-amber-400">
                    {roomAssets.filter((a) => a.status === 'Under Maintenance' || a.status === 'Damaged').length}
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Est. Value (₹)</div>
                  <div className="text-sm font-black text-slate-900 dark:text-white">
                    ₹{roomAssets.reduce((acc, a) => acc + (a.purchaseCost || 0), 0).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Room Asset Search & Filter Toolbar */}
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-[#E2E8F0] dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={`Search assets inside Room ${selectedRoom}...`}
                value={assetSearch}
                onChange={(e) => setAssetSearch(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-[#2563EB]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={assetCategoryFilter}
                onChange={(e) => setAssetCategoryFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded-xl px-3 py-2 text-slate-900 dark:text-white outline-none cursor-pointer"
              >
                <option value="All">All Asset Categories</option>
                <option value="Computer">Computers & Workstations</option>
                <option value="Printer">Printers</option>
                <option value="Projector">Projectors</option>
                <option value="Electrical Equipment">Electrical Equipment</option>
                <option value="Bench">Modular Benches</option>
                <option value="Chair">Ergonomic Chairs</option>
                <option value="Laboratory Equipment">Lab Equipment</option>
              </select>
              <span className="text-xs text-slate-400 font-semibold pl-2">
                {filteredRoomAssets.length} Assets
              </span>
            </div>
          </div>

          {/* Room Asset Cards List */}
          {filteredRoomAssets.length === 0 ? (
            <div className="p-12 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-3">
              <Boxes className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
                No Assets Found in Room {selectedRoom}
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No equipment matching your filters is assigned to Room {selectedRoom}. Register a new asset or change filter criteria.
              </p>
              <button
                onClick={() => setIsAddAssetModalOpen(true)}
                className="px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                + Register First Asset to Room
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRoomAssets.map((asset) => (
                <motion.div
                  key={asset.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3 relative overflow-hidden"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 pr-6">
                      <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-400 text-[10px] font-bold rounded-md uppercase">
                        {asset.category}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                          asset.status === 'Active' || asset.status === 'In Use'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                            : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {asset.status}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-2 line-clamp-2 pr-4">
                      {asset.name}
                    </h4>
                    <p className="text-[11px] font-semibold text-[#2563EB] mt-0.5">
                      Quantity: {asset.count} Unit{asset.count > 1 ? 's' : ''}
                    </p>

                    <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Assigned To:</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[150px]">
                          {asset.assignedTo || 'Unassigned'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Total Value:</span>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                          <Tag className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                            ₹{(asset.purchaseCost || 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      {asset.specifications && (
                        <div className="text-[11px] text-slate-400 line-clamp-1 italic mt-1">
                          "{asset.specifications}"
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-semibold text-slate-400">
                      Cond: <strong className="text-slate-600 dark:text-slate-300">{asset.condition}</strong>
                    </span>
                    <button
                      onClick={() => {
                        setSelectedBuildingFilter(asset.building);
                        setActiveTab('assets');
                      }}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1 z-10"
                    >
                      <span>Manage</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      ) : selectedBlock ? (
        /* =========================================================================
            LEVEL 2: BLOCK DETAIL & ROOM HIERARCHY VIEW (e.g. S Block)
           ========================================================================= */
        <div className="space-y-6">
          {/* Block Header Banner */}
          <div className="bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
              <div className="flex items-start gap-4">
                <button
                  onClick={handleBackToCampus}
                  className="p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl transition-colors cursor-pointer shrink-0 mt-0.5"
                  title="Back to All Campus Blocks"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-[#2563EB] text-white text-xs font-black rounded-lg uppercase tracking-wider">
                      Campus Building
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">
                      {currentBlockRooms.length} Registered Rooms
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-display tracking-tight mt-1">
                    {selectedBlock} Rooms & Laboratories
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {blocks.find((b) => b.name === selectedBlock)?.description ||
                      `Complete hierarchical room layout and lab asset breakdown for ${selectedBlock}`}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                {isMonitor && (
                  <button
                    onClick={handleOpenAddRoomModal}
                    className="px-4 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Add Room / Lab
                  </button>
                )}
              </div>
            </div>

            {/* Block Stats Grid */}
            {(() => {
              const bStats = getBlockStats(selectedBlock);
              return (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Rooms</div>
                    <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{bStats.totalRooms}</div>
                  </div>

                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Occupied / Active</div>
                    <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {bStats.occupiedRooms}
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Assets</div>
                    <div className="text-xl font-black text-[#2563EB] dark:text-blue-400 mt-0.5">
                      {bStats.totalAssets}
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Maintenance Needed</div>
                    <div className="text-xl font-black text-amber-600 dark:text-amber-400 mt-0.5">
                      {bStats.maintenanceAssets}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Block Room Search & Filter Toolbar */}
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-[#E2E8F0] dark:border-slate-800 shadow-xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Search Room Number / Name */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search Room Number (e.g. S110, S205)..."
                  value={roomSearch}
                  onChange={(e) => setRoomSearch(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-[#2563EB]"
                />
              </div>

              {/* Floor Filter */}
              <div className="relative">
                <Layers className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={roomFloorFilter}
                  onChange={(e) => setRoomFloorFilter(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none cursor-pointer"
                >
                  <option value="All">All Floors</option>
                  <option value="Ground Floor">Ground Floor</option>
                  <option value="First Floor">First Floor</option>
                  <option value="Second Floor">Second Floor</option>
                  <option value="Third Floor">Third Floor</option>
                  <option value="Fourth Floor">Fourth Floor</option>
                </select>
              </div>

              {/* Department Filter */}
              <div className="relative">
                <Filter className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={roomDeptFilter}
                  onChange={(e) => setRoomDeptFilter(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none cursor-pointer"
                >
                  <option value="All">All Departments</option>
                  {departmentsList.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Room Status Filter */}
              <div className="relative">
                <DoorOpen className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={roomStatusFilter}
                  onChange={(e) => setRoomStatusFilter(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none cursor-pointer"
                >
                  <option value="All">All Room Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Occupied">Occupied</option>
                  <option value="Vacant">Vacant</option>
                  <option value="Under Maintenance">Under Maintenance</option>
                  <option value="Under Renovation">Under Renovation</option>
                </select>
              </div>
            </div>
          </div>

          {/* Floors & Rooms Accordion / Sections */}
          <div className="space-y-6">
            {floorOrder.map((floor) => {
              const floorRooms = filteredRooms.filter((r) => r.floor === floor);
              if (roomFloorFilter !== 'All' && roomFloorFilter !== floor) return null;
              if (floorRooms.length === 0 && roomSearch) return null;

              return (
                <div key={floor} className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">
                    <Layers className="w-4 h-4 text-[#2563EB]" />
                    <span>{floor}</span>
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs rounded-full font-mono">
                      {floorRooms.length} Rooms
                    </span>
                  </div>

                  {floorRooms.length === 0 ? (
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-400 italic">
                      No rooms registered on {floor} matching search criteria.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {floorRooms.map((room) => {
                        const rStats = getRoomStats(room.roomNumber, room.block);

                        return (
                          <motion.div
                            key={room.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3 group border-l-4 border-l-[#2563EB]"
                          >
                            {/* Room Card Header */}
                            <div>
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="px-2.5 py-1 bg-[#2563EB] text-white text-xs font-black rounded-lg uppercase tracking-wider">
                                    {room.roomNumber}
                                  </span>
                                  <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-400 text-[11px] font-semibold rounded-md">
                                    {room.roomType}
                                  </span>
                                </div>

                                {isMonitor && (
                                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={() => handleOpenEditRoomModal(room)}
                                      className="p-1 text-slate-400 hover:text-[#2563EB] rounded cursor-pointer"
                                      title="Edit Room"
                                    >
                                      <Edit className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => setDeletingRoom(room)}
                                      className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                                      title="Delete Room"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                )}
                              </div>

                              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-2 line-clamp-1">
                                {room.roomName}
                              </h3>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                                {room.department}
                              </p>

                              {/* Asset Count Indicators */}
                              <div className="grid grid-cols-4 gap-2 mt-3 p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-center">
                                <div>
                                  <div className="text-[10px] uppercase font-bold text-slate-400">Total</div>
                                  <div className="text-sm font-black text-slate-900 dark:text-white">
                                    {rStats.totalAssets}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-[10px] uppercase font-bold text-emerald-500">Working</div>
                                  <div className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                                    {rStats.workingAssets}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-[10px] uppercase font-bold text-amber-500">Maint</div>
                                  <div className="text-sm font-black text-amber-600 dark:text-amber-400">
                                    {rStats.maintenanceAssets}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-[10px] uppercase font-bold text-blue-500">Value (₹)</div>
                                  <div className="text-sm font-black text-[#2563EB] dark:text-blue-400 line-clamp-1" title={`₹${rStats.totalValue.toLocaleString()}`}>
                                    {rStats.totalValue > 1000 ? `${(rStats.totalValue / 1000).toFixed(1)}k` : rStats.totalValue}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Card Footer Button */}
                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                              <span
                                className={`text-[11px] font-bold ${
                                  room.status === 'Active' || room.status === 'Occupied'
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : 'text-amber-600 dark:text-amber-400'
                                }`}
                              >
                                ● {room.status}
                              </span>

                              <button
                                onClick={() => handleSelectRoom(room.roomNumber)}
                                className="px-3 py-1.5 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1 transition-all cursor-pointer"
                              >
                                <span>View Assets</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* =========================================================================
            LEVEL 1: ALL CAMPUS BLOCKS OVERVIEW
           ========================================================================= */
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] flex items-center justify-center border border-blue-100 dark:border-blue-900/50">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-slate-900 dark:text-white font-display tracking-tight">
                    Campus Location Hierarchy
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Drill down into Blocks, Floors, Rooms, and Individual Assets.
                  </p>
                </div>
              </div>
            </div>

            {isMonitor && (
              <button
                onClick={handleOpenAddBlockModal}
                className="px-4 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Add Block</span>
              </button>
            )}
          </div>

          {/* Filters & Search Toolbar */}
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-[#E2E8F0] dark:border-slate-800 shadow-xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search Block..."
                  value={blockSearch}
                  onChange={(e) => setBlockSearch(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-[#2563EB]"
                />
              </div>

              <div className="relative">
                <Filter className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={blockDeptFilter}
                  onChange={(e) => setBlockDeptFilter(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none cursor-pointer"
                >
                  <option value="All">All Departments</option>
                  {departmentsList.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <ArrowUpDown className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={blockSortBy}
                  onChange={(e) => setBlockSortBy(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none cursor-pointer"
                >
                  <option value="highest">Sort: Highest Assets</option>
                  <option value="lowest">Sort: Lowest Assets</option>
                  <option value="name-asc">Sort: Name (A - Z)</option>
                  <option value="name-desc">Sort: Name (Z - A)</option>
                </select>
              </div>

              <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <span>Showing Blocks:</span>
                <span className="px-2 py-0.5 bg-[#2563EB] text-white rounded-full text-[11px]">
                  {sortedBlocks.length} / {blocks.length}
                </span>
              </div>
            </div>
          </div>

          {/* Cards Grid View */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {sortedBlocks.map((block) => {
              const stats = getBlockStats(block.name);

              return (
                <motion.div
                  key={block.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-[#EFF6FF] dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900/50 group-hover:scale-105 transition-transform">
                          <Building className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                            {block.name}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                            {block.description || `${block.name} Facility`}
                          </p>
                        </div>
                      </div>

                      {isMonitor && (
                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleOpenEditBlockModal(block)}
                            className="p-1.5 text-slate-400 hover:text-[#2563EB] hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Block"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingBlock(block)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Block"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Stats Metrics Grid */}
                    <div className="grid grid-cols-2 gap-2 mt-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-center">
                      <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-2xs">
                        <div className="text-[10px] font-bold uppercase text-slate-400">Total Rooms</div>
                        <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                          {stats.totalRooms}
                        </div>
                      </div>
                      <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-2xs">
                        <div className="text-[10px] font-bold uppercase text-blue-500">Total Assets</div>
                        <div className="text-sm font-black text-[#2563EB] dark:text-blue-400 mt-0.5">
                          {stats.totalAssets}
                        </div>
                      </div>
                      <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-2xs">
                        <div className="text-[10px] font-bold uppercase text-amber-500">Maintenance</div>
                        <div className="text-sm font-black text-amber-600 dark:text-amber-400 mt-0.5">
                          {stats.maintenanceAssets}
                        </div>
                      </div>
                      <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-2xs">
                        <div className="text-[10px] font-bold uppercase text-emerald-500">Total Value (₹)</div>
                        <div className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                          {stats.totalValue.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-400">
                      Code: <span className="font-mono text-slate-700 dark:text-slate-300">{block.code}</span>
                    </span>

                    <button
                      onClick={() => handleSelectBlock(block.name)}
                      className="px-3.5 py-2 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <span>Explore Block Rooms</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODALS & DIALOGS
         ========================================================================= */}

      {/* Add Block Modal */}
      {isAddBlockModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add Campus Block</h3>
              <button
                onClick={() => setIsAddBlockModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddBlockSubmit} className="space-y-3.5">
              {formError && <div className="text-xs text-rose-500 font-semibold">{formError}</div>}

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Block Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. S Block or PG Hostel"
                  value={blockName}
                  onChange={(e) => setBlockName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-[#2563EB]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  placeholder="Brief description of departments inside block..."
                  value={blockDesc}
                  onChange={(e) => setBlockDesc(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white outline-none focus:border-[#2563EB]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddBlockModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-[#2563EB] hover:bg-blue-700 rounded-xl"
                >
                  Create Block
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit Block Modal */}
      {editingBlock && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Edit Block Name</h3>
              <button
                onClick={() => setEditingBlock(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditBlockSubmit} className="space-y-3.5">
              {formError && <div className="text-xs text-rose-500 font-semibold">{formError}</div>}

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Block Name *
                </label>
                <input
                  type="text"
                  value={blockName}
                  onChange={(e) => setBlockName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-[#2563EB]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  value={blockDesc}
                  onChange={(e) => setBlockDesc(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white outline-none focus:border-[#2563EB]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingBlock(null)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-[#2563EB] hover:bg-blue-700 rounded-xl"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Delete Block Dialog */}
      {deletingBlock && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center"
          >
            <div className="w-12 h-12 bg-rose-100 dark:bg-rose-950/60 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete {deletingBlock.name}?</h3>
            <p className="text-xs text-slate-500">
              Are you sure you want to remove <strong>{deletingBlock.name}</strong> from campus master blocks list?
            </p>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setDeletingBlock(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteBlockConfirm}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl"
              >
                Confirm Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Room Dialog */}
      {deletingRoom && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center"
          >
            <div className="w-12 h-12 bg-rose-100 dark:bg-rose-950/60 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
              <DoorOpen className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete Room {deletingRoom.roomNumber}?</h3>
            <p className="text-xs text-slate-500">
              Are you sure you want to remove <strong>Room {deletingRoom.roomNumber} ({deletingRoom.roomName})</strong> from {deletingRoom.block}?
            </p>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setDeletingRoom(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteRoomConfirm}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl"
              >
                Confirm Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Room Creation & Edit Modal */}
      <RoomModal
        isOpen={isRoomModalOpen}
        onClose={() => {
          setIsRoomModalOpen(false);
          setEditingRoom(null);
        }}
        editingRoom={editingRoom}
        defaultBlock={selectedBlock || 'S Block'}
      />

      {/* Add Asset Modal with Pre-filled Location */}
      <AddAssetModal
        isOpen={isAddAssetModalOpen}
        onClose={() => setIsAddAssetModalOpen(false)}
        initialBlock={selectedBlock || 'S Block'}
        initialFloor={currentRoomObj?.floor || 'First Floor'}
        initialRoomNumber={selectedRoom || 'S110'}
      />
    </div>
  );
};
