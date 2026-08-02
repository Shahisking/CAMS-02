import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Search,
  Filter,
  Plus,
  QrCode,
  FileSpreadsheet,
  FileText,
  Trash2,
  Edit,
  Eye,
  ArrowUpDown,
  MoreVertical,
  CheckCircle2,
  Wrench,
  AlertTriangle,
  Building2,
  X,
  Sparkles,
  Upload,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Asset, CategoryType, Department, AssetCondition, AssetStatus, BUILDING_BLOCKS } from '../../types';
import { EditAssetModal } from './EditAssetModal';
import { ImportCSVModal } from './ImportCSVModal';
import { ReportIssueModal } from '../common/ReportIssueModal';

interface AssetManagementViewProps {
  onOpenAddAssetModal: () => void;
  onSelectAsset: (assetId: string) => void;
  onOpenQRScanner: () => void;
}

export const AssetManagementView: React.FC<AssetManagementViewProps> = ({
  onOpenAddAssetModal,
  onSelectAsset,
  onOpenQRScanner,
}) => {
  const {
    assets,
    deleteAsset,
    searchQuery,
    setSearchQuery,
    selectedCategoryFilter,
    setSelectedCategoryFilter,
    selectedDepartmentFilter,
    setSelectedDepartmentFilter,
    selectedBuildingFilter,
    setSelectedBuildingFilter,
    buildingBlocks,
    currentUser,
  } = useApp();

  const isMonitor = currentUser?.role === 'Monitor';

  const [departmentFilter, setDepartmentFilter] = useState<string>(selectedDepartmentFilter || 'All');
  const [conditionFilter, setConditionFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>(selectedCategoryFilter || 'All');
  const [buildingFilter, setBuildingFilter] = useState<string>(selectedBuildingFilter || 'All');
  const [roomFilter, setRoomFilter] = useState<string>('All');
  const [sortField, setSortField] = useState<keyof Asset>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [isReportIssueOpen, setIsReportIssueOpen] = useState<boolean>(false);
  const [reportIssueAssetId, setReportIssueAssetId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (selectedCategoryFilter) {
      setCategoryFilter(selectedCategoryFilter);
    } else if (selectedCategoryFilter === null) {
      setCategoryFilter('All');
    }
  }, [selectedCategoryFilter]);

  useEffect(() => {
    if (selectedDepartmentFilter) {
      setDepartmentFilter(selectedDepartmentFilter);
    } else if (selectedDepartmentFilter === null) {
      setDepartmentFilter('All');
    }
  }, [selectedDepartmentFilter]);

  useEffect(() => {
    if (selectedBuildingFilter) {
      setBuildingFilter(selectedBuildingFilter);
    } else if (selectedBuildingFilter === null) {
      setBuildingFilter('All');
    }
  }, [selectedBuildingFilter]);

  // Extract unique room numbers from DB assets
  const roomNumbers = Array.from(new Set(assets.map((a) => a.roomNumber).filter(Boolean))).sort();

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Reset pagination on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, departmentFilter, conditionFilter, statusFilter, categoryFilter, buildingFilter, roomFilter]);

  // Filter logic on live DB records
  const filteredAssets = assets.filter((a) => {
    const matchesSearch =
      a.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.building.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.assignedTo.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = departmentFilter === 'All' || a.department === departmentFilter;
    const matchesCond = conditionFilter === 'All' || a.condition === conditionFilter;
    const matchesStatus = statusFilter === 'All' || a.status === statusFilter;
    const matchesCategory = categoryFilter === 'All' || a.category === categoryFilter;
    const matchesBuilding = buildingFilter === 'All' || a.building === buildingFilter;
    const matchesRoom = roomFilter === 'All' || a.roomNumber === roomFilter;

    return matchesSearch && matchesDept && matchesCond && matchesStatus && matchesCategory && matchesBuilding && matchesRoom;
  });

  // Sorting logic on DB records
  const sortedAssets = [...filteredAssets].sort((a, b) => {
    let valA = (a[sortField] || '') as string | number;
    let valB = (b[sortField] || '') as string | number;

    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (field: keyof Asset) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const totalPages = Math.ceil(sortedAssets.length / itemsPerPage) || 1;

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(Math.max(1, totalPages));
    }
  }, [totalPages, currentPage]);

  const paginatedAssets = sortedAssets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Asset ID,Asset Name,Category,Department,Building Block,Floor,Room Number,Condition,Assigned To,Status,Purchase Date,Cost(INR)',
    ];
    const rows = sortedAssets.map(
      (a) =>
        `"${a.id}","${a.name}","${a.category}","${a.department}","${a.building}","${a.floor || 'Ground Floor'}","${a.roomNumber}","${a.condition}","${a.assignedTo}","${a.status}","${a.purchaseDate}",${a.purchaseCost}`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AIT_CAMS_Asset_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Printable PDF view simulation
  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl heading-section text-slate-900 dark:text-white">
            Campus Asset Management
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            {filteredAssets.length} assets registered across Adithya Institute of Technology
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {isMonitor && (
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="px-3.5 py-2 bg-blue-50 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-slate-700 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-slate-700 rounded-xl text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
              title="Import Assets from CSV file"
            >
              <Upload className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Import CSV</span>
            </button>
          )}

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            title="Export CSV Report"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          {isMonitor ? (
            <button
              onClick={onOpenAddAssetModal}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Asset</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setReportIssueAssetId(undefined);
                setIsReportIssueOpen(true);
              }}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
              title="Send an Issue / Request to System Monitor"
            >
              <Wrench className="w-4 h-4" />
              <span>Report Issue to Monitor</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
          {/* Search */}
          <div className="relative col-span-1 sm:col-span-2 md:col-span-1 lg:col-span-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ID, name, location..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
            />
          </div>

          {/* Building Block Filter */}
          <select
            value={buildingFilter}
            onChange={(e) => {
              setBuildingFilter(e.target.value);
              setSelectedBuildingFilter(e.target.value === 'All' ? null : e.target.value);
            }}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none cursor-pointer"
          >
            <option value="All">All Building Blocks</option>
            {(buildingBlocks && buildingBlocks.length > 0 ? buildingBlocks : BUILDING_BLOCKS).map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          {/* Department Filter */}
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none cursor-pointer"
          >
            <option value="All">All Departments</option>
            <option value="Computer Science & Engineering">CSE Dept</option>
            <option value="Information Technology">IT Dept</option>
            <option value="Electronics & Communication">ECE Dept</option>
            <option value="Electrical & Electronics">EEE Dept</option>
            <option value="Mechanical Engineering">Mech Dept</option>
            <option value="Civil Engineering">Civil Dept</option>
            <option value="Artificial Intelligence & Data Science">AI & DS Dept</option>
            <option value="Central Library">Central Library</option>
            <option value="Hostel Management">Hostel</option>
            <option value="Administrative Office">Admin Office</option>
          </select>

          {/* Room Filter */}
          <select
            value={roomFilter}
            onChange={(e) => setRoomFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none cursor-pointer"
          >
            <option value="All">All Rooms</option>
            {roomNumbers.map((rm) => (
              <option key={rm} value={rm}>
                Room {rm}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setSelectedCategoryFilter(null);
            }}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none cursor-pointer"
          >
            <option value="All">All Categories</option>
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
            <option value="Other Assets">Other Assets</option>
          </select>

          {/* Condition Filter */}
          <select
            value={conditionFilter}
            onChange={(e) => setConditionFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none cursor-pointer"
          >
            <option value="All">All Conditions</option>
            <option value="New">New</option>
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
            <option value="Poor">Poor</option>
            <option value="Damaged">Damaged</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="In Use">In Use</option>
            <option value="Under Maintenance">Under Maintenance</option>
            <option value="Damaged">Damaged</option>
            <option value="Lost">Lost</option>
          </select>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th onClick={() => handleSort('id')} className="py-3.5 px-4 cursor-pointer hover:text-blue-600 transition-colors">
                  <div className="flex items-center gap-1">Asset ID <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th onClick={() => handleSort('name')} className="py-3.5 px-4 cursor-pointer hover:text-blue-600 transition-colors">
                  <div className="flex items-center gap-1">Asset Name <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th onClick={() => handleSort('category')} className="py-3.5 px-4 cursor-pointer hover:text-blue-600 transition-colors">
                  <div className="flex items-center gap-1">Category <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th onClick={() => handleSort('department')} className="py-3.5 px-4 cursor-pointer hover:text-blue-600 transition-colors">
                  <div className="flex items-center gap-1">Department <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th onClick={() => handleSort('building')} className="py-3.5 px-4 cursor-pointer hover:text-blue-600 transition-colors">
                  <div className="flex items-center gap-1">Building Block <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th className="py-3.5 px-4">Floor</th>
                <th onClick={() => handleSort('roomNumber')} className="py-3.5 px-4 cursor-pointer hover:text-blue-600 transition-colors">
                  <div className="flex items-center gap-1">Room Number <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th onClick={() => handleSort('condition')} className="py-3.5 px-4 cursor-pointer hover:text-blue-600 transition-colors">
                  <div className="flex items-center gap-1">Condition <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th onClick={() => handleSort('assignedTo')} className="py-3.5 px-4 cursor-pointer hover:text-blue-600 transition-colors">
                  <div className="flex items-center gap-1">Assigned To <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th onClick={() => handleSort('status')} className="py-3.5 px-4 cursor-pointer hover:text-blue-600 transition-colors">
                  <div className="flex items-center gap-1">Status <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th onClick={() => handleSort('purchaseDate')} className="py-3.5 px-4 cursor-pointer hover:text-blue-600 transition-colors">
                  <div className="flex items-center gap-1">Purchase Date <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {paginatedAssets.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-slate-500 font-semibold text-sm">
                    No Assets Found
                  </td>
                </tr>
              ) : (
                paginatedAssets.map((asset) => (
                  <tr
                    key={asset.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                      {asset.id}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white max-w-xs">
                      <div className="truncate">
                        <div>{asset.name}</div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          ₹{asset.purchaseCost?.toLocaleString()}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md font-medium text-[11px]">
                        {asset.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200 truncate max-w-xs">
                      {asset.department}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300">
                      {asset.building}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                      {asset.floor || 'Ground Floor'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700 dark:text-slate-300">
                      {asset.roomNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          asset.condition === 'New'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : asset.condition === 'Good'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : asset.condition === 'Damaged'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {asset.condition}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300">
                      {asset.assignedTo}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          asset.status === 'Active' || asset.status === 'In Use'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            : asset.status === 'Under Maintenance'
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                        }`}
                      >
                        ● {asset.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400 text-[11px]">
                      {asset.purchaseDate}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onSelectAsset(asset.id)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors cursor-pointer"
                          title="View Asset Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {isMonitor ? (
                          <>
                            <button
                              onClick={() => setEditingAsset(asset)}
                              className="p-1.5 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/50 rounded-lg transition-colors cursor-pointer"
                              title="Edit Asset"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteAsset(asset.id)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Asset"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => {
                              setReportIssueAssetId(asset.id);
                              setIsReportIssueOpen(true);
                            }}
                            className="p-1.5 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/50 rounded-lg transition-colors cursor-pointer"
                            title="Report Issue / Request to Monitor"
                          >
                            <Wrench className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            {filteredAssets.length === 0 ? (
              'Showing 0 assets'
            ) : (
              <>
                Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {Math.min(currentPage * itemsPerPage, filteredAssets.length)}
                </span>{' '}
                of <span className="font-semibold text-slate-700 dark:text-slate-300">{filteredAssets.length}</span> assets
              </>
            )}
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-slate-700 dark:text-slate-300 transition-colors"
            >
              Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs font-semibold transition-all ${
                    currentPage === page
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-slate-700 dark:text-slate-300 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <EditAssetModal
        asset={editingAsset}
        isOpen={Boolean(editingAsset)}
        onClose={() => setEditingAsset(null)}
      />

      <ImportCSVModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />

      <ReportIssueModal
        isOpen={isReportIssueOpen}
        onClose={() => setIsReportIssueOpen(false)}
        initialAssetId={reportIssueAssetId}
      />
    </div>
  );
};
