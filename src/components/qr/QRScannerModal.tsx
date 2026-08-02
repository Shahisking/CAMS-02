import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  QrCode,
  X,
  Camera,
  Search,
  Building,
  MapPin,
  Wrench,
  CheckCircle2,
  Printer,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Asset } from '../../types';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAssetDetails: (assetId: string) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onSelectAssetDetails,
}) => {
  const { assets } = useApp();

  const [scannedIdInput, setScannedIdInput] = useState('');
  const [scannedAsset, setScannedAsset] = useState<Asset | null>(null);
  const [isScanningActive, setIsScanningActive] = useState(true);
  const [scanErrorMsg, setScanErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSimulateScan = (assetId: string) => {
    setScanErrorMsg('');
    const found = assets.find((a) => a.id.toLowerCase() === assetId.toLowerCase());
    if (found) {
      setScannedAsset(found);
      setIsScanningActive(false);
    } else {
      setScanErrorMsg(`Asset with ID "${assetId}" not found in system.`);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannedIdInput) return;
    handleSimulateScan(scannedIdInput);
  };

  const handleResetScan = () => {
    setScannedAsset(null);
    setIsScanningActive(true);
    setScannedIdInput('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl relative my-8"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">QR Code Scanner & Inspector</h2>
            <p className="text-xs text-slate-500">Scan or select asset tag for instant audit records</p>
          </div>
        </div>

        {isScanningActive && !scannedAsset ? (
          <div className="space-y-6">
            {scanErrorMsg && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 text-xs rounded-xl flex items-center gap-2">
                <X className="w-4 h-4 shrink-0" />
                <span>{scanErrorMsg}</span>
              </div>
            )}

            {/* Camera Viewfinder Box */}
            <div className="relative w-full h-64 bg-slate-950 rounded-2xl overflow-hidden border-2 border-dashed border-blue-500/50 flex flex-col items-center justify-center text-center p-6 shadow-inner">
              {/* Laser Scanning Animation Line */}
              <motion.div
                animate={{ y: [-80, 80, -80] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-x-8 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-lg shadow-blue-500/50"
              />

              <Camera className="w-10 h-10 text-blue-400 mb-3 animate-bounce" />
              <div className="text-sm font-bold text-white mb-1">Align Asset QR Tag in Viewfinder</div>
              <p className="text-xs text-slate-400 max-w-xs">
                Real-time camera scanner active. Point smartphone or webcam at the CAMS barcode label.
              </p>

              <span className="mt-4 px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-full text-[10px] font-mono">
                CAMERA READY (STANDBY)
              </span>
            </div>

            {/* Simulated Quick Scan Presets */}
            <div>
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Simulate Direct QR Scan (Click to test):
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {assets.slice(0, 6).map((asset) => (
                  <button
                    key={asset.id}
                    onClick={() => handleSimulateScan(asset.id)}
                    className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/40 hover:border-blue-400 border border-slate-200 dark:border-slate-700 rounded-xl text-left transition-all"
                  >
                    <div className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400">
                      {asset.id}
                    </div>
                    <div className="text-[11px] font-medium text-slate-800 dark:text-slate-200 truncate">
                      {asset.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Manual Tag ID Lookup */}
            <form onSubmit={handleManualSubmit} className="pt-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Or Type Asset Tag ID
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={scannedIdInput}
                  onChange={(e) => setScannedIdInput(e.target.value)}
                  placeholder="e.g. AIT-CSE-001"
                  className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs rounded-xl px-3 py-2.5 outline-none font-mono"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs"
                >
                  Lookup
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Instant Scanned Asset Result View */
          scannedAsset && (
            <div className="space-y-6">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">QR Tag Verification Success</div>
                    <div className="text-xs text-emerald-600 dark:text-emerald-400 font-mono">
                      {scannedAsset.id} • Matched in Database
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleResetScan}
                  className="text-xs text-slate-500 underline font-semibold"
                >
                  Scan Another
                </button>
              </div>

              <div className="p-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {scannedAsset.name}
                  </h3>
                  <div className="text-slate-500">{scannedAsset.category}</div>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded">
                    {scannedAsset.department}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <span className="text-slate-400 block">Current Location:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {scannedAsset.building} ({scannedAsset.roomNumber})
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Assigned Custodian:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {scannedAsset.assignedTo}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Condition:</span>
                    <span className="font-bold text-emerald-600">{scannedAsset.condition}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Current Status:</span>
                    <span className="font-bold text-blue-600">{scannedAsset.status}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    onClose();
                    onSelectAssetDetails(scannedAsset.id);
                  }}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-2"
                >
                  View Full Asset History & Specs <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )
        )}
      </motion.div>
    </div>
  );
};
