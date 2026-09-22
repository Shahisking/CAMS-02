import React, { useState } from 'react';
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
  Plus,
  Edit2,
  X,
  Save,
  Camera,
  Speaker,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CategoryType, ChairType, Category } from '../../types';

const ICON_MAP: Record<string, React.ReactNode> = {
  Monitor: <Monitor className="w-6 h-6 text-[#2563EB]" />,
  Projector: <Projector className="w-6 h-6 text-[#2563EB]" />,
  Printer: <Printer className="w-6 h-6 text-[#2563EB]" />,
  Armchair: <Armchair className="w-6 h-6 text-[#2563EB]" />,
  Table: <TableIcon className="w-6 h-6 text-[#2563EB]" />,
  FlaskConical: <FlaskConical className="w-6 h-6 text-[#2563EB]" />,
  Trophy: <Trophy className="w-6 h-6 text-[#2563EB]" />,
  BookOpen: <BookOpen className="w-6 h-6 text-[#2563EB]" />,
  BedDouble: <BedDouble className="w-6 h-6 text-[#2563EB]" />,
  Zap: <Zap className="w-6 h-6 text-[#2563EB]" />,
  Fan: <Fan className="w-6 h-6 text-[#2563EB]" />,
  Lightbulb: <Lightbulb className="w-6 h-6 text-[#2563EB]" />,
  Clipboard: <Clipboard className="w-6 h-6 text-[#2563EB]" />,
  Trash2: <Trash2 className="w-6 h-6 text-[#2563EB]" />,
  Sofa: <Sofa className="w-6 h-6 text-[#2563EB]" />,
  Archive: <Archive className="w-6 h-6 text-[#2563EB]" />,
  Presentation: <Presentation className="w-6 h-6 text-[#2563EB]" />,
  Columns: <Columns className="w-6 h-6 text-[#2563EB]" />,
  BriefcaseMedical: <BriefcaseMedical className="w-6 h-6 text-[#2563EB]" />,
  Droplets: <Droplets className="w-6 h-6 text-[#2563EB]" />,
  Mic: <Mic className="w-6 h-6 text-[#2563EB]" />,
  HelpCircle: <HelpCircle className="w-6 h-6 text-[#2563EB]" />,
  Camera: <Camera className="w-6 h-6 text-[#2563EB]" />,
  Speaker: <Speaker className="w-6 h-6 text-[#2563EB]" />,
  Boxes: <Boxes className="w-6 h-6 text-[#2563EB]" />,
};

const ICON_OPTIONS = [
  'Monitor', 'Projector', 'Printer', 'Armchair', 'Table', 'FlaskConical',
  'Trophy', 'BookOpen', 'BedDouble', 'Zap', 'Fan', 'Lightbulb', 'Clipboard',
  'Trash2', 'Sofa', 'Archive', 'Presentation', 'Columns', 'BriefcaseMedical',
  'Droplets', 'Mic', 'HelpCircle', 'Camera', 'Speaker', 'Boxes',
];

const getIcon = (iconName: string): React.ReactNode => {
  return ICON_MAP[iconName] || <Boxes className="w-6 h-6 text-[#2563EB]" />;
};

export const CategoriesView: React.FC = () => {
  const {
    assets,
    setSelectedCategoryFilter,
    setSelectedChairTypeFilter,
    setActiveTab,
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
  } = useApp();

  const [viewingChairTypes, setViewingChairTypes] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formIcon, setFormIcon] = useState('Boxes');
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<Category | null>(null);

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

  const openAddModal = () => {
    setEditingCategory(null);
    setFormName('');
    setFormDesc('');
    setFormIcon('Boxes');
    setShowModal(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormDesc(cat.description);
    setFormIcon(cat.icon);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;
    setIsSaving(true);
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, {
          name: formName.trim(),
          description: formDesc.trim(),
          icon: formIcon,
        });
      } else {
        await addCategory({
          name: formName.trim(),
          description: formDesc.trim(),
          icon: formIcon,
          isCustom: true,
        });
      }
      setShowModal(false);
      setEditingCategory(null);
    } catch (err) {
      console.error('Failed to save category', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    await deleteCategory(deleteConfirm.id);
    setDeleteConfirm(null);
  };

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFF6FF] text-[#2563EB] text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" /> {viewingChairTypes ? CHAIR_TYPE_DEFINITIONS.length : categories.length}{' '}
            {viewingChairTypes ? 'Chair Types' : 'Asset Categories'}
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
        {!viewingChairTypes && (
          <button
            onClick={openAddModal}
            className="px-5 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-sm transition-all duration-200 flex items-center gap-2 cursor-pointer w-fit"
          >
            <Plus className="w-4 h-4" /> Add Category
          </button>
        )}
      </div>

      {/* Chair Types Grid */}
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
                  <h3 className="text-xl font-bold text-[#111827] mb-1">{ct.name}</h3>
                  <p className="text-xs text-[#6B7280] mb-6 leading-relaxed">{ct.desc}</p>
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
        /* Categories Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => {
            const categoryAssets = assets.filter((a) => a.category === (cat.name as CategoryType));
            const totalCount = categoryAssets.length;
            const availableCount = categoryAssets.filter(
              (a) => a.status === 'Active' || a.status === 'In Use'
            ).length;
            const damagedCount = categoryAssets.filter(
              (a) => a.status === 'Damaged' || a.status === 'Under Maintenance'
            ).length;

            return (
              <motion.div
                key={cat.id}
                whileHover={{ y: -4 }}
                className="p-6 rounded-[20px] border border-[#E5E7EB] bg-white cursor-pointer transition-all duration-300 shadow-[0_4px_16px_rgba(15,23,42,0.08)] hover:shadow-[0_12px_32px_rgba(37,99,235,0.15)] hover:border-[#2563EB] flex flex-col justify-between"
                onClick={() => handleCategoryClick(cat.name as CategoryType)}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] p-2.5 flex items-center justify-center text-[#2563EB]">
                      {getIcon(cat.icon)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-[#F3F4F6] rounded-full text-xs font-semibold text-[#374151]">
                        {totalCount} Items
                      </span>
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => openEditModal(cat)}
                          className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#2563EB] hover:bg-[#EFF6FF] transition-colors cursor-pointer"
                          title="Edit Category"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirm(cat);
                          }}
                          className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#EF4444] hover:bg-[#FEF2F2] transition-colors cursor-pointer"
                          title="Delete Category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-[#111827] mb-1">{cat.name}</h3>
                  <p className="text-xs text-[#6B7280] mb-6 leading-relaxed">{cat.description}</p>
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

      {/* Add / Edit Category Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 flex items-center justify-center p-4" style={{ backdropFilter: 'blur(4px)' }}>
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative"
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-[#6B7280] hover:bg-[#F3F4F6] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-extrabold text-[#111827] mb-1">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h2>
            <p className="text-xs text-[#6B7280] mb-5">
              {editingCategory
                ? 'Update the category details below.'
                : 'Create a new asset category for your inventory.'}
            </p>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-[#374151] mb-1.5">Category Name *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Air Conditioner"
                  className="w-full h-11 px-3.5 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] text-sm text-[#111827] placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-all font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#374151] mb-1.5">Description</label>
                <textarea
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Brief description of this category..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] text-sm text-[#111827] placeholder-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-all font-medium resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#374151] mb-1.5">Icon</label>
                <div className="grid grid-cols-6 gap-2">
                  {ICON_OPTIONS.map((iconName) => (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => setFormIcon(iconName)}
                      className={`w-11 h-11 rounded-xl flex items-center justify-center border-2 transition-all cursor-pointer ${
                        formIcon === iconName
                          ? 'border-[#2563EB] bg-[#EFF6FF] scale-110'
                          : 'border-[#E5E7EB] bg-white hover:border-[#93C5FD] hover:bg-[#F9FAFB]'
                      }`}
                      title={iconName}
                    >
                      {getIcon(iconName)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 h-11 rounded-xl border border-[#E5E7EB] text-[#374151] font-bold text-sm hover:bg-[#F3F4F6] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving || !formName.trim()}
                  className="flex-1 h-11 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-sm transition-colors cursor-pointer disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {editingCategory ? 'Update' : 'Create'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 flex items-center justify-center p-4" style={{ backdropFilter: 'blur(4px)' }}>
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center"
          >
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-7 h-7 text-[#EF4444]" />
            </div>
            <h2 className="text-lg font-extrabold text-[#111827] mb-1">Delete Category?</h2>
            <p className="text-xs text-[#6B7280] mb-5">
              Are you sure you want to delete <strong className="text-[#111827]">{deleteConfirm.name}</strong>?
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 h-10 rounded-xl border border-[#E5E7EB] text-[#374151] font-bold text-sm hover:bg-[#F3F4F6] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 h-10 rounded-xl bg-[#EF4444] hover:bg-red-600 text-white font-bold text-sm transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
