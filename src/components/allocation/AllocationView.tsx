import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeftRight,
  CheckCircle2,
  Monitor,
  MapPin,
  User,
  RotateCcw,
  History,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AllocationView: React.FC = () => {
  const { assets, allocationLogs, transferAsset, currentUser } = useApp();
  const isMonitor = currentUser?.role === 'Monitor';

  const [selectedAssetId, setSelectedAssetId] = useState<string>(assets[0]?.id || '');
  const [toLocation, setToLocation] = useState('');
  const [toAssignee, setToAssignee] = useState('');
  const [reason, setReason] = useState('');
  const [transferSuccess, setTransferSuccess] = useState(false);

  const currentAsset = assets.find((a) => a.id === selectedAssetId);

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetId || !toLocation || !toAssignee) return;

    await transferAsset(selectedAssetId, toLocation, reason);
    setTransferSuccess(true);
    setTimeout(() => setTransferSuccess(false), 4000);
    setToLocation('');
    setToAssignee('');
    setReason('');
  };

  const handleResetForm = () => {
    if (assets.length > 0) setSelectedAssetId(assets[0].id);
    setToLocation('');
    setToAssignee('');
    setReason('');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1200px] mx-auto space-y-10">
        {!isMonitor ? (
          <div className="bg-white rounded-[20px] p-6 sm:p-10 border border-[#E2E8F0] shadow-[0_10px_30px_rgba(15,23,42,0.08)] text-center">
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
              <ArrowLeftRight className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Asset Transfer Restricted</h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Only the System Monitor can process asset transfers. Please submit a transfer request through the Requests module, and the Monitor will handle it.
            </p>
          </div>
        ) : (
          <>
        {/* Main Form Container */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-[20px] p-6 sm:p-10 border border-[#E2E8F0] shadow-[0_10px_30px_rgba(15,23,42,0.08)]"
        >
          {/* Header */}
          <div className="flex items-start gap-5 mb-10 pb-8 border-b border-[#E2E8F0]">
            <div className="w-[60px] h-[60px] rounded-[18px] bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0 shadow-xs">
              <ArrowLeftRight className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-[34px] font-bold text-[#0F172A] leading-tight tracking-tight">
                New Asset Transfer
              </h1>
              <p className="text-base font-medium text-[#64748B] mt-1">
                Record assignment change
              </p>
            </div>
          </div>

          {/* Success Banner */}
          {transferSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-4 bg-[#DCFCE7] border border-[#16A34A]/30 text-[#15803D] rounded-[14px] flex items-center gap-3 font-semibold text-sm shadow-xs"
            >
              <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0" />
              <span>Asset transfer re-allocation logged successfully in official audit registry!</span>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleTransferSubmit} className="space-y-10">
            {/* Section 1: Asset Selection & Info Card */}
            <div className="space-y-6">
              <div>
                <label className="block text-[15px] font-semibold text-[#334155] mb-4">
                  Select Asset <span className="text-[#DC2626] ml-0.5">*</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedAssetId}
                    onChange={(e) => setSelectedAssetId(e.target.value)}
                    className="w-full bg-white border border-[#CBD5E1] hover:border-[#94A3B8] text-[#111827] text-base font-medium h-[56px] rounded-[14px] px-[18px] outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/15 transition-all duration-200 cursor-pointer appearance-none"
                  >
                    {assets.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.id} — {a.name} ({a.department})
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-[18px] top-1/2 -translate-y-1/2 text-[#64748B]">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                      <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Asset Information Card */}
              {currentAsset && (
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[16px] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-[14px] bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0">
                      <Monitor className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-base font-bold text-[#0F172A]">
                        {currentAsset.name}
                      </div>
                      </div>
                  </div>
                </div>
              )}
            </div>

            {/* Section 2: Reallocation Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[15px] font-semibold text-[#334155] mb-4">
                  New Target Location / Room <span className="text-[#DC2626] ml-0.5">*</span>
                </label>
                <input
                  type="text"
                  value={toLocation}
                  onChange={(e) => setToLocation(e.target.value)}
                  placeholder="e.g. APJ Kalam Block - Room 302"
                  className="w-full bg-white border border-[#CBD5E1] hover:border-[#94A3B8] text-[#111827] text-base font-medium h-[56px] rounded-[14px] px-[18px] outline-none placeholder-[#94A3B8] focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/15 transition-all duration-200"
                  required
                />
              </div>

              <div>
                <label className="block text-[15px] font-semibold text-[#334155] mb-4">
                  New Assignee / Custodian <span className="text-[#DC2626] ml-0.5">*</span>
                </label>
                <input
                  type="text"
                  value={toAssignee}
                  onChange={(e) => setToAssignee(e.target.value)}
                  placeholder="e.g. Prof. M. Malathi / ECE Lab Incharge"
                  className="w-full bg-white border border-[#CBD5E1] hover:border-[#94A3B8] text-[#111827] text-base font-medium h-[56px] rounded-[14px] px-[18px] outline-none placeholder-[#94A3B8] focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/15 transition-all duration-200"
                  required
                />
              </div>
            </div>

            {/* Section 3: Reason for Transfer */}
            <div>
              <label className="block text-[15px] font-semibold text-[#334155] mb-4">
                Reason for Transfer
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain justification for relocation, project requirements, or faculty handover..."
                className="w-full bg-white border border-[#CBD5E1] hover:border-[#94A3B8] text-[#111827] text-base font-medium h-[150px] rounded-[14px] p-[18px] outline-none placeholder-[#94A3B8] focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/15 transition-all duration-200 resize-none"
              />
            </div>

            {/* Buttons Row */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-end gap-4">
              <button
                type="button"
                onClick={handleResetForm}
                className="w-full sm:w-auto px-6 h-[52px] bg-white border border-[#CBD5E1] text-[#334155] hover:bg-[#EFF6FF] hover:border-[#2563EB] hover:text-[#2563EB] rounded-[14px] font-semibold text-base transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" /> Reset Form
              </button>

              <button
                type="submit"
                className="w-full sm:w-auto px-8 h-[52px] bg-[#2563EB] hover:bg-blue-700 active:translate-y-0 hover:-translate-y-0.5 text-white font-semibold text-base rounded-[14px] shadow-[0_8px_24px_rgba(37,99,235,0.20)] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
              >
                <ArrowLeftRight className="w-5 h-5" /> Confirm Asset Transfer
              </button>
            </div>
          </form>
        </motion.div>

        {/* Transfer Audit History Section */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white rounded-[20px] p-6 sm:p-10 border border-[#E2E8F0] shadow-[0_10px_30px_rgba(15,23,42,0.08)] space-y-6"
        >
          <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[12px] bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#0F172A]">
                  Transfer Audit History
                </h2>
                <p className="text-xs text-[#64748B]">
                  Official record of recent asset relocations ({allocationLogs.length} logs)
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
            {allocationLogs.length === 0 ? (
              <div className="text-center py-12 text-sm text-[#94A3B8]">
                No data available
              </div>
            ) : (
              allocationLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-5 bg-[#F8FAFC] rounded-[16px] border border-[#E2E8F0] hover:border-[#2563EB] transition-all duration-200 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-[#2563EB] bg-[#EFF6FF] px-2.5 py-1 rounded-md border border-blue-100">
                        {log.assetId}
                      </span>
                      <span className="text-base font-bold text-[#0F172A]">
                        {log.assetName}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-[#64748B] bg-white px-3 py-1 rounded-full border border-[#E2E8F0]">
                      {log.date}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    <div className="p-3 bg-white rounded-[12px] border border-[#E2E8F0]">
                      <span className="text-xs font-semibold text-[#64748B] block mb-0.5">Origin (From):</span>
                      <div className="text-sm font-bold text-[#334155]">{log.fromLocation}</div>
                      <div className="text-xs text-[#64748B]">{log.fromAssignee}</div>
                    </div>

                    <div className="p-3 bg-[#EFF6FF] rounded-[12px] border border-blue-200">
                      <span className="text-xs font-semibold text-[#2563EB] block mb-0.5">Destination (To):</span>
                      <div className="text-sm font-bold text-[#0F172A]">{log.toLocation}</div>
                      <div className="text-xs text-[#2563EB]">{log.toAssignee}</div>
                    </div>
                  </div>

                  {log.reason && (
                    <div className="text-xs text-[#475569] bg-white p-2.5 rounded-[10px] border border-[#E2E8F0]/80 italic">
                      "{log.reason}" — Logged by <strong className="not-italic text-[#0F172A]">{log.transferredBy}</strong>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </motion.div>
          </>
        )}
      </div>
    </div>
  );
};
