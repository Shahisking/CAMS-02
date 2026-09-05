import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Wrench, Send, AlertTriangle, CheckCircle, Package } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MaintenancePriority } from '../../types';

interface ReportIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAssetId?: string;
}

export const ReportIssueModal: React.FC<ReportIssueModalProps> = ({
  isOpen,
  onClose,
  initialAssetId,
}) => {
  const { assets, currentUser, addMaintenanceTicket, addNotification } = useApp();

  const [selectedAssetId, setSelectedAssetId] = useState<string>(
    initialAssetId || (assets[0]?.id || '')
  );
  const [issueType, setIssueType] = useState<string>('Equipment Damage / Repair');
  const [priority, setPriority] = useState<MaintenancePriority>('Medium');
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const selectedAsset = assets.find((a) => a.id === selectedAssetId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetId || !description.trim()) return;

    setIsSubmitting(true);
    try {
      const problemText = `[${issueType}] ${description.trim()}`;

      await addMaintenanceTicket({
        assetId: selectedAssetId,
        assetName: selectedAsset?.name || 'Asset Issue',
        department: currentUser?.department || selectedAsset?.department || 'General',
        problem: problemText,
        priority: priority,
        assignedTechnician: 'Pending Monitor Assignment',
        estimatedCost: 0,
        status: 'Pending',
        requestedBy: `${currentUser?.fullName || 'User'} (${currentUser?.role || 'Staff'})`,
        remarks: `Submitted by ${currentUser?.email || 'User'} to System Monitor`,
      });

      await addNotification({
        title: `Issue Reported: ${selectedAsset?.name || selectedAssetId}`,
        message: `${currentUser?.fullName || 'User'} (${currentUser?.role}) reported an issue to System Monitor: ${issueType}`,
        type: 'warning',
        category: 'Maintenance',
        timestamp: new Date().toISOString(),
        assetId: selectedAssetId,
        read: false,
      });

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setIsSubmitting(false);
        setDescription('');
        onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-2xl">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Send Issue Request to System Monitor
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Submit a problem report or request asset modifications to the System Monitor.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4 overflow-y-auto flex-1">
            {isSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Issue Request Sent!
                </h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Your request has been routed to the System Monitor. You will be notified when changes are processed.
                </p>
              </div>
            ) : (
              <form id="report-issue-form" onSubmit={handleSubmit} className="space-y-4 text-xs">
                {/* User Info Badge */}
                <div className="p-3 bg-blue-50 dark:bg-slate-800/60 border border-blue-100 dark:border-slate-700/60 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                      Requesting User
                    </span>
                    <div className="font-bold text-slate-900 dark:text-white text-xs">
                      {currentUser?.fullName || 'Campus Staff'} ({currentUser?.role || 'Staff'})
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded font-semibold text-[10px]">
                    Sends to Monitor
                  </span>
                </div>

                {/* Select Asset */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Target Asset <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={selectedAssetId}
                    onChange={(e) => setSelectedAssetId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2.5 text-xs outline-none focus:border-blue-500 cursor-pointer font-medium"
                    required
                  >
                    {assets.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.id} — {a.name} ({a.building} - {a.roomNumber})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Issue Type */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Request Type
                    </label>
                    <select
                      value={issueType}
                      onChange={(e) => setIssueType(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2.5 text-xs outline-none cursor-pointer font-medium"
                    >
                      <option value="Equipment Damage / Repair">Equipment Repair</option>
                      <option value="Replacement Request">Replacement Needed</option>
                      <option value="Transfer / Relocation">Location Transfer</option>
                      <option value="Data Correction">Asset Info Change</option>
                      <option value="Other Issue">Other Issue</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Priority Level
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as MaintenancePriority)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2.5 text-xs outline-none cursor-pointer font-medium"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                </div>

                {/* Problem Description */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Issue Details / Message for System Monitor <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the issue, defect, or requested modification in detail..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-3 text-xs outline-none focus:border-blue-500 resize-none font-medium"
                    required
                  />
                </div>
              </form>
            )}
          </div>

          {/* Footer */}
          {!isSuccess && (
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3 bg-slate-50/50 dark:bg-slate-800/50">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="report-issue-form"
                disabled={isSubmitting || !description.trim()}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Sending...' : 'Send to Monitor'}</span>
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
