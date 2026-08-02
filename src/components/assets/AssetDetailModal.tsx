import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  X,
  QrCode,
  Wrench,
  ArrowLeftRight,
  Printer,
  ShieldCheck,
  Calendar,
  Building,
  MapPin,
  Clock,
  User,
  Trash2,
  DollarSign,
  Tag,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface AssetDetailModalProps {
  assetId: string | null;
  onClose: () => void;
  onRaiseMaintenance: (assetId: string) => void;
  onReallocate: (assetId: string) => void;
}

export const AssetDetailModal: React.FC<AssetDetailModalProps> = ({
  assetId,
  onClose,
  onRaiseMaintenance,
  onReallocate,
}) => {
  const { assets, historyEvents, deleteAsset, currentUser } = useApp();
  const isMonitor = currentUser?.role === 'Monitor';

  if (!assetId) return null;

  const asset = assets.find((a) => a.id === assetId);
  if (!asset) return null;

  const events = historyEvents.filter((e) => e.assetId === assetId);

  const handlePrintQR = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-3xl w-full shadow-2xl relative my-8"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 text-xs font-mono font-bold mb-1">
              {asset.id}
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">{asset.name}</h2>
            <p className="text-xs text-slate-500">{asset.category} • {asset.department}</p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                asset.status === 'Active' || asset.status === 'In Use'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
              }`}
            >
              ● {asset.status}
            </span>
          </div>
        </div>

        {/* Main Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 my-6">
          {/* Left: QR Code Box */}
          <div className="md:col-span-4 space-y-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">QR Tag ID</div>
                <div className="text-[11px] font-mono text-slate-500">{asset.id}</div>
                <button
                  onClick={handlePrintQR}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                >
                  <Printer className="w-3.5 h-3.5" /> Print QR Tag Label
                </button>
              </div>

              {/* QR Code Graphic Mockup */}
              <div className="p-2 bg-white rounded-xl shadow-xs border border-slate-200">
                <QrCode className="w-14 h-14 text-slate-900" />
              </div>
            </div>
          </div>

          {/* Right: Specifications & Metadata */}
          <div className="md:col-span-8 space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                <span className="text-slate-400 font-medium">Building Block</span>
                <div className="font-bold text-slate-900 dark:text-white mt-0.5">{asset.building}</div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                <span className="text-slate-400 font-medium">Room Number / Lab</span>
                <div className="font-bold text-slate-900 dark:text-white mt-0.5">{asset.roomNumber}</div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                <span className="text-slate-400 font-medium">Purchase Cost</span>
                <div className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  ₹{asset.purchaseCost?.toLocaleString()}
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                <span className="text-slate-400 font-medium">Vendor</span>
                <div className="font-bold text-slate-900 dark:text-white mt-0.5">{asset.vendor}</div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                <span className="text-slate-400 font-medium">Warranty Expiry</span>
                <div className="font-bold text-slate-900 dark:text-white mt-0.5">{asset.warrantyExpiry}</div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                <span className="text-slate-400 font-medium">Assigned Custodian</span>
                <div className="font-bold text-slate-900 dark:text-white mt-0.5">{asset.assignedTo}</div>
              </div>
            </div>

            {asset.specifications && (
              <div className="p-3 bg-blue-50/60 dark:bg-blue-950/30 rounded-xl border border-blue-100 dark:border-blue-900/40">
                <span className="text-blue-700 dark:text-blue-300 font-semibold block mb-0.5">
                  Technical Specifications
                </span>
                <p className="text-slate-600 dark:text-slate-300">{asset.specifications}</p>
              </div>
            )}

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              {!isMonitor && (
                <button
                  onClick={() => {
                    onClose();
                    onRaiseMaintenance(asset.id);
                  }}
                  className="flex-1 py-2.5 px-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <Wrench className="w-4 h-4" /> Raise Maintenance
                </button>
              )}

              <button
                onClick={() => {
                  onClose();
                  onReallocate(asset.id);
                }}
                className="flex-1 py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <ArrowLeftRight className="w-4 h-4" /> Transfer Location
              </button>

              <button
                onClick={() => {
                  deleteAsset(asset.id);
                  onClose();
                }}
                className="p-2.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 rounded-xl"
                title="Delete Asset"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* History Events Section */}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Asset Lifecycle History ({events.length})
          </h4>
          <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
            {events.length === 0 ? (
              <div className="text-xs text-slate-400">No logged history events yet.</div>
            ) : (
              events.map((e) => (
                <div key={e.id} className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-xs flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">{e.title}</span> —{' '}
                    <span className="text-slate-500">{e.description}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0 ml-2">{e.date}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
