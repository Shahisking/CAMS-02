import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, QrCode, Plus, Image as ImageIcon, Sparkles, Building, Calendar, Tag, DoorOpen } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CategoryType, Department, Building as BuildingType, AssetCondition, AssetStatus } from '../../types';

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialBlock?: string;
  initialRoomNumber?: string;
}

export const AddAssetModal: React.FC<AddAssetModalProps> = ({
  isOpen,
  onClose,
  initialBlock = 'S Block',
  initialRoomNumber = 'S110',
}) => {
  const { addAsset, currentUser, buildingBlocks } = useApp();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<CategoryType>('Computer');
  const [department, setDepartment] = useState<Department>('Artificial Intelligence & Data Science');
  const [building, setBuilding] = useState<BuildingType | string>(initialBlock);
  const [roomNumber, setRoomNumber] = useState<string>(initialRoomNumber);
  const [buildingError, setBuildingError] = useState<string>('');
  const [condition, setCondition] = useState<AssetCondition>('New');
  const [warrantyExpiry, setWarrantyExpiry] = useState('2028-03-31');
  const [status, setStatus] = useState<AssetStatus>('Active');
  const [assignedType, setAssignedType] = useState<'Faculty' | 'Department' | 'Lab' | 'Classroom' | 'Hostel' | 'Store Room'>('Lab');
  const [imageUrl, setImageUrl] = useState('');
  const [specifications, setSpecifications] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let hasError = false;

    if (!building) {
      setBuildingError('Please select a Building Block.');
      hasError = true;
    } else {
      setBuildingError('');
    }

    if (!name) return;
    if (hasError) return;

    addAsset({
      name,
      category,
      department,
      building: building as BuildingType,
      roomNumber,
      purchaseCost: 0,
      vendor: '',
      warrantyExpiry,
      condition,
      status,
      assignedType,
      imageUrl,
      specifications,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative my-8"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Plus className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Register New Asset</h2>
            <p className="text-xs text-slate-500">Adithya Institute of Technology CAMS Inventory</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Asset Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dell Workstation 7090 or Epson HD Projector"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm rounded-xl px-3.5 py-2.5 outline-none focus:border-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryType)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs rounded-xl px-3 py-2.5 outline-none"
              >
                <option value="Bench">Bench</option>
                <option value="Chair">Chair</option>
                <option value="Table">Table</option>
                <option value="Computer">Computer</option>
                <option value="Projector">Projector</option>
                <option value="Printer">Printer</option>
                <option value="Laboratory Equipment">Laboratory Equipment</option>
                <option value="Sports Equipment">Sports Equipment</option>
                <option value="Library Assets">Library Assets</option>
                <option value="Hostel Assets">Hostel Assets</option>
                <option value="Electrical Equipment">Electrical Equipment</option>
                <option value="Fans">Fans</option>
                <option value="LED Lights">LED Lights</option>
                <option value="Mini Notice Board">Mini Notice Board</option>
                <option value="Dustbin">Dustbin</option>
                <option value="Student Bench">Student Bench</option>
                <option value="Open Rack">Open Rack</option>
                <option value="Closed Bureau">Closed Bureau</option>
                <option value="Projector Screen">Projector Screen</option>
                <option value="Black Board">Black Board</option>
                <option value="Computer Table">Computer Table</option>
                <option value="Fire Extinguisher">Fire Extinguisher</option>
                <option value="Staff Cabin Table">Staff Cabin Table</option>
                <option value="Staff Table">Staff Table</option>
                <option value="Small Bench">Small Bench</option>
                <option value="Long Bench">Long Bench</option>
                <option value="Drawer">Drawer</option>
                <option value="First Aid Kit Box">First Aid Kit Box</option>
                <option value="White Board">White Board</option>
                <option value="Cupboard">Cupboard</option>
                <option value="Long Lab Switch Table">Long Lab Switch Table</option>
                <option value="Lab Stool">Lab Stool</option>
                <option value="Washbasin">Washbasin</option>
                <option value="Microphone Speaker">Microphone Speaker</option>
                <option value="Camera">Camera</option>
                <option value="Speaker">Speaker</option>
                <option value="Other Assets">Other Assets</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Department *
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value as Department)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs rounded-xl px-3 py-2.5 outline-none"
              >
                <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Electronics & Communication">Electronics & Communication</option>
                <option value="Electrical & Electronics">Electrical & Electronics</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Civil Engineering">Civil Engineering</option>
                <option value="Artificial Intelligence & Data Science">AI & Data Science</option>
                <option value="Administrative Office">Administrative Office</option>
                <option value="Central Library">Central Library</option>
                <option value="Hostel Management">Hostel Management</option>
                <option value="Physical Education">Physical Education</option>
              </select>
            </div>
          </div>

          {/* Location: Block Name + Room Number */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/80">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Block Name */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>Block Name <span className="text-rose-500">*</span></span>
                </label>
                <div className="relative">
                  <select
                    value={buildingBlocks.includes(building as string) ? building : ''}
                    onChange={(e) => {
                      if (e.target.value) {
                        setBuilding(e.target.value);
                        setBuildingError('');
                      }
                    }}
                    className={`w-full bg-slate-50 dark:bg-slate-800 border text-slate-900 dark:text-white text-xs rounded-xl px-3 py-2.5 outline-none cursor-pointer appearance-none ${
                      buildingError ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700 focus:border-[#2563EB]'
                    }`}
                  >
                    <option value="">Select or type below</option>
                    {buildingBlocks.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                  <Building className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
                <input
                  type="text"
                  value={buildingBlocks.includes(building as string) ? '' : building}
                  onChange={(e) => {
                    setBuilding(e.target.value);
                    setBuildingError('');
                  }}
                  placeholder="Or type custom block name (e.g. S Block)"
                  className={`w-full mt-2 bg-white dark:bg-slate-800 border text-slate-900 dark:text-white text-xs rounded-xl px-3 py-2.5 outline-none focus:border-[#2563EB] ${
                    buildingError ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                  }`}
                />
              </div>

              {/* Room Number */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <DoorOpen className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>Room Number <span className="text-rose-500">*</span></span>
                </label>
                <input
                  type="text"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  placeholder="e.g. S110, N205, Lab 3"
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs rounded-xl px-3 py-2.5 outline-none focus:border-[#2563EB]"
                  required
                />
              </div>
            </div>

            {/* Validation Error Message */}
            {buildingError && (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 mt-2">
                <span>{buildingError}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Condition
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as AssetCondition)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs rounded-xl px-3 py-2.5 outline-none"
              >
                <option value="New">New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
                <option value="Damaged">Damaged</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Initial Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as AssetStatus)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs rounded-xl px-3 py-2.5 outline-none"
              >
                <option value="Active">Active</option>
                <option value="In Use">In Use</option>
                <option value="In Store">In Store</option>
                <option value="Under Maintenance">Under Maintenance</option>
                <option value="Damaged">Damaged</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Specifications / Notes
            </label>
            <textarea
              value={specifications}
              onChange={(e) => setSpecifications(e.target.value)}
              placeholder="Enter asset specifications, configuration, serial details, or additional notes..."
              maxLength={2000}
              style={{ height: '150px' }}
              className="w-full bg-white dark:bg-slate-800 border border-[#CBD5E1] dark:border-slate-700 text-[#111827] dark:text-white placeholder-[#94A3B8] text-xs sm:text-sm rounded-[12px] p-4 resize-y outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/15 transition-all"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all mt-4"
          >
            <Plus className="w-4 h-4" /> Save & Generate QR Tag
          </button>
        </form>
      </motion.div>
    </div>
  );
};
