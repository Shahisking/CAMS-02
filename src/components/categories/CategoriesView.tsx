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
  Server,
  Fan,
  Lightbulb,
  Clipboard,
  Trash2,
  Archive,
  Sofa,
  BriefcaseMedical,
  Presentation,
  Columns,
  Droplets,
  Mic,
  HelpCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CategoryType, ChairType } from '../../types';

export const CategoriesView: React.FC = () => {
  const { assets, setSelectedCategoryFilter, setSelectedChairTypeFilter, setActiveTab } = useApp();
  const [viewingChairTypes, setViewingChairTypes] = React.useState(false);

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
      name: 'Chair',
      icon: <Armchair className="w-6 h-6 text-[#2563EB]" />,
      desc: 'Manage all types of chairs including normal, plastic, cushion, and rolling chairs.',
    },
    {
      name: 'Table',
      icon: <TableIcon className="w-6 h-6 text-[#2563EB]" />,
      desc: 'Computer Lab Workbenches, Conference Tables & Faculty Desks',
    },
    {
      name: 'Laboratory Equipment',
      icon: <FlaskConical className="w-6 h-6 text-[#2563EB]" />,
      desc: 'Oscilloscopes, CNC Machines, Surveying Total Stations & Testers',
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
      name: 'Fans',
      icon: <img src="/images/fan_category_1785852830609.png" alt="Fan" className="w-6 h-6 object-contain" />,
      desc: 'Ceiling fans, wall fans, exhaust fans & pedestal fans',
    },
    {
      name: 'LED Lights',
      icon: <img src="/images/led_lights_category_1785852848563.png" alt="LED Lights" className="w-6 h-6 object-contain" />,
      desc: 'LED tube lights, bulbs, panel lights & outdoor lighting',
    },
    {
      name: 'Mini Notice Board',
      icon: <img src="/images/notice_board_category_1785852864161.png" alt="Notice Board" className="w-6 h-6 object-contain" />,
      desc: 'Cork boards, whiteboards & glass notice boards',
    },
    {
      name: 'Dustbin',
      icon: <img src="/images/dustbin_category_1785852881230.png" alt="Dustbin" className="w-6 h-6 object-contain" />,
      desc: 'Plastic, metal, dry/wet waste & recycling bins',
    },
    {
      name: 'Student Bench',
      icon: <img src="/images/student_bench_1785853912168.png" alt="Student Bench" className="w-6 h-6 object-contain" />,
      desc: 'Wooden and metal benches for students',
    },
    {
      name: 'Open Rack',
      icon: <img src="/images/open_rack_1785853923416.png" alt="Open Rack" className="w-6 h-6 object-contain" />,
      desc: 'Open shelving units and storage racks',
    },
    {
      name: 'Closed Bureau',
      icon: <img src="/images/closed_bureau_1785853936324.png" alt="Closed Bureau" className="w-6 h-6 object-contain" />,
      desc: 'Closed storage cabinets and almirahs',
    },
    {
      name: 'Projector Screen',
      icon: <img src="/images/projector_screen_1785853947813.png" alt="Projector Screen" className="w-6 h-6 object-contain" />,
      desc: 'Pull-down and motorized projector screens',
    },
    {
      name: 'Black Board',
      icon: <img src="/images/black_board_1785853957797.png" alt="Black Board" className="w-6 h-6 object-contain" />,
      desc: 'Classic blackboards and chalkboards',
    },
    {
      name: 'Computer Table',
      icon: <img src="/images/computer_table_1785853983998.png" alt="Computer Table" className="w-6 h-6 object-contain" />,
      desc: 'Specialized tables for computer labs',
    },
    {
      name: 'Fire Extinguisher',
      icon: <img src="/images/fire_extinguisher_1785853994718.png" alt="Fire Extinguisher" className="w-6 h-6 object-contain" />,
      desc: 'Safety equipment and fire extinguishers',
    },
    {
      name: 'Staff Cabin Table',
      icon: <img src="/images/staff_cabin_table_1785854005610.png" alt="Staff Cabin Table" className="w-6 h-6 object-contain" />,
      desc: 'Premium tables for staff cabins',
    },
    {
      name: 'Staff Table',
      icon: <img src="/images/staff_table_1785854016575.png" alt="Staff Table" className="w-6 h-6 object-contain" />,
      desc: 'Standard desks for faculty and staff',
    },
    {
      name: 'Small Bench',
      icon: <img src="/images/small_bench.svg" alt="Small Bench" className="w-6 h-6 object-contain" />,
      desc: 'Small seating benches',
    },
    {
      name: 'Long Bench',
      icon: <img src="/images/long_bench.svg" alt="Long Bench" className="w-6 h-6 object-contain" />,
      desc: 'Long seating benches for corridors and common areas',
    },
    {
      name: 'Drawer',
      icon: <Archive className="w-6 h-6 text-[#2563EB]" />,
      desc: 'Storage drawers and filing cabinets',
    },
    {
      name: 'First Aid Kit Box',
      icon: <BriefcaseMedical className="w-6 h-6 text-[#2563EB]" />,
      desc: 'Medical supplies and first aid kits',
    },
    {
      name: 'White Board',
      icon: <Presentation className="w-6 h-6 text-[#2563EB]" />,
      desc: 'Dry-erase whiteboards and smart boards',
    },
    {
      name: 'Cupboard',
      icon: <Columns className="w-6 h-6 text-[#2563EB]" />,
      desc: 'Wooden and steel cupboards',
    },
    {
      name: 'Long Lab Switch Table',
      icon: <Zap className="w-6 h-6 text-[#2563EB]" />,
      desc: 'Laboratory tables with integrated electrical switches',
    },
    {
      name: 'Lab Stool',
      icon: <Armchair className="w-6 h-6 text-[#2563EB]" />,
      desc: 'High stools for laboratories',
    },
    {
      name: 'Washbasin',
      icon: <Droplets className="w-6 h-6 text-[#2563EB]" />,
      desc: 'Washbasins and plumbing fixtures',
    },
    {
      name: 'Microphone Speaker',
      icon: <Mic className="w-6 h-6 text-[#2563EB]" />,
      desc: 'Microphones and audio speaker systems',
    },
    {
      name: 'Camera',
      icon: <img src="/images/camera.svg" alt="Camera" className="w-6 h-6 object-contain" />,
      desc: 'DSLRs, webcams, security cameras, and video equipment',
    },
    {
      name: 'Speaker',
      icon: <img src="/images/speaker.svg" alt="Speaker" className="w-6 h-6 object-contain" />,
      desc: 'Bluetooth speakers, PA systems, and monitors',
    },
    {
      name: 'Other Assets',
      icon: <Boxes className="w-6 h-6 text-[#2563EB]" />,
      desc: 'Miscellaneous Facilities, Air Conditioners & Signage',
    },
  ];

  const CHAIR_TYPE_DEFINITIONS: {
    name: ChairType;
    icon: React.ReactNode;
    desc: string;
  }[] = [
    { name: 'Normal Chair', icon: <Armchair className="w-6 h-6 text-[#2563EB]" />, desc: 'Standard seating chairs, lab stools, seminar chairs' },
    { name: 'Plastic Chair', icon: <Armchair className="w-6 h-6 text-[#2563EB]" />, desc: 'Lightweight plastic chairs for events and outdoor' },
    { name: 'Cushion Chair', icon: <Armchair className="w-6 h-6 text-[#2563EB]" />, desc: 'Comfortable cushioned chairs for faculty and labs' },
    { name: 'Rolling Chair', icon: <Armchair className="w-6 h-6 text-[#2563EB]" />, desc: 'Ergonomic wheeled chairs for office and computer labs' },
  ];

  const handleCategoryClick = (categoryName: CategoryType) => {
    if (categoryName === 'Chair') {
      setViewingChairTypes(true);
    } else {
      setSelectedCategoryFilter(categoryName);
      setSelectedChairTypeFilter(null);
      setActiveTab('assets');
    }
  };

  const handleChairTypeClick = (chairType: ChairType) => {
    setSelectedCategoryFilter('Chair');
    setSelectedChairTypeFilter(chairType);
    setActiveTab('assets');
  };

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFF6FF] text-[#2563EB] text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" /> {viewingChairTypes ? CHAIR_TYPE_DEFINITIONS.length : CATEGORY_DEFINITIONS.length} {viewingChairTypes ? 'Chair Types' : 'Asset Categories'}
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827]">
          {viewingChairTypes ? 'Chair Types' : 'Asset Category Hub'}
        </h1>
        <p className="text-xs sm:text-sm text-[#6B7280]">
          {viewingChairTypes 
            ? 'Click any chair type card to view and filter specific chair assets'
            : 'Click any category card to view and filter specific assets'}
        </p>
        {viewingChairTypes && (
          <button
            onClick={() => setViewingChairTypes(false)}
            className="mt-4 px-4 py-2 rounded-lg border border-[#E5E7EB] text-[#374151] font-semibold text-sm hover:bg-[#F3F4F6] transition-colors"
          >
            ← Back to Categories
          </button>
        )}
      </div>

      {viewingChairTypes ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {CHAIR_TYPE_DEFINITIONS.map((ct, i) => {
            const chairAssets = assets.filter((a) => a.category === 'Chair' && a.chair_type_id === ct.name);
            const totalCount = chairAssets.length;
            const availableCount = chairAssets.filter(
              (a) => a.status === 'Active' || a.status === 'In Use'
            ).length;
            const damagedCount = chairAssets.filter(
              (a) => a.status === 'Damaged' || a.status === 'Under Maintenance'
            ).length;

            return (
              <motion.div
                key={i}
                whileHover={{ y: -4 }}
                onClick={() => handleChairTypeClick(ct.name)}
                className="p-6 rounded-[20px] border border-[#E5E7EB] bg-white cursor-pointer transition-all duration-300 shadow-[0_4px_16px_rgba(15,23,42,0.08)] hover:shadow-[0_12px_32px_rgba(37,99,235,0.15)] hover:border-[#2563EB] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] p-2.5 flex items-center justify-center text-[#2563EB]">
                      {ct.icon}
                    </div>
                    <span className="px-3 py-1 bg-[#F3F4F6] rounded-full text-xs font-semibold text-[#374151]">
                      {totalCount} Items
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-[#111827] mb-1">
                    {ct.name}
                  </h3>
                  <p className="text-xs text-[#6B7280] mb-6 leading-relaxed">
                    {ct.desc}
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
      ) : (
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
      )}
    </div>
  );
};

