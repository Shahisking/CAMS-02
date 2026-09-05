import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Building2,
  Users,
  Box,
  Wrench,
  Search,
  ArrowRight,
  Plus,
  IndianRupee,
  MapPin,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Department } from '../../types';

interface DepartmentCardInfo {
  name: Department;
  code: string;
  hod: string;
  building: string;
  roomCount: number;
  contactEmail: string;
}

const DEPARTMENTS_DATA: DepartmentCardInfo[] = [
  {
    name: 'Computer Science & Engineering',
    code: 'CSE',
    hod: 'Dr. R. Sundaram',
    building: 'Ramanujan Block',
    roomCount: 12,
    contactEmail: 'hod.cse@adithyatech.edu.in',
  },
  {
    name: 'Information Technology',
    code: 'IT',
    hod: 'Dr. M. Kavitha',
    building: 'Ramanujan Block',
    roomCount: 8,
    contactEmail: 'hod.it@adithyatech.edu.in',
  },
  {
    name: 'Electronics & Communication',
    code: 'ECE',
    hod: 'Dr. K. Arulmozhi',
    building: 'APJ Abdul Kalam Block',
    roomCount: 10,
    contactEmail: 'hod.ece@adithyatech.edu.in',
  },
  {
    name: 'Electrical & Electronics',
    code: 'EEE',
    hod: 'Dr. P. Rajasekar',
    building: 'APJ Abdul Kalam Block',
    roomCount: 7,
    contactEmail: 'hod.eee@adithyatech.edu.in',
  },
  {
    name: 'Mechanical Engineering',
    code: 'MECH',
    hod: 'Dr. S. Karthikeyan',
    building: 'Sir M Visvesvaraya Block',
    roomCount: 14,
    contactEmail: 'hod.mech@adithyatech.edu.in',
  },
  {
    name: 'Civil Engineering',
    code: 'CIVIL',
    hod: 'Dr. N. Murugesan',
    building: 'Sir M Visvesvaraya Block',
    roomCount: 9,
    contactEmail: 'hod.civil@adithyatech.edu.in',
  },
  {
    name: 'Artificial Intelligence & Data Science',
    code: 'AI&DS',
    hod: 'Dr. V. Deepa',
    building: 'Ramanujan Block',
    roomCount: 6,
    contactEmail: 'hod.aids@adithyatech.edu.in',
  },
  {
    name: 'Administrative Office',
    code: 'ADMIN',
    hod: 'Mr. G. Ravichandran (Registrar)',
    building: 'Main Administrative Building',
    roomCount: 15,
    contactEmail: 'admin@adithyatech.edu.in',
  },
  {
    name: 'Central Library',
    code: 'LIB',
    hod: 'Dr. S. Meenakshi (Librarian)',
    building: 'Central Library Building',
    roomCount: 5,
    contactEmail: 'library@adithyatech.edu.in',
  },
  {
    name: 'Hostel Management',
    code: 'HOSTEL',
    hod: 'Prof. T. Selvam (Warden)',
    building: 'Boys Hostel Block A',
    roomCount: 120,
    contactEmail: 'hostel@adithyatech.edu.in',
  },
  {
    name: 'Physical Education',
    code: 'SPORTS',
    hod: 'Dr. C. Ramesh (PED)',
    building: 'Indoor Sports Complex',
    roomCount: 4,
    contactEmail: 'sports@adithyatech.edu.in',
  },
];

interface DepartmentsViewProps {
  onOpenAddAssetModal?: () => void;
}

export const DepartmentsView: React.FC<DepartmentsViewProps> = ({ onOpenAddAssetModal }) => {
  const { assets, setActiveTab, setSelectedDepartmentFilter, currentUser } = useApp();
  const isMonitor = currentUser?.role === 'Monitor';
  const [search, setSearch] = useState('');

  const filteredDepts = DEPARTMENTS_DATA.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.code.toLowerCase().includes(search.toLowerCase()) ||
      d.hod.toLowerCase().includes(search.toLowerCase()) ||
      d.building.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectDepartment = (deptName: Department) => {
    setSelectedDepartmentFilter(deptName);
    setActiveTab('assets');
  };

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFF6FF] text-[#2563EB] text-xs font-semibold mb-2">
            <Building2 className="w-3.5 h-3.5" /> 11 Academic & Administrative Units
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827]">
            College Departments
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7280]">
            Overview of department infrastructure, asset distribution, and custodianship
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-[#E5E7EB] rounded-lg text-xs sm:text-sm text-[#111827] focus:outline-none focus:border-[#2563EB] transition-colors"
            />
          </div>
          {onOpenAddAssetModal && isMonitor && (
            <button
              onClick={onOpenAddAssetModal}
              className="px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white rounded-lg text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 shrink-0 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" /> Add Asset
            </button>
          )}
        </div>
      </div>

      {/* Grid of Department Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDepts.map((dept, i) => {
          const deptAssets = assets.filter((a) => a.department === dept.name);
          const totalCount = deptAssets.length;
          const activeCount = deptAssets.filter((a) => a.status === 'Active' || a.status === 'In Use').length;
          const maintenanceCount = deptAssets.filter((a) => a.status === 'Under Maintenance').length;
          const totalValuation = deptAssets.reduce((sum, a) => sum + (a.purchaseCost || 0), 0);

          return (
            <motion.div
              key={dept.code}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="p-6 rounded-[20px] border border-[#E5E7EB] bg-white transition-all duration-300 shadow-[0_4px_16px_rgba(15,23,42,0.06)] hover:shadow-[0_12px_32px_rgba(37,99,235,0.12)] hover:border-[#2563EB] flex flex-col justify-between"
            >
              <div>
                {/* Header row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] flex items-center justify-center text-[#2563EB] font-extrabold text-xs shrink-0">
                      {dept.code}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#111827] leading-tight">
                        {dept.name}
                      </h3>
                      <p className="text-xs text-[#6B7280] flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-[#9CA3AF]" /> {dept.building}
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-[#F3F4F6] rounded-full text-xs font-semibold text-[#374151] shrink-0">
                    {totalCount} Assets
                  </span>
                </div>

                {/* HOD Info */}
                <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E5E7EB]/60 my-4 space-y-1">
                  <div className="text-xs font-semibold text-[#374151] flex items-center justify-between">
                    <span className="text-[#6B7280]">Head of Dept:</span>
                    <span className="text-[#111827] font-medium">{dept.hod}</span>
                  </div>
                  <div className="text-xs text-[#6B7280] flex items-center justify-between">
                    <span>Contact:</span>
                    <span className="text-[#2563EB] text-[11px] font-mono">{dept.contactEmail}</span>
                  </div>
                </div>

                {/* Metrics Row */}
                <div className="grid grid-cols-3 gap-2 text-center py-2 border-y border-[#E5E7EB]">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-[#6B7280] font-semibold">Active</div>
                    <div className="text-sm font-bold text-[#15803D] mt-0.5">{activeCount}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-[#6B7280] font-semibold">Maintenance</div>
                    <div className="text-sm font-bold text-[#D97706] mt-0.5">{maintenanceCount}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-[#6B7280] font-semibold">Valuation</div>
                    <div className="text-sm font-bold text-[#111827] mt-0.5">
                      ₹{(totalValuation / 100000).toFixed(1)}L
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 mt-2 flex items-center justify-between">
                <span className="text-xs text-[#6B7280]">
                  {dept.roomCount} Rooms / Labs
                </span>
                <button
                  onClick={() => handleSelectDepartment(dept.name)}
                  className="px-3.5 py-1.5 rounded-lg bg-transparent text-[#2563EB] hover:bg-[#2563EB] hover:text-white transition-colors duration-200 font-semibold text-xs inline-flex items-center gap-1.5 group cursor-pointer"
                >
                  View Assets{' '}
                  <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
