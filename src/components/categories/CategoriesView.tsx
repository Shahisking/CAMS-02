import React from 'react';
import { motion } from 'motion/react';
import {
  Monitor,
  Projector,
  Printer,
  FlaskConical,
  Trophy,
  BookOpen,
  BedDouble,
  Zap,
  Armchair,
  Table as TableIcon,
  Sparkles,
  ArrowRight,
  Boxes,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CategoryType } from '../../types';

export const CategoriesView: React.FC = () => {
  const { assets, setSelectedCategoryFilter, setActiveTab } = useApp();

  const CATEGORY_DEFINITIONS: {
    name: CategoryType;
    icon: React.ReactNode;
    desc: string;
  }[] = [
    {
      name: 'Computer',
      icon: <Monitor className="w-6 h-6 text-[#2563EB]" />,
      desc: 'Workstations, All-In-One PCs, Servers & Thin Clients',
    },
    {
      name: 'Projector',
      icon: <Projector className="w-6 h-6 text-[#2563EB]" />,
      desc: 'Overhead HD Projectors, Smart Screens & Interactive Displays',
    },
    {
      name: 'Printer',
      icon: <Printer className="w-6 h-6 text-[#2563EB]" />,
      desc: 'Laser Printers, Copiers, 3D Printers & Scanners',
    },
    {
      name: 'Laboratory Equipment',
      icon: <FlaskConical className="w-6 h-6 text-[#2563EB]" />,
      desc: 'Oscilloscopes, CNC Machines, Surveying Total Stations & Testers',
    },
    {
      name: 'Chair',
      icon: <Armchair className="w-6 h-6 text-[#2563EB]" />,
      desc: 'Ergonomic Mesh Chairs, Seminar Hall Seating & Lab Stools',
    },
    {
      name: 'Table',
      icon: <TableIcon className="w-6 h-6 text-[#2563EB]" />,
      desc: 'Computer Lab Workbenches, Conference Tables & Faculty Desks',
    },
    {
      name: 'Bench',
      icon: <Boxes className="w-6 h-6 text-[#2563EB]" />,
      desc: 'Classroom Dual Wooden Benches, Campus Garden Seating',
    },
    {
      name: 'Sports Equipment',
      icon: <Trophy className="w-6 h-6 text-[#2563EB]" />,
      desc: 'Badminton Courts, Cricket Nets, Gym Equipment & Game Tables',
    },
    {
      name: 'Library Assets',
      icon: <BookOpen className="w-6 h-6 text-[#2563EB]" />,
      desc: 'Steel Bookshelves, RFID Kiosks, Reading Desks & Digital Catalogues',
    },
    {
      name: 'Hostel Assets',
      icon: <BedDouble className="w-6 h-6 text-[#2563EB]" />,
      desc: 'Double Bunk Beds, Locker Units, Study Units & Mess Furniture',
    },
    {
      name: 'Electrical Equipment',
      icon: <Zap className="w-6 h-6 text-[#2563EB]" />,
      desc: 'Power Switch Panels, UPS Systems, Motor Testing Benches',
    },
    {
      name: 'Other Assets',
      icon: <Boxes className="w-6 h-6 text-[#2563EB]" />,
      desc: 'Miscellaneous Facilities, Air Conditioners & Signage',
    },
  ];

  const handleCategoryClick = (categoryName: CategoryType) => {
    setSelectedCategoryFilter(categoryName);
    setActiveTab('assets');
  };

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFF6FF] text-[#2563EB] text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" /> 12 Asset Categories
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827]">
          Asset Category Hub
        </h1>
        <p className="text-xs sm:text-sm text-[#6B7280]">
          Click any category card to view and filter specific assets
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {CATEGORY_DEFINITIONS.map((cat, i) => {
          const categoryAssets = assets.filter((a) => a.category === cat.name);
          const totalCount = categoryAssets.length;
          const availableCount = categoryAssets.filter(
            (a) => a.status === 'Active' || a.status === 'In Use'
          ).length;
          const damagedCount = categoryAssets.filter(
            (a) => a.status === 'Damaged' || a.status === 'Under Maintenance'
          ).length;

          return (
            <motion.div
              key={i}
              whileHover={{ y: -4 }}
              onClick={() => handleCategoryClick(cat.name)}
              className="p-6 rounded-[20px] border border-[#E5E7EB] bg-white cursor-pointer transition-all duration-300 shadow-[0_4px_16px_rgba(15,23,42,0.08)] hover:shadow-[0_12px_32px_rgba(37,99,235,0.15)] hover:border-[#2563EB] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] p-2.5 flex items-center justify-center text-[#2563EB]">
                    {cat.icon}
                  </div>
                  <span className="px-3 py-1 bg-[#F3F4F6] rounded-full text-xs font-semibold text-[#374151]">
                    {totalCount} Items
                  </span>
                </div>

                <h3 className="text-xl font-bold text-[#111827] mb-1">
                  {cat.name}
                </h3>
                <p className="text-xs text-[#6B7280] mb-6 leading-relaxed">
                  {cat.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-[#E5E7EB] flex items-center justify-between text-xs font-medium">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-[#DCFCE7] text-[#15803D] font-bold text-xs inline-flex items-center gap-1">
                    ● {availableCount} Active
                  </span>
                  {damagedCount > 0 && (
                    <span className="px-2.5 py-1 rounded-full bg-[#FEE2E2] text-[#991B1B] font-bold text-xs inline-flex items-center gap-1">
                      ● {damagedCount} Repair
                    </span>
                  )}
                </div>

                <button className="px-3 py-1.5 rounded-lg bg-transparent text-[#2563EB] hover:bg-[#2563EB] hover:text-white transition-colors duration-200 font-semibold inline-flex items-center gap-1 group cursor-pointer">
                  Manage <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

