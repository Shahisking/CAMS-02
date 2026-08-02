import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Boxes,
  CheckCircle2,
  Wrench,
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  Plus,
  ArrowRight,
  Search,
  Filter,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  BarChart3,
  PieChart as PieChartIcon,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useApp } from '../../context/AppContext';

interface DashboardViewProps {
  onOpenAddAssetModal: () => void;
  onOpenQRScanner?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenAddAssetModal,
  onOpenQRScanner,
}) => {
  const { assets, maintenanceTickets, allocationLogs, setActiveTab, currentUser } = useApp();

  const isSystemMonitor =
    currentUser?.role === 'Monitor' ||
    currentUser?.role?.toLowerCase().includes('monitor') ||
    currentUser?.email?.toLowerCase().includes('monitor');

  // Stat numbers derived from live database assets
  const totalAssets = assets.length;
  const availableAssets = assets.filter((a) => a.status === 'Active').length;
  const issuedAssets = assets.filter((a) => a.status === 'In Use').length;
  const underMaintenance = assets.filter((a) => a.status === 'Under Maintenance' || a.status === 'Damaged').length;
  const retiredAssets = assets.filter((a) => a.status === 'Written Off' || a.status === 'Lost').length;

  // Donut Chart Data: Asset Status Overview
  const donutData = [
    { name: 'Available', value: availableAssets, color: '#2563EB' },
    { name: 'Issued', value: issuedAssets, color: '#F59E0B' },
    { name: 'Under Maintenance', value: underMaintenance, color: '#EF4444' },
    { name: 'Retired', value: retiredAssets, color: '#6B7280' },
  ];

  // Vertical Bar Chart Data: Assets by Category derived from DB
  const categoryMap: Record<string, number> = {};
  assets.forEach((a) => {
    const cat = a.category || 'Other Assets';
    categoryMap[cat] = (categoryMap[cat] || 0) + 1;
  });
  const barData = Object.entries(categoryMap).map(([name, count]) => ({
    name: name.length > 14 ? name.substring(0, 12) + '...' : name,
    count,
  }));

  // Real Recent Asset Requests Data from allocation logs
  const recentRequests = allocationLogs.slice(0, 5).map((log) => ({
    id: log.id,
    asset: log.assetName,
    requestedBy: log.toAssignee || log.transferredBy,
    status: 'Approved',
  }));

  // Real Recent Maintenance Data from maintenance tickets
  const recentMaintenance = maintenanceTickets.slice(0, 5).map((m) => ({
    asset: m.assetName,
    id: m.id,
    type: m.problem,
    status: m.status,
  }));

  const getRequestBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-50 text-[#22C55E] border border-emerald-200';
      case 'Pending':
        return 'bg-amber-50 text-[#F59E0B] border border-amber-200';
      case 'In Review':
        return 'bg-blue-50 text-[#2563EB] border border-blue-200';
      case 'Rejected':
        return 'bg-rose-50 text-[#EF4444] border border-rose-200';
      default:
        return 'bg-slate-50 text-slate-600 border border-slate-200';
    }
  };

  const getMaintenanceBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-50 text-[#22C55E] border border-emerald-200';
      case 'In Progress':
        return 'bg-blue-50 text-[#2563EB] border border-blue-200';
      case 'Pending':
        return 'bg-amber-50 text-[#F59E0B] border border-amber-200';
      default:
        return 'bg-slate-50 text-slate-600 border border-slate-200';
    }
  };

  return (
    <div className="space-y-6 p-6 lg:p-8 max-w-[1400px] mx-auto bg-[#F8FAFC] min-h-screen">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[#111827] font-sans tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-[#6B7280] font-normal mt-1">
            Overview of college assets and operations.
          </p>
        </div>

        {isSystemMonitor && (
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenAddAssetModal}
              className="px-4 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-xs transition-all duration-200 flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Asset</span>
            </button>
          </div>
        )}
      </div>

      {/* 1. STATISTICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Assets */}
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
          onClick={() => setActiveTab('assets')}
          className="bg-white rounded-[14px] p-6 border border-[#E5E7EB] shadow-xs cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#6B7280]">Total Assets</span>
            <div className="w-10 h-10 rounded-full bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0">
              <Boxes className="w-5 h-5 text-[#2563EB]" />
            </div>
          </div>

          <div className="mt-4">
            <div className="text-3xl font-bold text-[#111827] font-sans tracking-tight">
              {totalAssets.toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs">
              <span className="inline-flex items-center font-semibold text-[#22C55E]">
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                +12.4%
              </span>
              <span className="text-[#6B7280]">vs last month</span>
            </div>
          </div>
        </motion.div>

        {/* Available Assets */}
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
          onClick={() => setActiveTab('assets')}
          className="bg-white rounded-[14px] p-6 border border-[#E5E7EB] shadow-xs cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#6B7280]">Available Assets</span>
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-[#22C55E] flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-[#22C55E]" />
            </div>
          </div>

          <div className="mt-4">
            <div className="text-3xl font-bold text-[#111827] font-sans tracking-tight">
              {availableAssets.toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs">
              <span className="inline-flex items-center font-semibold text-[#22C55E]">
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                +8.1%
              </span>
              <span className="text-[#6B7280]">vs last month</span>
            </div>
          </div>
        </motion.div>

        {/* Issued Assets */}
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
          onClick={() => setActiveTab('allocation')}
          className="bg-white rounded-[14px] p-6 border border-[#E5E7EB] shadow-xs cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#6B7280]">Issued Assets</span>
            <div className="w-10 h-10 rounded-full bg-amber-50 text-[#F59E0B] flex items-center justify-center shrink-0">
              <ArrowLeftRight className="w-5 h-5 text-[#F59E0B]" />
            </div>
          </div>

          <div className="mt-4">
            <div className="text-3xl font-bold text-[#111827] font-sans tracking-tight">
              {issuedAssets.toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs">
              <span className="inline-flex items-center font-semibold text-[#22C55E]">
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                +14.2%
              </span>
              <span className="text-[#6B7280]">vs last month</span>
            </div>
          </div>
        </motion.div>

        {/* Under Maintenance */}
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
          onClick={() => setActiveTab('maintenance')}
          className="bg-white rounded-[14px] p-6 border border-[#E5E7EB] shadow-xs cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#6B7280]">Under Maintenance</span>
            <div className="w-10 h-10 rounded-full bg-rose-50 text-[#EF4444] flex items-center justify-center shrink-0">
              <Wrench className="w-5 h-5 text-[#EF4444]" />
            </div>
          </div>

          <div className="mt-4">
            <div className="text-3xl font-bold text-[#111827] font-sans tracking-tight">
              {underMaintenance.toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs">
              <span className="inline-flex items-center font-semibold text-[#22C55E]">
                <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
                -3.5%
              </span>
              <span className="text-[#6B7280]">vs last month</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 2. CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Large Donut Chart: Asset Status Overview */}
        <div className="lg:col-span-6 bg-white rounded-[14px] p-6 border border-[#E5E7EB] shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-4">
            <div>
              <h2 className="text-lg font-bold text-[#111827] font-sans">
                Asset Status Overview
              </h2>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Real-time proportion of active, issued, and servicing items
              </p>
            </div>
            <button
              onClick={() => setActiveTab('assets')}
              className="text-xs font-semibold text-[#2563EB] hover:underline"
            >
              View Assets
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-2">
            <div className="relative w-48 h-48 shrink-0 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-2xl font-bold text-[#111827] font-sans leading-none">
                  {totalAssets.toLocaleString()}
                </span>
                <span className="text-xs text-[#6B7280] font-medium mt-1">Total Assets</span>
              </div>
            </div>

            <div className="space-y-3 w-full text-xs">
              {donutData.map((item, idx) => {
                const pct = ((item.value / totalAssets) * 100).toFixed(1);
                return (
                  <div key={idx} className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-[#111827] font-medium">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#111827]">{item.value.toLocaleString()}</span>
                      <span className="text-[#6B7280] font-normal">({pct}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Vertical Bar Chart: Assets by Category */}
        <div className="lg:col-span-6 bg-white rounded-[14px] p-6 border border-[#E5E7EB] shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-4">
            <div>
              <h2 className="text-lg font-bold text-[#111827] font-sans">
                Assets by Category
              </h2>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Distribution across primary equipment groups
              </p>
            </div>
            <button
              onClick={() => setActiveTab('categories')}
              className="text-xs font-semibold text-[#2563EB] hover:underline"
            >
              All Categories
            </button>
          </div>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: '#F8FAFC' }}
                  contentStyle={{
                    backgroundColor: '#111827',
                    borderRadius: '8px',
                    color: '#FFF',
                    fontSize: '12px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  }}
                />
                <Bar dataKey="count" fill="#2563EB" radius={[6, 6, 0, 0]} barSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 3. TABLES SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Table 1: Recent Asset Requests */}
        <div className="lg:col-span-6 bg-white rounded-[14px] p-6 border border-[#E5E7EB] shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-4">
            <div>
              <h2 className="text-lg font-bold text-[#111827] font-sans">
                Recent Asset Requests
              </h2>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Faculty and department allocation requests
              </p>
            </div>
            <button
              onClick={() => setActiveTab('requests')}
              className="text-xs font-semibold text-[#2563EB] hover:underline"
            >
              View All
            </button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-[#E5E7EB]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] text-[#6B7280] font-semibold border-b border-[#E5E7EB]">
                <tr>
                  <th className="py-3 px-4">Request ID</th>
                  <th className="py-3 px-4">Asset</th>
                  <th className="py-3 px-4">Requested By</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB] text-[#111827]">
                {recentRequests.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-[#6B7280]">
                      No data available
                    </td>
                  </tr>
                ) : (
                  recentRequests.map((req, idx) => (
                    <tr key={idx} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="py-3.5 px-4 font-mono font-medium text-xs text-[#2563EB]">
                        {req.id}
                      </td>
                      <td className="py-3.5 px-4 font-medium">{req.asset}</td>
                      <td className="py-3.5 px-4 text-[#6B7280]">{req.requestedBy}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${getRequestBadge(
                            req.status
                          )}`}
                        >
                          {req.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table 2: Recent Maintenance */}
        <div className="lg:col-span-6 bg-white rounded-[14px] p-6 border border-[#E5E7EB] shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-4">
            <div>
              <h2 className="text-lg font-bold text-[#111827] font-sans">
                Recent Maintenance
              </h2>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Active servicing tickets and repair logs
              </p>
            </div>
            <button
              onClick={() => setActiveTab('maintenance')}
              className="text-xs font-semibold text-[#2563EB] hover:underline"
            >
              View All
            </button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-[#E5E7EB]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] text-[#6B7280] font-semibold border-b border-[#E5E7EB]">
                <tr>
                  <th className="py-3 px-4">Asset</th>
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Maintenance Type</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB] text-[#111827]">
                {recentMaintenance.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-[#6B7280]">
                      No data available
                    </td>
                  </tr>
                ) : (
                  recentMaintenance.map((m, idx) => (
                    <tr key={idx} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="py-3.5 px-4 font-medium">{m.asset}</td>
                      <td className="py-3.5 px-4 font-mono text-xs text-[#6B7280]">{m.id}</td>
                      <td className="py-3.5 px-4 text-[#6B7280]">{m.type}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${getMaintenanceBadge(
                            m.status
                          )}`}
                        >
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
