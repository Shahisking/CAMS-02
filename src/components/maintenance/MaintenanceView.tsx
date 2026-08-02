import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  Plus,
  IndianRupee,
  User,
  Building,
  Filter,
  X,
  Calendar,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MaintenancePriority, MaintenanceStatus } from '../../types';

export const MaintenanceView: React.FC = () => {
  const { assets, maintenanceTickets, addMaintenanceTicket, updateMaintenanceTicket, currentUser } = useApp();

  const isSystemMonitor =
    currentUser?.role === 'Monitor' ||
    currentUser?.role?.toLowerCase().includes('monitor') ||
    currentUser?.email?.toLowerCase().includes('monitor');

  const [selectedAssetId, setSelectedAssetId] = useState(assets[0]?.id || '');
  const [problem, setProblem] = useState('');
  const [priority, setPriority] = useState<MaintenancePriority>('Medium');
  const [assignedTechnician, setAssignedTechnician] = useState('');
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [remarks, setRemarks] = useState('');

  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const selectedAsset = assets.find((a) => a.id === selectedAssetId);

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetId || !problem || isSystemMonitor) return;

    addMaintenanceTicket({
      assetId: selectedAssetId,
      assetName: selectedAsset?.name || 'Unknown Asset',
      department: selectedAsset?.department || 'Computer Science & Engineering',
      problem,
      priority,
      assignedTechnician,
      estimatedCost: Number(estimatedCost) || 0,
      status: 'Pending',
      requestedBy: `${currentUser?.fullName || 'User'} (${currentUser?.role || 'Staff'})`,
      remarks,
    });

    setShowCreateModal(false);
  };

  const filteredTickets = maintenanceTickets.filter(
    (t) => filterStatus === 'All' || t.status === filterStatus
  );

  const getPriorityColor = (p: MaintenancePriority) => {
    switch (p) {
      case 'Critical':
        return 'text-[#DC2626] font-bold';
      case 'High':
        return 'text-[#D97706] font-bold';
      case 'Medium':
        return 'text-[#2563EB] font-bold';
      case 'Low':
        return 'text-[#16A34A] font-bold';
      default:
        return 'text-[#334155] font-bold';
    }
  };

  const getStatusBadge = (status: MaintenanceStatus) => {
    switch (status) {
      case 'Completed':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#DCFCE7] text-[#15803D] inline-flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Completed
          </span>
        );
      case 'Pending':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FEF3C7] text-[#B45309] inline-flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Pending
          </span>
        );
      case 'In Progress':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#DBEAFE] text-[#1D4ED8] inline-flex items-center gap-1.5">
            <Wrench className="w-3.5 h-3.5" /> In Progress
          </span>
        );
      case 'Rejected':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FEE2E2] text-[#DC2626] inline-flex items-center gap-1.5">
            <XCircle className="w-3.5 h-3.5" /> Rejected
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#F1F5F9] text-[#334155]">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1280px] mx-auto space-y-[32px]">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFF6FF] text-[#2563EB] text-xs font-semibold mb-3">
              <Wrench className="w-3.5 h-3.5" /> Service & Equipment Repair Management
            </div>
            <h1 className="text-[32px] sm:text-[40px] font-bold text-[#0F172A] tracking-tight leading-none">
              Asset Maintenance & Repair Desk
            </h1>
            <p className="text-[16px] sm:text-[18px] font-medium text-[#64748B] mt-2">
              Track technical support requests, priority tickets, and repair cost estimations
            </p>
          </div>

          {!isSystemMonitor ? (
            <button
              onClick={() => setShowCreateModal(true)}
              className="h-[52px] px-6 bg-[#2563EB] hover:bg-[#1D4ED8] active:translate-y-0 hover:-translate-y-0.5 text-white font-semibold text-base rounded-[14px] shadow-[0_10px_20px_rgba(37,99,235,0.20)] transition-all duration-300 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <Plus className="w-5 h-5" /> Raise Maintenance Ticket
            </button>
          ) : (
            <div className="h-[52px] px-5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-[14px] border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 shrink-0">
              <ShieldAlert className="w-4 h-4 text-blue-600" /> System Monitor Desk Oversight
            </div>
          )}
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {['All', 'Pending', 'In Progress', 'Completed', 'Rejected'].map((st) => {
            const isActive = filterStatus === st;
            return (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-5 py-2.5 rounded-[12px] text-sm font-semibold transition-all duration-200 border cursor-pointer ${
                  isActive
                    ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-xs'
                    : 'bg-white text-[#334155] border-[#E2E8F0] hover:bg-[#EFF6FF] hover:border-[#2563EB]/40'
                }`}
              >
                {st} Tickets
              </button>
            );
          })}
        </div>

        {/* Tickets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px]">
          {filteredTickets.length === 0 ? (
            <div className="col-span-full text-center py-16 bg-white rounded-[18px] border border-[#E2E8F0] shadow-[0_10px_30px_rgba(15,23,42,0.08)] text-[#64748B] text-base font-medium">
              No data available
            </div>
          ) : (
            filteredTickets.map((ticket) => (
              <motion.div
                key={ticket.id}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-[18px] p-[28px] border border-[#E2E8F0] hover:border-[#2563EB] shadow-[0_10px_30px_rgba(15,23,42,0.08)] flex flex-col justify-between space-y-6 transition-all duration-200"
              >
                <div className="space-y-4">
                  {/* Top Bar: Ticket ID & Status Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-xs px-2.5 py-1 bg-[#F1F5F9] text-[#2563EB] rounded-md border border-[#E2E8F0]">
                      {ticket.id}
                    </span>
                    {getStatusBadge(ticket.status)}
                  </div>

                  {/* Asset Name & Details */}
                  <div>
                    <h3 className="text-[20px] font-bold text-[#111827] leading-snug">
                      {ticket.assetName}
                    </h3>
                    <div className="text-[15px] text-[#64748B] font-medium mt-1">
                      Asset ID: <span className="font-mono text-[#334155]">{ticket.assetId}</span> • {ticket.department}
                    </div>
                  </div>

                  {/* Problem Description Box */}
                  <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[14px] p-[20px] space-y-1.5">
                    <div className="text-[15px] font-semibold text-[#475569] flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-[#D97706]" /> Problem Description:
                    </div>
                    <p className="text-[16px] text-[#334155] leading-relaxed line-clamp-3">
                      {ticket.problem}
                    </p>
                  </div>

                  {/* Detail Rows */}
                  <div className="space-y-2.5 pt-1 text-sm border-t border-[#E2E8F0]">
                    <div className="flex items-center justify-between">
                      <span className="text-[15px] font-semibold text-[#64748B] flex items-center gap-2">
                        <User className="w-4 h-4 text-[#2563EB]" /> Technician:
                      </span>
                      <span className="text-[16px] font-semibold text-[#111827]">
                        {ticket.assignedTechnician}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[15px] font-semibold text-[#64748B] flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-[#2563EB]" /> Priority:
                      </span>
                      <span className={`text-[16px] ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[15px] font-semibold text-[#64748B] flex items-center gap-2">
                        <IndianRupee className="w-4 h-4 text-[#2563EB]" /> Estimated Cost:
                      </span>
                      <span className="text-[16px] font-bold text-[#16A34A]">
                        ₹{ticket.estimatedCost.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer: Date & Action Dropdown */}
                <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between gap-3">
                  <div className="text-xs font-semibold text-[#64748B] flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>Req: {ticket.requestDate}</span>
                  </div>

                  <select
                    value={ticket.status}
                    onChange={(e) =>
                      updateMaintenanceTicket(ticket.id, {
                        status: e.target.value as MaintenanceStatus,
                      })
                    }
                    className="bg-white border border-[#CBD5E1] hover:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 text-[#111827] text-xs font-bold rounded-[12px] px-3 py-1.5 outline-none cursor-pointer transition-colors"
                  >
                    <option value="Pending">Set Pending</option>
                    <option value="In Progress">Set In Progress</option>
                    <option value="Completed">Set Completed</option>
                    <option value="Rejected">Set Rejected</option>
                  </select>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Modal: Raise Maintenance Ticket */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white border border-[#E2E8F0] rounded-[20px] p-6 sm:p-8 max-w-lg w-full shadow-[0_10px_30px_rgba(15,23,42,0.12)] relative space-y-6"
            >
              <button
                onClick={() => setShowCreateModal(false)}
                className="absolute top-6 right-6 p-2 text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div>
                <h3 className="text-2xl font-bold text-[#0F172A]">
                  Raise Maintenance Ticket
                </h3>
                <p className="text-sm font-medium text-[#64748B] mt-1">
                  File an official service or repair request for campus equipment
                </p>
              </div>

              <form onSubmit={handleCreateTicket} className="space-y-5 text-sm">
                <div>
                  <label className="block text-[15px] font-semibold text-[#334155] mb-2">
                    Select Asset <span className="text-[#DC2626]">*</span>
                  </label>
                  <select
                    value={selectedAssetId}
                    onChange={(e) => setSelectedAssetId(e.target.value)}
                    className="w-full bg-white border border-[#CBD5E1] hover:border-[#94A3B8] text-[#111827] text-sm font-medium h-[48px] rounded-[12px] px-3 outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/15 transition-all"
                  >
                    {assets.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.id} — {a.name} ({a.department})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[15px] font-semibold text-[#334155] mb-2">
                    Problem Description <span className="text-[#DC2626]">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={problem}
                    onChange={(e) => setProblem(e.target.value)}
                    placeholder="Describe failure or damage details..."
                    className="w-full bg-white border border-[#CBD5E1] hover:border-[#94A3B8] text-[#111827] text-sm font-medium rounded-[12px] p-3 outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/15 transition-all resize-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[15px] font-semibold text-[#334155] mb-2">
                      Priority Level
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as MaintenancePriority)}
                      className="w-full bg-white border border-[#CBD5E1] hover:border-[#94A3B8] text-[#111827] text-sm font-medium h-[48px] rounded-[12px] px-3 outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/15 transition-all"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[15px] font-semibold text-[#334155] mb-2">
                      Estimated Cost (₹)
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={estimatedCost === 0 ? '' : estimatedCost}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        setEstimatedCost(val ? Number(val) : 0);
                      }}
                      placeholder="0"
                      className="w-full bg-white border border-[#CBD5E1] hover:border-[#94A3B8] text-[#111827] text-sm font-medium h-[48px] rounded-[12px] px-3 outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/15 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[15px] font-semibold text-[#334155] mb-2">
                    Assigned Technician
                  </label>
                  <input
                    type="text"
                    value={assignedTechnician}
                    onChange={(e) => setAssignedTechnician(e.target.value)}
                    className="w-full bg-white border border-[#CBD5E1] hover:border-[#94A3B8] text-[#111827] text-sm font-medium h-[48px] rounded-[12px] px-3 outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/15 transition-all"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-5 py-2.5 bg-[#F1F5F9] text-[#334155] hover:bg-[#E2E8F0] font-semibold rounded-[12px] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold rounded-[12px] shadow-[0_8px_20px_rgba(37,99,235,0.20)] transition-all cursor-pointer"
                  >
                    Submit Ticket
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};
